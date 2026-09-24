#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const ignored = new Set(['node_modules', '.git', 'dist', 'coverage', 'vendor-assets', 'incoming-assets']);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|mjs|json)$/.test(entry.name)) files.push(full);
  }
}
for (const base of ['src', 'tests']) {
  const p = path.join(root, base);
  if (fs.existsSync(p)) walk(p);
}
const rel = p => path.relative(root, p).split(path.sep).join('/');
const records = files.map(file => ({
  file: rel(file),
  text: fs.readFileSync(file, 'utf8'),
}));
const homeScenes = records.filter(r => /HomeScene\.(ts|tsx)$/.test(r.file));
const uiControllers = records.filter(r => /UIController\.(ts|tsx)$/.test(r.file));
const roomModules = records.filter(r => /(bedroom|bathroom|kitchen|living|entry|laundry|corridor)/i.test(r.file) && /(action|interaction)/i.test(r.file));
const dialogueData = records.filter(r => /data\//i.test(r.file) && /dialog/i.test(r.file));
const phoneData = records.filter(r => /data\//i.test(r.file) && /(phone|message|contact|agenda)/i.test(r.file));
const failures = [];
if (homeScenes.length === 0) failures.push('HomeScene source was not found.');
if (roomModules.length < 4) failures.push(`Expected at least 4 room action modules; found ${roomModules.length}.`);
if (dialogueData.length === 0) failures.push('No dialogue data module was detected.');
// Phone data can be split under a generic home-content module; only warn when UI owns obvious arrays.
for (const ui of uiControllers) {
  if (/\b(messages|contacts|agenda)\s*[:=]\s*\[/i.test(ui.text)) {
    failures.push(`${ui.file} still appears to own messages/contacts/agenda arrays.`);
  }
}
for (const scene of homeScenes) {
  const lineCount = scene.text.split(/\r?\n/).length;
  if (lineCount > 500) failures.push(`${scene.file} is still ${lineCount} lines; orchestration boundary target is <= 500.`);
}
const summary = {
  filesScanned: records.length,
  homeScenes: homeScenes.map(r => r.file),
  uiControllers: uiControllers.map(r => r.file),
  roomModules: roomModules.map(r => r.file),
  dialogueData: dialogueData.map(r => r.file),
  phoneData: phoneData.map(r => r.file),
  failures,
};
console.log(JSON.stringify(summary, null, 2));
process.exitCode = failures.length ? 1 : 0;
