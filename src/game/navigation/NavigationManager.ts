export interface Point { x: number; y: number }
export interface RectObstacle { x: number; y: number; width: number; height: number }

interface Node extends Point { gx: number; gy: number; g: number; h: number; f: number; parent?: Node }

export class NavigationManager {
  constructor(
    readonly width: number,
    readonly height: number,
    readonly obstacles: RectObstacle[],
    readonly cell = 32,
    readonly radius = 18
  ) {}

  isWalkable(p: Point): boolean {
    if (p.x < this.radius || p.y < this.radius || p.x > this.width - this.radius || p.y > this.height - this.radius) return false;
    return !this.obstacles.some(o =>
      p.x >= o.x - this.radius && p.x <= o.x + o.width + this.radius &&
      p.y >= o.y - this.radius && p.y <= o.y + o.height + this.radius
    );
  }

  nearestWalkable(p: Point): Point | null {
    if (this.isWalkable(p)) return p;
    const maxRing = 8;
    for (let ring = 1; ring <= maxRing; ring++) {
      for (let dx = -ring; dx <= ring; dx++) {
        for (const dy of [-ring, ring]) {
          const q = { x: p.x + dx * this.cell, y: p.y + dy * this.cell };
          if (this.isWalkable(q)) return q;
        }
      }
      for (let dy = -ring + 1; dy < ring; dy++) {
        for (const dx of [-ring, ring]) {
          const q = { x: p.x + dx * this.cell, y: p.y + dy * this.cell };
          if (this.isWalkable(q)) return q;
        }
      }
    }
    return null;
  }

  findPath(start: Point, target: Point): Point[] {
    const safeTarget = this.nearestWalkable(target);
    if (!safeTarget) return [];
    const cols = Math.ceil(this.width / this.cell);
    const rows = Math.ceil(this.height / this.cell);
    const toGrid = (p: Point) => ({ gx: Math.max(0, Math.min(cols - 1, Math.floor(p.x / this.cell))), gy: Math.max(0, Math.min(rows - 1, Math.floor(p.y / this.cell))) });
    const toWorld = (gx: number, gy: number): Point => ({ x: Math.min(this.width - this.radius, gx * this.cell + this.cell / 2), y: Math.min(this.height - this.radius, gy * this.cell + this.cell / 2) });
    const nearestGrid = (p: Point): {gx:number;gy:number}|null => {
      const base=toGrid(p);
      let bestGx=-1,bestGy=-1,bestDistance=Number.POSITIVE_INFINITY;
      for(let ring=0;ring<=5;ring++){
        for(let dx=-ring;dx<=ring;dx++){
          for(let dy=-ring;dy<=ring;dy++){
            if(ring>0 && Math.abs(dx)!==ring && Math.abs(dy)!==ring) continue;
            const gx=base.gx+dx,gy=base.gy+dy;
            if(gx<0||gy<0||gx>=cols||gy>=rows) continue;
            const wp=toWorld(gx,gy);
            if(!this.isWalkable(wp)||!this.segmentWalkable(wp,p)) continue;
            const distance=Math.hypot(wp.x-p.x,wp.y-p.y);
            if(distance<bestDistance){bestGx=gx;bestGy=gy;bestDistance=distance;}
          }
        }
        if(bestGx>=0) return {gx:bestGx,gy:bestGy};
      }
      return null;
    };
    const s = nearestGrid(start), t = nearestGrid(safeTarget);
    if(!s||!t) return [];
    const key = (gx: number, gy: number) => `${gx},${gy}`;
    const open = new Map<string, Node>();
    const closed = new Set<string>();
    const h = (gx: number, gy: number) => Math.hypot(t.gx - gx, t.gy - gy);
    open.set(key(s.gx, s.gy), { ...toWorld(s.gx, s.gy), gx: s.gx, gy: s.gy, g: 0, h: h(s.gx,s.gy), f: h(s.gx,s.gy) });
    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    while (open.size) {
      let current: Node | undefined;
      for (const n of open.values()) if (!current || n.f < current.f) current = n;
      if (!current) break;
      open.delete(key(current.gx,current.gy));
      if (current.gx === t.gx && current.gy === t.gy) {
        const path: Point[] = [safeTarget];
        let n: Node | undefined = current;
        while (n?.parent) { path.unshift({x:n.x,y:n.y}); n = n.parent; }
        return this.simplify(path);
      }
      closed.add(key(current.gx,current.gy));
      for (const [dx,dy] of dirs) {
        const gx=current.gx+dx, gy=current.gy+dy;
        if (gx<0||gy<0||gx>=cols||gy>=rows||closed.has(key(gx,gy))) continue;
        const wp=toWorld(gx,gy); if(!this.isWalkable(wp)) continue;
        if (dx!==0 && dy!==0) {
          const a=toWorld(current.gx+dx,current.gy), b=toWorld(current.gx,current.gy+dy);
          if(!this.isWalkable(a)||!this.isWalkable(b)) continue;
        }
        const step = dx!==0 && dy!==0 ? Math.SQRT2 : 1;
        const ng=current.g+step; const k=key(gx,gy); const prev=open.get(k);
        if(!prev || ng<prev.g) open.set(k,{...wp,gx,gy,g:ng,h:h(gx,gy),f:ng+h(gx,gy),parent:current});
      }
    }
    return [];
  }

  private segmentWalkable(a: Point,b: Point): boolean {
    const distance=Math.hypot(b.x-a.x,b.y-a.y);
    const steps=Math.max(1,Math.ceil(distance/6));
    for(let i=0;i<=steps;i++){
      const t=i/steps;
      if(!this.isWalkable({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})) return false;
    }
    return true;
  }

  private simplify(path: Point[]): Point[] {
    if (path.length < 3) return path;
    const out: Point[] = [path[0]];
    let lastDx=0,lastDy=0;
    for(let i=1;i<path.length;i++){
      const dx=Math.sign(path[i].x-path[i-1].x),dy=Math.sign(path[i].y-path[i-1].y);
      if(i===1){lastDx=dx;lastDy=dy;continue;}
      if(dx!==lastDx||dy!==lastDy){out.push(path[i-1]);lastDx=dx;lastDy=dy;}
    }
    out.push(path[path.length-1]);
    return out;
  }
}
