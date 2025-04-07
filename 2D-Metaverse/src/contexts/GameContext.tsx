import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { findNearbyCharacters, calculateNormalizedDistance } from '@/utils/collision';
import { rooms as roomsData } from '@/data/rooms';
import { toast } from 'sonner';
import { webRTCManager } from '@/utils/webrtc';
import ConnectionRequest from '@/components/ConnectionRequest';
import VideoCallView from '@/components/VideoCallView';

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
  isConnected?: boolean; // WebRTC connection status
  connectionType?: 'chat' | 'audio' | 'video'; // Type of active connection
}

interface ConnectionRequestData {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  type: 'chat' | 'audio' | 'video';
}

interface ActiveConnection {
  userId: string;
  userName: string;
  userColor: string;
  type: 'chat' | 'audio' | 'video';
  stream?: MediaStream;
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
  localStream: MediaStream | null;
  usePhaser: boolean; // Added for Phaser toggle
  connectionRequests: ConnectionRequestData[];
  activeConnections: ActiveConnection[];
  togglePhaser: () => void; // Added for Phaser toggle
  moveCharacter: (position: { x: number; y: number }) => void;
  sendMessage: (message: string) => void;
  toggleChat: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  connectToUser: (userId: string) => Promise<void>;
  disconnectFromUser: (userId: string) => void;
  handleObjectInteraction: (roomId: string, objectId: string) => void;
  handleInteractiveObjectInteraction: (roomId: string, objectId: string) => void;
  sendConnectionRequest: (userId: string, type: 'chat' | 'audio' | 'video') => void;
  acceptConnectionRequest: (requestId: string) => void;
  rejectConnectionRequest: (requestId: string) => void;
  isConnectedToUser: (userId: string) => boolean;
  showCameraPreview: boolean;
  closeCameraPreview: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

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
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [usePhaser, setUsePhaser] = useState(true); // Default to true to use Phaser
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequestData[]>([]);
  const [activeConnections, setActiveConnections] = useState<ActiveConnection[]>([]);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  
  const mapWidth = 1200;
  const mapHeight = 800;
  const proximityRadius = 150; // distance in pixels for proximity detection
  
  useEffect(() => {
    webRTCManager.onUserConnected((userId, connectionType, stream) => {
      const character = characters.find(c => c.id === userId);
      if (!character) return;
      
      toast.success(`Connected to ${character.name}`);
      
      setUsersNearby(prev => prev.map(user => 
        user.id === userId ? { ...user, isConnected: true, connectionType } : user
      ));
      
      setActiveConnections(prev => [
        ...prev.filter(conn => conn.userId !== userId),
        {
          userId,
          userName: character.name,
          userColor: character.color,
          type: connectionType,
          stream
        }
      ]);
    });

    webRTCManager.onUserDisconnected((userId) => {
      const character = characters.find(c => c.id === userId);
      toast.info(`Disconnected from ${character?.name || userId}`);
      
      setUsersNearby(prev => prev.map(user => 
        user.id === userId ? { ...user, isConnected: false, connectionType: undefined } : user
      ));
      
      setActiveConnections(prev => prev.filter(conn => conn.userId !== userId));
    });

    webRTCManager.onMessageReceived((userId, message) => {
      if (message.type === 'chat') {
        const character = characters.find(c => c.id === userId);
        if (character) {
          setCharacters(prev => prev.map(char => 
            char.id === userId ? 
            { ...char, message: message.content, isSpeaking: true } : 
            char
          ));

          setTimeout(() => {
            setCharacters(prev => prev.map(char => 
              char.id === userId ? 
              { ...char, message: '', isSpeaking: false } : 
              char
            ));
          }, 5000);
        }
      } else if (message.type === 'connection-request') {
        const character = characters.find(c => c.id === userId);
        if (character) {
          handleIncomingConnectionRequest(userId, character.name, character.color, message.connectionType);
        }
      } else if (message.type === 'connection-response') {
        if (message.accepted) {
          connectWithConnectionType(userId, message.connectionType);
        } else {
          toast.error(`${characters.find(c => c.id === userId)?.name || 'User'} declined your request`);
        }
      }
    });

    return () => {
      webRTCManager.stopLocalStream();
      webRTCManager.disconnectFromAll();
    };
  }, [characters]);
  
  const handleIncomingConnectionRequest = (userId: string, userName: string, userColor: string, type: 'chat' | 'audio' | 'video') => {
    const requestId = `${userId}-${Date.now()}`;
    
    setConnectionRequests(prev => [
      ...prev,
      {
        id: requestId,
        userId,
        userName,
        userColor,
        type
      }
    ]);
    
    setTimeout(() => {
      setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
    }, 30000);
  };
  
  const acceptConnectionRequest = (requestId: string) => {
    const request = connectionRequests.find(req => req.id === requestId);
    if (!request) return;
    
    setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
    
    webRTCManager.sendMessage(request.userId, {
      type: 'connection-response',
      accepted: true,
      connectionType: request.type
    });
    
    connectWithConnectionType(request.userId, request.type);
  };
  
  const rejectConnectionRequest = (requestId: string) => {
    const request = connectionRequests.find(req => req.id === requestId);
    if (!request) return;
    
    setConnectionRequests(prev => prev.filter(req => req.id !== requestId));
    
    webRTCManager.sendMessage(request.userId, {
      type: 'connection-response',
      accepted: false
    });
    
    toast.info(`Declined request from ${request.userName}`);
  };
  
  const sendConnectionRequest = (userId: string, type: 'chat' | 'audio' | 'video') => {
    const user = characters.find(c => c.id === userId);
    if (!user) return;
    
    webRTCManager.sendMessage(userId, {
      type: 'connection-request',
      connectionType: type
    });
    
    toast.info(`Sent ${type} request to ${user.name}`);
  };
  
  const connectWithConnectionType = async (userId: string, type: 'chat' | 'audio' | 'video') => {
    try {
      if ((type === 'audio' || type === 'video') && !localStream) {
        const stream = await webRTCManager.initLocalStream(
          type === 'audio' || type === 'video',
          type === 'video'
        );
        setLocalStream(stream);
        
        setIsAudioEnabled(type === 'audio' || type === 'video');
        setIsVideoEnabled(type === 'video');
      }
      
      await connectToUser(userId);
      
      setUsersNearby(prev => prev.map(user => 
        user.id === userId ? { ...user, connectionType: type } : user
      ));
    } catch (error) {
      console.error('Error connecting with type:', error);
      toast.error('Failed to establish connection');
    }
  };
  
  const isConnectedToUser = (userId: string) => {
    return activeConnections.some(conn => conn.userId === userId);
  };
  
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
  
  const moveCharacter = (position: { x: number; y: number }) => {
    const prevPosition = currentUser.position;
    
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
    
    setTimeout(() => {
      setCurrentUser(prev => ({
        ...prev,
        isMoving: false,
      }));
    }, 500);
  };
  
  const sendMessage = (message: string) => {
    setCurrentUser(prev => ({
      ...prev,
      message,
      isSpeaking: true,
    }));
    
    usersNearby.forEach(user => {
      webRTCManager.sendMessage(user.id, {
        type: 'chat',
        content: message,
        sender: currentUser.id,
      });
    });
    
    setTimeout(() => {
      setCurrentUser(prev => ({
        ...prev,
        message: '',
        isSpeaking: false,
      }));
    }, 5000);
  };
  
  const connectToUser = async (userId: string) => {
    try {
      if (!localStream && (isAudioEnabled || isVideoEnabled)) {
        const stream = await webRTCManager.initLocalStream(isAudioEnabled, isVideoEnabled);
        setLocalStream(stream);
      }

      const offer = await webRTCManager.callUser(userId);
      
      if (offer) {
        toast.info(`Connecting to ${characters.find(c => c.id === userId)?.name || userId}...`);
        
        setUsersNearby(prev => prev.map(user => 
          user.id === userId ? { ...user, isConnected: true } : user
        ));
      }
    } catch (error) {
      console.error('Error connecting to user:', error);
      toast.error('Failed to connect to user');
    }
  };
  
  const disconnectFromUser = (userId: string) => {
    webRTCManager.disconnectFromUser(userId);
  };
  
  const toggleChat = () => setIsChatOpen(prev => !prev);
  
  const toggleAudio = async () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    
    if (localStream) {
      webRTCManager.toggleAudio(newState);
    } else if (newState) {
      const stream = await webRTCManager.initLocalStream(true, isVideoEnabled);
      setLocalStream(stream);
    }
    
    toast.success(newState ? "Microphone activated" : "Microphone muted");
  };
  
  const toggleVideo = async () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    
    if (localStream) {
      webRTCManager.toggleVideo(newState);
    } else if (newState) {
      const stream = await webRTCManager.initLocalStream(isAudioEnabled, true);
      setLocalStream(stream);
    }
    
    setShowCameraPreview(newState);
    
    toast.success(newState ? "Camera turned on" : "Camera turned off");
  };
  
  const togglePhaser = () => {
    setUsePhaser(prev => !prev);
    toast.success(usePhaser ? "Switched to React renderer" : "Switched to Phaser renderer");
  };
  
  const handleObjectInteraction = (roomId: string, objectId: string) => {
    toast.info(`Interacting with object ${objectId} in room ${roomId}`);
  };
  
  const handleInteractiveObjectInteraction = (roomId: string, objectId: string) => {
    toast.info(`Interacting with interactive object ${objectId} in room ${roomId}`);
  };
  
  const closeCameraPreview = () => {
    setShowCameraPreview(false);
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
    localStream,
    usePhaser,
    connectionRequests,
    activeConnections,
    moveCharacter,
    sendMessage,
    toggleChat,
    toggleAudio,
    toggleVideo,
    togglePhaser,
    connectToUser,
    disconnectFromUser,
    handleObjectInteraction,
    handleInteractiveObjectInteraction,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    isConnectedToUser,
    showCameraPreview,
    closeCameraPreview,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
      
      {connectionRequests.map((request, index) => (
        <ConnectionRequest
          key={request.id}
          {...request}
          onAccept={acceptConnectionRequest}
          onReject={rejectConnectionRequest}
          style={{ top: `${20 + index * 120}px` }}
        />
      ))}
      
      {showCameraPreview && localStream && activeConnections.length === 0 && (
        <VideoCallView
          key="camera-preview"
          userId={currentUser.id}
          userName={currentUser.name}
          userColor={currentUser.color}
          stream={localStream}
          localStream={localStream}
          onClose={closeCameraPreview}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isPreview={true}
          style={{ bottom: '80px', right: '16px' }}
        />
      )}
      
      {activeConnections
        .filter(conn => conn.type === 'video' && conn.stream)
        .map((conn, index) => (
          <VideoCallView
            key={`video-${conn.userId}`}
            userId={conn.userId}
            userName={conn.userName}
            userColor={conn.userColor}
            stream={conn.stream!}
            localStream={localStream}
            onClose={() => disconnectFromUser(conn.userId)}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            style={{ bottom: `${80 + index * 300}px` }}
          />
        ))}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
