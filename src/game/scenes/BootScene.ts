import Phaser from 'phaser';
import { HOUSE_IMAGE_ASSETS, HOUSE_SPRITE_ASSETS } from '../house/HouseAssetManifest';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload(): void {
    for (const asset of HOUSE_IMAGE_ASSETS) this.load.image(asset.key, asset.path);
    for (const asset of HOUSE_SPRITE_ASSETS) this.load.spritesheet(asset.key, asset.path, { frameWidth: asset.frameWidth, frameHeight: asset.frameHeight });
  }
  create(): void { this.scene.start('HomeScene'); }
}
