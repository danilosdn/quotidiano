import { describe, expect, it } from 'vitest';
import { HouseActionSequenceRunner } from '../../src/game/house/actions/HouseActionSequenceRunner';
import type { HouseActionRuntime, HouseActionStep } from '../../src/game/house/actions/types';

const makeRuntime = (calls: string[]): HouseActionRuntime => ({
  face: (direction) => calls.push(`face:${direction}`),
  move: async (point) => { calls.push(`move:${point.x},${point.y}`); },
  pose: (pose) => calls.push(`pose:${pose}`),
  animate: async (action) => { calls.push(`animate:${action}`); },
  setMode: (mode) => calls.push(`mode:${mode}`),
  effect: (effect, visible) => calls.push(`effect:${effect}:${visible}`),
  wait: async (ms) => { calls.push(`wait:${ms}`); },
  advanceTime: (minutes) => calls.push(`time:${minutes}`),
  sync: () => calls.push('sync'),
  pulse: (id) => calls.push(`pulse:${id}`),
  toast: (text) => calls.push(`toast:${text}`),
  dialogue: (id) => calls.push(`dialogue:${id}`),
  autosave: () => calls.push('autosave')
});

describe('House action sequence runner', () => {
  it('executes visual, state and persistence steps in the declared order', async () => {
    const calls: string[] = [];
    const steps: HouseActionStep[] = [
      { type: 'mode', mode: 'INTERACTING' },
      { type: 'face', direction: 'up' },
      { type: 'animate', action: 'use' },
      { type: 'mutate', run: () => calls.push('mutate') },
      { type: 'sync' },
      { type: 'autosave' }
    ];
    await new HouseActionSequenceRunner(makeRuntime(calls)).run(steps);
    expect(calls).toEqual(['mode:INTERACTING', 'face:up', 'animate:use', 'mutate', 'sync', 'autosave']);
  });

  it('does not start a second sequence while the first one is running', async () => {
    const calls: string[] = [];
    let release!: () => void;
    const runtime = makeRuntime(calls);
    runtime.wait = async () => new Promise<void>((resolve) => { release = resolve; });
    const runner = new HouseActionSequenceRunner(runtime);
    const first = runner.run([{ type: 'wait', ms: 1 }, { type: 'toast', text: 'first' }]);
    await Promise.resolve();
    await runner.run([{ type: 'toast', text: 'second' }]);
    release();
    await first;
    expect(calls).toEqual(['toast:first']);
  });
});
