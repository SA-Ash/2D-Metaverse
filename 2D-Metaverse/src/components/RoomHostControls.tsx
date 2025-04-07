
import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  LogOut, 
  Crown
} from 'lucide-react';
import { useRoomHost } from '@/contexts/RoomHostContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface RoomHostControlsProps {
  roomId: string;
  roomName: string;
}

const RoomHostControls: React.FC<RoomHostControlsProps> = ({ roomId, roomName }) => {
  const { 
    isHost, 
    becomeHost, 
    releaseHost, 
    isRoomHosted, 
    requestToJoinRoom,
    hasUserJoinedRoom
  } = useRoomHost();
  const [isHosting, setIsHosting] = useState<boolean>(false);

  // Check if this user is hosting this specific room
  const isHostingThisRoom = isHost && isHosting;
  
  // Check if room has any host
  const hasHost = isRoomHosted(roomId);

  // Handle becoming a host
  const handleBecomeHost = () => {
    const success = becomeHost(roomId);
    if (success) {
      setIsHosting(true);
    }
  };

  // Handle releasing host role
  const handleReleaseHost = () => {
    releaseHost(roomId);
    setIsHosting(false);
  };

  // Handle joining a room
  const handleJoinRoom = () => {
    const randomNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey'];
    const userName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    requestToJoinRoom(roomId, userName, randomColor);
  };

  return (
    <div className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-2 flex flex-col gap-2">
      {isHostingThisRoom ? (
        <>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <Crown className="h-3 w-3" /> Host
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-auto">
                <Users className="h-3 w-3 mr-1" /> Manage Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Managing Room: {roomName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  You are currently hosting this room. Players need your approval to join.
                </p>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleReleaseHost}
                  className="w-full mt-4"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Stop Hosting
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : hasHost ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs px-2 py-1 h-auto"
          onClick={handleJoinRoom}
        >
          <Shield className="h-3 w-3 mr-1" /> Request to Join
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs px-2 py-1 h-auto bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          onClick={handleBecomeHost}
        >
          <Crown className="h-3 w-3 mr-1" /> Become Host
        </Button>
      )}
    </div>
  );
};

export default RoomHostControls;
