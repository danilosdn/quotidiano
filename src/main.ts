import Phaser from 'phaser';
import './style.css';
import { gameConfig } from './game/config/gameConfig';
import { UIController } from './ui/UIController';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div id="game-shell">
  <div id="game"></div>
  <div class="hud"><div class="chip"><strong>QUOTIDIANO</strong> · Casa</div><div class="chip" id="clock">Ma 07:00 · A1</div></div>
  <div id="prompt"></div>
  <section id="interaction-panel" class="panel"></section>
  <section id="phone-panel" class="panel"></section>
</div>`;

const ui = new UIController();
(globalThis as typeof globalThis & { QUOTIDIANO_UI?: UIController }).QUOTIDIANO_UI = ui;
new Phaser.Game({ ...gameConfig, parent: 'game' });
