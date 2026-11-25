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
export function subscribeBucketListMap(fn:()=>void):()=>void{
  subscribers.add(fn);return()=>subscribers.delete(fn);
}
function announce(){for(const cb of subscribers)try{cb();}catch{/* Disposed preview */}}

/** All globe-to-Mercator morphing is handled natively by MapLibre's globe projection.
 * The camera is continuous in geographical coordinates and logarithmic zoom
 * (zoom numbers); no image scaling, screenshot interpolation, or forced
 * projection switch occurs at a chapter boundary.
 */
function introCamera(scene:OpenMotionScene,timeSec:number):Camera{
  const d=scene.bucketList!,u=clamp(timeSec/Math.max(.1,scene.durationSec));
  // Director's curve: accelerate through the ocean, then reach the
  // destination early enough for a short, steady hero-map hold before
  // the volcanic crater photograph fades in.
  const speed=smooth(clamp(u/.92));
  const move=smooth(clamp(u/.77));
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
  for(const scene of project.scenes){
    const duration=Math.max(.5,scene.durationSec);
    if(timeSec<start+duration || scene===project.scenes[project.scenes.length-1]){
      if(scene.layout!=='bucket-list-zoom'||!scene.bucketList)return null;
      const local=Math.max(0,Math.min(duration,timeSec-start));
      if(scene.bucketList.chapter==='zoom')return introCamera(scene,local);
      if(scene.bucketList.chapter==='outro'&&local>=duration-1.8)return outroCamera(scene,local);
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
  state.ctx.drawImage(state.map.getCanvas(),0,0,MAP_WIDTH,MAP_HEIGHT);
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
    host.style.cssText='position:fixed;left:-7000px;top:0;width:720px;height:1280px;pointer-events:none;z-index:-1';
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
      image.width=MAP_WIDTH;image.height=MAP_HEIGHT;
      const ctx=image.getContext('2d',{alpha:false});
      if(!ctx)throw new Error('Kaartcanvas niet beschikbaar.');
      state={map,host,image,ctx,loaded:false,exporting:false,lastPreviewTime:-1,disposed:false};
      controllers.set(project,state);
      if(!map.loaded())await waitForEvent(map,'load',30000);
      for(const layer of map.getStyle().layers??[]){
        if(layer.type==='symbol')map.setLayoutProperty(layer.id,'visibility','none');
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
  const anchors=[0,.18,.37,.56,.75,1];
  try{
    for(const part of anchors){
      if(signal?.aborted)throw new Error('Video-export geannuleerd.');
      setCamera(state,introCamera(intro,intro.durationSec*part));
      // Wait for visible tiles at a few representative scales. Per-frame
      // export only waits for the render event, not hundreds of idle calls.
      try{await waitForEvent(state.map,'idle',11000,signal);}
      catch(error){if(signal?.aborted)throw error;console.warn('Map tiles still loading at zoom',part);}
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
