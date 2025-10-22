// src/socket.js
import { io } from "socket.io-client";

let socket;

export const connectSocket = (token) => {
  // Disconnect existing socket before creating a new one
  if (socket) {
    socket.disconnect();
  }

  // Create a new socket connection with the provided token
  socket = io("http://localhost:8000", {
    auth: {
      token,
    },
  });

  socket.on("connect", () => {
    console.log("Socket.IO connected successfully!");
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO disconnected.");
  });

  // Add a listener for new notifications
  socket.on("new_notification", (notification) => {
    console.log("A new notification was received:", notification);
    alert(notification.message)
    // In the future, we can trigger a UI update from here
  });

  // Forward incoming chat messages to any listeners
  socket.on('newMessage', (msg) => {
    console.log('Received newMessage', msg);
    // Not doing UI logic here — components will register handlers via getSocket()
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

export const emitMessage = (event, payload) => {
  if (!socket) return;
  socket.emit(event, payload);
};
