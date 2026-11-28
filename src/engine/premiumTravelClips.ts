import type {OpenMotionProject,OpenMotionScene,PremiumTravelClip} from '../types/openmotion';

// Browser-built, paged vertical frame atlases. Like documentary videoGrid,
// each rendered frame selects a fixed cell by scene time, never a live video.
const FPS=15,COLS=4,PER_PAGE=16,MAX_BYTES=250*1024*1024;
type Atlas={pages:HTMLCanvasElement[];width:number;height:number;frames:number;fps:number;clip:PremiumTravelClip};
type State={status:'preparing'|'ready'|'fallback';atlas?:Atlas;reason?:string};
const states=new WeakMap<OpenMotionScene,State>();
const jobs=new WeakMap<OpenMotionProject,Promise<void>>();
export function requestedPremiumClip(scene:OpenMotionScene):PremiumTravelClip|undefined{
 const p=scene.premiumTravel;
 return p?.chapter==='photo'&&p.mediaMode==='video'&&(p.editorialRevision??0)>=10?p.stops[p.focusStopIndex]?.videoClip:undefined;
}
export function premiumClipState(scene:OpenMotionScene){return states.get(scene);}
export function premiumClipReady(scene:OpenMotionScene){return states.get(scene)?.status==='ready';}
function trusted(url:string){try{const u=new URL(url);return u.protocol==='https:'&&u.hostname==='upload.wikimedia.org'&&u.pathname.startsWith('/wikipedia/commons/');}catch{return false;}}
function wait(video:HTMLVideoElement,event:string,signal:AbortSignal,action?:()=>void):Promise<void>{
 return new Promise((resolve,reject)=>{
  const finish=(error?:unknown)=>{clearTimeout(timer);video.removeEventListener(event,onEvent);video.removeEventListener('error',onError);signal.removeEventListener('abort',onAbort);error?reject(error):resolve();};
  const onEvent=()=>finish(),onError=()=>finish(Error('Video decode failed')),onAbort=()=>finish(Error('Video preparation timeout'));
  const timer=setTimeout(()=>finish(Error('Video '+event+' timeout')),8000);
  video.addEventListener(event,onEvent,{once:true});video.addEventListener('error',onError,{once:true});signal.addEventListener('abort',onAbort,{once:true});
  if(signal.aborted){onAbort();return;}try{action?.();}catch(e){finish(e);}
 });
}
function makeCrop(vw:number,vh:number,w:number,h:number,focus:[number,number]=[.5,.5]){
 const ratio=w/h,cw=Math.min(vw,vh*ratio),ch=cw/ratio,clamp=(n:number)=>Math.max(0,Math.min(1,n));
 return {x:(vw-cw)*clamp(focus[0]),y:(vh-ch)*clamp(focus[1]),w:cw,h:ch};
}
async function build(scene:OpenMotionScene,clip:PremiumTravelClip,url:string,width:number,height:number,signal:AbortSignal):Promise<Atlas>{
 if(!trusted(url))throw Error('Unsupported footage URL');
 const response=await fetch(url,{signal,mode:'cors',credentials:'omit'});
 if(!response.ok)throw Error('Footage HTTP '+response.status);
 const length=Number(response.headers.get('content-length')??0);if(length>25*1024*1024)throw Error('Footage exceeds 25 MB');
 const blob=await response.blob();if(!blob.size||blob.size>25*1024*1024)throw Error('Invalid footage size');
 const objectUrl=URL.createObjectURL(blob),video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='auto';
 video.style.cssText='position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';document.body.appendChild(video);
 const pages:HTMLCanvasElement[]=[];
 try{
  await wait(video,'loadeddata',signal,()=>{video.src=objectUrl;video.load();});
  const duration=scene.durationSec,frames=Math.ceil(duration*FPS);
  if(!video.videoWidth||!video.videoHeight||!Number.isFinite(video.duration)||!Number.isFinite(clip.startSec)||clip.startSec<0||clip.startSec+duration>video.duration+.025)throw Error('Footage too short or invalid');
  const crop=makeCrop(video.videoWidth,video.videoHeight,width,height,clip.focus);
  for(let i=0;i<frames;i++){
   const at=Math.min(video.duration-.025,clip.startSec+(i+.5)/FPS);
   if(Math.abs(video.currentTime-at)>.002||video.seeking)await wait(video,'seeked',signal,()=>{video.currentTime=at;});
   if(video.readyState<2||signal.aborted)throw Error('Frame unavailable');
   const cell=i%PER_PAGE;
   if(cell===0){const page=document.createElement('canvas');page.width=width*COLS;page.height=height*Math.ceil(Math.min(PER_PAGE,frames-i)/COLS);pages.push(page);}
   const page=pages[pages.length-1],ctx=page.getContext('2d',{alpha:false});
   if(!ctx)throw Error('Atlas canvas unavailable');
   ctx.drawImage(video,crop.x,crop.y,crop.w,crop.h,(cell%COLS)*width,Math.floor(cell/COLS)*height,width,height);
   // Detect blocked canvas access before accepting a complete atlas.
   if(i===0)ctx.getImageData(0,0,1,1);
   if(i%8===7)await new Promise<void>(resolve=>setTimeout(resolve,0));
  }
  return {pages,width,height,frames,fps:FPS,clip};
 }catch(e){for(const page of pages){page.width=1;page.height=1;}throw e;}
 finally{video.pause();video.removeAttribute('src');video.load();video.remove();URL.revokeObjectURL(objectUrl);}
}
export function preparePremiumClips(project:OpenMotionProject,refresh:()=>void):Promise<void>{
 const existing=jobs.get(project);if(existing)return existing;
 const scenes=project.scenes.filter(s=>requestedPremiumClip(s));if(!scenes.length)return Promise.resolve();
 for(const scene of scenes)states.set(scene,{status:'preparing'});refresh();
 const job=(async()=>{
  let allocated=0;
  for(const scene of scenes){
   const clip=requestedPremiumClip(scene)!;
   // Higher resolution where the source permits; bounded working set on iPad.
   const width=clip.sourceHeight>=1080?432:360,height=width*16/9,frames=Math.ceil(scene.durationSec*FPS);
   const bytes=Math.ceil(frames/COLS)*COLS*width*height*4;
   if(!Number.isFinite(bytes)||bytes<=0||allocated+bytes>MAX_BYTES){states.set(scene,{status:'fallback',reason:'Atlas memory budget'});refresh();continue;}
   let last='No usable video source';
   for(const url of [...new Set([clip.videoUrl,clip.alternateUrl].filter((u):u is string=>Boolean(u)))]){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
    try{const atlas=await build(scene,clip,url,width,height,controller.signal);states.set(scene,{status:'ready',atlas});allocated+=bytes;break;}
    catch(error){last=error instanceof Error?error.message:String(error);}
    finally{clearTimeout(timer);}
   }
   if(!premiumClipReady(scene)){states.set(scene,{status:'fallback',reason:last});console.warn('Premium video fallback',scene.name,last);}
   refresh();
  }
 })();
 jobs.set(project,job);return job;
}
export function drawPremiumClip(ctx:CanvasRenderingContext2D,scene:OpenMotionScene,time:number,w:number,h:number):PremiumTravelClip|undefined{
 const a=states.get(scene)?.atlas;if(!a)return undefined;
 const i=Math.max(0,Math.min(a.frames-1,Math.floor(time*a.fps))),cell=i%PER_PAGE,page=a.pages[Math.floor(i/PER_PAGE)];
 ctx.drawImage(page,(cell%COLS)*a.width,Math.floor(cell/COLS)*a.height,a.width,a.height,0,0,w,h);
 return a.clip;
}
