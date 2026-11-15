// Procedural Web Audio API Sound Synthesizer for KILNFIRE Engine
// Generates realistic tactical gunplay audio, C4 bomb beeps, hitmarkers, and explosions.
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function createAudioEngine() {
  function playNoise(duration, decay, filterFreq = 1000) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decay);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + duration);
  }

  function playTone(freq, duration, type = 'sine', gainVal = 0.2) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  return {
    gunshot(weaponKey) {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      if (weaponKey === 'sniper') {
        // High caliber thunderous punch
        playNoise(0.5, 0.45, 1200);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      } else if (weaponKey === 'rifle') {
        // Crisp assault rifle punch
        playNoise(0.25, 0.18, 2200);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);
        gain.gain.setValueAtTime(0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.14);
      } else if (weaponKey === 'smg') {
        // Fast snappy SMG pop
        playNoise(0.12, 0.08, 3000);
        playTone(320, 0.07, 'triangle', 0.25);
      } else {
        // Pistol: sharp snap
        playNoise(0.15, 0.11, 2600);
        playTone(280, 0.09, 'sine', 0.3);
      }
    },

    emptyClick() {
      playTone(800, 0.04, 'triangle', 0.1);
    },

    reload() {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      // Mag out clack
      playTone(400, 0.06, 'square', 0.12);
      // Mag insert click after delay
      setTimeout(() => playTone(650, 0.08, 'triangle', 0.18), 350);
      // Bolt rack click
      setTimeout(() => playTone(520, 0.07, 'square', 0.15), 900);
    },

    hitmarker(isHeadshot) {
      if (isHeadshot) {
        // High-pitched double metallic chime for lethal headshots
        playTone(1480, 0.12, 'sine', 0.35);
        setTimeout(() => playTone(2200, 0.15, 'triangle', 0.3), 30);
      } else {
        // Crisp tick
        playTone(950, 0.05, 'triangle', 0.22);
      }
    },

    bombBeep(fusePercent) {
      // Accelerating beep rate as fuse approaches zero
      const freq = fusePercent < 0.2 ? 1100 : 850;
      playTone(freq, 0.06, 'sine', 0.28);
    },

    bombPlanting() {
      playTone(720, 0.04, 'square', 0.1);
    },

    bombPlanted() {
      // Three ascending siren beeps
      playTone(600, 0.15, 'sawtooth', 0.25);
      setTimeout(() => playTone(800, 0.15, 'sawtooth', 0.25), 160);
      setTimeout(() => playTone(1050, 0.3, 'sawtooth', 0.3), 320);
    },

    bombDefused() {
      // Victory chime
      playTone(523.25, 0.15, 'sine', 0.25); // C5
      setTimeout(() => playTone(659.25, 0.15, 'sine', 0.25), 150); // E5
      setTimeout(() => playTone(783.99, 0.35, 'sine', 0.3), 300); // G5
    },

    explosion() {
      const ctx = getAudioContext();
      if (!ctx) return;
      playNoise(1.8, 1.4, 400);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.7, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    },

    footstep() {
      playTone(90, 0.04, 'sine', 0.08);
    },

    radioChirp() {
      playTone(1200, 0.03, 'sine', 0.1);
      setTimeout(() => playTone(900, 0.04, 'triangle', 0.08), 35);
    },

    roundWin() {
      playTone(440, 0.12, 'triangle', 0.2);
      setTimeout(() => playTone(554.37, 0.12, 'triangle', 0.2), 120);
      setTimeout(() => playTone(659.25, 0.35, 'triangle', 0.25), 240);
    },

    roundLoss() {
      playTone(330, 0.18, 'sawtooth', 0.2);
      setTimeout(() => playTone(293.66, 0.18, 'sawtooth', 0.2), 180);
      setTimeout(() => playTone(246.94, 0.45, 'sawtooth', 0.25), 360);
    },
  };
}

