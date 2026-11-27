// Run manually with: npx tsx scripts/check-song-canvas.ts
// Strict mock for required Canvas method arity, finite coordinates and state balance.
// This is not a native Safari test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderCinematicSong, renderCinematicSongCover } from '../src/engine/cinematicSongRenderer';
import type { OpenMotionProject } from '../src/types/openmotion';
let depth=0,frames=0;
function numeric(name:string,n:number,args:unknown[]){
 assert(args.length>=n,name+': not enough arguments');
 assert(args.slice(0,n).every(x=>typeof x==='number'&&Number.isFinite(x)),name+': non-finite coordinate');
}
const gradient={addColorStop(offset:number,color:string){assert(Number.isFinite(offset)&&offset>=0&&offset<=1);assert(typeof color==='string'&&!/NaN|undefined/.test(color));}};
const ctx:Record<string,unknown>={
 save(){depth++;},restore(){assert(--depth>=0,'unbalanced restore');},
 beginPath(){},closePath(){},fill(){},stroke(){},clip(){},
 measureText(t:string){return {width:t.length*20};},
 fillText(t:string,...args:number[]){assert(typeof t==='string');numeric('fillText',2,args);},
 createRadialGradient(...a:number[]){numeric('createRadialGradient',6,a);assert(a[2]>=0&&a[5]>=0);return gradient;},
 createLinearGradient(...a:number[]){numeric('createLinearGradient',4,a);return gradient;},
};
for(const [name,n] of Object.entries({scale:2,translate:2,rotate:1,fillRect:4,rect:4,ellipse:7,arc:5,moveTo:2,lineTo:2,quadraticCurveTo:4,bezierCurveTo:6}))ctx[name]=(...a:unknown[])=>numeric(name,n,a);
// Legacy artworks may use Path2D. Node has no DOM; procedural paths use native primitives.
if(typeof globalThis.Path2D==='undefined')Object.defineProperty(globalThis,'Path2D',{value:class {constructor(d?:string){assert(!d||!(/NaN|Infinity|undefined/.test(d)));}}});
const c=ctx as unknown as CanvasRenderingContext2D;
for(const slug of ['the-song-explained-001-fast-car','the-song-explained-002-every-breath-you-take']){
 const p=JSON.parse(fs.readFileSync('projects/'+slug+'/project.json','utf8')) as OpenMotionProject;
 renderCinematicSongCover(c,540,960,p.scenes[0],p.brandKit);assert.equal(depth,0);
 for(const s of p.scenes)for(const t of Array.from({length:61},(_,i)=>s.durationSec*i/60)){
  if(t>s.durationSec)continue;
  renderCinematicSong(c,540,960,s,t,p.brandKit);assert.equal(depth,0,slug+' / '+s.name+' / '+t);frames++;
 }
}
console.log('Song Canvas regression:',frames,'frames and both covers passed.');
