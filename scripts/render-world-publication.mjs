// Explicit single-project master export. Never called by the normal Pages build.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
const slug=(process.env.WORLD_RENDER_PROJECT||'').trim();
if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('Select one project using WORLD_RENDER_PROJECT=<project-slug> npm run render:master');
  process.exit(1);
}
const root=process.cwd(),dist=path.join(root,'dist'),manifestPath=path.join(dist,'projects','manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const projects=manifest.projects.filter(p=>p.slug===slug && p.scenes.some(s=>s.worldStory || s.catOffice || s.premiumTravel || s.bucketList?.documentary?.series==='places-worth-exploring' || (p.seriesId==='the-human-side' && s.doodle?.extras?.includes('human-side-v1'))));
if(projects.length!==1)throw Error('No unique supported master project: '+slug);
const needsMap=projects[0].scenes.some(s=>s.premiumTravel || (s.bucketList?.documentary?.series==='places-worth-exploring' && s.bucketList?.chapter==='zoom'));
const { chromium }=await import('playwright');
const { createServer }=await import('vite');
const tmp=path.join(root,'world-render-preview.html');
const run=(cmd,args)=>{const x=spawnSync(cmd,args,{stdio:'inherit',timeout:600000});if(x.status!==0)throw Error(cmd+' failed: '+x.status)};
let server,browser;

try {
  let executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium'].find(p=>fs.existsSync(p));
  if(!executablePath){run('npx',['playwright','install','chromium']);}
  const args=['--no-sandbox','--disable-dev-shm-usage'];
  // Only the explicitly selected geographic master needs CPU WebGL.
  if(needsMap)args.push('--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader');
  console.log('[world-render] selected',slug,'software WebGL:',needsMap);
  browser=await chromium.launch({headless:true,executablePath,args});
  fs.writeFileSync(tmp,'<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0}canvas{display:block}</style></head><body><canvas></canvas></body></html>');
  server=await createServer({server:{host:'127.0.0.1',port:4179,strictPort:true},logLevel:'error'});
  await server.listen();
  fs.mkdirSync(path.join(dist,'renders'),{recursive:true});
  for(const p of projects){
    const target=path.join(dist,'renders',p.slug+'.mp4'),silent=target+'.video.mp4',score=target+'.score.wav';
    let page,encoder;
    try{
      const travel=p.scenes.some(s=>s.bucketList?.documentary?.series==='places-worth-exploring');
      const premium=p.scenes.some(s=>s.premiumTravel);
      const human=p.seriesId==='the-human-side';
      const duration=p.scenes.reduce((sum,s)=>sum+s.durationSec,0),fps=(travel||premium||human)?p.fps:60,width=(travel||premium||human)?p.width:1080,height=(travel||premium||human)?p.height:1920;
      const tracks=(p.audioTracks??[]).filter(t=>fs.existsSync(path.join(dist,t.src)));
      const isCat=p.scenes.some(s=>s.catOffice);
      const isTravel=p.scenes.some(s=>s.bucketList?.documentary?.series==='places-worth-exploring');
      if(human&&(!tracks.some(t=>t.kind==='voiceover')||tracks.length!==(p.audioTracks??[]).length))throw Error('Human Side soundtrack assets missing');
      if(isCat){
        if(!tracks.length)throw Error('Cat soundtrack missing.');
        for(const id of ['oliver','boss','luna','bob']) if(!fs.existsSync(path.join(dist,'assets','cat-office',id+'.jpg')))throw Error('Cat photo missing: '+id);
      }else if(!premium&&!tracks.some(t=>t.kind==='voiceover'))throw Error('No narration available; not publishing a silent master.');
      page=await browser.newPage({viewport:{width,height}});
      await page.goto('http://127.0.0.1:4179/world-render-preview.html');
      await page.evaluate(async ({p,width,height})=>{
        const {renderOpenMotionFrame}=await import('/src/engine/openMotionRenderer.ts');
        const c=document.querySelector('canvas');c.width=width;c.height=height;
        const ctx=c.getContext('2d',{alpha:false});
        await document.fonts.ready;
        if(p.scenes.some(s=>s.catOffice)){
          const {preloadProjectImages,getCachedPhoto}=await import('/src/engine/imageCache.ts');
          const {projectAssetUrl}=await import('/src/engine/projectAudio.ts');
          await preloadProjectImages(p);
          for(const id of ['oliver','boss','luna','bob']) if(!getCachedPhoto(projectAssetUrl('assets/cat-office/'+id+'.jpg')))throw Error('Photo did not decode: '+id);
        }
        const isTravel=p.scenes.some(s=>s.bucketList?.documentary?.series==='places-worth-exploring');
        let capture;
        if(isTravel){
          const {preloadProjectImages,getCachedPhoto}=await import('/src/engine/imageCache.ts');
          const {projectAssetUrl}=await import('/src/engine/projectAudio.ts');
          const {beginBucketListExport,captureBucketListExportFrame}=await import('/src/engine/bucketListCamera.ts');
          await preloadProjectImages(p);
          for(const s of p.scenes)if(s.imageUrl&&!getCachedPhoto(projectAssetUrl(s.imageUrl)))throw Error('Travel photo did not decode: '+s.id);
          await beginBucketListExport(p);
          capture=captureBucketListExportFrame;
        }
        if(p.scenes.some(s=>s.premiumTravel)){
          const {preloadProjectImages,getCachedPhoto}=await import('/src/engine/imageCache.ts');
          await preloadProjectImages(p);
          for(const s of p.scenes){const opening=s.premiumTravel?.openingPhoto;if(opening&&!getCachedPhoto(opening.photoUrl))throw Error('Opening photo did not decode: '+opening.photoUrl);}
          for(const s of p.scenes)for(const stop of s.premiumTravel?.stops??[]){
            for(const photo of [stop,stop.secondaryPhoto].filter(Boolean)){
              if(!getCachedPhoto(photo.photoUrl))throw Error('Premium photo did not decode: '+photo.photoUrl);
            }
          }
        }
        // Keep the original synchronous batch path for snapshot maps and non-map videos.
        if(!capture){
          window.renderWorldFrames=(start,count,fps)=>Array.from({length:count},(_,i)=>{
            renderOpenMotionFrame(ctx,p,(start+i)/fps,width,height);
            return c.toDataURL('image/jpeg',.94).split(',')[1];
          });
          return;
        }
        window.renderWorldFrames=async(start,count,fps)=>{
          const out=[];
          for(let i=0;i<count;i++){
            const t=(start+i)/fps;
            if(capture)await capture(p,t);
            renderOpenMotionFrame(ctx,p,t,width,height);
            out.push(c.toDataURL('image/jpeg',.94).split(',')[1]);
          }
          return out;
        };
      },{p,width,height});
      if(premium||human){
        const wav=await page.evaluate(async ({p,duration})=>{
          const {mixProjectAudio}=await import('/src/engine/projectAudio.ts');
          const audio=await mixProjectAudio(p,duration);
          if(!audio)throw Error('Premium soundtrack missing');
          const count=audio.length,rate=audio.sampleRate;
          const bytes=new Uint8Array(44+count*4),v=new DataView(bytes.buffer);
          const str=(at,s)=>{for(let i=0;i<s.length;i++)bytes[at+i]=s.charCodeAt(i)};
          str(0,'RIFF');v.setUint32(4,bytes.length-8,true);str(8,'WAVE');str(12,'fmt ');
          v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);
          v.setUint32(24,rate,true);v.setUint32(28,rate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);
          str(36,'data');v.setUint32(40,count*4,true);
          const left=audio.getChannelData(0),right=audio.getChannelData(audio.numberOfChannels>1?1:0);
          for(let i=0;i<count;i++){v.setInt16(44+i*4,Math.round(Math.max(-1,Math.min(1,left[i]))*32767),true);v.setInt16(46+i*4,Math.round(Math.max(-1,Math.min(1,right[i]))*32767),true);}
          let raw='';for(let i=0;i<bytes.length;i+=16384)raw+=String.fromCharCode(...bytes.subarray(i,i+16384));
          return btoa(raw);
        },{p,duration});
        fs.writeFileSync(score,Buffer.from(wav,'base64'));
      }
      const frames=Math.round(duration*fps);
      encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(fps),'-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',silent],{stdio:['pipe','inherit','inherit']});
      const done=new Promise((resolve,reject)=>{encoder.once('error',reject);encoder.once('close',code=>code===0?resolve():reject(Error('video encoding failed '+code)));});
      // Prevent unhandled rejection while feeding frames.
      done.catch(()=>{});
      for(let n=0;n<frames;n+=8){
        const images=await page.evaluate(({n,count,fps})=>window.renderWorldFrames(n,count,fps),{n,count:Math.min(8,frames-n),fps});
        for(const b64 of images){if(encoder.exitCode!==null)throw Error('Encoder terminated');if(!encoder.stdin.write(Buffer.from(b64,'base64')))await once(encoder.stdin,'drain');}
        if(n%480===0)console.log('[world-render]',p.slug,n,'/',frames);
      }
      encoder.stdin.end();await done;
      if(premium||human){
        run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',silent,'-i',score,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t',String(duration),'-movflags','+faststart',target]);
      }else{
      const inputs=tracks.flatMap(t=>['-i',path.join(dist,t.src)]);
      const filters=tracks.map((t,i)=>'['+(i+1)+':a]volume='+Math.max(0,Math.min(1,t.volume??1))+'[a'+i+']');
      const mix=tracks.map((_,i)=>'[a'+i+']').join('')+'amix=inputs='+tracks.length+':normalize=0,alimiter=limit=0.95,apad[a]';
      run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',silent,...inputs,'-filter_complex',filters.concat(mix).join(';'),'-map','0:v:0','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',String(duration),'-movflags','+faststart',target]);
      }
      const probe=spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',target],{encoding:'utf8'});
      if(probe.status!==0)throw Error('ffprobe failed');
      const info=JSON.parse(probe.stdout),v=info.streams.find(s=>s.codec_type==='video'),a=info.streams.find(s=>s.codec_type==='audio');
      if(v?.codec_name!=='h264'||v?.width!==width||v?.height!==height||v?.avg_frame_rate!==fps+'/1'||a?.codec_name!=='aac'||((premium||human)&&Number(v?.nb_frames)!==frames)||Math.abs(Number(info.format.duration)-duration)>.15)throw Error('Output does not match requested resolution / fps / audio / duration');
      p.prebuiltMp4Url='renders/'+p.slug+'.mp4';
      fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
      console.log('[world-render] verified master:',p.slug,width,height,fps,duration,a.codec_name);
    }catch(e){console.error('[world-render] master unavailable:',p.slug,e);if(fs.existsSync(target))fs.unlinkSync(target);throw e;}
    finally{if(encoder&&encoder.exitCode===null)encoder.kill('SIGTERM');if(page)await page.close();if(fs.existsSync(silent))fs.unlinkSync(silent);if(fs.existsSync(score))fs.unlinkSync(score);}
  }
}catch(e){console.error('[world-render] publication export failed:',e);process.exitCode=1;}
finally{if(browser)await browser.close();if(server)await server.close();if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
