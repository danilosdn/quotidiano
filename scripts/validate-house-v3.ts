import { validateHouseDefinition } from '../src/game/house/HouseValidator';
import { assertPlayerFrameMap } from '../src/game/entities/playerFrameMap';

const house = validateHouseDefinition();
const frameIssues = assertPlayerFrameMap();
console.log(JSON.stringify({
  valid: house.valid && frameIssues.length === 0,
  frameIssues,
  house
}, null, 2));
