import type { OpenMotionScene } from '../types/openmotion';
import { POSTER_ART, type PosterShape, type PosterLayer } from './posterCinemaArt';
import { POSTER_DESIGN, type PosterDestination, PAPER, INK, printMarks } from './posterCinemaDesign';
// Uses the existing Canvas 2D context. Static detailed layers use a bounded, destination-local cache.
type C=CanvasRenderingContext2D;
const TAU=Math.PI*2;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
const wrap=(x:number,n:number)=>((x%n)+n)%n;
const paths=new Map<string,Path2D>();
function draw(c:C,shapes?:PosterShape[]){for(const a of shapes??[]){let p=paths.get(a.d);if(!p){p=new Path2D(a.d);paths.set(a.d,p);}if(a.f!=='none'){c.fillStyle=a.f;c.fill(p,'evenodd');}if(a.s){c.strokeStyle=a.s;c.lineWidth=a.w??1;c.lineCap='round';c.lineJoin='round';c.stroke(p);}}}
type CacheEntry={canvas:HTMLCanvasElement;x:number;y:number;w:number;h:number};
const cache=new Map<string,CacheEntry>();let activeDestination:PosterDestination|undefined;
let texture:HTMLCanvasElement|undefined;
function resetFor(d:PosterDestination){if(activeDestination===d)return;for(const e of cache.values()){e.canvas.width=0;e.canvas.height=0;}cache.clear();paths.clear();activeDestination=d;}
const bounds:Record<string,[number,number,number,number]>={
 'terraced village':[-100,240,470,510],
 'stone viaduct':[-110,490,760,410],
 'foreground firs and meadow':[-110,580,760,530],
 'village and waterfall bank':[-100,450,740,260],
};
function staticLayer(c:C,l:PosterLayer){
 const b=bounds[l.name];
 if(!b||l.shapes.length<90||typeof document==='undefined'){draw(c,l.shapes);return;}
 let e=cache.get(l.name);
 if(!e){const [x,y,w,h]=b;const canvas=document.createElement('canvas'),density=3;
  canvas.width=Math.ceil(w*density);canvas.height=Math.ceil(h*density);const q=canvas.getContext('2d');
  if(!q){draw(c,l.shapes);return;}q.scale(density,density);q.translate(-x,-y);draw(q,l.shapes);e={canvas,x,y,w,h};cache.set(l.name,e);
 }
 c.drawImage(e.canvas,e.x,e.y,e.w,e.h);
}
function place(c:C,a:PosterShape[]|undefined,x=0,y=0,s=1,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);draw(c,a);c.restore();}
function line(c:C,x:number,y:number,x2:number,y2:number,color:string,w=1){c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
function dot(c:C,x:number,y:number,rx:number,ry:number,f:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=f;c.fill();}
function ink(c:C){
 if(!texture){texture=document.createElement('canvas');texture.width=texture.height=288;const p=texture.getContext('2d');if(!p){texture=undefined;return;}p.scale(3,3);p.strokeStyle=INK;p.lineWidth=.2;p.globalAlpha=.14;for(let y=0;y<96;y+=4)for(let x=0;x<96;x+=4){p.beginPath();p.moveTo(x,y+4);p.lineTo(x+4,y);p.stroke();}
 for(const m of printMarks()){p.globalAlpha=m.light?.47:.31;dot(p,m.x,m.y,m.r,m.r,m.light?'#fff1cd':INK);}p.globalAlpha=1;
 }
 c.save();for(let y=0;y<960;y+=96)for(let x=0;x<540;x+=96)c.drawImage(texture,x,y,96,96);c.restore();
}
function lettering(c:C,str:string,y:number,size:number,color:string,spacing:number,font:string,weight=700){
 c.save();c.font=weight+' '+size+'px '+font;c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=color;
 // Canvas letterSpacing is not available on every Safari version. Draw individual glyphs with measured widths.
 const chars=Array.from(str);const widths=chars.map(x=>c.measureText(x).width),total=widths.reduce((a,b)=>a+b,0)+Math.max(0,chars.length-1)*spacing;
 const scale=Math.min(1,465/Math.max(1,total));c.translate(270,y);c.scale(scale,1);let x=-total/2;c.textAlign='left';for(let i=0;i<chars.length;i++){c.fillText(chars[i],x,0);x+=widths[i]+spacing;}c.restore();
}
function title(c:C,s:OpenMotionScene,d:PosterDestination,a:number){const m=POSTER_DESIGN[d];c.save();c.globalAlpha=a;const face=d==='switzerland'?'Arial, sans-serif':'Georgia, serif';const size=d==='japan'?68:d==='amalfi'?47:46,spacing=d==='japan'?7:d==='amalfi'?1:2.4;
 lettering(c,'LIVING TRAVEL POSTERS / '+m.num,75,11,m.fg,2.4,'Arial, sans-serif');
 lettering(c,s.headline||m.headline,137,size,m.fg,spacing,face);
 lettering(c,s.subheadline||m.sub,161,13,m.fg,2.7,'Arial, sans-serif');
 line(c,43,180,497,180,'#f8edcf',.7);line(c,43,865,497,865,'#f8edcf',.7);
 lettering(c,m.foot,900,15,'#f8edcf',3,'Arial, sans-serif');lettering(c,'A VINTAGE-INSPIRED ILLUSTRATED JOURNEY',920,8,'#f8edcf',1.3,'Arial, sans-serif',400);c.restore();
}
export function renderPosterCinemaPremium(c:C,w:number,h:number,s:OpenMotionScene,local:number){
 const d:PosterDestination=s.parallax?.destination==='japan'?'japan':s.parallax?.destination==='amalfi'?'amalfi':'switzerland',a=POSTER_ART[d];resetFor(d);
 const t=22*clamp(local/Math.max(.5,s.durationSec)),q=smooth((t-2)/19),phase=TAU*q;
 const awake=smooth((t-2)/2)*(1-smooth((t-19)/2));
 const push=smooth((t-5)/5)*(1-smooth((t-17)/4));
 const zoom=1+.64*push,inset=18*(1-push),pan=push*(d==='amalfi'?32:15)+12*Math.sin(phase)*push;
 const focusX=d==='amalfi'?195:270,focusY=d==='japan'?595:575;
 c.save();const scale=Math.max(w/540,h/960);c.translate((w-540*scale)/2,(h-960*scale)/2);c.scale(scale,scale);
 c.fillStyle=PAPER;c.fillRect(0,0,540,960);
 c.save();c.beginPath();c.rect(inset,inset,540-2*inset,960-2*inset);c.clip();
 c.save();c.translate(focusX+pan,focusY-12*push);c.scale(zoom,zoom);c.translate(-focusX,-focusY);
 for(const l of a.layers){
  c.save();c.translate(-pan*l.depth*1.7,8*push*l.depth);staticLayer(c,l);
  if(l.name==='sky'&&a.cloud)place(c,a.cloud,22*Math.sin(phase),2*Math.sin(phase));
  if(l.name==='fuji'){c.save();c.globalAlpha=.55+.13*awake*Math.sin(phase);place(c,a.mist,37*Math.sin(phase),2*Math.sin(phase*2));c.restore();}
  if(l.name==='lake'||l.name==='sea'||l.name==='alpine valley'){
   if(awake>0){c.save();c.globalAlpha=.58*awake;for(let i=0;i<38;i++){const x=(l.name==='sea'?275:10)+(i*137)%(l.name==='sea'?265:530)+9*Math.sin(phase*3+i),y=(l.name==='sea'?490:l.name==='lake'?653:787)+(i*47)%(l.name==='sea'?300:l.name==='lake'?157:96);line(c,x,y,x+12+18*(1+Math.sin(phase*4+i)),y+.8,'#e1dfbd',1.15);}c.restore();}
   if(d==='amalfi'&&l.name==='sea'){const x=365+82*Math.sin(phase),y=650+3*Math.sin(phase*5);place(c,a.boat,x,y,1,awake*.045*Math.sin(phase*5));place(c,a.boat,470-34*Math.sin(phase),555+2*Math.sin(phase*4),.53,-awake*.06*Math.sin(phase*4));if(awake>0){c.save();c.globalAlpha=awake*.65;line(c,x-32,y+9,x-56,y+12,'#d7e4c4',1.4);c.restore();}}
  }
  if(l.name==='village and waterfall bank'&&awake>0){c.save();c.globalAlpha=awake*.65;for(let i=0;i<9;i++){const y=537+wrap(i*17+phase*51,111),x=y<583?387:387-(y-583)*.36;line(c,x,y,x-1,y+7,'#f6edce',1.5);}c.restore();}
  if(l.name==='stone viaduct'){const x=-310+wrap(605+q*1400,1400),y=690-.22*x;place(c,a.train,x,y,1,-Math.atan(.22));}
  if(l.name==='railway'){const x=-360+wrap(695+q*1450,1450),y=826-.075*x;place(c,a.train,x,y,1,-Math.atan(.075));}
  if(l.name==='coastal road'){const x=-160+wrap(395+q*1100,1100),y=816+17*Math.sin((x-235)/540*Math.PI);place(c,a.scooter,x,y,1,awake*.025*Math.cos(phase*8));}
  if(l.name==='terrace and lemon branches'){place(c,a.leaves,awake*2*Math.sin(phase*5),awake*2*Math.cos(phase*5));place(c,a.parasol,430,900,1.4,awake*.025*Math.sin(phase*6));place(c,a.parasol,345,916,.9,awake*.04*Math.sin(phase*6+1));}
  if(l.name==='cherry branches'){place(c,a.branches,awake*2.7*Math.sin(phase*4),awake*1.4*Math.cos(phase*4));if(awake>0){for(let i=0;i<38;i++){const z=wrap(i*.618+q*1.7,1),x=12+(i*107)%520+22*Math.sin(phase*3+i)+z*32,y=190+z*710;c.save();c.translate(x,y);c.rotate(phase*3+i);c.globalAlpha=awake*Math.min(1,z*7,(1-z)*7)*.8;dot(c,0,0,2.4+i%3*.65,1.4+i%2*.5,['#e9b5b5','#d78c9c','#f2d3c3'][i%3]);c.restore();}}}
  if((l.name==='alpine massif'||l.name==='distant coast')&&awake>0){c.save();c.globalAlpha=awake*.8;for(let i=0;i<4;i++){const x=330+100*Math.sin(phase+i*.45),y=350+i*13+9*Math.sin(phase+i),f=2+3*Math.sin(phase*10+i);c.strokeStyle='#385c5b';c.lineWidth=1.4;c.beginPath();c.moveTo(x-7,y-f);c.quadraticCurveTo(x-3,y-2,x,y);c.quadraticCurveTo(x+3,y-2,x+7,y-f);c.stroke();}c.restore();}
  c.restore();
 }
 c.restore();ink(c);const opacity=1-smooth(push/.75);if(opacity>0)title(c,s,d,opacity);
 c.restore();if(push<1){c.save();c.globalAlpha=(1-push)*.7;c.strokeStyle='#f8edcf';c.lineWidth=.8;c.strokeRect(25,25,490,910);c.restore();}c.restore();
}
