import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';
import type { Map as MapLibreMap } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE='https://tiles.openfreemap.org/styles/bright';
const MAP_WIDTH=720,MAP_HEIGHT=1280;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

interface Camera {
  center:[number,number];
  zoom:number;
  bearing:number;
  pitch:0;
}
interface Controller {
  map:MapLibreMap;
  host:HTMLDivElement;
  image:HTMLCanvasElement;
  ctx:CanvasRenderingContext2D;
  loaded:boolean;
  exporting:boolean;
  lastPreviewTime:number;
  disposed:boolean;
  points: {lon:number;lat:number}[];
  projected: Map<string,{x:number;y:number}>;
}
const controllers=new WeakMap<OpenMotionProject,Controller>();
const loading=new WeakMap<OpenMotionProject,Promise<void>>();
const errors=new WeakMap<OpenMotionProject,string>();
const subscribers=new Set<()=>void>();

export function getBucketListMapError(project:OpenMotionProject):string|undefined{return errors.get(project);}
export function getBucketListCanvas(project:OpenMotionProject):HTMLCanvasElement|null{
  const controller=controllers.get(project);
  return controller?.loaded?controller.image:null;
}
export function getDocumentaryProjectedPoint(project:OpenMotionProject,lon:number,lat:number):{x:number;y:number}|undefined {
  return controllers.get(project)?.projected.get(lon+','+lat);
}
export function subscribeBucketListMap(fn:()=>void):()=>void{
  subscribers.add(fn);return()=>subscribers.delete(fn);
}
function announce(){for(const cb of subscribers)try{cb();}catch{/* Disposed preview */}}

/** All globe-to-Mercator morphing is handled natively by MapLibre's globe projection.
 * The camera is continuous in geographical coordinates and logarithmic zoom
 * (zoom numbers); no image scaling, screenshot interpolation, or forced
 * projection switch occurs at a chapter boundary.
 */
/** Hermite interpolation with shared endpoint velocities; no stop/restart at intermediate keyframes. */
function regionalZoom(t:number,start:number,end:number):number{
  const keys=[[0,0,0],[.5,.055,.20],[1.4,.40,.42],[2.6,.91,.24],[3.1,1,0]];
  if(t>=3.1)return end;
  const i=keys.findIndex((k,j)=>j>0&&t<=k[0])-1;
  const [a,y0,m0]=keys[Math.max(0,i)],[b,y1,m1]=keys[Math.max(0,i)+1];
  const span=b-a,u=clamp((t-a)/span),u2=u*u,u3=u2*u;
  const f=(2*u3-3*u2+1)*y0+(u3-2*u2+u)*span*m0+(-2*u3+3*u2)*y1+(u3-u2)*span*m1;
  return lerp(start,end,clamp(f));
}
function introCamera(scene:OpenMotionScene,timeSec:number):Camera{
  const d=scene.bucketList!,u=clamp(timeSec/Math.max(.1,scene.durationSec));
  const doc=d.documentary;
  if(doc?.from && doc.to){
    const t=smooth(clamp(u/.94)), a=doc.from,b=doc.to;
    return {center:[lerp(a[0],b[0],t),lerp(a[1],b[1],t)],zoom:lerp(a[2],b[2],t),bearing:0,pitch:0};
  }
  if(d.regionalFlight){
    const t=u*3.5, f=d.regionalFlight;
    // Center on the destination before high magnification; avoid crossing empty ocean at street-level zoom.
    const move=smooth(t/1.4);
    return {center:[lerp(d.startLongitude??d.longitude+7,d.longitude,move),lerp(d.startLatitude??d.latitude+3,d.latitude,move)],zoom:regionalZoom(t,f.startZoom,f.arrivalZoom),bearing:0,pitch:0};
  }
  // Director's curve: accelerate through the ocean, then reach the
  // destination early enough for a short, steady hero-map hold before
  // the volcanic crater photograph fades in.
  const speed=smooth(clamp(u/(d.directorsCut ? .88 : .92)));
  const move=smooth(clamp(u/(d.directorsCut ? .70 : .77)));
  const lon0=d.startLongitude??d.longitude+16;
  const lat0=d.startLatitude??d.latitude+5;
  return {
    center:[lerp(lon0,d.longitude,move),lerp(lat0,d.latitude,move)],
    zoom:lerp(1.1,12.0,speed),
    bearing:lerp(-9,0,smooth(clamp(u/.72))),
    pitch:0,
  };
}
/** Final 1.8 seconds return to a real geographic overview of the island. */
export function bucketListOutroReveal(scene:OpenMotionScene,timeSec:number):number{
  if(scene.bucketList?.chapter!=='outro')return 0;
  return smooth((timeSec-(scene.durationSec-1.8))/1.8);
}
function outroCamera(scene:OpenMotionScene,timeSec:number):Camera{
  const d=scene.bucketList!,reveal=bucketListOutroReveal(scene,timeSec);
  const overviewLon=d.longitude+.20,overviewLat=d.latitude-.05;
  return {
    center:[lerp(d.longitude,overviewLon,reveal),lerp(d.latitude,overviewLat,reveal)],
    zoom:lerp(12.0,7.3,reveal),
    bearing:0,pitch:0,
  };
}
/** Canvas renderer and video encoder share this exact timeline. */
function cameraAt(project:OpenMotionProject,timeSec:number):Camera|null{
  let start=0;
  for(let i=0;i<project.scenes.length;i++){
    const scene=project.scenes[i],previous=project.scenes[i-1];
    const duration=Math.max(.5,scene.durationSec);
    if(timeSec<start+duration || scene===project.scenes[project.scenes.length-1]){
      if(scene.layout!=='bucket-list-zoom'||!scene.bucketList)return null;
      const local=Math.max(0,Math.min(duration,timeSec-start));
      if(scene.bucketList.chapter==='zoom')return introCamera(scene,local);
      // A seek straight into the reveal must render the final native map, not a stale wide shot.
      if(previous?.bucketList?.regionalFlight&&previous.bucketList.chapter==='zoom'&&local<.5)return introCamera(previous,previous.durationSec);
      if(scene.bucketList.chapter==='outro'&&!scene.bucketList.directorsCut&&local>=duration-1.8)return outroCamera(scene,local);
      return null;
    }
    start+=duration;
  }
  return null;
}

function waitForEvent(map:MapLibreMap,event:'load'|'idle'|'render',timeoutMs:number,signal?:AbortSignal):Promise<void>{
  return new Promise((resolve,reject)=>{
    let settled=false;
    const complete=(error?:Error)=>{
      if(settled)return;
      settled=true;
      clearTimeout(timer);
      map.off(event,onEvent);
      signal?.removeEventListener('abort',onAbort);
      if(error)reject(error);else resolve();
    };
    const onEvent=()=>complete();
    const onAbort=()=>complete(new Error('Kaartopname geannuleerd.'));
    const timer=setTimeout(()=>complete(new Error('MapLibre '+event+' timeout')),timeoutMs);
    map.once(event,onEvent);
    if(signal?.aborted)onAbort();
    else signal?.addEventListener('abort',onAbort,{once:true});
  });
}
function snapshot(state:Controller){
  if(state.disposed)return;
  state.ctx.drawImage(state.map.getCanvas(),0,0,state.image.width,state.image.height);
  state.projected.clear();
  for(const p of state.points){const q=state.map.project([p.lon,p.lat]);state.projected.set(p.lon+','+p.lat,{x:q.x/state.host.clientWidth,y:q.y/state.host.clientHeight});}
  state.loaded=true;
}
function setCamera(state:Controller,camera:Camera){
  state.map.jumpTo(camera);
  state.map.triggerRepaint();
}

export function disposeBucketListProject(project:OpenMotionProject):void{
  const state=controllers.get(project);
  if(state){
    state.disposed=true;
    state.map.remove();
    state.host.remove();
    controllers.delete(project);
  }
  loading.delete(project);
}
export async function prepareBucketListProject(project:OpenMotionProject):Promise<void>{
  if(!project.scenes.some(s=>s.layout==='bucket-list-zoom'&&s.bucketList?.chapter==='zoom'))return;
  const current=loading.get(project);if(current)return current;
  const promise=(async()=>{
    const {Map:MapLibre,setWorkerUrl}=await import('maplibre-gl');
    setWorkerUrl(workerUrl);
    const host=document.createElement('div');
    const mapW=project.format==='16:9'?1280:MAP_WIDTH;
    const mapH=project.format==='16:9'?720:MAP_HEIGHT;
    host.style.cssText='position:fixed;left:-7000px;top:0;width:'+mapW+'px;height:'+mapH+'px;pointer-events:none;z-index:-1';
    document.body.appendChild(host);
    let state:Controller|undefined;
    try{
      const intro=project.scenes.find(s=>s.layout==='bucket-list-zoom'&&s.bucketList?.chapter==='zoom')!;
      const camera=introCamera(intro,0);
      const map=new MapLibre({
        container:host,style:STYLE,center:camera.center,zoom:camera.zoom,
        bearing:camera.bearing,pitch:0,projection:{type:'globe'},
        interactive:false,attributionControl:false,fadeDuration:0,
        canvasContextAttributes:{preserveDrawingBuffer:true,antialias:false},
      });
      const image=document.createElement('canvas');
      image.width=mapW;image.height=mapH;
      const ctx=image.getContext('2d',{alpha:false});
      if(!ctx)throw new Error('Kaartcanvas niet beschikbaar.');
      const points=project.scenes.flatMap(s=>s.bucketList?.documentary?.markers??(s.bucketList?.directorsCut&&s.bucketList.chapter==='zoom'?[{lon:s.bucketList.longitude,lat:s.bucketList.latitude},...(s.bucketList.regionalFlight?.contextLabels??[])]:[]));
      state={map,host,image,ctx,loaded:false,exporting:false,lastPreviewTime:-1,disposed:false,points,projected:new Map()};
      controllers.set(project,state);
      if(!map.loaded())await waitForEvent(map,'load',30000);
      for(const layer of map.getStyle().layers??[]){
        if(layer.type==='symbol'&&!intro.bucketList?.documentary)map.setLayoutProperty(layer.id,'visibility','none');
      }
      if(intro.bucketList?.documentary||intro.bucketList?.regionalFlight?.relief){
        // Actual Terrarium elevations, not decorative contour geometry.
        try{
          const before=map.getStyle().layers?.find(l=>l.type==='symbol')?.id;
          map.addSource('documentary-dem',{type:'raster-dem',tiles:['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],encoding:'terrarium',tileSize:256,maxzoom:15,attribution:'AWS Open Data elevation tiles'});
          map.addLayer({id:'documentary-relief',type:'hillshade',source:'documentary-dem',minzoom:8,paint:{'hillshade-exaggeration':.48,'hillshade-shadow-color':'#354c4b','hillshade-highlight-color':'#f5f1dc','hillshade-accent-color':'#55796a'}},before);
          const contour=project.scenes.find(s=>s.bucketList?.documentary?.contourUrl)?.bucketList?.documentary?.contourUrl;
          if(contour){
            map.addSource('documentary-contours',{type:'geojson',data:new URL(contour,document.baseURI).href});
            map.addLayer({id:'documentary-contour-lines',type:'line',source:'documentary-contours',minzoom:10,paint:{'line-color':'#526c60','line-opacity':.42,'line-width':['interpolate',['linear'],['zoom'],10,.45,13,.9]}},before);
          }
        }catch(error){console.warn('Optional documentary elevation layers unavailable',error);}
      }
      // A live MapLibre scene responds to arbitrary time positions, even
      // between previously known keyframes. Tile changes repaint the view.
      map.on('render',()=>{
        if(!state||state.exporting||state.disposed)return;
        snapshot(state);
        announce();
      });
      map.triggerRepaint();
      try {await waitForEvent(map,'idle',15000);}catch{map.triggerRepaint();}
      snapshot(state);
      errors.delete(project);
      announce();
    }catch(error){
      if(state){state.disposed=true;state.map.remove();controllers.delete(project);}
      host.remove();
      errors.set(project,String(error));
      console.warn('Live bucket-list MapLibre camera unavailable',error);
      throw error;
    }
  })();
  loading.set(project,promise);
  return promise;
}

/** Browser preview: set the real camera, then repaint Canvas after MapLibre
 * emits its own render event. The request is nonblocking for React's RAF.
 */
export function seekBucketListPreview(project:OpenMotionProject,timeSec:number):void{
  const state=controllers.get(project);
  if(!state||state.exporting||state.disposed)return;
  const camera=cameraAt(project,timeSec);if(!camera)return;
  if(Math.abs(state.lastPreviewTime-timeSec)<.012)return;
  state.lastPreviewTime=timeSec;
  setCamera(state,camera);
}
/** The renderer must not see a frame from a different camera time while the
 * exporter is advancing. Every encoded map frame waits for a MapLibre render.
 */
export async function captureBucketListExportFrame(project:OpenMotionProject,timeSec:number,signal?:AbortSignal):Promise<void>{
  const camera=cameraAt(project,timeSec);
  if(!camera)return;
  const state=controllers.get(project);
  if(!state||state.disposed)throw new Error('Live MapLibre-kaart niet geladen voor export.');
  if(signal?.aborted)throw new Error('Video-export geannuleerd.');
  state.exporting=true;
  const painted=waitForEvent(state.map,'render',9000,signal);
  setCamera(state,camera);
  await painted;
  snapshot(state);
}
/** Warm a limited set of native camera positions. These are tile preloads,
 * NOT still images later dissolved between video frames.
 */
export async function beginBucketListExport(project:OpenMotionProject,signal?:AbortSignal):Promise<void>{
  await prepareBucketListProject(project);
  const state=controllers.get(project);
  if(!state)throw new Error('MapLibre-webkaart niet beschikbaar voor MP4-export.');
  state.exporting=true;
  const intro=project.scenes.find(s=>s.layout==='bucket-list-zoom'&&s.bucketList?.chapter==='zoom');
  if(!intro)return;
  const anchors=intro.bucketList?.regionalFlight?[0,.5/3.5,1.4/3.5,2.1/3.5,2.6/3.5,3.1/3.5,1]:[0,.18,.37,.56,.75,1];
  try{
    for(const part of anchors){
      if(signal?.aborted)throw new Error('Video-export geannuleerd.');
      setCamera(state,introCamera(intro,intro.durationSec*part));
      // Wait for visible tiles at a few representative scales. Per-frame
      // export only waits for the render event, not hundreds of idle calls.
      try{if(!state.map.areTilesLoaded())await waitForEvent(state.map,'idle',11000,signal);}
      catch(error){if(signal?.aborted)throw error;console.warn('Map tiles still loading at zoom',part);}
    }
    if(intro.bucketList?.documentary){
      for(const shot of project.scenes.filter(s=>s!==intro&&s.bucketList?.documentary?.mode==='map')){
        if(signal?.aborted)throw new Error('Video-export geannuleerd.');
        setCamera(state,introCamera(shot,shot.durationSec));
        if(!state.map.areTilesLoaded())try{await waitForEvent(state.map,'idle',3500,signal);}catch(error){if(signal?.aborted)throw error;}
      }
    }
    const previous=waitForEvent(state.map,'render',9000,signal);
    setCamera(state,introCamera(intro,0));
    await previous;
    snapshot(state);
  }catch(error){
    state.exporting=false;
    throw error;
  }
}
export function endBucketListExport(project:OpenMotionProject){
  const state=controllers.get(project);
  if(!state)return;
  state.exporting=false;
  state.lastPreviewTime=-1;
  announce();
}
