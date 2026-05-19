/**
 * effects/sukunaDomain.js — Malevolent Shrine
 * JJK · Ryomen Sukuna
 * Cinematic rewrite: temple stays within screen bounds, richer visuals.
 */
export function createSukunaDomain(T) {
  const group = new T.Group();

  // ─── Materials ───────────────────────────────────────────────────────
  const gateMat = new T.MeshStandardMaterial({
    color: 0x3a0000,
    emissive: 0x1a0000,
    roughness: 0.6,
    metalness: 0.5
  });

  const boneMat = new T.MeshStandardMaterial({
    color: 0xffeedd,
    emissive: 0x3a0808,
    roughness: 0.85,
    metalness: 0.1
  });

  const darkMat = new T.MeshStandardMaterial({
    color: 0x080000,
    roughness: 1.0,
    metalness: 0.0
  });

  // ─── 1. TORII GATE (scaled to fit within ~0.7 world units height) ───
  const gateGroup = new T.Group();

  // Pillars — height 0.55, positioned so tops reach y≈0.55
  const pillarGeo = new T.CylinderGeometry(0.045, 0.06, 0.55, 16);
  const leftPillar = new T.Mesh(pillarGeo, gateMat);
  leftPillar.position.set(-0.22, 0.275, 0);
  const rightPillar = new T.Mesh(pillarGeo, gateMat);
  rightPillar.position.set(0.22, 0.275, 0);
  gateGroup.add(leftPillar, rightPillar);

  // Bone ribs on pillars
  const ribGeo = new T.TorusGeometry(0.06, 0.018, 8, 16, Math.PI * 1.4);
  for (let y = 0.12; y <= 0.48; y += 0.12) {
    const lRib = new T.Mesh(ribGeo, boneMat);
    lRib.position.set(-0.22, y, 0);
    lRib.rotation.z = Math.PI / 4;
    const rRib = new T.Mesh(ribGeo, boneMat);
    rRib.position.set(0.22, y, 0);
    rRib.rotation.z = -Math.PI / 4;
    gateGroup.add(lRib, rRib);
  }

  // Lower crossbar
  const lowerBarGeo = new T.BoxGeometry(0.65, 0.045, 0.08);
  const lowerBar = new T.Mesh(lowerBarGeo, gateMat);
  lowerBar.position.set(0, 0.44, 0);
  gateGroup.add(lowerBar);

  // Upper crossbar (wider)
  const upperBarGeo = new T.BoxGeometry(0.78, 0.065, 0.09);
  const upperBar = new T.Mesh(upperBarGeo, gateMat);
  upperBar.position.set(0, 0.54, 0);
  gateGroup.add(upperBar);

  // Curved roof
  const roofGeo = new T.CylinderGeometry(0.48, 0.48, 0.85, 32, 1, false, 0, Math.PI);
  const roofMesh = new T.Mesh(roofGeo, darkMat);
  roofMesh.rotation.z = Math.PI / 2;
  roofMesh.rotation.x = Math.PI / 2;
  roofMesh.scale.set(1, 0.12, 0.32);
  roofMesh.position.set(0, 0.56, 0);
  gateGroup.add(roofMesh);

  // Horns
  const hornGeo = new T.ConeGeometry(0.032, 0.22, 8);
  const hornMat = new T.MeshStandardMaterial({ color: 0xffeedd, emissive: 0x880000, roughness: 0.3 });
  const leftHorn = new T.Mesh(hornGeo, hornMat);
  leftHorn.position.set(-0.37, 0.62, 0.04);
  leftHorn.rotation.z = -Math.PI / 4;
  const rightHorn = new T.Mesh(hornGeo, hornMat);
  rightHorn.position.set(0.37, 0.62, 0.04);
  rightHorn.rotation.z = Math.PI / 4;
  gateGroup.add(leftHorn, rightHorn);

  // ─── 2. SKULL / BONE MOUND (instanced) ──────────────────────────────
  const skullCount = 500;
  const skullGeo = new T.SphereGeometry(0.02, 6, 6);
  const skullInstanced = new T.InstancedMesh(skullGeo, boneMat, skullCount);
  const dummy = new T.Object3D();
  for (let i = 0; i < skullCount; i++) {
    const r = Math.random() * 0.32;
    const theta = Math.random() * Math.PI * 2;
    dummy.position.set(
      Math.cos(theta) * r,
      (0.32 - r) * (Math.random() * 0.5 + 0.2) - 0.02,
      Math.sin(theta) * r
    );
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    dummy.scale.setScalar(0.5 + Math.random() * 0.9);
    dummy.updateMatrix();
    skullInstanced.setMatrixAt(i, dummy.matrix);
  }
  skullInstanced.instanceMatrix.needsUpdate = true;
  gateGroup.add(skullInstanced);

  // ─── 3. SUKUNA'S EYE (center) ────────────────────────────────────────
  const coreGroup = new T.Group();
  coreGroup.position.set(0, 0.34, 0.06);

  const eyeGeo = new T.SphereGeometry(0.055, 32, 32);
  const eyeMat = new T.MeshBasicMaterial({ color: 0xff1111 });
  const mainEye = new T.Mesh(eyeGeo, eyeMat);
  coreGroup.add(mainEye);

  // Iris rings
  const r1 = new T.Mesh(new T.TorusGeometry(0.085, 0.009, 8, 32), new T.MeshBasicMaterial({ color: 0xff3300, blending: T.AdditiveBlending }));
  const r2 = new T.Mesh(new T.TorusGeometry(0.12, 0.006, 8, 32), new T.MeshBasicMaterial({ color: 0x990000, blending: T.AdditiveBlending }));
  const r3 = new T.Mesh(new T.TorusGeometry(0.16, 0.003, 8, 64), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, blending: T.AdditiveBlending }));
  coreGroup.add(r1, r2, r3);

  // Eye glow halo
  const eyeGlowGeo = new T.SphereGeometry(0.18, 24, 24);
  const eyeGlowMat = new T.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.08, blending: T.AdditiveBlending, side: T.BackSide });
  coreGroup.add(new T.Mesh(eyeGlowGeo, eyeGlowMat));

  gateGroup.add(coreGroup);
  group.add(gateGroup);

  // ─── 4. DARK AURA SPHERE ─────────────────────────────────────────────
  const auraSphere = new T.Mesh(
    new T.SphereGeometry(1.8, 32, 32),
    new T.MeshBasicMaterial({ color: 0x0d0000, transparent: true, opacity: 0, blending: T.AdditiveBlending, side: T.BackSide })
  );
  group.add(auraSphere);

  // Outer dark halo ring (cinematic)
  const haloRingGeo = new T.TorusGeometry(0.9, 0.018, 8, 128);
  const haloRingMat = new T.MeshBasicMaterial({ color: 0xff1100, transparent: true, opacity: 0, blending: T.AdditiveBlending });
  const haloRing = new T.Mesh(haloRingGeo, haloRingMat);
  haloRing.rotation.x = Math.PI / 2;
  group.add(haloRing);

  const haloRing2 = new T.Mesh(
    new T.TorusGeometry(0.72, 0.009, 8, 128),
    new T.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0, blending: T.AdditiveBlending })
  );
  haloRing2.rotation.x = Math.PI / 2;
  group.add(haloRing2);

  // ─── 5. BLOOD SEA BASE ───────────────────────────────────────────────
  const baseGeo = new T.PlaneGeometry(8.0, 8.0, 48, 48);
  const posBase = baseGeo.attributes.position;
  const originalZ = new Float32Array(posBase.count);
  for (let i = 0; i < posBase.count; i++) originalZ[i] = posBase.getZ(i);
  const bloodBase = new T.Mesh(baseGeo, darkMat);
  bloodBase.rotation.x = -Math.PI / 2;
  group.add(bloodBase);

  // Expanding shockwave rings
  const shockwaves = [];
  for (let i = 0; i < 6; i++) {
    const waveMat = new T.MeshBasicMaterial({
      color: 0xff1100, side: T.DoubleSide, transparent: true, opacity: 0, blending: T.AdditiveBlending
    });
    const wave = new T.Mesh(new T.RingGeometry(0.06, 0.18, 64), waveMat);
    wave.rotation.x = -Math.PI / 2;
    wave.position.y = 0.015 + i * 0.004;
    wave.userData = { phase: i * 0.16 };
    group.add(wave);
    shockwaves.push(wave);
  }

  // ─── 6. CURSE ENERGY EMBER TORNADO ───────────────────────────────────
  const emberCount = 2800;
  const emberGeo = new T.BufferGeometry();
  const emberPos = new Float32Array(emberCount * 3);
  const emberSpeeds = new Float32Array(emberCount);
  const emberRadii = new Float32Array(emberCount);
  const emberAngles = new Float32Array(emberCount);

  for (let i = 0; i < emberCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 0.15 + Math.random() * 1.4;
    emberAngles[i] = angle;
    emberRadii[i] = r;
    emberSpeeds[i] = 0.02 + Math.random() * 0.05;
    emberPos[i * 3] = Math.cos(angle) * r;
    emberPos[i * 3 + 1] = Math.random() * 2.2;
    emberPos[i * 3 + 2] = Math.sin(angle) * r;
  }
  emberGeo.setAttribute('position', new T.BufferAttribute(emberPos, 3));
  const emberMat = new T.PointsMaterial({
    color: 0xff3300, size: 0.018, transparent: true, opacity: 0.9, blending: T.AdditiveBlending, sizeAttenuation: true
  });
  const embers = new T.Points(emberGeo, emberMat);
  group.add(embers);

  // Fine ash particles (small white-gold)
  const ashCount = 1200;
  const ashGeo = new T.BufferGeometry();
  const ashPos = new Float32Array(ashCount * 3);
  const ashAngles = new Float32Array(ashCount);
  const ashRadii = new Float32Array(ashCount);
  const ashSpeeds = new Float32Array(ashCount);
  for (let i = 0; i < ashCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 1.0;
    ashAngles[i] = angle;
    ashRadii[i] = r;
    ashSpeeds[i] = 0.008 + Math.random() * 0.02;
    ashPos[i * 3] = Math.cos(angle) * r;
    ashPos[i * 3 + 1] = Math.random() * 2.2;
    ashPos[i * 3 + 2] = Math.sin(angle) * r;
  }
  ashGeo.setAttribute('position', new T.BufferAttribute(ashPos, 3));
  const ashMat = new T.PointsMaterial({
    color: 0xffcc88, size: 0.007, transparent: true, opacity: 0.6, blending: T.AdditiveBlending, sizeAttenuation: true
  });
  const ash = new T.Points(ashGeo, ashMat);
  group.add(ash);

  // ─── 7. CLEAVE / DISMANTLE SLASHES ───────────────────────────────────
  const slashCount = 40;
  const slashes = [];
  const slashGroup = new T.Group();
  for (let i = 0; i < slashCount; i++) {
    const slashGeo = new T.PlaneGeometry(1.2, 0.012);
    slashGeo.translate(0.6, 0, 0);
    const slashMat = new T.MeshBasicMaterial({
      color: Math.random() > 0.2 ? 0xff0a0a : 0xffffff,
      transparent: true, opacity: 0, blending: T.AdditiveBlending, side: T.DoubleSide
    });
    const slashMesh = new T.Mesh(slashGeo, slashMat);
    slashGroup.add(slashMesh);
    slashes.push({ mesh: slashMesh, lifetime: Math.random() * 100, speed: 2.5 + Math.random() * 4.0, baseScale: 1.0 + Math.random() * 3.0 });
  }
  group.add(slashGroup);

  // ─── 8. LIGHTING ──────────────────────────────────────────────────────
  const ambientLight = new T.AmbientLight(0x3a0000, 1.5);
  group.add(ambientLight);
  const pointLight = new T.PointLight(0xff0000, 6, 3.5);
  pointLight.position.set(0, 0.3, 0.4);
  group.add(pointLight);
  const flashLight = new T.PointLight(0xffffff, 0, 8.0);
  flashLight.position.set(0, 1.0, 1.0);
  group.add(flashLight);
  const backLight = new T.PointLight(0x880000, 3, 2.5);
  backLight.position.set(0, 0.5, -0.8);
  group.add(backLight);

  let pulseTime = 0;
  let eyeTarget = { x: 0, y: 0 };

  return {
    group,
    update: (time, charge) => {
      const t = time * 0.001;
      const power = 1.0 + Math.pow(charge, 4) * 8.0;
      pulseTime += 0.016 * (1 + charge * 3);

      // ── SCALE: keeps gate INSIDE frustum ────────────────────────────
      // At charge=0: scale=0.28 (small, hand-sized)
      // At charge=1: scale=0.72 (fills ~90% of screen height)
      const scale = 0.28 + charge * 0.44;
      group.scale.set(scale, scale, scale);

      // Move group down slightly so temple base is at screen bottom
      group.position.y = -0.28 * scale;

      // Gentle breathe / shake
      if (charge > 0.55) {
        const shake = Math.pow(charge - 0.55, 2) * 0.18;
        gateGroup.position.x = (Math.random() - 0.5) * shake;
        gateGroup.position.y = (Math.random() - 0.5) * shake;
      } else {
        gateGroup.position.x = 0;
        gateGroup.position.y = Math.sin(t * 1.5) * 0.015 * (1 - charge);
      }

      // Eye tracking
      if (Math.random() > 0.88 - charge * 0.18) {
        eyeTarget.x = (Math.random() - 0.5) * 0.12 * charge;
        eyeTarget.y = (Math.random() - 0.5) * 0.12 * charge;
      }
      mainEye.position.x += (eyeTarget.x - mainEye.position.x) * 0.3;
      mainEye.position.y += (eyeTarget.y - mainEye.position.y) * 0.3;

      // Iris rings
      r1.rotation.y += 0.045 * power;
      r1.rotation.x += 0.022 * power;
      r2.rotation.z -= 0.035 * power;
      r2.rotation.y -= 0.045 * power;
      r3.rotation.z += 0.08 * power;

      // Eye glow pulse
      const eyePulse = 1 + Math.sin(pulseTime * 10) * 0.18;
      mainEye.scale.set(eyePulse, eyePulse, eyePulse);
      eyeGlowMat.opacity = 0.04 + charge * 0.22;

      // Aura sphere
      auraSphere.material.opacity = Math.pow(charge, 2) * 0.55;

      // ── Cinematic halo rings ─────────────────────────────────────────
      haloRingMat.opacity = charge * 0.65 * (0.7 + Math.sin(t * 3) * 0.3);
      haloRing.rotation.z += 0.008 * power;
      haloRing2.material.opacity = charge * 0.45 * (0.6 + Math.sin(t * 5 + 1) * 0.4);
      haloRing2.rotation.z -= 0.013 * power;

      // ── Blood sea ───────────────────────────────────────────────────
      const pBase = baseGeo.attributes.position;
      for (let i = 0; i < pBase.count; i++) {
        const x = pBase.getX(i), y = pBase.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        const wh = 0.008 + Math.pow(charge, 2) * 0.035;
        pBase.setZ(i, originalZ[i]
          + Math.sin(dist * 9 - t * 3 * power) * wh
          + Math.cos(x * 5 + t * 2) * (wh * 0.4));
      }
      baseGeo.computeVertexNormals();
      pBase.needsUpdate = true;

      shockwaves.forEach(wave => {
        wave.userData.phase += 0.022 * power;
        if (wave.userData.phase > 1.0) wave.userData.phase = 0;
        const ws = 1.0 + Math.pow(wave.userData.phase, 1.2) * 16.0;
        wave.scale.set(ws, ws, 1);
        wave.material.opacity = wave.userData.phase < 0.1
          ? (wave.userData.phase / 0.1) * charge
          : Math.max(0, 1.0 - wave.userData.phase) * charge;
      });

      // ── Ember tornado ───────────────────────────────────────────────
      const ep = embers.geometry.attributes.position.array;
      for (let i = 0; i < emberCount; i++) {
        emberAngles[i] += emberSpeeds[i] * power;
        ep[i * 3 + 1] += 0.005 * power;
        const hr = Math.max(0, ep[i * 3 + 1] / 2.2);
        const cr = emberRadii[i] * (1.0 - hr * 0.55 * charge);
        ep[i * 3] = Math.cos(emberAngles[i]) * cr;
        ep[i * 3 + 2] = Math.sin(emberAngles[i]) * cr;
        if (ep[i * 3 + 1] > 2.2) {
          ep[i * 3 + 1] = -0.1;
          emberRadii[i] = 0.15 + Math.random() * 1.4;
        }
      }
      embers.geometry.attributes.position.needsUpdate = true;
      emberMat.opacity = 0.25 + charge * 0.75;

      // Ash
      const ap = ash.geometry.attributes.position.array;
      for (let i = 0; i < ashCount; i++) {
        ashAngles[i] += ashSpeeds[i] * power * 0.6;
        ap[i * 3 + 1] += 0.003 * power;
        const ar = ashRadii[i] * (1 - (ap[i * 3 + 1] / 2.2) * 0.4 * charge);
        ap[i * 3] = Math.cos(ashAngles[i]) * ar;
        ap[i * 3 + 2] = Math.sin(ashAngles[i]) * ar;
        if (ap[i * 3 + 1] > 2.2) {
          ap[i * 3 + 1] = -0.1;
          ashRadii[i] = Math.random() * 1.0;
        }
      }
      ash.geometry.attributes.position.needsUpdate = true;
      ashMat.opacity = 0.2 + charge * 0.55;

      // ── Slashes ─────────────────────────────────────────────────────
      let slashVis = 1.0;
      if (charge > 0.85) slashVis = Math.max(0, 1.0 - (charge - 0.85) * 6.66);

      slashes.forEach(s => {
        if (slashVis > 0.01) {
          s.lifetime += s.speed * power;
          if (s.lifetime > 100) {
            s.lifetime = 0;
            s.mesh.position.set(
              (Math.random() - 0.5) * 3.2,
              Math.random() * 2.2,
              (Math.random() - 0.5) * 2.5
            );
            s.mesh.rotation.set(
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2
            );
            const sl = s.baseScale * (1.0 + Math.random() * 2.0) * (1 + charge * 2.0);
            s.mesh.scale.set(sl, 1 + Math.pow(charge, 3) * 4.0, 1);
            s.mesh.material.color.setHex(Math.random() > 0.85 - charge * 0.35 ? 0xffffff : 0xff0000);
          }
          s.mesh.translateX(0.09 * power * charge);
        }
        const alphaBase = s.lifetime < 10
          ? (s.lifetime / 10)
          : Math.max(0, 1 - (s.lifetime - 10) / 28);
        s.mesh.material.opacity = alphaBase * charge * 1.6 * slashVis;
      });

      // ── Lighting ────────────────────────────────────────────────────
      pointLight.intensity = (4.0 + Math.sin(pulseTime * 20) * 4.5) * charge;
      backLight.intensity = (2.0 + Math.sin(pulseTime * 14) * 2.0) * charge;
      if (charge > 0.8 && Math.random() > 0.78 && slashVis > 0) {
        flashLight.intensity = Math.random() * 22.0 * charge;
      } else {
        flashLight.intensity = Math.max(0, flashLight.intensity - 1.2);
      }
    },
    setColor: (_hex) => { /* stays blood crimson */ },
    getParticleCount: () => emberCount + ashCount + slashCount
  };
}
