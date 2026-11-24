import { OpenMotionScene, OpenMotionBrandKit } from '../types/openmotion';

const cap = (v: number) => Math.max(0, Math.min(1, v));
const ease = (v: number) => { const x=cap(v); return x*x*(3-2*x); };
const lerp = (a: number,b: number,t: number) => a+(b-a)*t;
function roundBox(ctx: CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number) {
 ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
}
export function renderGeoRouteReel(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,t:number):void {
 const geo=scene.geoRoute;
 const brand=scene.headline;
 ctx.fillStyle='#EFE9DC';ctx.fillRect(0,0,w,h);
 if(!geo || geo.route.geometry.type!=='LineString' ||geo.route.geometry.coordinates.length<2) return;
 const coords=geo.route.geometry.coordinates.filter(c=>Array.isArray(c)&&Number.isFinite(c[0])&&Number.isFinite(c[1]));
 if(coords.length<2)return;
 const minLat=Math.min(...coords.map(c=>c[1])),maxLat=Math.max(...coords.map(c=>c[1]));
 const minLon=Math.min(...coords.map(c=>c[0])),maxLon=Math.max(...coords.map(c=>c[0]));
 const cos=Math.cos(((minLat+maxLat)*0.5)*Math.PI/180);
 const xs=Math.max(.001,(maxLon-minLon)*cos),ys=Math.max(.001,maxLat-minLat);
 const scale=Math.min(w*.84/xs,h*.70/ys);
 const proj=(lon:number,lat:number):[number,number]=>[w/2+((lon-(minLon+maxLon)/2)*cos)*scale,h*.48-((lat-(minLat+maxLat)/2))*scale];
 ctx.save();
 // geographic graticule and coordinate ticks
 ctx.strokeStyle='rgba(74,95,95,.16)';ctx.lineWidth=1;
 for(let i=0;i<=10;i++){const x=i*w/10;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
 for(let i=0;i<=18;i++){const y=i*h/18;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
 const projected=coords.map(c=>proj(c[0],c[1]));
 const lengths=[0];let total=0;
 for(let i=1;i<projected.length;i++){total+=Math.hypot(projected[i][0]-projected[i-1][0],projected[i][1]-projected[i-1][1]);lengths.push(total);}
 const start=cap(geo.routeProgressFrom??0);
 const finish=cap(geo.routeProgressTo??1);
 const frac=lerp(start,finish,ease(t/Math.max(.1,scene.durationSec)));
 const dist=total*frac;
 // Smooth virtual camera follows the advancing position while retaining the full regional context.
 let headIndex=1;while(headIndex<lengths.length-1&&lengths[headIndex]<dist)headIndex++;
 const headT=cap((dist-lengths[headIndex-1])/(lengths[headIndex]-lengths[headIndex-1]||1));
 const headX=lerp(projected[headIndex-1][0],projected[headIndex][0],headT);
 const headY=lerp(projected[headIndex-1][1],projected[headIndex][1],headT);
 const cameraT=ease(t/Math.max(.1,scene.durationSec));
 const zoom=1.05+.16*Math.sin(cameraT*Math.PI);
 const follow=.13*cameraT;
 const centerX=lerp(w/2,headX,follow);
 const centerY=lerp(h*.48,headY,follow);
 ctx.save();ctx.translate(w/2,h*.48);ctx.scale(zoom,zoom);ctx.translate(-centerX,-centerY);
 const trace=()=>{ctx.beginPath();ctx.moveTo(...projected[0]);for(let i=1;i<projected.length;i++){if(lengths[i]<=dist){ctx.lineTo(...projected[i]);continue;}const portion=cap((dist-lengths[i-1])/(lengths[i]-lengths[i-1]||1));ctx.lineTo(lerp(projected[i-1][0],projected[i][0],portion),lerp(projected[i-1][1],projected[i][1],portion));break;}};
 trace();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#FFFDF6';ctx.lineWidth=Math.max(10,w*.015);ctx.stroke();
 trace();ctx.strokeStyle='#D64B38';ctx.lineWidth=Math.max(5,w*.007);ctx.stroke();
 const spots=geo.waypoints.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon));
 spots.forEach((p,i)=>{const [x,y]=proj(p.lon,p.lat);ctx.fillStyle='#FFFDF8';ctx.strokeStyle='#335A55';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,13,0,2*Math.PI);ctx.fill();ctx.stroke();ctx.font='600 25px "Plus Jakarta Sans",sans-serif';ctx.fillStyle='#243A40';ctx.textAlign=i%2?'right':'left';ctx.fillText(p.name,x+(i%2?-22:22),y-14);});
 const end=cap(frac)*total;let idx=1;while(idx<lengths.length-1&&lengths[idx]<end)idx++;
 const portion=cap((end-lengths[idx-1])/(lengths[idx]-lengths[idx-1]||1));
 const dotX=lerp(projected[idx-1][0],projected[idx][0],portion),dotY=lerp(projected[idx-1][1],projected[idx][1],portion);
 ctx.beginPath();ctx.arc(dotX,dotY,11,0,Math.PI*2);ctx.fillStyle='#D64B38';ctx.fill();
 ctx.restore();
 ctx.fillStyle='#233B3D';ctx.font='bold 52px "Bricolage Grotesque",sans-serif';ctx.textAlign='center';ctx.fillText(brand,w/2,h*.095,w*.88);
 ctx.fillStyle='#586365';ctx.font='22px "Plus Jakarta Sans",sans-serif';ctx.fillText(geo.route.properties?.source ? String(geo.route.properties.source).slice(0,62) : 'WGS84 geographic route coordinates',w/2,h*.11+30,w*.9);
 ctx.restore();
}
export function renderWhiteboardScience(ctx:CanvasRenderingContext2D,w:number,h:number,scene:OpenMotionScene,t:number,brand:OpenMotionBrandKit):void{
 ctx.fillStyle=brand.backgroundColor;ctx.fillRect(0,0,w,h);
 const board=scene.whiteboard;if(!board)return;
 const progress=ease(t/Math.max(.5,scene.durationSec));
 const strokes=board.strokes.filter(s=>s.length>1);
 const gap=strokes.length?1/strokes.length:1;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=brand.primaryColor;ctx.lineWidth=Math.max(6,w*.009);
 strokes.forEach((stroke,i)=>{
   const local=cap((progress-i*gap)/gap);if(local===0)return;
   const pts=stroke.filter(p=>p.length>=2&&p.every(Number.isFinite)).map(p=>[p[0]*w,p[1]*h] as [number,number]);
   if(pts.length<2)return;
   const seg=[0];let length=0;for(let j=1;j<pts.length;j++){length+=Math.hypot(pts[j][0]-pts[j-1][0],pts[j][1]-pts[j-1][1]);seg.push(length);}
   const d=local*length;ctx.beginPath();ctx.moveTo(...pts[0]);
   for(let j=1;j<pts.length;j++){if(seg[j]<=d)ctx.lineTo(...pts[j]);else{const u=cap((d-seg[j-1])/(seg[j]-seg[j-1]||1));ctx.lineTo(lerp(pts[j-1][0],pts[j][0],u),lerp(pts[j-1][1],pts[j][1],u));break;}}
   ctx.stroke();
 });
 ctx.fillStyle=brand.textColor;ctx.textAlign='center';ctx.font='700 62px "Bricolage Grotesque",sans-serif';
 ctx.fillText(scene.headline,w*.5,h*.17,w*.89);

 // SVG commands are drawn with Path2D and a dash reveal, using the declared path length.
 board.svgPaths?.forEach((item,i)=>{
   if(typeof Path2D==='undefined'||!item.d||!Number.isFinite(item.length)||item.length<=0)return;
   const active=cap(progress*board.svgPaths!.length-i);
   if(active<=0)return;
   ctx.save();ctx.scale(w/1000,h/1000);
   ctx.lineWidth=7;ctx.strokeStyle=brand.accentColor;
   ctx.setLineDash([item.length*active,item.length+2]);
   ctx.stroke(new Path2D(item.d));
   ctx.restore();
 });
 board.labels.forEach((label,i)=>{const alpha=cap(progress*board.labels.length-i);if(alpha<=0)return;ctx.save();ctx.globalAlpha=alpha;ctx.font='600 28px "Plus Jakarta Sans",sans-serif';ctx.fillStyle=brand.primaryColor;ctx.fillText(label,w*(.2+i*.3),h*.68,w*.3);ctx.restore();});
 ctx.restore();
}
