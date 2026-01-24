import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { io, onlineUsers, getReceiverSocketId } from "../socket.js";

/**
 * Controller: Send a message
 * Creates a message, ensures a conversation exists, 
 * saves both, and emits real-time update via socket.io.
 */
export const sendMessage = async (req, res) => {

    const { message } = req.body;       // Message text from request body
    const { id: receiverId } = req.params; // Receiver user ID from route param
    const senderId = req.user.id;      // Logged-in user (from verifyAuth middleware)

    // 1. Find or create conversation between sender & receiver
    let conversation = await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
        conversation = await Conversation.create({
            members: [senderId, receiverId],
        });
    }

    // 2. Create a new message
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();

    // 3. Add message to conversation
    conversation.messages.push(newMessage._id);
    await conversation.save();

    // 4. Emit new message event if receiver is online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // 5. Send success response
    res.status(201).json({ success: true, message: "Message sent Successfully", data: newMessage });

};

/**
 * Controller: Get messages between logged-in user and another user
 * Finds conversation and populates all messages.
 */
export const getMessages = async (req, res) => {

    const { id: chatUser } = req.params; // The other user's ID
    const senderId = req.user.id;     // Logged-in user

    // Find the conversation between two users
    const conversation = await Conversation.findOne({
        members: { $all: [senderId, chatUser] },
    }).populate("messages"); // populate actual message objects

    if (!conversation) return res.status(200).json({ success: false, message: "No Converstion History", data: [] });

    return res.status(200).json({ success: true, message: "Conversation Found", data: conversation.messages });


};


/**
 * Controller: Get all conversations for the logged-in user
 * Returns only users that the logged-in user has chatted with
 */
export const getUsers = async (req, res) => {
    const loggedInUser = req.user.id;

        // Find all conversations where user is a member
        const conversations = await Conversation.find({
            members: loggedInUser
        }).populate('members', '-password'); // Populate user info, exclude password

        // Extract the other user from each conversation
        const chatUsers = conversations.map(conv => {
            return conv.members.find(member => 
                member._id.toString() !== loggedInUser.toString()
            );
        }).filter(Boolean); // Remove any null/undefined

        res.status(200).json({ 
            success: true, 
            message: "Conversations fetched successfully", 
            data: chatUsers 
        });
    
};

