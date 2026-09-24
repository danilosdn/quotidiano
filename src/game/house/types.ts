import type { InteractionDefinition, Point } from '../interactions/types';
import type { Rect } from '../navigation/PathFinder';

export type HouseRoomId = 'bedroom' | 'bathroom' | 'kitchen' | 'living' | 'entry' | 'laundry';
export type HouseRenderLayer = 'floor' | 'wall' | 'furniture' | 'surface' | 'foreground';

export interface HouseRoomDefinition {
  id: HouseRoomId;
  label: string;
  bounds: Rect;
  floorTexture: 'floor-wood' | 'floor-parquet' | 'floor-tile';
  wallTexture: 'wall-light';
  lightStateKey: string;
}

export interface HouseOpeningDefinition {
  id: string;
  from: HouseRoomId;
  to: HouseRoomId | 'outside';
  rect: Rect;
  floorTexture: HouseRoomDefinition['floorTexture'];
}

export interface HouseRenderDefinition {
  texture: string;
  kind?: 'image' | 'sprite';
  x: number;
  y: number;
  frame?: number;
  origin?: Point;
  scale?: number;
  flipX?: boolean;
  layer?: HouseRenderLayer;
  visible?: boolean;
}

export interface HouseObjectDefinition {
  id: string;
  label: string;
  room: HouseRoomId;
  render?: HouseRenderDefinition;
  collision?: Rect;
  interaction?: Omit<InteractionDefinition, 'id' | 'objectId' | 'room'>;
  sourceAsset?: string;
  tags?: readonly string[];
  allowOverlapWith?: readonly string[];
}

export interface HouseLayoutDefinition {
  width: number;
  height: number;
  wallThickness: number;
  rooms: readonly HouseRoomDefinition[];
  openings: readonly HouseOpeningDefinition[];
  spawn: Point;
  safeResumePoint: Point;
}

export interface HouseValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  objectId?: string;
}

export interface HouseValidationReport {
  valid: boolean;
  issues: HouseValidationIssue[];
  reachableInteractions: number;
  interactionCount: number;
}
