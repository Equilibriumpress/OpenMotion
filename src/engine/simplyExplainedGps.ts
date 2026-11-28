import type { OpenMotionScene } from '../types/openmotion';
/** Original Canvas diagrams, sharing Simply Explained's 512 × 910 logical canvas.
 * All coordinates above y=635. No raster assets or independent animation clock.
 */
type C=CanvasRenderingContext2D;
type P=[number,number];
const ink='#243538',teal='#253E43',light='#FFF9EF',rust='#B94F36',sand='#E9D4BD',muted='#766E61',blue='#397CA7',green='#9CB19D',water='#DCE5DD';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const a=clamp(v);return a*a*(3-2*a);};
const mix=(a:number,b:number,u:number)=>a+(b-a)*u;
function line(c:C,a:P,b:P,color=teal,w=2){c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
function disk(c:C,x:number,y:number,r:number,color:string,stroke?:string,w=1.5){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function rect(c:C,x:number,y:number,w:number,h:number,color:string,r=8,stroke?:string){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
function txt(c:C,s:string,x:number,y:number,size=24,color=ink,weight=700,max=442){c.font=weight+' '+size+'px system-ui,sans-serif';c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=color;c.fillText(s,x,y,max);}
function show(c:C,u:number,draw:()=>void){c.save();c.globalAlpha=ease(u);draw();c.restore();}
function poly(c:C,p:P[],fill:string){if(!p.length)return;c.beginPath();c.moveTo(...p[0]);for(const x of p.slice(1))c.lineTo(...x);c.closePath();c.fillStyle=fill;c.fill();}
function satellite(c:C,x:number,y:number,s=1,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);
 for(const side of [-1,1]){const xx=side<0?-39:13;rect(c,xx,-12,26,24,teal,2);for(let i=1;i<3;i++)line(c,[xx+i*26/3,-12],[xx+i*26/3,12],'#91A9A9',.8);line(c,[xx,0],[xx+26,0],'#91A9A9',.8);line(c,[side*9,0],[side*14,0],muted,3);}
 rect(c,-12,-15,24,30,sand,4,muted);rect(c,-7,-9,14,12,light,2);c.beginPath();c.moveTo(-10,14);c.quadraticCurveTo(0,32,10,14);c.fillStyle=rust;c.fill();line(c,[0,16],[0,30],muted,1.8);c.restore();
}
function pulse(c:C,a:P,b:P,t:number,color=rust){
 c.save();c.setLineDash([5,7]);line(c,a,b,color,1.5);c.setLineDash([]);c.restore();
 const u=((t%1)+1)%1;disk(c,mix(a[0],b[0],u),mix(a[1],b[1],u),4,color);
}
// Simplified original continent outlines in longitude/latitude, illustrative not navigational.
const land:P[][]=[
 [[-166,63],[-130,71],[-93,72],[-62,55],[-54,43],[-81,25],[-98,18],[-111,29],[-126,48],[-145,57]],
 [[-81,12],[-63,10],[-35,-6],[-46,-25],[-60,-51],[-72,-38],[-76,-13]],
 [[-10,36],[-8,54],[18,62],[44,56],[39,43],[25,32],[44,12],[32,-12],[20,-35],[1,-28],[-16,11],[-17,24]],
 [[30,48],[55,68],[111,73],[154,55],[143,38],[121,24],[106,8],[82,9],[68,24],[47,31]],
 [[112,-12],[139,-10],[154,-26],[143,-42],[116,-34]], [[-52,60],[-30,67],[-23,78],[-47,82],[-65,73]]
];
function globe(c:C,x:number,y:number,r:number,rotation:number){
 disk(c,x,y,r,water,green,1.7);c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();
 const project=(lon:number,lat:number):[number,number,number]=>{const a=(lon-rotation)*Math.PI/180,b=lat*Math.PI/180;return [x+r*Math.cos(b)*Math.sin(a),y-r*Math.sin(b),Math.cos(b)*Math.cos(a)];};
 // Clip each spherical coastline segment at the visible hemisphere. Horizon crossings are interpolated.
 for(const shape of land){const samples:P[]=[];for(let i=0;i<shape.length;i++){const a=shape[i],b=shape[(i+1)%shape.length];for(let j=0;j<12;j++)samples.push([mix(a[0],b[0],j/12),mix(a[1],b[1],j/12)]);}
 const points=samples.map(p=>project(...p)),visible:P[]=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if(a[2]>=0)visible.push([a[0],a[1]]);if((a[2]>=0)!==(b[2]>=0)){const u=a[2]/(a[2]-b[2]);visible.push([mix(a[0],b[0],u),mix(a[1],b[1],u)]);}}poly(c,visible,green);}
 for(const lat of [-60,-30,0,30,60]){const points:P[]=[];for(let lon=rotation-90;lon<=rotation+90;lon+=5){const p=project(lon,lat);points.push([p[0],p[1]]);}for(let i=1;i<points.length;i++)line(c,points[i-1],points[i],'rgba(83,122,113,.35)',.8);}
 for(const offset of [-60,-30,0,30,60]){let prev:P|undefined;for(let lat=-90;lat<=90;lat+=5){const p=project(rotation+offset,lat),cur:P=[p[0],p[1]];if(prev)line(c,prev,cur,'rgba(83,122,113,.35)',.8);prev=cur;}}
 const shade=c.createLinearGradient(x-r,y-r,x+r,y+r);shade.addColorStop(0,'rgba(255,255,255,.25)');shade.addColorStop(.55,'rgba(255,255,255,0)');shade.addColorStop(1,'rgba(36,53,56,.15)');c.fillStyle=shade;c.fillRect(x-r,y-r,r*2,r*2);c.restore();
}
function map(c:C,x:number,y:number,w:number,h:number,t:number){
 c.save();c.beginPath();c.roundRect(x,y,w,h,12);c.clip();c.fillStyle='#DCE5D8';c.fillRect(x,y,w,h);
 // Stylized original neighborhood. Keep roads, blocks and location dot in one coordinate system.
 c.translate(x+w/2,y+h/2);c.scale(w/250,h/320);
 for(let i=-2;i<=2;i++){for(let j=-2;j<=2;j++){rect(c,i*62-24,j*72-27,45,49,(i+j)%3===0?'#B8CDB2':'#C9D0C2',5);}}
 for(let i=-2;i<=2;i++){line(c,[i*62-31,-220],[i*62-31,220],light,10);line(c,[-180,i*72-36],[180,i*72-36],light,9);}
 line(c,[-180,130],[170,-145],'#FBF3DF',15);line(c,[-180,130],[170,-145],'#C9BBA7',1);
 const q=ease(t),px=mix(-22,10,q),py=mix(30,4,q);disk(c,px,py,24+5*Math.sin(t*Math.PI*4),'rgba(57,124,167,.18)');disk(c,px,py,9,blue,light,2.6);c.restore();
}
function phone(c:C,x:number,y:number,s:number,t:number){c.save();c.translate(x,y);c.scale(s,s);rect(c,-112,-181,224,362,ink,23);map(c,-102,-166,204,330,t);rect(c,-34,-174,68,10,ink,5);rect(c,-28,166,56,4,light,2);c.restore();}
function title(c:C,s:string){txt(c,s,256,110,34,ink,800);}
function signature(c:C,u:number){show(c,u,()=>{line(c,[42,583],[470,583],'#C9BBA7',1);rect(c,45,598,26*ease(u),6,rust,2);c.font='800 17px system-ui,sans-serif';c.textAlign='left';c.fillStyle=teal;c.fillText('SIMPLY EXPLAINED',83,609,370);});}
const target:P=[257,366],centers:P[]=[[166,278],[348,278],[258,475]],colors=[rust,blue,teal];
function ranges(c:C,u:number){
 for(let i=0;i<3;i++){const a=centers[i],r=Math.hypot(a[0]-target[0],a[1]-target[1]),q=ease((u-i*.20)/.22);if(q<=0)continue;
 c.save();c.globalAlpha=q;c.beginPath();c.arc(...a,r,0,Math.PI*2*q);c.strokeStyle=colors[i];c.lineWidth=2.6;c.stroke();disk(c,...a,8,colors[i],light,2);c.restore();}
 show(c,(u-.72)/.18,()=>{disk(c,...target,18,'rgba(57,124,167,.16)');disk(c,...target,7,blue,light,2);});
}
export function renderGpsDiagram(c:C,scene:OpenMotionScene,t:number){
 const shot=scene.doodle?.extras?.find(x=>x.startsWith('shot:'))?.slice(5),u=clamp(t/Math.max(.001,scene.durationSec));
 switch(shot){
 case 'cover':
  txt(c,'SIMPLY EXPLAINED',256,78,15,muted,700);txt(c,'HOW GPS',256,165,57,ink,850);txt(c,'FINDS YOU',256,229,57,rust,850);
  globe(c,256,409,126,15+u*5);satellite(c,92,301,.72,-.3);satellite(c,414,284,.72,.3);pulse(c,[92,321],[260,408],t*.9);pulse(c,[414,304],[260,408],t*.9+.4);break;
 case 'hook': {
  title(c,'Where am I?');const q=ease(u/.30);phone(c,256,361,.86+.13*q,u);show(c,(u-.47)/.18,()=>txt(c,'The blue dot',256,590,26,blue));break;}
 case 'training': { // Zoom outward from the phone's location to the satellite constellation.
  title(c,'Signals from space');const q=ease(u/.40);globe(c,256,369,mix(205,115,q),18+u*32);
  const orbit=[[-155,-107],[153,-113],[-173,92],[166,89]];
  for(let i=0;i<4;i++){const a=u*.18+i*.06,x=256+orbit[i][0]+Math.sin(a*5)*8,y=369+orbit[i][1]+Math.cos(a*4)*8;show(c,(u-.12-i*.10)/.20,()=>{satellite(c,x,y,.75,Math.sin(a)*.35);pulse(c,[x,y+14],[260,371],t*.65+i*.23);});}
  show(c,(u-.70)/.18,()=>txt(c,'Position + time',256,589,25,teal));break;}
 case 'tokens': {
  title(c,'Measure travel time');const a:P=[115,241],b:P=[387,454];satellite(c,...a,1.1,-.28);phone(c,b[0],b[1],.38,0);
  pulse(c,[a[0]+15,a[1]+24],[b[0]-28,b[1]-40],t*.6);show(c,(u-.22)/.2,()=>{rect(c,46,325,158,56,light,8);txt(c,'Sent',125,360,25,ink);});
  show(c,(u-.48)/.2,()=>{rect(c,283,535,182,52,light,8);txt(c,'Received',374,568,24,ink);});break;}
 case 'prediction':
  title(c,'Estimate distance');txt(c,'Simplified 2D example',256,156,18,muted,500);ranges(c,u);show(c,(u-.74)/.2,()=>txt(c,'Common intersection',256,615,23,blue,700));break;
 case 'response': {
  title(c,'Four satellite signals');const sats:P[]=[[80,230],[431,236],[94,451],[416,464]];const q=ease(u/.30);globe(c,256,353,96+9*q,35+u*15);
  for(let i=0;i<4;i++){const a=sats[i];show(c,(u-i*.15)/.17,()=>{satellite(c,...a,.73,(i%2?.28:-.28));pulse(c,[a[0],a[1]+16],[256,353],t*.7+i*.22);});}
  show(c,(u-.58)/.18,()=>{rect(c,71,548,370,60,light,10);txt(c,'3D position + clock correction',256,585,22,teal,750,350);});break;}
 case 'limits': {
  title(c,'Your location');const q=ease(u/.47);phone(c,256,351,.65+.35*q,u);show(c,(u-.46)/.22,()=>txt(c,'Position calculated',256,565,24,blue,750));signature(c,(t-(scene.durationSec-.95))/.35);break;}
 }
}
