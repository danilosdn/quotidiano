export type PlayerMode =
  | 'FREE' | 'AUTOWALK' | 'INTERACTING' | 'SITTING' | 'LYING' | 'SLEEPING'
  | 'SHOWERING' | 'COOKING' | 'EATING' | 'DRINKING' | 'USING_PHONE'
  | 'USING_COMPUTER' | 'INVENTORY' | 'DIALOGUE' | 'TRANSITION';

export type ItemLocation = 'WORLD' | 'HELD' | 'IN_BAG' | 'ON_SURFACE';
export type LaundryState = 'EMPTY' | 'LOADED' | 'RUNNING' | 'DONE';

export interface WorldState {
  day: number;
  minutes: number;
  bedMade: boolean;
  wardrobeOpen: boolean;
  fridgeOpen: boolean;
  lightsOn: boolean;
  showeredToday: boolean;
  coffeeReady: boolean;
  coffeeOnTable: boolean;
  toastReady: boolean;
  breakfastOnTable: boolean;
  breakfastEaten: boolean;
  tvOn: boolean;
  doorLocked: boolean;
  doorOpen: boolean;
  laundryOpen: boolean;
  laundryState: LaundryState;
  outfit: 'home' | 'day';
  hasReadMorningMessage: boolean;
}

export interface InventoryItem {
  id: string;
  label: string;
  location: ItemLocation;
}

export interface SaveData {
  version: 1;
  world: WorldState;
  inventory: InventoryItem[];
  flags: Record<string, boolean>;
}
