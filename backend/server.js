require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to database and then start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
    
    // Load routes after database connection
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/workitems', require('./routes/workitems'));
    app.use("/api/comments", require("./routes/commentRoutes"));
    app.use('/api/salaries', require('./routes/salaries'));
    app.use('/api/attendance', require('./routes/attendanceRoutes'));
    app.use("/api/employees", require('./routes/employeeRoutes'));
    app.use('/api/punch', require('./routes/punchRoutes'));
    app.use('/api/notes', require('./routes/notes'));
    app.use('/api/posts', require('./routes/postRoutes'));
    app.use('/api/chat', require('./routes/chat'));
    app.use('/api/email', require('./routes/emailRoutes'));

    console.log('All routes loaded successfully');

    // Socket.IO for real-time chat
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Join conversation room
      socket.on('join-conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.id} joined conversation ${conversationId}`);
      });

      // Leave conversation room
      socket.on('leave-conversation', (conversationId) => {
        socket.leave(conversationId);
        console.log(`User ${socket.id} left conversation ${conversationId}`);
      });

      socket.on('call-offer', (data) => {
        console.log(`Call offer from ${socket.id} to room ${data.conversationId}`);
        socket.to(data.conversationId).emit('call-offer', data);
      });

      socket.on('call-answer', (data) => {
        console.log(`Call answer from ${socket.id} for room ${data.conversationId}`);
        socket.to(data.conversationId).emit('call-answer', data);
      });

      socket.on('call-decline', (data) => {
        console.log(`Call decline from ${socket.id} for room ${data.conversationId}`);
        socket.to(data.conversationId).emit('call-decline', data);
      });

      socket.on('call-end', (data) => {
        console.log(`Call end from ${socket.id} for room ${data.conversationId}`);
        socket.to(data.conversationId).emit('call-end', data);
      });

      socket.on('ice-candidate', (data) => {
        socket.to(data.conversationId).emit('ice-candidate', data);
      });

      // New message
      socket.on('new-message', (data) => {
        io.to(data.conversationId).emit('message-received', data.message);
      });

      // User typing
      socket.on('typing', (data) => {
        socket.to(data.conversationId).emit('user-typing', {
          userId: data.userId,
          userName: data.userName
        });
      });

      // User stopped typing
      socket.on('stop-typing', (data) => {
        socket.to(data.conversationId).emit('user-stopped-typing', {
          userId: data.userId
        });
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    // Make io accessible to routes
    app.set('io', io);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
