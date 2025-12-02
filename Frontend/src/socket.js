// Socket.IO client for real-time notifications and chat
import { io } from "socket.io-client";
import useNotificationStore from "./store/notificationStore";
import useChatStore from "./store/chatStore";


// Single shared socket instance
let socket;

// Connect to server with JWT token
export const connectSocket = (token) => {
  // Clean up old connection if exists
  if (socket) {
    socket.disconnect();
  }
  // Resolve server URL: prefer VITE_SOCKET_URL, fall back to VITE_API_URL without the /api path
  const SERVER_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/,'') : 'http://localhost:8000');
  // Prefer provided token, otherwise read from localStorage
  const authToken = token || localStorage.getItem('token');
  // Connect with authentication
  socket = io(SERVER_URL, {
    auth: { token: authToken },
  });

  // Request notification permission once
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  socket.on("connect", () => {
    console.log("Socket.IO connected successfully!");
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO disconnected.");
  });

  // Listen for new notifications
  socket.on("new_notification", (notification) => {
    console.log("New notification received:", notification);

    // Add to store using getState()
    useNotificationStore.getState().addNotification(notification);

    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.message, { icon: "/favicon.ico" });
    }
  });

  // // Listen for chat messages (components will handle via getSocket())
  // socket.on('newMessage', (msg) => {
  //   console.log('Received newMessage', msg);
  // });

  // Listen for online users update
  socket.on('onlineUsers', (userIds) => {
    console.log("onlineUser",userIds);
    useChatStore.getState().setOnlineUsers(userIds);
  });

  return socket;
};

// Disconnect and clean up
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Get current socket instance for components
export const getSocket = () => {
  return socket;
};

// Send custom events to server
export const emitMessage = (event, payload) => {
  if (!socket) return;
  socket.emit(event, payload);
};
