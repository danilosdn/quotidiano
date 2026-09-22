export type SceneKey = 'HomeScene' | 'StreetScene' | 'CafeScene';

export interface InventoryItem {
  id: string;
  nameNl: string;
  namePt: string;
  icon: string;
  description: string;
  quantity: number;
}

export interface PlayerPosition { x: number; y: number }

export interface SaveData {
  saveVersion: 1;
  scene: SceneKey;
  position: PlayerPosition;
  inventory: InventoryItem[];
  balance: number;
  storyFlags: Record<string, boolean | string | number>;
  npcMemory: Record<string, Record<string, boolean | string | number>>;
  settings: {
    showTranslations: boolean;
    sound: boolean;
  };
  objective: string;
  startedAt: number;
  updatedAt: number;
}

export const createDefaultSave = (): SaveData => ({
  saveVersion: 1,
  scene: 'HomeScene',
  position: { x: 610, y: 670 },
  inventory: [
    { id: 'phone', nameNl: 'telefoon', namePt: 'telefone', icon: 'phone', description: 'Seu telefone.', quantity: 1 },
    { id: 'wallet', nameNl: 'portemonnee', namePt: 'carteira', icon: 'wallet', description: 'Carteira com dinheiro fictício do jogo.', quantity: 1 }
  ],
  balance: 12,
  storyFlags: { keysCollected: false, metPieter: false, cafeOrdered: false, coffeePicked: false, coffeeDrunk: false },
  npcMemory: {},
  settings: { showTranslations: false, sound: true },
  objective: 'Pegue suas chaves antes de sair.',
  startedAt: Date.now(),
  updatedAt: Date.now()
});

export class WorldState {
  data: SaveData = createDefaultSave();

  reset(): void { this.data = createDefaultSave(); }
  replace(data: SaveData): void { this.data = data; }
  setScene(scene: SceneKey, position: PlayerPosition): void {
    this.data.scene = scene;
    this.data.position = { ...position };
    this.touch();
  }
  setFlag(key: string, value: boolean | string | number = true): void {
    this.data.storyFlags[key] = value;
    this.touch();
  }
  flag<T extends boolean | string | number>(key: string, fallback: T): T {
    return (this.data.storyFlags[key] as T | undefined) ?? fallback;
  }
  remember(npc: string, key: string, value: boolean | string | number): void {
    this.data.npcMemory[npc] ??= {};
    this.data.npcMemory[npc][key] = value;
    this.touch();
  }
  setObjective(text: string): void { this.data.objective = text; this.touch(); }
  touch(): void { this.data.updatedAt = Date.now(); }
}

export const worldState = new WorldState();
