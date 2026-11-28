import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';
import type { Map as MapLibreMap } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import {loadSignatureElevation,type SignatureElevation} from './premiumTravelElevation';

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
const elevations=new WeakMap<OpenMotionScene,SignatureElevation>();
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
  const waypoints:[number,number][]=[];const stopIndices:number[]=[];
  stops.forEach((s,i)=>{stopIndices.push(waypoints.length);waypoints.push([s.lon,s.lat]);for(const group of base.routeVia??[])if(group.afterStop===i)waypoints.push(...group.coordinates);});
  if(base.closeLoop)waypoints.push([stops[0].lon,stops[0].lat]);
  const path=waypoints.map(([lon,lat])=>lon+','+lat).join(';');
  const res=await fetch(ROUTER+path+'?overview=full&geometries=geojson&steps=false');
  if(!res.ok)throw new Error('Routing service unavailable ('+res.status+')');
  const result=await res.json() as {code?:string;routes?:{geometry:{coordinates:[number,number][];type:string};legs:{distance:number}[]}[]};
  const route=result.routes?.[0];
  if(result.code!=='Ok'||!route||route.geometry.type!=='LineString'||route.geometry.coordinates.length<20)throw new Error('No valid road-matched route available.');
  if(base.closeLoop){const c=route.geometry.coordinates,first=c[0],last=c[c.length-1];if(Math.hypot(first[0]-last[0],first[1]-last[1])>.02)throw Error('Closed route did not return to start');}
  const total=route.legs.reduce((a,b)=>a+b.distance,0);
  if(total<=0||route.legs.length!==waypoints.length-1)throw new Error('Incomplete driving route.');
  const waypointFractions=[0];let distance=0;
  for(const leg of route.legs){distance+=leg.distance;waypointFractions.push(clamp(distance/total));}
  const fractions=stopIndices.map(i=>waypointFractions[i]);
  for(const scene of scenes){
    const pr=scene.premiumTravel!;
    pr.route={type:'Feature',geometry:{type:'LineString',coordinates:route.geometry.coordinates},properties:{source:'OSRM driving / OpenStreetMap',roadMatched:true,distanceKm:Math.round(total/1000)}};
    pr.roadMatched=true;
    if(pr.chapter==='opening'){pr.routeProgressFrom=0;pr.routeProgressTo=Math.min(.045,fractions[1]);}
    else if(pr.chapter==='finale'){pr.routeProgressFrom=pr.closeLoop&&!pr.mapIntro?fractions[fractions.length-1]:0;pr.routeProgressTo=1;}
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
    const signature=scenes.some(s=>(s.premiumTravel?.editorialRevision??0)>=9),route=scenes[0].premiumTravel!;
    const elevationJob=signature?loadSignatureElevation(route.route.geometry.coordinates,route.stops.map(s=>[s.lon,s.lat] as [number,number]),route.closeLoop?9:11):Promise.resolve(null);
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
      if(scenes.some(scene=>scene.premiumTravel?.editorial)){
        // Keep geographic place names, hide navigation clutter and POI icons.
        for(const layer of map.getStyle().layers??[]){
          if(layer.type!=='symbol')continue;
          const sourceLayer='source-layer' in layer?String(layer['source-layer']):'';
          if(!/place/i.test(sourceLayer+' '+layer.id))map.setLayoutProperty(layer.id,'visibility','none');
        }
      }
      if(scenes.some(scene=>scene.premiumTravel?.relief)){
        map.addSource('ptr-terrain',{type:'raster-dem',tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],tileSize:256,maxzoom:15,encoding:'terrarium',attribution:'Mapzen Terrain Tiles / AWS Open Data'});
        const layers=map.getStyle().layers??[];
        const before=layers.find(layer=>layer.type==='line'||layer.type==='symbol')?.id;
        map.addLayer({id:'ptr-hillshade',type:'hillshade',source:'ptr-terrain',paint:{'hillshade-exaggeration':signature ? .55 : .42,'hillshade-shadow-color':'#526455','hillshade-highlight-color':'#fff4d9','hillshade-accent-color':'#a3aa91'}},before);
        for(const layer of layers){
          const sourceLayer='source-layer' in layer?String(layer['source-layer']):'';
          if(layer.type==='fill'&&sourceLayer==='water')map.setPaintProperty(layer.id,'fill-color','#a8c4cc');
          if(layer.type==='background')map.setPaintProperty(layer.id,'background-color','#eee9db');
        }
      }
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
        const stopFractions=stops.map((point,index)=>{
          if(p.closeLoop&&index===0)return 0;
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
        }else if(p.closeLoop&&p.chapter==='finale'&&!p.mapIntro){p.routeProgressFrom=stopFractions[stopFractions.length-1];p.routeProgressTo=1;}
        stages.set(scene,{image,path,stops,distances,total});
      }
    }finally{map?.remove();div.remove();}
    const elevation=await elevationJob;if(elevation)for(const scene of scenes)elevations.set(scene,elevation);
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
function editorialPhoto(ctx:CanvasRenderingContext2D,img:HTMLImageElement,w:number,h:number,t:number,focus:[number,number]=[.5,.5],fit:'cover'|'contain'='cover',motion=.035){
  const zoom=1.015+motion*smoother(t);
  const k=Math.max(w/img.naturalWidth,h/img.naturalHeight)*zoom;
  const pw=img.naturalWidth*k,ph=img.naturalHeight*k;
  const x=Math.max(w-pw,Math.min(0,w*.5-pw*clamp(focus[0]))),y=Math.max(h-ph,Math.min(0,h*.48-ph*clamp(focus[1])));
  if(fit==='contain'){
    ctx.fillStyle='#142C27';ctx.fillRect(0,0,w,h);
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
// Feathered optical foreground treatment, not a segmented 3D reconstruction.
let signatureForeground:HTMLCanvasElement|undefined;
function signatureOptics(ctx:CanvasRenderingContext2D,img:HTMLImageElement,w:number,h:number,t:number,focus:[number,number]|undefined,fit:'cover'|'contain'|undefined,mode:'light'|'haze'|'water'|undefined,depth:boolean){
 if(fit==='contain')return;
 if(depth){signatureForeground??=document.createElement('canvas');const layer=signatureForeground;if(layer.width!==w||layer.height!==h){layer.width=w;layer.height=h;}
 const c=layer.getContext('2d');if(c){c.clearRect(0,0,w,h);editorialPhoto(c,img,w,h,t,focus,fit,.048);c.save();c.globalCompositeOperation='destination-in';const mask=c.createLinearGradient(0,h*.50,0,h*.80);mask.addColorStop(0,'rgba(0,0,0,0)');mask.addColorStop(1,'rgba(0,0,0,1)');c.fillStyle=mask;c.fillRect(0,0,w,h);c.restore();ctx.save();ctx.globalAlpha*=.22;ctx.drawImage(layer,0,0);ctx.restore();}}
 if(!mode)return;ctx.save();const x=w*(.28+.38*t),y=h*(mode==='water'?.74:mode==='haze'?.32:.16);
 const glow=ctx.createRadialGradient(x,y,0,x,y,w*.70);glow.addColorStop(0,mode==='haze'?'rgba(216,229,224,.075)':mode==='water'?'rgba(170,220,218,.055)':'rgba(255,224,177,.065)');glow.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);ctx.restore();
}
function signatureProfile(ctx:CanvasRenderingContext2D,p:SignatureElevation|undefined,x:number,y:number,w:number,h:number,s:number,fraction:number){
 if(!p||p.values.length<2)return;const v=p.values,min=Math.floor(Math.min(...v)/100)*100,max=Math.max(min+100,Math.ceil(Math.max(...v)/100)*100);
 const px=(i:number)=>x+i/(v.length-1)*w,py=(a:number)=>y+h-(a-min)/(max-min)*h;
 ctx.save();ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='600 '+(19*s)+'px sans-serif';ctx.fillStyle='#DCE7DE';ctx.fillText('ROUTE ELEVATION · DEM EST.',x,y-15*s,w*.70);ctx.textAlign='right';ctx.fillText(max+' m',x+w,y-15*s);
 const grad=ctx.createLinearGradient(0,y,0,y+h);grad.addColorStop(0,'rgba(174,199,177,.45)');grad.addColorStop(1,'rgba(174,199,177,.04)');
 ctx.beginPath();v.forEach((a,i)=>i?ctx.lineTo(px(i),py(a)):ctx.moveTo(px(i),py(a)));ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
 ctx.beginPath();v.forEach((a,i)=>i?ctx.lineTo(px(i),py(a)):ctx.moveTo(px(i),py(a)));ctx.strokeStyle='#C8DEC9';ctx.lineWidth=2.5*s;ctx.stroke();
 const i=clamp(fraction)*(v.length-1),lo=Math.floor(i),hi=Math.min(v.length-1,lo+1),xx=px(i),yy=py(lerp(v[lo],v[hi],i-lo));ctx.strokeStyle='rgba(226,196,143,.55)';ctx.lineWidth=s;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx,y+h);ctx.stroke();ctx.fillStyle='#E2C48F';ctx.beginPath();ctx.arc(xx,yy,7*s,0,Math.PI*2);ctx.fill();ctx.textAlign='left';ctx.fillStyle='#DCE7DE';ctx.fillText(min+' m',x,y+h+24*s);ctx.restore();
}
function signatureCompass(ctx:CanvasRenderingContext2D,w:number,s:number){
 ctx.save();ctx.translate(w-76*s,310*s);ctx.strokeStyle='#36564D';ctx.fillStyle='#36564D';ctx.lineWidth=2*s;ctx.beginPath();ctx.arc(0,0,28*s,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-19*s);ctx.lineTo(-7*s,9*s);ctx.lineTo(0,4*s);ctx.lineTo(7*s,9*s);ctx.closePath();ctx.fill();ctx.font='700 '+(20*s)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillText('N',0,-38*s);ctx.restore();
}
function signatureFinale(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,stage:Stage,time:number){
 const p=scene.premiumTravel!,s=w/WIDTH,m=70*s,alpha=ease((time-(p.closeLoop?1.70:1.10))/.48);if(alpha<=0)return;ctx.save();ctx.globalAlpha*=alpha;
 ctx.fillStyle='#173D37';ctx.fillRect(0,0,w,h);ctx.save();ctx.globalAlpha*=.13;ctx.drawImage(stage.image,0,0,w,h);ctx.restore();
 ctx.strokeStyle='rgba(226,196,143,.48)';ctx.lineWidth=2*s;ctx.strokeRect(m,125*s,w-2*m-70*s,h-350*s);
 ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#E2C48F';ctx.font='700 '+(26*s)+'px sans-serif';ctx.fillText(p.seriesTitle??'THE OPEN ROAD COLLECTION',m+28*s,205*s,w-2*m-110*s);
 ctx.fillStyle='#F8F7EF';ctx.font='400 '+(90*s)+'px Georgia,serif';ctx.fillText(p.regionTitle??'THE OPEN ROAD',m+28*s,340*s,w-2*m-110*s);
 const pts=stage.path;let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;for(const q of [...pts,...stage.stops]){minX=Math.min(minX,q.x);maxX=Math.max(maxX,q.x);minY=Math.min(minY,q.y);maxY=Math.max(maxY,q.y);}
 const bw=w-2*m-190*s,bh=630*s,k=Math.min(bw/Math.max(1,maxX-minX),bh/Math.max(1,maxY-minY)),ox=m+55*s+(bw-(maxX-minX)*k)/2-minX*k,oy=445*s+(bh-(maxY-minY)*k)/2-minY*k;
 ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(ox+q.x*k,oy+q.y*k):ctx.moveTo(ox+q.x*k,oy+q.y*k));ctx.strokeStyle='#E2C48F';ctx.lineWidth=5*s;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();
 stage.stops.forEach((q,i)=>{const x=ox+q.x*k,y=oy+q.y*k;ctx.beginPath();ctx.arc(x,y,17*s,0,Math.PI*2);ctx.fillStyle='#AE674A';ctx.fill();ctx.strokeStyle='#F8F7EF';ctx.lineWidth=2*s;ctx.stroke();ctx.fillStyle='#fff';ctx.font='700 '+(20*s)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),x,y);});
 ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='500 '+(28*s)+'px sans-serif';ctx.fillStyle='#F8F7EF';p.stops.forEach((stop,i)=>ctx.fillText(String(i+1).padStart(2,'0')+'  '+stop.name,m+28*s+(i%2)*380*s,1165*s+Math.floor(i/2)*(p.stops.length>4?48:58)*s,365*s));
 signatureProfile(ctx,elevations.get(scene),m+28*s,(p.stops.length>4?1390:1350)*s,w-2*m-130*s,(p.stops.length>4?88:116)*s,s,1);ctx.fillStyle='#E2C48F';ctx.font='700 '+(39*s)+'px sans-serif';ctx.fillText(p.cta??'SAVE THIS ROAD TRIP',m+28*s,h-265*s,w-2*m-110*s);ctx.restore();
}
function photoScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,getPhoto:(url:string)=>HTMLImageElement|null,titleWeight=1,captionTime=time){
  const p=scene.premiumTravel!,t=clamp(time/Math.max(.1,scene.durationSec)),s=w/WIDTH;
  const index=!p.editorial&&p.chapter==='opening'?0:Math.max(0,Math.min(p.stops.length-1,p.focusStopIndex));
  const stop=p.stops[index];
  const alternate=p.chapter==='opening'&&p.openingPhoto?p.openingPhoto:stop.secondaryPhoto;
  const slow=(p.editorialRevision??0)>=8&&p.chapter==='photo';
  const useAlternate=!!alternate&&!slow&&((p.chapter==='opening'&&!!p.openingPhoto)||p.openingSecondary||(p.editorial&&p.chapter==='photo'&&t>=.52));
  const r7=(p.editorialRevision??0)>=7;
  const primary=getPhoto(stop.photoUrl);
  const secondary=alternate?getPhoto(alternate.photoUrl):null;
  const alternateImage=(useAlternate||(r7&&!primary))?secondary:null;
  const photo=alternateImage?alternate!:stop;
  const img=alternateImage||primary;
  const shotTime=!slow&&p.chapter==='photo'&&alternate?clamp(useAlternate?(t-.52)/.48:t/.52):t;
  if(r7&&!slow&&p.chapter==='photo'&&primary&&secondary&&alternate&&Math.abs(time-scene.durationSec*.52)<.15){
    const u=smoother((time-scene.durationSec*.52+.15)/.30);
    ctx.save();ctx.filter=p.regionTitle==='DOLOMITES'?'saturate(.96) contrast(1.045) brightness(1.015) sepia(.035)':'saturate(.91) contrast(1.035) brightness(.99)';
    editorialPhoto(ctx,primary,w,h,clamp(t/.52),stop.photoFocus,stop.photoFit,.065);
    ctx.save();ctx.beginPath();ctx.rect(w*(1-u),0,w*u,h);ctx.clip();
    editorialPhoto(ctx,secondary,w,h,clamp((t-.52)/.48),alternate.photoFocus,alternate.photoFit,.065);
    ctx.restore();ctx.restore();
  }else if(img){
    if(p.editorial){ctx.save();if((p.editorialRevision??0)>=6)ctx.filter=p.regionTitle==='DOLOMITES'&&(p.editorialRevision??0)>=9?'saturate(.96) contrast(1.045) brightness(1.015) sepia(.035)':'saturate(.91) contrast(1.035) brightness(.99)';editorialPhoto(ctx,img,w,h,r7&&(!primary||!secondary)?t:shotTime,photo.photoFocus,photo.photoFit,slow?.035:r7?(p.chapter==='opening'?.105:.065):.035);ctx.restore();}
    else cover(ctx,img,0,0,w,h,t);
    if((p.editorialRevision??0)>=9)signatureOptics(ctx,img,w,h,t,photo.photoFocus,photo.photoFit,p.signatureAtmosphere,Boolean(p.signatureDepth));
  }else if(r7){ctx.fillStyle='#173D37';ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff';ctx.font=`${34*s}px sans-serif`;ctx.textAlign='center';ctx.fillText('Photo unavailable',w/2,h/2);}else scenicFallback(ctx,w,h);
  // A title fades in after the image appears and fades out before the next
  // shot. The underlying photo stays visible during the cross-dissolve.
  const titleIn=slow?ease((captionTime-.4)/.30):r7?ease((time-.06)/.32):(p.editorialRevision??0)>=6?(.75+.25*ease(time/.16)):p.editorial?ease((time-.06)/.22):ease((time-.18)/.42);
  const titleOut=r7?1-ease((time-(scene.durationSec-.25))/.25):(p.editorialRevision??0)>=6?1:1-ease((time-(scene.durationSec-.42))/.42);
  ctx.save();if(!slow)ctx.globalAlpha*=titleIn*titleOut*titleWeight;
  const gradient=ctx.createLinearGradient(0,h*.22,0,h);
  gradient.addColorStop(0,'rgba(9,29,29,0)');
  gradient.addColorStop(.38,'rgba(9,29,29,.20)');
  gradient.addColorStop(1,'rgba(7,25,26,.94)');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  if(slow)ctx.globalAlpha*=titleIn*titleOut*titleWeight;
  ctx.fillStyle='#F8F4E8';ctx.textAlign='left';
  ctx.font='700 '+(29*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText(p.seriesTitle??'SCOTLAND  /  THE OPEN ROAD',66*s,164*s,w-220*s);
  ctx.fillStyle='#E0C99C';ctx.font='700 '+(25*s)+'px "Plus Jakarta Sans",sans-serif';
  const lead=p.chapter==='opening'?'A JOURNEY BEGINS':'STOP '+String(index+1).padStart(2,'0')+' / '+String(p.stops.length).padStart(2,'0');
  const elevation=(p.editorialRevision??0)>=9?elevations.get(scene)?.stops[index]:undefined;
  const micro=p.chapter==='photo'&&(p.editorialRevision??0)>=9?(elevation!==undefined?' · ~'+(Math.round(elevation/10)*10)+' m':' · '+Math.abs(stop.lat).toFixed(2)+'° '+(stop.lat>=0?'N':'S')):'';
  ctx.fillText(p.chapter==='opening'?(p.regionTitle??lead):lead+micro,66*s,h-700*s,w-220*s);
  ctx.fillStyle='#FFFFFF';
  const headline=p.editorial?scene.headline:(p.chapter==='opening'?'FROM CITY\nTO HIGHLANDS':stop.name.toUpperCase());
  ctx.font='400 '+(p.chapter==='opening'?85:104)*s+'px Georgia,serif';
  headline.split('\n').forEach((line,i)=>{ctx.save();if(r7&&p.chapter==='opening'){const amount=ease((time-.12-i*.18)/.42);const baseline=h-(575-i*96)*s;ctx.beginPath();ctx.rect(60*s,baseline-100*s,(w-210*s)*amount,125*s);ctx.clip();}ctx.fillText(line,66*s,h-(575-i*96)*s,w-220*s);ctx.restore();});
  ctx.font='500 '+(38*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillStyle='#F3F3E9';
  const tagline=p.chapter==='opening'?(p.openingSubtitle??'EDINBURGH TO THE ISLE OF SKYE'):slow?stop.note:(alternateImage&&alternate?.label?alternate.label:stop.note);
  ctx.save();if(slow)ctx.globalAlpha*=ease((captionTime-.9)/.25);
  labelLines(ctx,tagline,70*s,h-410*s,w-230*s,49*s,2);ctx.restore();
  if(r7){ctx.restore();ctx.save();ctx.fillStyle='rgba(12,35,32,.75)';ctx.fillRect(62*s,h-290*s,w-205*s,38*s);}
  ctx.font='500 '+(19*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillStyle='#DAE1DB';
  ctx.fillText(img?'PHOTO  '+photo.photoAuthor+'  ·  '+photo.photoLicense+'  ·  CROPPED':'ILLUSTRATED LANDSCAPE / PHOTO UNAVAILABLE',70*s,h-265*s,w-220*s);
  ctx.restore();
}
function travelCamera(scene:OpenMotionScene,stage:Stage,w:number,h:number,time:number){
  const p=scene.premiumTravel!,s=w/WIDTH,t=clamp(time/Math.max(.1,scene.durationSec));
  const driving=p.chapter==='drive',finishing=p.chapter==='finale';
  const r7=(p.editorialRevision??0)>=7;
  const closing=Boolean(p.closeLoop&&finishing&&!p.mapIntro);
  const fraction=closing?lerp(p.routeProgressFrom,1,smoother(time/1.65)):finishing?1:lerp(p.routeProgressFrom,p.routeProgressTo,smoother((t-.025)/.86));
  const car=sample(stage,fraction);

  // Lead the moving dot gently through bends and return to the destination
  // before the following photo. All positions are pure functions of time.
  const legSize=Math.max(0,p.routeProgressTo-p.routeProgressFrom);
  const ahead=driving ? legSize*.065*ease(t/.33)*(1-ease((t-.75)/.22)) : 0;
  const roadFocus=smoothRouteFocus(stage,clamp(fraction+ahead));
  const start=stage.stops[Math.max(0,p.focusStopIndex-1)]??roadFocus;
  const end=stage.stops[Math.max(0,p.focusStopIndex)]??roadFocus;
  if(r7&&driving){const u=ease(t/.18),v=ease((t-.72)/.28);roadFocus.x=lerp(lerp(start.x,roadFocus.x,u),end.x,v);roadFocus.y=lerp(lerp(start.y,roadFocus.y,u),end.y,v);}
  const reveal=p.mapIntro?1:closing?smoother(time/.9):smoother(t/.62);
  const lastStop=stage.stops[stage.stops.length-1];
  const cameraFocus=finishing
    ? {x:lerp(lastStop.x,WIDTH/2,reveal),y:lerp(lastStop.y,HEIGHT/2,reveal)}
    : roadFocus;
  // Finale opens on the Portree stop and pulls back to the complete map.
  // Driving scenes start at the previous stop, track the road and ease back
  // slightly at arrival. Limit zoom to avoid blurry 2x raster enlargement.
  const zoom=r7&&driving?1.13+.14*smoother(t):finishing
    ? (p.mapIntro?1.06-.06*smoother(t):lerp(1.42,1,reveal))
    : 1.09+.13*smoother(t/.38)-.08*smoother((t-.66)/.34);
  const desiredX=w*.5,desiredY=h*.485;
  const panX=Math.max(w-w*zoom,Math.min(0,desiredX-cameraFocus.x*s*zoom));
  const panY=Math.max(h-h*zoom,Math.min(0,desiredY-cameraFocus.y*s*zoom));
  return {finishing,fraction,car,zoom,panX,panY};
}
export function premiumTravelAnchor(scene:OpenMotionScene,w:number,h:number,time:number,index:number):Pt{
  const stage=stages.get(scene);if(!stage||!stage.stops[index])return{x:w*.5,y:h*.485};
  const {zoom,panX,panY}=travelCamera(scene,stage,w,h,time),point=stage.stops[index],s=w/WIDTH;
  return{x:Math.max(0,Math.min(w,panX+point.x*s*zoom)),y:Math.max(0,Math.min(h,panY+point.y*s*zoom))};
}
function drawMapScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,titleWeight=1){
  const p=scene.premiumTravel!,stage=stages.get(scene),s=w/WIDTH,t=clamp(time/Math.max(.1,scene.durationSec));
  if(!stage||!p.roadMatched){
    ctx.fillStyle='#E6E9DF';ctx.fillRect(0,0,w,h);
    ctx.textAlign='center';ctx.fillStyle='#21493F';ctx.font='600 '+(36*s)+'px sans-serif';
    ctx.fillText('Preparing road map…',w/2,h/2);return;
  }
  const {finishing,fraction,car,zoom,panX,panY}=travelCamera(scene,stage,w,h,time);
  ctx.save();ctx.translate(panX,panY);ctx.scale(zoom,zoom);
  ctx.save();if(p.editorial)ctx.filter=p.relief?'saturate(.78) contrast(.98) brightness(1.015)':'saturate(.38) contrast(.91) brightness(1.035)';ctx.drawImage(stage.image,0,0,w,h);ctx.restore();
  // Muted base trace, followed by the much bolder travelled section.
  ctx.save();ctx.beginPath();
  stage.path.forEach((pt,i)=>i===0?ctx.moveTo(pt.x*s,pt.y*s):ctx.lineTo(pt.x*s,pt.y*s));
  ctx.strokeStyle='rgba(37,66,61,.40)';ctx.lineWidth=12*s;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore();
  routeStroke(ctx,stage,fraction,s);
  stage.stops.forEach((pt,i)=>{
    const x=pt.x*s,y=pt.y*s;
    if((p.editorialRevision??0)>=7&&finishing&&!p.mapIntro){const pulse=ease((time-.65-i*.20)/.22)*(1-ease((time-1.05-i*.20)/.30));ctx.beginPath();ctx.arc(x,y,(22+12*pulse)*s,0,Math.PI*2);ctx.strokeStyle=`rgba(174,103,74,${pulse*.8})`;ctx.lineWidth=4*s;ctx.stroke();}
    ctx.fillStyle=i===p.focusStopIndex?'#AE674A':'#173D37';
    ctx.strokeStyle='#FFFDF7';ctx.lineWidth=3*s;
    ctx.beginPath();ctx.arc(x,y,19*s,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#FFFFFF';
    ctx.font='800 '+(19*s)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillText(String(i+1),x,y+1*s);
  });
  if(!finishing||(p.closeLoop&&!p.mapIntro&&time<1.65)){
    // The standard premium reel uses a clear route position dot.
    // A smaller 2D camper remains available for user experimentation.
    if(p.markerStyle==='camper') {
      vehicle(ctx,car.x*s,car.y*s,smoothedScreenBearing(stage,fraction),.82*s);
    } else {
      movingDot(ctx,car.x*s,car.y*s,s,time);
    }
  }
  ctx.restore();
  if((p.editorialRevision??0)>=6){
    ctx.save();ctx.textBaseline='middle';ctx.font='700 '+(32*s)+'px Georgia,serif';
    const used:{x:number;y:number;w:number;h:number}[]=[];
    const indexes=stage.stops.map((_,i)=>i).sort((a,b)=>Number(b===p.focusStopIndex)-Number(a===p.focusStopIndex));
    for(const i of indexes){
      const pt=stage.stops[i],x=panX+pt.x*s*zoom,y=panY+pt.y*s*zoom;
      if(x<40*s||x>w-40*s||y<260*s||y>h-600*s)continue;
      const name=p.stops[i].name,tw=ctx.measureText(name).width+24*s,th=46*s;
      const candidates=[[x+30*s,y-th/2],[x-tw-30*s,y-th/2],[x-tw/2,y-64*s],[x-tw/2,y+30*s]];
      const pos=candidates.find(([a,b])=>a>=25*s&&a+tw<=w-25*s&&b>=250*s&&b+th<=h-560*s&&!used.some(q=>a<q.x+q.w+5*s&&a+tw+5*s>q.x&&b<q.y+q.h+5*s&&b+th+5*s>q.y)&&!stage.stops.some((other,j)=>j!==i&&panX+other.x*s*zoom>a-25*s&&panX+other.x*s*zoom<a+tw+25*s&&panY+other.y*s*zoom>b-25*s&&panY+other.y*s*zoom<b+th+25*s));
      if(!pos)continue;
      const [a,b]=pos;used.push({x:a,y:b,w:tw,h:th});
      ctx.fillStyle='rgba(250,247,237,.96)';ctx.strokeStyle='rgba(38,65,56,.32)';ctx.lineWidth=1.5*s;
      ctx.beginPath();ctx.roundRect(a,b,tw,th,7*s);ctx.fill();ctx.stroke();
      ctx.fillStyle='#173D37';ctx.textAlign='left';ctx.fillText(name,a+12*s,b+th/2,tw-24*s);
    }
    ctx.restore();
  }
  if((p.editorialRevision??0)>=9)signatureCompass(ctx,w,s);
  // Scene titles are eased independently of the cartographic layer so two
  // captions do not stack over one another during an incoming cross-fade.
  const r7=(p.editorialRevision??0)>=7;
  const titlesIn=r7?ease((time-(finishing&&!p.mapIntro?.55:.08))/.34):(p.editorialRevision??0)>=6?(.85+.15*ease(time/.18)):finishing?ease((time-(p.mapIntro ? .15 : .45))/.42):ease((time-.15)/.28);
  const titlesOut=finishing||(p.editorialRevision??0)>=6?1:1-ease((time-(scene.durationSec-.42))/.42);
  ctx.save();ctx.globalAlpha*=titlesIn*titlesOut*titleWeight;
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
  ctx.fillText(finishing?(p.mapIntro?'THE JOURNEY':p.closeLoop&&fraction<.999?'CLOSING THE LOOP':'ROUTE COMPLETE'):'NEXT STOP',m,h-525*s);
  ctx.fillStyle='#FFFFFF';
  const name=p.editorial?scene.headline:(finishing?'THE OPEN ROAD':p.stops[p.focusStopIndex]?.name??'HIGHLANDS');
  ctx.font='400 '+(finishing?83:92)*s+'px Georgia,serif';
  ctx.fillText(name,m,h-415*s,w-200*s);
  ctx.fillStyle='#E6F0E8';ctx.font='500 '+(30*s)+'px "Plus Jakarta Sans",sans-serif';
  const profile=(p.editorialRevision??0)>=9?elevations.get(scene):undefined;
  if(!finishing&&profile)signatureProfile(ctx,profile,m,h-312*s,w-220*s,105*s,s,fraction);
  else ctx.fillText(finishing?p.stops.map(stop=>stop.name).join(' · '):'ON THE ROAD',m,h-340*s,w-200*s);
  if(finishing&&p.cta){ctx.fillStyle='#E5C48B';ctx.font='700 '+(50*s)+'px sans-serif';ctx.fillText(p.cta,m,h-240*s,w-200*s);}
  ctx.restore();
  if((p.editorialRevision??0)>=9&&finishing&&!p.mapIntro)signatureFinale(ctx,w,h,scene,stage,time);
  ctx.fillStyle='rgba(251,250,245,.93)';ctx.fillRect(0,h-61*s,w,61*s);
  ctx.textAlign='center';ctx.font='500 '+(21*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillStyle='#244C44';
  ctx.fillText(p.relief?'Map: OpenFreeMap / OpenMapTiles · © OpenStreetMap · Terrain: Mapzen / AWS':'Map: OpenFreeMap / OpenMapTiles · © OpenStreetMap contributors',w/2,h-24*s,w-54*s);
}
export function renderPremiumTravelScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,getPhoto:(url:string)=>HTMLImageElement|null,titleWeight=1,captionTime=time):void{
  const p=scene.premiumTravel!;
  ctx.save();
  if(p.chapter==='opening'||p.chapter==='photo')photoScene(ctx,w,h,scene,time,getPhoto,titleWeight,captionTime);
  else drawMapScene(ctx,w,h,scene,time,titleWeight);
  // Frame boundaries are blended in the shared OpenMotion renderer.
  // Never darken this shot at its start or end.
  ctx.restore();
}
