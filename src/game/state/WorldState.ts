import type { PlayerPreferences, WorldState as WorldStateData } from './types';

export const createInitialWorldState = (): WorldStateData => ({
  day: 1,
  minutes: 7 * 60,
  bedMade: false,
  wardrobeOpen: false,
  fridgeOpen: false,
  windowOpen: false,
  curtainsOpen: false,
  nightstandOpen: false,
  laptopOn: false,
  ovenOn: false,
  lightsOn: true,
  roomLights: {
    bedroom: true,
    bathroom: true,
    kitchen: true,
    living: true,
    entry: true,
    laundry: true
  },
  alarmState: 'RINGING',
  showeredToday: false,
  handsWashed: false,
  faceWashed: false,
  teethBrushed: false,
  usedTowel: false,
  coffeeReady: false,
  coffeeOnTable: false,
  toastReady: false,
  breakfastOnTable: false,
  breakfastEaten: false,
  dishesWashed: false,
  tvOn: false,
  doorLocked: true,
  doorOpen: false,
  laundryOpen: false,
  laundryState: 'EMPTY',
  detergentAdded: false,
  outfit: 'home',
  coatWorn: false,
  mailRead: false,
  hasReadMorningMessage: false,
  currentObjective: 'Sta op en begin rustig aan je ochtend.',
  completedScenarios: []
});

export const createInitialPreferences = (): PlayerPreferences => ({
  hintLevel: 1,
  ttsEnabled: true,
  ttsRate: 1
});
