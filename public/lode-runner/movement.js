import { ALIGN, HOLE_STUCK, SPEED } from "./constants.js";

export function aligned(v) {
  return Math.abs(v - Math.round(v)) < ALIGN;
}

export function roundish(v) {
  return Math.round(v);
}

export function supported(board, actor) {
  const tx = roundish(actor.x);
  const ty = roundish(actor.y);
  if (actor.stuck) return true;
  if (board.isLadder(tx, ty)) return true;
  if (board.isRope(tx, ty) && aligned(actor.y)) return true;
  if (board.isBlocking(tx, ty + 1) || board.trappedGuardAt(tx, ty + 1)) return true;
  return false;
}

export function snapUndrivenAxes(actor, wish) {
  if (actor.falling) return;
  if (!wish.x && aligned(actor.x)) actor.x = roundish(actor.x);
  if (!wish.y && aligned(actor.y)) actor.y = roundish(actor.y);
}

function easeToward(current, target, dt, rate) {
  return current + (target - current) * Math.min(1, rate * dt);
}

export function moveFall(board, actor, dt, hooks) {
  actor.falling = true;
  actor.x = easeToward(actor.x, roundish(actor.x), dt, 20);
  const ny = actor.y + SPEED.fall * dt;
  const tx = roundish(actor.x);
  const from = actor.y;
  const maxY = Math.floor(ny + 0.51);
  for (let ty = Math.floor(from + 0.51) + 1; ty <= maxY; ty++) {
    if (actor.isGuard && board.isHole(tx, ty) && ny >= ty - 0.02) {
      actor.y = ty;
      actor.falling = false;
      actor.stuck = true;
      actor.stuckT = HOLE_STUCK;
      hooks.onTrapInHole(actor);
      return;
    }
    if (board.isBlocking(tx, ty) || board.trappedGuardAt(tx, ty)) {
      actor.y = ty - 1;
      actor.falling = false;
      return;
    }
  }
  actor.y = ny;
  if (actor.y > board.rows - 0.05) hooks.onFallOff(actor);
}

export function tryStep(board, actor, dx, dy, speed, dt) {
  const tx0 = roundish(actor.x);
  const ty0 = roundish(actor.y);
  if (dx && dy) {
    if (board.isLadder(tx0, ty0) && aligned(actor.x)) dx = 0;
    else dy = 0;
  }
  if (dy < 0) {
    if (!aligned(actor.x)) actor.x = easeToward(actor.x, tx0, dt, 25);
    if (!board.isLadder(tx0, ty0) && !board.isLadder(tx0, ty0 - 1) && !(board.exitOpen && actor.y <= 0.2)) {
      dy = 0;
    }
  }
  if (dy > 0) {
    const tx = roundish(actor.x);
    const ty = roundish(actor.y);
    const canDrop =
      board.isLadder(tx, ty) || board.isRope(tx, ty) || board.isHole(tx, ty + 1) || !board.isBlocking(tx, ty + 1);
    if (!canDrop) dy = 0;
    if (board.isRope(tx, ty) && !board.isLadder(tx, ty) && aligned(actor.y)) {
      actor.y += 0.12;
      actor.falling = true;
      return;
    }
  }
  const step = speed * dt;
  if (dx) {
    if (!aligned(actor.y) && !actor.falling) {
      actor.y = easeToward(actor.y, roundish(actor.y), dt, 25);
    }
    const nx = actor.x + dx * step;
    const tx = dx > 0 ? Math.floor(nx + 0.5) : Math.ceil(nx - 0.5);
    const ty = roundish(actor.y);
    if (board.isBlocking(tx, ty) && Math.sign(tx - actor.x) === dx) {
      actor.x = dx > 0 ? tx - 1 : tx + 1;
    } else {
      actor.x = Math.min(board.cols - 1, Math.max(0, nx));
    }
    actor.facing = dx;
  }
  if (dy) {
    if (!aligned(actor.x)) actor.x = easeToward(actor.x, roundish(actor.x), dt, 25);
    const ny = actor.y + dy * step;
    const ty = dy > 0 ? Math.floor(ny + 0.5) : Math.ceil(ny - 0.5);
    const tx = roundish(actor.x);
    if (board.isBlocking(tx, ty) && Math.sign(ty - actor.y) === dy) {
      actor.y = dy > 0 ? ty - 1 : ty + 1;
    } else {
      actor.y = Math.min(board.rows - 0.02, Math.max(-0.45, ny));
    }
  }
}
