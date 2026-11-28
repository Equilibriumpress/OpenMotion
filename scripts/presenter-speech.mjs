import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Read the *existing final voice track* once. No new synthesizer or audio cache invalidation.
const FPS=30, RATE=12000, SAMPLES=RATE/FPS;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function envelope(file,seconds){
  const r=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-i',file,'-vn','-ac','1','-ar',String(RATE),'-f','s16le','pipe:1'],{timeout:20000,maxBuffer:Math.ceil(seconds*RATE*2+1024*1024)});
  if(r.status!==0||!r.stdout?.length)return null;
  const pcm=r.stdout,n=Math.ceil(seconds*FPS),rms=[];
  for(let i=0;i<n;i++){
    let sum=0,count=0;
    for(let j=i*SAMPLES;j<Math.min((i+1)*SAMPLES,pcm.length>>1);j++){
      const v=pcm.readInt16LE(j*2)/32768;sum+=v*v;count++;
    }
    rms.push(Math.sqrt(sum/Math.max(1,count)));
  }
  const voiced=rms.filter(x=>x>.004).sort((a,b)=>a-b);
  if(!voiced.length)return rms.map(()=>0);
  const peak=Math.max(.015,voiced[Math.floor((voiced.length-1)*.90)]),gate=Math.max(.004,peak*.075);
  return rms.map(x=>x<gate?0:Math.round(9*clamp(Math.pow((x-gate)/Math.max(.001,peak-gate),.62),0,1)));
}
// These are approximate text-driven visemes, NOT phoneme alignment.
// Map common English spellings to seven stylized mouth shapes plus closure.
function shapes(text){
  const tokens=String(text).toLowerCase().match(/th|sh|ch|oo|ou|ow|ee|ea|ai|[a-z]/g)??[];
  return tokens.map(x=>/^[mbp]$/.test(x)?0:/^(a|ai)$/.test(x)?1:/^(e|i|ee|ea|y)$/.test(x)?2:/^(o|ou|ow)$/.test(x)?3:/^(u|oo|w|q)$/.test(x)?4:/^[fv]$/.test(x)?5:/^(th|t|d|l|n|r)$/.test(x)?6:7);
}
function cueShape(cues,time){
  const c=cues.find(v=>v.startSec<=time&&time<v.endSec);
  if(!c)return 0;
  const v=shapes(c.text);if(!v.length)return 0;
  return v[Math.min(v.length-1,Math.floor(clamp((time-c.startSec)/Math.max(.001,c.endSec-c.startSec),0,.999999)*v.length))];
}
export function attachPresenterSpeech(p,rootDir,cues){
  if(!p.scenes?.some(s=>s.doodle?.extras?.includes('simply-explained-v2')))return;
  const voice=p.audioTracks?.find(t=>t.kind==='voiceover'&&typeof t.src==='string');
  if(!voice)return;
  const duration=p.scenes.reduce((n,s)=>n+s.durationSec,0);
  const audio=envelope(path.join(rootDir,'public',voice.src),duration);
  if(!audio)console.warn('[presenter] ffmpeg unavailable; approximate phrase-driven mouth timing for '+p.slug);
  let offset=0;
  for(const s of p.scenes){
    const count=Math.ceil(s.durationSec*FPS),energy=[],mouth=[];
    for(let i=0;i<count;i++){
      const t=offset+i/FPS,shape=cueShape(cues,t);
      const inCue=cues.some(c=>c.startSec<=t&&t<c.endSec);
      const level=audio?(audio[Math.round(t*FPS)]??0):(inCue?5:0);
      energy.push(level);
      // Audio gate controls silence. A voiced sound outside an estimated cue still
      // gets a neutral open shape rather than suppressing real speech.
      mouth.push(level===0?0:inCue?shape:1);
    }
    if(s.doodle?.extras?.includes('simply-explained-v2')){
      s.doodle.extras=s.doodle.extras.filter(x=>!/^host-(energy|mouth|speech-mode):/.test(x));
      s.doodle.extras.push('host-energy:'+energy.join(''),'host-mouth:'+mouth.join(''),'host-speech-mode:'+(audio?'audio-envelope-estimated-visemes':'estimated-phrases'));
    }
    offset+=s.durationSec;
  }
}
