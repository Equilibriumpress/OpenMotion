import {isTravelDocumentary,isTravelClip,travelFrameGrid,matchingTravelAtlas} from './travelProject';
import type {OpenMotionProject,OpenMotionScene,DocumentaryShot} from '../types/openmotion';
import {getBucketListCanvas,getDocumentaryProjectedPoint} from './bucketListCamera';

type C=CanvasRenderingContext2D;
type Pt=[number,number];
const ink='#0B1724',paper='#F0EDE4',gold='#C69B61',water='#538FA5',green='#456B52',muted='#A4B4B8';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
function txt(c:C,s:string,x:number,y:number,size:number,color=paper,serif=false,max=1650){
 c.fillStyle=color;c.font=(serif?'500 ':'600 ')+size+'px '+(serif?'Georgia,serif':'"Plus Jakarta Sans",sans-serif');c.textAlign='left';c.textBaseline='alphabetic';c.fillText(s,x,y,max);
}
function path(c:C,p:Pt[],close=false){c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));if(close)c.closePath();}
function line(c:C,p:Pt[],col:string,w=2){path(c,p);c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.stroke();}
function poly(c:C,p:Pt[],col:string|CanvasGradient){path(c,p,true);c.fillStyle=col;c.fill();}
function circle(c:C,x:number,y:number,r:number,col:string){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=col;c.fill();}
function ellipse(c:C,x:number,y:number,rx:number,ry:number,col:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill();}
function arrow(c:C,x:number,y:number,dx:number,dy:number,col:string){
 const a=Math.atan2(dy,dx),e=x+dx,f=y+dy;
 line(c,[[x,y],[e,f]],col,4);poly(c,[[e,f],[e-14*Math.cos(a-.55),f-14*Math.sin(a-.55)],[e-14*Math.cos(a+.55),f-14*Math.sin(a+.55)]],col);
}
function label(c:C,s:string,x:number,y:number,tx:number,ty:number,col=paper){
 line(c,[[x,y],[tx,ty]],col,1.7);circle(c,x,y,3,col);txt(c,s,tx+9,ty-9,25,col);
}
function backdrop(c:C){
 const g=c.createLinearGradient(0,0,1920,1080);g.addColorStop(0,'#132837');g.addColorStop(1,ink);
 c.fillStyle=g;c.fillRect(0,0,1920,1080);
}
function photo(c:C,img:HTMLImageElement,t:number,d:DocumentaryShot){
 const q=smooth(t),mode=d.photoMotion??'push',z=mode==='hold'?1.015:mode==='pull'?1.13-.105*q:mode==='pan'?1.07:1.025+.10*q;
 const s=Math.max(1920/img.naturalWidth,1080/img.naturalHeight)*z,w=img.naturalWidth*s,h=img.naturalHeight*s;
 const pan=mode==='pan'?(q-.5)*Math.min(w-1920,180):0;
 c.save();c.filter='contrast(1.035) saturate(.94)';
 c.drawImage(img,(1920-w)/2+pan,(1080-h)/2,w,h);c.restore();
}
function shade(c:C,strength=.86){
 const g=c.createLinearGradient(0,0,0,1080);g.addColorStop(0,'rgba(6,15,25,.38)');g.addColorStop(.22,'rgba(6,15,25,0)');g.addColorStop(.60,'rgba(6,15,25,0)');g.addColorStop(1,'rgba(6,15,25,'+strength+')');c.fillStyle=g;c.fillRect(0,0,1920,1080);
}
function rock(c:C,pts:Pt[],bottom=870){
 const g=c.createLinearGradient(0,330,0,bottom);g.addColorStop(0,'#A58A64');g.addColorStop(.4,'#725A49');g.addColorStop(1,'#342D32');
 poly(c,pts,g);c.save();path(c,pts,true);c.clip();
 // Layered deposits, stipple and fine striations. These are illustrations,
 // not measured strata or true geological cross sections.
 for(let i=0;i<13;i++){
  const y=395+i*39;const v:Pt[]=[];for(let x=170;x<=1750;x+=45)v.push([x,y+24*Math.sin(x*.005+i*.45)+11*Math.cos(x*.011+i)]);
  line(c,v,['#B3936B','#503E38','#846A55','#C5A47D'][i%4],i%3===0?13:5);
 }
 for(let i=0;i<530;i++){
  const x=170+(i*127.71)%1580,y=315+(i*87.43)%560;
  circle(c,x,y,1.2+i%3*.45,i%4===0?'rgba(225,201,159,.18)':'rgba(30,26,27,.23)');
 }
 c.restore();
}
function ocean(c:C,y:number){
 const g=c.createLinearGradient(0,y,0,870);g.addColorStop(0,'#427C90');g.addColorStop(1,'#1B3648');c.fillStyle=g;c.fillRect(170,y,1580,870-y);
 for(let i=0;i<12;i++)line(c,[[180+i*130,y+8],[240+i*130,y+8]],'rgba(207,232,230,.48)',2);
}
function chamber(c:C,x:number,y:number,rx:number,ry:number){
 const g=c.createRadialGradient(x,y,8,x,y,rx);g.addColorStop(0,'#F3C07B');g.addColorStop(.43,'#D77946');g.addColorStop(1,'#713A37');
 c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=g;c.fill();
}
function plume(c:C,x:number,y:number,t:number,amount:number){
 for(let i=0;i<24;i++){const k=(t*1.5+i/24)%1,a=k*200*amount,xx=x+Math.sin(i*2.1+k*4)*(20+a*.45);
 c.save();c.globalAlpha=(1-k)*.40*amount;ellipse(c,xx,y-a,15+a*.34,12+a*.24,i%4===0?'#D7BCA1':'#A6A3A2');c.restore();}
}
function formation(c:C,t:number,phase:number){
 const p=phase===0?.12+.44*smooth(t):.56+.44*smooth(t),peak=mix(690,350,p);
 ocean(c,530);
 const pts:Pt[]=[[170,770],[430,720],[670,peak+155],[810,peak+65],[920,peak],[990,peak+8],[1100,peak+72],[1330,peak+210],[1750,770],[1750,870],[170,870]];
 rock(c,pts);chamber(c,950,818,140,41);line(c,[[950,815],[950,peak+20]],'#D88450',12);
 if(phase===1){line(c,[[950,peak+8],[1010,peak+55],[1090,peak+82]],'#E0A76C',7);plume(c,950,peak,t,.5);}
 arrow(c,910,735,0,-85,gold);
 label(c,'Magma reservoir',1070,815,1160,835,gold);label(c,'Volcanic layers',710,690,340,780);
 if(phase===0)txt(c,'Ocean surface',190,510,26,water);else label(c,'Emerging volcanic island',970,peak,1190,340);
}
function eruption(c:C,t:number,phase:number){
 const peak=420,pts:Pt[]=[[170,760],[410,715],[650,590],[890,peak],[960,peak+12],[1030,peak],[1280,610],[1750,760],[1750,870],[170,870]];
 rock(c,pts);chamber(c,960,810,170,40);line(c,[[960,810],[960,peak+16]],'#D67D46',14);
 const p=smooth(t/.7);
 if(phase===0){
  line(c,[[970,peak+20],[1110,peak+115],[1280,peak+210],[1280+150*p,peak+240]],'#EFAC6A',16);
  plume(c,960,peak,t,.45);label(c,'Lava flow',1250,620,1420,490,gold);
 }else{
  plume(c,960,peak,t,1);for(let i=0;i<62;i++){const q=(t*.5+i/62)%1;const x=960+(i%2?1:-1)*q*(140+i%7*55),y=peak-160*Math.sin(Math.PI*q)+q*220;circle(c,x,y,2+i%3,'#D4B5A0');}
  label(c,'Ash and pumice',1060,320,1230,270);
 }
 label(c,'Successive deposits',640,710,330,655);
}
function caldera(c:C,t:number,phase:number){
 const p=phase===0?smooth(t*.86):1,drop=150*p;
 const pts:Pt[]=[[170,760],[410,650],[610,430],[780,365],[900,380+drop],[1020,380+drop],[1140,365],[1320,430],[1510,650],[1750,760],[1750,870],[170,870]];
 rock(c,pts);chamber(c,960,802,phase===0?mix(195,83,p):83,phase===0?mix(50,24,p):24);
 if(phase===0){plume(c,960,378,t,1-p*.5);arrow(c,880,290,0,80+drop*.35,gold);arrow(c,1040,290,0,80+drop*.35,gold);label(c,'Summit subsides',985,380+drop,1310,350);}
 else{
 const fill=smooth(t/.85);const level=550-fill*64;
 poly(c,[[806,level],[1114,level],[1065,533],[855,533]],'#5597A7');line(c,[[806,level],[1114,level]],'#B7DBDA',3);
 for(let i=0;i<12;i++){const x=800+i*27,y=300+(t*280+i*37)%160;line(c,[[x,y],[x-9,y+23]],'#7FBACD',2);}
 label(c,'Rain and runoff',925,410,1190,325,water);label(c,'Caldera lake',960,level,1245,540,water);
 }
 label(c,'Magma reservoir',1050,810,1240,830,gold);
}
function geothermal(c:C,t:number,phase:number){
 const pts:Pt[]=[[170,730],[405,650],[660,560],[840,600],[1040,550],[1230,605],[1410,560],[1750,720],[1750,870],[170,870]];
 rock(c,pts);chamber(c,1000,817,170,34);
 const route:Pt[]=[[490,615],[610,695],[705,765],[905,790],[1090,760],[1260,665],[1400,565]];
 line(c,route,'#547F91',7);const part=phase===0?Math.floor(2+3*smooth(t)):route.length;
 line(c,route.slice(0,part),'#7DC2D0',9);
 if(phase===1){line(c,route.slice(3),'#E9AE76',7);plume(c,1400,565,t,.60);}
 arrow(c,610,695,80,60,water);if(phase===1)arrow(c,1260,665,100,-75,gold);
 label(c,'Rainwater infiltrates',490,615,210,460,water);label(c,'Geothermal heat',1010,816,1170,840,gold);
 if(phase===1)label(c,'Hot water and steam',1400,565,1470,420);
}
function tectonic(c:C,t:number,phase:number){
 const a=smooth(t);const left:Pt[]=[[170,320],[900,320],[855,440],[915,530],[780,660],[780,820],[170,820]];
 const top:Pt[]=[[900,320],[1750,320],[1750,545],[1130,545],[915,530],[855,440]];
 const bottom:Pt[]=[[915,530],[1130,545],[1750,545],[1750,820],[780,820],[780,660]];
 poly(c,left,'#355B69');poly(c,top,'#506C57');poly(c,bottom,'#82684F');
 line(c,[[900,320],[855,440],[915,530],[780,660],[780,820]],paper,5);line(c,[[915,530],[1130,545],[1750,545]],paper,5);
 txt(c,'NORTH AMERICAN PLATE',230,410,30);txt(c,'EURASIAN PLATE',1130,410,30);txt(c,'AFRICAN PLATE',1110,750,30);
 circle(c,915,530,13,gold);label(c,'Azores region',915,530,1050,620,gold);
 if(phase===1){arrow(c,680,465,-100*a,0,gold);arrow(c,1080,435,100*a,-28*a,gold);arrow(c,1030,665,70*a,65*a,gold);txt(c,'Extension and mantle melting',230,900,28,gold);}
 txt(c,'REGIONAL SCHEMATIC · BOUNDARIES AND MOTION GENERALIZED',170,940,20,muted);
}
function climate(c:C,t:number){
 ocean(c,680);const pts:Pt[]=[[170,775],[490,720],[700,630],[1000,355],[1160,475],[1320,650],[1750,775],[1750,870],[170,870]];rock(c,pts);
 line(c,[[490,716],[700,630],[1000,355],[1160,475],[1320,650]],green,18);
 for(let i=0;i<5;i++)arrow(c,330+i*100,640-i*50,155,-75,water);
 for(let i=0;i<8;i++)ellipse(c,780+i*63,355+22*Math.sin(i),52,32,'rgba(230,237,231,.70)');
 for(let i=0;i<28;i++){const x=760+i%12*45,y=390+(t*370+i*53)%245;line(c,[[x,y],[x-12,y+30]],'#91CAD8',2);}
 label(c,'Moist Atlantic air',480,600,200,435,water);label(c,'Cooling and condensation',1010,350,1190,310);
 label(c,'Rainfall',1120,510,1340,520,water);
}
const diagramModes=new Set(['formation','caldera','geothermal','tectonic','eruption','climate']);
function drawDiagram(c:C,d:DocumentaryShot,t:number){
 const phase=d.phase??0;
 if(d.mode==='formation')formation(c,t,phase);
 else if(d.mode==='eruption')eruption(c,t,phase);
 else if(d.mode==='caldera')caldera(c,t,phase);
 else if(d.mode==='geothermal')geothermal(c,t,phase);
 else if(d.mode==='tectonic')tectonic(c,t,phase);
 else if(d.mode==='climate')climate(c,t);
 if(d.mode!=='tectonic')txt(c,'SCHEMATIC PROCESS · NOT TO SCALE',170,940,20,muted);
}
function markers(c:C,project:OpenMotionProject,d:DocumentaryShot,t:number){
 const used:{x:number;y:number}[]=[];
 for(const [i,m] of (d.markers??[]).entries()){
  const p=getDocumentaryProjectedPoint(project,m.lon,m.lat);if(!p||p.x<.045||p.x>.955||p.y<.13||p.y>.76)continue;
  const x=p.x*1920,y=p.y*1080,a=smooth((t-i*.065)/.18);
  c.save();c.globalAlpha*=a;
  circle(c,x,y,13,'rgba(11,23,36,.80)');circle(c,x,y,7,gold);
  let ly=y-32;while(used.some(q=>Math.abs(q.x-x)<220&&Math.abs(q.y-ly)<44))ly-=46;
  if(ly<170)ly=y+45;
  used.push({x,y:ly});
  const width=Math.min(300,m.label.length*15+28),lx=Math.max(40,Math.min(1880-width,x-width/2));
  line(c,[[x,y],[x,ly+6]],'#C69B61',2);
  c.fillStyle='rgba(11,23,36,.91)';c.beginPath();c.roundRect(lx,ly-29,width,40,4);c.fill();txt(c,m.label,lx+12,ly,24,paper,false,width-24);
  c.restore();
 }
}
function footer(c:C,scene:OpenMotionScene,d:DocumentaryShot){
 const credit=d.mode==='map'?'MAP · OpenFreeMap / OpenMapTiles · © OpenStreetMap contributors'+(d.relief?' · AWS Open Data DEM':''):scene.imageUrl?'PHOTO · '+(scene.bucketList?.imageAuthor??'')+' · '+(scene.bucketList?.imageLicense??''):'ILLUSTRATION · OpenMotion Studio';
 c.fillStyle='rgba(11,23,36,.73)';c.fillRect(0,1004,1920,76);txt(c,credit,80,1045,20,'#D2D6D3',false,1760);
}
function travelShot(ctx:C,w:number,h:number,scene:OpenMotionScene,time:number,project:OpenMotionProject,getPhoto:(url:string)=>HTMLImageElement|null,layer:'image'|'text'){
 const d=scene.bucketList!.documentary!,t=clamp(time/Math.max(.1,scene.durationSec)),kit=project.brandKit,accent=kit.accentColor;
 ctx.save();ctx.scale(w/1920,h/1080);
 if(layer==='image'){
  backdrop(ctx);
  if(d.mode==='map'){
   const map=getBucketListCanvas(project);if(map)ctx.drawImage(map,0,0,1920,1080);else txt(ctx,'GEOGRAPHIC MAP UNAVAILABLE',100,535,30,accent);
  }else if(scene.imageUrl){
   const im=getPhoto(scene.imageUrl);
   if(im&&im.naturalWidth){
    const g=travelFrameGrid(scene);
    if(isTravelClip(scene)){
     if(g&&matchingTravelAtlas(scene,im)){
      const n=Math.max(0,Math.min(g.frames-1,Math.floor(time*g.fps)));
      ctx.drawImage(im,(n%g.cols)*g.frameWidth,Math.floor(n/g.cols)*g.frameHeight,g.frameWidth,g.frameHeight,0,0,1920,1080);
     }else txt(ctx,'VIDEO SOURCE NOT PREPARED',100,535,30,accent);
    }else photo(ctx,im,t,d);
   }else txt(ctx,'MEDIA UNAVAILABLE',100,535,30,accent);
  }
  ctx.restore();return;
 }
 const a=smooth(time/.6);
 if(d.mode==='title'||d.mode==='end'){
  shade(ctx,.83);ctx.save();ctx.globalAlpha*=a;
  txt(ctx,'PLACES WORTH EXPLORING  /  '+String(scene.bucketList!.episode).padStart(3,'0'),100,105,28,accent);
  txt(ctx,scene.headline,95,755,d.mode==='title'?126:86,kit.textColor,false);
  if(scene.subheadline)txt(ctx,scene.subheadline,104,826,48,kit.textColor,false);
  ctx.restore();
 }else if(d.mode==='map'||d.composition==='lower'){
  shade(ctx,.72);ctx.save();ctx.globalAlpha*=a;
  txt(ctx,scene.bucketList!.country.toUpperCase()+'  /  '+String(d.chapter).padStart(2,'0'),100,765,24,accent);
  txt(ctx,scene.headline,100,835,64,kit.textColor);
  if(d.mode==='map')markers(ctx,project,d,t);
  ctx.restore();
 }
 // Discreet source credit; full license links and edit details in credits.html.
 const credit=d.mode==='map'?'MAP · OpenFreeMap / OpenMapTiles · © OpenStreetMap contributors':
  (d.videoGrid?'FOOTAGE · ':'PHOTO · ')+(scene.bucketList?.imageAuthor??'Wikimedia Commons')+' · '+(scene.bucketList?.imageLicense??'');
 ctx.fillStyle='rgba(16,43,59,.68)';ctx.fillRect(0,1030,1920,50);txt(ctx,credit,70,1062,19,'#FAFAF7',false,1780);
 ctx.restore();
}
export function renderDocumentaryShot(ctx:C,w:number,h:number,scene:OpenMotionScene,time:number,project:OpenMotionProject,getPhoto:(url:string)=>HTMLImageElement|null,layer:'image'|'text'){
 const d=scene.bucketList?.documentary;if(!d)return;
 if(d.series==='places-worth-exploring'||isTravelDocumentary(project)){travelShot(ctx,w,h,scene,time,project,getPhoto,layer);return;}
 const t=clamp(time/Math.max(.1,scene.durationSec)),mode=d.mode,diagram=diagramModes.has(mode)&&!(mode==='climate'&&scene.imageUrl);
 ctx.save();ctx.scale(w/1920,h/1080);
 if(layer==='image'){
  backdrop(ctx);
  if(mode==='map'){
   const map=getBucketListCanvas(project);if(map)ctx.drawImage(map,0,0,1920,1080);else txt(ctx,'GEOGRAPHIC MAP UNAVAILABLE',100,535,30,gold);
  }else if(diagram)drawDiagram(ctx,d,t);
  else if(scene.imageUrl){const im=getPhoto(scene.imageUrl);if(im&&im.naturalWidth)photo(ctx,im,t,d);else txt(ctx,'PHOTOGRAPH UNAVAILABLE',100,540,28,gold);}
  ctx.restore();return;
 }
 const a=smooth(time/Math.min(.6,scene.durationSec*.2));
 if(mode==='title'){
  shade(ctx,.88);ctx.save();ctx.globalAlpha*=a;txt(ctx,'GEOGRAPHICAL STORIES     /     01',100,110,27,gold);txt(ctx,scene.headline,95,710,118,paper,true);txt(ctx,scene.subheadline??'',103,790,48,gold,true);ctx.restore();
 }else if(mode==='end'){
  ctx.save();ctx.globalAlpha*=a;
  txt(ctx,'GEOGRAPHICAL STORIES',100,170,27,gold);txt(ctx,'Understanding our planet',100,430,78,paper,true);txt(ctx,'one place at a time.',100,515,52,gold,true);
  line(ctx,[[100,605],[850,605]],gold,2);txt(ctx,'NEXT EPISODE',100,660,23,muted);txt(ctx,'More landscapes. More geography.',100,720,35,paper);
  ctx.strokeStyle='rgba(240,237,228,.32)';ctx.lineWidth=2;ctx.strokeRect(1250,285,530,320);txt(ctx,'NEXT STORY',1290,345,20,gold);
  ctx.restore();
 }else if(diagram){
  ctx.save();ctx.globalAlpha*=a;txt(ctx,'GEOGRAPHICAL STORIES  /  '+String(d.chapter).padStart(2,'0'),100,95,22,gold);txt(ctx,scene.headline,100,195,62,paper,true);ctx.restore();
 }else if(mode==='map'){
  shade(ctx,.79);ctx.save();ctx.globalAlpha*=a;txt(ctx,scene.headline,100,818,56,paper,true);markers(ctx,project,d,t);ctx.restore();
 }else if(mode==='timeline'){
  shade(ctx,.9);ctx.save();ctx.globalAlpha*=a;txt(ctx,'1563',100,710,148,gold,true);txt(ctx,'Major eruption of Fogo',105,790,43,paper,true);ctx.restore();
 }else if(d.composition!=='clean'){
  shade(ctx,.75);ctx.save();ctx.globalAlpha*=a;txt(ctx,scene.headline,100,810,50,paper,true);ctx.restore();
 }else{
  // Clean photographic beats: no large overlay competing with the image.
  ctx.save();ctx.globalAlpha*=a;txt(ctx,'GEOGRAPHICAL STORIES',80,82,20,paper);ctx.restore();
 }
 footer(ctx,scene,d);ctx.restore();
}
