import { open, readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, extname, basename } from 'node:path';

const ROOT = join(process.cwd(), 'vendor-assets/limezu/raw');
const OUTPUT = join(process.cwd(), 'tools/asset-browser/inventory.json');
const imageExtensions = new Set(['.png', '.gif', '.jpg', '.jpeg', '.webp']);
const categoryTerms = {
  Quarto: ['bedroom', 'bed', 'wardrobe', 'desk', 'book', 'lamp', 'curtain'],
  Banheiro: ['bathroom', 'bath', 'shower', 'toilet', 'sink', 'mirror'],
  Cozinha: ['kitchen', 'fridge', 'oven', 'stove', 'coffee', 'microwave', 'cup'],
  Sala: ['living', 'sofa', 'couch', 'television', 'tv', 'armchair'],
  Entrada: ['door', 'window', 'mail', 'coat', 'shoe'],
  Lavanderia: ['laundry', 'washer', 'washing'],
  Decoração: ['plant', 'flower', 'rug', 'decoration', 'vase']
};

function dimensions(buffer, extension) {
  if (extension === '.png' && buffer.subarray(1, 4).toString() === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20), alpha: buffer[25] === 4 || buffer[25] === 6 };
  }
  if (extension === '.gif' && buffer.subarray(0, 3).toString() === 'GIF') {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8), alpha: true };
  }
  return { width: null, height: null, alpha: null };
}

function category(path) {
  const normalized = path.toLowerCase();
  return Object.entries(categoryTerms).find(([, terms]) => terms.some((term) => normalized.includes(term)))?.[0] ?? 'Outro';
}

async function walk(directory, files = []) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) await walk(fullPath, files);
    else files.push(fullPath);
  }
  return files;
}

async function readHeader(filePath) {
  const handle = await open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(32);
    await handle.read(buffer, 0, buffer.length, 0);
    return buffer;
  } finally {
    await handle.close();
  }
}

const records = [];
for (const filePath of await walk(ROOT)) {
  const extension = extname(filePath).toLowerCase();
  const fileStat = await stat(filePath);
  const sourcePath = relative(process.cwd(), filePath);
  const record = {
    pack: sourcePath.split('/')[3] ?? 'unknown',
    sourcePath,
    filename: basename(filePath),
    extension: extension || '[none]',
    bytes: fileStat.size,
    category: category(sourcePath),
    width: null,
    height: null,
    transparency: null,
    spritesheet: false
  };
  if (imageExtensions.has(extension)) {
    const header = await readHeader(filePath);
    Object.assign(record, dimensions(header, extension));
    record.spritesheet = /sheet|tileset|animated|sprite/i.test(sourcePath) || ((record.width ?? 0) > 96 && (record.height ?? 0) > 96);
  }
  records.push(record);
}
records.sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
await writeFile(OUTPUT, JSON.stringify({ generatedAt: new Date().toISOString(), total: records.length, records }), 'utf8');
const byExtension = Object.groupBy(records, ({ extension }) => extension);
const preferred48 = records.filter(({ sourcePath }) => sourcePath.includes('48x48'));
console.log(JSON.stringify({ total: records.length, extensions: Object.fromEntries(Object.entries(byExtension).map(([key, value]) => [key, value.length])), preferred48: preferred48.length }, null, 2));
