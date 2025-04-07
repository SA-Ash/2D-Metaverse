
import React from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { RoomHostProvider, useRoomHost } from '@/contexts/RoomHostContext';
import GameMap from '@/components/GameMap';
import PhaserGame from '@/components/PhaserGame';
import ChatInterface from '@/components/ChatInterface';
import JoinRequest from '@/components/JoinRequest';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';

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
    localStream,
    usePhaser,
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
  } = useGame();

  const {
    joinRequests,
    approveJoinRequest,
    rejectJoinRequest,
  } = useRoomHost();

  // Find room names for join requests
  const getRequestsWithRoomNames = () => {
    return joinRequests.map(request => {
      const room = rooms.find(r => r.id === request.roomId);
      return {
        ...request,
        roomName: room?.name || 'Unknown Room'
      };
    });
  };

  const requestsWithRoomNames = getRequestsWithRoomNames();

  return (
    <TooltipProvider>
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

        {/* Display join requests */}
        {requestsWithRoomNames.map((request, index) => (
          <JoinRequest
            key={request.id}
            id={request.id}
            userId={request.userId}
            userName={request.userName}
            userColor={request.userColor}
            roomId={request.roomId}
            roomName={request.roomName}
            onApprove={approveJoinRequest}
            onReject={rejectJoinRequest}
            style={{ top: `${100 + index * 120}px` }}
          />
        ))}
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
