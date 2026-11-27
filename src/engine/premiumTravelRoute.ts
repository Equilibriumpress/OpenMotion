import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';
import type { Map as MapLibreMap } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE = 'https://tiles.openfreemap.org/styles/bright';
const ROUTER = 'https://router.project-osrm.org/route/v1/driving/';
const WIDTH = 1080, HEIGHT = 1920, CSS_W = 720, CSS_H = 1280;
const clamp = (n:number) => Math.max(0,Math.min(1,n));
const ease = (n:number) => { const t=clamp(n); return t*t*(3-2*t); };
const smoother = (n:number) => { const t=clamp(n); return t*t*t*(t*(t*6-15)+10); };
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
        if(p.chapter==='photo'||p.chapter==='opening')continue;
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
/**
 * Stabilized tracking point. Average nearby road samples on either side
 * of the indicator instead of following every OSRM vertex with the camera.
 * The moving dot itself always stays on the exact road geometry.
 */
function smoothRouteFocus(stage:Stage,fraction:number):Pt{
  const half=Math.min(.018,Math.max(.003,55/Math.max(1,stage.total)));
  const weights=[1,2,3,2,1];
  let x=0,y=0,n=0;
  weights.forEach((weight,index)=>{
    const point=sample(stage,clamp(fraction+(index-2)*half*.5));
    x+=point.x*weight;y+=point.y*weight;n+=weight;
  });
  return {x:x/n,y:y/n};
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
  ctx.shadowBlur=0;ctx.strokeStyle='#AE674A';ctx.lineWidth=7*s;ctx.stroke();
}

/**
 * A compact location indicator sits precisely on the projected road line.
 * Its direction-independent design avoids visible snapping at sharp bends.
 * The pulse uses scene time rather than timers, keeping exported frames exact.
 */
function movingDot(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,time:number){
  const pulse=.5+.5*Math.sin(time*7.2);
  const outer=(28+4*pulse)*s;
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle='rgba(216,73,54,'+(.12+.07*pulse)+')';
  ctx.beginPath();ctx.arc(0,0,outer,0,Math.PI*2);ctx.fill();
  ctx.shadowColor='rgba(30,62,55,.32)';
  ctx.shadowBlur=12*s;
  ctx.shadowOffsetY=3*s;
  ctx.fillStyle='#FFFFFF';
  ctx.beginPath();ctx.arc(0,0,20*s,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  ctx.fillStyle='#AE674A';
  ctx.beginPath();ctx.arc(0,0,13*s,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.48)';
  ctx.beginPath();ctx.arc(-4*s,-5*s,3*s,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

/** Look-ahead course smoothing for the optional small camper icon. */
function smoothedScreenBearing(stage:Stage,fraction:number):number {
  const lookAhead=Math.min(.055,Math.max(.004,35/Math.max(1,stage.total)));
  const before=sample(stage,Math.max(0,fraction-lookAhead));
  const after=sample(stage,Math.min(1,fraction+lookAhead));
  const dx=after.x-before.x,dy=after.y-before.y;
  return Math.hypot(dx,dy)<.01 ? sample(stage,fraction).angle : Math.atan2(dy,dx);
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
function editorialPhoto(ctx:CanvasRenderingContext2D,img:HTMLImageElement,w:number,h:number,t:number,focus:[number,number]=[.5,.5],fit:'cover'|'contain'='cover'){
  const zoom=1.015+.035*smoother(t);
  const k=Math.max(w/img.naturalWidth,h/img.naturalHeight)*zoom;
  const pw=img.naturalWidth*k,ph=img.naturalHeight*k;
  const x=Math.max(w-pw,Math.min(0,w*.5-pw*clamp(focus[0]))),y=Math.max(h-ph,Math.min(0,h*.48-ph*clamp(focus[1])));
  if(fit==='contain'){
    ctx.save();ctx.filter='blur(24px) brightness(.53)';ctx.drawImage(img,x-20,y-20,pw+40,ph+40);ctx.restore();
    const scale=Math.min(w*.94/img.naturalWidth,h*.64/img.naturalHeight);
    const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;
    ctx.drawImage(img,(w-iw)/2,h*.43-ih/2,iw,ih);
  }else ctx.drawImage(img,x,y,pw,ph);
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
  const index=Math.max(0,Math.min(p.stops.length-1,p.focusStopIndex));
  const stop=p.stops[index];
  const alternate=stop.secondaryPhoto;
  const useAlternate=!!alternate&&(p.openingSecondary||(p.editorial&&p.chapter==='photo'&&t>=.52));
  const alternateImage=useAlternate?getPhoto(alternate!.photoUrl):null;
  const photo=alternateImage?alternate!:stop;
  const img=alternateImage||getPhoto(stop.photoUrl);
  const shotTime=p.chapter==='photo'&&alternate?clamp(useAlternate?(t-.52)/.48:t/.52):t;
  if(img){
    if(p.editorial)editorialPhoto(ctx,img,w,h,shotTime,photo.photoFocus,photo.photoFit);
    else cover(ctx,img,0,0,w,h,t);
  }else scenicFallback(ctx,w,h);
  // A title fades in after the image appears and fades out before the next
  // shot. The underlying photo stays visible during the cross-dissolve.
  const titleIn=p.editorial?ease((time-.06)/.22):ease((time-.18)/.42);
  const titleOut=1-ease((time-(scene.durationSec-.42))/.42);
  ctx.save();ctx.globalAlpha*=titleIn*titleOut;
  const gradient=ctx.createLinearGradient(0,h*.22,0,h);
  gradient.addColorStop(0,'rgba(9,29,29,0)');
  gradient.addColorStop(.38,'rgba(9,29,29,.20)');
  gradient.addColorStop(1,'rgba(7,25,26,.94)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#F8F4E8';ctx.textAlign='left';
  ctx.font='700 '+(29*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText(p.seriesTitle??'SCOTLAND  /  THE OPEN ROAD',66*s,164*s,w-220*s);
  ctx.fillStyle='#E0C99C';ctx.font='700 '+(25*s)+'px "Plus Jakarta Sans",sans-serif';
  const lead=p.chapter==='opening'?'A JOURNEY BEGINS':'STOP '+String(index+1).padStart(2,'0')+' / '+String(p.stops.length).padStart(2,'0');
  ctx.fillText(p.chapter==='opening'?(p.regionTitle??lead):lead,66*s,h-700*s,w-220*s);
  ctx.fillStyle='#FFFFFF';
  const headline=p.editorial?scene.headline:(p.chapter==='opening'?'FROM CITY\nTO HIGHLANDS':stop.name.toUpperCase());
  ctx.font='400 '+(p.chapter==='opening'?85:104)*s+'px Georgia,serif';
  headline.split('\n').forEach((line,i)=>ctx.fillText(line,66*s,h-(575-i*96)*s,w-220*s));
  ctx.font='500 '+(38*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillStyle='#F3F3E9';
  const tagline=p.chapter==='opening'?'EDINBURGH TO THE ISLE OF SKYE':(alternateImage&&alternate?.label?alternate.label:stop.note);
  labelLines(ctx,tagline,70*s,h-410*s,w-230*s,49*s,2);
  ctx.font='500 '+(19*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillStyle='#DAE1DB';
  ctx.fillText(img?'PHOTO  '+photo.photoAuthor+'  ·  '+photo.photoLicense+'  ·  CROPPED':'ILLUSTRATED LANDSCAPE / PHOTO UNAVAILABLE',70*s,h-265*s,w-220*s);
  ctx.restore();
}
function drawMapScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number){
  const p=scene.premiumTravel!,stage=stages.get(scene),s=w/WIDTH,t=clamp(time/Math.max(.1,scene.durationSec));
  if(!stage||!p.roadMatched){
    ctx.fillStyle='#E6E9DF';ctx.fillRect(0,0,w,h);
    ctx.textAlign='center';ctx.fillStyle='#21493F';ctx.font='600 '+(36*s)+'px sans-serif';
    ctx.fillText('Preparing road map…',w/2,h/2);return;
  }
  const driving=p.chapter==='drive',finishing=p.chapter==='finale';
  const fraction=finishing?1:lerp(p.routeProgressFrom,p.routeProgressTo,smoother((t-.05)/.86));
  const car=sample(stage,fraction);

  // Lead the moving dot gently through bends and return to the destination
  // before the following photo. All positions are pure functions of time.
  const legSize=Math.max(0,p.routeProgressTo-p.routeProgressFrom);
  const ahead=driving ? legSize*.065*ease(t/.33)*(1-ease((t-.75)/.22)) : 0;
  const roadFocus=smoothRouteFocus(stage,clamp(fraction+ahead));
  const reveal=p.mapIntro?1:smoother(t/.73);
  const lastStop=stage.stops[stage.stops.length-1];
  const cameraFocus=finishing
    ? {x:lerp(lastStop.x,WIDTH/2,reveal),y:lerp(lastStop.y,HEIGHT/2,reveal)}
    : roadFocus;
  // Finale opens on the Portree stop and pulls back to the complete map.
  // Driving scenes start at the previous stop, track the road and ease back
  // slightly at arrival. Limit zoom to avoid blurry 2x raster enlargement.
  const zoom=finishing
    ? lerp(1.72,1,reveal)
    : 1.13+.16*smoother(t/.34)-.10*smoother((t-.70)/.30);
  const desiredX=w*.5,desiredY=h*.485;
  const panX=Math.max(w-w*zoom,Math.min(0,desiredX-cameraFocus.x*s*zoom));
  const panY=Math.max(h-h*zoom,Math.min(0,desiredY-cameraFocus.y*s*zoom));
  ctx.save();ctx.translate(panX,panY);ctx.scale(zoom,zoom);
  ctx.save();if(p.editorial)ctx.filter='saturate(.38) contrast(.91) brightness(1.035)';ctx.drawImage(stage.image,0,0,w,h);ctx.restore();
  // Muted base trace, followed by the much bolder travelled section.
  ctx.save();ctx.beginPath();
  stage.path.forEach((pt,i)=>i===0?ctx.moveTo(pt.x*s,pt.y*s):ctx.lineTo(pt.x*s,pt.y*s));
  ctx.strokeStyle='rgba(37,66,61,.40)';ctx.lineWidth=12*s;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore();
  routeStroke(ctx,stage,fraction,s);
  stage.stops.forEach((pt,i)=>{
    const x=pt.x*s,y=pt.y*s;
    ctx.fillStyle=i===p.focusStopIndex?'#AE674A':'#173D37';
    ctx.strokeStyle='#FFFDF7';ctx.lineWidth=3*s;
    ctx.beginPath();ctx.arc(x,y,19*s,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#FFFFFF';
    ctx.font='800 '+(19*s)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillText(String(i+1),x,y+1*s);
  });
  if(!finishing){
    // The standard premium reel uses a clear route position dot.
    // A smaller 2D camper remains available for user experimentation.
    if(p.markerStyle==='camper') {
      vehicle(ctx,car.x*s,car.y*s,smoothedScreenBearing(stage,fraction),.82*s);
    } else {
      movingDot(ctx,car.x*s,car.y*s,s,time);
    }
  }
  ctx.restore();
  // Scene titles are eased independently of the cartographic layer so two
  // captions do not stack over one another during an incoming cross-fade.
  const titlesIn=finishing?ease((time-(p.mapIntro?.15:.45))/.42):ease((time-.15)/.28);
  const titlesOut=finishing?1:1-ease((time-(scene.durationSec-.42))/.42);
  ctx.save();ctx.globalAlpha*=titlesIn*titlesOut;
  // Compact hierarchy, leaving the centre clear for the route and marker.
  const m=66*s;
  ctx.fillStyle='rgba(18,54,48,.94)';ctx.beginPath();ctx.roundRect(m,135*s,w-2*m-90*s,105*s,19*s);ctx.fill();
  ctx.textAlign='left';ctx.fillStyle='#FFFFFF';
  ctx.font='700 '+(29*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText(p.seriesTitle??'SCOTLAND / THE OPEN ROAD',m+27*s,184*s,w-2*m-54*s);
  ctx.font='500 '+(23*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillStyle='#D5E0D9';
  ctx.fillText(finishing?'THE COMPLETE ROUTE':'ON THE ROAD · '+String(p.focusStopIndex+1).padStart(2,'0')+' / '+p.stops.length,m+27*s,217*s,w-2*m-54*s);

  // Clear lower third with a single strong heading, no competing captions.
  const lower=ctx.createLinearGradient(0,h-760*s,0,h);
  lower.addColorStop(0,'rgba(11,34,32,0)');lower.addColorStop(1,'rgba(12,43,37,.92)');
  ctx.fillStyle=lower;ctx.fillRect(0,h-760*s,w,760*s);
  ctx.fillStyle='#E5C48B';ctx.font='700 '+(27*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText(finishing?(p.mapIntro?'THE JOURNEY':'ROUTE COMPLETE'):'NEXT STOP',m,h-525*s);
  ctx.fillStyle='#FFFFFF';
  const name=p.editorial?scene.headline:(finishing?'THE OPEN ROAD':p.stops[p.focusStopIndex]?.name??'HIGHLANDS');
  ctx.font='400 '+(finishing?83:92)*s+'px Georgia,serif';
  ctx.fillText(name,m,h-415*s,w-200*s);
  ctx.fillStyle='#E6F0E8';ctx.font='500 '+(30*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText(finishing?p.stops.map(stop=>stop.name).join(' · '):'ON THE ROAD',m,h-340*s,w-200*s);
  if(finishing&&p.cta){ctx.fillStyle='#E5C48B';ctx.font='700 '+(32*s)+'px sans-serif';ctx.fillText(p.cta,m,h-270*s,w-200*s);}
  ctx.restore();
  ctx.fillStyle='rgba(251,250,245,.93)';ctx.fillRect(0,h-61*s,w,61*s);
  ctx.textAlign='center';ctx.font='500 '+(21*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillStyle='#244C44';
  ctx.fillText('Map: OpenFreeMap / OpenMapTiles · © OpenStreetMap contributors',w/2,h-24*s,w-54*s);
}
export function renderPremiumTravelScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,getPhoto:(url:string)=>HTMLImageElement|null):void{
  const p=scene.premiumTravel!;
  ctx.save();
  if(p.chapter==='opening'||p.chapter==='photo')photoScene(ctx,w,h,scene,time,getPhoto);
  else drawMapScene(ctx,w,h,scene,time);
  // Frame boundaries are blended in the shared OpenMotion renderer.
  // Never darken this shot at its start or end.
  ctx.restore();
}
