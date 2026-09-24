import type { PlayerMode } from '../state/types';

export interface Point { x: number; y: number }
export interface InteractionAction {
  id: string;
  label: string;
  resultingMode?: PlayerMode;
  conditions?: readonly string[];
  effects?: readonly string[];
}
export interface InteractionDefinition {
  id: string;
  objectId: string;
  room: string;
  type: 'critical' | 'important' | 'inventory' | 'seat' | 'observation';
  actions: InteractionAction[];
  approachPoint: Point;
  actionPoint: Point;
  facing: 'up' | 'down' | 'left' | 'right';
  radius: number;
  priority: number;
  conditions?: readonly string[];
  effects?: readonly string[];
  persistentState?: string;
}
