import React from 'react';
import { Users } from 'lucide-react';
import Avatar from './Avatar';
import type { Room } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

interface Props {
  room: Room;
  active: boolean;
  onClick: () => void;
}

const formatTime = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const RoomItem = ({ room, active, onClick }: Props) => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();

  const isGroup = room.type === 'group';
  const otherMember = isGroup ? null : room.members.find((m) => m._id !== user?._id);
  const displayName = isGroup
    ? room.name || 'Group'
    : otherMember?.username || 'Unknown';

  const isOnline = otherMember ? onlineUsers.has(otherMember._id) : false;

  const lastMsg = room.lastMessage;
  const preview = lastMsg
    ? lastMsg.type === 'text'
      ? lastMsg.content.slice(0, 35) + (lastMsg.content.length > 35 ? '…' : '')
      : lastMsg.type === 'image'
      ? '📷 Image'
      : '📎 File'
    : 'No messages yet';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left group ${
        active ? 'bg-accent/20 border border-accent/30' : 'hover:bg-white/5'
      }`}
    >
      {isGroup ? (
        <div className="w-10 h-10 rounded-full bg-panel flex items-center justify-center flex-shrink-0">
          <Users size={18} className="text-gray-300" />
        </div>
      ) : (
        <Avatar
          username={otherMember?.username || '?'}
          avatarUrl={otherMember?.avatarUrl}
          online={isOnline}
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`font-medium text-sm truncate ${active ? 'text-white' : 'text-gray-200'}`}>
            {displayName}
          </span>
          {room.lastMessageAt && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-1">
              {formatTime(room.lastMessageAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{preview}</p>
      </div>
    </button>
  );
};

export default RoomItem;
