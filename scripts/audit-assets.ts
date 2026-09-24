import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

interface AuditRow {
  source: string;
  path: string;
  ext: string;
  scale: '16x16'|'32x32'|'48x48'|'unknown';
  category: string;
  width?: number;
  height?: number;
  alpha?: boolean;
}

const roots = process.argv.slice(2).length ? process.argv.slice(2) : ['incoming-assets'];
const category = (p: string) => {
  const s=p.toLowerCase();
  for (const c of ['bedroom','bathroom','kitchen','living','street','road','cafe','character','animated','ui','home','room_builder']) if (s.includes(c)) return c;
  return 'other';
};
const scale = (p: string): AuditRow['scale'] => p.includes('16x16')?'16x16':p.includes('32x32')?'32x32':p.includes('48x48')?'48x48':'unknown';
const pngInfo = (b: Buffer) => {
  if (b.length < 26 || b.toString('ascii',1,4)!=='PNG') return {};
  const width=b.readUInt32BE(16), height=b.readUInt32BE(20), colorType=b[25];
  return { width, height, alpha: colorType===4 || colorType===6 };
};

const rows: AuditRow[]=[];
function scanDir(root:string, base=root):void{
  for(const name of readdirSync(root)){
    const p=join(root,name); const st=statSync(p);
    if(st.isDirectory()) scanDir(p,base);
    else {
      const rel=relative(base,p); const ext=extname(name).toLowerCase();
      if(!['.png','.gif','.json','.ase','.aseprite','.txt','.pdf','.zip'].includes(ext)) continue;
      const info=ext==='.png'?pngInfo(readFileSync(p)):{};
      rows.push({source:base,path:rel,ext,scale:scale(rel),category:category(rel),...info});
    }
  }
}
function scanZip(zp:string):void{
  const list=execFileSync('unzip',['-Z1',zp],{encoding:'utf8',maxBuffer:64*1024*1024}).split(/\r?\n/).filter(Boolean);
  for(const entry of list){
    if(entry.endsWith('/') || entry.includes('__MACOSX/') || entry.split('/').pop()?.startsWith('._')) continue;
    const ext=extname(entry).toLowerCase();
    if(!['.png','.gif','.json','.ase','.aseprite','.txt','.pdf'].includes(ext)) continue;
    rows.push({source:zp,path:entry,ext,scale:scale(entry),category:category(entry)});
  }
}

for(const root of roots){
  if(!existsSync(root)){ console.warn(`missing: ${root}`); continue; }
  const st=statSync(root); if(st.isDirectory()) scanDir(root); else if(root.toLowerCase().endsWith('.zip')) scanZip(root);
}
const counts = rows.reduce<Record<string,number>>((a,r)=>(a[r.ext]=(a[r.ext]??0)+1,a),{});
const scales = rows.reduce<Record<string,number>>((a,r)=>(a[r.scale]=(a[r.scale]??0)+1,a),{});
const categories = rows.reduce<Record<string,number>>((a,r)=>(a[r.category]=(a[r.category]??0)+1,a),{});
console.log(JSON.stringify({ generatedAt:new Date().toISOString(), roots, total:rows.length, counts, scales, categories, sample:rows.slice(0,120) }, null, 2));
