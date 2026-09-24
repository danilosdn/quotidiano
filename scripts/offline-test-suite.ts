import { HOME_DIALOGUES } from '../src/data/dialogues/homeContent';
import { HOME_INTENTS, HOME_INTENT_VARIANTS } from '../src/data/language/homeIntents';
import { HOME_SCENARIOS } from '../src/data/scenarios/homeScenarios';
import { IntentMatcher } from '../src/game/dialogue/IntentMatcher';
import { assertPlayerFrameMap, PLAYER_FRAME_MAP } from '../src/game/entities/playerFrameMap';
import { HouseActionSequenceRunner } from '../src/game/house/actions/HouseActionSequenceRunner';
import type { HouseActionContext, HouseActionRuntime, HouseActionStep } from '../src/game/house/actions/types';
import { HouseInteractionController } from '../src/game/house/HouseInteractionController';
import { portableInteractionPlacement, portableItemPosition } from '../src/game/house/HousePortableItemLayout';
import { HOUSE_OBJECTS, houseObjectById } from '../src/game/house/HouseObjectRegistry';
import { validateHouseDefinition } from '../src/game/house/HouseValidator';
import { createInitialWorldState } from '../src/game/state/WorldState';
import { InventoryManager } from '../src/game/inventory/InventoryManager';
import { migrateSaveData } from '../src/game/persistence/SaveManager';

const results: Array<{ name:string; passed:boolean; detail?:string }> = [];
const assert = (condition: unknown, message: string): void => { if (!condition) throw new Error(message); };
const test = async (name: string, run: () => void | Promise<void>): Promise<void> => {
  try { await run(); results.push({ name, passed:true }); }
  catch (error) { results.push({ name, passed:false, detail:error instanceof Error ? error.message : String(error) }); }
};

const main = async (): Promise<void> => {

await test('house topology and interactions are valid', () => {
  const report=validateHouseDefinition();
  assert(report.valid, report.issues.map((issue)=>issue.message).join('; '));
  assert(report.interactionCount>=40, `expected at least 40 interactions, got ${report.interactionCount}`);
  assert(report.reachableInteractions===report.interactionCount, `expected all interactions reachable, got ${report.reachableInteractions}/${report.interactionCount}`);
});

await test('player direction and action frame map is coherent', () => {
  assert(assertPlayerFrameMap().length===0, assertPlayerFrameMap().join('; '));
  assert(Number(PLAYER_FRAME_MAP.idle.left)!==Number(PLAYER_FRAME_MAP.idle.right), 'left/right idle frames must differ');
  assert(PLAYER_FRAME_MAP.walk.left[0]===292, 'left walk row must start at frame 292');
  assert(PLAYER_FRAME_MAP.walk.right[0]===280, 'right walk row must start at frame 280');
});

await test('language content meets House V3 minimums', () => {
  assert(HOME_DIALOGUES.length>=60, `expected >=60 dialogue nodes, got ${HOME_DIALOGUES.length}`);
  assert(HOME_INTENTS.length>=30, `expected >=30 intents, got ${HOME_INTENTS.length}`);
  assert(HOME_SCENARIOS.length>=12, `expected >=12 scenarios, got ${HOME_SCENARIOS.length}`);
  const dialogueIds=new Set(HOME_DIALOGUES.map((line)=>line.id));
  const intentIds=new Set(HOME_INTENTS.map((intent)=>intent.id));
  for(const intent of HOME_INTENTS) assert(intent.variants.length>=3, `${intent.id} has fewer than 3 variants`);
  for(const scenario of HOME_SCENARIOS){
    for(const id of scenario.dialogueIds) assert(dialogueIds.has(id), `${scenario.id} references missing dialogue ${id}`);
    for(const id of scenario.intentIds) assert(intentIds.has(id), `${scenario.id} references missing intent ${id}`);
  }
});

await test('intent matcher accepts natural variants and rejects unrelated text', () => {
  const matcher=new IntentMatcher();
  assert(matcher.matchAllowed('ja graag', ['ACCEPT_COFFEE'], HOME_INTENT_VARIANTS)==='ACCEPT_COFFEE','expected coffee acceptance');
  assert(matcher.matchAllowed('ik zet koffi', ['MAKE_COFFEE'], HOME_INTENT_VARIANTS)==='MAKE_COFFEE','expected minor typo tolerance');
  assert(matcher.matchAllowed('de maan is paars', ['MAKE_COFFEE','DECLINE'], HOME_INTENT_VARIANTS)===null,'unrelated text should not match');
});

await test('inventory enforces capacity and a single held item', () => {
  const items=Array.from({length:8},(_,index)=>({id:`item-${index}`,label:`Item ${index}`,location:'IN_BAG' as const}));
  const inventory=new InventoryManager(items);
  assert(!inventory.add('extra','Extra'),'ninth bag item should be rejected');
  assert(inventory.hold('item-0'),'first item should be holdable');
  assert(inventory.hold('item-1'),'second item should become held');
  assert(inventory.heldItem()?.id==='item-1','latest held item should win');
  assert(inventory.get('item-0')?.location==='IN_BAG','previous held item should return to bag');
});

await test('portable items keep coherent surface positions and never fall into an abstract world state', () => {
  const coffeeTable = portableInteractionPlacement('coffee-table', 'keys');
  assert(Boolean(coffeeTable), 'coffee-table placement should exist');
  assert(coffeeTable?.actionPoint.x === portableItemPosition('coffee-table','keys')?.x, 'visual and interaction positions should agree');
  assert(portableItemPosition('fridge','bread') === null, 'closed storage contents should be hidden');

  const inventory = new InventoryManager([
    ...Array.from({length:8},(_,index)=>({id:`bag-${index}`,label:`Bag ${index}`,location:'IN_BAG' as const})),
    {id:'held',label:'Held',location:'HELD' as const},
    {id:'surface',label:'Surface',location:'ON_SURFACE' as const,surfaceId:'coffee-table'}
  ]);
  assert(!inventory.hold('surface'), 'holding a surface item must fail when the full bag cannot receive the old held item');
  assert(inventory.heldItem()?.id === 'held', 'the original held item must remain held');
  assert(inventory.get('surface')?.location === 'ON_SURFACE', 'the surface item must remain positioned');
});

await test('legacy save migrates to version 2 without losing flags', () => {
  const migrated=migrateSaveData({version:1,world:{day:3,minutes:500,bedMade:true},inventory:[{id:'phone',label:'Telefoon',location:'IN_BAG'}],flags:{old:true}});
  assert(migrated?.version===2,'version should migrate to 2');
  assert(migrated?.world.day===3,'day should be preserved');
  assert(migrated?.world.bedMade===true,'world state should be preserved');
  assert(migrated?.flags.old===true,'flags should be preserved');
  assert(migrated?.player.mode==='FREE','legacy player should resume safely');
});

await test('every registered house action is accepted by its room handler', async () => {
  const requiredItems = ['phone','wallet','keys','backpack','mail','book','toothbrush','coat','umbrella','clothes','detergent','bread','toast','mug'];
  for (const object of HOUSE_OBJECTS) {
    if (!object.interaction) continue;
    for (const action of object.interaction.actions) {
      const world = createInitialWorldState();
      world.wardrobeOpen = true;
      world.fridgeOpen = true;
      world.ovenOn = true;
      world.doorLocked = false;
      world.doorOpen = true;
      world.laundryOpen = true;
      world.laundryState = 'LOADED';
      const inventory = new InventoryManager(requiredItems.map((id) => ({ id, label:id, location:'IN_BAG' as const })));
      const session = { seatedAt:null, lyingOnBed:true, busy:false } as HouseActionContext['session'];
      const context: HouseActionContext = {
        world,
        inventory,
        session,
        runner:{ run:async(steps) => { for (const step of steps) { if (step.type==='mutate') step.run(); if (step.type==='advance-time') world.minutes += step.minutes; } } },
        approachPoint:(id)=>houseObjectById(id)?.interaction?.approachPoint ?? {x:0,y:0},
        actionPoint:(id)=>houseObjectById(id)?.interaction?.actionPoint ?? {x:0,y:0},
        toast:()=>{},
        openDialogue:()=>{},
        openInventory:()=>{},
        setObjective:(text)=>{world.currentObjective=text;},
        completeScenario:(id)=>{if(!world.completedScenarios.includes(id))world.completedScenarios.push(id);},
        sync:()=>{},
        autosave:()=>{}
      };
      const handled = await new HouseInteractionController(context).perform(object.id, action.id);
      assert(handled, `unhandled registered action ${object.id}:${action.id}`);
    }
  }
});

await test('action sequence runner preserves declared order', async () => {
  const calls:string[]=[];
  const runtime:HouseActionRuntime={
    face:(direction)=>calls.push(`face:${direction}`),
    move:async(point)=>{calls.push(`move:${point.x},${point.y}`);},
    pose:(pose)=>calls.push(`pose:${pose}`),
    animate:async(action)=>{calls.push(`animate:${action}`);},
    setMode:(mode)=>calls.push(`mode:${mode}`),
    effect:(effect,visible)=>calls.push(`effect:${effect}:${visible}`),
    wait:async(ms)=>{calls.push(`wait:${ms}`);},
    advanceTime:(minutes)=>calls.push(`time:${minutes}`),
    sync:()=>calls.push('sync'),
    pulse:(id)=>calls.push(`pulse:${id}`),
    toast:(text)=>calls.push(`toast:${text}`),
    dialogue:(id)=>calls.push(`dialogue:${id}`),
    autosave:()=>calls.push('autosave')
  };
  const steps:HouseActionStep[]=[{type:'mode',mode:'INTERACTING'},{type:'face',direction:'up'},{type:'animate',action:'use'},{type:'mutate',run:()=>calls.push('mutate')},{type:'sync'},{type:'autosave'}];
  await new HouseActionSequenceRunner(runtime).run(steps);
  assert(calls.join('|')==='mode:INTERACTING|face:up|animate:use|mutate|sync|autosave',calls.join('|'));
});

const failed=results.filter((result)=>!result.passed);
console.log(JSON.stringify({passed:failed.length===0,total:results.length,passedCount:results.length-failed.length,failedCount:failed.length,results},null,2));
if(failed.length) throw new Error(`${failed.length} offline tests failed`);
};

void main();
