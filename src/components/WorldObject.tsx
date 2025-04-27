
import React from 'react';
import { cn } from '@/lib/utils';

interface WorldObjectProps {
  type: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  rotation?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
  isInteractive?: boolean;
  onClick?: () => void;
  phaserSprite?: string; // Added for Phaser integration
}

const WorldObject: React.FC<WorldObjectProps> = ({
  type,
  position,
  width,
  height,
  rotation = 0,
  color,
  style,
  className,
  isInteractive = false,
  onClick,
  phaserSprite,
}) => {
  // Map of object types to styling
  const objectStyles: Record<string, string> = {
    'table': 'bg-amber-800 rounded-md',
    'chair': 'bg-amber-700 rounded-sm',
    'desk': 'bg-amber-900 rounded-md',
    'plant': 'bg-green-600 rounded-full',
    'computer': 'bg-gray-800 rounded-sm',
    'couch': 'bg-blue-600 rounded-md',
    'wall': 'bg-gray-700',
    'door': 'bg-amber-600',
    'whiteboard': 'bg-white border border-gray-300',
    'tv': 'bg-black rounded-sm',
    'coffee-machine': 'bg-gray-900 rounded-sm',
    'water-cooler': 'bg-blue-400 rounded-sm',
    'bookshelf': 'bg-amber-700 rounded-sm',
  };

  return (
    <div
      className={cn(
        'absolute',
        objectStyles[type] || 'bg-gray-500',
        isInteractive ? 'cursor-pointer hover:brightness-110 transition-all' : '',
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width,
        height,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        backgroundColor: color,
        ...style,
      }}
      onClick={isInteractive ? onClick : undefined}
      data-phaser-sprite={phaserSprite} // Data attribute for Phaser integration
    />
  );
};

export default WorldObject;
