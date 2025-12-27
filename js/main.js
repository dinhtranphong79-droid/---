import * as THREE from "https://unpkg.com/three@0.158.0/build/three.module.js";
import { FontLoader } from "https://unpkg.com/three@0.158.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://unpkg.com/three@0.158.0/examples/jsm/geometries/TextGeometry.js";
import { Firework } from "./fireworks.js";
import { initAudio, playFireworkSound } from "./audio.js";



let scene, camera, renderer, clock;
let raycaster, mouse;
let started = false;
let audioCtx;
const fireworks = [];
let fireworkTimer = 0;
let finaleShown = false;
let newYearText = null;
let phase = 1;
let showTime = 0;
let finaleCount = 0;

const MAX_FIREWORKS = 80;
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// =====================
// TAP TO START (AUDIO)
// =====================
document.getElementById("startScreen").addEventListener("click", async () => {
  if (started) return;
  started = true;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  await audioCtx.resume();

  await initAudio(audioCtx); // ✅ BẮT BUỘC await

  document.getElementById("startScreen").style.display = "none";

  initScene();
  animate();
});


// =====================
// INIT SCENE
// =====================
function initScene() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 20, 60);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("webgl"),
    antialias: !isIOS,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const moonLight = new THREE.DirectionalLight(0xffffff, 0.6);
  moonLight.position.set(50, 100, -50);
  scene.add(moonLight);

  // Mountains
  const mountainGeo = new THREE.PlaneGeometry(200, 200, 20, 20);
  mountainGeo.rotateX(-Math.PI / 2);
  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, flatShading: true });
  const mountains = new THREE.Mesh(mountainGeo, mountainMat);
  mountains.position.y = -5;
  scene.add(mountains);

  // Raycaster for pointer
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  window.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("resize", onResize);
}

// =====================
// FIREWORK MANAGEMENT
// =====================
function launchFirework(x = null, z = null, explodeHeight = null) {
  if (fireworks.length > MAX_FIREWORKS) return;

  const fw = new Firework(scene);

  fw.setPosition(
    x !== null ? x : (Math.random() - 0.5) * 60,
    0,
    z !== null ? z : (Math.random() - 0.5) * 60
  );

  fw.explodeHeight = explodeHeight !== null ? explodeHeight : Math.random() * 20 + 25;

  fireworks.push(fw);
  playFireworkSound();
}

function spawnShowFireworks(delta) {
  showTime += delta;

  // Phase timeline
  if (showTime < 10) phase = 1;
  else if (showTime < 25) phase = 2;
  else if (showTime < 35) phase = 3;
  else phase = 4;

  // Firework spawn logic
  switch (phase) {
    case 1:
      fireworkTimer += delta;
      if (fireworkTimer > 1.5) {
        launchFirework();
        fireworkTimer = 0;
      }
      break;
    case 2:
      fireworkTimer += delta;
      if (fireworkTimer > 0.8) {
        launchFirework();
        fireworkTimer = 0;
      }
      break;
    case 3:
      fireworkTimer += delta;
      if (fireworkTimer > 0.25) {
        launchFirework();
        launchFirework(); // Double explosion
        fireworkTimer = 0;
      }
      break;
    case 4:
      if (!finaleShown) {
        showHappyNewYear();
        finaleShown = true;
      }
      finaleShowFireworks(delta);
      break;
  }
}

function finaleShowFireworks(delta) {
  fireworkTimer += delta;
  if (fireworkTimer > 0.1 && finaleCount < 50) {
    launchFirework();
    fireworkTimer = 0;
    finaleCount++;
  }
}

// =====================
// POINTER / CUSTOM FIREWORK
// =====================
function spawnFireworkAt(target) {
  launchFirework(target.x, target.z, target.y);
}

function onPointerDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const skyPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 25);
  const hitPoint = new THREE.Vector3();

  if (raycaster.ray.intersectPlane(skyPlane, hitPoint)) {
    spawnFireworkAt(hitPoint);
  }
}

// =====================
// RESIZE
// =====================
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// =====================
// ANIMATION LOOP
// =====================
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Camera cinematic subtle movement
  camera.position.z = 60 + Math.sin(elapsed * 0.2) * 1.5;
  camera.position.x = Math.sin(elapsed * 0.1) * 5;

  if (newYearText) {
    newYearText.position.y = 25 + Math.sin(clock.elapsedTime * 2) * 0.5;
    newYearText.rotation.y += 0.003;
  }

  spawnShowFireworks(delta);

  // Update fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update(delta);
    if (fireworks[i].isDead()) {
      fireworks[i].dispose();
      fireworks.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

// =====================
// HAPPY NEW YEAR TEXT
// =====================
function showHappyNewYear() {
  if (newYearText) return;

 const loader = new FontLoader();
  loader.load("https://threejs.org/examples/fonts/helvetiker_bold.typeface.json", (font) => {
    const geo = new TextGeometry("HAPPY NEW YEAR", {
      font,
      size: 4,
      height: 1,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
    });
    geo.center();

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xffaa00,
      emissiveIntensity: 0.6,
    });

    newYearText = new THREE.Mesh(geo, mat);
    newYearText.position.set(0, 25, 0);
    scene.add(newYearText);
  });
}
