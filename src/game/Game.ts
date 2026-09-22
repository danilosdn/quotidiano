import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';

let game: Phaser.Game | undefined;
export function createGame(): Phaser.Game {
  game ??= new Phaser.Game(gameConfig);
  return game;
}
