import React from 'react';

interface Props {
  username: string;
  avatarUrl?: string;
  online?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
const DOT_SIZES = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };

const Avatar = ({ username, avatarUrl, online, size = 'md' }: Props) => {
  const initials = username?.slice(0, 2).toUpperCase() || '??';
  const hue = username.charCodeAt(0) * 40;

  return (
    <div className="relative flex-shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className={`${SIZES[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${SIZES[size]} rounded-full flex items-center justify-center font-semibold text-white`}
          style={{ background: `hsl(${hue}, 55%, 40%)` }}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${DOT_SIZES[size]} rounded-full border-2 border-sidebar ${
            online ? 'bg-green-500' : 'bg-gray-500'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
