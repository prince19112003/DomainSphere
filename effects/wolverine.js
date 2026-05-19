/**
 * effects/wolverine.js — Wolverine Adamantium Claw Extension
 * Marvel · Wolverine (Logan)
 */
export function createWolverine(THREE) {
  const group = new THREE.Group();

  // 3 claw blades extending from knuckles
  const clawGroup = new THREE.Group();
  const claws = [];
  const CLAW_OFFSETS = [-0.055, 0, 0.055]; // left, center, right knuckles

  CLAW_OFFSETS.forEach((xOffset, i) => {
    // Blade geometry: tapered box (wide base, sharp tip)
    const geo = new THREE.CylinderGeometry(0.004, 0.012, 0.24, 6, 1);
    geo.rotateX(Math.PI / 2); // point it forward (Z axis)
    const mat = new THREE.MeshBasicMaterial({ color: 0xd0d8e8, transparent: false });
    const blade = new THREE.Mesh(geo, mat);

    // Edge highlights — thin lines along blade edges
    const edgeGeo = new THREE.BufferGeometry();
    const edgePts = new Float32Array([0, 0, 0, 0, 0, 0.24]);
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePts, 3));
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    const edge = new THREE.Line(edgeGeo, edgeMat);

    const clawObj = new THREE.Group();
    clawObj.add(blade);
    clawObj.add(edge);
    clawObj.position.set(xOffset, 0.01, 0);
    clawObj.userData.extended = false;
    clawObj.userData.targetZ = 0.0; // blade extension in Z
    clawObj.userData.idx = i;
    clawGroup.add(clawObj);
    claws.push(clawObj);
  });
  group.add(clawGroup);

  // Metallic friction sparks flying forward/outward
  const SPARK_COUNT = 80;
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(SPARK_COUNT * 3);
  const sparkVel = [];
  for (let i = 0; i < SPARK_COUNT; i++) {
    sparkPos[i*3] = CLAW_OFFSETS[i % 3] + (Math.random()-0.5)*0.02;
    sparkPos[i*3+1] = (Math.random()-0.5)*0.02;
    sparkPos[i*3+2] = 0.1 + Math.random()*0.12;
    sparkVel.push({
      vx: (Math.random()-0.5)*0.008,
      vy: (Math.random()-0.5)*0.008 + 0.002,
      vz: 0.006 + Math.random()*0.012,
      life: Math.random(),
    });
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({ color: 0xff8800, size: 0.009, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  group.add(new THREE.Points(sparkGeo, sparkMat));

  // Metallic glint flare at blade tips
  const glintGeo = new THREE.BufferGeometry();
  const glintPos = new Float32Array(CLAW_OFFSETS.length * 3);
  CLAW_OFFSETS.forEach((xOff, i) => { glintPos[i*3] = xOff; glintPos[i*3+1] = 0; glintPos[i*3+2] = 0.24; });
  glintGeo.setAttribute('position', new THREE.BufferAttribute(glintPos, 3));
  const glintMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0 });
  group.add(new THREE.Points(glintGeo, glintMat));

  let extended = false;
  let extendProgress = 0;

  return {
    group,
    update(time, charge) {
      const t = time * 0.001;
      group.scale.setScalar(0.7 + charge * 1.3);

      // Extend claws as charge increases
      extendProgress += (charge - extendProgress) * 0.08;
      claws.forEach((claw, i) => {
        // Stagger extension — index first, then middle, then pinky
        const delay = i * 0.1;
        const localCharge = Math.max(0, extendProgress - delay);
        // Move blade forward (positive Z = toward camera)
        claw.position.z = -0.12 * (1 - localCharge); // slides out from knuckle
        claw.children[0].material.color.setHSL(0.58, 0.05, 0.75 + Math.sin(t*8+i)*0.08);
      });

      // Sparks fly when charge > 0.5
      for (let i = 0; i < SPARK_COUNT; i++) {
        const v = sparkVel[i];
        v.life -= 0.035;
        if (v.life <= 0 || charge < 0.4) {
          sparkPos[i*3]   = CLAW_OFFSETS[i%3] + (Math.random()-0.5)*0.015;
          sparkPos[i*3+1] = (Math.random()-0.5)*0.015;
          sparkPos[i*3+2] = 0.08 + Math.random()*0.1;
          v.vx = (Math.random()-0.5)*0.01;
          v.vy = Math.random()*0.01;
          v.vz = 0.008 + Math.random()*0.015;
          v.life = 0.3 + Math.random()*0.7;
        } else {
          sparkPos[i*3]   += v.vx;
          sparkPos[i*3+1] += v.vy;
          sparkPos[i*3+2] += v.vz;
          v.vy -= 0.0002; // slight gravity
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkMat.opacity = Math.max(0, charge - 0.4) * 0.9;

      // Tip glints flash periodically
      glintMat.opacity = charge * 0.6 * (0.5 + Math.abs(Math.sin(t*15))*0.5);
    },
    setColor(hex) {
      claws.forEach(c => c.children[0].material.color.set(hex));
    },
    getParticleCount() { return SPARK_COUNT + 3; },
  };
}
