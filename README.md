# 🌌 DomainSphere — Hand Gesture Power System

```
 ______   ______   .___  __.  ______   __  .__   __.      _______. .______    __    __   _______ .______       _______ 
|  __  \ /  __  \  |   \/   | /  __  \ |  | |  \ |  |     /       | |   _  \  |  |  |  | |   ____||   _  \     |   ____|
|  |  |  |  |  |  | |  \  /  | |  |  |  | |  | |   \|  |    |   (----` |  |_)  | |  |__|  | |  |__   |  |_)  |    |  |__   
|  |  |  |  |  |  | |  |\/|  | |  |  |  | |  | |  . `  |     \   \     |   ___/  |   __   | |   __|  |      /     |   __|  
|  `--'  |  `--'  | |  |  |  | |  `--'  | |  | |  |\   | .----)   |    |  |      |  |  |  | |  |____ |  |\  \----.|  |____ 
|_______/ \______/  |__|  |__|  \______/  |__| |__| \__| |_______/     | _|      |__|  |__| |_______|| _| `._____||_______|

                                    [ ドメインスフィア — Version 1.0 ]
```

**DomainSphere** is a premium, real-time interactive web sandbox that tracks hand gestures via your webcam using **Google MediaPipe Hands** & **Selfie Segmentation** and materializes high-performance **Three.js (WebGL)** 3D chakra animations coupled with a procedural **Web Audio API** synthesizer. 

It is designed with a premium, sleek **Obsidian Black & Neon Shadow** cyberpunk dashboard aesthetic, running 100% locally and privately in your browser.

---

## 🌟 Key Features

*   🎭 **Background Silhouette Segmentation:** Isolates your body profile in real-time, compositing it over a pure black canvas to emphasize glowing neon 3D effects.
*   📐 **Dual-Hand Landmark Tracking:** Supports real-time tracking of up to two hands at once, calculating center points to position 3D effects right at the core of your gestures.
*   🎹 **Procedural Audio Synthesizer:** Features dynamic oscillators, bandpass filters, noise generators, and timers matching each specific Jutsu (sub-bass heartbeats, lightning crackles, roaring fire sweeps, wind swirls).
*   📊 **Real-Time Performance HUD:** Features live diagnostics showing FPS, latency (ms), active particle counts, and rendering toggles.
*   📸 **Snap Jutsu Screenshot:** Instantly capture, crop, and download stylized wallpaper captures of your activated chakra domains.

---

## 🗃️ Jutsu Codex & Gesture Guide

| Jutsu | Mudra / Hand Gesture | 3D Visualization Effect | Synthesized Audio Aura |
| :--- | :--- | :--- | :--- |
| **💨 Body Flicker** | **Joined Closed Fists:** Form tight closed fists with BOTH hands and press them together knuckle-to-knuckle | Thick rapidly expanding ninja smoke screen puffs and teal sparkles | High-speed sweep transition with a soft smoke bomb explosion burst |
| **💖 Heart Sanctuary** | **Dual Hand Heart:** Form a heart shape using BOTH hands (thumbs touching and index fingers touching), wrists slightly separated | Pulsing 3D particle heart structure, swirling pink orbital rings, and warm rising sparkles | Rhythmic dual sub-bass heartbeat thumps (`55Hz` & `50Hz`) & high chimes |
| **🌀 Rasengan** | Flat, wide open palm facing the camera | Roaring double-torus wind vortex sphere with ambient blue orbital rings | Swirling white noise wind generator with frequency modulations |
| **⚡ Chidori** | Closed fist facing the camera | Violent electrical particle field with branching lightning arcs | High-frequency sweep with metal crackle noise |
| **🔮 Infinite Void** | **Horns (Back Faced):** Extend index and pinky fingers, fold middle and ring, with back of hand facing camera | Cosmic starfield background, expanding deep-blue rings, and stardust clusters | Echoing cosmic sweeps and detuned phase modulators |
| **💀 Malevolent Shrine** | **Enmaten Mudra (Dual):** Bring BOTH hands together, palms inclined facing each other, wrists close, fingers pointing straight up (NOT crossed) | Blood-red domain fog, expanding crimson circles, and flying ash embers | Eerie low-frequency drone pad |
| **🟣 Hollow Purple** | Pinch thumb and index tips together, rest folded | Colliding red & blue energy spheres merging into an intense purple blast | Sparking blue/red dual tones colliding into a massive discharge |

---

## 🚀 Getting Started

### Prerequisites
You only need a modern web browser (Chrome, Edge, or Firefox recommended for optimal WebGL/Web Audio performance) and a webcam.

### Running the App
1.  **Quick Start (Windows):**
    Double-click the [`Launch_Jutsu.bat`](file:///c:/Users/princ/.gemini/antigravity/scratch/anime-gesture-jutsu/Launch_Jutsu.bat) script in the root directory.
    *   This will launch a local server at `http://localhost:5700`.
    *   It will automatically open the dashboard in your default browser.
2.  **Manual Start:**
    Open terminal in this directory and execute:
    ```bash
    python -m http.server 5700
    ```
    Then visit `http://localhost:5700` in your web browser.

---

## 🛠️ Architecture & Under the Hood

### 1. Hand Tracking Pipeline
*   **MediaPipe Segmentation:** Passes the webcam feed into the `SelfieSegmentation` model to separate the person silhouette from the background.
*   **MediaPipe Hands:** Coordinates from the composite canvas are piped to `Hands` with `maxNumHands: 2` configuration.
*   **Tracking Loop:** In [`app.js`](file:///c:/Users/princ/.gemini/antigravity/scratch/anime-gesture-jutsu/app.js), the `onHandResults` callback calculates the average coordinates of the palms. If coordinates throw exceptions, it is safely captured inside an execution sandbox block to guarantee high stability.

### 2. Rendering System
*   **Three.js Canvas Overlay:** Procedural WebGL meshes are drawn on top of the webcam feed. Mesh geometries, colors, scaling, and rotation states update instantly based on the gesture classification charge levels (`0.0` to `1.0`).
*   **Custom Particle Factories:** Effects are generated through modular factories inside the `effects/` folder (e.g., [`effects/heartDomain.js`](file:///c:/Users/princ/.gemini/antigravity/scratch/anime-gesture-jutsu/effects/heartDomain.js), [`effects/sukunaDomain.js`](file:///c:/Users/princ/.gemini/antigravity/scratch/anime-gesture-jutsu/effects/sukunaDomain.js)).

### 3. Audio System
*   **Web Audio API Synth:** Purely software-synthesized audio nodes. No heavy mp3 files to load. Soundwaves, filters, and oscillators start, update, and terminate exactly in sync with the gesture activation.

---

## 🎛️ HUD Controls

*   **Initialize Chakra Sync:** Grants camera access and spins up the tracking threads.
*   **Chakra Color:** Pick a customized base color to override or tint the default color signatures of your activated Jutsus.
*   **Show Skeleton:** Toggles the cyan landmark mesh overlay drawn over your hands.
*   **Sound:** Toggle audio synthesis on or off.
*   **Snap Jutsu:** Click to capture your current pose with its active 3D particles overlayed and download it.
*   **Jutsu Codex Cards:** Click on any card in the right sidebar to open a popup detailing step-by-step mudra instructions and visual guides.
