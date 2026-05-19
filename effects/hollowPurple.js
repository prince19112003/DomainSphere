/**
 * effects/hollowPurple.js — Cinematic Hollow Purple Singularity (Kyōkushin: Murasaki)
 * JJK · Gojo Satoru
 * Ultra God Level: Aka (Red) and Ao (Blue) convergence, space distortion,
 * gravitational lensing rings, and unstable purple lightning cage.
 */
export function createHollowPurple(T) {
  const group = new T.Group();

  // --- Real-time Color Override Trackers ---
  let customColor = new T.Color(0x8a2be2);

  // ─── 1. CORE NESTED SINGULARITY (Murasaki Central Core) ────────────────────────────
  const coreGroup = new T.Group();
  group.add(coreGroup);

  // Inner White-Hot core (Sabse bright center point)
  const whiteCoreGeo = new T.SphereGeometry(0.045, 32, 32);
  const whiteCoreMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
  const whiteCore = new T.Mesh(whiteCoreGeo, whiteCoreMat);
  coreGroup.add(whiteCore);

  // Violet Energy Plasma Core
  const purpleCoreGeo = new T.SphereGeometry(0.08, 32, 32);
  const purpleCoreMat = new T.MeshBasicMaterial({ color: 0x8a2be2, transparent: true, opacity: 0.85 });
  const purpleCore = new T.Mesh(purpleCoreGeo, purpleCoreMat);
  coreGroup.add(purpleCore);

  // Dark Gravity Shadow (Space distortion black-hole feel ke liye)
  const darkCoreGeo = new T.SphereGeometry(0.1, 24, 24);
  const darkCoreMat = new T.MeshBasicMaterial({ color: 0x050010, transparent: true, opacity: 0.8, side: T.BackSide });
  const darkCore = new T.Mesh(darkCoreGeo, darkCoreMat);
  coreGroup.add(darkCore);

  // Outer Gaseous Aura
  const auraCoreGeo = new T.SphereGeometry(0.16, 24, 24);
  const auraCoreMat = new T.MeshBasicMaterial({ 
    color: 0xba55d3, 
    transparent: true, 
    opacity: 0.35, 
    side: T.DoubleSide,
    blending: T.AdditiveBlending 
  });
  const auraCoreMesh = new T.Mesh(auraCoreGeo, auraCoreMat);
  coreGroup.add(auraCoreMesh);

  // ─── 2. GRAVITATIONAL LENSING RINGS (Swirling space warp) ──────────────────────────
  const rings = [];
  const ringAngles = [
    { x: Math.PI / 4, y: 0.2, z: 0.1 },
    { x: -Math.PI / 3, y: -0.4, z: 0.3 },
    { x: 0.1, y: Math.PI / 2, z: -0.2 }
  ];
  ringAngles.forEach((rot, i) => {
    const geo = new T.TorusGeometry(0.18 + i * 0.04, 0.005, 8, 64);
    const mat = new T.MeshBasicMaterial({
      color: i === 0 ? 0xff00ff : (i === 1 ? 0xda70d6 : 0x4b0082),
      transparent: true,
      opacity: 0.8 - i * 0.2,
      blending: T.AdditiveBlending
    });
    const ring = new T.Mesh(geo, mat);
    ring.rotation.set(rot.x, rot.y, rot.z);
    ring.userData.speed = (i % 2 === 0 ? 1 : -1) * (2.0 + i * 1.2);
    coreGroup.add(ring);
    rings.push(ring);
  });

  // ─── 3. COLLAPSING AKA & AO ELECTRICS (Red and Blue independent cores) ──────────────
  const akaGroup = new T.Group(); // Red (Right)
  const aoGroup = new T.Group();  // Blue (Left)
  group.add(akaGroup, aoGroup);

  // Blue Core (Ao)
  const aoMesh = new T.Mesh(
    new T.SphereGeometry(0.05, 16, 16),
    new T.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.9, blending: T.AdditiveBlending })
  );
  aoGroup.add(aoMesh);

  // Red Core (Aka)
  const akaMesh = new T.Mesh(
    new T.SphereGeometry(0.05, 16, 16),
    new T.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.9, blending: T.AdditiveBlending })
  );
  akaGroup.add(akaMesh);

  // ─── 4. SWIRLING DOUBLE-HELIX ENERGY INFLOWS ───────────────────────────────────────
  // Blue energy points (Ao)
  const BLUE_COUNT = 250;
  const blueGeo = new T.BufferGeometry();
  const bluePos = new Float32Array(BLUE_COUNT * 3);
  const bluePhases = new Float32Array(BLUE_COUNT);
  const blueSpeeds = new Float32Array(BLUE_COUNT);
  const blueRadii = new Float32Array(BLUE_COUNT);
  for (let i = 0; i < BLUE_COUNT; i++) {
    bluePhases[i] = (i / BLUE_COUNT) * Math.PI * 8; 
    blueSpeeds[i] = 0.6 + Math.random() * 0.6;
    blueRadii[i] = 0.08 + Math.random() * 0.12;
    bluePos[i * 3] = -1.0 * (i / BLUE_COUNT); 
    bluePos[i * 3 + 1] = 0;
    bluePos[i * 3 + 2] = 0;
  }
  blueGeo.setAttribute('position', new T.BufferAttribute(bluePos, 3));
  const blueMat = new T.PointsMaterial({ color: 0x00d2ff, size: 0.015, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false });
  const blueStream = new T.Points(blueGeo, blueMat);
  group.add(blueStream);

  // Red energy points (Aka)
  const RED_COUNT = 250;
  const redGeo = new T.BufferGeometry();
  const redPos = new Float32Array(RED_COUNT * 3);
  const redPhases = new Float32Array(RED_COUNT);
  const redSpeeds = new Float32Array(RED_COUNT);
  const redRadii = new Float32Array(RED_COUNT);
  for (let i = 0; i < RED_COUNT; i++) {
    redPhases[i] = (i / RED_COUNT) * Math.PI * 8 + Math.PI; 
    redSpeeds[i] = 0.6 + Math.random() * 0.6;
    redRadii[i] = 0.08 + Math.random() * 0.12;
    redPos[i * 3] = 1.0 * (i / RED_COUNT); 
    redPos[i * 3 + 1] = 0;
    redPos[i * 3 + 2] = 0;
  }
  redGeo.setAttribute('position', new T.BufferAttribute(redPos, 3));
  const redMat = new T.PointsMaterial({ color: 0xff3300, size: 0.015, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false });
  const redStream = new T.Points(redGeo, redMat);
  group.add(redStream);

  // ─── 5. HIGH-FREQUENCY UNSTABLE LIGHTNING CAGE ─────────────────────────────────────
  const ARC_COUNT = 10;
  const lightningLines = [];
  for (let i = 0; i < ARC_COUNT; i++) {
    const geo = new T.BufferGeometry();
    const pts = new Float32Array(10 * 3); 
    geo.setAttribute('position', new T.BufferAttribute(pts, 3));
    const mat = new T.LineBasicMaterial({
      color: i % 2 === 0 ? 0xff00ff : 0xda70d6,
      transparent: true,
      opacity: 0,
      blending: T.AdditiveBlending,
      linewidth: 1.5
    });
    const line = new T.Line(geo, mat);
    lightningLines.push({ line, geo, mat });
    coreGroup.add(line);
  }

  // ─── 6. GRAVITATIONAL ACCRETION DUST DISK ──────────────────────────────────────────
  const DUST_COUNT = 300;
  const dustGeo = new T.BufferGeometry();
  const dustPos = new Float32Array(DUST_COUNT * 3);
  const dustOrbits = [];
  for (let i = 0; i < DUST_COUNT; i++) {
    const radius = 0.1 + Math.random() * 0.35;
    const speed = 2.5 + Math.random() * 4.5;
    const incline = (Math.random() - 0.5) * 0.4;
    dustOrbits.push({ radius, speed, phase: Math.random() * Math.PI * 2, incline });
    dustPos[i * 3] = 0;
    dustPos[i * 3 + 1] = 0;
    dustPos[i * 3 + 2] = 0;
  }
  dustGeo.setAttribute('position', new T.BufferAttribute(dustPos, 3));
  const dustMat = new T.PointsMaterial({ color: 0x9370db, size: 0.01, transparent: true, opacity: 0.8, blending: T.AdditiveBlending });
  const dustCloud = new T.Points(dustGeo, dustMat);
  coreGroup.add(dustCloud);

  // ─── 7. WORLD ENERGY GATHERING (Wavy Flow from Environment) ────────────────────────
  const ENV_COUNT = 1200;
  const envGeo = new T.BufferGeometry();
  const envPos = new Float32Array(ENV_COUNT * 3);
  const envData = []; 
  for (let i = 0; i < ENV_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const dist = 1.5 + Math.random() * 5.0; 
    envData.push({
      angle, phi, dist,
      speed: 1.0 + Math.random() * 4.0,
      waveFreq: 2.0 + Math.random() * 6.0,
      waveAmp: 0.1 + Math.random() * 0.4,
      colorType: Math.random() 
    });
    envPos[i * 3] = 0; envPos[i * 3 + 1] = 0; envPos[i * 3 + 2] = 0;
  }
  envGeo.setAttribute('position', new T.BufferAttribute(envPos, 3));
  
  const envColors = new Float32Array(ENV_COUNT * 3);
  for(let i=0; i<ENV_COUNT; i++) {
     let c = new T.Color();
     if(envData[i].colorType < 0.33) c.setHex(0xff2200); 
     else if(envData[i].colorType < 0.66) c.setHex(0x00d2ff); 
     else c.setHex(0xaa00ff); 
     envColors[i * 3] = c.r; envColors[i * 3 + 1] = c.g; envColors[i * 3 + 2] = c.b;
  }
  envGeo.setAttribute('color', new T.BufferAttribute(envColors, 3));
  
  const envMat = new T.PointsMaterial({ size: 0.012, vertexColors: true, transparent: true, opacity: 0.8, blending: T.AdditiveBlending });
  const envCloud = new T.Points(envGeo, envMat);
  group.add(envCloud);

  // ─── Helper: Spontaneous Lightning Arc Generator ──────────────────────────────────
  function updateLightningArc(pts, radius, charge) {
    const segs = 9;
    const startTheta = Math.random() * Math.PI * 2;
    const startPhi = Math.random() * Math.PI;
    const endTheta = startTheta + (Math.random() - 0.5) * Math.PI;
    const endPhi = startPhi + (Math.random() - 0.5) * Math.PI;

    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const theta = startTheta + (endTheta - startTheta) * t;
      const phi = startPhi + (endPhi - startPhi) * t;
      const jitter = s === 0 || s === segs ? 0 : (Math.random() - 0.5) * (0.04 + charge * 0.04);
      const r = radius + jitter;

      pts[s * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pts[s * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pts[s * 3 + 2] = Math.cos(phi) * r;
    }
  }

  return {
    group,
    update: (time, charge) => {
      const t = time * 0.001;
      
      let superScale = 0.5 + charge * 0.8;
      if (charge > 0.85) {
        superScale += Math.pow((charge - 0.85) * 6.66, 3) * 2.5;
      }
      group.scale.setScalar(superScale);

      const separation = Math.max(0, 0.55 * (1.0 - (charge * 1.15))); 
      aoGroup.position.x = -separation;
      akaGroup.position.x = separation;

      const aoPulse = 0.5 + Math.sin(t * 12) * 0.08;
      const akaPulse = 0.5 + Math.sin(t * 12 + Math.PI) * 0.08;
      aoMesh.scale.setScalar(aoPulse * (0.3 + charge * 0.7));
      akaMesh.scale.setScalar(akaPulse * (0.3 + charge * 0.7));

      let elementalVisibility = 1.0;
      let coreVisibility = 0.0;
      
      if (charge > 0.8) {
        elementalVisibility = Math.max(0, 1.0 - (charge - 0.8) * 6.66);
        coreVisibility = Math.min(1.0, (charge - 0.8) * 6.66);
      } else {
        coreVisibility = charge * 0.25; 
        elementalVisibility = 1.0;
      }

      aoMesh.material.opacity = elementalVisibility;
      akaMesh.material.opacity = elementalVisibility;

      const corePulse = 0.95 + Math.sin(t * 18) * 0.05;
      whiteCore.scale.setScalar(corePulse * coreVisibility);
      purpleCore.scale.setScalar(corePulse * (0.5 + coreVisibility * 0.7));
      darkCore.scale.setScalar(corePulse * (0.5 + coreVisibility * 0.6));
      auraCoreMesh.scale.setScalar(corePulse * (0.6 + coreVisibility * 1.0));

      purpleCoreMat.opacity = coreVisibility * 0.9;
      darkCoreMat.opacity = coreVisibility * 0.85;
      auraCoreMat.opacity = coreVisibility * 0.45;

      rings.forEach(ring => {
        ring.rotation.z += 0.005 * ring.userData.speed * (0.5 + charge * 1.5);
        ring.rotation.y += 0.002 * ring.userData.speed;
        const scalePulse = 0.95 + Math.sin(t * 6 + ring.userData.speed) * 0.05;
        ring.scale.setScalar(scalePulse * (0.6 + coreVisibility * 0.8));
        ring.material.opacity = coreVisibility * 0.8;
      });

      const bPos = blueGeo.attributes.position.array;
      for (let i = 0; i < BLUE_COUNT; i++) {
        const speedFactor = blueSpeeds[i] * (0.8 + charge * 1.4);
        const currentPhase = bluePhases[i] + t * 8.0 * speedFactor;
        const tPos = (i / BLUE_COUNT); 
        
        const startX = -1.5 * (1.0 - (tPos + t * 0.5) % 1.0); 
        const xCoord = startX + (1.0 - Math.abs(startX/1.5)) * -separation;
        
        const wave = Math.sin(t * 4 + tPos * 12) * 0.15 * charge;
        const rad = blueRadii[i] * Math.sin(tPos * Math.PI) * (1.0 - Math.abs(startX/1.5)) + wave;

        bPos[i * 3] = xCoord;
        bPos[i * 3 + 1] = Math.sin(currentPhase) * rad;
        bPos[i * 3 + 2] = Math.cos(currentPhase) * rad;
      }
      blueGeo.attributes.position.needsUpdate = true;
      blueMat.opacity = elementalVisibility * (0.3 + charge * 0.6);

      const rPos = redGeo.attributes.position.array;
      for (let i = 0; i < RED_COUNT; i++) {
        const speedFactor = redSpeeds[i] * (0.8 + charge * 1.4);
        const currentPhase = redPhases[i] + t * 8.0 * speedFactor;
        const tPos = (i / RED_COUNT);
        
        const startX = 1.5 * (1.0 - (tPos + t * 0.5) % 1.0); 
        const xCoord = startX + (1.0 - Math.abs(startX/1.5)) * separation;
        
        const wave = Math.sin(t * 4 + tPos * 12) * 0.15 * charge;
        const rad = redRadii[i] * Math.sin(tPos * Math.PI) * (1.0 - Math.abs(startX/1.5)) + wave;

        rPos[i * 3] = xCoord;
        rPos[i * 3 + 1] = Math.sin(currentPhase) * rad;
        rPos[i * 3 + 2] = Math.cos(currentPhase) * rad;
      }
      redGeo.attributes.position.needsUpdate = true;
      redMat.opacity = elementalVisibility * (0.3 + charge * 0.6);

      lightningLines.forEach(({ geo, mat }) => {
        const pts = geo.attributes.position.array;
        const radius = 0.08 + coreVisibility * 0.08;
        
        updateLightningArc(pts, radius, charge);
        geo.attributes.position.needsUpdate = true;
        
        mat.opacity = coreVisibility * (0.4 + Math.random() * 0.6);
      });

      const dPos = dustGeo.attributes.position.array;
      for (let i = 0; i < DUST_COUNT; i++) {
        const orb = dustOrbits[i];
        orb.phase += 0.015 * orb.speed * (0.5 + charge * 2.0);
        
        const pullFactor = 1.0 - (coreVisibility * 0.4);
        const r = orb.radius * pullFactor;

        dPos[i * 3] = Math.cos(orb.phase) * r;
        dPos[i * 3 + 1] = Math.sin(orb.phase) * r * orb.incline;
        dPos[i * 3 + 2] = Math.sin(orb.phase) * r;
      }
      dustGeo.attributes.position.needsUpdate = true;
      dustMat.opacity = coreVisibility * 0.85;
      dustMat.size = 0.007 + coreVisibility * 0.006;

      const ePos = envGeo.attributes.position.array;
      for (let i = 0; i < ENV_COUNT; i++) {
        const data = envData[i];
        
        data.dist -= 0.01 * data.speed * (0.5 + charge * 4.0);
        
        if (data.dist < 0.1) {
          data.dist = 2.0 + Math.random() * 4.0;
        }

        const waveOffset = Math.sin(t * data.waveFreq + data.dist) * data.waveAmp * charge;
        
        const r = data.dist;
        const x = r * Math.sin(data.phi) * Math.cos(data.angle + waveOffset);
        const y = r * Math.sin(data.phi + waveOffset * 0.5) * Math.sin(data.angle);
        const z = r * Math.cos(data.phi) + waveOffset;

        ePos[i * 3] = x;
        ePos[i * 3 + 1] = y;
        ePos[i * 3 + 2] = z;
      }
      envGeo.attributes.position.needsUpdate = true;
      envMat.opacity = elementalVisibility * (0.3 + charge * 0.7);

    },
    setColor: (hex) => {
      customColor.set(hex);
      purpleCoreMat.color.set(hex);
      auraCoreMat.color.set(hex);
      dustMat.color.set(hex);
      rings[0].material.color.set(hex);
      lightningLines.forEach(l => l.mat.color.set(hex));
    },
    getParticleCount: () => BLUE_COUNT + RED_COUNT + DUST_COUNT + ENV_COUNT + ARC_COUNT * 10
  };
}
