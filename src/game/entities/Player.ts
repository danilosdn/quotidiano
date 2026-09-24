import Phaser from 'phaser';
import { PLAYER_SPEED } from '../config/constants';
import { PlayerState } from '../state/PlayerState';
import { NavigationManager } from '../navigation/NavigationManager';
import type { Point } from '../interactions/types';

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly state = new PlayerState();
  readonly navigation = new NavigationManager();
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private facing: 'up'|'down'|'left'|'right' = 'down';
  private lastWalkable: Point;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number, private readonly isWalkable: (point: Point) => boolean = () => true) {
    this.sprite = scene.physics.add.sprite(x, y, 'player', 186).setDepth(y).setOrigin(0.5, 0.88);
    this.sprite.body!.setSize(22, 16).setOffset(13, 29);
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D') as typeof this.keys;
    this.lastWalkable = { x, y };
    this.createAnimations();
  }

  private createAnimations(): void {
    const make = (key: string, frames: number[]) => {
      if (!this.scene.anims.exists(key)) this.scene.anims.create({ key, frames: frames.map((frame) => ({ key: 'player', frame })), frameRate: 9, repeat: -1 });
    };
    make('walk-down', [298,299,300,301,302,303]);
    make('walk-up', [286,287,288,289,290,291]);
    make('walk-left', [280,281,282,283,284,285]);
    make('walk-right', [292,293,294,295,296,297]);
  }

  update(delta: number): 'arrived' | 'failed' | null {
    if (this.state.mode === 'FREE' || this.state.mode === 'AUTOWALK') this.enforceWalkablePosition();
    const manualX = Number(this.keys.D.isDown || this.cursors.right.isDown) - Number(this.keys.A.isDown || this.cursors.left.isDown);
    const manualY = Number(this.keys.S.isDown || this.cursors.down.isDown) - Number(this.keys.W.isDown || this.cursors.up.isDown);
    if (this.state.isFree() && (manualX || manualY)) {
      this.navigation.cancel(this.sprite);
      this.state.set('FREE');
      const len = Math.hypot(manualX, manualY) || 1;
      this.sprite.setVelocity(manualX / len * PLAYER_SPEED, manualY / len * PLAYER_SPEED);
      this.animateFromVelocity();
    } else if (this.state.isFree() && this.navigation.hasTarget()) {
      this.state.set('AUTOWALK');
      const result = this.navigation.update(this.sprite, delta, PLAYER_SPEED);
      this.animateFromVelocity();
      if (result === 'arrived' || result === 'failed') { this.state.set('FREE'); return result; }
    } else if (this.state.mode === 'FREE') {
      this.sprite.setVelocity(0,0); this.sprite.anims.stop(); this.setIdleFrame();
    }
    this.sprite.setDepth(Math.round(this.sprite.y));
    return null;
  }

  place(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.lastWalkable = { x, y };
  }

  private enforceWalkablePosition(): void {
    const current = { x: this.sprite.x, y: this.sprite.y };
    if (this.isWalkable(current)) this.lastWalkable = current;
    else this.sprite.setPosition(this.lastWalkable.x, this.lastWalkable.y).setVelocity(0, 0);
  }

  private animateFromVelocity(): void {
    const { x, y } = this.sprite.body!.velocity;
    if (Math.abs(x) > Math.abs(y)) this.facing = x < 0 ? 'left' : 'right'; else if (Math.abs(y) > 0) this.facing = y < 0 ? 'up' : 'down';
    if (Math.abs(x) + Math.abs(y) > 0.1) this.sprite.play(`walk-${this.facing}`, true);
  }
  face(dir: 'up'|'down'|'left'|'right'): void { this.facing = dir; this.sprite.anims.stop(); this.setIdleFrame(); }
  private setIdleFrame(): void {
    const frame = { down: 186, up: 174, left: 180, right: 184 }[this.facing];
    this.sprite.setFrame(frame);
  }
}
