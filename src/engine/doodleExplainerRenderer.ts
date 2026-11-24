import { drawDoodleHead as head, drawDoodlePerson as person, drawDoodleBrain as brain } from './doodleCharacters';
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
  const mood=scene.doodle?.mood??'relaxed';
  const stressed=mood==='surprised'||mood==='overwhelmed';

  // Pipe and a flat, hand-drawn rain head above the curtain.
  ctx.beginPath();ctx.moveTo(352,287);ctx.lineTo(376,258);ctx.lineTo(512,258);
  outline(ctx,3);ctx.stroke();
  ctx.fillStyle='#9DA9B5';ctx.beginPath();
  ctx.moveTo(323,311);ctx.lineTo(360,311);ctx.lineTo(351,291);ctx.lineTo(333,291);
  ctx.closePath();ctx.fill();outline(ctx,2.6);ctx.stroke();

  for(let i=0;i<6;i++){
    const x=329+i*5.8;
    const travel=(t*46+i*21)%116;
    ctx.fillStyle='rgba(99,144,173,.59)';
    ctx.beginPath();ctx.ellipse(x,330+travel,1.8,5.2,.1,0,Math.PI*2);ctx.fill();
  }

  // The shower figure is not a standing person with a wall pasted over it.
  // Only the head and a small strip of shoulders are visible above the lip.
  ctx.fillStyle=shirt;ctx.beginPath();
  ctx.moveTo(210,485);ctx.quadraticCurveTo(257,450,304,485);ctx.lineTo(300,510);
  ctx.lineTo(213,510);ctx.closePath();ctx.fill();outline(ctx,2.8);ctx.stroke();
  head(ctx,257,447,mood,t,.79);

  // Front curtain masks the torso. Its top is deliberately below the chin.
  ctx.fillStyle='#C2D9E5';
  ctx.beginPath();ctx.moveTo(111,492);ctx.quadraticCurveTo(254,489,401,491);
  ctx.lineTo(405,912);ctx.lineTo(111,912);ctx.closePath();ctx.fill();outline(ctx,3.3);ctx.stroke();
  ctx.strokeStyle='#E8F6FA';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(131,515);ctx.lineTo(164,514);ctx.moveTo(131,528);ctx.lineTo(147,528);ctx.stroke();

  // Two separate hands rest on the edge (or rise when startled).
  const handY=stressed ? 457 : 493;
  const leftX=stressed ? 194 : 207,rightX=stressed ? 319 : 311;
  ctx.beginPath();ctx.moveTo(213,496);ctx.quadraticCurveTo(191,488,leftX,handY);
  ctx.moveTo(303,496);ctx.quadraticCurveTo(326,485,rightX,handY);
  outline(ctx,3);ctx.stroke();
  ellipse(ctx,leftX,handY,5.2,6.4,'#F6E7CD',2);
  ellipse(ctx,rightX,handY,5.2,6.4,'#F6E7CD',2);

  pill(ctx,scene.doodle?.clockText??'5 min',46,386,104);
  if(scene.doodle?.extras?.includes('music'))notes(ctx,417,375,t);
  if(scene.doodle?.extras?.includes('thought')){
    ellipse(ctx,389,370,79,38,'#FCFAF4',2.4);
    ctx.fillStyle=INK;ctx.textAlign='center';ctx.font='700 16px Kalam,sans-serif';
    ctx.fillText('Wat als...?',389,376,136);
  }
}
function bed(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,t:number,shirt:string){
  // Backboard, oversized white pillow and a face half-hidden by the blanket.
  ctx.fillStyle='#A97850';
  ctx.beginPath();ctx.roundRect(67,335,377,307,15);ctx.fill();outline(ctx,3);ctx.stroke();
  ellipse(ctx,255,513,181,70,'#FFFDF8',2.9);
  ctx.fillStyle=shirt;ctx.beginPath();ctx.moveTo(223,580);
  ctx.quadraticCurveTo(256,550,289,580);ctx.lineTo(292,627);
  ctx.lineTo(218,627);ctx.closePath();ctx.fill();outline(ctx,2.7);ctx.stroke();
  head(ctx,254,531,scene.doodle?.mood??'sleepy',t,.78);

  // Smooth blanket covers the body. Phone is held above the fold, like the source.
  ctx.fillStyle='#6F9DC5';ctx.beginPath();
  ctx.moveTo(0,613);ctx.bezierCurveTo(156,603,340,617,512,610);
  ctx.lineTo(512,910);ctx.lineTo(0,910);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(0,613);ctx.bezierCurveTo(156,603,340,617,512,610);
  ctx.strokeStyle='#E7F2F6';ctx.lineWidth=2.5;ctx.stroke();
  if(scene.doodle?.extras?.includes('phone')){
    ctx.fillStyle='#F3D575';ctx.beginPath();
    ctx.roundRect(236,576+Math.sin(Math.min(t,1.2)*2)*1.5,42,82,7);
    ctx.fill();outline(ctx,2.7);ctx.stroke();
    ellipse(ctx,242,613,5,5,'#F6E7CD',1.4);
    ellipse(ctx,272,613,5,5,'#F6E7CD',1.4);
  }
  if(scene.doodle?.clockText)pill(ctx,scene.doodle.clockText,75,369,104);
  if(scene.doodle?.extras?.includes('alarms')){
    for(const [x,y,angle] of [[72,393,-.19],[440,409,.12],[70,584,.07]] as const){
      alarm(ctx,x,y,.52,angle+Math.sin(t*2+x)*.025);
    }
  }
  if(scene.doodle?.extras?.includes('tasks')){
    ['MAIL','PLANNEN','DOEN'].forEach((v,i)=>{
      ctx.save();ctx.translate(113+i*121,700+Math.sin(i+t*.8)*2);ctx.rotate((i-1)*.11);
      ctx.fillStyle=['#B8D3AB','#F2D97E','#E5ABA6'][i];
      ctx.fillRect(-30,-20,60,46);
      outline(ctx,1.7);ctx.strokeRect(-30,-20,60,46);
      ctx.font='700 12px Kalam,sans-serif';ctx.textAlign='center';ctx.fillStyle=INK;
      ctx.fillText(v,0,7,55);ctx.restore();
    });
  }
}
function standing(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,t:number,shirt:string){
  const palette=scene.doodle?.palette;
  const mood=scene.doodle?.mood??'worried';
  const raised=scene.doodle?.extras?.includes('free')||scene.doodle?.extras?.includes('excited');
  person(ctx,252,600,.86,mood,t,raised,shirt,scene.doodle?.pose);
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
  brain(ctx,244,583,.86,t,scene.doodle?.mood!=='worried');
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
  brain(ctx,68,632,.53,t);
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
  person(ctx,154,593,.73,scene.doodle?.mood??'worried',t,false,shirt,scene.doodle?.pose);
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
  person(ctx,247,606,.82,'happy',t,true,shirt,'relieved');
  brain(ctx,381,471,.46,t);
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
