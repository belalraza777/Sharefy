import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

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

export const getFeed = async (page = 1) => {
  try {
    const response = await axiosInstance.get(`/posts/feed?page=${page}`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error fetching feed:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const createPost = async (postData) => {
  try {
    const response = await axiosInstance.post('/posts', postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const getPostById = async (id) => {
  try {
    const response = await axiosInstance.get(`/posts/${id}`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error fetching post with ID ${id}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const likePost = async (id) => {
  try {
    const response = await axiosInstance.post(`/posts/${id}/like`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error liking post with ID ${id}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const unlikePost = async (id) => {
  try {
    const response = await axiosInstance.post(`/posts/${id}/unlike`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error unliking post with ID ${id}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const deletePost = async (id) => {
  try {
    const response = await axiosInstance.delete(`/posts/${id}`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error deleting post with ID ${id}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};
