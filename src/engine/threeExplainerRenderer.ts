import * as THREE from 'three';
import type { OpenMotionScene } from '../types/openmotion';

const TAU=Math.PI*2;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{v=clamp(v);return v*v*(3-2*v)};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
type Config=NonNullable<OpenMotionScene['threeExplainer']>;
type Terrain=NonNullable<Config['terrain']>;
let renderer:THREE.WebGLRenderer|null=null;
let unavailable=false;
function getRenderer(){
  if(unavailable)return null;
  if(!renderer){try{
    renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:false});
    renderer.setPixelRatio(1);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.setClearColor(0x080f20);
  }catch{unavailable=true;return null;}}
  return renderer;
}
function rng(seed:number){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function lunarTexture(){
  const c=document.createElement('canvas');c.width=1024;c.height=512;
  const x=c.getContext('2d')!,r=rng(73),pixels=x.createImageData(c.width,c.height);
  for(let y=0;y<c.height;y++)for(let i=0;i<c.width;i++){
    const u=i/c.width*TAU,v=y/c.height*Math.PI;
    const n=145+20*Math.sin(5*u+Math.sin(7*v))*Math.sin(3*v)+13*Math.cos(13*u+8*v)+24*(r()-.5);
    const k=(y*c.width+i)*4;pixels.data[k]=n;pixels.data[k+1]=n;pixels.data[k+2]=n*.96;pixels.data[k+3]=255;
  }
  x.putImageData(pixels,0,0);
  for(let i=0;i<270;i++){
    const a=r()*c.width,b=r()*c.height,rad=2+Math.pow(r(),3)*29;
    const g=x.createRadialGradient(a-rad*.2,b-rad*.15,0,a,b,rad);
    g.addColorStop(0,'rgba(22,25,30,.24)');g.addColorStop(.7,'rgba(28,30,34,.16)');g.addColorStop(.87,'rgba(240,239,229,.27)');g.addColorStop(1,'rgba(0,0,0,0)');
    for(const shift of [-c.width,0,c.width]){
      x.save();x.translate(shift,0);x.fillStyle=g;x.beginPath();x.arc(a,b,rad,0,TAU);x.fill();x.restore();
    }
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
let moonStage:{world:THREE.Scene;camera:THREE.PerspectiveCamera;moon:THREE.Mesh}|null=null;
function getMoon(){
  if(moonStage)return moonStage;
  const world=new THREE.Scene();world.background=new THREE.Color(0x080f20);
  const camera=new THREE.PerspectiveCamera(38,1,.1,100);
  const moon=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),new THREE.MeshStandardMaterial({map:lunarTexture(),roughness:1}));
  world.add(moon);
  const sun=new THREE.DirectionalLight(0xffedcc,3.0);sun.position.set(6,0,0);world.add(sun);
  world.add(new THREE.AmbientLight(0x253650,.025));
  const r=rng(18),positions:number[]=[];
  for(let i=0;i<430;i++){
    const a=r()*TAU,b=r()*2-1,k=Math.sqrt(1-b*b),d=35;
    positions.push(d*k*Math.cos(a),d*b,d*k*Math.sin(a));
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  world.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xb7c9e6,size:.045,sizeAttenuation:true,transparent:true,opacity:.75})));
  moonStage={world,camera,moon};return moonStage;
}
function text(ctx:CanvasRenderingContext2D,s:string,x:number,y:number,size:number,color='#f2f5fa',weight=500,align:CanvasTextAlign='left'){
  ctx.font=weight+' '+size+'px Inter, Arial, sans-serif';ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(s,x,y);
}
function line(ctx:CanvasRenderingContext2D,points:number[][],color:string,width=2){
  if(points.length<2)return;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();
}
function circle(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,c:string){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()}
function panel(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number){
  ctx.fillStyle='rgba(12,23,42,.92)';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#31435e';ctx.lineWidth=1;ctx.strokeRect(x,y,w,h);
}
function heading(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,kicker:string,n:number,total:number,accent:string){
  text(ctx,kicker,80,62,20,accent,700);text(ctx,String(n+1).padStart(2,'0')+' / '+String(total).padStart(2,'0'),1840,62,20,'#a2b3c9',500,'right');
  ctx.fillStyle='#34435a';ctx.fillRect(80,94,1760,1);ctx.fillStyle=accent;ctx.fillRect(80,94,1760*(n+1)/total,3);
  text(ctx,scene.headline,80,161,56,'#f5f7fb',700);
  if(scene.subheadline)text(ctx,scene.subheadline,82,223,27,'#b3c3d6');
}
function orbitDiagram(ctx:CanvasRenderingContext2D,theta:number,eclipse=false){
  const x=450,y=550,r=220;
  panel(ctx,80,285,740,520);
  text(ctx,'VIEW FROM ABOVE',116,325,20,'#9bafc8',700);
  ctx.strokeStyle='#526783';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.stroke();
  circle(ctx,x,y,43,'#426ca8');text(ctx,'EARTH',x,y+65,21,'#b9d1f6',600,'center');
  const a=theta+Math.PI,mx=x+Math.cos(a)*r,my=y+Math.sin(a)*r;
  for(let i=0;i<3;i++){const yy=y-125+i*125;line(ctx,[[780,yy],[710,yy]],'#e5b46d',3);line(ctx,[[722,yy-7],[710,yy],[722,yy+7]],'#e5b46d',3)}
  text(ctx,'SUNLIGHT',735,375,18,'#e5b46d',600,'center');
  circle(ctx,mx,my,22,'#273346');ctx.fillStyle='#e3ded2';ctx.beginPath();ctx.arc(mx,my,22,-Math.PI/2,Math.PI/2);ctx.closePath();ctx.fill();
  line(ctx,[[x,y],[mx,my]],'#6f9ddc',3);
  if(eclipse){ctx.fillStyle='rgba(15,18,24,.75)';ctx.beginPath();ctx.moveTo(x-25,y-38);ctx.lineTo(112,y-60);ctx.lineTo(112,y+60);ctx.lineTo(x-25,y+38);ctx.closePath();ctx.fill();}
  text(ctx,'Not to scale',116,767,18,'#899ab0');
}
function moonAngle(shot:number,p:number){
  switch(shot){case 0:return mix(Math.PI*.83,Math.PI*.15,p);case 1:return mix(Math.PI,0,smooth(p));case 2:return Math.PI/2;case 3:return mix(Math.PI,0,smooth(p));case 4:return mix(Math.PI,Math.PI*3,smooth(p));case 5:return mix(Math.PI*1.25,Math.PI*1.68,p);case 6:return 0;default:return Math.PI*.36;}
}
function drawMoon(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,p:number,w:number,h:number){
  const shot=scene.threeExplainer!.shot,stage=getMoon(),r=getRenderer();
  const theta=moonAngle(shot,p);
  if(r){
    const small=shot>=2&&shot<=6, rw=Math.max(2,Math.round(w*(small?.48:.93))),rh=Math.max(2,Math.round(h*.58));
    r.setSize(rw,rh,false);stage.camera.aspect=rw/rh;stage.camera.updateProjectionMatrix();
    stage.camera.position.set(Math.cos(theta)*4.45,0,Math.sin(theta)*4.45);stage.camera.lookAt(0,0,0);
    r.render(stage.world,stage.camera);
    const dx=small?910:70,dw=small?930:1780;
    ctx.drawImage(r.domElement,dx,250,dw,630);
  }else text(ctx,'WebGL unavailable',960,520,36,'#d4dce8',600,'center');
  heading(ctx,scene,'ASTRONOMY / THE MOON',shot,8,'#e5b46d');
  if(shot>=2&&shot<=6)orbitDiagram(ctx,theta,shot===6);
  if(shot===0||shot===7){
    const horizon=ctx.createLinearGradient(0,730,0,1080);horizon.addColorStop(0,'rgba(8,15,32,0)');horizon.addColorStop(1,'#111a2b');ctx.fillStyle=horizon;ctx.fillRect(0,730,1920,350);
    text(ctx,shot===0?'ONE MOON. A DIFFERENT VIEW.':'SAME MOON. NEW ANGLE.',960,820,26,'#e5b46d',700,'center');
  }else if(shot===4){
    const illumination=(1+Math.cos(theta))/2;
    const phase=illumination<.08?'NEW MOON':illumination>.92?'FULL MOON':Math.abs(illumination-.5)<.12?(theta<Math.PI*2?'FIRST QUARTER':'LAST QUARTER'):'CRESCENT / GIBBOUS';
    text(ctx,phase,1375,819,28,'#e5b46d',700,'center');
  }else if(shot===5)text(ctx,'29.5 DAYS  /  ONE CYCLE',1375,819,28,'#e5b46d',700,'center');
  else if(shot===6)text(ctx,'A LUNAR ECLIPSE IS DIFFERENT',1375,819,24,'#e5b46d',700,'center');
}
const bounds=[6.62,45.66,7.22,46.14];
const checkpoints:[string,number,number][]=[['Chamonix',6.8694,45.9237],['Les Houches',6.798,45.89],['Saint-Gervais',6.712,45.892],['Les Contamines',6.728,45.822],['Col du Bonhomme',6.708,45.734],['Les Chapieux',6.735,45.697],['Col de la Seigne',6.807,45.751],['Courmayeur',6.969,45.796],['Grand Col Ferret',7.077,45.891],['La Fouly',7.098,45.933],['Champex-Lac',7.116,46.03],['Trient',6.994,46.056],['Vallorcine',6.933,46.032],['La Flégère',6.887,45.959],['Chamonix',6.8694,45.9237]];
function terrainPoint(lon:number,lat:number,d:Terrain){
  const u=clamp((lon-bounds[0])/(bounds[2]-bounds[0])),v=clamp((bounds[3]-lat)/(bounds[3]-bounds[1]));
  const x=u*(d.cols-1),y=v*(d.rows-1),i=Math.min(d.cols-2,Math.floor(x)),j=Math.min(d.rows-2,Math.floor(y));
  const a=d.heights[j*d.cols+i],b=d.heights[j*d.cols+i+1],c=d.heights[(j+1)*d.cols+i],e=d.heights[(j+1)*d.cols+i+1];
  return {x:(u-.5)*8,z:(v-.5)*9,y:mix(mix(a,b,x-i),mix(c,e,x-i),y-j)/1000*.62};
}
let terrainStage:{world:THREE.Scene;camera:THREE.PerspectiveCamera;sun:THREE.DirectionalLight;route:THREE.Line;data:Terrain}|null=null;
function getTerrain(d:Terrain){
  if(terrainStage)return terrainStage;
  const world=new THREE.Scene();world.background=new THREE.Color(0x080f20);
  const camera=new THREE.PerspectiveCamera(39,1,.1,100);
  const geo=new THREE.PlaneGeometry(8,9,d.cols-1,d.rows-1);geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position,colors:number[]=[];
  for(let i=0;i<pos.count;i++){
    const v=d.heights[i];pos.setY(i,v/1000*.62);
    const t=clamp((v-1000)/3000),color=new THREE.Color(0x253b50).lerp(new THREE.Color(0xd7e2ea),t);
    colors.push(color.r,color.g,color.b);
  }
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  world.add(new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide})));
  const points:THREE.Vector3[]=[];
  for(let i=1;i<checkpoints.length;i++){
    const a=checkpoints[i-1],b=checkpoints[i];
    for(let k=0;k<32;k++){const f=k/32,q=terrainPoint(mix(a[1],b[1],f),mix(a[2],b[2],f),d);points.push(new THREE.Vector3(q.x,q.y+.065,q.z))}
  }
  const last=terrainPoint(checkpoints[0][1],checkpoints[0][2],d);points.push(new THREE.Vector3(last.x,last.y+.065,last.z));
  const route=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0xff833d,depthTest:false}));
  route.renderOrder=10;world.add(route);
  const sun=new THREE.DirectionalLight(0xffe6c6,2.4);sun.position.set(-5,7,3);world.add(sun);
  world.add(new THREE.HemisphereLight(0xb9d7ff,0x151b26,1.3));
  terrainStage={world,camera,sun,route,data:d};return terrainStage;
}
function schematic(ctx:CanvasRenderingContext2D,p:number){
  const points=checkpoints.map((c)=>[420+(c[1]-bounds[0])/(bounds[2]-bounds[0])*1080,330+(bounds[3]-c[2])/(bounds[3]-bounds[1])*455]);
  line(ctx,points,'#283a53',5);line(ctx,points.slice(0,Math.max(2,Math.ceil(points.length*p))),'#ff833d',5);
  for(let i=0;i<points.length-1;i++){circle(ctx,points[i][0],points[i][1],5,'#ffb17a');if([0,5,7,10,12].includes(i))text(ctx,checkpoints[i][0],points[i][0]+12,points[i][1]-14,18,'#e4edf7')}
  text(ctx,'Schematic checkpoints / terrain unavailable',960,835,22,'#a5b5c9',500,'center');
}
function profile(ctx:CanvasRenderingContext2D,d:Terrain|undefined,p:number){
  panel(ctx,100,300,1720,505);
  if(!d){text(ctx,'Elevation data unavailable',960,550,36,'#c7d4e5',600,'center');return}
  const values=checkpoints.map(c=>terrainPoint(c[1],c[2],d).y/.62*1000);
  for(const z of [0,1000,2000,3000,4000]){
    const y=745-z*.09;line(ctx,[[200,y],[1750,y]],'#34435a',1);text(ctx,z+' m',175,y,19,'#9aacc2',500,'right');
  }
  const points=values.map((z,i)=>[220+i*1500/(values.length-1),745-z*.09]);
  line(ctx,points,'#35445c',4);line(ctx,points.slice(0,Math.max(2,Math.ceil(points.length*p))),'#ff833d',7);
  for(let i=0;i<points.length-1;i++)if([0,5,7,10,12].includes(i))text(ctx,checkpoints[i][0],points[i][0],points[i][1]-22,17,'#e5edf6',500,'center');
  text(ctx,'Checkpoint elevations only / not a measured race profile',960,830,23,'#a5b5c9',500,'center');
}
function comparison(ctx:CanvasRenderingContext2D,p:number){
  const items=[['UTMB cumulative ascent',10000,'#ff833d'],['Everest elevation',8849,'#b8c9dd']] as const;
  items.forEach(([label,n,c],i)=>{const x=490+i*650,y=750,hh=n/10000*380*smooth(p);ctx.fillStyle=c;ctx.fillRect(x,y-hh,265,hh);text(ctx,Math.round(n*smooth(p)).toLocaleString('en-US')+' m',x+132,y-hh-32,40,c,700,'center');text(ctx,label,x+132,795,25,'#d9e3ef',600,'center')});
}
function drawTerrain(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,p:number,w:number,h:number){
  const cfg=scene.threeExplainer!,shot=cfg.shot,d=cfg.terrain,r=getRenderer();
  if(shot===2)profile(ctx,d,smooth(p));
  else if(shot===3)comparison(ctx,p);
  else if(shot===5){
    const x=160,y=445,ww=1600,hh=86;
    text(ctx,'2025 STARTERS',x,360,24,'#a5b5c9',700);text(ctx,'2,492',x,410,50,'#f4f6fb',700);
    ctx.fillStyle='#354b61';ctx.fillRect(x,y,ww,hh);ctx.fillStyle='#ff833d';ctx.fillRect(x+ww*1663/2492,y,ww*829/2492*smooth(p),hh);
    text(ctx,'1,663 finished',x,y+155,35,'#d4e2f1',600);text(ctx,'829 did not finish',x+ww,y+155,35,'#ff9b61',600,'right');
    text(ctx,'About one in three',960,740,48,'#ff9b61',700,'center');
  }else if(d&&r&&d.heights.length===d.cols*d.rows&&d.cols>1&&d.rows>1){
    const stage=getTerrain(d);
    const a=mix(-.8,.4,smooth(p))+shot*.23;
    stage.camera.position.set(Math.sin(a)*10,7.9+Math.sin(p*Math.PI)*.8,Math.cos(a)*10);stage.camera.lookAt(0,.9,0);
    const t=shot===4?Math.cos(p*TAU):1;
    stage.sun.position.set(mix(-7,7,p),Math.max(.4,6*t),4);
    stage.sun.intensity=shot===4?mix(.15,2.8,clamp((t+1)/2)):2.4;
    stage.route.geometry.setDrawRange(0,shot===1?Math.max(2,Math.floor(stage.route.geometry.attributes.position.count*smooth(p))):stage.route.geometry.attributes.position.count);
    r.setSize(Math.round(w),Math.max(2,Math.round(h*.65)),false);stage.camera.aspect=r.domElement.width/r.domElement.height;stage.camera.updateProjectionMatrix();r.render(stage.world,stage.camera);
    ctx.drawImage(r.domElement,0,255,1920,700);
    text(ctx,'AWS TERRARIUM DEM  /  SCHEMATIC CHECKPOINT CONNECTION',80,837,19,'#bac8da',600);
  }else schematic(ctx,shot===1?smooth(p):1);
  heading(ctx,scene,'ALPINE ENDURANCE / UTMB',shot,7,'#ff833d');
}
export function renderThreeExplainer(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,localTime:number){
  ctx.save();ctx.scale(w/1920,h/1080);ctx.fillStyle='#080f20';ctx.fillRect(0,0,1920,1080);
  const p=clamp(localTime/Math.max(.5,scene.durationSec));
  try{if(scene.threeExplainer?.kind==='moon')drawMoon(ctx,scene,p,w,h);else drawTerrain(ctx,scene,p,w,h)}
  catch(e){ctx.fillStyle='#080f20';ctx.fillRect(0,0,1920,1080);text(ctx,scene.headline,960,470,52,'#f3f5fa',700,'center');text(ctx,'3D scene unavailable in this browser',960,550,28,'#9aacc2',500,'center')}
  ctx.restore();
}
