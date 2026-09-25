import type { HouseLayoutDefinition } from './types';

/**
 * House V3 blueprint-aligned layout.
 * The room graph and openings follow the approved blueprint composition:
 * bedroom / bathroom / kitchen-dining on the top row,
 * living / hall-entry / laundry on the lower portion,
 * with a continuous circulation path from the front door to every room.
 */
export const HOUSE_LAYOUT: HouseLayoutDefinition = {
  width: 960,
  height: 720,
  wallThickness: 16,
  spawn: { x: 188, y: 156 },
  safeResumePoint: { x: 188, y: 156 },
  rooms: [
    { id: 'bedroom', label: 'Slaapkamer', bounds: { x: 36, y: 36, w: 324, h: 252 }, floorTexture: 'floor-wood', wallTexture: 'wall-light', lightStateKey: 'bedroomLightOn' },
    { id: 'bathroom', label: 'Badkamer', bounds: { x: 372, y: 36, w: 216, h: 252 }, floorTexture: 'floor-tile', wallTexture: 'wall-light', lightStateKey: 'bathroomLightOn' },
    { id: 'kitchen', label: 'Keuken en eethoek', bounds: { x: 600, y: 36, w: 324, h: 330 }, floorTexture: 'floor-tile', wallTexture: 'wall-light', lightStateKey: 'kitchenLightOn' },
    { id: 'living', label: 'Woonkamer', bounds: { x: 36, y: 300, w: 444, h: 384 }, floorTexture: 'floor-wood', wallTexture: 'wall-light', lightStateKey: 'livingLightOn' },
    { id: 'entry', label: 'Hal en entree', bounds: { x: 492, y: 300, w: 180, h: 384 }, floorTexture: 'floor-parquet', wallTexture: 'wall-light', lightStateKey: 'entryLightOn' },
    { id: 'laundry', label: 'Wasruimte', bounds: { x: 684, y: 378, w: 240, h: 306 }, floorTexture: 'floor-tile', wallTexture: 'wall-light', lightStateKey: 'laundryLightOn' }
  ],
  openings: [
    { id: 'bedroom-living', from: 'bedroom', to: 'living', rect: { x: 244, y: 270, w: 68, h: 48 }, floorTexture: 'floor-wood' },
    { id: 'bathroom-entry', from: 'bathroom', to: 'entry', rect: { x: 438, y: 270, w: 76, h: 48 }, floorTexture: 'floor-tile' },
    { id: 'kitchen-entry', from: 'kitchen', to: 'entry', rect: { x: 584, y: 288, w: 48, h: 76 }, floorTexture: 'floor-tile' },
    { id: 'living-entry', from: 'living', to: 'entry', rect: { x: 462, y: 430, w: 48, h: 104 }, floorTexture: 'floor-wood' },
    { id: 'entry-laundry', from: 'entry', to: 'laundry', rect: { x: 666, y: 500, w: 48, h: 76 }, floorTexture: 'floor-parquet' },
    { id: 'front-door', from: 'entry', to: 'outside', rect: { x: 546, y: 652, w: 72, h: 48 }, floorTexture: 'floor-parquet' }
  ]
};

export const roomById = (id: string) => HOUSE_LAYOUT.rooms.find((room) => room.id === id);
