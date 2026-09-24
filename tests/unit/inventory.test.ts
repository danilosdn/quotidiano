import { describe, expect, it } from 'vitest';
import { InventoryManager } from '../../src/game/inventory/InventoryManager';

describe('InventoryManager', () => {
  it('moves world items into the bag without duplicating them', () => {
    const manager = new InventoryManager([{ id:'keys', label:'Sleutels', location:'WORLD' }]);
    expect(manager.add('keys','Sleutels')).toBe(true);
    expect(manager.has('keys')).toBe(true);
    expect(manager.all()).toHaveLength(1);
  });
  it('enforces the eight-slot bag capacity', () => {
    const manager = new InventoryManager(Array.from({length:8},(_,i)=>({id:`i${i}`,label:`I${i}`,location:'IN_BAG' as const})));
    expect(manager.add('extra','Extra')).toBe(false);
  });
});
