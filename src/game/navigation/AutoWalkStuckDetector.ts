import { Point } from './NavigationManager';

export type StuckAction = 'none' | 'replan' | 'cancel';

export class AutoWalkStuckDetector {
  private stalledMs = 0;
  private attempts = 0;
  private previous?: Point;

  constructor(
    readonly thresholdMs = 680,
    readonly movementThreshold = 0.9,
    readonly maxReplans = 2
  ) {}

  begin(position: Point): void {
    this.stalledMs = 0;
    this.attempts = 0;
    this.previous = { ...position };
  }

  stop(): void {
    this.stalledMs = 0;
    this.attempts = 0;
    this.previous = undefined;
  }

  sample(position: Point, deltaMs: number, isTryingToMove: boolean): StuckAction {
    if (!this.previous) {
      this.previous = { ...position };
      return 'none';
    }
    const moved = Math.hypot(position.x - this.previous.x, position.y - this.previous.y);
    this.previous = { ...position };
    if (!isTryingToMove || moved >= this.movementThreshold) {
      this.stalledMs = 0;
      return 'none';
    }
    this.stalledMs += deltaMs;
    if (this.stalledMs < this.thresholdMs) return 'none';
    this.stalledMs = 0;
    if (this.attempts < this.maxReplans) {
      this.attempts += 1;
      return 'replan';
    }
    return 'cancel';
  }

  replanSucceeded(position: Point): void {
    this.previous = { ...position };
    this.stalledMs = 0;
  }

  get replanAttempts(): number { return this.attempts; }
}
