import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatArea from '../components/Chat/ChatArea';
import type { Room } from '../types';

const ChatPage = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar');

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
    setMobileView('chat');
  };

  const handleBack = () => {
    setMobileView('sidebar');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-sidebar">
      {/* Sidebar — hidden on mobile when chat is open */}
      <div className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} flex-shrink-0`}>
        <Sidebar
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          rooms={rooms}
          setRooms={setRooms}
        />
      </div>

      {/* Chat area */}
      <main className={`flex-1 ${mobileView === 'sidebar' ? 'hidden md:flex' : 'flex'} flex-col min-w-0`}>
        {selectedRoom ? (
          <ChatArea room={selectedRoom} onBack={handleBack} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-chat text-center px-8">
            <div className="w-24 h-24 bg-sidebar rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              <MessageCircle size={40} className="text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Messages</h2>
            <p className="text-gray-400 max-w-xs">
              Select a conversation from the sidebar or start a new one by clicking the + button.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
