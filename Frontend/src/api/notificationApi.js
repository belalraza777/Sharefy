import axios from "axios";

const API_BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) || "http://localhost:8000/api/v1";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // send cookies for auth
    headers: {
        "Content-Type": "application/json",
    },
});
// Add request interceptor to include token from localStorage
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getNotifications = async () => {
    try {
        const response = await axiosInstance.get('/notifications');
        return { success: true, message: response.data.message, data: response.data.data };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
    }
}

// Mark all notifications as read
export const markAllAsRead = async () => {
    try {
        const response = await axiosInstance.patch('/notifications/read-all');
        return { success: true, data: response.data.data };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

export const markAsRead = async (id) => {
    try {
        const response = await axiosInstance.patch(`/notifications/${id}/read`);
        return { success: true, message: response.data.message, data: response.data.data };
    } catch (error) {
        console.error(`Error marking notification as read with ID ${id}:`, error);
        return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
    }
}
