/** Actual Mapzen Terrarium data, sampled along projected road distance. */
export type SignatureElevation={values:number[];stops:number[]};
type Coord=[number,number];
const size=256;
function merc([lon,lat]:Coord,z:number):Coord{
 const n=2**z;
 const phi=Math.max(-85,Math.min(85,lat))*Math.PI/180;
 return [(lon+180)/360*n,(1-Math.asinh(Math.tan(phi))/Math.PI)/2*n];
}
async function tile(x:number,y:number,z:number,signal:AbortSignal){
 const r=await fetch('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/'+z+'/'+x+'/'+y+'.png',{signal});
 if(!r.ok)throw Error('DEM tile '+r.status);
 const url=URL.createObjectURL(await r.blob());
 try{const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=size;c.height=size;
 const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('DEM canvas');ctx.drawImage(img,0,0,size,size);return ctx.getImageData(0,0,size,size);}finally{URL.revokeObjectURL(url);}
}
export async function loadSignatureElevation(route:Coord[],stops:Coord[],z=11):Promise<SignatureElevation|null>{
 if(route.length<2)return null;const pts=route.map(p=>merc(p,z)),dist=[0];
 for(let i=1;i<pts.length;i++)dist.push(dist[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
 const total=dist[dist.length-1];if(!(total>0))return null;let j=1;
 const samples=Array.from({length:97},(_,i)=>{const d=total*i/96;while(j<dist.length-1&&dist[j]<d)j++;const t=(d-dist[j-1])/Math.max(1e-10,dist[j]-dist[j-1]);return [pts[j-1][0]+(pts[j][0]-pts[j-1][0])*t,pts[j-1][1]+(pts[j][1]-pts[j-1][1])*t] as Coord;});
 const all=[...samples,...stops.map(p=>merc(p,z))],keys=new Map<string,Coord>();
 for(const [x,y] of all){const a=Math.floor(x),b=Math.floor(y);keys.set(a+'/'+b,[a,b]);}
 if(keys.size>48)return null;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),9000);
 try{const images=new Map<string,ImageData>(),list=[...keys.entries()];
 for(let i=0;i<list.length;i+=6)await Promise.all(list.slice(i,i+6).map(async ([key,[x,y]])=>{images.set(key,await tile(x,y,z,controller.signal));}));
 const heights=all.map(([x,y])=>{const a=Math.floor(x),b=Math.floor(y),d=images.get(a+'/'+b)!.data,i=(Math.min(255,Math.floor((y-b)*256))*256+Math.min(255,Math.floor((x-a)*256)))*4;
 if(d[i+3]!==255)throw Error('DEM missing');const m=d[i]*256+d[i+1]+d[i+2]/256-32768;if(!Number.isFinite(m)||m< -500||m>9000)throw Error('DEM invalid');return m;});
 return {values:heights.slice(0,97),stops:heights.slice(97)};
 }catch(e){console.warn('Optional elevation unavailable',e);return null;}finally{clearTimeout(timeout);}
}
