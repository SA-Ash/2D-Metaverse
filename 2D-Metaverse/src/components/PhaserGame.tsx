
import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { useGame } from '@/contexts/GameContext';
import { useRoomHost } from '@/contexts/RoomHostContext';

interface PhaserGameProps {
  className?: string;
}

const PhaserGame: React.FC<PhaserGameProps> = ({ className }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const { 
    currentUser, 
    characters, 
    rooms, 
    mapWidth, 
    mapHeight,
    moveCharacter
  } = useGame();
  
  const {
    isRoomHosted,
    becomeHost,
    requestToJoinRoom
  } = useRoomHost();
  
  useEffect(() => {
    if (!gameRef.current) return;

    // Configuration for Phaser
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: '100%',
      height: '100%',
      backgroundColor: '#ababab',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    // Initialize Phaser game
    const game = new Phaser.Game(config);
    let playerSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let roomSprites: Phaser.GameObjects.Rectangle[] = [];
    let characterSprites: {[key: string]: Phaser.GameObjects.Arc} = {};
    let floorLayer: Phaser.GameObjects.Rectangle;
    let roomHostIndicators: {[key: string]: Phaser.GameObjects.Container} = {};

    // Preload assets
    function preload(this: Phaser.Scene) {
      // You can preload sprites, tilesets, etc. here
    }

    // Create game objects
    function create(this: Phaser.Scene) {
      // Create the floor/background
      floorLayer = this.add.rectangle(0, 0, mapWidth, mapHeight, 0xababab);
      floorLayer.setOrigin(0, 0);
      
      // Create rooms
      rooms.forEach(room => {
        const roomSprite = this.add.rectangle(
          room.position.x, 
          room.position.y, 
          room.width, 
          room.height, 
          Phaser.Display.Color.HexStringToColor(room.backgroundColor || '#e6a75f').color
        );
        roomSprite.setOrigin(0, 0);
        roomSprite.setInteractive();
        roomSprite.setData('id', room.id);
        roomSprite.setData('type', 'room');
        roomSprites.push(roomSprite);
        
        // Add room label
        this.add.text(
          room.position.x + 10, 
          room.position.y + 10, 
          room.name, 
          { 
            color: '#000000',
            fontSize: '12px'
          }
        );
        
        // Create room host indicator
        const hostButton = createHostButton(this, room);
        roomHostIndicators[room.id] = hostButton;
        
        // Add room objects (simplified for now)
        room.objects.forEach(obj => {
          const objectColor = obj.color ? 
            Phaser.Display.Color.HexStringToColor(obj.color).color : 
            getDefaultColorForObjectType(obj.type);
            
          const objectSprite = this.add.rectangle(
            room.position.x + obj.position.x,
            room.position.y + obj.position.y,
            obj.width,
            obj.height,
            objectColor
          );
          
          if (obj.rotation) {
            objectSprite.setAngle(obj.rotation);
          }
          
          objectSprite.setOrigin(0, 0);
          if (obj.isInteractive) {
            objectSprite.setInteractive();
            objectSprite.setData('id', obj.id);
            objectSprite.setData('roomId', room.id);
            objectSprite.setData('type', 'object');
          }
        });
      });
      
      // Create player
      playerSprite = this.physics.add.sprite(
        currentUser.position.x, 
        currentUser.position.y, 
        'player'
      );
      
      // Since we haven't loaded an actual sprite, let's use a circle for now
      playerSprite.setVisible(false);
      const playerCircle = this.add.circle(
        currentUser.position.x,
        currentUser.position.y,
        20,
        Phaser.Display.Color.HexStringToColor(currentUser.color).color
      );
      playerSprite.setData('visual', playerCircle);
      
      // Create other characters
      characters.forEach(char => {
        const charCircle = this.add.circle(
          char.position.x,
          char.position.y,
          20,
          Phaser.Display.Color.HexStringToColor(char.color).color
        );
        characterSprites[char.id] = charCircle;
      });
      
      // Set up camera to follow player
      this.cameras.main.startFollow(playerSprite);
      this.cameras.main.setZoom(1);
      
      // Set up input
      cursors = this.input.keyboard.createCursorKeys();
      
      // Handle clicks for movement
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        // Convert screen coordinates to world coordinates
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        moveCharacter({ x: worldPoint.x, y: worldPoint.y });
      });
      
      // Handle object interactions
      this.input.on('gameobjectdown', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
        if (gameObject.getData('type') === 'object') {
          console.log(`Clicked on object ${gameObject.getData('id')} in room ${gameObject.getData('roomId')}`);
          // You can add your object interaction logic here
        }
      });
    }

    // Create host button for room
    function createHostButton(scene: Phaser.Scene, room: any) {
      const x = room.position.x + room.width - 40;
      const y = room.position.y + 30;
      
      const container = scene.add.container(x, y);
      
      // Create button background
      const bg = scene.add.circle(0, 0, 15, 0xFFFFFF, 0.8);
      bg.setStrokeStyle(2, 0x000000, 0.5);
      
      // Create crown icon (simple representation)
      const crown = scene.add.polygon(0, 0, [
        { x: -5, y: 5 },
        { x: 0, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5 }
      ], 0xF59E0B);
      
      container.add([bg, crown]);
      
      // Make it interactive
      bg.setInteractive(new Phaser.Geom.Circle(0, 0, 15), Phaser.Geom.Circle.Contains);
      bg.on('pointerdown', () => {
        const isHosted = isRoomHosted(room.id);
        
        if (isHosted) {
          // Request to join
          const randomNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey'];
          const userName = randomNames[Math.floor(Math.random() * randomNames.length)];
          const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
          requestToJoinRoom(room.id, userName, randomColor);
        } else {
          // Become host
          becomeHost(room.id);
        }
      });
      
      // Update the button appearance based on whether the room is hosted
      updateHostButton(room.id, container, isRoomHosted(room.id));
      
      return container;
    }
    
    // Update host button appearance
    function updateHostButton(roomId: string, container: Phaser.GameObjects.Container, isHosted: boolean) {
      const bg = container.getAt(0) as Phaser.GameObjects.Shape;
      const crown = container.getAt(1) as Phaser.GameObjects.Shape;
      
      if (isHosted) {
        bg.setFillStyle(0xF59E0B, 0.8);
        crown.setFillStyle(0xFFFFFF);
      } else {
        bg.setFillStyle(0xFFFFFF, 0.8);
        crown.setFillStyle(0xF59E0B);
      }
    }

    // Game update loop
    function update(this: Phaser.Scene) {
      if (!playerSprite) return;
      
      const playerCircle = playerSprite.getData('visual');
      if (playerCircle) {
        playerCircle.setPosition(playerSprite.x, playerSprite.y);
      }
      
      // Update player position based on the context
      playerSprite.setPosition(currentUser.position.x, currentUser.position.y);
      
      // Update other characters
      characters.forEach(char => {
        const charSprite = characterSprites[char.id];
        if (charSprite) {
          charSprite.setPosition(char.position.x, char.position.y);
        }
      });
      
      // Update host indicators
      rooms.forEach(room => {
        const indicator = roomHostIndicators[room.id];
        if (indicator) {
          updateHostButton(room.id, indicator, isRoomHosted(room.id));
        }
      });
    }
    
    function getDefaultColorForObjectType(type: string): number {
      const colors: Record<string, number> = {
        'table': 0xA05A2C,
        'chair': 0x8B4513,
        'desk': 0x654321,
        'plant': 0x2E8B57,
        'computer': 0x333333,
        'couch': 0x0000FF,
        'wall': 0x808080,
        'door': 0xCD853F,
        'whiteboard': 0xFFFFFF,
        'tv': 0x000000,
        'coffee-machine': 0x0F0F0F,
        'water-cooler': 0x1E90FF,
        'bookshelf': 0x8B4513,
      };
      
      return colors[type] || 0x808080;
    }

    // Clean up on unmount
    return () => {
      game.destroy(true);
    };
  }, [currentUser, characters, rooms, mapWidth, mapHeight, moveCharacter, isRoomHosted, becomeHost, requestToJoinRoom]);

  return (
    <div 
      ref={gameRef} 
      className={`w-full h-full overflow-hidden ${className}`}
      style={{ position: 'relative' }}
    />
  );
};

export default PhaserGame;
