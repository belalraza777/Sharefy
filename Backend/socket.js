// Backend/socket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;
let onlineUsers = {};

const addUser = (userId, socketId) => {
  onlineUsers[userId] = socketId;
  console.log("Online users:", onlineUsers);
};

const removeUser = (socketId) => {
  Object.keys(onlineUsers).forEach(userId => {
    if (onlineUsers[userId] === socketId) {
      delete onlineUsers[userId];
    }
  });
  console.log("Online users:", onlineUsers);
};

const getReceiverSocketId = (userId) => {
  return onlineUsers[userId];
}

export function initSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
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

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} with socket ID: ${socket.id}`);

    addUser(socket.user.id, socket.id);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
      removeUser(socket.id);
    });
  });

  return io;
}

// Export io and onlineUsers for use in other parts of the application
export { io, onlineUsers, getReceiverSocketId };
