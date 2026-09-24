import { HOUSE_IMAGE_ASSETS, HOUSE_SPRITE_ASSETS } from '../src/game/house/HouseAssetManifest';
import { HOUSE_LAYOUT } from '../src/game/house/HouseLayout';
import { HOUSE_OBJECTS, createHouseInteractions } from '../src/game/house/HouseObjectRegistry';
import { PLAYER_FRAME_MAP } from '../src/game/entities/playerFrameMap';

console.log(JSON.stringify({
  layout: HOUSE_LAYOUT,
  objects: HOUSE_OBJECTS,
  interactions: createHouseInteractions(),
  assets: { images: HOUSE_IMAGE_ASSETS, sprites: HOUSE_SPRITE_ASSETS },
  playerFrames: PLAYER_FRAME_MAP
}, null, 2));
