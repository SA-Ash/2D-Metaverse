
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Avatar from './Avatar';
import { 
  TooltipProvider,
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

interface JoinRequestProps {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  roomId: string;
  roomName: string;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const JoinRequest: React.FC<JoinRequestProps> = ({
  id,
  userId,
  userName,
  userColor,
  roomId,
  roomName,
  onApprove,
  onReject,
  className,
  style,
}) => {
  // Create handler functions to prevent event propagation
  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReject(id);
  };

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApprove(id);
  };

  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-50",
        "bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg",
        "w-72 p-4 animate-in slide-in-from-right-5 fade-in-50 duration-300",
        className
      )}
      style={style}
    >
      <div className="flex items-center gap-3">
        <Avatar name={userName} color={userColor} size="md" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">{userName}</h4>
          <p className="text-xs text-gray-500">
            wants to join room <span className="font-medium">{roomName}</span>
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3 justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
                onClick={handleReject}
              >
                <X className="mr-1 h-3 w-3" /> Decline
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reject request</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleApprove}
              >
                <Check className="mr-1 h-3 w-3" /> Accept
              </Button>
            </TooltipTrigger>
            <TooltipContent>Approve request</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default JoinRequest;
