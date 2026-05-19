/**
 * audio.js — Modular Web Audio API Synthesizer Engine
 * 7 custom synthesized sound engines, zero file loading, instant playback
 */

let ctx = null;
let masterGain = null;
let activeNodes = [];
let enabled = true;

/** Initialize AudioContext on first user gesture */
export function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.65;
  masterGain.connect(ctx.destination);
}

export function setAudioEnabled(val) { enabled = val; }

/** Stop all playing nodes cleanly */
export function stopAllAudio() {
  activeNodes.forEach(n => { try { n.stop(); } catch(e){} });
  activeNodes = [];
}

/** Internal utility — create an oscillator node */
function osc(type, freq, gainVal, duration = 999, detune = 0) {
  if (!ctx || !enabled) return null;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  g.gain.value = gainVal;
  o.connect(g); g.connect(masterGain);
  o.start();
  activeNodes.push(o);
  return { osc: o, gain: g };
}

/** Internal utility — create a noise buffer node */
function noise(gainVal, filterType = 'bandpass', filterFreq = 800, filterQ = 1) {
  if (!ctx || !enabled) return null;
  const bufferSize = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const flt = ctx.createBiquadFilter();
  flt.type = filterType; flt.frequency.value = filterFreq; flt.Q.value = filterQ;
  const g = ctx.createGain(); g.gain.value = gainVal;
  src.connect(flt); flt.connect(g); g.connect(masterGain);
  src.start();
  activeNodes.push(src);
  return { src, filter: flt, gain: g };
}

// ─── 7 Sound Engines ──────────────────────────────────────────────

const audioEngines = {};

/** 🌀 Rasengan — low wind rumble + high shimmer */
audioEngines.rasengan = {
  nodes: [],
  start() {
    if (!ctx || !enabled) return;
    const wind = noise(0.25, 'lowpass', 280, 0.8);
    const shimmer = osc('triangle', 880, 0.04);
    // LFO modulation on wind
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 4; lfo.type = 'sine';
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 60;
    lfo.connect(lfoGain);
    if (wind) lfoGain.connect(wind.filter.frequency);
    lfo.start(); activeNodes.push(lfo);
    this.nodes = [wind, shimmer];
  },
  update(charge) {
    if (!this.nodes[0]) return;
    const w = this.nodes[0];
    if (w && w.gain) w.gain.gain.value = 0.1 + charge * 0.4;
    if (w && w.filter) w.filter.frequency.value = 150 + charge * 400;
  },
};

/** ⚡ Chidori — pink noise crackles + sawtooth hum */
audioEngines.chidori = {
  nodes: [],
  start() {
    if (!ctx || !enabled) return;
    const crackle = noise(0.35, 'highpass', 2200, 2);
    const hum = osc('sawtooth', 55, 0.06);
    if (hum) {
      hum.gain.gain.value = 0.06;
      // Add distortion-like vibration via detune LFO
      const vibLFO = ctx.createOscillator();
      vibLFO.frequency.value = 12; vibLFO.type = 'sawtooth';
      const vibGain = ctx.createGain(); vibGain.gain.value = 30;
      vibLFO.connect(vibGain); vibGain.connect(hum.osc.detune);
      vibLFO.start(); activeNodes.push(vibLFO);
    }
    this.nodes = [crackle, hum];
  },
  update(charge) {
    if (this.nodes[0] && this.nodes[0].gain) this.nodes[0].gain.gain.value = 0.1 + charge * 0.6;
    if (this.nodes[1] && this.nodes[1].gain) this.nodes[1].gain.gain.value = charge * 0.12;
  },
};

/** 🔥 Katon — roaring swept white noise */
audioEngines.katon = {
  nodes: [],
  start() {
    if (!ctx || !enabled) return;
    const roar = noise(0.35, 'lowpass', 600, 0.5);
    const crackle = noise(0.15, 'bandpass', 2800, 1.5);
    // Roar sweep up
    if (roar) ctx.createGain() && (roar.filter.frequency.setValueAtTime(200, ctx.currentTime), roar.filter.frequency.linearRampToValueAtTime(900, ctx.currentTime + 1.5));
    this.nodes = [roar, crackle];
  },
  update(charge) {
    if (this.nodes[0] && this.nodes[0].gain) this.nodes[0].gain.gain.value = 0.1 + charge * 0.6;
    if (this.nodes[1] && this.nodes[1].gain) this.nodes[1].gain.gain.value = charge * 0.25;
    if (this.nodes[0] && this.nodes[0].filter) this.nodes[0].filter.frequency.value = 200 + charge * 1400;
  },
};

/** 🔮 Gojo Domain — sub-bass drop + celestial reverb drone */
audioEngines.gojo = {
  nodes: [],
  start() {
    if (!ctx || !enabled) return;
    // Sub bass sweep 80 -> 20 Hz
    const bass = osc('sine', 80, 0.5);
    if (bass) {
      bass.osc.frequency.setValueAtTime(80, ctx.currentTime);
      bass.osc.frequency.exponentialRampToValueAtTime(18, ctx.currentTime + 2.5);
    }
    // Celestial drone
    const drone1 = osc('sine', 220, 0.06);
    const drone2 = osc('sine', 330, 0.04, 999, 5);
    // Reverb-like delay via two delayed copies
    const delay = ctx.createDelay(0.5);
    delay.delayTime.value = 0.35;
    const dGain = ctx.createGain(); dGain.gain.value = 0.25;
    if (drone1) { drone1.gain.connect(delay); delay.connect(dGain); dGain.connect(masterGain); }
    this.nodes = [bass, drone1, drone2];
  },
  update(charge) {
    if (this.nodes[0] && this.nodes[0].gain) this.nodes[0].gain.gain.value = 0.2 + charge * 0.6;
  },
};

/** 💀 Sukuna Domain — war drums + metallic slices */
audioEngines.sukuna = {
  nodes: [],
  drumInterval: null,
  start() {
    if (!ctx || !enabled) return;
    const drone = noise(0.12, 'bandpass', 120, 0.6);
    this.nodes = [drone];
    // Rhythmic drum impacts
    let beat = 0;
    this.drumInterval = setInterval(() => {
      if (!ctx || !enabled) return;
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();
      drumOsc.frequency.value = 80; drumOsc.type = 'sine';
      drumGain.gain.setValueAtTime(beat % 2 === 0 ? 0.7 : 0.35, ctx.currentTime);
      drumGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      drumOsc.connect(drumGain); drumGain.connect(masterGain);
      drumOsc.start(); drumOsc.stop(ctx.currentTime + 0.2);
      activeNodes.push(drumOsc);
      // Slice sound on even beats
      if (beat % 4 === 0) {
        const sliceNoise = noise(0.45, 'highpass', 3500, 4);
        if (sliceNoise) {
          sliceNoise.gain.gain.setValueAtTime(0.45, ctx.currentTime);
          setTimeout(() => { try { sliceNoise.src.stop(); } catch(e){} }, 120);
        }
      }
      beat++;
    }, 320);
  },
  update(charge) {
    if (this.nodes[0] && this.nodes[0].gain) this.nodes[0].gain.gain.value = charge * 0.3;
  },
  stop() { if (this.drumInterval) { clearInterval(this.drumInterval); this.drumInterval = null; } },
};

/** 🟣 Hollow Purple — energy collision sweep + sub-bass blast */
audioEngines.hollow = {
  nodes: [],
  start() {
    if (!ctx || !enabled) return;
    // Blue energy (high sweep down)
    const blue = osc('sawtooth', 1200, 0.08);
    if (blue) blue.osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 1.8);
    // Red energy (low sweep up)
    const red = osc('sawtooth', 60, 0.08);
    if (red) red.osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.8);
    // Collision sub blast
    const blast = osc('sine', 38, 0.5);
    if (blast) {
      blast.gain.gain.setValueAtTime(0.5, ctx.currentTime);
      blast.gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    }
    // Purple crackle
    const crackle = noise(0.3, 'bandpass', 900, 3);
    this.nodes = [blue, red, blast, crackle];
  },
  update(charge) {
    if (this.nodes[3] && this.nodes[3].gain) this.nodes[3].gain.gain.value = charge * 0.45;
    if (this.nodes[0] && this.nodes[0].gain) this.nodes[0].gain.gain.value = charge * 0.15;
    if (this.nodes[1] && this.nodes[1].gain) this.nodes[1].gain.gain.value = charge * 0.15;
  },
};

/** 🐺 Wolverine — metallic SNIKT sweep */
audioEngines.wolverine = {
  nodes: [],
  sniked: false,
  start() {
    if (!ctx || !enabled) return;
    this.sniked = false;
    const hum = osc('sawtooth', 160, 0.04);
    const metalNoise = noise(0.15, 'highpass', 4000, 5);
    this.nodes = [hum, metalNoise];
  },
  update(charge) {
    if (charge > 0.85 && !this.sniked) {
      this.sniked = true;
      // SNIKT! — fast high-pitched metal sweep
      if (!ctx || !enabled) return;
      const snikt = ctx.createOscillator();
      snikt.type = 'sawtooth'; snikt.frequency.value = 3000;
      const sniktGain = ctx.createGain();
      sniktGain.gain.setValueAtTime(0.55, ctx.currentTime);
      sniktGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      snikt.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.18);
      snikt.connect(sniktGain); sniktGain.connect(masterGain);
      snikt.start(); snikt.stop(ctx.currentTime + 0.2);
      activeNodes.push(snikt);
    }
    if (this.nodes[1] && this.nodes[1].gain) this.nodes[1].gain.gain.value = charge * 0.3;
  },
  stop() { this.sniked = false; },
};

/** 💖 Heart Sanctuary — rhythmic dual heartbeat + romantic chime pads */
audioEngines.heart = {
  nodes: [],
  heartbeatInterval: null,
  start() {
    if (!ctx || !enabled) return;
    const pad = osc('triangle', 349.23, 0.05); // F4 note for lover's theme
    const shimmer = noise(0.08, 'bandpass', 1200, 2);
    this.nodes = [pad, shimmer];
    
    // Rhythmic dual heartbeat: thump-thump
    let beatPhase = 0;
    this.heartbeatInterval = setInterval(() => {
      if (!ctx || !enabled) return;
      
      // First thump
      const o1 = ctx.createOscillator();
      const g1 = ctx.createGain();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(55, ctx.currentTime);
      o1.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.18);
      g1.gain.setValueAtTime(0.75, ctx.currentTime);
      g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      o1.connect(g1); g1.connect(masterGain);
      o1.start(); o1.stop(ctx.currentTime + 0.2);
      activeNodes.push(o1);
      
      // Second thump (staggered slightly by 140ms)
      setTimeout(() => {
        if (!ctx || !enabled) return;
        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = 'sine';
        o2.frequency.setValueAtTime(50, ctx.currentTime);
        o2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.18);
        g2.gain.setValueAtTime(0.6, ctx.currentTime);
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        o2.connect(g2); g2.connect(masterGain);
        o2.start(); o2.stop(ctx.currentTime + 0.2);
        activeNodes.push(o2);
      }, 140);
      
      // Occasional high sparkle chime
      if (beatPhase % 2 === 0) {
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6 chime
        chimeGain.gain.setValueAtTime(0.12, ctx.currentTime);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        chime.connect(chimeGain); chimeGain.connect(masterGain);
        chime.start(); chime.stop(ctx.currentTime + 0.6);
        activeNodes.push(chime);
      }
      beatPhase++;
    }, 750);
  },
  update(charge) {
    if (this.nodes[0] && this.nodes[0].gain) {
      this.nodes[0].gain.gain.value = 0.05 + charge * 0.15;
      this.nodes[0].osc.frequency.value = 349.23 + Math.sin(performance.now() * 0.002) * 5;
    }
    if (this.nodes[1] && this.nodes[1].gain) {
      this.nodes[1].gain.gain.value = charge * 0.18;
    }
  },
  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
};

/** 💨 Teleportation / Shunshin — smoke screen burst */
audioEngines.teleport = {
  nodes: [],
  burstTriggered: false,
  start() {
    if (!ctx || !enabled) return;
    this.burstTriggered = false;
    // Ambient energy wind hum
    const wind = noise(0.05, 'bandpass', 600, 3);
    const hum = osc('sine', 110, 0.03);
    this.nodes = [wind, hum];
  },
  update(charge) {
    if (charge > 0.85 && !this.burstTriggered) {
      this.burstTriggered = true;
      if (!ctx || !enabled) return;

      // Teleportation POOF!
      // 1. Noise blast (the smoke burst)
      const bufferSize = ctx.sampleRate * 0.35; // 350ms duration
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 2.5;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      noiseNode.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseNode.start();
      activeNodes.push(noiseNode);

      // 2. High frequency teleport chirp sweep
      const oscNode = ctx.createOscillator();
      oscNode.type = 'triangle';
      oscNode.frequency.setValueAtTime(400, ctx.currentTime);
      oscNode.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.25);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.25, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      oscNode.connect(oscGain);
      oscGain.connect(masterGain);
      oscNode.start();
      oscNode.stop(ctx.currentTime + 0.3);
      activeNodes.push(oscNode);
    }

    if (this.nodes[0] && this.nodes[0].gain) this.nodes[0].gain.gain.value = charge * 0.12;
    if (this.nodes[1] && this.nodes[1].gain) this.nodes[1].gain.gain.value = charge * 0.08;
  },
  stop() {
    this.burstTriggered = false;
  }
};

// ─── Public API ──────────────────────────────────────────────────────

let activeEngineId = null;

export function startGestureAudio(jutsuId) {
  if (!enabled) return;
  if (activeEngineId === jutsuId) return;
  stopGestureAudio();
  activeEngineId = jutsuId;
  const engine = audioEngines[jutsuId];
  if (engine) engine.start();
}

export function updateGestureAudio(jutsuId, charge) {
  if (!enabled || activeEngineId !== jutsuId) return;
  const engine = audioEngines[jutsuId];
  if (engine && engine.update) engine.update(charge);
}

export function stopGestureAudio() {
  if (activeEngineId) {
    const engine = audioEngines[activeEngineId];
    if (engine && engine.stop) engine.stop();
  }
  stopAllAudio();
  activeEngineId = null;
}

export function playUiTick() {
  if (!ctx || !enabled) return;
  try {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(800, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.07);
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    o.connect(g); g.connect(masterGain);
    o.start(); o.stop(ctx.currentTime + 0.08);
  } catch(e){}
}
