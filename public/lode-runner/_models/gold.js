// signature: nes-bullion-3
export function makeGold(THREE) {
  const root = new THREE.Group();
  root.userData.kind = "gold";

  const bob = new THREE.Group();
  root.add(bob);
  root.userData.bob = bob;

  const C_HI = new THREE.Color(0xfff070);
  const C_MID = new THREE.Color(0xf8d020);
  const C_WARM = new THREE.Color(0xe8b010);
  const C_SH = new THREE.Color(0xa07008);

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    metalness: 0.58,
    roughness: 0.36,
    flatShading: true,
    emissive: new THREE.Color(0x3a2804),
    emissiveIntensity: 0.14,
  });

  function V(x, y, z) {
    return new THREE.Vector3(x, y, z);
  }

  function addTri(pos, col, a, b, c, color) {
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    for (let i = 0; i < 3; i++) col.push(color.r, color.g, color.b);
  }

  function addQuad(pos, col, a, b, c, d, color) {
    addTri(pos, col, a, b, c, color);
    addTri(pos, col, a, c, d, color);
  }

  function ingotGeometry(w, h, d) {
    const pos = [];
    const col = [];
    const tw = w * 0.62;
    const td = d * 0.62;
    const sw = w * 0.94;
    const sd = d * 0.94;
    const sh = h * 0.72;

    const b0 = V(-w / 2, 0, -d / 2);
    const b1 = V(w / 2, 0, -d / 2);
    const b2 = V(w / 2, 0, d / 2);
    const b3 = V(-w / 2, 0, d / 2);

    const s0 = V(-sw / 2, sh, -sd / 2);
    const s1 = V(sw / 2, sh, -sd / 2);
    const s2 = V(sw / 2, sh, sd / 2);
    const s3 = V(-sw / 2, sh, sd / 2);

    const t0 = V(-tw / 2, h, -td / 2);
    const t1 = V(tw / 2, h, -td / 2);
    const t2 = V(tw / 2, h, td / 2);
    const t3 = V(-tw / 2, h, td / 2);

    addQuad(pos, col, b0, b1, b2, b3, C_SH);
    addQuad(pos, col, b0, s0, s1, b1, C_WARM);
    addQuad(pos, col, b1, s1, s2, b2, C_MID);
    addQuad(pos, col, b2, s2, s3, b3, C_MID);
    addQuad(pos, col, b3, s3, s0, b0, C_WARM);
    addQuad(pos, col, s0, t0, t1, s1, C_HI);
    addQuad(pos, col, s1, t1, t2, s2, C_HI);
    addQuad(pos, col, s2, t2, t3, s3, C_HI);
    addQuad(pos, col, s3, t3, t0, s0, C_HI);
    addQuad(pos, col, t0, t1, t2, t3, C_HI);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();
    return geo;
  }

  // Three trapezoid bars, ~0.42 × 0.28 × 0.28, sitting on the cell floor.
  const bars = [
    { w: 0.392, h: 0.086, d: 0.228, x: 0.008, y: 0.0, z: 0.01, ry: 0.11 },
    { w: 0.318, h: 0.078, d: 0.186, x: -0.02, y: 0.08, z: -0.014, ry: -0.2 },
    { w: 0.228, h: 0.07, d: 0.142, x: 0.016, y: 0.152, z: 0.008, ry: 0.17 },
  ];

  const floorY = -0.42;

  for (const bar of bars) {
    const mesh = new THREE.Mesh(ingotGeometry(bar.w, bar.h, bar.d), mat);
    mesh.position.set(bar.x, floorY + bar.y, bar.z);
    mesh.rotation.y = bar.ry;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    bob.add(mesh);
  }

  return root;
}
