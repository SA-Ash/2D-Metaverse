
import React from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import GameMap from '@/components/GameMap';
import PhaserGame from '@/components/PhaserGame';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';

const GameWorld = () => {
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
    usePhaser,
    moveCharacter,
    sendMessage,
    toggleChat,
    toggleAudio,
    toggleVideo,
    togglePhaser,
    handleObjectInteraction,
    handleInteractiveObjectInteraction,
  } = useGame();

  return (
    <div className="w-full h-full relative overflow-hidden">
      {usePhaser ? (
        <PhaserGame className="w-full h-full" />
      ) : (
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
      )}

      <ChatInterface
        usersNearby={usersNearby}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isChatOpen={isChatOpen}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onSendMessage={sendMessage}
      />
      
      <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3">
        <h1 className="text-xl font-bold mb-1">Pixel Commons</h1>
        <p className="text-sm text-gray-600">A 2D Metaverse Experience</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={togglePhaser} 
          className="mt-2"
        >
          {usePhaser ? "Switch to React" : "Switch to Phaser"}
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
  );
};

const Index = () => {
  return (
    <GameProvider>
      <GameWorld />
    </GameProvider>
  );
};

export default Index;
