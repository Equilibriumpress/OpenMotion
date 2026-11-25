import type {OpenMotionProject,OpenMotionScene} from '../types/openmotion';
import {getBucketListCanvas} from './bucketListCamera';

const ink='#0B1724',paper='#F0EDE4',gold='#C69B61',water='#538FA5',green='#456B52';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
type C=CanvasRenderingContext2D;
function text(c:C,s:string,x:number,y:number,size:number,color=paper,serif=false,max=1050){
 c.fillStyle=color;c.font=(serif?'500 ':'600 ')+size+'px '+(serif?'Georgia,serif':'"Plus Jakarta Sans",sans-serif');c.textAlign='left';c.fillText(s,x,y,max);
}
function line(c:C,points:number[][],color:string,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function polygon(c:C,points:number[][],color:string){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=color;c.fill();}
function arrow(c:C,x:number,y:number,dx:number,dy:number,color:string){
 line(c,[[x,y],[x+dx,y+dy]],color,3);const a=Math.atan2(dy,dx),e=x+dx,f=y+dy;
 polygon(c,[[e,f],[e-12*Math.cos(a-.5),f-12*Math.sin(a-.5)],[e-12*Math.cos(a+.5),f-12*Math.sin(a+.5)]],color);
}
function backdrop(c:C){c.fillStyle=ink;c.fillRect(0,0,1920,1080);for(let i=0;i<14;i++){c.beginPath();c.ellipse(1550,380,130+i*48,42+i*23,-.38,0,Math.PI*2);c.strokeStyle='rgba(69,107,82,.20)';c.lineWidth=1;c.stroke();}}
function photo(c:C,img:HTMLImageElement,t:number,reverse:boolean){
 const z=1.03+.075*(reverse?1-t:t),s=Math.max(1920/img.naturalWidth,1080/img.naturalHeight)*z;
 const w=img.naturalWidth*s,h=img.naturalHeight*s;
 c.save();c.filter='contrast(1.04) saturate(.93)';c.drawImage(img,(1920-w)/2+(t-.5)*Math.min(32,w-1920),(1080-h)/2,w,h);c.restore();
}
function shade(c:C){const g=c.createLinearGradient(0,0,0,1080);g.addColorStop(0,'rgba(6,15,25,.52)');g.addColorStop(.25,'rgba(6,15,25,0)');g.addColorStop(.55,'rgba(6,15,25,0)');g.addColorStop(1,'rgba(6,15,25,.86)');c.fillStyle=g;c.fillRect(0,0,1920,1080);}
function diagram(c:C,mode:string,t:number){
 const x=230,y=710,base=850;const p=smooth(t/.72);
 c.fillStyle='#193C50';c.fillRect(x,510,1460,200);
 const peak=mode==='formation'?620-340*p:350;
 const points=mode==='caldera'?[[x,710],[430,570],[600,355],[760,480],[1000,530],[1240,480],[1390,355],[1540,570],[1690,710],[1690,base],[x,base]]
 :mode==='geothermal'?[[x,710],[430,590],[680,535],[920,570],[1140,520],[1390,560],[1690,710],[1690,base],[x,base]]
 :[[x,710],[430,650],[700,peak+130],[960,peak],[1210,peak+130],[1490,650],[1690,710],[1690,base],[x,base]];
 polygon(c,points,'#645342');
 c.save();c.beginPath();points.forEach((pt,i)=>i?c.lineTo(pt[0],pt[1]):c.moveTo(pt[0],pt[1]));c.closePath();c.clip();
 for(let i=0;i<6;i++){line(c,[[x,690+i*29],[650,590+i*29],[970,625+i*29],[1370,590+i*29],[1690,690+i*29]],i%2?'#9B7952':'#4C433B',8);}
 c.restore();
 if(mode==='formation'){
 c.fillStyle='#CB754B';c.beginPath();c.ellipse(960,812,120,35,0,0,Math.PI*2);c.fill();
 line(c,[[960,815],[960,peak+35]],'#DB8551',20);
 arrow(c,960,peak+80,0,-95,gold);
 text(c,'Magma rises',1030,760,27,gold);text(c,'Atlantic Ocean',250,540,27,water);
 }else if(mode==='caldera'){
 const level=520;polygon(c,[[756,level],[1244,level],[1200,545],[1000,575],[800,545]],water);
 arrow(c,960,342,0,140,gold);text(c,'Collapse',1000,400,28,gold);
 text(c,'Caldera lake',825,610,27,water);text(c,'Volcanic layers',255,805,26,paper);
 }else{
 c.fillStyle='#CF7850';c.beginPath();c.ellipse(1000,810,135,28,0,0,Math.PI*2);c.fill();
 line(c,[[560,470],[650,575],[730,735],[1010,775],[1250,690],[1310,540]],water,7);
 arrow(c,650,575,70,135,water);arrow(c,1240,690,65,-135,gold);
 for(let i=0;i<6;i++){const off=(t*140+i*21)%95;c.save();c.globalAlpha=1-off/100;c.beginPath();c.ellipse(1320+i*13,530-off,20+off*.3,12+off*.3,0,0,Math.PI*2);c.fillStyle=paper;c.fill();c.restore();}
 text(c,'Rainwater',460,450,28,water);text(c,'Geothermal heat',1020,840,27,gold);text(c,'Steam and hot water',1330,490,27,paper);
 }
 text(c,'SCHEMATIC CROSS-SECTION · NOT TO SCALE',230,930,21,'#A4B4B8');
}
function markers(c:C,scene:OpenMotionScene,t:number){
 const d=scene.bucketList?.documentary;if(!d?.from||!d.to)return;
 // MapLibre camera is the real map. Overlay names appear in an editorial key,
 // not as falsely georeferenced screen markers.
 if(scene.headline==='Three active central volcanoes'){
  ['01   SETE CIDADES','02   FOGO','03   FURNAS'].forEach((s,i)=>{const a=smooth((t-i*.12)/.22);c.save();c.globalAlpha*=a;c.fillStyle='rgba(11,23,36,.88)';c.fillRect(110,335+i*66,400,52);text(c,s,132,371+i*66,24,gold);c.restore();});
 }
}
export function renderDocumentaryShot(ctx:C,w:number,h:number,scene:OpenMotionScene,time:number,project:OpenMotionProject,getPhoto:(url:string)=>HTMLImageElement|null,layer:'image'|'text'){
 const doc=scene.bucketList?.documentary;if(!doc)return;
 const t=clamp(time/Math.max(.1,scene.durationSec)),mode=doc.mode;
 ctx.save();ctx.scale(w/1920,h/1080);
 if(layer==='image'){
  backdrop(ctx);
  if(mode==='map'){
    const map=getBucketListCanvas(project);if(map)ctx.drawImage(map,0,0,1920,1080);
    else text(ctx,'GEOGRAPHIC MAP UNAVAILABLE',110,535,30,gold);
  }else if(['formation','caldera','geothermal'].includes(mode))diagram(ctx,mode,t);
  else if(scene.imageUrl){const img=getPhoto(scene.imageUrl);if(img)photo(ctx,img,t,doc.chapter%2===0);else text(ctx,'PHOTOGRAPH UNAVAILABLE',110,540,28,gold);}
  if(mode==='climate'){ctx.save();ctx.globalAlpha=.55;for(let i=0;i<45;i++){const x=(i*137+22)%1920,y=(i*83+t*500)%750;line(ctx,[[x,y],[x-12,y+32]],'#C6E3EE',2);}ctx.restore();}
  ctx.restore();return;
 }
 const a=smooth(time/.8);ctx.globalAlpha*=a;
 const isDiagram=['formation','caldera','geothermal'].includes(mode);
 if(!isDiagram&&mode!=='end')shade(ctx);
 text(ctx,'GEOGRAPHICAL STORIES',100,100,28,gold);text(ctx,'EPISODE 01  /  AZORES',100,142,20,paper);
 if(mode==='title'){
  text(ctx,'São Miguel',100,730,110,paper,true);text(ctx,'Island of Fire and Water',105,810,47,gold,true);
 }else if(mode==='end'){
  text(ctx,'Geographical Stories',100,480,84,paper,true);text(ctx,'Understanding our planet, one place at a time.',105,570,33,gold);
 }else if(mode==='timeline'){
  text(ctx,'1563',100,705,150,gold,true);text(ctx,'Major eruption of Fogo',105,780,42,paper,true);
 }else if(isDiagram){
  text(ctx,scene.headline,100,250,62,paper,true);
 }else{
  text(ctx,scene.headline,100,830,58,paper,true,1700);
  if(mode==='map')markers(ctx,scene,t);
 }
 const credit=mode==='map'?'MAP · OpenFreeMap / OpenMapTiles · © OpenStreetMap contributors':scene.imageUrl?'PHOTO · '+(scene.bucketList?.imageAuthor??'')+' · '+(scene.bucketList?.imageLicense??''):'ILLUSTRATION · OpenMotion Studio';
 text(ctx,credit,100,1030,19,'#CAD0CC',false,1700);
 ctx.restore();
}
