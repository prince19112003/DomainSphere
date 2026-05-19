/**
 * effects/heartDomain.js — Heart Sanctuary / Lover's Domain Effect
 * Beautiful pulsing 3D particle heart with swirling pink/rose auric rings
 */
export function createHeartDomain(T) {
  const group = new T.Group();

  // 1. Central Heart Structure made of glowing particles
  const heartParticleCount = 450;
  const heartGeo = new T.BufferGeometry();
  const heartPos = new Float32Array(heartParticleCount * 3);
  const heartScales = new Float32Array(heartParticleCount);

  for (let i = 0; i < heartParticleCount; i++) {
    // Generate parametric heart coordinates
    const t = (i / heartParticleCount) * Math.PI * 2;
    
    // Parametric heart formula
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    // Add 3D depth to the heart
    const z = (Math.random() - 0.5) * 6;

    // Scale down to THREE coordinates
    const scale = 0.018;
    heartPos[i * 3] = x * scale;
    heartPos[i * 3 + 1] = y * scale + 0.1; // Offset upward slightly
    heartPos[i * 3 + 2] = z * scale;
    
    heartScales[i] = 0.5 + Math.random() * 1.5;
  }

  heartGeo.setAttribute('position', new T.BufferAttribute(heartPos, 3));
  
  // Custom glowing points material for the heart outline
  const heartMat = new T.PointsMaterial({
    color: 0xff2c7d, // Intense premium hot pink
    size: 0.018,
    transparent: true,
    opacity: 0.95,
    blending: T.AdditiveBlending,
    depthWrite: false
  });
  
  const heartPoints = new T.Points(heartGeo, heartMat);
  group.add(heartPoints);

  // 2. Swirling Rose Auric Rings (Inclined pink orbital rings)
  const ringCount = 2;
  const rings = [];
  
  for (let r = 0; r < ringCount; r++) {
    const ringGeo = new T.TorusGeometry(0.35 + r * 0.08, 0.006, 8, 48);
    const ringMat = new T.MeshBasicMaterial({
      color: r === 0 ? 0xff5e97 : 0xff0055,
      transparent: true,
      opacity: 0.6 - r * 0.25,
      blending: T.AdditiveBlending
    });
    const ringMesh = new T.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3 + (r * 0.2);
    ringMesh.rotation.y = (r * 0.4);
    group.add(ringMesh);
    rings.push(ringMesh);
  }

  // 3. Floating sparkling heart embers drifting upward
  const sparkleCount = 150;
  const sparkleGeo = new T.BufferGeometry();
  const sparklePos = new Float32Array(sparkleCount * 3);
  const sparkleVel = [];

  for (let i = 0; i < sparkleCount; i++) {
    sparklePos[i * 3] = (Math.random() - 0.5) * 0.8;
    sparklePos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
    sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;

    sparkleVel.push({
      vx: (Math.random() - 0.5) * 0.003,
      vy: 0.002 + Math.random() * 0.004, // Float upward
      vz: (Math.random() - 0.5) * 0.003,
      speed: 0.4 + Math.random() * 0.6
    });
  }

  sparkleGeo.setAttribute('position', new T.BufferAttribute(sparklePos, 3));
  const sparkleMat = new T.PointsMaterial({
    color: 0xffb3d1, // Soft rose white
    size: 0.01,
    transparent: true,
    opacity: 0.7,
    blending: T.AdditiveBlending,
    depthWrite: false
  });
  const sparkles = new T.Points(sparkleGeo, sparkleMat);
  group.add(sparkles);

  // 4. Subtle ambient rose glow light
  const heartLight = new T.PointLight(0xff2c7d, 2.5, 1.8);
  heartLight.position.set(0, 0.1, 0.2);
  group.add(heartLight);

  return {
    group,
    update: (time, charge) => {
      // Dynamic scaling: Pulsing heartbeat rhythm
      const pulseRate = 0.006 + charge * 0.004;
      const pulse = 1.0 + Math.sin(time * pulseRate) * (0.08 + charge * 0.06);
      
      const targetScale = (0.3 + charge * 1.8) * pulse;
      group.scale.set(targetScale, targetScale, targetScale);

      // Rotate orbital rings
      rings.forEach((ring, idx) => {
        ring.rotation.z = time * 0.0006 * (idx === 0 ? 1 : -0.7);
      });

      // Animate floating sparkles
      const pos = sparkles.geometry.attributes.position.array;
      for (let i = 0; i < sparkleCount; i++) {
        pos[i * 3] += sparkleVel[i].vx * charge;
        pos[i * 3 + 1] += sparkleVel[i].vy * charge * sparkleVel[i].speed;
        pos[i * 3 + 2] += sparkleVel[i].vz * charge;

        // Reset if drifted too high or far
        if (pos[i * 3 + 1] > 0.8 || Math.abs(pos[i * 3]) > 0.8) {
          pos[i * 3] = (Math.random() - 0.5) * 0.3;
          pos[i * 3 + 1] = -0.1 + (Math.random() - 0.5) * 0.1;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
        }
      }
      sparkles.geometry.attributes.position.needsUpdate = true;
      
      // Heart color shifting based on time
      heartMat.color.setHSL(0.93 + Math.sin(time * 0.0002) * 0.04, 1.0, 0.58);
    },
    setColor: (hex) => {
      heartMat.color.set(hex);
      rings[0].material.color.set(hex);
    },
    getParticleCount: () => heartParticleCount + sparkleCount
  };
}
