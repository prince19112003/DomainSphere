/**
 * app.js — Main Entry Coordinator
 * Orchestrates MediaPipe, webcam, effects, audio, and UI.
 * Camera is NOT activated until user clicks the button.
 */

import { classifyGesture, getPalmCenter, GESTURE_REGISTRY } from './gestures.js';
import { initAudio, startGestureAudio, updateGestureAudio, stopGestureAudio, setAudioEnabled, playUiTick } from './audio.js';
import { EffectsEngine } from './effects/index.js';

// ─── State ──────────────────────────────────────────────────────────
let engine = null;
let hands = null;
let camera = null;
let videoEl = null;
let trackingCanvas = null;
let trackingCtx = null;
let webglCanvas = null;
let pipSkeletonCanvas = null;
let pipSkeletonCtx = null;
let animRunning = false;

let currentGesture = null;
let pendingGesture = null;
let pendingGestureFrames = 0;
const GESTURE_CONFIDENCE_FRAMES = 5;
let chakraColor = '#00f0ff';
let showSkeleton = true;
let soundEnabled = true;
let cameraActive = true;

let lastTime = performance.now();
let frameCount = 0;
let fpsDisplay = null;
let latStart = 0;
let totalParticles = 0;

// FPS smoother
let fpsSmooth = 60;
let resizeCanvasesFn = null;

// ─── DOM references ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── Landing wireframe preview (rotating hand wireframe nodes) ───────
(function initPreview() {
  const canvas = $('preview-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const CX = W/2, CY = H/2;

  // Simplified hand wireframe nodes (5 finger tips + palm base)
  const nodes3D = [
    [0,60,0],    // wrist
    [-55,10,10], [-55,-30,10], [-55,-55,10], [-50,-70,10], // pinky
    [-22,0,10],  [-22,-45,10], [-22,-70,10], [-18,-85,10], // ring
    [5,-5,10],   [5,-52,10],   [5,-78,10],   [5,-95,10],   // middle
    [30,0,10],   [30,-48,10],  [30,-72,10],  [30,-85,10],  // index
    [52,20,10],  [62,0,10],    [65,-15,10],  [58,-25,10],  // thumb
  ];
  const connections = [
    [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
    [0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],
    [0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]
  ];
  // Fix negative literal in array
  nodes3D[1][0]=-55; nodes3D[2][0]=-55; nodes3D[3][0]=-55; nodes3D[4][0]=-50;
  nodes3D[5][0]=-22; nodes3D[6][0]=-22; nodes3D[7][0]=-22; nodes3D[8][0]=-18;

  let angle = 0;
  function project(x,y,z,a) {
    const cosA = Math.cos(a), sinA = Math.sin(a);
    const rx = x*cosA - z*sinA;
    const rz = x*sinA + z*cosA;
    const scale = 200/(200+rz);
    return { sx: CX + rx*scale*0.6, sy: CY + y*scale*0.6, scale };
  }

  function drawPreview() {
    ctx.clearRect(0,0,W,H);
    angle += 0.008;
    const proj = nodes3D.map(([x,y,z]) => project(x,y,z,angle));
    // Draw edges
    ctx.lineWidth = 1;
    connections.forEach(([a,b]) => {
      const pa = proj[a], pb = proj[b];
      const alpha = 0.3 + (pa.scale + pb.scale)*0.2;
      ctx.strokeStyle = `rgba(0,240,255,${Math.min(0.85,alpha)})`;
      ctx.beginPath(); ctx.moveTo(pa.sx,pa.sy); ctx.lineTo(pb.sx,pb.sy); ctx.stroke();
    });
    // Draw nodes
    proj.forEach(p => {
      const r = Math.max(1.5, 4*p.scale);
      const grd = ctx.createRadialGradient(p.sx,p.sy,0,p.sx,p.sy,r*2);
      grd.addColorStop(0,'rgba(0,240,255,0.9)');
      grd.addColorStop(1,'rgba(0,240,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(p.sx,p.sy,r*2,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(drawPreview);
  }
  drawPreview();
})();

// ─── Landing particle field ──────────────────────────────────────────
(function initLandingParticles() {
  const container = $('landing-particles');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      width:${2+Math.random()*3}px; height:${2+Math.random()*3}px;
      background:rgba(0,240,255,${0.1+Math.random()*0.3});
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      animation: floatDot ${4+Math.random()*6}s ease-in-out infinite;
      animation-delay:${-Math.random()*6}s;
      box-shadow: 0 0 6px rgba(0,240,255,0.4);
    `;
    container.appendChild(dot);
  }
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatDot {
      0%,100%{transform:translate(0,0) scale(1);opacity:0.3}
      33%{transform:translate(${Math.random()*30-15}px,${Math.random()*30-15}px) scale(1.2);opacity:0.8}
      66%{transform:translate(${Math.random()*30-15}px,${Math.random()*30-15}px) scale(0.8);opacity:0.5}
    }
  `;
  document.head.appendChild(style);
})();

// ─── Initialize HUD (on button click) ───────────────────────────────
$('init-btn').addEventListener('click', async () => {
  initAudio();
  playUiTick();
  
  // Trigger Black Hole transition
  document.body.classList.add('blackhole-suck-active');
  const overlay = $('blackhole-overlay');
  if (overlay) overlay.classList.add('active');
  
  // Wait 2.0s for the black hole collapse animation to swallow the screen
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Start system (switches screen class hidden states)
  await startSystem();
  
  // Trigger fade out of black hole overlay to reveal webcam screen
  if (overlay) {
    overlay.classList.add('blackhole-fadeout');
    // Wait for fadeout animation to complete (500ms) before clean-up
    await new Promise(resolve => setTimeout(resolve, 500));
    overlay.classList.remove('active', 'blackhole-fadeout');
  }
  document.body.classList.remove('blackhole-suck-active');
});

async function startSystem() {
  // Hide landing, show HUD
  $('landing-screen').classList.add('hidden');
  $('hud-screen').classList.remove('hidden');

  videoEl = $('webcam-video');
  videoEl.style.opacity = '1';
  trackingCanvas = $('tracking-canvas');
  webglCanvas = $('webgl-canvas');
  pipSkeletonCanvas = $('pip-skeleton-canvas');
  fpsDisplay = $('fps-display');

  if (pipSkeletonCanvas) {
    pipSkeletonCanvas.width = 220;
    pipSkeletonCanvas.height = 165;
    pipSkeletonCtx = pipSkeletonCanvas.getContext('2d');
  }

  // Match canvas dimensions to arena
  function resizeCanvases() {
    const arena = $('arena');
    const w = arena.clientWidth, h = arena.clientHeight;
    trackingCanvas.width = w; trackingCanvas.height = h;
    webglCanvas.width = w; webglCanvas.height = h;
    if (engine) engine.resize(w, h);
  }
  resizeCanvases();
  resizeCanvasesFn = resizeCanvases;
  window.addEventListener('resize', resizeCanvases);

  trackingCtx = trackingCanvas.getContext('2d');

  // Init Three.js effects engine
  engine = new EffectsEngine(webglCanvas);
  engine.onParticleCount = (count) => {
    totalParticles = count;
    $('particles-display').textContent = `PTL: ${count}`;
  };

  // Init MediaPipe Hands
  hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.72,
    minTrackingConfidence: 0.65,
  });
  hands.onResults(onHandResults);

  // Query all video devices to select built-in system cam and bypass virtual cameras (like Iriun)
  try {
    let widthVal = window.innerWidth < 768 ? 640 : 1280;
    let heightVal = window.innerWidth < 768 ? 480 : 720;
    
    if (window.innerWidth < 768) {
      $('device-mode').textContent = '📱 MOBILE MODE';
    }

    let constraints = {
      video: {
        width: { ideal: widthVal },
        height: { ideal: heightVal }
      },
      audio: false
    };

    // First request access to get device labels populated (browser requirement)
    let initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Now list all cameras
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    
    // Close initial placeholder stream
    initialStream.getTracks().forEach(t => t.stop());

    if (videoDevices.length > 0) {
      // Find a clean camera that does NOT have 'iriun' or 'virtual' in its label
      let targetDevice = videoDevices.find(d => {
        const lbl = d.label.toLowerCase();
        return !lbl.includes('iriun') && !lbl.includes('virtual');
      });

      if (targetDevice) {
        constraints.video.deviceId = { exact: targetDevice.deviceId };
        log(`[CAMERA] System cam selected: ${targetDevice.label}`, 'success');
      } else {
        constraints.video.deviceId = { exact: videoDevices[0].deviceId };
        log(`[CAMERA] Default cam selected: ${videoDevices[0].label}`, 'warn');
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoEl.srcObject = stream;
    videoEl.onloadedmetadata = () => { videoEl.play(); };

    let cameraActive = true;
    camera = {
      stop: () => {
        cameraActive = false;
        stream.getTracks().forEach(t => t.stop());
        videoEl.srcObject = null;
      }
    };

    async function processFrame() {
      if (!cameraActive) return;
      if (videoEl.readyState >= 3) {
        latStart = performance.now();
        await hands.send({ image: videoEl });
      }
      requestAnimationFrame(processFrame);
    }
    requestAnimationFrame(processFrame);

  } catch (err) {
    log(`[CAMERA ERROR] Could not initialize: ${err.message}`, 'danger');
  }


  // FPS counter loop
  function fpsTick() {
    const now = performance.now();
    const dt = now - lastTime;
    lastTime = now;
    fpsSmooth = fpsSmooth * 0.92 + (1000/dt) * 0.08;
    fpsDisplay.textContent = `FPS: ${Math.round(fpsSmooth)}`;
    requestAnimationFrame(fpsTick);
  }
  fpsTick();

  // Waveform visualizer
  startWaveform();
  log('[SYSTEM] Chakra sync initialized. ⚡', 'success');
  log('[SYSTEM] Show your hand to the camera to begin...', 'system');
}

// ─── MediaPipe Results Handler ───────────────────────────────────────
function onHandResults(results) {
  try {
    const lat = performance.now() - latStart;
    $('latency-display').textContent = `LAT: ${Math.round(lat)}ms`;

    const W = trackingCanvas.width, H = trackingCanvas.height;
    trackingCtx.clearRect(0, 0, W, H);

    if (pipSkeletonCtx) {
      pipSkeletonCtx.clearRect(0, 0, pipSkeletonCanvas.width, pipSkeletonCanvas.height);
    }

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      $('no-hand-overlay').style.display = '';
      $('reticle').classList.remove('visible');
      pendingGesture = null;
      pendingGestureFrames = 0;
      if (currentGesture) {
        stopGestureAudio();
        engine.deactivateEffect();
        currentGesture = null;
        updateJutsuBanner(null);
        updateCodexStatus(null);
      }
      $('charge-bar').style.width = '0%';
      $('charge-pct').textContent = '0%';
      updateVibration(null);
      return;
    }

    $('no-hand-overlay').style.display = 'none';

    const multiHands = results.multiHandLandmarks;
    
    // Mapped directly to full screen coordinates
    const renderMultiHands = multiHands.map(hand => {
      return hand.map(lm => ({
        x: lm.x,
        y: lm.y,
        z: lm.z
      }));
    });
    const lm = renderMultiHands[0];
    
    // Get center point (average of both hands if 2 are detected, else 1)
    let palmCenter = getPalmCenter(lm);
    if (multiHands.length > 1) {
      const palm2 = getPalmCenter(renderMultiHands[1]);
      palmCenter = {
        x: (palmCenter.x + palm2.x) / 2,
        y: (palmCenter.y + palm2.y) / 2,
        z: (palmCenter.z + palm2.z) / 2
      };
    }

    // Position targeting reticle (flipped X because mirrored)
    const rx = (1 - palmCenter.x) * W;
    const ry = palmCenter.y * H;
    const reticle = $('reticle');
    reticle.style.left = `${rx}px`;
    reticle.style.top  = `${ry}px`;
    reticle.classList.add('visible');

    // Draw skeleton if enabled (draw for all detected hands)
    if (showSkeleton && pipSkeletonCtx) {
      renderMultiHands.forEach(handLm => drawSkeleton(handLm, pipSkeletonCtx, pipSkeletonCanvas.width, pipSkeletonCanvas.height));
    }

    // Classify gesture using ALL hands (use raw landmarks for 100% accurate classification)
    const gesture = classifyGesture(multiHands, results.multiHandedness);

    if (gesture) {
      const charge = gesture.charge;
      
      // DEBOUNCE LOGIC
      if (pendingGesture?.id !== gesture.id) {
        pendingGesture = gesture;
        pendingGestureFrames = 1;
      } else {
        pendingGestureFrames++;
      }

      if (pendingGestureFrames >= GESTURE_CONFIDENCE_FRAMES && currentGesture?.id !== gesture.id) {
        // New stable gesture confirmed
        if (currentGesture) {
          stopGestureAudio();
          engine.deactivateEffect();
        }
        engine.activateEffect(gesture.id);
        startGestureAudio(gesture.id);
        currentGesture = gesture;
        updateJutsuBanner(gesture);
        updateCodexStatus(gesture.id);
        log(`[MUDRA] ${gesture.icon} ${gesture.label} locked in!`, 'success');
        if (charge === 1.0) log(`[CHAKRA] 100% — ${gesture.label} unleashed!`, 'danger');
      }

      // If gesture is confirmed, run full HUD
      if (currentGesture?.id === gesture.id) {
        $('charge-bar').style.width = `${Math.round(charge*100)}%`;
        $('charge-bar').style.background = `linear-gradient(90deg, ${gesture.color}, ${chakraColor})`;
        $('charge-pct').textContent = `${Math.round(charge*100)}%`;
        $('reticle-label').textContent = gesture.label.toUpperCase();

        // Update position and charge
        engine.setHandPosition(palmCenter.x, palmCenter.y, 1.0);
        engine.updateEffect(charge);
        updateGestureAudio(gesture.id, charge);
        
        updateVibration(gesture.id);
      } else {
        // Still analyzing
        $('reticle-label').textContent = `ANALYZING...`;
        updateVibration(null);
      }
    } else {
      pendingGesture = null;
      pendingGestureFrames = 0;
      if (currentGesture) {
        stopGestureAudio();
        engine.deactivateEffect();
        currentGesture = null;
        updateJutsuBanner(null);
        updateCodexStatus(null);
      }
      $('charge-bar').style.width = '0%';
      $('charge-pct').textContent = '0%';
      $('reticle-label').textContent = 'SCANNING...';
      updateVibration(null);
    }
  } catch (err) {
    console.error("Error in onHandResults:", err);
    log(`[ERROR] Gesture pipeline crash: ${err.message}`, 'danger');
  }
}

// ─── Vibration Handler ───────────────────────────────────────────────
function updateVibration(gestureId) {
  const hud = $('hud-screen');
  if (gestureId === 'sukuna') {
    if (hud && !hud.classList.contains('sukuna-vibrate')) {
      hud.classList.add('sukuna-vibrate');
    }
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  } else {
    if (hud) hud.classList.remove('sukuna-vibrate');
    if (navigator.vibrate) navigator.vibrate(0);
  }
}

// ─── Skeleton Drawing ────────────────────────────────────────────────
const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

function drawSkeleton(lm, ctx, W, H) {
  ctx.save();

  CONNECTIONS.forEach(([a, b]) => {
    const p1 = lm[a], p2 = lm[b];
    const x1 = p1.x * W, y1 = p1.y * H;
    const x2 = p2.x * W, y2 = p2.y * H;
    const grd = ctx.createLinearGradient(x1,y1,x2,y2);
    grd.addColorStop(0, chakraColor + 'cc');
    grd.addColorStop(1, chakraColor + '88');
    ctx.strokeStyle = grd;
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 8;
    ctx.shadowColor = chakraColor;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });

  lm.forEach((p, i) => {
    const x = p.x * W, y = p.y * H;
    const isTip = [4,8,12,16,20].includes(i);
    const r = isTip ? 5 : 3.5;
    const grd = ctx.createRadialGradient(x,y,0,x,y,r*2);
    grd.addColorStop(0,'rgba(255,255,255,0.95)');
    grd.addColorStop(0.4, chakraColor+'dd');
    grd.addColorStop(1,'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(x,y,r*2,0,Math.PI*2); ctx.fill();
  });

  ctx.restore();
}

// ─── Jutsu Banner & Codex Status ────────────────────────────────────
function updateJutsuBanner(gesture) {
  const name = $('jutsu-name');
  const sub  = $('jutsu-sub');
  if (!gesture) {
    name.textContent = '—';
    name.style.color = '';
    sub.textContent = 'Awaiting mudra...';
    return;
  }
  name.textContent = `${gesture.icon}  ${gesture.label}`;
  name.style.color = gesture.color;
  sub.textContent  = gesture.series;
}

function updateCodexStatus(activeId) {
  GESTURE_REGISTRY.forEach(g => {
    const statusEl = $(`status-${g.id}`);
    const cardEl   = $(`codex-${g.id}`);
    if (!statusEl || !cardEl) return;
    if (g.id === activeId) {
      statusEl.textContent = '●';
      statusEl.classList.add('detected');
      cardEl.classList.add('active');
    } else {
      statusEl.textContent = '○';
      statusEl.classList.remove('detected');
      cardEl.classList.remove('active');
    }
  });
}

// ─── Console Log ─────────────────────────────────────────────────────
function log(msg, type = 'system') {
  const formattedMsg = `[${new Date().toLocaleTimeString()}] [${type.toUpperCase()}] ${msg}`;
  if (type === 'danger' || type === 'error') console.error(formattedMsg);
  else if (type === 'warn') console.warn(formattedMsg);
  else console.log(formattedMsg);

  const el = $('console-log');
  if (!el) return;
  const line = document.createElement('div');
  line.className = `log-line log-line--${type}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  el.appendChild(line);
  // Keep last 40 lines
  while (el.children.length > 40) el.removeChild(el.firstChild);
  el.scrollTop = el.scrollHeight;
}

// ─── Waveform Oscilloscope ───────────────────────────────────────────
function startWaveform() {
  const canvas = $('waveform-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  function drawWave() {
    ctx.clearRect(0,0,W,H);
    const charge = parseFloat($('charge-pct')?.textContent) / 100 || 0;
    const amp = H/2 * (0.2 + charge * 0.7);
    const freq = 0.03 + charge * 0.05;
    ctx.beginPath();
    ctx.strokeStyle = chakraColor;
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = chakraColor;
    for (let x = 0; x < W; x++) {
      const y = H/2 + Math.sin(x*freq + t) * amp + Math.sin(x*freq*2.3 + t*1.7) * amp * 0.3;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    t += 0.06 + charge * 0.08;
    requestAnimationFrame(drawWave);
  }
  drawWave();
}

// ─── Pose Modal ───────────────────────────────────────────────────────
const MODAL_DATA = {};
GESTURE_REGISTRY.forEach(g => { MODAL_DATA[g.id] = g; });

function openModal(jutsuId) {
  const data = MODAL_DATA[jutsuId];
  if (!data) return;
  $('modal-icon').textContent  = data.icon;
  $('modal-title').textContent = data.label;
  $('modal-series').textContent = data.series;
  $('modal-tip').textContent   = data.tip;

  // Draw finger diagram
  const visual = $('modal-pose-visual');
  visual.innerHTML = '<canvas id="pose-diagram" width="200" height="220"></canvas><div style="font-size:9px;color:var(--muted);text-align:center;margin-top:4px;font-family:var(--font-mono);letter-spacing:1px;">DYNAMIC HUD SEALS</div>';
  drawPoseDiagram($('pose-diagram'), data.poseType);

  // Render steps
  const steps = $('modal-steps');
  steps.innerHTML = data.manualSteps.map((s, i) => `
    <div class="pm-step">
      <div class="pm-step-num">${i+1}</div>
      <div class="pm-step-text">${s}</div>
    </div>
  `).join('');

  $('pose-modal').classList.remove('hidden');
}

function closeModal() { $('pose-modal').classList.add('hidden'); }

$('modal-close').addEventListener('click', closeModal);
$('modal-backdrop').addEventListener('click', closeModal);

document.querySelectorAll('.codex-card').forEach(card => {
  card.addEventListener('click', () => { initAudio(); playUiTick(); openModal(card.dataset.jutsu); });
  card.addEventListener('keydown', e => { if (e.key === 'Enter') { initAudio(); playUiTick(); openModal(card.dataset.jutsu); } });
});

// Interactive game-select lobby items
document.querySelectorAll('.lpl-item').forEach(card => {
  card.addEventListener('click', () => {
    initAudio(); // Initialize audio context on first interaction
    playUiTick(); // Play quick technological chime beep
    openModal(card.dataset.jutsu);
  });
});

function drawPoseDiagram(canvas, poseType) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // Background Glass-like aesthetic
  ctx.fillStyle = 'rgba(10, 12, 22, 0.6)';
  ctx.fillRect(0,0,W,H);

  const CX = W/2, CY = H/2 + 20;

  // Finger states by poseType
  const poses = {
    'open-palm':    [true,true,true,true,true],
    'fist':         [false,false,false,false,false],
    'fist-knuckle': [false,false,false,false,false],
    'tiger':        [false,false,true,true,false], // index+middle open, pinky+ring+thumb fold
    'crossed':      [false,false,'crossed',true,false], // index+middle (crossed), rest fold
    'claw':         ['half','half','half','half','half'],
    'pinch':        [true,true,true,'pinch','pinch'], // thumb+index touch, rest extended
    'heart-shape':  [true,true,true,true,true], // custom heart-shaped outlines
    'fist-touching': [false,false,false,false,false], // closed fists touching
  };
  const fingerExtended = poses[poseType] || [true,true,true,true,true];

  // 1. Shaded palm base silhouette
  ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(CX - 35, CY + 35); // wrist left
  ctx.bezierCurveTo(CX - 60, CY + 10, CX - 58, CY - 20, CX - 50, CY - 10); // palm left edge to pinky root
  ctx.lineTo(CX - 25, CY - 20); // to ring root
  ctx.lineTo(CX, CY - 24); // to middle root
  ctx.lineTo(CX + 25, CY - 20); // to index root
  ctx.bezierCurveTo(CX + 45, CY - 10, CX + 55, CY - 5, CX + 46, CY + 5); // to thumb root
  ctx.lineTo(CX + 35, CY + 25); // thumb pad
  ctx.bezierCurveTo(CX + 42, CY + 30, CX + 35, CY + 35, CX + 35, CY + 35); // wrist right
  ctx.lineTo(CX - 35, CY + 35); // close wrist
  ctx.fill();
  ctx.stroke();

  // Wrist band marker
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CX - 25, CY + 30);
  ctx.lineTo(CX + 25, CY + 30);
  ctx.stroke();

  // Define anatomically structured fingers
  const fingers = [
    { name: 'PINKY', ext: fingerExtended[0], rx: CX - 48, ry: CY - 10, len: 44, dx: -12 },
    { name: 'RING', ext: fingerExtended[1], rx: CX - 24, ry: CY - 20, len: 54, dx: -4 },
    { name: 'MIDDLE', ext: fingerExtended[2], rx: CX, ry: CY - 24, len: 60, dx: 0 },
    { name: 'INDEX', ext: fingerExtended[3], rx: CX + 24, ry: CY - 20, len: 54, dx: 4 },
    { name: 'THUMB', ext: fingerExtended[4], rx: CX + 46, ry: CY + 5, len: 34, dx: 16 }
  ];

  // 2. Render each articulated finger
  fingers.forEach((f) => {
    let joints = [];
    const rootX = f.rx;
    const rootY = f.ry;
    const len = f.len;
    const dx = f.dx;

    if (f.ext === true) {
      joints = [
        { x: rootX, y: rootY },
        { x: rootX + dx * 0.4, y: rootY - len * 0.45 },
        { x: rootX + dx * 0.8, y: rootY - len * 0.75 },
        { x: rootX + dx, y: rootY - len }
      ];
    } else if (f.ext === 'half') {
      joints = [
        { x: rootX, y: rootY },
        { x: rootX + dx * 0.35, y: rootY - len * 0.35 },
        { x: rootX + dx * 0.7, y: rootY - len * 0.5 },
        { x: rootX + dx * 0.85, y: rootY - len * 0.45 }
      ];
    } else if (f.ext === 'pinch') {
      // Thumb and Index tip meet in a circle at CX + 12, CY - 35
      const targetX = CX + 12;
      const targetY = CY - 35;
      joints = [
        { x: rootX, y: rootY },
        { x: rootX + (targetX - rootX) * 0.35, y: rootY + (targetY - rootY) * 0.3 },
        { x: rootX + (targetX - rootX) * 0.75, y: rootY + (targetY - rootY) * 0.75 },
        { x: targetX, y: targetY }
      ];
    } else if (f.ext === 'crossed') {
      // Cross Middle over Index finger (Index goes right, Middle crosses over to right too)
      const targetX = CX + 16;
      joints = [
        { x: rootX, y: rootY },
        { x: rootX + 5, y: rootY - len * 0.4 },
        { x: targetX - 6, y: rootY - len * 0.85 },
        { x: targetX, y: rootY - len - 4 } // extend slightly over
      ];
    } else {
      // False (folded completely into palm base)
      joints = [
        { x: rootX, y: rootY },
        { x: rootX + dx * 0.15, y: rootY - len * 0.15 },
        { x: rootX + dx * 0.05, y: rootY - len * 0.05 },
        { x: rootX - 2, y: rootY + 6 } // tip curled inward down
      ];
    }

    // Color coding
    let strokeColor = '#00f0ff'; // Cyan default
    let statusText = 'OPEN';
    let statusColor = '#00f0ff';

    if (f.ext === false) {
      strokeColor = '#ff2c55'; // Pink/Red for locked/folded
      statusText = 'FOLD';
      statusColor = '#ff2c55';
    } else if (f.ext === 'half') {
      strokeColor = '#ffb300'; // Orange for half-curved claw
      statusText = 'BENT';
      statusColor = '#ffb300';
    } else if (f.ext === 'pinch') {
      strokeColor = '#bc00ff'; // Purple/magenta for pinch
      statusText = 'PINCH';
      statusColor = '#bc00ff';
    } else if (f.ext === 'crossed') {
      strokeColor = '#00ff66'; // Green for special crossed fingers
      statusText = 'CROSS';
      statusColor = '#00ff66';
    }

    // Draw finger segment lines
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(joints[0].x, joints[0].y);
    for (let j = 1; j < joints.length; j++) {
      ctx.lineTo(joints[j].x, joints[j].y);
    }
    ctx.stroke();

    // Draw joints
    joints.forEach((joint, jIdx) => {
      ctx.fillStyle = jIdx === joints.length - 1 ? '#ffffff' : strokeColor; // Highlight tip node in white
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, jIdx === joints.length - 1 ? 4.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw state pill at the tips for straight/special fingers
    const tip = joints[joints.length - 1];
    if (f.ext === true || f.ext === 'crossed' || f.ext === 'pinch') {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(tip.x - 14, tip.y - 15, 28, 9);
      ctx.strokeStyle = statusColor;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(tip.x - 14, tip.y - 15, 28, 9);

      ctx.fillStyle = statusColor;
      ctx.font = 'bold 7px var(--font-mono)';
      ctx.textAlign = 'center';
      ctx.fillText(statusText, tip.x, tip.y - 8);
    }
  });

  // 3. Special action HUD visual overlays
  ctx.textAlign = 'center';
  if (poseType === 'open-palm') {
    // Rasengan Wind Swirls in the Palm
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(CX, CY + 5, 22, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, CY + 5, 14, 0.5, Math.PI * 1.5); ctx.stroke();
    
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillText('🌀 OPEN PALM', CX, CY + 8);
  } 
  else if (poseType === 'fist') {
    // Chidori lightning sparks
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(CX - 15, CY + 5); ctx.lineTo(CX - 5, CY - 5); ctx.lineTo(CX + 5, CY + 5); ctx.lineTo(CX + 15, CY - 5);
    ctx.stroke();
    
    ctx.fillStyle = '#ff2c55';
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillText('⚡ CLOSED FIST', CX, CY + 18);
  }
  else if (poseType === 'horns-back') {
    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillText('🔮 HORNS (BACK-FACED)', CX, CY + 18);
  }
  else if (poseType === 'claw') {
    // Sukuna Demon Claw slash marks
    ctx.strokeStyle = 'rgba(255, 44, 85, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(CX - 30, CY - 10); ctx.lineTo(CX + 30, CY - 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX - 30, CY - 25); ctx.lineTo(CX + 30, CY - 45); ctx.stroke();
    
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillText('💀 DEMON CLAW', CX, CY + 18);
  }
  else if (poseType === 'pinch') {
    // Colliding energy glow
    const pX = CX + 12;
    const pY = CY - 35;
    const grd = ctx.createRadialGradient(pX, pY, 0, pX, pY, 14);
    grd.addColorStop(0, 'rgba(188, 0, 255, 0.8)');
    grd.addColorStop(1, 'rgba(188, 0, 255, 0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(pX, pY, 14, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = '#bc00ff';
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillText('🟣 PINCH SHIFT', CX, CY + 18);
  }
  else if (poseType === 'heart-shape') {
    // Beautiful heart outlines
    ctx.strokeStyle = 'rgba(255, 44, 125, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Parametric heart formula drawn at palm center
    for (let t = 0; t <= Math.PI * 2 + 0.1; t += 0.1) {
      const x = 16 * Math.sin(t) ** 3;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      const px = CX + x * 1.8;
      const py = CY - 10 - y * 1.8;
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#ff2c7d';
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillText('💖 HEART SEAL', CX, CY + 18);
  }
  else if (poseType === 'fist-touching') {
    // Soft smoke cloud puffs surrounding the fist diagram
    ctx.fillStyle = 'rgba(144, 202, 249, 0.18)';
    ctx.strokeStyle = 'rgba(144, 202, 249, 0.4)';
    ctx.lineWidth = 1.2;
    
    // Draw 3 smoke circles
    const smokePuffs = [
      { x: CX - 18, y: CY - 8, r: 16 },
      { x: CX + 18, y: CY - 8, r: 16 },
      { x: CX, y: CY - 20, r: 20 }
    ];
    smokePuffs.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.fillStyle = '#90caf9';
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillText('💨 SHUNSHIN BURST', CX, CY + 18);
  }
}

// ─── Controls ─────────────────────────────────────────────────────────

// Fullscreen
$('fullscreen-btn').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => log(`[SYSTEM] Fullscreen error: ${err.message}`, 'warn'));
    $('fullscreen-btn').textContent = '⛶ EXIT FULL';
    $('hud-screen').classList.add('zen-mode');
  } else {
    document.exitFullscreen();
    $('fullscreen-btn').textContent = '⛶ FULLSCREEN';
    $('hud-screen').classList.remove('zen-mode');
  }
  if (resizeCanvasesFn) setTimeout(resizeCanvasesFn, 100);
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    $('fullscreen-btn').textContent = '⛶ FULLSCREEN';
    $('hud-screen').classList.remove('zen-mode');
  } else {
    $('fullscreen-btn').textContent = '⛶ EXIT FULL';
    $('hud-screen').classList.add('zen-mode');
  }
  if (resizeCanvasesFn) setTimeout(resizeCanvasesFn, 100);
});

// Toggle Camera state (remain in interface)
async function toggleCameraState() {
  if (cameraActive) {
    cameraActive = false;
    stopGestureAudio();
    if (engine) engine.deactivateEffect();
    if (camera) {
      try {
        camera.stop();
      } catch(err) {
        log(`[SYSTEM] Camera stop error: ${err.message}`, 'warn');
      }
    }
    videoEl.style.opacity = '0';
    $('camera-offline-overlay').style.display = 'flex';
    $('camera-toggle-btn').textContent = '📷 CAMERA ON';
    $('camera-toggle-btn').classList.remove('ctrl-btn--danger');
    $('camera-toggle-btn').classList.add('ctrl-btn--success');
    log('[SYSTEM] Camera sensors deactivated. Console workspace active.', 'warn');
  } else {
    cameraActive = true;
    videoEl.style.opacity = '1';
    $('camera-offline-overlay').style.display = 'none';
    $('camera-toggle-btn').textContent = '📷 CAMERA OFF';
    $('camera-toggle-btn').classList.add('ctrl-btn--danger');
    $('camera-toggle-btn').classList.remove('ctrl-btn--success');
    log('[SYSTEM] Initializing camera sensors...', 'system');
    if (camera) {
      try {
        await camera.start();
      } catch(err) {
        log(`[SYSTEM] Camera start error: ${err.message}`, 'danger');
      }
    }
  }
}

$('camera-toggle-btn').addEventListener('click', toggleCameraState);
$('camera-resume-btn').addEventListener('click', toggleCameraState);

// Exit to Lobby / Disconnect Session
$('exit-btn').addEventListener('click', () => {
  stopGestureAudio();
  if (engine) engine.deactivateEffect();
  if (camera) {
    try {
      camera.stop();
    } catch(err) {}
  }
  if (videoEl) videoEl.style.opacity = '0';
  $('landing-screen').classList.remove('hidden');
  $('hud-screen').classList.add('hidden');
  currentGesture = null;
  animRunning = false;
  
  // Clean up camera offline state for next session
  $('camera-offline-overlay').style.display = 'none';
  $('camera-toggle-btn').textContent = '📷 CAMERA OFF';
  $('camera-toggle-btn').classList.add('ctrl-btn--danger');
  $('camera-toggle-btn').classList.remove('ctrl-btn--success');
  cameraActive = true;
});

// Chakra color
$('chakra-color-picker').addEventListener('input', e => {
  chakraColor = e.target.value;
  if (engine) engine.setChakraColor(chakraColor);
  document.documentElement.style.setProperty('--cyan', chakraColor);
});

// Skeleton toggle
$('skeleton-toggle').addEventListener('change', e => { showSkeleton = e.target.checked; });

// Sound toggle
$('sound-toggle').addEventListener('change', e => {
  soundEnabled = e.target.checked;
  setAudioEnabled(soundEnabled);
  if (!soundEnabled) stopGestureAudio();
});

// Screenshot
$('screenshot-btn').addEventListener('click', () => {
  const ssCanvas = $('screenshot-canvas');
  const W = trackingCanvas.width, H = trackingCanvas.height;
  ssCanvas.width = W; ssCanvas.height = H;
  const ctx = ssCanvas.getContext('2d');
  // Compose: tracking canvas (video + skeleton) + webgl canvas (effects)
  ctx.drawImage(trackingCanvas, 0, 0, W, H);
  ctx.drawImage(webglCanvas, 0, 0, W, H);
  // Stamp
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, H-46, W, 46);
  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 13px Outfit, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('JUTSU CATALYST  •  忍術カタリスト', 14, H-16);
  if (currentGesture) {
    ctx.textAlign = 'right';
    ctx.fillStyle = currentGesture.color;
    ctx.fillText(`${currentGesture.icon} ${currentGesture.label}`, W-14, H-16);
  }
  // Show screenshot overlay
  $('download-btn').href = ssCanvas.toDataURL('image/png');
  $('screenshot-overlay').classList.remove('hidden');
});

$('sso-close').addEventListener('click', () => $('screenshot-overlay').classList.add('hidden'));
$('sso-backdrop').addEventListener('click', () => $('screenshot-overlay').classList.add('hidden'));
