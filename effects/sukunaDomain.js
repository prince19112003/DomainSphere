export function createSukunaDomain(T) {
  const group = new T.Group();

  // Materials
  const gateMat = new T.MeshStandardMaterial({ 
    color: 0x8b0000, // Dark blood red
    emissive: 0x3a0000,
    roughness: 0.7,
    metalness: 0.2
  });
  const darkMat = new T.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9,
    metalness: 0.1
  });

  // --- 1. Torii Gate Structure ---
  const gateGroup = new T.Group();
  
  // Pillars (Left and Right)
  const pillarGeo = new T.CylinderGeometry(0.04, 0.05, 0.8, 16);
  const leftPillar = new T.Mesh(pillarGeo, gateMat);
  leftPillar.position.set(-0.3, 0.4, 0);
  const rightPillar = new T.Mesh(pillarGeo, gateMat);
  rightPillar.position.set(0.3, 0.4, 0);
  gateGroup.add(leftPillar, rightPillar);

  // Crossbars
  const lowerBarGeo = new T.BoxGeometry(0.8, 0.06, 0.08);
  const lowerBar = new T.Mesh(lowerBarGeo, gateMat);
  lowerBar.position.set(0, 0.6, 0);
  gateGroup.add(lowerBar);

  const upperBarGeo = new T.BoxGeometry(0.9, 0.08, 0.1);
  const upperBar = new T.Mesh(upperBarGeo, gateMat);
  upperBar.position.set(0, 0.75, 0);
  
  // Curved roof
  const roofCurveGeo = new T.CylinderGeometry(0.5, 0.5, 1, 32, 1, false, 0, Math.PI);
  const roofCurve = new T.Mesh(roofCurveGeo, darkMat);
  roofCurve.rotation.z = Math.PI / 2;
  roofCurve.rotation.x = Math.PI / 2;
  roofCurve.scale.set(1, 0.15, 0.4);
  roofCurve.position.set(0, 0.8, 0);
  gateGroup.add(upperBar, roofCurve);

  // Center core/eye (Glowing red)
  const coreGeo = new T.SphereGeometry(0.08, 16, 16);
  const coreMat = new T.MeshBasicMaterial({ color: 0xff0000 });
  const core = new T.Mesh(coreGeo, coreMat);
  core.position.set(0, 0.4, 0);
  gateGroup.add(core);
  
  // Outer ring around the core
  const coreRingGeo = new T.TorusGeometry(0.12, 0.01, 16, 32);
  const coreRingMat = new T.MeshBasicMaterial({ color: 0xff0000 });
  const coreRing = new T.Mesh(coreRingGeo, coreRingMat);
  coreRing.position.set(0, 0.4, 0);
  gateGroup.add(coreRing);

  group.add(gateGroup);

  // --- 2. Dark Matter Base ---
  const baseGeo = new T.PlaneGeometry(2, 1.5, 16, 16);
  // Perturb vertices for rugged terrain (skulls/matter)
  const posBase = baseGeo.attributes.position;
  for (let i = 0; i < posBase.count; i++) {
      posBase.setZ(i, Math.random() * 0.1);
  }
  baseGeo.computeVertexNormals();
  const base = new T.Mesh(baseGeo, darkMat);
  base.rotation.x = -Math.PI / 2;
  base.position.set(0, 0, 0);
  group.add(base);

  // --- 3. Blood Fog/Aura ---
  const fogGeo = new T.SphereGeometry(1, 32, 32);
  const fogMat = new T.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.15,
    blending: T.AdditiveBlending,
    side: T.BackSide // Render inside the sphere
  });
  const fog = new T.Mesh(fogGeo, fogMat);
  fog.position.set(0, 0.4, -0.2);
  group.add(fog);

  // --- 4. Floating Embers ---
  const emberCount = 300;
  const emberGeo = new T.BufferGeometry();
  const emberPos = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount * 3; i += 3) {
    emberPos[i] = (Math.random() - 0.5) * 1.5; // x
    emberPos[i+1] = Math.random() * 1.5; // y
    emberPos[i+2] = (Math.random() - 0.5) * 1; // z
  }
  emberGeo.setAttribute('position', new T.BufferAttribute(emberPos, 3));
  const emberMat = new T.PointsMaterial({
    color: 0xff4400,
    size: 0.015,
    transparent: true,
    opacity: 0.8,
    blending: T.AdditiveBlending
  });
  const embers = new T.Points(emberGeo, emberMat);
  group.add(embers);

  // Lighting for the gate
  const ambientLight = new T.AmbientLight(0x220000);
  group.add(ambientLight);
  const pointLight = new T.PointLight(0xff0000, 3, 2);
  pointLight.position.set(0, 0.5, 0.5);
  group.add(pointLight);

  return {
    group,
    update: (time, charge) => {
      // Scale based on charge
      const scale = 0.2 + charge * 1.5; 
      group.scale.set(scale, scale, scale);
      
      // Position slightly lower so the gate emerges from the bottom
      group.position.y = -0.4;

      // Animate core
      coreRing.rotation.y += 0.05;
      coreRing.rotation.x += 0.02;
      
      // Pulse Fog
      const pulse = 1 + Math.sin(time * 0.003) * 0.05;
      fog.scale.set(pulse, pulse, pulse);

      // Move Embers upwards
      const positions = embers.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.005 * charge; // Move up
        // Add slight sway to x and z
        positions[i-1] += Math.sin(time * 0.002 + positions[i]) * 0.002;
        
        if (positions[i] > 1.5) {
          positions[i] = 0; // Reset to ground
        }
      }
      embers.geometry.attributes.position.needsUpdate = true;
    },
    setColor: (hex) => {
      // Gate remains red, no matter what
    },
    getParticleCount: () => emberCount
  };
}
