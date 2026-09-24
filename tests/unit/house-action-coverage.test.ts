import { describe, expect, it } from 'vitest';
import { HouseInteractionController } from '../../src/game/house/HouseInteractionController';
import { HOUSE_OBJECTS, houseObjectById } from '../../src/game/house/HouseObjectRegistry';
import type { HouseActionContext } from '../../src/game/house/actions/types';
import { InventoryManager } from '../../src/game/inventory/InventoryManager';
import { createInitialWorldState } from '../../src/game/state/WorldState';

const createContext = (): HouseActionContext => {
  const world = createInitialWorldState();
  Object.assign(world, {
    wardrobeOpen: true,
    fridgeOpen: true,
    ovenOn: true,
    doorLocked: false,
    doorOpen: true,
    laundryOpen: true,
    laundryState: 'LOADED'
  });
  const ids = ['phone','wallet','keys','backpack','mail','book','toothbrush','coat','umbrella','clothes','detergent','bread','toast','mug'];
  const inventory = new InventoryManager(ids.map((id) => ({ id, label:id, location:'IN_BAG' as const })));
  const session: HouseActionContext['session'] = { seatedAt:null, lyingOnBed:true, busy:false };
  return {
    world,
    inventory,
    session,
    runner:{ run:async(steps) => {
      for (const step of steps) {
        if (step.type === 'mutate') step.run();
        if (step.type === 'advance-time') world.minutes += step.minutes;
      }
    } },
    approachPoint:(id)=>houseObjectById(id)?.interaction?.approachPoint ?? {x:0,y:0},
    actionPoint:(id)=>houseObjectById(id)?.interaction?.actionPoint ?? {x:0,y:0},
    toast:()=>{},
    openDialogue:()=>{},
    openInventory:()=>{},
    setObjective:(text)=>{ world.currentObjective=text; },
    completeScenario:(id)=>{ if (!world.completedScenarios.includes(id)) world.completedScenarios.push(id); },
    sync:()=>{},
    autosave:()=>{}
  };
};

describe('House action coverage', () => {
  it('routes every registered action to a room handler', async () => {
    for (const object of HOUSE_OBJECTS) {
      if (!object.interaction) continue;
      for (const action of object.interaction.actions) {
        const handled = await new HouseInteractionController(createContext()).perform(object.id, action.id);
        expect(handled, `${object.id}:${action.id}`).toBe(true);
      }
    }
  });
});
