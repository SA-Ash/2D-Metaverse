
import React from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MessageSquare, Mic, Video, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Avatar from './Avatar';

interface ConnectionRequestProps {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  type: 'chat' | 'audio' | 'video';
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  className?: string;
  style?: React.CSSProperties; // Added style prop
}

const ConnectionRequest: React.FC<ConnectionRequestProps> = ({
  id,
  userId,
  userName,
  userColor,
  type,
  onAccept,
  onReject,
  className,
  style, // Added style prop
}) => {
  // Get appropriate icon based on connection type
  const getIcon = () => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'audio':
        return <Mic className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  // Get appropriate request message
  const getMessage = () => {
    switch (type) {
      case 'chat':
        return 'wants to chat with you';
      case 'audio':
        return 'wants to talk with you';
      case 'video':
        return 'wants to video call you';
      default:
        return 'wants to connect with you';
    }
  };
  
  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 transform -translate-x-1/2 z-50",
        "bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg",
        "w-72 p-4 animate-in slide-in-from-top-5 fade-in-50 duration-300",
        className
      )}
      style={style} // Added style prop
    >
      <div className="flex items-center gap-3">
        <Avatar name={userName} color={userColor} size="md" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{userName}</h4>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            {getIcon()} {getMessage()}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3 justify-end">
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
          onClick={() => onReject(id)}
        >
          <X className="mr-1 h-3 w-3" /> Decline
        </Button>
        <Button
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white"
          onClick={() => onAccept(id)}
        >
          <Check className="mr-1 h-3 w-3" /> Accept
        </Button>
      </div>
    </div>
  );
};

export default ConnectionRequest;
