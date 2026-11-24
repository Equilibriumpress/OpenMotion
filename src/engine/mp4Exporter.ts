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
import { mixProjectAudio } from './projectAudio';


async function probeAacEncoder(): Promise<AudioEncoderConfig | null> {
  if (typeof AudioEncoder === 'undefined' || typeof AudioData === 'undefined') return null;
  const config: AudioEncoderConfig = {codec:'mp4a.40.2', sampleRate:48000, numberOfChannels:2, bitrate:128000};
  try { return (await AudioEncoder.isConfigSupported(config)).supported ? config : null; }
  catch { return null; }
}

async function encodeAacAudio(audio:AudioBuffer, config:AudioEncoderConfig, muxer:Muxer<ArrayBufferTarget>):Promise<void> {
  let failure: Error | null = null;
  const encoder = new AudioEncoder({
    output: (chunk,meta) => muxer.addAudioChunk(chunk,meta),
    error: error => {failure = error instanceof Error ? error : new Error(String(error));},
  });
  encoder.configure(config);
  try {
    const blockSize=1024;
    for(let start=0;start<audio.length;start+=blockSize){
      if(failure) throw failure;
      const frames=Math.min(blockSize,audio.length-start);
      const samples=new Float32Array(frames*2);
      samples.set(audio.getChannelData(0).subarray(start,start+frames),0);
      samples.set(audio.getChannelData(1).subarray(start,start+frames),frames);
      const packet=new AudioData({format:'f32-planar',sampleRate:48000,numberOfFrames:frames,numberOfChannels:2,timestamp:Math.round(start*1000000/48000),data:samples});
      encoder.encode(packet);packet.close();
      if(encoder.encodeQueueSize>12) await encoder.flush();
    }
    await encoder.flush();
    if(failure) throw failure;
  } finally { if(encoder.state!=='closed')encoder.close(); }
}

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

/**
 * The iPad MediaRecorder encoder may silently reduce canvas.captureStream()
 * resolution. Inspect the encoded file before giving it a download filename.
 * Never promise 1080×1920 when the actual stream is 512×910.
 */
async function actualVideoSize(blob: Blob): Promise<{ width: number; height: number } | null> {
  const video = document.createElement('video');
  const url = URL.createObjectURL(blob);
  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;
  try {
    return await new Promise(resolve => {
      let done = false;
      const finish = (value: { width: number; height: number } | null) => {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        resolve(value);
      };
      const timeout = setTimeout(() => finish(null), 7000);
      video.onloadedmetadata = () =>
        finish(video.videoWidth && video.videoHeight ? {width: video.videoWidth, height: video.videoHeight} : null);
      video.onerror = () => finish(null);
      video.src = url;
      video.load();
    });
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(url);
  }
}
function describeOutput(
  actual: {width: number; height: number} | null,
  intendedWidth: number,
  intendedHeight: number,
  encoder: string
) {
  const w = actual?.width ?? intendedWidth, h = actual?.height ?? intendedHeight;
  const resolution = w + 'x' + h;
  const warning = actual
    ? w !== intendedWidth || h !== intendedHeight
      ? ' · Let op: browser verlaagde resolutie tot ' + resolution + ' (gevraagd ' + intendedWidth + 'x' + intendedHeight + ')'
      : ' · gecontroleerd: ' + resolution
    : ' · bestandsresolutie niet geverifieerd';
  return {w,h,encoderLabel:encoder+warning};
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
  const mixedAudio = await mixProjectAudio(project, durationSec);
  const audioConfig = mixedAudio ? await probeAacEncoder() : null;

  const h264Config = await pickSupportedH264Config(width, height, fps, bitrate);

  if (h264Config && (!mixedAudio || audioConfig)) {
    return encodeWithWebCodecsMp4({
      mixedAudio,
      audioConfig,
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
    mixedAudio,
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
  mixedAudio: AudioBuffer | null;
  audioConfig: AudioEncoderConfig | null;
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
    mixedAudio,
    audioConfig,
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
    ...(mixedAudio ? {audio: {codec: 'aac' as const, sampleRate: 48000, numberOfChannels: 2}} : {}),
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
  if (mixedAudio && audioConfig) await encodeAacAudio(mixedAudio, audioConfig, muxer);

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
    const inspected = describeOutput(await actualVideoSize(mp4Blob),width,height,`WebCodecs H.264 (${h264Config.codec})`);
    const outputUrl = URL.createObjectURL(mp4Blob);
    const fileName = `${project.slug}-${inspected.w}x${inspected.h}-${fps}fps.mp4`;

    const finalState: RenderProgressState = {
      phase: 'done',
      currentFrame: totalFrames,
      totalFrames,
      percent: 100,
      container: 'mp4',
      encoderLabel: inspected.encoderLabel,
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
  mixedAudio: AudioBuffer | null;
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
    mixedAudio,
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
  let fallbackContext: AudioContext | null = null;
  let fallbackSource: AudioBufferSourceNode | null = null;
  if (mixedAudio) {
    fallbackContext = new AudioContext();
    const destination = fallbackContext.createMediaStreamDestination();
    fallbackSource = fallbackContext.createBufferSource();
    fallbackSource.buffer = mixedAudio;
    fallbackSource.connect(destination);
    for (const track of destination.stream.getAudioTracks()) stream.addTrack(track);
    await fallbackContext.resume();
  }
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
  if(fallbackSource && fallbackContext) fallbackSource.start(fallbackContext.currentTime);
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
  fallbackSource?.disconnect();
  await fallbackContext?.close();
  const inspected = describeOutput(await actualVideoSize(blob),width,height,`MediaRecorder (${chosenMime})`);
  const outputUrl = URL.createObjectURL(blob);
  const fileName = `${project.slug}-${inspected.w}x${inspected.h}-${fps}fps.${container}`;

  const finalState: RenderProgressState = {
    phase: 'done',
    currentFrame: totalFrames,
    totalFrames,
    percent: 100,
    container,
    encoderLabel: inspected.encoderLabel,
    outputUrl,
    fileName,
    fileSizeBytes: blob.size,
    elapsedMs: Math.round(performance.now() - startedAt),
  };
  onProgress(finalState);
  return finalState;
}
