import './ui/styles.css';
import { createGame } from './game/Game';

const app=document.querySelector<HTMLDivElement>('#app');
if(!app) throw new Error('App root not found');
app.innerHTML='<div id="game-shell"><div id="game-root"></div><div id="ui-root"></div></div>';
createGame();
