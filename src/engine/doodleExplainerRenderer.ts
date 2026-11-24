import type { OpenMotionScene, OpenMotionBrandKit } from '../types/openmotion';

/**
 * Reusable, fully procedural doodle explainer.
 * Every object is drawn from editable scene JSON, not from video frames.
 * All motion derives from local frame time for reproducible MP4 output.
 */
const W=512, H=910;
const INK='#29282C', RED='#D65C55', GREEN='#829D58';
const COLORS:Record<string,string>={
  night:'#CBC6E0', cream:'#F1E9DE', shower:'#DDEBF2',
  morning:'#F5E3C4', quiet:'#CBC6E0', gray:'#E8E5E8'
};
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
function outline(ctx:CanvasRenderingContext2D,width=3){ctx.lineWidth=width;ctx.strokeStyle=INK;ctx.lineCap='round';ctx.lineJoin='round';}
function ellipse(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string,line=2.7){
  ctx.beginPath();ctx.ellipse(x,y,Math.max(.2,rx),Math.max(.2,ry),0,0,Math.PI*2);
  ctx.fillStyle=fill;ctx.fill();if(line){outline(ctx,line);ctx.stroke();}
}
function pill(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,w:number=105){
  ctx.fillStyle='#242328';ctx.beginPath();ctx.roundRect(x,y,w,43,8);ctx.fill();
  ctx.fillStyle='#F5F0E8';ctx.font='700 20px Kalam, "Comic Sans MS", sans-serif';
  ctx.textAlign='center';ctx.fillText(text,x+w/2,y+29,w-12);
}
function line(ctx:CanvasRenderingContext2D,coords:number[],color=INK,width=3){
  ctx.beginPath();ctx.moveTo(coords[0],coords[1]);
  for(let i=2;i<coords.length;i+=2)ctx.lineTo(coords[i],coords[i+1]);
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
}
function cloud(ctx:CanvasRenderingContext2D,x:number,y:number,scale=1){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  ctx.fillStyle='rgba(255,255,255,.62)';
  ctx.beginPath();ctx.ellipse(0,0,44,13,0,0,Math.PI*2);ctx.ellipse(-24,1,25,13,0,0,Math.PI*2);
  ctx.ellipse(22,-6,28,18,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
function star(ctx:CanvasRenderingContext2D,x:number,y:number,r=8,color='#E7B449'){
  ctx.beginPath();
  for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2;const d=i%2?r*.46:r;const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;
    if(!i)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
  ctx.closePath();ctx.fillStyle=color;ctx.fill();outline(ctx,1.5);ctx.stroke();
}
function moon(ctx:CanvasRenderingContext2D,x:number,y:number){
  ctx.save();ctx.translate(x,y);ctx.rotate(-.22);
  ctx.fillStyle='#F8DA70';ctx.strokeStyle=INK;ctx.lineWidth=2.4;
  ctx.beginPath();ctx.arc(0,0,19,.46,Math.PI*1.65,false);
  ctx.quadraticCurveTo(-4,13,16,17);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
function sun(ctx:CanvasRenderingContext2D,x:number,y:number){
  ellipse(ctx,x,y,24,24,'#F6CA65',2);
  for(let i=0;i<9;i++){const a=(i/9)*Math.PI*2;
    line(ctx,[x+Math.cos(a)*30,y+Math.sin(a)*30,x+Math.cos(a)*43,y+Math.sin(a)*43],'#E0A73D',2.4);}
}
function background(ctx:CanvasRenderingContext2D,theme:string,t:number,seed:number){
  ctx.fillStyle=COLORS[theme]??COLORS.cream;ctx.fillRect(0,0,W,H);
  // Constant, seeded paper grain across all video frames.
  for(let i=0;i<92;i++){
    const x=14+((i*127+seed*31)%482),y=25+((i*83+seed*17)%845);
    ctx.fillStyle=i%5===0?'rgba(68,62,73,.13)':'rgba(76,65,68,.065)';
    ctx.fillRect(x,y,i%7===0?2:1,i%9===0?2:1);
  }
  if(theme==='night'||theme==='quiet'){
    moon(ctx,462,89);
    for(const [x,y] of [[50,100],[143,219],[367,177],[427,265],[97,317]]){
      star(ctx,x,y,3,'#F6F2ED');
    }
    cloud(ctx,98+Math.sin(t*.15)*6,210,1.1);
  }else if(theme==='morning'){
    sun(ctx,457,228);
  }else if(theme==='cream'||theme==='gray'){
    cloud(ctx,115+Math.sin(t*.14)*4,178,1.0);
    cloud(ctx,421-Math.sin(t*.18)*5,237,.76);
  }
  ctx.fillStyle=theme==='night'||theme==='quiet'?'rgba(114,119,160,.13)':'rgba(174,150,132,.10)';
  ctx.beginPath();ctx.moveTo(0,756);ctx.quadraticCurveTo(220,719,512,751);ctx.lineTo(512,910);ctx.lineTo(0,910);ctx.fill();
  line(ctx,[0,751,127,748,286,750,512,749],INK,1.3);
}
function head(ctx:CanvasRenderingContext2D,x:number,y:number,mood:string,t:number,k=1){
  ctx.save();ctx.translate(x,y);ctx.scale(k,k);
  ellipse(ctx,0,0,53,57,'#F7E6C8',3);
  ctx.fillStyle=INK;ctx.beginPath();ctx.moveTo(-54,-15);ctx.lineTo(-51,-55);
  ctx.quadraticCurveTo(-26,-77,49,-58);ctx.lineTo(52,-15);
  ctx.lineTo(35,-22);ctx.lineTo(29,-40);ctx.lineTo(-18,-41);ctx.lineTo(-31,-16);ctx.closePath();ctx.fill();
  if(mood==='sleepy'||mood==='relaxed'){
    ctx.beginPath();ctx.arc(-20,2,11,.19,Math.PI-.19);ctx.moveTo(10,2);ctx.arc(20,2,11,.19,Math.PI-.19);
    outline(ctx,2.2);ctx.stroke();
    ctx.beginPath();ctx.arc(0,24,9,.13,Math.PI-.13);ctx.stroke();
  }else{
    const surprised=mood==='surprised'||mood==='overwhelmed';
    ellipse(ctx,-19,3,surprised?14:12,surprised?15:13,'#FFFFFF',2);
    ellipse(ctx,21,3,surprised?14:12,surprised?15:13,'#FFFFFF',2);
    ellipse(ctx,-17+Math.sin(t*.5)*2,4,4.8,5,INK,0);
    ellipse(ctx,22+Math.sin(t*.5)*2,4,4.8,5,INK,0);
    if(surprised){ellipse(ctx,0,32,8.5,12,'#B66761',2);}
    else if(mood==='worried'){
      ctx.beginPath();ctx.arc(0,39,12,Math.PI*1.15,Math.PI*1.82);outline(ctx,2.5);ctx.stroke();
      line(ctx,[-32,-23,-17,-30],INK,2);line(ctx,[12,-27,29,-21],INK,2);
    }else{
      ctx.beginPath();ctx.arc(0,23,14,0,Math.PI);outline(ctx,2.3);ctx.stroke();
    }
  }
  ctx.restore();
}
function person(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,mood:string,t:number,raised:boolean,shirt=GREEN){
  ctx.save();ctx.translate(x,y+Math.sin(t*2.5)*2);ctx.scale(size,size);
  const wave=Math.sin(t*4)*7;
  // Legs beneath shirt.
  line(ctx,[-29,66,-29+Math.sin(t*2.4)*4,141],INK,4);
  line(ctx,[28,66,29-Math.sin(t*2.4)*4,141],INK,4);
  ellipse(ctx,-29,141,9,5,INK,0);ellipse(ctx,29,141,9,5,INK,0);
  // Arms.
  const lift=raised?-78:29;
  line(ctx,[-52,-3,-93,lift+wave],INK,4);
  line(ctx,[52,-3,93,lift-wave],INK,4);
  ellipse(ctx,-93,lift+wave,7,7,'#F7E6C8',2);
  ellipse(ctx,93,lift-wave,7,7,'#F7E6C8',2);
  ellipse(ctx,0,10,65,88,shirt,3.2);
  ctx.fillStyle='#77954E';ctx.beginPath();ctx.roundRect(-31,29,61,34,7);ctx.fill();outline(ctx,2.4);ctx.stroke();
  line(ctx,[-25,34,24,34],INK,2.1);
  head(ctx,0,-105,mood,t,1);
  ctx.restore();
}
function brain(ctx:CanvasRenderingContext2D,x:number,y:number,k:number,t:number,smile=true){
  ctx.save();ctx.translate(x,y+Math.sin(t*3)*4);ctx.scale(k,k);
  line(ctx,[-24,68,-24,106],INK,3);line(ctx,[21,68,21,106],INK,3);
  line(ctx,[-63,14,-90,-8],INK,3);line(ctx,[62,14,89,-3],INK,3);
  ctx.fillStyle='#F4A0A2';outline(ctx,3);
  ctx.beginPath();ctx.moveTo(-42,-36);
  ctx.bezierCurveTo(-66,-59,-79,-15,-68,4);ctx.bezierCurveTo(-86,42,-54,73,-24,67);
  ctx.bezierCurveTo(1,88,33,74,48,61);ctx.bezierCurveTo(79,48,72,17,65,5);
  ctx.bezierCurveTo(72,-17,49,-48,29,-45);ctx.bezierCurveTo(9,-76,-21,-65,-42,-36);
  ctx.closePath();ctx.fill();ctx.stroke();
  line(ctx,[-14,-41,-5,-16,-19,5,1,22],INK,1.7);
  line(ctx,[28,-32,16,-15,29,4,17,27],INK,1.7);
  ellipse(ctx,-21,20,9,11,'#FFFFFF',2);ellipse(ctx,25,19,9,11,'#FFFFFF',2);
  ellipse(ctx,-18,20,3.4,4.4,INK,0);ellipse(ctx,27,18,3.4,4.4,INK,0);
  ctx.beginPath();ctx.arc(4,43,smile?13:8,smile?0:Math.PI*1.15,smile?Math.PI:Math.PI*1.85);outline(ctx,2.5);ctx.stroke();
  ctx.restore();
}
function alarm(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,angle=0){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(s,s);
  ellipse(ctx,0,0,30,30,'#F9F8F3',2.4);
  line(ctx,[0,0,-1,-16],INK,3);line(ctx,[0,0,13,8],INK,3);
  ellipse(ctx,0,0,3,3,'#D65C55',0);
  ctx.fillStyle='#D56158';ctx.beginPath();ctx.arc(-23,-27,10,Math.PI,0);ctx.arc(23,-27,10,Math.PI,0);ctx.fill();
  line(ctx,[-23,27,-28,36],INK,2);line(ctx,[23,27,28,36],INK,2);
  ctx.restore();
}
function bell(ctx:CanvasRenderingContext2D,x:number,y:number,s=1){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  ctx.beginPath();ctx.moveTo(-23,24);ctx.quadraticCurveTo(-16,4,-15,-16);
  ctx.quadraticCurveTo(0,-38,16,-16);ctx.quadraticCurveTo(17,8,23,24);
  ctx.closePath();ctx.fillStyle='#EABD55';ctx.fill();outline(ctx,2.5);ctx.stroke();
  ellipse(ctx,0,28,5,5,INK,0);
  ctx.restore();
}
function clipboard(ctx:CanvasRenderingContext2D,x:number,y:number,s=1,count=3){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  ctx.fillStyle='#FDFBF6';ctx.beginPath();ctx.roundRect(-36,-50,75,106,7);ctx.fill();outline(ctx,2.8);ctx.stroke();
  ctx.fillStyle='#8F9397';ctx.beginPath();ctx.roundRect(-17,-57,35,13,3);ctx.fill();outline(ctx,1.7);ctx.stroke();
  for(let i=0;i<count;i++){ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.strokeRect(-23,-27+i*25,12,12);line(ctx,[-2,-20+i*25,27,-20+i*25],INK,2);}
  ctx.restore();
}
function notes(ctx:CanvasRenderingContext2D,x:number,y:number,t:number){
  ctx.save();ctx.translate(x,y+Math.sin(t*3)*5);ctx.strokeStyle='#384E57';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(9,-25);ctx.lineTo(9,10);ctx.lineTo(29,5);ctx.lineTo(29,-31);ctx.lineTo(9,-25);ctx.stroke();
  ellipse(ctx,5,13,9,5,'#4C6B71',0);ellipse(ctx,25,9,9,5,'#4C6B71',0);ctx.restore();
}
function lightbulb(ctx:CanvasRenderingContext2D,x:number,y:number,t:number){
  ctx.save();ctx.translate(x,y+Math.sin(t*3)*2);
  ellipse(ctx,0,0,26,31,'#F7D34D',2.8);
  ctx.fillStyle='#E4E9F0';ctx.fillRect(-15,25,30,17);outline(ctx,2);ctx.strokeRect(-15,25,30,17);
  for(const a of [-1.5,-.8,0,.8,1.5])line(ctx,[Math.sin(a)*39,Math.cos(a)*38,Math.sin(a)*53,Math.cos(a)*54],INK,2.2);
  ctx.restore();
}
function shower(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,t:number,shirt:string){
  // Drawn in the same flat blue stand-up cubicle proportions as the reference.
  line(ctx,[319,304,344,265,500,264],INK,3.5);
  ctx.fillStyle='#ADB7C2';ctx.beginPath();ctx.moveTo(317,305);ctx.lineTo(356,305);ctx.lineTo(349,285);ctx.lineTo(326,285);ctx.closePath();ctx.fill();outline(ctx,2.3);ctx.stroke();
  for(let i=0;i<5;i++){const x=326+i*7,dy=(t*41+i*25)%110;
    ctx.fillStyle='rgba(70,112,146,.58)';ctx.beginPath();ctx.ellipse(x,325+dy,2,6,.22,0,Math.PI*2);ctx.fill();}
  const mood=scene.doodle?.mood??'relaxed';
  person(ctx,258,610,.68,mood,t,mood==='surprised',shirt);
  ctx.fillStyle='#C5DCE8';ctx.beginPath();ctx.roundRect(111,490,290,420,13);ctx.fill();outline(ctx,3.5);ctx.stroke();
  line(ctx,[132,520,166,520], '#FFFFFF',3);line(ctx,[132,534,152,534],'#FFFFFF',2);
  pill(ctx,scene.doodle?.clockText??'5 min',45,390,111);
  if(scene.doodle?.extras?.includes('music'))notes(ctx,414,382,t);
  if(scene.doodle?.extras?.includes('thought')){
    ellipse(ctx,385,371,74,35,'#FAF9F6',2.5);
    ctx.fillStyle=INK;ctx.textAlign='center';ctx.font='700 16px Kalam, sans-serif';
    ctx.fillText('Wat als...?',385,380,124);
  }
}
function bed(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,t:number,shirt:string){
  const morning=scene.doodle?.palette==='morning';
  ctx.fillStyle='#AB7850';ctx.beginPath();ctx.roundRect(67,334,376,291,16);ctx.fill();outline(ctx,3.2);ctx.stroke();
  ctx.fillStyle='#FCFAF6';ctx.beginPath();ctx.ellipse(256,534,178,77,0,0,Math.PI*2);ctx.fill();outline(ctx,3);ctx.stroke();
  head(ctx,255,546,scene.doodle?.mood??'sleepy',t,.8);
  ellipse(ctx,256,638,60,74,shirt,2.2);
  if(scene.doodle?.extras?.includes('phone')){
    ctx.fillStyle='#F5D67F';ctx.beginPath();ctx.roundRect(239,576+Math.sin(t*4)*3,39,85,8);ctx.fill();outline(ctx,2.5);ctx.stroke();
  }
  ctx.fillStyle='#6E9EC4';ctx.beginPath();ctx.moveTo(0,605);ctx.quadraticCurveTo(170,586,281,611);ctx.quadraticCurveTo(390,600,512,615);
  ctx.lineTo(512,910);ctx.lineTo(0,910);ctx.closePath();ctx.fill();
  line(ctx,[0,612,164,609,334,620,512,616],'#E3EDF2',3);
  if(scene.doodle?.clockText)pill(ctx,scene.doodle.clockText,70,366,101);
  if(scene.doodle?.extras?.includes('alarms'))for(const [x,y,angle] of [[64,383,-.18],[450,416,.11],[81,596,.04]] as const)alarm(ctx,x,y,.58,angle+Math.sin(t*3+x)*.08);
  if(scene.doodle?.extras?.includes('tasks')){
    const labels=['MAIL','PLANNEN','DOEN'];
    labels.forEach((v,i)=>{
      ctx.save();ctx.translate(105+i*127,697+Math.sin(t*2+i)*7);ctx.rotate((i-1)*.12);
      ctx.fillStyle=['#B6D3AD','#F2D47A','#E5A8A3'][i];ctx.fillRect(-26,-24,62,51);
      ctx.font='700 13px Kalam,sans-serif';ctx.textAlign='center';ctx.fillStyle=INK;ctx.fillText(v,5,6,55);ctx.restore();
    });
  }
}
function standing(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,t:number,shirt:string){
  const palette=scene.doodle?.palette;
  const mood=scene.doodle?.mood??'worried';
  const raised=scene.doodle?.extras?.includes('free')||scene.doodle?.extras?.includes('excited');
  person(ctx,252,560,.86,mood,t,raised,shirt);
  if(scene.doodle?.extras?.includes('bell'))bell(ctx,85,552,.85);
  if(scene.doodle?.extras?.includes('tasks'))clipboard(ctx,420,555,.8,3);
  if(scene.doodle?.extras?.includes('alarm')){
    ellipse(ctx,340,429,45,34,'#FFF9F4',2.2);
    ctx.fillStyle=RED;ctx.font='700 28px Kalam,sans-serif';ctx.textAlign='center';ctx.fillText('!!!',340,439);
  }
  if(scene.doodle?.extras?.includes('free')){
    brain(ctx,108,430,.43,t);
    for(const [x,y] of [[71,320],[413,378],[389,614],[93,609]])star(ctx,x,y,8);
    notes(ctx,416,500,t);
    ellipse(ctx,390,341,8,8,'#E9A3A3',1.5);
  }
  if(scene.doodle?.extras?.includes('clock'))alarm(ctx,409,565,1.0,Math.sin(t*.7)*.1);
  if(scene.doodle?.extras?.includes('start')){
    line(ctx,[404,551,404,746],INK,2.5);
    ctx.fillStyle='#D85B51';ctx.beginPath();ctx.roundRect(345,543,105,57,4);ctx.fill();outline(ctx,2);ctx.stroke();
    ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.font='700 22px Kalam,sans-serif';ctx.fillText('START',397,580);
  }
  if(scene.doodle?.extras?.includes('essentials')){
    for(const [x,char] of [[89,'☕'],[421,'♧']] as const){
      ellipse(ctx,x,584,35,35,'#FFFDF9',2.5);
      ctx.fillStyle=INK;ctx.textAlign='center';ctx.font='700 30px sans-serif';ctx.fillText(char,x,595);
    }
  }
  if(palette==='night' || palette==='quiet')cloud(ctx,222,205,.7);
}
function brainStage(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,t:number){
  brain(ctx,244,595,1.1,t,scene.doodle?.mood!=='worried');
  if(scene.doodle?.extras?.includes('search')){
    ellipse(ctx,406,494,44,44,'rgba(203,224,232,.55)',2.8);
    line(ctx,[435,527,469,559],INK,6);
    ['?','?','?'].forEach((symbol,i)=>{
      ctx.fillStyle=['#B4A56B','#D77C76','#739DA5'][i];ctx.font='700 33px Kalam,sans-serif';
      ctx.fillText(symbol,94+i*133,356+Math.sin(t*2+i)*11);
    });
  }
  if(scene.doodle?.extras?.includes('lightbulb'))lightbulb(ctx,256,332,t);
}
function checklist(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,t:number){
  brain(ctx,64,632,.63,t);
  const x=174,y=328;
  ctx.fillStyle='#FDFCF9';ctx.beginPath();ctx.roundRect(x,y,278,382,4);ctx.fill();outline(ctx,3);ctx.stroke();
  ctx.fillStyle=RED;ctx.font='700 32px Kalam,sans-serif';ctx.textAlign='center';ctx.fillText('ADHD',x+139,y+56);
  line(ctx,[x+77,y+68,x+201,y+68],INK,2);
  const entries=scene.doodle?.extras?.length?scene.doodle.extras:['aandacht','executieve functies','tijdsbeleving'];
  entries.slice(0,3).forEach((label,i)=>{
    const yy=y+124+i*78;
    ellipse(ctx,x+38,yy-5,8,8,i===1?'#75AD82':'#F6F3F0',2);
    if(i===1){line(ctx,[x+33,yy-7,x+37,yy-2,x+45,yy-12],'#4D916C',2);}
    ctx.fillStyle=INK;ctx.font='700 22px Kalam,sans-serif';ctx.textAlign='left';
    ctx.fillText(label,x+62,yy+4,195);
  });
  line(ctx,[115,545,172,478],INK,3);
}
function clockStage(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,t:number,shirt:string){
  person(ctx,153,582,.65,scene.doodle?.mood??'worried',t,false,shirt);
  ellipse(ctx,373,547,92,102,'#FCFCFA',3);
  ctx.fillStyle='#D6D6DF';ctx.beginPath();ctx.ellipse(369,459,106,35,0,0,Math.PI*2);ctx.fill();outline(ctx,2.5);ctx.stroke();
  line(ctx,[373,545,369,497],INK,3);
  line(ctx,[373,545,403,560],RED,4);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;line(ctx,[373+Math.sin(a)*70,545+Math.cos(a)*79,373+Math.sin(a)*79,545+Math.cos(a)*89],INK,1.5);}
  if(scene.doodle?.extras?.includes('label')){
    ctx.fillStyle=RED;ctx.beginPath();ctx.roundRect(296,711,164,40,18);ctx.fill();
    ctx.textAlign='center';ctx.fillStyle='#FFF7F3';ctx.font='700 21px Kalam,sans-serif';
    ctx.fillText('tijdsblindheid',378,741,146);
  }
}
function outro(ctx:CanvasRenderingContext2D,t:number,shirt:string){
  person(ctx,253,535,.67,'happy',t,true,shirt);
  brain(ctx,365,422,.50,t);
  ctx.textAlign='center';ctx.fillStyle=INK;ctx.font='700 33px Kalam,sans-serif';ctx.fillText('SLAAP & ADHD',256,335);
  ctx.font='700 23px Kalam,sans-serif';ctx.fillText('Een herkenbare uitleg',256,369);
}
function headline(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,t:number,accent:string){
  const text=scene.headline.trim();
  if(!text)return;
  ctx.save();ctx.textBaseline='middle';ctx.textAlign='left';
  const fontSize=text.length>100?23:text.length>58?25:28;
  ctx.font='700 italic '+fontSize+'px Kalam, "Comic Sans MS", cursive';
  const tokens=text.split(/\s+/);
  const lines:string[][]=[];let current:string[]=[];
  for(const word of tokens){
    const trial=current.concat(word).join(' ');
    if(current.length && ctx.measureText(trial).width>426){lines.push(current);current=[word];}
    else current.push(word);
  }
  if(current.length)lines.push(current);
  const emphasis=(scene.doodle?.emphasis??[]).map(v=>v.toLowerCase());
  const yStart=105-(lines.length-1)*14;
  let wordIndex=0;
  const visible=Math.max(0,Math.floor((t+.12)*11));
  lines.forEach((parts,row)=>{
    const whole=parts.join(' ');
    let x=W/2-ctx.measureText(whole).width/2;
    for(const word of parts){
      const advance=ctx.measureText(word).width+ctx.measureText(' ').width;
      if(wordIndex<visible){
        const normalized=word.toLowerCase().replace(/[,.!?]/g,'');
        ctx.fillStyle=emphasis.some(v=>normalized.includes(v.replace(/[,.!?]/g,'')))?accent:INK;
        ctx.fillText(word,x,yStart+row*34);
      }
      x+=advance;wordIndex++;
    }
  });
  ctx.restore();
}
export function renderDoodleExplainerScene(
 ctx:CanvasRenderingContext2D,
 width:number,
 height:number,
 scene:OpenMotionScene,
 localTime:number,
 brand:OpenMotionBrandKit
):void{
  const d=scene.doodle;
  if(!d)return;
  const t=Math.max(0,Math.min(scene.durationSec,localTime));
  const palette=d.palette??'cream';
  ctx.save();ctx.scale(width/W,height/H);
  const hash=scene.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  background(ctx,palette,t,hash);
  const shirt=d.shirtColor??brand.primaryColor??GREEN;
  if(d.setting==='bed')bed(ctx,scene,t,shirt);
  else if(d.setting==='shower')shower(ctx,scene,t,shirt);
  else if(d.setting==='brain')brainStage(ctx,scene,t);
  else if(d.setting==='checklist')checklist(ctx,scene,t);
  else if(d.setting==='clock')clockStage(ctx,scene,t,shirt);
  else if(d.setting==='outro')outro(ctx,t,shirt);
  else standing(ctx,scene,t,shirt);
  headline(ctx,scene,t,d.highlightColor??brand.accentColor??RED);
  // Short dissolve within scenes rather than a heavy black frame transition.
  const fade=Math.max(1-ease(t/.24),1-ease((scene.durationSec-t)/.2));
  if(fade>.001){ctx.fillStyle=COLORS[palette]??COLORS.cream;ctx.globalAlpha=fade*.54;ctx.fillRect(0,0,W,H);}
  ctx.restore();
}
