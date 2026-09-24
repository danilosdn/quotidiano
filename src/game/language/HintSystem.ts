export type HintLevel = 0 | 1 | 2 | 3 | 4;
export class HintSystem {
  private level: HintLevel = 0;
  get current(): HintLevel { return this.level; }
  escalate(): HintLevel { this.level = Math.min(4, this.level + 1) as HintLevel; return this.level; }
  reset(): void { this.level = 0; }
}
