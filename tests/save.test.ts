import { describe, expect, it } from 'vitest';
import { SaveManager } from '../src/game/persistence/SaveManager';
import { createDefaultSave } from '../src/game/state/WorldState';

describe('save schema',()=>{
  it('round-trips versioned save data',()=>{
    const save=createDefaultSave(); save.scene='CafeScene'; save.position={x:777,y:555}; save.storyFlags.cafeOrdered=true;
    const restored=SaveManager.deserialize(SaveManager.serialize(save));
    expect(restored.saveVersion).toBe(1); expect(restored.scene).toBe('CafeScene'); expect(restored.position).toEqual({x:777,y:555}); expect(restored.storyFlags.cafeOrdered).toBe(true);
  });
});
