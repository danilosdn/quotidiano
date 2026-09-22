export type Facing = 'up' | 'down' | 'left' | 'right';

export interface AnchorPoint { x: number; y: number; facing: Facing }
export interface InteractionDefinition {
  id: string;
  label: () => string;
  hotspot: { x: number; y: number; radius: number };
  anchor?: AnchorPoint;
  priority?: number;
  enabled?: () => boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  trigger: () => void | Promise<void>;
}
