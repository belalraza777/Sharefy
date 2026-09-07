import axiosInstance from './client';

export const savePost = async (postId) => {
  try {
    const response = await axiosInstance.post(`/saved-posts/${postId}/save`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error saving post with ID ${postId}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const unSavePost = async (postId) => {
  try {
    const response = await axiosInstance.delete(`/saved-posts/${postId}/save`);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error(`Error Unsaving post with ID ${postId}:`, error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const getSavedPosts = async () => {
  try {
    const response = await axiosInstance.get("/saved-posts/");
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};
