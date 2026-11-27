import type { OpenMotionBrandKit, OpenMotionScene } from '../types/openmotion';

/** The Human Side: original stick-figure vector rig. All motion is a pure
 * function of scene time, shared by Canvas preview and frame export. */
type C = CanvasRenderingContext2D;
const W=540,H=960,INK='#191619',PAPER='#C5A8D0',LIGHT='#E6D8ED',SHADOW='#806D87';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const u=clamp(v);return u*u*(3-2*u);};
const mix=(a:number,b:number,u:number)=>a+(b-a)*u;
type Pose=[number,number,number,number,number,number,number,number];
// Head lean, crouch, left hand x/y, right hand x/y, left/right foot x.
export const HUMAN_POSES:Record<string,Pose>={
 neutral:[0,0,-55,-103,55,-103,-29,29],
 phone:[-8,5,-56,-102,32,-176,-29,29],
 worried:[-18,24,-58,-188,52,-182,-24,36],
 panic:[-24,42,-61,-104,58,-103,-43,18],
 kneel:[-22,53,-62,-69,55,-75,-48,42],
 calm:[7,0,-53,-103,58,-112,-38,37],
 joy:[13,0,-91,-274,104,-239,-58,65],
 shrug:[0,4,-86,-164,86,-164,-32,32],
 point:[4,0,-51,-102,103,-178,-30,42],
 think:[-9,8,-54,-105,16,-202,-30,31],
 walk:[8,0,-49,-91,49,-137,-66,66],
 wave:[5,0,-48,-104,70,-243,-31,39],
 crossed:[-4,9,24,-151,-25,-151,-28,28],
 lean:[22,8,-51,-110,62,-130,-48,31],
 relief:[3,0,-74,-136,74,-137,-42,44],
};
export const HUMAN_FACES=['neutral','smile','joy','worry','panic','sad','anger','surprise','confused','relief','sleepy','determined'] as const;
type Face=typeof HUMAN_FACES[number];
type Palette={ink:string;bg:string;light:string;shadow:string};
function curve(c:C,draw:()=>void,color:string,w=4.2,fill?:string){
 c.beginPath();draw();c.lineCap='round';c.lineJoin='round';
 if(fill){c.fillStyle=fill;c.fill();}
 if(w){c.strokeStyle=color;c.lineWidth=w;c.stroke();}
}
// Explicit path commands: avoids Path2D overloads and roundRect/ellipse
// compatibility issues in mobile WebKit, including the opening cover.
function ovalPath(c:C,x:number,y:number,rx:number,ry:number){
 const k=.5522847498;ry=Math.max(.5,ry);
 c.moveTo(x+rx,y);c.bezierCurveTo(x+rx,y+k*ry,x+k*rx,y+ry,x,y+ry);
 c.bezierCurveTo(x-k*rx,y+ry,x-rx,y+k*ry,x-rx,y);
 c.bezierCurveTo(x-rx,y-k*ry,x-k*rx,y-ry,x,y-ry);
 c.bezierCurveTo(x+k*rx,y-ry,x+rx,y-k*ry,x+rx,y);c.closePath();
}
function ellipse(c:C,x:number,y:number,rx:number,ry:number,fill:string){
 curve(c,()=>ovalPath(c,x,y,rx,ry),fill,0,fill);
}
function stroke(c:C,color:string,path:string,w=4.2,fill?:string){
 const a=path.match(/[MLCQZmlcqz]|[-+]?(?:\d*\.?\d+)(?:[eE][-+]?\d+)?/g)??[];
 let i=0,cmd='',x=0,y=0,sx=0,sy=0;
 const num=()=>{const v=Number(a[i++]);if(!Number.isFinite(v))throw Error('Invalid Human Side path');return v;};
 c.beginPath();
 while(i<a.length){
  if(/^[a-z]$/i.test(a[i]))cmd=a[i++];
  if(cmd==='Z'||cmd==='z'){c.closePath();x=sx;y=sy;cmd='';continue;}
  const rel=cmd===cmd.toLowerCase(),op=cmd.toUpperCase(),ox=rel?x:0,oy=rel?y:0;
  if(op==='M'||op==='L'){
   x=num()+ox;y=num()+oy;if(op==='M'){c.moveTo(x,y);sx=x;sy=y;cmd=rel?'l':'L';}else c.lineTo(x,y);
  }else if(op==='Q'){const a1=num()+ox,b1=num()+oy;x=num()+ox;y=num()+oy;c.quadraticCurveTo(a1,b1,x,y);}
  else if(op==='C'){const a1=num()+ox,b1=num()+oy,a2=num()+ox,b2=num()+oy;x=num()+ox;y=num()+oy;c.bezierCurveTo(a1,b1,a2,b2,x,y);}
  else throw Error('Unsupported Human Side path command '+cmd);
 }
 c.lineCap='round';c.lineJoin='round';
 if(fill){c.fillStyle=fill;c.fill();}
 c.strokeStyle=color;c.lineWidth=w;c.stroke();
}
function rounded(c:C,x:number,y:number,w:number,h:number,r:number,p:Palette,fill='#FFFFFF'){
 const rr=Math.min(r,w/2,h/2);
 curve(c,()=>{c.moveTo(x+rr,y);c.lineTo(x+w-rr,y);c.quadraticCurveTo(x+w,y,x+w,y+rr);c.lineTo(x+w,y+h-rr);c.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);c.lineTo(x+rr,y+h);c.quadraticCurveTo(x,y+h,x,y+h-rr);c.lineTo(x,y+rr);c.quadraticCurveTo(x,y,x+rr,y);c.closePath();},p.ink,2.4,fill);
}
function text(c:C,s:string,x:number,y:number,z:number,color:string,weight=600){
 c.fillStyle=color;c.font=weight+' '+z+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(s,x,y);
}
function wrap(c:C,s:string,x:number,y:number,w:number,z:number,color:string,leading=1.22){
 c.font='650 '+z+'px system-ui, sans-serif';
 const rows:string[]=[];let row='';
 for(const word of s.split(/\s+/).filter(Boolean)){
  const next=row?row+' '+word:word;if(row&&c.measureText(next).width>w){rows.push(row);row=word;}else row=next;
 }
 if(row)rows.push(row);
 const start=y-(rows.length-1)*z*leading/2;
 rows.forEach((v,i)=>text(c,v,x,start+i*z*leading,z,color,650));
}
function background(c:C,p:Palette,glowX:number,glowAlpha:number){
 c.fillStyle=p.bg;c.fillRect(0,0,W,H);
 // Stable, softly textured paper; no random per-frame flicker or image fetch.
 if(glowAlpha>0){
  c.save();c.globalAlpha=glowAlpha;
  const g=c.createRadialGradient(glowX,475,20,glowX,475,235);
  g.addColorStop(0,p.light);g.addColorStop(.52,p.light);g.addColorStop(1,p.bg);
  c.fillStyle=g;c.fillRect(0,210,W,520);c.restore();
 }
 let seed=12713;c.save();
 for(let i=0;i<1300;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%W;
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed%H;
  c.globalAlpha=.035+(seed%4)*.009;c.fillStyle=i%3?p.light:p.shadow;
  c.fillRect(x,y,2+(seed%3),1+(seed%2));
 }c.restore();
}
function drawFace(c:C,f:Face,t:number,p:Palette,phase:number){
 const k=p.ink;
 stroke(c,k,'M -46 0 C -46 -29 -23 -48 3 -47 C 30 -48 47 -26 47 0 C 46 27 26 47 0 46 C -28 47 -46 25 -46 0 Z',4.4,'#FFFFFF');
 const blink=(t+phase)%3.8>3.64;
 const happy=['smile','joy','relief'].includes(f);
 const wide=['panic','surprise'].includes(f);
 for(const side of [-1,1]){
  const x=side*17;
  if(f==='worry'||f==='panic'||f==='sad')stroke(c,k,'M '+(x-8)+' -19 Q '+x+' '+(-24+side*5)+' '+(x+8)+' -18',2.8);
  else if(f==='anger'||f==='determined')stroke(c,k,'M '+(x-8)+' '+(-22+side*4)+' L '+(x+8)+' '+(-22-side*4),3.2);
  else if(f==='confused')stroke(c,k,'M '+(x-7)+' '+(-22+side*4)+' Q '+x+' -28 '+(x+7)+' -21',2.6);
  if(blink||f==='sleepy')stroke(c,k,'M '+(x-7)+' -6 Q '+x+' -2 '+(x+7)+' -6',3);
  else if(happy)stroke(c,k,'M '+(x-8)+' -5 Q '+x+' -17 '+(x+8)+' -5',3);
  else if(wide){curve(c,()=>ovalPath(c,x,-6,7,9),k,2.5,'#FFFFFF');ellipse(c,x,-5,2.7,3.8,k);}
  else ellipse(c,x,-6,3.7,5.2,k);
 }
 if(f==='joy')stroke(c,k,'M -28 9 Q 0 24 28 8 Q 20 34 0 35 Q -19 34 -28 9 Z',3.3,'#FFFFFF');
 else if(f==='panic')stroke(c,k,'M -25 28 C -28 9 -5 1 11 7 C 29 12 31 26 21 29 C 14 29 12 14 0 16 C -11 17 -13 36 -21 35 Z',3.2,'#FFFFFF');
 else if(f==='surprise')curve(c,()=>ovalPath(c,0,19,7,10),k,3,'#FFFFFF');
 else if(f==='worry'||f==='sad'||f==='anger')stroke(c,k,'M -15 25 Q 0 8 15 25',3.3);
 else if(f==='confused')stroke(c,k,'M -13 20 Q 1 12 14 23',3);
 else if(happy)stroke(c,k,'M -21 11 Q 0 37 21 11',3.3);
 else stroke(c,k,'M -12 19 Q 0 22 12 19',3);
}
function hand(c:C,x:number,y:number,side:number,raised:boolean,p:Palette){
 const k=p.ink,dy=raised?-1:1;
 for(let i=0;i<3;i++){const dx=side*(i*6-5);curve(c,()=>{c.moveTo(x,y);c.quadraticCurveTo(x+dx*.5,y+dy*6,x+dx,y+dy*(10+3*(i===1?1:0)));},k,2.8);}
}
function figure(c:C,x:number,y:number,scale:number,time:number,pose:string,face:Face,p:Palette,from='neutral',phase=0,expressive=false){
 const a=HUMAN_POSES[from]??HUMAN_POSES.neutral,b=HUMAN_POSES[pose]??HUMAN_POSES.neutral;
 const u=smooth(time/.72),v=a.map((n,i)=>mix(n,b[i],u)) as Pose;
 const [lean,crouch,lx,ly,rx,ry,lf,rf]=v,k=p.ink;
 const e=expressive?1:0, tense=['panic','worried','kneel','crossed'].includes(pose), lively=['joy','relief','point','wave'].includes(pose);
 const breathe=Math.sin(time*2.7+phase)*(1.5+2.5*e);
 const tremor=['panic','worried','kneel'].includes(pose)?Math.sin(time*15+phase)*1.7*u:0;
 const sway=pose==='joy'?Math.sin(time*4.6)*3*u:0;
 const hx=lean*(1+.65*e)+tremor+sway+e*Math.sin(time*1.6+phase)*3,hy=-246+crouch*(1+.32*e)+breathe,neck=hy+44;
 const hipX=-lean*(.28+.5*e),hipY=-83+crouch*(.72+.1*e);
 c.save();c.translate(x,y);c.scale(scale,scale);
 ellipse(c,0,5,Math.max(47,(rf-lf)/2+18),9,p.shadow);
 // Feet stay at floor level; knees and elbows use independent curved paths.
 for(const side of [-1,1]){
  const fx=side===-1?lf:rf,km=expressive&&pose==='kneel'?u:0;
  const kneeX=mix(fx+side*(crouch*(.48+.38*e)+10)+e*lean*.32,side===-1?-42:-16,km);
  const kneeY=mix(-39+(tense?e*side*8:0),side===-1?-8:1,km);
  const footX=mix(fx,side===-1?12:48,km),footY=mix(0,side===-1?-18:-10,km);
  curve(c,()=>{c.moveTo(hipX,hipY);c.bezierCurveTo(hipX+side*17,hipY+15,kneeX,kneeY-13,kneeX,kneeY);c.quadraticCurveTo(mix(fx,kneeX+25,km),mix(-12,kneeY-6,km),footX,footY);c.lineTo(footX+side*13*(1-km),0);},k,5);
 }
 const shoulderX=hx*.72,shoulderY=neck+7;
 curve(c,()=>{c.moveTo(hx,neck-2);c.bezierCurveTo(hx-17-e*lean*.65,neck+26,hipX-13+e*lean*.9,hipY-25,hipX,hipY);},k,5.2);
 for(const side of [-1,1]){
  const motion=expressive&&pose!=='phone'?Math.sin(time*(tense?5:2.5)+phase+side*.8)*(tense?4:lively?7:2):0;
  const tx=(side===-1?lx:rx)+tremor+motion,ty=(side===-1?ly:ry)+crouch*.54+breathe+motion*.65;
  curve(c,()=>{c.moveTo(shoulderX,shoulderY);c.bezierCurveTo(shoulderX+side*27,shoulderY+12,(shoulderX+tx)*.5,ty+18,tx,ty);},k,4.7);
  hand(c,tx,ty,side,ty<shoulderY,p);
 }
 if(pose==='phone'){
  c.save();c.translate(rx,ry+crouch*.54);c.rotate(-.16);
  rounded(c,-8,-24,17,28,3,p,p.light);ellipse(c,0,0,1.7,1.7,k);c.restore();
 }
 c.save();c.translate(hx,hy);c.rotate((lean/(expressive?160:250))+tremor*.004);if(expressive){const squish=tense ? .055*Math.sin(time*4+phase):.018*Math.sin(time*2+phase);c.scale(1+squish,1-squish);}drawFace(c,face,time,p,phase);c.restore();
 c.restore();
}
function bubble(c:C,label:string,x:number,y:number,w:number,p:Palette,alpha=1){
 if(!label||alpha<=0)return;c.save();c.globalAlpha=alpha;
 rounded(c,x-w/2,y-31,w,62,20,p,'#FFFFFF');
 stroke(c,p.ink,'M '+(x-10)+' '+(y+31)+' l -8 12 l 23 -12',2.3,'#FFFFFF');
 wrap(c,label,x,y,w-18,20,p.ink);c.restore();
}
function phone(c:C,message:string,y:number,p:Palette,t:number,status='NEW MESSAGE'){
 const x=270,alpha=smooth(t/.35);
 c.save();c.globalAlpha=alpha;c.translate(x,y+(1-alpha)*12);
 rounded(c,-173,-53,346,106,20,p,p.light);
 text(c,status,0,-24,13,p.shadow,750);wrap(c,message,0,13,310,27,p.ink);
 c.restore();
}
function stress(c:C,x:number,y:number,t:number,p:Palette){
 for(let i=0;i<5;i++){
  const a=-Math.PI*.95+i*Math.PI*.22,r=70+Math.sin(t*5+i)*4;
  const xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r;
  c.save();c.translate(xx,yy);c.rotate(a+Math.PI/2);
  stroke(c,p.ink,'M 0 -9 Q -9 0 0 9 Q 8 0 0 -9 Z',2,'#FFFFFF');c.restore();
 }
}
const face=(value:string|undefined,fallback:Face):Face=>HUMAN_FACES.includes(value as Face)?value as Face:fallback;

/** A selectable social-video cover frame, deliberately readable in a small grid.
 * Also used by the PNG export; no separate asset or asynchronous image load. */
export function hasHumanSideCover(scene:OpenMotionScene|undefined):boolean{
 return !!scene?.doodle?.extras?.includes('human-side-v1')&&!!scene.doodle.extras.some(v=>v.startsWith('cover-title:')&&v.slice(12).trim());
}
function coverValue(scene:OpenMotionScene,key:string,fallback=''):string{
 return scene.doodle?.extras?.find(v=>v.startsWith(key+':'))?.slice(key.length+1)??fallback;
}
export function isHumanSideV2(scene:OpenMotionScene|undefined):boolean{
 return !!scene?.doodle?.extras?.includes('human-side-v2');
}
export function humanSideCoverDuration(scene:OpenMotionScene|undefined):number{
 if(!scene||!hasHumanSideCover(scene))return 0;
 return isHumanSideV2(scene)?Math.min(1.5,scene.durationSec*.55):Math.min(.85,scene.durationSec*.3);
}
function fitText(c:C,s:string,x:number,y:number,w:number,z:number,p:Palette,weight=800){
 c.font=weight+' '+z+'px system-ui, sans-serif';text(c,s,x,y,Math.min(z,z*w/Math.max(1,c.measureText(s).width)),p.ink,weight);
}
function thought(c:C,label:string,x:number,y:number,w:number,p:Palette,t:number,delay=0){
 const u=smooth((t-delay)/.45);if(u<=0||!label)return;
 c.save();c.globalAlpha=u;c.translate(0,10*(1-u));rounded(c,x-w/2,y-27,w,54,18,p,'#FFFFFF');
 fitText(c,label,x,y,w-18,22,p,650);
 ellipse(c,x-12,y+36,4,4,p.ink);ellipse(c,x-19,y+47,2.5,2.5,p.ink);c.restore();
}
function clock(c:C,x:number,y:number,r:number,t:number,p:Palette){
 curve(c,()=>ovalPath(c,x,y,r,r),p.ink,3.8,'#FFFFFF');
 for(let i=0;i<12;i++){const a=i*Math.PI/6;curve(c,()=>{c.moveTo(x+Math.sin(a)*(r-8),y-Math.cos(a)*(r-8));c.lineTo(x+Math.sin(a)*(r-4),y-Math.cos(a)*(r-4));},p.ink,2);}
 const a=t*2.1;curve(c,()=>{c.moveTo(x,y);c.lineTo(x+Math.sin(a)*r*.72,y-Math.cos(a)*r*.72);c.moveTo(x,y);c.lineTo(x+Math.sin(a/12+.7)*r*.43,y-Math.cos(a/12+.7)*r*.43);},p.ink,3.5);
 ellipse(c,x,y,3,3,p.ink);
}
function calendar(c:C,x:number,y:number,p:Palette,t:number,mode:string,title='DINNER',next='TOMORROW?'){
 c.save();c.translate(x,y);
 rounded(c,-111,-59,222,118,12,p,'#FFFFFF');
 rounded(c,-111,-59,222,29,8,p,p.light);text(c,'TODAY',0,-44,16,p.ink,800);
 const u=smooth((t-.3)/.65);
 for(let i=0;i<3;i++){const yy=-15+i*24;curve(c,()=>{c.moveTo(-92,yy);c.lineTo(91,yy);},p.shadow,1);}
 c.save();c.globalAlpha=mode==='reveal'?1-u:1;
 rounded(c,-83,-8,166,31,6,p,p.light);fitText(c,title,0,8,150,18,p,800);
 if(mode!=='calm'&&mode!=='reveal'){curve(c,()=>{c.moveTo(-78,10);c.lineTo(-78+156*u,10);},'#844F70',4);}
 c.restore();
 if(mode==='calm'||mode==='reveal'){
  c.save();c.translate(0,31*(1-u));c.globalAlpha=u;rounded(c,-83,24,166,29,6,p,p.light);fitText(c,next,0,39,150,16,p,750);c.restore();
 }c.restore();
}
function taskStack(c:C,x:number,y:number,p:Palette,t:number,count:number,labels:string[]){
 for(let i=0;i<count;i++){
  const u=smooth((t-i*.45)/.42);if(u<=0)continue;
  c.save();c.globalAlpha=u;c.translate(x+Math.sin(i*2.2)*8,y-i*22-20*(1-u));c.rotate((i%2?1:-1)*.025);
  rounded(c,-75,-15,150,30,6,p,i%2?p.light:'#FFFFFF');
  fitText(c,labels[i]??'TASK',0,0,125,14,p,750);
  c.restore();
 }
}
function feedback(c:C,x:number,y:number,p:Palette,t:number,mode:string,title='DRAFT'){
 c.save();c.translate(x,y);c.rotate(mode==='worry'?-.08:.025);
 rounded(c,-89,-72,178,144,10,p,'#FFFFFF');
 fitText(c,title,0,-51,155,18,p,800);
 for(let i=0;i<4;i++){const yy=-22+i*23;curve(c,()=>{c.moveTo(-64,yy);c.lineTo(56-(i%2)*20,yy);},p.shadow,3);}
 const u=smooth((t-.35)/.8);
 c.save();c.globalAlpha=u;curve(c,()=>{c.moveTo(-70,-22);c.lineTo(64,-22);},'#844F70',mode==='worry'?5:3);
 if(mode==='calm'||mode==='reveal'){curve(c,()=>{c.moveTo(48,38);c.lineTo(58,48);c.lineTo(77,25);},p.ink,3.5);}c.restore();c.restore();
}
function renderHumanV2(c:C,width:number,height:number,scene:OpenMotionScene,t:number,brand:OpenMotionBrandKit){
 const get=(k:string,f='')=>coverValue(scene,k,f),shot=get('shot','contrast'),theme=get('theme','message');
 const p:Palette={ink:brand.textColor||INK,bg:brand.backgroundColor||PAPER,light:brand.surfaceColor||LIGHT,shadow:brand.mutedColor||SHADOW};
 const pair=shot==='message'||shot==='contrast'||shot==='reveal',worried=shot==='worry';
 const time=shot==='message'?Math.max(0,t-humanSideCoverDuration(scene)):t;
 const u=smooth(time/.75),camera=1+.07*smooth(time/Math.max(1,scene.durationSec-1));
 const a=get('pose-a',worried?'panic':'phone'),b=get('pose-b','calm'),fa=face(get('face-a'),worried?'worry':'neutral'),fb=face(get('face-b'),'smile');
 c.save();c.scale(width/W,height/H);background(c,p,pair?370:270,worried ? .12:.78);
 text(c,'THE HUMAN SIDE  /  '+get('episode','01'),270,94,15,p.ink,750);
 // One visual emphasis per shot. Captions are composited by the shared renderer.
 const propY=shot==='message'||shot==='reveal'?286:235;
 if(theme==='waiting'){
  if(shot==='message')phone(c,get('message','No reply yet'),propY,p,time,'SENT');
  else if(shot==='reveal')phone(c,get('message'),propY,p,time,'REPLY');
  else if(shot==='contrast'){clock(c,270,258,37,time,p);thought(c,get('label-a'),141,348,214,p,time);thought(c,get('label-b'),366,348,214,p,time,.35);}
  else{clock(c,worried?100:424,226,40, time*(worried?1.8:.35),p);thought(c,get(worried?'label-a':'label-b'),270,325,300,p,time,.35);}
 }else if(theme==='calendar'){
  calendar(c,270,propY,p,time,shot,get('prop-title','DINNER'),get('prop-next','TOMORROW?'));
  if(!pair)thought(c,get(worried?'label-a':'label-b'),270,315,310,p,time,.45);
 }else if(theme==='boundaries'){
  if(shot==='message'||shot==='reveal')phone(c,get('message'),propY,p,time,shot==='message'?'REQUEST':'REPLY');
  else if(shot==='contrast'){const tasks=get('prop-tasks','WORK|ERRANDS|DINNER|HELP|ONE MORE').split('|');taskStack(c,142,360,p,time,4,tasks);taskStack(c,370,360,p,time,1,['TOMORROW']);}
  else{const tasks=get('prop-tasks','WORK|ERRANDS|DINNER|HELP|ONE MORE').split('|');taskStack(c,worried?104:425,365,p,time,worried?5:1,worried?tasks:['TOMORROW']);thought(c,get(worried?'label-a':'label-b'),270,208,290,p,time,.35);}
 }else if(theme==='feedback'){
  feedback(c,270,propY,p,time,shot,get('prop-title','DRAFT'));
  if(shot==='reveal')thought(c,get('message'),270,379,310,p,time,.6);
  else if(!pair)thought(c,get(worried?'label-a':'label-b'),270,315,300,p,time,.6);
 }else{
  if(shot==='message'||shot==='reveal')phone(c,get('message'),propY,p,time,shot==='message'?'NEW MESSAGE':'REPLY');
  else if(shot==='contrast'){thought(c,get('label-a'),140,308,216,p,time);thought(c,get('label-b'),367,308,216,p,time,.35);}
  else{thought(c,get(worried?'label-a':'label-b'),270,288,300,p,time,.2);if(worried){thought(c,get('detail-a','What if?'),122,365,182,p,time,.9);thought(c,get('detail-b','Are they upset?'),401,365,200,p,time,1.5);}}
 }
 // Match-cut floor positions, asymmetric body acting and small motivated camera pushes.
 const floor=694;
 if(pair){
  const scale=shot==='contrast'?1.0:.93;
  figure(c,144,floor,scale,time,a,fa,p,shot==='reveal'?'worried':'neutral',.7,true);
  figure(c,365,floor,scale,time,b,fb,p,shot==='reveal'?'calm':'neutral',2,true);
  if(shot==='contrast'&&['panic','worry','sad'].includes(fa))stress(c,120,520,time,p);
 }else{
  const side=worried?'a':'b',pose=get('pose-'+side,worried?'panic':'calm'),f=face(get('face-'+side),worried?'panic':'smile');
  const shrink=theme==='feedback'&&worried?1-.14*smooth(time/2):1;
  const scale=(theme==='calendar'||theme==='feedback'?1.09:1.2)*camera*shrink;
  const xpos=270+(worried?-12:12)*u;
  figure(c,xpos,floor,scale,time,pose,f,p,'phone',worried ? .5:1.8,true);
  if(worried)stress(c,xpos-26,480,time,p);
 }
 // Final editorial takeaway appears once, after the spoken narrative.
 if(shot==='reveal'&&t>scene.durationSec-1.6){
  const fade=smooth((t-(scene.durationSec-1.6))/.4);
  c.save();c.globalAlpha=fade;fitText(c,scene.headline,270,166,436,30,p,800);c.restore();
 }
 c.restore();
}


/** 2.1: five reusable single-protagonist story modules. All coordinates
 * are local to a 540 x 400 stage, so the same art fits cover and story. */
export const HUMAN_STORY_THEMES=['rest','mask','loop','load','crowd'] as const;
export const HUMAN_STORY_BEATS=['setup','build','turn','change','resolve'] as const;
export function isHumanSideV21(s:OpenMotionScene|undefined):boolean{
 return !!s?.doodle?.extras?.includes('human-side-v21');
}
type StoryGet=(key:string,fallback?:string)=>string;
function storyLine(c:C,p:Palette,x1:number,y1:number,x2:number,y2:number,w=3){
 curve(c,()=>{c.moveTo(x1,y1);c.lineTo(x2,y2);},p.ink,w);
}
function storyActor(c:C,p:Palette,x:number,y:number,scale:number,t:number,get:StoryGet,pose:string,mood:Face,side='a',phase=.7){
 figure(c,x,y,scale,t,get('pose-'+side,pose)||pose,face(get('face-'+side),mood),p,pose,phase,true);
}
function storyCard(c:C,p:Palette,x:number,y:number,label:string,w=118,alpha=1){
 c.save();c.globalAlpha*=alpha;rounded(c,x-w/2,y-18,w,36,8,p,'#FFFFFF');
 fitText(c,label,x,y,w-12,16,p,700);c.restore();
}
function storyChair(c:C,p:Palette,x:number,y:number){
 c.save();c.translate(x,y);
 rounded(c,-90,-144,82,108,19,p,p.light);
 rounded(c,-91,-67,151,35,13,p,p.light);
 storyLine(c,p,-75,-32,-75,0,5);storyLine(c,p,43,-32,43,0,5);
 rounded(c,-104,-90,26,64,10,p,p.light);c.restore();
}
function storyPhone(c:C,p:Palette,x:number,y:number,t:number,lit=true,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);
 rounded(c,-24,-42,48,84,8,p,'#FFFFFF');
 rounded(c,-19,-34,38,64,5,p,lit?p.light:p.shadow);
 if(lit){for(let i=0;i<3;i++){const dy=-25+i*18+(Math.sin(t*5)*3);rounded(c,-13,dy,26,12,3,p,'#FFFFFF');}}
 ellipse(c,0,35,2.4,2.4,p.ink);c.restore();
}
function seatedActor(c:C,p:Palette,get:StoryGet,t:number,mood:Face,resting:boolean){
 const breath=Math.sin(t*2.15)*2.2,lean=resting?-12:-1,headX=244+lean,headY=185+breath;
 const hipX=255,hipY=305;
 ellipse(c,292,370,74,7,p.shadow);
 curve(c,()=>{c.moveTo(hipX,hipY);c.quadraticCurveTo(295,302,316,320);c.quadraticCurveTo(323,344,323,369);c.lineTo(339,369);
  c.moveTo(hipX,hipY);c.quadraticCurveTo(281,308,291,326);c.lineTo(292,368);c.lineTo(306,368);},p.ink,5.2);
 curve(c,()=>{c.moveTo(headX,headY+42);c.quadraticCurveTo(239,267,hipX,hipY);},p.ink,5.5);
 const ax=resting?214:280,ay=resting?294:263;
 curve(c,()=>{c.moveTo(headX,headY+49);c.quadraticCurveTo(216,260,ax,ay);c.moveTo(headX,headY+49);c.quadraticCurveTo(288,252,297,306);},p.ink,4.7);
 hand(c,ax,ay,-1,false,p);hand(c,297,306,1,false,p);
 c.save();c.translate(headX,headY);c.rotate(resting?-.12:.05);c.scale(1.02,1.02);
 drawFace(c,face(get('face-a'),mood),t,p,.7);c.restore();
}
function restStory(c:C,p:Palette,get:StoryGet,beat:number,t:number,cover:boolean){
 const settle=smooth(t/1.1),release=beat>=3?smooth(t/1.6):0;
 storyChair(c,p,264,370);
 const mood:Face=beat===0?'neutral':beat===1?'worry':beat===2?'sad':'relief';
 seatedActor(c,p,get,t,mood,beat>=3);
 if(beat===1||beat===2||cover){
  const words=get('prop-tasks','EMAIL|LAUNDRY|ONE MORE THING').split('|').slice(0,4);
  words.forEach((v,i)=>{
   const a=-2.85+i*.75+Math.sin(t*1.1+i)*.08;
   const alpha=(cover?1:smooth((t-i*.45)/.45))*(1-release);
   storyCard(c,p,270+Math.cos(a)*166,157+Math.sin(a)*87,v,136,alpha);
  });
  clock(c,438,205,36,t,p);
 }else if(beat>=3){
  c.save();c.globalAlpha=settle;ellipse(c,270,84,102,45,p.light);
  fitText(c,get('prop-next','REST IS ALLOWED'),270,83,195,19,p,800);c.restore();
 }else clock(c,424,175,35,t,p);
}
function maskStory(c:C,p:Palette,get:StoryGet,beat:number,t:number,cover:boolean){
 const alone=beat>=2;
 if(!alone&&!cover){for(const [x,phase] of [[85,0],[455,2]]){c.save();c.globalAlpha=.42;figure(c,x,340,.58,t,'wave','smile',p,'wave',phase,true);c.restore();}}
 // One face beneath a physical, removable smiling mask.
 const x=270,y=170,scale=1.5;
 c.save();c.translate(x,y);
 curve(c,()=>{c.moveTo(0,64);c.bezierCurveTo(-22,98,-16,142,0,164);c.moveTo(0,164);c.lineTo(-45,200);c.moveTo(0,164);c.lineTo(42,200);},p.ink,6);
 const defaultMood:Face=beat>=3?'relief':'sad';
 const faceMood=face(get('face-a'),defaultMood);
 c.save();c.scale(scale,scale);drawFace(c,faceMood,t,p,0);c.restore();
 const move=cover ? .78:beat===0||beat===1?0:beat===2?smooth(t/2.1):1;
 const mx=118*move,my=72*move;
 curve(c,()=>{c.moveTo(0,76);c.quadraticCurveTo(100,145,mx+32,my+43);},p.ink,5);
 curve(c,()=>{c.moveTo(0,77);c.quadraticCurveTo(-67,112,-68,150);},p.ink,5);
 if(beat<4||cover){c.save();c.translate(mx,my);c.rotate(.22*move);c.scale(scale,scale);drawFace(c,'joy',.6,p,2);c.restore();}
 else if(beat===4){storyActor(c,p,135,202,.65,t,get,'relief','smile','b',2);}
 c.restore();
 if(beat===3&&!cover)thought(c,get('label-a','I’m not okay today.'),270,54,300,p,t,.2);
}
function loopStory(c:C,p:Palette,get:StoryGet,beat:number,t:number,cover:boolean){
 const repeat=beat===0||beat===1||beat===2;
 const progress=repeat?(t%1.6)/1.6:beat===4?1:smooth(t/1.6);
 const cx=270,cy=192,rad=151;
 if(repeat||cover){
  const angle=cover?-.65:t*1.9;
  for(let i=0;i<18;i++){
   const a=angle+i*Math.PI*2/20,b=a+.23;
   curve(c,()=>{c.moveTo(cx+rad*Math.cos(a),cy+rad*Math.sin(a));c.quadraticCurveTo(cx+rad*Math.cos((a+b)/2),cy+rad*Math.sin((a+b)/2),cx+rad*Math.cos(b),cy+rad*Math.sin(b));},p.shadow,5);
  }
  const a=angle+18*Math.PI*2/20,ax=cx+rad*Math.cos(a),ay=cy+rad*Math.sin(a);
  c.save();c.translate(ax,ay);c.rotate(a+Math.PI/2);stroke(c,p.ink,'M -16 -12 L 0 0 L -16 12',5);c.restore();
  storyActor(c,p,270,333,.91,t,get,beat===2?'think':'phone',beat===2?'confused':'worry');
  clock(c,426,110,33,t*.8,p);storyPhone(c,p,112,211,t,true,.9);
  if(beat!==2){const swipe=smooth(progress);c.save();c.globalAlpha=Math.sin(Math.PI*progress);curve(c,()=>{c.moveTo(138,241-38*swipe);c.lineTo(138,217-38*swipe);},p.ink,3);c.restore();}
  if(!cover)storyCard(c,p,270,31,get('prop-title','JUST ONE MORE'),220);
 }else{
  const x=mix(180,405,progress);
  storyActor(c,p,180,368,1.0,t,get,beat===3?'point':'relief',beat===3?'determined':'relief');
  storyPhone(c,p,x,250,t,false,.95);
  storyLine(c,p,350,291,466,291,5);storyLine(c,p,366,291,366,367,4);storyLine(c,p,448,291,448,367,4);
  if(beat===4)storyCard(c,p,400,153,get('prop-next','PHONE AWAY'),170,progress);
 }
}
function loadStory(c:C,p:Palette,get:StoryGet,beat:number,t:number,cover:boolean){
 const words=get('prop-tasks','WORK|FAMILY|ERRANDS|FAVOURS').split('|').slice(0,5);
 const count=cover?words.length:beat===0?1:beat===1?Math.min(words.length,1+Math.floor(t/.85)):beat===2?words.length:beat===3?words.length:Math.max(1,words.length-2);
 const transfer=beat===3?smooth((t-.35)/1.7):beat===4?1:0;
 const heroX=beat>=3?182:235,heroScale=beat===2 ? .86 : .95;
 const pose=beat===2?'kneel':beat===1?(t<1.6?'point':t<3.2?'lean':'panic'):beat>=3?'relief':'point';
 const mood=beat===2?'sad':beat===1?'worry':beat>=3?'relief':'neutral';
 storyActor(c,p,heroX,370,heroScale,t,get,pose,mood);
 if(beat>=3)storyActor(c,p,414,370,.85,t,get,'point','smile','b',2);
 for(let i=0;i<count;i++){
  const u=cover||beat!==1?1:smooth((t-i*.85)/.38);
  if(u<=0)continue;
  const shared=beat>=3&&i>=Math.max(1,count-2),xx=shared?mix(300,414,transfer):heroX+99;
  const yy=260-i*42-16*(1-u)+(shared?transfer*42:0);
  c.save();c.globalAlpha*=u;c.translate(xx,yy);c.rotate((i%2 ? .02:-.02)*(1-transfer));
  rounded(c,-60,-20,120,40,5,p,i%2?p.light:'#FFFFFF');
  fitText(c,words[i]??'TASK',0,0,108,15,p,800);c.restore();
 }
 if(beat===2&&!cover)stress(c,heroX-25,170,t,p);
}
function crowdStory(c:C,p:Palette,get:StoryGet,beat:number,t:number,cover:boolean){
 const connected=beat>=3,clear=connected?smooth(t/1.5):0;
 const people=[[61,230,.48],[162,197,.50],[367,204,.49],[482,234,.47]];
 for(let i=0;i<people.length;i++){
  const [x,y,scale]=people[i];
  c.save();c.globalAlpha=(cover ? .4:.52)*(1-.7*clear);
  const crowdP={...p,ink:p.shadow};
  figure(c,x+Math.sin(t*.8+i)*9+(x<270?-1:1)*clear*28,y,scale,t,i%2?'wave':'joy','smile',crowdP,'neutral',i,true);
  if(!connected){ellipse(c,x,y-177,25,11,p.light);ellipse(c,x-11,y-177,2,2,p.shadow);ellipse(c,x,y-177,2,2,p.shadow);ellipse(c,x+11,y-177,2,2,p.shadow);}
  c.restore();
 }
 const heroX=connected?mix(270,195,clear):270;
 storyActor(c,p,heroX,370,1.02,t,get,beat===2?'kneel':connected?'relief':'crossed',connected?'relief':'sad');
 if(connected){const x=mix(494,365,clear);storyActor(c,p,x,370,1.01,t,get,'relief','smile','b',2);
  if(beat===4){const a=smooth((t-.7)/.6);c.save();c.globalAlpha=a;thought(c,get('label-b','I’m listening.'),280,67,220,p,t,0);c.restore();}
 }
}
function storyArt(c:C,p:Palette,scene:OpenMotionScene,t:number,cover=false){
 const theme=coverValue(scene,'theme','rest'),shot=coverValue(scene,'shot','setup');
 const idx=HUMAN_STORY_BEATS.indexOf(shot as typeof HUMAN_STORY_BEATS[number]);
 const beat=cover?(theme==='mask'?2:theme==='load'?2:1):Math.max(0,idx);
 const get:StoryGet=(k,f='')=>cover&&(/^(pose|face)-[ab]$/.test(k))?f:coverValue(scene,k,f);
 const module=theme==='mask'?maskStory:theme==='loop'?loopStory:theme==='load'?loadStory:theme==='crowd'?crowdStory:restStory;
 module(c,p,get,beat,t,cover);
}
function renderHumanV21(c:C,width:number,height:number,scene:OpenMotionScene,t:number,brand:OpenMotionBrandKit){
 const p:Palette={ink:brand.textColor||INK,bg:brand.backgroundColor||PAPER,light:brand.surfaceColor||LIGHT,shadow:brand.mutedColor||SHADOW};
 const shot=coverValue(scene,'shot','setup'),time=Math.max(0,t-humanSideCoverDuration(scene));
 const push=1+.035*smooth(time/Math.max(1,scene.durationSec-1));
 c.save();c.scale(width/W,height/H);
 background(c,p,270,shot==='turn' ? .26:.86);
 text(c,'THE HUMAN SIDE  /  '+coverValue(scene,'episode','06'),270,94,15,p.ink,750);
 c.save();c.translate(270,690);c.scale(push,push);c.translate(-270,-370);
 storyArt(c,p,scene,time);c.restore();
 if(shot==='resolve'&&time>Math.max(0,scene.durationSec-2)){
  c.save();c.globalAlpha=smooth((time-(scene.durationSec-2))/.35);
  fitText(c,scene.headline,270,169,430,31,p,850);c.restore();
 }
 c.restore();
}


/** Cinematic action rig: explicit joint coordinates in one continuous stage.
 * The phone follows the gripping hand until contact with the table. */
export function isHumanSideV22(s:OpenMotionScene|undefined):boolean{
 return !!s?.doodle?.extras?.includes('human-side-v22');
}
export const HUMAN_ACTION_SHOTS=['scroll','time','repeat','realize','place','sit'] as const;
function actionCamera(c:C,x:number,y:number,scale:number,draw:()=>void){
 c.save();c.translate(270,441);c.scale(scale,scale);c.translate(-x,-y);draw();c.restore();
}
function actionClock(c:C,p:Palette,x:number,y:number,value:string,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);
 rounded(c,-111,-45,222,90,17,p,'#FFFFFF');
 text(c,value,0,0,52,p.ink,850);c.restore();
}
function actionPhone(c:C,p:Palette,x:number,y:number,scroll:number,lit=true,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);
 rounded(c,-37,-65,74,130,12,p,'#FFFFFF');
 rounded(c,-30,-54,60,106,7,p,lit?p.light:p.shadow);
 if(lit){
  const shift=scroll%27;
  // Card coordinates stay within the screen without using a clipping API.
  for(let i=0;i<5;i++){
   const yy=-50+i*27-shift;
   if(yy>=-48&&yy+20<=48){
    rounded(c,-25,yy,50,20,3,p,'#FFFFFF');
    storyLine(c,p,-17,yy+7,17,yy+7,1.4);
    storyLine(c,p,-17,yy+13,5,yy+13,1.2);
   }
  }
 }
 ellipse(c,0,58,3,3,p.ink);c.restore();
}
function actionLimb(c:C,p:Palette,ax:number,ay:number,bx:number,by:number,cx:number,cy:number,w=6){
 curve(c,()=>{c.moveTo(ax,ay);c.quadraticCurveTo(bx,by,cx,cy);},p.ink,w);
}
function actionHero(c:C,p:Palette,x:number,floor:number,t:number,mode:string,emotion:Face,phoneOn:boolean,gripX=100,gripY=-190,amount=1,phoneRotation=0){
 const walking=mode==='walk',sitting=mode==='sit';
 const u=sitting?smooth(amount):0,step=walking?Math.sin(t*TAU_ACTION*1.7):0;
 const bob=walking?-Math.abs(step)*9:Math.sin(t*2.7)*2;
 const lean=mode==='shock'?-16:walking?13:mode==='reach'?24:0;
 const hx=lean-12*u,hy=-250+u*80+bob,hipX=-lean*.5,hipY=-91+u*30;
 const shoulderX=hx*.65,shoulderY=hy+58;
 c.save();c.translate(x,floor);
 ellipse(c,0,8,66,9,p.shadow);
 for(const side of [-1,1]){
  const footX=side*(walking?step*48:30)+u*38,footY=walking?-Math.max(0,side*step)*24:0;
  const kneeX=mix(footX+side*12,side===-1?66:92,u),kneeY=mix(-45,-59,u);
  actionLimb(c,p,hipX,hipY,kneeX,kneeY,footX,footY,6);
  storyLine(c,p,footX,footY,footX+17,footY,6);
 }
 actionLimb(c,p,hx,hy+42,hx-24,hipY-39,hipX,hipY,7);
 const leftX=mode==='shock'?-63:walking?-55-step*25:-58,leftY=mode==='shock'?-210:walking?-112:-115+40*u;
 actionLimb(c,p,shoulderX,shoulderY,-66,shoulderY+52,leftX,leftY,6);
 hand(c,leftX,leftY,-1,false,p);
 const rx=phoneOn?gripX:mode==='reach'?gripX:mode==='shock'?77:walking?55+step*25:60;
 const ry=phoneOn?gripY:mode==='reach'?gripY:mode==='shock'?-206:-112+43*u;
 actionLimb(c,p,shoulderX,shoulderY,rx*.74,shoulderY+55,rx,ry,6);
 if(phoneOn){c.save();c.translate(rx,ry);c.rotate(phoneRotation);actionPhone(c,p,6,-36,t*45,phoneRotation<.6,.7);c.restore();}
 hand(c,rx,ry,1,ry<shoulderY,p);
 c.save();c.translate(hx,hy);c.rotate(lean/160);
 const squish=emotion==='surprise' ? .06:emotion==='worry' ? -.025:0;
 c.scale(1+squish,1-squish);drawFace(c,emotion,t,p,.7);c.restore();
 c.restore();
}
const TAU_ACTION=Math.PI*2;
function actionTable(c:C,p:Palette,x:number,floor:number){
 rounded(c,x-71,floor-118,142,18,6,p,p.light);
 storyLine(c,p,x-55,floor-100,x-55,floor,5);
 storyLine(c,p,x+55,floor-100,x+55,floor,5);
}
function scrollCloseup(c:C,p:Palette,t:number,interval:number){
 const phase=(t%interval)/interval,swipe=smooth((phase-.12)/.65);
 actionPhone(c,p,270,420,Math.floor(t/interval)*27+swipe*27,true,3.05);
 // Palm, thumb and curved finger remain attached to the forearm.
 curve(c,()=>{c.moveTo(474,670);c.bezierCurveTo(395,663,379,574,367,525);
 c.quadraticCurveTo(348,485,327,503);c.quadraticCurveTo(306,515,323,543);
 c.lineTo(339,580);c.quadraticCurveTo(302,565,290,582);
 c.quadraticCurveTo(274,614,328,654);c.lineTo(392,697);c.closePath();},p.ink,5,'#FFFFFF');
 const fy=520-112*swipe;
 curve(c,()=>{c.moveTo(341,582);c.quadraticCurveTo(326,fy+44,307,fy);c.quadraticCurveTo(300,fy-13,311,fy-20);},p.ink,7);
 ellipse(c,307,fy,9,9,p.ink);
}
function renderHumanV22(c:C,width:number,height:number,scene:OpenMotionScene,t:number,brand:OpenMotionBrandKit,cover=false){
 const p:Palette={ink:brand.textColor||INK,bg:brand.backgroundColor||PAPER,light:brand.surfaceColor||LIGHT,shadow:brand.mutedColor||SHADOW};
 const shot=coverValue(scene,'action','scroll'),d=Math.max(.1,scene.durationSec-humanSideCoverDuration(scene));
 const time=cover?1.1:Math.max(0,t-humanSideCoverDuration(scene)),u=clamp(time/d);
 const floor=694;
 c.save();c.scale(width/W,height/H);background(c,p,270,shot==='realize' ? .36:.9);
 if(cover){
  rounded(c,130,180,280,38,19,p,p.ink);text(c,'THE HUMAN SIDE  /  '+coverValue(scene,'episode','08'),270,199,17,'#FFFFFF',800);
  coverValue(scene,'cover-title').split('|').filter(Boolean).slice(0,2).forEach((v,i)=>fitText(c,v,270,258+i*55,450,54,p,900));
  const hook=coverValue(scene,'cover-hook');if(hook){rounded(c,83,345,374,39,14,p,'#FFFFFF');fitText(c,hook,270,364,348,22,p,650);}
  // Large face and phone form the thumbnail, not a miniature full stage.
  c.save();c.translate(169,538);c.scale(2.7,2.7);drawFace(c,'worry',.3,p,.7);c.restore();
  actionPhone(c,p,378,568,22,true,2.05);actionClock(c,p,168,713,'23:30',.72);
  c.restore();return;
 }
 text(c,'THE HUMAN SIDE  /  '+coverValue(scene,'episode','08'),270,102,17,p.ink,750);
 if(shot==='scroll'){
  scrollCloseup(c,p,time,1.05);
 }else if(shot==='time'){
  const minute=Math.min(90,Math.floor(u*105/15)*15),hh=22+Math.floor(minute/60),mm=String(minute%60).padStart(2,'0');
  actionClock(c,p,270,225,hh+':'+mm,1.36);
  actionCamera(c,270,470,1.18,()=>actionHero(c,p,235,floor,time,'stand','neutral',true,105,-191));
 }else if(shot==='repeat'){
  const cut=u<.41?0:u<.74?1:2,local=(u-[0,.41,.74][cut])*d;
  if(cut===1){actionClock(c,p,270,225,'23:30',1.36);actionCamera(c,270,470,1.18,()=>actionHero(c,p,235,floor,local,'stand','worry',true,105,-191));}
  else {scrollCloseup(c,p,local,cut===0 ? .8 : .43);storyCard(c,p,270,186,coverValue(scene,'prop-title','JUST ONE MORE'),220);}
 }else if(shot==='realize'){
  actionClock(c,p,270,252,'23:30',1.33);
  c.save();c.translate(270,491);c.scale(2.65+.13*smooth(time),2.65+.13*smooth(time));drawFace(c,'surprise',time,p,.5);c.restore();
  stress(c,270,491,time,p);
 }else if(shot==='place'){
  const walk=clamp(time/2.1),reach=smooth((time-2.1)/.9),release=smooth((time-3)/.45);
  const x=mix(106,269,walk),gx=mix(79,76,reach),gy=mix(-190,-150,reach);
  actionTable(c,p,403,floor);
  if(time<3.0)actionHero(c,p,x,floor,time,time<2.1?'walk':'reach','determined',true,gx,gy,1,reach*Math.PI/2);
  else{
   actionHero(c,p,269,floor,time,'reach','relief',false,mix(76,55,release),mix(-150,-112,release));
   c.save();c.translate(381,floor-144);c.rotate(Math.PI/2);actionPhone(c,p,0,0,0,false,.7);c.restore();
  }
 }else{
  const settle=smooth(time/.9);
  actionTable(c,p,403,floor);c.save();c.translate(381,floor-144);c.rotate(Math.PI/2);actionPhone(c,p,0,0,0,false,.7);c.restore();
  storyChair(c,p,161,floor);
  actionHero(c,p,151,floor,time,'sit','relief',false,0,0,settle);
  if(time>1.3){c.save();c.globalAlpha=smooth((time-1.3)/.35);fitText(c,scene.headline||'Change the cue.',270,226,448,42,p,850);c.restore();}
 }
 c.restore();
}

export function renderHumanSideCover(c:C,width:number,height:number,scene:OpenMotionScene,brand:OpenMotionBrandKit,localTime=.3){
 if(isHumanSideV22(scene)){renderHumanV22(c,width,height,scene,localTime,brand,true);return;}
 const p:Palette={ink:brand.textColor||INK,bg:brand.backgroundColor||PAPER,light:brand.surfaceColor||LIGHT,shadow:brand.mutedColor||SHADOW};
 c.save();c.scale(width/W,height/H);background(c,p,370,.95);
 if(isHumanSideV21(scene)){
  rounded(c,130,210,280,38,19,p,p.ink);text(c,'THE HUMAN SIDE  /  '+coverValue(scene,'episode','06'),270,229,17,'#FFFFFF',800);
  coverValue(scene,'cover-title').split('|').filter(Boolean).slice(0,2).forEach((v,i)=>fitText(c,v,270,280+i*55,430,51,p,900));
  const hook=coverValue(scene,'cover-hook');if(hook){rounded(c,63,372,414,39,14,p,'#FFFFFF');fitText(c,hook,270,391.5,382,21,p,650);}
  const act=1.55+.45*smooth((localTime-.82)/.68);
  c.save();c.translate(270,742);c.scale(.79,.79);c.translate(-270,-370);
  storyArt(c,p,scene,act,true);c.restore();
  c.restore();return;
 }
 if(isHumanSideV2(scene)){
  const episode=coverValue(scene,'episode','01'),lines=coverValue(scene,'cover-title').split('|').filter(Boolean).slice(0,2);
  rounded(c,130,210,280,38,19,p,p.ink);text(c,'THE HUMAN SIDE  /  '+episode,270,229,17,'#FFFFFF',800);
  lines.forEach((v,i)=>fitText(c,v,270,280+i*55,430,51,p,900));
  const a=coverValue(scene,'cover-pose-a','kneel'),b=coverValue(scene,'cover-pose-b','joy');
  const act=1.25+.65*smooth((localTime-.82)/.68);
  figure(c,144,742,1.06,act,a,face(coverValue(scene,'cover-face-a'),'panic'),p,a,.7,true);
  figure(c,369,742,1.04,act,b,face(coverValue(scene,'cover-face-b'),'joy'),p,b,2,true);
  if(['panic','worry','sad'].includes(coverValue(scene,'cover-face-a','panic')))stress(c,112,530,1.25,p);
  const hook=coverValue(scene,'cover-hook',coverValue(scene,'message',''));
  if(hook){rounded(c,63,372,414,39,14,p,'#FFFFFF');fitText(c,hook,270,391.5,382,21,p,650);}
  c.restore();return;
 }
 // Core title and faces are within the central profile-grid crop (y=210–750).
 const episode=coverValue(scene,'episode','01');
 rounded(c,135,210,270,39,19,p,p.ink);
 text(c,'THE HUMAN SIDE  /  '+episode,270,229,17,'#FFFFFF',800);
 const lines=coverValue(scene,'cover-title','SAME MESSAGE|DIFFERENT MINDS').split('|').filter(Boolean).slice(0,2);
 lines.forEach((v,i)=>{
  const y=287+i*55;
  c.font='900 48px system-ui, sans-serif';
  const size=Math.min(48,48*430/Math.max(1,c.measureText(v).width));
  text(c,v,270,y,size,p.ink,900);
 });
 // Enlarged expressions: opposing poses communicate the topic even without text.
 const a=coverValue(scene,'cover-pose-a','kneel'),b=coverValue(scene,'cover-pose-b','joy');
 figure(c,144,713,1.12,1.25,a,face(coverValue(scene,'cover-face-a'),'panic'),p,a,.7);
 figure(c,369,713,1.12,1.25,b,face(coverValue(scene,'cover-face-b'),'joy'),p,b,2);
 if(['panic','worry','sad'].includes(coverValue(scene,'cover-face-a','panic')))stress(c,120,492,1.25,p);
 const hook=coverValue(scene,'cover-hook',coverValue(scene,'message',''));
 if(hook){rounded(c,77,380,386,56,16,p,'#FFFFFF');wrap(c,hook,270,408,356,24,p.ink);}
 c.restore();
}

export function renderHumanSide(c:C,width:number,height:number,scene:OpenMotionScene,localTime:number,brand:OpenMotionBrandKit){
 const t=Math.max(0,Math.min(scene.durationSec,localTime));
 if(t<humanSideCoverDuration(scene)){renderHumanSideCover(c,width,height,scene,brand,t);return;}
 if(isHumanSideV22(scene)){renderHumanV22(c,width,height,scene,t,brand);return;}
 if(isHumanSideV21(scene)){renderHumanV21(c,width,height,scene,t,brand);return;}
 if(isHumanSideV2(scene)){renderHumanV2(c,width,height,scene,t,brand);return;}
 const extras=scene.doodle?.extras??[];
 const get=(key:string,fallback='')=>extras.find(x=>x.startsWith(key+':'))?.slice(key.length+1)??fallback;
 const shot=get('shot','contrast'),episode=get('episode','01'),message=get('message','We need to talk.');
 const p:Palette={ink:brand.textColor||INK,bg:brand.backgroundColor||PAPER,light:brand.surfaceColor||LIGHT,shadow:brand.mutedColor||SHADOW};
 const pair=shot==='message'||shot==='contrast'||shot==='reveal';
 const warm=shot==='calm'||shot==='contrast'||shot==='reveal';
 c.save();c.scale(width/W,height/H);
 background(c,p,pair?370:270,warm ? .72 : 0);
 text(c,'THE HUMAN SIDE  /  '+episode,270,82,17,p.ink,750);
 // Primary visuals remain inside the Shorts overlay-safe centre.
 if(shot==='message'){
  phone(c,message,297,p,t);
  figure(c,144,699,.87,t,get('pose-a','phone'),face(get('face-a'),'neutral'),p,'neutral',.7);
  figure(c,365,699,.87,t,get('pose-b','phone'),face(get('face-b'),'neutral'),p,'neutral',2);
 }else if(shot==='worry'){
  bubble(c,get('label-a','What did I do?'),270,304,300,p,smooth(t/.45));
  figure(c,270,705,1.18,t,get('pose-a','panic'),face(get('face-a'),'panic'),p,'phone',.5);
  stress(c,242,471,t,p);
 }else if(shot==='calm'){
  bubble(c,get('label-b','We will talk later.'),270,304,310,p,smooth(t/.45));
  figure(c,270,705,1.18,t,get('pose-b','calm'),face(get('face-b'),'smile'),p,'phone',1.8);
 }else if(shot==='reveal'){
  phone(c,message,297,p,t);
  figure(c,144,699,.87,t,get('pose-a','relief'),face(get('face-a'),'relief'),p,'worried',.7);
  figure(c,365,699,.87,t,get('pose-b','relief'),face(get('face-b'),'smile'),p,'calm',2);
 }else{
  bubble(c,get('label-a','Something is wrong.'),139,323,216,p,smooth(t/.42));
  bubble(c,get('label-b','Let us find out.'),380,323,216,p,smooth(t/.55));
  figure(c,141,699,.87,t,get('pose-a','worried'),face(get('face-a'),'worry'),p,'neutral',.7);
  figure(c,365,699,.87,t,get('pose-b','calm'),face(get('face-b'),'smile'),p,'neutral',2);
  if(['panic','worry','sad'].includes(get('face-a','worry')))stress(c,124,529,t,p);
 }
 wrap(c,scene.headline,270,166,444,34,p.ink);
 if(scene.caption)wrap(c,scene.caption,270,790,432,25,p.ink);
 c.restore();
}
