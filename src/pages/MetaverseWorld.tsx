
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { RoomHostProvider } from '@/contexts/RoomHostContext';
import GameMap from '@/components/GameMap';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Users, LogOut, RefreshCcw } from 'lucide-react';

const GameWorld = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Check if user is authenticated
  useEffect(() => {
    const userData = localStorage.getItem('pixel_commons_user');
    if (!userData) {
      toast.error('Please enter the metaverse properly');
      navigate('/enter');
      return;
    }
    
    // Load user data from storage
    const parsedData = JSON.parse(userData);
    loadUserFromStorage(parsedData);
    
    // Show connection information toast
    toast.info(`Connected as ${parsedData.name} on ${parsedData.deviceType}`, {
      duration: 4000,
      position: 'top-center',
    });
    
    // Let others know we have connected
    const broadcastChannel = new BroadcastChannel('pixel_commons_channel');
    broadcastChannel.postMessage({
      type: 'USER_CONNECTED',
      user: parsedData
    });
    
    // Show loading message briefly
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Log debugging info
    console.log(`Initialized as user: ${parsedData.id}`, parsedData);
    
    // Handle user leaving
    const handleBeforeUnload = () => {
      broadcastChannel.postMessage({
        type: 'USER_DISCONNECTED',
        userId: parsedData.id
      });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      broadcastChannel.close();
    };
  }, [navigate, loadUserFromStorage]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-700 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Entering the metaverse...</h2>
          <p className="text-gray-500 mt-2">Loading your character</p>
        </div>
      </div>
    );
  }

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
          <p className="text-sm text-gray-600">A Cross-Browser Metaverse</p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('pixel_commons_user');
                navigate('/enter');
              }}
            >
              <LogOut className="h-4 w-4 mr-1" /> Exit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(window.location.origin + '/enter', '_blank')}
            >
              <RefreshCcw className="h-4 w-4 mr-1" /> Open New Instance
            </Button>
          </div>
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
        
        <div className="fixed top-20 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 transition-all">
          <div className="text-sm font-medium mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-purple-600" />
              Connected Users ({characters.length + 1}):
            </div>
            <div className="text-xs text-purple-600 font-medium">
              {characters.length > 0 ? 'Multi-user mode' : 'Waiting for users...'}
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2 border-b pb-1.5 border-gray-100">
              <div 
                className="w-4 h-4 rounded-full shadow-inner"
                style={{ backgroundColor: currentUser.color }}
              />
              <div className="flex flex-col">
                <span className="text-xs font-medium">{currentUser.name} <span className="text-gray-400">(You)</span></span>
                <span className="text-xs text-gray-500">
                  {currentUser.id.includes('mobile') ? 'Mobile' : 'Desktop'} User
                </span>
              </div>
            </div>
            
            {characters.length > 0 ? (
              characters.map(char => (
                <div key={char.id} className="flex items-center gap-2 mb-1.5">
                  <div 
                    className="w-4 h-4 rounded-full shadow-inner"
                    style={{ backgroundColor: char.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{char.name}</span>
                    <span className="text-xs text-gray-500">
                      {char.id.includes('mobile') ? 'Mobile' : 'Desktop'} User
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500 italic py-2">
                No other users yet. Open this in another browser or device.
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

const MetaverseWorld = () => {
  return (
    <RoomHostProvider>
      <GameProvider>
        <GameWorld />
      </GameProvider>
    </RoomHostProvider>
  );
};

export default MetaverseWorld;
