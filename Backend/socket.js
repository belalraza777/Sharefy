// Backend/socket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;
let onlineUsers = {};

// Helper functions to manage online users
// Add user to online users list
const addUser = (userId, socketId) => {
  onlineUsers[userId] = socketId;
  console.log("Online users:", getOnlineUsers());
};

// Remove user from online users list
const removeUser = (socketId) => {
  Object.keys(onlineUsers).forEach(userId => {
    if (onlineUsers[userId] === socketId) {
      delete onlineUsers[userId];
    }
  });
  console.log("Online users:", getOnlineUsers());
};

// Get socket ID of a specific user
const getReceiverSocketId = (userId) => onlineUsers[userId] || null;

//Get Online Users
// Return a plain object userId -> true for presence broadcast
export const getOnlineUsers = () => {
  const map = {};
  Object.keys(onlineUsers).forEach(id => { map[id] = true; });
  return map;
}


// Initialize Socket.IO server
export function initSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true,
    }
  });

  // Middleware for Socket.IO authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token not provided."));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token."));
      }
      socket.user = user; // Attach user payload to the socket
      next();
    });
  });

  // Handle new connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} with socket ID: ${socket.id}`);

    addUser(socket.user.id, socket.id);
    io.emit('onlineUsers', getOnlineUsers()); // broadcast current presence

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
      removeUser(socket.id);
      io.emit('onlineUsers', getOnlineUsers()); // broadcast updated presence
    });
  });
  return io;
}

// Export io and onlineUsers for use in other parts of the application
export { io, onlineUsers, getReceiverSocketId, };
