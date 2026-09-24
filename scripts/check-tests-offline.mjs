#!/usr/bin/env node
import { rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const phaserPath = resolve(projectRoot, 'src/__offline_phaser_stub.d.ts');
const testStubPath = resolve(projectRoot, 'tests/__offline_test_stub.d.ts');
const configPath = resolve(projectRoot, 'tsconfig.offline-tests.json');
const phaserStub = `declare module 'phaser' {
  namespace Phaser {
    namespace Types { namespace Core { type GameConfig = any; } namespace Input { namespace Keyboard { type CursorKeys = any; } } }
    namespace Input { namespace Keyboard { type Key = any; } type Pointer = any; }
    namespace GameObjects { type Image = any; class Sprite { [key:string]: any; setFrame(frame:number): this; } type Rectangle=any; type Arc=any; type Container=any; type Graphics=any; type Text=any; }
    namespace Physics { namespace Arcade { type Sprite = any; } }
    namespace Animations { namespace Events { const ANIMATION_COMPLETE: string; } }
    namespace Scenes { namespace Events { const SHUTDOWN: string; } }
    class Scene { constructor(config?:any); renderer:any; game:any; scene:any; sys:any; load:any; input:any; physics:any; cameras:any; textures:any; sound:any; time:any; events:any; registry:any; cache:any; anims:any; children:any; data:any; scale:any; plugins:any; tweens:any; add:any; }
    class Game { constructor(config:any); }
    const AUTO:any; const Math:{Clamp(value:number,min:number,max:number):number}; const Scale:{FIT:any;CENTER_BOTH:any};
  }
  export default Phaser;
}
`;
const testStub = `declare module 'vitest' { export const describe:any; export const it:any; export const expect:any; export const test:any; export const beforeEach:any; export const afterEach:any; export const vi:any; }
declare module 'node:fs' { export function readFileSync(path:string, encoding:'utf8'):string; }
declare module 'node:path' { export function resolve(...segments:string[]):string; }
declare const process: { cwd():string };
declare module '@playwright/test' {
  export interface Locator {
    [key:string]:any;
    evaluate<R>(fn:(element:HTMLElement)=>R):Promise<R>;
    boundingBox():Promise<{width:number;height:number}|null>;
    click(options?:unknown):Promise<void>;
    getByRole(role:string, options?:unknown):Locator;
  }
  export interface Page {
    [key:string]:any;
    locator(selector:string, options?:unknown):Locator;
    getByRole(role:string, options?:unknown):Locator;
    getByText(text:string|RegExp, options?:unknown):Locator;
    evaluate<R>(fn:()=>R|Promise<R>):Promise<R>;
    evaluate<R,A>(fn:(arg:A)=>R|Promise<R>, arg:A):Promise<R>;
  }
  interface Fixtures { page:Page }
  interface TestFunction {
    (name:string, fn:(fixtures:Fixtures)=>void|Promise<void>):void;
    beforeEach(fn:(fixtures:Fixtures)=>void|Promise<void>):void;
  }
  export const test:TestFunction;
  export const expect:any;
}
`;
const config = JSON.stringify({
  extends: './tsconfig.app.json',
  compilerOptions: { types: [] },
  include: ['src', 'tests']
}, null, 2);
try {
  await writeFile(phaserPath, phaserStub, 'utf8');
  await writeFile(testStubPath, testStub, 'utf8');
  await writeFile(configPath, `${config}\n`, 'utf8');
  const result = spawnSync(process.platform === 'win32' ? 'tsc.cmd' : 'tsc', ['-p', 'tsconfig.offline-tests.json', '--pretty', 'false'], { cwd:projectRoot, stdio:'inherit', env:process.env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  else console.log('Offline source/test syntax check passed (temporary package shape stubs; real test runners still required).');
} finally {
  await rm(phaserPath, { force:true });
  await rm(testStubPath, { force:true });
  await rm(configPath, { force:true });
}
