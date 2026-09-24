import type { PlayerMode } from './types';

export class PlayerState {
  private _mode: PlayerMode = 'FREE';
  get mode(): PlayerMode { return this._mode; }
  set(mode: PlayerMode): void { this._mode = mode; }
  isFree(): boolean { return this._mode === 'FREE' || this._mode === 'AUTOWALK'; }
}
