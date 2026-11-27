import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';
import {getBucketListCanvas,bucketListOutroReveal,getDocumentaryProjectedPoint} from './bucketListCamera';
import {renderDocumentaryShot} from './documentaryRenderer';

const PAPER = '#F5F1E8';
const GOLD = '#D9B77A';
const clamp = (v:number) => Math.max(0,Math.min(1,v));
const smooth = (v:number) => {const t=clamp(v);return t*t*(3-2*t);};

function fitPhoto(ctx:CanvasRenderingContext2D,img:HTMLImageElement,w:number,h:number,t:number,focusX=.5,mode:'crater'|'trail'|'view'|'coast'='crater'){
  const progress=smooth(t),scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);
  // Different camera intentions per shot: slow reveal, walking momentum,
  // long scenic hold, then a gentle pullback before the mapped outro.
  const zoom=mode==='crater' ? 1.03+.09*progress
    : mode==='trail' ? 1.055+.11*progress
    : mode==='view' ? 1.035+.045*progress
    : 1.12-.07*progress;
  const imageW=img.naturalWidth*scale*zoom,imageH=img.naturalHeight*scale*zoom;
  const drift=mode==='view'?.008:mode==='trail'?.022:.016;
  const pan=w*drift*(2*progress-1);
  const x=Math.max(w-imageW,Math.min(0,w*.5-focusX*imageW+pan));
  const y=Math.max(h-imageH,Math.min(0,(h-imageH)/2+h*.008*(2*progress-1)));
  ctx.drawImage(img,x,y,imageW,imageH);
}
function fallbackPhoto(ctx:CanvasRenderingContext2D,w:number,h:number){
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#8AAEB0');sky.addColorStop(.53,'#BAC4AC');sky.addColorStop(1,'#2D685B');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  for(const [level,color,shift] of [[.65,'#648E79',1],[.83,'#376F60',2.4]] as const){
    ctx.fillStyle=color;
    ctx.beginPath();ctx.moveTo(0,h);
    ctx.lineTo(0,h*level);
    for(let i=1;i<=9;i++)ctx.lineTo(w*i/9,h*(level-.09*Math.abs(Math.sin(i*.9+shift))));
    ctx.lineTo(w,h);ctx.closePath();ctx.fill();
  }
}

function drawBackdrop(ctx:CanvasRenderingContext2D,w:number,h:number) {
  ctx.fillStyle='#0B1725';ctx.fillRect(0,0,w,h);
  const glow=ctx.createRadialGradient(w*.52,h*.46,w*.04,w*.5,h*.5,w*.8);
  glow.addColorStop(0,'rgba(28,89,116,.38)');
  glow.addColorStop(1,'rgba(3,9,18,0)');
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  for(let i=0;i<70;i++){
    const x=((i*173+41)%991)/991*w, y=((i*281+71)%787)/787*h;
    ctx.fillStyle=i%7===0?'rgba(244,235,209,.63)':'rgba(228,232,236,.19)';
    ctx.beginPath();ctx.arc(x,y,i%7===0?1.8:1,0,Math.PI*2);ctx.fill();
  }
}

/** Reads MapLibre's most recently painted true geographic frame. The
 * camera is set by the preview clock or awaited by the export encoder.
 * No snapshot interpolation or overlayed coastline silhouettes remain.
 */
function zoomFrame(ctx:CanvasRenderingContext2D,w:number,h:number,project:OpenMotionProject,time:number,scene:OpenMotionScene){
  drawBackdrop(ctx,w,h);
  const frame=getBucketListCanvas(project);
  if(!frame) {
    ctx.textAlign='center';ctx.fillStyle=PAPER;
    ctx.font='600 '+Math.round(w*.03)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillText('MAP PREVIEW UNAVAILABLE',w/2,h*.53,w*.83);
    return;
  }
  ctx.drawImage(frame,0,0,w,h);
  const t=clamp(time/Math.max(.1,scene.durationSec));
  const approach=scene.bucketList?.directorsCut?smooth((t-.22)/.23):smooth((t-.69)/.22);
  if(approach>0){
    const d=scene.bucketList!;
    const point=d.directorsCut?getDocumentaryProjectedPoint(project,d.longitude,d.latitude):undefined;
    const x=point?point.x*w:w*.5,y=point?point.y*h:h*.50,pulse=.5+.5*Math.sin(time*6.4);
    if(x<w*.05||x>w*.95||y<h*.15||y>h*.85)return;
    ctx.save();ctx.globalAlpha*=approach;
    ctx.fillStyle='rgba(217,183,122,.22)';
    ctx.beginPath();ctx.arc(x,y,w*(.027+.004*pulse),0,Math.PI*2);ctx.fill();
    ctx.fillStyle=GOLD;ctx.strokeStyle=PAPER;ctx.lineWidth=w*.004;
    ctx.beginPath();ctx.arc(x,y,w*.012,0,Math.PI*2);ctx.fill();ctx.stroke();
    if(d.directorsCut){ctx.strokeStyle=GOLD;ctx.lineWidth=w*.002;for(const size of [.045,.066]){ctx.beginPath();ctx.arc(x,y,w*(size+.004*pulse),0,Math.PI*2);ctx.stroke();}ctx.font='700 '+Math.round(w*.025)+'px "Plus Jakarta Sans",sans-serif';ctx.textAlign='center';const label=(t>.70?d.destination:d.region).toUpperCase();const tw=ctx.measureText(label).width+w*.035;const lx=Math.max(tw/2+w*.04,Math.min(w-tw/2-w*.04,x));ctx.fillStyle='rgba(8,23,31,.85)';ctx.fillRect(lx-tw/2,y-w*.115,tw,w*.04);ctx.fillStyle=PAPER;ctx.fillText(label,lx,y-w*.083);}
    ctx.restore();
  }
}

function footer(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene){
  const data=scene.bucketList!,s=w/1080;
  // Small editorial credit over the picture instead of a bright full-width
  // strip. Keep attribution present on every exported frame.
  ctx.save();
  ctx.fillStyle='rgba(8,23,31,.77)';
  ctx.beginPath();ctx.roundRect(55*s,h-104*s,w-110*s,49*s,12*s);ctx.fill();
  ctx.fillStyle='#E6E8E0';ctx.textAlign='left';
  ctx.font='500 '+Math.round(21*s)+'px "Plus Jakarta Sans",sans-serif';
  const label=data.chapter==='zoom'
    ? 'MAP  OpenFreeMap / OpenMapTiles · © OpenStreetMap contributors'
    : data.chapter==='outro'
      ? 'PHOTO  '+(data.imageAuthor??'Wikimedia Commons')+' · '+(data.imageLicense??'')+'  /  MAP © OSM'
      : 'PHOTO  '+(data.imageAuthor??'Wikimedia Commons')+'  ·  '+(data.imageLicense??'');
  ctx.fillText(label,69*s,h-72*s,w-139*s);
  ctx.restore();
}

function zoomScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,project:OpenMotionProject,layer:'image'|'text'){
  if(layer==='image') {zoomFrame(ctx,w,h,project,time,scene);return;}
  const d=scene.bucketList!,s=w/1080,t=clamp(time/Math.max(.01,scene.durationSec));
  // Text/UI are drawn once AFTER imagery has been dissolved in the shared
  // renderer. No duplicate outgoing place names during the incoming shot.
  const shade=ctx.createLinearGradient(0,0,0,h);
  shade.addColorStop(0,'rgba(10,22,35,.68)');
  shade.addColorStop(.24,'rgba(10,22,35,.10)');
  shade.addColorStop(.72,'rgba(10,22,35,0)');
  shade.addColorStop(1,'rgba(10,22,35,.60)');
  ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  ctx.textAlign='left';
  ctx.fillStyle=PAPER;ctx.font='700 '+Math.round(32*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText('MY BUCKET LIST',70*s,123*s,w-140*s);
  ctx.fillStyle=GOLD;ctx.font='700 '+Math.round(25*s)+'px "Plus Jakarta Sans",sans-serif';
  ctx.fillText(d.region.toUpperCase()+'  /  '+d.country.toUpperCase(),70*s,174*s,w-140*s);

  // The first second must communicate the episode immediately. The large
  // typography yields before the accelerated geographic approach begins.
  const launch=d.directorsCut?0:1-smooth((time-.72)/.32);
  if(launch>0){
    ctx.save();ctx.globalAlpha*=launch;
    ctx.fillStyle=PAPER;ctx.font='800 '+Math.round(94*s)+'px "Bricolage Grotesque",sans-serif';
    ctx.fillText('BUCKET LIST',70*s,h-490*s,w-140*s);
    ctx.fillStyle=GOLD;ctx.font='800 '+Math.round(165*s)+'px "Bricolage Grotesque",sans-serif';
    ctx.fillText('#'+String(d.episode).padStart(3,'0'),67*s,h-310*s,w-140*s);
    ctx.restore();
  }
  const arrive=smooth((t-.78)/.16);
  if(arrive>0){
    ctx.save();ctx.globalAlpha*=arrive;
    ctx.fillStyle=GOLD;ctx.font='700 '+Math.round(29*s)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillText('WELCOME TO '+d.region.toUpperCase(),72*s,h-432*s,w-150*s);
    ctx.fillStyle=PAPER;ctx.font='800 '+Math.round(102*s)+'px "Bricolage Grotesque",sans-serif';
    ctx.fillText(d.destination.toUpperCase(),70*s,h-326*s,w-140*s);
    ctx.font='500 '+Math.round(30*s)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillText(d.country.toUpperCase()+'  ·  '+Math.abs(d.latitude).toFixed(3)+'° '+(d.latitude>=0?'N':'S')+'  '+Math.abs(d.longitude).toFixed(3)+'° '+(d.longitude>=0?'E':'W'),72*s,h-258*s,w-140*s);
    ctx.restore();
  }
  footer(ctx,w,h,scene);
}

function photoScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,time:number,project:OpenMotionProject,getPhoto:(url:string)=>HTMLImageElement|null,layer:'image'|'text'){
  const d=scene.bucketList!,t=clamp(time/Math.max(.01,scene.durationSec)),s=w/1080;
  if(layer==='image'){
    const img=scene.imageUrl?getPhoto(scene.imageUrl):null;
    if(img){
      const mode=d.chapter==='outro'?'coast':d.reasonNumber===2?'trail':d.reasonNumber===3?'view':'crater';
      ctx.save();
      // Mild grade is shared by all four photographs. The different shots
      // keep their local detail while matching contrast and saturation.
      ctx.filter='contrast(1.06) saturate(.94) brightness(.98)';
      fitPhoto(ctx,img,w,h,t,d.imageFocusX??.5,mode);
      ctx.restore();
      ctx.save();
      ctx.fillStyle='#102F31';ctx.globalAlpha=.045;ctx.fillRect(0,0,w,h);
      ctx.restore();
    }else fallbackPhoto(ctx,w,h);
    if(d.chapter==='outro'&&!d.directorsCut){
      const frame=getBucketListCanvas(project),reveal=bucketListOutroReveal(scene,time);
      if(frame && reveal>0) {
        ctx.save();ctx.globalAlpha*=reveal;ctx.drawImage(frame,0,0,w,h);ctx.restore();
      }
    }
    return;
  }
  // Give the flagship crater and the Boca do Inferno viewpoint a clean
  // photo-only hold. The fast forest shot cuts to its text earlier.
  const hold=d.chapter==='outro'?.42:d.reasonNumber===1?.88:d.reasonNumber===3?.92:.20;
  const appear=smooth((time-hold)/.48);
  const depart=d.chapter==='outro'?1:1-smooth((time-(scene.durationSec-.26))/.26);
  const shade=ctx.createLinearGradient(0,h*.25,0,h);
  shade.addColorStop(0,'rgba(11,26,26,0)');
  shade.addColorStop(.48,'rgba(11,26,26,.28)');
  shade.addColorStop(1,'rgba(7,22,25,.93)');
  ctx.save();
  ctx.globalAlpha*=.28+.72*appear;
  ctx.fillStyle=shade;ctx.fillRect(0,h*.25,w,h*.75);
  ctx.restore();
  ctx.save();ctx.globalAlpha*=appear*depart;
  ctx.translate(0,(1-appear)*28*s);
  ctx.textAlign='left';ctx.fillStyle=GOLD;
  ctx.font='700 '+Math.round(26*s)+'px "Plus Jakarta Sans",sans-serif';
  const kicker=d.chapter==='outro'?'MY BUCKET LIST  /  #'+String(d.episode).padStart(3,'0'):'WHY '+d.reasonNumber+' / 03';
  ctx.fillStyle='#FFF9EE';
  ctx.font='800 '+Math.round((d.chapter==='outro'?112:88)*s)+'px "Bricolage Grotesque",sans-serif';
  const headline=d.chapter==='outro'?d.destination.toUpperCase():d.reasonTitle?.toUpperCase()??'';
  const words=headline.split(' ');
  const lines:string[]=[];let line='';
  for(const word of words){
    const candidate=line?line+' '+word:word;
    if(line&&ctx.measureText(candidate).width>w-250*s){lines.push(line);line=word;}
    else line=candidate;
  }
  if(line)lines.push(line);
  const visible=lines.slice(0,3),titleY=h-450*s-(visible.length-1)*100*s;
  ctx.font='700 '+Math.round(26*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillStyle=GOLD;ctx.fillText(kicker,70*s,titleY-105*s,w-250*s);
  ctx.font='800 '+Math.round((d.chapter==='outro'?112:88)*s)+'px "Bricolage Grotesque",sans-serif';ctx.fillStyle='#FFF9EE';visible.forEach((str,i)=>ctx.fillText(str,70*s,titleY+i*100*s,w-250*s));
  ctx.fillStyle='#E9E6D8';
  ctx.font='500 '+Math.round(36*s)+'px "Plus Jakarta Sans",sans-serif';
  const copy=d.chapter==='outro'?d.region.toUpperCase()+'  /  '+d.country.toUpperCase():d.reasonCopy??'';
  ctx.fillText(copy,74*s,h-340*s,w-250*s);
  if(d.chapter==='outro'){
    ctx.font='700 '+Math.round(27*s)+'px "Plus Jakarta Sans",sans-serif';
    ctx.fillStyle=GOLD;ctx.fillText('SAVE THIS PLACE',74*s,h-285*s,w-250*s);
  }
  ctx.restore();
  footer(ctx,w,h,scene);
}
function coverScene(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,getPhoto:(url:string)=>HTMLImageElement|null,layer:'image'|'text'){
  const d=scene.bucketList!,s=w/1080;
  if(layer==='image'){const img=scene.imageUrl?getPhoto(scene.imageUrl):null;if(img){ctx.save();ctx.filter='contrast(1.06) saturate(.94) brightness(.98)';fitPhoto(ctx,img,w,h,0,d.imageFocusX??.5,'view');ctx.restore();}else fallbackPhoto(ctx,w,h);return;}
  const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'rgba(8,23,31,.68)');shade.addColorStop(.4,'rgba(8,23,31,.05)');shade.addColorStop(1,'rgba(8,23,31,.92)');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  ctx.textAlign='left';ctx.fillStyle=GOLD;ctx.font='700 '+Math.round(34*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillText('MY BUCKET LIST  /  '+String(d.episode).padStart(3,'0'),76*s,240*s,w-250*s);
  ctx.fillStyle=PAPER;ctx.font='800 '+Math.round(124*s)+'px "Bricolage Grotesque",sans-serif';ctx.fillText(d.destination.toUpperCase(),70*s,h-500*s,w-250*s);
  ctx.fillStyle=GOLD;ctx.font='600 '+Math.round(36*s)+'px "Plus Jakarta Sans",sans-serif';ctx.fillText(d.region.toUpperCase()+'  /  '+d.country.toUpperCase(),76*s,h-402*s,w-250*s);footer(ctx,w,h,scene);
}
export function renderBucketListScene(
 ctx:CanvasRenderingContext2D,w:number,h:number,
 scene:OpenMotionScene,time:number,project:OpenMotionProject,
 getPhoto:(url:string)=>HTMLImageElement|null,
 layer:'all'|'image'|'text'='all'
):void{
  ctx.save();
  const draw=(mode:'image'|'text')=>{
    if(scene.bucketList?.documentary){renderDocumentaryShot(ctx,w,h,scene,time,project,getPhoto,mode);return;}
    if(scene.bucketList?.cover){coverScene(ctx,w,h,scene,getPhoto,mode);return;}
    if(scene.bucketList?.chapter==='zoom'){zoomScene(ctx,w,h,scene,time,project,mode);return;}
    const cover=scene.bucketList?.directorsCut&&scene.bucketList.chapter==='outro'?project.scenes.find(s=>s.bucketList?.cover):undefined;
    const loop=cover?smooth((time-(scene.durationSec-1.0))/.75):0;
    if(mode==='image'||loop<.5){ctx.save();if(mode==='text')ctx.globalAlpha*=1-smooth(loop*2);photoScene(ctx,w,h,scene,time,project,getPhoto,mode);ctx.restore();}
    if(cover&&loop>0){ctx.save();ctx.globalAlpha*=mode==='image'?loop:smooth((loop-.5)*2);coverScene(ctx,w,h,cover,getPhoto,mode);ctx.restore();}
  };
  if(layer==='all'){draw('image');draw('text');}
  else draw(layer);
  ctx.restore();
}
