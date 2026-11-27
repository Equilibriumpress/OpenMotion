// Original 1980s compact sedan, projected from three-dimensional geometry onto Canvas.
// +Z is rear, +Y is up. No WebGL context, assets, asynchronous loading or external model.
type C=CanvasRenderingContext2D;
type V=[number,number,number];
type P={x:number;y:number;d:number};
type Face={v:V[];color:string;edge?:string;glow?:boolean};
const TAU=Math.PI*2;
const sub=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v));
const shade=(hex:string,f:number)=>'#'+[1,3,5].map(i=>Math.round(clamp(parseInt(hex.slice(i,i+2),16)*f,0,255)).toString(16).padStart(2,'0')).join('');
const faces:Face[]=[];
const add=(v:V[],color:string,edge?:string,glow=false)=>faces.push({v,color,edge,glow});
// Longitudinal section rings: z, half width, sill, shoulder and hood/deck height.
// Eight points per ring allow a bevelled, tapered body, rather than a rectangular block.
function ring(z:number,w:number,low:number,high:number):V[]{return [[-w*.84,low,z],[w*.84,low,z],[w,low+.13,z],[w,high-.09,z],[w*.85,high,z],[-w*.85,high,z],[-w,high-.09,z],[-w,low+.13,z]];}
const rings=[ring(-2.14,.76,.35,.77),ring(-1.85,.88,.29,.88),ring(-.9,.9,.28,.96),ring(.95,.9,.28,.96),ring(1.86,.87,.31,.89),ring(2.12,.78,.36,.83)];
for(let j=0;j<rings.length-1;j++)for(let i=0;i<8;i++){const k=(i+1)%8;add([rings[j][i],rings[j][k],rings[j+1][k],rings[j+1][i]],i===4?'#9D6656':i===0?'#372D33':'#75443F');}
add([...rings[0]].reverse(),'#67403B');add(rings[rings.length-1],'#70433E');
// Cabin: trapezoidal glazing, roof, pillar strips, and side windows.
const A:V=[-.79,.96,-.95],B:V=[.79,.96,-.95],D:V=[-.79,.96,1.22],E:V=[.79,.96,1.22];
const a:V=[-.64,1.48,-.45],b:V=[.64,1.48,-.45],d:V=[-.64,1.48,.63],e:V=[.64,1.48,.63];
add([A,B,b,a],'#40515B','#B79A80');add([D,d,e,E],'#35434D','#AC8E78');add([a,b,e,d],'#A76E57','#BC8B6B');
for(const s of [-1,1]){
 const near=(y:number,z:number,offset=.003):V=>[s*(.79-(y-.96)*(.15/.52)+offset),y,z];
 add([near(.96,-.95),near(1.48,-.45),near(1.48,.63),near(.96,1.22)],'#60403D');
 for(const [z0,z1,t0,t1] of [[-.83,.05,-.42,.05],[.13,1.09,.13,.58]]){
  add([near(1.04,z0,.012),near(1.40,t0,.012),near(1.40,t1,.012),near(1.04,z1,.012)],'#394C58','#A18B7B');
  add([near(1.34,t0+.03,.016),near(1.39,t0+.03,.016),near(1.39,t1-.03,.016),near(1.34,t1-.03,.016)],'#657880');
 }
 const side=(y:number,z:number):V=>[s*.904,y,z];
 add([side(.83,-1.62),side(.86,1.58),side(.83,1.58),side(.80,-1.62)],'#AF8065');
 add([side(.43,-1.55),side(.46,1.55),side(.40,1.55),side(.38,-1.55)],'#422F35');
 for(const z of [-.08,.94])add([side(.72,z),side(.72,z+.22),side(.69,z+.22),side(.69,z)],'#C0A28A');
 // Door seam on the nearly planar center of the side.
 add([side(.78,.08),side(.78,.095),side(.45,.095),side(.45,.08)],'#473139');
}
function plate(z:number,x0:number,x1:number,y0:number,y1:number,col:string,glow=false){add([[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]],col,undefined,glow);}
for(const s of [-1,1]){
 const x0=s<0?-.72:.38,x1=s<0?-.38:.72;
 plate(2.125,x0,x1,.64,.76,'#E45F48',true);plate(2.13,x0,x1,.62,.65,'#E3A261');
 plate(-2.145,x0,x1,.61,.72,'#E9CF9B',true);
}
plate(2.13,-.20,.20,.53,.65,'#BCA789');plate(2.13,-.76,.76,.41,.49,'#B09985');plate(-2.15,-.73,.73,.39,.47,'#9D9285');
plate(-2.15,-.32,.32,.56,.67,'#263039');
function wheel(s:number,z:number,t:number):Face[]{
 const out:Face[]=[],n=16,R=.35,y=.35,outer=s*.94,inner=s*.74;
 const v=(x:number,r:number,a:number):V=>[x,y+Math.cos(a)*r,z+Math.sin(a)*r];
 for(let i=0;i<n;i++){const a=i*TAU/n,b=(i+1)*TAU/n;
 out.push({v:[v(inner,R,a),v(outer,R,a),v(outer,R,b),v(inner,R,b)],color:'#1B2229'});
 out.push({v:[v(outer,R,a),v(outer,R,b),v(outer,.24,b),v(outer,.24,a)],color:'#303139'});
 out.push({v:[v(outer+s*.005,.24,a),v(outer+s*.005,.24,b),v(outer+s*.005,.19,b),v(outer+s*.005,.19,a)],color:'#B39B85'});
 }
 const faceX=outer+s*.009;
 out.push({v:Array.from({length:n},(_,i)=>v(faceX,.19,i*TAU/n)),color:'#484A4A'});
 for(let i=0;i<5;i++){const a=i*TAU/5+t*9;
 out.push({v:[v(faceX+s*.004,.045,a-.25),v(faceX+s*.004,.18,a-.10),v(faceX+s*.004,.18,a+.10),v(faceX+s*.004,.045,a+.25)],color:'#D0B99A'});}
 return out;
}
export function drawHeroCar(c:C,x:number,y:number,scale:number,t:number,yaw=.48,warm=false){
 if(!Number.isFinite(scale)||scale<=0)return;
 const cy=Math.cos(yaw),sy=Math.sin(yaw),pitch=.19,cp=Math.cos(pitch),sp=Math.sin(pitch),lens=7.6,unit=83*scale;
 const bob=Math.sin(t*7)*.009+Math.sin(t*3.1)*.008;
 const project=(v:V):P=>{const X=v[0]*cy-v[2]*sy,Z=v[0]*sy+v[2]*cy,Y=v[1]+bob,d=Z*cp+Y*sp,k=lens/(lens-d);return {x:x+X*k*unit,y:y-(Y*cp-Z*sp)*k*unit,d};};
 const ground=(v:V):P=>project([v[0],0,v[2]]);
 const shadow=[ground([-1.07,0,-2.15]),ground([1.07,0,-2.15]),ground([1.1,0,2.18]),ground([-1.1,0,2.18])];
 const poly=(p:P[])=>{c.beginPath();p.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.closePath();};
 c.save();poly(shadow);c.fillStyle='rgba(8,12,19,.52)';c.fill();
 const all=[...faces,...wheel(-1,-1.35,t),...wheel(1,-1.35,t),...wheel(-1,1.35,t),...wheel(1,1.35,t)];
 const projected=all.map(f=>{const p=f.v.map(project);return {f,p,d:p.reduce((n,v)=>n+v.d,0)/p.length};}).sort((a,b)=>a.d-b.d);
 for(const {f,p} of projected){
  // Lamp decals live on the two end panels. Do not paint the hidden end's glow.
  const endZ=f.v[0][2];if(f.glow&&endZ*cy<0)continue;
  const n=cross(sub(f.v[1],f.v[0]),sub(f.v[2],f.v[0])),length=Math.hypot(...n)||1;
  const light=(Math.abs(n[1])*.21+Math.abs(n[0])*.06+Math.abs(n[2])*.025)/length;
  const col=shade(f.color,.80+light+(warm ? .12 : 0));
  poly(p);c.fillStyle=col;
  if(f.color==='#75443F'||f.color==='#9D6656'||f.color==='#A76E57'||f.color==='#394C58'||f.color==='#35434D'||f.color==='#40515B'){
   const lo=Math.min(...p.map(v=>v.y)),hi=Math.max(...p.map(v=>v.y));if(hi-lo>.5){const g=c.createLinearGradient(0,lo,0,hi);g.addColorStop(0,shade(col,1.19));g.addColorStop(.24,shade(col,1.08));g.addColorStop(.42,shade(col,.91));g.addColorStop(.65,shade(col,1.12));g.addColorStop(1,shade(col,.74));c.fillStyle=g;}
  }
  c.fill();if(f.edge&&scale>.25){c.strokeStyle=f.edge;c.lineWidth=Math.max(.35,scale*.65);c.stroke();}
  if(f.glow&&scale>.16){const q={x:p.reduce((n,v)=>n+v.x,0)/p.length,y:p.reduce((n,v)=>n+v.y,0)/p.length};const rad=13*scale;const g=c.createRadialGradient(q.x,q.y,0,q.x,q.y,rad);g.addColorStop(0,f.color==='#E45F48'?'rgba(246,90,59,.42)':'rgba(250,220,150,.27)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(q.x-rad,q.y-rad,rad*2,rad*2);}
 }
 c.restore();
}
