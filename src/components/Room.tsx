
import React from 'react';
import { cn } from '@/lib/utils';
import WorldObject from './WorldObject';
import InteractiveObject from './InteractiveObject';
import RoomHostControls from './RoomHostControls';

export interface ObjectData {
  id: string;
  type: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  rotation?: number;
  color?: string;
  isInteractive?: boolean;
}

export interface InteractiveObjectData {
  id: string;
  type: 'chat' | 'meeting' | 'video' | 'audio' | 'speaker' | 'custom';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  label?: string;
  color?: string;
  isActive?: boolean;
}

interface RoomProps {
  id: string;
  name: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  backgroundColor?: string;
  objects?: ObjectData[];
  interactiveObjects?: InteractiveObjectData[];
  onObjectClick?: (objectId: string) => void;
  onInteractiveObjectClick?: (objectId: string) => void;
  className?: string;
}

const Room: React.FC<RoomProps> = ({
  id,
  name,
  position,
  width,
  height,
  backgroundColor = '#e6a75f',
  objects = [],
  interactiveObjects = [],
  onObjectClick,
  onInteractiveObjectClick,
  className,
}) => {
  return (
    <div
      className={cn('room relative', className)}
      style={{
        left: position.x,
        top: position.y,
        width,
        height,
        backgroundColor,
        position: 'absolute',
      }}
    >
      <div className="room-label">{name}</div>

      {/* Room Host Controls */}
      <RoomHostControls roomId={id} roomName={name} />

      {/* Render regular objects */}
      {objects.map((object) => (
        <WorldObject
          key={object.id}
          type={object.type}
          position={object.position}
          width={object.width}
          height={object.height}
          rotation={object.rotation}
          color={object.color}
          isInteractive={object.isInteractive}
          onClick={object.isInteractive ? () => onObjectClick?.(object.id) : undefined}
        />
      ))}

      {/* Render interactive objects */}
      {interactiveObjects.map((object) => (
        <InteractiveObject
          key={object.id}
          id={object.id}
          type={object.type}
          position={object.position}
          size={object.size}
          label={object.label}
          color={object.color}
          isActive={object.isActive}
          onClick={() => onInteractiveObjectClick?.(object.id)}
        />
      ))}
    </div>
  );
};

export default Room;
