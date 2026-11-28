import type { OpenMotionScene } from '../types/openmotion';
import { MASTER_ART, type MasterArt, type MasterShape, type MasterLayer } from './posterMasterArt';
import { MASTER_DESIGN, MASTER_MATERIALS, MASTER_MOTION, MASTER_FRAME, MASTER_PAPER, type MasterDestination, type MasterMaterial } from './posterMasterDesign';
// Existing OpenMotion Canvas frame pipeline. No asynchronous media or new render backend.
type C=CanvasRenderingContext2D;
const TAU=Math.PI*2;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};
const wrap=(v:number,m:number)=>((v%m)+m)%m;
const paths=new Map<string,Path2D>();
function path(d:string){let p=paths.get(d);if(!p){p=new Path2D(d);paths.set(d,p);}return p;}
function draw(c:C,a:MasterArt,ss?:MasterShape[]){for(const s of ss??[]){c.save();c.globalAlpha*=s.o??1;const p=path(s.d);if(s.f!=='none'){if(s.f.startsWith('@')){const g=a.gradients[s.f.slice(1)];if(g){const q=c.createLinearGradient(g.x1,g.y1,g.x2,g.y2);for(const [v,col] of g.stops)q.addColorStop(v,col);c.fillStyle=q;}else c.fillStyle=a.palette[1];}else c.fillStyle=s.f;c.fill(p,'evenodd');}if(s.s){c.strokeStyle=s.s;c.lineWidth=s.w??1;c.lineCap='round';c.lineJoin='round';c.stroke(p);}c.restore();}}
function line(c:C,x:number,y:number,x2:number,y2:number,col:string,w=1){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
function oval(c:C,x:number,y:number,rx:number,ry:number,f:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=f;c.fill();}
function place(c:C,a:MasterArt,ss:MasterShape[]|undefined,x=0,y=0,scale=1,angle=0,shear=0){c.save();c.translate(x,y);c.rotate(angle);c.transform(1,0,shear,1,0,0);c.scale(scale,scale);draw(c,a,ss);c.restore();}
const tiles=new Map<MasterMaterial,HTMLCanvasElement>();
function material(c:C,k:MasterMaterial,box:readonly number[]){if(typeof document==='undefined')return;let tile=tiles.get(k);if(!tile){tile=document.createElement('canvas');tile.width=tile.height=192;const p=tile.getContext('2d');if(!p)return;p.scale(3,3);p.lineCap='round';for(const m of MASTER_MATERIALS[k]){p.globalAlpha=m.alpha;line(p,m.x,m.y,m.x+m.dx,m.y+m.dy,m.color,.65);}tiles.set(k,tile);}
 const pattern=c.createPattern(tile,'repeat');if(!pattern)return;pattern.setTransform(new DOMMatrix().scale(1/3));c.fillStyle=pattern;c.fillRect(box[0],box[1],box[2],box[3]);
}
function rawLayer(c:C,a:MasterArt,l:MasterLayer){for(const s of l.shapes){draw(c,a,[s]);if(s.t){c.save();c.clip(path(s.d),'evenodd');material(c,s.t,l.box);c.restore();}}if(l.clip){c.save();c.clip(path(l.clip),'evenodd');material(c,l.material as MasterMaterial,l.box);c.restore();}else if(l.name==='sky'){material(c,'sky',l.box);}}
type Entry={canvas:HTMLCanvasElement;box:[number,number,number,number];bytes:number};
const cache=new Map<string,Entry>();let bytes=0,lastD:MasterDestination|undefined,lastDensity=0;
const LIMIT=40*1024*1024;
function reset(d:MasterDestination,density:number){if(lastD===d&&lastDensity===density)return;for(const e of cache.values()){e.canvas.width=0;e.canvas.height=0;}cache.clear();paths.clear();bytes=0;lastD=d;lastDensity=density;}
function cachedLayer(c:C,a:MasterArt,l:MasterLayer,density:number){
 // Cache only expensive static layers, including material patterns. Never exceed a fixed byte budget.
 if(l.shapes.length<85||typeof document==='undefined'){rawLayer(c,a,l);return;}
 const [x,y,w,h]=l.box;const px=Math.ceil(w*density),py=Math.ceil(h*density),cost=px*py*4;let entry=cache.get(l.name);
 if(!entry&&cost<=LIMIT-bytes){const canvas=document.createElement('canvas');canvas.width=px;canvas.height=py;const q=canvas.getContext('2d');if(q){q.scale(density,density);q.translate(-x,-y);rawLayer(q,a,l);entry={canvas,box:l.box,bytes:cost};cache.set(l.name,entry);bytes+=cost;}}
 if(entry)c.drawImage(entry.canvas,x,y,w,h);else rawLayer(c,a,l);
}
function smallText(c:C,t:string,y:number,size:number,color:string,spacing:number,weight=700){c.save();c.font=weight+' '+size+'px Arial, sans-serif';c.fillStyle=color;c.textBaseline='alphabetic';c.textAlign='left';const ch=Array.from(t),widths=ch.map(x=>c.measureText(x).width),total=widths.reduce((x,y)=>x+y,0)+Math.max(0,ch.length-1)*spacing;let x=270-total/2;for(let i=0;i<ch.length;i++){c.fillText(ch[i],x,y);x+=widths[i]+spacing;}c.restore();}
function print(c:C,a:MasterArt,d:MasterDestination,alpha:number){const t=MASTER_DESIGN[d],ink=a.palette[1];c.save();c.globalAlpha=alpha;line(c,22,58,518,58,ink,.8);line(c,22,879,518,879,ink,.8);smallText(c,'LIVING TRAVEL POSTERS  /  '+t.num,46,10,ink,2.1);c.save();c.translate(t.x,t.y);c.scale(t.sx,t.sy);c.strokeStyle=ink;c.lineCap=t.style==='deco'?'square':'round';c.lineJoin='round';for(const g of t.glyphs){c.save();c.translate(g.x,0);if(g.d){c.lineWidth=t.stroke;c.stroke(path(g.d));}if(g.serif){c.lineWidth=.42;c.stroke(path(g.serif));}c.restore();}c.restore();smallText(c,t.subtitle,159,12,ink,2.5);smallText(c,t.footer,904,12,ink,2.3);smallText(c,'MASTER EDITION  •  ORIGINAL ILLUSTRATED JOURNEY',925,8,ink,1.1,400);c.restore();}
const rail=(m:{rail:{y:number;center:number;slope:number;curve:number}},x:number)=>m.rail.y+m.rail.slope*(x-m.rail.center)+m.rail.curve*(x-m.rail.center)**2;
const slope=(m:{rail:{center:number;slope:number;curve:number}},x:number)=>m.rail.slope+2*m.rail.curve*(x-m.rail.center);
const road=(x:number)=>821-29*Math.sin((x-100)/540*Math.PI);
function progress(t:number){const k=[[0,0],[2,0],[5,.018],[10,.045],[14,.092],[17,.55],[21,1],[22,1]];const sl=k.slice(1).map((v,i)=>(v[1]-k[i][1])/(v[0]-k[i][0]));const v=k.map((_,i)=>i===0||i===k.length-1||sl[i-1]*sl[i]<=0?0:2*sl[i-1]*sl[i]/(sl[i-1]+sl[i]));for(let i=1;i<k.length;i++){if(t<=k[i][0]){const dt=k[i][0]-k[i-1][0],u=clamp((t-k[i-1][0])/dt),u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*k[i-1][1]+(u3-2*u2+u)*dt*v[i-1]+(-2*u3+3*u2)*k[i][1]+(u3-u2)*dt*v[i];}}return 1;}
function vehicle(c:C,a:MasterArt,d:MasterDestination,t:number,awake:number){
 const m=MASTER_MOTION[d],q=progress(t),x=m.left+wrap(m.start-m.left+m.range*q,m.range);
 if(d==='amalfi'){const shear=.06*awake*Math.sin(TAU*q);place(c,a,a.objects.hero,x,road(x),1+.045*awake*Math.sin(TAU*q),.026*awake*Math.sin(TAU*q),shear);return;}
 const rm=MASTER_MOTION[d];for(const off of rm.anchors){const px=x+off,y=rail(rm,px),view=awake*clamp((px+50)/650);
 // Individual coach projection, small foreshortening and moving contact shadow.
 c.save();c.globalAlpha=.23*awake;oval(c,px,y+2,off===0?45:50,4,'#263b3b');c.restore();
 place(c,a,off===0?a.objects.hero:a.objects.coach,px,y,1-.085*view,Math.atan(slope(rm,px)),.09*view);
 }
}
function water(c:C,a:MasterArt,l:MasterLayer,t:number,awake:number){
 if(awake<=0)return;const phase=TAU*smooth((t-2)/19);
 c.save();if(l.clip)c.clip(path(l.clip),'evenodd');
 // Moving narrow reflectance masks, drawn in the water layer before shoreline occlusion.
 for(let i=0;i<36;i++){const y=(l.name==='sea'?485:643)+(i*47)%180,x=(l.name==='sea'?280:25)+(i*113)%270+12*Math.sin(phase*3+i),w=12+(i*19)%45;c.globalAlpha=awake*(.12+.23*(.5+.5*Math.sin(phase*4+i)));const g=c.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'rgba(240,226,180,0)');g.addColorStop(.5,'#f1e2bb');g.addColorStop(1,'rgba(240,226,180,0)');c.fillStyle=g;c.fillRect(x,y,w,1.6);}
 if(l.name==='lake'){const m=a.layers.find(v=>v.name==='fuji');if(m)for(let i=0;i<8;i++){const y=646+i*13;c.save();c.beginPath();c.rect(68,y,420,4+i*.3);c.clip();c.globalAlpha=.11*awake*(1-i/9);c.translate(12*Math.sin(phase+i*.8),1100);c.scale(1,-.72);draw(c,a,m.shapes.slice(0,4));c.restore();}}
 c.restore();
}
export function renderPosterCinemaMaster(c:C,w:number,h:number,s:OpenMotionScene,local:number){
 const d:MasterDestination=s.parallax?.destination==='japan'?'japan':s.parallax?.destination==='amalfi'?'amalfi':'switzerland',a=MASTER_ART[d],t=22*clamp(local/Math.max(.5,s.durationSec)),q=smooth((t-2)/19),phase=TAU*q;
 const awake=smooth((t-2)/2)*(1-smooth((t-19)/2)),push=smooth((t-4)/6)*(1-smooth((t-17)/4));
 const zoom=1+.48*push,m=MASTER_MOTION[d],heroX=m.left+wrap(m.start-m.left+m.range*progress(t),m.range);const track=d==='amalfi'?0:Math.max(-24,Math.min(175,(heroX-m.start)*1.25));const follow=(1-smooth((t-14)/2.5))*smooth((t-4)/4);const pan=push*((d==='amalfi'?18:0)+10*Math.sin(phase)-track*follow);
 const fx=d==='amalfi'?205:d==='japan'?300:285,fy=d==='japan'?635:d==='amalfi'?565:535;
 const scale=Math.max(w/540,h/960),density=scale<=1.05?1.5:Math.min(3,Math.max(2,Math.ceil(scale*1.48)));
 reset(d,density);c.save();c.translate((w-540*scale)/2,(h-960*scale)/2);c.scale(scale,scale);c.fillStyle=MASTER_PAPER;c.fillRect(0,0,540,960);
 const f=MASTER_FRAME,x=f.x*(1-push),y=f.y*(1-push),rw=540-2*x,rh=960-y-(960-f.y-f.height)*(1-push);
 c.save();c.beginPath();c.rect(x,y,rw,rh);c.clip();
 c.save();c.translate(fx+pan,fy-12*push);c.scale(zoom,zoom);c.translate(-fx,-fy);
 for(const l of a.layers){
  c.save();c.translate(pan*l.depth*.18,8*push*l.depth);const p=1+.025*push*l.depth;c.translate(fx,fy);c.scale(p,p);c.translate(-fx,-fy);cachedLayer(c,a,l,density);
  if(l.name==='sky'&&a.objects.cloud)place(c,a,a.objects.cloud,22*Math.sin(phase),2*Math.sin(phase));
  if(l.name==='fuji')place(c,a,a.objects.mist,29*Math.sin(phase),2*Math.sin(phase*2));
  if(l.name==='lake'||l.name==='sea'){water(c,a,l,t,awake);if(l.name==='sea'){const bx=372+76*Math.sin(phase),by=656+3*Math.sin(phase*5);place(c,a,a.objects.boat,bx,by,1,awake*.045*Math.sin(phase*5));place(c,a,a.objects.boat,474-30*Math.sin(phase),546+2*Math.sin(phase*4),.48,-awake*.05*Math.sin(phase*4));if(awake>0){c.save();c.globalAlpha=.5*awake;line(c,bx-34,by+9,bx-62,by+13,'#d7e4c4',1.3);c.restore();}}}
  if(l.name==='forest and waterfall'&&awake>0){c.save();c.globalAlpha=awake*.6;for(let i=0;i<8;i++){const y=539+wrap(i*18+phase*51,114),x=y<577?387:387-(y-577)*.36;line(c,x,y,x-1,y+7,'#f6edce',1.5);}c.restore();}
  if(l.name==='viaduct'||l.name==='railway'||l.name==='road')vehicle(c,a,d,t,awake);
  if(l.name==='foreground'||l.name==='terrace'){place(c,a,a.objects.branch,awake*2*Math.sin(phase*4),awake*1.5*Math.cos(phase*4));if(d==='japan'&&awake>0){for(let i=0;i<30;i++){const z=wrap(i*.618+q*1.4,1),x=22+(i*107)%492+21*Math.sin(phase*3+i)+z*28,y=190+z*710;c.save();c.translate(x,y);c.rotate(phase*3+i);c.globalAlpha=awake*Math.min(1,z*7,(1-z)*7)*.8;oval(c,0,0,2.5+i%3*.65,1.4+i%2*.5,['#e9b5b5','#d78c9c','#f2d3c3'][i%3]);c.restore();}}}
  c.restore();
 }
 c.restore();c.restore();
 if(push<1){c.save();c.globalAlpha=1-push;c.strokeStyle=a.palette[1];c.lineWidth=1;c.strokeRect(x,y,rw,rh);c.restore();}
 const opacity=1-smooth(push/.65);if(opacity>0)print(c,a,d,opacity);
 c.restore();
}
