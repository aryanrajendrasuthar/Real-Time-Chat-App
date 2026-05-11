require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const { getRedis } = require('./config/redis');
const setupSocketHandlers = require('./socket/socketHandler');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Socket.io
setupSocketHandlers(io);

// Start
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Connect Redis (non-fatal if unavailable)
  try {
    await getRedis().connect();
  } catch {
    console.warn('Redis unavailable, continuing without cache');
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
