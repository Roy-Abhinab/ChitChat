import express from 'express';
import { authUser } from '../middleware/authUser.js';
import { getMessages, getUsersForSidebar, markMessageAsSeen, sendMessage } from '../controllers/chatControl.js';

const chatRouter = express.Router();

chatRouter.get('/users', authUser, getUsersForSidebar);

chatRouter.get('/:id', authUser, getMessages);

chatRouter.get('/mark/:id', authUser, markMessageAsSeen);

chatRouter.post('/send/:id', authUser, sendMessage);

export default chatRouter;
