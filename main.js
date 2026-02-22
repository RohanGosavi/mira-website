// ═══════════════════════════════════════════════════════════
// MIRA — Main Application Script
// Three.js 3D Signing Avatar + ISL Animation Engine
//
// The avatar is a linguistic interface — not a character,
// not a mascot. It exists to produce sign language.
// ═══════════════════════════════════════════════════════════

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./style.css";

// ═══════════════════════════════════════════════════════════
// ISL SIGN DATA
// Pre-authored bone rotation DELTAS for each sign word.
// Values are ADDED to the bone's rest rotation, not absolute.
// Each sign has an array of keyframes.
// ═══════════════════════════════════════════════════════════

const ISL_SIGNS = {
  HELLO: [
    { rightupperarm: { x: 1.4, y: 0, z: 0 }, rightlowerarm: { x: 0, y: -1.1, z: 1.6 } },
    { rightupperarm: { x: 1.4, y: 0, z: 0 }, rightlowerarm: { x: 0.5, y: -1.1, z: 1.6 } },
    { rightupperarm: { x: 1.4, y: 0, z: 0 }, rightlowerarm: { x: 0, y: -1.1, z: 1.6 } },
  ],

  "THANK YOU": [
    {
      rightupperarm: { x: 0.9, y: 0, z: 0 }, rightlowerarm: { x: 0.8, y: 2.2, z: 0 },
      rightthumb: { x: 0, y: 0, z: 0.4 }, rightindexfinger: { x: 0, y: 0, z: -0.1 },
      rightindexfinger3: { x: 0, y: 0, z: -0.1 }, rightringfinger3: { x: 0, y: 0, z: 0.1 },
      rightlittlefinger3: { x: 0, y: 0, z: 0.2 },
    },
    {
      rightupperarm: { x: 0.9, y: 0, z: 0 }, rightlowerarm: { x: 0.8, y: 1.8, z: 0 },
      rightthumb: { x: 0, y: 0, z: 0.4 }, rightindexfinger: { x: 0, y: 0, z: -0.1 },
      rightindexfinger3: { x: 0, y: 0, z: -0.1 }, rightringfinger3: { x: 0, y: 0, z: 0.1 },
      rightlittlefinger3: { x: 0, y: 0, z: 0.2 },
    },
  ],

  "HOW YOU": [
    {
      rightshoulder: { x: -0.3, y: 0.1, z: 0 }, rightupperarm: { x: 0.4, y: -0.9, z: 0 },
      rightlowerarm: { x: 0, y: 0, z: 1.9 }, rightarm: { x: 1.4, y: 0.2, z: -0.1 },
      leftshoulder: { x: 0.3, y: -0.1, z: 0 }, leftupperarm: { x: 0.4, y: -0.9, z: 0 },
      leftlowerarm: { x: 0, y: 0, z: 1.9 }, lefthand: { x: 1.4, y: 0.2, z: -0.1 },
    },
    {
      rightshoulder: { x: -0.3, y: 0, z: 0 }, rightupperarm: { x: 0.3, y: -0.4, z: 0 },
      rightlowerarm: { x: 0, y: -1.6, z: 1.9 }, rightarm: { x: 0.8, y: 0.1, z: -0.2 },
      leftshoulder: { x: 0.3, y: 0, z: 0 }, leftupperarm: { x: 0.3, y: -0.4, z: 0 },
      leftlowerarm: { x: 0, y: -1.6, z: 1.9 }, lefthand: { x: 0.8, y: 0.1, z: -0.2 },
    },
    {
      rightupperarm: { x: 0.4, y: -0.5, z: 0.2 }, rightlowerarm: { x: 0.8, y: 0, z: 2.1 },
      rightarm: { x: -0.8, y: 0, z: 0 },
      rightthumb: { x: -0.3, y: 0.4, z: 0 }, rightthumb2: { x: 0, y: 0.1, z: 0 },
      rightthumb1: { x: -0.5, y: 0, z: -0.9 }, rightthumb1_end: { x: -0.7, y: 0, z: 0 },
      rightindexfinger3: { x: 0.1, y: 0.4, z: 0 }, rightindexfinger2: { x: 0, y: 0.9, z: 0 },
      rightindexfinger1: { x: 0, y: 1.2, z: 0 },
      leftupperarm: { x: 0.4, y: -0.5, z: 0.2 }, leftlowerarm: { x: 0.8, y: 0, z: 2.1 },
      lefthand: { x: -0.8, y: 0, z: 0 },
      leftthumb: { x: -0.3, y: 0.4, z: 0 }, leftthumb2: { x: 0, y: 0.1, z: 0 },
      leftthumb1: { x: -0.5, y: 0, z: -0.9 }, leftthumb1_end: { x: -0.7, y: 0, z: 0 },
      leftindexfinger3: { x: 0, y: 0.4, z: 0 }, leftindexfinger2: { x: 0.1, y: 0.9, z: 0 },
      leftindexfinger1: { x: 0, y: 1.2, z: 0 },
    },
    {
      rightshoulder: { x: -0.1, y: 0, z: 0 }, rightupperarm: { x: 0.4, y: -0.5, z: 0.2 },
      rightlowerarm: { x: 0.5, y: -0.2, z: 1.8 }, rightarm: { x: -0.8, y: 0, z: 0 },
      rightthumb: { x: -0.3, y: 0.4, z: 0 }, rightthumb2: { x: 0, y: 0.1, z: 0 },
      rightthumb1: { x: -0.5, y: 0, z: -0.9 }, rightthumb1_end: { x: -0.7, y: 0, z: 0 },
      rightindexfinger3: { x: 0.1, y: 0.4, z: 0 }, rightindexfinger2: { x: 0, y: 0.9, z: 0 },
      rightindexfinger1: { x: 0, y: 1.2, z: 0 },
      leftshoulder: { x: -0.1, y: 0, z: 0 }, leftupperarm: { x: 0.4, y: -0.5, z: 0.2 },
      leftlowerarm: { x: 0.5, y: -0.2, z: 1.8 }, lefthand: { x: -0.8, y: 0, z: 0 },
      leftthumb: { x: -0.3, y: 0.4, z: 0 }, leftthumb2: { x: 0, y: 0.1, z: 0 },
      leftthumb1: { x: -0.5, y: 0, z: -0.9 }, leftthumb1_end: { x: -0.7, y: 0, z: 0 },
      leftindexfinger3: { x: 0, y: 0.4, z: 0 }, leftindexfinger2: { x: 0.1, y: 0.9, z: 0 },
      leftindexfinger1: { x: 0, y: 1.2, z: 0 },
    },
    {
      rightupperarm: { x: 0.4, y: -0.5, z: 0.2 }, rightlowerarm: { x: 0.8, y: 0, z: 2.1 },
      rightarm: { x: -0.8, y: 0, z: 0 },
      rightthumb: { x: -0.3, y: 0.4, z: 0 }, rightthumb2: { x: 0, y: 0.1, z: 0 },
      rightthumb1: { x: -0.5, y: 0, z: -0.9 }, rightthumb1_end: { x: -0.7, y: 0, z: 0 },
      rightindexfinger3: { x: 0.1, y: 0.4, z: 0 }, rightindexfinger2: { x: 0, y: 0.9, z: 0 },
      rightindexfinger1: { x: 0, y: 1.2, z: 0 },
      leftupperarm: { x: 0.4, y: -0.5, z: 0.2 }, leftlowerarm: { x: 0.8, y: 0, z: 2.1 },
      lefthand: { x: -0.8, y: 0, z: 0 },
      leftthumb: { x: -0.3, y: 0.4, z: 0 }, leftthumb2: { x: 0, y: 0.1, z: 0 },
      leftthumb1: { x: -0.5, y: 0, z: -0.9 }, leftthumb1_end: { x: -0.7, y: 0, z: 0 },
      leftindexfinger3: { x: 0, y: 0.4, z: 0 }, leftindexfinger2: { x: 0.1, y: 0.9, z: 0 },
      leftindexfinger1: { x: 0, y: 1.2, z: 0 },
    },
  ],

  GOOD: [
    {
      rightshoulder: { x: 0.8, y: 0, z: -0.2 }, rightupperarm: { x: 0.3, y: -0.3, z: 0 },
      rightlowerarm: { x: 1.2, y: 1.8, z: 0.5 }, rightarm: { x: -1.1, y: -0.4, z: -0.1 },
      rightthumb2: { x: -0.9, y: 0, z: 1.2 },
      rightindexfinger: { x: 0, y: 0.4, z: 0 },
      rightindexfinger3: { x: 0, y: 1, z: 0 }, rightindexfinger2: { x: 0, y: 1.5, z: 0 },
      rightindexfinger1: { x: 0, y: 1.7, z: 0 },
      rightmiddlefinger3: { x: 0, y: 1, z: 0 }, rightmiddlefinger2: { x: 0, y: 1.5, z: 0 },
      rightmiddlefinger1: { x: 0, y: 1.7, z: 0 },
      rightringfinger3: { x: 0, y: 1, z: 0 }, rightringfinger2: { x: 0, y: 1.5, z: 0 },
      rightringfinger1: { x: 0, y: 1.7, z: 0 },
      rightlittlefinger3: { x: 0, y: 1, z: 0 }, rightlittlefinger2: { x: 0, y: 1.5, z: 0 },
      rightlittlefinger1: { x: 0, y: 1.7, z: 0 },
    },
    {
      rightshoulder: { x: 0.8, y: 0, z: -0.2 }, rightupperarm: { x: 0.3, y: -0.3, z: 0 },
      rightlowerarm: { x: 1.2, y: 1.8, z: 0.5 }, rightarm: { x: -1.1, y: -0.4, z: -0.1 },
      rightthumb2: { x: -0.9, y: 0, z: 1.2 },
      rightindexfinger: { x: 0, y: 0.4, z: 0 },
      rightindexfinger3: { x: 0, y: 1, z: 0 }, rightindexfinger2: { x: 0, y: 1.5, z: 0 },
      rightindexfinger1: { x: 0, y: 1.7, z: 0 },
      rightmiddlefinger3: { x: 0, y: 1, z: 0 }, rightmiddlefinger2: { x: 0, y: 1.5, z: 0 },
      rightmiddlefinger1: { x: 0, y: 1.7, z: 0 },
      rightringfinger3: { x: 0, y: 1, z: 0 }, rightringfinger2: { x: 0, y: 1.5, z: 0 },
      rightringfinger1: { x: 0, y: 1.7, z: 0 },
      rightlittlefinger3: { x: 0, y: 1, z: 0 }, rightlittlefinger2: { x: 0, y: 1.5, z: 0 },
      rightlittlefinger1: { x: 0, y: 1.7, z: 0 },
    },
  ],

  MORNING: [
    {
      rightshoulder: { x: 0, y: 0.3, z: 0 }, rightupperarm: { x: 0.2, y: -0.4, z: 0 },
      rightlowerarm: { x: 0.5, y: 1.9, z: 0.1 },
      rightthumb: { x: -1, y: 0, z: 0 },
      rightindexfinger3: { x: 0, y: 0.2, z: 0 }, rightindexfinger2: { x: 0, y: 0.7, z: 0 },
      rightindexfinger1: { x: 0, y: 0.6, z: 0 },
      rightmiddlefinger3: { x: 0, y: 0.3, z: 0 }, rightmiddlefinger2: { x: 0, y: 0.7, z: 0 },
      rightmiddlefinger1: { x: 0, y: 0.7, z: 0 },
      rightringfinger3: { x: 0, y: 0.4, z: 0 }, rightringfinger2: { x: 0, y: 0.7, z: 0 },
      rightringfinger1: { x: 0, y: 0.6, z: 0 },
      rightlittlefinger3: { x: 0, y: 0.3, z: 0 }, rightlittlefinger2: { x: 0, y: 0.8, z: 0 },
      rightlittlefinger1: { x: 0, y: 0.9, z: 0 },
    },
    {
      rightshoulder: { x: 0, y: 0.3, z: 0 }, rightupperarm: { x: 0.2, y: -0.4, z: 0 },
      rightlowerarm: { x: 0.5, y: 2.4, z: 0.1 },
      rightthumb: { x: 0, y: 0, z: 0 },
      rightindexfinger3: { x: 0, y: 0, z: 0 }, rightindexfinger2: { x: 0, y: 0, z: 0 },
      rightindexfinger1: { x: 0, y: 0, z: 0 },
      rightmiddlefinger3: { x: 0, y: 0, z: 0 }, rightmiddlefinger2: { x: 0, y: 0, z: 0 },
      rightmiddlefinger1: { x: 0, y: 0, z: 0 },
      rightringfinger3: { x: 0, y: 0, z: 0 }, rightringfinger2: { x: 0, y: 0, z: 0 },
      rightringfinger1: { x: 0, y: 0, z: 0 },
      rightlittlefinger3: { x: 0, y: 0, z: 0 }, rightlittlefinger2: { x: 0, y: 0, z: 0 },
      rightlittlefinger1: { x: 0, y: 0, z: 0 },
    },
  ],
};

// Phrase → sign word sequence
const PHRASE_TO_SIGNS = {
  "hello": ["HELLO"],
  "thank you": ["THANK YOU"],
  "how are you?": ["HOW YOU"],
  "good morning": ["GOOD", "MORNING"],
};

// Facial / non-body bones — excluded from sign animation
const FACIAL_BONES = new Set([
  "head_end", "Eye_R", "EyeEnd_R", "Eye_L", "EyeEnd_L", "Facial",
  "leftEyeBrow1", "leftEyeBrow2", "leftEyeBrow3",
  "rightEyeBrow1", "rightEyeBrow2", "rightEyeBrow3",
  "leftEyeUpLidMain", "leftEyeUpLid", "leftEyeUpLidEnd",
  "leftEyeLowLidMain", "leftEyeLowLid", "leftEyeLowLidEnd",
  "rightEyeLowLidMain", "rightEyeLowLid", "rightEyeLowLidEnd",
  "rightEyeUpLidMain", "rightEyeUpLid", "rightEyeUpLidEnd",
  "jaw", "jawend", "lowerlip", "group4", "lowerlipEND",
  "leftlipcorner", "group1", "leftlipcornerEND",
  "rightlipcorner", "group2", "rightlipcornerEND",
  "upperlip", "group3", "upperlipEND",
]);

// ═══════════════════════════════════════════════════════════
// EASING FUNCTIONS
// ═══════════════════════════════════════════════════════════

const smootherstep = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

// ═══════════════════════════════════════════════════════════
// PRE-ALLOCATED TEMP OBJECTS (avoid GC pressure in animation loop)
// ═══════════════════════════════════════════════════════════

const _euler = new THREE.Euler();
const _quatA = new THREE.Quaternion();
const _quatB = new THREE.Quaternion();
const _restQuat = new THREE.Quaternion();

// ═══════════════════════════════════════════════════════════
// FLATTEN CHUNKS — merge multi-word sign sequences
// Duplicates last frame of previous chunk for smooth transition
// ═══════════════════════════════════════════════════════════

function flattenChunksSmooth(chunks) {
  if (!chunks.length) return [];
  const result = [];
  let lastFrame = null;

  for (const chunk of chunks) {
    if (!chunk.length) continue;
    // Insert last frame of previous chunk as transition bridge
    if (lastFrame) {
      result.push(lastFrame);
    }
    for (const frame of chunk) {
      result.push(frame);
      lastFrame = frame;
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════
// ISL ANIMATOR
// Drives skeleton bones through keyframe sequences.
// Rotations are ADDITIVE: baseRotation + keyframeDelta.
// ALL body bones updated every frame — missing keypoints = {0,0,0} = rest.
// ═══════════════════════════════════════════════════════════

class ISLAnimator {
  constructor(model) {
    this.model = model;
    this.bones = {};              // boneName → THREE.Bone
    this.initialRotations = {};   // boneName → THREE.Euler (bind pose)
    this.bodyBoneNames = new Set(); // bones to animate (excludes facial)

    // Phase system: forward → hold → reset → done
    this.phase = "done";
    this.clock = 0;
    this.holdClock = 0;
    this.resetClock = 0;

    // Current animation frames (flattened from sign words)
    this.frames = [];
    this.onComplete = null;

    // Timing (in seconds, at 1x speed)
    this.FRAME_DURATION = 0.2;
    this.HOLD_DURATION = 0.12;
    this.RESET_DURATION = 0.8;

    this._init();
  }

  _init() {
    this.model.traverse((node) => {
      if (node.isBone) {
        this.bones[node.name] = node;
        this.initialRotations[node.name] = node.rotation.clone();
        // Only include non-facial bones in sign animation
        if (!FACIAL_BONES.has(node.name)) {
          this.bodyBoneNames.add(node.name);
        }
      }
    });
  }

  get isAnimating() {
    return this.phase !== "done";
  }

  hasPhrase(phrase) {
    return phrase.toLowerCase() in PHRASE_TO_SIGNS;
  }

  playPhrase(phrase) {
    // Stop any current animation
    if (this.isAnimating) {
      this.stop();
    }

    const key = phrase.toLowerCase();
    const signWords = PHRASE_TO_SIGNS[key];
    if (!signWords) return Promise.resolve();

    // Build frames: each sign word is a "chunk" of keyframes
    // flattenChunksSmooth merges them with transition bridges
    const chunks = [];
    for (const word of signWords) {
      const keyframes = ISL_SIGNS[word];
      if (!keyframes) continue;
      // Wrap each keyframe as { keypoints: {...} } to match reference format
      chunks.push(keyframes.map((kf) => ({ keypoints: kf })));
    }

    const frames = flattenChunksSmooth(chunks);
    if (!frames.length) return Promise.resolve();

    return new Promise((resolve) => {
      this.onComplete = resolve;
      this.frames = frames;
      this.phase = "forward";
      this.clock = 0;
      this.holdClock = 0;
      this.resetClock = 0;
    });
  }

  // Called every frame from the render loop
  // delta: seconds, already scaled by playback speed
  update(delta) {
    if (this.phase === "done") return;

    // ─── FORWARD: play through keyframes ───
    if (this.phase === "forward") {
      this.clock += delta;

      const totalDuration = this.FRAME_DURATION * (this.frames.length - 1);

      if (this.clock >= totalDuration) {
        // Apply the last frame fully
        const lastIdx = this.frames.length - 1;
        this._applyFrameLerp(this.frames[lastIdx], this.frames[lastIdx], 1);
        this.phase = "hold";
        this.holdClock = 0;
        return;
      }

      const rawIndex = Math.floor(this.clock / this.FRAME_DURATION);
      const index = Math.min(rawIndex, this.frames.length - 1);
      const next = Math.min(index + 1, this.frames.length - 1);
      const t = (this.clock % this.FRAME_DURATION) / this.FRAME_DURATION;

      this._applyFrameLerp(this.frames[index], this.frames[next], t);
    }

    // ─── HOLD: brief pause at final pose ───
    if (this.phase === "hold") {
      this.holdClock += delta;
      if (this.holdClock >= this.HOLD_DURATION) {
        this.phase = "reset";
        this.resetClock = 0;
      }
    }

    // ─── RESET: smoothly return all bones to rest pose ───
    if (this.phase === "reset") {
      this.resetClock += delta;
      const rawT = Math.min(this.resetClock / this.RESET_DURATION, 1);
      const t = easeOutQuart(rawT);

      this.bodyBoneNames.forEach((boneName) => {
        const bone = this.bones[boneName];
        if (!bone) return;
        const baseRot = this.initialRotations[boneName];
        if (!baseRot) return;

        _restQuat.setFromEuler(baseRot);
        bone.quaternion.slerp(_restQuat, t);
      });

      if (rawT >= 1) {
        this.phase = "done";
        if (this.onComplete) {
          this.onComplete();
          this.onComplete = null;
        }
      }
    }
  }

  // Interpolate between two frames for ALL body bones.
  // Missing keypoints default to {0,0,0} — i.e., rest pose (no delta).
  _applyFrameLerp(frameA, frameB, t) {
    const easedT = smootherstep(t);

    this.bodyBoneNames.forEach((boneName) => {
      const bone = this.bones[boneName];
      if (!bone) return;
      const baseRot = this.initialRotations[boneName];
      if (!baseRot) return;

      // Delta rotations — default to zero (rest pose) if bone not in keyframe
      const a = frameA.keypoints[boneName] ?? { x: 0, y: 0, z: 0 };
      const b = frameB.keypoints[boneName] ?? { x: 0, y: 0, z: 0 };

      // Frame A: base rotation + delta A
      _euler.set(baseRot.x + a.x, baseRot.y + a.y, baseRot.z + a.z, "XYZ");
      _quatA.setFromEuler(_euler);

      // Frame B: base rotation + delta B
      _euler.set(baseRot.x + b.x, baseRot.y + b.y, baseRot.z + b.z, "XYZ");
      _quatB.setFromEuler(_euler);

      // SLERP between the two poses
      _quatA.slerp(_quatB, easedT);
      bone.quaternion.copy(_quatA);
    });
  }

  // Stop animation and snap to rest pose
  stop() {
    this.phase = "done";
    this.frames = [];

    // Restore all body bones to bind pose
    this.bodyBoneNames.forEach((boneName) => {
      const bone = this.bones[boneName];
      if (!bone) return;
      const baseRot = this.initialRotations[boneName];
      if (baseRot) {
        bone.rotation.copy(baseRot);
      }
    });

    if (this.onComplete) {
      this.onComplete();
      this.onComplete = null;
    }
  }
}

// ─── State ───
const state = {
  isPlaying: true,
  speed: 1,
  currentPhrase: "",
  heroMixer: null,
  demoMixer: null,
  heroActions: [],
  demoActions: [],
  heroClock: new THREE.Clock(),
  demoClock: new THREE.Clock(),
  islAnimator: null,
};

// ─── Three.js Scene Setup ───
function createScene(
  container,
  { cameraY = 1.2, cameraZ = 2.5, fov = 35, dark = false } = {},
) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = new THREE.Scene();

  // Background gradient — dark (hero) or light (demo)
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  if (dark) {
    gradient.addColorStop(0, "#141428");
    gradient.addColorStop(1, "#1A1410");
  } else {
    gradient.addColorStop(0, "#F5F5F5");
    gradient.addColorStop(1, "#FAFAFA");
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 256);
  const bgTexture = new THREE.CanvasTexture(canvas);
  scene.background = bgTexture;

  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 100);
  camera.position.set(0, cameraY, cameraZ);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = dark ? 1.4 : 1.2;

  // Clear loading state and attach canvas
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // Lighting — warm saffron tones for dark mode, neutral for light
  const ambientLight = new THREE.AmbientLight(
    dark ? 0xfff0e0 : 0xffffff,
    dark ? 0.6 : 0.9,
  );
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, dark ? 1.2 : 1.0);
  mainLight.position.set(3, 5, 4);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(
    dark ? 0xf27a1a : 0xe0e7ff,
    dark ? 0.3 : 0.5,
  );
  fillLight.position.set(-3, 3, -2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(
    dark ? 0xf9730c : 0xfde68a,
    dark ? 0.4 : 0.2,
  );
  rimLight.position.set(0, 2, -5);
  scene.add(rimLight);

  // Orbit Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = Math.PI / 3;
  controls.maxPolarAngle = Math.PI / 1.8;
  controls.target.set(0, 1, 0);
  controls.update();

  return { scene, camera, renderer, controls };
}

// ─── Load MIRA Signing Avatar ───
const MODEL_PATH = `${import.meta.env.BASE_URL}mira-character.glb`;

function loadAvatar(scene, callback, { playAnimations = true } = {}) {
  const loader = new GLTFLoader();
  loader.load(
    MODEL_PATH,
    (gltf) => {
      const model = gltf.scene;

      // Center and scale for clear gesture visibility
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const targetHeight = 2.2;
      const scaleFactor = targetHeight / size.y;
      model.scale.setScalar(scaleFactor);
      model.position.x = -center.x * scaleFactor;
      model.position.y = -box.min.y * scaleFactor;
      model.position.z = -center.z * scaleFactor;

      scene.add(model);

      // Play animations only if requested (hero uses idle, demo does not)
      let mixer = null;
      const actions = [];
      if (gltf.animations && gltf.animations.length > 0 && playAnimations) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          action.play();
          actions.push(action);
        });
      }

      callback({ model, mixer, actions });
    },
    undefined,
    (error) => {
      console.error("MIRA avatar load error:", error);
    },
  );
}

// ─── Initialize Hero Scene ───
function initHeroScene() {
  const container = document.getElementById("hero-mira-viewer");
  if (!container) return;

  const { scene, camera, renderer, controls } = createScene(container, {
    cameraY: 1.0,
    cameraZ: 5,
    fov: 30,
    dark: true,
  });

  controls.target.set(0, 0.9, 0);
  controls.update();

  loadAvatar(scene, ({ mixer, actions }) => {
    state.heroMixer = mixer;
    state.heroActions = actions;
  });

  function animate() {
    requestAnimationFrame(animate);
    const delta = state.heroClock.getDelta();
    if (state.heroMixer) {
      state.heroMixer.update(delta);
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  const ro = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);
}

// ─── Initialize Demo Scene ───
function initDemoScene() {
  const container = document.getElementById("demo-mira-viewer");
  if (!container) return;

  const { scene, camera, renderer, controls } = createScene(container, {
    cameraY: 1.0,
    cameraZ: 5,
    fov: 32,
  });

  controls.target.set(0, 0.9, 0);
  controls.update();

  // Demo scene: no idle animation — avatar stands still, signs only on command
  loadAvatar(
    scene,
    ({ model }) => {
      // Create ISL animator from bind pose (before any mixer runs)
      state.islAnimator = new ISLAnimator(model);
    },
    { playAnimations: false },
  );

  function animate() {
    requestAnimationFrame(animate);
    const delta = state.demoClock.getDelta();

    // Drive ISL animation when active (delta in seconds, scaled by speed)
    if (state.islAnimator && state.islAnimator.isAnimating && state.isPlaying) {
      state.islAnimator.update(delta * state.speed);
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  const ro = new ResizeObserver(() => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);
}

// ─── Demo Input & Phrase Chips ───
function initDemoInteractions() {
  const input = document.getElementById("mira-input");
  const statusEl = document.getElementById("status-message");
  const chips = document.querySelectorAll(".phrase-chip");

  if (!input || !statusEl) return;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function simulateTranslation(phrase) {
    state.currentPhrase = phrase;

    // Stop any running animation
    if (state.islAnimator && state.islAnimator.isAnimating) {
      state.islAnimator.stop();
    }

    setStatus("Processing: restructuring to gloss...");

    setTimeout(() => {
      if (state.islAnimator && state.islAnimator.hasPhrase(phrase)) {
        const glossWords =
          PHRASE_TO_SIGNS[phrase.toLowerCase()]?.join(" + ") || phrase;
        setStatus(`Signing: ${glossWords}`);

        state.islAnimator.playPhrase(phrase).then(() => {
          setStatus(`Completed: "${phrase}"`);
        });
      } else {
        setStatus(
          `Sign data not available for "${phrase}". Demo vocabulary is limited.`,
        );
      }
    }, 800);
  }

  // Phrase chips
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const phrase = chip.dataset.phrase;
      input.value = phrase;

      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      simulateTranslation(phrase);
    });
  });

  // Input submission on Enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      chips.forEach((c) => c.classList.remove("active"));
      simulateTranslation(input.value.trim());
    }
  });
}

// ─── Playback Controls ───
function initPlaybackControls() {
  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  const speedBtns = document.querySelectorAll(".speed-btn");

  if (!playBtn || !pauseBtn) return;

  playBtn.addEventListener("click", () => {
    state.isPlaying = true;
    playBtn.classList.add("active");
    pauseBtn.classList.remove("active");
  });

  pauseBtn.addEventListener("click", () => {
    state.isPlaying = false;
    pauseBtn.classList.add("active");
    playBtn.classList.remove("active");
  });

  resetBtn.addEventListener("click", () => {
    state.isPlaying = true;
    playBtn.classList.add("active");
    pauseBtn.classList.remove("active");

    // Stop current ISL animation and return to rest
    if (state.islAnimator) {
      state.islAnimator.stop();
    }

    // Replay current phrase if one was selected
    if (state.currentPhrase && state.islAnimator) {
      const statusEl = document.getElementById("status-message");
      if (statusEl) {
        const glossWords =
          PHRASE_TO_SIGNS[state.currentPhrase.toLowerCase()]?.join(" + ") ||
          state.currentPhrase;
        statusEl.textContent = `Signing: ${glossWords}`;
      }
      state.islAnimator.playPhrase(state.currentPhrase).then(() => {
        if (statusEl) {
          statusEl.textContent = `Completed: "${state.currentPhrase}"`;
        }
      });
    }
  });

  speedBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      speedBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.speed = parseFloat(btn.dataset.speed);
    });
  });
}

// ─── Mobile Menu ───
function initMobileMenu() {
  const btn = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = !menu.classList.contains("hidden");
    menu.classList.toggle("hidden");
    btn.setAttribute("aria-expanded", !isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
    });
  });
}

// ─── Scroll Animations ───
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
}

// ─── Smooth Scroll for Nav Links ───
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ─── Initialize ───
document.addEventListener("DOMContentLoaded", () => {
  initHeroScene();
  initDemoScene();
  initDemoInteractions();
  initPlaybackControls();
  initMobileMenu();
  initScrollAnimations();
  initSmoothScroll();
});
