import Phaser from 'phaser';
import './style.css';
import { gameConfig } from './game/config/gameConfig';
import { UIController } from './ui/UIController';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div id="game-shell">
  <div id="game" aria-label="QUOTIDIANO speelwereld"></div>
  <div class="hud hud-top">
    <div class="chip brand-chip"><strong>QUOTIDIANO</strong><span id="location">Thuis</span></div>
    <div class="chip" id="clock">Dag 1 · 07:00</div>
    <div class="chip" id="hint-level">Hulp 1/4</div>
  </div>
  <div class="hud hud-bottom"><div class="objective-chip"><span>Nu</span><strong id="objective">Begin rustig aan je ochtend.</strong></div></div>
  <div id="prompt" role="status" aria-live="polite"></div>
  <section id="interaction-panel" class="panel" aria-live="polite"></section>
  <section id="phone-panel" class="panel phone-panel"></section>
</div>`;

const ui = new UIController();
(globalThis as typeof globalThis & { QUOTIDIANO_UI?: UIController }).QUOTIDIANO_UI = ui;
new Phaser.Game({ ...gameConfig, parent: 'game' });
