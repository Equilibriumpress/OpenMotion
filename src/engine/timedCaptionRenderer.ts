import { OpenMotionProject, TimedCaption } from '../types/openmotion';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
/** Rendered after every layout, including full-bleed maps and 3D. */
export function renderTimedCaptions(ctx: CanvasRenderingContext2D,w:number,h:number,project:OpenMotionProject,timeSec:number):void {
 const cap=project.captions?.find((c):c is TimedCaption=>Number.isFinite(c.startSec)&&Number.isFinite(c.endSec)&&c.startSec<=timeSec&&c.endSec>timeSec);if(!cap)return;
 const tokens=cap.words?.length?cap.words:cap.text.trim().split(/\s+/).map((text,i,words)=>({text,startSec:cap.startSec+(cap.endSec-cap.startSec)*i/words.length,endSec:cap.startSec+(cap.endSec-cap.startSec)*(i+1)/words.length}));
 const scale=w/1080;
 const maxWidth=w*.8;const fontSize=Math.max(19,Math.round(49*scale));
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 ${fontSize}px "Bricolage Grotesque",sans-serif`;
 // Single-line groups of up to 5 words, displayed one phrase at a time to fit mobile safe margins.
 const active=Math.max(0,tokens.findIndex(x=>timeSec<x.endSec));const idx=active===0&&timeSec>tokens[0].endSec?tokens.length-1:active;
 const groupStart=Math.floor(idx/5)*5;const group=tokens.slice(groupStart,groupStart+5);
 const text=group.map(v=>v.text).join(' ');
 const y=h*clamp(cap.position??.78);
 let width=Math.min(maxWidth,ctx.measureText(text).width+48*scale);
 ctx.fillStyle='rgba(13,18,28,.86)';ctx.beginPath();ctx.roundRect(w/2-width/2,y-43*scale,width,86*scale,19*scale);ctx.fill();
 let cursor=w/2-ctx.measureText(text).width/2;
 group.forEach(word=>{let str=word.text+' ';const measure=ctx.measureText(str).width;ctx.fillStyle=timeSec>=word.startSec&&timeSec<word.endSec?(cap.color??'#FFE69A'):'#F8FAFC';ctx.textAlign='left';ctx.fillText(str,cursor,y,maxWidth);cursor+=measure;});
 ctx.restore();
}
