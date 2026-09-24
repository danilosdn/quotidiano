#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scenesRoot = resolve(projectRoot, 'src/game/scenes');
const inheritedSceneMembers = new Set([
  'renderer', 'game', 'scene', 'sys', 'load', 'input', 'physics', 'cameras',
  'textures', 'sound', 'time', 'events', 'registry', 'cache', 'anims',
  'children', 'data', 'scale', 'plugins'
]);

async function collectTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await collectTypeScriptFiles(path));
    else if (extname(entry.name) === '.ts') output.push(path);
  }
  return output;
}

const conflicts = [];
for (const path of await collectTypeScriptFiles(scenesRoot)) {
  const source = await readFile(path, 'utf8');
  if (!/extends\s+Phaser\.Scene\b/.test(source)) continue;
  const fieldPattern = /^\s{2}(?:(?:public|protected|private)\s+)?(?:readonly\s+)?([A-Za-z_$][\w$]*)\s*(?:!|\?)?\s*(?::|=)/gm;
  for (const match of source.matchAll(fieldPattern)) {
    if (!inheritedSceneMembers.has(match[1])) continue;
    const line = source.slice(0, match.index).split('\n').length;
    conflicts.push(`${relative(projectRoot, path)}:${line}: ${match[1]}`);
  }
}

if (conflicts.length) {
  console.error('Phaser.Scene member collision(s) detected:');
  for (const conflict of conflicts) console.error(`- ${conflict}`);
  process.exit(1);
}
console.log(`Scene member collision audit passed (${inheritedSceneMembers.size} inherited names protected).`);
