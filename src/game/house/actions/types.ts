import type { InventoryManager } from '../../inventory/InventoryManager';
import type { Point } from '../../interactions/types';
import type { PlayerActionName, PlayerPose } from '../../entities/playerFrameMap';
import type { PlayerFacing, PlayerMode, WorldState } from '../../state/types';

export type HouseEffectName = 'shower' | 'sink-water' | 'sleep' | 'washing';

export type HouseActionStep =
  | { type:'face'; direction:PlayerFacing }
  | { type:'move'; point:Point; duration?:number }
  | { type:'pose'; pose:PlayerPose }
  | { type:'animate'; action:PlayerActionName }
  | { type:'mode'; mode:PlayerMode }
  | { type:'effect'; effect:HouseEffectName; visible:boolean }
  | { type:'wait'; ms:number }
  | { type:'advance-time'; minutes:number }
  | { type:'mutate'; run:()=>void }
  | { type:'sync' }
  | { type:'pulse'; objectId:string }
  | { type:'toast'; text:string; ms?:number }
  | { type:'dialogue'; dialogueId:string }
  | { type:'autosave' };

export interface HouseActionRuntime {
  face(direction: PlayerFacing): void;
  move(point: Point, duration?: number): Promise<void>;
  pose(pose: PlayerPose): void;
  animate(action: PlayerActionName): Promise<void>;
  setMode(mode: PlayerMode): void;
  effect(effect: HouseEffectName, visible: boolean): void;
  wait(ms: number): Promise<void>;
  advanceTime(minutes: number): void;
  sync(): void;
  pulse(objectId: string): void;
  toast(text: string, ms?: number): void;
  dialogue(dialogueId: string): void;
  autosave(): void;
}

export interface HouseSessionState {
  seatedAt: 'bed' | 'desk' | 'dining-table' | 'sofa' | null;
  lyingOnBed: boolean;
  busy: boolean;
}

export interface HouseActionContext {
  world: WorldState;
  inventory: InventoryManager;
  runner: { run(steps: readonly HouseActionStep[]): Promise<void> };
  session: HouseSessionState;
  approachPoint(objectId: string): Point;
  actionPoint(objectId: string): Point;
  toast(text: string, ms?: number): void;
  openDialogue(dialogueId: string): void;
  openInventory(): void;
  setObjective(text: string): void;
  completeScenario(id: string): void;
  sync(): void;
  autosave(): void;
}

export type RoomActionHandler = (objectId: string, actionId: string, context: HouseActionContext) => Promise<boolean>;
