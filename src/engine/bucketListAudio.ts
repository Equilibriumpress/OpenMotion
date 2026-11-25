/**
 * MY BUCKET LIST · Original score and sound cues, no third-party samples.
 * Works in the existing 48 kHz stereo Web Audio offline mix for preview
 * and WebCodecs/MediaRecorder export. R4 cut points: 4.5 / 9 / 12 / 16s.
 */
const RATE=48000;
const cache=new Map<number,Promise<AudioBuffer>>();

function synthesize(durationSec:number):Promise<AudioBuffer>{
  const duration=Math.max(.5,durationSec);
  const ctx=new OfflineAudioContext(2,Math.ceil(duration*RATE),RATE);
  const at=(time:number)=>time*duration/20;

  const master=ctx.createGain();
  master.gain.setValueAtTime(.0001,0);
  master.gain.linearRampToValueAtTime(.22,at(.6));
  master.gain.linearRampToValueAtTime(.38,at(1.55));
  master.gain.linearRampToValueAtTime(.62,at(4.28));
  master.gain.linearRampToValueAtTime(.45,at(4.84));
  master.gain.setValueAtTime(.45,at(17.8));
  master.gain.linearRampToValueAtTime(.0001,duration);
  master.connect(ctx.destination);

  const filter=ctx.createBiquadFilter();
  filter.type='lowpass';
  filter.frequency.setValueAtTime(660,0);
  filter.frequency.exponentialRampToValueAtTime(2400,at(4.30));
  filter.frequency.exponentialRampToValueAtTime(1050,at(5.35));
  filter.frequency.setValueAtTime(1180,at(9));
  filter.frequency.exponentialRampToValueAtTime(1650,at(12.5));
  filter.frequency.exponentialRampToValueAtTime(820,at(19.9));
  filter.connect(master);

  const chords=[
    {start:0,end:4.5,freqs:[130.81,196,261.63]},
    {start:4.5,end:9,freqs:[146.83,220,293.66]},
    {start:9,end:12,freqs:[174.61,261.63,349.23]},
    {start:12,end:16,freqs:[130.81,196,329.63]},
    {start:16,end:20,freqs:[146.83,220,349.23]}
  ];
  for(const chord of chords){
    const start=at(chord.start),end=Math.min(duration,at(chord.end));
    const length=end-start;
    if(length<=.1)continue;
    for(let index=0;index<chord.freqs.length;index++){
      const oscillator=ctx.createOscillator();
      oscillator.type=index===0?'sine':'triangle';
      oscillator.frequency.setValueAtTime(chord.freqs[index],start);
      const envelope=ctx.createGain(),volume=index===0 ? .075 : .040;
      const rise=Math.min(.9,length*.24),fade=Math.min(.8,length*.22);
      envelope.gain.setValueAtTime(.0001,start);
      envelope.gain.linearRampToValueAtTime(volume,start+rise);
      envelope.gain.setValueAtTime(volume,Math.max(start+rise,end-fade));
      envelope.gain.linearRampToValueAtTime(.0001,end);
      oscillator.connect(envelope);envelope.connect(filter);
      oscillator.start(start);oscillator.stop(end);
    }
  }

  // Restrained cinematic pulse that accelerates through the map journey
  // and becomes calmer after the first real landscape appears.
  for(let second=0;second<duration-.35;second+=at(second < at(4.5) ? .83 : 1.0)){
    const oscillator=ctx.createOscillator();oscillator.type='sine';
    oscillator.frequency.setValueAtTime(82,second);
    oscillator.frequency.exponentialRampToValueAtTime(47,second+.29);
    const gain=ctx.createGain();
    gain.gain.setValueAtTime(.0001,second);
    gain.gain.linearRampToValueAtTime(.085,second+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,second+.32);
    oscillator.connect(gain);gain.connect(master);
    oscillator.start(second);oscillator.stop(second+.33);
  }

  // Original, reproducibly generated noise produces a short soft whoosh
  // at the map reveal, plus quieter transitions between photographed shots.
  const noise=ctx.createBuffer(1,Math.ceil(.9*RATE),RATE);
  const data=noise.getChannelData(0);
  let seed=1245873;
  for(let i=0;i<data.length;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    data[i]=seed/2147483648-1;
  }
  const whooshes=[
    {start:at(3.84),duration:at(.72),level:.032},
    {start:at(8.77),duration:at(.25),level:.011},
    {start:at(11.77),duration:at(.25),level:.011},
    {start:at(15.77),duration:at(.3),level:.016},
    {start:at(17.98),duration:at(.38),level:.014}
  ];
  for(const cue of whooshes){
    if(cue.start>=duration)continue;
    const end=Math.min(duration,cue.start+cue.duration);
    if(end-cue.start<.06)continue;
    const source=ctx.createBufferSource();source.buffer=noise;
    const bandpass=ctx.createBiquadFilter();bandpass.type='bandpass';
    bandpass.frequency.setValueAtTime(280,cue.start);
    bandpass.frequency.exponentialRampToValueAtTime(1850,end);
    bandpass.Q.value=.48;
    const envelope=ctx.createGain();
    envelope.gain.setValueAtTime(.0001,cue.start);
    envelope.gain.linearRampToValueAtTime(cue.level,cue.start+(end-cue.start)*.66);
    envelope.gain.exponentialRampToValueAtTime(.0001,end);
    source.connect(bandpass);bandpass.connect(envelope);
    envelope.connect(master);
    source.start(cue.start);source.stop(end);
  }

  // A low, non-distracting downbeat lands exactly on the first crater photo.
  // Later downbeats support rhythm without overwhelming the landscape.
  for(const [cut,volume] of [[4.5,.16],[9,.055],[12,.07],[16,.075]] as const){
    const start=at(cut);if(start>=duration)continue;
    const end=Math.min(duration,start+at(.4));
    if(end<=start+.01)continue;
    const oscillator=ctx.createOscillator();oscillator.type='sine';
    oscillator.frequency.setValueAtTime(105,start);
    oscillator.frequency.exponentialRampToValueAtTime(47,end);
    const envelope=ctx.createGain();
    envelope.gain.setValueAtTime(.0001,start);
    envelope.gain.linearRampToValueAtTime(volume,start+.012);
    envelope.gain.exponentialRampToValueAtTime(.0001,end);
    oscillator.connect(envelope);envelope.connect(master);
    oscillator.start(start);oscillator.stop(end);
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
