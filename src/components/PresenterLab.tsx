import { EMOTIONS, DEFAULT_PERFORMANCE, PERFORMANCE_MARKER, performanceFor, sanitizePerformance, withPerformance, type AlexPerformance } from '../engine/alexPerformance';
import { CARTOONS, CARTOON_MARKER, applyCartoon, cartoonReady, prepareCartoon, type CartoonId } from '../engine/cartoonPresenter';
import { PEOPLE, TOPS, MOVES, EXPRESSIONS, DEFAULT_CHARACTER, sanitizeCharacter, characterFromScene, applyCharacter, characterThumb, type CharacterPreset } from '../engine/characterPresets';
import { useEffect, useMemo, useRef, useState } from 'react';
import { renderOpenMotionFrame } from '../engine/openMotionRenderer';
import { projectAssetUrl } from '../engine/projectAudio';
import { exportProjectToMp4 } from '../engine/mp4Exporter';
import { prepareRocketbox, rocketboxReady, ROCKETBOX_MARKER } from '../engine/rocketboxPresenter';
import { getProjectDurationSec, type OpenMotionProject, type RenderProgressState } from '../types/openmotion';

const SLUG='simply-explained-001-how-ai-actually-works';
type Mode='flat'|'rig'|'performance'|'rocketbox'|'custom'|'cartoon';
const MODES:{id:Mode;name:string;desc:string}[]=[
 {id:'flat',name:'Alex 2D',desc:'Versie 1.1 · oorspronkelijke vrouwelijke illustratie'},
 {id:'rig',name:'Alex 2.5D',desc:'Versie 2.7 · eerdere illustratie'},
 {id:'performance',name:'Alex Performance',desc:'Versie 3.3 · finale timing en grotere Alex'},
 {id:'rocketbox',name:'Rocketbox 3D',desc:'Business female 04 · bestaande proef'},
 {id:'custom',name:'Character Studio',desc:'20 Rocketbox-personages, kleding, expressie en beweging'},
 {id:'cartoon',name:'Cartoon Cinema',desc:'Gestileerde 3D-personages met mondvormen'}
];
function makeVariant(p:OpenMotionProject,mode:Mode,preset:CharacterPreset,cartoon:CartoonId,overrides:Record<string,AlexPerformance>):OpenMotionProject{
 if(mode==='performance')return {...p,id:'presenter-lab-performance',slug:'presenter-lab-performance',title:'Alex Performance',templateVersion:p.templateVersion==='3.3'?'3.3':p.templateVersion==='3.2'?'3.2':'3.1',kind:'experiment',productionStatus:'review',scenes:p.scenes.map(s=>withPerformance(s,overrides[s.id]??performanceFor(s)))};
 if(mode==='cartoon')return applyCartoon({...p,templateVersion:'3.0',scenes:p.scenes.map(s=>s.doodle?{...s,doodle:{...s.doodle,extras:s.doodle.extras?.filter(x=>x!=='alex-final-v1'&&x!=='alex-quality-v1'&&x!==PERFORMANCE_MARKER)}}:s),id:'presenter-lab-cartoon-'+cartoon,slug:'presenter-lab-cartoon-'+cartoon,title:'Cartoon Cinema · '+cartoon,kind:'experiment',productionStatus:'review'},cartoon);
 if(mode==='custom')return applyCharacter({...p,templateVersion:'3.0',scenes:p.scenes.map(s=>s.doodle?{...s,doodle:{...s.doodle,extras:s.doodle.extras?.filter(x=>x!=='alex-final-v1'&&x!=='alex-quality-v1'&&x!==PERFORMANCE_MARKER)}}:s),id:'presenter-lab-custom',slug:'presenter-lab-custom',title:'Character Studio · '+preset.name,kind:'experiment',productionStatus:'review'},preset);
 return {...p,templateVersion:mode==='rig'?'2.7':mode==='flat'?'1.1':'3.0',id:'presenter-lab-'+mode,slug:'presenter-lab-'+mode,title:'Presenter Lab · '+MODES.find(m=>m.id===mode)!.name,kind:'experiment',productionStatus:'review',scenes:p.scenes.map(s=>{
  if(!s.doodle)return s;
  const extras=(s.doodle.extras??[]).filter(x=>x!=='alex-final-v1'&&x!=='alex-quality-v1'&&x!==PERFORMANCE_MARKER&&!x.startsWith('alex-performance:')&&x!==ROCKETBOX_MARKER&&x!==CARTOON_MARKER&&!x.startsWith('cartoon-avatar:')&&!x.startsWith('character-preset:')&&(mode!=='flat'||x!=='simply-explained-v2'));
  if(mode==='rig'&&!extras.includes('alex-26'))extras.push('alex-26');
  if(mode==='rocketbox')extras.push(ROCKETBOX_MARKER);
  return {...s,doodle:{...s.doodle,extras}};
 })};
}
const STORAGE='openmotion.characterPresets.v1';
function savedPresets():CharacterPreset[]{try{const x=JSON.parse(localStorage.getItem(STORAGE)??'[]');return Array.isArray(x)?x.map(sanitizeCharacter):[];}catch{return [];}}
function downloadJson(value:unknown,name:string){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function PresenterLab({projects,onUpdateProject,initialCustom=false,initialCartoon=false,initialPerformance=false}:{projects:OpenMotionProject[];onUpdateProject?:(p:OpenMotionProject)=>void;initialCustom?:boolean;initialCartoon?:boolean;initialPerformance?:boolean}){
 const source=projects.find(p=>p.slug===SLUG&&['2.0','2.6','2.7','3.0','3.1','3.2','3.3'].includes(p.templateVersion??''));
 const [overrides,setOverrides]=useState<Record<string,AlexPerformance>>({});
 const [selectedScene,setSelectedScene]=useState('');
 const selected=source?.scenes.find(s=>s.id===selectedScene)??source?.scenes[0];
 const settings=selected?(overrides[selected.id]??performanceFor(selected)):DEFAULT_PERFORMANCE;
 const [cartoon,setCartoon]=useState<CartoonId>('jenny');
 const [preset,setPreset]=useState<CharacterPreset>(()=>source?characterFromScene(source.scenes.find(s=>s.doodle?.narration?.trim())??source.scenes[0])??DEFAULT_CHARACTER:DEFAULT_CHARACTER),[saved,setSaved]=useState(savedPresets),[message,setMessage]=useState('');
 const change=(x:Partial<CharacterPreset>)=>{audio.current?.pause();setPreset(p=>sanitizeCharacter({...p,...x}));setMessage('');setProgress(null);if(resultUrl.current){URL.revokeObjectURL(resultUrl.current);resultUrl.current=null;}};
 const save=()=>{const next=[...saved.filter(x=>x.name!==preset.name),preset];try{localStorage.setItem(STORAGE,JSON.stringify(next));setSaved(next);setMessage('Personage opgeslagen in deze browser.');}catch{setMessage('Opslag mislukt. Download de preset als JSON.');}};
 const [mode,setMode]=useState<Mode>(initialPerformance?'performance':initialCartoon?'cartoon':initialCustom?'custom':'performance'),[ready,setReady]=useState(false),[error,setError]=useState(''),[progress,setProgress]=useState<RenderProgressState|null>(null),[busy,setBusy]=useState(false),[time,setTime]=useState(0),[playing,setPlaying]=useState(false),[loadAttempt,setLoadAttempt]=useState(0);
 const canvas=useRef<HTMLCanvasElement>(null),audio=useRef<HTMLAudioElement>(null),cancel=useRef<AbortController|null>(null),resultUrl=useRef<string|null>(null);
 const variant=useMemo(()=>source?makeVariant(source,mode,preset,cartoon,overrides):null,[source,mode,preset,cartoon,overrides]);
 const changePerformance=(part:Partial<AlexPerformance>)=>{if(!selected)return;audio.current?.pause();
 let offset=0;for(const scene of source?.scenes??[]){if(scene.id===selected.id){const t=audio.current?.currentTime??0;if(t<offset||t>=offset+scene.durationSec){if(audio.current)audio.current.currentTime=offset+Math.min(.6,scene.durationSec/2);}break;}offset+=scene.durationSec;}
 setOverrides(o=>({...o,[selected.id]:sanitizePerformance({...settings,...part})}));setProgress(null);setMessage('');if(resultUrl.current){URL.revokeObjectURL(resultUrl.current);resultUrl.current=null;}};
 const seekScene=(id:string)=>{setSelectedScene(id);audio.current?.pause();let offset=0;for(const scene of source?.scenes??[]){if(scene.id===id){if(audio.current)audio.current.currentTime=offset+Math.min(.6,scene.durationSec/2);setTime(offset+Math.min(.6,scene.durationSec/2));break;}offset+=scene.durationSec;}};
 const duration=variant?getProjectDurationSec(variant):0;
 const voice=source?.audioTracks?.find(t=>t.kind==='voiceover'&&t.src);
 const energyAvailable=!!source&&source.scenes.filter(s=>s.doodle?.narration?.trim()).every(s=>s.doodle?.extras?.some(x=>x.startsWith('host-energy:'))&&s.doodle?.extras?.some(x=>x.startsWith('host-mouth:')));
 useEffect(()=>{
  let alive=true;setError('');if(mode==='cartoon'){setReady(cartoonReady(cartoon));void prepareCartoon(cartoon).then(()=>{if(alive)setReady(true);}).catch(e=>{if(alive)setError(e instanceof Error?e.message:String(e));});return()=>{alive=false;};}
  const is3D=mode==='rocketbox'||mode==='custom',config=mode==='custom'?preset:null;setReady(!is3D||rocketboxReady(config));
  if(is3D)void prepareRocketbox(config).then(()=>{if(alive)setReady(true);}).catch(e=>{if(alive)setError(e instanceof Error?e.message:String(e));});
  return()=>{alive=false;};
 },[mode,loadAttempt,preset.person,cartoon]);
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
  if((mode==='rocketbox'||mode==='custom'||mode==='cartoon'||mode==='performance')&&!energyAvailable){setError('Gegenereerde spreekdata ontbreken. Open de gepubliceerde versie van Studio.');return;}
  audio.current?.pause();setError('');setProgress(null);setBusy(true);
  if(resultUrl.current){URL.revokeObjectURL(resultUrl.current);resultUrl.current=null;}
  const ac=new AbortController();cancel.current=ac;
  try{
   const output=await exportProjectToMp4(variant,{resolution:'1080p',fps:30,bitrateMbps:12,mode:'publication'},setProgress,ac.signal);
   if(ac.signal.aborted){if(output.outputUrl)URL.revokeObjectURL(output.outputUrl);return;}
   if(!output.publicationVerified){if(output.outputUrl)URL.revokeObjectURL(output.outputUrl);throw Error('Geen gecontroleerde Full HD-publicatiemaster.');}
   if(output.outputUrl)resultUrl.current=output.outputUrl;setProgress(output);
  }catch(e){setError(e instanceof Error?e.message:String(e));}finally{cancel.current=null;setBusy(false);}
 };
 return <section className="space-y-5">
  <header><p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Experiment / Presenter Lab</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{mode==='performance'?'Alex Performance Studio':'Welke presentator werkt het best?'}</h1><p className="mt-2 max-w-3xl text-sm text-slate-600">Vergelijk dezelfde {Math.round(duration)} seconden, dezelfde voice-over, infographics en ondertiteling. Alleen de presentator wisselt. De editor verandert de aflevering alleen wanneer je de preset toepast.</p></header>
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{MODES.map(m=><button type="button" disabled={busy} key={m.id} onClick={()=>choose(m.id)} aria-pressed={mode===m.id} className={'rounded-xl border p-4 text-left '+(mode===m.id?'border-teal-700 bg-teal-50':'border-slate-200 bg-white')}><div className="font-semibold">{m.name}</div><div className="mt-1 text-xs text-slate-600">{m.desc}</div></button>)}</div>
  {!source?<p role="status" className="rounded-xl border bg-white p-4 text-sm">De pilot ontbreekt nog in de geladen bibliotheek. Open de gepubliceerde Studio nadat de Pages-build is voltooid.</p>:<div className="grid gap-5 lg:grid-cols-[minmax(240px,360px)_1fr]">
   <div className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-xl border border-slate-200 bg-[#F5EDDF]">
    <canvas ref={canvas} width={540} height={960} className="block h-auto w-full" aria-label="Vergelijkende video-preview"/>
    {!ready&&<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#F5EDDF] p-5 text-center text-sm">{error?'3D-model niet geladen':'3D-model laden…'}{error&&<button className="rounded border px-3 py-2" onClick={()=>setLoadAttempt(n=>n+1)}>Opnieuw proberen</button>}</div>}
   </div>
   <div className="space-y-4 rounded-xl border bg-white p-4">
    <div><h2 className="font-semibold">{MODES.find(m=>m.id===mode)?.name}</h2><p className="mt-1 text-sm text-slate-600">De preview gebruikt alleen de originele voice-over. De MP4-proef gebruikt ook de bestaande muziekmix.</p></div>
    {mode==='performance'&&selected&&<div className="space-y-4 rounded-xl bg-slate-50 p-4">
     <h3 className="text-sm font-semibold">Regie per scène</h3>
     <label className="block text-xs font-medium">Scène<select disabled={busy} className="mt-1 block w-full rounded border p-2 text-sm" value={selected.id} onChange={e=>seekScene(e.target.value)}>{source?.scenes.map((s,i)=><option key={s.id} value={s.id}>{i+1}. {s.name}</option>)}</select></label>
     <label className="block text-xs font-medium">Expressie<select disabled={busy} className="mt-1 block w-full rounded border p-2 text-sm" value={settings.emotion} onChange={e=>changePerformance({emotion:e.target.value as AlexPerformance['emotion']})}>{EMOTIONS.map((x,i)=><option key={x} value={x}>{['Volgens keyframes','Nieuwsgierig','Uitleggend','Enthousiast','Nadenkend','Waarschuwend','Afsluitend'][i]}</option>)}</select></label>
     <label className="block text-xs font-medium">Lichaamsbeweging · {Math.round(settings.motion*100)}%<input disabled={busy} type="range" min={0} max={100} value={Math.round(settings.motion*100)} className="mt-2 block w-full" onChange={e=>changePerformance({motion:Number(e.target.value)/100})}/></label>
     <label className="block text-xs font-medium">Haarbeweging · {Math.round(settings.hair*100)}%<input disabled={busy} type="range" min={0} max={100} value={Math.round(settings.hair*100)} className="mt-2 block w-full" onChange={e=>changePerformance({hair:Number(e.target.value)/100})}/></label>
     <label className="block text-xs font-medium">Kijkrichting<select disabled={busy} className="mt-1 block w-full rounded border p-2 text-sm" value={settings.look} onChange={e=>changePerformance({look:e.target.value as AlexPerformance['look']})}><option value="authored">Volgens keyframes</option><option value="viewer">Kijker</option><option value="graphic">Illustratie</option></select></label>
     <div className="flex flex-wrap gap-2"><button disabled={busy} className="rounded border bg-white px-3 py-2 text-xs" onClick={()=>{audio.current?.pause();setOverrides(o=>{const n={...o};delete n[selected.id];return n;});setProgress(null);setMessage('Scène teruggezet naar de oorspronkelijke regie.');}}>Herstel scène</button><button disabled={busy} className="rounded border bg-white px-3 py-2 text-xs" onClick={()=>{if(source)downloadJson(Object.fromEntries(source.scenes.map(s=>[s.id,overrides[s.id]??performanceFor(s)])),'alex-performance.json');}}>Regie JSON</button>
     <label className="cursor-pointer rounded border bg-white px-3 py-2 text-xs">Regie importeren<input disabled={busy} type="file" accept=".json,application/json" className="sr-only" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file||!source)return;try{const input=JSON.parse(await file.text());if(!input||typeof input!=='object'||Array.isArray(input))throw Error();audio.current?.pause();setOverrides(Object.fromEntries(source.scenes.filter(s=>Object.prototype.hasOwnProperty.call(input,s.id)).map(s=>[s.id,sanitizePerformance(input[s.id])])));setProgress(null);setMessage('Regie geladen.');}catch{setMessage('Ongeldige regie-JSON.');}}}/></label>
     <button disabled={busy||!source||!variant} className="rounded border bg-white px-3 py-2 text-xs" onClick={()=>{if(source&&variant){const project={...source,templateVersion:variant.templateVersion,scenes:variant.scenes.map(s=>s.doodle?{...s,doodle:{...s.doodle,extras:s.doodle.extras?.filter(x=>!/^host-(energy|mouth|speech-mode):|^speech-end:/.test(x))}}:s)};downloadJson(project,'project.json');}}}>Project-JSON</button>
     <button disabled={busy||!source||!onUpdateProject||!variant} className="rounded bg-teal-800 px-3 py-2 text-xs text-white disabled:opacity-40" onClick={()=>{if(source&&variant){onUpdateProject?.({...source,templateVersion:variant.templateVersion,scenes:variant.scenes});setMessage('Regie lokaal toegepast. Gebruik Project-JSON voor duurzame opslag in GitHub.');}}}>Toepassen op pilot</button></div>
     {message&&<p role="status" className="text-xs text-teal-800">{message}</p>}
     <p className="text-xs text-slate-600">De regie gebruikt de echte video, met dezelfde voice-over en veilige hoekpositie. De spreekvormen blijven een benadering op basis van audio en tekst, geen fonetische transcriptie.</p>
    </div>}
    {mode==='custom'&&<div className="space-y-3 rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-3"><img src={characterThumb(preset.person)} alt="" className="h-16 w-16 rounded-lg object-cover"/><label className="flex-1 text-xs font-medium">Naam<input disabled={busy} className="mt-1 block w-full rounded border p-2 text-sm" value={preset.name} onChange={e=>change({name:e.target.value})}/></label></div>
      <label className="block text-xs font-medium">Basispersonage<select disabled={busy} className="mt-1 block w-full rounded border p-2 text-sm" value={preset.person} onChange={e=>change({person:e.target.value})}>{PEOPLE.map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}</select></label>
      <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium">Kleding<select disabled={busy} className="mt-1 block w-full rounded border p-2 text-sm" value={preset.top} onChange={e=>change({top:e.target.value as CharacterPreset['top']})}>{TOPS.map((x,i)=><option key={x} value={x}>{['Zakelijk','Overhemd','T-shirt','Origineel'][i]}</option>)}</select></label><label className="text-xs font-medium">Broek<select disabled={busy} className="mt-1 block w-full rounded border p-2 text-sm" value={preset.trousers} onChange={e=>change({trousers:e.target.value as CharacterPreset['trousers']})}><option value="black">Zwart</option><option value="blue">Blauw</option></select></label></div>
      <div className="flex items-center gap-3"><label className="text-xs font-medium">Kledingkleur <input disabled={busy} type="color" value={preset.tint??'#2f5d50'} onChange={e=>change({tint:e.target.value})}/></label><button disabled={busy} className="rounded border bg-white px-2 py-1 text-xs" onClick={()=>change({tint:null})}>Originele kleur</button></div>
      <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium">Expressie<select disabled={busy} className="mt-1 block w-full rounded border p-2 text-sm" value={preset.expression} onChange={e=>change({expression:e.target.value as CharacterPreset['expression']})}>{EXPRESSIONS.map(x=><option key={x}>{x}</option>)}</select></label><label className="text-xs font-medium">Beweging<select disabled={busy} className="mt-1 block w-full rounded border p-2 text-sm" value={preset.move} onChange={e=>change({move:e.target.value as CharacterPreset['move']})}>{MOVES.map(x=><option key={x}>{x}</option>)}</select></label></div>
      <div className="flex flex-wrap gap-2"><button disabled={busy} className="rounded border bg-white px-3 py-2 text-xs" onClick={save}>Preset opslaan</button><button disabled={busy} className="rounded border bg-white px-3 py-2 text-xs" onClick={()=>downloadJson(preset,'character-'+preset.person+'.json')}>Preset JSON</button><label className="cursor-pointer rounded border bg-white px-3 py-2 text-xs">Preset importeren<input disabled={busy} type="file" accept=".json,application/json" className="sr-only" onChange={async e=>{const file=e.target.files?.[0];if(file){try{change(sanitizeCharacter(JSON.parse(await file.text())));}catch{setMessage('Ongeldige preset.');}}e.target.value='';}}/></label></div>
      {saved.length>0&&<label className="block text-xs">Opgeslagen personages<select disabled={busy} className="mt-1 block w-full rounded border p-2 text-sm" value="" onChange={e=>{if(e.target.value==='')return;const v=saved[Number(e.target.value)];if(v)change(v);}}><option value="">Kies een preset</option>{saved.map((v,i)=><option key={v.name} value={i}>{v.name}</option>)}</select></label>}
      <div className="flex flex-wrap gap-2"><button disabled={busy||!ready||!source||!onUpdateProject} className="rounded bg-teal-800 px-3 py-2 text-xs text-white disabled:opacity-40" onClick={()=>{if(source){onUpdateProject?.({...applyCharacter(source,preset),templateVersion:'3.0',scenes:applyCharacter(source,preset).scenes.map(s=>s.doodle?{...s,doodle:{...s.doodle,extras:s.doodle.extras?.filter(x=>x!=='alex-final-v1'&&x!=='alex-quality-v1'&&x!==PERFORMANCE_MARKER)}}:s)});setMessage('Alex aangepast in de lokale bibliotheek. Exporteer project-JSON voor duurzame GitHub-opslag.');}}}>Toepassen op Simply Explained 01</button><button disabled={!source||busy} className="rounded border bg-white px-3 py-2 text-xs" onClick={()=>{if(source){const project={...applyCharacter(source,preset),templateVersion:'3.0'};project.scenes=project.scenes.map(s=>s.doodle?{...s,doodle:{...s.doodle,extras:s.doodle.extras?.filter(x=>x!=='alex-final-v1'&&x!=='alex-quality-v1'&&x!==PERFORMANCE_MARKER)}}:s);project.scenes=project.scenes.map(s=>s.doodle?{...s,doodle:{...s.doodle,extras:s.doodle.extras?.filter(x=>!/^host-(energy|mouth|speech-mode):|^speech-end:/.test(x))}}:s);downloadJson(project,'project.json');}}}>Project-JSON</button></div>
      {message&&<p role="status" className="text-xs text-teal-800">{message}</p>}
      <p className="text-xs text-slate-500">Kapsel en gezicht komen van het gekozen model. De kleding is verwisselbaar; er is geen vrije gezichtssculptor. De beweging wordt per frame uit een bestaande clip gelezen.</p>
    </div>}
    {mode==='cartoon'&&<div className="space-y-3 rounded-xl bg-slate-50 p-3"><h3 className="text-sm font-semibold">Cartoon Cinema 1.0</h3><div className="grid grid-cols-3 gap-2">{CARTOONS.map(item=><button type="button" disabled={busy} key={item.id} aria-pressed={cartoon===item.id} onClick={()=>{audio.current?.pause();setReady(cartoonReady(item.id));setCartoon(item.id);setProgress(null);if(resultUrl.current){URL.revokeObjectURL(resultUrl.current);resultUrl.current=null;}}} className={'overflow-hidden rounded-lg border p-1 text-center text-xs '+(cartoon===item.id?'border-teal-700 bg-teal-50':'border-slate-200 bg-white')}><img loading="lazy" src={item.thumb} alt="" className="aspect-square w-full object-contain"/><span className="block p-1">{item.name}</span></button>)}</div><p className="text-xs text-slate-600">Bestaande CC0-personages van Polygonal Mind. De vijf VRM-mondvormen volgen de stem; hoofdbewegingen, armposes, knipperen en expressies volgen de scène. Geen volledig nieuwe character rig.</p><p className="text-xs text-slate-600">Dezelfde pilot en vaste positie linksonder. Exporteer eerst een proef-MP4. De huidige serieversie blijft ongewijzigd.</p><a className="text-xs underline" href="https://github.com/ToxSam/open-source-avatars" target="_blank" rel="noreferrer">Modelbron en licentie</a></div>}
    <audio ref={audio} src={voice?projectAssetUrl(voice.src,source?.mediaRevision):undefined} preload="metadata" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>setError('Voice-over kon niet worden geladen.')}/>
    <div className="flex items-center gap-3"><button disabled={!ready||!voice||busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-40" onClick={play}>{playing?'Pauze':'Afspelen'}</button><span className="text-xs tabular-nums text-slate-600">{time.toFixed(1)} / {duration.toFixed(1)} s</span></div>
    <input aria-label="Videotijd" type="range" min={0} max={Math.max(0,duration-.001)} step={1/30} value={time} disabled={!ready||!voice||busy} className="w-full" onChange={e=>{if(audio.current){audio.current.currentTime=Number(e.target.value);setTime(Number(e.target.value));}}}/>
    {!voice&&<p className="text-sm text-amber-800">De voice-over ontbreekt. Afspelen en export zijn geblokkeerd.</p>}
    {mode==='rocketbox'&&<p className="text-sm text-slate-600">De echte Rocketbox-avatar wordt via een vastgezette pakketversie geladen. Mondvormen volgen de bestaande, geschatte visemes en audio-envelope. Deze mode gebruikt geen live klok, zodat frames in willekeurige volgorde kunnen worden gerenderd.</p>}
    {(mode==='rocketbox'||mode==='custom'||mode==='cartoon'||mode==='performance')&&!energyAvailable&&<p className="text-sm text-amber-800">Spreekdata ontbreken. Export is geblokkeerd.</p>}
    <div className="border-t pt-4"><h3 className="font-semibold">MP4-proef</h3><p className="mt-1 text-xs text-slate-500">1080 × 1920 · 30 fps · H.264/AAC. Alleen een experiment, geen automatische publicatie.</p>
    <div className="mt-3 flex flex-wrap gap-2"><button disabled={!ready||!voice||busy||((mode==='rocketbox'||mode==='custom'||mode==='cartoon'||mode==='performance')&&!energyAvailable)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40" onClick={render}>Render proef-MP4</button>{busy&&<button className="rounded-lg border px-3 py-2 text-sm" onClick={()=>cancel.current?.abort()}>Stop</button>}</div>
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
