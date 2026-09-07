import axiosInstance from './client';

export const getSuggestedUsers = async () => {
  try {
    const response = await axiosInstance.get(`/discover/users`);
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
