// js/audio.js
let audioCtx;
let fireworkBuffer = null;

export function initAudio(context) {
  audioCtx = context;
  loadFireworkSound();
}

async function loadFireworkSound() {
  const response = await fetch("./assets/sounds/firework.mp3");
  const arrayBuffer = await response.arrayBuffer();
  fireworkBuffer = await audioCtx.decodeAudioData(arrayBuffer);
}

export function playFireworkSound() {
  if (!audioCtx || !fireworkBuffer) return;

  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();

  gainNode.gain.value = 0.6; // âm lượng pháo

  source.buffer = fireworkBuffer;
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  source.start(0);
}
