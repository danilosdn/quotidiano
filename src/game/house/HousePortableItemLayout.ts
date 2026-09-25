import type { Point } from '../interactions/types';
import type { PlayerFacing } from '../state/types';

interface PortableSurfaceDefinition {
  anchor: Point;
  approachPoint: Point;
  facing: PlayerFacing;
  hidden?: boolean;
}

const SURFACES: Readonly<Record<string, PortableSurfaceDefinition>> = {
  'entry-console': { anchor:{x:616,y:384}, approachPoint:{x:616,y:454}, facing:'up' },
  entry: { anchor:{x:638,y:586}, approachPoint:{x:606,y:590}, facing:'right' },
  'coat-hook': { anchor:{x:638,y:438}, approachPoint:{x:606,y:470}, facing:'right' },
  bedroom: { anchor:{x:300,y:236}, approachPoint:{x:274,y:244}, facing:'right' },
  desk: { anchor:{x:226,y:98}, approachPoint:{x:226,y:164}, facing:'up' },
  'bathroom-sink': { anchor:{x:458,y:112}, approachPoint:{x:452,y:168}, facing:'up' },
  'dining-table': { anchor:{x:790,y:270}, approachPoint:{x:786,y:342}, facing:'up' },
  'coffee-table': { anchor:{x:250,y:458}, approachPoint:{x:328,y:472}, facing:'left' },
  'side-table': { anchor:{x:380,y:556}, approachPoint:{x:344,y:580}, facing:'right' },
  'kitchen-sink': { anchor:{x:772,y:112}, approachPoint:{x:772,y:174}, facing:'up' },
  'laundry-shelf': { anchor:{x:858,y:438}, approachPoint:{x:856,y:512}, facing:'up' },
  'laundry-basket': { anchor:{x:714,y:560}, approachPoint:{x:752,y:572}, facing:'left' },
  'drying-rack': { anchor:{x:846,y:552}, approachPoint:{x:804,y:584}, facing:'right' },
  fridge: { anchor:{x:880,y:126}, approachPoint:{x:880,y:196}, facing:'up', hidden:true },
  wardrobe: { anchor:{x:306,y:144}, approachPoint:{x:288,y:222}, facing:'up', hidden:true },
  bookshelf: { anchor:{x:78,y:454}, approachPoint:{x:120,y:456}, facing:'left', hidden:true }
};

const OFFSETS: readonly Point[] = [
  {x:0,y:0}, {x:-14,y:4}, {x:14,y:4}, {x:-24,y:-4}, {x:24,y:-4}, {x:0,y:-10}
];

const ITEM_OVERRIDES: Readonly<Record<string, Point>> = {
  'entry-console:keys': {x:-14,y:-2},
  'entry-console:mail': {x:16,y:2},
  'dining-table:toast': {x:-14,y:0},
  'dining-table:coffee': {x:16,y:2},
  'kitchen-sink:mug': {x:24,y:2},
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
