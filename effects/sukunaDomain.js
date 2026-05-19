export function createSukunaDomain(T) {
  const group = new T.Group();

  // Materials
  const gateMat = new T.MeshStandardMaterial({ 
    color: 0x5a0c0c, // Deep dried blood red
    emissive: 0x220202,
    roughness: 0.8,
    metalness: 0.4
  });
  
  const boneMat = new T.MeshStandardMaterial({
    color: 0xded8c3, // Ancient bone white
    emissive: 0x110e08,
    roughness: 0.9,
    metalness: 0.1
  });

  const darkMat = new T.MeshStandardMaterial({
    color: 0x050508,
    roughness: 0.9,
    metalness: 0.2
  });

  // --- 1. Enhanced Torii Gate & Temple Structure ---
  const gateGroup = new T.Group();
  
  // Pillars (Thicker and detailed with bone rings)
  const pillarGeo = new T.CylinderGeometry(0.045, 0.06, 0.8, 16);
  const leftPillar = new T.Mesh(pillarGeo, gateMat);
  leftPillar.position.set(-0.35, 0.4, 0);
  const rightPillar = new T.Mesh(pillarGeo, gateMat);
  rightPillar.position.set(0.35, 0.4, 0);
  gateGroup.add(leftPillar, rightPillar);

  // Bone Ribs/Spikes wrapping around pillars
  const ribGeo = new T.TorusGeometry(0.08, 0.015, 8, 16, Math.PI * 1.5);
  for (let y = 0.1; y <= 0.7; y += 0.2) {
    const leftRib = new T.Mesh(ribGeo, boneMat);
    leftRib.position.set(-0.35, y, 0);
    leftRib.rotation.z = Math.PI / 4;
    
    const rightRib = new T.Mesh(ribGeo, boneMat);
    rightRib.position.set(0.35, y, 0);
    rightRib.rotation.z = -Math.PI / 4;
    
    gateGroup.add(leftRib, rightRib);
  }

  // Crossbars (Double layered, curved)
  const lowerBarGeo = new T.BoxGeometry(0.9, 0.05, 0.08);
  const lowerBar = new T.Mesh(lowerBarGeo, gateMat);
  lowerBar.position.set(0, 0.62, 0);
  gateGroup.add(lowerBar);

  const upperBarGeo = new T.BoxGeometry(1.05, 0.07, 0.1);
  const upperBar = new T.Mesh(upperBarGeo, gateMat);
  upperBar.position.set(0, 0.76, 0);
  
  // Curved roof top arching upwards
  const roofCurveGeo = new T.CylinderGeometry(0.6, 0.6, 1.15, 32, 1, false, 0, Math.PI);
  const roofCurve = new T.Mesh(roofCurveGeo, darkMat);
  roofCurve.rotation.z = Math.PI / 2;
  roofCurve.rotation.x = Math.PI / 2;
  roofCurve.scale.set(1, 0.12, 0.35);
  roofCurve.position.set(0, 0.81, 0);
  gateGroup.add(upperBar, roofCurve);

  // Side spikes (Horns of the Shrine)
  const hornGeo = new T.ConeGeometry(0.03, 0.18, 8);
  const leftHorn = new T.Mesh(hornGeo, boneMat);
  leftHorn.position.set(-0.48, 0.88, 0.05);
  leftHorn.rotation.z = -Math.PI / 6;
  
  const rightHorn = new T.Mesh(hornGeo, boneMat);
  rightHorn.position.set(0.48, 0.88, 0.05);
  rightHorn.rotation.z = Math.PI / 6;
  gateGroup.add(leftHorn, rightHorn);

  // Center giant core eye (Multiple Pupils - Sukuna theme)
  const coreGroup = new T.Group();
  coreGroup.position.set(0, 0.42, 0.02);

  const mainEyeGeo = new T.SphereGeometry(0.07, 16, 16);
  const mainEyeMat = new T.MeshBasicMaterial({ color: 0xff0808 });
  const mainEye = new T.Mesh(mainEyeGeo, mainEyeMat);
  coreGroup.add(mainEye);

  // Rotating outer iris rings
  const irisRing1 = new T.Mesh(new T.TorusGeometry(0.1, 0.008, 8, 32), new T.MeshBasicMaterial({ color: 0xff3300 }));
  const irisRing2 = new T.Mesh(new T.TorusGeometry(0.14, 0.006, 8, 32), new T.MeshBasicMaterial({ color: 0x8b0000 }));
  coreGroup.add(irisRing1, irisRing2);
  gateGroup.add(coreGroup);

  group.add(gateGroup);

  // --- 2. Swirling Blood Pond Base ---
  const bloodBaseGroup = new T.Group();
  
  // Rugged ground plate
  const baseGeo = new T.PlaneGeometry(2.4, 2, 24, 24);
  const posBase = baseGeo.attributes.position;
  for (let i = 0; i < posBase.count; i++) {
    const x = posBase.getX(i);
    const y = posBase.getY(i);
    // Swirling ground wave patterns
    const dist = Math.sqrt(x*x + y*y);
    posBase.setZ(i, Math.sin(dist * 12) * 0.05 + Math.random() * 0.02);
  }
  baseGeo.computeVertexNormals();
  const base = new T.Mesh(baseGeo, darkMat);
  base.rotation.x = -Math.PI / 2;
  bloodBaseGroup.add(base);

  // Blood ripples ring
  const rippleGeo = new T.RingGeometry(0.1, 0.8, 32);
  const rippleMat = new T.MeshBasicMaterial({
    color: 0x990000,
    side: T.DoubleSide,
    transparent: true,
    opacity: 0.35,
    blending: T.AdditiveBlending
  });
  const bloodRipple = new T.Mesh(rippleGeo, rippleMat);
  bloodRipple.rotation.x = -Math.PI / 2;
  bloodRipple.position.y = 0.01;
  bloodBaseGroup.add(bloodRipple);

  group.add(bloodBaseGroup);

  // --- 3. Densed Blood Fog/Aura ---
  const fogGeo = new T.SphereGeometry(1.2, 32, 32);
  const fogMat = new T.MeshBasicMaterial({
    color: 0x660000,
    transparent: true,
    opacity: 0.18,
    blending: T.AdditiveBlending,
    side: T.BackSide
  });
  const fog = new T.Mesh(fogGeo, fogMat);
  fog.position.set(0, 0.4, -0.2);
  group.add(fog);

  // --- 4. Highly Densed Swirling Embers (2000 Particles Vortex) ---
  const emberCount = 2000;
  const emberGeo = new T.BufferGeometry();
  const emberPos = new Float32Array(emberCount * 3);
  const emberSpeeds = new Float32Array(emberCount);
  const emberRadii = new Float32Array(emberCount);
  const emberAngles = new Float32Array(emberCount);

  for (let i = 0; i < emberCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 0.15 + Math.random() * 1.1;
    emberAngles[i] = angle;
    emberRadii[i] = r;
    emberSpeeds[i] = 0.01 + Math.random() * 0.03;

    emberPos[i*3] = Math.cos(angle) * r;
    emberPos[i*3+1] = Math.random() * 1.5;
    emberPos[i*3+2] = Math.sin(angle) * r;
  }

  emberGeo.setAttribute('position', new T.BufferAttribute(emberPos, 3));
  
  const emberMat = new T.PointsMaterial({
    color: 0xff1100,
    size: 0.012,
    transparent: true,
    opacity: 0.9,
    blending: T.AdditiveBlending
  });
  
  const embers = new T.Points(emberGeo, emberMat);
  group.add(embers);

  // --- 5. Dismantle & Cleave Slash Streaks ---
  const slashCount = 15;
  const slashes = [];
  const slashGroup = new T.Group();

  for (let i = 0; i < slashCount; i++) {
    // Slash geometries represented as thin lines
    const slashPoints = [];
    slashPoints.push(new T.Vector3(-0.3 - Math.random() * 0.3, 0, 0));
    slashPoints.push(new T.Vector3(0.3 + Math.random() * 0.3, 0, 0));
    
    const slashGeo = new T.BufferGeometry().setFromPoints(slashPoints);
    const slashMat = new T.LineBasicMaterial({
      color: Math.random() > 0.4 ? 0xffffff : 0xff2222,
      transparent: true,
      opacity: 0,
      blending: T.AdditiveBlending,
      linewidth: 2
    });
    
    const slashLine = new T.Line(slashGeo, slashMat);
    
    // Random initial rotation/position in domain space
    slashLine.position.set(
      (Math.random() - 0.5) * 1.2,
      0.1 + Math.random() * 0.9,
      (Math.random() - 0.5) * 0.8
    );
    slashLine.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    slashGroup.add(slashLine);
    slashes.push({
      mesh: slashLine,
      lifetime: Math.random() * 100,
      speed: 1.5 + Math.random() * 2.5
    });
  }
  group.add(slashGroup);

  // Ambient lighting for deep crimson mood
  const ambientLight = new T.AmbientLight(0x350202);
  group.add(ambientLight);

  // Pulsing crimson pointlight inside core
  const pointLight = new T.PointLight(0xff0000, 4, 2.5);
  pointLight.position.set(0, 0.42, 0.2);
  group.add(pointLight);

  return {
    group,
    update: (time, charge) => {
      // Dynamic scaling adjusted to fit perfectly in viewport without being cut off
      const scale = 0.15 + charge * 0.43; 
      group.scale.set(scale, scale, scale);
      
      // Position base slightly higher so the entire structure fits inside the camera screen
      group.position.y = -0.26;

      // Rotate iris rings in opposite directions
      irisRing1.rotation.y += 0.04;
      irisRing1.rotation.x += 0.015;
      irisRing2.rotation.z -= 0.02;
      irisRing2.rotation.y -= 0.025;
      
      // Slowly spin the gate structure slightly for 3D depth
      gateGroup.rotation.y = Math.sin(time * 0.0008) * 0.12;

      // Pulse the central eye core and glow light
      const pulse = 1 + Math.sin(time * 0.004) * 0.08;
      mainEye.scale.set(pulse, pulse, pulse);
      pointLight.intensity = (3.5 + Math.sin(time * 0.005) * 1.5) * charge;
      
      // Pulse blood base ripples
      bloodRipple.scale.set(pulse, pulse, pulse);
      bloodRipple.rotation.z += 0.005;

      // 1. High-Density Swirling Vortex (Embers)
      const positions = embers.geometry.attributes.position.array;
      for (let i = 0; i < emberCount; i++) {
        // Increment angles to swirl around center
        emberAngles[i] += emberSpeeds[i] * (0.4 + charge * 1.2);
        
        // Rise upwards
        positions[i*3+1] += 0.004 * (0.5 + charge);

        // Map angle & radius to X, Z coords
        positions[i*3] = Math.cos(emberAngles[i]) * emberRadii[i];
        positions[i*3+2] = Math.sin(emberAngles[i]) * emberRadii[i];
        
        // Reset when embers float too high
        if (positions[i*3+1] > 1.4) {
          positions[i*3+1] = 0;
          emberRadii[i] = 0.15 + Math.random() * 1.1;
        }
      }
      embers.geometry.attributes.position.needsUpdate = true;

      // 2. High-speed Cleave and Dismantle slash lines
      slashes.forEach(s => {
        s.lifetime += s.speed * (0.8 + charge * 1.5);
        
        if (s.lifetime > 100) {
          // Reset slash to a random location
          s.lifetime = 0;
          s.mesh.position.set(
            (Math.random() - 0.5) * 1.2,
            0.15 + Math.random() * 0.85,
            (Math.random() - 0.5) * 0.6
          );
          s.mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          // Random scale length
          const scaleLen = 0.5 + Math.random() * 1.5;
          s.mesh.scale.set(scaleLen, 1, 1);
          s.mesh.material.color.setHex(Math.random() > 0.4 ? 0xffffff : 0xff1111);
        }

        // Pulse opacity (flash instantly, fade out)
        if (s.lifetime < 20) {
          s.mesh.material.opacity = (s.lifetime / 20) * charge;
        } else {
          s.mesh.material.opacity = Math.max(0, (1 - (s.lifetime - 20) / 80)) * charge;
        }
      });
    },
    setColor: (hex) => {
      // Domain remains deep crimson blood red
    },
    getParticleCount: () => emberCount + slashCount
  };
}
