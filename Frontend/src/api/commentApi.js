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

export const addComment = async (postId, commentData) => {
  try {
    const response = await axiosInstance.post(`/comments/${postId}`, commentData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error adding comment to post with ID ${postId}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    const response = await axiosInstance.delete(`/comments/${postId}/${commentId}`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error deleting comment with ID ${commentId}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};
