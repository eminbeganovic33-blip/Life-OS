/**
 * Lightweight Web Audio sound effects.
 * No external assets — all tones synthesized at runtime.
 * Honors a global `lifeOSSoundsEnabled` localStorage flag (default: enabled).
 */

let ctx = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // Resume if suspended (mobile autoplay policy)
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function isSoundsEnabled() {
  try {
    const v = localStorage.getItem("lifeOSSoundsEnabled");
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

export function setSoundsEnabled(enabled) {
  try {
    localStorage.setItem("lifeOSSoundsEnabled", enabled ? "true" : "false");
  } catch {}
}

export function getSoundsEnabled() {
  return isSoundsEnabled();
}

function tone({ freq, duration = 0.12, type = "sine", gain = 0.08, attack = 0.005, release = 0.06 }) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = audio.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + attack);
  g.gain.linearRampToValueAtTime(0, now + duration + release);
  osc.connect(g).connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + release + 0.02);
}

const SOUNDS = {
  click: () => tone({ freq: 540, duration: 0.04, type: "triangle", gain: 0.05 }),
  questCheck: () => {
    tone({ freq: 660, duration: 0.08, type: "sine", gain: 0.07 });
    setTimeout(() => tone({ freq: 880, duration: 0.1, type: "sine", gain: 0.07 }), 60);
  },
  levelUp: () => {
    tone({ freq: 523, duration: 0.1, type: "triangle", gain: 0.08 });
    setTimeout(() => tone({ freq: 659, duration: 0.1, type: "triangle", gain: 0.08 }), 90);
    setTimeout(() => tone({ freq: 784, duration: 0.18, type: "triangle", gain: 0.08 }), 180);
  },
  dayComplete: () => {
    tone({ freq: 523, duration: 0.12, type: "sine", gain: 0.09 });
    setTimeout(() => tone({ freq: 659, duration: 0.12, type: "sine", gain: 0.09 }), 100);
    setTimeout(() => tone({ freq: 784, duration: 0.12, type: "sine", gain: 0.09 }), 200);
    setTimeout(() => tone({ freq: 1047, duration: 0.22, type: "sine", gain: 0.09 }), 300);
  },
  workComplete: () => {
    tone({ freq: 880, duration: 0.15, type: "sine", gain: 0.1 });
    setTimeout(() => tone({ freq: 660, duration: 0.18, type: "sine", gain: 0.08 }), 160);
  },
  breakComplete: () => {
    tone({ freq: 440, duration: 0.12, type: "triangle", gain: 0.08 });
    setTimeout(() => tone({ freq: 660, duration: 0.18, type: "triangle", gain: 0.08 }), 130);
  },
  error: () => tone({ freq: 220, duration: 0.18, type: "sawtooth", gain: 0.06 }),
};

export function playSound(name) {
  if (!isSoundsEnabled()) return;
  const fn = SOUNDS[name];
  if (fn) fn();
}
