import { OpenMotionProject } from '../types/openmotion';

/** Resolve repository asset paths relative to the deployed Vite Pages base. */
export function projectAssetUrl(src: string): string {
  if (/^(https?:|blob:|data:)/i.test(src)) return src;
  const base = new URL(import.meta.env.BASE_URL || './', document.baseURI);
  return new URL(src.replace(/^\/+/, ''), base).href;
}

/** Decode and mix project tracks to a deterministic 48kHz stereo timeline. */
export async function mixProjectAudio(project: OpenMotionProject, durationSec: number): Promise<AudioBuffer | null> {
  const tracks = (project.audioTracks ?? []).filter(t => t.src?.trim());
  if (!tracks.length) return null;
  const rate = 48000;
  const frames = Math.ceil(durationSec * rate);
  const offline = new OfflineAudioContext(2, frames, rate);
  const decoder = new AudioContext();
  try {
    for (const track of tracks) {
      const response = await fetch(projectAssetUrl(track.src));
      if (!response.ok) throw new Error(`Audio file not found: ${track.src} (${response.status})`);
      const decoded = await decoder.decodeAudioData(await response.arrayBuffer());
      const start = Math.max(0,track.startSec || 0);
      const until = Math.min(durationSec, Number.isFinite(track.endSec) ? track.endSec! : start + decoded.duration);
      const len = Math.min(until-start,decoded.duration);
      if (len<=0) continue;
      const source=offline.createBufferSource();
      source.buffer=decoded;
      const gain=offline.createGain();
      const v=Math.min(2,Math.max(0,track.volume ?? 1));
      const fadeIn=Math.min(len/2,Math.max(0,track.fadeInSec ?? 0));
      const fadeOut=Math.min(len/2,Math.max(0,track.fadeOutSec ?? 0));
      gain.gain.setValueAtTime(fadeIn>0 ? 0 : v,start);
      if(fadeIn>0)gain.gain.linearRampToValueAtTime(v,start+fadeIn);
      if(fadeOut>0){gain.gain.setValueAtTime(v,Math.max(start+fadeIn,start+len-fadeOut));gain.gain.linearRampToValueAtTime(0,start+len);}
      source.connect(gain);gain.connect(offline.destination);
      source.start(start,0,len);
    }
    return await offline.startRendering();
  } finally {
    await decoder.close();
  }
}
