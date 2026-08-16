let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  audioCtx ??= new AudioContext();
  return audioCtx;
}

export function playChime(): void {
  const ac = ctx();
  const now = ac.currentTime;
  for (const [freq, start, dur] of [
    [784, 0, 0.18],
    [988, 0.16, 0.28],
  ] as const) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(0.12, now + start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.02);
  }
}

export function playRingTick(): void {
  const ac = ctx();
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = "triangle";
  osc.frequency.value = 660;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}
