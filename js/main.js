import { Firework } from "./js/fireworks.js";
import { initAudio, playFireworkSound } from "./js/audio.js";

let raycaster, mouse;
let scene, camera, renderer;
let clock;
let started = false;
let audioCtx;
const fireworks = [];
let fireworkTimer = 0;

const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// =====================
// TAP TO START (AUDIO)
// =====================
document.getElementById("startScreen").addEventListener("click", async () => {
  if (started) return;
  started = true;

 audioCtx = new (window.AudioContext || window.webkitAudioContext)();
await audioCtx.resume();

initAudio(audioCtx); // 🔊 KHỞI TẠO ÂM THANH (QUAN TRỌNG)

document.getElementById("startScreen").style.display = "none";

init();
animate();

});

// =====================
// INIT SCENE
// =====================
function init() {
  clock = new THREE.Clock();
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, 60);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("webgl"),
    antialias: !isIOS,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const moonLight = new THREE.DirectionalLight(0xffffff, 0.6);
  moonLight.position.set(50, 100, -50);
  scene.add(moonLight);

  const mountainGeo = new THREE.PlaneGeometry(200, 200, 20, 20);
  mountainGeo.rotateX(-Math.PI / 2);

  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    flatShading: true
  });

  const mountains = new THREE.Mesh(mountainGeo, mountainMat);
  mountains.position.y = -5;
  scene.add(mountains);

  window.addEventListener("resize", onResize);
  raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();

window.addEventListener("pointerdown", onPointerDown);

}

// =====================
// FIREWORK SPAWN
// =====================
function launchFirework() {
  const fw = new Firework(scene);

  fw.setPosition(
    (Math.random() - 0.5) * 60,
    0,
    (Math.random() - 0.5) * 60
  );

  fw.explodeHeight = Math.random() * 20 + 25;

  fireworks.push(fw);
  playFireworkSound();
}

function spawnFireworkAt(target) {
  const fw = new Firework(scene);

  fw.setPosition(
    target.x,
    0,
    target.z
  );

  fw.explodeHeight = target.y;

  fireworks.push(fw);
  playFireworkSound();
}

function onPointerDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const skyPlane = new THREE.Plane(
    new THREE.Vector3(0, -1, 0),
    25
  );

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
// ANIMATE LOOP
// =====================
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  camera.position.z = 60 + Math.sin(elapsed * 0.2) * 1.5;

  fireworkTimer += delta;
  if (fireworkTimer > 1.2) {
    launchFirework();
    fireworkTimer = 0;
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    if (fireworks[i].isDead()) {
      fireworks[i].dispose();
      fireworks.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}
