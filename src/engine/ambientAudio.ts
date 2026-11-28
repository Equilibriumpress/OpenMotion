/**
 * Royalty-free procedural travel documentary soundscape synthesized via Web Audio API.
 * Produces a gentle Scottish-modal warm felt chord progression synchronized to the
 * 30-second editorial chapter rhythm, layered with subtle soft city wind ambience.
 * Zero external copyrighted audio files — works offline and on GitHub Pages.
 */

interface ChordStep {
  timeSec: number;
  notesHz: number[];
}

// D major / B minor / G major / A sus4 editorial documentary progression (synced to 0, 4, 9, 15, 21, 26s)
const DOCUMENTARY_CHORDS: ChordStep[] = [
  { timeSec: 0, notesHz: [146.83, 220.0, 293.66, 369.99, 440.0] }, // Dmaj9 (Opening)
  { timeSec: 4, notesHz: [123.47, 220.0, 293.66, 369.99, 493.88] }, // Bm7 (Edinburgh Castle)
  { timeSec: 9, notesHz: [196.0, 246.94, 293.66, 369.99, 440.0] }, // Gmaj9 (St Giles)
  { timeSec: 15, notesHz: [164.81, 246.94, 293.66, 369.99, 440.0] }, // Em9 (Canongate)
  { timeSec: 21, notesHz: [110.0, 220.0, 293.66, 329.63, 440.0] }, // Asus4 -> A (Holyrood)
  { timeSec: 26, notesHz: [146.83, 220.0, 293.66, 369.99, 587.33] }, // Dmaj add9 (Finale)
];

export class DocumentaryAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private lastChordIdx = -1;
  private running = false;
  private volume = 0.35;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.0001;
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  private startAmbience(ctx: AudioContext) {
    if (!this.masterGain || this.noiseNode) return;

    // 4-second seamless pink-tinted gentle city breeze buffer
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.95 * b2 + white * 0.048;
      // Smooth loop crossfade near ends
      const env = Math.min(1, i / 4000, (bufferSize - i) / 4000);
      data[i] = (b0 + b1 + b2) * 0.14 * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 340;
    filter.Q.value = 0.7;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.22;

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start();
    this.noiseNode = noise;
  }

  private triggerChord(ctx: AudioContext, notesHz: number[], durationSec = 5.6) {
    if (!this.masterGain) return;
    const now = ctx.currentTime;

    notesHz.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Warm mellow documentary pad + subtle felt chime on upper notes
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Slight natural detune for acoustic warmth
      osc.detune.setValueAtTime((idx % 2 === 0 ? 1 : -1) * 3.5, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(idx < 2 ? 620 : 1250, now);

      const peak = idx === 0 ? 0.13 : idx === notesHz.length - 1 ? 0.055 : 0.075;
      const stagger = idx * 0.11;
      noteGain.gain.setValueAtTime(0.0001, now + stagger);
      noteGain.gain.exponentialRampToValueAtTime(peak, now + stagger + 0.95);
      noteGain.gain.exponentialRampToValueAtTime(peak * 0.52, now + stagger + durationSec * 0.65);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + stagger + durationSec);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain!);

      osc.start(now + stagger);
      osc.stop(now + stagger + durationSec + 0.15);
      this.activeOscillators.push(osc);
      osc.onended = () => {
        this.activeOscillators = this.activeOscillators.filter((o) => o !== osc);
      };
    });
  }

  public start(timeSec: number) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    this.running = true;
    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.45);

    this.startAmbience(ctx);
    this.lastChordIdx = -1;
    this.syncTime(timeSec);
  }

  public syncTime(timeSec: number) {
    if (!this.running || !this.ctx) return;
    const t = ((timeSec % 30) + 30) % 30;

    let chordIdx = 0;
    for (let i = DOCUMENTARY_CHORDS.length - 1; i >= 0; i--) {
      if (t >= DOCUMENTARY_CHORDS[i].timeSec) {
        chordIdx = i;
        break;
      }
    }

    if (chordIdx !== this.lastChordIdx) {
      this.lastChordIdx = chordIdx;
      const nextStep = DOCUMENTARY_CHORDS[(chordIdx + 1) % DOCUMENTARY_CHORDS.length];
      const span =
        chordIdx < DOCUMENTARY_CHORDS.length - 1
          ? nextStep.timeSec - DOCUMENTARY_CHORDS[chordIdx].timeSec + 0.8
          : 4.5;
      this.triggerChord(this.ctx, DOCUMENTARY_CHORDS[chordIdx].notesHz, span);
    }
  }

  public stop() {
    this.running = false;
    this.lastChordIdx = -1;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);
    }
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
      } catch {
        // Ignore already stopped
      }
      this.noiseNode = null;
    }
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // Ignore
      }
    });
    this.activeOscillators = [];
  }

  public dispose() {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.masterGain = null;
    }
  }
}

/** Deterministic version of the original documentary score. */
export async function renderDocumentaryAudio(seconds:number):Promise<AudioBuffer>{
 const ctx=new OfflineAudioContext(2,Math.ceil(seconds*48000),48000),master=ctx.createGain();master.gain.value=.35;master.connect(ctx.destination);
 for(let base=0;base<seconds;base+=30)for(let i=0;i<DOCUMENTARY_CHORDS.length;i++){
  const step=DOCUMENTARY_CHORDS[i],start=base+step.timeSec,span=i+1<DOCUMENTARY_CHORDS.length?DOCUMENTARY_CHORDS[i+1].timeSec-step.timeSec+.8:4.5;
  step.notesHz.forEach((freq,j)=>{const at=start+j*.11;if(at>=seconds)return;const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();osc.type=j===0?'triangle':'sine';osc.frequency.value=freq;filter.type='lowpass';filter.frequency.value=j<2?620:1250;const peak=j===0?.13:j===step.notesHz.length-1?.055:.075;gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(peak,at+.95);gain.gain.exponentialRampToValueAtTime(peak*.52,at+span*.65);gain.gain.exponentialRampToValueAtTime(.0001,at+span);osc.connect(filter);filter.connect(gain);gain.connect(master);osc.start(at);osc.stop(at+span+.15);});
 }
 return ctx.startRendering();
}
