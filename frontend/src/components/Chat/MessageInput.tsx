import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { uploadApi } from '../../services/api';

interface Props {
  onSend: (content: string, type?: string, fileUrl?: string, fileName?: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}

const MessageInput = ({ onSend, onTypingStart, onTypingStop, disabled }: Props) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    if (!isTyping.current) {
      isTyping.current = true;
      onTypingStart();
    }

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      onTypingStop();
    }, 1500);
  };

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    if (isTyping.current) {
      isTyping.current = false;
      onTypingStop();
    }
  }, [text, disabled, onSend, onTypingStop]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmoji = (emoji: { native: string }) => {
    setText((prev) => prev + emoji.native);
    setShowEmoji(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.upload(file);
      onSend('', res.data.type, res.data.fileUrl, res.data.fileName);
    } catch {
      alert('File upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      {showEmoji && (
        <div className="absolute bottom-full left-0 mb-2 z-20">
          <Picker data={data} onEmojiSelect={handleEmoji} theme="dark" />
        </div>
      )}

      <div className="flex items-end gap-2 bg-chat border-t border-white/5 p-4">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="flex-shrink-0 w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition text-gray-400 hover:text-gray-200"
          title="Emoji"
        >
          <Smile size={20} />
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center transition text-gray-400 hover:text-gray-200 disabled:opacity-50"
          title="Attach file"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          ) : (
            <Paperclip size={20} />
          )}
        </button>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.txt,.doc,.docx"
          onChange={handleFile}
        />

        <textarea
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="flex-1 bg-sidebar border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-accent/50 transition resize-none max-h-32 overflow-y-auto disabled:opacity-50"
          style={{ lineHeight: '1.5' }}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-accent hover:bg-accent-dark flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
