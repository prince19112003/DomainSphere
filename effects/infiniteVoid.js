import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class InfiniteVoidEffect {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.isActive = false;

    // --- 1. Celestial Halo/Ring ---
    const ringGeo = new THREE.TorusGeometry(3, 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    this.halo = new THREE.Mesh(ringGeo, ringMat);
    this.group.add(this.halo);

    // Halo Glow
    const haloGlowGeo = new THREE.TorusGeometry(3, 0.2, 16, 100);
    const haloGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    this.haloGlow = new THREE.Mesh(haloGlowGeo, haloGlowMat);
    this.group.add(this.haloGlow);

    // --- 2. Singularity Core ---
    const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(this.core);

    // Core Glow
    const coreGlowGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const coreGlowMat = new THREE.MeshBasicMaterial({
      color: 0x8a2be2, // Purple glow
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    this.coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    this.group.add(this.coreGlow);

    // Core Light
    this.light = new THREE.PointLight(0xffffff, 5, 20);
    this.group.add(this.light);

    // --- 3. Starfield Background ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPos = new Float32Array(starCount * 3);
    const starVels = [];

    for (let i = 0; i < starCount; i++) {
      // Random position in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 2 + Math.random() * 15; // Start away from center

      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);

      // Velocity moving outward
      starVels.push({
        vx: (starPos[i * 3] / r) * (0.02 + Math.random() * 0.05),
        vy: (starPos[i * 3 + 1] / r) * (0.02 + Math.random() * 0.05),
        vz: (starPos[i * 3 + 2] / r) * (0.02 + Math.random() * 0.05)
      });
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.stars = new THREE.Points(starGeo, starMat);
    this.starVels = starVels;
    this.group.add(this.stars);

    // Initial scale and position
    this.group.position.set(0, 0, -8); // Position back in the scene
    this.group.scale.set(0.01, 0.01, 0.01);
  }

  activate(handPos) {
    if (this.isActive) return;
    this.isActive = true;
    this.scene.add(this.group);
    
    // Animate in
    this.group.scale.set(0.01, 0.01, 0.01);
  }

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;
    this.scene.remove(this.group);
  }

  update(handPos, time) {
    if (!this.isActive) return;

    // Smoothly scale up
    if (this.group.scale.x < 1) {
      this.group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
    }

    // Follow hand slightly but remain mostly centered/background
    const targetZ = handPos.z * 10 - 5;
    this.group.position.lerp(new THREE.Vector3(handPos.x * 2, handPos.y * 2, targetZ), 0.05);

    // Rotate Halo
    this.halo.rotation.z -= 0.01;
    this.haloGlow.rotation.z -= 0.01;
    
    // Core Pulse
    const pulse = 1 + Math.sin(time * 5) * 0.1;
    this.core.scale.set(pulse, pulse, pulse);
    this.coreGlow.scale.set(pulse * 1.2, pulse * 1.2, pulse * 1.2);

    // Move Stars outward
    const positions = this.stars.geometry.attributes.position.array;
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3] += this.starVels[i].vx;
      positions[i * 3 + 1] += this.starVels[i].vy;
      positions[i * 3 + 2] += this.starVels[i].vz;

      // Calculate distance from center
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      const dist = Math.sqrt(x*x + y*y + z*z);

      // Reset if too far
      if (dist > 20) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 2; // Reset near center
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
    }
    this.stars.geometry.attributes.position.needsUpdate = true;
  }
}
