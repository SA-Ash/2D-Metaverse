import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import Room from './Room';
import Character from './Character';
import MiniMap from './MiniMap';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { ObjectData, InteractiveObjectData } from './Room';

interface CharacterData {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  isMoving: boolean;
  direction: 'up' | 'down' | 'left' | 'right';
  isSpeaking?: boolean;
  message?: string;
  isCurrentUser?: boolean;
}

interface RoomData {
  id: string;
  name: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  backgroundColor?: string;
  objects: ObjectData[];
  interactiveObjects: InteractiveObjectData[];
}

interface GameMapProps {
  mapWidth: number;
  mapHeight: number;
  rooms: RoomData[];
  characters: CharacterData[];
  currentUser: {
    id: string;
    position: { x: number; y: number };
    direction: 'up' | 'down' | 'left' | 'right';
    isMoving: boolean;
  };
  onMoveCharacter: (position: { x: number; y: number }) => void;
  onObjectClick?: (roomId: string, objectId: string) => void;
  onInteractiveObjectClick?: (roomId: string, objectId: string) => void;
  className?: string;
}

const GameMap: React.FC<GameMapProps> = ({
  mapWidth,
  mapHeight,
  rooms,
  characters,
  currentUser,
  onMoveCharacter,
  onObjectClick,
  onInteractiveObjectClick,
  className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });

  // Center the map on load
  useEffect(() => {
    if (mapRef.current) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      setMapPosition({
        x: (viewportWidth - mapWidth * scale) / 2,
        y: (viewportHeight - mapHeight * scale) / 2,
      });
    }
  }, [mapWidth, mapHeight, scale]);

  // Handle keyboard movement
  useKeyboardControls({
    onMove: (direction) => {
      const speed = 10;
      let newX = currentUser.position.x;
      let newY = currentUser.position.y;

      switch (direction) {
        case 'up':
          newY -= speed;
          break;
        case 'down':
          newY += speed;
          break;
        case 'left':
          newX -= speed;
          break;
        case 'right':
          newX += speed;
          break;
      }

      // Boundaries check
      newX = Math.max(0, Math.min(mapWidth, newX));
      newY = Math.max(0, Math.min(mapHeight, newY));

      onMoveCharacter({ x: newX, y: newY });
      
      // Adjust map position to keep character centered
      centerMapOnCharacter({ x: newX, y: newY });
    },
  });

  // Center map on character
  const centerMapOnCharacter = (charPosition: { x: number; y: number }) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    setMapPosition({
      x: (viewportWidth / 2) - charPosition.x * scale,
      y: (viewportHeight / 2) - charPosition.y * scale,
    });
  };

  // Handle mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - mapPosition.x,
      y: e.clientY - mapPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setMapPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(2, scale + delta));
    
    // Calculate mouse position relative to the map
    const mouseX = e.clientX - mapPosition.x;
    const mouseY = e.clientY - mapPosition.y;
    
    // Calculate new position to zoom toward mouse
    const newX = e.clientX - (mouseX / scale) * newScale;
    const newY = e.clientY - (mouseY / scale) * newScale;
    
    setScale(newScale);
    setMapPosition({ x: newX, y: newY });
  };

  // Handle map click for character movement
  const handleMapClick = (e: React.MouseEvent) => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - mapPosition.x) / scale;
      const y = (e.clientY - rect.top - mapPosition.y) / scale;
      
      // Check boundaries
      const boundedX = Math.max(0, Math.min(mapWidth, x));
      const boundedY = Math.max(0, Math.min(mapHeight, y));
      
      onMoveCharacter({ x: boundedX, y: boundedY });
    }
  };

  // Prepare room and character data for MiniMap
  const miniMapRooms = rooms.map(room => ({
    id: room.id,
    position: room.position,
    width: room.width,
    height: room.height,
    backgroundColor: room.backgroundColor,
  }));
  
  const miniMapCharacters = characters.map(char => ({
    id: char.id,
    position: char.position,
    isCurrentUser: char.isCurrentUser,
    color: char.color,
  }));

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <div
        ref={mapRef}
        className="map-container"
        style={{
          width: mapWidth,
          height: mapHeight,
          transform: `scale(${scale})`,
          position: 'absolute',
          left: mapPosition.x,
          top: mapPosition.y,
          backgroundColor: '#ababab',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onClick={handleMapClick}
      >
        {/* Render rooms */}
        {rooms.map((room) => (
          <Room
            key={room.id}
            id={room.id}
            name={room.name}
            position={room.position}
            width={room.width}
            height={room.height}
            backgroundColor={room.backgroundColor}
            objects={room.objects}
            interactiveObjects={room.interactiveObjects}
            onObjectClick={(objectId) => onObjectClick?.(room.id, objectId)}
            onInteractiveObjectClick={(objectId) => onInteractiveObjectClick?.(room.id, objectId)}
          />
        ))}
        
        {/* Render characters */}
        {characters.map((character) => (
          <Character
            key={character.id}
            id={character.id}
            name={character.name}
            color={character.color}
            position={character.position}
            isMoving={character.isMoving}
            direction={character.direction}
            isSpeaking={character.isSpeaking}
            message={character.message}
            isCurrentUser={character.isCurrentUser}
          />
        ))}
      </div>
      
      {/* MiniMap */}
      <MiniMap
        rooms={miniMapRooms}
        characters={miniMapCharacters}
        mapWidth={mapWidth}
        mapHeight={mapHeight}
        currentPosition={currentUser.position}
        scale={0.1}
      />
      
      {/* Zoom Controls */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 rounded-full shadow-md backdrop-blur-sm flex items-center px-2 z-50">
        <button
          className="p-2 text-gray-600 hover:text-gray-900"
          onClick={() => {
            const newScale = Math.max(0.5, scale - 0.1);
            setScale(newScale);
          }}
        >
          −
        </button>
        <span className="text-xs font-medium mx-2">{Math.round(scale * 100)}%</span>
        <button
          className="p-2 text-gray-600 hover:text-gray-900"
          onClick={() => {
            const newScale = Math.min(2, scale + 0.1);
            setScale(newScale);
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default GameMap;
