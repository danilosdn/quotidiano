import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const inheritedSceneMembers = [
  'renderer', 'game', 'scene', 'sys', 'load', 'input', 'physics', 'cameras',
  'textures', 'sound', 'time', 'events', 'registry', 'cache', 'anims',
  'children', 'data', 'scale', 'plugins'
] as const;

const declaredFields = (source: string): string[] => [...source.matchAll(
  /^\s{2}(?:(?:public|protected|private)\s+)?(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*(?:!|\?)?\s*(?::|=)/gm
)].map((match) => match[1]);

describe('Phaser scene member compatibility', () => {
  it('does not redeclare inherited Phaser.Scene members', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/game/scenes/HomeScene.ts'), 'utf8');
    const fields = new Set(declaredFields(source));
    expect(inheritedSceneMembers.filter((name) => fields.has(name))).toEqual([]);
    expect(fields.has('houseRenderer')).toBe(true);
  });
});
