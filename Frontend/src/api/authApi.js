import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

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

// Helper to normalize errors coming from axios / backend
const formatAxiosError = (error) => {
  const resp = error.response?.data;
  const errors = resp?.errors || null;
  const message = resp?.message || (Array.isArray(errors) ? errors.join(', ') : error.message);
  return { message, error: resp?.error || error.message, errors };
};

export const register = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error registering:", error);
    const formatted = formatAxiosError(error);
    return { success: false, ...formatted };
  }
};

export const login = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/login', userData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error logging in:", error);
    const formatted = formatAxiosError(error);
    return { success: false, ...formatted };
  }
};

export const logout = async () => {
  try {
    await axiosInstance.get('/auth/logout');
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Error logging out:", error);
    const formatted = formatAxiosError(error);
    return { success: false, ...formatted };
  }
};

export const checkAuth = async () => {
  try {
    const response = await axiosInstance.get('/auth/check');
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error checking auth status:", error);
    const formatted = formatAxiosError(error);
    return { success: false, ...formatted };
  }
};

export const resetPassword = async (passwordData) => {
  try {
    const response = await axiosInstance.patch('/auth/reset', passwordData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error resetting password:", error);
    const formatted = formatAxiosError(error);
    return { success: false, ...formatted };
  }
};

export const requestOtp = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/request-otp', { email });
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error requesting OTP:", error);
    const formatted = formatAxiosError(error);
    return { success: false, ...formatted };
  }
};

export const verifyOtp = async (otpData) => {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', otpData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    const formatted = formatAxiosError(error);
    return { success: false, ...formatted };
  }
};