
import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  color: string;
  size?: 'sm' | 'md' | 'lg';
  name: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  color, 
  size = 'md', 
  name, 
  className 
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base'
  };

  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white shadow-sm',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
