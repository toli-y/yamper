export function makePlayer(THREE) {
  const group = new THREE.Group();
  group.name = "player";

  const white = mat(0xfcfcfc);
  const whiteShade = mat(0xc5ced6);
  const whiteWarm = mat(0xe8eef2);
  const cyan = mat(0x3cbcfc);
  const cyanLite = mat(0x7ee0ff);
  const cyanMid = mat(0x1e90d4);
  const cyanDeep = mat(0x0e6898);
  const visor = mat(0x0a3048);
  const visorGlass = mat(0x145878);
  const peach = mat(0xfcb49a);
  const peachDeep = mat(0xe08868);
  const mouth = mat(0x7a3040);

  function mat(color) {
    return new THREE.MeshLambertMaterial({ color });
  }

  function stamp(mesh) {
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    return mesh;
  }

  function add(parent, mesh, x, y, z, rx = 0, ry = 0, rz = 0) {
    stamp(mesh);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    parent.add(mesh);
    return mesh;
  }

  function box(parent, material, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
    return add(parent, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material), x, y, z, rx, ry, rz);
  }

  function sphere(parent, material, r, x, y, z, sx = 1, sy = 1, sz = 1, seg = 7) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(5, seg - 1)), material);
    mesh.scale.set(sx, sy, sz);
    return add(parent, mesh, x, y, z);
  }

  function cyl(parent, material, rt, rb, h, x, y, z, rx = 0, ry = 0, rz = 0, seg = 8) {
    return add(parent, new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material), x, y, z, rx, ry, rz);
  }

  const bodyY = 0.4;
  const body = new THREE.Group();
  body.name = "body";
  body.position.set(0, bodyY, 0);
  group.add(body);

  // --- hips / overall seat (cyan) ---
  box(body, cyan, 0.3, 0.09, 0.18, 0, 0.02, 0.01);
  box(body, cyanMid, 0.26, 0.07, 0.16, 0, 0.015, -0.04);
  box(body, cyanDeep, 0.22, 0.04, 0.14, 0, -0.02, 0.0);

  // --- white torso, chunked like a 16px shirt ---
  box(body, white, 0.3, 0.22, 0.176, 0, 0.16, 0.012);
  box(body, whiteWarm, 0.26, 0.1, 0.17, 0, 0.24, 0.02);
  box(body, whiteShade, 0.28, 0.18, 0.08, 0, 0.17, -0.07);
  box(body, white, 0.08, 0.2, 0.15, -0.14, 0.17, 0.01);
  box(body, white, 0.08, 0.2, 0.15, 0.14, 0.17, 0.01);
  box(body, whiteShade, 0.06, 0.12, 0.12, -0.16, 0.14, -0.02);
  box(body, whiteShade, 0.06, 0.12, 0.12, 0.16, 0.14, -0.02);

  // collar + neck
  box(body, whiteWarm, 0.18, 0.045, 0.16, 0, 0.29, 0.02);
  cyl(body, peach, 0.045, 0.05, 0.06, 0, 0.325, 0.015, 0, 0, 0, 7);
  box(body, peachDeep, 0.06, 0.03, 0.05, 0, 0.312, 0.04);

  // cyan overall bib + straps (Hudson miner, not a jumpsuit blob)
  box(body, cyan, 0.15, 0.145, 0.05, 0, 0.145, 0.108);
  box(body, cyanLite, 0.11, 0.05, 0.03, 0, 0.175, 0.132);
  box(body, cyanMid, 0.13, 0.04, 0.02, 0, 0.1, 0.13);
  box(body, cyanLite, 0.03, 0.03, 0.03, -0.03, 0.16, 0.138);
  box(body, cyanLite, 0.03, 0.03, 0.03, 0.03, 0.16, 0.138);

  box(body, cyan, 0.05, 0.2, 0.045, -0.085, 0.22, 0.095);
  box(body, cyan, 0.05, 0.2, 0.045, 0.085, 0.22, 0.095);
  box(body, cyanMid, 0.055, 0.06, 0.08, -0.1, 0.3, 0.02);
  box(body, cyanMid, 0.055, 0.06, 0.08, 0.1, 0.3, 0.02);
  box(body, cyan, 0.048, 0.18, 0.04, -0.08, 0.21, -0.08);
  box(body, cyan, 0.048, 0.18, 0.04, 0.08, 0.21, -0.08);
  box(body, cyanDeep, 0.2, 0.12, 0.04, 0, 0.12, -0.095);

  // waistband
  box(body, cyanMid, 0.32, 0.045, 0.2, 0, 0.07, 0.01);
  box(body, cyanLite, 0.08, 0.03, 0.04, 0, 0.072, 0.11);

  const head = new THREE.Group();
  head.name = "head";
  head.position.set(0, 0.38, 0.02);
  body.add(head);

  // --- round white helmet, brim, ear nubs, visor (Balloon Fight / human Bomberman family) ---
  sphere(head, white, 0.148, 0, 0.02, 0, 1.16, 0.98, 1.1, 8);
  sphere(head, whiteWarm, 0.09, 0, 0.07, -0.02, 1.15, 0.7, 1.0, 7);
  box(head, white, 0.3, 0.1, 0.26, 0, 0.04, 0.01);
  box(head, whiteShade, 0.28, 0.08, 0.08, 0, 0.05, -0.12);
  box(head, white, 0.08, 0.12, 0.24, -0.14, 0.02, 0.01);
  box(head, white, 0.08, 0.12, 0.24, 0.14, 0.02, 0.01);
  box(head, whiteWarm, 0.22, 0.06, 0.12, 0, 0.1, 0.06);
  box(head, whiteShade, 0.18, 0.05, 0.2, 0, 0.12, -0.02);

  cyl(head, white, 0.2, 0.21, 0.032, 0, -0.08, 0.02, 0, 0, 0, 10);
  box(head, whiteWarm, 0.3, 0.028, 0.08, 0, -0.082, 0.14);
  box(head, whiteShade, 0.26, 0.02, 0.06, 0, -0.1, 0.12);

  // Bomberman-style ear cups
  cyl(head, white, 0.055, 0.05, 0.07, -0.195, 0.015, 0.0, 0, 0, Math.PI / 2, 8);
  cyl(head, white, 0.055, 0.05, 0.07, 0.195, 0.015, 0.0, 0, 0, Math.PI / 2, 8);
  sphere(head, whiteShade, 0.04, -0.22, 0.015, 0.0, 1, 1, 0.85, 6);
  sphere(head, whiteShade, 0.04, 0.22, 0.015, 0.0, 1, 1, 0.85, 6);
  box(head, cyanDeep, 0.02, 0.04, 0.04, -0.232, 0.015, 0.02);
  box(head, cyanDeep, 0.02, 0.04, 0.04, 0.232, 0.015, 0.02);

  // visor housing + dark cyan slit
  box(head, whiteShade, 0.24, 0.07, 0.06, 0, 0.025, 0.145);
  box(head, visor, 0.2, 0.042, 0.04, 0, 0.028, 0.168);
  box(head, visorGlass, 0.07, 0.028, 0.02, -0.045, 0.03, 0.186);
  box(head, visorGlass, 0.07, 0.028, 0.02, 0.045, 0.03, 0.186);
  box(head, visor, 0.016, 0.036, 0.02, 0, 0.028, 0.186);

  // peach face under the visor
  box(head, peach, 0.18, 0.09, 0.08, 0, -0.045, 0.13);
  box(head, peach, 0.14, 0.05, 0.06, 0, -0.09, 0.11);
  sphere(head, peach, 0.035, -0.055, -0.04, 0.15, 1.1, 0.85, 0.7, 6);
  sphere(head, peach, 0.035, 0.055, -0.04, 0.15, 1.1, 0.85, 0.7, 6);
  box(head, peachDeep, 0.045, 0.035, 0.04, 0, -0.05, 0.17);
  box(head, mouth, 0.05, 0.014, 0.02, 0, -0.078, 0.16);
  box(head, peachDeep, 0.03, 0.02, 0.02, -0.07, -0.09, 0.135);
  box(head, peachDeep, 0.03, 0.02, 0.02, 0.07, -0.09, 0.135);

  function makeArm(side) {
    const arm = new THREE.Group();
    arm.name = side < 0 ? "leftArm" : "rightArm";
    arm.position.set(side * 0.205, 0.25, 0.02);

    sphere(arm, white, 0.05, 0, 0, 0, 1.05, 0.9, 1.0, 6);
    box(arm, white, 0.085, 0.14, 0.085, 0, -0.08, 0.005);
    box(arm, whiteShade, 0.07, 0.1, 0.05, 0, -0.08, -0.03);
    sphere(arm, whiteWarm, 0.038, 0, -0.15, 0.0, 1, 1, 1, 6);
    box(arm, white, 0.075, 0.12, 0.075, 0, -0.21, 0.01);
    box(arm, whiteShade, 0.06, 0.08, 0.04, 0, -0.21, -0.025);
    box(arm, whiteWarm, 0.08, 0.03, 0.08, 0, -0.265, 0.01);
    box(arm, peach, 0.08, 0.07, 0.085, 0, -0.31, 0.015);
    box(arm, peachDeep, 0.035, 0.04, 0.05, side * 0.04, -0.32, 0.04);
    box(arm, peach, 0.028, 0.045, 0.03, -0.02, -0.345, 0.03);
    box(arm, peach, 0.028, 0.045, 0.03, 0.02, -0.345, 0.03);
    return arm;
  }

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);
  body.add(leftArm, rightArm);

  function makeLeg(side) {
    const leg = new THREE.Group();
    leg.name = side < 0 ? "leftLeg" : "rightLeg";
    leg.position.set(side * 0.09, 0.38, 0.015);

    box(leg, cyan, 0.12, 0.16, 0.13, 0, -0.08, 0.01);
    box(leg, cyanMid, 0.1, 0.14, 0.06, 0, -0.08, -0.045);
    sphere(leg, cyanLite, 0.045, 0, -0.16, 0.015, 1.15, 0.85, 1.05, 6);
    box(leg, cyan, 0.105, 0.13, 0.12, 0, -0.235, 0.012);
    box(leg, cyanDeep, 0.09, 0.1, 0.05, 0, -0.235, -0.04);
    box(leg, cyanMid, 0.11, 0.03, 0.125, 0, -0.3, 0.012);

    box(leg, cyan, 0.13, 0.075, 0.17, 0, -0.342, 0.03);
    box(leg, cyanLite, 0.1, 0.04, 0.07, 0, -0.33, 0.09);
    box(leg, cyanDeep, 0.125, 0.025, 0.16, 0, -0.372, 0.025);
    box(leg, cyanMid, 0.1, 0.05, 0.05, 0, -0.345, -0.055);
    return leg;
  }

  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);
  group.add(leftLeg, rightLeg);

  const leftArmRest = leftArm.position.clone();
  const rightArmRest = rightArm.position.clone();
  const leftLegRest = leftLeg.position.clone();
  const rightLegRest = rightLeg.position.clone();

  function resetPose() {
    body.position.set(0, bodyY, 0);
    body.rotation.set(0, 0, 0);
    head.rotation.set(0, 0, 0);
    leftArm.position.copy(leftArmRest);
    rightArm.position.copy(rightArmRest);
    leftLeg.position.copy(leftLegRest);
    rightLeg.position.copy(rightLegRest);
    leftArm.rotation.set(0, 0, 0);
    rightArm.rotation.set(0, 0, 0);
    leftLeg.rotation.set(0, 0, 0);
    rightLeg.rotation.set(0, 0, 0);
  }

  group.userData.kind = "player";
  group.userData.leftLeg = leftLeg;
  group.userData.rightLeg = rightLeg;
  group.userData.leftArm = leftArm;
  group.userData.rightArm = rightArm;
  group.userData.body = body;
  group.userData.animate = function animate(state, t, facing) {
    resetPose();
    const s = Math.sin(t * 11);
    const c = Math.cos(t * 11);

    if (state === "walk") {
      leftLeg.rotation.x = -s * 0.58;
      rightLeg.rotation.x = s * 0.58;
      leftLeg.rotation.z = s * 0.1;
      rightLeg.rotation.z = -s * 0.1;
      leftArm.rotation.x = s * 0.5;
      rightArm.rotation.x = -s * 0.5;
      leftArm.rotation.z = 0.16;
      rightArm.rotation.z = -0.16;
      body.rotation.y = s * 0.05;
      body.position.y = bodyY + Math.abs(s) * 0.012;
      head.rotation.x = -0.04;
      return;
    }

    if (state === "climb") {
      leftArm.rotation.x = -2.35 + s * 0.42;
      rightArm.rotation.x = -2.35 - s * 0.42;
      leftArm.rotation.z = 0.22;
      rightArm.rotation.z = -0.22;
      leftLeg.rotation.x = -c * 0.38;
      rightLeg.rotation.x = c * 0.38;
      body.position.y = bodyY + s * 0.018;
      head.rotation.x = -0.12;
      return;
    }

    if (state === "hang") {
      leftArm.rotation.x = -2.72;
      rightArm.rotation.x = -2.72;
      leftArm.rotation.z = 0.38;
      rightArm.rotation.z = -0.38;
      leftLeg.rotation.x = 0.28;
      rightLeg.rotation.x = 0.18;
      leftLeg.rotation.z = 0.12;
      rightLeg.rotation.z = -0.1;
      body.position.y = bodyY - 0.05;
      head.rotation.x = 0.15;
      return;
    }

    if (state === "fall") {
      const flail = t * 14;
      leftArm.rotation.x = Math.sin(flail) * 1.15 - 0.2;
      rightArm.rotation.x = Math.cos(flail * 1.1) * 1.15 - 0.2;
      leftArm.rotation.z = 0.55 + Math.sin(flail * 0.9) * 0.45;
      rightArm.rotation.z = -0.55 - Math.cos(flail * 0.85) * 0.45;
      leftLeg.rotation.x = Math.sin(flail + 0.8) * 0.85;
      rightLeg.rotation.x = Math.cos(flail + 0.4) * 0.85;
      leftLeg.rotation.z = 0.18;
      rightLeg.rotation.z = -0.18;
      body.rotation.z = Math.sin(t * 9) * 0.14;
      body.rotation.x = Math.cos(t * 7) * 0.08;
      head.rotation.z = Math.sin(t * 10) * 0.12;
      return;
    }

    if (state === "dig") {
      body.rotation.x = 0.22;
      body.rotation.z = -0.1;
      body.position.y = bodyY - 0.02;
      rightArm.rotation.x = -0.55;
      rightArm.rotation.z = 0.95;
      rightArm.rotation.y = -0.15;
      leftArm.rotation.x = 0.25;
      leftArm.rotation.z = 0.45;
      leftLeg.rotation.x = -0.12;
      rightLeg.rotation.x = 0.22;
      head.rotation.x = 0.18;
      head.rotation.y = 0.12;
      return;
    }

    if (state === "stuck") {
      body.position.y = bodyY - 0.1;
      body.rotation.x = 0.42;
      body.rotation.z = 0.08;
      leftArm.rotation.x = 0.55;
      leftArm.rotation.z = 0.42;
      rightArm.rotation.x = 0.4;
      rightArm.rotation.z = -0.55;
      leftLeg.rotation.x = 0.72;
      rightLeg.rotation.x = 0.88;
      leftLeg.rotation.z = 0.16;
      rightLeg.rotation.z = -0.12;
      head.rotation.x = 0.28;
      head.rotation.z = 0.1;
      return;
    }

    // stand
    const breath = Math.sin(t * 3.2);
    body.position.y = bodyY + breath * 0.01;
    leftArm.rotation.z = 0.14 + breath * 0.03;
    rightArm.rotation.z = -0.14 - breath * 0.03;
    leftArm.rotation.x = 0.06;
    rightArm.rotation.x = 0.04;
    leftLeg.rotation.z = 0.04;
    rightLeg.rotation.z = -0.04;
    head.rotation.x = breath * 0.03;
  };

  return group;
}
