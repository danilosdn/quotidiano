import type { InteractionDefinition } from './types';

export class InteractionRegistry {
  private readonly entries = new Map<string, InteractionDefinition>();
  register(entry: InteractionDefinition): void { this.entries.set(entry.id, entry); }
  get(id: string): InteractionDefinition | undefined { return this.entries.get(id); }
  all(): InteractionDefinition[] { return [...this.entries.values()]; }
  nearest(x: number, y: number, maxDistance = 86): InteractionDefinition | null {
    return this.all()
      .map((i) => ({ i, d: Math.hypot(i.actionPoint.x - x, i.actionPoint.y - y) }))
      .filter(({ i, d }) => d <= Math.min(maxDistance, i.radius))
      .sort((a, b) => a.d - b.d || b.i.priority - a.i.priority)[0]?.i ?? null;
  }
}
