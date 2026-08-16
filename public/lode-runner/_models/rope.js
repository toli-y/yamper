export function makeRope(THREE) {
  const root = new THREE.Group();
  root.userData.kind = "rope";

  const cream = new THREE.MeshLambertMaterial({ color: 0xf0e6c8 });
  const frost = new THREE.MeshLambertMaterial({ color: 0xfcfcfc });
  const umber = new THREE.MeshLambertMaterial({ color: 0xc4b496 });

  const Y = 0.32;
  const Z = 0.07;
  const LEN = 0.98;
  const HALF = LEN * 0.5;
  const SAG = 0.014;

  const railCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-HALF, Y, Z),
    new THREE.Vector3(0, Y - SAG, Z),
    new THREE.Vector3(HALF, Y, Z)
  );
  const rail = new THREE.Mesh(new THREE.TubeGeometry(railCurve, 18, 0.03, 8, false), cream);
  root.add(rail);

  const bellyCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-HALF + 0.02, Y - 0.02, Z),
    new THREE.Vector3(0, Y - SAG - 0.02, Z),
    new THREE.Vector3(HALF - 0.02, Y - 0.02, Z)
  );
  root.add(new THREE.Mesh(new THREE.TubeGeometry(bellyCurve, 14, 0.016, 6, false), umber));

  const sheenCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-HALF + 0.05, Y + 0.014, Z + 0.012),
    new THREE.Vector3(0, Y - SAG + 0.014, Z + 0.012),
    new THREE.Vector3(HALF - 0.05, Y + 0.014, Z + 0.012)
  );
  root.add(new THREE.Mesh(new THREE.TubeGeometry(sheenCurve, 12, 0.009, 5, false), frost));

  const knobGeo = new THREE.SphereGeometry(0.046, 8, 6);
  const collarGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.036, 8);

  for (const side of [-1, 1]) {
    const knob = new THREE.Mesh(knobGeo, frost);
    knob.position.set(side * HALF, Y, Z);
    knob.scale.set(1.08, 0.9, 0.9);
    root.add(knob);

    const collar = new THREE.Mesh(collarGeo, cream);
    collar.rotation.z = Math.PI / 2;
    collar.position.set(side * (HALF - 0.028), Y, Z);
    root.add(collar);
  }

  return root;
}
