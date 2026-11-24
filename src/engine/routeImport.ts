import { OpenMotionScene, TimedCaption } from '../types/openmotion';
export function parseSrt(text:string): TimedCaption[] {
 const toSec=(x:string)=>{const m=x.trim().match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{1,3})/);if(!m)throw new Error('Ongeldige SRT-tijd');return Number(m[1])*3600+Number(m[2])*60+Number(m[3])+Number(m[4].padEnd(3,'0'))/1000;};
 return text.replace(/\r/g,'').trim().split(/\n\s*\n/).flatMap(block=>{
 const lines=block.trim().split('\n');const index=lines.findIndex(l=>l.includes('-->'));
 if(index<0)return [];const [a,b]=lines[index].split('-->').map(x=>x.trim());if(!a||!b)return [];
 const startSec=toSec(a),endSec=toSec(b);
 if(endSec<=startSec)return [];
 return [{startSec,endSec,text:lines.slice(index+1).join(' ').replace(/<[^>]+>/g,'').trim(),style:'karaoke' as const}];
 });
}
export type RouteFeature = NonNullable<OpenMotionScene['geoRoute']>['route'];
export function parseRouteFile(text:string,filename:string):RouteFeature {
 let coords:[number,number][]=[];
 if(/\.gpx$/i.test(filename)||text.trimStart().startsWith('<')){
  const doc=new DOMParser().parseFromString(text,'application/xml');
  if(doc.getElementsByTagName('parsererror').length)throw new Error('GPX XML ongeldig');
  let pts=Array.from(doc.getElementsByTagNameNS('*','trkpt'));
  if(!pts.length)pts=Array.from(doc.getElementsByTagNameNS('*','rtept'));
  coords=pts.map(e=>[Number(e.getAttribute('lon')),Number(e.getAttribute('lat'))]);
 }else{
  const obj=JSON.parse(text);
  const geometry=obj.type==='FeatureCollection'?obj.features?.find((f:any)=>f.geometry?.type==='LineString')?.geometry:obj.type==='Feature'?obj.geometry:obj;
  if(geometry?.type!=='LineString'||!Array.isArray(geometry.coordinates))throw new Error('GeoJSON LineString vereist');
  coords=geometry.coordinates.map((c:unknown)=>Array.isArray(c)?[Number(c[0]),Number(c[1])]:[NaN,NaN]);
 }
 coords=coords.filter(([lon,lat])=>Number.isFinite(lon)&&Number.isFinite(lat)&&Math.abs(lon)<=180&&Math.abs(lat)<=90);
 if(coords.length<2)throw new Error('Minimaal twee routepunten vereist');
 if(coords.length>4500){const step=Math.ceil(coords.length/4500),last=coords[coords.length-1];coords=coords.filter((_,i)=>i%step===0);coords.push(last);}
 return {type:'Feature',geometry:{type:'LineString',coordinates:coords},properties:{source:filename}};
}
