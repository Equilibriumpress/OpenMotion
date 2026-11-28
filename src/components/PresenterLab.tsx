import { useEffect, useMemo, useRef, useState } from 'react';
import { renderOpenMotionFrame } from '../engine/openMotionRenderer';
import { projectAssetUrl } from '../engine/projectAudio';
import { exportProjectToMp4 } from '../engine/mp4Exporter';
import { prepareRocketbox, rocketboxReady, ROCKETBOX_MARKER } from '../engine/rocketboxPresenter';
import { getProjectDurationSec, type OpenMotionProject, type RenderProgressState } from '../types/openmotion';

const SLUG='simply-explained-001-how-ai-actually-works';
type Mode='flat'|'rig'|'rocketbox';
const MODES:{id:Mode;name:string;desc:string}[]=[
 {id:'flat',name:'Alex 2D',desc:'Versie 1.1 · oorspronkelijke vrouwelijke illustratie'},
 {id:'rig',name:'Alex 2.5D',desc:'Versie 2.0 · afzonderlijke ogen, armen en gezichtsbeweging'},
 {id:'rocketbox',name:'Rocketbox 3D',desc:'Business female 04 · echt GLB-personage met morph targets'}
];
function makeVariant(p:OpenMotionProject,mode:Mode):OpenMotionProject{
 return {...p,id:'presenter-lab-'+mode,slug:'presenter-lab-'+mode,title:'Presenter Lab · '+MODES.find(m=>m.id===mode)!.name,kind:'experiment',productionStatus:'review',scenes:p.scenes.map(s=>{
  if(!s.doodle)return s;
  const extras=(s.doodle.extras??[]).filter(x=>x!==ROCKETBOX_MARKER&&(mode!=='flat'||x!=='simply-explained-v2'));
  if(mode==='rocketbox')extras.push(ROCKETBOX_MARKER);
  return {...s,doodle:{...s.doodle,extras}};
 })};
}
export function PresenterLab({projects}:{projects:OpenMotionProject[]}){
 const source=projects.find(p=>p.slug===SLUG&&p.templateVersion==='2.0');
 const [mode,setMode]=useState<Mode>('rig'),[ready,setReady]=useState(false),[error,setError]=useState(''),[progress,setProgress]=useState<RenderProgressState|null>(null),[busy,setBusy]=useState(false),[time,setTime]=useState(0),[playing,setPlaying]=useState(false),[loadAttempt,setLoadAttempt]=useState(0);
 const canvas=useRef<HTMLCanvasElement>(null),audio=useRef<HTMLAudioElement>(null),cancel=useRef<AbortController|null>(null),resultUrl=useRef<string|null>(null);
 const variant=useMemo(()=>source?makeVariant(source,mode):null,[source,mode]);
 const duration=variant?getProjectDurationSec(variant):0;
 const voice=source?.audioTracks?.find(t=>t.kind==='voiceover'&&t.src);
 const energyAvailable=!!source?.scenes.some(s=>s.doodle?.extras?.some(x=>x.startsWith('host-energy:')));
 useEffect(()=>{
  let alive=true;setError('');setReady(mode!=='rocketbox'||rocketboxReady());
  if(mode==='rocketbox')void prepareRocketbox().then(()=>{if(alive)setReady(true);}).catch(e=>{if(alive)setError(e instanceof Error?e.message:String(e));});
  return()=>{alive=false;};
 },[mode,loadAttempt]);
 useEffect(()=>{
  let raf=0,lastPaint=-1;
  if(!variant||!ready)return;
  const tick=()=>{
   const el=audio.current,c=canvas.current,ctx=c?.getContext('2d');
   if(el&&c&&ctx){
    const t=Math.min(duration-.001,Math.max(0,el.currentTime));
    if(t!==lastPaint){try{renderOpenMotionFrame(ctx,variant,t,c.width,c.height);lastPaint=t;setTime(t);}catch(e){el.pause();setError(e instanceof Error?e.message:String(e));return;}}
   }
   raf=requestAnimationFrame(tick);
  };
  raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
 },[variant,ready,duration]);
 useEffect(()=>()=>{cancel.current?.abort();if(resultUrl.current)URL.revokeObjectURL(resultUrl.current);},[]);
 const choose=(m:Mode)=>{audio.current?.pause();setMode(m);setProgress(null);if(resultUrl.current){URL.revokeObjectURL(resultUrl.current);resultUrl.current=null;}};
 const play=async()=>{if(!audio.current||!ready)return;try{if(audio.current.paused){if(audio.current.ended)audio.current.currentTime=0;await audio.current.play();}else audio.current.pause();}catch(e){setError(e instanceof Error?e.message:String(e));}};
 const render=async()=>{
  if(!variant||!voice||!ready||busy)return;
  if(mode==='rocketbox'&&!energyAvailable){setError('Gegenereerde spreekdata ontbreken. Open de gepubliceerde versie van Studio.');return;}
  audio.current?.pause();setError('');setProgress(null);setBusy(true);
  if(resultUrl.current){URL.revokeObjectURL(resultUrl.current);resultUrl.current=null;}
  const ac=new AbortController();cancel.current=ac;
  try{
   const output=await exportProjectToMp4(variant,{resolution:'1080p',fps:30,bitrateMbps:12,mode:'publication'},setProgress,ac.signal);
   if(ac.signal.aborted){if(output.outputUrl)URL.revokeObjectURL(output.outputUrl);return;}
   if(output.outputUrl)resultUrl.current=output.outputUrl;setProgress(output);
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{cancel.current=null;setBusy(false);}
 };
 return <section className="space-y-5">
  <header><p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Experiment / Presenter Lab</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Welke presentator werkt het best?</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">Vergelijk dezelfde 56 seconden, dezelfde voice-over, infographics en ondertiteling. Alleen de presentator wisselt. De gepubliceerde aflevering blijft ongewijzigd.</p></header>
  <div className="grid gap-3 sm:grid-cols-3">{MODES.map(m=><button type="button" disabled={busy} key={m.id} onClick={()=>choose(m.id)} aria-pressed={mode===m.id} className={'rounded-xl border p-4 text-left '+(mode===m.id?'border-teal-700 bg-teal-50':'border-slate-200 bg-white')}><div className="font-semibold">{m.name}</div><div className="mt-1 text-xs text-slate-600">{m.desc}</div></button>)}</div>
  {!source?<p role="status" className="rounded-xl border bg-white p-4 text-sm">Pilot 2.0 ontbreekt nog in de geladen bibliotheek. Open de gepubliceerde Studio nadat de Pages-build is voltooid.</p>:<div className="grid gap-5 lg:grid-cols-[minmax(240px,360px)_1fr]">
   <div className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-[#F5EDDF]">
    <canvas ref={canvas} width={540} height={960} className="block h-auto w-full" aria-label="Vergelijkende video-preview"/>
    {!ready&&<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#F5EDDF] p-5 text-center text-sm">{error?'3D-model niet geladen':'3D-model laden…'}{error&&<button className="rounded border px-3 py-2" onClick={()=>setLoadAttempt(n=>n+1)}>Opnieuw proberen</button>}</div>}
   </div>
   <div className="space-y-4 rounded-xl border bg-white p-4">
    <div><h2 className="font-semibold">{MODES.find(m=>m.id===mode)?.name}</h2><p className="mt-1 text-sm text-slate-600">De preview gebruikt alleen de originele voice-over. De MP4-proef gebruikt ook de bestaande muziekmix.</p></div>
    <audio ref={audio} src={voice?projectAssetUrl(voice.src):undefined} preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setError('Voice-over kon niet worden geladen.')}/>
    <div className="flex items-center gap-3"><button disabled={!ready||!voice||busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-40" onClick={play}>{playing?'Pauze':'Afspelen'}</button><span className="text-xs tabular-nums text-slate-600">{time.toFixed(1)} / {duration.toFixed(1)} s</span></div>
    <input aria-label="Videotijd" type="range" min={0} max={Math.max(0,duration-.001)} step={1/30} value={time} disabled={!ready||!voice||busy} className="w-full" onChange={e=>{if(audio.current){audio.current.currentTime=Number(e.target.value);setTime(Number(e.target.value));}}}/>
    {!voice&&<p className="text-sm text-amber-800">De voice-over ontbreekt. Afspelen en export zijn geblokkeerd.</p>}
    {mode==='rocketbox'&&<p className="text-sm text-slate-600">De echte Rocketbox-avatar wordt via een vastgezette pakketversie geladen. Mondvormen volgen de bestaande, geschatte visemes en audio-envelope. Deze mode gebruikt geen live klok, zodat frames in willekeurige volgorde kunnen worden gerenderd.</p>}
    {mode==='rocketbox'&&!energyAvailable&&<p className="text-sm text-amber-800">Spreekdata ontbreken. Export is geblokkeerd.</p>}
    <div className="border-t pt-4"><h3 className="font-semibold">MP4-proef</h3><p className="mt-1 text-xs text-slate-500">1080 × 1920 · 30 fps · H.264/AAC. Alleen een experiment, geen automatische publicatie.</p>
    <div className="mt-3 flex flex-wrap gap-2"><button disabled={!ready||!voice||busy||(mode==='rocketbox'&&!energyAvailable)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40" onClick={render}>Render proef-MP4</button>{busy&&<button className="rounded-lg border px-3 py-2 text-sm" onClick={()=>cancel.current?.abort()}>Stop</button>}</div>
    {progress&&<p role="status" className="mt-2 text-xs">{progress.phase} · {Math.round(progress.percent)}% · {progress.encoderLabel}</p>}
    {progress?.outputUrl&&<a href={progress.outputUrl} download={progress.fileName} className="mt-2 inline-block text-sm font-semibold text-teal-700 underline">Download proefbestand</a>}
    </div>
    {error&&<p role="alert" className="break-words rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
   </div>
  </div>}
  <div className="rounded-xl border bg-white p-4"><h2 className="font-semibold">Neurale lipsynchronisatie (live proef)</h2><p className="mt-1 text-sm text-slate-600">Test de originele Talking Avatar SDK met dezelfde vrouwelijke Rocketbox-avatar en de pilotvoice-over. Deze afzonderlijke test speelt audio zelf af en is niet beschikbaar voor frame-export.</p><a className="mt-3 inline-block text-sm font-semibold text-teal-700 underline" href="./presenter-lab-neural.html" target="_blank" rel="noreferrer">Open neurale avatarproef</a></div>
  <div className="text-xs leading-relaxed text-slate-500">Bronnen: <a className="underline" href="https://github.com/InterviewFlowAI/talking-avatar" target="_blank" rel="noreferrer">Talking Avatar (MIT)</a> · <a className="underline" href="https://github.com/microsoft/Microsoft-Rocketbox" target="_blank" rel="noreferrer">Microsoft Rocketbox (MIT, © 2020 Microsoft)</a> · <a className="underline" href="https://github.com/met4citizen/TalkingHead" target="_blank" rel="noreferrer">TalkingHead (referentie)</a>. Externe bestanden alleen op verzoek van de 3D-proef.</div>
 </section>;
}
