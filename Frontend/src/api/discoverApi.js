import axios from "axios";

const API_BASE_URL = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) || (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) || "http://localhost:8000/api/v1";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
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

export const getSuggestedUsers = async (limit = 20) => {
  try {
    const response = await axiosInstance.get(`/discover/users?limit=${limit}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Error fetching suggested users', error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const getSuggestedPosts = async ( page = 1) => {
  try {
    const response = await axiosInstance.get(`/discover/posts?page=${page}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Error fetching discover posts', error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export default {
  getSuggestedUsers,
  getSuggestedPosts,
};
