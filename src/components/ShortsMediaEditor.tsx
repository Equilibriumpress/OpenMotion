import { HUMAN_POSES, HUMAN_FACES } from '../engine/humanSideRenderer';
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
   const c=route.geometry.coordinates;
   const minLon=Math.min(...c.map(p=>p[0])),maxLon=Math.max(...c.map(p=>p[0]));
   const minLat=Math.min(...c.map(p=>p[1])),maxLat=Math.max(...c.map(p=>p[1]));
   const lat=(minLat+maxLat)/2,lon=(minLon+maxLon)/2;
   const latPad=Math.max(.003,(maxLat-minLat)*.12),lonPad=Math.max(.003,(maxLon-minLon)*.12);
   const scenes=project.scenes.map(s=>{
     if(s.premiumTravel){
     count++;
     const path=route.geometry.coordinates;
     let routeLength=0;const cumulative=[0];
     for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];routeLength+=Math.hypot((b[0]-a[0])*.55,b[1]-a[1]);cumulative.push(routeLength);}
     const fractions=s.premiumTravel.stops.map(stop=>{
       let nearest=0,dist=Infinity;
       path.forEach(([lon,lat],i)=>{const d=Math.hypot((lon-stop.lon)*.55,lat-stop.lat);if(d<dist){dist=d;nearest=i;}});
       return routeLength?cumulative[nearest]/routeLength:0;
     });
     const pr=s.premiumTravel;
     const i=Math.max(1,pr.focusStopIndex);
     const from=pr.chapter==='drive'?(fractions[i-1]??0):0;
     const to=pr.chapter==='finale'?1:pr.chapter==='opening'?0.04:(fractions[i]??1);
     return {...s,premiumTravel:{...pr,route,roadMatched:true,routeProgressFrom:from,routeProgressTo:to}};
   }
   if(s.geoRoute){count++;return {...s,geoRoute:{...s.geoRoute,route,waypoints:[{name:'Start',lat:c[0][1],lon:c[0][0]},{name:'Finish',lat:c[c.length-1][1],lon:c[c.length-1][0]}]}};}
     if(s.editorialMap){count++;return {...s,editorialMap:{...s.editorialMap,routeCoords:c.map(([lon,lat])=>[lat,lon] as [number,number]),bounds:{minLat:minLat-latPad,maxLat:maxLat+latPad,minLon:minLon-lonPad,maxLon:maxLon+lonPad},cameraFrom:{lat,lon,zoom:1},cameraTo:{lat,lon,zoom:1.2},streets:[],parks:[],buildings:[],stops:[]}};}
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
  {activeScene.premiumTravel&&(()=>{
     const pr=activeScene.premiumTravel;
     const index=Math.max(0,pr.focusStopIndex);
     const stop=pr.stops[index];
     const changeStop=(field:'note'|'photoUrl'|'name',value:string)=>{
       onUpdateScene({premiumTravel:{...pr,stops:pr.stops.map((p,i)=>i===index?{...p,[field]:value}:p)}});
     };
     return <div className="space-y-2 border border-emerald-200 rounded-xl p-3">
       <h4 className="text-xs font-bold text-emerald-900">Premium Travel Route</h4>
       <p className="text-xs text-slate-500">De preview haalt wegen op via OSRM. Importeer een opgenomen GPX-route voor een zelfstandig bewaard traject.</p>
       <label className="block text-xs">Fotostop<select value={pr.focusStopIndex} className={style} onChange={e=>onUpdateScene({premiumTravel:{...pr,focusStopIndex:Number(e.target.value)}})}>
         <option value={-1}>Alle stops (overzicht)</option>{pr.stops.map((s,i)=><option key={i} value={i}>{s.name}</option>)}
       </select></label>
       {stop&&<><label className="block text-xs">Plaatsnaam<input className={style} value={stop.name} onChange={e=>changeStop('name',e.target.value)}/></label>
       <label className="block text-xs">Uitleg<textarea rows={3} className={style} value={stop.note} onChange={e=>changeStop('note',e.target.value)}/></label>
       <label className="block text-xs">Foto URL<input className={style} value={stop.photoUrl} onChange={e=>changeStop('photoUrl',e.target.value)}/></label></>}
       <label className="block text-xs">Route-markering
         <select className={style} value={pr.markerStyle??'dot'} onChange={e=>onUpdateScene({premiumTravel:{...pr,markerStyle:e.target.value as 'dot' | 'camper'}})}>
           <option value="dot">Bewegende stip (aanbevolen)</option>
           <option value="camper">Kleine camper (experimenteel)</option>
         </select>
       </label>
       <label className="block text-xs">Camera zoom<input className={style} type="number" min={3} max={15} step=".1" value={pr.mapZoom} onChange={e=>onUpdateScene({premiumTravel:{...pr,mapZoom:Number(e.target.value)}})}/></label>
     </div>;
   })()}

  {activeScene.bucketList&&(()=>{
    const data=activeScene.bucketList;
    const patchScene=(update:Partial<typeof data>)=>onUpdateScene({bucketList:{...data,...update}});
    const globalField=(field:'destination'|'country'|'region'|'episode'|'latitude'|'longitude'|'startLongitude'|'startLatitude',value:string|number)=>{
      onUpdateProject({...project,scenes:project.scenes.map(scene=>scene.bucketList?{
        ...scene,bucketList:{...scene.bucketList,[field]:value}
      }:scene)});
    };
    return <div className="space-y-2 border border-amber-200 rounded-xl p-3">
      <h4 className="text-sm font-semibold text-amber-900">My Bucket List · Bestemming</h4>
      <p className="text-xs text-slate-500">De bestemming en startcoördinaten wijzigen voor de hele film. Kaartbeelden worden opnieuw opgebouwd na een wijziging.</p>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs">Aflevering<input className={style} type="number" min={1} value={data.episode} onChange={e=>globalField('episode',Math.max(1,Number(e.target.value)))}/></label>
        <label className="text-xs">Bestemming<input className={style} value={data.destination} onChange={e=>globalField('destination',e.target.value)}/></label>
        <label className="text-xs">Regio<input className={style} value={data.region} onChange={e=>globalField('region',e.target.value)}/></label>
        <label className="text-xs">Land<input className={style} value={data.country} onChange={e=>globalField('country',e.target.value)}/></label>
        <label className="text-xs">Breedtegraad<input className={style} type="number" step=".0001" min="-85" max="85" value={data.latitude} onChange={e=>globalField('latitude',Number(e.target.value))}/></label>
        <label className="text-xs">Lengtegraad<input className={style} type="number" step=".0001" min="-180" max="180" value={data.longitude} onChange={e=>globalField('longitude',Number(e.target.value))}/></label>
        <label className="text-xs">Start lengtegraad<input className={style} type="number" step=".1" value={data.startLongitude??0} onChange={e=>globalField('startLongitude',Number(e.target.value))}/></label>
        <label className="text-xs">Start breedtegraad<input className={style} type="number" step=".1" value={data.startLatitude??0} onChange={e=>globalField('startLatitude',Number(e.target.value))}/></label>
      </div>
      {data.chapter!=='zoom'&&<div className="space-y-2 border-t border-amber-100 pt-2">
        {data.chapter==='reason'&&<>
          <label className="block text-xs">Reden nummer<input type="number" min={1} max={3} className={style} value={data.reasonNumber??1} onChange={e=>patchScene({reasonNumber:Number(e.target.value)})}/></label>
          <label className="block text-xs">Reden titel<textarea rows={2} className={style} value={data.reasonTitle??''} onChange={e=>patchScene({reasonTitle:e.target.value})}/></label>
          <label className="block text-xs">Korte toelichting<input className={style} value={data.reasonCopy??''} onChange={e=>patchScene({reasonCopy:e.target.value})}/></label>
        </>}
        <label className="block text-xs">Uitsnede foto (horizontaal 0–1)
          <input className={style} type="number" min="0" max="1" step=".05" value={data.imageFocusX??.5}
            onChange={e=>patchScene({imageFocusX:Math.max(0,Math.min(1,Number(e.target.value)))})}/>
        </label>
        <label className="block text-xs">Fotograaf<input className={style} value={data.imageAuthor??''} onChange={e=>patchScene({imageAuthor:e.target.value})}/></label>
        <label className="block text-xs">Licentie<input className={style} value={data.imageLicense??''} onChange={e=>patchScene({imageLicense:e.target.value})}/></label>
        <label className="block text-xs">Bronfoto URL<input className={style} value={data.imageSourceUrl??''} onChange={e=>patchScene({imageSourceUrl:e.target.value})}/></label>
        <p className="text-xs text-slate-500">Bewerk de foto via het veld Scène-afbeelding bovenaan. Vergeet de juiste licentiegegevens niet.</p>
      </div>}
    </div>;
  })()}
  <div className="flex justify-between items-center"><h4 className="text-xs font-bold">Audio timeline</h4><button type="button" className="text-xs text-blue-700" onClick={()=>setTracks([...tracks,{id:'audio-'+Date.now(),kind:'voiceover',src:'',startSec:0,volume:1}])}>+ Track</button></div>
  {tracks.map((track,i)=><div key={track.id} className="p-2 rounded border space-y-2">
   <div className="flex gap-2"><select className={style} value={track.kind} onChange={e=>updateTrack(i,{kind:e.target.value as OpenMotionAudioTrack['kind']})}><option value="voiceover">Voice-over</option><option value="music">Muziek</option><option value="effect">Effect</option></select><button type="button" className="text-red-700 text-xs" onClick={()=>setTracks(tracks.filter((_,j)=>j!==i))}>Verwijder</button></div>
   <input className={style} value={track.src} placeholder="assets/audio/voice.mp3" onChange={e=>updateTrack(i,{src:e.target.value})}/>
   <div className="grid grid-cols-2 gap-2">{(['startSec','endSec','volume','fadeInSec','fadeOutSec'] as const).map(k=><label key={k} className="text-[11px]">{k}<input type="number" min="0" step=".1" className={style} value={track[k]??''} onChange={e=>updateTrack(i,{[k]:e.target.value===''?undefined:Number(e.target.value)})}/></label>)}</div>
  </div>)}
  <p className="text-xs text-slate-500">Audiobestanden in public/assets/ of een CORS-geschikt adres. De losse preview-soundscape wordt niet mee geëxporteerd.</p>

  {activeScene.doodle&&(()=>{
    const doodle=activeScene.doodle;
    const update=(patch:Partial<NonNullable<OpenMotionScene['doodle']>>)=>onUpdateScene({doodle:{...doodle,...patch}});
    if(doodle.extras?.includes('song-explainer-v1')){
      const extras=doodle.extras??[];
      const get=(key:string,fallback='')=>extras.find(x=>x.startsWith(key+':'))?.slice(key.length+1)??fallback;
      const set=(key:string,value:string)=>update({extras:[...extras.filter(x=>!x.startsWith(key+':')),key+':'+value]});
      const cinematic=extras.includes('song-cinematic-v2');
      return <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-700">The Song Explained · {cinematic?'Cinematic v2':'vectorillustraties'}</p>
        <label className="block text-xs text-slate-600">Scène
          <select className="w-full rounded border border-slate-200 p-2" value={get('shot','road')} onChange={e=>set('shot',e.target.value)}>
            {(cinematic?['longing','shop','drive','return','reflection','road','night','symbol']:['road','room','shop','night','return','symbol']).map(v=><option key={v}>{v}</option>)}
          </select>
        </label>
        <label className="block text-xs text-slate-600">Camera
          <select className="w-full rounded border border-slate-200 p-2" value={get('camera','push')} onChange={e=>set('camera',e.target.value)}>
            <option value="push">Langzaam inzoomen</option><option value="pull">Langzaam uitzoomen</option>{cinematic&&<option value="track">Tracking</option>}
          </select>
        </label>
        <label className="block text-xs text-slate-600">Symbool
          <select className="w-full rounded border border-slate-200 p-2" value={get('symbol','car')} onChange={e=>set('symbol',e.target.value)}>
            {['car','record','heart'].map(v=><option key={v}>{v}</option>)}
          </select>
        </label>
        {['episode','artist','cover-title','cover-hook'].map(k=><label key={k} className="block text-xs text-slate-600">{k}
          <input className="w-full rounded border border-slate-200 p-2" value={get(k)} onChange={e=>set(k,e.target.value)}/>
        </label>)}
        <label className="block text-xs text-slate-600">Engelse voice-over (herpubliceer via GitHub voor nieuwe audio)
          <textarea rows={4} className="w-full rounded border border-slate-200 p-2" value={doodle.narration??''} onChange={e=>update({narration:e.target.value})}/>
        </label>
        <p className="text-xs text-slate-500">Gebruik | voor een nieuwe regel in de headline. Laat cover-title leeg behalve in scène 1.</p>
      </div>;
    }
    if(doodle.extras?.includes('human-side-v1')){
      const extras=doodle.extras??[];
      const get=(key:string,fallback='')=>extras.find(x=>x.startsWith(key+':'))?.slice(key.length+1)??fallback;
      const set=(key:string,value:string)=>update({extras:[...extras.filter(x=>!x.startsWith(key+':')),key+':'+value]});
      const shot=get('shot','contrast');
      const poseA=shot==='message'?'phone':shot==='worry'?'panic':shot==='reveal'?'relief':'worried';
      const poseB=shot==='message'?'phone':shot==='reveal'?'relief':'calm';
      const faceA=shot==='message'?'neutral':shot==='worry'?'panic':shot==='reveal'?'relief':'worry';
      return <div className="space-y-3 rounded-xl border border-purple-200 p-3">
        <h4 className="font-semibold text-sm text-purple-900">The Human Side · stickfiguren</h4>
        {activeScene.id===project.scenes[0]?.id&&<div className="space-y-2 border-b border-purple-100 pb-3">
          <h5 className="text-xs font-semibold">Shorts / TikTok cover</h5>
          <label className="block text-xs">Covertekst (max. twee regels, scheiding |)<input className={style} value={get('cover-title')} placeholder="SAME MESSAGE|DIFFERENT MINDS" onChange={e=>set('cover-title',e.target.value)}/></label>
          <label className="block text-xs">Korte hook<input className={style} value={get('cover-hook',get('message'))} onChange={e=>set('cover-hook',e.target.value)}/></label>
          {(['a','b'] as const).map(side=><div key={side} className="grid grid-cols-2 gap-2">
            <label className="block text-xs">Coverhouding {side.toUpperCase()}<select className={style} value={get('cover-pose-'+side,side==='a'?'kneel':'joy')} onChange={e=>set('cover-pose-'+side,e.target.value)}>{Object.keys(HUMAN_POSES).map(v=><option key={v}>{v}</option>)}</select></label>
            <label className="block text-xs">Covergezicht {side.toUpperCase()}<select className={style} value={get('cover-face-'+side,side==='a'?'panic':'joy')} onChange={e=>set('cover-face-'+side,e.target.value)}>{HUMAN_FACES.map(v=><option key={v}>{v}</option>)}</select></label>
          </div>)}
          <p className="text-xs text-slate-500">Lege covertekst schakelt de cover uit. Kies bij upload het frame rond 0,3 seconde.</p>
        </div>}

        <label className="block text-xs">Scène<select className={style} value={shot} onChange={e=>set('shot',e.target.value)}>
          {['message','worry','calm','contrast','reveal'].map(v=><option key={v}>{v}</option>)}
        </select></label>
        {(['a','b'] as const).map(side=><div key={side} className="space-y-2 border-t border-purple-100 pt-2">
          <h5 className="text-xs font-semibold">Personage {side.toUpperCase()}</h5>
          <label className="block text-xs">Houding<select className={style} value={get('pose-'+side,side==='a'?poseA:poseB)} onChange={e=>set('pose-'+side,e.target.value)}>
            {Object.keys(HUMAN_POSES).map(v=><option key={v}>{v}</option>)}
          </select></label>
          <label className="block text-xs">Gezicht<select className={style} value={get('face-'+side,side==='a'?faceA:shot==='message'?'neutral':'smile')} onChange={e=>set('face-'+side,e.target.value)}>
            {HUMAN_FACES.map(v=><option key={v}>{v}</option>)}
          </select></label>
          <label className="block text-xs">Gedachte<input className={style} value={get('label-'+side)} onChange={e=>set('label-'+side,e.target.value)}/></label>
        </div>)}
        <label className="block text-xs">Bericht<input className={style} value={get('message','We need to talk.')} onChange={e=>set('message',e.target.value)}/></label>
        <label className="block text-xs">Afleveringsnummer<input className={style} value={get('episode','01')} onChange={e=>set('episode',e.target.value)}/></label>
        <label className="block text-xs">Bijschrift<input className={style} value={activeScene.caption??''} onChange={e=>onUpdateScene({caption:e.target.value})}/></label>
        <label className="block text-xs">Voice-overtekst<textarea className={style} rows={3} value={doodle.narration??activeScene.headline} onChange={e=>update({narration:e.target.value})}/></label>
        <p className="text-xs text-slate-500">Nieuwe verteltekst wordt bij de volgende normale GitHub-publicatie opnieuw ingesproken. Houdingen en gezichten zijn direct zichtbaar in de preview.</p>
      </div>;
    }
    return <div className="space-y-3 rounded-xl border border-rose-200 p-3">
      <h4 className="font-semibold text-sm text-rose-900">Doodle explainer · Illustraties</h4>
      <label className="block text-xs text-slate-600">Scène
        <select className={style} value={doodle.setting} onChange={e=>update({setting:e.target.value as typeof doodle.setting})}>
          {(['bed','shower','brain','standing','checklist','clock','outro'] as const).map(v=><option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label className="block text-xs text-slate-600">Achtergrond
        <select className={style} value={doodle.palette} onChange={e=>update({palette:e.target.value as typeof doodle.palette})}>
          {(['night','cream','shower','morning','quiet','gray'] as const).map(v=><option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label className="block text-xs text-slate-600">Gezichtsuitdrukking
        <select className={style} value={doodle.mood} onChange={e=>update({mood:e.target.value as typeof doodle.mood})}>
          {(['sleepy','relaxed','happy','worried','surprised','overwhelmed'] as const).map(v=><option key={v} value={v}>{v}</option>)}
        </select>
      </label>
      <label className="block text-xs text-slate-600">Houding van het personage
        <select className={style} value={doodle.pose??'neutral'} onChange={e=>update({pose:e.target.value as NonNullable<typeof doodle.pose>})}>
          <option value="neutral">Neutraal · armen rustig</option>
          <option value="relieved">Vrij / opgelucht · armen open</option>
          <option value="alert">Schrik / spanning · armen omhoog</option>
          <option value="exhausted">Uitgeput · armen laag</option>
          <option value="point">Wijzen · één arm uit</option>
        </select>
      </label>
      <label className="block text-xs text-slate-600">Rode accentwoorden (gescheiden met komma)
        <input className={style} value={(doodle.emphasis??[]).join(', ')}
          onChange={e=>update({emphasis:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)})}/>
      </label>
      <label className="block text-xs text-slate-600">Illustratie-elementen (één per regel)
        <textarea rows={3} className={style} value={(doodle.extras??[]).join('\n')}
          onChange={e=>update({extras:e.target.value.split('\n').map(x=>x.trim()).filter(Boolean)})}/>
      </label>
      <label className="block text-xs text-slate-600">Kloklabel (optioneel)
        <input className={style} value={doodle.clockText??''} onChange={e=>update({clockText:e.target.value})}/>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs">Truikleur<input type="color" className={style} value={doodle.shirtColor??'#829D58'}
          onChange={e=>update({shirtColor:e.target.value})}/></label>
        <label className="block text-xs">Accentkleur<input type="color" className={style} value={doodle.highlightColor??'#D65C55'}
          onChange={e=>update({highlightColor:e.target.value})}/></label>
      </div>
      <label className="block text-xs text-slate-600">Verteltekst voor voice-over
        <textarea className={style} rows={3} value={doodle.narration??activeScene.headline}
          onChange={e=>update({narration:e.target.value})}/>
      </label>
      <p className="text-xs text-slate-500">Alle figuren zijn vectoranimaties. Neem een eigen voice-over op en voeg het audiobestand via de audiotracks toe.</p>
    </div>;
  })()}
  {activeScene.explainer&&<label className="block text-xs text-slate-600">Explainer diagramlabels (één per regel)
    <textarea rows={3} className={style} value={activeScene.explainer.visualLabels.join('\n')}
      onChange={e=>onUpdateScene({explainer:{...activeScene.explainer!,visualLabels:e.target.value.split('\n').filter(Boolean)}})}/>
  </label>}
  {activeScene.paperChapters&&<label className="block text-xs text-slate-600">Hoofdstukken / paper cards
    <textarea rows={3} className={style} value={activeScene.paperChapters.join('\n')}
      onChange={e=>onUpdateScene({paperChapters:e.target.value.split('\n').filter(Boolean)})}/>
  </label>}
  {activeScene.whiteboard&&<label className="block text-xs text-slate-600">Whiteboard labels
    <textarea rows={2} className={style} value={activeScene.whiteboard.labels.join('\n')}
      onChange={e=>onUpdateScene({whiteboard:{...activeScene.whiteboard!,labels:e.target.value.split('\n').filter(Boolean)}})}/>
  </label>}
  {activeScene.chartSeries&&<label className="block text-xs text-slate-600">Grafiekgegevens: periode,waarde per regel
    <textarea rows={5} className={style} value={activeScene.chartSeries.points.map(p=>p.xLabel+','+p.value).join('\n')}
      onChange={e=>{const points=e.target.value.split('\n').map(x=>x.split(',')).filter(x=>x.length===2&&Number.isFinite(Number(x[1]))).map(([xLabel,value])=>({xLabel,value:Number(value)}));onUpdateScene({chartSeries:{...activeScene.chartSeries!,points}});}}/>
  </label>}
  {activeScene.quote&&<label className="block text-xs text-slate-600">Citaat
    <textarea rows={2} className={style} value={activeScene.quote.text} onChange={e=>onUpdateScene({quote:{...activeScene.quote!,text:e.target.value}})}/>
  </label>}

  <div className="flex justify-between items-center"><h4 className="text-xs font-bold">Getimede captions</h4><button type="button" className="text-xs text-blue-700" onClick={()=>onUpdateProject({...project,captions:[...(project.captions??[]),{text:'New caption',startSec:0,endSec:2,style:'karaoke'}]})}>+ Caption</button></div>
  <input className={style} type="file" accept=".srt" aria-label="Import SRT captions" onChange={e=>void fileSubtitles(e)}/>
  {(project.captions??[]).map((c,i)=><div key={i} className="space-y-1 border-b border-slate-100 pb-2"><div className="grid grid-cols-5 gap-1">
   <input className={style} type="number" step=".1" aria-label="Start caption" value={c.startSec} onChange={e=>updateCaption(i,{startSec:Number(e.target.value)})}/>
   <input className={style} type="number" step=".1" aria-label="Eind caption" value={c.endSec} onChange={e=>updateCaption(i,{endSec:Number(e.target.value)})}/>
   <input className={style+' col-span-2'} value={c.text} aria-label="Captiontekst" onChange={e=>updateCaption(i,{text:e.target.value})}/>
   <button type="button" className="text-red-700" onClick={()=>onUpdateProject({...project,captions:(project.captions??[]).filter((_,j)=>j!==i)})}>×</button>
  </div><div className="grid grid-cols-4 gap-1">
    <select aria-label="Caption style" className={style} value={c.style??'karaoke'} onChange={e=>updateCaption(i,{style:e.target.value})}><option value="karaoke">Karaoke</option><option value="block">Block</option><option value="minimal">Minimal</option></select>
    <input type="color" aria-label="Caption color" className={style} value={c.color??'#FFE69A'} onChange={e=>updateCaption(i,{color:e.target.value})}/>
    <label className="text-[10px]">Positie<input className={style} type="number" min=".18" max=".82" step=".05" value={c.position??.78} onChange={e=>updateCaption(i,{position:Number(e.target.value)})}/></label>
    <label className="text-[10px]">Font px<input className={style} type="number" min="18" max="90" value={c.fontSizePx??49} onChange={e=>updateCaption(i,{fontSizePx:Number(e.target.value)})}/></label>
  </div></div>)}
 </section>;
}
