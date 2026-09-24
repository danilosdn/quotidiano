import { SAVE_KEY } from '../config/constants';
import type { SaveData } from '../state/types';

export class SaveManager {
  save(data: SaveData): void { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); }
  load(): SaveData | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as SaveData;
      return parsed.version === 1 ? parsed : null;
    } catch { return null; }
  }
  clear(): void { localStorage.removeItem(SAVE_KEY); }
}
