import type { InventoryItem, ItemLocation } from '../state/types';

export class InventoryManager {
  static readonly CAPACITY = 8;
  private readonly items: InventoryItem[];
  constructor(items: InventoryItem[]) { this.items = items; }
  all(): readonly InventoryItem[] { return this.items; }
  bagItems(): readonly InventoryItem[] { return this.items.filter((i) => i.location === 'IN_BAG'); }
  has(id: string, location: ItemLocation = 'IN_BAG'): boolean { return this.items.some((i) => i.id === id && i.location === location); }
  anywhere(id: string): boolean { return this.items.some((i) => i.id === id); }
  get(id: string): InventoryItem | undefined { return this.items.find((i) => i.id === id); }
  add(id: string, label: string): boolean { return this.set(id, label, 'IN_BAG'); }
  set(id: string, label: string, location: ItemLocation): boolean {
    if (location === 'IN_BAG' && !this.has(id, 'IN_BAG') && this.bagItems().length >= InventoryManager.CAPACITY) return false;
    const existing = this.items.find((i) => i.id === id);
    if (existing) { existing.label = label; existing.location = location; }
    else this.items.push({ id, label, location });
    return true;
  }
  move(id: string, location: ItemLocation): boolean {
    const item = this.items.find((i) => i.id === id);
    if (!item) return false;
    if (location === 'IN_BAG' && item.location !== 'IN_BAG' && this.bagItems().length >= InventoryManager.CAPACITY) return false;
    item.location = location;
    return true;
  }
  remove(id: string): boolean {
    const index = this.items.findIndex((i) => i.id === id);
    if (index < 0) return false;
    this.items.splice(index, 1);
    return true;
  }
}
