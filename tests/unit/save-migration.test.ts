import { describe, expect, it } from 'vitest';
import { migrateSaveData, SaveManager } from '../../src/game/persistence/SaveManager';
import { createInitialWorldState } from '../../src/game/state/WorldState';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('Save migration and safety', () => {
  it('migrates legacy state while filling all House V3 fields', () => {
    const migrated = migrateSaveData({
      version: 1,
      world: { day: 4, minutes: 612, bedMade: true },
      inventory: [{ id: 'phone', label: 'Telefoon', location: 'IN_BAG' }],
      flags: { legacy: true }
    });
    expect(migrated?.version).toBe(2);
    expect(migrated?.world.day).toBe(4);
    expect(migrated?.world.bedMade).toBe(true);
    expect(migrated?.world.roomLights).toEqual(createInitialWorldState().roomLights);
    expect(migrated?.flags.legacy).toBe(true);
    expect(migrated?.player.mode).toBe('FREE');
  });

  it('sanitizes unsafe player modes and duplicate held items', () => {
    const migrated = migrateSaveData({
      version: 2,
      scene: 'HomeScene',
      world: createInitialWorldState(),
      inventory: [
        { id: 'a', label: 'A', location: 'HELD' },
        { id: 'b', label: 'B', location: 'HELD' }
      ],
      flags: {},
      player: { x: Number.NaN, y: Number.POSITIVE_INFINITY, facing: 'down', mode: 'SLEEPING' },
      preferences: { hintLevel: 1, ttsEnabled: true, ttsRate: 1 },
      updatedAt: 'invalid-but-string'
    });
    expect(migrated?.player).toMatchObject({ x: 228, y: 246, mode: 'FREE' });
    expect(migrated?.inventory.filter((item) => item.location === 'HELD')).toHaveLength(1);
  });

  it('round-trips a valid save through storage', () => {
    const storage = new MemoryStorage();
    const manager = new SaveManager(storage);
    const save = migrateSaveData({
      version: 2,
      scene: 'HomeScene',
      world: createInitialWorldState(),
      inventory: [],
      flags: { ok: true },
      player: { x: 228, y: 246, facing: 'down', mode: 'FREE' },
      preferences: { hintLevel: 2, ttsEnabled: false, ttsRate: 1 },
      updatedAt: new Date(0).toISOString()
    })!;
    manager.save(save);
    expect(manager.load()).toEqual(save);
    manager.clear();
    expect(manager.load()).toBeNull();
  });
});
