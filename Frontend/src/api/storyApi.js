import axios from "axios";

// Base API URL (keep consistent with other API modules)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// Axios instance for story endpoints
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token from localStorage if available (simple auth layer)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create a story (image or video)
// Create a new story (image or video upload + optional caption)
export const createStory = async (file, caption = "") => {
  try {
    if (!file) {
      return { success: false, message: "File is required", error: "File is required" };
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);

    const response = await axiosInstance.post("/stories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error creating story:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

// Get all stories (followed users + own)
// Fetch all stories (followed users + own)
export const getAllStories = async () => {
  try {
    const response = await axiosInstance.get("/stories");
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error fetching stories:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

// Get stories for a specific user
// Fetch stories for a single user
export const getUserStories = async (userId) => {
  try {
    const response = await axiosInstance.get(`/stories/user/${userId}`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error fetching user stories for ${userId}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

// Mark a story as viewed
// Mark a story as viewed (idempotent)
export const viewStory = async (storyId) => {
  try {
    const response = await axiosInstance.post(`/stories/${storyId}/view`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error viewing story ${storyId}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

// Delete a story
// Delete a story (owner only)
export const deleteStory = async (storyId) => {
  try {
    const response = await axiosInstance.delete(`/stories/${storyId}`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error deleting story ${storyId}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};
