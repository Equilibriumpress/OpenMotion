
import { OpenMotionScene, OpenMotionProject, getProjectDurationSec } from '../types/openmotion';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
const ink='#232a33',blue='#2457cc',gold='#d5a23e',green='#547a67',red='#c36a55',paper='#f4ecdf';
export function renderWorldStory(ctx:CanvasRenderingContext2D,w:number,h:number,s:OpenMotionScene,t:number,p:OpenMotionProject,global:number) {
 const d=s.worldStory!; const a=ease(t/.65), phase=t/s.durationSec;
 ctx.save();ctx.scale(w/1080,h/1920);
 const rect=(x:number,y:number,W:number,H:number,c:string,r=0)=>{ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,W,H,r);ctx.fill()};
 const line=(x:number,y:number,X:number,Y:number,c:string,l=3)=>{ctx.strokeStyle=c;ctx.lineWidth=l;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke()};
 const circle=(x:number,y:number,r:number,c:string)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()};
 const poly=(pts:number[][],c:string)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=c;ctx.fill()};
 const txt=(v:string,x:number,y:number,size:number,c=ink,weight=800,align:CanvasTextAlign='center',max=890)=>{ctx.font=weight+' '+size+'px "Bricolage Grotesque", Arial, sans-serif';ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=c;ctx.fillText(v,x,y,max)};
 const at=(x:number,y:number,scale:number,f:()=>void,angle=0)=>{ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.rotate(angle);f();ctx.restore()};
 const coin=(x:number,y:number,r=37)=>{circle(x+3,y+6,r,'#a97725');circle(x,y,r,gold);circle(x,y,r*.77,'#edbf59');txt('€',x,y+1,r*1.12,'#8a5d20')};
 const arrow=(x:number,y:number,X:number,Y:number,c=green)=>{line(x,y,X,Y,c,7);const k=Math.atan2(Y-y,X-x);poly([[X,Y],[X-20*Math.cos(k-.48),Y-20*Math.sin(k-.48)],[X-20*Math.cos(k+.48),Y-20*Math.sin(k+.48)]],c)};
 const flow=(x:number,y:number,X:number,Y:number)=>{arrow(x,y,X,Y);for(let i=0;i<3;i++){const q=(t*.32+i/3)%1;coin(x+(X-x)*q,y+(Y-y)*q,25)}};
 const plane=()=>{poly([[-210,-16],[-144,-16],[-117,-78],[-91,-78],[-100,-14],[-26,-14],[60,-133],[90,-133],[48,-12],[174,-12],[207,0],[174,14],[48,14],[90,135],[60,135],[-26,16],[-100,16],[-91,65],[-117,65],[-144,16],[-210,16]],'#adbbc3');poly([[-210,-18],[-144,-18],[-117,-80],[-91,-80],[-100,-18],[-26,-18],[60,-138],[90,-138],[48,-18],[174,-18],[207,-2],[174,10],[48,10],[90,130],[60,130],[-26,12],[-100,12],[-91,62],[-117,62],[-144,12],[-210,12]],'#fffdf7');line(-125,-3,145,-3,blue,7);rect(146,-13,24,15,ink,4);for(let i=0;i<9;i++)circle(-75+i*21,4,3,ink)};
 const person=(walk=false)=>{const q=walk?Math.sin(t*7):0;circle(0,-136,34,'#d5a27d');poly([[-33,-143],[-27,-170],[17,-174],[35,-155],[32,-138],[14,-155],[-25,-143]],'#41332f');circle(10,-138,2,ink);circle(24,-138,2,ink);line(13,-125,22,-125,'#976451',2);rect(-34,-99,70,112,blue,16);line(-27,-76,-53+q*16,-6,'#d5a27d',19);line(29,-76,47-q*18,-9,'#d5a27d',19);line(-17,10,-20+q*25,99,ink,24);line(18,10,22-q*25,99,ink,24);line(-20+q*25,102,-5+q*25,102,ink,13);line(22-q*25,102,37-q*25,102,ink,13);rect(54,32,52,72,gold,7);line(69,32,69,3,ink,4);line(69,3,83,3,ink,4);line(83,3,83,32,ink,4);circle(65,105,6,ink);circle(96,105,6,ink)};
 const building=(W=280,H=170,label='TERMINAL')=>{rect(-W/2+8,-H+10,W,H,'#c9c1b3',3);rect(-W/2,-H,W,H,'#a9b9c6',3);rect(-W/2,-H,W,20,ink);for(let j=0;j<Math.floor(H/47)-1;j++)for(let i=0;i<Math.floor(W/43);i++)rect(-W/2+11+i*43,-H+33+j*46,32,29,'#e5f0ec',2);rect(-27,-53,54,53,ink,3);if(label)txt(label,0,-H-23,24,ink,800,'center',W)};
 const tower=()=>{poly([[-21,0],[-12,-149],[12,-149],[23,0]],'#9daeb6');poly([[-42,-186],[42,-186],[30,-147],[-30,-147]],ink);rect(-31,-179,62,17,'#b4d4df',2);rect(-45,-190,90,7,blue,2)};
 const shop=(label:string,c:string)=>{rect(-132,-183,264,183,'#fdf8ec',4);rect(-132,-183,264,46,c,3);txt(label,0,-160,24,'white');for(let i=0;i<6;i++)rect(-139+i*46,-139,46,35,i%2?'#f3eee2':c,7);rect(-105,-93,108,70,'#b6cbd0',4);rect(21,-93,65,93,ink,3);rect(-110,-18,116,8,c);};
 const car=(c:string)=>{rect(-74,-29,148,56,c,17);poly([[-48,-28],[-25,-61],[28,-61],[49,-28]],c);poly([[-31,-31],[-16,-52],[19,-52],[32,-31]],'#c7dfe3');circle(-43,28,15,ink);circle(45,28,15,ink);circle(-43,28,6,'#c8c7c2');circle(45,28,6,'#c8c7c2');rect(56,-16,12,10,'#fff4bd',3)};
 const cup=()=>{poly([[-50,-67],[50,-67],[35,65],[-35,65]],'#fffaf2');rect(-52,-77,104,15,ink,5);poly([[-44,-24],[44,-24],[38,28],[-38,28]],'#b68d54');circle(0,2,16,green);for(let i=0;i<3;i++){ctx.strokeStyle='#bfb3a0';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-20+i*20,-90);ctx.quadraticCurveTo(-40+i*20,-116+Math.sin(t*2+i)*12,-15+i*20,-132);ctx.stroke()}};
 const ground=(y=1160)=>{ctx.fillStyle='rgba(80,65,42,.09)';ctx.beginPath();ctx.ellipse(540,y,410,32,0,0,Math.PI*2);ctx.fill()};
 rect(0,0,1080,1920,paper);for(let x=0;x<1080;x+=36)line(x,0,x,1920,'#e8ddcc',.8);for(let y=0;y<1920;y+=36)line(0,y,1080,y,'#e8ddcc',.8);
 txt(p.brandKit.brandName,540,210,28,ink,800);line(445,245,635,245,blue,5);
 ctx.save();ctx.globalAlpha=a;ctx.translate(0,(1-a)*25);
 const eye=(s.eyebrow??'').toUpperCase();ctx.font='700 33px Arial';const ew=Math.min(880,ctx.measureText(eye).width+44);rect(540-ew/2,345,ew,48,ink,24);txt(eye,540,369,31,'white',700,'center',ew-30);
 const hc=d.visual==='chart'||d.visual==='money'||d.visual==='coffee'||d.visual==='cars'?green:blue;
 ctx.save();ctx.translate(540,465);ctx.rotate(-.025);ctx.font='900 84px "Bricolage Grotesque", Arial';const hw=Math.min(940,ctx.measureText(s.headline).width+54);rect(-hw/2,-56,hw,112,hc,9);txt(s.headline,0,2,79,'white',900,'center',hw-38);ctx.restore();
 ctx.restore();
 ctx.save();ctx.translate(540,1000);ctx.scale(1+phase*.025,1+phase*.025);ctx.translate(-540,-1000);
 if(d.visual==='airport'){ground();at(395,1110,1.55,()=>building(300,165,'SCHIPHOL'));at(785,1110,1.25,tower);at(210+650*ease(phase),775-70*phase,.95,plane,-.13);line(115,1180,965,1180,ink,7);for(let i=0;i<8;i++)line(150+i*110,1180,198+i*110,1180,paper,3)}
 else if(d.visual==='traveler'){ground();for(let i=0;i<4;i++)at(215+i*205,1030,.86,()=>person(true));at(540,795,.75,plane);txt('Amsterdam Airport Schiphol',540,1240,31,ink,600)}
 else if(d.visual==='ticket'){at(285,940,1.15,()=>person(true));rect(520,825,365,210,'#fffdf8',15);rect(520,825,365,57,blue,12);txt('BOARDING PASS',702,853,26,'white');at(665,945,.55,plane);for(let i=0;i<16;i++)rect(548+i*18,992,i%3?7:12,22,ink);flow(420,1110,815,1110)}
 else if(d.visual==='runway'){ground();rect(100,1040,880,100,'#6d7780',8);for(let i=0;i<7;i++)rect(135+i*120,1087,62,6,paper);at(220+600*ease(phase),970,1,plane);at(840,1010,.8,tower);txt('Landing · passagiers · security',540,1220,32,ink,700)}
 else if(d.visual==='money'){at(245,900,.62,plane);at(825,1060,1.0,()=>building(235,160,'LUCHTHAVEN'));flow(345,920,690,920);for(let i=0;i<5;i++)coin(350+i*93,1150-(i%2)*25,42)}
 else if(d.visual==='shop'){ground();at(280,1110,1.12,()=>shop('COFFEE',green));at(795,1110,1.12,()=>shop('DUTY FREE',blue));at(395+230*ease(phase),1065,.95,()=>person(true))}
 else if(d.visual==='coffee'){at(265,960,1.4,cup);at(820,1100,1.1,()=>shop('WINKEL',blue));flow(380,965,660,965);txt('Concessie ≠ totale winkelomzet',540,1240,33,ink,700)}
 else if(d.visual==='parking'||d.visual==='cars'){ground();rect(145,770,790,380,'#b9c3c5',6);for(let i=0;i<3;i++){rect(160,790+i*112,760,85,'#76848b',3);for(let j=0;j<4;j++)at(250+j*190,845+i*112,.7,()=>car([blue,red,gold,green][(i+j)%4]))}rect(140,755,800,28,ink);rect(425,705,230,50,blue,5);txt('P',540,730,38,'white');if(d.visual==='parking'){at(160+650*ease(phase),1220,.9,()=>car(red));line(900,1185,900,1250,ink,10);line(900,1187,825,1187-65*ease(phase),red,8)}else for(let i=0;i<4;i++)coin(390+i*100,1240,34)}
 else if(d.visual==='estate'){ground(1210);rect(115,1080,850,110,'#a3a8a4',8);for(let i=0;i<7;i++)rect(150+i*120,1130,65,5,paper);at(230,1080,.88,()=>building(240,230,'KANTOREN'));at(520,1080,1.02,()=>building(240,300,'HOTEL'));at(840,1080,.85,()=>building(260,150,'LOGISTIEK'));if(s.headline.includes('€'))flow(300,1250,780,1250);else txt('Schematisch luchthavengebied',540,1250,30,ink,600)}
 else if(d.visual==='chart'&&d.data){const total=d.data.reduce((n,x)=>n+x.value,0);let xx=125;for(const row of d.data){const ww=830*row.value/total;rect(xx,738,ww,76,row.color);xx+=ww}d.data.forEach((row,i)=>{let y=880+i*73;circle(145,y,12,row.color);txt(row.label,180,y,32,ink,700,'left',480);txt('€ '+row.value.toLocaleString('nl-NL')+' mln',935,y,32,ink,800,'right',320)});txt('Omzetverdeling · bedragen in miljoenen',540,1275,26,ink,600)}
 else {at(540,950,1.1,()=>shop('IKEA',blue));txt('Waarom gehaktballetjes?',540,1080,44,ink,800)}
 ctx.restore();
 if(d.source)txt(d.source,540,1370,26,'#625f58',600);
 txt('AFLEVERING '+String(d.episode).padStart(2,'0'),540,1630,26,ink,700);
 rect(140,1690,800,6,'#d8ccbb',3);rect(140,1690,800*clamp(global/getProjectDurationSec(p)),6,blue,3);
 ctx.restore();
}
