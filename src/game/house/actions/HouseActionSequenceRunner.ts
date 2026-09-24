import type { HouseActionRuntime, HouseActionStep } from './types';

export class HouseActionSequenceRunner {
  private running = false;
  constructor(private readonly runtime: HouseActionRuntime) {}
  get isRunning(): boolean { return this.running; }

  async run(steps: readonly HouseActionStep[]): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      for (const step of steps) {
        if (step.type === 'face') this.runtime.face(step.direction);
        else if (step.type === 'move') await this.runtime.move(step.point, step.duration);
        else if (step.type === 'pose') this.runtime.pose(step.pose);
        else if (step.type === 'animate') await this.runtime.animate(step.action);
        else if (step.type === 'mode') this.runtime.setMode(step.mode);
        else if (step.type === 'effect') this.runtime.effect(step.effect, step.visible);
        else if (step.type === 'wait') await this.runtime.wait(step.ms);
        else if (step.type === 'advance-time') this.runtime.advanceTime(step.minutes);
        else if (step.type === 'mutate') step.run();
        else if (step.type === 'sync') this.runtime.sync();
        else if (step.type === 'pulse') this.runtime.pulse(step.objectId);
        else if (step.type === 'toast') this.runtime.toast(step.text, step.ms);
        else if (step.type === 'dialogue') this.runtime.dialogue(step.dialogueId);
        else if (step.type === 'autosave') this.runtime.autosave();
      }
    } finally {
      this.running = false;
    }
  }
}
