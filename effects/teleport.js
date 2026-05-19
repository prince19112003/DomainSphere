/**
 * effects/teleport.js — Body Flicker (Shunshin) Teleportation Smoke Screen
 * Dynamic expanding smoke screen burst when two fists are joined.
 */
export function createTeleport(T) {
  const group = new T.Group();

  // Create a soft radial gradient canvas for smoke particles texture
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.3, 'rgba(230, 245, 255, 0.85)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const smokeTexture = new T.CanvasTexture(canvas);

  // 1. Central Billowing Smoke Puff Cloud (Larger soft meshes)
  const smokePuffCount = 35;
  const smokePuffs = [];
  const smokeGroup = new T.Group();

  for (let i = 0; i < smokePuffCount; i++) {
    const geom = new T.PlaneGeometry(0.5, 0.5);
    const mat = new T.MeshBasicMaterial({
      map: smokeTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: T.NormalBlending, // Normal blending for opaque smoke screen feel
      color: 0x8899a6 // Default ninja smoke color (cloudy gray)
    });
    const mesh = new T.Mesh(geom, mat);

    // Randomize initial offsets and rotations
    mesh.position.set(
      (Math.random() - 0.5) * 0.15,
      (Math.random() - 0.5) * 0.15,
      (Math.random() - 0.5) * 0.1
    );
    mesh.rotation.z = Math.random() * Math.PI * 2;
    
    // Store movement characteristics
    mesh.userData = {
      vx: (Math.random() - 0.5) * 0.012,
      vy: 0.005 + Math.random() * 0.015, // float upward
      vz: (Math.random() - 0.5) * 0.012,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      baseScale: 0.8 + Math.random() * 1.5,
      delay: Math.random() * 0.15
    };

    smokeGroup.add(mesh);
    smokePuffs.push(mesh);
  }
  group.add(smokeGroup);

  // 2. High-speed Sparkles/Debris (Embers escaping the burst)
  const sparkCount = 100;
  const sparkGeo = new T.BufferGeometry();
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkVel = [];

  for (let i = 0; i < sparkCount; i++) {
    sparkPos[i * 3] = 0;
    sparkPos[i * 3 + 1] = 0;
    sparkPos[i * 3 + 2] = 0;

    sparkVel.push({
      vx: (Math.random() - 0.5) * 0.04,
      vy: (Math.random() - 0.5) * 0.04,
      vz: (Math.random() - 0.5) * 0.04,
      life: 0.5 + Math.random() * 0.5
    });
  }

  sparkGeo.setAttribute('position', new T.BufferAttribute(sparkPos, 3));
  const sparkMat = new T.PointsMaterial({
    color: 0x90caf9, // Glowing chakra teal
    size: 0.015,
    transparent: true,
    opacity: 0,
    blending: T.AdditiveBlending,
    depthWrite: false
  });
  const sparks = new T.Points(sparkGeo, sparkMat);
  group.add(sparks);

  let currentAuraColor = 0x8899a6;
  let chargePulse = 0;

  return {
    group,
    update: (time, charge) => {
      // Dynamic scaling: smoke expands as charge grows
      const targetScale = 0.4 + charge * 2.8;
      group.scale.set(targetScale, targetScale, targetScale);

      // Animate smoke puffs
      smokePuffs.forEach((puff) => {
        const ud = puff.userData;
        
        // Expand and float upward
        puff.position.x += ud.vx * (0.3 + charge * 1.2);
        puff.position.y += ud.vy * (0.3 + charge * 1.2);
        puff.position.z += ud.vz * (0.3 + charge * 1.2);
        puff.rotation.z += ud.rotSpeed;

        // Scale puff size
        const currentScale = ud.baseScale * (1.0 + charge * 2.0);
        puff.scale.set(currentScale, currentScale, 1);

        // Opacity: fade in and then out
        let op = charge * 0.95;
        if (charge > 0.85) {
          // At peak trigger, puff spreads and thins out slightly
          op = (1.0 - (charge - 0.85) / 0.15) * 0.95;
        }
        puff.material.opacity = Math.max(0, op);
      });

      // Animate high-speed debris sparkles
      const pos = sparks.geometry.attributes.position.array;
      for (let i = 0; i < sparkCount; i++) {
        const v = sparkVel[i];
        
        if (charge < 0.1) {
          // Reset when not active
          pos[i * 3] = (Math.random() - 0.5) * 0.05;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
          v.vx = (Math.random() - 0.5) * 0.04;
          v.vy = (Math.random() - 0.5) * 0.04;
          v.vz = (Math.random() - 0.5) * 0.04;
        } else {
          // Fly outward
          pos[i * 3] += v.vx * charge;
          pos[i * 3 + 1] += v.vy * charge;
          pos[i * 3 + 2] += v.vz * charge;
          
          // Add drag
          v.vx *= 0.96;
          v.vy *= 0.96;
          v.vz *= 0.96;
        }
      }
      sparks.geometry.attributes.position.needsUpdate = true;
      sparkMat.opacity = charge * 0.9;
    },
    setColor: (hex) => {
      currentAuraColor = hex;
      // Tint the smoke slightly with the custom color for personalization
      smokePuffs.forEach(puff => {
        puff.material.color.set(hex);
      });
      sparkMat.color.set(hex);
    },
    getParticleCount: () => smokePuffCount + sparkCount
  };
}
