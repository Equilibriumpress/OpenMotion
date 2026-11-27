import { isCinematicSong, renderCinematicSong, renderCinematicSongCover } from './cinematicSongRenderer';
import type { OpenMotionBrandKit, OpenMotionScene } from '../types/openmotion';

// Original vector artwork. A deterministic scene-time renderer shared by preview and MP4.
type C = CanvasRenderingContext2D;
type Palette = {paper:string; ink:string; ochre:string; red:string; blue:string};
const W=540,H=960;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const u=clamp(v);return u*u*(3-2*u);};
const val=(s:OpenMotionScene,k:string,f='')=>s.doodle?.extras?.find(x=>x.startsWith(k+':'))?.slice(k.length+1)??f;
const palette=(b:OpenMotionBrandKit):Palette=>({paper:b.backgroundColor||'#EDE5D5',ink:b.textColor||'#191919',ochre:b.primaryColor||'#D5A34B',red:b.accentColor||'#A4473D',blue:b.surfaceColor||'#526F80'});
function rect(c:C,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(x,y,w,h);}
function ellipse(c:C,x:number,y:number,rx:number,ry:number,color:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function path(c:C,d:string,color:string){c.fillStyle=color;c.fill(new Path2D(d));}
function line(c:C,d:string,color:string,width=3){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke(new Path2D(d));}
function text(c:C,s:string,x:number,y:number,max:number,size:number,color:string,weight=800){
 c.font=weight+' '+size+'px system-ui, sans-serif';const fit=Math.min(size,size*max/Math.max(1,c.measureText(s).width));
 c.font=weight+' '+fit+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(s,x,y);
}
function lines(c:C,s:string,y:number,p:Palette,size=39){s.split('|').slice(0,3).forEach((v,i)=>text(c,v,270,y+i*(size+9),430,size,p.ink));}
function paper(c:C,p:Palette){
 rect(c,0,0,W,H,p.paper);
 // Fixed ink speckles, independent of frame time. No external texture.
 c.fillStyle=p.ink;c.globalAlpha=.065;
 for(let i=0;i<850;i++){const x=(i*137.507764)%W,y=(i*91.137)%H;c.fillRect(x,y,i%3===0?2:1,1);}
 c.globalAlpha=1;
}
function car(c:C,x:number,y:number,s:number,t:number,p:Palette){
 c.save();c.translate(x,y+Math.sin(t*5)*1.2);c.scale(s,s);
 ellipse(c,0,31,104,10,'rgba(0,0,0,.15)');
 path(c,'M -105 12 L -100 -14 L -61 -22 L -35 -48 L 39 -48 L 76 -19 L 102 -10 L 108 16 Q 104 27 88 27 L -91 27 Q -104 26 -105 12 Z',p.red);
 path(c,'M -50 -21 L -28 -40 L 34 -40 L 58 -21 Z',p.ink);line(c,'M 3 -39 L 3 -22',p.paper,3);
 rect(c,-95,5,16,6,p.ochre);rect(c,81,1,18,8,p.paper);line(c,'M -64 -10 H 65',p.paper,2);
 for(const xx of [-65,69]){ellipse(c,xx,25,18,18,p.ink);ellipse(c,xx,25,8,8,p.paper);c.save();c.translate(xx,25);c.rotate(t*4);line(c,'M -6 0 H 6 M 0 -6 V 6',p.ink,1.8);c.restore();}
 c.restore();
}
// Original reusable person rig: head, hair, torso, arm and leg paths.
function person(c:C,x:number,y:number,s:number,t:number,p:Palette,pose='stand',shirt=p.red){
 c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,5,49,9,'rgba(0,0,0,.13)');
 const seated=pose==='sit',step=pose==='walk'?Math.sin(t*5)*17:0;
 const lean=pose==='tired'?8:pose==='look'? -4:0,bodyY=seated?45:0;
 c.translate(0,bodyY+Math.sin(t*2)*1.5);
 if(seated){line(c,'M -15 -63 L 28 -39 L 33 -2 M 12 -63 L 53 -39 L 56 -2',p.ink,15);}
 else{line(c,'M -15 -65 L '+(-17+step)+' -5 M 15 -65 L '+(17-step)+' -5',p.ink,17);}
 path(c,'M -36 -130 Q 0 -155 36 -130 L 29 -65 L -29 -65 Z',shirt);
 line(c,pose==='work'?'M -32 -121 L -49 -86 L -4 -84 M 32 -121 L 48 -87 L 2 -84':pose==='look'?'M -33 -121 L -44 -84 M 33 -121 L 49 -89 L 61 -111':'M -33 -121 L -45 -75 M 33 -121 L 44 -75',p.ink,10);
 c.save();c.translate(lean,-157);ellipse(c,0,0,27,31,p.ochre);path(c,'M -28 6 Q -38 -39 1 -37 Q 36 -35 29 4 L 20 -9 Q 0 -6 -16 -18 L -20 11 Z',p.ink);
 ellipse(c,10,-1,2.4,2.5,p.ink);line(c,pose==='tired'?'M 6 13 Q 13 9 19 13':'M 6 10 Q 13 15 19 10',p.ink,1.6);c.restore();c.restore();
}
function road(c:C,t:number,u:number,p:Palette,night=false){
 rect(c,0,0,540,405,night?p.blue:p.ochre);
 ellipse(c,376,125,68,68,night?p.paper:p.red);
 path(c,'M 0 310 L 106 192 L 232 302 L 340 226 L 540 310 V 405 H 0Z',night?p.ink:p.blue);
 path(c,'M 0 350 L 183 275 L 282 297 L 540 350 V 480 H 0 Z',p.paper);
 path(c,'M 246 300 L 294 300 L 540 480 H 0 Z',p.ink);
 for(let i=0;i<7;i++){const z=((i/7+t*.18)%1),y=305+z*z*165,w=2+z*13;rect(c,270-w/2,y,w,4+z*22,p.paper);}
 if(night)for(let i=0;i<25;i++)ellipse(c,20+(i*137)%500,18+(i*67)%145,1.7,1.7,p.paper);
 car(c,270+(u-.5)*36,365,.65+.16*u,t,p);
}
function windowRoom(c:C,t:number,p:Palette,late=false){
 rect(c,0,0,540,480,late?p.blue:p.ochre);rect(c,34,42,235,244,p.ink);rect(c,43,51,217,226,late?p.blue:p.paper);
 ellipse(c,205,100,34,34,late?p.paper:p.red);
 for(let i=0;i<8;i++){const h=55+(i*37)%95;rect(c,44+i*27,277-h,24,h,late?p.ink:p.blue);}
 line(c,'M 151 51 V 277 M 43 165 H 260',p.ink,6);
 rect(c,0,392,540,88,p.ink);rect(c,344,292,146,12,p.paper);rect(c,354,304,8,98,p.paper);rect(c,469,304,8,98,p.paper);
 person(c,late?353:325,late?351:403,1.15,t,p,late?'sit':'look',p.red);
 if(late){rect(c,398,271,20,20,p.ochre);line(c,'M 418 275 Q 434 280 418 286',p.ochre,3);}
}
function shop(c:C,t:number,p:Palette){
 rect(c,0,0,540,480,p.blue);for(let r=0;r<3;r++){const y=65+r*92;rect(c,26,y+63,488,9,p.paper);for(let i=0;i<12;i++){const h=25+(i*19+r*11)%34;rect(c,38+i*39,y+63-h,23,h,[p.ochre,p.red,p.paper][(i+r)%3]);}}
 person(c,270,417,1.25,t,p,'work',p.red);rect(c,0,322,540,158,p.ink);rect(c,0,322,540,12,p.ochre);
 rect(c,365,277,78,45,p.paper);rect(c,375,285,58,18,p.ink);rect(c,353,316,102,7,p.red);
}
function symbol(c:C,p:Palette,kind:string,t:number){
 if(kind==='heart'){path(c,'M 270 365 C 100 252 58 175 116 113 C 159 69 230 95 270 151 C 310 95 381 69 424 113 C 482 175 440 252 270 365 Z',p.red);ellipse(c,270,203,104,48,p.paper);ellipse(c,270+Math.sin(t)*9,203,34,34,p.ink);}
 else if(kind==='record'){ellipse(c,270,230,151,151,p.ink);for(let i=0;i<7;i++){c.beginPath();c.arc(270,230,67+i*12,0,Math.PI*2);c.strokeStyle=p.blue;c.lineWidth=1;c.stroke();}ellipse(c,270,230,57,57,p.red);ellipse(c,270,230,7,7,p.paper);}
 else road(c,t,.25,p);
}
export function hasSongCover(scene:OpenMotionScene|undefined){return !!scene?.doodle?.extras?.includes('song-explainer-v1')&&!!val(scene,'cover-title');}
export function renderSongCover(c:C,w:number,h:number,s:OpenMotionScene,b:OpenMotionBrandKit){
 if(isCinematicSong(s)){renderCinematicSongCover(c,w,h,s,b);return;}
 const p=palette(b);c.save();c.scale(w/W,h/H);paper(c,p);
 text(c,'THE SONG EXPLAINED  /  '+val(s,'episode','01'),270,219,430,19,p.red);
 lines(c,val(s,'cover-title','FAST CAR'),285,p,62);
 c.save();c.translate(55,338);c.scale(430/540,430/540);c.beginPath();c.rect(0,0,540,405);c.clip();symbol(c,p,val(s,'symbol','car'),0);c.restore();
 text(c,val(s,'cover-hook','More than a car.'),270,699,430,33,p.ink);
 text(c,val(s,'artist','TRACY CHAPMAN · 1988'),270,746,430,19,p.red,650);
 c.restore();
}
export function renderSongExplainer(c:C,w:number,h:number,s:OpenMotionScene,time:number,b:OpenMotionBrandKit){
 if(isCinematicSong(s)){renderCinematicSong(c,w,h,s,time,b);return;}
 const t=Math.max(0,Math.min(s.durationSec,time)),u=t/Math.max(.01,s.durationSec),p=palette(b);
 if(hasSongCover(s)&&t<Math.min(.85,s.durationSec*.3)){renderSongCover(c,w,h,s,b);return;}
 const shot=val(s,'shot','road'),camera=val(s,'camera','push'),z=camera==='pull'?1.09-.09*ease(u):1+.07*ease(u);
 c.save();c.scale(w/W,h/H);paper(c,p);
 text(c,'THE SONG EXPLAINED  /  '+val(s,'episode','01'),270,93,430,19,p.red);
 const head=(s.headline||'').split('|').slice(0,2);head.forEach((v,i)=>text(c,v,270,168+i*48,430,41,p.ink));
 c.save();c.beginPath();c.rect(36,260,468,416);c.clip();
 c.translate(270,468);c.scale((468/540)*z,(468/540)*z);c.translate(-270,-240);
 if(shot==='room')windowRoom(c,t,p);else if(shot==='shop')shop(c,t,p);else if(shot==='return')windowRoom(c,t,p,true);else if(shot==='night')road(c,t,u,p,true);else if(shot==='symbol')symbol(c,p,val(s,'symbol','record'),t);else road(c,t,u,p);
 c.restore();
 rect(c,36,260,468,3,p.ink);rect(c,36,673,468,3,p.ink);
 if(s.caption)text(c,s.caption,270,707,420,21,p.red,650);
 // Scene entry: gentle ink reveal, no flash. Captions are drawn by the shared renderer.
 const a=1-ease(t/.28);if(a>0&& !hasSongCover(s)){c.globalAlpha=a*.65;rect(c,36,260,468,416,p.paper);c.globalAlpha=1;}
 text(c,val(s,'artist',''),270,842,390,16,p.ink,600);
 c.restore();
}
