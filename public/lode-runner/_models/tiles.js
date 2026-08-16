const _cache = new WeakMap();

function assets(THREE) {
  let a = _cache.get(THREE);
  if (a) return a;

  const lambert = (hex) =>
    new THREE.MeshLambertMaterial({ color: hex, flatShading: true });

  a = {
    unit: new THREE.BoxGeometry(1, 1, 1),
    mat: {
      brickFace: lambert(0xd05030),
      brickBody: lambert(0xc44c3c),
      grout: lambert(0x2a1010),
      solidFace: lambert(0x8a5a32),
      solidBody: lambert(0x6b4423),
      trapUnder: lambert(0x1a0808),
      pitVoid: lambert(0x070305),
      pitLip: lambert(0xd05030),
      pitLipShade: lambert(0xc44c3c),
    },
  };
  _cache.set(THREE, a);
  return a;
}

function box(group, geo, mat, w, h, d, x, y, z) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(w, h, d);
  mesh.position.set(x, y, z);
  group.add(mesh);
  return mesh;
}

function bevelCell(group, geo, faceMat, bodyMat, w, h, x, y, z, depth, bevel) {
  const bodyD = depth * 0.72;
  const faceD = depth * 0.42;
  box(group, geo, bodyMat, w, h, bodyD, x, y, z - depth * 0.12);
  box(
    group,
    geo,
    faceMat,
    Math.max(w - bevel * 2, 0.04),
    Math.max(h - bevel * 2, 0.04),
    faceD,
    x,
    y,
    z + depth * 0.22
  );
}

function waffle(group, a, opts) {
  const {
    faceMat,
    bodyMat,
    groutMat,
    cols,
    rows,
    groutD,
    groutZ,
    margin,
    groove,
    bevel,
    cellD,
    cellZ,
  } = opts;

  box(group, a.unit, groutMat, 1, 1, groutD, 0, 0, groutZ);

  const innerW = 1 - margin * 2;
  const innerH = 1 - margin * 2;
  const bw = (innerW - groove * (cols - 1)) / cols;
  const bh = (innerH - groove * (rows - 1)) / rows;

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = -innerW * 0.5 + bw * 0.5 + i * (bw + groove);
      const y = innerH * 0.5 - bh * 0.5 - j * (bh + groove);
      bevelCell(group, a.unit, faceMat, bodyMat, bw, bh, x, y, cellZ, cellD, bevel);
    }
  }
}

function assembleBrick(THREE, kind) {
  const group = new THREE.Group();
  group.userData.kind = kind;
  const a = assets(THREE);

  waffle(group, a, {
    faceMat: a.mat.brickFace,
    bodyMat: a.mat.brickBody,
    groutMat: a.mat.grout,
    cols: 2,
    rows: 2,
    groutD: 0.52,
    groutZ: -0.1,
    margin: 0.055,
    groove: 0.078,
    bevel: 0.032,
    cellD: 0.3,
    cellZ: 0.18,
  });

  if (kind === "trap") {
    box(group, a.unit, a.mat.trapUnder, 0.9, 0.045, 0.48, 0, -0.458, -0.12);
  }

  return group;
}

export function makeBrick(THREE) {
  return assembleBrick(THREE, "brick");
}

export function makeSolid(THREE) {
  const group = new THREE.Group();
  group.userData.kind = "solid";
  const a = assets(THREE);

  waffle(group, a, {
    faceMat: a.mat.solidFace,
    bodyMat: a.mat.solidBody,
    groutMat: a.mat.grout,
    cols: 1,
    rows: 2,
    groutD: 0.62,
    groutZ: -0.11,
    margin: 0.04,
    groove: 0.05,
    bevel: 0.022,
    cellD: 0.48,
    cellZ: 0.16,
  });

  return group;
}

export function makeTrap(THREE) {
  return assembleBrick(THREE, "trap");
}

export function makePit(THREE) {
  const group = new THREE.Group();
  group.userData.kind = "pit";
  const a = assets(THREE);
  const { unit, mat } = a;

  box(group, unit, mat.pitVoid, 0.7, 0.7, 0.1, 0, -0.02, -0.31);
  box(group, unit, mat.pitVoid, 0.88, 0.11, 0.56, 0, -0.445, -0.04);

  box(group, unit, mat.grout, 0.1, 0.9, 0.52, -0.445, 0.02, -0.06);
  box(group, unit, mat.grout, 0.1, 0.9, 0.52, 0.445, 0.02, -0.06);
  box(group, unit, mat.grout, 0.7, 0.1, 0.52, 0, 0.445, -0.06);

  const lips = [
    [-0.3, 0.43, 0.24, 0.28, 0.1, 0.18, 0.06, 0, -0.08, 0],
    [0.04, 0.445, 0.21, 0.18, 0.075, 0.14, -0.05, 0.03, 0.12, 1],
    [0.33, 0.42, 0.25, 0.26, 0.11, 0.16, 0.08, 0, 0.04, 0],
    [0.44, 0.16, 0.22, 0.09, 0.24, 0.15, 0, 0.1, 0.05, 1],
    [0.435, -0.16, 0.2, 0.085, 0.18, 0.13, 0.07, 0, -0.1, 0],
    [0.28, -0.425, 0.24, 0.3, 0.1, 0.17, -0.06, 0, 0.07, 0],
    [-0.05, -0.445, 0.19, 0.16, 0.07, 0.12, 0.1, 0, 0.02, 1],
    [-0.34, -0.42, 0.23, 0.24, 0.11, 0.16, 0, -0.04, -0.06, 0],
    [-0.445, -0.1, 0.21, 0.09, 0.22, 0.14, 0, 0.08, 0.05, 1],
    [-0.43, 0.24, 0.25, 0.1, 0.2, 0.16, 0.04, 0, -0.03, 0],
    [-0.16, -0.28, 0.04, 0.12, 0.06, 0.08, 0.45, 0.2, 0.35, 1],
    [0.18, -0.33, -0.02, 0.1, 0.05, 0.07, -0.28, 0.12, -0.22, 0],
    [0.05, 0.08, -0.1, 0.08, 0.05, 0.06, 0.5, 0.05, 0.4, 1],
  ];

  for (const [x, y, z, w, h, d, rx, ry, rz, shade] of lips) {
    const chip = box(
      group,
      unit,
      shade ? mat.pitLipShade : mat.pitLip,
      w,
      h,
      d,
      x,
      y,
      z
    );
    chip.rotation.set(rx, ry, rz);
  }

  return group;
}
