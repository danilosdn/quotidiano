#!/usr/bin/env node
import { rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const shimPath = resolve(projectRoot, 'src/__offline_phaser_stub.d.ts');
const configPath = resolve(projectRoot, 'tsconfig.offline-app.json');
const shim = `declare module 'phaser' {
  namespace Phaser {
    namespace Types {
      namespace Core { type GameConfig = any; }
      namespace Input { namespace Keyboard { type CursorKeys = any; } }
    }
    namespace Input { namespace Keyboard { type Key = any; } type Pointer = any; }
    namespace GameObjects {
      type Image = any;
      class Sprite { [key:string]: any; setFrame(frame:number): this; }
      type Rectangle = any; type Arc = any; type Container = any; type Graphics = any; type Text = any;
    }
    namespace Physics { namespace Arcade { type Sprite = any; } }
    namespace Animations { namespace Events { const ANIMATION_COMPLETE: string; } }
    class Scene {
      [key: string]: any;
      constructor(config?: any);
      physics: any; add: any; input: any; anims: any; tweens: any; time: any; cameras: any; load: any; scene: any;
    }
    class Game { constructor(config: any); }
    const AUTO: any;
    const Math: { Clamp(value:number,min:number,max:number):number };
    const Scale: { FIT:any; CENTER_BOTH:any };
  }
  export default Phaser;
}
`;
const config = JSON.stringify({
  extends: './tsconfig.app.json',
  compilerOptions: { types: [] },
  include: ['src']
}, null, 2);

try {
  await writeFile(shimPath, shim, 'utf8');
  await writeFile(configPath, `${config}\n`, 'utf8');
  const result = spawnSync(process.platform === 'win32' ? 'tsc.cmd' : 'tsc', ['-p', 'tsconfig.offline-app.json', '--pretty', 'false'], {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  else console.log('Offline app syntax/type check passed (temporary Phaser shape stub; real package check still required).');
} finally {
  await rm(shimPath, { force: true });
  await rm(configPath, { force: true });
}
