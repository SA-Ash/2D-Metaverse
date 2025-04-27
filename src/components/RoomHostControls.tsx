
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  LogOut, 
  Crown,
  LogIn,
  User
} from 'lucide-react';
import { useRoomHost } from '@/contexts/RoomHostContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
  const [isHostingThisRoom, setIsHostingThisRoom] = useState<boolean>(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [userName, setUserName] = useState('');
  
  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('pixel_commons_user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserName(parsedData.name || '');
    }
  }, []);
  
  // Check if this user is hosting this specific room
  const hasHost = isRoomHosted(roomId);
  const userHasJoined = hasUserJoinedRoom(userName, roomId);

  // Handle becoming a host
  const handleBecomeHost = () => {
    const success = becomeHost(roomId);
    if (success) {
      setIsHostingThisRoom(true);
    }
  };

  // Handle releasing host role
  const handleReleaseHost = () => {
    releaseHost(roomId);
    setIsHostingThisRoom(false);
  };

  // Handle joining a room
  const handleJoinRoom = () => {
    const userData = localStorage.getItem('pixel_commons_user');
    if (!userData) {
      toast.error('Please enter the metaverse first');
      return;
    }
    
    const parsedData = JSON.parse(userData);
    const userColor = parsedData.color || '#8B5CF6';
    
    requestToJoinRoom(roomId, userName || parsedData.name, userColor);
    setJoinDialogOpen(false);
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
        userHasJoined ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Member
          </Badge>
        ) : (
          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs px-2 py-1 h-auto"
              >
                <Shield className="h-3 w-3 mr-1" /> Request to Join
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Request: {roomName}</DialogTitle>
                <DialogDescription>
                  Submit a request to join this room. The room host will need to approve your request.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="join-name">Your Name</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50">
                      <User className="h-4 w-4 text-gray-500" />
                    </span>
                    <Input
                      id="join-name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setJoinDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleJoinRoom}>
                  <LogIn className="h-4 w-4 mr-1" /> Send Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
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
