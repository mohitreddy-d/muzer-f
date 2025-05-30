import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string; // Used for fallback initials
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'rounded';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl md:h-32 md:w-32 md:text-3xl', // Larger for profile header
};

const shapeClasses = {
  circle: 'rounded-full',
  rounded: 'rounded-md',
};

const getInitials = (name: string = '') => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
  return `${names[0][0]?.toUpperCase() || ''}${names[names.length - 1][0]?.toUpperCase() || ''}`;
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  shape = 'circle',
  className,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const baseSizeClass = sizeClasses[size] || sizeClasses.md;
  const baseShapeClass = shapeClasses[shape] || shapeClasses.circle;

  return (
    <div
      className={cn(
        'flex-shrink-0 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-semibold text-zinc-500 dark:text-zinc-300 overflow-hidden',
        baseSizeClass,
        baseShapeClass,
        className
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className="h-full w-full object-cover"
          onError={handleImageError}
          referrerPolicy="no-referrer" // For Spotify images that might block direct linking
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
