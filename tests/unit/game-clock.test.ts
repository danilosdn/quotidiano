import { describe, expect, it } from 'vitest';
import { GameClock } from '../../src/game/time/GameClock';

describe('GameClock', () => {
  it('rolls over to the next day', () => {
    const clock = new GameClock(1, 23*60+50);
    clock.advance(20);
    expect(clock.day).toBe(2);
    expect(clock.minutes).toBe(10);
    expect(clock.label()).toContain('00:10');
  });
});
