import { useEffect, useRef } from 'react';
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
  project,
  timeSec,
  isPlaying = false,
  onTimeUpdate,
  renderScale = 0.5,
  className = '',
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeRef = useRef<number>(timeSec);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    timeRef.current = timeSec;
  }, [timeSec]);

  // Release the offscreen WebGL context when switching projects. Especially
  // important on iPad, where simultaneous MapLibre contexts are limited.
  useEffect(()=>()=>disposeBucketListProject(project),[project]);

  // Compute crisp internal canvas pixel dimensions proportional to aspect format
  const internalWidth = Math.max(320, Math.round(project.width * renderScale));
  const internalHeight = Math.max(320, Math.round(project.height * renderScale));

  // Preload documentary images referenced by the project
  useEffect(() => {
    void preloadProjectImages(project).catch((error) => {
      console.warn('Premium map or media preparation failed:', error);
      notifyImageRefresh();
    });
  }, [project]);

  // Render single frame whenever project, size, scrubbed time, or newly loaded photo updates
  useEffect(() => {
    const paint = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      seekBucketListPreview(project,timeRef.current);
      renderOpenMotionFrame(ctx, project, timeRef.current, internalWidth, internalHeight);
    };
    paint();
    const unsubscribeImages=subscribeImageLoaded(paint);
    const unsubscribeMap=subscribeBucketListMap(paint);
    return ()=>{unsubscribeImages();unsubscribeMap();};
  }, [project, timeSec, internalWidth, internalHeight]);

  // Real-time deterministic requestAnimationFrame loop when playing
  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();
    const totalDur = Math.max(0.5, getProjectDurationSec(project));

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTs) / 1000);
      lastTs = now;
      const nextTime = (timeRef.current + dt) % totalDur;
      timeRef.current = nextTime;

      seekBucketListPreview(project,nextTime);
      renderOpenMotionFrame(ctx, project, nextTime, internalWidth, internalHeight);
      if (onTimeUpdateRef.current) {
        onTimeUpdateRef.current(nextTime);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, project, internalWidth, internalHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={internalWidth}
      height={internalHeight}
      className={className}
      aria-label={`Live preview van ${project.title}`}
    />
  );
}
