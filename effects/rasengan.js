/**
 * effects/rasengan.js — Swirling Rasengan Wind Sphere
 * Naruto · Uzumaki Naruto
 */
export function createRasengan(THREE) {
  const group = new THREE.Group();
  const particles = [];
  let rings = [];
  let core;
  let chakraColor = new THREE.Color(0x4fc3f7);

  // Core glow sphere
  const coreGeo = new THREE.SphereGeometry(0.055, 24, 24);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
  core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Inner glow halo
  const haloGeo = new THREE.SphereGeometry(0.09, 24, 24);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.25, side: THREE.BackSide });
  group.add(new THREE.Mesh(haloGeo, haloMat));

  // Rotating rings
  const ringAngles = [0, Math.PI / 3, Math.PI * 2 / 3];
  ringAngles.forEach((angle, i) => {
    const geo = new THREE.TorusGeometry(0.13 + i * 0.04, 0.005, 6, 48);
    const mat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0x00f0ff : 0x90caf9, transparent: true, opacity: 0.65 - i * 0.1 });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = angle;
    ring.userData.rotSpeed = (i % 2 === 0 ? 1 : -1) * (2.5 + i * 1.0);
    group.add(ring);
    rings.push(ring);
  });

  // Particle swirl
  const ptCount = 280;
  const ptGeo = new THREE.BufferGeometry();
  const ptPositions = new Float32Array(ptCount * 3);
  const ptPhases = new Float32Array(ptCount);
  const ptRadii = new Float32Array(ptCount);
  for (let i = 0; i < ptCount; i++) {
    ptPhases[i] = Math.random() * Math.PI * 2;
    ptRadii[i] = 0.08 + Math.random() * 0.18;
    ptPositions[i*3]   = 0;
    ptPositions[i*3+1] = 0;
    ptPositions[i*3+2] = 0;
  }
  ptGeo.setAttribute('position', new THREE.BufferAttribute(ptPositions, 3));
  const ptMat = new THREE.PointsMaterial({ color: 0x00f0ff, size: 0.008, transparent: true, opacity: 0.8, sizeAttenuation: true });
  const ptMesh = new THREE.Points(ptGeo, ptMat);
  group.add(ptMesh);

  return {
    group,
    update(time, charge) {
      const t = time * 0.001;
      const scale = 0.5 + charge * 1.2;
      group.scale.setScalar(scale);

      // Rings spin
      rings.forEach(r => { r.rotation.z += 0.016 * r.userData.rotSpeed; });

      // Particles spiral inward
      const pos = ptGeo.attributes.position.array;
      for (let i = 0; i < ptCount; i++) {
        const phase = ptPhases[i] + t * 3.0;
        const radius = ptRadii[i] * (1.0 - (t * 0.3) % 1.0);
        const r = 0.04 + Math.max(0.0, radius);
        pos[i*3]   = Math.cos(phase) * r;
        pos[i*3+1] = Math.sin(phase * 1.3) * r * 0.5;
        pos[i*3+2] = Math.sin(phase) * r;
      }
      ptGeo.attributes.position.needsUpdate = true;

      // Core pulse
      const pulse = 0.85 + Math.sin(t * 8) * 0.15;
      core.scale.setScalar(pulse);
      coreMat.opacity = 0.7 + charge * 0.3;
    },
    setColor(hex) {
      chakraColor.set(hex);
      ptMat.color.set(hex);
      rings[0].material.color.set(hex);
    },
    getParticleCount() { return ptCount; },
  };
}
