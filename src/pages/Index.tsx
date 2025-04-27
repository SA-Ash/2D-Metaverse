
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { RoomHostProvider } from '@/contexts/RoomHostContext';
import GameMap from '@/components/GameMap';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';

const GameWorld = () => {
  const navigate = useNavigate();
  
  const {
    currentUser,
    characters,
    rooms,
    mapWidth,
    mapHeight,
    usersNearby,
    isChatOpen,
    isAudioEnabled,
    isVideoEnabled,
    localStream,
    moveCharacter,
    sendMessage,
    toggleChat,
    toggleAudio,
    toggleVideo,
    connectToUser,
    disconnectFromUser,
    handleObjectInteraction,
    handleInteractiveObjectInteraction,
    loadUserFromStorage,
  } = useGame();

  // Auto-initialize a user if not already done
  useEffect(() => {
    const userData = localStorage.getItem('pixel_commons_user');
    if (!userData) {
      const newUser = {
        id: `user-${Math.random().toString(36).substr(2, 8)}`,
        name: `Guest-${Math.floor(Math.random() * 1000)}`,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        position: { x: Math.floor(Math.random() * 500) + 100, y: Math.floor(Math.random() * 500) + 100 },
        timestamp: Date.now(),
      };
      loadUserFromStorage(newUser);
      localStorage.setItem('pixel_commons_user', JSON.stringify(newUser));
      toast.info('Welcome to Pixel Commons! You\'ve been assigned a random identity.');
    } else {
      loadUserFromStorage(JSON.parse(userData));
    }
  }, [loadUserFromStorage]);

  return (
    <TooltipProvider>
      <div className="w-full h-full relative overflow-hidden">
        <GameMap
          mapWidth={mapWidth}
          mapHeight={mapHeight}
          rooms={rooms}
          characters={[currentUser, ...characters]}
          currentUser={{
            id: currentUser.id,
            position: currentUser.position,
            direction: currentUser.direction,
            isMoving: currentUser.isMoving,
          }}
          onMoveCharacter={moveCharacter}
          onObjectClick={handleObjectInteraction}
          onInteractiveObjectClick={handleInteractiveObjectInteraction}
        />

        <ChatInterface
          usersNearby={usersNearby}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isChatOpen={isChatOpen}
          localStream={localStream}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onToggleChat={toggleChat}
          onSendMessage={sendMessage}
          onConnectToUser={connectToUser}
          onDisconnectFromUser={disconnectFromUser}
        />
        
        <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
          <h1 className="text-xl font-bold mb-1">Pixel Commons</h1>
          <p className="text-sm text-gray-600">A 2D Metaverse Experience</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/enter')}
            className="mt-2"
          >
            Change Avatar
          </Button>
        </div>
        
        <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="text-sm font-medium mb-1">Controls:</div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>WASD or Arrow Keys: Move</li>
            <li>Click: Move to location</li>
            <li>Scroll: Zoom in/out</li>
            <li>Drag: Pan the map</li>
          </ul>
        </div>
      </div>
    </TooltipProvider>
  );
};

const Index = () => {
  return (
    <RoomHostProvider>
      <GameProvider>
        <GameWorld />
      </GameProvider>
    </RoomHostProvider>
  );
};

export default Index;
