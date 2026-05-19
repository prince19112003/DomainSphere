/**
 * effects/rasengan.js — Rasengan (螺旋丸)
 * Naruto · Uzumaki Naruto
 * Premium rewrite: dense swirl, outer torus rings, energy shockwave, additive glow
 */
export function createRasengan(THREE) {
  const group = new THREE.Group();
  let chakraColor = new THREE.Color(0x4fc3f7);

  // ─── 1. CORE LAYERS ──────────────────────────────────────────────────
  const coreWhite = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending })
  );
  group.add(coreWhite);

  const coreBlue = new THREE.Mesh(
    new THREE.SphereGeometry(0.10, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, side: THREE.BackSide })
  );
  group.add(coreBlue);

  const coreOuter = new THREE.Mesh(
    new THREE.SphereGeometry(0.20, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0x0055cc, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, side: THREE.BackSide })
  );
  group.add(coreOuter);

  // ─── 2. ROTATING TORUS RINGS ─────────────────────────────────────────
  const ringDefs = [
    { r: 0.14, tube: 0.006, col: 0x00f0ff, opa: 0.75, rotX: 0,            speed:  2.5 },
    { r: 0.18, tube: 0.005, col: 0x4fc3f7, opa: 0.55, rotX: Math.PI/3,    speed: -3.2 },
    { r: 0.23, tube: 0.004, col: 0x90caf9, opa: 0.40, rotX: Math.PI*2/3,  speed:  1.8 },
    { r: 0.30, tube: 0.003, col: 0x3388ff, opa: 0.28, rotX: -Math.PI/4,   speed: -2.0 },
  ];
  const rings = ringDefs.map(d => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(d.r, d.tube, 8, 64),
      new THREE.MeshBasicMaterial({ color: d.col, transparent: true, opacity: d.opa, blending: THREE.AdditiveBlending })
    );
    m.rotation.x = d.rotX;
    m.userData.speed = d.speed;
    group.add(m);
    return m;
  });

  // ─── 3. SWIRLING PARTICLE VORTEX ─────────────────────────────────────
  const ptCount = 400;
  const ptGeo = new THREE.BufferGeometry();
  const ptPos = new Float32Array(ptCount * 3);
  const ptPhase = new Float32Array(ptCount);
  const ptRadius = new Float32Array(ptCount);
  const ptHeight = new Float32Array(ptCount);
  for (let i = 0; i < ptCount; i++) {
    ptPhase[i] = Math.random() * Math.PI * 2;
    ptRadius[i] = 0.08 + Math.random() * 0.24;
    ptHeight[i] = (Math.random() - 0.5) * 0.24;
  }
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPos, 3));
  const ptMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.01, transparent: true, opacity: 0.85, sizeAttenuation: true, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(ptGeo, ptMat);
  group.add(particles);

  // ─── 4. OUTER WIND SHOCKWAVE ─────────────────────────────────────────
  const shockMat = new THREE.MeshBasicMaterial({
    color: 0x88ddff, transparent: true, opacity: 0.0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending
  });
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.55, 64), shockMat);
  shock.rotation.x = Math.PI / 2;
  group.add(shock);
  let shockPhase = 0;

  return {
    group,
    update(time, charge) {
      const t = time * 0.001;
      const scale = 0.45 + charge * 1.35;
      group.scale.setScalar(scale);

      // Core pulse
      const pulse = 0.9 + Math.sin(t * 9) * 0.18;
      coreWhite.scale.setScalar(pulse);
      coreBlue.scale.setScalar(pulse * 1.12);
      coreBlue.material.opacity = 0.35 + charge * 0.4;
      coreOuter.material.opacity = 0.12 + charge * 0.18;

      // Rings spin at their own speeds
      rings.forEach((r, i) => {
        r.rotation.z += 0.016 * ringDefs[i].speed;
        r.material.opacity = ringDefs[i].opa * (0.5 + charge * 0.5);
      });

      // Particle vortex
      const pos = ptGeo.attributes.position.array;
      for (let i = 0; i < ptCount; i++) {
        const phase = ptPhase[i] + t * (3.5 + i * 0.002);
        const fade = (t * 0.4) % 1.0;
        const r = ptRadius[i] * (1.0 - fade * 0.8 + 0.2);
        pos[i * 3] = Math.cos(phase) * r;
        pos[i * 3 + 1] = Math.sin(phase * 1.4) * r * 0.55 + ptHeight[i];
        pos[i * 3 + 2] = Math.sin(phase) * r;
      }
      ptGeo.attributes.position.needsUpdate = true;
      ptMat.opacity = 0.5 + charge * 0.5;

      // Shockwave expand & fade
      shockPhase += 0.02 * (1 + charge * 2);
      if (shockPhase > 1.0) shockPhase = 0;
      const sw = 1.0 + shockPhase * 1.8;
      shock.scale.set(sw, sw, 1);
      shock.material.opacity = Math.max(0, (1 - shockPhase * 1.2)) * charge * 0.45;
    },
    setColor(hex) {
      chakraColor.set(hex);
      ptMat.color.set(hex);
      coreBlue.material.color.set(hex);
      rings[0].material.color.set(hex);
    },
    getParticleCount() { return ptCount; },
  };
}
