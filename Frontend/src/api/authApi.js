import apiClient, { getApiError } from './client';


export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error registering:", error);
    const formatted = getApiError(error);
    return { success: false, ...formatted };
  }
};


export const login = async (userData) => {
  try {
    const response = await apiClient.post('/auth/login', userData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error logging in:", error);
    const formatted = getApiError(error);
    return { success: false, ...formatted };
  }
};

export const logout = async () => {
  try {
    await apiClient.get('/auth/logout');
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    console.error("Error logging out:", error);
    const formatted = getApiError(error);
    return { success: false, ...formatted };
  }
};

export const checkAuth = async () => {
  try {
    const response = await apiClient.get('/auth/check');
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error checking auth status:", error);
    const formatted = getApiError(error);
    return { success: false, ...formatted };
  }
};

export const resetPassword = async (passwordData) => {
  try {
    const response = await apiClient.patch('/auth/reset', passwordData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error resetting password:", error);
    const formatted = getApiError(error);
    return { success: false, ...formatted };
  }
};

export const requestOtp = async (email) => {
  try {
    const response = await apiClient.post('/auth/request-otp', { email });
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error requesting OTP:", error);
    const formatted = getApiError(error);
    return { success: false, ...formatted };
  }
};

export const verifyOtp = async (otpData) => {
  try {
    const response = await apiClient.post('/auth/verify-otp', otpData);
    return { success: true, message: response.data.message, data: response.data.data };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    const formatted = getApiError(error);
    return { success: false, ...formatted };
  }
};
