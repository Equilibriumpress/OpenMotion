import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';
import type { Map as MapLibreMap } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/bright';
const BASE_WIDTH = 540;
const BASE_HEIGHT = 960;
const INK = '#111F30';
const PAPER = '#F5F1E8';
const GOLD = '#D9B77A';
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (v: number) => { const t = clamp(v); return t*t*(3-2*t); };
const lerp = (a: number, b: number, t: number) => a+(b-a)*t;

interface ZoomKey {
  time: number;
  zoom: number;
  center: [number,number];
  globe: boolean;
}

interface MapFrame extends ZoomKey {
  image: HTMLCanvasElement;
}
const framesByProject = new WeakMap<OpenMotionProject, MapFrame[]>();
const pending = new WeakMap<OpenMotionProject, Promise<void>>();
const errors = new WeakMap<OpenMotionProject, string>();
export function getBucketListMapError(project: OpenMotionProject): string | undefined {
  return errors.get(project);
}

/**
 * Each snapshot comes from a real MapLibre globe or Mercator camera, including
 * true OSM-backed coastlines and roads. At export time the camera movement is
 * deterministic and has no WebGL tile/network requests per video frame.
 *
 * The keyframes are relative to the chosen destination, so this format can be
 * reused for destinations other than São Miguel via editable coordinates.
 */
function zoomKeys(scene: OpenMotionScene): ZoomKey[] {
  const destination = scene.bucketList!;
  const latitude = destination.latitude, longitude = destination.longitude;
  const startLon = destination.startLongitude ?? longitude + 16;
  const startLat = destination.startLatitude ?? latitude + 5;
  const seconds = Math.max(1,scene.durationSec);
  const key = (fraction:number, zoom:number, longitudeProgress:number, globe:boolean):ZoomKey=>({
    time:seconds*fraction,
    zoom,
    center:[
      lerp(startLon,longitude,smooth(longitudeProgress)),
      lerp(startLat,latitude,smooth(longitudeProgress))
    ],
    globe
  });
  return [
    key(0,1.05,0,true),
    key(.13,1.75,.25,true),
    key(.25,2.55,.49,true),
    key(.38,3.8,.68,false),
    key(.50,5.0,.83,false),
    key(.62,6.6,.93,false),
    key(.74,8.5,.985,false),
    key(.85,10.4,1,false),
    key(1,12.2,1,false)
  ];
}

async function awaitIdle(map:MapLibreMap): Promise<void> {
  await Promise.race([
    new Promise<void>(resolve=>map.once('idle',()=>resolve())),
    new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('Map tiles timed out')),20000))
  ]);
}

export function prepareBucketListProject(project:OpenMotionProject):Promise<void>{
  const scene=project.scenes.find(s=>s.layout==='bucket-list-zoom'&&s.bucketList?.chapter==='zoom');
  if(!scene)return Promise.resolve();
  const active=pending.get(project);
  if(active)return active;
  const work=(async()=>{
    const {Map: MapLibre, setWorkerUrl}=await import('maplibre-gl');
    setWorkerUrl(workerUrl);
    const host=document.createElement('div');
    host.style.cssText='position:fixed;left:-5000px;top:0;width:540px;height:960px;pointer-events:none;z-index:-1';
    document.body.appendChild(host);
    let map:MapLibreMap|undefined;
    try{
      const keys=zoomKeys(scene);
      map=new MapLibre({
        container:host,
        style:MAP_STYLE,
        center:keys[0].center,
        zoom:keys[0].zoom,
        projection:{type:'globe'},
        interactive:false,
        attributionControl:false,
        fadeDuration:0,
        canvasContextAttributes:{preserveDrawingBuffer:true,antialias:false},
      });
      if(!map.loaded())await Promise.race([
        new Promise<void>(resolve=>map!.once('load',()=>resolve())),
        new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error('Globe map did not load')),30000))
      ]);
      const captured:MapFrame[]=[];
      for(const key of keys) {
        const loaded=awaitIdle(map);
        map.setProjection({type:key.globe?'globe':'mercator'});
        map.jumpTo({center:key.center,zoom:key.zoom,bearing:0,pitch:0});
        map.resize();
        map.triggerRepaint();
        await loaded;
        const image=document.createElement('canvas');
        image.width=BASE_WIDTH;image.height=BASE_HEIGHT;
        const context=image.getContext('2d');
        if(!context)throw new Error('Map snapshot canvas unavailable');
        context.drawImage(map.getCanvas(),0,0,BASE_WIDTH,BASE_HEIGHT);
        captured.push({...key,image});
      }
      framesByProject.set(project,captured);
      errors.delete(project);
    } finally {
      map?.remove();
      host.remove();
    }
  })().catch(error=>{
    errors.set(project,String(error));
    // Keep the rest of the video playable. The missing-map state is labelled,
    // never replaced with an invented geographic image.
    console.warn('Bucket-list map unavailable:',error);
  });
  pending.set(project,work);
  return work;
}

function fitPhoto(ctx:CanvasRenderingContext2D,img:HTMLImageElement,w:number,h:number,t:number){
  const aspect=Math.max(w/img.naturalWidth,h/img.naturalHeight);
  const zoom=1.07+.09*smooth(t);
  const imageW=img.naturalWidth*aspect*zoom, imageH=img.naturalHeight*aspect*zoom;
  const dx=Math.sin(t*Math.PI)*w*.015;
  const dy=Math.cos(t*Math.PI)*h*.018;
  ctx.drawImage(img,(w-imageW)/2+dx,(h-imageH)/2+dy,imageW,imageH);
}
function fallbackPhoto(ctx:CanvasRenderingContext2D,w:number,h:number){
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#8AAEB0');sky.addColorStop(.53,'#BAC4AC');sky.addColorStop(1,'#2D685B');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  for(const [level,color,shift] of [[.65,'#648E79',1],[.83,'#376F60',2.4]] as const){
    ctx.fillStyle=color;
    ctx.beginPath();ctx.moveTo(0,h);
    ctx.lineTo(0,h*level);
    for(let i=1;i<=9;i++)ctx.lineTo(w*i/9,h*(level-.09*Math.abs(Math.sin(i*.9+shift))));
    ctx.lineTo(w,h);ctx.closePath();ctx.fill();
  }
}

function drawBackdrop(ctx:CanvasRenderingContext2D,w:number,h:number) {
  ctx.fillStyle='#0B1725';ctx.fillRect(0,0,w,h);
  const glow=ctx.createRadialGradient(w*.52,h*.46,w*.04,w*.5,h*.5,w*.8);
  glow.addColorStop(0,'rgba(28,89,116,.38)');
  glow.addColorStop(1,'rgba(3,9,18,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  for(let i=0;i<70;i++){
    const x=((i*173+41)%991)/991*w, y=((i*281+71)%787)/787*h;
    ctx.fillStyle=i%7===0?'rgba(244,235,209,.63)':'rgba(228,232,236,.19)';
    ctx.beginPath();ctx.arc(x,y,i%7===0?1.8:1,0,Math.PI*2);ctx.fill();
  }
}

function zoomFrame(ctx:CanvasRenderingContext2D,w:number,h:number,project:OpenMotionProject,time:number,scene:OpenMotionScene){
  drawBackdrop(ctx,w,h);
  const frames=framesByProject.get(project);
  if(!frames?.length){
    ctx.textAlign='center';ctx.fillStyle=PAPER;
    ctx.font='600 '+Math.round(w*.031)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillText('MAP PREVIEW UNAVAILABLE',w/2,h*.53,w*.83);
    ctx.font='400 '+Math.round(w*.020)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillText('The globe requires map tiles and WebGL',w/2,h*.57,w*.87);
    return;
  }
  const t=Math.max(0,Math.min(scene.durationSec,time));
  let index=0;
  while(index<frames.length-2&&frames[index+1].time<t)index++;
  const a=frames[index],b=frames[Math.min(index+1,frames.length-1)];
  const u=clamp((t-a.time)/Math.max(.001,b.time-a.time));
  const alpha=smooth((u-.17)/.66);
  const targetZoom=lerp(a.zoom,b.zoom,smooth(u));
  const renderSnapshot=(f:MapFrame,opacity:number)=>{
    if(opacity<=0)return;
    ctx.save();ctx.globalAlpha*=opacity;
    // A small real-camera zoom between cached map keyframes.
    // More than 1.8x enlargement is avoided to preserve crisp coastlines.
    const scale=Math.max(.7,Math.min(1.8,Math.pow(2,targetZoom-f.zoom)));
    const sw=w*scale,sh=h*scale;
    ctx.drawImage(f.image,(w-sw)/2,(h-sh)/2,sw,sh);
    ctx.restore();
  };
  renderSnapshot(a,1);
  if(b!==a)renderSnapshot(b,alpha);
  // No fake coastlines: the destination indicator only appears once the
  // camera is close enough for the point to be geographically meaningful.
  const approach=smooth((t/scene.durationSec-.57)/.23);
  if(approach>0){
    const x=w*.5,y=h*.49,pulse=.5+.5*Math.sin(t*6.4);
    ctx.save();ctx.globalAlpha*=approach;
    ctx.fillStyle='rgba(217,183,122,.22)';
    ctx.beginPath();ctx.arc(x,y,w*(.025+.004*pulse),0,Math.PI*2);ctx.fill();
    ctx.fillStyle=GOLD;ctx.strokeStyle=PAPER;ctx.lineWidth=w*.004;
    ctx.beginPath();ctx.arc(x,y,w*.012,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
  }
}

function footer(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene){
  const data=scene.bucketList!;
  const scale=w/1080;
  ctx.fillStyle='rgba(250,250,244,.88)';
  ctx.fillRect(0,h-69*scale,w,69*scale);
  ctx.fillStyle='#315152';ctx.textAlign='center';
  ctx.font='500 '+Math.round(18*scale)+'px "Plus Jakarta Sans",sans-serif';
  if(data.chapter==='zoom') ctx.fillText('OpenFreeMap / OpenMapTiles · © OpenStreetMap contributors',w/2,h-26*scale,w-50*scale);
  else ctx.fillText('PHOTO '+(data.imageAuthor??'Wikimedia Commons')+' · '+(data.imageLicense??''),w/2,h-25*scale,w-50*scale);
}

function zoomScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,project:OpenMotionProject){
  const d=scene.bucketList!,s=w/1080,t=clamp(time/Math.max(.01,scene.durationSec));
  zoomFrame(ctx,w,h,project,time,scene);
  // Documentary-style UI overlay, kept away from the TikTok safe zone.
  const shade=ctx.createLinearGradient(0,0,0,h);
  shade.addColorStop(0,'rgba(10,22,35,.68)');
  shade.addColorStop(.24,'rgba(10,22,35,.10)');
  shade.addColorStop(.72,'rgba(10,22,35,0)');
  shade.addColorStop(1,'rgba(10,22,35,.60)');
  ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  ctx.textAlign='left';
  ctx.fillStyle=PAPER;ctx.font='700 '+Math.round(33*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText('MY BUCKET LIST',70*s,123*s,w-140*s);
  ctx.fillStyle=GOLD;ctx.font='700 '+Math.round(24*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText('#'+String(d.episode).padStart(3,'0')+'    /    '+d.region.toUpperCase(),70*s,172*s,w-140*s);

  const launch=1-smooth((t-.25)/.12);
  if(launch>0){
    ctx.save();ctx.globalAlpha*=launch;
    ctx.fillStyle=PAPER;ctx.font='800 '+Math.round(78*s)+'px "Bricolage Grotesque",sans-serif';
    ctx.fillText('PLACES WORTH',70*s,h-420*s,w-140*s);
    ctx.fillText('THE JOURNEY',70*s,h-325*s,w-140*s);
    ctx.restore();
  }
  const arrive=smooth((t-.70)/.22);
  if(arrive>0){
    ctx.save();ctx.globalAlpha*=arrive;
    ctx.fillStyle=GOLD;ctx.font='700 '+Math.round(29*s)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillText('DESTINATION REACHED',72*s,h-432*s,w-150*s);
    ctx.fillStyle=PAPER;ctx.font='800 '+Math.round(102*s)+'px "Bricolage Grotesque",sans-serif';
    ctx.fillText(d.destination.toUpperCase(),70*s,h-326*s,w-140*s);
    ctx.font='500 '+Math.round(30*s)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillText(d.country.toUpperCase()+'  ·  '+d.latitude.toFixed(3)+'° N  '+Math.abs(d.longitude).toFixed(3)+'° W',72*s,h-258*s,w-140*s);
    ctx.restore();
  }
  footer(ctx,w,h,scene);
}

function photoScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,getPhoto:(url:string)=>HTMLImageElement|null){
  const d=scene.bucketList!,t=clamp(time/Math.max(.01,scene.durationSec)),s=w/1080;
  const img=scene.imageUrl?getPhoto(scene.imageUrl):null;
  if(img)fitPhoto(ctx,img,w,h,t);else fallbackPhoto(ctx,w,h);
  const shade=ctx.createLinearGradient(0,h*.25,0,h);
  shade.addColorStop(0,'rgba(11,26,26,0)');
  shade.addColorStop(.48,'rgba(11,26,26,.35)');
  shade.addColorStop(1,'rgba(7,22,25,.95)');
  ctx.fillStyle=shade;ctx.fillRect(0,h*.25,w,h*.75);
  const appear=smooth((time-.20)/.52),depart=1-smooth((time-(scene.durationSec-.5))/.5);
  ctx.save();ctx.globalAlpha*=appear*depart;
  ctx.textAlign='left';ctx.fillStyle=GOLD;
  ctx.font='700 '+Math.round(26*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText(d.chapter==='outro'?'MY BUCKET LIST  /  #'+String(d.episode).padStart(3,'0'):'WHY '+d.reasonNumber+' / 03',70*s,h-490*s,w-140*s);
  ctx.fillStyle='#FFF9EE';
  ctx.font='800 '+Math.round((d.chapter==='outro'?112:88)*s)+'px "Bricolage Grotesque",sans-serif';
  const headline=d.chapter==='outro'?d.destination.toUpperCase():d.reasonTitle?.toUpperCase()??'';
  const words=headline.split(' ');
  const lines:string[]=[];let line='';
  for(const word of words){
    const candidate=line?line+' '+word:word;
    if(line&&ctx.measureText(candidate).width>w-140*s){lines.push(line);line=word;}
    else line=candidate;
  }
  if(line)lines.push(line);
  const titleY=h-(d.chapter==='outro'?377:360)*s;
  lines.slice(0,3).forEach((str,i)=>ctx.fillText(str,70*s,titleY+i*100*s,w-140*s));
  ctx.fillStyle='#E9E6D8';
  ctx.font='500 '+Math.round(36*s)+'px "Plus Jakarta Sans",sans-serif';
  const copy=d.chapter==='outro'?'THE AZORES  /  PORTUGAL':d.reasonCopy??'';
  ctx.fillText(copy,74*s,h-135*s,w-148*s);
  if(d.chapter==='outro'){
    ctx.font='700 '+Math.round(27*s)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillStyle=GOLD;ctx.fillText('SAVE THIS PLACE',74*s,h-194*s,w-148*s);
  }
  ctx.restore();
  footer(ctx,w,h,scene);
}
export function renderBucketListScene(
 ctx:CanvasRenderingContext2D,w:number,h:number,
 scene:OpenMotionScene,time:number,project:OpenMotionProject,
 getPhoto:(url:string)=>HTMLImageElement|null
):void{
  ctx.save();
  if(scene.bucketList?.chapter==='zoom')zoomScene(ctx,w,h,scene,time,project);
  else photoScene(ctx,w,h,scene,time,getPhoto);
  ctx.restore();
}
