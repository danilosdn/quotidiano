import assert from 'node:assert/strict';
import { GameClock } from '../src/game/time/GameClock.ts';
import { InventoryManager } from '../src/game/inventory/InventoryManager.ts';
import { IntentMatcher } from '../src/game/dialogue/IntentMatcher.ts';
import { InteractionRegistry } from '../src/game/interactions/InteractionRegistry.ts';
import { PathFinder } from '../src/game/navigation/PathFinder.ts';
import { createHousePathFinder } from '../src/game/navigation/houseNavigation.ts';
import { HOME_INTERACTIONS } from '../src/data/interactions/homeInteractions.ts';
import { createInitialWorldState } from '../src/game/state/WorldState.ts';

const clock = new GameClock(1, 1430);
clock.advance(20);
assert.equal(clock.day, 2);
assert.equal(clock.minutes, 10);

const inventory = new InventoryManager([{ id:'keys', label:'Sleutels', location:'WORLD' }]);
assert.equal(inventory.add('keys', 'Sleutels'), true);
assert.equal(inventory.has('keys'), true);
assert.equal(inventory.all().length, 1);

const matcher = new IntentMatcher();
assert.equal(matcher.match('Ja, graag!', { ACCEPT_COFFEE:['ja graag'] }), 'ACCEPT_COFFEE');

const registry = new InteractionRegistry();
registry.register({id:'a',objectId:'a',room:'x',type:'observation',actions:[],approachPoint:{x:0,y:0},actionPoint:{x:10,y:10},facing:'down',radius:80,priority:20});
registry.register({id:'b',objectId:'b',room:'x',type:'critical',actions:[],approachPoint:{x:0,y:0},actionPoint:{x:10,y:10},facing:'down',radius:80,priority:100});
assert.equal(registry.nearest(10,10)?.id, 'b');

const finder = new PathFinder([{x:0,y:0,w:120,h:120}], [{x:48,y:0,w:24,h:84}], 12);
const route = finder.findPath({x:24,y:24}, {x:96,y:24});
assert.ok(route && route.length > 0);
assert.ok(route.some((p) => p.y >= 96));


const house = createHousePathFinder();
const world = createInitialWorldState();
for (const interaction of HOME_INTERACTIONS) {
  assert.equal(house.isWalkable(interaction.approachPoint), true, `${interaction.id} approach point is not walkable`);
  assert.ok(house.findPath({x:156,y:196}, interaction.approachPoint)?.length, `missing house route to ${interaction.id}`);
  assert.equal(new Set(interaction.actions.map((action) => action.id)).size, interaction.actions.length, `${interaction.id} has duplicate action ids`);
  if (interaction.persistentState) {
    assert.ok(interaction.persistentState in world, `${interaction.id} persistent state is not in WorldState`);
  }
}

console.log('core smoke tests: PASS');
