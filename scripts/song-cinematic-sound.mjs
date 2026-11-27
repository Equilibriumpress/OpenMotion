// Original, non-melodic cinematic sound bed. Only opted-in song projects.
// No network access, new dependency or change to the shared Piper cache.
import fs from 'node:fs';
import path from 'node:path';
const SR=24000;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const x=clamp(v);return x*x*(3-2*x);};
const profiles={longing:[.22,.06,.02],shop:[.18,.03,.20],drive:[.58,.26,.02],return:[.15,.04,.05],reflection:[.23,.10,.01],road:[.40,.19,.02],night:[.17,.08,.01],symbol:[.18,.03,.02]};
const TAU=Math.PI*2;
export function prepareSongSound(project,root){
 if(!project.scenes?.some(s=>s.doodle?.extras?.includes('song-cinematic-v2')))return;
 if(!/^[a-z0-9-]+$/.test(project.slug))throw Error('Invalid song slug');
 const src='assets/the-song-explained/'+project.slug+'-sound.wav';
 if(!project.audioTracks?.some(a=>a.src===src))return;
 let at=0;
 const cues=project.scenes.map(s=>{const start=at;at+=Number(s.durationSec);const shot=s.doodle?.extras?.find(x=>x.startsWith('shot:'))?.slice(5);return {start,end:at,profile:profiles[shot]||profiles.longing};});
 if(!Number.isFinite(at)||at<=0||at>180)throw Error('Invalid song sound duration');
 const n=Math.round(at*SR),wav=Buffer.alloc(44+2*n);
 wav.write('RIFF',0);wav.writeUInt32LE(36+2*n,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(SR,24);wav.writeUInt32LE(SR*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(2*n,40);
 let seed=127491,low=0,mid=0,index=0;
 for(let i=0;i<n;i++){
  const t=i/SR;
  while(index<cues.length-1&&t>=cues[index].end)index++;
  const cue=cues[index],prev=cues[Math.max(0,index-1)],f=smooth((t-cue.start)/.8);
  const [pad,road,tick]=cue.profile.map((v,k)=>prev.profile[k]+(v-prev.profile[k])*f);
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/2147483648-1;low+=.015*(white-low);mid+=.13*(white-mid);
  const breathing=.65+.35*Math.sin(TAU*.12*t);
  // A continuous atmospheric tone, no quoted melody or song-specific chord progression.
  const tone=pad*breathing*(.10*Math.sin(TAU*48*t)+.06*Math.sin(TAU*73.4*t)+.026*Math.sin(TAU*119.3*t));
  const engine=road*(.3*low+.14*Math.sin(TAU*(31*t+.28*Math.sin(t*.9)))+.10*mid);
  const dt=t-Math.floor(t);const clock=tick*Math.exp(-dt*65)*Math.sin(TAU*760*dt)*.3;
  const env=smooth(t/1.1)*smooth((at-t)/1.8);
  wav.writeInt16LE(Math.round(32767*Math.max(-1,Math.min(1,(tone+engine+clock)*env))),44+i*2);
 }
 const dest=path.join(root,'public',src);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,wav);
}
