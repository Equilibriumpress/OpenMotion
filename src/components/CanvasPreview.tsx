import { useCallback, useEffect, useRef, useState } from 'react';
import { preloadProjectImages, subscribeImageLoaded, notifyImageRefresh } from '../engine/imageCache';
import { renderOpenMotionFrame } from '../engine/openMotionRenderer';
import {seekBucketListPreview,subscribeBucketListMap,disposeBucketListProject} from '../engine/bucketListCamera';
import { OpenMotionProject, getProjectDurationSec } from '../types/openmotion';

interface CanvasPreviewProps {
  project: OpenMotionProject;
  timeSec: number;
  isPlaying?: boolean;
  onTimeUpdate?: (nextTimeSec: number) => void;
  renderScale?: number;
  className?: string;
}

export function CanvasPreview({
  project,timeSec,isPlaying=false,onTimeUpdate,renderScale=.5,className='',
}: CanvasPreviewProps) {
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const timeRef=useRef(timeSec);
  const onTimeUpdateRef=useRef(onTimeUpdate);
  const failedRef=useRef(false);
  const lastPaint=useRef<number|null>(null);
  const [renderError,setRenderError]=useState<string|null>(null);
  const internalWidth=Math.max(320,Math.round(project.width*renderScale));
  const internalHeight=Math.max(320,Math.round(project.height*renderScale));
  // Limit only the interactive cinematic preview. Offline MP4 still uses project fps.
  const cinematic=project.scenes.some(s=>s.doodle?.extras?.includes('song-cinematic-v2'));
  const previewFps=cinematic?30:60;

  useEffect(()=>{onTimeUpdateRef.current=onTimeUpdate;},[onTimeUpdate]);
  useEffect(()=>{if(!isPlaying)timeRef.current=timeSec;},[timeSec,isPlaying]);
  useEffect(()=>()=>disposeBucketListProject(project),[project]);
  useEffect(()=>{
    failedRef.current=false;lastPaint.current=null;setRenderError(null);
    void preloadProjectImages(project).catch(error=>{
      console.warn('Premium map or media preparation failed:',error);notifyImageRefresh();
    });
  },[project]);

  const paint=useCallback((t:number,force=false)=>{
    if(failedRef.current)return false;
    if(!force&&lastPaint.current===t)return true;
    const canvas=canvasRef.current;if(!canvas)return false;
    const ctx=canvas.getContext('2d');if(!ctx)return false;
    try{
      seekBucketListPreview(project,t);
      renderOpenMotionFrame(ctx,project,t,internalWidth,internalHeight);
      lastPaint.current=t;return true;
    }catch(error){
      failedRef.current=true;
      console.error('OpenMotion preview render failed',project.slug,t,error);
      // Reset a possibly incomplete Canvas save/restore stack before recovery.
      canvas.width=internalWidth;
      setRenderError(error instanceof Error?error.message:String(error));
      return false;
    }
  },[project,internalWidth,internalHeight]);

  // Subscribe once per renderer, not on every React time update.
  useEffect(()=>{
    lastPaint.current=null;
    paint(timeRef.current,true);
    const refresh=()=>{paint(timeRef.current,true);};
    const unsubscribeImages=subscribeImageLoaded(refresh);
    const unsubscribeMap=subscribeBucketListMap(refresh);
    return()=>{unsubscribeImages();unsubscribeMap();};
  },[paint]);

  // Scrubbing/stepping while paused. During playback only the RAF paints.
  useEffect(()=>{if(!isPlaying)paint(timeSec);},[paint,timeSec,isPlaying]);

  useEffect(()=>{
    if(!isPlaying||failedRef.current)return;
    let rafId=0,lastPaintTs=performance.now(),lastTick=lastPaintTs;
    const totalDur=Math.max(.5,getProjectDurationSec(project));
    const interval=1000/previewFps;
    const tick=(now:number)=>{
      // Accumulate wall time once, even when skipping a display refresh.
      if(now-lastPaintTs>=interval-1){
        const dt=Math.max(0,Math.min(.25,(now-lastTick)/1000));
        lastTick=now;lastPaintTs=now;
        const next=(timeRef.current+dt)%totalDur;
        timeRef.current=next;
        if(!paint(next))return;
        onTimeUpdateRef.current?.(next);
      }
      rafId=requestAnimationFrame(tick);
    };
    rafId=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafId);
  },[isPlaying,project,paint,previewFps]);

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <canvas ref={canvasRef} width={internalWidth} height={internalHeight}
        className={className} aria-label={`Live preview van ${project.title}`}/>
      {renderError&&<div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/95 p-4 text-center text-sm text-white">
        <p>Preview gestopt door een renderfout.</p><p className="break-all text-xs text-slate-300">{renderError}</p>
        <button type="button" className="rounded border border-slate-400 px-3 py-2" onClick={()=>{failedRef.current=false;lastPaint.current=null;setRenderError(null);paint(timeRef.current,true);}}>Probeer frame opnieuw</button>
        <p className="text-xs">Pauzeer en start opnieuw om verder af te spelen.</p>
      </div>}
    </div>
  );
}
