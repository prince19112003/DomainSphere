/**
 * effects/chidori.js — Chidori Lightning Crackling Mesh
 * Naruto · Uchiha Sasuke
 */
export function createChidori(THREE) {
  const group = new THREE.Group();
  const boltGroups = [];
  const sparkParticles = [];
  const BOLT_COUNT = 18;
  const SPARK_COUNT = 120;

  // Lightning bolts — updated every frame with random jagged geometry
  for (let i = 0; i < BOLT_COUNT; i++) {
    const mat = new THREE.LineBasicMaterial({
      color: i % 3 === 0 ? 0xffffff : (i % 3 === 1 ? 0x00cfff : 0x80dfff),
      transparent: true,
      opacity: 0.8,
    });
    const geo = new THREE.BufferGeometry();
    const pts = new Float32Array(12 * 3); // 12 points per bolt
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const line = new THREE.Line(geo, mat);
    group.add(line);
    boltGroups.push({ line, geo, mat });
  }

  // Spark particles
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(SPARK_COUNT * 3);
  const sparkVel = [];
  for (let i = 0; i < SPARK_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.003 + Math.random() * 0.008;
    sparkVel.push({ vx: Math.sin(phi)*Math.cos(theta)*speed, vy: Math.sin(phi)*Math.sin(theta)*speed, vz: Math.cos(phi)*speed, life: Math.random() });
    sparkPos[i*3] = (Math.random()-0.5)*0.05;
    sparkPos[i*3+1] = (Math.random()-0.5)*0.05;
    sparkPos[i*3+2] = (Math.random()-0.5)*0.05;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({ color: 0x00cfff, size: 0.012, transparent: true, opacity: 0.9, sizeAttenuation: true });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  group.add(sparks);

  // Center glow
  const glowGeo = new THREE.SphereGeometry(0.04, 12, 12);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00cfff, transparent: true, opacity: 0.4 });
  group.add(new THREE.Mesh(glowGeo, glowMat));

  function randomBolt(pts, range) {
    // Generate a jagged lightning path from center outward
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;
    const len = range * (0.6 + Math.random() * 0.6);
    const segs = 11;
    let x = 0, y = 0, z = 0;
    const dx = Math.cos(theta) * Math.cos(phi) * len / segs;
    const dy = Math.sin(phi) * len / segs;
    const dz = Math.sin(theta) * Math.cos(phi) * len / segs;
    for (let s = 0; s <= segs; s++) {
      const jitter = s === 0 || s === segs ? 0 : (Math.random() - 0.5) * 0.06;
      pts[s*3]   = x + jitter;
      pts[s*3+1] = y + jitter;
      pts[s*3+2] = z + jitter;
      x += dx; y += dy; z += dz;
    }
  }

  return {
    group,
    update(time, charge) {
      const t = time * 0.001;
      const scale = 0.6 + charge * 1.4;
      group.scale.setScalar(scale);

      const range = 0.18 + charge * 0.22;

      // Regenerate bolts every frame for crackling effect
      boltGroups.forEach(({ geo, mat }) => {
        const pts = geo.attributes.position.array;
        randomBolt(pts, range);
        geo.attributes.position.needsUpdate = true;
        mat.opacity = 0.4 + Math.random() * 0.5;
      });

      // Update sparks
      const sPos = sparkGeo.attributes.position.array;
      for (let i = 0; i < SPARK_COUNT; i++) {
        const v = sparkVel[i];
        v.life -= 0.018;
        if (v.life <= 0) {
          // Reset
          sPos[i*3] = (Math.random()-0.5)*0.04;
          sPos[i*3+1] = (Math.random()-0.5)*0.04;
          sPos[i*3+2] = (Math.random()-0.5)*0.04;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const speed = 0.004 + Math.random() * 0.01;
          v.vx = Math.sin(phi)*Math.cos(theta)*speed;
          v.vy = Math.sin(phi)*Math.sin(theta)*speed;
          v.vz = Math.cos(phi)*speed;
          v.life = 0.5 + Math.random() * 0.5;
        } else {
          sPos[i*3]   += v.vx;
          sPos[i*3+1] += v.vy;
          sPos[i*3+2] += v.vz;
          // Gravity
          v.vy -= 0.0001;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkMat.opacity = 0.5 + charge * 0.4;
    },
    setColor(hex) {
      sparkMat.color.set(hex);
      boltGroups[0].mat.color.set(hex);
    },
    getParticleCount() { return SPARK_COUNT + BOLT_COUNT * 12; },
  };
}
