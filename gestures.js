/**
 * gestures.js — Modular Gesture Registry & Mudra Classifier
 * MediaPipe Hands 21-landmark analysis for all 7 Jutsus
 */

// ─── Landmark indices ───────────────────────────────────────────────
const WRIST = 0;
const THUMB_CMC=1, THUMB_MCP=2, THUMB_IP=3, THUMB_TIP=4;
const INDEX_MCP=5, INDEX_PIP=6, INDEX_DIP=7, INDEX_TIP=8;
const MIDDLE_MCP=9, MIDDLE_PIP=10, MIDDLE_DIP=11, MIDDLE_TIP=12;
const RING_MCP=13, RING_PIP=14, RING_DIP=15, RING_TIP=16;
const PINKY_MCP=17, PINKY_PIP=18, PINKY_DIP=19, PINKY_TIP=20;

// ─── Helpers ────────────────────────────────────────────────────────

/** Returns true if finger TIP is extended above PIP (y-axis, smaller = higher in image) */
function isFingerExtended(lm, tipIdx, pipIdx) {
  return lm[tipIdx].y < lm[pipIdx].y - 0.02;
}

/** Returns true if finger TIP is folded: tip y is BELOW mcp y */
function isFingerFolded(lm, tipIdx, mcpIdx) {
  return lm[tipIdx].y > lm[mcpIdx].y + 0.01;
}

/** Euclidean distance between two landmarks */
function dist(a, b) {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
}

/** Angle in degrees between vectors BA and BC */
function angleBetween(A, B, C) {
  const ba = { x: A.x-B.x, y: A.y-B.y };
  const bc = { x: C.x-B.x, y: C.y-B.y };
  const dot = ba.x*bc.x + ba.y*bc.y;
  const mag = Math.sqrt(ba.x**2+ba.y**2) * Math.sqrt(bc.x**2+bc.y**2);
  if (mag === 0) return 0;
  return Math.acos(Math.min(1, Math.max(-1, dot/mag))) * (180/Math.PI);
}

/** Returns true if index and middle finger are crossed (tip order swapped relative to knuckles) */
function isFingersCrossed(lm) {
  const dx_knuckle = lm[INDEX_MCP].x - lm[MIDDLE_MCP].x;
  const dy_knuckle = lm[INDEX_MCP].y - lm[MIDDLE_MCP].y;
  
  const dx_tip = lm[INDEX_TIP].x - lm[MIDDLE_TIP].x;
  const dy_tip = lm[INDEX_TIP].y - lm[MIDDLE_TIP].y;
  
  const dot = dx_knuckle * dx_tip + dy_knuckle * dy_tip;
  return dot < 0.0;
}

// ─── Gesture Detector Functions ─────────────────────────────────────

/**
 * 🌀 RASENGAN — Open Palm
 * All 5 fingers fully extended, hand facing camera
 */
function detectRasengan(hands) {
  const lm = hands[0];
  const thumb = lm[THUMB_TIP].x < lm[THUMB_MCP].x - 0.03 || lm[THUMB_TIP].x > lm[THUMB_MCP].x + 0.03;
  const index  = isFingerExtended(lm, INDEX_TIP, INDEX_PIP);
  const middle = isFingerExtended(lm, MIDDLE_TIP, MIDDLE_PIP);
  const ring   = isFingerExtended(lm, RING_TIP, RING_PIP);
  const pinky  = isFingerExtended(lm, PINKY_TIP, PINKY_PIP);
  return (index && middle && ring && pinky) ? 1.0 : 0.0;
}

/**
 * ⚡ CHIDORI — Closed Fist
 * All 4 fingers tightly folded
 */
function detectChidori(hands) {
  const lm = hands[0];
  const index  = isFingerFolded(lm, INDEX_TIP, INDEX_MCP);
  const middle = isFingerFolded(lm, MIDDLE_TIP, MIDDLE_MCP);
  const ring   = isFingerFolded(lm, RING_TIP, RING_MCP);
  const pinky  = isFingerFolded(lm, PINKY_TIP, PINKY_MCP);
  // Also make sure it's not too open (Rasengan-like)
  const notOpen = !isFingerExtended(lm, INDEX_TIP, INDEX_PIP) && !isFingerExtended(lm, MIDDLE_TIP, MIDDLE_PIP);
  return (index && middle && ring && pinky && notOpen) ? 1.0 : 0.0;
}

/**
 * 🔥 KATON — Tiger Mudra
 * Index + middle fingers extended, ring + pinky folded
 */
function detectKaton(hands) {
  const lm = hands[0];
  const index  = isFingerExtended(lm, INDEX_TIP, INDEX_PIP);
  const middle = isFingerExtended(lm, MIDDLE_TIP, MIDDLE_PIP);
  const ring   = isFingerFolded(lm, RING_TIP, RING_MCP);
  const pinky  = isFingerFolded(lm, PINKY_TIP, PINKY_MCP);
  // Index and middle should be close together (not spread like a V)
  const spread = Math.abs(lm[INDEX_TIP].x - lm[MIDDLE_TIP].x);
  const together = spread < 0.06;
  return (index && middle && ring && pinky && together) ? 1.0 : 0.0;
}

/**
 * 🔮 GOJO DOMAIN — Crossed Fingers (Middle over Index)
 * Middle finger tip is to the side of/over index finger
 */
function detectGojoDomain(hands) {
  if (hands.length < 2) return 0.0;
  
  const checkHandCrossed = (lm) => {
    // Both index and middle extended, ring and pinky folded
    const indexExt = isFingerExtended(lm, INDEX_TIP, INDEX_PIP);
    const middleExt = isFingerExtended(lm, MIDDLE_TIP, MIDDLE_PIP);
    const ringFold = isFingerFolded(lm, RING_TIP, RING_MCP);
    const pinkyFold = isFingerFolded(lm, PINKY_TIP, PINKY_MCP);
    
    // Middle finger crosses over index finger (using robust dot product check)
    const crossed = isFingersCrossed(lm);
                    
    return indexExt && middleExt && ringFold && pinkyFold && crossed;
  };

  // Symmetrical: both hands must cross their middle over index fingers
  if (checkHandCrossed(hands[0]) && checkHandCrossed(hands[1])) {
    return 1.0;
  }
  return 0.0;
}

/**
 * 💀 SUKUNA DOMAIN — Enmaten Mudra (Two hands inclined together)
 * Both hands must be present, palms facing each other, fingers pointing up, and NOT crossed.
 */
function detectSukunaDomain(hands) {
  if (hands.length < 2) return 0.0;
  
  const lm1 = hands[0];
  const lm2 = hands[1];
  
  const wristDist = dist(lm1[WRIST], lm2[WRIST]);
  const indexDist = dist(lm1[INDEX_TIP], lm2[INDEX_TIP]);
  const middleDist = dist(lm1[MIDDLE_TIP], lm2[MIDDLE_TIP]);
  
  // Both hands pointing upwards
  const h1_up = lm1[INDEX_TIP].y < lm1[INDEX_MCP].y && lm1[MIDDLE_TIP].y < lm1[MIDDLE_MCP].y;
  const h2_up = lm2[INDEX_TIP].y < lm2[INDEX_MCP].y && lm2[MIDDLE_TIP].y < lm2[MIDDLE_MCP].y;
  
  // Verify fingers are NOT crossed to prevent collision with Gojo's gesture
  const h1_crossed = isFingersCrossed(lm1);
  const h2_crossed = isFingersCrossed(lm2);
  
  // In Enmaten Mudra, wrists are close, index/middle tips are touching or close, palms inclined
  if (h1_up && h2_up && !h1_crossed && !h2_crossed && indexDist < 0.20 && middleDist < 0.20 && wristDist < 0.32) {
    return 1.0;
  }
  return 0.0;
}

/**
 * ❤️ HEART JUTSU — Heart Sanctuary Mudra (2 Hands ONLY)
 * Thumbs touch at tips, index fingers touch at tips forming the arch, wrists slightly separated.
 */
function detectHeart(hands) {
  if (hands.length < 2) return 0.0;
  
  const lm1 = hands[0];
  const lm2 = hands[1];
  
  const indexDist = dist(lm1[INDEX_TIP], lm2[INDEX_TIP]);
  const thumbDist = dist(lm1[THUMB_TIP], lm2[THUMB_TIP]);
  const wristDist = dist(lm1[WRIST], lm2[WRIST]);
  
  // Both index and thumbs must touch to form the premium heart loop, with wrists close but separated
  if (indexDist < 0.16 && thumbDist < 0.16 && wristDist > 0.10 && wristDist < 0.35) {
    return 1.0;
  }
  
  return 0.0;
}

/**
 * 💨 TELEPORTATION / SHUNSHIN — Joined Closed Fists (Smoke Screen)
 * Both hands must be closed fists and brought very close together (touching).
 */
function detectTeleport(hands) {
  if (hands.length < 2) return 0.0;
  
  const lm1 = hands[0];
  const lm2 = hands[1];
  
  const checkFist = (lm) => {
    const index  = isFingerFolded(lm, INDEX_TIP, INDEX_MCP);
    const middle = isFingerFolded(lm, MIDDLE_TIP, MIDDLE_MCP);
    const ring   = isFingerFolded(lm, RING_TIP, RING_MCP);
    const pinky  = isFingerFolded(lm, PINKY_TIP, PINKY_MCP);
    const notOpen = !isFingerExtended(lm, INDEX_TIP, INDEX_PIP);
    return index && middle && ring && pinky && notOpen;
  };
  
  if (!checkFist(lm1) || !checkFist(lm2)) return 0.0;
  
  const wristDist = dist(lm1[WRIST], lm2[WRIST]);
  const knuckleDist = dist(lm1[INDEX_MCP], lm2[INDEX_MCP]);
  
  // Touching fists: knuckle distance is very small
  if (knuckleDist < 0.18 || wristDist < 0.22) {
    return 1.0;
  }
  return 0.0;
}

/**
 * 🟣 HOLLOW PURPLE — Pinch Forward
 * Thumb & index tip very close together, forming a pinch; other fingers folded
 */
function detectHollowPurple(hands) {
  const lm = hands[0];
  const pinchDist = dist(lm[THUMB_TIP], lm[INDEX_TIP]);
  const pinching  = pinchDist < 0.06;
  const middleFolded = isFingerFolded(lm, MIDDLE_TIP, MIDDLE_MCP);
  const ringFolded   = isFingerFolded(lm, RING_TIP, RING_MCP);
  const pinkyFolded  = isFingerFolded(lm, PINKY_TIP, PINKY_MCP);
  return (pinching && middleFolded && ringFolded && pinkyFolded) ? 1.0 : 0.0;
}

/**
 * 🐺 WOLVERINE CLAWS — Knuckle Fist (facing camera)
 * All fingers folded down tightly, wrist is horizontal
 */
function detectWolverine(hands) {
  const lm = hands[0];
  const index  = isFingerFolded(lm, INDEX_TIP, INDEX_MCP);
  const middle = isFingerFolded(lm, MIDDLE_TIP, MIDDLE_MCP);
  const ring   = isFingerFolded(lm, RING_TIP, RING_MCP);
  const pinky  = isFingerFolded(lm, PINKY_TIP, PINKY_MCP);
  // Knuckles (MCPs) should be roughly horizontal — visible and spread
  const knuckleSpread = Math.abs(lm[INDEX_MCP].x - lm[PINKY_MCP].x) > 0.1;
  // Make sure it's NOT Chidori (overlap): Wolverine needs knuckle spread
  return (index && middle && ring && pinky && knuckleSpread) ? 1.0 : 0.0;
}

// ─── Registry ────────────────────────────────────────────────────────

/**
 * All gestures in priority order (most specific first to avoid collisions)
 * Each entry: { id, detect, label, series, manualSteps, tip, poseType }
 */
export const GESTURE_REGISTRY = [
  {
    id: 'teleport',
    detect: detectTeleport,
    label: 'Body Flicker',
    series: 'Shunshin · Teleportation',
    icon: '💨',
    color: '#90caf9',
    poseType: 'fist-touching',
    tip: '💡 Form tight fists with BOTH hands and press them together knuckle-to-knuckle to unleash a smoke screen and teleport!',
    manualSteps: [
      'Make tight closed fists with BOTH hands.',
      'Bring both fists close to your chest.',
      'Touch your knuckles or wrists together tightly.',
      'Hold the touch to charge the smoke screen!',
    ],
  },
  {
    id: 'heart',
    detect: detectHeart,
    label: 'Heart Sanctuary',
    series: 'Mudra · Lover\'s Domain',
    icon: '💖',
    color: '#ff2c7d',
    poseType: 'heart-shape',
    tip: '💡 Form a heart shape using BOTH hands: touch your thumb tips together and your index tips together, curving other fingers down.',
    manualSteps: [
      'Bring both hands together in front of your chest.',
      'Touch your THUMB TIPS together.',
      'Touch your INDEX TIPS together to form the heart arch.',
      'Curve other fingers down to form a premium glowing heart loop.',
    ],
  },
  {
    id: 'hollow',
    detect: detectHollowPurple,
    label: 'Hollow Purple',
    series: 'JJK · Gojo Satoru',
    icon: '🟣',
    color: '#bd00ff',
    poseType: 'pinch',
    tip: '💡 Bring your thumb and index finger together like pinching a grape, and point them toward the camera.',
    manualSteps: [
      'Raise your dominant hand toward the camera.',
      'Touch your THUMB TIP to your INDEX FINGER TIP tightly.',
      'Fold your middle, ring, and pinky fingers into your palm.',
      'Point the pinch at the camera and hold still.',
    ],
  },
  {
    id: 'gojo',
    detect: detectGojoDomain,
    label: 'Infinite Void',
    series: 'JJK · Gojo Satoru',
    icon: '🔮',
    color: '#00f0ff',
    poseType: 'crossed',
    tip: '💡 Double Crossed fingers: Cross the middle finger OVER the index finger on BOTH hands simultaneously.',
    manualSteps: [
      'Raise BOTH hands toward the camera.',
      'Extend the INDEX and MIDDLE fingers on both hands.',
      'Cross the MIDDLE finger over the INDEX finger on both hands.',
      'Fold the ring and pinky fingers on both hands into your palms.',
    ],
  },
  {
    id: 'sukuna',
    detect: detectSukunaDomain,
    label: 'Malevolent Shrine',
    series: 'JJK · Ryomen Sukuna',
    icon: '💀',
    color: '#ff1744',
    poseType: 'claw',
    tip: '💡 Bring BOTH hands together (Enmaten Mudra). Palms face each other, index/middle fingers straight up (NOT crossed).',
    manualSteps: [
      'Raise BOTH hands toward the camera.',
      'Bring your hands close together, wrists nearly touching.',
      'Incline your palms toward each other as if praying or holding a sphere.',
      'Keep your index and middle fingers pointing straight up (make sure they are NOT crossed).',
      'Hold the two-handed mudra steady to cast the domain!',
    ],
  },
  {
    id: 'katon',
    detect: detectKaton,
    label: 'Katon: Great Fireball',
    series: 'Naruto · Uchiha Madara',
    icon: '🔥',
    color: '#ff6b00',
    poseType: 'tiger',
    tip: '💡 Point only your index and middle fingers together upward. Keep them together, not spread like a "V".',
    manualSteps: [
      'Raise your hand toward the camera.',
      'Extend your INDEX and MIDDLE fingers straight upward together.',
      'Keep them close side by side (not spread apart).',
      'Fold your RING and PINKY fingers into your palm.',
      'Hold steady — the fire will erupt from your fingertips!',
    ],
  },
  {
    id: 'wolverine',
    detect: detectWolverine,
    label: 'Adamantium Claws',
    series: 'Marvel · Wolverine',
    icon: '🐺',
    color: '#c0c0c0',
    poseType: 'fist-knuckle',
    tip: '💡 Make a tight fist with your knuckles facing the camera. Keep your hand horizontal and show all four knuckles clearly.',
    manualSteps: [
      'Make a solid tight fist with your hand.',
      'Rotate your fist so the KNUCKLES face directly toward the camera.',
      'Keep your hand horizontal — all 4 knuckles visible.',
      'Hold firm — adamantium blades will extend from each knuckle!',
    ],
  },
  {
    id: 'chidori',
    detect: detectChidori,
    label: 'Chidori',
    series: 'Naruto · Uchiha Sasuke',
    icon: '⚡',
    color: '#00cfff',
    poseType: 'fist',
    tip: '💡 Make a closed fist with your palm facing either left or right (not toward camera). All 4 fingers folded.',
    manualSteps: [
      'Curl all 4 fingers tightly into your palm.',
      'Wrap your thumb over your fingers gently.',
      'Point your fist sideways or slightly away from camera.',
      'Hold still — lightning will crackle around your hand!',
    ],
  },
  {
    id: 'rasengan',
    detect: detectRasengan,
    label: 'Rasengan',
    series: 'Naruto · Uzumaki Naruto',
    icon: '🌀',
    color: '#4fc3f7',
    poseType: 'open-palm',
    tip: '💡 Open your palm fully and spread all 5 fingers outward, facing the camera.',
    manualSteps: [
      'Raise your hand toward the camera.',
      'Open your palm fully and spread all 5 fingers wide.',
      'Face your palm directly toward the camera.',
      'Hold steady — the Rasengan will form in your palm!',
    ],
  },
];

// ─── Classifier ──────────────────────────────────────────────────────

/** Smoothing state */
const smoothState = { current: null, confidence: 0 };
const HOLD_THRESHOLD = 0.5; // frames (smoothing factor)

/**
 * Classify gesture from MediaPipe hand landmarks array (supports 1 or 2 hands).
 * Returns { id, label, charge } or null if nothing detected.
 */
export function classifyGesture(multiHandLandmarks) {
  if (!multiHandLandmarks || multiHandLandmarks.length === 0) return null;

  for (const g of GESTURE_REGISTRY) {
    const score = g.detect(multiHandLandmarks);
    if (score > 0.5) {
      if (smoothState.current === g.id) {
        smoothState.confidence = Math.min(1, smoothState.confidence + 0.08);
      } else {
        smoothState.current = g.id;
        smoothState.confidence = 0.1;
      }
      return { ...g, charge: smoothState.confidence };
    }
  }
  // No gesture matched — decay
  smoothState.confidence = Math.max(0, smoothState.confidence - 0.1);
  if (smoothState.confidence < 0.05) smoothState.current = null;
  return null;
}

/**
 * Get palm center position in normalized coords from landmarks.
 */
export function getPalmCenter(landmarks) {
  const palm = [landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]];
  const x = palm.reduce((s,p) => s+p.x, 0) / palm.length;
  const y = palm.reduce((s,p) => s+p.y, 0) / palm.length;
  const z = palm.reduce((s,p) => s+p.z, 0) / palm.length;
  return { x, y, z };
}
