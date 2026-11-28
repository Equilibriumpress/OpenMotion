import { useMemo, useState } from 'react';
import { ArrowRight, Film, Layers, LayoutGrid, List, Plus, Search, Settings, Copy, Play, Download, RefreshCw } from 'lucide-react';
import type { OpenMotionProject, GitHubRepoConfig } from '../types/openmotion';
import { getProjectDurationSec } from '../types/openmotion';
import { buildTemplateRemixPrompt } from '../services/githubService';
import { SERIES, activeTemplate, episodeInfo, episodePrompt, newSeriesPrompt, projectKind, seriesById, seriesEpisodes, type SeriesDefinition } from '../services/series';

export type WorkspaceTab = 'dashboard' | 'series' | 'library' | 'templates' | 'archive';
const button = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600';
const primary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600';
const statusNames: Record<string,string> = {concept:'Concept',script:'Script',production:'In productie',review:'Review',approved:'Goedgekeurd',exported:'Geëxporteerd',published:'Gepubliceerd'};

interface Props {
  tab: WorkspaceTab;
  projects: OpenMotionProject[];
  repoConfig: GitHubRepoConfig;
  selectedSeriesId: string | null;
  onSeries: (id:string|null)=>void;
  onNavigate: (tab:WorkspaceTab)=>void;
  onOpenStudio: (p:OpenMotionProject,exportNow?:boolean)=>void;
  onNewEpisode: (s:SeriesDefinition)=>void;
  onNewProject: ()=>void;
  onSync: ()=>void;
  isSyncing: boolean;
  syncMessage: string|null;
}

function SeriesCover({series}:{series:SeriesDefinition}) {
  const kit=activeTemplate(series).brandKit;
  const [failed,setFailed]=useState(false);
  const [photoFailed,setPhotoFailed]=useState(false);
  const cover=series.cover;
  // Only editorial series art: never fall back to an arbitrary episode image.
  return <div className="relative aspect-video overflow-hidden rounded-lg" style={{backgroundColor:kit.backgroundColor,color:kit.textColor}}>
    {cover&&!failed?<img src={cover.imageUrl} alt={cover.alt??series.title} loading="lazy" decoding="async" onError={()=>setFailed(true)} className="absolute inset-0 w-full h-full object-contain"/>:
      <div className="absolute inset-0 flex flex-col justify-center p-5"><div className="w-8 h-1 mb-4 rounded-full" style={{background:kit.accentColor}}/><span className="text-xs uppercase tracking-widest opacity-70">OpenMotion Series</span><span className="mt-2 text-xl font-bold leading-tight">{series.title}</span><span className="text-xs mt-2 opacity-70">{series.description}</span></div>}
    {cover?.photoUrl&&!failed&&!photoFailed&&<img src={cover.photoUrl} alt="" loading="lazy" decoding="async" onError={()=>setPhotoFailed(true)} className="absolute top-0 right-0 h-full w-[50%] object-cover" style={{maskImage:'linear-gradient(to right, transparent, black 12%)',WebkitMaskImage:'linear-gradient(to right, transparent, black 12%)'}}/>}
  </div>;
}
function Poster({project, compact=false}:{project:OpenMotionProject;compact?:boolean}) {
  const kit=project.brandKit;
  const [failed,setFailed]=useState(false);
  const travel=project.scenes.find(s=>s.premiumTravel)?.premiumTravel;
  const region=travel?.regionTitle;
  const hero=region==='SCOTLAND'?travel?.stops.find(s=>/skye|portree/i.test(s.name))??travel?.stops[1]:region==='DOLOMITES'?travel?.stops[2]:region==='ICELAND'?travel?.stops.find(s=>s.name==='Jökulsárlón'):undefined;
  const [heroAttempt,setHeroAttempt]=useState(0);
  const heroPhoto=heroAttempt===0?hero:heroAttempt===1?hero?.secondaryPhoto:undefined;
  const title=region==='SCOTLAND'?['SCOTLAND','ROAD TRIP']:region==='DOLOMITES'?['DOLOMITES','ROAD TRIP']:["ICELAND’S","RING ROAD"];
  const subtitle=region==='SCOTLAND'?'Highlands · Castles · Skye':region==='DOLOMITES'?'Passes · Peaks · Alpine lakes':'Waterfalls · Black sand · Ice';
  const episode=region==='SCOTLAND'?'001':region==='DOLOMITES'?'002':'003';
  if(hero&&heroPhoto)return <div className={`relative overflow-hidden rounded-lg bg-slate-900 text-white ${compact?'w-20 h-14 shrink-0':'aspect-video'}`} title={heroPhoto.photoAuthor+' · '+heroPhoto.photoLicense+' · '+heroPhoto.photoSourceUrl+' · cropped'}>
    <img src={heroPhoto.photoUrl} alt={heroPhoto.label??hero.name} loading="lazy" decoding="async" onError={()=>setHeroAttempt(n=>n+1)} className="absolute inset-0 w-full h-full object-cover" style={{objectPosition:`${(heroPhoto.photoFocus?.[0]??.5)*100}% ${(heroPhoto.photoFocus?.[1]??.5)*100}%`}}/>
    <div className="absolute inset-0" style={{background:'linear-gradient(90deg, rgba(10,28,29,.93),rgba(10,28,29,.54) 52%,rgba(10,28,29,.04) 100%),linear-gradient(0deg,rgba(10,28,29,.8),transparent 25%)'}}/>
    <div className={`absolute inset-0 flex flex-col justify-center ${compact?'px-1.5':'px-[6%] py-[4%]'}`}>
      {!compact&&<span className="text-[9px] sm:text-[10px] tracking-[.15em] font-semibold text-[#E2C48F]">THE OPEN ROAD COLLECTION · {episode}</span>}
      <span className={`font-serif leading-[.98] tracking-tight ${compact?'text-[10px]':'text-2xl sm:text-3xl'}`}>{title[0]}<br/>{title[1]}</span>
      {!compact&&<span className="mt-1 text-[10px] sm:text-xs text-[#E2C48F]">{subtitle} · {travel?.stops.length} STOPS</span>}
    </div>
    {!compact&&<span className="absolute bottom-1 right-2 max-w-[90%] text-right text-[8px] leading-tight text-white/90">{heroPhoto.photoAuthor} · {heroPhoto.photoLicense} · cropped</span>}
  </div>;
  return <div className={`relative overflow-hidden rounded-lg ${compact?'w-20 h-14 shrink-0':'aspect-video'} flex items-center justify-center`} style={{backgroundColor:kit?.backgroundColor??'#142333',color:kit?.textColor??'#ffffff'}}>
    {project.thumbnailUrl && !failed ? <img loading="lazy" decoding="async" alt="" src={project.thumbnailUrl} onError={()=>setFailed(true)} className="w-full h-full object-cover"/> :
      <div className="relative w-full h-full flex flex-col justify-end p-3 sm:p-4 overflow-hidden">
        <div aria-hidden className="absolute -right-6 -top-8 w-40 h-40 rounded-full opacity-20 border-[22px]" style={{borderColor:kit?.accentColor??'#93c5fd'}}/>
        <span className="text-[10px] opacity-75 uppercase tracking-widest truncate">{project.format}</span>
        {!compact && <span className="font-semibold leading-tight line-clamp-2 text-sm sm:text-base">{project.title}</span>}
      </div>}
  </div>;
}
function duration(p:OpenMotionProject){const n=Math.round(getProjectDurationSec(p));return n>=60?Math.floor(n/60)+':'+String(n%60).padStart(2,'0'):n+' sec';}

export function WorkspaceView({tab,projects,repoConfig,selectedSeriesId,onSeries,onNavigate,onOpenStudio,onNewEpisode,onNewProject,onSync,isSyncing,syncMessage}:Props){
  const [query,setQuery]=useState('');
  const [format,setFormat]=useState('all');
  const [status,setStatus]=useState('all');
  const [order,setOrder]=useState('recent');
  const [view,setView]=useState<'grid'|'list'>('grid');
  const [seriesPane,setSeriesPane]=useState<'episodes'|'style'|'production'>('episodes');
  const [copy,setCopy]=useState('');
  const [promptText,setPromptText]=useState('');
  const repo=repoConfig.owner+'/'+repoConfig.repo;
  const active=tab==='series'?seriesById(selectedSeriesId??undefined):undefined;
  const videos=useMemo(()=>projects.filter(p=>projectKind(p)==='video'),[projects]);
  const templates=useMemo(()=>projects.filter(p=>projectKind(p)==='template'),[projects]);
  const recent=[...videos].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||a.title.localeCompare(b.title));
  const seriesVisible=SERIES.filter(s=>!query.trim()||[s.title,s.description,...seriesEpisodes(projects,s.id).map(p=>p.title)].join(' ').toLowerCase().includes(query.toLowerCase()));
  const base=active?seriesEpisodes(projects,active.id):tab==='templates'?templates:tab==='archive'?projects.filter(p=>projectKind(p)==='experiment'):videos;
  const filtered=base.filter(p=>(format==='all'||p.format===format)&&(status==='all'||(status==='unknown'?!p.productionStatus:p.productionStatus===status))&&(!query.trim()||[p.title,p.description,p.category,seriesById(episodeInfo(p)?.seriesId)?.title,p.productionStatus,p.productionStatus?statusNames[p.productionStatus]:''].join(' ').toLowerCase().includes(query.trim().toLowerCase())));
  if(!active) filtered.sort((a,b)=>order==='title'?a.title.localeCompare(b.title):b.updatedAt.localeCompare(a.updatedAt)||a.title.localeCompare(b.title));
  async function copyPrompt(value:string,key:string){setPromptText(value);try{await navigator.clipboard.writeText(value);setCopy(key);setTimeout(()=>setCopy(''),1800);}catch{setCopy('');}}
  const showSeries=(id:string)=>{setQuery('');setFormat('all');setStatus('all');setSeriesPane('episodes');onSeries(id);};
  function seriesCard(s:SeriesDefinition){const eps=seriesEpisodes(projects,s.id);return <button key={s.id} onClick={()=>showSeries(s.id)} className="text-left rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-400 focus-visible:outline-2 focus-visible:outline-blue-600">
    <SeriesCover series={s}/><div className="px-1 pt-3 pb-1"><h3 className="font-semibold text-slate-900">{s.title}</h3><p className="mt-1 text-xs text-slate-500">{eps.length} afleveringen · {activeTemplate(s).format}</p><p className="mt-2 text-sm text-slate-600 line-clamp-2">{s.description}</p></div></button>;}
  function projectCard(p:OpenMotionProject, list=false){const ep=episodeInfo(p);return <article key={p.slug} className={`rounded-xl bg-white border border-slate-200 p-3 ${list?'flex flex-wrap sm:flex-nowrap items-center gap-3':'flex flex-col gap-3'}`}>
    <button className={list?'shrink-0':'w-full'} onClick={()=>onOpenStudio(p)} aria-label={'Open '+p.title}><Poster project={p} compact={list}/></button>
    <div className="flex-1 min-w-0"><button onClick={()=>onOpenStudio(p)} className="font-semibold text-left text-sm sm:text-base leading-snug hover:underline">{p.title}</button><p className="mt-1 text-xs text-slate-500">{ep?.episodeNumber ? 'S'+String(ep.season).padStart(2,'0')+' · A'+String(ep.episodeNumber).padStart(2,'0')+' · ':''}{p.format} · {duration(p)} · {p.fps} fps</p>
    {!active&&ep&&<button className="mt-1 text-xs text-blue-700 hover:underline" onClick={()=>showSeries(ep.seriesId)}>{seriesById(ep.seriesId)?.title??ep.seriesId}</button>}
    {p.productionStatus&&<p className="mt-1 text-xs text-slate-600">{statusNames[p.productionStatus]??p.productionStatus}</p>}</div>
    <div className="flex gap-2 flex-wrap"><button className={button} onClick={()=>onOpenStudio(p)}><Play className="w-4 h-4"/>Studio</button>{projectKind(p)==='template'?<button className={button} onClick={()=>void copyPrompt(buildTemplateRemixPrompt(p,repoConfig),p.slug)}><Copy className="w-4 h-4"/>{copy===p.slug?'Gekopieerd':'Remix'}</button>:<button className={button} onClick={()=>onOpenStudio(p,true)} aria-label={'Exporteer '+p.title}><Download className="w-4 h-4"/></button>}</div>
  </article>;}
  const gridClass='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4';
  return <div className="space-y-6">
    {syncMessage&&<p role="status" className="text-sm text-slate-600 border border-slate-200 bg-white rounded-lg p-3">{syncMessage}</p>}
    {tab==='dashboard' ? <>
      <div className="flex flex-wrap gap-3 items-center justify-between"><div><p className="text-sm text-slate-500">Productiestudio</p><h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1></div><button className={primary} onClick={onNewProject}><Plus className="w-4 h-4"/>Nieuwe video</button></div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">{[[SERIES.length,'Series','series'],[videos.length,"Video's",'library'],[templates.length,'Templates','templates']].map(([n,label,target])=><button key={String(target)} className="text-left rounded-xl bg-white border border-slate-200 p-3 sm:p-4" onClick={()=>onNavigate(target as WorkspaceTab)}><p className="text-2xl font-semibold tabular-nums">{n}</p><p className="text-xs sm:text-sm text-slate-500">{label}</p></button>)}</div>
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Mijn series</h2><button className="text-sm text-blue-700 flex items-center gap-1" onClick={()=>onNavigate('series')}>Alle series <ArrowRight className="w-4 h-4"/></button></div>
      <div className={gridClass}>{SERIES.filter(s=>seriesEpisodes(projects,s.id).length>0).slice(0,6).map(seriesCard)}</div>
      <h2 className="text-lg font-semibold">Recent gewijzigd</h2><div className="space-y-2">{recent.slice(0,6).map(p=>projectCard(p,true))}</div>
    </>:tab==='series'&&!active?<>
      <div className="flex flex-wrap gap-3 justify-between items-center"><div><h1 className="text-3xl font-semibold tracking-tight">Series</h1><p className="text-sm text-slate-500">Afleveringen en vaste productie-instellingen</p></div><button className={primary} onClick={()=>void copyPrompt(newSeriesPrompt(repo),'new-series')}><Plus className="w-4 h-4"/>{copy==='new-series'?'Prompt gekopieerd':'Nieuwe serie (prompt)'}</button></div>
      <label className="flex items-center gap-2 border bg-white border-slate-200 rounded-lg px-3 py-2 max-w-md"><Search className="w-4 h-4 text-slate-500"/><input className="w-full outline-none text-sm" placeholder="Zoek serie of aflevering" value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <div className={gridClass}>{seriesVisible.map(seriesCard)}</div>{seriesVisible.length===0&&<p className="text-sm text-slate-500">Geen series gevonden.</p>}
    </>:<>
      {active?<><button className="text-sm text-blue-700" onClick={()=>{setQuery('');setFormat('all');onSeries(null);}}>← Alle series</button><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-semibold tracking-tight">{active.title}</h1><p className="text-sm text-slate-500">{active.description} · {base.length} afleveringen</p></div><button className={primary} onClick={()=>onNewEpisode(active)}><Plus className="w-4 h-4"/>Nieuwe aflevering</button></div><div className="flex gap-1 border-b border-slate-200 overflow-x-auto">{([['episodes','Afleveringen'],['style','Huisstijl'],['production','Productie']] as const).map(([v,label])=><button key={v} onClick={()=>setSeriesPane(v)} className={'px-3 py-3 text-sm whitespace-nowrap border-b-2 '+(seriesPane===v?'border-blue-600 font-semibold':'border-transparent text-slate-500')}>{label}</button>)}</div></>:<div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-semibold tracking-tight">{tab==='templates'?'Templates':tab==='archive'?'Archief':"Alle video's"}</h1><p className="text-sm text-slate-500">{base.length} projecten</p></div><button className={button} onClick={onSync} disabled={isSyncing}><RefreshCw className="w-4 h-4"/>{isSyncing?'Synchroniseren…':'Sync GitHub'}</button></div>}
      {active&&seriesPane!=='episodes'?<div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold">{seriesPane==='style'?'Versiegebonden huisstijl':'Productieprotocol'} · v{activeTemplate(active).version}</h2>
        {seriesPane==='style'&&<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{Object.entries(activeTemplate(active).brandKit).filter(([k])=>k.endsWith('Color')).map(([k,v])=><div key={k}><div className="h-12 rounded-lg border border-slate-200" style={{backgroundColor:v}}/><p className="text-xs mt-1 text-slate-500 break-all">{k} · {v}</p></div>)}</div>}
        <p className="text-sm text-slate-700">{activeTemplate(active).instructions}</p><p className="text-sm text-slate-500">{activeTemplate(active).format} · {activeTemplate(active).fps} fps · richtduur {activeTemplate(active).durationSec} sec</p>
        <a className="text-sm text-blue-700 underline break-all" href={'https://github.com/'+repo+'/blob/'+encodeURIComponent(repoConfig.branch||'main')+'/'+activeTemplate(active).templatePath} target="_blank" rel="noreferrer">Bekijk template in GitHub</a>
        <p className="text-xs text-slate-500">Nieuwe afleveringen gebruiken de actieve versie. Bestaande video's behouden hun eigen JSON en versie.</p><button className={button} onClick={()=>void copyPrompt(episodePrompt(active,projects,repo),'episode')}><Copy className="w-4 h-4"/>{copy==='episode'?'Gekopieerd':'Kopieer afleveringprompt'}</button>
      </div>:<>
        <div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 border bg-white border-slate-200 rounded-lg px-3 py-2 flex-1 min-w-40"><Search className="w-4 h-4 text-slate-500"/><input className="w-full outline-none text-sm" placeholder="Zoek video" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Formaat" className={button} value={format} onChange={e=>setFormat(e.target.value)}><option value="all">Alle formaten</option><option>9:16</option><option>16:9</option><option>1:1</option></select>{tab!=='templates'&&<select aria-label="Productiestatus" className={button} value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Alle statussen</option><option value="unknown">Niet vastgelegd</option>{Object.entries(statusNames).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select>}{!active&&<select aria-label="Sortering" className={button} value={order} onChange={e=>setOrder(e.target.value)}><option value="recent">Recent</option><option value="title">Titel</option></select>}<button aria-label="Raster" aria-pressed={view==='grid'} className={button+(view==='grid'?' bg-slate-100':'')} onClick={()=>setView('grid')}><LayoutGrid className="w-4 h-4"/></button><button aria-label="Lijst" aria-pressed={view==='list'} className={button+(view==='list'?' bg-slate-100':'')} onClick={()=>setView('list')}><List className="w-4 h-4"/></button></div>
        {filtered.length===0?<div className="border border-dashed rounded-xl border-slate-300 p-8 text-center text-sm text-slate-500">Nog geen projecten voor deze selectie.</div>:active?Array.from(new Set(filtered.map(p=>episodeInfo(p)?.season??1))).map(season=><section key={season} className="space-y-3"><h2 className="text-sm font-semibold text-slate-600">Seizoen {season}</h2><div className={view==='grid'?gridClass:'space-y-2'}>{filtered.filter(p=>(episodeInfo(p)?.season??1)===season).map(p=>projectCard(p,view==='list'))}</div></section>):<div className={view==='grid'?gridClass:'space-y-2'}>{filtered.map(p=>projectCard(p,view==='list'))}</div>}
      </>}
    </>}
    {promptText&&<details className="bg-white border border-slate-200 rounded-lg p-3"><summary className="text-sm cursor-pointer">Laatste gekopieerde prompt bekijken</summary><textarea readOnly value={promptText} className="mt-3 w-full min-h-40 border border-slate-200 rounded-lg p-3 text-xs" aria-label="Prompt"/></details>}
  </div>;
}
