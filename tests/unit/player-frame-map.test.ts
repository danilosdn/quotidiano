import { describe, expect, it } from 'vitest';
import { assertPlayerFrameMap, PLAYER_FRAME_MAP } from '../../src/game/entities/playerFrameMap';

describe('Player frame map', () => {
  it('keeps the corrected left and right rows distinct', () => {
    expect(assertPlayerFrameMap()).toEqual([]);
    expect(PLAYER_FRAME_MAP.idle.right).toBe(168);
    expect(PLAYER_FRAME_MAP.idle.left).toBe(180);
    expect(PLAYER_FRAME_MAP.walk.right).toEqual([280, 281, 282, 283, 284, 285]);
    expect(PLAYER_FRAME_MAP.walk.left).toEqual([292, 293, 294, 295, 296, 297]);
  });

  it('keeps every referenced frame inside the supplied 56×41 atlas', () => {
    const maxFrame = 56 * 41 - 1;
    const frames = [
      ...Object.values(PLAYER_FRAME_MAP.idle),
      ...Object.values(PLAYER_FRAME_MAP.walk).flat(),
      ...Object.values(PLAYER_FRAME_MAP.sit),
      ...PLAYER_FRAME_MAP.lie,
      ...PLAYER_FRAME_MAP.phone,
      ...PLAYER_FRAME_MAP.read,
      ...Object.values(PLAYER_FRAME_MAP.use).flat(),
      ...Object.values(PLAYER_FRAME_MAP.eat).flat()
    ];
    expect(Math.min(...frames)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...frames)).toBeLessThanOrEqual(maxFrame);
  });
});
