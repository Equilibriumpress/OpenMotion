/**
 * Original soft background score for hand-drawn explainers.
 * Synthesized offline with Web Audio; no uploaded TikTok sounds or samples.
 */
const RATE=48000;
const buffers=new Map<number,Promise<AudioBuffer>>();
const notes=[261.63,293.66,329.63,392,440,523.25,587.33,659.25];
function generate(seconds:number):Promise<AudioBuffer>{
 const ctx=new OfflineAudioContext(2,Math.ceil(seconds*RATE),RATE);
 const main=ctx.createGain();
 main.gain.setValueAtTime(.0001,0);
 main.gain.linearRampToValueAtTime(.45,1.6);
 main.gain.setValueAtTime(.45,Math.max(1.6,seconds-2.5));
 main.gain.linearRampToValueAtTime(.0001,seconds);
 main.connect(ctx.destination);
 const filter=ctx.createBiquadFilter();
 filter.type='lowpass';filter.frequency.value=1850;filter.Q.value=.4;
 filter.connect(main);

 // A light, original repeating motif at low volume so narration stays audible.
 for(let beat=0;beat<seconds;beat+=.77){
   const index=Math.floor(beat/.77);
   const frequency=notes[[0,2,4,1,3,2,5,4][index%8]];
   const o=ctx.createOscillator();o.type='triangle';
   o.frequency.value=frequency;
   const g=ctx.createGain();
   g.gain.setValueAtTime(.0001,beat);
   g.gain.linearRampToValueAtTime(.020,beat+.018);
   g.gain.exponentialRampToValueAtTime(.0001,Math.min(seconds,beat+.58));
   o.connect(g);g.connect(filter);o.start(beat);o.stop(Math.min(seconds,beat+.61));
 }
 for(let segment=0;segment<seconds;segment+=8){
   const ends=Math.min(seconds,segment+8);
   for(const freq of [130.81,164.81,196]){
     const oscillator=ctx.createOscillator();oscillator.type='sine';oscillator.frequency.value=freq;
     const gain=ctx.createGain();
     gain.gain.setValueAtTime(.0001,segment);
     gain.gain.linearRampToValueAtTime(.013,Math.min(ends,segment+.9));
     gain.gain.setValueAtTime(.013,Math.max(segment+.9,ends-.8));
     gain.gain.linearRampToValueAtTime(.0001,ends);
     oscillator.connect(gain);gain.connect(main);
     oscillator.start(segment);oscillator.stop(ends);
   }
 }
 // Short neutral transition chimes at topic changes.
 for(const start of [0,5,11,20,25,33,39,47,51,59]){
   if(start>=seconds)continue;
   const bell=ctx.createOscillator();bell.type='sine';bell.frequency.value=784;
   const gain=ctx.createGain();
   gain.gain.setValueAtTime(.0001,start);
   gain.gain.linearRampToValueAtTime(.026,start+.012);
   gain.gain.exponentialRampToValueAtTime(.0001,Math.min(start+.5,seconds));
   bell.connect(gain);gain.connect(main);
   bell.start(start);bell.stop(Math.min(start+.52,seconds));
 }
 return ctx.startRendering();
}
export function createDoodleExplainerAudio(seconds:number):Promise<AudioBuffer>{
 const duration=Math.max(.5,Math.round(seconds*100)/100);
 const cached=buffers.get(duration);if(cached)return cached;
 const promise=generate(duration).catch(error=>{buffers.delete(duration);throw error;});
 buffers.set(duration,promise);return promise;
}
