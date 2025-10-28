// Socket.IO client for real-time notifications and chat
import { io } from "socket.io-client";
import useNotificationStore from "./store/notificationStore";

// Single shared socket instance
let socket;

// Connect to server with JWT token
export const connectSocket = (token) => {
  // Clean up old connection if exists
  if (socket) {
    socket.disconnect();
  }

  // Connect with authentication
  socket = io("http://localhost:8000", {
    auth: { token },
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

  // Listen for chat messages (components will handle via getSocket())
  socket.on('newMessage', (msg) => {
    console.log('Received newMessage', msg);
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
