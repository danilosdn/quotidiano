import { beforeEach, describe, expect, it } from 'vitest';
import { inventory } from '../src/game/inventory/InventoryManager';
import { worldState } from '../src/game/state/WorldState';

describe('inventory',()=>{
  beforeEach(()=>worldState.reset());
  it('collects and consumes keys/coffee',()=>{
    expect(inventory.has('keys')).toBe(false);
    expect(inventory.add('keys')).toBe(true);
    expect(inventory.has('keys')).toBe(true);
    expect(inventory.add('coffee')).toBe(true);
    expect(inventory.remove('coffee')).toBe(true);
    expect(inventory.has('coffee')).toBe(false);
  });
});
