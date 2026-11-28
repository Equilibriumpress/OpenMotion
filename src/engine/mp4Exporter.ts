import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import {
  OpenMotionProject,
  RenderExportOptions,
  RenderProgressState,
  getFormatDimensions,
  getProjectDurationSec,
} from '../types/openmotion';
import { preloadProjectImages, assertTravelMediaReady } from './imageCache';
import { isTravelDocumentary } from './travelProject';
import { renderOpenMotionFrame } from './openMotionRenderer';
import { mixProjectAudio } from './projectAudio';
import {beginBucketListExport,captureBucketListExportFrame,endBucketListExport} from './bucketListCamera';


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
  'avc1.64002a', // High Profile Level 4.2 (1080p60)
  'avc1.640028', // High Profile Level 4.0 (1080p30)
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
/**
 * Inspect the MP4 track handlers in the file's trailing/leading metadata.
 * Safari MediaRecorder has been seen to silently drop the Web Audio track.
 * This is a post-encode check, not an assumption based on the input stream.
 */
export async function containsMp4AudioTrack(blob:Blob):Promise<boolean|null>{
  if(!blob.type.startsWith('video/mp4'))return null;
  const read=async(start:number,end:number)=>new Uint8Array(await blob.slice(start,end).arrayBuffer());
  const chunk=2*1024*1024;
  const sections=[await read(0,Math.min(blob.size,chunk))];
  if(blob.size>chunk)sections.push(await read(Math.max(0,blob.size-chunk),blob.size));
  let sawHandler=false;
  for(const bytes of sections) {
    for(let i=0;i+16<bytes.length;i++){
      if(bytes[i]===104&&bytes[i+1]===100&&bytes[i+2]===108&&bytes[i+3]===114){
        sawHandler=true;
        if(bytes[i+12]===115&&bytes[i+13]===111&&bytes[i+14]===117&&bytes[i+15]===110)return true;
      }
    }
  }
  return sawHandler?false:null;
}

/**
 * Read the video track's mdhd/stts atoms instead of trusting the selected
 * FPS. Safari has been observed recording 30 fps when captureStream(60) was
 * requested. A missing or fragmented sample table yields null, not a guess.
 */
export async function actualMp4FrameRate(blob:Blob):Promise<number|null>{
  if(!blob.type.startsWith('video/mp4'))return null;
  const extent=2*1024*1024;
  const parts=[new Uint8Array(await blob.slice(0,Math.min(blob.size,extent)).arrayBuffer())];
  if(blob.size>extent)parts.push(new Uint8Array(await blob.slice(Math.max(0,blob.size-extent)).arrayBuffer()));
  type Atom={start:number;end:number;type:string};
  for(const bytes of parts){
    const read=(i:number)=>bytes[i]*16777216+bytes[i+1]*65536+bytes[i+2]*256+bytes[i+3];
    const label=(i:number)=>String.fromCharCode(bytes[i],bytes[i+1],bytes[i+2],bytes[i+3]);
    const children=(start:number,end:number):Atom[]=>{
      const found:Atom[]=[];let i=start;
      while(i+8<=end){
        const length=read(i);
        if(length<8||i+length>end)break;
        found.push({start:i,end:i+length,type:label(i+4)});
        i+=length;
      }
      return found;
    };
    // A moov atom can reside at either end of the MP4. A tail chunk may
    // begin in the middle of mdat, so search validated moov boundaries.
    for(let pos=4;pos+8<bytes.length;pos++){
      if(label(pos)!=='moov')continue;
      const start=pos-4,size=read(start);
      if(size<16||start+size>bytes.length)continue;
      for(const trak of children(start+8,start+size).filter(b=>b.type==='trak')){
        const mdia=children(trak.start+8,trak.end).find(b=>b.type==='mdia');
        if(!mdia)continue;
        const mdiaBoxes=children(mdia.start+8,mdia.end);
        const hdlr=mdiaBoxes.find(b=>b.type==='hdlr');
        const mdhd=mdiaBoxes.find(b=>b.type==='mdhd');
        const minf=mdiaBoxes.find(b=>b.type==='minf');
        if(!hdlr||!mdhd||!minf||label(hdlr.start+16)!=='vide')continue;
        const isV1=bytes[mdhd.start+8]===1;
        const scaleAt=mdhd.start+(isV1?28:20);
        if(scaleAt+4>mdhd.end)continue;
        const timescale=read(scaleAt);
        const stbl=children(minf.start+8,minf.end).find(b=>b.type==='stbl');
        const stts=stbl&&children(stbl.start+8,stbl.end).find(b=>b.type==='stts');
        if(!stts||!timescale)continue;
        const entries=read(stts.start+12);
        let samples=0,ticks=0;
        for(let j=0;j<entries;j++){
          const at=stts.start+16+j*8;
          if(at+8>stts.end)break;
          const count=read(at),delta=read(at+4);
          samples+=count;ticks+=count*delta;
        }
        if(samples&&ticks){
          const fps=samples*timescale/ticks;
          if(fps>0&&fps<=240)return Math.round(fps*100)/100;
        }
      }
    }
  }
  return null;
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

/** Lossless-in-time stereo PCM 16-bit WAV for iPad browsers unable to
 * include Web Audio in MediaRecorder MP4. This is a standalone file, not a
 * claim that the MP4 contains audio. It can be imported in a video editor.
 */
function pcmWav(audio:AudioBuffer):Blob{
  const channels=2,rate=audio.sampleRate,frames=audio.length;
  const buffer=new ArrayBuffer(44+frames*channels*2);
  const view=new DataView(buffer);
  const ascii=(at:number,value:string)=>{
    for(let i=0;i<value.length;i++)view.setUint8(at+i,value.charCodeAt(i));
  };
  ascii(0,'RIFF');view.setUint32(4,36+frames*channels*2,true);
  ascii(8,'WAVE');ascii(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);
  view.setUint16(22,channels,true);view.setUint32(24,rate,true);
  view.setUint32(28,rate*channels*2,true);view.setUint16(32,channels*2,true);
  view.setUint16(34,16,true);ascii(36,'data');
  view.setUint32(40,frames*channels*2,true);
  const left=audio.getChannelData(0),right=audio.getChannelData(audio.numberOfChannels>1?1:0);
  for(let i=0;i<frames;i++){
    const a=Math.max(-1,Math.min(1,left[i])),b=Math.max(-1,Math.min(1,right[i]));
    view.setInt16(44+i*4,a<0?a*32768:a*32767,true);
    view.setInt16(46+i*4,b<0?b*32768:b*32767,true);
  }
  return new Blob([buffer],{type:'audio/wav'});
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
  let width = dims.width % 2 === 0 ? dims.width : dims.width - 1;
  let height = dims.height % 2 === 0 ? dims.height : dims.height - 1;
  const fps = options.fps;
  const durationSec = Math.max(0.5, getProjectDurationSec(project));
  const totalFrames = Math.max(1, Math.ceil(durationSec * fps));
  const bitrate = Math.round(options.bitrateMbps * 1_000_000);
  const strictTravel=isTravelDocumentary(project);
  const strictHuman=project.seriesId==='the-human-side';
  const strictError='Deze browser ondersteunt geen betrouwbare H.264/AAC-export op de gekozen resolutie en framerate. Gebruik de handmatige GitHub-master voor dit project.';
  if((strictTravel||strictHuman) && !project.audioTracks?.some(t=>t.kind==='voiceover'&&t.src?.trim()))throw new Error('Voice-over ontbreekt in het project. Open de gepubliceerde Studio opnieuw.');
  const travelVideoConfig=strictTravel?await pickSupportedH264Config(width,height,fps,bitrate):null;
  if(strictTravel&&(!travelVideoConfig||!await probeAacEncoder()))throw new Error(strictError);

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
  assertTravelMediaReady(project);
  const mixedAudio = await mixProjectAudio(project, durationSec);
  const audioConfig = mixedAudio ? await probeAacEncoder() : null;

  if(strictTravel&&(!mixedAudio||!audioConfig))throw new Error(strictError);
  let h264Config = travelVideoConfig ?? await pickSupportedH264Config(width, height, fps, bitrate);
  let encoderNote = '';
  // A browser may decline 1080×1920 while supporting 720×1280 H.264
  // with AAC. Prefer that encoded-and-muxed result to the Safari
  // MediaRecorder fallback observed to shrink exports to 512×910.
  if(!strictTravel && !strictHuman && !h264Config && audioConfig && Math.max(width,height)>1280) {
    const factor=1280/Math.max(width,height);
    const w=Math.max(2,Math.floor(width*factor/2)*2);
    const h=Math.max(2,Math.floor(height*factor/2)*2);
    const supported=await pickSupportedH264Config(w,h,fps,Math.min(bitrate,6_000_000));
    if(supported){
      width=w;height=h;canvas.width=w;canvas.height=h;
      h264Config=supported;
      encoderNote=' · 720p AAC-fallback: browser ondersteunt geen 1080p WebCodecs';
    }
  }

  const isBucketList=project.scenes.some(scene=>scene.layout==='bucket-list-zoom');
  if(isBucketList)await beginBucketListExport(project,signal);
  try{
    if (h264Config && (!mixedAudio || audioConfig)) {
      return await encodeWithWebCodecsMp4({
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
        encoderNote,
        startedAt,
        onProgress,
        signal,
      });
    }

    if(strictTravel)throw new Error(strictError);
    return await encodeWithMediaRecorderFallback({
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
  }finally{
    if(isBucketList)endBucketListExport(project);
  }
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
  encoderNote: string;
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
    encoderNote,
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
      await captureBucketListExportFrame(project,timeSec,signal);
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
    const actual=await actualVideoSize(mp4Blob);
    const measuredFps=await actualMp4FrameRate(mp4Blob);
    const audioTrack=mixedAudio?await containsMp4AudioTrack(mp4Blob):null;
    if((isTravelDocumentary(project)||project.seriesId==='the-human-side')&&(!actual||actual.width!==width||actual.height!==height||measuredFps===null||Math.abs(measuredFps-fps)>.05||audioTrack!==true))throw new Error('Mastercontrole mislukt: resolutie, framerate of AAC-audiospoor niet bevestigd. Gebruik de handmatige GitHub-master.');
    const verified=measuredFps===null?' · framerate niet geverifieerd':' · gemeten '+measuredFps+' fps';
    const inspected = describeOutput(actual,width,height,`WebCodecs H.264 (${h264Config.codec})`+encoderNote+verified+(audioTrack===true?' · audiotrack gecontroleerd':''));
    const outputUrl = URL.createObjectURL(mp4Blob);
    const fileName = `${project.slug}-${actual?inspected.w+'x'+inspected.h:'res-onbekend'}-${measuredFps===null?'fps-onbekend':measuredFps+'fps'}.mp4`;

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
    // Ask explicitly for the AAC audio track in MP4 when supported.
    ...(mixedAudio ? [
      'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2'
    ] : []),
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  const chosenMime =
    mimeCandidates.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) ??
    'video/webm';
  const isMp4 = chosenMime.startsWith('video/mp4');
  const container: 'mp4' | 'webm' = isMp4 ? 'mp4' : 'webm';

  const videoStream = canvas.captureStream(fps);
  const stream = new MediaStream(videoStream.getVideoTracks());
  let fallbackContext: AudioContext | null = null;
  let fallbackSource: AudioBufferSourceNode | null = null;
  let warmup: OscillatorNode | null = null;
  if (mixedAudio) {
    fallbackContext = new AudioContext();
    const destination = fallbackContext.createMediaStreamDestination();
    fallbackSource = fallbackContext.createBufferSource();
    fallbackSource.buffer = mixedAudio;
    const recordGain = fallbackContext.createGain();
    recordGain.gain.value=.95;
    fallbackSource.connect(recordGain);
    recordGain.connect(destination);

    // Keep the graph active on Safari before MediaRecorder starts, even
    // though the soundtrack begins a moment later. No audible warm-up.
    warmup=fallbackContext.createOscillator();
    warmup.frequency.value=19;
    const quiet=fallbackContext.createGain();
    quiet.gain.value=.00001;
    warmup.connect(quiet);
    quiet.connect(destination);
    const silentMonitor=fallbackContext.createGain();
    silentMonitor.gain.value=0;
    recordGain.connect(silentMonitor);
    silentMonitor.connect(fallbackContext.destination);
    await fallbackContext.resume();
    warmup.start();
    for (const track of destination.stream.getAudioTracks()) stream.addTrack(track);
    if(!stream.getAudioTracks().length)throw new Error('Geen audiospoor beschikbaar in Safari MediaStream.');
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
  if(fallbackSource && fallbackContext) fallbackSource.start(fallbackContext.currentTime+.03);
  const frameIntervalMs = 1000 / fps;

  for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
    if (signal?.aborted) {
      recorder.stop();
      throw new Error('Export geannuleerd door gebruiker.');
    }
    const frameStart = performance.now();
    await captureBucketListExportFrame(project,frameIdx/fps,signal);
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
  try{warmup?.stop();}catch{/* oscillator may have already stopped */}
  warmup?.disconnect();
  fallbackSource?.disconnect();
  await fallbackContext?.close();
  const audioTrackFound = mixedAudio && isMp4 ? await containsMp4AudioTrack(blob) : null;
  const audioStatus = mixedAudio && audioTrackFound===false
    ? ' · WAARSCHUWING: deze Safari-export mist een audiospoor. Exporteer op een browser met AAC/WebCodecs-ondersteuning.'
    : mixedAudio && audioTrackFound===true ? ' · AAC-audiospoor gecontroleerd' : '';
  const measuredFps=await actualMp4FrameRate(blob);
  const fpsStatus=measuredFps===null
    ? ' · Werkelijke framerate niet meetbaar in dit bestand'
    : Math.abs(measuredFps-fps)>.5
      ? ' · LET OP: feitelijk '+measuredFps+' fps (gevraagd '+fps+')'
      : ' · framerate gecontroleerd: '+measuredFps+' fps';
  const actual=await actualVideoSize(blob);
  if(project.seriesId==='the-human-side'&&(!isMp4||!actual||actual.width!==width||actual.height!==height||audioTrackFound!==true||measuredFps===null||Math.abs(measuredFps-fps)>.5)){
    throw new Error('The Human Side: export afgekeurd. De browser leverde geen MP4 met de gekozen resolutie, framerate en audiospoor. Gebruik de handmatige GitHub-masterexport.');
  }
  const inspected = describeOutput(actual,width,height,`MediaRecorder (${chosenMime})`+audioStatus+fpsStatus);
  const outputUrl = URL.createObjectURL(blob);
  const fpsLabel=measuredFps===null?'fps-onbekend':measuredFps+'fps';
  const fileName = `${project.slug}-${inspected.w}x${inspected.h}-${fpsLabel}.${container}`;

  // Safari sometimes omits the music track even when input tracks exist.
  // Supply an accurately timed WAV as a separate editing fallback.
  const audioSidecarUrl=mixedAudio && audioTrackFound!==true
    ? URL.createObjectURL(pcmWav(mixedAudio)) : undefined;
  const finalState: RenderProgressState = {
    phase: 'done',
    currentFrame: totalFrames,
    totalFrames,
    percent: 100,
    container,
    encoderLabel: inspected.encoderLabel,
    outputUrl,
    fileName,
    audioSidecarUrl,
    audioSidecarName:audioSidecarUrl?project.slug+'-soundtrack.wav':undefined,
    fileSizeBytes: blob.size,
    elapsedMs: Math.round(performance.now() - startedAt),
  };
  onProgress(finalState);
  return finalState;
}
