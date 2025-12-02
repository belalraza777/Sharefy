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


export const getUserProfile = async (username) => {
  try {
    const response = await axiosInstance.get(`/users/${username}`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error fetching user profile for ${username}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};


export const updateProfile = async (userData) => {
  try {
    const response = await axiosInstance.patch('/users', userData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};


export const uploadProfilePic = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};


export const followUser = async (id) => {
  try {
    const response = await axiosInstance.post(`/users/${id}/follow`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error following user with ID ${id}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};


export const unfollowUser = async (id) => {
  try {
    const response = await axiosInstance.post(`/users/${id}/unfollow`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error unfollowing user with ID ${id}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};


export const getFollowers = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}/followers`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error getting followers for user with ID ${id}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};


export const getFollowing = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}/following`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error getting following for user with ID ${id}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};
