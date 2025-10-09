import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // send cookies for auth
    headers: {
        "Content-Type": "application/json",
    },
});


export const register = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error registering:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const login = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/login', userData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error logging in:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const logout = async () => {
  try {
    await axiosInstance.get('/auth/logout');
    // localStorage.removeItem('user'); // Or however the token is stored
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const checkAuth = async () => {
  try {
    const response = await axiosInstance.get('/auth/check');
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error checking auth status:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const resetPassword = async (passwordData) => {
  try {
    const response = await axiosInstance.patch('/auth/reset', passwordData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};


export const requestOtp = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/request-otp', { email });
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};

export const verifyOtp = async (otpData) => {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', otpData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, message: error.response?.data?.message || error.message, error: error.response?.data?.error || error.message };
  }
};