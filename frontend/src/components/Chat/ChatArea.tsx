import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Users, ChevronLeft } from 'lucide-react';
import { roomApi } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import type { Message, Room } from '../../types';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import Avatar from '../Sidebar/Avatar';

interface Props {
  room: Room;
  onBack?: () => void;
}

const ChatArea = ({ room, onBack }: Props) => {
  const { user } = useAuth();
  const { sendMessage, sendTypingStart, sendTypingStop, typingUsers, newMessage, confirmRead, onlineUsers } =
    useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const isGroup = room.type === 'group';
  const otherMember = isGroup ? null : room.members.find((m) => m._id !== user?._id);
  const displayName = isGroup ? room.name || 'Group' : otherMember?.username || 'Unknown';
  const isOnline = otherMember ? onlineUsers.has(otherMember._id) : false;

  const roomTyping = typingUsers
    .filter((t) => t.roomId === room._id && t.userId !== user?._id)
    .map((t) => t.username);

  // Load messages on mount / room change
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);

    roomApi.getMessages(room._id, 1).then((res) => {
      setMessages(res.data.messages);
      setHasMore(res.data.messages.length === 40);
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 50);
    });

    // Mark as read
    confirmRead(room._id, '');
  }, [room._id]);

  // Receive new message
  useEffect(() => {
    if (!newMessage || newMessage.roomId !== room._id) return;
    setMessages((prev) => {
      if (prev.find((m) => m._id === newMessage._id)) return prev;
      return [...prev, newMessage];
    });
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    confirmRead(room._id, newMessage._id);
  }, [newMessage, room._id]);

  // Load more on scroll top
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setLoading(true);
    const res = await roomApi.getMessages(room._id, nextPage);
    setMessages((prev) => [...res.data.messages, ...prev]);
    setHasMore(res.data.messages.length === 40);
    setPage(nextPage);
    setLoading(false);
  }, [hasMore, loading, page, room._id]);

  useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleSend = (content: string, type = 'text', fileUrl = '', fileName = '') => {
    sendMessage(room._id, content, type, fileUrl, fileName);
  };

  return (
    <div className="flex flex-col h-full bg-chat">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 flex-shrink-0">
        {onBack && (
          <button onClick={onBack} className="md:hidden text-gray-400 hover:text-white mr-1">
            <ChevronLeft size={20} />
          </button>
        )}

        {isGroup ? (
          <div className="w-9 h-9 rounded-full bg-panel flex items-center justify-center flex-shrink-0">
            <Users size={16} className="text-gray-300" />
          </div>
        ) : (
          <Avatar username={otherMember?.username || '?'} avatarUrl={otherMember?.avatarUrl} online={isOnline} />
        )}

        <div>
          <h2 className="font-semibold text-white text-sm">{displayName}</h2>
          {isGroup ? (
            <p className="text-xs text-gray-400">{room.members.length} members</p>
          ) : (
            <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <div ref={topRef} className="h-1" />

        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
            Loading messages...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="w-16 h-16 rounded-full bg-sidebar flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <p className="font-medium text-gray-400">No messages yet</p>
            <p className="text-sm mt-1">Say hello to {displayName}!</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            prevSenderId={messages[i - 1]?.senderId._id}
          />
        ))}

        <TypingIndicator names={roomTyping} />
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <MessageInput
          onSend={handleSend}
          onTypingStart={() => sendTypingStart(room._id)}
          onTypingStop={() => sendTypingStop(room._id)}
        />
      </div>
    </div>
  );
};

export default ChatArea;
