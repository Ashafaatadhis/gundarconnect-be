const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware & routes setup
// ...existing code...

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Listen for user identification
  socket.on('identify', (userId) => {
    socket.join(`user_${userId}`);
  });
});

// Export io for use in routes
module.exports = { app, server, io };
