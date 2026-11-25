import fs from 'fs';
import path from 'path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const rootDir = process.cwd();
const projectsDir = path.join(rootDir, 'projects');
const outDir = path.join(rootDir, 'public', 'projects');
const outFile = path.join(outDir, 'manifest.json');

// Required for both the photo preparation and the MP4/audio encoders.
if (process.env.GITHUB_ACTIONS === 'true') {
  const ready = () => ['ffmpeg','ffprobe'].every(cmd => spawnSync(cmd,['-version'],{stdio:'ignore'}).status === 0);
  if (!ready()) {
    const update=spawnSync('sudo',['apt-get','update'],{stdio:'inherit',timeout:180000});
    if(update.status !== 0) throw new Error('Unable to update package list for FFmpeg');
    const install=spawnSync('sudo',['apt-get','install','-y','ffmpeg'],{stdio:'inherit',timeout:300000});
    if(install.status !== 0 || !ready()) throw new Error('FFmpeg / FFprobe installation failed');
  }
}
// The existing GitHub Pages build generates documentary audio without a
// second workflow. Local developers may opt in with DOCUMENTARY_AUDIO=1.
if (process.env.GITHUB_ACTIONS === 'true' || process.env.DOCUMENTARY_AUDIO === '1') {
  const terrain = spawnSync('python3', ['scripts/build-documentary-terrain.py'], { stdio: 'inherit', timeout: 180000 });
  if (terrain.status !== 0) console.warn('[documentary] Optional DEM contour generation unavailable.');
  const result = spawnSync('python3', ['scripts/build-documentary-audio.py'], { stdio: 'inherit', timeout: 900000 });
  if (result.status !== 0) console.warn('[documentary] Audio generation failed; publishing visual projects without missing audio tracks.');
}
if (process.env.GITHUB_ACTIONS === 'true' || process.env.CAT_OFFICE_ASSETS === '1') {
  const cat = spawnSync('python3',['scripts/build-cat-office.py'],{stdio:'inherit',timeout:300000});
  if (cat.status !== 0) throw new Error('[cat-office] Asset preparation failed; refusing to publish missing cats.');
}
function prepareProject(p) {
  if(p.scenes?.some(s=>s.catOffice)){
    p.audioTracks=(p.audioTracks??[]).filter(t=>fs.existsSync(path.join(rootDir,'public',t.src)));
    return p;
  }
  if (p.scenes?.some(s => s.worldStory)) {
    const cueFile=path.join(rootDir,'public','assets','audio',p.slug+'-captions.json');
    if(fs.existsSync(cueFile)) p.captions=JSON.parse(fs.readFileSync(cueFile,'utf8')).map(c=>({...c,position:.78,fontSizePx:47}));
    p.audioTracks=(p.audioTracks??[]).filter(t=>fs.existsSync(path.join(rootDir,'public',t.src)));
    if(!p.audioTracks.some(t=>t.kind==='voiceover')) p.description+=' | Voice-over niet beschikbaar in deze build.';
    return p;
  }
  if (!p.scenes?.some(s => s.bucketList?.documentary)) return p;
  const contour = 'assets/maps/'+p.slug+'-contours.geojson';
  for (const scene of p.scenes) {
    const doc=scene.bucketList?.documentary;
    if (doc?.relief && fs.existsSync(path.join(rootDir,'public',contour))) doc.contourUrl=contour;
    // Direct Commons thumbnail avoids the cross-origin Special:FilePath redirect.
    if(scene.imageUrl?.startsWith('https://commons.wikimedia.org/wiki/Special:FilePath/')){
      const name=decodeURIComponent(scene.imageUrl.split('/Special:FilePath/')[1].split('?')[0]).replaceAll(' ','_');
      const hash=createHash('md5').update(name).digest('hex');
      const encoded=encodeURIComponent(name);
      scene.imageUrl='https://upload.wikimedia.org/wikipedia/commons/thumb/'+hash[0]+'/'+hash.slice(0,2)+'/'+encoded+'/1280px-'+encoded;
    }
  }
  const audioDir = path.join(rootDir,'public','assets','audio');
  const cueFile = path.join(audioDir,p.slug+'-captions.json');
  if (fs.existsSync(cueFile)) p.captions=JSON.parse(fs.readFileSync(cueFile,'utf8'));
  p.audioTracks=(p.audioTracks??[]).filter(t=>fs.existsSync(path.join(rootDir,'public',t.src)));
  if (!p.audioTracks.some(t=>t.kind==='voiceover')) {
    p.description += ' | Narration audio is unavailable in this build.';
    let start=0;
    p.captions=p.scenes.flatMap(s=>{
      const words=(s.bucketList?.documentary?.narration??'').split(/\s+/).filter(Boolean);
      const duration=s.durationSec,begin=start;
      start+=duration;
      const cues=[];
      for(let i=0;i<words.length;i+=10){
        cues.push({text:words.slice(i,i+10).join(' '),startSec:begin+.3+(duration-.8)*i/words.length,endSec:begin+.3+(duration-.8)*Math.min(i+10,words.length)/words.length,style:'minimal',position:.85});
      }
      return cues;
    });
  }
  return p;
}
const projects = [];

if (fs.existsSync(projectsDir)) {
  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const candidate = path.join(projectsDir, entry.name, 'project.json');
      if (fs.existsSync(candidate)) {
        try {
          const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
          projects.push(prepareProject(parsed));
        } catch (err) {
          console.warn(`Skipping invalid JSON in ${candidate}:`, err.message);
        }
      }
    } else if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'manifest.json') {
      const candidate = path.join(projectsDir, entry.name);
      try {
        const parsed = JSON.parse(fs.readFileSync(candidate, 'utf8'));
        projects.push(prepareProject(parsed));
      } catch (err) {
        console.warn(`Skipping invalid JSON in ${candidate}:`, err.message);
      }
    }
  }
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  outFile,
  JSON.stringify(
    {
      schemaVersion: '1.0',
      updatedAt: new Date().toISOString(),
      count: projects.length,
      projects,
    },
    null,
    2
  )
);

console.log(`[openmotion] Indexed ${projects.length} project(s) into public/projects/manifest.json`);
