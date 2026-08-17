/** Tunables for the NES-style Lode Runner clone. */

export const SPEED = Object.freeze({
  player: 5.35,
  guard: 2.35,
  guardCarry: 1.9,
  fall: 9.4,
});

export const DIG_TIME = 0.26;
export const HOLE_LIFE = 6.75;
export const HOLE_STUCK = 3.15;
export const ALIGN = 0.22;
export const START_LIVES = 5;
export const THINK_INTERVAL = 0.22;
export const TURN_PAUSE = 0.18;
export const MAX_LIVES = 9;
export const PATH_BUDGET = 500;

export const SCORE = Object.freeze({
  gold: 250,
  trap: 75,
  crush: 75,
  stage: 1500,
});

export const CATCH = Object.freeze({
  x: 0.55,
  y: 0.45,
});
