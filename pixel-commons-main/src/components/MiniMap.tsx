
import React from 'react';
import { cn } from '@/lib/utils';

interface MiniMapProps {
  rooms: {
    id: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    backgroundColor?: string;
  }[];
  characters: {
    id: string;
    position: { x: number; y: number };
    isCurrentUser?: boolean;
    color: string;
  }[];
  mapWidth: number;
  mapHeight: number;
  currentPosition: { x: number; y: number };
  scale?: number;
  className?: string;
}

const MiniMap: React.FC<MiniMapProps> = ({
  rooms,
  characters,
  mapWidth,
  mapHeight,
  currentPosition,
  scale = 0.1,
  className,
}) => {
  const miniMapWidth = 200;
  const miniMapHeight = 150;
  
  const scaleFactor = Math.min(
    miniMapWidth / mapWidth,
    miniMapHeight / mapHeight
  ) * 0.9;
  
  const viewportWidth = window.innerWidth / (mapWidth * scaleFactor);
  const viewportHeight = window.innerHeight / (mapHeight * scaleFactor);
  
  // Calculate centering offsets
  const offsetX = (miniMapWidth - mapWidth * scaleFactor) / 2;
  const offsetY = (miniMapHeight - mapHeight * scaleFactor) / 2;

  return (
    <div 
      className={cn("minimap select-none", className)}
      style={{ width: miniMapWidth, height: miniMapHeight }}
    >
      <div className="text-xs font-medium text-center mb-1">Map</div>
      <div 
        className="relative overflow-hidden bg-metaverse-corridor"
        style={{ width: '100%', height: 'calc(100% - 20px)' }}
      >
        {/* Rooms */}
        {rooms.map((room) => (
          <div
            key={room.id}
            className="absolute"
            style={{
              left: room.position.x * scaleFactor + offsetX,
              top: room.position.y * scaleFactor + offsetY,
              width: room.width * scaleFactor,
              height: room.height * scaleFactor,
              backgroundColor: room.backgroundColor || '#e6a75f',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '2px',
            }}
          />
        ))}
        
        {/* Characters */}
        {characters.map((character) => (
          <div
            key={character.id}
            className={cn(
              "absolute rounded-full border",
              character.isCurrentUser ? 'border-white animate-pulse-subtle' : ''
            )}
            style={{
              left: character.position.x * scaleFactor + offsetX,
              top: character.position.y * scaleFactor + offsetY,
              width: 6,
              height: 6,
              backgroundColor: character.color,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        
        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-white pointer-events-none"
          style={{
            left: (currentPosition.x - window.innerWidth / 2) * scaleFactor + offsetX,
            top: (currentPosition.y - window.innerHeight / 2) * scaleFactor + offsetY,
            width: viewportWidth * mapWidth * scaleFactor,
            height: viewportHeight * mapHeight * scaleFactor,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </div>
  );
};

export default MiniMap;
