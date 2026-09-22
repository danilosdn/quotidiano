import { SaveData, worldState } from '../state/WorldState';

const SAVE_KEY = 'quotidiano.save.v1';

export class SaveManager {
  static hasSave(): boolean {
    try { return localStorage.getItem(SAVE_KEY) !== null; } catch { return false; }
  }

  static load(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SaveData;
      if (parsed.saveVersion !== 1) return null;
      return parsed;
    } catch { return null; }
  }

  static hydrate(): boolean {
    const save = this.load();
    if (!save) return false;
    worldState.replace(save);
    return true;
  }

  static save(): void {
    worldState.touch();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(worldState.data)); } catch { /* storage can be unavailable */ }
  }

  static clear(): void {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* noop */ }
    worldState.reset();
  }

  static serialize(data: SaveData): string { return JSON.stringify(data); }
  static deserialize(raw: string): SaveData { return JSON.parse(raw) as SaveData; }
}
