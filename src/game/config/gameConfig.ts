import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { TitleScene } from '../scenes/TitleScene';
import { HomeScene } from '../scenes/HomeScene';
import { StreetScene } from '../scenes/StreetScene';
import { CafeScene } from '../scenes/CafeScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 1280,
  height: 720,
  backgroundColor: '#efe4cf',
  transparent: false,
  pixelArt: false,
  antialias: true,
  physics: {
    default: 'arcade',
    arcade: { debug: false, gravity: { x: 0, y: 0 } }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: [BootScene, TitleScene, HomeScene, StreetScene, CafeScene]
};
