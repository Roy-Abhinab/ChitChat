import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './config/mongodb.js';
import userRouter from './routes/userRoute.js';
import chatRouter from './routes/chatRoute.js';
import { Server } from 'socket.io';


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 7000;

export const io = new Server(server, {
   cors: {
      origin: '*'
   }
});

export const userSocketMap = {};

io.on('connection', (socket) => {
   const userId = socket.handshake.query.userId;
   console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);

   if (userId) {
      userSocketMap[userId] = socket.id;
   }

   io.emit("getOnlineUsers", Object.keys(userSocketMap));

   socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
   });
});

app.use(cors());
app.use(express.json({ limit: '4mb' }));

app.get('/', (req, res) => res.send('Server is running'));

app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);


await connectDB();

server.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});