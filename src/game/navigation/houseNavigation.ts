import { PathFinder, type Rect } from './PathFinder.ts';

// Insets approximate the player's foot collider rather than the full sprite art.
export const HOUSE_WALKABLE: readonly Rect[] = [
  { x: 58, y: 64, w: 268, h: 228 },
  { x: 370, y: 64, w: 178, h: 228 },
  { x: 592, y: 64, w: 310, h: 228 },
  { x: 58, y: 336, w: 388, h: 318 },
  { x: 490, y: 336, w: 238, h: 318 },
  { x: 772, y: 336, w: 130, h: 318 },
  // Door bridges between otherwise separated room rectangles.
  { x: 322, y: 218, w: 64, h: 66 },
  { x: 544, y: 218, w: 64, h: 66 },
  { x: 254, y: 286, w: 64, h: 66 },
  { x: 430, y: 286, w: 64, h: 66 },
  { x: 660, y: 286, w: 64, h: 66 },
  { x: 826, y: 286, w: 64, h: 66 },
  { x: 442, y: 518, w: 64, h: 72 },
  { x: 724, y: 518, w: 64, h: 72 },
];

export const HOUSE_BLOCKERS: readonly Rect[] = [
  { x: 76, y: 70, w: 125, h: 94 },
  { x: 264, y: 72, w: 50, h: 105 },
  { x: 486, y: 78, w: 68, h: 100 },
  { x: 390, y: 84, w: 56, h: 70 },
  { x: 388, y: 216, w: 44, h: 64 },
  { x: 838, y: 76, w: 64, h: 100 },
  { x: 625, y: 96, w: 55, h: 75 },
  { x: 714, y: 110, w: 55, h: 55 },
  { x: 756, y: 90, w: 62, h: 72 },
  { x: 764, y: 206, w: 96, h: 84 },
  { x: 112, y: 390, w: 104, h: 64 },
  { x: 286, y: 374, w: 62, h: 90 },
  { x: 382, y: 500, w: 36, h: 84 },
  { x: 58, y: 500, w: 38, h: 76 },
  { x: 804, y: 390, w: 64, h: 76 },
];

export const createHousePathFinder = (): PathFinder => new PathFinder(HOUSE_WALKABLE, HOUSE_BLOCKERS, 12);
