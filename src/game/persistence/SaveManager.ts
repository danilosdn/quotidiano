import { SAVE_KEY } from '../config/constants';
import { createInitialPreferences, createInitialWorldState } from '../state/WorldState';
import type { InventoryItem, LegacySaveDataV1, PlayerMode, SaveData, SaveDataV2 } from '../state/types';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const SAFE_MODES = new Set<PlayerMode>(['FREE', 'SITTING', 'LYING']);
const finite = (value: unknown, fallback: number): number => typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const dedupeInventory = (items: readonly InventoryItem[]): InventoryItem[] => {
  const unique = new Map<string, InventoryItem>();
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || typeof item.label !== 'string') continue;
    unique.set(item.id, { portable: true, ...item });
  }
  let heldSeen = false;
  for (const item of unique.values()) {
    if (item.location !== 'HELD') continue;
    if (!heldSeen) heldSeen = true;
    else item.location = 'IN_BAG';
  }
  return [...unique.values()];
};

export const migrateSaveData = (input: unknown): SaveData | null => {
  if (!input || typeof input !== 'object') return null;
  const candidate = input as Partial<SaveDataV2> | Partial<LegacySaveDataV1>;
  const baseWorld = createInitialWorldState();
  const basePreferences = createInitialPreferences();

  if (candidate.version === 1) {
    const legacy = candidate as LegacySaveDataV1;
    return {
      version: 2,
      scene: 'HomeScene',
      world: { ...baseWorld, ...(legacy.world ?? {}), roomLights: { ...baseWorld.roomLights, ...(legacy.world?.roomLights ?? {}) }, completedScenarios: [...(legacy.world?.completedScenarios ?? [])] },
      inventory: dedupeInventory(legacy.inventory ?? []),
      flags: { ...(legacy.flags ?? {}) },
      player: { x: 228, y: 246, facing: 'down', mode: 'FREE' },
      preferences: basePreferences,
      updatedAt: new Date(0).toISOString()
    };
  }

  if (candidate.version !== 2) return null;
  const current = candidate as SaveDataV2;
  const safeMode = SAFE_MODES.has(current.player?.mode as PlayerMode) ? current.player.mode : 'FREE';
  return {
    version: 2,
    scene: 'HomeScene',
    world: {
      ...baseWorld,
      ...(current.world ?? {}),
      roomLights: { ...baseWorld.roomLights, ...(current.world?.roomLights ?? {}) },
      completedScenarios: [...(current.world?.completedScenarios ?? [])]
    },
    inventory: dedupeInventory(current.inventory ?? []),
    flags: { ...(current.flags ?? {}) },
    player: {
      x: finite(current.player?.x, 228),
      y: finite(current.player?.y, 246),
      facing: current.player?.facing ?? 'down',
      mode: safeMode as 'FREE' | 'SITTING' | 'LYING'
    },
    preferences: { ...basePreferences, ...(current.preferences ?? {}) },
    updatedAt: typeof current.updatedAt === 'string' ? current.updatedAt : new Date(0).toISOString()
  };
};

export class SaveManager {
  private readonly storage: StorageLike | null;
  constructor(storage?: StorageLike | null) {
    this.storage = storage === undefined ? (typeof localStorage === 'undefined' ? null : localStorage) : storage;
  }
  save(data: SaveData): void { this.storage?.setItem(SAVE_KEY, JSON.stringify(data)); }
  load(): SaveData | null {
    const raw = this.storage?.getItem(SAVE_KEY);
    if (!raw) return null;
    try { return migrateSaveData(JSON.parse(raw)); }
    catch { return null; }
  }
  clear(): void { this.storage?.removeItem(SAVE_KEY); }
}
