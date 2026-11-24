/**
 * Original, royalty-free ambient road-trip score synthesized in Web Audio.
 * The same deterministic buffer serves both preview and MP4 audio mixing.
 */
const cache = new Map<number, Promise<AudioBuffer>>();
const rate = 48000;
const chords = [
  { start: 0, end: 8, notes: [146.83, 220.00, 349.23] },
  { start: 8, end: 16, notes: [174.61, 261.63, 392.00] },
  { start: 16, end: 23, notes: [130.81, 196.00, 329.63] },
  { start: 23, end: 30, notes: [146.83, 220.00, 349.23] },
];
const cuts = [0, 3, 8, 11, 16, 19, 23, 26];
async function synthesize(durationSec: number): Promise<AudioBuffer> {
  const context = new OfflineAudioContext(2, Math.ceil(durationSec * rate), rate);
  const master = context.createGain();
  master.gain.setValueAtTime(0, 0);
  master.gain.linearRampToValueAtTime(.66, .8);
  master.gain.setValueAtTime(.66, Math.max(.9, durationSec - 1.8));
  master.gain.linearRampToValueAtTime(.001, durationSec);
  master.connect(context.destination);

  const lowpass = context.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 880;
  lowpass.Q.value = .6;
  lowpass.connect(master);

  for (const chord of chords) {
    if (chord.start >= durationSec) continue;
    const end = Math.min(chord.end, durationSec);
    for (let i = 0; i < chord.notes.length; i++) {
      const oscillator = context.createOscillator();
      oscillator.type = i === 0 ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(chord.notes[i], chord.start);
      const gain = context.createGain();
      const amplitude = i === 0 ? .056 : .029;
      gain.gain.setValueAtTime(.0001, chord.start);
      gain.gain.linearRampToValueAtTime(amplitude, Math.min(end, chord.start + 1.5));
      gain.gain.setValueAtTime(amplitude, Math.max(chord.start + 1.5, end - 1.5));
      gain.gain.linearRampToValueAtTime(.0001, end);
      oscillator.connect(gain);
      gain.connect(lowpass);
      oscillator.start(chord.start);
      oscillator.stop(end);
    }
  }

  // Low, soft transport rhythm. Entirely procedural, no licensed samples.
  for (let t = 0; t < durationSec - .2; t += 1.05) {
    const o = context.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(86, t);
    o.frequency.exponentialRampToValueAtTime(48, t + .25);
    const g = context.createGain();
    g.gain.setValueAtTime(.0001, t);
    g.gain.linearRampToValueAtTime(.085, t + .012);
    g.gain.exponentialRampToValueAtTime(.0001, t + .36);
    o.connect(g);g.connect(master);o.start(t);o.stop(t + .37);
  }

  // Subtle cinematic transition sounds with reproducible pseudo-random noise.
  let seed = 20261124;
  const random = () => { seed = (Math.imul(seed,1664525)+1013904223) >>> 0; return seed / 4294967296; };
  const frameCount = Math.round(.62 * rate);
  const noise = context.createBuffer(1, frameCount, rate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = random() * 2 - 1;
  for (const at of cuts) {
    if (at >= durationSec) continue;
    const src = context.createBufferSource();
    src.buffer = noise;
    const high = context.createBiquadFilter();
    high.type = 'bandpass';high.frequency.value = 920;high.Q.value = .47;
    const gain = context.createGain();
    gain.gain.setValueAtTime(.0001, at);
    gain.gain.linearRampToValueAtTime(.014, at + .13);
    gain.gain.exponentialRampToValueAtTime(.0001, at + .6);
    src.connect(high);high.connect(gain);gain.connect(master);
    src.start(at);src.stop(at + .62);
  }
  return context.startRendering();
}
export function createPremiumTravelAudio(durationSec: number): Promise<AudioBuffer> {
  const key = Math.round(durationSec * 100) / 100;
  const existing = cache.get(key);
  if (existing) return existing;
  const promise = synthesize(durationSec).catch(error => { cache.delete(key); throw error; });
  cache.set(key, promise);
  return promise;
}
