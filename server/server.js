import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './config/mongodb.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.json({ limit: '4mb' }));

app.use('/', (req, res) => res.send('Server is running'));

await connectDB();

server.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});