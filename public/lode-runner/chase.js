import { PATH_BUDGET } from "./constants.js";
import { roundish } from "./movement.js";

function neighbors(board, x, y) {
  const out = [];
  const stable =
    board.isLadder(x, y) || board.isRope(x, y) || board.isBlocking(x, y + 1) || board.trappedGuardAt(x, y + 1);
  if (!stable) {
    if (y + 1 < board.rows && !board.isBlocking(x, y + 1)) out.push([x, y + 1]);
    return out;
  }
  for (const dx of [-1, 1]) {
    const nx = x + dx;
    if (nx < 0 || nx >= board.cols) continue;
    if (!board.isBlocking(nx, y)) out.push([nx, y]);
  }
  if (board.isLadder(x, y)) {
    if (y > 0 && !board.isBlocking(x, y - 1)) out.push([x, y - 1]);
    if (y + 1 < board.rows && !board.isBlocking(x, y + 1)) out.push([x, y + 1]);
  }
  if (board.isRope(x, y) && y + 1 < board.rows && !board.isBlocking(x, y + 1)) {
    out.push([x, y + 1]);
  }
  return out;
}

function findPath(board, sx, sy, tx, ty) {
  if (sx === tx && sy === ty) return [[sx, sy]];
  const key = (x, y) => `${x},${y}`;
  const q = [[sx, sy]];
  const prev = new Map([[key(sx, sy), null]]);
  let steps = 0;
  while (q.length && steps++ < PATH_BUDGET) {
    const [x, y] = q.shift();
    for (const [nx, ny] of neighbors(board, x, y)) {
      const k = key(nx, ny);
      if (prev.has(k)) continue;
      prev.set(k, [x, y]);
      if (nx === tx && ny === ty) {
        const path = [[nx, ny]];
        let cur = [nx, ny];
        while (prev.get(key(cur[0], cur[1]))) {
          cur = prev.get(key(cur[0], cur[1]));
          path.push(cur);
        }
        path.reverse();
        return path;
      }
      q.push([nx, ny]);
    }
  }
  return null;
}

/** Classic chase: sprint on the same ledge, otherwise BFS, else greedy. */
export function thinkGuard(board, guard, runner) {
  const sx = roundish(guard.x);
  const sy = roundish(guard.y);
  const tx = roundish(runner.x);
  const ty = roundish(runner.y);
  guard.wish.x = 0;
  guard.wish.y = 0;
  if (sx === tx && sy === ty) return;

  if (sy === ty && sx !== tx) {
    const dir = Math.sign(tx - sx);
    if (!board.isBlocking(sx + dir, sy)) {
      guard.wish.x = dir;
      return;
    }
  }

  const path = findPath(board, sx, sy, tx, ty);
  if (path && path.length > 1) {
    guard.wish.x = Math.sign(path[1][0] - sx);
    guard.wish.y = Math.sign(path[1][1] - sy);
    if (guard.wish.x && guard.wish.y) guard.wish.x = 0;
    return;
  }

  const dx = tx - sx;
  const dy = ty - sy;
  if (Math.abs(dy) >= Math.abs(dx) && dy !== 0) guard.wish.y = Math.sign(dy);
  else guard.wish.x = Math.sign(dx);
}
