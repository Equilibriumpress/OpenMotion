import { readFile } from 'node:fs/promises';
import { inspectPackage } from '../packages/motion-package/index.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const json=async p=>JSON.parse(await readFile(path.join(root,p),'utf8'));
const registry=await json('motion-packages/index.json');
const catalog=await json('series/catalog.json');
const names=new Set(),versions=new Set();
for(const p of registry.packages){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.name)||p.folder!=='motion-packages/'+p.name||names.has(p.name))throw Error('Invalid registry path or duplicate '+p.name);
 names.add(p.name);const key=p.seriesId+'/'+p.templateVersion;
 if(versions.has(key))throw Error('Duplicate package version '+key);versions.add(key);
 const s=catalog.series.find(s=>s.id===p.seriesId);
 if(!s?.versions.some(v=>v.version===p.templateVersion))throw Error('Unknown template '+key);
 const {manifest}=await inspectPackage(path.join(root,p.folder));
 if(manifest.name!==p.name||manifest.extensions?.['nl.equilibriumpress']?.templateVersion!==p.templateVersion)throw Error('Identity mismatch '+key);
 console.log('OK '+p.name);
}
for(const s of catalog.series)if(!versions.has(s.id+'/'+s.activeVersion))throw Error('Missing active package '+s.id);
console.log('Verified '+names.size+' packages; not a render test.');
