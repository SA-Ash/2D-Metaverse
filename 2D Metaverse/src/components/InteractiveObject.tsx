
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, Users, Video, Mic, Speaker } from 'lucide-react';

interface InteractiveObjectProps {
  id: string;
  type: 'chat' | 'meeting' | 'video' | 'audio' | 'speaker' | 'custom';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  label?: string;
  customIcon?: React.ReactNode;
  onClick?: () => void;
  color?: string;
  isActive?: boolean;
  className?: string;
}

const InteractiveObject: React.FC<InteractiveObjectProps> = ({
  id,
  type,
  position,
  size = { width: 48, height: 48 },
  label,
  customIcon,
  onClick,
  color,
  isActive = false,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Map of object types to icons
  const iconMap = {
    chat: <MessageSquare size={24} />,
    meeting: <Users size={24} />,
    video: <Video size={24} />,
    audio: <Mic size={24} />,
    speaker: <Speaker size={24} />,
    custom: customIcon,
  };

  // Map of object types to colors
  const colorMap = {
    chat: color || 'bg-blue-500',
    meeting: color || 'bg-purple-500',
    video: color || 'bg-red-500',
    audio: color || 'bg-green-500',
    speaker: color || 'bg-yellow-500',
    custom: color || 'bg-gray-500',
  };

  return (
    <div
      className={cn(
        'interactive-object shadow-md flex items-center justify-center',
        isActive ? 'ring-2 ring-white' : '',
        isHovered ? 'scale-110' : '',
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div
        className={cn(
          'w-full h-full rounded-full flex items-center justify-center text-white',
          colorMap[type],
          isActive ? 'animate-pulse-subtle' : ''
        )}
      >
        {iconMap[type]}
      </div>
      
      {(label || isHovered) && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium shadow-sm whitespace-nowrap z-10 backdrop-blur-sm">
          {label}
        </div>
      )}
    </div>
  );
};

export default InteractiveObject;
