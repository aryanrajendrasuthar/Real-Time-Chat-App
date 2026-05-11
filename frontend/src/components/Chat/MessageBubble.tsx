import React, { useState } from 'react';
import { Check, CheckCheck, X } from 'lucide-react';
import type { Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../Sidebar/Avatar';

interface Props {
  message: Message;
  prevSenderId?: string;
}

const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ReadReceipt = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
  if (!isOwn) return null;

  const readCount = message.readBy?.length || 0;

  if (readCount <= 1) {
    return <Check size={12} className="text-gray-400" />;
  }
  if (readCount === 2) {
    return <CheckCheck size={12} className="text-gray-400" />;
  }
  return <CheckCheck size={12} className="text-blue-400" />;
};

const ImageMessage = ({ url, fileName }: { url: string; fileName?: string }) => {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <img
        src={url}
        alt={fileName || 'image'}
        className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition"
        onClick={() => setLightbox(true)}
      />
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setLightbox(false)}>
            <X size={24} />
          </button>
          <img src={url} alt={fileName || 'image'} className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </>
  );
};

const MessageBubble = ({ message, prevSenderId }: Props) => {
  const { user } = useAuth();
  const isOwn = message.senderId._id === user?._id;
  const showAvatar = !isOwn && prevSenderId !== message.senderId._id;

  return (
    <div className={`flex items-end gap-2 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar placeholder */}
      <div className="w-8 flex-shrink-0">
        {showAvatar && !isOwn && (
          <Avatar username={message.senderId.username} avatarUrl={message.senderId.avatarUrl} size="sm" />
        )}
      </div>

      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {showAvatar && !isOwn && (
          <span className="text-xs text-gray-400 mb-1 ml-1">{message.senderId.username}</span>
        )}

        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwn
              ? 'bg-accent text-white rounded-br-sm'
              : 'bg-bubble-other text-gray-100 rounded-bl-sm'
          }`}
        >
          {message.type === 'text' && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {message.type === 'image' && message.fileUrl && (
            <ImageMessage url={message.fileUrl} fileName={message.fileName} />
          )}

          {message.type === 'file' && message.fileUrl && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:underline"
            >
              <span>📎</span>
              <span>{message.fileName || 'File'}</span>
            </a>
          )}
        </div>

        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition">
            {formatTime(message.createdAt)}
          </span>
          <ReadReceipt message={message} isOwn={isOwn} />
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
