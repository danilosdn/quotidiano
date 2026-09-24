import { InventoryManager } from '../inventory/InventoryManager';
import { SaveManager } from '../persistence/SaveManager';
import { createInitialPreferences, createInitialWorldState } from '../state/WorldState';
import type { InventoryItem, PlayerPreferences, PlayerSnapshot, SaveData, WorldState } from '../state/types';
import { HOUSE_LAYOUT } from './HouseLayout';

const initialInventory = (): InventoryItem[] => [
  { id:'phone', label:'Telefoon', location:'IN_BAG', portable:true },
  { id:'wallet', label:'Portemonnee', location:'IN_BAG', portable:true },
  { id:'keys', label:'Sleutels', location:'ON_SURFACE', surfaceId:'entry-console', portable:true },
  { id:'backpack', label:'Rugzak', location:'ON_SURFACE', surfaceId:'bedroom', portable:true },
  { id:'mail', label:'Brief', location:'ON_SURFACE', surfaceId:'entry-console', portable:true },
  { id:'book', label:'Boek', location:'ON_SURFACE', surfaceId:'bookshelf', portable:true },
  { id:'toothbrush', label:'Tandenborstel', location:'ON_SURFACE', surfaceId:'bathroom-sink', portable:true },
  { id:'coat', label:'Jas', location:'ON_SURFACE', surfaceId:'coat-hook', portable:true },
  { id:'umbrella', label:'Paraplu', location:'ON_SURFACE', surfaceId:'entry', portable:true },
  { id:'clothes', label:'Wasgoed', location:'ON_SURFACE', surfaceId:'laundry-basket', portable:true },
  { id:'detergent', label:'Wasmiddel', location:'ON_SURFACE', surfaceId:'laundry-shelf', portable:true }
];

export class HouseStateService {
  readonly world: WorldState;
  readonly inventory: InventoryManager;
  readonly flags: Record<string, boolean>;
  readonly preferences: PlayerPreferences;
  readonly restoredPlayer: PlayerSnapshot;

  constructor(private readonly saves: SaveManager, saved = saves.load()) {
    this.world = saved?.world ?? createInitialWorldState();
    this.inventory = new InventoryManager(saved?.inventory ?? initialInventory());
    this.flags = { ...(saved?.flags ?? {}) };
    this.preferences = { ...createInitialPreferences(), ...(saved?.preferences ?? {}) };
    this.restoredPlayer = saved?.player ?? { ...HOUSE_LAYOUT.safeResumePoint, facing:'down', mode:'FREE' };
    this.ensureRequiredItems();
  }

  advanceTime(minutes: number): void {
    const total = this.world.minutes + Math.max(0, minutes);
    this.world.day += Math.floor(total / (24 * 60));
    this.world.minutes = total % (24 * 60);
  }

  completeScenario(id: string): void {
    if (!this.world.completedScenarios.includes(id)) this.world.completedScenarios.push(id);
    this.flags[`scenario:${id}`] = true;
  }

  setObjective(text: string): void { this.world.currentObjective = text; }

  createSave(player: PlayerSnapshot): SaveData {
    return {
      version: 2,
      scene: 'HomeScene',
      world: {
        ...this.world,
        roomLights: { ...this.world.roomLights },
        completedScenarios: [...this.world.completedScenarios]
      },
      inventory: this.inventory.serialize(),
      flags: { ...this.flags },
      player,
      preferences: { ...this.preferences },
      updatedAt: new Date().toISOString()
    };
  }

  save(player: PlayerSnapshot): void { this.saves.save(this.createSave(player)); }

  private ensureRequiredItems(): void {
    const required = initialInventory();
    for (const item of required) {
      if (!this.inventory.anywhere(item.id)) this.inventory.set(item.id, item.label, item.location, { surfaceId:item.surfaceId, equipped:item.equipped });
    }
  }
}
