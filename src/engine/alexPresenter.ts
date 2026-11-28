import type { OpenMotionScene } from '../types/openmotion';

/** Original 2D rig. Every pose is evaluated from scene time, never from playback state. */
type C=CanvasRenderingContext2D;
type Pose={yaw:number;tilt:number;gazeX:number;gazeY:number;brow:number;smile:number;arm:number;gesture:number};
type Key=[number,number,number,number,number,number,number,number,number];
const skin='#E7B18D',shadow='#C88B70',hair='#49352F',ink='#26383A',jacket='#253E43',light='#FFF9EF';
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=(v:number)=>{const a=clamp(v);return a*a*(3-2*a);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
function path(c:C,d:string,f:string,s?:string,w=1){const p=new Path2D(d);if(f!=='none'){c.fillStyle=f;c.fill(p);}if(s){c.strokeStyle=s;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke(p);}}
function oval(c:C,x:number,y:number,rx:number,ry:number,f:string){c.beginPath();c.ellipse(x,y,Math.max(.15,rx),Math.max(.15,ry),0,0,Math.PI*2);c.fillStyle=f;c.fill();}
function line(c:C,x:number,y:number,a:number,b:number,f:string,w=1){c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.strokeStyle=f;c.lineWidth=w;c.lineCap='round';c.stroke();}
const DEFAULT:Key[]=[[0,0,0,0,0,0,.4,0,0],[1,0,0,0,0,0,.4,0,0]];
const cache=new WeakMap<OpenMotionScene,{keys:Key[];energy:string;mouth:string;blink:number[]}>();
function data(s:OpenMotionScene){
 const old=cache.get(s);if(old)return old;
 const get=(k:string)=>s.doodle?.extras?.find(v=>v.startsWith(k+':'))?.slice(k.length+1)??'';
 let keys=DEFAULT;try{const v:unknown=JSON.parse(get('host-keys'));if(Array.isArray(v)&&v.length>=2&&v.every(a=>Array.isArray(a)&&a.length===9&&a.every(Number.isFinite))&&v.every((a,i)=>i===0||a[0]>v[i-1][0]))keys=v as Key[];}catch{/* old projects retain default */}
 const b=get('host-blinks').split(',').filter(Boolean).map(Number).filter(Number.isFinite);
 const result={keys,energy:get('host-energy'),mouth:get('host-mouth'),blink:b};cache.set(s,result);return result;
}
function pose(keys:Key[],u:number):Pose{
 let a=keys[0],b=keys[keys.length-1];for(let i=1;i<keys.length;i++){if(u<=keys[i][0]){a=keys[i-1];b=keys[i];break;}else a=keys[i-1];}
 const v=smooth((u-a[0])/Math.max(.001,b[0]-a[0]));const q=(i:number)=>mix(a[i],b[i],v);
 return {yaw:clamp(q(1),-1,1),tilt:clamp(q(2),-1,1),gazeX:clamp(q(3),-1,1),gazeY:clamp(q(4),-1,1),brow:clamp(q(5),-1,1),smile:clamp(q(6),-1,1),arm:clamp(q(7)),gesture:clamp(q(8))};
}
/** A controlled, deliberately stylized 2.5D face: yaw changes both silhouette and feature placement. */
type HairMotion={sweep:number;lift:number;turn:number};
const STILL_HAIR:HairMotion={sweep:0,lift:0,turn:0};
function face(c:C,p:Pose,blink:number,amp:number,viseme:number,h:HairMotion=STILL_HAIR){
 const yaw=p.yaw,shift=yaw*13,near=1+.20*yaw,far=1-.28*yaw;
 c.save();c.translate(0,-1);c.rotate(p.tilt*.10);
 // Hair roots stay on the skull; only the loose ends and side volumes deform.
 const sw=h.sweep,li=h.lift,turn=h.turn;
 path(c,`M-45 16 Q-64 -4 -59 -49 Q-58 -84 -26 -92 Q7 -109 37 -84 Q59 -66 56 -26 Q${58+sw*.65} 12 ${59+sw} ${42+li} Q${46+sw} ${54+li} ${28+sw*.7} ${45+li*.7} L${-33+sw*.7} ${48-li*.35} Q${-61+sw} ${36-li*.5} -52 17Z`,hair);
 path(c,`M-51 -34 Q-54 -70 -31 -84 Q-9 -98 17 -91 Q-12 -83 -33 -52 Q${-42+sw*.25} -38 -51 -34Z`,'#654B40');
 path(c,`M45 -65 Q59 -37 ${47+sw*.45} 20 L${52+sw*.8} ${40+li} Q${41+sw*.8} ${48+li} ${34+sw*.5} ${40+li*.6} L37 -25Z`,'#3E2D2A');
 oval(c,-39+shift*.2,-10,6*far,10,shadow);oval(c,39+shift*.2,-10,6*near,10,skin);
 const sx=shift;
 path(c,'M'+(-39+sx*.3)+' -43 Q'+(-35+sx)+' -77 '+sx+' -76 Q'+(38+sx*.4)+' -72 '+(42+sx*.25)+' -39 Q'+(43+sx*.15)+' -13 '+(31+sx*.5)+' 7 Q'+(14+sx)+' 32 '+sx+' 31 Q'+(-18+sx)+' 28 '+(-32+sx*.5)+' 5 Q'+(-42+sx*.3)+' -16 '+(-39+sx*.3)+' -43Z',skin);
 path(c,'M'+(26+sx*.5)+' -55 Q'+(42+sx*.25)+' -39 '+(37+sx*.2)+' -12 Q'+(29+sx*.5)+' 16 '+sx+' 31 Q'+(18+sx)+' 10 '+(24+sx)+' -8Z','#D99F80');
 // Front fringe follows the face yaw, with delayed tips rather than a detached hair cap.
 path(c,`M${-41+turn*.22} -27 Q-51 -69 -23 -86 Q4 -103 33 -83 Q52 -69 ${44+turn*.3+sw*.25} ${-34+li*.25} L${35+turn*.48} -47 Q${11+turn*.55} -50 ${-5+turn*.45} -72 Q${-17+turn*.5} -49 ${-38+turn*.38+sw*.22} ${-35-li*.18}Z`,hair);
 path(c,`M-33 -67 Q-18 -86 1 -87 M10 -86 Q29 -81 ${37+turn*.2} -66`,'none','#826052',1.8);
 oval(c,-40+shift*.25,1,3.2,3.2,'#CA9A54');oval(c,40+shift*.25,1,3.2,3.2,'#CA9A54');
 // Asymmetric eye scales, eyelids and a shared gaze target.
 for(const side of [-1,1]){
  const scale=side<0?far:near,x=shift+side*17*scale,y=-27+(side*yaw)*1.5;
  c.save();c.translate(x,y);c.scale(scale,1);
  const raise=p.brow*3;path(c,'M-9 '+(-11-raise)+' Q-1 '+(-15-raise)+' 9 '+(-10-raise+(side<0?p.brow:0)),'none',hair,2.1);
  const open=clamp(1-blink,.06,1);
  c.save();c.scale(1,open);path(c,'M-9 0 Q-1 -6 9 0 Q0 5 -9 0Z','#FFF8EF',hair,.9);
  c.save();c.clip(new Path2D('M-9 0 Q-1 -6 9 0 Q0 5 -9 0Z'));oval(c,p.gazeX*3,p.gazeY*1.6,3.7,4.1,'#58634D');oval(c,p.gazeX*3,p.gazeY*1.6,1.9,2.6,ink);oval(c,p.gazeX*3-1,p.gazeY*1.6-1.6,.85,.85,light);c.restore();
  path(c,'M-9 0 Q-1 -6 9 0','none',hair,1.4);c.restore();c.restore();
 }
 path(c,'M'+(sx+yaw*2)+' -22 L'+(sx-3+yaw*5)+' -8 Q'+(sx+1)+' -5 '+(sx+4)+' -8','none','#AC745C',1.3);
 oval(c,-24+sx,-5,6,2.5,'#D99A82');oval(c,24+sx,-5,6,2.5,'#D99A82');
 mouth(c,sx,9,amp,viseme,p.smile);
 c.restore();
}
function mouth(c:C,x:number,y:number,amp:number,v:number,smile:number){
 c.save();c.translate(x,y);
 const active=amp>.08&&v!==0,wide=[0,1.05,1.12,.70,.52,1.00,.92,.82][v]??1,shape=[0,.85,.42,.76,.58,.28,.52,.33][v]??.5;
 const w=active?8.8*wide:9,h=active?Math.max(.7,amp*8.2*shape):0,corner=smile*2;
 if(!active){path(c,'M-9 '+(-corner)+' Q0 '+(3+corner)+' 9 '+(-corner),'none','#92544C',1.7);c.restore();return;}
 path(c,'M'+(-w)+' '+(-corner)+' Q0 '+(-h-1)+' '+w+' '+(-corner)+' Q0 '+(h*1.75+2)+' '+(-w)+' '+(-corner)+'Z','#985954');
 path(c,'M'+(-w*.8)+' 0 Q0 '+(-h*.72)+' '+w*.8+' 0 Q0 '+(h*1.28)+' '+(-w*.8)+' 0Z','#613B39');
 if(v===2||v===5||v===6||v===7){path(c,'M'+(-w*.73)+' -1 Q0 '+(-h*.68)+' '+w*.73+' -1 L'+w*.64+' '+Math.min(h*.45,2)+' Q0 '+(h*.5)+' '+(-w*.64)+' '+Math.min(h*.45,2)+'Z',light);}
 if(v===1&&amp>.45)oval(c,0,h*.75,w*.38,h*.25,'#C77C73');
 c.restore();
}
// Shoulder/elbow/wrist chain; silhouette hand with fingers, rather than a detached oval.
function arm(c:C,p:Pose,side:number,chain?:{shoulder:number;elbow:number;wrist:number;rootX:number;rootY:number}){
 const raised=side>0?p.arm:0,gesture=p.gesture;
 c.save();c.translate(side*45+(chain?.rootX??0),52+(chain?.rootY??0));
 c.rotate(side*(-.12-(chain?.shoulder??raised)*.82));path(c,'M-12 -7 Q0 -11 12 -5 L13 41 Q0 49 -12 41Z',jacket);
 path(c,'M-8 7 L-5 37','none','#537075',1.5);c.translate(0,39);c.rotate(side*(-.23-(chain?.elbow??raised)*1.36));
 path(c,'M-11 -7 Q0 -11 11 -7 L10 29 Q0 33 -10 29Z',jacket);
 path(c,'M-9 23 L9 23 L9 29 L-9 29Z','#4E686A');c.translate(0,29);c.rotate(side*((chain?.wrist??raised)*.22));
 if(side>0&&gesture>.72){
  path(c,'M-7 0 L-8 12 Q-6 20 1 19 L6 15 L7 3 L7 -8 Q5 -11 3 -8 L1 5 L-2 2 L-5 0Z',skin,shadow,.7);
  path(c,'M-4 9 Q0 6 3 10','none',shadow,.8);
 }else if(side>0&&gesture>.23){
  path(c,'M-7 0 L-9 11 L-15 17 Q-16 20 -13 21 L-6 15 L-5 24 Q-4 27 -2 24 L0 16 L2 27 Q4 29 5 25 L6 16 L9 23 Q11 25 12 22 L10 10 Q8 2 6 0Z',skin,shadow,.65);
  path(c,'M-5 13 Q0 8 6 11','none',shadow,.8);
 }else{
  path(c,'M-7 0 L-8 11 Q-8 19 -2 20 L5 19 Q9 16 8 8 L6 0Z',skin,shadow,.75);
  path(c,'M-4 9 L-3 15 M0 9 L1 16 M4 8 L5 14','none',shadow,.7);
 }
 c.restore();
}
export function renderAlexPresenter(c:C,scene:OpenMotionScene,t:number){
 const d=data(scene),u=clamp(t/Math.max(.001,scene.durationSec)),p=pose(d.keys,u);
 const sample=Math.max(0,Math.min(d.energy.length-1,t*30)),i=Math.floor(sample),j=Math.min(i+1,d.energy.length-1);
 const a=d.energy.length?mix(Number(d.energy[i])||0,Number(d.energy[j])||0,sample-i)/9:0;
 const v=d.mouth.length?Number(d.mouth[Math.min(i,d.mouth.length-1)])||0:0;
 let blink=0;for(const b of d.blink)blink=Math.max(blink,1-clamp(Math.abs(t-b)/.10));
 if(scene.doodle?.extras?.includes('alex-26')){renderBody26(c,scene,t,p,d.keys,blink,a,v);return;}
 c.save();c.translate(82,699);c.scale(.88,.88);c.translate(0,Math.sin(t*2)*.7);
 // The lower-left silhouette and head remain in a fixed safe region.
 path(c,'M-66 105 Q-65 61 -37 43 L-18 29 H18 L37 43 Q65 62 66 105 V124 H-66Z',jacket);
 path(c,'M-64 92 Q-56 58 -36 43 L-20 37 L-19 124 H-66Z','#304D52');
 path(c,'M38 43 Q65 62 66 105 V124 H49 L47 75Z','#1D3438');
 path(c,'M-24 34 L0 58 24 34 15 124 H-15Z',light);
 path(c,'M-36 43 L-20 74 -31 87 -25 124 M36 43 L20 74 31 87 25 124','none','#678083',1.4);
 path(c,'M-13 18 Q-12 28 -19 38 Q0 51 19 38 Q12 28 13 18Z',shadow);
 path(c,'M-10 21 L10 21 L12 33 Q0 43 -12 33Z',skin);
 arm(c,p,-1);arm(c,p,1);
 face(c,p,blink,a,v);
 c.restore();
}

/** AX-26: deterministic secondary motion sampled from the authored pose curve.
 * No frame history: scrubbing and publication rendering evaluate the same geometry.
 */
function renderBody26(c:C,scene:OpenMotionScene,t:number,p:Pose,keys:Key[],blink:number,a:number,v:number){
 const duration=Math.max(.001,scene.durationSec);
 const at=(lag:number)=>pose(keys,clamp((t-lag)/duration));
 const b=at(.08),neck=at(.035),late=at(.14),earlier=at(.24);
 const shot=scene.doodle?.extras?.find(x=>x.startsWith('shot:'))?.slice(5);
 const calm=shot==='limits'?.65:shot==='cover'?.55:1;
 // Fade idle oscillation at cuts; authored keyframes still control the pose.
 const edge=smooth(t/.35)*smooth((duration-t)/.35);
 const breath=Math.sin(t*Math.PI*2/4.1)*edge*calm;
 const sway=Math.sin(t*Math.PI*2/6.2)*edge*calm;
 const bodyYaw=b.yaw*.30,bodyTilt=b.tilt*.30-b.arm*.12;
 const shoulderLift=b.arm*3.4,headX=p.yaw*5.2,headY=-breath*1.1-neck.arm*.8;
 const hairMotion:HairMotion={
  sweep:clamp((late.yaw-p.yaw)*24+(earlier.yaw-late.yaw)*8+(late.tilt-p.tilt)*11+sway*.8,-6,6),
  lift:clamp((late.tilt-p.tilt)*12+(late.arm-p.arm)*5+breath*.8,-3.5,3.5),
  turn:late.yaw*9
 };
 c.save();c.translate(82,699);c.scale(.88,.88);
 // Pivot at the waist, leaving the bottom anchor stable while shoulders follow head and arm.
 c.translate(0,124);c.rotate(bodyTilt*.10+sway*.012);c.transform(1-bodyYaw*.07,0,bodyYaw*.07,1+breath*.018,0,0);c.translate(0,-124);
 const lift=shoulderLift+breath*1.2,shift=bodyYaw*5;
 // Continuous jacket silhouette includes both moving shoulder sockets.
 path(c,`M-66 105 Q-65 ${61-breath} ${-37+shift} ${43+lift*.28} L${-18+shift} ${29-breath} H${18+shift} L${37+shift} ${43-lift} Q65 ${62-lift} 66 105 V124 H-66Z`,jacket);
 path(c,`M-64 92 Q-56 ${58+lift*.25} ${-36+shift} ${43+lift*.28} L${-20+shift} ${37-breath} L-19 124 H-66Z`,'#304D52');
 path(c,`M${38+shift} ${43-lift} Q65 ${62-lift} 66 105 V124 H49 L47 75Z`,'#1D3438');
 const shirt=bodyYaw*4,fold=breath*1.5+late.arm*1.5;
 path(c,`M${-24+shirt} ${34-breath} L${shirt} ${58+fold} ${24+shirt} ${34-breath-lift*.45} L${15+shirt*.4} 124 H-15Z`,light);
 path(c,`M${-36+shift} ${43+lift*.28} L${-20+shirt} ${74+fold} -31 ${87+fold*.5} -25 124 M${36+shift} ${43-lift} L${20+shirt} ${74-lift*.4+fold} 31 ${87+fold} 25 124`,'none','#678083',1.4);
 path(c,`M-52 ${83+fold} Q-44 ${88+fold} -38 99 M53 ${77-lift*.55} Q46 ${85+fold} 43 97`,'none','#466269',1.05);
 // Arm roots follow the jacket; elbow and wrist follow with 70/140 ms offsets.
 for(const side of [-1,1]){
  const support=side<0?b.arm*.12:1;
  const shoulder=side>0?b.arm:support,elbow=side>0?late.arm:support*.6,wrist=side>0?earlier.arm:0;
  arm(c,p,side,{shoulder,elbow,wrist,rootX:shift*.65,rootY:side>0?-lift:lift*.28});
 }
 // Neck connects moving shoulders to the actual translated head; no gap at the collar.
 path(c,`M${headX-13} ${18+headY} Q${headX-12} ${28+headY} ${shirt-19} ${38-breath} Q${shirt} ${51+fold*.3} ${shirt+19} ${38-breath} Q${headX+12} ${28+headY} ${headX+13} ${18+headY}Z`,shadow);
 path(c,`M${headX-10} ${21+headY} L${headX+10} ${21+headY} L${shirt+12} ${33-breath} Q${shirt} 43 ${shirt-12} ${33-breath}Z`,skin);
 c.save();c.translate(headX,headY);c.rotate(-bodyTilt*.045);face(c,p,blink,a,v,hairMotion);c.restore();
 c.restore();
}
