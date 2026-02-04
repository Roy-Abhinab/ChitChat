import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref: "user", required: true},
    text: { type: String },
    image: { type: String },
    seen: { type: Boolean, default: false}
}, {timestamps: true});

const chatModel = mongoose.model("chat", chatSchema);

export default chatModel;