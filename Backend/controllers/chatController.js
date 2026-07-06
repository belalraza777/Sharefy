import chatService from "../services/chatService.js";

/**
 * Controller: Send a message
 */
export const sendMessage = async (req, res) => {
    const { message } = req.body;          // Message text from request body
    const { id: receiverId } = req.params; // Receiver user ID from route param
    const senderId = req.user.id;          // Logged-in user (from verifyAuth middleware)

    const newMessage = await chatService.sendMessageService(senderId, receiverId, message);

    // 5. Send success response
    res.status(201).json({ success: true, message: "Message sent Successfully", data: newMessage });
};

/**
 * Controller: Get messages between logged-in user and another user
 */
export const getMessages = async (req, res) => {
    const { id: chatUser } = req.params; // The other user's ID
    const senderId = req.user.id;        // Logged-in user

    const messages = await chatService.getMessagesService(senderId, chatUser);

    if (!messages) return res.status(200).json({ success: false, message: "No Converstion History", data: [] });

    return res.status(200).json({ success: true, message: "Conversation Found", data: messages });
};

/**
 * Controller: Get all conversations for the logged-in user
 */
export const getUsers = async (req, res) => {
    const loggedInUser = req.user.id;

    const chatUsers = await chatService.getChatUsersService(loggedInUser);

    res.status(200).json({
        success: true,
        message: "Conversations fetched successfully",
        data: chatUsers,
    });
};