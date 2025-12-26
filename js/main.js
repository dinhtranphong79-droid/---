let scene, camera, renderer;
let clock;
let started = false;
let audioCtx;

// Detect iOS
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// =====================
// TAP TO START (AUDIO)
// =====================
document.getElementById("startScreen").addEventListener("click", async () => {
  if (started) return;
  started = true;

  // AudioContext cho iOS
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  await audioCtx.resume();

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

  // CAMERA
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, 60);
  camera.lookAt(0, 0, 0);

  // RENDERER
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("webgl"),
    antialias: !isIOS,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000);

  // LIGHTS
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const moonLight = new THREE.DirectionalLight(0xffffff, 0.6);
  moonLight.position.set(50, 100, -50);
  scene.add(moonLight);

  // PLACEHOLDER – NÚI (LOW POLY)
  const mountainGeo = new THREE.PlaneGeometry(200, 200, 20, 20);
  mountainGeo.rotateX(-Math.PI / 2);

  const mountainMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    flatShading: true
  });

  const mountains = new THREE.Mesh(mountainGeo, mountainMat);
  mountains.position.y = -5;
  scene.add(mountains);

  // RESIZE
  window.addEventListener("resize", onResize);
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

  const elapsed = clock.getElapsedTime();

  // Camera chuyển động rất nhẹ (cinematic)
  camera.position.z = 60 + Math.sin(elapsed * 0.2) * 1.5;

  renderer.render(scene, camera);
}
