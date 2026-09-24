import type { WorldState as WorldStateData } from './types';

export const createInitialWorldState = (): WorldStateData => ({
  day: 1,
  minutes: 7 * 60,
  bedMade: false,
  wardrobeOpen: false,
  fridgeOpen: false,
  lightsOn: true,
  showeredToday: false,
  coffeeReady: false,
  coffeeOnTable: false,
  toastReady: false,
  breakfastOnTable: false,
  breakfastEaten: false,
  tvOn: false,
  doorLocked: true,
  doorOpen: false,
  laundryOpen: false,
  laundryState: 'EMPTY',
  outfit: 'home',
  hasReadMorningMessage: false
});
