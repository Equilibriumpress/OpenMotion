import type { OpenMotionScene } from '../types/openmotion';
/** Original reusable, deterministic vector character rig; no image dependencies. */
const W=540,H=960,INK='#49392F',SKIN='#F6DABD',RED='#B94D41',GOLD='#E5B85F';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const u=clamp(x);return u*u*(3-2*u);};
type C=CanvasRenderingContext2D;
function shape(c:C,draw:()=>void,fill?:string,width=3,color=INK){c.beginPath();draw();if(fill){c.fillStyle=fill;c.fill();}if(width){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}}
function oval(c:C,x:number,y:number,rx:number,ry:number,fill:string,w=3){shape(c,()=>c.ellipse(x,y,rx,Math.max(.5,ry),0,0,Math.PI*2),fill,w);}
function line(c:C,points:number[],w=3,color=INK){shape(c,()=>{c.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)c.lineTo(points[i],points[i+1]);},undefined,w,color);}
function box(c:C,x:number,y:number,w:number,h:number,r:number,fill:string,stroke=3){shape(c,()=>c.roundRect(x,y,w,h,r),fill,stroke);}
function text(c:C,s:string,x:number,y:number,z=24,color=INK){c.fillStyle=color;c.font='700 '+z+'px Kalam, "Comic Sans MS", cursive';c.textAlign='center';c.textBaseline='middle';c.fillText(s,x,y,460);}
function paper(c:C,cool:number){
 c.fillStyle='#EFE3D0';c.fillRect(0,0,W,H);c.save();c.globalAlpha=cool;c.fillStyle='#DCE8EB';c.fillRect(0,0,W,H);c.restore();
 // Stable paper fibers, cached through deterministic integer hashing (no flicker).
 c.save();c.globalAlpha=.085;c.fillStyle='#776C59';let n=7931;
 for(let i=0;i<2300;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;const x=n%W;n=(Math.imul(n,1664525)+1013904223)>>>0;const y=n%H;c.fillRect(x,y,1+(n%3),.65);}
 c.restore();
}
export type MindGesture='idle'|'walk'|'point'|'shrug'|'slump'|'wash'|'open';
export type MindMood='happy'|'worried'|'surprised'|'overwhelmed'|'relaxed'|'sleepy'|'annoyed'|'confused'|'focused'|'relieved';
/** Separate limb chains, torso, hair, head, brows, eyelids, pupils and mouth.
 * Feet are grounded at y; animation is sampled from time, not accumulated. */
export function drawMindPerson(c:C,x:number,y:number,s:number,t:number,mood:string,gesture:MindGesture,shirt='#518D89',other=false,speaking=false){
 c.save();c.translate(x,y);c.scale(s,s);
 const walk=gesture==='walk',slump=gesture==='slump',wash=gesture==='wash';
 const stride=walk?Math.sin(t*9):0;
 const bob=walk?-Math.abs(Math.sin(t*9))*5:Math.sin(t*2.1)*.8;
 oval(c,0,4,50,5,'rgba(73,57,47,.09)',0);
 for(const side of [-1,1]){
  const fx=side*20+side*stride*26,fy=walk?-Math.max(0,side*Math.cos(t*9))*15:0;
  shape(c,()=>{c.moveTo(side*24,-73+bob);c.quadraticCurveTo(side*23+side*stride*12,-34,fx,fy);},undefined,4.2);
  line(c,[fx,fy,fx+side*13,fy],4);
 }
 c.translate(0,bob+(slump?13:0));c.rotate(slump?-.075:0);
 // Back arms before the body, with independent hands.
 for(const side of [-1,1]){
  let hx=side*76,hy=-83;
  if(walk){hx=side*67+side*stride*19;hy=-86+side*stride*15;}
  if(gesture==='point'&&side===1){hx=105;hy=-143+3*Math.sin(t*3);}
  if(gesture==='shrug'||gesture==='open'){hx=side*98;hy=-151+3*Math.sin(t*2.7);}
  if(slump){hx=side*63;hy=-48;}
  if(wash){hx=side*44+Math.sin(t*8+side)*12;hy=-108+Math.cos(t*8+side)*6;}
  if(!wash){
   shape(c,()=>{c.moveTo(side*48,-136);c.quadraticCurveTo(side*78,-120,hx,hy);},undefined,4);
   oval(c,hx,hy,7,8,SKIN,2.4);
  }
 }
 shape(c,()=>{c.moveTo(-2,-168);c.bezierCurveTo(-75,-167,-83,-70,-25,-63);c.bezierCurveTo(53,-46,79,-81,65,-131);c.quadraticCurveTo(52,-170,-2,-168);c.closePath();},shirt,3.8);
 c.save();c.clip();for(const yy of [-130,-105])shape(c,()=>{c.moveTo(-75,yy);c.quadraticCurveTo(0,yy+12,75,yy);},undefined,10,other?'#D8C8DF':GOLD);c.restore();
 if(wash){for(const side of [-1,1]){const hx=side*44+Math.sin(t*8+side)*12,hy=-108+Math.cos(t*8+side)*6;shape(c,()=>{c.moveTo(side*46,-136);c.quadraticCurveTo(side*62,-95,hx,hy);},undefined,4);oval(c,hx,hy,7,8,SKIN,2.4);}}
 c.save();c.translate(0,-201);c.rotate(slump?-.07:gesture==='point'?.035:0);
 shape(c,()=>{c.moveTo(-43,-28);c.bezierCurveTo(-62,4,-43,44,-4,45);c.bezierCurveTo(40,47,61,17,48,-18);c.quadraticCurveTo(17,-48,-43,-28);c.closePath();},SKIN,3.8);
 if(other){shape(c,()=>{c.moveTo(-47,-8);c.bezierCurveTo(-64,-56,48,-65,53,-16);c.quadraticCurveTo(30,-29,15,-26);c.quadraticCurveTo(-19,-8,-47,-8);c.closePath();},'#835C43',3.3);}
 else{shape(c,()=>{c.moveTo(-47,-10);c.quadraticCurveTo(-62,-31,-35,-42);c.quadraticCurveTo(-36,-55,-10,-45);c.quadraticCurveTo(8,-61,26,-43);c.quadraticCurveTo(56,-45,51,-11);c.quadraticCurveTo(28,-29,14,-27);c.quadraticCurveTo(-4,-14,-21,-28);c.quadraticCurveTo(-35,-18,-47,-10);c.closePath();},'#47362D',3.3);}
 const sad=['worried','overwhelmed','annoyed','confused','sleepy'].includes(mood),wide=['surprised','overwhelmed'].includes(mood);
 const phase=(t+(.6+(other?1.8:0)))%3.8,blink=phase>3.59?Math.max(.04,Math.abs(phase-3.695)/.105):1;
 for(const side of [-1,1]){
  const ex=side*18;
  shape(c,()=>{c.moveTo(ex-10,-9-(wide?5:0));c.quadraticCurveTo(ex,-14+(sad?side*4:0)-(wide?5:0),ex+10,-9-(wide?5:0));},undefined,2.6);
  if(blink<.22||mood==='sleepy')line(c,[ex-9,6,ex+9,6],2.7);
  else{oval(c,ex,6,10,Math.max(1,(wide?14:11)*blink),'#FFF9F1',2.4);oval(c,ex+(other?-2:1),7,4.2,Math.max(1,5.1*blink),INK,0);}
  oval(c,side*33,22,6,3,'#EAAE97',0);
 }
 const talk=speaking&&Math.sin(t*14)>.15;
 if(wide||talk)oval(c,0,29,talk?6:8,talk?4+Math.abs(Math.sin(t*14))*6:9,'#A55E51',2.5);
 else shape(c,()=>{c.moveTo(-12,29);c.quadraticCurveTo(0,sad?19:mood==='focused'?29:42,12,29);},undefined,2.8);
 c.restore();c.restore();
}
function dish(c:C,x:number,y:number,s=1){c.save();c.translate(x,y);c.scale(s,s);oval(c,0,0,43,9,'#F9F4E9',2.4);shape(c,()=>{c.moveTo(-42,0);c.quadraticCurveTo(-31,19,0,19);c.quadraticCurveTo(33,19,42,0);},'#E8E2D6',2.4);oval(c,0,-1,35,5,'#FCF8F0',1.8);c.restore();}
function kitchen(c:C,clean:boolean,t:number){
 // Hand-drawn cabinet, counter, sink and faucet. Same ground line each shot.
 box(c,315,565,178,180,4,'#C6B397');box(c,302,552,203,21,5,'#E6D6C1');
 box(c,329,587,70,139,3,'#DAC8AC',2);box(c,410,587,70,139,3,'#DAC8AC',2);
 line(c,[390,640,390,656],3);line(c,[419,640,419,656],3);
 oval(c,406,563,65,10,'#8C9E9B',2);
 shape(c,()=>{c.moveTo(420,554);c.lineTo(420,512);c.quadraticCurveTo(417,490,397,497);c.quadraticCurveTo(385,503,387,520);},undefined,7,'#6F7F7C');
 if(!clean){for(let i=0;i<4;i++)dish(c,344,548-i*11,.72);}
 else{for(let i=0;i<3;i++)dish(c,468,549-i*10,.55);for(let i=0;i<7;i++){const p=(t*1.1+i*.137)%1;oval(c,391+Math.sin(i*3+t*2)*22,553-p*62,3+p*3,3+p*3,'#E9F8FA',1.3);}}
}
function bubble(c:C,words:string[],x:number,y:number,w=208,h=86){
 box(c,x-w/2,y-h/2,w,h,22,'#FBF5E9',2.6);
 shape(c,()=>{c.moveTo(x+25,y+h/2-1);c.lineTo(x+37,y+h/2+21);c.lineTo(x+50,y+h/2-1);},'#FBF5E9',2.5);
 words.forEach((v,i)=>text(c,v,x,y+(i-(words.length-1)/2)*27,23));
}
function battery(c:C,x:number,y:number,v:number){box(c,x-85,y-23,170,46,9,'#F8F4E9',3);box(c,x+85,y-9,9,18,3,INK,0);if(v>.001)box(c,x-77,y-15,154*clamp(v),30,4,v>.35?'#6D9A83':RED,0);}
function clock(c:C,x:number,y:number,t:number){c.save();c.translate(x,y);c.rotate(Math.sin(t*22)*.055);oval(c,0,0,40,40,'#F9EAD5',3);line(c,[0,-26,0,0,19,10],3);for(const side of [-1,1]){oval(c,side*27,-36,12,7,GOLD,2.5);line(c,[side*25,33,side*33,44],3);}c.restore();}
function title(c:C,s:OpenMotionScene,t:number){
 const words=s.headline.trim().split(/\s+/),accent=s.doodle?.highlightColor??RED,em=(s.doodle?.emphasis??[]).map(x=>x.toLowerCase().replace(/[^a-z']/g,''));
 const font=35;c.font='700 '+font+'px Kalam, "Comic Sans MS", cursive';c.textAlign='left';c.textBaseline='middle';
 const lines:string[][]=[];let row:string[]=[];let width=0;
 for(const word of words){const w=c.measureText(word+' ').width;if(width+w>432&&row.length){lines.push(row);row=[];width=0;}row.push(word);width+=w;}if(row.length)lines.push(row);
 const timing=s.doodle?.extras?.find(x=>x.startsWith('speech-end:'));const speechEnd=timing?Number(timing.split(':')[1]):s.durationSec-.45;
 const active=Math.floor(clamp((t-.3)/Math.max(.5,speechEnd-.3))*words.length);
 let idx=0;lines.forEach((r,i)=>{const ww=c.measureText(r.join(' ')).width;let x=(W-ww)/2;for(const word of r){c.fillStyle=em.includes(word.toLowerCase().replace(/[^a-z']/g,''))||idx===active?accent:INK;c.globalAlpha=idx<=active?1:.70;c.fillText(word,x,153+i*43);x+=c.measureText(word+' ').width;idx++;}});
 c.globalAlpha=1;
}
export function renderMindSeries(c:C,width:number,height:number,scene:OpenMotionScene,time:number){
 const t=Math.max(0,Math.min(time,scene.durationSec)),d=scene.doodle!,shot=d.extras?.[1]??'hook',shirt=d.shirtColor??'#518D89';
 const cool=shot==='switch'?ease(t/.9):shot==='wash'?1-ease(t/.8):d.palette==='shower'?1:0;
 c.save();c.scale(width/W,height/H);paper(c,cool);
 text(c,'INSIDE THE ADHD MIND  /  01',270,72,16,'#79685B');title(c,scene,t);
 line(c,[43,747,497,747],2,'#9D8F7F');
 const mood=d.mood, speaking=t>.3&&t<scene.durationSec-.5;
 const override=d.pose==='point'?'point':d.pose==='exhausted'?'slump':d.pose==='relieved'?'open':d.pose==='alert'?'shrug':undefined;
 if(shot==='hook'){drawMindPerson(c,270,747,1.56,t,mood,override??'point',shirt,false,speaking);}
 else if(shot==='walk'){kitchen(c,false,t);const u=ease(t/2.5);drawMindPerson(c,83+140*u,747,1.15,t,mood,t<2.5?'walk':'idle',shirt,false,speaking);if(t>2.5)text(c,'✓',244,402,46,'#648D75');}
 else if(shot==='request'){kitchen(c,false,t);drawMindPerson(c,142,747,1.04,t,t<1.1?'happy':mood,'idle',shirt,false,t<1);drawMindPerson(c,258,747,1.0,t,'focused','point','#9D89AE',true,t>1);bubble(c,['You need to','do the dishes.'],279,377,224,91);}
 else if(shot==='switch'){drawMindPerson(c,270,747,1.45,t,mood,override??'slump',shirt,false,speaking);battery(c,270,333,1-ease((t-.55)/1.2));}
 else if(shot==='same'){kitchen(c,false,t);drawMindPerson(c,160,747,1.2,t,mood,t>2.3?'shrug':'idle',shirt,false,speaking);bubble(c,['Same dishes.'],171,389,190,69);}
 else if(shot==='pressure'){drawMindPerson(c,270,747,1.3,t,mood,override??'slump',shirt,false,speaking);clock(c,397,375,t);bubble(c,['Right now!'],171,390,185,69);text(c,'!',410,450,44,RED);}
 else if(shot==='explain'){
  box(c,51,360,211,169,17,'#F7EDDB',2);box(c,278,360,211,169,17,'#F7EDDB',2);text(c,'My choice',157,394,23);text(c,'Pressure',383,394,23);
  battery(c,157,464,.83);battery(c,383,464,.18);drawMindPerson(c,270,747,.75,t,mood,override??'point',shirt,false,speaking);
 }else if(shot==='wash'){kitchen(c,true,t);drawMindPerson(c,310,747,1.12,t,mood,'wash',shirt,false,speaking);text(c,'My choice.',160,415,28,'#648D75');}
 else drawMindPerson(c,270,747,1.3,t,mood,override??'idle',shirt,false,speaking);
 c.restore();
}
