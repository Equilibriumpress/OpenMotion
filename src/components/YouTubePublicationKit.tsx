import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import type { OpenMotionProject, RenderProgressState } from '../types/openmotion';
import { getProjectDurationSec } from '../types/openmotion';
import { containsMp4AudioTrack, actualMp4FrameRate } from '../engine/mp4Exporter';
import { hasHumanSideCover, renderHumanSideCover } from '../engine/humanSideRenderer';
import { hasSongCover, renderSongCover } from '../engine/songExplainerRenderer';
import { defaultYouTubeMetadata, migrateYouTubeMetadata, publicationDescription, publicationSlug, publicationChecks, publicationHelp, defaultTikTokCaption, TIKTOK_CAPTION_DRAFT_LIMIT } from '../services/youtubePublication';
import type { YouTubeMetadata, PublicationCheckId } from '../services/youtubePublication';

type Props={
 project:OpenMotionProject;
 renderState:RenderProgressState;
 renderMatches:boolean;
 projectSignature:string;
 rendering:boolean;
 onRender:()=>void;
};
type Inspection={width:number;height:number;duration:number;fps:number;audio:boolean;thumbnail:Blob};

function canvasPng(canvas:HTMLCanvasElement):Promise<Blob>{
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('PNG maken mislukt.')),'image/png'));
}
function download(blob:Blob,name:string){
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function stored(p:OpenMotionProject,key:string):YouTubeMetadata{
 const fallback=defaultYouTubeMetadata(p);
 try{return migrateYouTubeMetadata(p,JSON.parse(localStorage.getItem(key)??'null'));}
 catch{return fallback;}
}
async function designedCover(p:OpenMotionProject):Promise<Blob|null>{
 const scene=p.scenes[0];
 if(!scene||(!hasHumanSideCover(scene)&&!hasSongCover(scene)))return null;
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas niet beschikbaar.');
 if(hasSongCover(scene))renderSongCover(ctx,1080,1920,scene,p.brandKit);
 else renderHumanSideCover(ctx,1080,1920,scene,p.brandKit);
 return canvasPng(canvas);
}
async function inspectMp4(blob:Blob,expected:number,at:number):Promise<Inspection>{
 const mp4=blob.type==='video/mp4'?blob:blob.slice(0,blob.size,'video/mp4');
 const [fps,audio]=await Promise.all([actualMp4FrameRate(mp4),containsMp4AudioTrack(mp4)]);
 if(fps===null||![30,60].some(v=>Math.abs(v-fps)<.1))throw Error('Framerate niet bevestigd als 30 of 60 fps. Gebruik een gecontroleerde master.');
 if(audio!==true)throw Error('Geen verifieerbaar MP4-audiospoor. Voeg een master met geluid toe.');
 const video=document.createElement('video');video.preload='auto';video.muted=true;video.playsInline=true;
 const url=URL.createObjectURL(mp4);
 try{
  await new Promise<void>((resolve,reject)=>{
   const timer=window.setTimeout(()=>finish(Error('MP4 kon niet worden geopend.')),15000);
   function finish(error?:Error){window.clearTimeout(timer);video.onloadeddata=null;video.onerror=null;error?reject(error):resolve();}
   video.onloadeddata=()=>finish();video.onerror=()=>finish(Error('MP4 is niet afspeelbaar in deze browser.'));
   video.src=url;video.load();
  });
  const width=video.videoWidth,height=video.videoHeight,duration=video.duration;
  if(width!==1080||height!==1920)throw Error('Master moet 1080 × 1920 zijn. Gevonden: '+width+' × '+height+'.');
  if(!Number.isFinite(duration)||duration>180||Math.abs(duration-expected)>.5)throw Error('Speelduur wijkt af van het huidige project of is langer dan drie minuten.');
  const time=Math.max(0,Math.min(at,duration-.05));
  if(Math.abs(video.currentTime-time)>.02){
   await new Promise<void>((resolve,reject)=>{
    const timer=window.setTimeout(()=>finish(Error('Coverframe kon niet worden gelezen.')),10000);
    function finish(error?:Error){window.clearTimeout(timer);video.onseeked=null;video.onerror=null;error?reject(error):resolve();}
    video.onseeked=()=>finish();video.onerror=()=>finish(Error('Coverframe kon niet worden gelezen.'));video.currentTime=time;
   });
  }
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas niet beschikbaar.');
  ctx.drawImage(video,0,0,width,height);
  return {width,height,duration,fps,audio,thumbnail:await canvasPng(canvas)};
 }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url);}
}

export function YouTubePublicationKit({project,renderState,renderMatches,projectSignature,rendering,onRender}:Props){
 const key='openmotion.youtube.v1:'+project.id;
 const [metadata,setMetadata]=useState<YouTubeMetadata>(()=>stored(project,key));
 const [checks,setChecks]=useState<Partial<Record<PublicationCheckId,boolean>>>({});
 const [external,setExternal]=useState<{file:File;signature:string}|null>(null);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 const [coverTime,setCoverTime]=useState(.3);
 const [reviewUrl,setReviewUrl]=useState('');
 const [storageFailed,setStorageFailed]=useState(false);
 const duration=getProjectDurationSec(project);
 const eligible=project.format==='9:16'&&duration>0&&duration<=180;
 const hasExport=renderMatches&&renderState.publicationVerified===true&&renderState.phase==='done'&&renderState.container==='mp4'&&!!renderState.outputUrl&&!renderState.audioSidecarUrl;
 const selected=external?.signature===projectSignature?external:null;
 const videoAvailable=!!selected||hasExport;
 const allChecked=publicationChecks.every(([id])=>checks[id]);
 const description=publicationDescription(metadata);
 const valid=metadata.title.trim().length>0&&metadata.title.length<=100&&description.length<=5000&&metadata.tags.length<=500;
 const hasCover=hasHumanSideCover(project.scenes[0])||hasSongCover(project.scenes[0]);

 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(metadata));setStorageFailed(false);}catch{setStorageFailed(true);}},[key,metadata]);
 useEffect(()=>{setChecks({});setMessage('');},[projectSignature,renderState.outputUrl,external,coverTime]);
 useEffect(()=>{if(!selected){setReviewUrl('');return;}const url=URL.createObjectURL(selected.file);setReviewUrl(url);return ()=>URL.revokeObjectURL(url);},[selected]);
 const update=(field:keyof YouTubeMetadata,value:string)=>{
  setMetadata(m=>({...m,[field]:value}));setChecks(c=>({...c,facts:false,rights:false}));setMessage('');
 };
 const copy=async(label:string,value:string)=>{
  setError('');try{await navigator.clipboard.writeText(value);setMessage(label+' gekopieerd.');}catch{setError('Kopiëren niet beschikbaar. Selecteer de tekst handmatig.');}
 };
 const pack=async(full:boolean)=>{
  if(busy||!valid||!eligible||full&&(!videoAvailable||!allChecked))return;
  setBusy(true);setError('');setMessage('');
  try{
   const zip=new JSZip(),slug=publicationSlug(project.slug);
   let inspection:Inspection|null=null,cover:Blob|null=null;
   if(full){
    let blob:Blob;
    if(selected)blob=selected.file;
    else{
     const response=await fetch(renderState.outputUrl!);
     if(!response.ok)throw Error('De huidige export is niet meer beschikbaar.');
     blob=await response.blob();
    }
    inspection=await inspectMp4(blob,duration,coverTime);
    cover=inspection.thumbnail;
    zip.file(slug+'.mp4',blob);
   }else cover=await designedCover(project);
   if(cover)zip.file('thumbnail.png',cover);
   zip.file('title.txt',metadata.title.trim());
   zip.file('description.txt',description);
   zip.file('tags.txt',metadata.tags);
   zip.file('sources.txt',metadata.sources);
   zip.file('tiktok-caption.txt',metadata.tiktokCaption.trim());
   zip.file('tiktok-interaction-caption.txt',metadata.tiktokInteractionCaption.trim());
   zip.file('seo-keywords.txt',['Primary search term: '+metadata.primaryKeyword.trim(),'Related keywords: '+metadata.secondaryKeywords.trim(),'Editorial suggestions; search volume not verified.'].join('\n'));
   const report={project:project.slug,title:metadata.title,description,tiktokCaption:metadata.tiktokCaption.trim(),tiktokInteractionCaption:metadata.tiktokInteractionCaption.trim(),primaryKeyword:metadata.primaryKeyword.trim(),secondaryKeywords:metadata.secondaryKeywords.split(',').map(s=>s.trim()).filter(Boolean),keywordResearchStatus:'editorial suggestions, volume not verified',tags:metadata.tags.split(',').map(s=>s.trim()).filter(Boolean),sources:metadata.sources.split('\n').filter(Boolean),language:project.seriesId==='the-human-side'?'en':null,coverFrameSeconds:full?coverTime:cover?0.3:null,packageType:full?'video-and-metadata':'metadata-only',video:inspection?{width:inspection.width,height:inspection.height,fps:inspection.fps,duration:inspection.duration,audioTrackPresent:inspection.audio,source:selected?'imported master':'current studio export',codecVerification:'Not checked by this kit'}:null,review:full?checks:{},createdAt:new Date().toISOString()};
   zip.file('youtube-metadata.json',JSON.stringify(report,null,2));
   zip.file('publication-checklist.txt',[
    'YouTube / TikTok Publication Kit — '+project.title,
    full?'Video included. Browser metadata confirms dimensions, duration, frame rate and audio-track presence. Codec, audio quality and visual accuracy still depend on source and manual review.':'Metadata only. No verified video included.',
    'Upload in YouTube Studio: https://studio.youtube.com/',
    'Title: '+metadata.title.trim(),
    'Description: copy description.txt',
    'Tags: copy tags.txt (optional)',
    'Cover: choose the frame around '+(full?coverTime:cover?0.3:coverTime)+' seconds in the YouTube app. Where custom Shorts thumbnail upload is available, use thumbnail.png if included.',
    'Review:',
    ...publicationChecks.map(([id,label])=>(full&&checks[id]?'[x] ':'[ ] ')+label),
    '[ ] Confirm language and audience settings on YouTube',
    '[ ] Review copyright checks and disclosure settings',
    '[ ] Check the uploaded preview before going public',
    'TikTok: upload the same reviewed MP4, choose tiktok-caption.txt (search-focused) or tiktok-interaction-caption.txt (conversation-focused), select the cover frame and review platform-specific settings before posting.',
    'Primary search term: '+metadata.primaryKeyword.trim(),
    'Related keywords: '+metadata.secondaryKeywords.trim(),
    'Validate search demand in TikTok Creator Search Insights and YouTube Analytics before changing your strategy. Keywords are editorial suggestions, not measured volume.',
    'Help: '+publicationHelp.upload+'\n'+publicationHelp.cover+'\n'+publicationHelp.encoding
   ].join('\n'));
   const result=await zip.generateAsync({type:'blob',compression:'STORE'});
   download(result,slug+(full?'-youtube-publication.zip':'-youtube-metadata.zip'));
   setMessage(full?'Publicatiepakket aangemaakt. Upload de MP4 en metadata handmatig.':'Metadatapakket aangemaakt. '+(cover?'PNG-cover inbegrepen.':'Geen ontworpen cover beschikbaar.'));
  }catch(e){setError(e instanceof Error?e.message:'Publicatiepakket maken mislukt.');}
  finally{setBusy(false);}
 };
 if(project.format!=='9:16')return null;
 const style='w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900';
 return <section className="space-y-3 rounded-xl border border-red-200 bg-red-50/40 p-3" aria-label="YouTube en TikTok Publication Kit">
  <div><h3 className="text-sm font-bold text-slate-900">YouTube &amp; TikTok Publication Kit</h3>
   <p className="mt-1 text-xs text-slate-600">Bewerk metadata, controleer de definitieve video en bundel alles in één ZIP. Geen automatische upload.</p></div>
  <div className="flex items-center justify-between gap-2 text-xs"><span className="font-medium text-slate-700">Metadata</span><button type="button" disabled={busy} className="underline text-red-800" onClick={()=>{setMetadata(defaultYouTubeMetadata(project));setChecks(c=>({...c,facts:false,rights:false}));}}>Herstel voorstel</button></div>
  <div className="space-y-2 rounded-lg border border-slate-200 bg-white/70 p-3">
   <div className="flex items-center justify-between gap-2"><h4 className="text-xs font-semibold">SEO · zoekintentie</h4>
    <button type="button" disabled={busy} className="text-xs underline text-red-800" onClick={()=>{const next=defaultYouTubeMetadata(project);setMetadata(m=>({...next,sources:m.sources}));setChecks(c=>({...c,facts:false,rights:false}));setMessage('SEO-voorstel toegepast. Bronnen behouden.');}}>Pas SEO-voorstel toe</button>
   </div>
   <label className="block space-y-1 text-xs text-slate-700">Primaire zoekterm<input className={style} maxLength={160} disabled={busy} value={metadata.primaryKeyword} onChange={e=>update('primaryKeyword',e.target.value)}/></label>
   <label className="block space-y-1 text-xs text-slate-700">Aanvullende zoekwoorden (komma's)<textarea className={style} rows={2} maxLength={500} disabled={busy} value={metadata.secondaryKeywords} onChange={e=>update('secondaryKeywords',e.target.value)}/></label>
   <p className="text-[11px] text-slate-600">Inhoudelijke zoektermvoorstellen, geen gemeten zoekvolume. Controleer in Creator Search Insights en YouTube Analytics. Pas de teksten handmatig aan als je zoekterm verandert.</p>
  </div>
  <label className="block space-y-1 text-xs text-slate-700">Titel ({metadata.title.length}/100)<input className={style} maxLength={100} disabled={busy} value={metadata.title} onChange={e=>update('title',e.target.value)}/></label>
  <button type="button" onClick={()=>void copy('Titel',metadata.title)} className="text-xs underline text-red-800">Kopieer titel</button>
  <label className="block space-y-1 text-xs text-slate-700">Beschrijving ({description.length}/5000 inclusief bronnen)<textarea className={style} rows={5} maxLength={5000} disabled={busy} value={metadata.description} onChange={e=>update('description',e.target.value)}/></label>
  <button type="button" onClick={()=>void copy('Beschrijving',description)} className="text-xs underline text-red-800">Kopieer beschrijving met bronnen</button>
  <label className="block space-y-1 text-xs text-slate-700">Zoekwoorden, gescheiden door komma's ({metadata.tags.length}/500)<textarea className={style} rows={2} maxLength={500} disabled={busy} value={metadata.tags} onChange={e=>update('tags',e.target.value)}/></label>
  <button type="button" onClick={()=>void copy('Zoekwoorden',metadata.tags)} className="text-xs underline text-red-800">Kopieer zoekwoorden</button>
  <label className="block space-y-1 text-xs text-slate-700">Bronnen / verdere lectuur (optioneel)<textarea className={style} rows={3} disabled={busy} value={metadata.sources} onChange={e=>update('sources',e.target.value)}/></label>
  <div className="space-y-2 border-t border-red-100 pt-3">
   <div className="flex items-center justify-between gap-2 text-xs">
    <h4 className="font-semibold text-slate-900">TikTok-caption · SEO</h4>
    <button type="button" disabled={busy} className="underline text-red-800" onClick={()=>update('tiktokCaption',defaultTikTokCaption(project))}>Herstel voorstel</button>
   </div>
   <p className="text-xs text-slate-600">Zoekgerichte tekst voor je TikTok-post, niet de ondertiteling in de video.</p>
   <label className="block space-y-1 text-xs text-slate-700">Caption ({metadata.tiktokCaption.length} tekens)<textarea className={style} rows={3} maxLength={TIKTOK_CAPTION_DRAFT_LIMIT} disabled={busy} value={metadata.tiktokCaption} onChange={e=>update('tiktokCaption',e.target.value)}/></label>
   <button type="button" disabled={!metadata.tiktokCaption.trim()} onClick={()=>void copy('TikTok-caption',metadata.tiktokCaption.trim())} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 disabled:opacity-40">Kopieer TikTok-caption</button>
   <div className="border-t border-slate-200 pt-2 space-y-2">
    <div className="flex items-center justify-between gap-2 text-xs"><h4 className="font-semibold">TikTok-caption · interactie</h4><button type="button" disabled={busy} className="underline text-red-800" onClick={()=>update('tiktokInteractionCaption',defaultYouTubeMetadata(project).tiktokInteractionCaption)}>Herstel alternatief</button></div>
    <label className="block space-y-1 text-xs text-slate-700">Alternatief ({metadata.tiktokInteractionCaption.length} tekens)<textarea className={style} rows={3} maxLength={TIKTOK_CAPTION_DRAFT_LIMIT} disabled={busy} value={metadata.tiktokInteractionCaption} onChange={e=>update('tiktokInteractionCaption',e.target.value)}/></label>
    <button type="button" disabled={!metadata.tiktokInteractionCaption.trim()} onClick={()=>void copy('TikTok-interactiecaption',metadata.tiktokInteractionCaption.trim())} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 disabled:opacity-40">Kopieer interactiecaption</button>
   </div>
  </div>
  <p className="text-[11px] text-slate-500">{storageFailed?'Browseropslag niet beschikbaar. Exporteer je wijzigingen.':'Metadata wordt lokaal in deze browser bewaard.'} Bronnen worden overgenomen uit bestaande projectgegevens en zijn niet automatisch geverifieerd.</p>
  {!valid&&<p role="alert" className="text-xs text-red-800">Vul een titel in en houd de beschrijving inclusief bronnen binnen 5000 tekens.</p>}
  {!eligible&&<p role="alert" className="text-xs text-red-800">Een Short mag maximaal drie minuten duren.</p>}
  <div className="space-y-2 border-t border-red-100 pt-3">
   <h4 className="text-xs font-semibold">Definitieve MP4 en thumbnail</h4>
   <p className="text-xs text-slate-600">{selected?'Geïmporteerde master: '+selected.file.name:hasExport?'Huidige Studio-export beschikbaar.':'Genereer eerst de huidige 1080p MP4, of selecteer een eerder gerenderde GitHub-master.'}</p>
   {!selected&&<button type="button" disabled={busy||rendering} onClick={onRender} className="w-full rounded-md border border-slate-300 py-2 text-xs font-semibold disabled:opacity-50">{hasExport?'Genereer nieuwe 1080p MP4':'Genereer 1080p MP4'}</button>}
   <label className="block space-y-1 text-xs text-slate-700">Of voeg een bestaande MP4-master toe<input className="block w-full text-xs" type="file" accept=".mp4,video/mp4" disabled={busy||rendering} onChange={e=>{const file=e.target.files?.[0];setExternal(file?{file,signature:projectSignature}:null);}}/></label>
   {external&&<button type="button" disabled={busy} onClick={()=>setExternal(null)} className="text-xs underline text-red-800">Verwijder geïmporteerde master</button>}
   {selected&&reviewUrl&&<video src={reviewUrl} controls playsInline className="w-full max-h-56 rounded-md bg-black"/>}
   <label className="block space-y-1 text-xs text-slate-700">Thumbnailframe (seconden)<input className={style} type="number" min={0} max={Math.max(0,duration-.1)} step={.1} disabled={busy} value={coverTime} onChange={e=>setCoverTime(Math.max(0,Math.min(Number(e.target.value)||0,Math.max(0,duration-.1))))}/></label>
   <p className="text-[11px] text-slate-600">{hasCover?'De standaard is 0,3 seconde, binnen de ontworpen openingscover.':'Kies een herkenbaar videoframe.'} Het volledige pakket bevat een PNG uit de daadwerkelijke MP4. Kies in YouTube het frame of upload de PNG waar die optie beschikbaar is.</p>
  </div>
  <fieldset className="space-y-2 border-t border-red-100 pt-3" disabled={busy||rendering||!videoAvailable}>
   <legend className="text-xs font-semibold">Publicatiechecklist</legend>
   {publicationChecks.map(([id,label])=><label key={id} className="flex items-start gap-2 text-xs text-slate-700"><input className="mt-0.5" type="checkbox" checked={!!checks[id]} onChange={e=>setChecks(c=>({...c,[id]:e.target.checked}))}/><span>{label}</span></label>)}
  </fieldset>
  <button type="button" disabled={busy||rendering||!valid||!eligible||!videoAvailable||!allChecked} onClick={()=>void pack(true)} className="w-full rounded-lg bg-red-700 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{busy?'Pakket maken…':'Download compleet publicatiepakket (ZIP)'}</button>
  <button type="button" disabled={busy||rendering||!valid||!eligible} onClick={()=>void pack(false)} className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-800 disabled:opacity-40">Download alleen metadata{hasCover?' + cover':''} (ZIP)</button>
  {message&&<p role="status" className="text-xs text-emerald-800">{message}</p>}
  {error&&<p role="alert" className="text-xs text-red-800">{error}</p>}
  <a href="https://studio.youtube.com/" target="_blank" rel="noreferrer" className="block text-center text-xs font-semibold text-red-800 underline">Open YouTube Studio</a>
  <a href="https://www.tiktok.com/upload" target="_blank" rel="noreferrer" className="block text-center text-xs font-semibold text-slate-800 underline">Open TikTok upload</a>
  <a href={publicationHelp.upload} target="_blank" rel="noreferrer" className="block text-center text-[11px] text-slate-600 underline">Officiële uploadinstructies</a>
 </section>;
}
