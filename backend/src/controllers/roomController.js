const Room = require('../models/Room');
const Message = require('../models/Message');
const User = require('../models/User');

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.user._id })
      .populate('members', 'username avatarUrl status')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createRoom = async (req, res) => {
  const { name, memberIds } = req.body;

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return res.status(400).json({ message: 'At least one member required' });
  }

  try {
    const allMembers = [...new Set([req.user._id.toString(), ...memberIds])];

    if (allMembers.length === 2) {
      const existing = await Room.findOne({
        type: 'dm',
        members: { $all: allMembers, $size: 2 },
      }).populate('members', 'username avatarUrl status');

      if (existing) {
        return res.json({ room: existing });
      }
    }

    const type = allMembers.length === 2 ? 'dm' : 'group';

    const room = await Room.create({
      name: type === 'group' ? name || 'New Group' : undefined,
      type,
      members: allMembers,
      createdBy: req.user._id,
    });

    const populated = await Room.findById(room._id).populate(
      'members',
      'username avatarUrl status'
    );

    res.status(201).json({ room: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({
      _id: req.params.id,
      members: req.user._id,
    }).populate('members', 'username avatarUrl status');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMessages = async (req, res) => {
  const { page = 1, limit = 40 } = req.query;

  try {
    const room = await Room.findOne({
      _id: req.params.id,
      members: req.user._id,
    });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const messages = await Message.find({ roomId: req.params.id })
      .populate('senderId', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getRooms, createRoom, getRoom, getMessages };
