export type PlayerMode =
  | 'FREE' | 'AUTOWALK' | 'INTERACTING' | 'SITTING' | 'LYING' | 'SLEEPING'
  | 'SHOWERING' | 'COOKING' | 'EATING' | 'DRINKING' | 'USING_PHONE'
  | 'USING_COMPUTER' | 'INVENTORY' | 'DIALOGUE' | 'TRANSITION';

export type PlayerFacing = 'up' | 'down' | 'left' | 'right';
export type ItemLocation = 'WORLD' | 'HELD' | 'IN_BAG' | 'ON_SURFACE';
export type LaundryState = 'EMPTY' | 'OPEN' | 'LOADED' | 'DETERGENT' | 'RUNNING' | 'DONE' | 'DRYING' | 'DRY';
export type AlarmState = 'RINGING' | 'SNOOZED' | 'OFF';
export type HintLevel = 0 | 1 | 2 | 3 | 4;
export type HouseRoomKey = 'bedroom' | 'bathroom' | 'kitchen' | 'living' | 'entry' | 'laundry';

export interface RoomLightState {
  bedroom: boolean;
  bathroom: boolean;
  kitchen: boolean;
  living: boolean;
  entry: boolean;
  laundry: boolean;
}

export interface WorldState {
  day: number;
  minutes: number;
  bedMade: boolean;
  wardrobeOpen: boolean;
  fridgeOpen: boolean;
  windowOpen: boolean;
  curtainsOpen: boolean;
  nightstandOpen: boolean;
  laptopOn: boolean;
  ovenOn: boolean;
  lightsOn: boolean;
  roomLights: RoomLightState;
  alarmState: AlarmState;
  showeredToday: boolean;
  handsWashed: boolean;
  faceWashed: boolean;
  teethBrushed: boolean;
  usedTowel: boolean;
  coffeeReady: boolean;
  coffeeOnTable: boolean;
  toastReady: boolean;
  breakfastOnTable: boolean;
  breakfastEaten: boolean;
  dishesWashed: boolean;
  tvOn: boolean;
  doorLocked: boolean;
  doorOpen: boolean;
  laundryOpen: boolean;
  laundryState: LaundryState;
  detergentAdded: boolean;
  outfit: 'home' | 'day';
  coatWorn: boolean;
  mailRead: boolean;
  hasReadMorningMessage: boolean;
  currentObjective: string;
  completedScenarios: string[];
}

export interface InventoryItem {
  id: string;
  label: string;
  location: ItemLocation;
  surfaceId?: string;
  equipped?: boolean;
  portable?: boolean;
}

export interface PlayerSnapshot {
  x: number;
  y: number;
  facing: PlayerFacing;
  mode: 'FREE' | 'SITTING' | 'LYING';
}

export interface PlayerPreferences {
  hintLevel: HintLevel;
  ttsEnabled: boolean;
  ttsRate: number;
}

export interface SaveDataV2 {
  version: 2;
  scene: 'HomeScene';
  world: WorldState;
  inventory: InventoryItem[];
  flags: Record<string, boolean>;
  player: PlayerSnapshot;
  preferences: PlayerPreferences;
  updatedAt: string;
}

export interface LegacySaveDataV1 {
  version: 1;
  world: Partial<WorldState>;
  inventory: InventoryItem[];
  flags: Record<string, boolean>;
}

export type SaveData = SaveDataV2;
