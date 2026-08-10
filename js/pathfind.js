// ─────────────────────────────────────────────────────────────────────────────
// Grid-based A* over the map, with obstacle inflation and line-of-sight
// smoothing so the robot takes nice direct paths around the content boxes.
// Map coordinates are CSS px at zoom 1.
// ─────────────────────────────────────────────────────────────────────────────

export class PathGrid {
  constructor(worldW, worldH, cell = 40) {
    this.cell = cell;
    this.w = Math.ceil(worldW / cell);
    this.h = Math.ceil(worldH / cell);
    this.blocked = new Uint8Array(this.w * this.h);
  }

  clear() { this.blocked.fill(0); }

  /** block a rect given in map px, inflated by `pad` px on all sides */
  blockRect(x, y, w, h, pad = 0) {
    const x0 = Math.max(0, Math.floor((x - pad) / this.cell));
    const y0 = Math.max(0, Math.floor((y - pad) / this.cell));
    const x1 = Math.min(this.w - 1, Math.floor((x + w + pad) / this.cell));
    const y1 = Math.min(this.h - 1, Math.floor((y + h + pad) / this.cell));
    for (let gy = y0; gy <= y1; gy++)
      for (let gx = x0; gx <= x1; gx++) this.blocked[gy * this.w + gx] = 1;
  }

  isBlocked(gx, gy) {
    if (gx < 0 || gy < 0 || gx >= this.w || gy >= this.h) return true;
    return this.blocked[gy * this.w + gx] === 1;
  }

  toGrid(p) { return { x: Math.floor(p.x / this.cell), y: Math.floor(p.y / this.cell) }; }
  toMap(g) { return { x: (g.x + 0.5) * this.cell, y: (g.y + 0.5) * this.cell }; }

  /** nearest unblocked cell to a map point (spiral search) */
  nearestFree(p) {
    const g = this.toGrid(p);
    if (!this.isBlocked(g.x, g.y)) return g;
    for (let r = 1; r < 30; r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        if (!this.isBlocked(g.x + dx, g.y + dy)) return { x: g.x + dx, y: g.y + dy };
      }
    }
    return g;
  }

  /** A* from map point a to map point b → array of map points (smoothed), or straight line if no path */
  findPath(a, b) {
    const start = this.nearestFree(a);
    const goal = this.nearestFree(b);
    const W = this.w, H = this.h;
    const idx = (x, y) => y * W + x;

    const open = new MinHeap();
    const gScore = new Float64Array(W * H).fill(Infinity);
    const came = new Int32Array(W * H).fill(-1);
    const closed = new Uint8Array(W * H);
    const hFn = (x, y) => {
      const dx = Math.abs(x - goal.x), dy = Math.abs(y - goal.y);
      return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy);
    };
    gScore[idx(start.x, start.y)] = 0;
    open.push(hFn(start.x, start.y), idx(start.x, start.y));

    const DIRS = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]];
    let found = false;
    let iter = 0;
    while (open.size > 0 && iter++ < 60000) {
      const cur = open.pop();
      const cx = cur % W, cy = (cur / W) | 0;
      if (cx === goal.x && cy === goal.y) { found = true; break; }
      if (closed[cur]) continue;
      closed[cur] = 1;
      for (const [dx, dy, cost] of DIRS) {
        const nx = cx + dx, ny = cy + dy;
        if (this.isBlocked(nx, ny)) continue;
        // no corner cutting on diagonals
        if (dx !== 0 && dy !== 0 && (this.isBlocked(cx + dx, cy) || this.isBlocked(cx, cy + dy))) continue;
        const ni = idx(nx, ny);
        const g = gScore[cur] + cost;
        if (g < gScore[ni]) {
          gScore[ni] = g;
          came[ni] = cur;
          open.push(g + hFn(nx, ny), ni);
        }
      }
    }

    if (!found) return [a, b];

    // reconstruct
    const cells = [];
    let c = idx(goal.x, goal.y);
    while (c !== -1) { cells.push({ x: c % W, y: (c / W) | 0 }); c = came[c]; }
    cells.reverse();

    // smooth: string-pulling with grid line-of-sight
    const pts = cells.map(g => this.toMap(g));
    pts[0] = { ...a };
    pts[pts.length - 1] = { ...b };
    const smoothed = [pts[0]];
    let anchor = 0;
    for (let i = 2; i < pts.length; i++) {
      if (!this._los(pts[anchor], pts[i])) {
        smoothed.push(pts[i - 1]);
        anchor = i - 1;
      }
    }
    smoothed.push(pts[pts.length - 1]);
    return smoothed;
  }

  /** line-of-sight between two map points: sample along the segment */
  _los(a, b) {
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(2, Math.ceil(dist / (this.cell * 0.45)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const g = this.toGrid({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      if (this.isBlocked(g.x, g.y)) return false;
    }
    return true;
  }
}

class MinHeap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(key, val) {
    this.k.push(key); this.v.push(val);
    let i = this.k.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.k[p] <= this.k[i]) break;
      [this.k[p], this.k[i]] = [this.k[i], this.k[p]];
      [this.v[p], this.v[i]] = [this.v[i], this.v[p]];
      i = p;
    }
  }
  pop() {
    const top = this.v[0];
    const lk = this.k.pop(), lv = this.v.pop();
    if (this.k.length > 0) {
      this.k[0] = lk; this.v[0] = lv;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < this.k.length && this.k[l] < this.k[m]) m = l;
        if (r < this.k.length && this.k[r] < this.k[m]) m = r;
        if (m === i) break;
        [this.k[m], this.k[i]] = [this.k[i], this.k[m]];
        [this.v[m], this.v[i]] = [this.v[i], this.v[m]];
        i = m;
      }
    }
    return top;
  }
}
