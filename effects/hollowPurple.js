/**
 * effects/hollowPurple.js — Cinematic Hollow Purple Singularity (Kyōkushin: Murasaki)
 * JJK · Gojo Satoru
 * High-fidelity 3D gravitational core, spiraling double-helix red/blue inputs,
 * high-frequency unstable lightning cage, and chaotic accretion dust.
 */
export function createHollowPurple(THREE) {
  const group = new THREE.Group();

  // ─── 1. CORE NESTED SINGULARITY ────────────────────────────────────
  const coreGroup = new THREE.Group();
  group.add(coreGroup);

  // Inner White-Hot Singularity Core
  const whiteCoreGeo = new THREE.SphereGeometry(0.035, 32, 32);
  const whiteCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
  const whiteCore = new THREE.Mesh(whiteCoreGeo, whiteCoreMat);
  coreGroup.add(whiteCore);

  // Violet Energy Plasma Core
  const purpleCoreGeo = new THREE.SphereGeometry(0.065, 32, 32);
  const purpleCoreMat = new THREE.MeshBasicMaterial({ color: 0x8a2be2, transparent: true, opacity: 0.85 });
  const purpleCore = new THREE.Mesh(purpleCoreGeo, purpleCoreMat);
  coreGroup.add(purpleCore);

  // Dark Gravity Shadow Sphere (simulates gravitational black hole/singularity)
  const darkCoreGeo = new THREE.SphereGeometry(0.08, 24, 24);
  const darkCoreMat = new THREE.MeshBasicMaterial({ color: 0x0c0018, transparent: true, opacity: 0.8, side: THREE.BackSide });
  const darkCore = new THREE.Mesh(darkCoreGeo, darkCoreMat);
  coreGroup.add(darkCore);

  // Outer Gaseous Purple Aura
  const auraCoreGeo = new THREE.SphereGeometry(0.13, 24, 24);
  const auraCoreMat = new THREE.MeshBasicMaterial({ color: 0xba55d3, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
  const auraCore = new THREE.Mesh(auraCoreGeo, auraCoreMat);
  coreGroup.add(auraCore);

  // ─── 2. GRAVITATIONAL ACCRETION LENSING RINGS ──────────────────────
  const rings = [];
  const ringAngles = [
    { x: Math.PI / 4, y: 0.2, z: 0.1 },
    { x: -Math.PI / 3, y: -0.4, z: 0.3 },
    { x: 0.1, y: Math.PI / 2, z: -0.2 }
  ];
  ringAngles.forEach((rot, i) => {
    const geo = new THREE.TorusGeometry(0.16 + i * 0.03, 0.004, 6, 64);
    const mat = new THREE.MeshBasicMaterial({
      color: i === 0 ? 0xff00ff : (i === 1 ? 0xda70d6 : 0x4b0082),
      transparent: true,
      opacity: 0.7 - i * 0.15,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.set(rot.x, rot.y, rot.z);
    ring.userData.speed = (i % 2 === 0 ? 1 : -1) * (1.5 + i * 0.8);
    coreGroup.add(ring);
    rings.push(ring);
  });

  // ─── 3. SWIRLING DOUBLE-HELIX ENERGY INFLOWS ───────────────────────
  // Blue energy (Infinity) spiraling from the left (-X)
  const BLUE_COUNT = 150;
  const blueGeo = new THREE.BufferGeometry();
  const bluePos = new Float32Array(BLUE_COUNT * 3);
  const bluePhases = new Float32Array(BLUE_COUNT);
  const blueSpeeds = new Float32Array(BLUE_COUNT);
  for (let i = 0; i < BLUE_COUNT; i++) {
    bluePhases[i] = (i / BLUE_COUNT) * Math.PI * 6; // spiral loops
    blueSpeeds[i] = 0.5 + Math.random() * 0.5;
    bluePos[i * 3] = -0.7 * (i / BLUE_COUNT); // X distribution
    bluePos[i * 3 + 1] = 0;
    bluePos[i * 3 + 2] = 0;
  }
  blueGeo.setAttribute('position', new THREE.BufferAttribute(bluePos, 3));
  const blueMat = new THREE.PointsMaterial({ color: 0x00ccff, size: 0.014, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  const blueStream = new THREE.Points(blueGeo, blueMat);
  group.add(blueStream);

  // Red energy (Divergence) spiraling from the right (+X)
  const RED_COUNT = 150;
  const redGeo = new THREE.BufferGeometry();
  const redPos = new Float32Array(RED_COUNT * 3);
  const redPhases = new Float32Array(RED_COUNT);
  const redSpeeds = new Float32Array(RED_COUNT);
  for (let i = 0; i < RED_COUNT; i++) {
    redPhases[i] = (i / RED_COUNT) * Math.PI * 6 + Math.PI; // offset by 180 degrees
    redSpeeds[i] = 0.5 + Math.random() * 0.5;
    redPos[i * 3] = 0.7 * (i / RED_COUNT); // X distribution
    redPos[i * 3 + 1] = 0;
    redPos[i * 3 + 2] = 0;
  }
  redGeo.setAttribute('position', new THREE.BufferAttribute(redPos, 3));
  const redMat = new THREE.PointsMaterial({ color: 0xff3300, size: 0.014, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  const redStream = new THREE.Points(redGeo, redMat);
  group.add(redStream);

  // ─── 4. HIGH-FREQUENCY PURPLE LIGHTNING CAGE ───────────────────────
  const ARC_COUNT = 8;
  const lightningLines = [];
  for (let i = 0; i < ARC_COUNT; i++) {
    const geo = new THREE.BufferGeometry();
    const pts = new Float32Array(10 * 3); // 10 segment points per arc
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const mat = new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? 0xff00ff : 0xda70d6,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const line = new THREE.Line(geo, mat);
    lightningLines.push({ line, geo, mat });
    coreGroup.add(line);
  }

  // ─── 5. GRAVITATIONAL ACCRETION DUST CLOUD ─────────────────────────
  const DUST_COUNT = 240;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST_COUNT * 3);
  const dustOrbits = [];
  for (let i = 0; i < DUST_COUNT; i++) {
    const radius = 0.1 + Math.random() * 0.18;
    const speed = 2.0 + Math.random() * 3.5;
    const incline = (Math.random() - 0.5) * 0.6;
    dustOrbits.push({ radius, speed, phase: Math.random() * Math.PI * 2, incline });
    dustPos[i * 3] = 0;
    dustPos[i * 3 + 1] = 0;
    dustPos[i * 3 + 2] = 0;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0x9370db, size: 0.009, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
  const dustCloud = new THREE.Points(dustGeo, dustMat);
  coreGroup.add(dustCloud);

  // Helper to generate spherical unstable lightning segment points
  function updateLightningArc(pts, charge) {
    const radius = 0.08 + charge * 0.06;
    const segs = 9;
    const startTheta = Math.random() * Math.PI * 2;
    const startPhi = Math.random() * Math.PI;
    const endTheta = startTheta + (Math.random() - 0.5) * Math.PI;
    const endPhi = startPhi + (Math.random() - 0.5) * Math.PI;

    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const theta = startTheta + (endTheta - startTheta) * t;
      const phi = startPhi + (endPhi - startPhi) * t;
      const jitter = s === 0 || s === segs ? 0 : (Math.random() - 0.5) * 0.035;
      const r = radius + jitter;

      pts[s * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pts[s * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pts[s * 3 + 2] = Math.cos(phi) * r;
    }
  }

  return {
    group,
    update(time, charge) {
      const t = time * 0.001;
      group.scale.setScalar(0.7 + charge * 1.5);

      // Core scaling & dynamic pulsing
      const corePulse = 0.95 + Math.sin(t * 15) * 0.05;
      whiteCore.scale.setScalar(corePulse);
      purpleCore.scale.setScalar(corePulse * (0.8 + charge * 0.6));
      darkCore.scale.setScalar(corePulse * (0.8 + charge * 0.5));
      auraCore.scale.setScalar(corePulse * (0.9 + charge * 0.8));

      purpleCoreMat.opacity = charge * 0.9;
      darkCoreMat.opacity = charge * 0.85;
      auraCoreMat.opacity = charge * 0.45;

      // Animate concentric lensing rings
      rings.forEach(ring => {
        ring.rotation.z += 0.006 * ring.userData.speed;
        ring.rotation.y += 0.003 * ring.userData.speed;
        const scalePulse = 0.95 + Math.sin(t * 5 + ring.userData.speed) * 0.05;
        ring.scale.setScalar(scalePulse * (0.8 + charge * 0.5));
        ring.material.opacity = charge * 0.75;
      });

      // Animate Blue Double-Helix Spiral
      const bPos = blueGeo.attributes.position.array;
      for (let i = 0; i < BLUE_COUNT; i++) {
        const speedFactor = blueSpeeds[i] * (1.0 + charge * 1.2);
        const currentPhase = bluePhases[i] + t * 5.0 * speedFactor;
        const tPos = (i / BLUE_COUNT); // 0 to 1 along X axis path
        const xCoord = -0.85 * (1.0 - (tPos + t * 0.5) % 1.0); // travel right
        const rad = 0.15 * Math.sin(tPos * Math.PI) * (1.0 - Math.abs(xCoord)); // thin ends

        bPos[i * 3] = xCoord;
        bPos[i * 3 + 1] = Math.sin(currentPhase) * rad;
        bPos[i * 3 + 2] = Math.cos(currentPhase) * rad;
      }
      blueGeo.attributes.position.needsUpdate = true;
      blueMat.opacity = 0.3 + charge * 0.6;

      // Animate Red Double-Helix Spiral
      const rPos = redGeo.attributes.position.array;
      for (let i = 0; i < RED_COUNT; i++) {
        const speedFactor = redSpeeds[i] * (1.0 + charge * 1.2);
        const currentPhase = redPhases[i] + t * 5.0 * speedFactor;
        const tPos = (i / RED_COUNT); // 0 to 1 along X axis path
        const xCoord = 0.85 * (1.0 - (tPos + t * 0.5) % 1.0); // travel left
        const rad = 0.15 * Math.sin(tPos * Math.PI) * (1.0 - Math.abs(xCoord)); // thin ends

        rPos[i * 3] = xCoord;
        rPos[i * 3 + 1] = Math.sin(currentPhase) * rad;
        rPos[i * 3 + 2] = Math.cos(currentPhase) * rad;
      }
      redGeo.attributes.position.needsUpdate = true;
      redMat.opacity = 0.3 + charge * 0.6;

      // Regenerate Lightning Cage
      lightningLines.forEach(({ geo, mat }) => {
        const pts = geo.attributes.position.array;
        updateLightningArc(pts, charge);
        geo.attributes.position.needsUpdate = true;
        mat.opacity = charge * (0.3 + Math.random() * 0.7);
      });

      // Animate Accretion Gravity Dust
      const dPos = dustGeo.attributes.position.array;
      for (let i = 0; i < DUST_COUNT; i++) {
        const orb = dustOrbits[i];
        orb.phase += 0.016 * orb.speed * (1.0 + charge * 1.5);
        const r = orb.radius * (1.0 - (charge * 0.3)); // shrink inward under gravity

        dPos[i * 3] = Math.cos(orb.phase) * r;
        dPos[i * 3 + 1] = Math.sin(orb.phase) * r * orb.incline;
        dPos[i * 3 + 2] = Math.sin(orb.phase) * r;
      }
      dustGeo.attributes.position.needsUpdate = true;
      dustMat.opacity = charge * 0.8;
      dustMat.size = 0.007 + charge * 0.004;
    },
    setColor(hex) {
      purpleCoreMat.color.set(hex);
      auraCoreMat.color.set(hex);
      dustMat.color.set(hex);
      rings[0].material.color.set(hex);
      lightningLines.forEach(l => l.mat.color.set(hex));
    },
    getParticleCount() { return BLUE_COUNT + RED_COUNT + DUST_COUNT + ARC_COUNT * 10; }
  };
}
