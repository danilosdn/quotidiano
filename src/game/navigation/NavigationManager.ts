import Phaser from 'phaser';
import type { Point } from '../interactions/types';

export class NavigationManager {
  private route: Point[] = [];
  private destination: Point | null = null;
  private stuckMs = 0;
  private retries = 0;
  private last = { x: 0, y: 0 };
  private repath: ((from: Point, to: Point) => Point[] | null) | null = null;

  setPath(destination: Point, route: Point[], sprite: Phaser.Physics.Arcade.Sprite, repath?: (from: Point, to: Point) => Point[] | null): void {
    this.destination = destination;
    this.route = [...route];
    this.stuckMs = 0;
    this.retries = 0;
    this.last = { x: sprite.x, y: sprite.y };
    this.repath = repath ?? null;
  }

  cancel(sprite: Phaser.Physics.Arcade.Sprite): void {
    this.route = [];
    this.destination = null;
    this.repath = null;
    sprite.setVelocity(0, 0);
  }

  hasTarget(): boolean { return this.destination !== null; }

  update(sprite: Phaser.Physics.Arcade.Sprite, delta: number, speed: number): 'moving' | 'arrived' | 'failed' | 'idle' {
    if (!this.destination) return 'idle';
    if (!this.route.length) {
      this.cancel(sprite);
      return 'arrived';
    }

    const target = this.route[0];
    const dx = target.x - sprite.x, dy = target.y - sprite.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 8) {
      this.route.shift();
      if (!this.route.length) { this.cancel(sprite); return 'arrived'; }
      return 'moving';
    }
    sprite.setVelocity((dx / distance) * speed, (dy / distance) * speed);

    const progress = Math.hypot(sprite.x - this.last.x, sprite.y - this.last.y);
    if (progress < 0.8) this.stuckMs += delta;
    else { this.stuckMs = 0; this.last = { x: sprite.x, y: sprite.y }; }

    if (this.stuckMs >= 600) {
      this.retries += 1;
      this.stuckMs = 0;
      this.last = { x: sprite.x, y: sprite.y };
      if (this.retries > 3 || !this.destination || !this.repath) {
        this.cancel(sprite);
        return 'failed';
      }
      const route = this.repath({ x: sprite.x, y: sprite.y }, this.destination);
      if (!route?.length) {
        this.cancel(sprite);
        return 'failed';
      }
      this.route = route;
    }
    return 'moving';
  }
}
