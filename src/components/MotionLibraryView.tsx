import { useState } from 'react';
import JSZip from 'jszip';
import registry from '../../motion-packages/index.json';

const raw = import.meta.glob<string>('../../motion-packages/*/*', { eager: true, query: '?raw', import: 'default' });
type Entry = {path:string;role:string;sha256:string};
type Manifest = {specVersion:string;name:string;version:string;files:Entry[];motion:string;design:{path:string};skill?:string;licenseFile:string};
const read = (folder:string,path:string) => {
  const value=raw['../../'+folder+'/'+path];
  if(typeof value!=='string') throw Error('Bestand ontbreekt: '+path);
  return value;
};
const hash=async (value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
export function MotionLibraryView(){
 const [selected,setSelected]=useState(registry.packages[0]?.name??'');
 const [file,setFile]=useState('MOTION.md');
 const [status,setStatus]=useState('');
 const [busy,setBusy]=useState(false);
 const [review,setReview]=useState('');
 const p=registry.packages.find(x=>x.name===selected);
 if(!p)return <p>Geen Motion Packages.</p>;
 const manifest=JSON.parse(read(p.folder,'motion-package.json')) as Manifest;
 const docs=['MOTION.md','DESIGN.md','SKILL.md','LICENSE','motion-package.json'];
 const reviewPrompt='Review de daadwerkelijke MP4 voor '+p.title+' / template '+p.templateVersion+'. Lees '+p.folder+'/MOTION.md en DESIGN.md. Noteer broncommit, project-slug, output SHA-256 en tijdcodes. Controleer shotvolgorde, overgangen, camera, leesbaarheid, veilige zones, audio/captions en technische export. Markeer elke controle als geslaagd, afwijkend of niet uitgevoerd. Verwar hashcontrole niet met visuele acceptatie.';
 async function exportZip(){
   if(!p)return;setBusy(true);setStatus('');
   try{
     if(manifest.specVersion!=='0.2'||manifest.name!==p.name)throw Error('Onbekend pakket');
     const seen=new Set<string>(); const zip=new JSZip(); const root=zip.folder(manifest.name)!;
     for(const e of manifest.files){
       if(!/^[a-zA-Z0-9_.-]+$/.test(e.path)||e.path==='.'||e.path==='..'||e.path==='motion-package.json'||seen.has(e.path.toLowerCase()))throw Error('Ongeldig inventarispad: '+e.path);
       seen.add(e.path.toLowerCase());const content=read(p.folder,e.path);
       if(await hash(content)!==e.sha256)throw Error('SHA-256 wijkt af: '+e.path);
       root.file(e.path,content);
     }
     for(const required of [manifest.motion,manifest.design.path,manifest.licenseFile])if(!manifest.files.some(e=>e.path===required))throw Error('Verplicht bestand ontbreekt');
     root.file('motion-package.json',read(p.folder,'motion-package.json'));
     const blob=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=manifest.name+'.zip';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
     setStatus('ZIP gemaakt; alle inventarishashes gecontroleerd. Geen rendertest.');
   }catch(e){setStatus(e instanceof Error?e.message:String(e));}finally{setBusy(false);}
 }
 return <section className="space-y-5">
  <header><h1 className="text-2xl font-semibold">Motion Library</h1><p className="text-sm text-slate-600">Motion Package v0.2 · regie en ontwerp · native project JSON blijft de rendererbron.</p></header>
  <div className="rounded-xl border bg-white p-4 space-y-3">
   <label className="block text-sm font-medium">Serie en template<select className="block w-full mt-1 border rounded p-2" value={selected} disabled={busy} onChange={e=>{setSelected(e.target.value);setFile('MOTION.md');setStatus('');setReview('');}}>{registry.packages.map(x=><option key={x.name} value={x.name}>{x.title} · v{x.templateVersion}</option>)}</select></label>
   <div className="flex flex-wrap gap-2">{docs.map(d=><button key={d} onClick={()=>setFile(d)} aria-pressed={file===d} className={'rounded border px-3 py-2 text-sm '+(file===d?'bg-slate-900 text-white':'bg-white')}>{d}</button>)}</div>
   <pre className="whitespace-pre-wrap break-words max-h-[34rem] overflow-auto rounded bg-slate-50 p-4 text-sm">{read(p.folder,file)}</pre>
   <div className="flex flex-wrap gap-2"><button disabled={busy} onClick={()=>void exportZip()} className="rounded bg-slate-900 text-white px-4 py-2 disabled:opacity-50">{busy?'Controleren…':'Download Motion Package ZIP'}</button><button className="rounded border px-4 py-2" onClick={()=>{void navigator.clipboard.writeText(read(p.folder,file)).then(()=>setStatus('Document gekopieerd')).catch(()=>setStatus('Kopiëren mislukt'));}}>Kopieer document</button></div>
   <p role="status" className="text-sm">{status}</p><p className="text-xs text-slate-500">Knowledge-only pakket. Geen runtime, media of herdistributierechten. Geen visuele acceptatie.</p>
  </div>
  <div className="rounded-xl border bg-white p-4 space-y-2"><h2 className="font-semibold">Review van de echte export</h2><p className="text-sm">{reviewPrompt}</p><button className="rounded border px-3 py-2 text-sm" onClick={()=>{void navigator.clipboard.writeText(reviewPrompt).then(()=>setStatus('Reviewprompt gekopieerd')).catch(()=>setStatus('Kopiëren mislukt'));}}>Kopieer reviewprompt</button><label className="block text-sm">Reviewbevindingen (lokaal concept)<textarea className="block w-full border rounded p-2 mt-1" rows={5} value={review} onChange={e=>setReview(e.target.value)} placeholder="Projectrevision, outputhash, tijdcodes, bevindingen en open punten"/></label><button className="rounded border px-3 py-2 text-sm" onClick={()=>{void navigator.clipboard.writeText(reviewPrompt+'\n\n'+review).then(()=>setStatus('Review gekopieerd')).catch(()=>setStatus('Kopiëren mislukt'));}}>Kopieer review voor GitHub</button></div>
  <div className="rounded-xl border bg-white p-4 space-y-3"><h2 className="font-semibold">Upstream Remix referenties</h2><p className="text-sm text-slate-600">Zes originele referenties, geen geïmporteerde of geteste native templates.</p>{registry.profiles.map(x=><article key={x.id} className="border-t pt-3"><h3 className="font-medium">{x.title} · {x.duration} s</h3><p className="text-sm">{x.adaptation}</p><p className="text-xs text-slate-500">{x.status}</p><div className="flex gap-4 text-sm"><a className="underline" href={x.reference} target="_blank" rel="noreferrer">Motion.md</a><a className="underline" href={x.source} target="_blank" rel="noreferrer">Broncode</a><a className="underline" href={x.preview} target="_blank" rel="noreferrer">Referentievideo</a></div></article>)}</div>
 </section>;
}
