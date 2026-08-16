import * as THREE from "three";
import { makeGuard, makePlayer } from "./_models/index.js";
import { createGold, createGuard, createRunner } from "./actors.js";
import { Sfx } from "./audio.js";
import { Board } from "./board.js";
import { thinkGuard } from "./chase.js";
import { CATCH, DIG_TIME, HOLE_LIFE, MAX_LIVES, SCORE, SPEED, START_LIVES, THINK_INTERVAL } from "./constants.js";
import { Input } from "./input.js";
import { aligned, moveFall, roundish, snapUndrivenAxes, supported, tryStep } from "./movement.js";
import { STAGES } from "./stages.js";
import { View } from "./view.js";

export class Game {
  constructor() {
    this.view = new View(THREE);
    this.input = new Input();
    this.sfx = new Sfx();
    this.board = new Board();

    this.state = "title";
    this.bannerMode = "start";
    this.stageIndex = 0;
    this.score = 0;
    this.lives = START_LIVES;
    this.goldTotal = 0;
    this.shake = 0;
    this.runner = null;
    this.guards = [];
    this.golds = [];
  }

  start() {
    this.view.bindResize();
    this.view.bannerBtn.addEventListener("click", () => this.beginRun());
    this.input.bind({
      onSpace: () => {
        if (this.state !== "play") this.view.bannerBtn.click();
        else this.input.queueDig(this.runner?.facing || 1);
      },
      onRetry: () => {
        if (this.state === "play" || this.state === "dead" || this.state === "won") {
          this.loadStage(this.stageIndex, true);
          this.state = "play";
          this.view.hideBanner();
        }
      },
      onConfirm: () => this.view.bannerBtn.click(),
      onTouchDig: () => this.input.queueDig(this.runner?.facing || 1),
    });
    try {
      this.loadStage(0, false);
    } catch (err) {
      console.error(err);
      this.view.bannerCopy.textContent = "Could not load Stage 1. Try refresh. " + err;
    }
    this.tick();
  }

  beginRun() {
    this.sfx.resume();
    this.view.hideBanner();
    if (this.bannerMode === "next") this.loadStage(this.stageIndex + 1, true);
    else if (this.bannerMode === "cleared") this.loadStage(0, true);
    else if (this.bannerMode === "gameover") this.loadStage(0, false);
    this.state = "play";
  }

  loadStage(index, keepScore) {
    this.stageIndex = index;
    const stage = STAGES[index];
    this.board.parse(stage);
    if (!keepScore) {
      this.score = 0;
      this.lives = START_LIVES;
    }
    this.golds = [];
    this.guards = [];
    this.board.guards = this.guards;
    this.shake = 0;
    this.view.resetWorld();
    this.view.tileNodes = Array.from({ length: this.board.rows }, () => Array(this.board.cols).fill(null));

    this.runner = createRunner(THREE, makePlayer);

    for (let y = 0; y < this.board.rows; y++) {
      for (let x = 0; x < this.board.cols; x++) {
        const ch = this.board.grid[y][x];
        this.view.placeTile(this.board, x, y, ch);
        if (ch === "$") {
          const mesh = this.view.makeGoldMesh(this.board, x, y);
          this.golds.push(createGold(mesh, x, y));
          this.board.grid[y][x] = " ";
        }
        if (ch === "0") {
          const guard = createGuard(THREE, makeGuard, x, y);
          this.view.addActor(guard.mesh);
          this.guards.push(guard);
          this.board.grid[y][x] = " ";
        }
        if (ch === "&") {
          this.runner.x = x;
          this.runner.y = y;
          this.board.grid[y][x] = " ";
        }
      }
    }
    this.goldTotal = this.golds.length;
    this.view.addActor(this.runner.mesh);
    this.view.addActor(this.runner.laser);
    this.view.camX = this.runner.x;
    this.view.camY = this.board.rows - this.runner.y;
    this.view.syncActor(this.board, this.runner, 0);
    for (const guard of this.guards) this.view.syncActor(this.board, guard, 0);
    this.refreshHud();
  }

  refreshHud() {
    this.view.updateHud({
      score: this.score,
      lives: this.lives,
      stageId: STAGES[this.stageIndex].id,
      collected: this.golds.filter((g) => g.taken).length,
      goldTotal: this.goldTotal,
    });
  }

  canDigAt(x, y) {
    if (!this.board.inBounds(x, y)) return false;
    if (this.board.grid[y][x] !== "#") return false;
    if (this.board.isHole(x, y)) return false;
    if (this.board.isLadder(x, y - 1) || this.board.isRope(x, y - 1)) return false;
    if (this.golds.some((g) => !g.taken && g.x === x && g.y === y - 1)) return false;
    if (Math.round(this.runner.x) === x && Math.round(this.runner.y) === y) return false;
    if (this.guards.some((g) => g.alive && Math.round(g.x) === x && Math.round(g.y) === y && !g.stuck)) {
      return false;
    }
    return true;
  }

  startDig(dir) {
    const runner = this.runner;
    if (this.state !== "play" || !runner.alive || runner.digging > 0 || runner.falling || runner.stuck) return;
    if (!supported(this.board, runner)) return;
    const tx = roundish(runner.x) + dir;
    const ty = roundish(runner.y) + 1;
    if (!this.canDigAt(tx, ty)) return;
    runner.facing = dir;
    runner.digging = DIG_TIME;
    runner.digDir = dir;
    this.sfx.beep(180, 0.18, "sawtooth", 0.04);
  }

  openHole(x, y) {
    this.board.holes.push({ x, y, t: 0 });
    this.view.setPit(x, y, true);
    this.view.spawnBits(this.board, x, y, 0xc44a28, 10);
    this.shake = 0.12;
  }

  fillHole(hole) {
    this.view.setPit(hole.x, hole.y, false);
    const gold = this.golds.find((g) => !g.taken && g.x === hole.x && g.y === hole.y);
    if (gold) this.collectGold(gold, true);
    if (this.runner.alive && roundish(this.runner.x) === hole.x && roundish(this.runner.y) === hole.y) {
      this.killRunner();
    }
    for (const guard of this.guards) {
      if (guard.alive && guard.stuck && roundish(guard.x) === hole.x && roundish(guard.y) === hole.y) {
        this.crushGuard(guard);
      }
    }
  }

  collectGold(gold, silent) {
    if (gold.taken) return;
    gold.taken = true;
    gold.carrier = null;
    gold.mesh.visible = false;
    this.score += SCORE.gold;
    if (!silent) {
      this.sfx.pickup();
      this.view.spawnBits(this.board, gold.x, gold.y, 0xf4d35e, 7);
    }
    if (this.golds.every((g) => g.taken)) this.openExit();
    this.refreshHud();
  }

  openExit() {
    if (this.board.exitOpen) return;
    if (!this.golds.every((g) => g.taken)) return;
    this.board.exitOpen = true;
    this.view.revealExits(this.board);
    this.sfx.exit();
  }

  tryPickupGold(actor) {
    const gx = roundish(actor.x);
    const gy = roundish(actor.y);
    const gold = this.golds.find((g) => !g.taken && !g.carrier && g.x === gx && g.y === gy);
    if (!gold) return;
    if (actor === this.runner) this.collectGold(gold, false);
    else if (!actor.carrying && aligned(actor.x) && aligned(actor.y)) {
      gold.carrier = actor;
      gold.mesh.visible = false;
      actor.carrying = gold;
      actor.dropIn = 6 + Math.floor(Math.random() * 8);
      this.refreshHud();
    }
  }

  dropGold(actor) {
    const gold = actor.carrying;
    if (!gold) return;
    actor.carrying = null;
    gold.carrier = null;
    gold.taken = false;
    gold.x = roundish(actor.x);
    gold.y = roundish(actor.y);
    gold.mesh.visible = true;
    gold.mesh.position.copy(this.view.vec(this.board, gold.x, gold.y));
    this.refreshHud();
  }

  crushGuard(guard) {
    this.dropGold(guard);
    guard.alive = false;
    guard.stuck = false;
    guard.mesh.visible = false;
    this.score += SCORE.crush;
    this.view.spawnBits(this.board, guard.x, guard.y, 0xe23d4a, 12);
    this.sfx.beep(110, 0.22, "triangle", 0.05);
    this.refreshHud();
    setTimeout(() => this.respawnGuard(guard), 700);
  }

  respawnGuard(guard) {
    if (this.state !== "play") return;
    this.dropGold(guard);
    for (let i = 0; i < this.board.cols; i++) {
      const x = (guard.spawnX + i) % this.board.cols;
      if (!this.board.isBlocking(x, 0) && !this.board.isBlocking(x, 1)) {
        guard.x = x;
        guard.y = 0;
        guard.alive = true;
        guard.stuck = false;
        guard.falling = true;
        guard.climbingOut = 0;
        guard.mesh.visible = true;
        this.refreshHud();
        return;
      }
    }
  }

  killRunner() {
    if (!this.runner.alive || this.state !== "play") return;
    this.runner.alive = false;
    this.shake = 0.35;
    this.view.spawnBits(this.board, this.runner.x, this.runner.y, 0x7ee0ff, 14);
    this.sfx.beep(90, 0.4, "sawtooth", 0.06);
    this.lives -= 1;
    this.refreshHud();
    setTimeout(() => {
      if (this.lives <= 0) {
        this.showBanner(
          "gameover",
          "Game over",
          "The Bungeling guards recovered the gold. Enter again from Stage 1.",
          "Retry from Stage 1"
        );
      } else {
        this.loadStage(this.stageIndex, true);
        this.state = "play";
      }
    }, 700);
  }

  winStage() {
    this.state = "won";
    this.score += SCORE.stage;
    this.lives = Math.min(MAX_LIVES, this.lives + 1);
    this.refreshHud();
    this.sfx.win();
    const next = this.stageIndex + 1;
    if (next < STAGES.length) {
      this.showBanner(
        "next",
        `Stage ${String(STAGES[this.stageIndex].id).padStart(2, "0")} cleared`,
        "The escape ladder opened. Another treasury waits.",
        "Next stage"
      );
    } else {
      this.showBanner(
        "cleared",
        "Stage 01 cleared",
        "You emptied the first Nintendo treasury. The engine already reads a stage list — later raids can be added as more 28×16 maps.",
        "Play Stage 1 again"
      );
    }
  }

  showBanner(mode, title, copy, label) {
    this.bannerMode = mode;
    this.view.showBanner(title, copy, label);
    this.state = mode === "next" || mode === "cleared" ? "won" : mode === "gameover" ? "dead" : "title";
  }

  fallHooks() {
    return {
      onTrapInHole: (actor) => {
        this.dropGold(actor);
        this.score += SCORE.trap;
        this.sfx.beep(160, 0.12, "triangle", 0.04);
        this.refreshHud();
      },
      onFallOff: (actor) => {
        if (actor.isGuard) this.crushGuard(actor);
        else this.killRunner();
      },
    };
  }

  updateRunner(dt) {
    const runner = this.runner;
    if (!runner.alive) {
      runner.laser.visible = false;
      return;
    }
    if (runner.digging > 0) {
      runner.digging -= dt;
      const from = this.board.worldPos(runner.x, runner.y);
      const dest = this.board.worldPos(runner.x + runner.digDir, runner.y + 0.85);
      runner.laser.visible = true;
      runner.laser.position.set((from.x + dest.x) / 2, (from.y + dest.y) / 2, 0.35);
      runner.laser.rotation.z = Math.atan2(dest.y - from.y, dest.x - from.x);
      runner.laser.scale.set(1.15, 1, 1);
      if (runner.digging <= 0) {
        const tx = roundish(runner.x) + runner.digDir;
        const ty = roundish(runner.y) + 1;
        if (this.canDigAt(tx, ty)) this.openHole(tx, ty);
        runner.digging = 0;
        runner.laser.visible = false;
      }
      return;
    }
    runner.laser.visible = false;
    const wish = this.input.wish();
    if (!supported(this.board, runner)) {
      moveFall(this.board, runner, dt, this.fallHooks());
    } else {
      runner.falling = false;
      if (runner.stuck) wish.y = 0;
      if (
        this.board.isHole(roundish(runner.x), roundish(runner.y)) &&
        this.board.isBlocking(roundish(runner.x), roundish(runner.y) + 1)
      ) {
        runner.stuck = true;
        wish.y = 0;
      } else {
        runner.stuck = false;
      }
      tryStep(this.board, runner, wish.x, wish.y, SPEED.player, dt);
    }
    this.tryPickupGold(runner);
    snapUndrivenAxes(runner, wish);
    const dig = this.input.consumeDig();
    if (dig) this.startDig(dig);
    if (this.board.exitOpen && runner.y <= -0.15) this.winStage();
  }

  updateGuards(dt) {
    for (const guard of this.guards) {
      if (!guard.alive) continue;
      if (guard.stuck) {
        guard.stuckT -= dt;
        if (guard.stuckT <= 0) {
          const tx = roundish(guard.x);
          const ty = roundish(guard.y);
          if (!this.board.isBlocking(tx, ty - 1)) {
            guard.stuck = false;
            guard.y = ty - 1;
            guard.climbingOut = 0.12;
          } else {
            guard.stuckT = 0.2;
          }
        }
        continue;
      }
      if (!supported(this.board, guard)) {
        moveFall(this.board, guard, dt, this.fallHooks());
      } else {
        guard.falling = false;
        guard.thinkT -= dt;
        if (guard.thinkT <= 0 || (!guard.wish.x && !guard.wish.y)) {
          thinkGuard(this.board, guard, this.runner);
          guard.thinkT = THINK_INTERVAL;
        }
        tryStep(this.board, guard, guard.wish.x, guard.wish.y, SPEED.guard, dt);
        snapUndrivenAxes(guard, guard.wish);
        if (guard.carrying) {
          if (Math.abs(guard.wish.x) > 0) {
            guard.dropIn -= dt * SPEED.guard;
            if (guard.dropIn <= 0) this.dropGold(guard);
          }
        } else {
          this.tryPickupGold(guard);
        }
      }
      if (
        this.runner.alive &&
        Math.abs(guard.x - this.runner.x) < CATCH.x &&
        Math.abs(guard.y - this.runner.y) < CATCH.y &&
        (!guard.stuck || roundish(this.runner.y) === roundish(guard.y))
      ) {
        this.killRunner();
      }
    }
    if (!this.board.exitOpen && this.golds.every((g) => g.taken)) this.openExit();
  }

  updateHoles(dt) {
    const holes = this.board.holes;
    for (let i = holes.length - 1; i >= 0; i--) {
      holes[i].t += dt;
      if (holes[i].t >= HOLE_LIFE) {
        this.fillHole(holes[i]);
        holes.splice(i, 1);
      }
    }
  }

  tick = () => {
    const dt = Math.min(0.033, this.view.clock.getDelta());
    const t = this.view.clock.elapsedTime;
    if (this.state === "play") {
      this.updateHoles(dt);
      this.updateRunner(dt);
      this.updateGuards(dt);
      this.view.updateParticles(dt);
    }
    if (this.runner) {
      this.view.syncActor(this.board, this.runner, t);
      for (const guard of this.guards) {
        if (guard.alive) this.view.syncActor(this.board, guard, t);
      }
      this.view.animateGold(this.golds, t);
      this.view.updateCamera(this.board, this.runner, this.shake);
      this.shake = Math.max(0, this.shake - dt);
    }
    this.view.render();
    requestAnimationFrame(this.tick);
  };
}

export function boot() {
  new Game().start();
}
