import type { OpenMotionScene } from '../types/openmotion';
import { renderLivingTravelPoster } from './livingTravelPoster';
// Original deterministic 2.5D artwork. No assets, network, randomness or wall clock.
type C = CanvasRenderingContext2D;
const W=540,H=960,TAU=Math.PI*2;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{v=clamp(v);return v*v*(3-2*v);};
const wrap=(v:number,n:number)=>((v%n)+n)%n;
const rand=(i:number)=>{const a=Math.sin(i*127.1+311.7)*43758.5453;return a-Math.floor(a);};
function rect(c:C,x:number,y:number,w:number,h:number,f:string|CanvasGradient){c.fillStyle=f;c.fillRect(x,y,w,h);}
function poly(c:C,p:number[][],f:string){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=f;c.fill();}
function ellipse(c:C,x:number,y:number,rx:number,ry:number,f:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=f;c.fill();}
function line(c:C,x:number,y:number,x2:number,y2:number,f:string,width=1){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=f;c.lineWidth=width;c.stroke();}
function grad(c:C,y:number,y2:number,a:string,b:string){const g=c.createLinearGradient(0,y,0,y2);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function text(c:C,s:string,x:number,y:number,size:number,color:string,serif=false){c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.font=(serif?'500 ':'700 ')+size+'px '+(serif?'Georgia, serif':'Arial, sans-serif');c.fillText(s,x,y,460);}
function ridge(c:C,t:number,depth:number,y:number,amp:number,f:string){const p:number[][]=[[-30,H]];for(let x=-30;x<=570;x+=5){const a=x+t*depth;p.push([x,y+Math.sin(a*.008)*amp+Math.sin(a*.019+2)*amp*.32+Math.sin(a*.043)*amp*.12]);}p.push([570,H]);poly(c,p,f);}
function cloud(c:C,x:number,y:number,w:number,night:boolean){c.save();c.globalAlpha=.29;ellipse(c,x,y,w,8,night?'#75869d':'#fff2d6');ellipse(c,x-w*.25,y-5,w*.55,9,night?'#75869d':'#fff2d6');c.restore();}
function tree(c:C,x:number,y:number,s:number,flower:boolean){c.save();c.translate(x,y);c.scale(s,s);line(c,0,0,-4,-87,'#35413e',7);line(c,-2,-45,-24,-75,'#35413e',4);line(c,-3,-50,20,-82,'#35413e',4);for(let i=0;i<13;i++){const a=i*2.39;const r=13+rand(i+8)*24;ellipse(c,Math.cos(a)*r,-82+Math.sin(a)*r*.58,14+rand(i)*10,11+rand(i+1)*9,flower?['#cb7583','#efabb1','#f5c9c4','#d9909e'][i%4]:['#344c49','#4d6255','#667b61'][i%3]);}c.restore();}
function house(c:C,x:number,y:number,s:number,night:boolean){c.save();c.translate(x,y);c.scale(s,s);rect(c,-29,-30,58,30,night?'#52616a':'#d5bb91');poly(c,[[-37,-31],[0,-55],[36,-31]],night?'#212e40':'#56666a');line(c,-34,-31,34,-31,'#263941',3);rect(c,-7,-22,14,22,'#42504b');for(const q of [-21,13])rect(c,q,-22,9,12,night?'#f8cb82':'#708b8b');c.restore();}
function fuji(c:C,x:number,y:number,night:boolean){const p=[[-275,0],[-192,-28],[-128,-82],[-73,-160],[-38,-232],[-16,-250],[20,-250],[46,-219],[84,-149],[141,-73],[215,-23],[285,0]];c.save();c.translate(x,y);poly(c,p,night?'#596b84':'#718c9c');poly(c,[[-105,-113],[-73,-160],[-38,-232],[-16,-250],[20,-250],[46,-219],[84,-149],[111,-106],[66,-130],[38,-109],[16,-147],[-12,-120],[-45,-158],[-66,-121]],night?'#bdc9cd':'#fff0d9');poly(c,[[20,-250],[46,-219],[84,-149],[141,-73],[215,-23],[285,0],[90,0],[50,-104]],night?'#455b77':'#5e7b90');poly(c,[[20,-250],[46,-219],[84,-149],[111,-106],[66,-130],[38,-109]],night?'#9aaec0':'#d2dfe0');c.restore();}
function landscape(c:C,t:number,speed:number,shot:string){const night=shot==='station'||shot==='outro';const blossom=shot==='blossom';const mt=shot==='fuji'||blossom||shot==='cover';const travel=t*speed;
 rect(c,0,0,W,H,grad(c,0,670,night?'#1a2c46':'#678d9e',night?'#bd8c89':'#f8d3a5'));
 ellipse(c,402,245,41,41,night?'#f7d8b8':'#fff1c8');
 for(let i=0;i<6;i++)cloud(c,wrap(i*133-travel*3,800)-100,260+rand(i+30)*105,45+rand(i)*37,night);
 ridge(c,travel,4,518,33,night?'#6a768b':'#9aafb0');
 if(mt)fuji(c,300-travel*.85,590,night);
 ridge(c,travel,9,605,30,night?'#45596a':'#78988b');
 ridge(c,travel,18,654,18,night?'#334b55':'#5e8875');
 rect(c,0,667,W,293,grad(c,667,950,night?'#304448':'#87996b',night?'#1a3037':'#4c6e56'));
 // Distant farm buildings and grove; wrap well outside the viewport.
 for(let i=0;i<9;i++){const x=wrap(i*107-travel*25,963)-130;house(c,x,685,.48+rand(i)*.27,night);if(i%2===0)tree(c,x+35,695,.65,blossom);}
 // Rice paddy strips, angled irrigation channels and moving specular glints.
 for(let i=0;i<12;i++){const y=710+i*19;const shade=i%2?'#8aab79':'#6e966d';rect(c,0,y,W,12,night?'#405c5f':shade);line(c,0,y+12,W,y+12,night?'#697679':'#b4bd91',1);}
 for(let i=0;i<11;i++){const x=wrap(i*145-travel*63,1595)-450;poly(c,[[x,699],[x+5,699],[x+210,960],[x+189,960]],night?'#596e75':'#b7c8b0');}
 for(let i=0;i<10;i++){const x=wrap(i*126-travel*47,1260)-180;const y=739+rand(i+14)*80;line(c,x,y,x+30+rand(i)*20,y,night?'#919a99':'#e5e0b3',1);}
 // Foreground poles move much faster than the horizon.
 for(let i=0;i<5;i++){const x=wrap(i*260-travel*117,1300)-170;line(c,x,858,x-5,480,'#344444',5);line(c,x-31,510,x+30,510,'#344444',3);line(c,x-31,510,x+229,510,'#53605e',.9);for(const dx of [-22,20])rect(c,x+dx,502,3,7,'#dbd7bb');}
 if(blossom){for(let i=0;i<6;i++){const x=wrap(i*240-travel*155,1440)-240;tree(c,x,861,2.1,true);}}
 else for(let i=0;i<6;i++){const x=wrap(i*210-travel*110,1260)-200;tree(c,x,904,1.1,false);}
 if(night){const x=270+(1-ease((t-31)/6))*260;rect(c,x-240,563,480,145,'#324555');poly(c,[[x-260,565],[x-200,513],[x+198,513],[x+250,565]],'#202e3d');rect(c,x-224,580,448,12,'#b17f68');for(let i=0;i<6;i++){const q=x-195+i*77;rect(c,q,596,45,71,'#e3b985');line(c,q+22,596,q+22,667,'#54616a',2);line(c,q,631,q+45,631,'#54616a',2);}rect(c,0,715,W,245,'#697276');rect(c,0,746,W,7,'#e5c27b');rect(c,x-84,551,168,24,'#e9dfc7');text(c,'LOCAL STATION',x,563,13,'#324555');}
}
function rail(c:C,t:number){rect(c,0,840,W,120,'#354343');for(let i=0;i<14;i++){const x=wrap(i*55-t*170,770)-120;poly(c,[[x,844],[x+25,844],[x+65,960],[x+37,960]],'#6c716a');}line(c,0,866,W,866,'#9b9f91',6);line(c,0,925,W,925,'#b9b8a4',5);}
function train(c:C,x:number,y:number){c.save();c.translate(x,y);c.beginPath();c.moveTo(-265,-142);c.lineTo(180,-142);c.quadraticCurveTo(240,-136,254,-92);c.lineTo(260,-24);c.quadraticCurveTo(249,-8,217,-8);c.lineTo(-265,-8);c.closePath();c.fillStyle=grad(c,-142,-8,'#e9dfcb','#b2b6a9');c.fill();rect(c,-265,-48,520,14,'#a95747');rect(c,-265,-33,520,5,'#c99272');for(let i=0;i<5;i++){const q=-241+i*89;c.beginPath();c.roundRect(q,-121,69,55,7);c.fillStyle=grad(c,-121,-66,'#263c4b','#79918f');c.fill();line(c,q+6,-115,q+54,-115,'#a8b8b2',2);}poly(c,[[211,-121],[237,-104],[245,-68],[211,-68]],'#344b56');rect(c,239,-53,12,7,'#fff1b7');for(const q of [-176,174]){ellipse(c,q,1,18,18,'#243036');ellipse(c,q,1,8,8,'#737b79');}c.restore();}
function cabin(c:C,t:number,amount:number){c.save();c.translate(0,Math.sin(t*5)*.8);const inset=34*amount;const top=155*amount;const bottom=H-218*amount;const r=35*amount;const path=new Path2D();path.rect(0,0,W,H);path.roundRect(inset,top,W-inset*2,bottom-top,r);c.fillStyle=grad(c,0,H,'#293941','#18292d');c.fill(path,'evenodd');
 c.beginPath();c.roundRect(inset,top,W-inset*2,bottom-top,r);c.strokeStyle='#718080';c.lineWidth=8*amount;c.stroke();c.beginPath();c.roundRect(inset+6,top+6,W-2*(inset+6),bottom-top-12,Math.max(1,r-4));c.strokeStyle='rgba(231,219,191,.30)';c.lineWidth=2;c.stroke();
 if(amount>.3){rect(c,0,bottom,W,18,'#a99174');rect(c,0,bottom+18,W,22,'#54615b');poly(c,[[0,bottom+40],[W,bottom+40],[W,H],[0,H]],'#283b40');c.beginPath();c.roundRect(68,818,404,76,12);c.fillStyle='#445958';c.fill();line(c,85,829,450,829,'#657873',2);ellipse(c,400,853,35,13,'#25383c');rect(c,382,816,36,37,'#d9b892');ellipse(c,400,816,18,5,'#f1d9a8');ellipse(c,400,816,13,3,'#765f46');}
 c.restore();}
function petals(c:C,t:number){for(let i=0;i<45;i++){const x=wrap(rand(i+90)*820-t*(55+rand(i+3)*75),820)-140;const y=160+wrap(rand(i+150)*650+t*(13+rand(i+18)*16),570);c.save();c.translate(x,y);c.rotate(t*(.4+rand(i))+i);c.globalAlpha=.35+rand(i+8)*.55;ellipse(c,0,0,3+rand(i)*5,2+rand(i+1)*2,'#f7c4c6');c.restore();}}
export function renderParallaxCinema(c:C,w:number,h:number,s:OpenMotionScene,local:number,time:number){
 if(s.parallax?.variant==='living-travel-poster'){renderLivingTravelPoster(c,w,h,s,local);return;}
 const shot=s.parallax?.shot??'fields';const u=clamp(local/Math.max(.5,s.durationSec));const speed=Math.max(0,Math.min(2,s.parallax?.speed??1));c.save();const scale=Math.max(w/W,h/H);c.translate((w-W*scale)/2,(h-H*scale)/2);c.scale(scale,scale);
 landscape(c,time,speed,shot);if(shot==='cover'||shot==='boarding'){rail(c,time);train(c,shot==='cover'?220+ease(u)*100:-230+ease(u)*790,841);if(shot==='boarding'){const a=ease((u-.35)/.65);if(a>.005)cabin(c,time,a);}}else{if(shot==='blossom')petals(c,time);cabin(c,time,1);}
 // Screen-space lighting and vignette. No postprocessing pass or image readback.
 const v=c.createRadialGradient(270,460,200,270,480,560);v.addColorStop(0,'rgba(9,18,26,0)');v.addColorStop(1,'rgba(9,18,26,.42)');rect(c,0,0,W,H,v);
 if(shot==='cover'||shot==='outro'){rect(c,0,0,W,335,grad(c,0,335,'rgba(18,34,41,.93)','rgba(18,34,41,0)'));text(c,'W I N D O W   S E A T  /  '+String(s.parallax?.episode??1).padStart(2,'0'),270,130,15,'#f2d5a5');text(c,s.headline||'Japan by Train',270,192,50,'#fff2d9',true);text(c,s.subheadline||'A journey in motion',270,242,17,'#f2d5a5');}
 else if(s.headline){c.save();c.globalAlpha=ease(u*5)*(1-ease((u-.82)/.18));text(c,s.headline,270,119,17,'#f5e1bf');c.restore();}
 c.restore();
}
