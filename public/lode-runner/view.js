import { makeBrick, makeGold, makeLadder, makePit, makeRope, makeSolid, makeTrap } from "./_models/index.js";
import { aligned, roundish } from "./movement.js";

export class View {
  constructor(THREE) {
    this.THREE = THREE;
    this.hud = {
      score: document.getElementById("score"),
      lives: document.getElementById("lives"),
      stage: document.getElementById("stage"),
      gold: document.getElementById("gold"),
    };
    this.banner = document.getElementById("banner");
    this.bannerCopy = document.getElementById("banner-copy");
    this.bannerBtn = document.getElementById("banner-btn");

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.camera = new THREE.OrthographicCamera(-8, 8, 8, -8, 0.1, 80);
    this.clock = new THREE.Clock();

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.62));
    const sun = new THREE.DirectionalLight(0xffffff, 1.05);
    sun.position.set(4, 10, 14);
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xa8c8ff, 0.28);
    fill.position.set(-8, 3, 8);
    this.scene.add(fill);

    this.worldRoot = new THREE.Group();
    this.scene.add(this.worldRoot);
    this.tileGroup = null;
    this.actorGroup = null;
    this.fxGroup = null;
    this.tileNodes = [];
    this.particles = [];
    this.camX = 0;
    this.camY = 0;
  }

  bindResize() {
    addEventListener("resize", () => this.renderer.setSize(innerWidth, innerHeight));
  }

  vec(board, x, y, z = 0) {
    const p = board.worldPos(x, y, z);
    return new this.THREE.Vector3(p.x, p.y, p.z);
  }

  resetWorld() {
    if (this.tileGroup) this.worldRoot.remove(this.tileGroup);
    if (this.actorGroup) this.worldRoot.remove(this.actorGroup);
    if (this.fxGroup) this.worldRoot.remove(this.fxGroup);
    const THREE = this.THREE;
    this.tileGroup = new THREE.Group();
    this.actorGroup = new THREE.Group();
    this.fxGroup = new THREE.Group();
    this.worldRoot.add(this.tileGroup, this.actorGroup, this.fxGroup);
    this.particles.length = 0;
  }

  placeTile(board, x, y, ch) {
    const THREE = this.THREE;
    const p = this.vec(board, x, y);
    const node = { brick: null, pit: null, extra: null };
    if (ch === "#" || ch === "X" || ch === "@") {
      const mesh = ch === "@" ? makeSolid(THREE) : ch === "X" ? makeTrap(THREE) : makeBrick(THREE);
      mesh.position.copy(p);
      this.tileGroup.add(mesh);
      node.brick = mesh;
      const pit = makePit(THREE);
      pit.position.copy(p);
      pit.visible = false;
      this.tileGroup.add(pit);
      node.pit = pit;
    }
    if (ch === "H" || ch === "S") {
      const ladder = makeLadder(THREE, ch === "S");
      ladder.position.copy(p);
      ladder.visible = ch === "H";
      this.tileGroup.add(ladder);
      node.extra = ladder;
    }
    if (ch === "-") {
      const rope = makeRope(THREE);
      rope.position.copy(p);
      this.tileGroup.add(rope);
      node.extra = rope;
    }
    this.tileNodes[y][x] = node;
  }

  makeGoldMesh(board, x, y) {
    const mesh = makeGold(this.THREE);
    mesh.position.copy(this.vec(board, x, y));
    this.tileGroup.add(mesh);
    return mesh;
  }

  addActor(mesh) {
    this.actorGroup.add(mesh);
  }

  setPit(x, y, open) {
    const node = this.tileNodes[y]?.[x];
    if (node?.brick) node.brick.visible = !open;
    if (node?.pit) node.pit.visible = open;
  }

  revealExits(board) {
    for (let y = 0; y < board.rows; y++) {
      for (let x = 0; x < board.cols; x++) {
        if (board.baseGrid[y][x] === "S" && this.tileNodes[y][x]?.extra) {
          this.tileNodes[y][x].extra.visible = true;
        }
      }
    }
  }

  spawnBits(board, x, y, color, n = 8) {
    const THREE = this.THREE;
    const p = this.vec(board, x, y);
    for (let i = 0; i < n; i++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
      );
      mesh.position.copy(p);
      this.fxGroup.add(mesh);
      this.particles.push({
        mesh,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 1,
        vz: (Math.random() - 0.5) * 2,
        life: 0.45 + Math.random() * 0.25,
      });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.vy -= 9 * dt;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.mesh.rotation.x += dt * 6;
      if (p.life <= 0) {
        this.fxGroup.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  syncActor(board, actor, t) {
    const p = board.worldPos(actor.x, actor.y);
    const sink = actor.stuck ? 0.22 : 0;
    actor.mesh.position.set(p.x, p.y - 0.48 - sink, 0.2);
    actor.mesh.scale.x = actor.facing < 0 ? -1 : 1;
    if (actor.mesh.userData.goldBag) {
      actor.mesh.userData.goldBag.visible = Boolean(actor.carrying);
    }
    let pose = "stand";
    if (actor.stuck) pose = "stuck";
    else if (actor.digging > 0) pose = "dig";
    else if (actor.falling) pose = "fall";
    else {
      const tx = roundish(actor.x);
      const ty = roundish(actor.y);
      if (board.isRope(tx, ty) && aligned(actor.y) && !board.isLadder(tx, ty)) pose = "hang";
      else if (board.isLadder(tx, ty) && Math.abs(actor.y - ty) > 0.05) pose = "climb";
      else if (Math.abs(actor.x - tx) > 0.05) pose = "walk";
    }
    if (actor.mesh.userData.animate) actor.mesh.userData.animate(pose, t, actor.facing);
  }

  animateGold(golds, t) {
    for (const gold of golds) {
      if (gold.taken || gold.carrier) continue;
      if (gold.mesh.userData.bob) {
        gold.mesh.userData.bob.position.y = Math.sin(t * 3 + gold.x) * 0.04;
        gold.mesh.userData.bob.rotation.y = Math.sin(t * 0.7 + gold.x) * 0.08;
      }
    }
  }

  updateCamera(board, runner, shake) {
    const THREE = this.THREE;
    const hud = 52;
    const tilePx = Math.min(innerWidth / 16, (innerHeight - hud) / 13.2);
    const viewW = innerWidth / tilePx;
    const viewH = (innerHeight - hud) / tilePx;
    this.camera.left = -viewW / 2;
    this.camera.right = viewW / 2;
    this.camera.top = viewH / 2;
    this.camera.bottom = -viewH / 2;
    this.camera.updateProjectionMatrix();

    const targetX = runner.x + 0.5;
    const targetY = board.rows - runner.y - 0.35;
    const marginX = Math.max(2.2, viewW / 2 - 2.4);
    const marginY = Math.max(2.2, viewH / 2 - 2.2);
    const minX = Math.min(viewW / 2, board.cols / 2);
    const maxX = Math.max(board.cols - viewW / 2, minX);
    const minY = Math.min(viewH / 2, board.rows / 2);
    const maxY = Math.max(board.rows - viewH / 2, minY);
    let wantX = this.camX;
    let wantY = this.camY;
    if (targetX > this.camX + marginX) wantX = targetX - marginX;
    if (targetX < this.camX - marginX) wantX = targetX + marginX;
    if (targetY > this.camY + marginY) wantY = targetY - marginY;
    if (targetY < this.camY - marginY) wantY = targetY + marginY;
    this.camX = THREE.MathUtils.clamp(wantX, minX, maxX);
    this.camY = THREE.MathUtils.clamp(wantY, minY, maxY);
    const jx = shake ? (Math.random() - 0.5) * shake * 1.2 : 0;
    const jy = shake ? (Math.random() - 0.5) * shake * 1.2 : 0;
    this.camera.position.set(this.camX + jx, this.camY + 1.15 + jy, 16);
    this.camera.lookAt(this.camX + jx, this.camY + jy, 0);
  }

  updateHud({ score, lives, stageId, collected, goldTotal }) {
    this.hud.score.textContent = String(score).padStart(6, "0");
    this.hud.lives.textContent = String(lives).padStart(2, "0");
    this.hud.stage.textContent = String(stageId).padStart(2, "0");
    this.hud.gold.textContent = `${collected}/${goldTotal}`;
  }

  showBanner(title, copy, label) {
    this.banner.querySelector("h2").textContent = title;
    this.bannerCopy.textContent = copy;
    this.bannerBtn.textContent = label;
    this.banner.classList.add("show");
  }

  hideBanner() {
    this.banner.classList.remove("show");
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
