import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const homeSceneSource = (): string => readFileSync(
  resolve(process.cwd(), 'src/game/scenes/HomeScene.ts'),
  'utf8'
);

describe('HomeScene lifecycle hygiene', () => {
  it('binds scene shutdown exactly once and unregisters named input callbacks', () => {
    const source = homeSceneSource();
    expect(source).toContain('this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)');
    for (const event of ['keydown-E', 'keydown-SPACE', 'keydown-P', 'keydown-I', 'keydown-ESC', 'keydown-F3']) {
      expect(source).toContain(`keyboard.on('${event}', this.`);
      expect(source).toContain(`keyboard?.off('${event}', this.`);
    }
    expect(source).toContain("this.input.on('pointerdown', this.onPointerDown)");
    expect(source).toContain("this.input.off('pointerdown', this.onPointerDown)");
    expect(source).toContain('controller.resetHandlers()');
    expect(source).toContain('this.houseRenderer.shutdown()');
  });
});
