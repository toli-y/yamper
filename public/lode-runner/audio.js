export class Sfx {
  constructor() {
    this.ctx = null;
  }

  resume() {
    if (this.ctx) {
      this.ctx.resume();
      return;
    }
    try {
      this.ctx = new AudioContext();
    } catch {
      /* ignore missing Web Audio */
    }
  }

  beep(freq, dur, type = "square", gain = 0.05) {
    try {
      if (!this.ctx) this.ctx = new AudioContext();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      amp.gain.setValueAtTime(gain, t);
      amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(amp).connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
    } catch {
      /* ignore */
    }
  }

  pickup() {
    this.beep(740, 0.12, "square", 0.05);
    this.beep(980, 0.16, "square", 0.04);
  }

  exit() {
    this.beep(520, 0.18, "square", 0.05);
    this.beep(780, 0.28, "square", 0.05);
  }

  win() {
    this.beep(523, 0.15);
    this.beep(659, 0.18);
    this.beep(784, 0.32);
  }
}
