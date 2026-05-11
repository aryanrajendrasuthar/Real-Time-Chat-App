export interface User {
  _id: string;
  username: string;
  email: string;
  avatarUrl: string;
  status: 'online' | 'offline' | 'away';
  createdAt: string;
}

export interface Room {
  _id: string;
  name?: string;
  type: 'dm' | 'group';
  members: User[];
  lastMessage?: Message;
  lastMessageAt: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  roomId: string;
  senderId: User;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  readBy: string[];
  createdAt: string;
}

export interface TypingUser {
  userId: string;
  username: string;
  roomId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
