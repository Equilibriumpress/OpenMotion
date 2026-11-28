import {gradients,layers,objects,design,staticTransforms,roadY} from './amalfiCollectorArt.mjs';
// Existing OpenMotion Canvas frame pipeline. No media loading or separate rendering backend.
const clamp=x=>Math.max(0,Math.min(1,x)), smooth=x=>{x=clamp(x);return x*x*(3-2*x)}, TAU=Math.PI*2;
const paths=new Map(),cache=new Map();let density=0,bytes=0;
function path(d){let p=paths.get(d);if(!p){p=new Path2D(d);paths.set(d,p)}return p}
function paint(c,ss){for(const s of ss){c.save();c.globalAlpha*=s.o??1;const p=path(s.d);if(s.f!=='none'){if(s.f[0]==='@'){const g=gradients[s.f.slice(1)],v=c.createLinearGradient(g.x1,g.y1,g.x2,g.y2);for(const [offset,color] of g.stops)v.addColorStop(offset,color);c.fillStyle=v}else c.fillStyle=s.f;c.fill(p,'evenodd')}if(s.s){c.strokeStyle=s.s;c.lineWidth=s.w??1;c.lineCap='round';c.lineJoin='round';c.stroke(p)}c.restore()}}
function object(c,name,x,y,s=1,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);paint(c,objects[name]);c.restore()}
const bounds={sea:[-220,460,980,773],cliff:[-220,220,590,610],town:[-180,225,540,550],road:[-220,740,980,380],terrace:[-220,775,980,390]};
function reset(d){if(d===density)return;for(const e of cache.values()){e.canvas.width=e.canvas.height=0}cache.clear();bytes=0;density=d}
function layer(c,l){const b=bounds[l.id];if(!b||l.shapes.length<70||typeof document==='undefined'){paint(c,l.shapes);return}let e=cache.get(l.id);if(!e){const [x,y,w,h]=b,px=Math.ceil(w*density),py=Math.ceil(h*density),cost=px*py*4;if(bytes+cost>40*1024*1024){paint(c,l.shapes);return}const canvas=document.createElement('canvas');canvas.width=px;canvas.height=py;const q=canvas.getContext('2d');if(!q){paint(c,l.shapes);return}q.scale(density,density);q.translate(-x,-y);paint(q,l.shapes);e={canvas,b};cache.set(l.id,e);bytes+=cost}c.drawImage(e.canvas,...e.b)}
function letter(c,t,y,size,f,tracking=0){c.save();c.fillStyle=design.ink;c.font=f.replace('{size}',String(size));c.textAlign='center';c.textBaseline='alphabetic';if('letterSpacing' in c)c.letterSpacing=tracking+'px';c.fillText(t,270,y,485);c.restore()}
function typography(c,alpha){c.save();c.globalAlpha=alpha;letter(c,'LIVING TRAVEL POSTERS · 02',39,10,'{size}px Arial, sans-serif',3);letter(c,'AMALFI',103,70,'bold {size}px Georgia, serif',4);letter(c,'COSTA AMALFITANA',131,12,'{size}px Arial, sans-serif',4);letter(c,'An Italian Summer',917,19,'italic {size}px Georgia, serif');letter(c,'COLLECTOR EDITION · ORIGINAL ILLUSTRATION',939,8,'{size}px Arial, sans-serif',2);c.restore()}
function wave(c,t,awake){if(!awake)return;const phase=TAU*t;for(let i=0;i<36;i++){const y=478+(i*61)%345,x=325+(i*83)%200+8*Math.sin(phase*2+i),w=4+(y-465)/15+(i*7)%17;const g=c.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'rgba(248,230,177,0)');g.addColorStop(.5,'#f8e6b1');g.addColorStop(1,'rgba(248,230,177,0)');c.globalAlpha=awake*(.12+.21*(.5+.5*Math.sin(phase*3+i)));c.fillStyle=g;c.fillRect(x,y,w,1.3)}c.globalAlpha=1}
function boats(c,phase,awake){const [x,y]=design.boat,xx=x+42*Math.sin(phase),yy=y+awake*2*Math.sin(phase*5);object(c,'boat',xx,yy,1,awake*.025*Math.sin(phase*5));const [u,v]=design.distantBoat;object(c,'boat',u-19*Math.sin(phase),v+awake*Math.sin(phase*4),.5,awake*.018*Math.sin(phase*4));if(awake){c.save();c.globalAlpha=.42*awake;c.strokeStyle='#e7d8ac';c.lineWidth=1.1;c.beginPath();c.moveTo(xx-36,yy+9);c.quadraticCurveTo(xx-57,yy+15,xx-70,yy+14);c.stroke();c.restore()}}
// Move from the initial position to the right, wrap beyond the visible area and return from the left.
function scooter(c,t,awake){const q=t<12?.2*smooth((t-4)/8):.2+.8*smooth((t-12)/8),phase=q===1?0:q,range=1060,left=-250,x=left+((design.scooterX-left+range*phase)%range),y=roadY(x);object(c,'scooter',x,y,.82,Math.atan(-.08+.00042*(x-260))+.009*awake*Math.sin(q*TAU*8))}
// Unique Amalfi camera: poster opens, drifts toward the village, descends toward the waterfront, then returns.
export function renderAmalfiCollector(c,w,h,scene,local){const t=22*clamp(local/Math.max(.5,scene.durationSec)),q=smooth((t-2)/19),phase=q===1?0:TAU*q,awake=smooth((t-2)/3)*(1-smooth((t-19)/2)),push=smooth((t-4)/6)*(1-smooth((t-16)/5)),descend=smooth((t-8)/5),zoom=1+.38*push;
 const scale=Math.max(w/540,h/960),d=scale<=1.05?1.5:Math.min(3,Math.max(2,Math.ceil(scale*1.38)));reset(d);
 const fx=230+95*descend*push,fy=500+155*descend*push,pan=-13*push+12*descend*push;
 c.save();c.translate((w-540*scale)/2,(h-960*scale)/2);c.scale(scale,scale);c.fillStyle=design.paper;c.fillRect(0,0,540,960);
 const f=design.frame,x=f.x*(1-push),y=f.y*(1-push),rw=540-2*x,rh=960-y-(960-f.y-f.h)*(1-push);
 c.save();c.beginPath();c.rect(x,y,rw,rh);c.clip();c.save();c.translate(fx+pan,fy-12*push);c.scale(zoom,zoom);c.translate(-fx,-fy);
 for(const l of layers){c.save();c.translate(-20*push*l.depth+8*descend*push*l.depth,9*push*l.depth);const p=1+.026*push*l.depth;c.translate(fx,fy);c.scale(p,p);c.translate(-fx,-fy);layer(c,l);
 if(l.id==='sea'){wave(c,q,awake);boats(c,phase,awake)}
 if(l.id==='road')scooter(c,t,awake);
 if(l.id==='terrace'){object(c,'leaves',awake*1.7*Math.sin(phase*3),awake*.9*Math.cos(phase*3));object(c,'flowers',awake*1.2*Math.sin(phase*4),0)}
 c.restore()}
 c.restore();c.restore();if(push<1){c.save();c.globalAlpha=1-push;c.strokeStyle=design.ink;c.lineWidth=1;c.strokeRect(x,y,rw,rh);c.restore()}
 typography(c,1-smooth(push/.65));c.restore();
}
