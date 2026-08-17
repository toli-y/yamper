export function makeGuard(THREE) {
  const group = new THREE.Group();
  group.name = "guard";

  const pink = mat(0xfc74b4, true);
  const pinkWarm = mat(0xf090c0, true);
  const pinkShade = mat(0xe85098, true);
  const mag = mat(0xe85098, true);
  const magLite = mat(0xfc74b4, true);
  const magMid = mat(0xa82860, true);
  const magDeep = mat(0x6e1838, true);
  const visor = mat(0x14060c, false);
  const visorGlass = mat(0x3a1020, false);
  const peach = mat(0xf3d2c4, false);
  const peachDeep = mat(0xe08868, false);
  const mouth = mat(0x5a1830, false);
  const brow = mat(0x2a0a14, false);
  const gold = mat(0xf4d35e, false, 0x8a5a10, 0.4);
  const goldDark = mat(0xc48918, false, 0x6a3a08, 0.2);
  const goldLite = mat(0xfff0a8, false, 0xc4a030, 0.5);

  function mat(color, toon, emissive, emissiveIntensity) {
    const opts = {
      color,
      emissive: emissive || 0x000000,
      emissiveIntensity: emissiveIntensity || 0,
      flatShading: true,
    };
    return toon ? new THREE.MeshToonMaterial(opts) : new THREE.MeshLambertMaterial(opts);
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

  // hips / overall seat — same blocks as the runner, magenta
  box(body, mag, 0.3, 0.09, 0.18, 0, 0.02, 0.01);
  box(body, magMid, 0.26, 0.07, 0.16, 0, 0.015, -0.04);
  box(body, magDeep, 0.22, 0.04, 0.14, 0, -0.02, 0.0);

  // magenta torso, chunked like a 16px shirt
  box(body, pink, 0.3, 0.22, 0.176, 0, 0.16, 0.012);
  box(body, pinkWarm, 0.26, 0.1, 0.17, 0, 0.24, 0.02);
  box(body, pinkShade, 0.28, 0.18, 0.08, 0, 0.17, -0.07);
  box(body, pink, 0.08, 0.2, 0.15, -0.14, 0.17, 0.01);
  box(body, pink, 0.08, 0.2, 0.15, 0.14, 0.17, 0.01);
  box(body, pinkShade, 0.06, 0.12, 0.12, -0.16, 0.14, -0.02);
  box(body, pinkShade, 0.06, 0.12, 0.12, 0.16, 0.14, -0.02);

  box(body, pinkWarm, 0.18, 0.045, 0.16, 0, 0.29, 0.02);
  cyl(body, peach, 0.045, 0.05, 0.06, 0, 0.325, 0.015, 0, 0, 0, 7);
  box(body, peachDeep, 0.06, 0.03, 0.05, 0, 0.312, 0.04);

  // overall bib + straps
  box(body, mag, 0.15, 0.145, 0.05, 0, 0.145, 0.108);
  box(body, magLite, 0.11, 0.05, 0.03, 0, 0.175, 0.132);
  box(body, magMid, 0.13, 0.04, 0.02, 0, 0.1, 0.13);
  box(body, magLite, 0.03, 0.03, 0.03, -0.03, 0.16, 0.138);
  box(body, magLite, 0.03, 0.03, 0.03, 0.03, 0.16, 0.138);

  box(body, mag, 0.05, 0.2, 0.045, -0.085, 0.22, 0.095);
  box(body, mag, 0.05, 0.2, 0.045, 0.085, 0.22, 0.095);
  box(body, magMid, 0.055, 0.06, 0.08, -0.1, 0.3, 0.02);
  box(body, magMid, 0.055, 0.06, 0.08, 0.1, 0.3, 0.02);
  box(body, mag, 0.048, 0.18, 0.04, -0.08, 0.21, -0.08);
  box(body, mag, 0.048, 0.18, 0.04, 0.08, 0.21, -0.08);
  box(body, magDeep, 0.2, 0.12, 0.04, 0, 0.12, -0.095);

  box(body, magMid, 0.32, 0.045, 0.2, 0, 0.07, 0.01);
  box(body, magLite, 0.08, 0.03, 0.04, 0, 0.072, 0.11);

  const goldBag = new THREE.Group();
  goldBag.name = "goldBag";
  goldBag.position.set(0, 0.12, -0.14);
  goldBag.visible = false;
  body.add(goldBag);
  box(goldBag, goldDark, 0.16, 0.055, 0.08, 0, -0.01, 0);
  box(goldBag, gold, 0.14, 0.05, 0.07, 0, 0.03, 0.01);
  box(goldBag, goldLite, 0.08, 0.025, 0.04, 0, 0.055, 0.02);
  box(goldBag, goldLite, 0.03, 0.015, 0.02, -0.03, 0.045, 0.04);

  const head = new THREE.Group();
  head.name = "head";
  head.position.set(0, 0.38, 0.02);
  body.add(head);

  // round magenta helmet — same round language as the runner
  sphere(head, pink, 0.148, 0, 0.02, 0, 1.16, 0.98, 1.1, 8);
  sphere(head, pinkWarm, 0.09, 0, 0.07, -0.02, 1.15, 0.7, 1.0, 7);
  box(head, pink, 0.3, 0.1, 0.26, 0, 0.04, 0.01);
  box(head, pinkShade, 0.28, 0.08, 0.08, 0, 0.05, -0.12);
  box(head, pink, 0.08, 0.12, 0.24, -0.14, 0.02, 0.01);
  box(head, pink, 0.08, 0.12, 0.24, 0.14, 0.02, 0.01);
  box(head, pinkWarm, 0.22, 0.06, 0.12, 0, 0.1, 0.06);
  box(head, pinkShade, 0.18, 0.05, 0.2, 0, 0.12, -0.02);

  cyl(head, pink, 0.2, 0.21, 0.032, 0, -0.08, 0.02, 0, 0, 0, 10);
  box(head, pinkWarm, 0.3, 0.028, 0.08, 0, -0.082, 0.14);
  box(head, pinkShade, 0.26, 0.02, 0.06, 0, -0.1, 0.12);

  cyl(head, pink, 0.055, 0.05, 0.07, -0.195, 0.015, 0.0, 0, 0, Math.PI / 2, 8);
  cyl(head, pink, 0.055, 0.05, 0.07, 0.195, 0.015, 0.0, 0, 0, Math.PI / 2, 8);
  sphere(head, pinkShade, 0.04, -0.22, 0.015, 0.0, 1, 1, 0.85, 6);
  sphere(head, pinkShade, 0.04, 0.22, 0.015, 0.0, 1, 1, 0.85, 6);
  box(head, magDeep, 0.02, 0.04, 0.04, -0.232, 0.015, 0.02);
  box(head, magDeep, 0.02, 0.04, 0.04, 0.232, 0.015, 0.02);

  // angry thinner visor slit + scowl brow
  box(head, pinkShade, 0.24, 0.05, 0.06, 0, 0.032, 0.145);
  box(head, visor, 0.2, 0.024, 0.04, 0, 0.03, 0.168);
  box(head, visorGlass, 0.055, 0.016, 0.02, -0.05, 0.031, 0.186);
  box(head, visorGlass, 0.055, 0.016, 0.02, 0.05, 0.031, 0.186);
  box(head, visor, 0.012, 0.022, 0.02, 0, 0.03, 0.186);
  box(head, brow, 0.1, 0.022, 0.03, -0.07, 0.055, 0.175, 0, 0, 0.42);
  box(head, brow, 0.1, 0.022, 0.03, 0.07, 0.055, 0.175, 0, 0, -0.42);

  box(head, peach, 0.18, 0.09, 0.08, 0, -0.045, 0.13);
  box(head, peach, 0.14, 0.05, 0.06, 0, -0.09, 0.11);
  sphere(head, peach, 0.035, -0.055, -0.04, 0.15, 1.1, 0.85, 0.7, 6);
  sphere(head, peach, 0.035, 0.055, -0.04, 0.15, 1.1, 0.85, 0.7, 6);
  box(head, peachDeep, 0.04, 0.03, 0.035, 0, -0.052, 0.17);
  box(head, mouth, 0.028, 0.016, 0.02, -0.018, -0.08, 0.162, 0, 0, 0.5);
  box(head, mouth, 0.028, 0.016, 0.02, 0.018, -0.08, 0.162, 0, 0, -0.5);
  box(head, peachDeep, 0.03, 0.02, 0.02, -0.07, -0.09, 0.135);
  box(head, peachDeep, 0.03, 0.02, 0.02, 0.07, -0.09, 0.135);

  function makeArm(side) {
    const arm = new THREE.Group();
    arm.name = side < 0 ? "leftArm" : "rightArm";
    arm.position.set(side * 0.205, 0.25, 0.02);

    sphere(arm, pink, 0.05, 0, 0, 0, 1.05, 0.9, 1.0, 6);
    box(arm, pink, 0.085, 0.14, 0.085, 0, -0.08, 0.005);
    box(arm, pinkShade, 0.07, 0.1, 0.05, 0, -0.08, -0.03);
    sphere(arm, pinkWarm, 0.038, 0, -0.15, 0.0, 1, 1, 1, 6);
    box(arm, pink, 0.075, 0.12, 0.075, 0, -0.21, 0.01);
    box(arm, pinkShade, 0.06, 0.08, 0.04, 0, -0.21, -0.025);
    box(arm, pinkWarm, 0.08, 0.03, 0.08, 0, -0.265, 0.01);
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

    box(leg, mag, 0.12, 0.16, 0.13, 0, -0.08, 0.01);
    box(leg, magMid, 0.1, 0.14, 0.06, 0, -0.08, -0.045);
    sphere(leg, magLite, 0.045, 0, -0.16, 0.015, 1.15, 0.85, 1.05, 6);
    box(leg, mag, 0.105, 0.13, 0.12, 0, -0.235, 0.012);
    box(leg, magDeep, 0.09, 0.1, 0.05, 0, -0.235, -0.04);
    box(leg, magMid, 0.11, 0.03, 0.125, 0, -0.3, 0.012);

    box(leg, mag, 0.13, 0.075, 0.17, 0, -0.342, 0.03);
    box(leg, magLite, 0.1, 0.04, 0.07, 0, -0.33, 0.09);
    box(leg, magDeep, 0.125, 0.025, 0.16, 0, -0.372, 0.025);
    box(leg, magMid, 0.1, 0.05, 0.05, 0, -0.345, -0.055);
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

  function snap(t, freq) {
    const s = Math.sin(t * freq);
    return Math.sign(s) * Math.pow(Math.abs(s), 0.42);
  }

  group.userData.kind = "guard";
  group.userData.leftLeg = leftLeg;
  group.userData.rightLeg = rightLeg;
  group.userData.leftArm = leftArm;
  group.userData.rightArm = rightArm;
  group.userData.body = body;
  group.userData.goldBag = goldBag;
  group.userData.animate = function animate(state, t, facing) {
    resetPose();

    if (state === "walk") {
      const s = snap(t, 8);
      leftLeg.rotation.x = -s * 0.62;
      rightLeg.rotation.x = s * 0.62;
      leftLeg.rotation.z = s * 0.12;
      rightLeg.rotation.z = -s * 0.12;
      leftArm.rotation.x = s * 0.55;
      rightArm.rotation.x = -s * 0.55;
      leftArm.rotation.z = 0.18;
      rightArm.rotation.z = -0.18;
      body.rotation.y = s * 0.07;
      body.rotation.x = 0.08;
      body.position.y = bodyY + Math.abs(s) * 0.02;
      head.rotation.x = -0.02;
      return;
    }

    if (state === "climb") {
      const s = snap(t, 7);
      leftArm.rotation.x = -2.35 + s * 0.46;
      rightArm.rotation.x = -2.35 - s * 0.46;
      leftArm.rotation.z = 0.22;
      rightArm.rotation.z = -0.22;
      leftLeg.rotation.x = -s * 0.42;
      rightLeg.rotation.x = s * 0.42;
      body.position.y = bodyY + s * 0.02;
      head.rotation.x = -0.1;
      return;
    }

    if (state === "hang") {
      const sway = Math.sin(t * 3.8);
      leftArm.rotation.x = -2.72;
      rightArm.rotation.x = -2.72;
      leftArm.rotation.z = 0.38;
      rightArm.rotation.z = -0.38;
      leftLeg.rotation.x = 0.3 + sway * 0.1;
      rightLeg.rotation.x = 0.2 - sway * 0.1;
      leftLeg.rotation.z = 0.12;
      rightLeg.rotation.z = -0.1;
      body.position.y = bodyY - 0.05;
      body.rotation.z = sway * 0.06;
      head.rotation.x = 0.18;
      return;
    }

    if (state === "fall") {
      const flail = t * 16;
      leftArm.rotation.x = Math.sin(flail) * 1.2 - 0.25;
      rightArm.rotation.x = Math.cos(flail * 1.1) * 1.2 - 0.25;
      leftArm.rotation.z = 0.6 + Math.sin(flail * 0.9) * 0.5;
      rightArm.rotation.z = -0.6 - Math.cos(flail * 0.85) * 0.5;
      leftLeg.rotation.x = Math.sin(flail + 0.8) * 0.9;
      rightLeg.rotation.x = Math.cos(flail + 0.4) * 0.9;
      leftLeg.rotation.z = 0.2;
      rightLeg.rotation.z = -0.2;
      body.rotation.z = Math.sin(t * 10) * 0.16;
      body.rotation.x = Math.cos(t * 8) * 0.1;
      head.rotation.z = Math.sin(t * 11) * 0.14;
      return;
    }

    if (state === "stuck") {
      const wiggle = Math.sin(t * 18);
      body.position.y = bodyY - 0.12;
      body.rotation.x = 0.48;
      body.rotation.z = 0.1 + wiggle * 0.03;
      leftArm.rotation.x = 0.6;
      leftArm.rotation.z = 0.48;
      rightArm.rotation.x = 0.45;
      rightArm.rotation.z = -0.58;
      leftLeg.rotation.x = 0.78;
      rightLeg.rotation.x = 0.92;
      leftLeg.rotation.z = 0.18;
      rightLeg.rotation.z = -0.14;
      head.rotation.x = 0.32 + wiggle * 0.04;
      head.rotation.z = 0.12;
      return;
    }

    const breath = Math.sin(t * 3.4);
    body.position.y = bodyY + breath * 0.008;
    leftArm.rotation.z = 0.16 + breath * 0.03;
    rightArm.rotation.z = -0.16 - breath * 0.03;
    leftArm.rotation.x = 0.08;
    rightArm.rotation.x = 0.06;
    leftLeg.rotation.z = 0.045;
    rightLeg.rotation.z = -0.045;
    head.rotation.x = 0.04 + breath * 0.025;
    head.rotation.z = breath * 0.03;
  };

  return group;
}
