const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');
const { getRedis } = require('../config/redis');

const PRESENCE_TTL = 30; // seconds
const HEARTBEAT_INTERVAL = 20000;

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));

    socket.user = user;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
};

const setupSocketHandlers = (io) => {
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    const redis = getRedis();

    // Mark online in Redis and DB
    try {
      await redis.setex(`presence:${userId}`, PRESENCE_TTL, 'online');
      await User.findByIdAndUpdate(userId, { status: 'online' });
    } catch {}

    // Auto-join all user's rooms
    try {
      const rooms = await Room.find({ members: userId }).select('_id');
      rooms.forEach((r) => socket.join(r._id.toString()));
    } catch {}

    // Broadcast online status to room-mates
    io.emit('user:online', { userId });

    // Heartbeat to keep Redis presence alive
    const heartbeat = setInterval(async () => {
      try {
        await redis.setex(`presence:${userId}`, PRESENCE_TTL, 'online');
      } catch {}
    }, HEARTBEAT_INTERVAL);

    // ─── message:send ────────────────────────────────────────────────────────
    socket.on('message:send', async ({ roomId, content, type = 'text', fileUrl = '', fileName = '' }) => {
      try {
        const room = await Room.findOne({ _id: roomId, members: userId });
        if (!room) return;

        const message = await Message.create({
          roomId,
          senderId: userId,
          content,
          type,
          fileUrl,
          fileName,
          readBy: [userId],
        });

        await message.populate('senderId', 'username avatarUrl');

        // Update room's lastMessage
        await Room.findByIdAndUpdate(roomId, {
          lastMessage: message._id,
          lastMessageAt: new Date(),
        });

        // Cache in Redis (keep last 50)
        try {
          const key = `room:messages:${roomId}`;
          await redis.lpush(key, JSON.stringify(message));
          await redis.ltrim(key, 0, 49);
        } catch {}

        io.to(roomId).emit('message:receive', { message });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── typing:start ────────────────────────────────────────────────────────
    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:start', {
        roomId,
        userId,
        username: socket.user.username,
      });
    });

    // ─── typing:stop ─────────────────────────────────────────────────────────
    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:stop', { roomId, userId });
    });

    // ─── room:join ───────────────────────────────────────────────────────────
    socket.on('room:join', ({ roomId }) => {
      socket.join(roomId);
    });

    // ─── read:confirm ────────────────────────────────────────────────────────
    socket.on('read:confirm', async ({ roomId, messageId }) => {
      try {
        await Message.updateMany(
          { roomId, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );

        socket.to(roomId).emit('read:confirm', { roomId, userId, messageId });
      } catch {}
    });

    // ─── disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      clearInterval(heartbeat);
      try {
        await redis.del(`presence:${userId}`);
        await User.findByIdAndUpdate(userId, { status: 'offline' });
      } catch {}
      io.emit('user:offline', { userId });
    });
  });
};

module.exports = setupSocketHandlers;
