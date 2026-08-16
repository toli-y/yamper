/** Tile grid, holes, and occupancy queries. */

export class Board {
  constructor() {
    this.cols = 28;
    this.rows = 16;
    this.grid = [];
    this.baseGrid = [];
    this.holes = [];
    this.exitOpen = false;
    this.guards = [];
  }

  parse(stage) {
    const map = stage.map;
    this.rows = map.length;
    this.cols = map[0].length;
    for (const row of map) {
      if (row.length !== this.cols) {
        throw new Error(`Stage ${stage.id} rows must all be ${this.cols} chars`);
      }
    }
    this.grid = map.map((row) => [...row]);
    this.baseGrid = this.grid.map((row) => row.slice());
    this.holes = [];
    this.exitOpen = false;
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
  }

  tile(x, y) {
    if (!this.inBounds(x, y)) return y >= this.rows ? "@" : " ";
    return this.grid[y][x];
  }

  isHole(x, y) {
    return this.holes.some((hole) => hole.x === x && hole.y === y);
  }

  isBlocking(x, y) {
    if (x < 0 || x >= this.cols) return true;
    if (y < 0) return false;
    if (y >= this.rows) return true;
    const t = this.grid[y][x];
    if (t === "@") return true;
    if (t === "#" && !this.isHole(x, y)) return true;
    return false;
  }

  isLadder(x, y) {
    const t = this.tile(x, y);
    return t === "H" || (t === "S" && this.exitOpen);
  }

  isRope(x, y) {
    return this.tile(x, y) === "-";
  }

  trappedGuardAt(x, y) {
    return this.guards.find((g) => g.alive && g.stuck && Math.round(g.x) === x && Math.round(g.y) === y);
  }

  worldPos(x, y, z = 0) {
    return { x: x + 0.5, y: this.rows - y - 0.5, z };
  }
}
