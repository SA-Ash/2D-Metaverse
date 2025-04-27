
interface Point {
  x: number;
  y: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Check if a point is inside a rectangle
 */
export function pointInRectangle(point: Point, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Check if two rectangles overlap
 */
export function rectanglesOverlap(rect1: Rectangle, rect2: Rectangle): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Calculate the distance between two points
 */
export function distance(point1: Point, point2: Point): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate if a character at position can move to newPosition without colliding
 * with any obstacles
 */
export function canMove(
  position: Point,
  newPosition: Point,
  obstacles: Rectangle[]
): boolean {
  // Create a character hitbox (smaller than visual representation)
  const characterHitbox: Rectangle = {
    x: newPosition.x - 15, // Half of typical character width
    y: newPosition.y - 15, // Half of typical character height
    width: 30,
    height: 30,
  };

  // Check against all obstacles
  for (const obstacle of obstacles) {
    if (rectanglesOverlap(characterHitbox, obstacle)) {
      return false;
    }
  }

  return true;
}

/**
 * Find nearby characters within a certain radius
 */
export function findNearbyCharacters(
  position: Point,
  characters: { id: string; position: Point }[],
  radius: number,
  excludeId?: string
): { id: string; position: Point; distance: number }[] {
  return characters
    .filter((char) => char.id !== excludeId)
    .map((char) => ({
      id: char.id,
      position: char.position,
      distance: distance(position, char.position),
    }))
    .filter((char) => char.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate the normalized distance (0-100) based on proximity radius
 */
export function calculateNormalizedDistance(
  distance: number,
  proximityRadius: number
): number {
  return Math.min(100, (distance / proximityRadius) * 100);
}
