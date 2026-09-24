import { describe, expect, it } from 'vitest';
import { PathFinder } from '../../src/game/navigation/PathFinder';

describe('PathFinder', () => {
  it('routes around a blocker inside a walkable area', () => {
    const finder = new PathFinder(
      [{x:0,y:0,w:120,h:120}],
      [{x:48,y:0,w:24,h:84}],
      12,
    );
    const route = finder.findPath({x:24,y:24}, {x:96,y:24});
    expect(route).not.toBeNull();
    expect(route!.some((p) => p.y >= 96)).toBe(true);
  });

  it('returns null when disconnected walkable islands have no bridge', () => {
    const finder = new PathFinder([{x:0,y:0,w:36,h:100},{x:72,y:0,w:28,h:100}], [], 12);
    expect(finder.findPath({x:12,y:12}, {x:84,y:12})).toBeNull();
  });
});
