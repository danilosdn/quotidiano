#!/usr/bin/env node
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const requested = process.argv[2];
if (!requested) {
  console.error('Usage: node scripts/run-typescript-script.mjs <script.ts>');
  process.exit(2);
}
const source = isAbsolute(requested) ? requested : resolve(projectRoot, requested);
if (!source.startsWith(projectRoot) || !source.endsWith('.ts')) {
  console.error(`Refusing to compile a script outside the project: ${source}`);
  process.exit(2);
}

const output = await mkdtemp(join(tmpdir(), 'quotidiano-ts-'));
const tsc = process.platform === 'win32' ? 'tsc.cmd' : 'tsc';
const compile = spawnSync(tsc, [
  '--target', 'ES2022',
  '--module', 'CommonJS',
  '--moduleResolution', 'Node',
  '--lib', 'ES2022,DOM',
  '--esModuleInterop', 'true',
  '--skipLibCheck', 'true',
  '--strict', 'true',
  '--resolveJsonModule', 'true',
  '--outDir', output,
  '--rootDir', projectRoot,
  '--noEmitOnError', 'true',
  source
], { cwd: projectRoot, stdio: 'inherit', env: process.env });

if (compile.error) {
  console.error(`Could not execute TypeScript compiler: ${compile.error.message}`);
  await rm(output, { recursive: true, force: true });
  process.exit(1);
}
if (compile.status !== 0) {
  await rm(output, { recursive: true, force: true });
  process.exit(compile.status ?? 1);
}

const compiled = join(output, relative(projectRoot, source)).replace(/\.ts$/, '.js');
const execute = spawnSync(process.execPath, [compiled], { cwd: projectRoot, stdio: 'inherit', env: process.env });
await rm(output, { recursive: true, force: true });
if (execute.error) {
  console.error(`Could not execute ${basename(source)}: ${execute.error.message}`);
  process.exit(1);
}
process.exit(execute.status ?? 1);
