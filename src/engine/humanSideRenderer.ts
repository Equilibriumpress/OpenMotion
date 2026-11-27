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
function ellipse(c:C,x:number,y:number,rx:number,ry:number,fill:string){
 curve(c,()=>c.ellipse(x,y,rx,Math.max(.5,ry),0,0,Math.PI*2),fill,0,fill);
}
function stroke(c:C,color:string,path:string,w=4.2,fill?:string){
 const p=new Path2D(path);c.lineCap='round';c.lineJoin='round';
 if(fill){c.fillStyle=fill;c.fill(p);}
 c.strokeStyle=color;c.lineWidth=w;c.stroke(p);
}
function rounded(c:C,x:number,y:number,w:number,h:number,r:number,p:Palette,fill='#FFFFFF'){
 curve(c,()=>c.roundRect(x,y,w,h,r),p.ink,2.4,fill);
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
  else if(wide){curve(c,()=>c.ellipse(x,-6,7,9,0,0,Math.PI*2),k,2.5,'#FFFFFF');ellipse(c,x,-5,2.7,3.8,k);}
  else ellipse(c,x,-6,3.7,5.2,k);
 }
 if(f==='joy')stroke(c,k,'M -28 9 Q 0 24 28 8 Q 20 34 0 35 Q -19 34 -28 9 Z',3.3,'#FFFFFF');
 else if(f==='panic')stroke(c,k,'M -25 28 C -28 9 -5 1 11 7 C 29 12 31 26 21 29 C 14 29 12 14 0 16 C -11 17 -13 36 -21 35 Z',3.2,'#FFFFFF');
 else if(f==='surprise')curve(c,()=>c.ellipse(0,19,7,10,0,0,Math.PI*2),k,3,'#FFFFFF');
 else if(f==='worry'||f==='sad'||f==='anger')stroke(c,k,'M -15 25 Q 0 8 15 25',3.3);
 else if(f==='confused')stroke(c,k,'M -13 20 Q 1 12 14 23',3);
 else if(happy)stroke(c,k,'M -21 11 Q 0 37 21 11',3.3);
 else stroke(c,k,'M -12 19 Q 0 22 12 19',3);
}
function hand(c:C,x:number,y:number,side:number,raised:boolean,p:Palette){
 const k=p.ink,dy=raised?-1:1;
 for(let i=0;i<3;i++){const dx=side*(i*6-5);curve(c,()=>{c.moveTo(x,y);c.quadraticCurveTo(x+dx*.5,y+dy*6,x+dx,y+dy*(10+3*(i===1?1:0)));},k,2.8);}
}
function figure(c:C,x:number,y:number,scale:number,time:number,pose:string,face:Face,p:Palette,from='neutral',phase=0){
 const a=HUMAN_POSES[from]??HUMAN_POSES.neutral,b=HUMAN_POSES[pose]??HUMAN_POSES.neutral;
 const u=smooth(time/.72),v=a.map((n,i)=>mix(n,b[i],u)) as Pose;
 const [lean,crouch,lx,ly,rx,ry,lf,rf]=v,k=p.ink;
 const breathe=Math.sin(time*2.7+phase)*1.5;
 const tremor=['panic','worried','kneel'].includes(pose)?Math.sin(time*15+phase)*1.7*u:0;
 const sway=pose==='joy'?Math.sin(time*4.6)*3*u:0;
 const hx=lean+tremor+sway,hy=-246+crouch+breathe,neck=hy+44;
 const hipX=-lean*.28,hipY=-83+crouch*.72;
 c.save();c.translate(x,y);c.scale(scale,scale);
 ellipse(c,0,5,Math.max(47,(rf-lf)/2+18),9,p.shadow);
 // Feet stay at floor level; knees and elbows use independent curved paths.
 for(const side of [-1,1]){
  const fx=side===-1?lf:rf,kneeX=fx+side*(crouch*.48+10),kneeY=-39;
  curve(c,()=>{c.moveTo(hipX,hipY);c.bezierCurveTo(hipX+side*17,hipY+15,kneeX,kneeY-13,kneeX,kneeY);c.quadraticCurveTo(fx,-12,fx,0);c.lineTo(fx+side*13,0);},k,5);
 }
 const shoulderX=hx*.72,shoulderY=neck+7;
 curve(c,()=>{c.moveTo(hx,neck-2);c.bezierCurveTo(hx-17,neck+26,hipX-13,hipY-25,hipX,hipY);},k,5.2);
 for(const side of [-1,1]){
  const tx=(side===-1?lx:rx)+tremor,ty=(side===-1?ly:ry)+crouch*.54+breathe;
  curve(c,()=>{c.moveTo(shoulderX,shoulderY);c.bezierCurveTo(shoulderX+side*27,shoulderY+12,(shoulderX+tx)*.5,ty+18,tx,ty);},k,4.7);
  hand(c,tx,ty,side,ty<shoulderY,p);
 }
 if(pose==='phone'){
  c.save();c.translate(rx,ry+crouch*.54);c.rotate(-.16);
  rounded(c,-8,-24,17,28,3,p,p.light);ellipse(c,0,0,1.7,1.7,k);c.restore();
 }
 c.save();c.translate(hx,hy);c.rotate((lean/250)+tremor*.004);drawFace(c,face,time,p,phase);c.restore();
 c.restore();
}
function bubble(c:C,label:string,x:number,y:number,w:number,p:Palette,alpha=1){
 if(!label||alpha<=0)return;c.save();c.globalAlpha=alpha;
 rounded(c,x-w/2,y-31,w,62,20,p,'#FFFFFF');
 stroke(c,p.ink,'M '+(x-10)+' '+(y+31)+' l -8 12 l 23 -12',2.3,'#FFFFFF');
 wrap(c,label,x,y,w-18,20,p.ink);c.restore();
}
function phone(c:C,message:string,y:number,p:Palette,t:number){
 const x=270,alpha=smooth(t/.35);
 c.save();c.globalAlpha=alpha;c.translate(x,y+(1-alpha)*12);
 rounded(c,-173,-53,346,106,20,p,p.light);
 text(c,'NEW MESSAGE',0,-24,13,p.shadow,750);wrap(c,message,0,13,310,27,p.ink);
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
export function renderHumanSideCover(c:C,width:number,height:number,scene:OpenMotionScene,brand:OpenMotionBrandKit){
 const p:Palette={ink:brand.textColor||INK,bg:brand.backgroundColor||PAPER,light:brand.surfaceColor||LIGHT,shadow:brand.mutedColor||SHADOW};
 c.save();c.scale(width/W,height/H);background(c,p,370,.95);
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
 if(hasHumanSideCover(scene)&&t<Math.min(.85,scene.durationSec*.3)){renderHumanSideCover(c,width,height,scene,brand);return;}
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
