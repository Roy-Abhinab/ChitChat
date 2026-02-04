import cloudinary from "../config/cloudinary.js";
import chatModel from "../models/chatModel.js";
import userModel from "../models/userModel.js";
import { io, userSocketMap } from "../server.js";


export const getUsersForSidebar = async (req, res) => {
   try {
      const userId = req.user._id;

      const filteredUsers = await userModel.find({ _id: { $ne: userId } }).select("-password");

      const unseenMessages = {}

      const promises = filteredUsers.map(async (user) => {
         const messages = await chatModel.find({ senderId: user._id, receiverId: userId, seen: false })
         if (messages.length > 0) {
            unseenMessages[user._id] = messages.length;
         }
      })

      await Promise.all(promises);

      res.json({ success: true, users: filteredUsers, unseenMessages })
   } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message })
   }
}


export const getMessages = async (req, res) => {
   try {
      const { id: selectedUserId } = req.params;

      const myId = req.user._id;

      const messages = await chatModel.find({
         $or: [
            { senderId: myId, receiverId: selectedUserId },
            { senderId: selectedUserId, receiverId: myId }
         ]
      })

      await chatModel.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true });

      res.json({ success: true, messages })
   } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message })
   }
}


export const markMessageAsSeen = async (req, res) => {
   try {
      const { id } = req.params;

      await chatModel.findByIdAndUpdate(id, { seen: true })

      res.json({ success: true })
   } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message })
   }
}


export const sendMessage = async (req, res) => {
   try {
      const senderId = req.user._id;
      const receiverId = req.params.id;
      const { text, image } = req.body;

      let imageUrl;

      if (image) {
         const upload = await cloudinary.uploader.upload(image);
         imageUrl = upload.secure_url;
      }

      const newMessage = await chatModel.create({
         senderId,
         receiverId,
         text,
         image: imageUrl
      });

      const receiverSocketId = userSocketMap[receiverId];

      if (receiverSocketId) {
         io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      res.json({ success: true, newMessage })

   } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message })
   }
}