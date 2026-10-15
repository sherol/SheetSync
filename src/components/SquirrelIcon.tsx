import React, { useState } from 'react';

interface SquirrelIconProps {
  className?: string;
  size?: number;
  alt?: string;
}

export const SquirrelIcon: React.FC<SquirrelIconProps> = ({
  className = 'w-6 h-6',
  size,
  alt = 'SheetSync Squirrel',
}) => {
  const [hasError, setHasError] = useState(false);
  const basePath = import.meta.env.BASE_URL || './';
  const iconSrc = `${basePath.endsWith('/') ? basePath : basePath + '/'}squirrel-icon.png`;

  if (hasError) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={size || 24}
        height={size || 24}
        className={className}
      >
        <defs>
          <linearGradient id="sq-rainbow-fallback" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="25%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="75%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#sq-rainbow-fallback)" />
        <ellipse cx="32" cy="38" rx="16" ry="18" fill="#8d5b34" />
        <ellipse cx="32" cy="24" rx="13" ry="12" fill="#a46d42" />
        <circle cx="27" cy="22" r="3" fill="#181a24" />
        <circle cx="26" cy="21" r="1.1" fill="#ffffff" />
        <circle cx="37" cy="22" r="3" fill="#181a24" />
        <circle cx="36" cy="21" r="1.1" fill="#ffffff" />
        <ellipse cx="24" cy="27" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.6" />
        <ellipse cx="40" cy="27" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.6" />
        <path d="M 30 26 Q 32 28 34 26" fill="none" stroke="#181a24" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <img
      src={iconSrc}
      alt={alt}
      width={size}
      height={size}
      onError={() => setHasError(true)}
      className={`inline-block select-none object-contain ${className}`}
      draggable={false}
    />
  );
};

