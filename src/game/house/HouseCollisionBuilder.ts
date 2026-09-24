import { PathFinder, type Rect } from '../navigation/PathFinder';
import { HOUSE_LAYOUT } from './HouseLayout';
import { HOUSE_OBJECTS } from './HouseObjectRegistry';

const inset = (rect: Rect, amount: number): Rect => ({ x: rect.x + amount, y: rect.y + amount, w: rect.w - amount * 2, h: rect.h - amount * 2 });
const expand = (rect: Rect, amount: number): Rect => ({ x: rect.x - amount, y: rect.y - amount, w: rect.w + amount * 2, h: rect.h + amount * 2 });

export const buildHouseWalkableAreas = (): Rect[] => [
  ...HOUSE_LAYOUT.rooms.map((room) => inset(room.bounds, HOUSE_LAYOUT.wallThickness + 4)),
  ...HOUSE_LAYOUT.openings.map((opening) => expand(opening.rect, HOUSE_LAYOUT.wallThickness + 4))
];

export const buildHouseBlockers = (): Rect[] => HOUSE_OBJECTS.flatMap((object) => object.collision ? [{ ...object.collision }] : []);

export const createHousePathFinder = (): PathFinder => new PathFinder(buildHouseWalkableAreas(), buildHouseBlockers(), 12);
