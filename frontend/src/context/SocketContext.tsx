import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { Message, TypingUser } from '../types';

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (roomId: string, content: string, type?: string, fileUrl?: string, fileName?: string) => void;
  sendTypingStart: (roomId: string) => void;
  sendTypingStop: (roomId: string) => void;
  confirmRead: (roomId: string, messageId: string) => void;
  onlineUsers: Set<string>;
  typingUsers: TypingUser[];
  newMessage: Message | null;
  readConfirm: { roomId: string; userId: string; messageId: string } | null;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  const [readConfirm, setReadConfirm] = useState<{ roomId: string; userId: string; messageId: string } | null>(null);

  useEffect(() => {
    if (!token || !user) return;

    const socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('user:online', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socket.on('user:offline', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on('message:receive', ({ message }: { message: Message }) => {
      setNewMessage(message);
    });

    socket.on('typing:start', (data: TypingUser) => {
      setTypingUsers((prev) => {
        if (prev.find((u) => u.userId === data.userId && u.roomId === data.roomId)) return prev;
        return [...prev, data];
      });
    });

    socket.on('typing:stop', ({ roomId, userId }: { roomId: string; userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => !(u.userId === userId && u.roomId === roomId)));
    });

    socket.on('read:confirm', (data: { roomId: string; userId: string; messageId: string }) => {
      setReadConfirm(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token, user]);

  const sendMessage = (roomId: string, content: string, type = 'text', fileUrl = '', fileName = '') => {
    socketRef.current?.emit('message:send', { roomId, content, type, fileUrl, fileName });
  };

  const sendTypingStart = (roomId: string) => {
    socketRef.current?.emit('typing:start', { roomId });
  };

  const sendTypingStop = (roomId: string) => {
    socketRef.current?.emit('typing:stop', { roomId });
  };

  const confirmRead = (roomId: string, messageId: string) => {
    socketRef.current?.emit('read:confirm', { roomId, messageId });
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        sendMessage,
        sendTypingStart,
        sendTypingStop,
        confirmRead,
        onlineUsers,
        typingUsers,
        newMessage,
        readConfirm,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be inside SocketProvider');
  return ctx;
};
