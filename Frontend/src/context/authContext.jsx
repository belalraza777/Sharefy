import { createContext, useContext, useState, useEffect } from "react";
import { register, login, logout, checkAuth, resetPassword, requestOtp, verifyOtp } from "../api/authApi";
import { connectSocket, disconnectSocket } from "../socket"; // Import socket functions

// Create context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Load user and token from localStorage if available
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [loading, setLoading] = useState(true);

    // Function to save user and token
    const saveAuthData = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", authToken);
    };

    // Function to clear user and token
    const clearAuthData = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        disconnectSocket(); // Disconnect socket on logout
    };

    // Check if user is authenticated on first load
    useEffect(() => {
        const checkUser = async () => {
            const result = await checkAuth();
            if (result.success) {
                saveAuthData(result.data, result.data.token);
            } else {
                clearAuthData();
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    // Effect to manage socket connection based on token
    useEffect(() => {
        if (token) {
            connectSocket(token);
        }
        // Cleanup on unmount or when token becomes null
        return () => {
            disconnectSocket();
        }
    }, [token]);

    // Handle login with email/password
    const handleLogin = async (credentials) => {
        const result = await login(credentials);
        if (result.success) {
            saveAuthData(result.data, result.data.token);
        }
        return result;
    };

    // Handle register new user
    const handleRegister = async (credentials) => {
        const result = await register(credentials);
        if (result.success) {
            saveAuthData(result.data, result.data.token);
        }
        return result;
    };

    // Handle logout
    const handleLogout = async () => {
        const result = await logout();
        clearAuthData();
        return result;
    };

    // Request OTP (for email login)
    const handleRequestOtp = async (email) => {
        return await requestOtp(email);
    };

    // Verify OTP and login user
    const handleVerifyOtp = async (otpData) => {
        const result = await verifyOtp(otpData);
        if (result.success) {
            saveAuthData(result.data, result.data.token);
        }
        return result;
    };

    // Reset password
    const handleResetPassword = async (passwordData) => {
        return await resetPassword(passwordData);
    };

    return (
        // Provide all auth-related values and functions to app
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            handleLogin,
            handleRegister,
            handleLogout,
            handleRequestOtp,
            handleVerifyOtp,
            handleResetPassword
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook for consuming auth context
export const useAuth = () => useContext(AuthContext);
