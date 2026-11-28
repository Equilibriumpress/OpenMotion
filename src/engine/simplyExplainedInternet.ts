import type { OpenMotionScene } from '../types/openmotion';
// Original illustrations, normalized scene time, shared editorial safe area.
// An illustrative Atlantic journey, not a live network trace.
type C=CanvasRenderingContext2D;
type P=[number,number];
const ink='#243538',teal='#253E43',light='#FFF9EF',rust='#B94F36',sand='#E9D4BD',muted='#766E61',water='#DCE5DD',sea='#537D80';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const a=clamp(x);return a*a*(3-2*a);};
const mix=(a:number,b:number,q:number)=>a+(b-a)*q;
function rect(c:C,x:number,y:number,w:number,h:number,f:string,r=8){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=f;c.fill();}
function dot(c:C,x:number,y:number,r:number,f:string){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=f;c.fill();}
function line(c:C,a:P,b:P,f=teal,w=2){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=f;c.lineWidth=w;c.lineCap='round';c.stroke();}
function path(c:C,d:string,f:string,stroke?:string,w=2){const p=new Path2D(d);if(f!=='none'){c.fillStyle=f;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke(p);}}
function txt(c:C,s:string,x:number,y:number,size=24,color=ink,weight=700,max=442){c.font=weight+' '+size+'px system-ui,sans-serif';c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=color;c.fillText(s,x,y,max);}
function show(c:C,u:number,draw:()=>void){c.save();c.globalAlpha*=ease(u);draw();c.restore();}
function camera(c:C,x:number,y:number,s:number,draw:()=>void){c.save();c.translate(x,y);c.scale(s,s);c.translate(-x,-y);draw();c.restore();}
function packet(c:C,x:number,y:number,color=rust,s=1){c.save();c.translate(x,y);c.scale(s,s);rect(c,-13,-10,26,20,color,4);line(c,[-7,-3],[7,-3],light,1.3);line(c,[-7,3],[3,3],light,1.3);c.restore();}
function phone(c:C,x:number,y:number,s:number,received:boolean,progress:number){
 c.save();c.translate(x,y);c.scale(s,s);
 rect(c,-103,-172,206,344,ink,23);rect(c,-94,-158,188,316,light,17);
 rect(c,-94,-158,188,46,water,12);dot(c,-68,-135,12,teal);txt(c,received?'From a friend':'To a friend',13,-129,14,ink,650,135);
 for(let i=0;i<2;i++){rect(c,-76,-88+i*48,119-i*21,30,'#E7E1D6',9);}
 if(received){show(c,progress,()=>{rect(c,-77,28,149,47,water,12);txt(c,'Hello!',-3,58,22,ink);});}
 else{rect(c,-30,23,108,46,sand,12);txt(c,'Hello!',24,53,22,ink);}
 rect(c,-76,113,152,30,'#E7E1D6',12);dot(c,61,128,12,rust);path(c,'M56 128 L65 128 M61 124 L65 128 61 132','none',light,1.6);rect(c,-26,163,52,4,light,2);c.restore();
}
function router(c:C,x:number,y:number,s:number){c.save();c.translate(x,y);c.scale(s,s);rect(c,-35,-16,70,37,teal,7);line(c,[-24,-16],[-24,-35],teal,3);line(c,[24,-16],[24,-35],teal,3);for(let i=0;i<3;i++)dot(c,-17+i*17,4,3,i===2?rust:light);c.restore();}
function server(c:C,x:number,y:number,s:number){c.save();c.translate(x,y);c.scale(s,s);for(let i=0;i<3;i++){rect(c,-32,-36+i*26,64,21,teal,4);dot(c,-19,-25+i*26,3,light);line(c,[-6,-25+i*26],[21,-25+i*26],'#92AAA5',2);}c.restore();}
function track(c:C,points:P[],u:number,color=rust,w=2.5,count=3){
 for(let i=1;i<points.length;i++)line(c,points[i-1],points[i],color,w);
 for(let j=0;j<count;j++){const v=((u+j/count)%1+1)%1*(points.length-1),k=Math.min(points.length-2,Math.floor(v)),q=v-k;packet(c,mix(points[k][0],points[k+1][0],q),mix(points[k][1],points[k+1][1],q),j%2?teal:rust,.58);}
}
function coastMap(c:C,t:number){
 rect(c,38,195,436,335,water,18);
 c.save();c.beginPath();c.roundRect(38,195,436,335,18);c.clip();
 path(c,'M38 207 L133 195 179 226 168 260 195 289 176 326 130 341 117 370 81 381 65 424 38 427Z','#A6BBA3');
 path(c,'M474 195 L380 195 351 223 373 252 348 280 363 307 337 332 372 355 362 396 390 433 474 463Z','#A6BBA3');
 path(c,'M129 385 L163 397 183 436 174 480 143 530 111 530 119 479 99 438Z','#A6BBA3');
 for(let i=0;i<4;i++)line(c,[38,253+i*72],[474,253+i*72],'rgba(83,125,128,.15)',1);
 const a:P=[164,319],b:P=[365,297];c.beginPath();c.moveTo(...a);c.bezierCurveTo(232,262,292,350,...b);c.strokeStyle=rust;c.lineWidth=3;c.stroke();
 for(let i=0;i<4;i++){const u=(t*.35+i*.25)%1,v=1-u;const x=v*v*v*a[0]+3*v*v*u*232+3*v*u*u*292+u*u*u*b[0],y=v*v*v*a[1]+3*v*v*u*262+3*v*u*u*350+u*u*u*b[1];dot(c,x,y,4,light);}
 dot(c,...a,7,rust);dot(c,...b,7,teal);c.restore();
 txt(c,'North America',123,474,17,ink,650,150);txt(c,'Europe',407,474,17,ink,650,100);
}
function seaFloor(c:C,u:number,t:number){
 const depth=ease(u/.53);
 rect(c,38,177,436,365,'#B8D3D0',16);
 c.save();c.beginPath();c.roundRect(38,177,436,365,16);c.clip();
 const gradient=c.createLinearGradient(0,177,0,542);gradient.addColorStop(0,'#D6E6DF');gradient.addColorStop(.3,'#7FA9A7');gradient.addColorStop(1,'#335A62');c.fillStyle=gradient;c.fillRect(38,177,436,365);
 c.translate(0,-depth*40);
 for(let i=0;i<5;i++){c.beginPath();c.moveTo(38,205+i*6);c.quadraticCurveTo(256,191+i*6+Math.sin(t)*3,474,205+i*6);c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1.4;c.stroke();}
 path(c,'M38 505 Q126 449 194 490 Q276 521 348 470 Q409 447 474 490 V600 H38Z','#A99878');
 path(c,'M38 492 Q126 438 194 480 Q276 511 348 460 Q409 438 474 480','none','#203C41',12);
 path(c,'M38 492 Q126 438 194 480 Q276 511 348 460 Q409 438 474 480','none',rust,3);
 const x=75+350*((t*.38)%1);dot(c,x,479+15*Math.sin(x*.021),4,light);c.restore();
}
function cable(c:C,u:number){
 const q=ease(u);c.save();c.translate(256,354);c.rotate(-.16);
 rect(c,-190,-48,300,96,teal,45);rect(c,-186,-32,282,64,'#65797A',30);rect(c,-177,-20,275,40,sand,20);
 dot(c,109,0,48,ink);dot(c,109,0,39,'#829697');dot(c,109,0,28,'#C5A779');dot(c,109,0,19,teal);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=109+11*Math.cos(a),y=11*Math.sin(a);dot(c,x,y,3.8,light);line(c,[x,y],[x+65*q,y+12*Math.sin(a)*q],light,2.4);}
 c.restore();
}
function fiber(c:C,t:number,u:number){
 const q=ease(u/.4);
 rect(c,43,222,426,250,teal,18);
 for(let j=0;j<3;j++){
  const y=276+j*69;rect(c,60,y-15,392,30,'#81A4A0',15);rect(c,60,y-5,392,10,'#D7E8DE',5);
  for(let i=0;i<5;i++){const phase=(t*.75+i*.2+j*.12)%1,x=67+378*phase;dot(c,x,y,10,'rgba(250,220,170,.25)');dot(c,x,y,4.8,light);}
 }
 show(c,q,()=>txt(c,'Light carries the data',256,565,24,rust));
}
function signature(c:C,u:number){show(c,u,()=>{line(c,[42,583],[470,583],'#C9BBA7',1);rect(c,45,598,26*ease(u),6,rust,2);txt(c,'SIMPLY EXPLAINED',190,609,17,teal,800,230);});}
export function renderInternetDiagram(c:C,s:OpenMotionScene,t:number){
 const shot=s.doodle?.extras?.find(x=>x.startsWith('shot:'))?.slice(5),u=clamp(t/Math.max(.001,s.durationSec));
 switch(shot){
 case 'cover':
  txt(c,'SIMPLY EXPLAINED',256,78,15,muted,700);txt(c,'HOW THE',256,160,52,ink,850);txt(c,'INTERNET',256,221,56,ink,850);txt(c,'WORKS',256,282,59,rust,850);
  phone(c,115,449,.62,false,1);phone(c,397,449,.62,true,1);track(c,[[182,449],[256,400],[330,449]],t*.5,rust,2,2);break;
 case 'hook':
  txt(c,'Send a message',256,110,34,ink,800);phone(c,256,351,1-.16*ease((u-.56)/.44),false,1);
  show(c,(u-.32)/.2,()=>{const q=ease((u-.32)/.68);packet(c,256+126*q,390-156*q,rust,.8+q*.5);});
  show(c,(u-.60)/.2,()=>txt(c,'Hello!',256,580,26,rust));break;
 case 'packets': {
  txt(c,'Data packets',256,110,34,ink,800);const q=ease(u/.44);
  rect(c,80,219,352,74,light,14);txt(c,'Hello!',256,267,36,ink);
  for(let i=0;i<4;i++){const x=mix(256,107+i*99,q),y=mix(282,383,q);show(c,(u-i*.08)/.25,()=>packet(c,x,y,i%2?teal:rust,1.6));}
  show(c,(u-.55)/.2,()=>{line(c,[107,432],[404,432],muted,1.5);txt(c,'Small units of data',256,486,25,ink);});break;}
 case 'routers': {
  txt(c,'Through the network',256,110,34,ink,800);const pts:P[]=[[74,360],[165,280],[256,365],[346,280],[440,360]];
  for(let i=0;i<3;i++){line(c,[165,280],[140+i*112,470],'#B6C5B8',1.8);dot(c,140+i*112,470,9,'#B6C5B8');}
  track(c,pts,t*.32);phone(c,74,360,.29,false,1);router(c,165,280,.9);server(c,256,365,.9);router(c,346,280,.9);phone(c,440,360,.29,true,0);
  show(c,(u-.48)/.25,()=>txt(c,'Routers forward packets',256,561,23,ink));break;}
 case 'ocean':
  txt(c,'Across oceans',256,110,34,ink,800);
  camera(c,256,315,1+.065*ease(u),()=>coastMap(c,t));
  txt(c,'Illustrative cable route',256,580,18,muted,500);break;
 case 'cable': {
  txt(c,'Underwater fiber optics',256,110,32,ink,800);
  seaFloor(c,u,t);const q=ease((u-.46)/.37);
  if(q>0){c.save();c.globalAlpha*=q;rect(c,38,177,436,365,light,16);camera(c,256,354,.75+.25*q,()=>cable(c,q));c.restore();}
  show(c,(u-.70)/.2,()=>txt(c,'Protective layers · glass fibers',256,580,21,ink,650));break;}
 case 'light':
  txt(c,'Travelling as light',256,110,34,ink,800);camera(c,256,350,1+.045*ease(u),()=>fiber(c,t,u));break;
 case 'received':
  txt(c,'Message received',256,110,34,ink,800);
  phone(c,256,345,.9+.09*ease(u),true,(u-.28)/.32);
  for(let i=0;i<3;i++){const q=ease((u-i*.065)/.43);if(q<.999)packet(c,mix(65+i*30,244,q),mix(232+i*30,365,q),i%2?teal:rust,.85);}
  signature(c,(t-(s.durationSec-.95))/.35);break;
 }
}
