
import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { cn } from '@/lib/utils';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mic, Video, X } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';

interface CharacterProps {
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

const Character: React.FC<CharacterProps> = ({
  id,
  name,
  color,
  position,
  isMoving,
  direction,
  isSpeaking = false,
  message = '',
  isCurrentUser = false,
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const { sendConnectionRequest, isConnectedToUser } = useGame();
  
  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getAnimationClass = () => {
    if (isMoving) return 'animate-character-walk';
    return 'animate-character-idle';
  };

  const getFlipClass = () => {
    if (direction === 'left') return 'scale-x-[-1]';
    return '';
  };

  // Don't show interaction options for the current user
  if (isCurrentUser) {
    return (
      <div 
        className="absolute character-container z-10"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          transition: 'left 0.2s ease, top 0.2s ease',
        }}
      >
        {showMessage && (
          <div className="chat-bubble">
            {message}
          </div>
        )}
        
        <div className={cn("character", getAnimationClass(), getFlipClass())}>
          {isCurrentUser && (
            <div className={cn(
              "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-metaverse-highlight rounded-full",
              "animate-pulse-subtle"
            )} />
          )}
          
          <div className="character-shadow" />
          
          <div className="name-tag">
            {name}
            {isSpeaking && (
              <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle"></span>
            )}
          </div>
          
          <Avatar 
            name={name} 
            color={color} 
            size="md" 
            className={cn(
              "border-2",
              isCurrentUser ? "border-metaverse-highlight" : "border-white"
            )}
          />

          {isSpeaking && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-2 border-green-500/30 animate-pulse-subtle" />
          )}
        </div>
      </div>
    );
  }
  
  // For other characters, show interaction options on hover
  return (
    <div 
      className="absolute character-container z-10"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transition: 'left 0.2s ease, top 0.2s ease',
      }}
    >
      {showMessage && (
        <div className="chat-bubble">
          {message}
        </div>
      )}
      
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div className={cn(
            "character cursor-pointer", 
            getAnimationClass(), 
            getFlipClass()
          )}>
            <div className="character-shadow" />
            
            <div className="name-tag">
              {name}
              {isSpeaking && (
                <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle"></span>
              )}
            </div>
            
            <Avatar 
              name={name} 
              color={color} 
              size="md" 
              className="border-2 border-white"
            />

            {isSpeaking && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-2 border-green-500/30 animate-pulse-subtle" />
            )}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-56 p-2 rounded-xl" align="center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2">
              <Avatar name={name} color={color} size="sm" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-gray-500">Click to interact</span>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="w-10 h-10 p-0 rounded-full"
                onClick={() => sendConnectionRequest(id, 'chat')}
                disabled={isConnectedToUser(id)}
              >
                <MessageSquare size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-10 h-10 p-0 rounded-full"
                onClick={() => sendConnectionRequest(id, 'audio')}
                disabled={isConnectedToUser(id)}
              >
                <Mic size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="w-10 h-10 p-0 rounded-full"
                onClick={() => sendConnectionRequest(id, 'video')}
                disabled={isConnectedToUser(id)}
              >
                <Video size={16} />
              </Button>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default Character;
