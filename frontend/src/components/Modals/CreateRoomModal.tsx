import React, { useState, useEffect } from 'react';
import { X, Search, Check, Users } from 'lucide-react';
import { authApi, roomApi } from '../../services/api';
import type { Room, User } from '../../types';
import Avatar from '../Sidebar/Avatar';

interface Props {
  onClose: () => void;
  onCreated: (room: Room) => void;
}

const CreateRoomModal = ({ onClose, onCreated }: Props) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [selected, setSelected] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await authApi.searchUsers(query);
        setResults(res.data.users);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const toggle = (u: User) => {
    setSelected((prev) =>
      prev.find((s) => s._id === u._id) ? prev.filter((s) => s._id !== u._id) : [...prev, u]
    );
  };

  const handleCreate = async () => {
    if (selected.length === 0) return;
    setCreating(true);
    try {
      const res = await roomApi.createRoom({
        memberIds: selected.map((u) => u._id),
        name: selected.length > 1 ? groupName || undefined : undefined,
      });
      onCreated(res.data.room);
    } catch {
      alert('Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  const isGroup = selected.length > 1;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-chat rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-white font-semibold">New Conversation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Selected users */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <div key={u._id} className="flex items-center gap-1.5 bg-accent/20 border border-accent/30 rounded-full px-3 py-1">
                  <span className="text-sm text-blue-300">{u.username}</span>
                  <button onClick={() => toggle(u)} className="text-blue-300 hover:text-white">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Group name (only for 2+ selected) */}
          {isGroup && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                <Users size={12} className="inline mr-1" />
                Group Name (optional)
              </label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Team Chat"
                className="w-full bg-sidebar border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent/50 transition"
              />
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full bg-sidebar border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent/50 transition"
            />
          </div>

          {/* Results */}
          <div className="max-h-52 overflow-y-auto space-y-1">
            {loading && (
              <p className="text-center text-gray-500 text-sm py-4">Searching...</p>
            )}
            {!loading && query.length >= 2 && results.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">No users found</p>
            )}
            {results.map((u) => {
              const isSelected = !!selected.find((s) => s._id === u._id);
              return (
                <button
                  key={u._id}
                  onClick={() => toggle(u)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                    isSelected ? 'bg-accent/10' : 'hover:bg-white/5'
                  }`}
                >
                  <Avatar username={u.username} avatarUrl={u.avatarUrl} size="sm" />
                  <span className="flex-1 text-sm text-gray-200 text-left">{u.username}</span>
                  {isSelected && <Check size={14} className="text-accent" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/5 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={selected.length === 0 || creating}
            className="px-5 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : isGroup ? 'Create Group' : 'Start Chat'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
