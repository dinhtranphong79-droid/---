// js/audio.js

let audioCtx;
let explosionBuffer = null;

// =====================
// INIT AUDIO (gọi sau Tap to Start)
// =====================
export async function initAudio(ctx) {
  audioCtx = ctx;

  // Load sound
  const response = await fetch("./assets/firework.mp3");
  const arrayBuffer = await response.arrayBuffer();
  explosionBuffer = await audioCtx.decodeAudioData(arrayBuffer);
}

// =====================
// PLAY SOUND (sync pháo)
// =====================
export function playFireworkSound(volume = 0.6) {
  if (!audioCtx || !explosionBuffer) return;

  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();

  gain.gain.value = volume;

  source.buffer = explosionBuffer;
  source.connect(gain).connect(audioCtx.destination);
  source.start();
}

