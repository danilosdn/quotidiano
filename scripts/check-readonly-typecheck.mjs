#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['src', 'tests', 'scripts', 'tools'];
const rootFiles = [
  'package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.app.json',
  'tsconfig.node.json', 'tsconfig.core.json', 'vite.config.ts',
  'vitest.config.ts', 'playwright.config.ts'
];
const relevantExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.d.ts']);

async function collect(path) {
  try {
    const info = await stat(path);
    if (info.isFile()) return [path];
    const entries = await readdir(path, { withFileTypes:true });
    const output = [];
    for (const entry of entries) {
      const child = join(path, entry.name);
      if (entry.isDirectory()) output.push(...await collect(child));
      else if (relevantExtensions.has(extname(entry.name)) || entry.name.endsWith('.d.ts')) output.push(child);
    }
    return output;
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

async function snapshot() {
  const files = [];
  for (const root of roots) files.push(...await collect(resolve(projectRoot, root)));
  for (const file of rootFiles) files.push(...await collect(resolve(projectRoot, file)));
  const unique = [...new Set(files)].sort();
  const hashes = new Map();
  for (const file of unique) {
    hashes.set(relative(projectRoot, file), createHash('sha256').update(await readFile(file)).digest('hex'));
  }
  return hashes;
}

const before = await snapshot();
const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(command, ['run', 'check'], { cwd:projectRoot, stdio:'inherit', env:process.env });
if (result.error) throw result.error;
const after = await snapshot();
const changes = [];
for (const name of new Set([...before.keys(), ...after.keys()])) {
  if (!before.has(name)) changes.push(`created: ${name}`);
  else if (!after.has(name)) changes.push(`removed: ${name}`);
  else if (before.get(name) !== after.get(name)) changes.push(`modified: ${name}`);
}
if (changes.length) {
  console.error('Typecheck modified the repository:');
  for (const change of changes) console.error(`- ${change}`);
  process.exit(1);
}
console.log(`Read-only audit: ${before.size} relevant files remained byte-identical (typecheck exit ${result.status ?? 1}).`);
if (result.status !== 0) process.exit(result.status ?? 1);
console.log('Read-only typecheck passed.');
