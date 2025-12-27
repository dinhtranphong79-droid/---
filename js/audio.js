// js/audio.js

let audioCtx = null;
let explosionBuffer = null;

// =====================
// INIT AUDIO (sau Tap)
// =====================
export async function initAudio(ctx) {
  audioCtx = ctx;

  const response = await fetch("assets/firework.mp3");
  const arrayBuffer = await response.arrayBuffer();
  explosionBuffer = await audioCtx.decodeAudioData(arrayBuffer);
}

// =====================
// PLAY SOUND (sync)
// =====================
export function playFireworkSound(volume = 0.6) {
  if (!audioCtx || !explosionBuffer) return;

  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();

  gain.gain.value = volume;

  source.buffer = explosionBuffer;
  source.connect(gain);
  gain.connect(audioCtx.destination);

  source.start(0);
}
