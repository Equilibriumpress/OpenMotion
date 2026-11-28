import { useState } from 'react';
import { renderOpenMotionFrame } from '../engine/openMotionRenderer';
import { preloadProjectImages } from '../engine/imageCache';
import type { OpenMotionProject, RenderProgressState } from '../types/openmotion';
/** Compare the actual decoded master with a fresh frame from the same renderer.
 * Compression and video seeking can create small pixel differences.
 */
export function ExportFrameComparison({project,result}:{project:OpenMotionProject;result:RenderProgressState}){
 const [pair,setPair]=useState<{reference:string;encoded:string;time:number;error:number}|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const compare=async()=>{
  if(!result.outputUrl||!result.verification)return;
  setBusy(true);setError('');setPair(null);
  const video=document.createElement('video');video.muted=true;video.preload='auto';video.playsInline=true;
  const wait=(event:string)=>new Promise<void>((resolve,reject)=>{
   const cleanup=()=>{clearTimeout(timer);video.removeEventListener(event,ok);video.removeEventListener('error',fail);};
   const ok=()=>{cleanup();resolve();};const fail=()=>{cleanup();reject(Error('MP4-frame kon niet worden gedecodeerd.'));};
   const timer=setTimeout(fail,15000);video.addEventListener(event,ok,{once:true});video.addEventListener('error',fail,{once:true});
  });
  try{
   const loaded=wait('loadeddata');video.src=result.outputUrl;await loaded;
   const fps=result.verification.fps,t=Math.min(video.duration-2/fps,Math.floor(video.duration*.42*fps)/fps);
   const seek=wait('seeked');video.currentTime=t;await seek;
   await document.fonts.ready;await preloadProjectImages(project);
   const original=document.createElement('canvas');original.width=result.verification.width;original.height=result.verification.height;
   const ctx=original.getContext('2d',{alpha:false});if(!ctx)throw Error('Canvas ontbreekt.');
   renderOpenMotionFrame(ctx,project,t,original.width,original.height);
   const sample=(source:CanvasImageSource)=>{
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=455;
    const c=canvas.getContext('2d',{alpha:false,willReadFrequently:true});if(!c)throw Error('Canvas ontbreekt.');
    c.drawImage(source,0,0,256,455);return {url:canvas.toDataURL(),pixels:c.getImageData(0,0,256,455).data};
   };
   const ref=sample(original),enc=sample(video);let delta=0;for(let i=0;i<ref.pixels.length;i+=4)for(let k=0;k<3;k++)delta+=Math.abs(ref.pixels[i+k]-enc.pixels[i+k]);
   setPair({reference:ref.url,encoded:enc.url,time:t,error:100*delta/(256*455*3*255)});
  }catch(e){setError(e instanceof Error?e.message:String(e));}
  finally{video.removeAttribute('src');video.load();setBusy(false);}
 };
 return <div className="space-y-2 rounded-lg border p-3 text-xs">
  <button type="button" disabled={busy} className="w-full rounded border px-3 py-2 font-semibold" onClick={()=>void compare()}>{busy?'Frames vergelijken…':'Vergelijk preview met MP4-frame'}</button>
  {error&&<p role="alert" className="text-red-700">{error}</p>}
  {pair&&<><div className="grid grid-cols-2 gap-2"><figure><img className="w-full rounded" src={pair.reference} alt="Opnieuw gerenderd referentieframe"/><figcaption>Renderer</figcaption></figure><figure><img className="w-full rounded" src={pair.encoded} alt="Gedecodeerd frame uit MP4"/><figcaption>Werkelijke MP4</figcaption></figure></div><p>{pair.time.toFixed(2)} s · gemiddeld RGB-verschil {pair.error.toFixed(2)}%. Kleine verschillen door compressie en seek zijn normaal. Beoordeel ook visueel.</p></>}
 </div>;
}
