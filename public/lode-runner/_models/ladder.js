export function makeLadder(THREE, hidden) {
  const group = new THREE.Group();
  group.userData.kind = hidden ? "escape" : "ladder";

  const railHex = hidden ? 0xa8d8b4 : 0xd0d0d0;
  const rungHex = hidden ? 0xc8f0d0 : 0xf0f0f0;
  const capHex = hidden ? 0xe4ffe8 : 0xf8f8f8;

  const railMat = new THREE.MeshLambertMaterial({
    color: railHex,
    flatShading: true,
  });
  const rungMat = new THREE.MeshLambertMaterial({
    color: rungHex,
    flatShading: true,
  });
  const capMat = new THREE.MeshLambertMaterial({
    color: capHex,
    flatShading: true,
  });

  const H = 0.96;
  const W = 0.55;
  const railR = 0.036;
  const railX = W * 0.5 - railR;
  const z = 0.15;

  const railGeo = new THREE.CylinderGeometry(railR, railR * 0.9, H, 8);
  const capGeo = new THREE.SphereGeometry(railR * 1.14, 8, 6);
  const collarGeo = new THREE.CylinderGeometry(railR * 1.28, railR * 1.28, 0.028, 8);
  const rungGeo = new THREE.BoxGeometry(W - railR * 1.15, 0.04, 0.034);
  const lipGeo = new THREE.BoxGeometry(W - railR * 1.7, 0.014, 0.012);
  const boltGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.026, 6);

  for (const side of [-1, 1]) {
    const x = side * railX;
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(x, 0, z);
    group.add(rail);

    const capTop = new THREE.Mesh(capGeo, capMat);
    capTop.scale.set(1, 0.62, 1);
    capTop.position.set(x, H * 0.5, z);
    group.add(capTop);

    const capBot = new THREE.Mesh(capGeo, capMat);
    capBot.scale.set(1, 0.62, 1);
    capBot.position.set(x, -H * 0.5, z);
    group.add(capBot);
  }

  const rungs = 4;
  const span = H - 0.22;
  const y0 = -span * 0.5;
  const step = span / (rungs - 1);

  for (let i = 0; i < rungs; i++) {
    const y = y0 + i * step;

    const rung = new THREE.Mesh(rungGeo, rungMat);
    rung.position.set(0, y, z + 0.014);
    group.add(rung);

    const lip = new THREE.Mesh(lipGeo, capMat);
    lip.position.set(0, y + 0.012, z + 0.032);
    group.add(lip);

    for (const side of [-1, 1]) {
      const x = side * railX;

      const collar = new THREE.Mesh(collarGeo, railMat);
      collar.position.set(x, y, z);
      group.add(collar);

      const bolt = new THREE.Mesh(boltGeo, capMat);
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(x, y, z + railR + 0.006);
      group.add(bolt);
    }
  }

  return group;
}
