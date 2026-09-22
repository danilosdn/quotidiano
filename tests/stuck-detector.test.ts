import { describe, expect, it } from 'vitest';
import { AutoWalkStuckDetector } from '../src/game/navigation/AutoWalkStuckDetector';

describe('AutoWalkStuckDetector', () => {
  it('requests replans and eventually cancels a blocked walk', () => {
    const detector = new AutoWalkStuckDetector(600, 1, 2);
    detector.begin({x:100,y:100});
    expect(detector.sample({x:100,y:100},300,true)).toBe('none');
    expect(detector.sample({x:100,y:100},320,true)).toBe('replan');
    detector.replanSucceeded({x:100,y:100});
    expect(detector.sample({x:100,y:100},610,true)).toBe('replan');
    detector.replanSucceeded({x:100,y:100});
    expect(detector.sample({x:100,y:100},610,true)).toBe('cancel');
  });

  it('resets the stall timer when the player moves', () => {
    const detector = new AutoWalkStuckDetector(600, 1, 2);
    detector.begin({x:0,y:0});
    detector.sample({x:0,y:0},400,true);
    expect(detector.sample({x:4,y:0},250,true)).toBe('none');
    expect(detector.sample({x:4,y:0},400,true)).toBe('none');
  });
});
