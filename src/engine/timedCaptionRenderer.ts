import { OpenMotionProject, TimedCaption } from '../types/openmotion';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
/** Rendered after every layout, including full-bleed maps and 3D. */
export function renderTimedCaptions(ctx: CanvasRenderingContext2D,w:number,h:number,project:OpenMotionProject,timeSec:number):void {
 const cap=project.captions?.find((c):c is TimedCaption=>Number.isFinite(c.startSec)&&Number.isFinite(c.endSec)&&c.startSec<=timeSec&&c.endSec>timeSec);if(!cap)return;
 const tokens=cap.words?.length?cap.words:cap.text.trim().split(/\s+/).map((text,i,words)=>({text,startSec:cap.startSec+(cap.endSec-cap.startSec)*i/words.length,endSec:cap.startSec+(cap.endSec-cap.startSec)*(i+1)/words.length}));
 const scale=w/1080;
 const maxWidth=w*.8;const fontSize=Math.max(18,Math.round(Math.min(90,Math.max(18,cap.fontSizePx??49))*scale));
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 ${fontSize}px "Bricolage Grotesque",sans-serif`;
 // Single-line groups of up to 5 words, displayed one phrase at a time to fit mobile safe margins.
 const activeIndex=tokens.findIndex(x=>timeSec<x.endSec);
 const idx=activeIndex<0 ? tokens.length-1 : activeIndex;
 const groupStart=Math.floor(Math.max(0,idx)/5)*5;
 const group=cap.style==='block' ? tokens : tokens.slice(groupStart,groupStart+5);
 const text=group.map(v=>v.text).join(' ');
 const y=h*Math.max(.18,Math.min(.82,cap.position??.78));
 const measured=ctx.measureText(text).width;
 const fit=Math.min(1,(maxWidth-30*scale)/Math.max(1,measured));
 ctx.font=`800 ${Math.round(fontSize*fit)}px "Bricolage Grotesque",sans-serif`;
 const width=Math.min(maxWidth,ctx.measureText(text).width+48*scale);
 if(cap.style!=='minimal'){
   ctx.fillStyle='rgba(13,18,28,.86)';ctx.beginPath();ctx.roundRect(w/2-width/2,y-43*scale,width,86*scale,19*scale);ctx.fill();
 }
 let cursor=w/2-ctx.measureText(text).width/2;
 group.forEach(word=>{const str=word.text+' ';const measure=ctx.measureText(str).width;
   ctx.fillStyle=cap.style==='karaoke' && timeSec>=word.startSec&&timeSec<word.endSec?(cap.color??'#FFE69A'):'#F8FAFC';
   if(cap.style==='block')ctx.fillStyle=cap.color??'#F8FAFC';
   if(cap.style==='minimal'){ctx.strokeStyle='rgba(12,19,25,.9)';ctx.lineWidth=5*scale;ctx.strokeText(str,cursor,y);}
   ctx.textAlign='left';ctx.fillText(str,cursor,y,maxWidth);cursor+=measure;
 });
 ctx.restore();
}
