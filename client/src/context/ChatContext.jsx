import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
   const [messages, setMessages] = useState([]);
   const [users, setUsers] = useState([]);
   const [selectedUser, setSelectedUser] = useState(null);
   const [unseenMessages, setUnseenMessages] = useState({});

   const { socket, axios, authUser } = useContext(AuthContext);


   const getUsers = async () => {
      try {
         const { data } = await axios.get("/api/chat/users");
         if (data.success) {
            setUsers(data.users);
            setUnseenMessages(data.unseenMessages);
         }
      } catch (error) {
         toast.error(error.message);
      }
   }


   const getMessages = async (userId) => {
      try {
         const { data } = await axios.get(`/api/chat/${userId}`);
         if (data.success) {
            setMessages(data.messages);
         }
      } catch (error) {
         toast.error(error.message);
      }
   }


   const sendMessage = async (messageData) => {
      try {
         const { data } = await axios.post(`/api/chat/send/${selectedUser._id}`, messageData);
         if (data.success) {
            setMessages((prevMessages) => [...prevMessages, data.newMessage]);
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         toast.error(error.message);
      }
   }


   const subscribeToMessages = async () => {
      if (!socket) return;

      socket.on("newMessage", (newMessage) => {
         if (selectedUser && newMessage.senderId === selectedUser._id) {
            newMessage.seen = true;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            axios.put(`/api/chat/mark/${newMessage._id}`);
         } else {
            setUnseenMessages((prevUnseenMessages) => ({ ...prevUnseenMessages, [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1 }))
         }
      })
   }

   const unsubscribeFromMessages = () => {
      if (socket) socket.off("newMessage");
   }

   useEffect(() => {
      if (!authUser) {
         setSelectedUser(null); 
         setMessages([]); 
         setUsers([]); 
         setUnseenMessages({}); 
      }
   }, [authUser]);

   useEffect(() => {
      subscribeToMessages();
      return () => unsubscribeFromMessages();
   }, [socket, selectedUser]);

   const value = {
      messages, setMessages,
      sendMessage, getMessages,
      users, getUsers,
      selectedUser, setSelectedUser,
      unseenMessages, setUnseenMessages
   }

   return (
      <ChatContext.Provider value={value}>
         {children}
      </ChatContext.Provider>
   )
}