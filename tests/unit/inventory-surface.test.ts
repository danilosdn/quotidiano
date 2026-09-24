import { describe, expect, it } from 'vitest';
import { InventoryManager } from '../../src/game/inventory/InventoryManager';

describe('Inventory world/hand/bag/surface states', () => {
  it('moves a portable item through all four locations without duplication', () => {
    const inventory = new InventoryManager([{ id: 'mug', label: 'Kopje', location: 'WORLD' }]);
    expect(inventory.hold('mug')).toBe(true);
    expect(inventory.heldItem()?.id).toBe('mug');
    expect(inventory.putInBag('mug')).toBe(true);
    expect(inventory.has('mug')).toBe(true);
    expect(inventory.placeOnSurface('mug', 'coffee-table')).toBe(true);
    expect(inventory.surfaceItems('coffee-table').map((item) => item.id)).toEqual(['mug']);
    expect(inventory.all()).toHaveLength(1);
  });

  it('preserves only one held item', () => {
    const inventory = new InventoryManager([
      { id: 'book', label: 'Boek', location: 'IN_BAG' },
      { id: 'keys', label: 'Sleutels', location: 'IN_BAG' }
    ]);
    inventory.hold('book');
    inventory.hold('keys');
    expect(inventory.heldItem()?.id).toBe('keys');
    expect(inventory.get('book')?.location).toBe('IN_BAG');
  });
});
