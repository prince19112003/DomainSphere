/**
 * effects/chidori.js — Chidori: One Thousand Birds
 * Naruto · Uchiha Sasuke
 * Premium rewrite: dense lightning cage, sparkling blue corona, chirping sparks
 */
export function createChidori(THREE) {
  const group = new THREE.Group();

  const BOLT_COUNT = 28;
  const SPARK_COUNT = 200;
  const ARC_COUNT = 10;

  // ─── 1. LIGHTNING BOLTS ──────────────────────────────────────────────
  const boltGroups = [];
  for (let i = 0; i < BOLT_COUNT; i++) {
    const isBright = i % 4 === 0;
    const mat = new THREE.LineBasicMaterial({
      color: isBright ? 0xffffff : (i % 3 === 1 ? 0x00cfff : 0x4488ff),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const pts = new Float32Array(14 * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const line = new THREE.Line(geo, mat);
    group.add(line);
    boltGroups.push({ geo, mat });
  }

  // ─── 2. LONG OUTER ARCS (cage feel) ─────────────────────────────────
  const arcGroups = [];
  for (let i = 0; i < ARC_COUNT; i++) {
    const mat = new THREE.LineBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const pts = new Float32Array(18 * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const line = new THREE.Line(geo, mat);
    group.add(line);
    arcGroups.push({ geo, mat });
  }

  // ─── 3. SPARK PARTICLES ───────────────────────────────────────────────
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(SPARK_COUNT * 3);
  const sparkVel = [];
  for (let i = 0; i < SPARK_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.004 + Math.random() * 0.01;
    sparkVel.push({
      vx: Math.sin(phi) * Math.cos(theta) * speed,
      vy: Math.sin(phi) * Math.sin(theta) * speed,
      vz: Math.cos(phi) * speed,
      life: Math.random()
    });
    sparkPos[i * 3] = (Math.random() - 0.5) * 0.06;
    sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 0.06;
    sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({
    color: 0x00cfff, size: 0.013, transparent: true, opacity: 0.95,
    sizeAttenuation: true, blending: THREE.AdditiveBlending
  });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  group.add(sparks);

  // ─── 4. CORE GLOW (multi-layer) ──────────────────────────────────────
  const coreWhite = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending })
  );
  group.add(coreWhite);

  const coreBlue = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x0088ff, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, side: THREE.BackSide })
  );
  group.add(coreBlue);

  const coreOuter = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x003388, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, side: THREE.BackSide })
  );
  group.add(coreOuter);

  // ─── 5. ROTATING RING ───────────────────────────────────────────────
  const haloRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.008, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending })
  );
  haloRing.rotation.x = Math.PI / 4;
  group.add(haloRing);

  // ─── Helper: jagged bolt ───────────────────────────────────────────
  function randomBolt(pts, range, segs = 13) {
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    const len = range * (0.5 + Math.random() * 0.7);
    const dx = Math.cos(theta) * Math.cos(phi) * len / segs;
    const dy = Math.sin(phi) * len / segs;
    const dz = Math.sin(theta) * Math.cos(phi) * len / segs;
    let x = 0, y = 0, z = 0;
    for (let s = 0; s <= segs; s++) {
      const jitter = s === 0 || s === segs ? 0 : (Math.random() - 0.5) * 0.08;
      pts[s * 3] = x + jitter;
      pts[s * 3 + 1] = y + jitter;
      pts[s * 3 + 2] = z + jitter;
      x += dx; y += dy; z += dz;
    }
  }

  return {
    group,
    update(time, charge) {
      const t = time * 0.001;
      const scale = 0.5 + charge * 1.6;
      group.scale.setScalar(scale);

      const range = 0.2 + charge * 0.3;
      const longRange = 0.35 + charge * 0.45;

      // Short crackling bolts
      boltGroups.forEach(({ geo, mat }) => {
        const pts = geo.attributes.position.array;
        randomBolt(pts, range, 13);
        geo.attributes.position.needsUpdate = true;
        mat.opacity = (0.3 + Math.random() * 0.65) * (0.5 + charge * 0.5);
      });

      // Long outer arcs
      arcGroups.forEach(({ geo, mat }) => {
        const pts = geo.attributes.position.array;
        randomBolt(pts, longRange, 17);
        geo.attributes.position.needsUpdate = true;
        mat.opacity = (0.15 + Math.random() * 0.35) * charge;
      });

      // Sparks
      const sPos = sparkGeo.attributes.position.array;
      for (let i = 0; i < SPARK_COUNT; i++) {
        const v = sparkVel[i];
        v.life -= 0.02;
        if (v.life <= 0) {
          sPos[i * 3] = (Math.random() - 0.5) * 0.05;
          sPos[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
          sPos[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const speed = 0.005 + Math.random() * 0.012;
          v.vx = Math.sin(phi) * Math.cos(theta) * speed;
          v.vy = Math.sin(phi) * Math.sin(theta) * speed;
          v.vz = Math.cos(phi) * speed;
          v.life = 0.4 + Math.random() * 0.6;
        } else {
          sPos[i * 3] += v.vx;
          sPos[i * 3 + 1] += v.vy;
          sPos[i * 3 + 2] += v.vz;
          v.vy -= 0.00012;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkMat.opacity = 0.5 + charge * 0.5;

      // Core pulse
      const pulse = 1 + Math.sin(t * 12) * 0.2;
      coreWhite.scale.setScalar(pulse);
      coreBlue.scale.setScalar(pulse * 1.1);
      coreBlue.material.opacity = 0.3 + charge * 0.4;
      coreOuter.material.opacity = 0.1 + charge * 0.18;

      // Halo spin
      haloRing.rotation.z += 0.04 * (1 + charge * 2);
      haloRing.material.opacity = 0.3 + charge * 0.55;
    },
    setColor(hex) {
      sparkMat.color.set(hex);
      boltGroups.forEach(({ mat }) => mat.color.set(hex));
    },
    getParticleCount() { return SPARK_COUNT + BOLT_COUNT + ARC_COUNT; },
  };
}
