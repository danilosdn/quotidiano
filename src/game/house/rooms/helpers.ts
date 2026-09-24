import type { HouseActionContext } from '../actions/types';

export const ensureItem = (context: HouseActionContext, id: string, label: string, location: 'WORLD'|'IN_BAG'|'HELD'|'ON_SURFACE' = 'WORLD', surfaceId?: string): void => {
  if (!context.inventory.anywhere(id)) context.inventory.set(id, label, location, surfaceId ? { surfaceId } : {});
};

export const canTake = (context: HouseActionContext, id: string, label: string): boolean => {
  ensureItem(context, id, label);
  if (context.inventory.hold(id)) return true;
  context.toast('De rugzak is vol. Maak eerst ruimte.');
  return false;
};

export const finish = (context: HouseActionContext): void => {
  context.sync();
  context.autosave();
};
