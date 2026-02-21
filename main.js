// ═══════════════════════════════════════════════════════════
// MIRA — Main Application Script
// Three.js 3D Signing Avatar + UI Interactions
//
// The avatar is a linguistic interface — not a character,
// not a mascot. It exists to produce sign language.
// ═══════════════════════════════════════════════════════════

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./style.css";

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

  // Orbit Controls — allow user to inspect gestures from different angles
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
// Every gesture is pre-authored and deterministic.
// The avatar is a linguistic interface, not a character.
const MODEL_PATH = `${import.meta.env.BASE_URL}mira-character.glb`;

function loadAvatar(scene, callback) {
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

      // Play animations — these represent pre-authored sign sequences
      let mixer = null;
      const actions = [];
      if (gltf.animations && gltf.animations.length > 0) {
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

  // Adjust orbit target to center on full body
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

  // Responsive resize
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

  // Adjust orbit target to center on full body
  controls.target.set(0, 0.9, 0);
  controls.update();

  loadAvatar(scene, ({ mixer, actions }) => {
    state.demoMixer = mixer;
    state.demoActions = actions;
  });

  function animate() {
    requestAnimationFrame(animate);
    const delta = state.demoClock.getDelta();
    if (state.demoMixer && state.isPlaying) {
      state.demoMixer.update(delta * state.speed);
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Responsive resize
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
// Status messages are factual, not performative.
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
    setStatus("Processing: restructuring to gloss...");

    // Simulate the deterministic pipeline
    setTimeout(() => {
      setStatus(`Signing: "${phrase}"`);

      // Reset animations to show sign sequence from beginning
      if (state.demoMixer) {
        state.demoActions.forEach((action) => {
          action.reset();
          action.play();
        });
      }
    }, 1000);
  }

  // Phrase chips
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const phrase = chip.dataset.phrase;
      input.value = phrase;

      // Visual active state
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

    if (state.demoMixer) {
      state.demoActions.forEach((action) => {
        action.reset();
        action.play();
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

  // Close on link click
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
