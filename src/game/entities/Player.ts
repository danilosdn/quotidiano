import Phaser from 'phaser';
import { PLAYER_SPEED } from '../config/constants';
import { NavigationManager } from '../navigation/NavigationManager';
import type { Point } from '../interactions/types';
import { PlayerState } from '../state/PlayerState';
import type { PlayerFacing, PlayerSnapshot } from '../state/types';
import { PLAYER_FRAME_MAP, type PlayerActionName, type PlayerPose } from './playerFrameMap';

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly state = new PlayerState();
  readonly navigation = new NavigationManager();
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private facing: PlayerFacing = 'down';
  private lastWalkable: Point;

  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly isWalkable: (point: Point) => boolean = () => true
  ) {
    this.sprite = scene.physics.add.sprite(x, y, 'player', PLAYER_FRAME_MAP.idle.down).setDepth(y).setOrigin(0.5, 0.88);
    this.sprite.body!.setSize(22, 16).setOffset(13, 29);
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keys = scene.input.keyboard!.addKeys('W,A,S,D') as typeof this.keys;
    this.lastWalkable = { x, y };
    this.createAnimations();
  }

  private createAnimations(): void {
    const make = (key: string, frames: readonly number[], repeat = -1, frameRate = 9) => {
      if (this.scene.anims.exists(key)) return;
      this.scene.anims.create({ key, frames: frames.map((frame) => ({ key: 'player', frame })), frameRate, repeat });
    };
    for (const direction of ['up', 'down', 'left', 'right'] as const) {
      make(`walk-${direction}`, PLAYER_FRAME_MAP.walk[direction]);
      make(`action-use-${direction}`, PLAYER_FRAME_MAP.use[direction], 0, 8);
      make(`action-eat-${direction}`, PLAYER_FRAME_MAP.eat[direction], 0, 7);
    }
    make('action-lie', PLAYER_FRAME_MAP.lie, 0, 6);
    make('action-phone', PLAYER_FRAME_MAP.phone, 0, 7);
    make('action-read', PLAYER_FRAME_MAP.read, 0, 7);
  }

  update(delta: number): 'arrived' | 'failed' | null {
    if (this.state.mode === 'FREE' || this.state.mode === 'AUTOWALK') this.enforceWalkablePosition();
    const manualX = Number(this.keys.D.isDown || this.cursors.right.isDown) - Number(this.keys.A.isDown || this.cursors.left.isDown);
    const manualY = Number(this.keys.S.isDown || this.cursors.down.isDown) - Number(this.keys.W.isDown || this.cursors.up.isDown);

    if (this.state.isFree() && (manualX || manualY)) {
      this.navigation.cancel(this.sprite);
      this.state.set('FREE');
      const length = Math.hypot(manualX, manualY) || 1;
      this.sprite.setVelocity(manualX / length * PLAYER_SPEED, manualY / length * PLAYER_SPEED);
      this.animateFromVelocity();
    } else if (this.state.isFree() && this.navigation.hasTarget()) {
      this.state.set('AUTOWALK');
      const result = this.navigation.update(this.sprite, delta, PLAYER_SPEED);
      this.animateFromVelocity();
      if (result === 'arrived' || result === 'failed') {
        this.state.set('FREE');
        this.stop();
        return result;
      }
    } else if (this.state.mode === 'FREE') {
      this.stop();
    }
    this.sprite.setDepth(Math.round(this.sprite.y));
    return null;
  }

  place(x: number, y: number): void {
    this.sprite.setPosition(x, y).setVelocity(0, 0);
    this.lastWalkable = { x, y };
  }

  moveToVisual(x: number, y: number, duration = 140): Promise<void> {
    this.sprite.setVelocity(0, 0);
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x,
        y,
        duration,
        ease: 'Sine.easeOut',
        onUpdate: () => this.sprite.setDepth(Math.round(this.sprite.y)),
        onComplete: () => { this.lastWalkable = { x, y }; resolve(); }
      });
    });
  }

  stop(): void {
    this.sprite.setVelocity(0, 0);
    if (this.sprite.anims.isPlaying) this.sprite.anims.stop();
    this.setPose('idle');
  }

  face(direction: PlayerFacing): void {
    this.facing = direction;
    this.sprite.setFlipX(false);
    if (this.sprite.anims.isPlaying) this.sprite.anims.stop();
    this.setPose('idle');
  }

  getFacing(): PlayerFacing { return this.facing; }

  setPose(pose: PlayerPose): void {
    if (this.sprite.anims.isPlaying) this.sprite.anims.stop();
    this.sprite.setAngle(0).setAlpha(1).setFlipX(false);
    if (pose === 'idle') this.sprite.setFrame(PLAYER_FRAME_MAP.idle[this.facing]);
    if (pose === 'sit') this.sprite.setFrame(PLAYER_FRAME_MAP.sit[this.facing]);
    if (pose === 'lie') this.sprite.setFrame(PLAYER_FRAME_MAP.lie[Math.floor(PLAYER_FRAME_MAP.lie.length / 2)]);
  }

  async playAction(action: PlayerActionName): Promise<void> {
    const key = action === 'use' || action === 'eat' ? `action-${action}-${this.facing}` : `action-${action}`;
    const animation = this.scene.anims.get(key);
    if (!animation) { this.setPose(action === 'lie' ? 'lie' : 'idle'); return; }
    await new Promise<void>((resolve) => {
      const complete = () => resolve();
      this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, complete);
      this.sprite.play(key, true);
      this.scene.time.delayedCall(Math.max(500, animation.duration + 120), () => {
        this.sprite.off(Phaser.Animations.Events.ANIMATION_COMPLETE, complete);
        resolve();
      });
    });
  }

  snapshot(): PlayerSnapshot {
    const mode = this.state.mode === 'SITTING' || this.state.mode === 'LYING' ? this.state.mode : 'FREE';
    return { x: this.sprite.x, y: this.sprite.y, facing: this.facing, mode };
  }

  restore(snapshot: PlayerSnapshot): void {
    this.place(snapshot.x, snapshot.y);
    this.facing = snapshot.facing;
    this.state.set(snapshot.mode);
    this.setPose(snapshot.mode === 'SITTING' ? 'sit' : snapshot.mode === 'LYING' ? 'lie' : 'idle');
  }

  private enforceWalkablePosition(): void {
    const current = { x: this.sprite.x, y: this.sprite.y };
    if (this.isWalkable(current)) this.lastWalkable = current;
    else this.sprite.setPosition(this.lastWalkable.x, this.lastWalkable.y).setVelocity(0, 0);
  }

  private animateFromVelocity(): void {
    const { x, y } = this.sprite.body!.velocity;
    if (Math.abs(x) > Math.abs(y)) this.facing = x < 0 ? 'left' : 'right';
    else if (Math.abs(y) > 0) this.facing = y < 0 ? 'up' : 'down';
    if (Math.abs(x) + Math.abs(y) > 0.1) this.sprite.play(`walk-${this.facing}`, true);
  }
}
