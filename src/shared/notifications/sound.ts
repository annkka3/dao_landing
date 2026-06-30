import type { NotificationKind } from "./notify";

/**
 * Tiny synthesized notification chime — no audio assets needed. Best-effort:
 * browsers may block audio before any user gesture has happened on the page,
 * so failures here are silently swallowed and never affect gameplay.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  if (!audioCtx) {
    try {
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") {
    void audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

interface Tone {
  freq: number;
  duration: number; // seconds
  delay: number; // seconds, relative to sequence start
}

const TONES_BY_KIND: Record<NotificationKind, Tone[]> = {
  success: [
    { freq: 880, duration: 0.08, delay: 0 },
    { freq: 1175, duration: 0.11, delay: 0.09 },
  ],
  info: [{ freq: 660, duration: 0.09, delay: 0 }],
  warning: [
    { freq: 587, duration: 0.08, delay: 0 },
    { freq: 587, duration: 0.08, delay: 0.15 },
  ],
  error: [{ freq: 311, duration: 0.18, delay: 0 }],
};

export function playNotifySound(kind: NotificationKind): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    for (const tone of TONES_BY_KIND[kind]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = tone.freq;

      const start = now + tone.delay;
      const end = start + tone.duration;

      // Linear envelope so each tone fades in/out instead of clicking.
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.16, start + 0.012);
      gain.gain.linearRampToValueAtTime(0, end);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    }
  } catch (err) {
    console.warn("Notification sound failed", err);
  }
}
