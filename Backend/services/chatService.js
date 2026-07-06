import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { io, getReceiverSocketId } from "../socket.js";

/**
 * Service: Send a message
 * Creates a message, ensures a conversation exists,
 * saves both, and emits real-time update via socket.io.
 */
const sendMessageService = async (senderId, receiverId, message) => {
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

    return newMessage;
};

/**
 * Service: Get messages between logged-in user and another user
 * Finds conversation and populates all messages.
 * Returns null if no conversation exists.
 */
const getMessagesService = async (senderId, chatUserId) => {
    // Find the conversation between two users
    const conversation = await Conversation.findOne({
        members: { $all: [senderId, chatUserId] },
    }).populate("messages"); // populate actual message objects

    if (!conversation) return null;

    return conversation.messages;
};

/**
 * Service: Get all conversations for the logged-in user
 * Returns only users that the logged-in user has chatted with
 */
const getChatUsersService = async (loggedInUserId) => {
    // Find all conversations where user is a member
    const conversations = await Conversation.find({
        members: loggedInUserId,
    }).populate("members", "-password"); // Populate user info, exclude password

    // Extract the other user from each conversation
    const chatUsers = conversations
        .map((conv) => {
            return conv.members.find(
                (member) => member._id.toString() !== loggedInUserId.toString()
            );
        })
        .filter(Boolean); // Remove any null/undefined

    return chatUsers;
};

export default {
    sendMessageService,
    getMessagesService,
    getChatUsersService,
};