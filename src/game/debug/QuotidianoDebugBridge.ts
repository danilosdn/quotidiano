import type { validateHouseDefinition } from '../house/HouseValidator';

export interface QuotidianoDebugBridge {
  version: 'house-v3';
  getState(): object;
  validate(): ReturnType<typeof validateHouseDefinition>;
  teleportTo(objectId: string): boolean;
  openObject(objectId: string): boolean;
  perform(objectId: string, actionId: string): Promise<boolean>;
  clearSave(): void;
  toggleDebug(): boolean;
}

declare global {
  /** Exposed deliberately for Playwright and local debugging in the local game runtime. */
  var QUOTIDIANO_DEBUG: QuotidianoDebugBridge | undefined;
}
