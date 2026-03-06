/**
 * Sound effects using Web Audio API — zero external files, fully offline.
 * All sounds are synthesized programmatically.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Check if sounds are enabled (persisted in localStorage) */
export function isSoundEnabled(): boolean {
  return localStorage.getItem('soundEnabled') !== 'false';
}

/** Toggle sound on/off */
export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem('soundEnabled', String(enabled));
}

// ─── UTILITY HELPERS ─────────────────────────────────────

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  startTime = 0,
) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
}

function playNoise(duration: number, volume = 0.05, startTime = 0) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 4000;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(ctx.currentTime + startTime);
}

// ─── SOUND EFFECTS ───────────────────────────────────────

/** Habit completed — bright, satisfying ascending double-ding */
export function playComplete() {
  if (!isSoundEnabled()) return;
  playTone(880, 0.15, 'sine', 0.12, 0);      // A5
  playTone(1174.66, 0.25, 'sine', 0.12, 0.08); // D6
  playNoise(0.08, 0.03, 0);                     // subtle sparkle
}

/** Undo completion — soft descending tone */
export function playUndo() {
  if (!isSoundEnabled()) return;
  playTone(660, 0.12, 'sine', 0.08, 0);   // E5
  playTone(440, 0.18, 'sine', 0.06, 0.06); // A4
}

/** XP earned — quick sparkle coin sound */
export function playXP() {
  if (!isSoundEnabled()) return;
  playTone(1318.51, 0.08, 'sine', 0.08, 0);    // E6
  playTone(1567.98, 0.08, 'sine', 0.08, 0.05);  // G6
  playTone(2093.00, 0.15, 'sine', 0.06, 0.10);  // C7
}

/** Level up — triumphant ascending arpeggio */
export function playLevelUp() {
  if (!isSoundEnabled()) return;
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5 E5 G5 C6 E6 G6
  notes.forEach((freq, i) => {
    playTone(freq, 0.25, 'sine', 0.10, i * 0.07);
    if (i >= 4) playTone(freq, 0.35, 'triangle', 0.06, i * 0.07); // harmony on top notes
  });
  playNoise(0.2, 0.04, 0.3); // celebratory sparkle
}

/** Tab / nav switch — very subtle soft click */
export function playTab() {
  if (!isSoundEnabled()) return;
  playTone(800, 0.04, 'sine', 0.05, 0);
  playNoise(0.03, 0.02, 0);
}

/** Subtle button tap — micro feedback */
export function playTap() {
  if (!isSoundEnabled()) return;
  playTone(600, 0.03, 'sine', 0.04, 0);
}

/** Timer start — short ascending beep */
export function playTimerStart() {
  if (!isSoundEnabled()) return;
  playTone(440, 0.06, 'square', 0.06, 0);
  playTone(660, 0.10, 'square', 0.06, 0.06);
}

/** Timer pause — soft double-tap */
export function playTimerPause() {
  if (!isSoundEnabled()) return;
  playTone(550, 0.05, 'sine', 0.06, 0);
  playTone(550, 0.05, 'sine', 0.06, 0.08);
}

/** Timer stop/complete — warm completion tone */
export function playTimerStop() {
  if (!isSoundEnabled()) return;
  playTone(523.25, 0.12, 'sine', 0.10, 0);      // C5
  playTone(659.25, 0.12, 'sine', 0.10, 0.08);    // E5
  playTone(783.99, 0.20, 'sine', 0.10, 0.16);    // G5
}

/** Delete / destructive action — low warning tone */
export function playDelete() {
  if (!isSoundEnabled()) return;
  playTone(300, 0.15, 'triangle', 0.08, 0);
  playTone(220, 0.25, 'triangle', 0.06, 0.08);
}

/** Create / success — positive ascending chime */
export function playCreate() {
  if (!isSoundEnabled()) return;
  playTone(659.25, 0.10, 'sine', 0.08, 0);     // E5
  playTone(783.99, 0.10, 'sine', 0.08, 0.06);   // G5
  playTone(1046.50, 0.20, 'sine', 0.10, 0.12);  // C6
}

/** Panel open — soft ascending whoosh */
export function playPanelOpen() {
  if (!isSoundEnabled()) return;
  playTone(350, 0.08, 'sine', 0.04, 0);
  playTone(500, 0.08, 'sine', 0.05, 0.03);
  playTone(700, 0.12, 'sine', 0.04, 0.06);
}

/** Panel close — soft descending whoosh */
export function playPanelClose() {
  if (!isSoundEnabled()) return;
  playTone(700, 0.08, 'sine', 0.04, 0);
  playTone(500, 0.08, 'sine', 0.04, 0.03);
  playTone(350, 0.12, 'sine', 0.03, 0.06);
}

/** Toggle on — bright chirp */
export function playToggleOn() {
  if (!isSoundEnabled()) return;
  playTone(800, 0.06, 'sine', 0.06, 0);
  playTone(1200, 0.10, 'sine', 0.06, 0.04);
}

/** Toggle off — descending chirp */
export function playToggleOff() {
  if (!isSoundEnabled()) return;
  playTone(1000, 0.06, 'sine', 0.05, 0);
  playTone(700, 0.10, 'sine', 0.04, 0.04);
}
