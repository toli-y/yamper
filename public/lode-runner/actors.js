import { THINK_INTERVAL } from "./constants.js";

export function createRunner(THREE, makePlayer) {
  const laser = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.07, 0.07),
    new THREE.MeshBasicMaterial({ color: 0x9ef6ff })
  );
  laser.visible = false;
  return {
    x: 0,
    y: 0,
    facing: 1,
    falling: false,
    stuck: false,
    digging: 0,
    digDir: 0,
    alive: true,
    isGuard: false,
    carrying: null,
    mesh: makePlayer(THREE),
    laser,
  };
}

export function createGuard(THREE, makeGuard, x, y) {
  return {
    x,
    y,
    spawnX: x,
    spawnY: y,
    facing: -1,
    falling: false,
    stuck: false,
    stuckT: 0,
    climbingOut: 0,
    carrying: null,
    dropIn: 0,
    alive: true,
    isGuard: true,
    thinkT: THINK_INTERVAL * (0.5 + Math.random()),
    decidedAt: "",
    wish: { x: 0, y: 0 },
    mesh: makeGuard(THREE),
  };
}

export function createGold(mesh, x, y) {
  return { x, y, mesh, taken: false, carrier: null };
}
