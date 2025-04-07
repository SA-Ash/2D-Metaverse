
import { ObjectData } from '@/components/Room';

// This file contains common object templates that can be used in rooms
export const objectTemplates: Record<string, Omit<ObjectData, 'id' | 'position'>> = {
  desk: {
    type: 'desk',
    width: 80,
    height: 40,
    isInteractive: true,
  },
  smallDesk: {
    type: 'desk',
    width: 60,
    height: 30,
    isInteractive: true,
  },
  largeDesk: {
    type: 'desk',
    width: 120,
    height: 60,
    isInteractive: true,
  },
  chair: {
    type: 'chair',
    width: 30,
    height: 30,
    isInteractive: true,
  },
  smallChair: {
    type: 'chair',
    width: 20,
    height: 20,
    isInteractive: true,
  },
  table: {
    type: 'table',
    width: 80,
    height: 80,
    isInteractive: true,
  },
  roundTable: {
    type: 'table',
    width: 70,
    height: 70,
    isInteractive: true,
  },
  conferenceTable: {
    type: 'table',
    width: 180,
    height: 80,
    isInteractive: true,
  },
  plant: {
    type: 'plant',
    width: 30,
    height: 30,
  },
  largePlant: {
    type: 'plant',
    width: 45,
    height: 45,
  },
  couch: {
    type: 'couch',
    width: 120,
    height: 40,
    isInteractive: true,
  },
  smallCouch: {
    type: 'couch',
    width: 80,
    height: 30,
    isInteractive: true,
  },
  whiteboard: {
    type: 'whiteboard',
    width: 120,
    height: 10,
    isInteractive: true,
  },
  tv: {
    type: 'tv',
    width: 80,
    height: 10,
    isInteractive: true,
  },
  coffeeMachine: {
    type: 'coffee-machine',
    width: 40,
    height: 20,
    isInteractive: true,
  },
  waterCooler: {
    type: 'water-cooler',
    width: 20,
    height: 20,
    isInteractive: true,
  },
  bookshelf: {
    type: 'bookshelf',
    width: 60,
    height: 20,
    isInteractive: true,
  },
  wall: {
    type: 'wall',
    width: 10,
    height: 100,
  },
  door: {
    type: 'door',
    width: 40,
    height: 10,
    isInteractive: true,
  },
};

// Function to create an object with a unique ID
export function createObject(
  template: keyof typeof objectTemplates,
  position: { x: number; y: number },
  id: string,
  overrides: Partial<ObjectData> = {}
): ObjectData {
  return {
    id,
    position,
    ...objectTemplates[template],
    ...overrides,
  };
}
