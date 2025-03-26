
import { toast } from 'sonner';

interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  userId: string;
  connectionType: 'chat' | 'audio' | 'video';
}

class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];
  private onUserConnectedCallback?: (userId: string, connectionType: 'chat' | 'audio' | 'video', stream?: MediaStream) => void;
  private onUserDisconnectedCallback?: (userId: string) => void;
  private onMessageReceivedCallback?: (userId: string, message: any) => void;
  private onStreamReceivedCallback?: (userId: string, stream: MediaStream) => void;

  constructor() {
    this.setupConnectionCallbacks = this.setupConnectionCallbacks.bind(this);
  }

  // Initialize local media stream
  async initLocalStream(audioEnabled: boolean, videoEnabled: boolean): Promise<MediaStream | null> {
    try {
      if (this.localStream) {
        this.stopLocalStream();
      }

      const constraints: MediaStreamConstraints = {
        audio: audioEnabled,
        video: videoEnabled,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access camera/microphone');
      return null;
    }
  }

  // Stop local media stream
  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  // Toggle audio track
  toggleAudio(enabled: boolean): boolean {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = enabled;
      return enabled;
    }
    return false;
  }

  // Toggle video track
  toggleVideo(enabled: boolean): boolean {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = enabled;
      return enabled;
    }
    return false;
  }

  // Create a new peer connection for a user
  createPeerConnection(userId: string, connectionType: 'chat' | 'audio' | 'video' = 'chat'): RTCPeerConnection | null {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers,
      });

      // Add local stream tracks to the connection if this is an audio/video call
      if (this.localStream && (connectionType === 'audio' || connectionType === 'video')) {
        this.localStream.getTracks().forEach(track => {
          this.localStream && peerConnection.addTrack(track, this.localStream);
        });
      }

      // Create data channel for messaging
      const dataChannel = peerConnection.createDataChannel('chat');
      
      this.peerConnections.set(userId, { 
        connection: peerConnection, 
        dataChannel,
        userId,
        connectionType
      });
      
      this.setupConnectionCallbacks(peerConnection, userId, connectionType);
      
      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  }

  // Handle incoming call
  async handleIncomingCall(userId: string, offer: RTCSessionDescriptionInit, connectionType: 'chat' | 'audio' | 'video' = 'chat'): Promise<RTCSessionDescriptionInit | null> {
    try {
      // Create peer connection if it doesn't exist
      let peerConnection = this.peerConnections.get(userId)?.connection;
      
      if (!peerConnection) {
        peerConnection = this.createPeerConnection(userId, connectionType);
        if (!peerConnection) return null;
      }

      // Set remote description (the offer)
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      return answer;
    } catch (error) {
      console.error('Error handling incoming call:', error);
      return null;
    }
  }

  // Initiate a call to another user
  async callUser(userId: string, connectionType: 'chat' | 'audio' | 'video' = 'chat'): Promise<RTCSessionDescriptionInit | null> {
    try {
      let peerConnection = this.peerConnections.get(userId)?.connection;
      
      if (!peerConnection) {
        peerConnection = this.createPeerConnection(userId, connectionType);
        if (!peerConnection) return null;
      }

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      return offer;
    } catch (error) {
      console.error('Error initiating call:', error);
      return null;
    }
  }

  // Handle answer from remote user
  async handleCallAccepted(userId: string, answer: RTCSessionDescriptionInit): Promise<boolean> {
    try {
      const peerConnection = this.peerConnections.get(userId)?.connection;
      
      if (!peerConnection) {
        console.error('No peer connection exists for this user');
        return false;
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      return true;
    } catch (error) {
      console.error('Error handling call acceptance:', error);
      return false;
    }
  }

  // Add ICE candidate received from peer
  async addIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<boolean> {
    try {
      const peerConnection = this.peerConnections.get(userId)?.connection;
      
      if (!peerConnection) {
        console.error('No peer connection exists for this user');
        return false;
      }

      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      return true;
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      return false;
    }
  }

  // Send message through data channel
  sendMessage(userId: string, message: any): boolean {
    try {
      const peer = this.peerConnections.get(userId);
      
      if (!peer || !peer.dataChannel) {
        console.error('No data channel exists for this user');
        return false;
      }

      // Only send if data channel is open
      if (peer.dataChannel.readyState === 'open') {
        peer.dataChannel.send(JSON.stringify(message));
        return true;
      } else {
        console.warn('Data channel not open yet');
        return false;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Disconnect from a specific user
  disconnectFromUser(userId: string): void {
    const peer = this.peerConnections.get(userId);
    
    if (peer) {
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
      peer.connection.close();
      this.peerConnections.delete(userId);
      
      this.onUserDisconnectedCallback?.(userId);
    }
  }

  // Disconnect from all users
  disconnectFromAll(): void {
    this.peerConnections.forEach((peer) => {
      if (peer.dataChannel) {
        peer.dataChannel.close();
      }
      peer.connection.close();
    });
    
    this.peerConnections.clear();
  }

  // Set callback for when a user connects
  onUserConnected(callback: (userId: string, connectionType: 'chat' | 'audio' | 'video', stream?: MediaStream) => void): void {
    this.onUserConnectedCallback = callback;
  }

  // Set callback for when a user disconnects
  onUserDisconnected(callback: (userId: string) => void): void {
    this.onUserDisconnectedCallback = callback;
  }

  // Set callback for receiving messages
  onMessageReceived(callback: (userId: string, message: any) => void): void {
    this.onMessageReceivedCallback = callback;
  }
  
  // Set callback for when a stream is received
  onStreamReceived(callback: (userId: string, stream: MediaStream) => void): void {
    this.onStreamReceivedCallback = callback;
  }

  // Setup callbacks for a peer connection
  private setupConnectionCallbacks(peerConnection: RTCPeerConnection, userId: string, connectionType: 'chat' | 'audio' | 'video'): void {
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // This would be sent to the remote peer through your signaling server
        console.log('ICE candidate generated:', event.candidate);
        // You would implement signaling here, e.g.:
        // this.signalingService.sendIceCandidate(userId, event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      switch (peerConnection.connectionState) {
        case 'connected':
          console.log(`Connected to peer: ${userId}`);
          
          // For a video/audio call, we need to pass the stream
          if (connectionType === 'audio' || connectionType === 'video') {
            // Find remote streams
            const remoteStreams = peerConnection.getReceivers()
              .filter(receiver => receiver.track.kind === 'video' || receiver.track.kind === 'audio')
              .map(receiver => receiver.track);
            
            // Create a new stream from remote tracks
            if (remoteStreams.length > 0) {
              const stream = new MediaStream(remoteStreams);
              this.onUserConnectedCallback?.(userId, connectionType, stream);
            } else {
              this.onUserConnectedCallback?.(userId, connectionType);
            }
          } else {
            this.onUserConnectedCallback?.(userId, connectionType);
          }
          break;
        case 'disconnected':
        case 'failed':
        case 'closed':
          console.log(`Disconnected from peer: ${userId}`);
          this.peerConnections.delete(userId);
          this.onUserDisconnectedCallback?.(userId);
          break;
      }
    };

    // Handle incoming data channels
    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;
      const peer = this.peerConnections.get(userId);
      
      if (peer) {
        peer.dataChannel = dataChannel;
        
        dataChannel.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.onMessageReceivedCallback?.(userId, message);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Remote track received:', event.streams[0]);
      
      // Create a MediaStream from the received tracks
      if (event.streams && event.streams[0]) {
        this.onStreamReceivedCallback?.(userId, event.streams[0]);
      }
    };
  }
}

// Export singleton instance
export const webRTCManager = new WebRTCManager();
