import { ChangeEvent, useState } from 'react';
import { OpenMotionProject, OpenMotionScene, OpenMotionAudioTrack } from '../types/openmotion';
import { parseRouteFile, parseSrt } from '../engine/routeImport';
interface Props { project:OpenMotionProject; activeScene:OpenMotionScene; onUpdateProject:(p:OpenMotionProject)=>void; onUpdateScene:(s:Partial<OpenMotionScene>)=>void }
const style='w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white';
export function ShortsMediaEditor({project,activeScene,onUpdateProject,onUpdateScene}:Props) {
 const [error,setError]=useState('');
 const tracks=project.audioTracks??[];
 const setTracks=(audioTracks:OpenMotionAudioTrack[])=>onUpdateProject({...project,audioTracks});
 const updateTrack=(i:number,patch:Partial<OpenMotionAudioTrack>)=>setTracks(tracks.map((t,j)=>j===i?{...t,...patch}:t));
 const updateCaption=(i:number,patch:{[key:string]:unknown})=>onUpdateProject({...project,captions:(project.captions??[]).map((c,j)=>i===j?{...c,...patch,words:undefined}:c)});
 const fileSubtitles=async(e:ChangeEvent<HTMLInputElement>)=>{
  const f=e.target.files?.[0];if(!f)return;
  try{const captions=parseSrt(await f.text());if(!captions.length)throw new Error('Geen geldige captions');onUpdateProject({...project,captions});setError('');}catch(err){setError(String(err));}e.target.value='';
 };
 const fileRoute=async(e:ChangeEvent<HTMLInputElement>)=>{
  const f=e.target.files?.[0];if(!f)return;
  try{
   const route=parseRouteFile(await f.text(),f.name);let count=0;
   const scenes=project.scenes.map(s=>{
     if(s.geoRoute){count++;return {...s,geoRoute:{...s.geoRoute,route}};}
     if(s.editorialMap){count++;return {...s,editorialMap:{...s.editorialMap,routeCoords:route.geometry.coordinates.map(([lon,lat])=>[lat,lon] as [number,number]),streets:[],parks:[],buildings:[],stops:[]}};}
     return s;
   });
   if(!count)throw new Error('Geen kaartscènes in dit project');
   onUpdateProject({...project,scenes});setError('');
  }catch(err){setError(String(err));}e.target.value='';
 };
 return <section className="space-y-3 pb-4 border-b border-slate-200">
  <h3 className="text-sm font-bold">Shorts media, routes en captions</h3>
  {error&&<p role="alert" className="text-xs text-red-700">{error}</p>}
  <label className="block text-xs text-slate-600">Scène-afbeelding / boekomslag
   <input className={style} value={activeScene.imageUrl??''} placeholder="assets/photo.jpg" onChange={e=>onUpdateScene({imageUrl:e.target.value})}/>
  </label>
  <label className="block text-xs text-slate-600">Importeer GPX of GeoJSON
   <input className={style} type="file" accept=".gpx,.geojson,.json" onChange={e=>void fileRoute(e)}/>
  </label>
  <div className="flex justify-between items-center"><h4 className="text-xs font-bold">Audio timeline</h4><button type="button" className="text-xs text-blue-700" onClick={()=>setTracks([...tracks,{id:'audio-'+Date.now(),kind:'voiceover',src:'',startSec:0,volume:1}])}>+ Track</button></div>
  {tracks.map((track,i)=><div key={track.id} className="p-2 rounded border space-y-2">
   <div className="flex gap-2"><select className={style} value={track.kind} onChange={e=>updateTrack(i,{kind:e.target.value as OpenMotionAudioTrack['kind']})}><option value="voiceover">Voice-over</option><option value="music">Muziek</option><option value="effect">Effect</option></select><button type="button" className="text-red-700 text-xs" onClick={()=>setTracks(tracks.filter((_,j)=>j!==i))}>Verwijder</button></div>
   <input className={style} value={track.src} placeholder="assets/audio/voice.mp3" onChange={e=>updateTrack(i,{src:e.target.value})}/>
   <div className="grid grid-cols-2 gap-2">{(['startSec','endSec','volume','fadeInSec','fadeOutSec'] as const).map(k=><label key={k} className="text-[11px]">{k}<input type="number" min="0" step=".1" className={style} value={track[k]??''} onChange={e=>updateTrack(i,{[k]:e.target.value===''?undefined:Number(e.target.value)})}/></label>)}</div>
  </div>)}
  <p className="text-xs text-slate-500">Audiobestanden in public/assets/ of een publiek CORS-geschikt adres.</p>
  <div className="flex justify-between items-center"><h4 className="text-xs font-bold">Getimede captions</h4><button type="button" className="text-xs text-blue-700" onClick={()=>onUpdateProject({...project,captions:[...(project.captions??[]),{text:'New caption',startSec:0,endSec:2,style:'karaoke'}]})}>+ Caption</button></div>
  <input className={style} type="file" accept=".srt" aria-label="Import SRT captions" onChange={e=>void fileSubtitles(e)}/>
  {(project.captions??[]).map((c,i)=><div key={i} className="grid grid-cols-5 gap-1">
   <input className={style} type="number" step=".1" aria-label="Start caption" value={c.startSec} onChange={e=>updateCaption(i,{startSec:Number(e.target.value)})}/>
   <input className={style} type="number" step=".1" aria-label="Eind caption" value={c.endSec} onChange={e=>updateCaption(i,{endSec:Number(e.target.value)})}/>
   <input className={style+' col-span-2'} value={c.text} aria-label="Captiontekst" onChange={e=>updateCaption(i,{text:e.target.value})}/>
   <button type="button" className="text-red-700" onClick={()=>onUpdateProject({...project,captions:(project.captions??[]).filter((_,j)=>j!==i)})}>×</button>
  </div>)}
 </section>;
}
