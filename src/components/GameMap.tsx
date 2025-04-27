
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import Room from './Room';
import Character from './Character';
import MiniMap from './MiniMap';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { ObjectData, InteractiveObjectData } from './Room';
import { UserRound } from 'lucide-react';

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
  const [cameraLocked, setCameraLocked] = useState(true);
  const [clickStartPos, setClickStartPos] = useState({ x: 0, y: 0 });
  const controlsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (cameraLocked && currentUser.position) {
      centerMapOnCharacter(currentUser.position);
    }
  }, [currentUser.position, cameraLocked, scale]);

  useKeyboardControls({
    onMove: (direction) => {
      const speed = 10;
      const currentPosition = currentUser.position;
      let newX = currentPosition.x;
      let newY = currentPosition.y;

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

      newX = Math.max(0, Math.min(mapWidth, newX));
      newY = Math.max(0, Math.min(mapHeight, newY));

      if (newX !== currentPosition.x || newY !== currentPosition.y) {
        onMoveCharacter({ x: newX, y: newY });
        setCameraLocked(true);
      }
    },
  });

  const centerMapOnCharacter = (charPosition: { x: number; y: number }) => {
    if (!charPosition) return;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Center the character on the screen
    const newX = viewportWidth / 2 - charPosition.x * scale;
    const newY = viewportHeight / 2 - charPosition.y * scale;
    
    setMapPosition({ x: newX, y: newY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't initiate drag if clicking on controls
    if (controlsRef.current && controlsRef.current.contains(e.target as Node)) {
      return;
    }
    
    // Store the position where the click started
    setClickStartPos({
      x: e.clientX,
      y: e.clientY,
    });
    setIsDragging(false);
    setDragStart({
      x: e.clientX - mapPosition.x,
      y: e.clientY - mapPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!e.buttons) {
      setIsDragging(false);
      return;
    }
    
    // Calculate distance between current mouse position and starting position
    const distanceMoved = Math.sqrt(
      Math.pow(e.clientX - clickStartPos.x, 2) + 
      Math.pow(e.clientY - clickStartPos.y, 2)
    );
    
    // Only start dragging if mouse has moved more than 5 pixels
    if (distanceMoved > 5) {
      setIsDragging(true);
      setCameraLocked(false);
      setMapPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Don't handle map click if clicking on controls
    if (controlsRef.current && controlsRef.current.contains(e.target as Node)) {
      return;
    }
    
    if (isDragging) {
      setIsDragging(false);
    } else {
      handleMapClick(e);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(2, scale + delta));
    
    const mouseX = e.clientX - mapPosition.x;
    const mouseY = e.clientY - mapPosition.y;
    
    const newX = e.clientX - (mouseX / scale) * newScale;
    const newY = e.clientY - (mouseY / scale) * newScale;
    
    setScale(newScale);
    setMapPosition({ x: newX, y: newY });
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (mapRef.current) {
      // Calculate the click position in map coordinates
      const clickX = (e.clientX - mapPosition.x) / scale;
      const clickY = (e.clientY - mapPosition.y) / scale;
      
      // Check if the click hit any character first (giving priority to character interaction)
      const clickedCharacter = characters.find(char => {
        // Create a simple hit box around the character (30x30 pixels)
        const charLeft = char.position.x - 15;
        const charRight = char.position.x + 15;
        const charTop = char.position.y - 15;
        const charBottom = char.position.y + 15;
        
        return (
          clickX >= charLeft && 
          clickX <= charRight && 
          clickY >= charTop && 
          clickY <= charBottom
        );
      });
      
      // If no character was clicked, move the current user
      if (!clickedCharacter) {
        const boundedX = Math.max(0, Math.min(mapWidth, clickX));
        const boundedY = Math.max(0, Math.min(mapHeight, clickY));
        
        onMoveCharacter({ x: boundedX, y: boundedY });
        setCameraLocked(true);
      }
    }
  };

  const toggleCameraLock = (e: React.MouseEvent) => {
    // Stop event propagation to prevent map click
    e.stopPropagation();
    setCameraLocked(prev => !prev);
    if (!cameraLocked) {
      centerMapOnCharacter(currentUser.position);
    }
  };

  const handleZoomButtonClick = (e: React.MouseEvent, zoomIn: boolean) => {
    // Stop event propagation to prevent map click
    e.stopPropagation();
    
    const delta = zoomIn ? 0.1 : -0.1;
    const newScale = Math.max(0.5, Math.min(2, scale + delta));
    setScale(newScale);
  };

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
          cursor: isDragging ? 'grabbing' : 'default',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
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
      
      <MiniMap
        rooms={miniMapRooms}
        characters={miniMapCharacters}
        mapWidth={mapWidth}
        mapHeight={mapHeight}
        currentPosition={currentUser.position}
        scale={0.1}
      />
      
      <div 
        ref={controlsRef}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 rounded-full shadow-md backdrop-blur-sm flex items-center px-2 z-50 pointer-events-auto"
      >
        <button
          className="p-2 text-gray-600 hover:text-gray-900"
          onClick={(e) => handleZoomButtonClick(e, false)}
        >
          −
        </button>
        <span className="text-xs font-medium mx-2">{Math.round(scale * 100)}%</span>
        <button
          className="p-2 text-gray-600 hover:text-gray-900"
          onClick={(e) => handleZoomButtonClick(e, true)}
        >
          +
        </button>
        
        <button
          className={cn(
            "ml-2 p-2 rounded-full flex items-center justify-center",
            cameraLocked ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
          )}
          onClick={toggleCameraLock}
          title={cameraLocked ? "Camera following user" : "Camera unlocked"}
        >
          <UserRound size={16} />
        </button>
      </div>
    </div>
  );
};

export default GameMap;
