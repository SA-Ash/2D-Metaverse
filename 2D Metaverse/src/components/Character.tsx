
import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { cn } from '@/lib/utils';

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
};

export default Character;
