/**
 * effects/katon.js — Katon Great Fireball Plume
 * Naruto · Uchiha Madara
 */
export function createKaton(THREE) {
  const group = new THREE.Group();
  const PARTICLE_COUNT = 320;

  // Particle data
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);

  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const life = Math.random();
    particles.push({
      x: (Math.random()-0.5)*0.04,
      y: (Math.random()-0.5)*0.04,
      z: (Math.random()-0.5)*0.04,
      vx: (Math.random()-0.5)*0.006,
      vy: 0.004 + Math.random()*0.014,
      vz: (Math.random()-0.5)*0.006,
      life,
      maxLife: 0.4 + Math.random()*0.6,
      size: 0.025 + Math.random()*0.04,
    });
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.04,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const mesh = new THREE.Points(geo, mat);
  group.add(mesh);

  // Fire core glow
  const coreGeo = new THREE.SphereGeometry(0.04, 12, 12);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.6 });
  group.add(new THREE.Mesh(coreGeo, coreMat));

  function fireColor(life) {
    // From white-yellow (new) to red-black (old)
    if (life > 0.7) return { r: 1, g: 1, b: 0.6 };
    if (life > 0.4) return { r: 1, g: 0.4 + life*0.8, b: 0 };
    if (life > 0.15) return { r: 1, g: life * 0.8, b: 0 };
    return { r: life * 4, g: 0, b: 0 };
  }

  return {
    group,
    update(time, charge) {
      const t = time * 0.001;
      const scale = 0.5 + charge * 1.5;
      group.scale.setScalar(scale);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        p.life -= 0.022;

        if (p.life <= 0) {
          // Reset at origin with upward velocity
          p.x = (Math.random()-0.5)*0.04 * charge;
          p.y = (Math.random()-0.5)*0.04;
          p.z = (Math.random()-0.5)*0.04 * charge;
          p.vx = (Math.random()-0.5)*0.008;
          p.vy = 0.005 + Math.random()*0.016 + charge*0.012;
          p.vz = (Math.random()-0.5)*0.008;
          p.life = 0.5 + Math.random()*0.5;
          p.maxLife = p.life;
        } else {
          p.x += p.vx; p.y += p.vy; p.z += p.vz;
          // Turbulence
          p.vx += (Math.random()-0.5)*0.0008;
          p.vz += (Math.random()-0.5)*0.0008;
          // Upward acceleration
          p.vy += 0.00025;
        }

        const norm = p.life / p.maxLife;
        const c = fireColor(norm);
        positions[i*3]   = p.x;
        positions[i*3+1] = p.y;
        positions[i*3+2] = p.z;
        colors[i*3]   = c.r;
        colors[i*3+1] = c.g;
        colors[i*3+2] = c.b;
        sizes[i] = p.size * norm;
      }

      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      geo.attributes.size.needsUpdate = true;

      coreMat.opacity = 0.3 + charge * 0.5;
      const pulse = 0.8 + Math.sin(t * 10) * 0.2;
      mesh.scale.setScalar(pulse);
    },
    setColor(hex) {
      // Optionally tint core
      coreMat.color.set(hex);
    },
    getParticleCount() { return PARTICLE_COUNT; },
  };
}
