// Explicit local review only. Never invoked by Pages build or GitHub Actions.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {createServer} from 'vite';
const slugs=['living-travel-posters-001-switzerland','living-travel-posters-002-amalfi','living-travel-posters-003-japan'];
const times=[0,3,7,12,17,21.5,22-1/60];
const argv=process.argv.slice(2);
const arg=(name)=>{const i=argv.indexOf(name);return i>=0?argv[i+1]:undefined;};
const selected=arg('--project'),mp4dir=arg('--mp4-dir');
if(selected&&!slugs.includes(selected))throw Error('Unknown Master Edition project: '+selected);
const out=path.resolve(arg('--output')||fs.mkdtempSync(path.join(os.tmpdir(),'poster-cinema-review-')));
fs.mkdirSync(out,{recursive:true});
const tmp='poster-review-'+process.pid+'.html';
let server,browser,failed=false;
const reports=[];
const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>fs.existsSync(p));
function writePNG(file,data){fs.writeFileSync(file,Buffer.from(data.split(',')[1],'base64')));}
function probe(file){const p=spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',file],{encoding:'utf8'});if(p.status!==0)throw Error('ffprobe failed: '+p.stderr);return JSON.parse(p.stdout);}
try{
 fs.writeFileSync(tmp,'<!doctype html><meta charset="utf-8"><style>body{margin:0}canvas{display:block}</style><canvas></canvas>');
 server=await createServer({server:{host:'127.0.0.1',port:0},logLevel:'error'});await server.listen();
 const addr=server.httpServer.address();if(!addr||typeof addr==='string')throw Error('Cannot determine local test port');
 browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const slug of selected?[selected]:slugs){
  const project=JSON.parse(fs.readFileSync(path.join('projects',slug,'project.json'),'utf8'));
  const dir=path.join(out,slug);fs.mkdirSync(dir,{recursive:true});
  const page=await browser.newPage({viewport:{width:1080,height:1920}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('http://127.0.0.1:'+addr.port+'/'+tmp);
  const review=await page.evaluate(async({project,times})=>{
   const {renderOpenMotionFrame}=await import('/src/engine/openMotionRenderer.ts');
   const {mixProjectAudio}=await import('/src/engine/projectAudio.ts');
   const c=document.querySelector('canvas');c.width=1080;c.height=1920;
   const ctx=c.getContext('2d',{alpha:false});if(!ctx)throw Error('Canvas 2D unavailable');
   await document.fonts.ready;
   const frames=[],ms=[];for(const t of times){const start=performance.now();renderOpenMotionFrame(ctx,project,t,1080,1920);ms.push(performance.now()-start);frames.push(c.toDataURL('image/png'));}
   // Same frame pipeline as preview/export. Verify opening and end hold are pixel-identical.
   const loopIdentical=frames[0]===frames[frames.length-1]&&frames[0]===frames[frames.length-2];
   const image=new Image();image.src='/'+project.thumbnailUrl;await image.decode();
   const cover=document.createElement('canvas');cover.width=1080;cover.height=1920;const cc=cover.getContext('2d');cc.drawImage(image,0,0,1080,1920);
   renderOpenMotionFrame(ctx,project,0,1080,1920);
   const p=ctx.getImageData(0,0,1080,1920).data,q=cc.getImageData(0,0,1080,1920).data;
   let diff=0;for(let i=0;i<p.length;i+=4)diff+=Math.abs(p[i]-q[i])+Math.abs(p[i+1]-q[i+1])+Math.abs(p[i+2]-q[i+2]);
   const openingMeanRgbDifference=diff/(1080*1920*3);
   const audio=await mixProjectAudio(project,22);let rms=0,peak=0;
   if(audio){const samples=audio.getChannelData(0);for(let i=0;i<samples.length;i++){rms+=samples[i]*samples[i];peak=Math.max(peak,Math.abs(samples[i]));}rms=Math.sqrt(rms/samples.length);}
   return {frames,cover:cover.toDataURL('image/png'),loopIdentical,openingMeanRgbDifference,ms,audio:audio?{duration:audio.duration,channels:audio.numberOfChannels,sampleRate:audio.sampleRate,rms,peak}:null};
  },{project,times});
  for(let i=0;i<times.length;i++)writePNG(path.join(dir,'frame-'+String(i).padStart(2,'0')+'.png'),review.frames[i]);
  writePNG(path.join(dir,'cover.png'),review.cover);
  const {frames,cover,...metrics}=review;
  const report={slug,times,...metrics,browserErrors:errors,visualApproval:'manual review required'};
  if(!metrics.loopIdentical||!metrics.audio||metrics.audio.rms<=0||metrics.audio.peak>1||errors.length)failed=true;
  if(mp4dir){const directory=path.resolve(mp4dir),candidate=fs.readdirSync(directory).find(f=>f.startsWith(slug)&&f.endsWith('.mp4'));if(!candidate){report.mp4={status:'missing'};failed=true;}else{const meta=probe(path.join(directory,candidate)),video=meta.streams.find(s=>s.codec_type==='video'),audio=meta.streams.find(s=>s.codec_type==='audio');const fps=video?.avg_frame_rate?.split('/').map(Number);const valid=video?.codec_name==='h264'&&audio?.codec_name==='aac'&&video.width===1080&&video.height===1920&&fps?.length===2&&fps[0]/fps[1]===60&&Math.abs(Number(meta.format.duration)-22)<.15;report.mp4={status:valid?'verified':'failed',video,audio,duration:meta.format.duration};if(!valid)failed=true;}}
  else report.mp4={status:'not supplied'};
  reports.push(report);await page.close();
 }
 fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(reports,null,2));
 console.log(JSON.stringify({output:out,reports},null,2));
 if(failed)process.exitCode=1;
}finally{await browser?.close();await server?.close();fs.rmSync(tmp,{force:true});}
