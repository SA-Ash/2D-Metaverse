
import { ObjectData, InteractiveObjectData } from '@/components/Room';

interface Room {
  id: string;
  name: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  backgroundColor?: string;
  objects: ObjectData[];
  interactiveObjects: InteractiveObjectData[];
}

// Define room data
export const rooms: Room[] = [
  // Main Office Area
  {
    id: 'office-main',
    name: 'Main Office',
    position: { x: 100, y: 100 },
    width: 350,
    height: 250,
    backgroundColor: '#e6a75f',
    objects: [
      // Desks
      { id: 'desk-1', type: 'desk', position: { x: 50, y: 50 }, width: 80, height: 40, rotation: 0, isInteractive: true },
      { id: 'desk-2', type: 'desk', position: { x: 200, y: 50 }, width: 80, height: 40, rotation: 0, isInteractive: true },
      { id: 'desk-3', type: 'desk', position: { x: 50, y: 150 }, width: 80, height: 40, rotation: 0, isInteractive: true },
      { id: 'desk-4', type: 'desk', position: { x: 200, y: 150 }, width: 80, height: 40, rotation: 0, isInteractive: true },
      
      // Chairs
      { id: 'chair-1', type: 'chair', position: { x: 50, y: 100 }, width: 30, height: 30, rotation: 0, isInteractive: true },
      { id: 'chair-2', type: 'chair', position: { x: 200, y: 100 }, width: 30, height: 30, rotation: 0, isInteractive: true },
      { id: 'chair-3', type: 'chair', position: { x: 50, y: 200 }, width: 30, height: 30, rotation: 0, isInteractive: true },
      { id: 'chair-4', type: 'chair', position: { x: 200, y: 200 }, width: 30, height: 30, rotation: 0, isInteractive: true },
      
      // Plants
      { id: 'plant-1', type: 'plant', position: { x: 300, y: 30 }, width: 30, height: 30, rotation: 0 },
      { id: 'plant-2', type: 'plant', position: { x: 300, y: 200 }, width: 30, height: 30, rotation: 0 },
    ],
    interactiveObjects: [
      { id: 'chat-1', type: 'chat', position: { x: 150, y: 125 }, label: 'Office Chat', size: { width: 40, height: 40 } }
    ]
  },
  
  // Meeting Room
  {
    id: 'meeting-room',
    name: 'Meeting Room',
    position: { x: 500, y: 100 },
    width: 300,
    height: 200,
    backgroundColor: '#f8d3e3',
    objects: [
      // Conference Table
      { id: 'conf-table', type: 'table', position: { x: 100, y: 100 }, width: 180, height: 80, isInteractive: true },
      
      // Chairs around the table
      { id: 'chair-m1', type: 'chair', position: { x: 80, y: 70 }, width: 25, height: 25, rotation: 0, isInteractive: true },
      { id: 'chair-m2', type: 'chair', position: { x: 130, y: 70 }, width: 25, height: 25, rotation: 0, isInteractive: true },
      { id: 'chair-m3', type: 'chair', position: { x: 180, y: 70 }, width: 25, height: 25, rotation: 0, isInteractive: true },
      { id: 'chair-m4', type: 'chair', position: { x: 230, y: 70 }, width: 25, height: 25, rotation: 0, isInteractive: true },
      { id: 'chair-m5', type: 'chair', position: { x: 80, y: 130 }, width: 25, height: 25, rotation: 0, isInteractive: true },
      { id: 'chair-m6', type: 'chair', position: { x: 130, y: 130 }, width: 25, height: 25, rotation: 0, isInteractive: true },
      { id: 'chair-m7', type: 'chair', position: { x: 180, y: 130 }, width: 25, height: 25, rotation: 0, isInteractive: true },
      { id: 'chair-m8', type: 'chair', position: { x: 230, y: 130 }, width: 25, height: 25, rotation: 0, isInteractive: true },
      
      // Whiteboard
      { id: 'whiteboard', type: 'whiteboard', position: { x: 150, y: 20 }, width: 200, height: 10, isInteractive: true },
    ],
    interactiveObjects: [
      { id: 'meeting-button', type: 'meeting', position: { x: 150, y: 100 }, label: 'Start Meeting', size: { width: 50, height: 50 } }
    ]
  },
  
  // Break Room
  {
    id: 'break-room',
    name: 'Break Room',
    position: { x: 100, y: 400 },
    width: 250,
    height: 200,
    backgroundColor: '#d3e4fd',
    objects: [
      // Coffee Table
      { id: 'coffee-table', type: 'table', position: { x: 125, y: 100 }, width: 100, height: 50, isInteractive: true },
      
      // Couches
      { id: 'couch-1', type: 'couch', position: { x: 50, y: 100 }, width: 30, height: 80, rotation: 90, isInteractive: true },
      { id: 'couch-2', type: 'couch', position: { x: 200, y: 100 }, width: 30, height: 80, rotation: 90, isInteractive: true },
      
      // Coffee Machine
      { id: 'coffee-machine', type: 'coffee-machine', position: { x: 30, y: 30 }, width: 40, height: 20, isInteractive: true },
      
      // Water Cooler
      { id: 'water-cooler', type: 'water-cooler', position: { x: 200, y: 30 }, width: 20, height: 20, isInteractive: true },
    ],
    interactiveObjects: [
      { id: 'break-room-chat', type: 'chat', position: { x: 125, y: 100 }, label: 'Break Room Chat', size: { width: 40, height: 40 } }
    ]
  },
  
  // Game Room
  {
    id: 'game-room',
    name: 'Game Room',
    position: { x: 400, y: 400 },
    width: 250,
    height: 200,
    backgroundColor: '#e5deff',
    objects: [
      // Game Tables
      { id: 'game-table-1', type: 'table', position: { x: 75, y: 75 }, width: 70, height: 70, isInteractive: true },
      { id: 'game-table-2', type: 'table', position: { x: 175, y: 75 }, width: 70, height: 70, isInteractive: true },
      
      // Chairs
      { id: 'chair-g1', type: 'chair', position: { x: 45, y: 75 }, width: 20, height: 20, rotation: 0, isInteractive: true },
      { id: 'chair-g2', type: 'chair', position: { x: 75, y: 45 }, width: 20, height: 20, rotation: 0, isInteractive: true },
      { id: 'chair-g3', type: 'chair', position: { x: 105, y: 75 }, width: 20, height: 20, rotation: 0, isInteractive: true },
      { id: 'chair-g4', type: 'chair', position: { x: 75, y: 105 }, width: 20, height: 20, rotation: 0, isInteractive: true },
      
      { id: 'chair-g5', type: 'chair', position: { x: 145, y: 75 }, width: 20, height: 20, rotation: 0, isInteractive: true },
      { id: 'chair-g6', type: 'chair', position: { x: 175, y: 45 }, width: 20, height: 20, rotation: 0, isInteractive: true },
      { id: 'chair-g7', type: 'chair', position: { x: 205, y: 75 }, width: 20, height: 20, rotation: 0, isInteractive: true },
      { id: 'chair-g8', type: 'chair', position: { x: 175, y: 105 }, width: 20, height: 20, rotation: 0, isInteractive: true },
    ],
    interactiveObjects: [
      { id: 'game-start', type: 'custom', position: { x: 125, y: 150 }, label: 'Play Game', size: { width: 50, height: 50 }, color: '#8B5CF6' }
    ]
  },
  
  // Private Office
  {
    id: 'private-office',
    name: 'Private Office',
    position: { x: 700, y: 400 },
    width: 200,
    height: 180,
    backgroundColor: '#f2fce2',
    objects: [
      // Desk
      { id: 'exec-desk', type: 'desk', position: { x: 100, y: 100 }, width: 100, height: 50, isInteractive: true },
      
      // Chair
      { id: 'exec-chair', type: 'chair', position: { x: 100, y: 130 }, width: 40, height: 40, rotation: 0, isInteractive: true },
      
      // Visitor Chairs
      { id: 'visitor-chair-1', type: 'chair', position: { x: 70, y: 60 }, width: 30, height: 30, rotation: 180, isInteractive: true },
      { id: 'visitor-chair-2', type: 'chair', position: { x: 130, y: 60 }, width: 30, height: 30, rotation: 180, isInteractive: true },
      
      // Bookshelf
      { id: 'bookshelf', type: 'bookshelf', position: { x: 30, y: 30 }, width: 60, height: 20, isInteractive: true },
    ],
    interactiveObjects: [
      { id: 'private-meeting', type: 'meeting', position: { x: 100, y: 90 }, label: 'Private Meeting', size: { width: 40, height: 40 } }
    ]
  },
  
  // Reception
  {
    id: 'reception',
    name: 'Reception',
    position: { x: 400, y: 100 },
    width: 400,
    height: 150,
    backgroundColor: '#ffdee2',
    objects: [
      // Reception Desk
      { id: 'reception-desk', type: 'desk', position: { x: 200, y: 80 }, width: 150, height: 40, isInteractive: true },
      
      // Reception Chair
      { id: 'reception-chair', type: 'chair', position: { x: 200, y: 110 }, width: 35, height: 35, rotation: 0, isInteractive: true },
      
      // Waiting Area Chairs
      { id: 'waiting-chair-1', type: 'chair', position: { x: 50, y: 40 }, width: 30, height: 30, rotation: 0, isInteractive: true },
      { id: 'waiting-chair-2', type: 'chair', position: { x: 90, y: 40 }, width: 30, height: 30, rotation: 0, isInteractive: true },
      { id: 'waiting-chair-3', type: 'chair', position: { x: 130, y: 40 }, width: 30, height: 30, rotation: 0, isInteractive: true },
      
      // Plants
      { id: 'reception-plant-1', type: 'plant', position: { x: 350, y: 40 }, width: 35, height: 35, rotation: 0 },
      { id: 'reception-plant-2', type: 'plant', position: { x: 350, y: 110 }, width: 35, height: 35, rotation: 0 },
    ],
    interactiveObjects: [
      { id: 'reception-info', type: 'chat', position: { x: 200, y: 60 }, label: 'Information', size: { width: 40, height: 40 } }
    ]
  }
];
