import type { HouseLayoutDefinition } from './types';

/**
 * Compact Dutch-inspired apartment layout for House V3.
 * All coordinates are game-world pixels in the fixed 960x720 canvas.
 */
export const HOUSE_LAYOUT: HouseLayoutDefinition = {
  width: 960,
  height: 720,
  wallThickness: 16,
  spawn: { x: 228, y: 246 },
  safeResumePoint: { x: 228, y: 246 },
  rooms: [
    { id: 'bedroom', label: 'Slaapkamer', bounds: { x: 36, y: 36, w: 324, h: 252 }, floorTexture: 'floor-wood', wallTexture: 'wall-light', lightStateKey: 'bedroomLightOn' },
    { id: 'bathroom', label: 'Badkamer', bounds: { x: 372, y: 36, w: 216, h: 252 }, floorTexture: 'floor-tile', wallTexture: 'wall-light', lightStateKey: 'bathroomLightOn' },
    { id: 'kitchen', label: 'Keuken en eethoek', bounds: { x: 600, y: 36, w: 324, h: 330 }, floorTexture: 'floor-parquet', wallTexture: 'wall-light', lightStateKey: 'kitchenLightOn' },
    { id: 'living', label: 'Woonkamer', bounds: { x: 36, y: 300, w: 444, h: 384 }, floorTexture: 'floor-wood', wallTexture: 'wall-light', lightStateKey: 'livingLightOn' },
    { id: 'entry', label: 'Hal en entree', bounds: { x: 492, y: 300, w: 180, h: 384 }, floorTexture: 'floor-parquet', wallTexture: 'wall-light', lightStateKey: 'entryLightOn' },
    { id: 'laundry', label: 'Wasruimte', bounds: { x: 684, y: 378, w: 240, h: 306 }, floorTexture: 'floor-tile', wallTexture: 'wall-light', lightStateKey: 'laundryLightOn' }
  ],
  openings: [
    { id: 'bedroom-living', from: 'bedroom', to: 'living', rect: { x: 286, y: 270, w: 62, h: 48 }, floorTexture: 'floor-wood' },
    { id: 'bathroom-entry', from: 'bathroom', to: 'entry', rect: { x: 444, y: 270, w: 72, h: 48 }, floorTexture: 'floor-tile' },
    { id: 'kitchen-entry', from: 'kitchen', to: 'entry', rect: { x: 582, y: 284, w: 48, h: 72 }, floorTexture: 'floor-parquet' },
    { id: 'living-entry', from: 'living', to: 'entry', rect: { x: 462, y: 430, w: 48, h: 104 }, floorTexture: 'floor-wood' },
    { id: 'entry-laundry', from: 'entry', to: 'laundry', rect: { x: 666, y: 500, w: 48, h: 76 }, floorTexture: 'floor-parquet' },
    { id: 'front-door', from: 'entry', to: 'outside', rect: { x: 546, y: 652, w: 72, h: 48 }, floorTexture: 'floor-parquet' }
  ]
};

export const roomById = (id: string) => HOUSE_LAYOUT.rooms.find((room) => room.id === id);
