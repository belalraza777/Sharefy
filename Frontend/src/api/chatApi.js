import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // send cookies for auth
    headers: {
        "Content-Type": "application/json",
    },
});

// Get all users that the logged-in user has chatted with
export const getConversations = async () => {
  try {
    const response = await axiosInstance.get('/chat/users');
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

// Get messages with a specific user
export const getMessages = async (userId) => {
  try {
    const response = await axiosInstance.get(`/chat/get/${userId}`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error fetching messages with user ${userId}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

// Send a message to a specific user
export const sendMessage = async (userId, message) => {
  try {
    const response = await axiosInstance.post(`/chat/send/${userId}`, { message });
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};
