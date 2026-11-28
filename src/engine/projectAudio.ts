import {renderDocumentaryAudio} from './ambientAudio';
import { OpenMotionProject } from '../types/openmotion';
import { createParallaxAudio } from './parallaxCinemaAudio';
import { createPremiumTravelAudio } from './premiumTravelAudio';
import { createDoodleExplainerAudio } from './doodleExplainerAudio';
import { createBucketListAudio } from './bucketListAudio';

/** Resolve repository asset paths relative to the deployed Vite Pages base. */
export function projectAssetUrl(src: string, revision?:string): string {
  if (/^(https?:|blob:|data:)/i.test(src)) return src;
  const base = new URL(import.meta.env.BASE_URL || './', document.baseURI);
  const url=new URL(src.replace(/^\/+/, ''), base);if(revision)url.searchParams.set('v',revision);return url.href;
}

/** Decode and mix project tracks to a deterministic 48kHz stereo timeline. */
const cache=new WeakMap<OpenMotionProject,{duration:number,promise:Promise<AudioBuffer|null>}>();
export function mixProjectAudio(project:OpenMotionProject,durationSec:number):Promise<AudioBuffer|null>{
 const old=cache.get(project);if(old?.duration===durationSec)return old.promise;
 const promise=renderProjectAudio(project,durationSec).then(audio=>{
  if(!audio)return null;
  let peak=0,sum=0,count=0;
  for(let c=0;c<audio.numberOfChannels;c++)for(const v of audio.getChannelData(c)){if(!Number.isFinite(v))throw Error('Ongeldige audiosamples');peak=Math.max(peak,Math.abs(v));sum+=v*v;count++;}
  if(peak<.0001||Math.sqrt(sum/Math.max(1,count))<.00001)throw Error('Audiomix is stil: controleer audiobestanden, volume en timing.');
  if(peak>.95){const scale=.95/peak;for(let c=0;c<audio.numberOfChannels;c++){const d=audio.getChannelData(c);for(let i=0;i<d.length;i++)d[i]*=scale;}}
  return audio;
 }).catch(error=>{cache.delete(project);throw error;});
 cache.set(project,{duration:durationSec,promise});return promise;
}
async function renderProjectAudio(project: OpenMotionProject, durationSec: number): Promise<AudioBuffer | null> {
  const tracks = (project.audioTracks ?? []).filter(t => t.src?.trim());
  if (!tracks.length) {
    if (project.scenes.some(scene => scene.layout === 'parallax-cinema')) return createParallaxAudio(durationSec,project.scenes.some(scene=>scene.parallax?.variant==='living-travel-poster'&&scene.parallax?.destination==='japan')?'living-travel-japan':project.scenes.some(scene=>scene.parallax?.variant==='living-travel-poster'&&scene.parallax?.destination==='amalfi')?'living-travel-amalfi':project.scenes.some(scene=>scene.parallax?.variant==='living-travel-poster'&&(scene.parallax?.posterVersion==='2.0'||scene.parallax?.posterVersion==='3.0'))?'living-travel-swiss-electric':project.scenes.some(scene=>scene.parallax?.variant==='living-travel-poster')?'living-travel-poster':'window-seat');
    if (project.scenes.some(scene => scene.layout === 'premium-travel-route')) return createPremiumTravelAudio(durationSec);
    if (project.scenes.some(scene => scene.layout === 'doodle-explainer')) return createDoodleExplainerAudio(durationSec);
    if (project.scenes.some(scene => scene.layout === 'bucket-list-zoom')) return createBucketListAudio(durationSec,project.scenes.some(scene=>scene.bucketList?.directorsCut),project.scenes.some(scene=>Boolean(scene.bucketList?.atmosphere)));
    return renderDocumentaryAudio(durationSec);
  }
  const rate = 48000;
  const frames = Math.ceil(durationSec * rate);
  const offline = new OfflineAudioContext(2, frames, rate);
  {
    for (const track of tracks) {
      const response = await fetch(projectAssetUrl(track.src,project.mediaRevision));
      if (!response.ok) throw new Error(`Audio file not found: ${track.src} (${response.status})`);
      const decoded = await offline.decodeAudioData(await response.arrayBuffer());
      const start = Math.max(0,track.startSec || 0);
      const until = Math.min(durationSec, Number.isFinite(track.endSec) ? track.endSec! : start + decoded.duration);
      const len = Math.min(until-start,decoded.duration);
      if (len<=0) continue;
      const source=offline.createBufferSource();
      source.buffer=decoded;
      const gain=offline.createGain();
      const v=Math.min(1,Math.max(0,track.volume ?? 1));
      const fadeIn=Math.min(len/2,Math.max(0,track.fadeInSec ?? 0));
      const fadeOut=Math.min(len/2,Math.max(0,track.fadeOutSec ?? 0));
      gain.gain.setValueAtTime(fadeIn>0 ? 0 : v,start);
      if(fadeIn>0)gain.gain.linearRampToValueAtTime(v,start+fadeIn);
      if(fadeOut>0){gain.gain.setValueAtTime(v,Math.max(start+fadeIn,start+len-fadeOut));gain.gain.linearRampToValueAtTime(0,start+len);}
      source.connect(gain);gain.connect(offline.destination);
      source.start(start,0,len);
    }
    return await offline.startRendering();
  }
}
