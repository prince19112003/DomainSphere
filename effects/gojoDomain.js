export function createGojoDomain(T) {
  const group = new T.Group();
  
  // 1. Celestial Halo/Ring (Deep Space White/Blue)
  const ringGeo = new T.TorusGeometry(0.5, 0.015, 16, 64);
  const ringMat = new T.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    blending: T.AdditiveBlending
  });
  const halo = new T.Mesh(ringGeo, ringMat);
  halo.rotation.x = Math.PI / 4;
  group.add(halo);

  // Outer glowing aura for the ring
  const auraGeo = new T.TorusGeometry(0.5, 0.05, 16, 64);
  const auraMat = new T.MeshBasicMaterial({
    color: 0x44aaff,
    transparent: true,
    opacity: 0.3,
    blending: T.AdditiveBlending
  });
  const aura = new T.Mesh(auraGeo, auraMat);
  aura.rotation.x = Math.PI / 4;
  group.add(aura);

  // 2. Singularity Core (White Hot Center)
  const coreGeo = new T.SphereGeometry(0.1, 32, 32);
  const coreMat = new T.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1,
    blending: T.AdditiveBlending
  });
  const core = new T.Mesh(coreGeo, coreMat);
  group.add(core);

  // Purple/Blue Glow around the core
  const coreGlowGeo = new T.SphereGeometry(0.2, 32, 32);
  const coreGlowMat = new T.MeshBasicMaterial({
    color: 0x7700ff,
    transparent: true,
    opacity: 0.6,
    blending: T.AdditiveBlending
  });
  const coreGlow = new T.Mesh(coreGlowGeo, coreGlowMat);
  group.add(coreGlow);

  // 3. Starfield Background (Tiny stars pushing outward)
  const starCount = 800;
  const starGeo = new T.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starVel = [];

  for (let i = 0; i < starCount; i++) {
    // Distribute randomly in a sphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const r = 0.2 + Math.random() * 2;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    starPos[i*3] = x;
    starPos[i*3+1] = y;
    starPos[i*3+2] = z;

    // Slower velocity moving outward
    starVel.push({
      vx: (x / r) * 0.001 * (0.5 + Math.random()),
      vy: (y / r) * 0.001 * (0.5 + Math.random()),
      vz: (z / r) * 0.001 * (0.5 + Math.random())
    });
  }

  starGeo.setAttribute('position', new T.BufferAttribute(starPos, 3));
  const starMat = new T.PointsMaterial({
    color: 0xffffff,
    size: 0.008,
    transparent: true,
    opacity: 0.8,
    blending: T.AdditiveBlending
  });
  const stars = new T.Points(starGeo, starMat);
  group.add(stars);

  return {
    group,
    update: (time, charge) => {
      const scale = 0.5 + charge * 2.5; // Expands as it charges
      group.scale.set(scale, scale, scale);

      // Rotate halo slowly
      halo.rotation.z = time * 0.0005;
      aura.rotation.z = time * 0.0005;

      // Pulse core slightly
      const pulse = 1 + Math.sin(time * 0.005) * 0.1;
      core.scale.set(pulse, pulse, pulse);
      coreGlow.scale.set(pulse * 1.1, pulse * 1.1, pulse * 1.1);

      // Expand starfield
      const pos = stars.geometry.attributes.position.array;
      for (let i = 0; i < starCount; i++) {
        pos[i*3] += starVel[i].vx * charge;
        pos[i*3+1] += starVel[i].vy * charge;
        pos[i*3+2] += starVel[i].vz * charge;

        // Reset if too far
        const distSq = pos[i*3]**2 + pos[i*3+1]**2 + pos[i*3+2]**2;
        if (distSq > 9) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const r = 0.2;
          pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
          pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
          pos[i*3+2] = r * Math.cos(phi);
        }
      }
      stars.geometry.attributes.position.needsUpdate = true;
    },
    setColor: (hex) => {
      // Keep cosmic blue/purple vibe, maybe mix a little user color
    },
    getParticleCount: () => starCount
  };
}
