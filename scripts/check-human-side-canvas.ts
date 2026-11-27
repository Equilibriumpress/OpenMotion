// Manual regression: npx tsx scripts/check-human-side-canvas.ts
// Strict API mock, not a native Safari pixel test or an MP4 render.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderHumanSide, renderHumanSideCover, humanSideCoverDuration } from '../src/engine/humanSideRenderer';
import type { OpenMotionProject } from '../src/types/openmotion';

let depth=0,frames=0;
let labels:string[]=[];
const numeric=(name:string,n:number,args:unknown[])=>{
 assert.equal(args.length,n,name+' arity');
 assert(args.every(x=>typeof x==='number'&&Number.isFinite(x)),name+' nonfinite coordinates');
};
const ctx:Record<string,unknown>={
 globalAlpha:1,
 save(){depth++;},restore(){assert(--depth>=0,'unbalanced restore');},
 beginPath(){},closePath(){},
 fill(...a:unknown[]){assert.equal(a.length,0,'fill overload');},
 stroke(...a:unknown[]){assert.equal(a.length,0,'stroke overload');},
 measureText(t:string){return {width:t.length*parseFloat(String(ctx.font).split(' ')[1])*.55};},
 fillText(t:string,...a:number[]){assert(typeof t==='string');numeric('fillText',2,a);labels.push(t);},
 createRadialGradient(...a:number[]){numeric('createRadialGradient',6,a);return {addColorStop(off:number,col:string){assert(off>=0&&off<=1&&typeof col==='string');}};},
};
for(const [name,n] of Object.entries({scale:2,translate:2,rotate:1,fillRect:4,moveTo:2,lineTo:2,quadraticCurveTo:4,bezierCurveTo:6}))ctx[name]=(...a:unknown[])=>numeric(name,n,a);
const c=ctx as unknown as CanvasRenderingContext2D;
for(const slug of ['01-same-situation','02-no-text-back','03-plans-change','04-boundaries','05-criticism','06-resting-guilt','07-smile-we-hide-behind','08-same-mistakes','09-being-strong','10-lonely-in-a-crowd'].map(s=>'the-human-side-'+s)){
 const p=JSON.parse(fs.readFileSync('projects/'+slug+'/project.json','utf8')) as OpenMotionProject;
 assert.equal(humanSideCoverDuration(p.scenes[0]),1.5);
 const title=p.scenes[0].doodle!.extras!.find(v=>v.startsWith('cover-title:'))!.slice(12).split('|');
 for(const t of [0,.3,.85,1.49]){
  labels=[];renderHumanSide(c,1080,1920,p.scenes[0],t,p.brandKit);
  assert.equal(depth,0);assert(title.every(v=>labels.includes(v)),slug+' cover missing at '+t);
 }
 labels=[];renderHumanSideCover(c,1080,1920,p.scenes[0],p.brandKit);
 assert.equal(depth,0);assert(title.every(v=>labels.includes(v)),slug+' PNG cover missing');
 const rate=['2.2','2.3'].includes(p.templateVersion??'')?30:6;
 for(const s of p.scenes)for(let k=0;k<Math.ceil(s.durationSec*rate);k++){
  renderHumanSide(c,540,960,s,k/rate,p.brandKit);assert.equal(depth,0,slug+' '+s.name);frames++;
 }
}
console.log('Human Side Canvas regression:',frames,'scene samples and all ten covers passed.');
