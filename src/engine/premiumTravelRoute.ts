import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(workerUrl);
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
    const div=document.createElement('div');
    div.style.cssText='position:fixed;left:-5000px;top:0;width:720px;height:1280px;pointer-events:none;z-index:-1;';
    document.body.appendChild(div);
    let map:MapLibreMap|undefined;
    try{
      const first=scenes[0].premiumTravel!;
      map=new MapLibreMap({container:div,style:STYLE,center:first.mapCenter,zoom:first.mapZoom,interactive:false,attributionControl:false,fadeDuration:0,canvasContextAttributes:{preserveDrawingBuffer:true,antialias:false}});
      if(!map.loaded())await idle(map,'load');
      for(const scene of scenes){
        const p=scene.premiumTravel!;
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
function vehicle(ctx:CanvasRenderingContext2D,x:number,y:number,heading:number,s:number){
  ctx.save();ctx.translate(x,y);ctx.rotate(heading);ctx.scale(s,s);
  ctx.shadowColor='rgba(0,0,0,.3)';ctx.shadowBlur=16;
  ctx.fillStyle='#FCFAF0';ctx.strokeStyle='#1D3E36';ctx.lineWidth=3;
  ctx.beginPath();ctx.roundRect(-33,-17,67,34,9);ctx.fill();ctx.stroke();
  ctx.shadowBlur=0;ctx.fillStyle='#3B806C';ctx.beginPath();ctx.roundRect(-32,-17,64,14,7);ctx.fill();
  ctx.fillStyle='#D7EDE4';ctx.fillRect(6,-15,16,11);ctx.fillRect(-22,-15,16,11);
  ctx.fillStyle='#1D3E36';for(const wx of [-18,21]){ctx.beginPath();ctx.arc(wx,17,6,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}
function photoCover(ctx:CanvasRenderingContext2D,img:HTMLImageElement,x:number,y:number,w:number,h:number,t:number){
  const z=Math.max(w/img.naturalWidth,h/img.naturalHeight)*(1.04+.05*t);
  const rw=img.naturalWidth*z,rh=img.naturalHeight*z;
  ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,26);ctx.clip();ctx.drawImage(img,x+(w-rw)/2,y+(h-rh)/2,rw,rh);ctx.restore();
}
export function renderPremiumTravelScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,getPhoto:(url:string)=>HTMLImageElement|null):void{
  const premium=scene.premiumTravel!,stage=stages.get(scene),s=w/WIDTH,t=clamp(time/Math.max(.01,scene.durationSec));
  ctx.fillStyle='#E8E7DC';ctx.fillRect(0,0,w,h);
  if(!stage||!premium.roadMatched){ctx.textAlign='center';ctx.fillStyle='#254D46';ctx.font=(32*s)+'px sans-serif';ctx.fillText('Loading real roads and map…',w/2,h/2);return;}
  // Map and projected route share one deterministic camera transform.
  ctx.save();const zoom=1.012+.025*Math.sin(t*Math.PI);
  ctx.translate(w/2,h/2);ctx.scale(zoom,zoom);ctx.translate(-w/2+Math.sin(t*Math.PI)*10*s,-h/2);
  ctx.drawImage(stage.image,0,0,w,h);
  const driveT=premium.chapter==='drive'?ease(t/.57):ease(t);
  const frac=premium.chapter==='finale'?1:lerp(premium.routeProgressFrom,premium.routeProgressTo,driveT);
  routeStroke(ctx,stage,frac,s);
  stage.stops.forEach((p,i)=>{ctx.beginPath();ctx.arc(p.x*s,p.y*s,11*s,0,Math.PI*2);ctx.fillStyle=i===premium.focusStopIndex?'#E05243':'#FFF';ctx.fill();ctx.strokeStyle='#274D43';ctx.lineWidth=3*s;ctx.stroke();});
  if(premium.chapter!=='finale'){const car=sample(stage,frac);vehicle(ctx,car.x*s,car.y*s,car.angle,s*1.25);}
  ctx.restore();

  const m=54*s;
  ctx.fillStyle='#173D37';ctx.beginPath();ctx.roundRect(m,74*s,w-2*m,110*s,18*s);ctx.fill();
  ctx.fillStyle='#FFF9EE';ctx.textAlign='left';ctx.font='700 '+(28*s)+'px sans-serif';ctx.fillText('SCOTLAND  /  THE OPEN ROAD',m+27*s,120*s,w-2*m-54*s);
  ctx.fillStyle='#CADDD0';ctx.font=(20*s)+'px sans-serif';ctx.fillText('REAL ROADS  •  A82 & A87  •  FILM 01',m+27*s,154*s);

  if(premium.chapter==='opening'){
    const img=getPhoto(premium.stops[0].photoUrl);
    if(img&&t<.54){ctx.save();ctx.globalAlpha=1-ease((t-.19)/.35);photoCover(ctx,img,m,290*s,w-2*m,940*s,t);ctx.restore();}
    ctx.textAlign='left';ctx.fillStyle='#173D37';ctx.font='800 '+(74*s)+'px sans-serif';
    ctx.fillText('FROM CITY',m,h-370*s,w-2*m);ctx.fillText('TO HIGHLANDS',m,h-280*s,w-2*m);
    ctx.font=(28*s)+'px sans-serif';ctx.fillText('EDINBURGH  →  GLEN COE  →  SKYE',m,h-205*s,w-2*m);
  }
  if(premium.chapter==='drive'&&premium.focusStopIndex>=0){
    const stop=premium.stops[premium.focusStopIndex],img=getPhoto(stop.photoUrl),alpha=ease((t-.48)/.18);
    if(alpha>0){
      ctx.save();ctx.globalAlpha=alpha;
      const x=54*s,y=1025*s,pw=w-108*s,ph=790*s;
      ctx.fillStyle='#183D36';ctx.beginPath();ctx.roundRect(x,y,pw,ph,30*s);ctx.fill();
      if(img)photoCover(ctx,img,x+18*s,y+18*s,pw-36*s,428*s,t);
      ctx.textAlign='left';ctx.fillStyle='#E3C795';ctx.font='700 '+(25*s)+'px sans-serif';ctx.fillText('STOP 0'+(premium.focusStopIndex+1)+' / 04',x+40*s,y+502*s);
      ctx.fillStyle='#FFFFFF';ctx.font='800 '+(65*s)+'px sans-serif';ctx.fillText(stop.name.toUpperCase(),x+40*s,y+586*s,pw-80*s);
      ctx.font=(29*s)+'px sans-serif';ctx.fillStyle='#E4EFE6';
      const words=stop.note.split(' ');let lines:string[]=[],line='';
      for(const word of words){const candidate=line?line+' '+word:word;if(line&&ctx.measureText(candidate).width>pw-86*s){lines.push(line);line=word;}else line=candidate;}
      if(line)lines.push(line);lines.slice(0,2).forEach((text,i)=>ctx.fillText(text,x+40*s,y+(650+i*41)*s,pw-80*s));
      ctx.fillStyle='#BDD2CB';ctx.font=(19*s)+'px sans-serif';ctx.fillText('Photo: '+stop.photoAuthor+' • '+stop.photoLicense,x+40*s,y+757*s,pw-80*s);
      ctx.restore();
    }
  }
  if(premium.chapter==='finale'){
    ctx.fillStyle='#173D37';ctx.beginPath();ctx.roundRect(m,h-425*s,w-2*m,300*s,30*s);ctx.fill();
    ctx.textAlign='center';ctx.fillStyle='#FFF9ED';ctx.font='800 '+(78*s)+'px sans-serif';ctx.fillText('THE OPEN ROAD',w/2,h-322*s,w-2*m-24*s);
    ctx.font=(28*s)+'px sans-serif';ctx.fillText('Four stops. One Highland journey.',w/2,h-235*s,w-2*m-24*s);
    ctx.fillStyle='#CDDACC';ctx.fillText('EDINBURGH  →  ISLE OF SKYE',w/2,h-181*s);
  }
  ctx.fillStyle='rgba(250,248,242,.96)';ctx.fillRect(0,h-58*s,w,58*s);
  ctx.fillStyle='#234940';ctx.font=(19*s)+'px sans-serif';ctx.textAlign='center';
  ctx.fillText('OpenFreeMap © OpenMapTiles • © OpenStreetMap contributors',w/2,h-22*s,w-30*s);
}
