import type { InventoryItem, ItemLocation } from '../state/types';

export interface MoveOptions {
  surfaceId?: string;
  equipped?: boolean;
}

export class InventoryManager {
  static readonly CAPACITY = 8;
  private readonly items: InventoryItem[];

  constructor(items: readonly InventoryItem[]) {
    const unique = new Map<string, InventoryItem>();
    for (const item of items) unique.set(item.id, { portable: true, ...item });
    this.items = [...unique.values()];
    this.ensureSingleHeldItem();
  }

  all(): readonly InventoryItem[] { return this.items; }
  serialize(): InventoryItem[] { return this.items.map((item) => ({ ...item })); }
  bagItems(): readonly InventoryItem[] { return this.items.filter((item) => item.location === 'IN_BAG'); }
  heldItem(): InventoryItem | undefined { return this.items.find((item) => item.location === 'HELD'); }
  surfaceItems(surfaceId?: string): readonly InventoryItem[] {
    return this.items.filter((item) => item.location === 'ON_SURFACE' && (!surfaceId || item.surfaceId === surfaceId));
  }
  equippedItems(): readonly InventoryItem[] { return this.items.filter((item) => item.equipped); }
  has(id: string, location: ItemLocation = 'IN_BAG'): boolean { return this.items.some((item) => item.id === id && item.location === location); }
  anywhere(id: string): boolean { return this.items.some((item) => item.id === id); }
  get(id: string): InventoryItem | undefined { return this.items.find((item) => item.id === id); }

  add(id: string, label: string, options: MoveOptions = {}): boolean {
    return this.set(id, label, 'IN_BAG', options);
  }

  set(id: string, label: string, location: ItemLocation, options: MoveOptions = {}): boolean {
    if (!this.canMoveToBag(id, location)) return false;
    if (location === 'HELD' && !this.canReplaceHeld(id)) return false;
    if (location === 'HELD') this.releaseHeldItem(id);
    const existing = this.items.find((item) => item.id === id);
    const next: InventoryItem = {
      id,
      label,
      location,
      portable: existing?.portable ?? true,
      equipped: options.equipped ?? existing?.equipped ?? false,
      ...(location === 'ON_SURFACE' && options.surfaceId ? { surfaceId: options.surfaceId } : {})
    };
    if (existing) Object.assign(existing, next);
    else this.items.push(next);
    if (location !== 'ON_SURFACE') delete (existing ?? next).surfaceId;
    return true;
  }

  move(id: string, location: ItemLocation, options: MoveOptions = {}): boolean {
    const item = this.items.find((candidate) => candidate.id === id);
    if (!item || item.portable === false) return false;
    if (!this.canMoveToBag(id, location)) return false;
    if (location === 'HELD' && !this.canReplaceHeld(id)) return false;
    if (location === 'HELD') this.releaseHeldItem(id);
    item.location = location;
    item.equipped = options.equipped ?? item.equipped;
    if (location === 'ON_SURFACE' && options.surfaceId) item.surfaceId = options.surfaceId;
    else delete item.surfaceId;
    return true;
  }

  hold(id: string): boolean { return this.move(id, 'HELD'); }
  putInBag(id: string): boolean { return this.move(id, 'IN_BAG'); }
  placeOnSurface(id: string, surfaceId: string): boolean { return this.move(id, 'ON_SURFACE', { surfaceId }); }
  equip(id: string, equipped = true): boolean {
    const item = this.get(id);
    if (!item) return false;
    item.equipped = equipped;
    return true;
  }

  remove(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index < 0) return false;
    this.items.splice(index, 1);
    return true;
  }

  private canMoveToBag(id: string, location: ItemLocation): boolean {
    return location !== 'IN_BAG' || this.has(id, 'IN_BAG') || this.bagItems().length < InventoryManager.CAPACITY;
  }

  private canReplaceHeld(nextId: string): boolean {
    const held = this.heldItem();
    if (!held || held.id === nextId) return true;
    const next = this.get(nextId);
    return next?.location === 'IN_BAG' || this.bagItems().length < InventoryManager.CAPACITY;
  }

  private releaseHeldItem(exceptId: string): void {
    const held = this.heldItem();
    if (!held || held.id === exceptId) return;
    held.location = 'IN_BAG';
    delete held.surfaceId;
  }

  private ensureSingleHeldItem(): void {
    let found = false;
    for (const item of this.items) {
      if (item.location !== 'HELD') continue;
      if (!found) { found = true; continue; }
      item.location = 'IN_BAG';
    }
  }
}
