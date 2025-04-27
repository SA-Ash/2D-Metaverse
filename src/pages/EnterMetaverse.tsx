
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LogIn, Laptop, Smartphone, Info, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const EnterMetaverse = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('#8B5CF6');
  const isMobile = useIsMobile();
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  
  useEffect(() => {
    // Clear previous user data when entering this page
    localStorage.removeItem('pixel_commons_user');
    
    // Try to get active users count through localStorage events
    const broadcastChannel = new BroadcastChannel('pixel_commons_channel');
    
    // Request active user count
    broadcastChannel.postMessage({
      type: 'REQUEST_USER_COUNT'
    });
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'USER_COUNT_RESPONSE') {
        setActiveUsers(event.data.count);
      }
    };
    
    broadcastChannel.addEventListener('message', handleMessage);
    
    return () => {
      broadcastChannel.removeEventListener('message', handleMessage);
      broadcastChannel.close();
    };
  }, []);
  
  const handleEnterMetaverse = () => {
    if (!userName.trim()) {
      toast.error('Please enter a name');
      return;
    }
    
    // Generate a unique ID that includes device type AND browser session identifier
    const deviceType = isMobile ? 'mobile' : 'laptop';
    const sessionId = Math.random().toString(36).substring(2, 8); 
    const uniqueId = uuidv4().substring(0, 8);
    const userData = {
      id: `${deviceType}-${sessionId}-${uniqueId}`,
      name: userName,
      color: userColor,
      deviceType,
      timestamp: Date.now()
    };
    
    // Store user data in localStorage
    localStorage.setItem('pixel_commons_user', JSON.stringify(userData));
    
    // Notify other tabs/windows about the new user
    const broadcastChannel = new BroadcastChannel('pixel_commons_channel');
    broadcastChannel.postMessage({
      type: 'NEW_USER',
      user: userData
    });
    broadcastChannel.close();
    
    toast.success('Entering the metaverse...');
    navigate('/world');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl backdrop-blur-sm bg-white/90 border border-gray-200">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center">
            {isMobile ? (
              <Smartphone className="w-8 h-8 text-purple-600" />
            ) : (
              <Laptop className="w-8 h-8 text-purple-600" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold">Pixel Commons</CardTitle>
          <CardDescription className="text-lg">
            A Cross-Browser Metaverse Experience
            <div className="text-sm mt-1 text-purple-600 font-medium">
              Joining from {isMobile ? 'Mobile Device' : 'Desktop'}
            </div>
            
            {activeUsers !== null && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-sm">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">{activeUsers} active user{activeUsers !== 1 ? 's' : ''}</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg">Choose Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="h-12 text-lg"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color" className="text-lg">Choose Your Color</Label>
            <div className="flex items-center gap-4">
              <Input
                id="color"
                type="color"
                value={userColor}
                onChange={(e) => setUserColor(e.target.value)}
                className="w-24 h-12 p-1"
              />
              <div 
                className="w-12 h-12 rounded-full border-4 border-white shadow-md" 
                style={{ backgroundColor: userColor }}
              />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex gap-3">
            <Info className="text-blue-500 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Enhanced Cross-device Interaction!</p>
              <p>Open this app on multiple devices or browser tabs (including incognito) to see users interact in the same metaverse in real-time.</p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3 p-6">
          <Button
            className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={handleEnterMetaverse}
          >
            <LogIn className="mr-2 h-6 w-6" /> Enter Metaverse
          </Button>
          <p className="text-center text-xs text-gray-500">Each browser instance will create a unique character</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EnterMetaverse;
