import { InventoryItem, worldState } from '../state/WorldState';

export const ITEM_CATALOG: Record<string, Omit<InventoryItem, 'quantity'>> = {
  keys: { id: 'keys', nameNl: 'sleutels', namePt: 'chaves', icon: 'keys', description: 'As chaves de casa.' },
  phone: { id: 'phone', nameNl: 'telefoon', namePt: 'telefone', icon: 'phone', description: 'Seu telefone.' },
  wallet: { id: 'wallet', nameNl: 'portemonnee', namePt: 'carteira', icon: 'wallet', description: 'Sua carteira.' },
  coffee: { id: 'coffee', nameNl: 'koffie', namePt: 'café', icon: 'coffee_cup', description: 'Café recém-preparado por Sanne.' }
};

export class InventoryManager {
  readonly capacity = 8;
  get items(): InventoryItem[] { return worldState.data.inventory; }
  has(id: string): boolean { return this.items.some(i => i.id === id && i.quantity > 0); }
  add(id: string, quantity = 1): boolean {
    const existing = this.items.find(i => i.id === id);
    if (existing) { existing.quantity += quantity; worldState.touch(); return true; }
    if (this.items.length >= this.capacity || !ITEM_CATALOG[id]) return false;
    this.items.push({ ...ITEM_CATALOG[id], quantity });
    worldState.touch();
    return true;
  }
  remove(id: string, quantity = 1): boolean {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx < 0 || this.items[idx].quantity < quantity) return false;
    this.items[idx].quantity -= quantity;
    if (this.items[idx].quantity <= 0) this.items.splice(idx, 1);
    worldState.touch();
    return true;
  }
}

export const inventory = new InventoryManager();
