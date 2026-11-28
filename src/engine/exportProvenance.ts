import type { OpenMotionProject, RenderProgressState } from '../types/openmotion';
import { getProjectDurationSec } from '../types/openmotion';
export const RENDERER_REVISION='simply-explained-3.3-final';
export function assertFinalTimeline(p:OpenMotionProject){
 if(p.seriesId!=='simply-explained'||p.templateVersion!=='3.3')return;
 const duration=getProjectDurationSec(p);
 const required=['simply-explained-v1','simply-explained-v11','simply-explained-v2','alex-26','alex-27-layout','alex-performance-v1','alex-quality-v1','alex-final-v1'];
 if(!p.scenes.every(s=>required.every(k=>s.doodle?.extras?.includes(k))))throw Error('Project 3.3 en renderermarkers komen niet overeen. Herlaad de gepubliceerde aflevering.');
 const voice=p.audioTracks?.find(t=>t.kind==='voiceover');
 if(!voice||Math.abs((voice.endSec??0)-duration)>.034)throw Error('Voice-over en tijdlijn hebben verschillende lengtes.');
 if(p.captions?.some(c=>c.startSec<0||c.endSec>duration+.001||c.endSec<=c.startSec))throw Error('Ondertiteling valt buiten de tijdlijn.');
 if(p.slug==='simply-explained-001-how-ai-actually-works'&&(Math.abs(duration-41)>.001||p.scenes[0].durationSec!==.8))throw Error('Verkeerde pilottijdlijn. Verwacht 41 s met een intro van 0,8 s.');
}
export function rendererLabel(p:OpenMotionProject){
 if(p.seriesId!=='simply-explained')return 'Canvas';
 if(p.templateVersion==='3.3'&&p.scenes.every(s=>s.doodle?.extras?.includes('alex-final-v1')&&s.doodle?.extras?.includes('alex-quality-v1')))return RENDERER_REVISION;
 return 'Simply Explained '+(p.templateVersion??'onbekend');
}
async function sha256(bytes:BufferSource){
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function makeReceipt(p:OpenMotionProject,blob:Blob,actual:{width:number;height:number;duration:number},fps:number):Promise<NonNullable<RenderProgressState['verification']>>{
 return {projectSlug:p.slug,templateVersion:p.templateVersion??'onbekend',renderer:rendererLabel(p),buildRevision:p.buildRevision??'local',mediaRevision:p.mediaRevision??'unknown',timelineSec:getProjectDurationSec(p),actualDurationSec:actual.duration,width:actual.width,height:actual.height,fps,bytes:blob.size,sha256:await sha256(await blob.arrayBuffer()),projectSha256:await sha256(new TextEncoder().encode(JSON.stringify(p))),audioVerified:true};
}
export async function downloadVerifiedZip(state:RenderProgressState){
 if(!state.publicationVerified||!state.verification||!state.outputUrl||!state.fileName)throw Error('Geen geverifieerd origineel beschikbaar.');
 const blob=await (await fetch(state.outputUrl)).blob();
 if(await sha256(await blob.arrayBuffer())!==state.verification.sha256)throw Error('MP4 komt niet overeen met het exportbewijs.');
 const {default:JSZip}=await import('jszip');
 const zip=new JSZip();zip.file(state.fileName,blob);zip.file('export-verification.json',JSON.stringify(state.verification,null,2));
 const result=await zip.generateAsync({type:'blob',compression:'STORE'}),url=URL.createObjectURL(result);
 const a=document.createElement('a');a.href=url;a.download=state.fileName.replace(/\.mp4$/i,'-original.zip');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
