// server.js - Main server startup file
import http from 'http';
import app from './app.js';
import { initSocketServer } from './socket.js';

const PORT = process.env.PORT || 8000;

const httpServer = http.createServer(app);

// Initialize and attach the Socket.IO server
initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server with Socket.IO is running on port ${PORT}`);
});
