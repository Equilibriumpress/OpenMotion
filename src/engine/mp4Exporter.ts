import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import {
  OpenMotionProject,
  RenderExportOptions,
  RenderProgressState,
  getFormatDimensions,
  getProjectDurationSec,
} from '../types/openmotion';
import { preloadProjectImages } from './imageCache';
import { renderOpenMotionFrame } from './openMotionRenderer';

const H264_CODEC_CANDIDATES = [
  'avc1.640028', // High Profile Level 4.0 (1080p30/60)
  'avc1.64001f', // High Profile Level 3.1 (720p30)
  'avc1.4d002a', // Main Profile Level 4.2
  'avc1.42001f', // Baseline Profile Level 3.1
];

async function pickSupportedH264Config(
  width: number,
  height: number,
  fps: number,
  bitrate: number
): Promise<VideoEncoderConfig | null> {
  if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') {
    return null;
  }

  for (const codec of H264_CODEC_CANDIDATES) {
    const config: VideoEncoderConfig = {
      codec,
      width,
      height,
      bitrate,
      framerate: fps,
      avc: { format: 'avc' },
    };
    try {
      const support = await VideoEncoder.isConfigSupported(config);
      if (support.supported) {
        return config;
      }
    } catch {
      // Try next H.264 profile candidate
    }
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function exportProjectToMp4(
  project: OpenMotionProject,
  options: RenderExportOptions,
  onProgress: (state: RenderProgressState) => void,
  signal?: AbortSignal
): Promise<RenderProgressState> {
  const startedAt = performance.now();
  const dims = getFormatDimensions(project.format, options.resolution);
  // H.264 requires even dimensions
  const width = dims.width % 2 === 0 ? dims.width : dims.width - 1;
  const height = dims.height % 2 === 0 ? dims.height : dims.height - 1;
  const fps = options.fps;
  const durationSec = Math.max(0.5, getProjectDurationSec(project));
  const totalFrames = Math.max(1, Math.ceil(durationSec * fps));
  const bitrate = Math.round(options.bitrateMbps * 1_000_000);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('Kan geen 2D canvas context initialiseren voor video-export.');
  }

  // Ensure web fonts and documentary photography are fully decoded before rendering frames
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  await preloadProjectImages(project);

  const h264Config = await pickSupportedH264Config(width, height, fps, bitrate);

  if (h264Config) {
    return encodeWithWebCodecsMp4({
      canvas,
      ctx,
      project,
      width,
      height,
      fps,
      totalFrames,
      h264Config,
      startedAt,
      onProgress,
      signal,
    });
  }

  return encodeWithMediaRecorderFallback({
    canvas,
    ctx,
    project,
    width,
    height,
    fps,
    totalFrames,
    bitrate,
    startedAt,
    onProgress,
    signal,
  });
}

async function encodeWithWebCodecsMp4(params: {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  project: OpenMotionProject;
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
  h264Config: VideoEncoderConfig;
  startedAt: number;
  onProgress: (state: RenderProgressState) => void;
  signal?: AbortSignal;
}): Promise<RenderProgressState> {
  const {
    canvas,
    ctx,
    project,
    width,
    height,
    fps,
    totalFrames,
    h264Config,
    startedAt,
    onProgress,
    signal,
  } = params;

  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: {
      codec: 'avc',
      width,
      height,
      frameRate: fps,
    },
    fastStart: 'in-memory',
  });

  let encoderError: Error | null = null;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (err) => {
      encoderError = err instanceof Error ? err : new Error(String(err));
    },
  });

  encoder.configure(h264Config);

  const frameDurationUs = Math.round(1_000_000 / fps);

  try {
    for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
      if (signal?.aborted) {
        encoder.close();
        throw new Error('MP4-export geannuleerd door gebruiker.');
      }
      if (encoderError) {
        throw encoderError;
      }

      const timeSec = frameIdx / fps;
      renderOpenMotionFrame(ctx, project, timeSec, width, height);

      const videoFrame = new VideoFrame(canvas, {
        timestamp: frameIdx * frameDurationUs,
        duration: frameDurationUs,
      });

      const keyFrame = frameIdx % (fps * 2) === 0;
      encoder.encode(videoFrame, { keyFrame });
      videoFrame.close();

      // Backpressure guard so memory stays low even at 1080p60
      if (encoder.encodeQueueSize > 8) {
        await new Promise((resolve) => setTimeout(resolve, 4));
      }

      if (frameIdx % 3 === 0 || frameIdx === totalFrames - 1) {
        onProgress({
          phase: 'rendering',
          currentFrame: frameIdx + 1,
          totalFrames,
          percent: Math.round(((frameIdx + 1) / totalFrames) * 92),
          container: 'mp4',
          encoderLabel: `WebCodecs H.264 (${h264Config.codec})`,
        });
        // Yield to keep UI responsive
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    onProgress({
      phase: 'muxing',
      currentFrame: totalFrames,
      totalFrames,
      percent: 96,
      container: 'mp4',
      encoderLabel: `WebCodecs H.264 (${h264Config.codec})`,
    });

    await encoder.flush();
    encoder.close();
    muxer.finalize();

    const mp4Blob = new Blob([target.buffer], { type: 'video/mp4' });
    const outputUrl = URL.createObjectURL(mp4Blob);
    const fileName = `${project.slug}-${width}x${height}-${fps}fps.mp4`;

    const finalState: RenderProgressState = {
      phase: 'done',
      currentFrame: totalFrames,
      totalFrames,
      percent: 100,
      container: 'mp4',
      encoderLabel: `WebCodecs H.264 (${h264Config.codec})`,
      outputUrl,
      fileName,
      fileSizeBytes: mp4Blob.size,
      elapsedMs: Math.round(performance.now() - startedAt),
    };
    onProgress(finalState);
    return finalState;
  } catch (err) {
    try {
      if (encoder.state !== 'closed') encoder.close();
    } catch {
      // Ignore cleanup errors
    }
    throw err;
  }
}

async function encodeWithMediaRecorderFallback(params: {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  project: OpenMotionProject;
  width: number;
  height: number;
  fps: number;
  totalFrames: number;
  bitrate: number;
  startedAt: number;
  onProgress: (state: RenderProgressState) => void;
  signal?: AbortSignal;
}): Promise<RenderProgressState> {
  const {
    canvas,
    ctx,
    project,
    width,
    height,
    fps,
    totalFrames,
    bitrate,
    startedAt,
    onProgress,
    signal,
  } = params;

  const mimeCandidates = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const chosenMime =
    mimeCandidates.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) ??
    'video/webm';
  const isMp4 = chosenMime.startsWith('video/mp4');
  const container: 'mp4' | 'webm' = isMp4 ? 'mp4' : 'webm';

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: chosenMime,
    videoBitsPerSecond: bitrate,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (ev) => {
    if (ev.data && ev.data.size > 0) chunks.push(ev.data);
  };

  const stopPromise = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: chosenMime }));
    recorder.onerror = () => reject(new Error('MediaRecorder fout tijdens video-opname.'));
  });

  recorder.start();
  const frameIntervalMs = 1000 / fps;

  for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
    if (signal?.aborted) {
      recorder.stop();
      throw new Error('Export geannuleerd door gebruiker.');
    }
    const frameStart = performance.now();
    renderOpenMotionFrame(ctx, project, frameIdx / fps, width, height);

    if (frameIdx % 3 === 0 || frameIdx === totalFrames - 1) {
      onProgress({
        phase: 'rendering',
        currentFrame: frameIdx + 1,
        totalFrames,
        percent: Math.round(((frameIdx + 1) / totalFrames) * 95),
        container,
        encoderLabel: `MediaRecorder (${chosenMime})`,
      });
    }

    const spent = performance.now() - frameStart;
    const wait = Math.max(1, frameIntervalMs - spent);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }

  recorder.stop();
  const blob = await stopPromise;
  const outputUrl = URL.createObjectURL(blob);
  const fileName = `${project.slug}-${width}x${height}-${fps}fps.${container}`;

  const finalState: RenderProgressState = {
    phase: 'done',
    currentFrame: totalFrames,
    totalFrames,
    percent: 100,
    container,
    encoderLabel: `MediaRecorder (${chosenMime})`,
    outputUrl,
    fileName,
    fileSizeBytes: blob.size,
    elapsedMs: Math.round(performance.now() - startedAt),
  };
  onProgress(finalState);
  return finalState;
}
