import { createHousePathFinder } from './HouseCollisionBuilder';
import { HOUSE_LAYOUT, roomById } from './HouseLayout';
import { HOUSE_OBJECTS, createHouseInteractions } from './HouseObjectRegistry';
import type { HouseValidationIssue, HouseValidationReport } from './types';
import type { Rect } from '../navigation/PathFinder';

const pointInRect = (point: {x:number;y:number}, rect: Rect): boolean => point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
const overlapArea = (a: Rect, b: Rect): number => Math.max(0, Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)) * Math.max(0, Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));

export const validateHouseDefinition = (): HouseValidationReport => {
  const issues: HouseValidationIssue[] = [];
  const ids = new Set<string>();
  const pathFinder = createHousePathFinder();
  const interactions = createHouseInteractions();
  let reachableInteractions = 0;

  for (const object of HOUSE_OBJECTS) {
    if (ids.has(object.id)) issues.push({ severity:'error', code:'DUPLICATE_OBJECT_ID', message:`Duplicate object id: ${object.id}`, objectId:object.id });
    ids.add(object.id);
    const room = roomById(object.room);
    if (!room) issues.push({ severity:'error', code:'UNKNOWN_ROOM', message:`Unknown room ${object.room}`, objectId:object.id });
    if (object.render && room && !pointInRect({x:object.render.x,y:object.render.y}, room.bounds)) issues.push({ severity:'warning', code:'RENDER_OUTSIDE_ROOM', message:`Render anchor is outside ${object.room}`, objectId:object.id });
    if (object.interaction) {
      const actionIds = new Set<string>();
      for (const action of object.interaction.actions) {
        if (actionIds.has(action.id)) issues.push({ severity:'error', code:'DUPLICATE_ACTION_ID', message:`Duplicate action ${action.id}`, objectId:object.id });
        actionIds.add(action.id);
      }
      if (!pathFinder.isWalkable(object.interaction.approachPoint)) issues.push({ severity:'error', code:'APPROACH_NOT_WALKABLE', message:`Approach point is blocked: ${JSON.stringify(object.interaction.approachPoint)}`, objectId:object.id });
      const route = pathFinder.findPath(HOUSE_LAYOUT.spawn, object.interaction.approachPoint);
      if (route) reachableInteractions += 1;
      else issues.push({ severity:'error', code:'UNREACHABLE_INTERACTION', message:'No path from spawn to approach point', objectId:object.id });
    }
  }

  const colliders = HOUSE_OBJECTS.filter((object): object is typeof object & {collision:Rect} => Boolean(object.collision));
  for (let i=0;i<colliders.length;i+=1) for (let j=i+1;j<colliders.length;j+=1) {
    const a=colliders[i], b=colliders[j];
    if (a.room !== b.room || a.allowOverlapWith?.includes(b.id) || b.allowOverlapWith?.includes(a.id)) continue;
    const overlap=overlapArea(a.collision,b.collision);
    if (!overlap) continue;
    const minArea=Math.min(a.collision.w*a.collision.h,b.collision.w*b.collision.h);
    if (overlap/minArea > 0.42) issues.push({ severity:'warning', code:'COLLIDER_OVERLAP', message:`Large collider overlap with ${b.id}`, objectId:a.id });
  }

  for (const opening of HOUSE_LAYOUT.openings) {
    const center={x:opening.rect.x+opening.rect.w/2,y:opening.rect.y+opening.rect.h/2};
    if (opening.to !== 'outside' && !pathFinder.isWalkable(center)) issues.push({severity:'error',code:'BLOCKED_OPENING',message:`Opening ${opening.id} is blocked`});
  }

  return { valid: !issues.some((issue)=>issue.severity==='error'), issues, reachableInteractions, interactionCount:interactions.length };
};
