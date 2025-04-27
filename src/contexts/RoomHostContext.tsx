
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import crossBrowserSync, { SyncMessage } from '@/services/CrossBrowserSync';

// Types for room hosting
interface RoomHost {
  userId: string;
  roomId: string;
  sessionId: string;
}

interface RoomJoinRequest {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  roomId: string;
  timestamp: number;
}

interface ApprovedUser {
  userId: string;
  userName: string;
  roomId: string;
  timestamp: number;
}

interface RoomHostContextType {
  isHost: boolean;
  hostingRooms: RoomHost[];
  joinRequests: RoomJoinRequest[];
  approvedUsers: ApprovedUser[];
  becomeHost: (roomId: string) => boolean;
  releaseHost: (roomId: string) => void;
  requestToJoinRoom: (roomId: string, userName: string, userColor: string) => void;
  approveJoinRequest: (requestId: string) => void;
  rejectJoinRequest: (requestId: string) => void;
  isRoomHosted: (roomId: string) => boolean;
  hasUserJoinedRoom: (userId: string, roomId: string) => boolean;
  getHostIdForRoom: (roomId: string) => string | null;
}

// Create context
const RoomHostContext = createContext<RoomHostContextType | undefined>(undefined);

// Generate a unique session ID for this browser instance
const SESSION_ID = uuidv4();

// Local storage keys
const HOSTS_STORAGE_KEY = 'pixel_commons_room_hosts';
const REQUESTS_STORAGE_KEY = 'pixel_commons_join_requests';
const APPROVED_USERS_KEY = 'pixel_commons_approved_users';

export const RoomHostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hostingRooms, setHostingRooms] = useState<RoomHost[]>([]);
  const [joinRequests, setJoinRequests] = useState<RoomJoinRequest[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isSyncInitialized, setIsSyncInitialized] = useState(false);

  // Initialize cross-browser sync
  useEffect(() => {
    // Load initial data from localStorage
    const storedHosts = localStorage.getItem(HOSTS_STORAGE_KEY);
    if (storedHosts) {
      const hosts = JSON.parse(storedHosts);
      setHostingRooms(hosts);
      updateIsHostStatus(hosts);
    }

    const storedRequests = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (storedRequests) {
      setJoinRequests(JSON.parse(storedRequests));
    }

    const storedApprovals = localStorage.getItem(APPROVED_USERS_KEY);
    if (storedApprovals) {
      setApprovedUsers(JSON.parse(storedApprovals));
    }

    // Clean up expired requests and approvals (older than 24 hours)
    cleanupExpiredData();

    // Initialize cross-browser sync
    crossBrowserSync.start();
    setIsSyncInitialized(true);

    // Set up handlers for sync messages
    crossBrowserSync.on('hosts', (message: SyncMessage) => {
      if (message.data.action === 'update_hosts') {
        setHostingRooms(message.data.hosts);
        updateIsHostStatus(message.data.hosts);
      }
    });

    crossBrowserSync.on('requests', (message: SyncMessage) => {
      if (message.data.action === 'new_request') {
        setJoinRequests(prev => [...prev, message.data.request]);
      } else if (message.data.action === 'update_requests') {
        setJoinRequests(message.data.requests);
      }
    });

    crossBrowserSync.on('approvals', (message: SyncMessage) => {
      if (message.data.action === 'new_approval') {
        setApprovedUsers(prev => [...prev, message.data.user]);
      } else if (message.data.action === 'update_approvals') {
        setApprovedUsers(message.data.users);
      }
    });

    return () => {
      crossBrowserSync.stop();
    };
  }, []);

  // Update localStorage whenever hosts change
  useEffect(() => {
    if (isSyncInitialized) {
      localStorage.setItem(HOSTS_STORAGE_KEY, JSON.stringify(hostingRooms));
    }
  }, [hostingRooms, isSyncInitialized]);

  // Update localStorage whenever requests change
  useEffect(() => {
    if (isSyncInitialized) {
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(joinRequests));
    }
  }, [joinRequests, isSyncInitialized]);

  // Update localStorage whenever approved users change
  useEffect(() => {
    if (isSyncInitialized) {
      localStorage.setItem(APPROVED_USERS_KEY, JSON.stringify(approvedUsers));
    }
  }, [approvedUsers, isSyncInitialized]);

  // Check if current session is hosting any rooms
  const updateIsHostStatus = (hosts: RoomHost[]) => {
    const isCurrentSessionHost = hosts.some(host => host.sessionId === SESSION_ID);
    setIsHost(isCurrentSessionHost);
  };

  // Clean up expired data (older than 24 hours)
  const cleanupExpiredData = () => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    setJoinRequests(prev => 
      prev.filter(request => request.timestamp > oneDayAgo)
    );
    
    setApprovedUsers(prev => 
      prev.filter(user => user.timestamp > oneDayAgo)
    );
  };

  // Become host of a room
  const becomeHost = (roomId: string) => {
    // Check if room already has a host
    const existingHost = hostingRooms.find(host => host.roomId === roomId);
    if (existingHost) {
      toast.error(`Room ${roomId} already has a host`);
      return false;
    }

    const userId = `user-${SESSION_ID.substring(0, 8)}`;
    const newHost: RoomHost = {
      userId,
      roomId,
      sessionId: SESSION_ID
    };

    const updatedHosts = [...hostingRooms, newHost];
    setHostingRooms(updatedHosts);
    setIsHost(true);
    
    // Broadcast host change
    crossBrowserSync.sendMessage('hosts', {
      action: 'update_hosts',
      hosts: updatedHosts
    });

    toast.success(`You are now hosting room: ${roomId}`);
    return true;
  };

  // Release hosting of a room
  const releaseHost = (roomId: string) => {
    const updatedHosts = hostingRooms.filter(
      host => !(host.roomId === roomId && host.sessionId === SESSION_ID)
    );
    
    setHostingRooms(updatedHosts);
    updateIsHostStatus(updatedHosts);
    
    // Broadcast host change
    crossBrowserSync.sendMessage('hosts', {
      action: 'update_hosts',
      hosts: updatedHosts
    });

    toast.info(`You are no longer hosting room: ${roomId}`);
  };

  // Request to join a room
  const requestToJoinRoom = (roomId: string, userName: string, userColor: string) => {
    const userId = `user-${SESSION_ID.substring(0, 8)}`;
    
    // Check if room has a host
    if (!isRoomHosted(roomId)) {
      toast.error(`Room ${roomId} has no host to approve your request`);
      return;
    }

    // Check if already approved
    if (hasUserJoinedRoom(userId, roomId)) {
      toast.info(`You are already approved to join room ${roomId}`);
      return;
    }

    // Create join request
    const request: RoomJoinRequest = {
      id: uuidv4(),
      userId,
      userName,
      userColor,
      roomId,
      timestamp: Date.now()
    };

    const updatedRequests = [...joinRequests, request];
    setJoinRequests(updatedRequests);

    // Broadcast join request
    crossBrowserSync.sendMessage('requests', {
      action: 'new_request',
      request
    });

    toast.info(`Join request sent for room: ${roomId}`);
  };

  // Approve a join request
  const approveJoinRequest = (requestId: string) => {
    const request = joinRequests.find(req => req.id === requestId);
    if (!request) {
      toast.error('Request not found');
      return;
    }

    // Check if user is host of the room
    const isRoomHost = hostingRooms.some(
      host => host.roomId === request.roomId && host.sessionId === SESSION_ID
    );

    if (!isRoomHost) {
      toast.error('Only the host can approve join requests');
      return;
    }

    // Add to approved users
    const newApprovedUser: ApprovedUser = {
      userId: request.userId,
      userName: request.userName,
      roomId: request.roomId,
      timestamp: Date.now()
    };

    const updatedApproved = [...approvedUsers, newApprovedUser];
    setApprovedUsers(updatedApproved);

    // Remove from requests
    const updatedRequests = joinRequests.filter(req => req.id !== requestId);
    setJoinRequests(updatedRequests);

    // Broadcast changes
    crossBrowserSync.sendMessage('approvals', {
      action: 'new_approval',
      user: newApprovedUser
    });

    crossBrowserSync.sendMessage('requests', {
      action: 'update_requests',
      requests: updatedRequests
    });

    toast.success(`Approved ${request.userName} to join room ${request.roomId}`);
  };

  // Reject a join request
  const rejectJoinRequest = (requestId: string) => {
    const request = joinRequests.find(req => req.id === requestId);
    if (!request) {
      toast.error('Request not found');
      return;
    }

    // Check if user is host of the room
    const isRoomHost = hostingRooms.some(
      host => host.roomId === request.roomId && host.sessionId === SESSION_ID
    );

    if (!isRoomHost) {
      toast.error('Only the host can reject join requests');
      return;
    }

    // Remove from requests
    const updatedRequests = joinRequests.filter(req => req.id !== requestId);
    setJoinRequests(updatedRequests);

    // Broadcast changes
    crossBrowserSync.sendMessage('requests', {
      action: 'update_requests',
      requests: updatedRequests
    });

    toast.info(`Rejected ${request.userName}'s request to join room ${request.roomId}`);
  };

  // Check if a room has a host
  const isRoomHosted = (roomId: string) => {
    return hostingRooms.some(host => host.roomId === roomId);
  };

  // Check if a user has been approved to join a room
  const hasUserJoinedRoom = (userId: string, roomId: string) => {
    return approvedUsers.some(user => user.userId === userId && user.roomId === roomId);
  };

  // Get host ID for a room
  const getHostIdForRoom = (roomId: string): string | null => {
    const host = hostingRooms.find(h => h.roomId === roomId);
    return host ? host.userId : null;
  };

  const value = {
    isHost,
    hostingRooms,
    joinRequests,
    approvedUsers,
    becomeHost,
    releaseHost,
    requestToJoinRoom,
    approveJoinRequest,
    rejectJoinRequest,
    isRoomHosted,
    hasUserJoinedRoom,
    getHostIdForRoom
  };

  return (
    <RoomHostContext.Provider value={value}>
      {children}
    </RoomHostContext.Provider>
  );
};

export const useRoomHost = () => {
  const context = useContext(RoomHostContext);
  if (context === undefined) {
    throw new Error('useRoomHost must be used within a RoomHostProvider');
  }
  return context;
};
