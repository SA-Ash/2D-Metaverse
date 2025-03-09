
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { findNearbyCharacters, calculateNormalizedDistance } from '@/utils/collision';
import { rooms as roomsData } from '@/data/rooms';
import { toast } from 'sonner';

interface Character {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  isMoving: boolean;
  direction: 'up' | 'down' | 'left' | 'right';
  isSpeaking?: boolean;
  message?: string;
  isCurrentUser?: boolean;
  sprite?: string; // Added for Phaser
}

interface UserNearby {
  id: string;
  name: string;
  color: string;
  distance: number; // 0-100, where 0 is closest
}

interface GameContextType {
  currentUser: Character;
  characters: Character[];
  rooms: typeof roomsData;
  mapWidth: number;
  mapHeight: number;
  usersNearby: UserNearby[];
  isChatOpen: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  usePhaser: boolean; // Added for Phaser toggle
  togglePhaser: () => void; // Added for Phaser toggle
  moveCharacter: (position: { x: number; y: number }) => void;
  sendMessage: (message: string) => void;
  toggleChat: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  handleObjectInteraction: (roomId: string, objectId: string) => void;
  handleInteractiveObjectInteraction: (roomId: string, objectId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Mock data for initial state
const initialCurrentUser: Character = {
  id: 'user-1',
  name: 'You',
  color: '#8B5CF6',
  position: { x: 400, y: 300 },
  isMoving: false,
  direction: 'down',
  isCurrentUser: true,
};

const initialCharacters: Character[] = [
  {
    id: 'npc-1',
    name: 'Alex',
    color: '#F472B6',
    position: { x: 300, y: 250 },
    isMoving: false,
    direction: 'right',
  },
  {
    id: 'npc-2',
    name: 'Jamie',
    color: '#10B981',
    position: { x: 500, y: 350 },
    isMoving: false,
    direction: 'left',
  },
  {
    id: 'npc-3',
    name: 'Taylor',
    color: '#F59E0B',
    position: { x: 650, y: 450 },
    isMoving: false,
    direction: 'up',
  },
];

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Character>(initialCurrentUser);
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [usersNearby, setUsersNearby] = useState<UserNearby[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [usePhaser, setUsePhaser] = useState(true); // Default to true to use Phaser
  
  const mapWidth = 1200;
  const mapHeight = 800;
  const proximityRadius = 150; // distance in pixels for proximity detection
  
  // Update nearby users based on proximity
  useEffect(() => {
    const allCharacters = [...characters];
    
    const nearby = findNearbyCharacters(
      currentUser.position,
      allCharacters.map(char => ({ id: char.id, position: char.position })),
      proximityRadius
    ).map(nearby => {
      const character = allCharacters.find(c => c.id === nearby.id)!;
      return {
        id: character.id,
        name: character.name,
        color: character.color,
        distance: calculateNormalizedDistance(nearby.distance, proximityRadius),
      };
    });
    
    setUsersNearby(nearby);
  }, [currentUser.position, characters]);
  
  // Function to move the current user's character
  const moveCharacter = (position: { x: number; y: number }) => {
    const prevPosition = currentUser.position;
    
    // Determine direction based on movement
    let direction: 'up' | 'down' | 'left' | 'right' = currentUser.direction;
    
    if (position.x < prevPosition.x) direction = 'left';
    else if (position.x > prevPosition.x) direction = 'right';
    else if (position.y < prevPosition.y) direction = 'up';
    else if (position.y > prevPosition.y) direction = 'down';
    
    setCurrentUser(prev => ({
      ...prev,
      position,
      direction,
      isMoving: true,
    }));
    
    // Set moving state back to false after a short delay
    setTimeout(() => {
      setCurrentUser(prev => ({
        ...prev,
        isMoving: false,
      }));
    }, 500);
  };
  
  // Function to send a chat message
  const sendMessage = (message: string) => {
    // Update current user with message
    setCurrentUser(prev => ({
      ...prev,
      message,
      isSpeaking: true,
    }));
    
    // Clear message and speaking state after a few seconds
    setTimeout(() => {
      setCurrentUser(prev => ({
        ...prev,
        message: '',
        isSpeaking: false,
      }));
    }, 5000);
  };
  
  // Toggle functions
  const toggleChat = () => setIsChatOpen(prev => !prev);
  const toggleAudio = () => {
    setIsAudioEnabled(prev => !prev);
    toast.success(isAudioEnabled ? "Microphone muted" : "Microphone activated");
  };
  const toggleVideo = () => {
    setIsVideoEnabled(prev => !prev);
    toast.success(isVideoEnabled ? "Camera turned off" : "Camera turned on");
  };
  const togglePhaser = () => {
    setUsePhaser(prev => !prev);
    toast.success(usePhaser ? "Switched to React renderer" : "Switched to Phaser renderer");
  };
  
  // Handle object interaction
  const handleObjectInteraction = (roomId: string, objectId: string) => {
    toast.info(`Interacting with object ${objectId} in room ${roomId}`);
  };
  
  // Handle interactive object interaction
  const handleInteractiveObjectInteraction = (roomId: string, objectId: string) => {
    toast.info(`Interacting with interactive object ${objectId} in room ${roomId}`);
  };
  
  const value = {
    currentUser,
    characters,
    rooms: roomsData,
    mapWidth,
    mapHeight,
    usersNearby,
    isChatOpen,
    isAudioEnabled,
    isVideoEnabled,
    usePhaser,
    moveCharacter,
    sendMessage,
    toggleChat,
    toggleAudio,
    toggleVideo,
    togglePhaser,
    handleObjectInteraction,
    handleInteractiveObjectInteraction,
  };
  
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
