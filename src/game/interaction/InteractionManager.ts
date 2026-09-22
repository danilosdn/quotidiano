import { InteractionDefinition } from './InteractionTypes';

export class InteractionManager {
  private items: InteractionDefinition[] = [];
  register(item: InteractionDefinition): void { this.items.push(item); }
  clear(): void { this.items = []; }

  nearest(x: number, y: number): InteractionDefinition | null {
    const candidates = this.items
      .filter(item => !item.enabled || item.enabled())
      .map(item => {
        const distance = Math.hypot(x - item.hotspot.x, y - item.hotspot.y);
        return { item, distance, normalizedDistance: distance / Math.max(1, item.hotspot.radius) };
      })
      .filter(candidate => candidate.distance <= candidate.item.hotspot.radius)
      .sort((a, b) => {
        const priorityDelta = (b.item.priority ?? 0) - (a.item.priority ?? 0);
        if (priorityDelta !== 0) return priorityDelta;
        const normalizedDelta = a.normalizedDistance - b.normalizedDistance;
        if (Math.abs(normalizedDelta) > 0.001) return normalizedDelta;
        return a.distance - b.distance;
      });
    return candidates[0]?.item ?? null;
  }
}
