import { describe, expect, it } from 'vitest';
import { validateHouseDefinition } from '../../src/game/house/HouseValidator';
import { HOUSE_LAYOUT, roomById } from '../../src/game/house/HouseLayout';
import { HOUSE_OBJECTS, createHouseInteractions } from '../../src/game/house/HouseObjectRegistry';
import { createHousePathFinder } from '../../src/game/house/HouseCollisionBuilder';

describe('House V3 layout', () => {
  it('keeps all declared interactions reachable from the canonical spawn', () => {
    const report = validateHouseDefinition();
    expect(report.valid, report.issues.map((issue) => issue.message).join('\n')).toBe(true);
    expect(report.interactionCount).toBeGreaterThanOrEqual(40);
    expect(report.reachableInteractions).toBe(report.interactionCount);
  });

  it('connects every room to the same walkable component', () => {
    const finder = createHousePathFinder();
    for (const room of HOUSE_LAYOUT.rooms) {
      const center = { x: room.bounds.x + room.bounds.w / 2, y: room.bounds.y + room.bounds.h / 2 };
      expect(finder.isWalkable(center), room.id).toBe(true);
      expect(finder.findPath(HOUSE_LAYOUT.spawn, center), room.id).not.toBeNull();
    }
  });

  it('keeps render anchors in their declared room and unique object ids', () => {
    expect(new Set(HOUSE_OBJECTS.map((object) => object.id)).size).toBe(HOUSE_OBJECTS.length);
    for (const object of HOUSE_OBJECTS) {
      const room = roomById(object.room);
      expect(room, object.id).toBeDefined();
      if (!object.render || !room) continue;
      expect(object.render.x, `${object.id}:x`).toBeGreaterThanOrEqual(room.bounds.x);
      expect(object.render.x, `${object.id}:x`).toBeLessThanOrEqual(room.bounds.x + room.bounds.w);
      expect(object.render.y, `${object.id}:y`).toBeGreaterThanOrEqual(room.bounds.y);
      expect(object.render.y, `${object.id}:y`).toBeLessThanOrEqual(room.bounds.y + room.bounds.h);
    }
  });

  it('uses unique action ids inside every object', () => {
    for (const entry of createHouseInteractions()) {
      expect(new Set(entry.actions.map((action) => action.id)).size, entry.id).toBe(entry.actions.length);
    }
  });
});
