/**
 * Original cinematic bucket-list score. No licensed music or samples.
 * Deterministic 48kHz stereo mix shared by Studio preview and MP4.
 */
const RATE=48000;
const cache=new Map<number,Promise<AudioBuffer>>();
function synthesize(durationSec:number):Promise<AudioBuffer>{
  const duration=Math.max(.5,durationSec);
  const ctx=new OfflineAudioContext(2,Math.ceil(duration*RATE),RATE);
  const bus=ctx.createGain();
  bus.gain.setValueAtTime(.0001,0);
  bus.gain.linearRampToValueAtTime(.32,2.3);
  bus.gain.linearRampToValueAtTime(.62,8.7);
  bus.gain.setValueAtTime(.49,Math.min(duration,9.9));
  bus.gain.setValueAtTime(.49,Math.max(9.9,duration-2.3));
  bus.gain.linearRampToValueAtTime(.0001,duration);
  bus.connect(ctx.destination);
  const lowpass=ctx.createBiquadFilter();
  lowpass.type='lowpass';lowpass.frequency.value=1120;
  lowpass.connect(bus);
  const chords=[
    {at:0,end:9,freqs:[130.81,196,261.63]},
    {at:9,end:13,freqs:[146.83,220,293.66]},
    {at:13,end:17,freqs:[174.61,261.63,349.23]},
    {at:17,end:21,freqs:[130.81,196,329.63]},
    {at:21,end:25,freqs:[146.83,220,349.23]}
  ];
  for(const chord of chords){
    if(chord.at>=duration)continue;
    const end=Math.min(chord.end,duration),length=end-chord.at;
    if(length<=.1)continue;
    for(let i=0;i<chord.freqs.length;i++){
      const o=ctx.createOscillator();
      o.type=i===0?'sine':'triangle';
      o.frequency.setValueAtTime(chord.freqs[i],chord.at);
      const gain=ctx.createGain();
      const volume=i===0?.051:.027;
      const rise=Math.min(1.0,length*.28);
      const fade=Math.min(.8,length*.25);
      gain.gain.setValueAtTime(.0001,chord.at);
      gain.gain.linearRampToValueAtTime(volume,chord.at+rise);
      gain.gain.setValueAtTime(volume,Math.max(chord.at+rise,end-fade));
      gain.gain.linearRampToValueAtTime(.0001,end);
      o.connect(gain);gain.connect(lowpass);o.start(chord.at);o.stop(end);
    }
  }
  // Gentle pulse doubles during the final portion of the globe zoom.
  for(let second=0;second<duration-.3;second+=second<5?1.08:.65){
    const o=ctx.createOscillator();
    o.type='sine';o.frequency.setValueAtTime(90,second);
    o.frequency.exponentialRampToValueAtTime(52,second+.29);
    const g=ctx.createGain();
    g.gain.setValueAtTime(.0001,second);
    g.gain.linearRampToValueAtTime(.065,second+.018);
    g.gain.exponentialRampToValueAtTime(.0001,second+.32);
    o.connect(g);g.connect(bus);o.start(second);o.stop(second+.33);
  }
  // Light landing/section markers.
  for(const at of [8.88,12.98,16.98,20.98]){
    if(at>=duration)continue;
    for(const partial of [523.25,784]){
      const o=ctx.createOscillator();o.type='sine';
      o.frequency.setValueAtTime(partial,at);
      const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,at);
      gain.gain.linearRampToValueAtTime(.039,at+.025);
      gain.gain.exponentialRampToValueAtTime(.0001,Math.min(duration,at+.64));
      o.connect(gain);gain.connect(bus);o.start(at);o.stop(Math.min(duration,at+.66));
    }
  }
  return ctx.startRendering();
}
export function createBucketListAudio(durationSec:number):Promise<AudioBuffer>{
  const key=Math.round(durationSec*100)/100;
  const existing=cache.get(key);
  if(existing)return existing;
  const created=synthesize(key).catch(error=>{cache.delete(key);throw error;});
  cache.set(key,created);
  return created;
}
