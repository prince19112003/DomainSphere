/**
 * effects/teleport.js — Anime-Style Black Smoke Teleportation with Slash Vanish
 * Epic swirling black smoke that engulfs, then disappears with a lightning-fast slash
 */
export function createTeleport(T) {
  const group = new T.Group();

  // ═══════════════════════════════════════════════════════════════
  // TEXTURE GENERATION - High-quality smoke and energy textures
  // ═══════════════════════════════════════════════════════════════
  
  // Dense black smoke texture
  const createSmokeTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(20, 20, 25, 1)');
    grad.addColorStop(0.4, 'rgba(15, 15, 20, 0.9)');
    grad.addColorStop(0.7, 'rgba(10, 10, 15, 0.6)');
    grad.addColorStop(1, 'rgba(5, 5, 10, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    
    return new T.CanvasTexture(canvas);
  };

  // Sharp energy streak texture for slash effect
  const createStreakTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, 'rgba(200, 220, 255, 0)');
    grad.addColorStop(0.1, 'rgba(180, 200, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.9, 'rgba(180, 200, 255, 1)');
    grad.addColorStop(1, 'rgba(200, 220, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 16);
    
    return new T.CanvasTexture(canvas);
  };

  const smokeTexture = createSmokeTexture();
  const streakTexture = createStreakTexture();

  // ═══════════════════════════════════════════════════════════════
  // LAYER 1: SWIRLING BLACK SMOKE VORTEX
  // ═══════════════════════════════════════════════════════════════
  
  const vortexPuffCount = 60;
  const vortexPuffs = [];
  const vortexGroup = new T.Group();

  for (let i = 0; i < vortexPuffCount; i++) {
    const geom = new T.PlaneGeometry(1.2, 1.2);
    const mat = new T.MeshBasicMaterial({
      map: smokeTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: T.NormalBlending,
      color: 0x0a0a0f,
      side: T.DoubleSide
    });
    const mesh = new T.Mesh(geom, mat);

    // Position in spiral formation
    const angle = (i / vortexPuffCount) * Math.PI * 4;
    const radius = 0.1 + (i / vortexPuffCount) * 0.4;
    
    mesh.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 0.2,
      Math.sin(angle) * radius
    );
    mesh.rotation.z = angle + Math.random() * 0.5;
    
    mesh.userData = {
      angle,
      baseRadius: radius,
      orbitSpeed: 0.08 + Math.random() * 0.04,
      riseSpeed: 0.008 + Math.random() * 0.012,
      rotSpeed: (Math.random() - 0.5) * 0.06,
      baseScale: 0.6 + Math.random() * 1.8,
      layer: i / vortexPuffCount, // 0 to 1, for timing
      turbulence: (Math.random() - 0.5) * 0.02
    };

    vortexGroup.add(mesh);
    vortexPuffs.push(mesh);
  }
  group.add(vortexGroup);

  // ═══════════════════════════════════════════════════════════════
  // LAYER 2: INNER DARK CORE (Dense center)
  // ═══════════════════════════════════════════════════════════════
  
  const coreCount = 25;
  const corePuffs = [];
  const coreGroup = new T.Group();

  for (let i = 0; i < coreCount; i++) {
    const geom = new T.PlaneGeometry(0.8, 0.8);
    const mat = new T.MeshBasicMaterial({
      map: smokeTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: T.NormalBlending,
      color: 0x000000,
      side: T.DoubleSide
    });
    const mesh = new T.Mesh(geom, mat);

    mesh.position.set(
      (Math.random() - 0.5) * 0.15,
      (Math.random() - 0.5) * 0.15,
      (Math.random() - 0.5) * 0.15
    );
    mesh.rotation.z = Math.random() * Math.PI * 2;
    
    mesh.userData = {
      vx: (Math.random() - 0.5) * 0.005,
      vy: (Math.random() - 0.5) * 0.005,
      vz: (Math.random() - 0.5) * 0.005,
      rotSpeed: (Math.random() - 0.5) * 0.08,
      baseScale: 1.2 + Math.random() * 0.8,
      pulseOffset: Math.random() * Math.PI * 2
    };

    coreGroup.add(mesh);
    corePuffs.push(mesh);
  }
  group.add(coreGroup);

  // ═══════════════════════════════════════════════════════════════
  // LAYER 3: FAST DARK PARTICLES (Swirling debris)
  // ═══════════════════════════════════════════════════════════════
  
  const darkParticleCount = 200;
  const darkGeo = new T.BufferGeometry();
  const darkPos = new Float32Array(darkParticleCount * 3);
  const darkVel = [];

  for (let i = 0; i < darkParticleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.3;
    
    darkPos[i * 3] = Math.cos(angle) * radius;
    darkPos[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
    darkPos[i * 3 + 2] = Math.sin(angle) * radius;

    const orbitSpeed = 0.02 + Math.random() * 0.03;
    darkVel.push({
      angle,
      radius,
      orbitSpeed,
      riseSpeed: (Math.random() - 0.5) * 0.008,
      spiralSpeed: 0.01 + Math.random() * 0.02
    });
  }

  darkGeo.setAttribute('position', new T.BufferAttribute(darkPos, 3));
  const darkMat = new T.PointsMaterial({
    color: 0x1a1a2e,
    size: 0.012,
    transparent: true,
    opacity: 0,
    blending: T.NormalBlending,
    depthWrite: false
  });
  const darkParticles = new T.Points(darkGeo, darkMat);
  group.add(darkParticles);

  // ═══════════════════════════════════════════════════════════════
  // LAYER 4: ELECTRIC CHAKRA SPARKS (Blue energy hints)
  // ═══════════════════════════════════════════════════════════════
  
  const sparkCount = 80;
  const sparkGeo = new T.BufferGeometry();
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkVel = [];

  for (let i = 0; i < sparkCount; i++) {
    sparkPos[i * 3] = 0;
    sparkPos[i * 3 + 1] = 0;
    sparkPos[i * 3 + 2] = 0;

    sparkVel.push({
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
      vz: (Math.random() - 0.5) * 0.06,
      life: Math.random()
    });
  }

  sparkGeo.setAttribute('position', new T.BufferAttribute(sparkPos, 3));
  const sparkMat = new T.PointsMaterial({
    color: 0x4a9eff,
    size: 0.02,
    transparent: true,
    opacity: 0,
    blending: T.AdditiveBlending,
    depthWrite: false
  });
  const sparks = new T.Points(sparkGeo, sparkMat);
  group.add(sparks);

  // ═══════════════════════════════════════════════════════════════
  // LAYER 5: THE SLASH - Lightning-fast disappearance streak
  // ═══════════════════════════════════════════════════════════════
  
  const slashCount = 12;
  const slashes = [];
  const slashGroup = new T.Group();

  for (let i = 0; i < slashCount; i++) {
    const geom = new T.PlaneGeometry(3.5, 0.08);
    const mat = new T.MeshBasicMaterial({
      map: streakTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: T.AdditiveBlending,
      color: 0xffffff,
      side: T.DoubleSide
    });
    const mesh = new T.Mesh(geom, mat);

    // Diagonal slash angle
    const baseAngle = Math.PI * 0.25; // 45 degrees
    mesh.rotation.z = baseAngle + (Math.random() - 0.5) * 0.3;
    mesh.position.set(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      i * 0.01 - 0.05
    );
    
    mesh.userData = {
      delay: i * 0.008, // Stagger the slashes slightly
      baseScale: 0.8 + Math.random() * 0.4
    };

    slashGroup.add(mesh);
    slashes.push(mesh);
  }
  group.add(slashGroup);

  // ═══════════════════════════════════════════════════════════════
  // LAYER 6: SPEED LINES (Anime motion blur)
  // ═══════════════════════════════════════════════════════════════
  
  const speedLineCount = 20;
  const speedLines = [];
  const speedGroup = new T.Group();

  for (let i = 0; i < speedLineCount; i++) {
    const geom = new T.PlaneGeometry(2.0, 0.02);
    const mat = new T.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: T.AdditiveBlending,
      color: 0x6699ff,
      side: T.DoubleSide
    });
    const mesh = new T.Mesh(geom, mat);

    const angle = (i / speedLineCount) * Math.PI * 2;
    mesh.rotation.z = angle;
    mesh.position.set(0, 0, (Math.random() - 0.5) * 0.1);
    
    mesh.userData = {
      angle,
      delay: i * 0.01
    };

    speedGroup.add(mesh);
    speedLines.push(mesh);
  }
  group.add(speedGroup);

  // ═══════════════════════════════════════════════════════════════
  // ANIMATION STATE
  // ═══════════════════════════════════════════════════════════════
  
  let animTime = 0;
  let slashTriggered = false;

  return {
    group,
    
    update: (time, charge) => {
      animTime += 0.016; // Assume ~60fps
      
      // ═══════════════════════════════════════════════════════
      // PHASE 1: SMOKE BUILD-UP (0.0 - 0.75)
      // ═══════════════════════════════════════════════════════
      
      const buildPhase = Math.min(charge / 0.75, 1.0);
      const targetScale = 0.3 + buildPhase * 3.2;
      group.scale.set(targetScale, targetScale, targetScale);

      // Swirling vortex smoke
      vortexPuffs.forEach((puff, idx) => {
        const ud = puff.userData;
        
        // Spiral motion - speeds up with charge
        ud.angle += ud.orbitSpeed * (1 + charge * 2);
        const currentRadius = ud.baseRadius * (1 + charge * 0.8);
        
        puff.position.x = Math.cos(ud.angle) * currentRadius + Math.sin(animTime * 3 + idx) * ud.turbulence;
        puff.position.y += ud.riseSpeed * (1 + charge);
        puff.position.z = Math.sin(ud.angle) * currentRadius + Math.cos(animTime * 2 + idx) * ud.turbulence;
        
        // Reset height periodically
        if (puff.position.y > 0.5) puff.position.y = -0.3;
        
        puff.rotation.z += ud.rotSpeed * (1 + charge);
        
        // Scale with charge, larger at outer layers
        const layerScale = ud.baseScale * (0.5 + buildPhase * 1.5);
        puff.scale.set(layerScale, layerScale, 1);
        
        // Opacity - fade in during build, dense in middle
        let opacity = buildPhase * 0.85;
        if (charge > 0.5) opacity *= (1 - (charge - 0.5) / 0.5) * 1.5; // Fade slightly before slash
        puff.material.opacity = Math.max(0, Math.min(0.95, opacity));
      });

      // Dense dark core
      corePuffs.forEach((puff, idx) => {
        const ud = puff.userData;
        
        // Slow chaotic drift
        puff.position.x += ud.vx;
        puff.position.y += ud.vy;
        puff.position.z += ud.vz;
        puff.rotation.z += ud.rotSpeed;
        
        // Pulsing scale
        const pulse = Math.sin(animTime * 4 + ud.pulseOffset) * 0.15 + 0.85;
        const coreScale = ud.baseScale * buildPhase * pulse;
        puff.scale.set(coreScale, coreScale, 1);
        
        // Very dark and opaque
        puff.material.opacity = buildPhase * 0.95;
        
        // Keep within bounds
        if (Math.abs(puff.position.x) > 0.3) ud.vx *= -1;
        if (Math.abs(puff.position.y) > 0.3) ud.vy *= -1;
        if (Math.abs(puff.position.z) > 0.3) ud.vz *= -1;
      });

      // Fast swirling dark particles
      const darkPosArray = darkParticles.geometry.attributes.position.array;
      for (let i = 0; i < darkParticleCount; i++) {
        const v = darkVel[i];
        
        v.angle += v.orbitSpeed * (1 + charge * 3);
        v.radius += (Math.random() - 0.5) * 0.002;
        v.radius = Math.max(0.05, Math.min(0.6, v.radius));
        
        darkPosArray[i * 3] = Math.cos(v.angle) * v.radius;
        darkPosArray[i * 3 + 1] += v.riseSpeed;
        darkPosArray[i * 3 + 2] = Math.sin(v.angle) * v.radius;
        
        // Reset height
        if (darkPosArray[i * 3 + 1] > 0.4) darkPosArray[i * 3 + 1] = -0.4;
      }
      darkParticles.geometry.attributes.position.needsUpdate = true;
      darkMat.opacity = buildPhase * 0.7;

      // Electric sparks - burst at high charge
      const sparkPosArray = sparks.geometry.attributes.position.array;
      for (let i = 0; i < sparkCount; i++) {
        const v = sparkVel[i];
        
        if (charge < 0.3) {
          // Reset near center
          sparkPosArray[i * 3] = (Math.random() - 0.5) * 0.08;
          sparkPosArray[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
          sparkPosArray[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
        } else {
          // Burst outward
          sparkPosArray[i * 3] += v.vx * charge * 0.8;
          sparkPosArray[i * 3 + 1] += v.vy * charge * 0.8;
          sparkPosArray[i * 3 + 2] += v.vz * charge * 0.8;
          
          v.vx *= 0.95;
          v.vy *= 0.95;
          v.vz *= 0.95;
        }
      }
      sparks.geometry.attributes.position.needsUpdate = true;
      
      // Sparks appear at mid-charge and fade before slash
      let sparkOp = 0;
      if (charge > 0.3 && charge < 0.8) {
        sparkOp = Math.min((charge - 0.3) / 0.2, (0.8 - charge) / 0.2) * 0.6;
      }
      sparkMat.opacity = sparkOp;

      // ═══════════════════════════════════════════════════════
      // PHASE 2: THE SLASH (0.85+)
      // ═══════════════════════════════════════════════════════
      
      if (charge > 0.85 && !slashTriggered) {
        slashTriggered = true;
      }

      if (charge > 0.85) {
        const slashProgress = Math.min((charge - 0.85) / 0.15, 1.0);
        
        // Lightning-fast slash streaks
        slashes.forEach((slash, idx) => {
          const ud = slash.userData;
          const timing = Math.max(0, slashProgress - ud.delay);
          
          if (timing > 0 && timing < 0.3) {
            // Quick flash in and out
            const flashCurve = Math.sin(timing / 0.3 * Math.PI);
            slash.material.opacity = flashCurve * 0.95;
            slash.scale.x = ud.baseScale * (0.5 + flashCurve * 1.5);
            slash.scale.y = 1;
          } else {
            slash.material.opacity = 0;
          }
        });

        // Radial speed lines burst
        speedLines.forEach((line, idx) => {
          const ud = line.userData;
          const timing = Math.max(0, slashProgress - ud.delay);
          
          if (timing > 0 && timing < 0.25) {
            const burstCurve = timing / 0.25;
            line.material.opacity = (1 - burstCurve) * 0.5;
            line.scale.x = 0.5 + burstCurve * 2.5;
          } else {
            line.material.opacity = 0;
          }
        });

        // Fade out all smoke rapidly during slash
        const smokeFadeOut = 1 - slashProgress;
        vortexPuffs.forEach(puff => {
          puff.material.opacity *= smokeFadeOut;
        });
        corePuffs.forEach(puff => {
          puff.material.opacity *= smokeFadeOut;
        });
        darkMat.opacity *= smokeFadeOut;
        sparkMat.opacity *= smokeFadeOut;
      } else {
        // Reset slash if charge dropped
        if (charge < 0.85 && slashTriggered) {
          slashTriggered = false;
        }
        
        slashes.forEach(slash => slash.material.opacity = 0);
        speedLines.forEach(line => line.material.opacity = 0);
      }
    },
    
    setColor: (hex) => {
      // Allow customization but keep dark theme
      const tintColor = new T.Color(hex).multiplyScalar(0.3); // Darken the tint
      
      vortexPuffs.forEach(puff => {
        puff.material.color.copy(tintColor);
      });
      
      sparkMat.color.set(hex);
      
      speedLines.forEach(line => {
        line.material.color.set(hex);
      });
    },
    
    getParticleCount: () => 
      vortexPuffCount + coreCount + darkParticleCount + sparkCount + slashCount + speedLineCount
  };
}
