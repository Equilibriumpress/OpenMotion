import type {OpenMotionScene} from '../types/openmotion';
// Original nocturnal film-noir illustrations for episode 02.
// Pure time-driven Canvas artwork, shared by preview, PNG and MP4 export.
type C=CanvasRenderingContext2D;
const W=540,H=960,INK='#101820',PAPER='#F2E2CF',RED='#A84F50';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const a=clamp(x);return a*a*(3-2*a);};
const val=(s:OpenMotionScene,k:string,f='')=>s.doodle?.extras?.find(x=>x.startsWith(k+':'))?.slice(k.length+1)??f;
export const isBreathStory=(s:OpenMotionScene)=>!!s.doodle?.extras?.includes('song-breath-v1');
function rect(c:C,x:number,y:number,w:number,h:number,f:string|CanvasGradient){c.fillStyle=f;c.fillRect(x,y,w,h);}
function shape(c:C,d:string,f:string|CanvasGradient){c.fillStyle=f;c.fill(new Path2D(d));}
function line(c:C,d:string,f:string,w=2){c.strokeStyle=f;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke(new Path2D(d));}
function oval(c:C,x:number,y:number,rx:number,ry:number,f:string|CanvasGradient){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=f;c.fill();}
function grad(c:C,x:number,y:number,x2:number,y2:number,stops:[number,string][]):CanvasGradient{const g=c.createLinearGradient(x,y,x2,y2);stops.forEach(([a,b])=>g.addColorStop(a,b));return g;}
function glow(c:C,x:number,y:number,r:number,col:string){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');oval(c,x,y,r,r,g);}
function text(c:C,v:string,x:number,y:number,size:number,color=PAPER,weight=750,max=446){c.font=weight+' '+size+'px system-ui, sans-serif';const f=Math.min(size,size*max/Math.max(1,c.measureText(v).width));c.font=weight+' '+f+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(v,x,y);}
const grain=Array.from({length:1250},(_,i)=>[(i*137.507764)%W,(i*91.137)%H,i%7===0?2:1,i%3===0] as const);
function finish(c:C){
 const g=c.createRadialGradient(270,400,170,270,440,630);g.addColorStop(0,'rgba(9,15,24,0)');g.addColorStop(1,'rgba(9,15,24,.66)');rect(c,0,0,W,H,g);
 c.globalAlpha=.12;for(const [x,y,r,d] of grain)rect(c,x,y,r,r,d?'#E7C8BA':'#08121B');c.globalAlpha=1;
 rect(c,0,640,W,320,grad(c,0,640,0,960,[[0,'rgba(7,12,20,0)'],[.50,'rgba(7,12,20,.48)'],[1,'rgba(7,12,20,.84)']]));
}
function city(c:C,t:number,warm=false){
 rect(c,-40,-40,620,1040,grad(c,0,0,0,960,[[0,'#1A2835'],[.45,warm?'#866765':'#415360'],[.74,'#2C414B'],[1,'#15222E']]));
 glow(c,375,360,185,warm?'rgba(234,156,111,.35)':'rgba(181,113,120,.16)');
 for(let l=0;l<3;l++){const base=530+l*105,step=69+l*22;for(let i=-2;i<11;i++){const x=i*step-t*(l+1)*1.3,h=110+(i*i*39+l*17)%230;rect(c,x,base-h,step-4,h,['#59616A','#394955','#23343F'][l]);if(l)for(let y=base-h+15;y<base-9;y+=28)for(let j=12;j<step-10;j+=20)if((i*3+j+y)%5<2)rect(c,x+j,y,8,11,warm?'#A77E65':'#797D78');}}
 rect(c,0,760,W,200,'#172631');line(c,'M 0 803 H 540','#50616B',2);
 for(let i=0;i<5;i++){const x=(i*117+((t*42)%117));line(c,'M '+x+' 822 l 35 0','rgba(196,158,142,.15)',3);}
}
// Two fictional adults, with independently drawn facial geometry and clothing.
// Not likenesses of the musicians. Same rig and silhouette in all scenes.
function character(c:C,x:number,y:number,s:number,t:number,who:'woman'|'man',mood:'warm'|'neutral'|'uneasy',flip=false){
 c.save();c.translate(x,y+Math.sin(t*1.6)*1.2);c.scale(flip?-s:s,s);
 const woman=who==='woman',skin=woman?'#B98980':'#B49A87',light=woman?'#E0B0A0':'#D8B9A1',shadow=woman?'#71545D':'#67565A',hair=woman?'#553D45':'#252F37',coat=woman?'#9D575B':'#4F626B';
 shape(c,'M -25 19 Q -28 56 -45 66 L 4 100 L 41 68 Q 23 48 19 20 Z',shadow);
 shape(c,'M -45 65 Q -103 73 -133 120 L -151 273 H 139 L 110 120 Q 80 77 41 66 L 4 100 Z',grad(c,-110,90,120,260,[[0,coat],[.6,woman?'#663B47':'#344650'],[1,'#222C37']]));
 shape(c,'M -45 65 L 4 100 L -18 145 L -62 92 Z',woman?'#B36D70':'#687E87');shape(c,'M 41 66 L 4 100 L 31 130 L 55 89 Z',coat);
 line(c,'M -74 126 Q -65 175 -77 255 M 78 132 Q 85 191 94 260','#28303A',2.5);
 c.save();c.rotate((mood==='uneasy' ? .055 : -.025)+Math.sin(t*.8)*.015);
 if(woman)shape(c,'M -74 -90 Q -70 -157 -8 -157 Q 65 -161 76 -82 L 78 61 Q 38 88 -26 76 L -82 91 Z',hair);
 else shape(c,'M -78 -40 Q -95 -90 -64 -128 Q -16 -165 39 -145 Q 78 -129 76 -80 L 69 -20 L -60 24 Z',hair);
 const face=woman?'M -65 -67 C -70 -112 -44 -143 -5 -145 C 34 -146 64 -121 70 -87 L 75 -55 Q 78 -36 84 -20 Q 94 -8 80 -2 L 74 9 Q 70 42 39 61 Q 17 70 -10 53 Q -49 38 -65 -7 Z':'M -66 -56 Q -76 -116 -23 -141 Q 22 -156 61 -123 Q 79 -103 74 -71 L 81 -43 L 91 -18 Q 98 -7 82 -2 L 79 15 L 70 43 Q 52 66 24 61 L -11 48 Q -54 36 -66 -56 Z';
 c.save();c.clip(new Path2D(face));shape(c,face,grad(c,-63,12,80,-69,[[0,shadow],[.42,skin],[1,light]]));glow(c,41,-5,48,'rgba(248,192,163,.22)');shape(c,'M -51 9 Q -9 56 41 57 L 68 39 L 69 83 L -37 76 Z','rgba(57,36,49,.24)');c.restore();
 if(woman){shape(c,'M -76 -23 Q -89 -75 -67 -119 Q -35 -163 12 -151 Q 65 -149 72 -104 Q 30 -126 1 -89 Q -12 -61 -20 -15 L -31 60 L -77 83 Z',hair);for(let i=0;i<5;i++)line(c,'M '+(-59+i*8)+' -103 Q '+(-32+i*7)+' -139 '+(8+i*8)+' -130','#7D5559',1.8);line(c,'M -63 -46 Q -48 2 -58 62','#7D5559',2);}
 else{shape(c,'M -73 -20 Q -91 -82 -65 -121 Q -32 -154 19 -148 Q 66 -146 77 -112 L 67 -81 Q 41 -108 7 -93 L -22 -64 L -38 3 Z',hair);line(c,'M -58 -105 Q -22 -141 29 -129 M -42 -100 Q -3 -135 48 -121','#4A5054',2);}
 oval(c,-24,-1,14,21,skin);line(c,'M -29 -11 Q -13 -10 -23 7',shadow,2.4);if(woman){c.beginPath();c.ellipse(-23,19,5,8,0,0,Math.PI*2);c.strokeStyle='#D0A479';c.lineWidth=2.4;c.stroke();}
 const open=(1-clamp(1-Math.abs(((t+(woman?1:2))%4.5)-2)/.10))*(mood==='uneasy' ? .62 : .87);
 for(const [xx,ww] of [[11,15],[50,24]]){const yy=-28,hh=5.8*open;line(c,'M '+(xx-ww/2)+' -43 Q '+xx+' '+(mood==='uneasy'?-53:-49)+' '+(xx+ww/2)+' -42','#322A33',2.7);if(open>.1){const d='M '+(xx-ww/2)+' '+yy+' Q '+xx+' '+(yy-hh)+' '+(xx+ww/2)+' '+yy+' Q '+xx+' '+(yy+hh*.6)+' '+(xx-ww/2)+' '+yy+' Z';shape(c,d,'#D9BFAE');c.save();c.clip(new Path2D(d));oval(c,xx+(mood==='uneasy'?-1:2),yy,3.8,5,'#44373A');oval(c,xx+1,yy,1.9,3,'#201E25');oval(c,xx,yy-2,.9,1,'#EFD0B4');c.restore();}line(c,'M '+(xx-ww/2)+' '+yy+' Q '+xx+' '+(yy-hh)+' '+(xx+ww/2)+' '+yy,'#322A33',1.8);}
 shape(c,'M 34 -40 Q 45 -14 58 -3 Q 46 8 33 4 Z',grad(c,30,-10,61,-5,[[0,shadow],[.7,skin],[1,light]]));line(c,'M 32 3 Q 38 -1 42 4 M 51 3 l 4 -2',shadow,1.5);
 shape(c,'M 24 23 Q 36 18 42 21 Q 50 18 57 23 Q 42 31 24 23 Z',woman?'#975A62':'#8F6661');line(c,'M 24 23 Q 41 '+(mood==='warm'?28:mood==='uneasy'?20:24)+' 57 23','#4F363F',1.6);
 line(c,'M 68 32 Q 53 53 31 60','rgba(245,193,166,.48)',1.8);c.restore();
 c.restore();
}
function heart(c:C,t:number,fracture=0){
 c.save();c.translate(270,470);const scale=1+.018*Math.sin(t*2.1);c.scale(scale,scale);
 const d='M 0 178 C -55 125 -192 34 -192 -51 C -192 -155 -63 -183 0 -99 C 63 -183 192 -155 192 -51 C 192 34 55 125 0 178 Z';
 shape(c,d,grad(c,-150,-150,170,150,[[0,'#CD7776'],[.45,'#A64F56'],[1,'#542D40']]));
 if(fracture){c.globalAlpha=fracture;line(c,'M 0 -99 L -15 -44 L 17 -8 L -10 42 L 12 91 L 0 178','#271D2A',5);c.globalAlpha=1;}
 shape(c,'M -120 -8 Q 0 -99 120 -8 Q 0 83 -120 -8 Z','#E4C4B6');oval(c,Math.sin(t*.7)*12,-8,39,39,'#3C525D');oval(c,Math.sin(t*.7)*12,-8,20,20,'#14202A');oval(c,Math.sin(t*.7)*12-9,-20,7,7,'#F1DDD0');line(c,'M -120 -8 Q 0 -99 120 -8','#412C3B',4);c.restore();
}
function windowFrame(c:C){rect(c,0,0,43,H,'#19252F');rect(c,497,0,43,H,'#19252F');rect(c,0,119,W,16,'#19252F');rect(c,264,135,12,574,'#22313B');rect(c,0,707,W,15,'#19252F');}
function romance(c:C,t:number,u:number){
 city(c,t,true);glow(c,270,375,265,'rgba(221,140,111,.28)');
 character(c,145,482,1.27,t,'man','warm');character(c,395,482,1.27,t,'woman','warm',true);
 shape(c,'M 0 765 Q 270 693 540 765 V 960 H 0 Z','#1E2834');line(c,'M 175 700 Q 220 666 270 685 Q 319 665 366 700','#A77570',10);
}
function gaze(c:C,t:number,u:number){
 city(c,t,false);windowFrame(c);character(c,170,491,1.6,t,'man','neutral');
 // Reflection creates a second plane, not a depiction of real tracking tactics.
 c.save();c.globalAlpha=.28;character(c,390,472,1.14,t,'woman','neutral',true);c.restore();
 rect(c,0,0,540,960,grad(c,0,0,540,0,[[0,'rgba(13,20,30,.05)'],[.64,'rgba(13,20,30,.1)'],[1,'rgba(13,20,30,.48)']]));
 for(let i=0;i<7;i++)line(c,'M '+(50+i*65)+' 137 l -14 570','rgba(207,200,189,.065)',2);
}
function enclosure(c:C,t:number,u:number){
 rect(c,0,0,W,H,grad(c,0,0,0,H,[[0,'#182633'],[.50,'#70505C'],[1,'#202B38']]));
 glow(c,270,450,215,'rgba(194,97,102,.25)');character(c,255,488,1.48,t,'woman','uneasy');
 // Architectural bars close in as a symbolic image of lost space.
 const inset=26+ease(u)*63;rect(c,0,0,inset,H,'#17212D');rect(c,W-inset,0,inset,H,'#17212D');
 for(let i=0;i<4;i++){const x=inset+i*(W-2*inset)/3;rect(c,x-4,164,8,540,'rgba(20,30,42,.53)');}
 rect(c,inset,164,W-2*inset,10,'#273540');rect(c,inset,704,W-2*inset,10,'#273540');
}
function separation(c:C,t:number,u:number){
 rect(c,0,0,W,H,grad(c,0,0,W,H,[[0,'#1E2D3B'],[.52,'#384958'],[1,'#855861']]));
 glow(c,383,448,180,'rgba(216,130,114,.22)');character(c,105-ease(u)*13,460,1.18,t,'man','neutral',true);character(c,421+ease(u)*13,489,1.4,t,'woman','uneasy');
 shape(c,'M 231 0 L 308 0 L 325 960 L 244 960 Z','#121D29');line(c,'M 238 0 L 251 960','#705362',2);
}
function release(c:C,t:number,u:number){
 city(c,t,false);rect(c,0,0,540,960,grad(c,0,0,0,960,[[0,'rgba(18,33,45,.30)'],[.7,'rgba(21,34,46,0)'],[1,'rgba(13,23,34,.5)']]));
 // Open doorway, clear unobstructed space and the woman facing out.
 const a=ease(u);rect(c,52,134,435,589,'#15232E');rect(c,67,151,404,557,grad(c,0,151,0,708,[[0,'#566C78'],[.65,'#9D827B'],[1,'#CC9B7D']]));
 glow(c,365,466,164,'rgba(247,195,148,.33)');shape(c,'M 67 708 H 471 L 540 960 H 0 Z','#344651');character(c,236+a*37,500,1.25-a*.18,t,'woman','neutral');
 shape(c,'M 0 0 H 67 V 960 H 0 Z','#172633');shape(c,'M 471 0 H 540 V 960 H 471 Z','#172633');
}
export function renderBreathCover(c:C,w:number,h:number,s:OpenMotionScene){
 c.save();c.scale(w/W,h/H);rect(c,0,0,W,H,grad(c,0,0,0,H,[[0,'#192735'],[.45,'#503744'],[1,'#192735']]));glow(c,270,450,250,'rgba(200,88,91,.31)');heart(c,0,.35);finish(c);
 text(c,'THE SONG EXPLAINED  /  '+val(s,'episode','02'),270,177,15,'#D3A99A',650);
 val(s,'cover-title','EVERY BREATH|YOU TAKE').split('|').slice(0,2).forEach((v,i)=>text(c,v,270,223+i*48,48,PAPER,900));
 text(c,val(s,'cover-hook','Love or obsession?'),270,709,31,PAPER,750);text(c,val(s,'artist','THE POLICE · 1983'),270,750,16,'#D3A99A',650);c.restore();
}
export function renderBreathStory(c:C,w:number,h:number,s:OpenMotionScene,time:number){
 const t=Math.max(0,Math.min(s.durationSec,time)),u=t/Math.max(.01,s.durationSec),shot=val(s,'shot','breath-romance');
 if(val(s,'cover-title')&&t<.85){renderBreathCover(c,w,h,s);return;}
 c.save();c.scale(w/W,h/H);
 const mode=val(s,'camera','push'),z=mode==='pull'?1.09-.07*ease(u):mode==='track'?1.06:1.02+.06*ease(u);
 c.save();c.translate(270+(mode==='track'?Math.sin(u*Math.PI)*-8:0),480);c.scale(z,z);c.translate(-270,-480);
 if(shot==='breath-gaze')gaze(c,t,u);else if(shot==='breath-enclosure')enclosure(c,t,u);else if(shot==='breath-separation')separation(c,t,u);else if(shot==='breath-release')release(c,t,u);else romance(c,t,u);c.restore();finish(c);
 if(val(s,'cover-title')){c.globalAlpha=ease((t-.85)/.5)*(1-ease((t-3.5)/.9));text(c,val(s,'artist'),270,150,16,'#EAD0C3',600);c.globalAlpha=1;}
 if(shot==='breath-release'&&s.headline){c.globalAlpha=ease((u-.38)/.28);s.headline.split('|').slice(0,2).forEach((v,i)=>text(c,v,270,205+i*39,33,PAPER,800));c.globalAlpha=1;}
 c.restore();
}
