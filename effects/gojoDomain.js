/**
 * effects/gojoDomain.js — Infinite Void (Mugen)
 * JJK · Gojo Satoru
 * Premium rewrite: deep-space singularity, gravitational rings, void mist, aurora shimmer
 */
export function createGojoDomain(T) {
  const group = new T.Group();

  // ─── 1. VOID BACKGROUND NEBULA ───────────────────────────────────────
  const nebula = new T.Mesh(
    new T.SphereGeometry(3.5, 32, 32),
    new T.MeshBasicMaterial({ color: 0x000820, transparent: true, opacity: 0.0, side: T.BackSide })
  );
  group.add(nebula);

  // ─── 2. MULTI-LAYER CELESTIAL HALOS ──────────────────────────────────
  const haloData = [
    { r: 0.55, tube: 0.016, col: 0xffffff, opa: 0.9,  rotX: Math.PI / 4,  speed: 0.0004 },
    { r: 0.55, tube: 0.05,  col: 0x44aaff, opa: 0.25, rotX: Math.PI / 4,  speed: 0.0004 },
    { r: 0.72, tube: 0.009, col: 0x8866ff, opa: 0.55, rotX: -Math.PI / 6, speed: -0.0007 },
    { r: 0.90, tube: 0.005, col: 0x4488ff, opa: 0.35, rotX: Math.PI / 3,  speed: 0.0009 },
    { r: 1.12, tube: 0.004, col: 0x220044, opa: 0.8,  rotX: -Math.PI / 5, speed: -0.0005 },
  ];
  const halos = haloData.map(d => {
    const m = new T.Mesh(
      new T.TorusGeometry(d.r, d.tube, 16, 128),
      new T.MeshBasicMaterial({ color: d.col, transparent: true, opacity: d.opa, blending: T.AdditiveBlending })
    );
    m.rotation.x = d.rotX;
    m.userData.speed = d.speed;
    group.add(m);
    return m;
  });

  // ─── 3. SINGULARITY CORE ─────────────────────────────────────────────
  // White-hot inner point
  const core = new T.Mesh(
    new T.SphereGeometry(0.07, 32, 32),
    new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0, blending: T.AdditiveBlending })
  );
  group.add(core);

  // Layers of glow
  const glowLayers = [
    { r: 0.14, col: 0xaaaaff, opa: 0.6 },
    { r: 0.25, col: 0x6633ff, opa: 0.35 },
    { r: 0.42, col: 0x220055, opa: 0.22 },
  ];
  const glowMeshes = glowLayers.map(d => {
    const m = new T.Mesh(
      new T.SphereGeometry(d.r, 24, 24),
      new T.MeshBasicMaterial({ color: d.col, transparent: true, opacity: d.opa, blending: T.AdditiveBlending, side: T.BackSide })
    );
    group.add(m);
    return m;
  });

  // ─── 4. VOID DISTORTION RINGS (Gravitational lensing feel) ───────────
  const distRings = [];
  for (let i = 0; i < 5; i++) {
    const r = 0.3 + i * 0.18;
    const m = new T.Mesh(
      new T.TorusGeometry(r, 0.003, 8, 96),
      new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 - i * 0.015, blending: T.AdditiveBlending })
    );
    m.rotation.x = Math.random() * Math.PI;
    m.rotation.y = Math.random() * Math.PI;
    m.userData.rx = (Math.random() - 0.5) * 0.003;
    m.userData.ry = (Math.random() - 0.5) * 0.003;
    group.add(m);
    distRings.push(m);
  }

  // ─── 5. STARFIELD ────────────────────────────────────────────────────
  const starCount = 1200;
  const starGeo = new T.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starVel = [];
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = 0.2 + Math.random() * 2;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    starPos[i * 3] = x; starPos[i * 3 + 1] = y; starPos[i * 3 + 2] = z;
    starVel.push({ vx: (x / r) * 0.0012, vy: (y / r) * 0.0012, vz: (z / r) * 0.0012 });
  }
  starGeo.setAttribute('position', new T.BufferAttribute(starPos, 3));
  const starMat = new T.PointsMaterial({ color: 0xddeeff, size: 0.009, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, sizeAttenuation: true });
  const stars = new T.Points(starGeo, starMat);
  group.add(stars);

  // ─── 6. VOID MIST PARTICLES ──────────────────────────────────────────
  const mistCount = 600;
  const mistGeo = new T.BufferGeometry();
  const mistPos = new Float32Array(mistCount * 3);
  const mistPhase = new Float32Array(mistCount);
  for (let i = 0; i < mistCount; i++) {
    mistPos[i * 3] = (Math.random() - 0.5) * 3;
    mistPos[i * 3 + 1] = (Math.random() - 0.5) * 3;
    mistPos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    mistPhase[i] = Math.random() * Math.PI * 2;
  }
  mistGeo.setAttribute('position', new T.BufferAttribute(mistPos, 3));
  const mistMat = new T.PointsMaterial({ color: 0x3322aa, size: 0.04, transparent: true, opacity: 0.15, blending: T.AdditiveBlending, sizeAttenuation: true });
  const mist = new T.Points(mistGeo, mistMat);
  group.add(mist);

  return {
    group,
    update: (time, charge) => {
      const t = time * 0.001;
      const scale = 0.45 + charge * 2.2;
      group.scale.set(scale, scale, scale);

      // Void nebula
      nebula.material.opacity = charge * 0.85;

      // Halos rotate
      halos.forEach((h, i) => {
        h.rotation.z = t * haloData[i].speed * 1000;
        h.material.opacity = haloData[i].opa * (0.5 + charge * 0.5);
      });

      // Core pulse
      const pulse = 1 + Math.sin(t * 8) * 0.18;
      core.scale.setScalar(pulse);
      core.material.opacity = 0.7 + charge * 0.3;

      // Glow layers breathe
      glowMeshes.forEach((m, i) => {
        m.scale.setScalar(pulse * (1 + i * 0.05));
        m.material.opacity = glowLayers[i].opa * (0.4 + charge * 0.6);
      });

      // Distortion rings drift
      distRings.forEach(r => {
        r.rotation.x += r.userData.rx * (1 + charge);
        r.rotation.y += r.userData.ry * (1 + charge);
        r.material.opacity = (0.08 + charge * 0.18) * (0.7 + Math.sin(t * 3) * 0.3);
      });

      // Stars expand outward
      const pos = stars.geometry.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        pos[i * 3] += starVel[i].vx * charge;
        pos[i * 3 + 1] += starVel[i].vy * charge;
        pos[i * 3 + 2] += starVel[i].vz * charge;
        const distSq = pos[i * 3] ** 2 + pos[i * 3 + 1] ** 2 + pos[i * 3 + 2] ** 2;
        if (distSq > 9) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const r = 0.2;
          pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          pos[i * 3 + 2] = r * Math.cos(phi);
        }
      }
      stars.geometry.attributes.position.needsUpdate = true;
      starMat.opacity = 0.4 + charge * 0.6;

      // Mist drift
      const mp = mist.geometry.attributes.position.array;
      for (let i = 0; i < mistCount; i++) {
        mp[i * 3] += Math.sin(t + mistPhase[i]) * 0.0008;
        mp[i * 3 + 1] += Math.cos(t * 0.7 + mistPhase[i]) * 0.0006;
      }
      mist.geometry.attributes.position.needsUpdate = true;
      mistMat.opacity = 0.08 + charge * 0.25;
    },
    setColor: (_hex) => {},
    getParticleCount: () => starCount + mistCount
  };
}
