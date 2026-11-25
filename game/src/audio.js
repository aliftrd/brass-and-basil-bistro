// Synthesized Web Audio sound cues for chopping, sizzling, assembly, and service bell.

export function createKitchenAudio() {
  let ctx = null;
  let muted = false;

  function ensureContext() {
    if (muted) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playTone(freq, duration, type = 'triangle', gainPeak = 0.08, slideTo = null) {
    try {
      const audio = ensureContext();
      if (!audio) return;
      const now = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo !== null) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
      }
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainPeak, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch {
      // Headless or restricted audio contexts fail silently.
    }
  }

  return {
    unlock() {
      ensureContext();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    playPickup() {
      playTone(420, 0.09, 'sine', 0.06, 560);
    },
    playChop() {
      playTone(190, 0.06, 'square', 0.05, 110);
    },
    playCookDone() {
      playTone(660, 0.14, 'triangle', 0.07, 880);
    },
    playAssemble() {
      playTone(520, 0.12, 'triangle', 0.07, 740);
    },
    playServe() {
      playTone(987, 0.22, 'sine', 0.09);
      setTimeout(() => playTone(1318, 0.34, 'sine', 0.08), 75);
    },
    playError() {
      playTone(170, 0.16, 'sawtooth', 0.05, 125);
    },
  };
}
