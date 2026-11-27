// Deterministic short foley cues, only for opted-in Human Side projects.
// No downloads, dependencies or changes to the existing Piper cache.
import fs from 'node:fs';
import path from 'node:path';
const SR=24000,TAU=Math.PI*2;
const cue=(time,type,volume=1)=>({time,type,volume});
export function prepareHumanSideSound(p,root){
 if(!p.scenes?.some(s=>s.doodle?.extras?.includes('human-side-v2')))return;
 if(!/^[a-z0-9-]+$/.test(p.slug))throw Error('Invalid Human Side slug');
 const src='assets/audio/'+p.slug+'-human-sfx.wav';
 if(!p.audioTracks?.some(t=>t.src===src))return;
 let at=0;const cues=[];
 for(const s of p.scenes){
  const value=k=>s.doodle?.extras?.find(v=>v.startsWith(k+':'))?.slice(k.length+1);
  const theme=value('theme')||'message',shot=value('shot');
  const duration=Number(s.durationSec);
  if(!Number.isFinite(duration)||duration<=0)throw Error('Invalid Human Side scene duration');
  const add=(dt,type,vol)=>{if(dt>=0&&dt+.25<duration)cues.push(cue(at+dt,type,vol));};
  if(s.doodle?.extras?.includes('human-side-v22')){
   const action=value('action');
   if(action==='scroll')for(let t=1.5+.32;t<duration-.25;t+=1.05)add(t,'swipe',.65);
   if(action==='time')for(let t=.25;t<duration-.25;t+=.65)add(t,'tick',.43);
   if(action==='repeat'){for(const t of [.2,1.0,3.04,3.47])add(t,'swipe',.68);add(1.7,'tick',.55);}
   if(action==='realize'){add(.2,'tap',.38);add(.65,'breath',.55);}
   if(action==='place'){for(let t=.18;t<2.1;t+=.294)add(t,'step',.52);add(3.0,'thud',.65);}
   if(action==='sit'){add(.5,'cloth',.5);add(1.05,'breath',.5);}
   at+=duration;continue;
  }
  if(s.doodle?.extras?.includes('human-side-v21')){
   if(theme==='rest'){
    if(shot==='setup')add(1.65,'cloth',.55);
    if(shot==='build')for(let t=.45;t<1.6;t+=.45)add(t,'paper',.52);
    if(shot==='turn')for(let t=.4;t<4.2;t+=1)add(t,'tick',.38);
    if(shot==='change'||shot==='resolve')add(.45,'breath',.62);
   }else if(theme==='mask'){
    if(shot==='setup')add(1.65,'room',.55);
    if(shot==='build')add(.3,'room',.5);
    if(shot==='turn')add(.6,'cloth',.62);
    if(shot==='change')add(.35,'breath',.5);
   }else if(theme==='loop'){
    if(shot==='setup'||shot==='build')for(let t=shot==='setup'?1.85:.35;t<duration-.4;t+=1.6)add(t,'swipe',.65);
    if(shot==='turn')add(.55,'tick',.45);
    if(shot==='change')add(1.6,'thud',.62);
   }else if(theme==='load'){
    if(shot==='setup')add(1.7,'thud',.55);
    if(shot==='build')for(let t=.85;t<3.6;t+=.85)add(t,'thud',.72);
    if(shot==='turn')add(.4,'breath',.6);
    if(shot==='change'){add(.55,'cloth',.55);add(2.05,'thud',.55);}
   }else if(theme==='crowd'){
    if(shot==='setup')add(1.7,'room',.68);
    if(shot==='build')for(let t=.25;t<duration-1.6;t+=1.55)add(t,'room',.55);
    if(shot==='turn')add(.4,'breath',.42);
    if(shot==='change'){add(.4,'step',.5);add(.85,'step',.45);}
   }
   if(shot==='resolve')add(.55,'breath',.36);
   at+=duration;continue;
  }
  if(shot==='message')add(1.62,theme==='waiting'?'tap':theme==='calendar'||theme==='feedback'?'paper':'ping',.7);
  if(shot==='worry'){
   if(theme==='waiting')for(let t=.6;t<Math.min(duration-.3,4.7);t+=.8)add(t,'tick',.43);
   else if(theme==='boundaries')for(let t=.4;t<Math.min(duration-.3,2.4);t+=.45)add(t,'paper',.52);
   else if(theme==='calendar'||theme==='feedback')add(.45,'paper',.65);
   else{add(.5,'tap',.4);add(1.1,'tap',.3);add(1.8,'tap',.3);}
  }
  if(shot==='calm')add(.65,'breath',.45);
  if(shot==='contrast'&&theme==='boundaries')add(.7,'paper',.55);
  if(shot==='reveal')add(.35,theme==='calendar'||theme==='feedback'?'paper':'ping',.72);
  at+=duration;
 }
 if(at>180)throw Error('Human Side sound exceeds maximum duration');
 const n=Math.round(at*SR),samples=new Float32Array(n);let seed=41351;
 for(const {time,type,volume} of cues){
  const length=type==='room'?1.3:type==='cloth' ? .34:type==='swipe' ? .23:type==='thud' ? .22:type==='step' ? .16:type==='breath' ? .52 : type==='ping' ? .26 : type==='paper' ? .21 : .07;
  let noise=0;
  for(let i=0;i<Math.round(SR*length);i++){
   const j=Math.round(time*SR)+i;if(j>=n)break;
   const t=i/SR,u=t/length,env=Math.min(1,t/.008)*Math.pow(Math.max(0,1-u),2);
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/2147483648-1;noise+=.12*(white-noise);
   let v=0;
   if(type==='ping')v=.19*(Math.sin(TAU*850*t)+.45*Math.sin(TAU*1275*t))*env;
   else if(type==='tick'||type==='tap')v=.13*(Math.sin(TAU*(type==='tick'?970:520)*t)+.5*white)*env;
   else if(type==='paper')v=.15*(white-noise)*env*(.55+.45*Math.sin(TAU*22*t));
   else if(type==='room')v=.22*noise*Math.sin(Math.PI*u)**2*(.55+.45*Math.sin(TAU*4.2*t)**2);
   else if(type==='cloth'||type==='swipe')v=.14*(white-noise)*Math.sin(Math.PI*u)**2*(.6+.4*Math.sin(TAU*15*t));
   else if(type==='thud'||type==='step')v=.16*(Math.sin(TAU*100*t)+.18*white)*env;
   else v=.14*noise*Math.sin(Math.PI*u)**2;
   samples[j]+=volume*v;
  }
 }
 const wav=Buffer.alloc(44+2*n);
 wav.write('RIFF',0);wav.writeUInt32LE(36+2*n,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(SR,24);wav.writeUInt32LE(SR*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(2*n,40);
 for(let i=0;i<n;i++)wav.writeInt16LE(Math.round(32767*Math.max(-1,Math.min(1,samples[i]))),44+i*2);
 const dest=path.join(root,'public',src);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,wav);
}
