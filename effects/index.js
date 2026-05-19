/**
 * effects/index.js — Three.js Scene Registry & Effect Coordinator
 * Manages WebGL scene, camera, and effect lifecycle for all 7 Jutsus
 */

import { createRasengan }     from './rasengan.js';
import { createChidori }      from './chidori.js';
import { createGojoDomain }   from './gojoDomain.js';
import { createSukunaDomain } from './sukunaDomain.js';
import { createHollowPurple } from './hollowPurple.js';
import { createHeartDomain }  from './heartDomain.js';
import { createTeleport }     from './teleport.js';

const EFFECT_FACTORIES = {
  rasengan:  createRasengan,
  chidori:   createChidori,
  gojo:      createGojoDomain,
  sukuna:    createSukunaDomain,
  hollow:    createHollowPurple,
  heart:     createHeartDomain,
  teleport:  createTeleport,
};

export class EffectsEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.THREE = THREE; // global from CDN
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.activeEffectId = null;
    this.activeEffect = null;
    this.effectCache = {}; // cache instantiated effects for performance
    this.startTime = performance.now();
    this.onParticleCount = null; // callback(count)
    this.personScale = 1.0;
    this._init();
  }

  _init() {
    const T = this.THREE;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Renderer — transparent overlay on webcam feed
    this.renderer = new T.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setClearColor(0x000000, 0); // fully transparent background

    // Scene
    this.scene = new T.Scene();

    // Orthographic-style perspective camera (FOV=60, matches webcam feel)
    this.camera = new T.PerspectiveCamera(60, w / h, 0.01, 10);
    this.camera.position.z = 0.7;

    // Subtle ambient lighting
    this.scene.add(new T.AmbientLight(0xffffff, 0.5));
    const pt = new T.PointLight(0x00f0ff, 1.5, 2);
    pt.position.set(0, 0.5, 0.5);
    this.scene.add(pt);

    this._animate();
    // Warm up shaders to prevent lag on first gesture activation
    setTimeout(() => this.preWarmShaders(), 100);
  }

  preWarmShaders() {
    // Pre-instantiate all effects
    for (const id in EFFECT_FACTORIES) {
      if (!this.effectCache[id]) {
        this.effectCache[id] = EFFECT_FACTORIES[id](this.THREE);
        this.effectCache[id].group.visible = false;
        this.scene.add(this.effectCache[id].group);
      }
    }
    
    // Force WebGL to compile shaders immediately
    this.renderer.compile(this.scene, this.camera);
    
    // Remove from scene until actually activated
    for (const id in this.effectCache) {
      this.scene.remove(this.effectCache[id].group);
      this.effectCache[id].group.visible = true;
    }
  }

  resize(w, h) {
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Place active effect group at normalized hand position (0-1 coords → world coords) */
  setHandPosition(nx, ny, personScale = 1.0) {
    this.personScale = personScale;
    if (!this.activeEffect) return;
    // Convert normalized coords to world space
    const aspect = this.camera.aspect;
    const fov = this.camera.fov * Math.PI / 180;
    const dist = this.camera.position.z;
    const h = 2 * Math.tan(fov / 2) * dist;
    const w = h * aspect;
    // Flip X because webcam is mirrored
    const wx = (0.5 - nx) * w;
    const wy = (0.5 - ny) * h;
    this.activeEffect.group.position.set(wx, wy, 0);
  }

  /** Activate an effect by jutsu ID */
  activateEffect(jutsuId) {
    if (this.activeEffectId === jutsuId) return;
    this.deactivateEffect();
    this.activeEffectId = jutsuId;

    // Use cached effect or create new one
    if (!this.effectCache[jutsuId]) {
      const factory = EFFECT_FACTORIES[jutsuId];
      if (!factory) return;
      this.effectCache[jutsuId] = factory(this.THREE);
    }
    this.activeEffect = this.effectCache[jutsuId];
    this.scene.add(this.activeEffect.group);
  }

  /** Deactivate current effect */
  deactivateEffect() {
    if (this.activeEffect) {
      this.scene.remove(this.activeEffect.group);
      this.activeEffect = null;
    }
    this.activeEffectId = null;
  }

  /** Update active effect with charge level (0-1) */
  updateEffect(charge) {
    if (!this.activeEffect) return;
    const time = performance.now() - this.startTime;
    this.activeEffect.update(time, charge);
    
    // Scale the entire 3D effect group to match the person scale
    if (this.personScale !== 1.0) {
      this.activeEffect.group.scale.multiplyScalar(this.personScale);
    }

    if (this.onParticleCount && this.activeEffect.getParticleCount) {
      this.onParticleCount(this.activeEffect.getParticleCount());
    }
  }

  /** Update chakra aura color for active effect */
  setChakraColor(hex) {
    if (this.activeEffect && this.activeEffect.setColor) {
      this.activeEffect.setColor(hex);
    }
    // Also update cached effects
    Object.values(this.effectCache).forEach(e => { if (e.setColor) e.setColor(hex); });
  }

  _animate() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this._animate());
  }

  /** Returns count of currently active particles */
  getParticleCount() {
    return this.activeEffect?.getParticleCount?.() ?? 0;
  }

  dispose() {
    this.renderer.dispose();
  }
}
