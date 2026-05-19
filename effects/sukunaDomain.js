export function createSukunaDomain(T) {
  const group = new T.Group();

  // Materials - Ultra realistic rendering params
  const gateMat = new T.MeshStandardMaterial({ 
    color: 0x2a0000, 
    emissive: 0x110000,
    roughness: 0.7,
    metalness: 0.5
  });
  
  const boneMat = new T.MeshStandardMaterial({
    color: 0xffe8cc, 
    emissive: 0x2a0505,
    roughness: 0.9,
    metalness: 0.1
  });

  const darkMat = new T.MeshStandardMaterial({
    color: 0x050000,
    roughness: 1.0,
    metalness: 0.1
  });

  // --- 1. Enhanced Torii Gate & Temple Structure ---
  const gateGroup = new T.Group();
  
  const pillarGeo = new T.CylinderGeometry(0.06, 0.08, 0.85, 16);
  const leftPillar = new T.Mesh(pillarGeo, gateMat);
  leftPillar.position.set(-0.35, 0.42, 0);
  const rightPillar = new T.Mesh(pillarGeo, gateMat);
  rightPillar.position.set(0.35, 0.42, 0);
  gateGroup.add(leftPillar, rightPillar);

  // Bone Ribs
  const ribGeo = new T.TorusGeometry(0.1, 0.025, 8, 16, Math.PI * 1.5);
  for (let y = 0.25; y <= 0.75; y += 0.16) {
    const leftRib = new T.Mesh(ribGeo, boneMat);
    leftRib.position.set(-0.35, y, 0);
    leftRib.rotation.z = Math.PI / 4 + Math.random() * 0.3; 
    
    const rightRib = new T.Mesh(ribGeo, boneMat);
    rightRib.position.set(0.35, y, 0);
    rightRib.rotation.z = -Math.PI / 4 - Math.random() * 0.3;
    
    gateGroup.add(leftRib, rightRib);
  }

  const lowerBarGeo = new T.BoxGeometry(1.05, 0.06, 0.1);
  const lowerBar = new T.Mesh(lowerBarGeo, gateMat);
  lowerBar.position.set(0, 0.65, 0);
  gateGroup.add(lowerBar);

  const upperBarGeo = new T.BoxGeometry(1.2, 0.09, 0.12);
  const upperBar = new T.Mesh(upperBarGeo, gateMat);
  upperBar.position.set(0, 0.80, 0);
  
  const roofCurveGeo = new T.CylinderGeometry(0.75, 0.75, 1.3, 32, 1, false, 0, Math.PI);
  const roofCurve = new T.Mesh(roofCurveGeo, darkMat);
  roofCurve.rotation.z = Math.PI / 2;
  roofCurve.rotation.x = Math.PI / 2;
  roofCurve.scale.set(1, 0.15, 0.4);
  roofCurve.position.set(0, 0.85, 0);
  gateGroup.add(upperBar, roofCurve);

  const hornGeo = new T.ConeGeometry(0.045, 0.3, 8);
  const hornMat = new T.MeshStandardMaterial({ color: 0xffeadd, emissive: 0x660000, roughness: 0.3 });
  const leftHorn = new T.Mesh(hornGeo, hornMat);
  leftHorn.position.set(-0.55, 0.95, 0.05);
  leftHorn.rotation.z = -Math.PI / 4;
  
  const rightHorn = new T.Mesh(hornGeo, hornMat);
  rightHorn.position.set(0.55, 0.95, 0.05);
  rightHorn.rotation.z = Math.PI / 4;
  gateGroup.add(leftHorn, rightHorn);

  // --- Mountain of Skulls/Bones (Instanced Mesh for Performance) ---
  const skullCount = 600;
  const skullGeo = new T.SphereGeometry(0.025, 6, 6); 
  const skullInstanced = new T.InstancedMesh(skullGeo, boneMat, skullCount);
  const dummy = new T.Object3D();
  
  for(let i=0; i<skullCount; i++) {
    const r = Math.random() * 0.45;
    const theta = Math.random() * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const y = (0.45 - r) * (Math.random() * 0.5 + 0.3) - 0.02;

    dummy.position.set(x, y, z);
    dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    dummy.scale.setScalar(0.6 + Math.random() * 0.8); 
    dummy.updateMatrix();
    skullInstanced.setMatrixAt(i, dummy.matrix);
  }
  skullInstanced.instanceMatrix.needsUpdate = true;
  gateGroup.add(skullInstanced); 

  // --- Sukuna's Demonic Throne ---
  const throneGroup = new T.Group();
  
  const seatGeo = new T.BoxGeometry(0.35, 0.08, 0.25);
  const seat = new T.Mesh(seatGeo, darkMat);
  seat.position.set(0, 0.16, 0.05);
  throneGroup.add(seat);

  const backGeo = new T.BoxGeometry(0.3, 0.35, 0.08);
  const back = new T.Mesh(backGeo, gateMat);
  back.position.set(0, 0.32, -0.05);
  throneGroup.add(back);

  const armrestGeo = new T.CylinderGeometry(0.015, 0.015, 0.25, 8);
  const leftArm = new T.Mesh(armrestGeo, boneMat);
  leftArm.position.set(-0.16, 0.22, 0.05);
  leftArm.rotation.x = Math.PI / 2;
  
  const rightArm = new T.Mesh(armrestGeo, boneMat);
  rightArm.position.set(0.16, 0.22, 0.05);
  rightArm.rotation.x = Math.PI / 2;
  throneGroup.add(leftArm, rightArm);

  const throneSpikeGeo = new T.ConeGeometry(0.02, 0.15, 4);
  for(let i = -1; i <= 1; i += 2) {
    const spike = new T.Mesh(throneSpikeGeo, boneMat);
    spike.position.set(i * 0.12, 0.52, -0.05);
    throneGroup.add(spike);
  }

  gateGroup.add(throneGroup);

  // Center giant core eye
  const coreGroup = new T.Group();
  coreGroup.position.set(0, 0.55, 0.03);

  const mainEyeGeo = new T.SphereGeometry(0.08, 32, 32);
  const mainEyeMat = new T.MeshBasicMaterial({ color: 0xff1111 }); 
  const mainEye = new T.Mesh(mainEyeGeo, mainEyeMat);
  coreGroup.add(mainEye);

  const irisRing1 = new T.Mesh(new T.TorusGeometry(0.12, 0.012, 8, 32), new T.MeshBasicMaterial({ color: 0xff3300 }));
  const irisRing2 = new T.Mesh(new T.TorusGeometry(0.17, 0.008, 8, 32), new T.MeshBasicMaterial({ color: 0x880000 }));
  const irisRing3 = new T.Mesh(new T.TorusGeometry(0.22, 0.004, 8, 64), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
  coreGroup.add(irisRing1, irisRing2, irisRing3);
  gateGroup.add(coreGroup);

  group.add(gateGroup);

  // --- Dark Expanding Aura Sphere ---
  const auraGeo = new T.SphereGeometry(2.5, 32, 32);
  const auraMat = new T.MeshBasicMaterial({
    color: 0x110000, transparent: true, opacity: 0, blending: T.AdditiveBlending, side: T.BackSide
  });
  const darkAura = new T.Mesh(auraGeo, auraMat);
  group.add(darkAura);

  // --- Swirling Blood Pond Base ---
  const bloodBaseGroup = new T.Group();
  const baseGeo = new T.PlaneGeometry(10.0, 10.0, 64, 64); 
  const posBase = baseGeo.attributes.position;
  const originalZ = new Float32Array(posBase.count);
  for (let i = 0; i < posBase.count; i++) {
    originalZ[i] = posBase.getZ(i);
  }
  const base = new T.Mesh(baseGeo, darkMat);
  base.rotation.x = -Math.PI / 2;
  bloodBaseGroup.add(base);

  const shockwaves = [];
  for (let i = 0; i < 6; i++) {
    const waveMat = new T.MeshBasicMaterial({
      color: 0xff1100, side: T.DoubleSide, transparent: true, opacity: 0, blending: T.AdditiveBlending
    });
    const wave = new T.Mesh(new T.RingGeometry(0.1, 0.25, 64), waveMat);
    wave.rotation.x = -Math.PI / 2;
    wave.position.y = 0.02 + (i * 0.005);
    wave.userData = { phase: i * 0.16 }; 
    bloodBaseGroup.add(wave);
    shockwaves.push(wave);
  }
  group.add(bloodBaseGroup);

  // --- Curse Energy Tornado (Embers) ---
  const emberCount = 3500; 
  const emberGeo = new T.BufferGeometry();
  const emberPos = new Float32Array(emberCount * 3);
  const emberSpeeds = new Float32Array(emberCount);
  const emberRadii = new Float32Array(emberCount);
  const emberAngles = new Float32Array(emberCount);

  for (let i = 0; i < emberCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 0.2 + Math.random() * 2.0;
    emberAngles[i] = angle;
    emberRadii[i] = r;
    emberSpeeds[i] = 0.02 + Math.random() * 0.05;

    emberPos[i*3] = Math.cos(angle) * r;
    emberPos[i*3+1] = Math.random() * 3.0;
    emberPos[i*3+2] = Math.sin(angle) * r;
  }

  emberGeo.setAttribute('position', new T.BufferAttribute(emberPos, 3));
  const emberMat = new T.PointsMaterial({
    color: 0xff3300, size: 0.015, transparent: true, opacity: 0.9, blending: T.AdditiveBlending
  });
  const embers = new T.Points(emberGeo, emberMat);
  group.add(embers);

  // --- Cleave & Dismantle Storm ---
  const slashCount = 45; 
  const slashes = [];
  const slashGroup = new T.Group();

  for (let i = 0; i < slashCount; i++) {
    const slashGeo = new T.PlaneGeometry(1.5, 0.015);
    slashGeo.translate(0.75, 0, 0); 
    const slashMat = new T.MeshBasicMaterial({
      color: Math.random() > 0.15 ? 0xff0a0a : 0xffffff, 
      transparent: true, opacity: 0, blending: T.AdditiveBlending, side: T.DoubleSide
    });
    const slashMesh = new T.Mesh(slashGeo, slashMat);
    slashGroup.add(slashMesh);
    slashes.push({
      mesh: slashMesh,
      lifetime: Math.random() * 100,
      speed: 2.5 + Math.random() * 4.5,
      baseScale: 1.0 + Math.random() * 3.5
    });
  }
  group.add(slashGroup);

  // --- Lighting ---
  const ambientLight = new T.AmbientLight(0x330000);
  group.add(ambientLight);

  const pointLight = new T.PointLight(0xff0000, 5, 4.0);
  pointLight.position.set(0, 0.45, 0.3); 
  group.add(pointLight);

  const flashLight = new T.PointLight(0xffffff, 0, 8.0);
  flashLight.position.set(0, 1.5, 1.0);
  group.add(flashLight);

  let pulseTime = 0;
  let eyeTarget = { x: 0, y: 0 };

  return {
    group,
    
    update: (time, charge) => {
      const t = time * 0.001;
      const powerMultiplier = 1.0 + Math.pow(charge, 4) * 8.0; 
      pulseTime += 0.016 * (1 + charge * 3);

      // 1. SCALING UP (90% Height Cover)
      // Base size is scaled up dramatically so that at max charge it touches edges
      const scale = 0.3 + charge * 1.1; 
      group.scale.set(scale, scale, scale);
      
      // Lowering Y position to keep base anchored near bottom while top reaches the ceiling
      group.position.y = -0.45 - (charge * 0.35); 

      if (charge > 0.5) {
        const shake = Math.pow(charge - 0.5, 2) * 0.25;
        gateGroup.position.x = (Math.random() - 0.5) * shake;
        gateGroup.position.y = (Math.random() - 0.5) * shake;
      } else {
        gateGroup.position.set(0, 0, 0);
        gateGroup.position.y = Math.sin(t * 1.5) * 0.02 * (1 - charge);
      }

      if (Math.random() > 0.85 - (charge * 0.2)) {
        eyeTarget.x = (Math.random() - 0.5) * 0.15 * charge;
        eyeTarget.y = (Math.random() - 0.5) * 0.15 * charge;
      }
      mainEye.position.x += (eyeTarget.x - mainEye.position.x) * 0.3;
      mainEye.position.y += (eyeTarget.y - mainEye.position.y) * 0.3;

      irisRing1.rotation.y += 0.04 * powerMultiplier;
      irisRing1.rotation.x += 0.02 * powerMultiplier;
      irisRing2.rotation.z -= 0.03 * powerMultiplier;
      irisRing2.rotation.y -= 0.04 * powerMultiplier;
      irisRing3.rotation.z += 0.07 * powerMultiplier;

      darkAura.scale.set(1 + charge * 0.5, 1 + charge * 0.5, 1 + charge * 0.5);
      darkAura.material.opacity = Math.pow(charge, 2) * 0.6; 

      // 2. Boiling Blood Sea (Always Active)
      const positionsBase = baseGeo.attributes.position;
      for (let i = 0; i < positionsBase.count; i++) {
        const x = positionsBase.getX(i);
        const y = positionsBase.getY(i);
        const dist = Math.sqrt(x*x + y*y);
        
        const waveHeight = 0.01 + Math.pow(charge, 2) * 0.04; 
        const z = originalZ[i] + Math.sin(dist * 8 - t * 3 * powerMultiplier) * waveHeight 
                               + Math.cos(x * 4 + t * 2) * (waveHeight * 0.5);
        positionsBase.setZ(i, z);
      }
      baseGeo.computeVertexNormals();
      positionsBase.needsUpdate = true;

      // Expanding Shockwaves
      shockwaves.forEach((wave) => {
        wave.userData.phase += 0.02 * powerMultiplier;
        if (wave.userData.phase > 1.0) wave.userData.phase = 0;
        const waveScale = 1.0 + Math.pow(wave.userData.phase, 1.2) * 18.0;
        wave.scale.set(waveScale, waveScale, 1);
        if (wave.userData.phase < 0.1) {
          wave.material.opacity = (wave.userData.phase / 0.1) * charge;
        } else {
          wave.material.opacity = Math.max(0, 1.0 - wave.userData.phase) * charge;
        }
      });

      // Hurricane Embers
      const positions = embers.geometry.attributes.position.array;
      for (let i = 0; i < emberCount; i++) {
        emberAngles[i] += emberSpeeds[i] * powerMultiplier;
        positions[i*3+1] += 0.006 * powerMultiplier; 

        const heightRatio = Math.max(0, positions[i*3+1] / 3.0);
        const currentRadius = emberRadii[i] * (1.0 - (heightRatio * 0.6 * charge));
        
        positions[i*3] = Math.cos(emberAngles[i]) * currentRadius;
        positions[i*3+2] = Math.sin(emberAngles[i]) * currentRadius;
        
        if (positions[i*3+1] > 3.0) {
          positions[i*3+1] = -0.2; 
          emberRadii[i] = 0.2 + Math.random() * 2.0;
        }
      }
      embers.geometry.attributes.position.needsUpdate = true;
      emberMat.opacity = 0.3 + charge * 0.7;

      // 3. STOPPING THE SLASHES AT MAX CHARGE
      // Jese hi charge 90% (0.9) se upar jayega, slashes freeze/fade ho jayenge
      let slashVisibility = 1.0;
      if (charge > 0.85) {
        slashVisibility = Math.max(0, 1.0 - ((charge - 0.85) * 6.66)); // Fades out completely by 1.0
      }

      slashes.forEach(s => {
        // Slashes tabhi aage badhengi jab wo visible hon
        if (slashVisibility > 0.01) {
          s.lifetime += s.speed * powerMultiplier;
          
          if (s.lifetime > 100) {
            s.lifetime = 0;
            s.mesh.position.set(
              (Math.random() - 0.5) * 4.0, 
              Math.random() * 3.0,
              (Math.random() - 0.5) * 3.0
            );
            s.mesh.rotation.set(
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2
            );
            
            const scaleLen = s.baseScale * (1.0 + Math.random() * 2.0) * (1 + charge * 2.0);
            s.mesh.scale.set(scaleLen, 1 + Math.pow(charge, 3) * 4.0, 1);
            
            const isWhite = Math.random() > (0.9 - charge * 0.4); 
            s.mesh.material.color.setHex(isWhite ? 0xffffff : 0xff0000);
          }
          
          s.mesh.translateX(0.1 * powerMultiplier * charge);
        }

        // Opacity combines basic fade with the max-charge fadeout
        if (s.lifetime < 10) {
          s.mesh.material.opacity = (s.lifetime / 10) * charge * 1.5 * slashVisibility;
        } else {
          s.mesh.material.opacity = Math.max(0, (1 - (s.lifetime - 10) / 30)) * charge * 1.5 * slashVisibility;
        }
      });

      // Lighting
      const pulse = 1 + Math.sin(pulseTime * 10) * 0.15;
      mainEye.scale.set(pulse, pulse, pulse);
      pointLight.intensity = (3.0 + Math.sin(pulseTime * 20) * 4.0) * charge;
      
      if (charge > 0.8 && Math.random() > 0.8 && slashVisibility > 0) {
        flashLight.intensity = Math.random() * 20.0 * charge;
      } else {
        flashLight.intensity -= 1.0; 
        if (flashLight.intensity < 0) flashLight.intensity = 0;
      }
    },
    setColor: (hex) => {
      // Domain remains deep crimson blood red
    },
    getParticleCount: () => emberCount + slashCount
  };
}
