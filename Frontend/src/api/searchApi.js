import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // send cookies for auth
    headers: {
        "Content-Type": "application/json",
    },
});

export const searchUsers = async (query) => {
    try {
        const response = await axiosInstance.get(`/search?query=${query}`);
        return { success: true, message: response.data.message, data: response.data.data };
    } catch (error) {
        console.error(`Error searching for users with query ${query}:`, error);
        return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
    }
};
