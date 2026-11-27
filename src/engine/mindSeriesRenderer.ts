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
export type MindGesture='idle'|'walk'|'point'|'shrug'|'slump'|'wash'|'open'|'talk'|'listen'|'interrupt'|'recoil';
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
 c.translate(0,bob+(slump?13:0));c.rotate(slump?-.075:gesture==='recoil'?-.07:gesture==='talk'?.018*Math.sin(t*3):0);
 // Back arms before the body, with independent hands.
 for(const side of [-1,1]){
  let hx=side*76,hy=-83;
  if(walk){hx=side*67+side*stride*19;hy=-86+side*stride*15;}
  if(gesture==='point'&&side===1){hx=105;hy=-143+3*Math.sin(t*3);}
  if(gesture==='shrug'||gesture==='open'){hx=side*98;hy=-151+3*Math.sin(t*2.7);}
  if(slump){hx=side*63;hy=-48;}
  if(gesture==='talk'){hx=side*(88+9*Math.sin(t*5+side));hy=-130+22*Math.sin(t*5+side);}
  if(gesture==='listen'){hx=side*65;hy=-82+2*Math.sin(t*1.7);}
  if(gesture==='interrupt'&&side===1){hx=101;hy=-163+4*Math.sin(t*5);}
  if(gesture==='recoil'){hx=side*68;hy=-103;}
  if(wash){hx=side*44+Math.sin(t*8+side)*12;hy=-108+Math.cos(t*8+side)*6;}
  if(!wash){
   shape(c,()=>{c.moveTo(side*48,-136);c.quadraticCurveTo(side*78,-120,hx,hy);},undefined,4);
   oval(c,hx,hy,7,8,SKIN,2.4);
  }
 }
 shape(c,()=>{c.moveTo(-2,-168);c.bezierCurveTo(-75,-167,-83,-70,-25,-63);c.bezierCurveTo(53,-46,79,-81,65,-131);c.quadraticCurveTo(52,-170,-2,-168);c.closePath();},shirt,3.8);
 c.save();c.clip();for(const yy of [-130,-105])shape(c,()=>{c.moveTo(-75,yy);c.quadraticCurveTo(0,yy+12,75,yy);},undefined,10,other?'#D8C8DF':GOLD);c.restore();
 if(wash){for(const side of [-1,1]){const hx=side*44+Math.sin(t*8+side)*12,hy=-108+Math.cos(t*8+side)*6;shape(c,()=>{c.moveTo(side*46,-136);c.quadraticCurveTo(side*62,-95,hx,hy);},undefined,4);oval(c,hx,hy,7,8,SKIN,2.4);}}
 c.save();c.translate(0,-201);c.rotate(slump?-.07:gesture==='point'?.035:gesture==='listen'?.045:gesture==='recoil'?-.055:0);
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
 if(shot==='conversation-v1'){renderConversation(c,width,height,scene,t);return;}
 if(shot==='inside-your-mind'){renderInsideYourMind(c,width,height,scene,t);return;}
 const cool=shot==='switch'?ease(t/.9):shot==='wash'?1-ease(t/.8):d.palette==='shower'?1:0;
 c.save();c.scale(width/W,height/H);paper(c,cool);
 text(c,'INSIDE THE ADHD MIND  /  01',270,72,16,'#79685B');title(c,scene,t);
 line(c,[43,747,497,747],2,'#9D8F7F');
 const speechEnd=Number(d.extras?.find(x=>x.startsWith('speech-end:'))?.split(':')[1]??scene.durationSec-.5);
 const mood=d.mood, speaking=t>.3&&t<speechEnd;
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

/** Inside Your Mind: SVG path geometry, deterministic Canvas playback and export.
 * Each limb is transformed independently. No asynchronous SVG/image loading. */
const IYM_PATHS={
 torso:'M -2 -168 C -75 -167 -83 -70 -25 -63 C 53 -46 79 -81 65 -131 Q 52 -170 -2 -168 Z',
 face:'M -43 -28 C -62 4 -43 44 -4 45 C 40 47 61 17 48 -18 Q 17 -48 -43 -28 Z',
 hair:'M -47 -10 Q -62 -31 -35 -42 Q -36 -55 -10 -45 Q 8 -61 26 -43 Q 56 -45 51 -11 Q 28 -29 14 -27 Q -4 -14 -21 -28 Q -35 -18 -47 -10 Z',
 altHair:'M -47 -8 C -64 -56 48 -65 53 -16 Q 30 -29 15 -26 Q -19 -8 -47 -8 Z'
};
function svgShape(c:C,path:string,fill:string,w=3.5){const p=new Path2D(path);c.fillStyle=fill;c.fill(p);c.strokeStyle=INK;c.lineWidth=w;c.lineJoin='round';c.stroke(p);return p;}
function iymPerson(c:C,x:number,y:number,s:number,t:number,mood:string,gesture:MindGesture,shirt:string,other=false){
 c.save();c.translate(x,y);c.scale(s,s);const tense=['worried','overwhelmed','confused','annoyed'].includes(mood),walk=gesture==='walk',step=walk?Math.sin(t*7):0,bob=gesture==='slump'?11:Math.sin(t*2)*1.5;
 oval(c,0,4,50,5,'rgba(73,57,47,.09)',0);
 for(const side of [-1,1]){const xx=side*20+side*step*21;line(c,[side*21,-73,side*21,-36,xx,0,xx+side*12,0],4);}
 c.translate(0,bob);c.rotate(gesture==='slump'?-.07:0);
 for(const side of [-1,1]){let hx=side*73,hy=-83;if(gesture==='point'&&side===1){hx=102;hy=-155;}if(gesture==='shrug'||gesture==='open'){hx=side*93;hy=-144+3*Math.sin(t*3);}if(gesture==='slump'){hx=side*59;hy=-53;}if(walk)hx+=side*step*16;
 shape(c,()=>{c.moveTo(side*47,-134);c.quadraticCurveTo(side*81,-115,hx,hy);},undefined,4);oval(c,hx,hy,7,8,SKIN,2.4);}
 const body=svgShape(c,IYM_PATHS.torso,shirt);c.save();c.clip(body);for(const yy of [-130,-105])shape(c,()=>{c.moveTo(-76,yy);c.quadraticCurveTo(0,yy+12,76,yy);},undefined,10,other?'#D8C8DF':GOLD);c.restore();
 c.save();c.translate(0,-201);c.rotate(tense?-.06:0);svgShape(c,IYM_PATHS.face,SKIN);svgShape(c,other?IYM_PATHS.altHair:IYM_PATHS.hair,other?'#835C43':'#47362D',3.3);
 const blink=(t+(other?1.9:.7))%3.6>3.42;
 for(const side of [-1,1]){const ex=side*18;shape(c,()=>{c.moveTo(ex-10,-9);c.quadraticCurveTo(ex,-16+(tense?side*4:0),ex+10,-9);},undefined,2.5);
 if(blink)line(c,[ex-8,6,ex+8,6],2.7);else{oval(c,ex,6,10,11,'#FFF9F1',2.4);oval(c,ex+(other?-2:1),7,4.2,5.1,INK,0);}oval(c,side*33,22,6,3,'#EAAE97',0);}
 shape(c,()=>{c.moveTo(-12,29);c.quadraticCurveTo(0,tense?19:42,12,29);},undefined,2.8);
 c.restore();c.restore();
}
function iymCard(c:C,label:string,x:number,y:number,w=184,h=62,accent=false){box(c,x-w/2,y-h/2,w,h,13,accent?'#D4E5DC':'#FBF5E9',2.4);text(c,label,x,y,22,accent?'#426D60':INK);}
function iymDesk(c:C,t:number,open:boolean){box(c,293,586,175,15,4,'#C6B397',2.5);line(c,[310,601,310,747],4);line(c,[451,601,451,747],4);if(open){box(c,326,500,108,76,8,'#DCE8EB',2.5);box(c,316,575,128,9,3,'#A7B7B6',2);}else{box(c,316,571,128,12,4,'#A7B7B6',2.5);}if(open&&t>.6)text(c,'✓',380,537,27,'#648D75');}
function renderInsideYourMind(c:C,width:number,height:number,scene:OpenMotionScene,t:number){
 const d=scene.doodle!,a=d.extras??[],shot=a[2]??'focus',number=a[3]??'01',labels=(a[4]??'').split('|').filter(Boolean),shirt=d.shirtColor??'#518D89';
 const warm=['focus','resolve','pair-calm','desk-open','reframe'].includes(shot);
 c.save();c.scale(width/W,height/H);paper(c,warm?0:.72);text(c,'INSIDE YOUR MIND  /  '+number,252,65,16,'#79685B');title(c,scene,t);
 line(c,[38,747,480,747],2,'#9D8F7F');
 const hero=(x=252,s=1.35,g:MindGesture='idle',m=d.mood)=>iymPerson(c,x,747,s,t,m,g,shirt);
 const card=(label:string,x:number,y:number,w=184,active=false)=>iymCard(c,label,x,y,w,62,active);
 if(shot==='desk'||shot==='desk-open'){const open=shot==='desk-open'&&t>.7;iymDesk(c,t,open);hero(153,1.18,open?'point':'slump');if(labels[0])card(labels[0],266,375,236,open);}
 else if(shot==='pair'||shot==='pair-calm'){hero(145,1.12,shot==='pair'?'shrug':'idle');iymPerson(c,360,747,1.08,t+.4,shot==='pair-calm'?'relaxed':'focused','idle','#9D89AE',true);if(labels[0])bubble(c,[labels[0]],254,365,254,73);}
 else if(shot==='loop'){hero(252,1.22,'slump');const n=Math.max(1,labels.length);labels.forEach((v,i)=>{const a=-Math.PI/2+i*Math.PI*2/n+t*.23;const x=252+Math.cos(a)*125,y=426+Math.sin(a)*67;card(v,x,y,Math.min(186,Math.max(112,v.length*11)));});}
 else if(shot==='choices'||shot==='thoughts'){hero(252,.93,'shrug');labels.slice(0,6).forEach((v,i)=>{const u=ease((t-i*.25)/.45);c.save();c.globalAlpha=u;card(v,148+(i%2)*208,350+Math.floor(i/2)*76,190);c.restore();});}
 else if(shot==='flash'){hero(252,.95,'slump');c.save();c.translate(252,411);c.rotate(-.045+Math.sin(t*3)*.008);box(c,-145,-102,290,204,13,'#FBF5E9',3);iymPerson(c,-62,82,.6,t,'surprised','shrug',shirt);iymPerson(c,64,82,.56,t,'focused','idle','#9D89AE',true);if(labels[0])text(c,labels[0],0,-80,20,RED);c.restore();}
 else if(shot==='focus'||shot==='resolve'||shot==='reframe'){hero(252,1.26,'open');if(labels[0])card(labels[0],252,371,280,true);}
 else {hero(252,1.35,'point');if(labels[0])card(labels[0],252,367,264);}
 c.restore();
}

/** Reusable conversation staging, with the episode 01 character rig. */
function speechSpan(extras:string[],speaker:string,t:number,defaultStart:number,defaultEnd:number){
 const item=extras.find(x=>x.startsWith('speech-'+speaker+':'));
 if(!item)return t>=defaultStart&&t<defaultEnd;
 const [start,end]=item.slice(item.indexOf(':')+1).split(',').map(Number);
 return t>=start&&t<end;
}
function dialogueBubble(c:C,words:string[],x:number,y:number,w:number,h:number,side:-1|1,alpha=1,accent=false){
 c.save();c.globalAlpha=clamp(alpha);
 box(c,x-w/2,y-h/2,w,h,20,accent?'#F4D9C9':'#FBF5E9',2.6);
 shape(c,()=>{c.moveTo(x+side*22,y+h/2-1);c.lineTo(x+side*42,y+h/2+21);c.lineTo(x+side*48,y+h/2-1);},accent?'#F4D9C9':'#FBF5E9',2.5);
 words.forEach((v,i)=>text(c,v,x,y+(i-(words.length-1)/2)*27,23,accent?RED:INK));
 c.restore();
}
function thought(c:C,word:string,x:number,y:number,w:number,alpha:number){
 c.save();c.globalAlpha=clamp(alpha);
 oval(c,x-25,y+40,5,4,'#FBF5E9',1.8);oval(c,x-13,y+29,8,6,'#FBF5E9',1.8);
 box(c,x-w/2,y-25,w,50,21,'#FBF5E9',2.3);text(c,word,x,y,21);
 c.restore();
}
function volumeWaves(c:C,x:number,y:number,t:number,level:number){
 c.save();c.translate(x,y);
 for(let i=0;i<4;i++){
  const alpha=clamp(level*4-i)*(.7+.3*Math.sin(t*5-i*.8));
  if(alpha<=0)continue;
  c.globalAlpha=alpha;const radius=24+i*17;
  shape(c,()=>c.arc(0,0,radius,-.65,.65),undefined,3,i>1?RED:'#648D75');
 }
 c.restore();
}
function renderConversation(c:C,width:number,height:number,scene:OpenMotionScene,t:number){
 const d=scene.doodle!,extra=d.extras??[],shot=extra[2]??'not-arguing',shirt=d.shirtColor??'#518D89';
 const cool=shot==='question'?ease(t/.8):shot==='listening'?1-ease(t/1.1):d.palette==='shower'?1:0;
 c.save();c.scale(width/W,height/H);paper(c,cool);
 if(shot==='perspectives'){
  c.save();c.globalAlpha=.78;c.fillStyle='#EFE3D0';c.fillRect(0,325,270,465);c.restore();
  line(c,[270,338,270,787],1.7,'#B2A392');
 }
 text(c,'INSIDE THE ADHD MIND  /  02',270,72,16,'#79685B');title(c,scene,t);
 line(c,[43,747,497,747],2,'#9D8F7F');
 const end=Number(extra.find(x=>x.startsWith('speech-end:'))?.split(':')[1]??scene.durationSec-.45);
 const heroTalk=speechSpan(extra,'hero',t,.3,shot==='question'?1.65:end);
 const otherTalk=speechSpan(extra,'other',t,shot==='question'?1.8:99,shot==='question'?end:99);
 const pose=d.pose==='point'?'point':d.pose==='exhausted'?'slump':d.pose==='relieved'?'open':d.pose==='alert'?'shrug':undefined;
 const hero=(x:number,s:number,m:string,g:MindGesture,talk=heroTalk)=>drawMindPerson(c,x,747,s,t,m,g,shirt,false,talk);
 const other=(x:number,s:number,m:string,g:MindGesture,talk=otherTalk)=>drawMindPerson(c,x,747,s,t+.17,m,g,'#9D89AE',true,talk);
 if(shot==='not-arguing'){
  hero(270,1.52,d.mood,pose??'shrug');
  c.save();c.globalAlpha=ease((t-.35)/.45);text(c,'?',418,393,58,RED);c.restore();
 }else if(shot==='enthusiasm'){
  hero(155,1.16,d.mood,'talk');other(373,1.06,'happy','listen',false);
  dialogueBubble(c,['And then…'],165,363,204,68,1,ease(t/.45));
 }else if(shot==='fast-thoughts'){
  hero(270,1.16,d.mood,'talk');
  const words=(extra.find(x=>x.startsWith('thoughts:'))?.slice(9)??'Wait!|And then…|One more thing!').split('|');
  const loc=[[141,348,150],[374,366,170],[247,438,216]];
  words.slice(0,3).forEach((w,i)=>{const [x,y,ww]=loc[i];thought(c,w,x,y,ww,ease((t-.3-i*.43)/.28));});
 }else if(shot==='interruption'){
  const interrupt=t>.95;
  hero(151,1.16,interrupt?'surprised':'happy',interrupt?'interrupt':'listen',heroTalk);
  other(371,1.06,interrupt?'surprised':'focused',interrupt?'recoil':'talk',!interrupt&&t>.2&&t<.95);
  dialogueBubble(c,['I think…'],380,375,166,68,-1,1-ease((t-1.0)/.32));
  dialogueBubble(c,['Oh! And…'],155,365,184,68,1,ease((t-.95)/.22),true);
 }else if(shot==='volume'){
  hero(155,1.16,d.mood,'talk');other(397,1.05,t>1.5?'worried':'focused',t>1.5?'recoil':'listen',false);
  const u=ease((t-.4)/2.0);dialogueBubble(c,['And then!'],163,370,176+48*u,68+12*u,1,1,u>.7);
  volumeWaves(c,239,509,t,.2+.8*u);
 }else if(shot==='question'){
  hero(148,1.13,t<1.6?'focused':'surprised','listen',heroTalk);
  other(373,1.08,'worried',otherTalk?'talk':'listen',otherTalk);
  dialogueBubble(c,['Why are','you angry?'],365,370,214,92,-1,ease((t-1.35)/.35),true);
 }else if(shot==='reaction'){
  hero(270,1.5,d.mood,t<.8?'recoil':'shrug',heroTalk);text(c,'?!',414,384,47,RED);
 }else if(shot==='perspectives'){
  const labels=(extra.find(x=>x.startsWith('labels:'))?.slice(7)??'What I feel|What they hear|Enthusiasm|Intensity').split('|');
  text(c,labels[0]??'What I feel',135,366,22);text(c,labels[1]??'What they hear',405,366,22);
  hero(135,1.03,'happy','talk',heroTalk);other(405,1.03,'worried','recoil',false);
  thought(c,labels[2]??'Enthusiasm',135,439,213,ease(t/.55));
  thought(c,labels[3]??'Intensity',405,439,210,ease((t-.45)/.55));
 }else if(shot==='listening'){
  hero(155,1.15,d.mood,'listen',heroTalk);other(373,1.08,'relaxed','listen',false);
  dialogueBubble(c,['Take your time.'],270,366,244,72,1,ease((t-2.5)/.6));
  c.save();c.globalAlpha=ease((t-3.5)/.55);text(c,'✓',270,464,38,'#648D75');c.restore();
 }else hero(270,1.35,d.mood,pose??'idle');
 c.restore();
}
