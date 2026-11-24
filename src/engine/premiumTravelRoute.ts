import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';
import type { Map as MapLibreMap } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE = 'https://tiles.openfreemap.org/styles/bright';
const ROUTER = 'https://router.project-osrm.org/route/v1/driving/';
const WIDTH = 1080, HEIGHT = 1920, CSS_W = 720, CSS_H = 1280;
const clamp = (n:number) => Math.max(0,Math.min(1,n));
const ease = (n:number) => { const t=clamp(n); return t*t*(3-2*t); };
const lerp = (a:number,b:number,t:number) => a+(b-a)*t;
interface Pt {x:number;y:number}
interface Stage { image:HTMLCanvasElement; path:Pt[]; stops:Pt[]; distances:number[]; total:number }
const stages = new WeakMap<OpenMotionScene,Stage>();
const pending = new WeakMap<OpenMotionProject,Promise<void>>();
const errors = new WeakMap<OpenMotionProject,string>();
export function getPremiumError(project:OpenMotionProject):string|undefined{return errors.get(project);}
function premiumScenes(project:OpenMotionProject){return project.scenes.filter(s=>s.layout==='premium-travel-route'&&s.premiumTravel);}
async function getRoadGeometry(scenes:OpenMotionScene[]) {
  const base=scenes[0].premiumTravel!;
  const stops=base.stops;
  if(stops.length<2)throw new Error('At least two road-trip stops are required.');
  if(base.roadMatched&&base.route.geometry.coordinates.length>20)return;
  // Limited one-time routing of the edited waypoints. No fabricated straight-line fallback.
  const path=stops.map(s=>s.lon+','+s.lat).join(';');
  const res=await fetch(ROUTER+path+'?overview=full&geometries=geojson&steps=false');
  if(!res.ok)throw new Error('Routing service unavailable ('+res.status+')');
  const result=await res.json() as {code?:string;routes?:{geometry:{coordinates:[number,number][];type:string};legs:{distance:number}[]}[]};
  const route=result.routes?.[0];
  if(result.code!=='Ok'||!route||route.geometry.type!=='LineString'||route.geometry.coordinates.length<20)throw new Error('No valid road-matched route available.');
  const total=route.legs.reduce((a,b)=>a+b.distance,0);
  if(total<=0||route.legs.length!==stops.length-1)throw new Error('Incomplete driving route.');
  const fractions=[0];let distance=0;
  for(const leg of route.legs){distance+=leg.distance;fractions.push(clamp(distance/total));}
  for(const scene of scenes){
    const pr=scene.premiumTravel!;
    pr.route={type:'Feature',geometry:{type:'LineString',coordinates:route.geometry.coordinates},properties:{source:'OSRM driving / OpenStreetMap',roadMatched:true,distanceKm:Math.round(total/1000)}};
    pr.roadMatched=true;
    if(pr.chapter==='opening'){pr.routeProgressFrom=0;pr.routeProgressTo=Math.min(.045,fractions[1]);}
    else if(pr.chapter==='finale'){pr.routeProgressFrom=0;pr.routeProgressTo=1;}
    else if(pr.chapter==='photo'){pr.routeProgressFrom=0;pr.routeProgressTo=0;}
    else {const idx=Math.max(1,Math.min(fractions.length-1,pr.focusStopIndex));pr.routeProgressFrom=fractions[idx-1];pr.routeProgressTo=fractions[idx];}
  }
}
async function idle(map:MapLibreMap,event:'load'|'idle'):Promise<void>{
  await Promise.race([new Promise<void>(resolve=>map.once(event,()=>resolve())),new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('MapLibre '+event+' timeout')),30000))]);
}
export function preparePremiumTravelProject(project:OpenMotionProject):Promise<void>{
  const scenes=premiumScenes(project);
  if(!scenes.length)return Promise.resolve();
  const existing=pending.get(project);if(existing)return existing;
  const job=(async()=>{
    await getRoadGeometry(scenes);
    const { Map: MapLibreConstructor, setWorkerUrl } = await import('maplibre-gl');
    setWorkerUrl(workerUrl);
    const div=document.createElement('div');
    div.style.cssText='position:fixed;left:-5000px;top:0;width:720px;height:1280px;pointer-events:none;z-index:-1;';
    document.body.appendChild(div);
    let map:MapLibreMap|undefined;
    try{
      const first=scenes[0].premiumTravel!;
      map=new MapLibreConstructor({container:div,style:STYLE,center:first.mapCenter,zoom:first.mapZoom,interactive:false,attributionControl:false,fadeDuration:0,canvasContextAttributes:{preserveDrawingBuffer:true,antialias:false}});
      if(!map.loaded())await idle(map,'load');
      for(const scene of scenes){
        const p=scene.premiumTravel!;
        if(p.chapter==='photo')continue;
        const loaded=idle(map,'idle');
        map.jumpTo({center:p.mapCenter,zoom:p.mapZoom,bearing:0,pitch:0});
        map.resize();map.triggerRepaint();
        await loaded;
        const image=document.createElement('canvas');image.width=WIDTH;image.height=HEIGHT;
        const c=image.getContext('2d');if(!c)throw new Error('Unable to capture vector basemap.');
        c.drawImage(map.getCanvas(),0,0,WIDTH,HEIGHT);
        const point=(lon:number,lat:number):Pt=>{const xy=map!.project([lon,lat]);return{x:xy.x*WIDTH/CSS_W,y:xy.y*HEIGHT/CSS_H};};
        const path=p.route.geometry.coordinates.map(([lon,lat])=>point(lon,lat));
        const stops=p.stops.map(s=>point(s.lon,s.lat));
        const distances=[0];let total=0;
        for(let i=1;i<path.length;i++){total+=Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y);distances.push(total);}
        // Use the same projected arclength as animation, so the vehicle arrives
        // exactly at each pin rather than finishing short of the destination.
        const stopFractions=stops.map(point=>{
          let nearest=0,best=Number.POSITIVE_INFINITY;
          for(let j=0;j<path.length;j++){
            const d=(path[j].x-point.x)**2+(path[j].y-point.y)**2;
            if(d<best){best=d;nearest=j;}
          }
          return total>0?distances[nearest]/total:0;
        });
        if(p.chapter==='drive'){
          const i=Math.max(1,Math.min(stops.length-1,p.focusStopIndex));
          p.routeProgressFrom=stopFractions[i-1];
          p.routeProgressTo=stopFractions[i];
        }
        stages.set(scene,{image,path,stops,distances,total});
      }
    }finally{map?.remove();div.remove();}
  })().catch(e=>{errors.set(project,String(e));throw e;});
  pending.set(project,job);return job;
}
function sample(stage:Stage,fraction:number){
  const target=clamp(fraction)*stage.total;let i=1;
  while(i<stage.distances.length-1&&stage.distances[i]<target)i++;
  const from=stage.path[i-1]??{x:0,y:0},to=stage.path[i]??from;
  const t=clamp((target-stage.distances[i-1])/Math.max(.001,stage.distances[i]-stage.distances[i-1]));
  return{x:lerp(from.x,to.x,t),y:lerp(from.y,to.y,t),angle:Math.atan2(to.y-from.y,to.x-from.x)};
}
function routeStroke(ctx:CanvasRenderingContext2D,stage:Stage,fraction:number,s:number){
  const target=clamp(fraction)*stage.total;
  ctx.beginPath();ctx.moveTo(stage.path[0].x*s,stage.path[0].y*s);
  for(let i=1;i<stage.path.length;i++){
    const a=stage.path[i-1],b=stage.path[i];
    if(stage.distances[i]<=target)ctx.lineTo(b.x*s,b.y*s);
    else {const t=clamp((target-stage.distances[i-1])/Math.max(.001,stage.distances[i]-stage.distances[i-1]));ctx.lineTo(lerp(a.x,b.x,t)*s,lerp(a.y,b.y,t)*s);break;}
  }
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.shadowColor='rgba(0,0,0,.26)';ctx.shadowBlur=15*s;
  ctx.strokeStyle='#FFFCF5';ctx.lineWidth=17*s;ctx.stroke();
  ctx.shadowBlur=0;ctx.strokeStyle='#D74936';ctx.lineWidth=8*s;ctx.stroke();
}

function vehicle(ctx:CanvasRenderingContext2D,x:number,y:number,angle:number,s:number){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(s,s);
  // Scalable camper illustration with high-contrast road silhouette.
  ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=13;ctx.shadowOffsetY=5;
  ctx.fillStyle='#FDF9EF';ctx.strokeStyle='#1E3A37';ctx.lineWidth=3;
  ctx.beginPath();ctx.roundRect(-40,-22,80,44,11);ctx.fill();ctx.stroke();
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  ctx.fillStyle='#287363';ctx.beginPath();ctx.roundRect(-38,-20,75,18,9);ctx.fill();
  ctx.fillStyle='#C8EBE8';ctx.fillRect(-27,-18,21,14);ctx.fillRect(13,-18,18,14);
  ctx.fillStyle='#1E3533';for(const dx of [-23,25]){ctx.beginPath();ctx.arc(dx,23,8,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#F7BC72';ctx.fillRect(36,-9,6,15);
  ctx.restore();
}
function cover(ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,w:number,h:number,t:number){
  const k=Math.max(w/img.naturalWidth,h/img.naturalHeight)*(1.04+.07*t);
  const pw=img.naturalWidth*k,ph=img.naturalHeight*k;
  const pan=(t-.5)*Math.min(40,w*.06);
  ctx.drawImage(img,x+(w-pw)/2+pan,y+(h-ph)/2,pw,ph);
}
function scenicFallback(ctx:CanvasRenderingContext2D,w:number,h:number){
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#7FA1A6');sky.addColorStop(.5,'#CED1B9');sky.addColorStop(1,'#77968B');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  for(const [y,color,shift] of [[.57,'#98B3A9',.3],[.72,'#597D70',1.2],[.86,'#2C534B',2.1]] as const){
    ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,h);
    ctx.lineTo(0,h*y);
    for(let i=0;i<=12;i++)ctx.lineTo(w*i/12,h*(y-.13*Math.abs(Math.sin(i*.81+shift))));
    ctx.lineTo(w,h);ctx.closePath();ctx.fill();
  }
}
function labelLines(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,width:number,lineHeight:number,maxLines=3){
  const words=text.split(/\s+/);let line='';const lines:string[]=[];
  for(const word of words){
    const next=line?line+' '+word:word;
    if(line&&ctx.measureText(next).width>width){lines.push(line);line=word;}else line=next;
  }
  if(line)lines.push(line);
  lines.slice(0,maxLines).forEach((v,i)=>ctx.fillText(v,x,y+i*lineHeight,width));
}
function photoScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,getPhoto:(url:string)=>HTMLImageElement|null){
  const p=scene.premiumTravel!,t=clamp(time/Math.max(.1,scene.durationSec)),s=w/WIDTH;
  const index=p.chapter==='opening'?0:Math.max(0,p.focusStopIndex);
  const stop=p.stops[index],img=getPhoto(stop.photoUrl);
  if(img)cover(ctx,img,0,0,w,h,t);else scenicFallback(ctx,w,h);
  const gradient=ctx.createLinearGradient(0,h*.22,0,h);
  gradient.addColorStop(0,'rgba(9,29,29,0)');
  gradient.addColorStop(.38,'rgba(9,29,29,.20)');
  gradient.addColorStop(1,'rgba(7,25,26,.94)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#F8F4E8';ctx.textAlign='left';
  ctx.font='700 '+(29*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText('SCOTLAND  /  THE OPEN ROAD',66*s,112*s,w-135*s);
  ctx.fillStyle='#E0C99C';ctx.font='700 '+(25*s)+'px "Plus Jakarta Sans",sans-serif';
  const lead=p.chapter==='opening'?'A JOURNEY BEGINS':'STOP '+String(index+1).padStart(2,'0')+' / '+String(p.stops.length).padStart(2,'0');
  ctx.fillText(lead,66*s,h-490*s,w-134*s);
  ctx.fillStyle='#FFFFFF';
  const headline=p.chapter==='opening'?'FROM CITY\nTO HIGHLANDS':stop.name.toUpperCase();
  ctx.font='800 '+(p.chapter==='opening'?104:100)*s+'px "Bricolage Grotesque",sans-serif';
  headline.split('\n').forEach((line,i)=>ctx.fillText(line,66*s,h-(385-i*115)*s,w-128*s));
  ctx.font='500 '+(38*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillStyle='#F3F3E9';
  const tagline=p.chapter==='opening'?'EDINBURGH TO THE ISLE OF SKYE':stop.note;
  labelLines(ctx,tagline,70*s,h-(p.chapter==='opening'?135:235)*s,w-143*s,56*s,p.chapter==='opening'?1:3);
  ctx.font='500 '+(19*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillStyle='#DAE1DB';
  ctx.fillText(img?'PHOTO  '+stop.photoAuthor+'  •  '+stop.photoLicense:'ILLUSTRATED LANDSCAPE / PHOTO UNAVAILABLE',70*s,h-103*s,w-140*s);
}
function drawMapScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number){
  const p=scene.premiumTravel!,stage=stages.get(scene),s=w/WIDTH,t=clamp(time/Math.max(.1,scene.durationSec));
  if(!stage||!p.roadMatched){
    ctx.fillStyle='#E6E9DF';ctx.fillRect(0,0,w,h);
    ctx.textAlign='center';ctx.fillStyle='#21493F';ctx.font='600 '+(36*s)+'px sans-serif';
    ctx.fillText('Preparing road map…',w/2,h/2);return;
  }
  const driving=p.chapter==='drive',finishing=p.chapter==='finale';
  const fraction=finishing?1:lerp(p.routeProgressFrom,p.routeProgressTo,ease(t));
  const car=sample(stage,fraction);
  const zoom=driving?1.66:finishing?1.02:1.28;
  // Camera follows the vehicle through the centre of the visible map,
  // constrained to the raster bounds so no empty map edges appear.
  const desiredX=driving?w*.49:w*.5;
  const desiredY=driving?h*.49:h*.5;
  const panX=Math.max(w-w*zoom,Math.min(0,desiredX-car.x*s*zoom));
  const panY=Math.max(h-h*zoom,Math.min(0,desiredY-car.y*s*zoom));
  ctx.save();ctx.translate(panX,panY);ctx.scale(zoom,zoom);
  ctx.drawImage(stage.image,0,0,w,h);
  // Muted base trace, followed by the much bolder travelled section.
  ctx.save();ctx.beginPath();
  stage.path.forEach((pt,i)=>i===0?ctx.moveTo(pt.x*s,pt.y*s):ctx.lineTo(pt.x*s,pt.y*s));
  ctx.strokeStyle='rgba(37,66,61,.40)';ctx.lineWidth=12*s;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore();
  routeStroke(ctx,stage,fraction,s);
  stage.stops.forEach((pt,i)=>{
    const x=pt.x*s,y=pt.y*s;
    ctx.fillStyle=i===p.focusStopIndex?'#D74735':'#173D37';
    ctx.strokeStyle='#FFFDF7';ctx.lineWidth=3*s;
    ctx.beginPath();ctx.arc(x,y,19*s,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#FFFFFF';
    ctx.font='800 '+(19*s)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillText(String(i+1),x,y+1*s);
  });
  if(!finishing)vehicle(ctx,car.x*s,car.y*s,car.angle,2.1*s);
  ctx.restore();
  // Compact hierarchy, leaving the centre clear for the route and camper.
  const m=52*s;
  ctx.fillStyle='rgba(18,54,48,.94)';ctx.beginPath();ctx.roundRect(m,65*s,w-2*m,105*s,19*s);ctx.fill();
  ctx.textAlign='left';ctx.fillStyle='#FFFFFF';
  ctx.font='700 '+(29*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText('SCOTLAND / THE OPEN ROAD',m+27*s,114*s,w-2*m-54*s);
  ctx.font='500 '+(23*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillStyle='#D5E0D9';
  ctx.fillText(finishing?'THE COMPLETE ROUTE':'ON THE ROAD · '+String(p.focusStopIndex+1).padStart(2,'0')+' / '+p.stops.length,m+27*s,147*s,w-2*m-54*s);

  // Clear lower third with a single strong heading, no competing captions.
  const lower=ctx.createLinearGradient(0,h-525*s,0,h);
  lower.addColorStop(0,'rgba(11,34,32,0)');lower.addColorStop(1,'rgba(12,43,37,.92)');
  ctx.fillStyle=lower;ctx.fillRect(0,h-525*s,w,525*s);
  ctx.fillStyle='#E5C48B';ctx.font='700 '+(27*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText(finishing?'ROUTE COMPLETE':'NEXT STOP',m,h-335*s);
  ctx.fillStyle='#FFFFFF';
  const name=finishing?'THE OPEN ROAD':p.stops[p.focusStopIndex]?.name.toUpperCase()??'HIGHLANDS';
  ctx.font='800 '+(finishing?92:90)*s+'px "Bricolage Grotesque",sans-serif';
  ctx.fillText(name,m,h-230*s,w-2*m);
  ctx.fillStyle='#E6F0E8';ctx.font='500 '+(30*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText(finishing?'Edinburgh · Glen Coe · Eilean Donan · Skye':'A SCENIC DRIVE THROUGH THE HIGHLANDS',m,h-155*s,w-2*m);
  ctx.fillStyle='rgba(251,250,245,.93)';ctx.fillRect(0,h-61*s,w,61*s);
  ctx.textAlign='center';ctx.font='500 '+(21*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillStyle='#244C44';
  ctx.fillText('Map: OpenFreeMap / OpenMapTiles · © OpenStreetMap contributors',w/2,h-24*s,w-54*s);
}
export function renderPremiumTravelScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,getPhoto:(url:string)=>HTMLImageElement|null):void{
  const p=scene.premiumTravel!,t=clamp(time/Math.max(.1,scene.durationSec));
  ctx.save();
  if(p.chapter==='opening'||p.chapter==='photo')photoScene(ctx,w,h,scene,time,getPhoto);
  else drawMapScene(ctx,w,h,scene,time);
  // Very brief editorial dip at cuts, without prolonged black frames.
  const fadeIn=clamp((.065-t)/.065);
  const fadeOut=clamp((t-.965)/.035);
  const alpha=Math.max(fadeIn,fadeOut);
  if(alpha>0){
    ctx.fillStyle='rgba(13,36,32,'+(alpha*.66)+')';ctx.fillRect(0,0,w,h);
  }
  ctx.restore();
}
