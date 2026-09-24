#!/usr/bin/env node
import { readdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const forbiddenRootFiles = new Set([
  'vite.config.js', 'vite.config.d.ts',
  'vitest.config.js', 'vitest.config.d.ts',
  'playwright.config.js', 'playwright.config.d.ts'
]);
const violations = [];

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes:true })) {
    if (['node_modules', 'dist', '.git', 'coverage', 'playwright-report', 'test-results'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await visit(path);
    else {
      const rel = relative(projectRoot, path);
      if (entry.name.endsWith('.tsbuildinfo')) violations.push(rel);
      if (!rel.includes('/') && forbiddenRootFiles.has(entry.name)) violations.push(rel);
    }
  }
}

await visit(projectRoot);
if (violations.length) {
  console.error('Unexpected TypeScript/config build artifacts detected:');
  for (const file of violations.sort()) console.error(`- ${file}`);
  process.exit(1);
}
console.log('TypeScript artifact audit passed: no emitted config .js/.d.ts or .tsbuildinfo files.');
