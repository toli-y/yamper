const CODE_TO_ACTION = Object.freeze({
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  Space: "space",
  KeyR: "r",
  Enter: "enter",
});

const KEY_TO_ACTION = Object.freeze({
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
  w: "up",
  arrowup: "up",
  s: "down",
  arrowdown: "down",
  " ": "space",
  spacebar: "space",
});

const MOVE_ACTIONS = new Set(["left", "right", "up", "down", "space"]);

export function actionFromEvent(event) {
  return CODE_TO_ACTION[event.code] || KEY_TO_ACTION[(event.key || "").toLowerCase()] || (event.key || "").toLowerCase();
}

export class Input {
  constructor() {
    this.keys = new Set();
    this.hold = { up: false, down: false, left: false, right: false };
    this.digQueued = 0;
  }

  wish() {
    let x = 0;
    let y = 0;
    if (this.keys.has("left") || this.hold.left) x -= 1;
    if (this.keys.has("right") || this.hold.right) x += 1;
    if (this.keys.has("up") || this.hold.up) y -= 1;
    if (this.keys.has("down") || this.hold.down) y += 1;
    return { x, y };
  }

  queueDig(dir) {
    this.digQueued = dir;
  }

  consumeDig() {
    const dir = this.digQueued;
    this.digQueued = 0;
    return dir;
  }

  bind({ onSpace, onRetry, onConfirm, onTouchDig }) {
    addEventListener("keydown", (event) => {
      const action = actionFromEvent(event);
      if (MOVE_ACTIONS.has(action)) event.preventDefault();
      this.keys.add(action);
      if (!event.repeat && action === "space") onSpace();
      if (action === "r") onRetry();
      if (action === "enter") onConfirm();
    });
    addEventListener("keyup", (event) => this.keys.delete(actionFromEvent(event)));

    document.querySelectorAll(".touch [data-dir]").forEach((btn) => {
      const dir = btn.getAttribute("data-dir");
      const down = (event) => {
        event.preventDefault();
        this.hold[dir] = true;
      };
      const up = () => {
        this.hold[dir] = false;
      };
      btn.addEventListener("pointerdown", down);
      btn.addEventListener("pointerup", up);
      btn.addEventListener("pointerleave", up);
      btn.addEventListener("pointercancel", up);
    });

    document.querySelectorAll(".touch [data-dig]").forEach((btn) => {
      btn.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        onTouchDig();
      });
    });
  }
}
