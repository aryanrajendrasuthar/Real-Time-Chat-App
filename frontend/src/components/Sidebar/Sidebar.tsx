import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Plus, LogOut, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { roomApi } from '../../services/api';
import type { Room } from '../../types';
import RoomItem from './RoomItem';
import Avatar from './Avatar';
import CreateRoomModal from '../Modals/CreateRoomModal';

interface Props {
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

const Sidebar = ({ selectedRoom, onSelectRoom, rooms, setRooms }: Props) => {
  const { user, logout } = useAuth();
  const { connected, newMessage } = useSocket();
  const [search, setSearch] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await roomApi.getRooms();
        setRooms(res.data.rooms);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [setRooms]);

  // Update last message preview when new message arrives
  useEffect(() => {
    if (!newMessage) return;
    setRooms((prev) =>
      prev
        .map((r) =>
          r._id === newMessage.roomId
            ? { ...r, lastMessage: newMessage, lastMessageAt: newMessage.createdAt }
            : r
        )
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
    );
  }, [newMessage, setRooms]);

  const filtered = rooms.filter((r) => {
    const other = r.type === 'dm' ? r.members.find((m) => m._id !== user?._id) : null;
    const name = r.type === 'group' ? r.name || 'Group' : other?.username || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const dms = filtered.filter((r) => r.type === 'dm');
  const groups = filtered.filter((r) => r.type === 'group');

  return (
    <>
      <aside className="w-72 bg-sidebar flex flex-col border-r border-white/5 h-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center">
              <MessageCircle size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">ChatApp</span>
          </div>
          <div className="flex items-center gap-2">
            {connected ? (
              <Wifi size={14} className="text-green-400" title="Connected" />
            ) : (
              <WifiOff size={14} className="text-red-400" title="Disconnected" />
            )}
            <button
              onClick={() => setShowCreateRoom(true)}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-accent/20 flex items-center justify-center transition"
              title="New Chat"
            >
              <Plus size={16} className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-chat border border-white/5 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent/50 transition"
            />
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-2">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-500 text-sm">
              Loading...
            </div>
          ) : (
            <>
              {dms.length > 0 && (
                <div>
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Direct Messages
                  </p>
                  {dms.map((r) => (
                    <RoomItem
                      key={r._id}
                      room={r}
                      active={selectedRoom?._id === r._id}
                      onClick={() => onSelectRoom(r)}
                    />
                  ))}
                </div>
              )}

              {groups.length > 0 && (
                <div>
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Groups
                  </p>
                  {groups.map((r) => (
                    <RoomItem
                      key={r._id}
                      room={r}
                      active={selectedRoom?._id === r._id}
                      onClick={() => onSelectRoom(r)}
                    />
                  ))}
                </div>
              )}

              {filtered.length === 0 && (
                <div className="text-center py-10 text-gray-500 text-sm">
                  {search ? 'No results' : 'No chats yet. Start one!'}
                </div>
              )}
            </>
          )}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <Avatar username={user?.username || '?'} avatarUrl={user?.avatarUrl} online size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-green-400">Online</p>
          </div>
          <button
            onClick={logout}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition text-gray-400 hover:text-red-400"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreated={(room) => {
            setRooms((prev) => {
              if (prev.find((r) => r._id === room._id)) return prev;
              return [room, ...prev];
            });
            onSelectRoom(room);
            setShowCreateRoom(false);
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
