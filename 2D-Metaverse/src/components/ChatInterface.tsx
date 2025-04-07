import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MessageSquare, Mic, Video, X, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Avatar from './Avatar';
import { 
  TooltipProvider,
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface UserNearby {
  id: string;
  name: string;
  color: string;
  distance: number; // 0-100, where 0 is closest
  isConnected?: boolean;
}

interface ChatInterfaceProps {
  usersNearby: UserNearby[];
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isChatOpen: boolean;
  localStream: MediaStream | null;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onSendMessage: (message: string) => void;
  onConnectToUser: (userId: string) => void;
  onDisconnectFromUser: (userId: string) => void;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  usersNearby,
  isAudioEnabled,
  isVideoEnabled,
  isChatOpen,
  localStream,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onSendMessage,
  onConnectToUser,
  onDisconnectFromUser,
  className,
}) => {
  const [message, setMessage] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  
  // Set local stream to video element when available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn("fixed bottom-4 left-4 z-50 flex flex-col items-start", className)}>
      <div className="mb-2 flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isVideoEnabled ? "default" : "outline"}
                size="icon"
                className={cn(
                  "w-10 h-10 rounded-full shadow-md bg-white/90 backdrop-blur-sm",
                  isVideoEnabled && "bg-green-500 text-white hover:bg-green-600"
                )}
                onClick={onToggleVideo}
              >
                <Video size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isVideoEnabled ? "Turn off video" : "Turn on video"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isAudioEnabled ? "default" : "outline"}
                size="icon"
                className={cn(
                  "w-10 h-10 rounded-full shadow-md bg-white/90 backdrop-blur-sm",
                  isAudioEnabled && "bg-green-500 text-white hover:bg-green-600"
                )}
                onClick={onToggleAudio}
              >
                <Mic size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isChatOpen ? "default" : "outline"}
                size="icon"
                className={cn(
                  "w-10 h-10 rounded-full shadow-md bg-white/90 backdrop-blur-sm",
                  isChatOpen && "bg-blue-500 text-white hover:bg-blue-600"
                )}
                onClick={onToggleChat}
              >
                <MessageSquare size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isChatOpen ? "Close chat" : "Open chat"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {isChatOpen && (
        <div className="w-80 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-sm">Nearby ({usersNearby.length})</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={onToggleChat}
            >
              <X size={14} />
            </Button>
          </div>
          
          {/* Local video preview */}
          {isVideoEnabled && localStream && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative rounded-md overflow-hidden bg-gray-100 w-full aspect-video">
                <video 
                  ref={localVideoRef}
                  autoPlay 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
                  You
                </div>
              </div>
            </div>
          )}
          
          <div className="max-h-40 overflow-y-auto p-2">
            {usersNearby.length > 0 ? (
              <div className="flex flex-col gap-2">
                {usersNearby.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Avatar name={user.name} color={user.color} size="sm" />
                    <span className="text-sm font-medium truncate flex-1">{user.name}</span>
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: `rgba(74, 222, 128, ${1 - user.distance / 100})` 
                      }}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => user.isConnected ? 
                              onDisconnectFromUser(user.id) : 
                              onConnectToUser(user.id)
                            }
                          >
                            {user.isConnected ? 
                              <PhoneOff size={14} className="text-red-500" /> : 
                              <Phone size={14} className="text-green-500" />
                            }
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {user.isConnected ? "Disconnect call" : "Connect call"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 py-4">
                No one nearby
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                size="sm" 
                className="px-3" 
                onClick={handleSendMessage}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
