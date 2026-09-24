import type { Point } from '../interactions/types';
import type { PlayerFacing } from '../state/types';

interface PortableSurfaceDefinition {
  anchor: Point;
  approachPoint: Point;
  facing: PlayerFacing;
  hidden?: boolean;
}

const SURFACES: Readonly<Record<string, PortableSurfaceDefinition>> = {
  'entry-console': { anchor:{x:548,y:358}, approachPoint:{x:548,y:432}, facing:'up' },
  entry: { anchor:{x:638,y:588}, approachPoint:{x:610,y:590}, facing:'right' },
  'coat-hook': { anchor:{x:638,y:527}, approachPoint:{x:610,y:540}, facing:'right' },
  bedroom: { anchor:{x:317,y:235}, approachPoint:{x:302,y:250}, facing:'right' },
  desk: { anchor:{x:228,y:199}, approachPoint:{x:227,y:258}, facing:'up' },
  'bathroom-sink': { anchor:{x:458,y:112}, approachPoint:{x:455,y:169}, facing:'up' },
  'dining-table': { anchor:{x:790,y:270}, approachPoint:{x:744,y:315}, facing:'right' },
  'coffee-table': { anchor:{x:258,y:452}, approachPoint:{x:335,y:470}, facing:'left' },
  'side-table': { anchor:{x:112,y:542}, approachPoint:{x:148,y:565}, facing:'left' },
  'kitchen-sink': { anchor:{x:718,y:112}, approachPoint:{x:718,y:174}, facing:'up' },
  'laundry-shelf': { anchor:{x:864,y:438}, approachPoint:{x:810,y:465}, facing:'right' },
  'laundry-basket': { anchor:{x:835,y:555}, approachPoint:{x:795,y:570}, facing:'right' },
  'drying-rack': { anchor:{x:884,y:580}, approachPoint:{x:840,y:620}, facing:'right' },
  fridge: { anchor:{x:880,y:112}, approachPoint:{x:878,y:184}, facing:'up', hidden:true },
  wardrobe: { anchor:{x:314,y:106}, approachPoint:{x:300,y:184}, facing:'up', hidden:true },
  bookshelf: { anchor:{x:72,y:390}, approachPoint:{x:114,y:395}, facing:'left', hidden:true }
};

const OFFSETS: readonly Point[] = [
  {x:0,y:0}, {x:-14,y:4}, {x:14,y:4}, {x:-24,y:-4}, {x:24,y:-4}, {x:0,y:-10}
];

const ITEM_OVERRIDES: Readonly<Record<string, Point>> = {
  'entry-console:keys': {x:-13,y:-4},
  'entry-console:mail': {x:20,y:1},
  'dining-table:toast': {x:-14,y:0},
  'dining-table:coffee': {x:16,y:2},
  'kitchen-sink:mug': {x:22,y:2},
  'laundry-shelf:detergent': {x:0,y:-4},
  'laundry-basket:clothes': {x:0,y:-6},
  'drying-rack:clothes': {x:0,y:-8}
};

export const PORTABLE_INTERACTION_ITEMS = new Set(['keys','mail','backpack','coat','umbrella','toothbrush']);

export const portableSurfaceDefinition = (surfaceId: string | undefined): PortableSurfaceDefinition | undefined => surfaceId ? SURFACES[surfaceId] : undefined;

export const portableItemPosition = (surfaceId: string | undefined, itemId: string, slot = 0): Point | null => {
  const surface = portableSurfaceDefinition(surfaceId);
  if (!surface || surface.hidden) return null;
  const override = ITEM_OVERRIDES[`${surfaceId}:${itemId}`] ?? OFFSETS[slot % OFFSETS.length];
  return { x:surface.anchor.x + override.x, y:surface.anchor.y + override.y };
};

export const portableInteractionPlacement = (surfaceId: string | undefined, itemId: string, slot = 0): { actionPoint:Point; approachPoint:Point; facing:PlayerFacing } | null => {
  const surface = portableSurfaceDefinition(surfaceId);
  const actionPoint = portableItemPosition(surfaceId, itemId, slot);
  if (!surface || !actionPoint) return null;
  return { actionPoint, approachPoint:{...surface.approachPoint}, facing:surface.facing };
};
