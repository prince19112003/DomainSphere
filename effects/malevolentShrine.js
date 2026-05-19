import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export class MalevolentShrineEffect {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.isActive = false;

    // Materials
    const gateMat = new THREE.MeshStandardMaterial({ 
      color: 0x8b0000, // Dark blood red
      emissive: 0x3a0000,
      roughness: 0.7,
      metalness: 0.2
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9,
      metalness: 0.1
    });

    // --- 1. Torii Gate Structure ---
    this.gateGroup = new THREE.Group();
    
    // Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.3, 0.4, 6, 16);
    const leftPillar = new THREE.Mesh(pillarGeo, gateMat);
    leftPillar.position.set(-2.5, 3, 0);
    const rightPillar = new THREE.Mesh(pillarGeo, gateMat);
    rightPillar.position.set(2.5, 3, 0);
    this.gateGroup.add(leftPillar, rightPillar);

    // Crossbars
    const lowerBarGeo = new THREE.BoxGeometry(6, 0.4, 0.6);
    const lowerBar = new THREE.Mesh(lowerBarGeo, gateMat);
    lowerBar.position.set(0, 4.5, 0);
    this.gateGroup.add(lowerBar);

    const upperBarGeo = new THREE.BoxGeometry(6.5, 0.5, 0.7);
    const upperBar = new THREE.Mesh(upperBarGeo, gateMat);
    upperBar.position.set(0, 5.5, 0);
    
    // Curved roof effect (simple approximation)
    const roofCurveGeo = new THREE.CylinderGeometry(3.5, 3.5, 7, 32, 1, false, 0, Math.PI);
    const roofCurve = new THREE.Mesh(roofCurveGeo, darkMat);
    roofCurve.rotation.z = Math.PI / 2;
    roofCurve.rotation.x = Math.PI / 2;
    roofCurve.scale.set(1, 0.2, 0.5);
    roofCurve.position.set(0, 5.8, 0);
    this.gateGroup.add(upperBar, roofCurve);

    // Center emblem/core
    const coreGeo = new THREE.TorusGeometry(0.5, 0.1, 8, 24);
    const coreGlowMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.core = new THREE.Mesh(coreGeo, coreGlowMat);
    this.core.position.set(0, 3, 0);
    this.gateGroup.add(this.core);

    this.group.add(this.gateGroup);

    // --- 2. Dark Matter Base ---
    const baseGeo = new THREE.PlaneGeometry(15, 10, 32, 32);
    // Perturb vertices for rugged terrain (skulls/matter)
    const pos = baseGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        pos.setZ(i, Math.random() * 0.8);
    }
    baseGeo.computeVertexNormals();
    this.base = new THREE.Mesh(baseGeo, darkMat);
    this.base.rotation.x = -Math.PI / 2;
    this.base.position.set(0, 0, 0);
    this.group.add(this.base);

    // --- 3. Blood Fog/Aura ---
    const fogGeo = new THREE.SphereGeometry(6, 32, 32);
    const fogMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    this.fog = new THREE.Mesh(fogGeo, fogMat);
    this.fog.position.set(0, 3, -2);
    this.group.add(this.fog);

    // --- 4. Floating Embers ---
    const emberGeo = new THREE.BufferGeometry();
    const emberCount = 300;
    const emberPos = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount * 3; i += 3) {
      emberPos[i] = (Math.random() - 0.5) * 12; // x
      emberPos[i+1] = Math.random() * 8; // y
      emberPos[i+2] = (Math.random() - 0.5) * 8; // z
    }
    emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xff4400,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    this.embers = new THREE.Points(emberGeo, emberMat);
    this.group.add(this.embers);

    // Lights
    this.ambientLight = new THREE.AmbientLight(0x220000);
    this.group.add(this.ambientLight);
    this.pointLight = new THREE.PointLight(0xff0000, 5, 15);
    this.pointLight.position.set(0, 4, 2);
    this.group.add(this.pointLight);

    // Initial scale and position
    this.group.position.set(0, -2, -10); // Placed on ground, further back
    this.group.scale.set(0.01, 0.01, 0.01);
  }

  activate(handPos) {
    if (this.isActive) return;
    this.isActive = true;
    this.scene.add(this.group);
    
    // Reset scale for animation
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

    // Follow hand slightly (less movement than Gojo's, it's a massive structure)
    const targetX = handPos.x * 2;
    const targetZ = handPos.z * 5 - 10;
    this.group.position.lerp(new THREE.Vector3(targetX, -2, targetZ), 0.02);

    // Animate core
    this.core.rotation.y += 0.02;
    this.core.rotation.x += 0.01;
    
    // Pulse Fog
    const pulse = 1 + Math.sin(time * 3) * 0.05;
    this.fog.scale.set(pulse, pulse, pulse);

    // Move Embers upwards
    const positions = this.embers.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
      positions[i] += 0.02; // Move up
      // Add slight sway to x and z
      positions[i-1] += Math.sin(time * 2 + positions[i]) * 0.01;
      
      if (positions[i] > 8) {
        positions[i] = 0; // Reset to ground
      }
    }
    this.embers.geometry.attributes.position.needsUpdate = true;
  }
}
