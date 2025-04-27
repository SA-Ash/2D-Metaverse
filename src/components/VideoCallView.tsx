
import React, { useEffect, useRef } from 'react';
import { X, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoCallViewProps {
  userId: string;
  userName: string;
  userColor: string;
  stream: MediaStream;
  localStream: MediaStream | null;
  onClose: () => void;
  onToggleAudio?: () => void;
  onToggleVideo?: () => void;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  isPreview?: boolean; // Added isPreview prop
}

const VideoCallView: React.FC<VideoCallViewProps> = ({
  userId,
  userName,
  userColor,
  stream,
  localStream,
  onClose,
  onToggleAudio,
  onToggleVideo,
  isAudioEnabled = true,
  isVideoEnabled = true,
  className,
  style,
  isPreview = false, // Default to false for backward compatibility
}) => {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Set streams to video elements
  useEffect(() => {
    if (stream && remoteVideoRef.current && !isPreview) {
      remoteVideoRef.current.srcObject = stream;
    }
    
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
      
      // If this is a preview, also set the local stream as the main stream
      if (isPreview && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = localStream;
      }
    }
  }, [stream, localStream, isPreview]);

  return (
    <div className={cn(
      "fixed bottom-16 right-4 z-50 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl border border-gray-700",
      "w-80 flex flex-col",
      className
    )}
    style={style}
    >
      <div className="p-2 flex justify-between items-center bg-gray-800">
        <h3 className="text-sm font-medium text-white">
          {isPreview ? "Camera Preview" : `Call with ${userName}`}
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-gray-300 hover:text-white hover:bg-gray-700" 
          onClick={onClose}
        >
          <X size={14} />
        </Button>
      </div>
      
      {/* Main video - remote stream or local preview */}
      <div className="relative w-full aspect-video bg-gray-900">
        <video 
          ref={remoteVideoRef}
          autoPlay 
          playsInline
          muted={isPreview} // Mute if it's a preview to prevent feedback
          className="w-full h-full object-cover"
        />
        {!isPreview && (
          <div 
            className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-xs text-white bg-black/50"
            style={{ backgroundColor: `${userColor}80` }}
          >
            {userName}
          </div>
        )}
      </div>
      
      {/* Local video picture-in-picture (only show in call mode, not preview) */}
      {localStream && !isPreview && (
        <div className="absolute bottom-2 right-2 w-20 aspect-video bg-gray-800 rounded overflow-hidden shadow-md border border-gray-700">
          <video 
            ref={localVideoRef}
            autoPlay 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Call controls */}
      <div className="p-2 flex justify-center gap-2 bg-gray-800">
        {onToggleAudio && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-8 h-8 rounded-full",
              !isAudioEnabled && "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500"
            )}
            onClick={onToggleAudio}
          >
            {isAudioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
          </Button>
        )}
        
        {onToggleVideo && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-8 h-8 rounded-full",
              !isVideoEnabled && "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-500"
            )}
            onClick={onToggleVideo}
          >
            {isVideoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
          onClick={onClose}
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
};

export default VideoCallView;
