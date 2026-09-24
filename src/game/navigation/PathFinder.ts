import type { Point } from '../interactions/types';

export interface Rect { x: number; y: number; w: number; h: number }

interface Cell { col: number; row: number }

const keyOf = ({ col, row }: Cell): string => `${col},${row}`;

/**
 * Small deterministic A* grid used by QUOTIDIANO interiors.
 * The playable topology is expressed as walkable rectangles plus blockers so
 * navigation and manual collision checks share the same source of truth.
 */
export class PathFinder {
  private readonly walkable: readonly Rect[];
  private readonly blockers: readonly Rect[];
  private readonly cellSize: number;

  constructor(walkable: readonly Rect[], blockers: readonly Rect[] = [], cellSize = 12) {
    this.walkable = walkable;
    this.blockers = blockers;
    this.cellSize = cellSize;
  }

  isWalkable(point: Point): boolean {
    const inArea = this.walkable.some((r) => point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h);
    if (!inArea) return false;
    return !this.blockers.some((r) => point.x >= r.x && point.x <= r.x + r.w && point.y >= r.y && point.y <= r.y + r.h);
  }

  findPath(start: Point, goal: Point): Point[] | null {
    const startCell = this.nearestWalkableCell(start);
    const goalCell = this.nearestWalkableCell(goal);
    if (!startCell || !goalCell) return null;

    const open = new Set<string>([keyOf(startCell)]);
    const cells = new Map<string, Cell>([[keyOf(startCell), startCell]]);
    const cameFrom = new Map<string, string>();
    const g = new Map<string, number>([[keyOf(startCell), 0]]);
    const f = new Map<string, number>([[keyOf(startCell), this.heuristic(startCell, goalCell)]]);

    while (open.size) {
      let currentKey = '';
      let currentScore = Number.POSITIVE_INFINITY;
      for (const k of open) {
        const score = f.get(k) ?? Number.POSITIVE_INFINITY;
        if (score < currentScore) { currentKey = k; currentScore = score; }
      }
      const current = cells.get(currentKey)!;
      if (current.col === goalCell.col && current.row === goalCell.row) {
        return this.buildPoints(cameFrom, cells, currentKey, goal);
      }
      open.delete(currentKey);

      for (const next of this.neighbors(current)) {
        const nextKey = keyOf(next);
        cells.set(nextKey, next);
        const diagonal = next.col !== current.col && next.row !== current.row;
        const tentative = (g.get(currentKey) ?? 0) + (diagonal ? Math.SQRT2 : 1);
        if (tentative >= (g.get(nextKey) ?? Number.POSITIVE_INFINITY)) continue;
        cameFrom.set(nextKey, currentKey);
        g.set(nextKey, tentative);
        f.set(nextKey, tentative + this.heuristic(next, goalCell));
        open.add(nextKey);
      }
    }
    return null;
  }

  private neighbors(cell: Cell): Cell[] {
    const result: Cell[] = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const next = { col: cell.col + dx, row: cell.row + dy };
        if (!this.isCellWalkable(next)) continue;
        // Prevent diagonal corner-cutting through furniture/walls.
        if (dx && dy && (!this.isCellWalkable({ col: cell.col + dx, row: cell.row }) || !this.isCellWalkable({ col: cell.col, row: cell.row + dy }))) continue;
        result.push(next);
      }
    }
    return result;
  }

  private nearestWalkableCell(point: Point): Cell | null {
    const base = { col: Math.round(point.x / this.cellSize), row: Math.round(point.y / this.cellSize) };
    if (this.isCellWalkable(base)) return base;
    for (let radius = 1; radius <= 8; radius += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
          const cell = { col: base.col + dx, row: base.row + dy };
          if (this.isCellWalkable(cell)) return cell;
        }
      }
    }
    return null;
  }

  private isCellWalkable(cell: Cell): boolean {
    return this.isWalkable({ x: cell.col * this.cellSize, y: cell.row * this.cellSize });
  }

  private heuristic(a: Cell, b: Cell): number {
    const dx = Math.abs(a.col - b.col), dy = Math.abs(a.row - b.row);
    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  }

  private buildPoints(cameFrom: Map<string, string>, cells: Map<string, Cell>, endKey: string, exactGoal: Point): Point[] {
    const chain: Cell[] = [cells.get(endKey)!];
    let cursor = endKey;
    while (cameFrom.has(cursor)) {
      cursor = cameFrom.get(cursor)!;
      chain.push(cells.get(cursor)!);
    }
    chain.reverse();
    const raw = chain.map((c) => ({ x: c.col * this.cellSize, y: c.row * this.cellSize }));
    const simplified: Point[] = [];
    for (let i = 0; i < raw.length; i += 1) {
      const prev = raw[i - 1], current = raw[i], next = raw[i + 1];
      if (prev && next) {
        const dx1 = Math.sign(current.x - prev.x), dy1 = Math.sign(current.y - prev.y);
        const dx2 = Math.sign(next.x - current.x), dy2 = Math.sign(next.y - current.y);
        if (dx1 === dx2 && dy1 === dy2) continue;
      }
      simplified.push(current);
    }
    if (this.isWalkable(exactGoal)) simplified.push(exactGoal);
    return simplified.slice(1);
  }
}
