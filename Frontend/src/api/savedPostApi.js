import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1/saved-posts/";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // send cookies for auth
    headers: {
        "Content-Type": "application/json",
    },
});

export const savePost = async (postId) => {
  try {
    const response = await axiosInstance.post(`/${postId}/save`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error saving post with ID ${postId}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const unSavePost = async (postId) => {
  try {
    const response = await axiosInstance.delete(`/${postId}/save`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error Unsaving post with ID ${postId}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const getSavedPosts = async () => {
  try {
    const response = await axiosInstance.get("/");
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};
