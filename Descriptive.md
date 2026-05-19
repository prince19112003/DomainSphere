# Project Architecture & Developer Customization Guide (Descriptive)

This document provides a comprehensive breakdown of the files and folders inside the **Anime Gesture Jutsu** codebase, explaining what each component does and how you can customize or modify them to introduce new features, tweak animations, or adjust performance.

---

## 📂 Directory Structure Overview

```text
anime-gesture-jutsu/
│
├── 📄 index.html             # Main entry point: Layout structure, overlays, modals, CDN scripts.
├── 📄 style.css              # Cyberpunk styles, animations, glowing FX, responsive design.
├── 📄 app.js                 # Main JS orchestrator: Camera, MediaPipe Hands tracker, debouncer loop.
├── 📄 gestures.js            # Math logic for classifying gestures and registered Jutsus database.
├── 📄 audio.js               # Web Audio API synthesizer for dynamic chakra sound effects.
│
├── 📂 effects/               # Three.js WebGL effects engine files.
│   ├── 📄 index.js           # Scene manager, resize coordinate system, shader pre-warming.
│   ├── 📄 rasengan.js        # Rasengan blue/white swirling particle sphere.
│   ├── 📄 chidori.js         # Chidori lightning strikes and blue electrical sparks.
│   ├── 📄 katon.js           # Katon Fire Style fireballs and flames.
│   ├── 📄 gojoDomain.js      # Infinite Void domain space/cosmos panels.
│   ├── 📄 sukunaDomain.js    # Malevolent Shrine bone structure domain overlay.
│   ├── 📄 hollowPurple.js    # Hollow Purple massive cosmic red/blue energy ball.
│   ├── 📄 wolverine.js       # Adamantium claws extending from hand knuckles.
│   ├── 📄 heartDomain.js     # Heart seal particle effect.
│   ├── 📄 teleport.js        # Shunshin speed/teleport smoke puffs.
│   ├── 📄 infiniteVoid.js    # Secondary Gojo domain setup (reference).
│   └── 📄 malevolentShrine.js# Secondary Sukuna domain setup (reference).
│
└── 📄 Launch_Jutsu.bat       # Local development server startup batch script.
```

---

## 📄 Detailed File Descriptions & Customization Guide

### 1. `index.html`
* **What it does:** Contains the layout skeleton of the application, including the Landing screen, HUD controls, Three.js and 2D canvas wrappers, console logger, modals, and CDN script tags for importing MediaPipe Hands, selfie segmentation, and Three.js.
* **If you change this file, what changes in the app:**
  * **Add/Modify HUD buttons:** Edit buttons inside `<div class="topbar-controls">` or sidebars to add new controls.
  * **Modify Codex List:** Edit the Jutsus Codex sidebar to list additional cards.
  * **Adjust Layout Structure:** Reorder sidebars, center arena, or popup overlay modals.
  * **CDN Libraries:** Upgrade Three.js or MediaPipe versions by changing script tags at the bottom.

### 2. `style.css`
* **What it does:** Standard CSS stylesheet. Implements glassmorphic containers, ancient cracked text styling, lightning sparkles, glowing borders, responsive mobile media queries, and the black hole vacuum suction animation.
* **If you change this file, what changes in the app:**
  * **Theme & Colors:** Edit custom variables (e.g. `--cyan`, `--red`, `--bg-dark`) to change the color scheme of the console.
  * **Transition Timings:** Modify `@keyframes vacuumClipping` or `@keyframes vacuumScale` to speed up/slow down the black hole transition.
  * **Glow/Flicker Effects:** Adjust `.electricFlicker` or `.reticle` parameters to increase or decrease glowing intensity.
  * **Mobile Layouts:** Edit mobile media queries (`@media (max-width: 768px)`) to change how widgets stack on phones.

### 3. `app.js`
* **What it does:** Orchestrates the core application loop. Initializes webcam media streams, manages MediaPipe Hands tracking, executes FPS trackers, updates log outputs, captures screenshots, and debounces gestures to prevent flickering.
* **If you change this file, what changes in the app:**
  * **Webcam Resolution:** Modify `widthVal` and `heightVal` constraints (default: 1280x720) to change video resolution quality.
  * **Debouncing Sensitivity:** Change `GESTURE_CONFIDENCE_FRAMES` (default: 5). Increasing it requires holding a hand pose longer; decreasing it triggers effects faster but increases flickering.
  * **Camera Hardware Toggles:** Customize `toggleCameraState()` to display custom offline layouts when the camera is paused.
  * **MediaPipe Configuration:** Tweak `minDetectionConfidence` or `minTrackingConfidence` (default: 0.72) to make the hand tracking more or less strict.

### 4. `gestures.js`
* **What it does:** The brain of the gesture classifier. Contains math logic using 3D finger landmarks (comparing distances between tips and joints) and holds the `GESTURE_REGISTRY` array listing all Jutsus (names, colors, descriptions, mudras).
* **If you change this file, what changes in the app:**
  * **Add a New Jutsu:** Add a new entry into `GESTURE_REGISTRY` with custom id, label, color, series, and hand pose configurations.
  * **Tweak Pose Classification Math:** Modify `classifyGesture()` thresholds (e.g., how close fingers must be to count as "pinched" or "fist") to improve recognition accuracy for specific hand shapes.

### 5. `audio.js`
* **What it does:** Utilizes the Web Audio API to synthesize real-time synthesized audio. Generates ambient energy hums, crackling lightning frequencies, fire whooshes, UI click tick sounds, and modulates pitches dynamically based on chakra charge levels.
* **If you change this file, what changes in the app:**
  * **Volume Levels:** Edit gain node values (e.g., `mainGain.gain.value`) to increase/decrease default volume.
  * **Sound Frequencies:** Tweak oscillator waveforms (`sawtooth`, `sine`, `triangle`) and filter frequencies inside `startGestureAudio` to change how Chidori/Rasengan audio sounds (e.g. higher pitch, deeper drone).
  * **Charge Modulation:** Modify `updateGestureAudio` to change how the pitch shifts when you open/close your hand to charge chakra.

### 6. `effects/index.js`
* **What it does:** Coordinates the Three.js WebGL scene, lighting, camera position, viewport rendering cycle, and pre-warms shaders to ensure lag-free switching between jutsus.
* **If you change this file, what changes in the app:**
  * **Effects Scaling/Positioning:** Modify `setHandPosition()` world coordinate mapping to adjust how closely effects follow the center of your palm.
  * **Scene Lighting:** Change colors or intensity of `AmbientLight` or `PointLight` to alter how 3D particles are lit.
  * **Pre-warm Timing:** Modify the `preWarmShaders()` timeout to adjust background compilation timing.

### 7. `effects/[jutsu_name].js`
* **What it does:** Individual files (e.g., `chidori.js`, `rasengan.js`, `katon.js`) implementing particle, mesh, and shader layouts for each jutsu.
* **If you change these files, what changes in the app:**
  * **Particle Count:** Adjust loops (e.g. `particleCount = 500`) to increase particle density (looks richer) or decrease it (runs faster on low-end devices).
  * **Visual Velocities:** Modify translation or rotational update steps (e.g., `positions[i] += velocity`) to make fire rise faster, sparks fly wilder, or orbits spin tighter.
  * **Colors:** Customize hex/RGB color parameters in particle materials to shift effects from standard styles to your own themed patterns.
