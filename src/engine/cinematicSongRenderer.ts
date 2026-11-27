import type { OpenMotionBrandKit, OpenMotionScene } from '../types/openmotion';
import { drawHeroFace, type FaceAngle } from './songHeroFace';
import { drawHeroCar } from './songHeroCar';
type C=CanvasRenderingContext2D;
const W=540,H=960;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const u=clamp(v);return u*u*(3-2*u);};
const mix=(a:number,b:number,u:number)=>a+(b-a)*u;
export const isCinematicSong=(s?:OpenMotionScene)=>!!s?.doodle?.extras?.includes('song-cinematic-v2');
const field=(s:OpenMotionScene,k:string,f='')=>s.doodle?.extras?.find(v=>v.startsWith(k+':'))?.slice(k.length+1)??f;
function box(c:C,x:number,y:number,w:number,h:number,color:string|CanvasGradient){c.fillStyle=color;c.fillRect(x,y,w,h);}
function shape(c:C,d:string,color:string|CanvasGradient){c.fillStyle=color;c.fill(new Path2D(d));}
function stroke(c:C,d:string,color:string,width=2){c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke(new Path2D(d));}
function oval(c:C,x:number,y:number,rx:number,ry:number,color:string|CanvasGradient){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();}
function grad(c:C,x1:number,y1:number,x2:number,y2:number,stops:[number,string][]):CanvasGradient{const g=c.createLinearGradient(x1,y1,x2,y2);stops.forEach(([a,b])=>g.addColorStop(a,b));return g;}
function glow(c:C,x:number,y:number,r:number,color:string){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');oval(c,x,y,r,r,g);}
function text(c:C,v:string,x:number,y:number,size:number,color='#F4E6D0',align:CanvasTextAlign='center',weight=700,max=440){
 c.font=weight+' '+size+'px system-ui, sans-serif';const f=Math.min(size,size*max/Math.max(1,c.measureText(v).width));c.font=weight+' '+f+'px system-ui, sans-serif';c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(v,x,y);
}
const noise=Array.from({length:1550},(_,i)=>[(i*137.507764)%W,(i*91.137)%H,i%7===0?2:1,i%3===0] as const);
function finish(c:C){
 const v=c.createRadialGradient(270,410,160,270,440,620);v.addColorStop(0,'rgba(7,12,20,0)');v.addColorStop(1,'rgba(7,12,20,.62)');box(c,0,0,W,H,v);
 c.globalAlpha=.13;for(const [x,y,r,d] of noise)box(c,x,y,r,r,d?'#E7C8A4':'#09141D');c.globalAlpha=1;
 // Reserved lower space for captions, without a card or visible border.
 box(c,0,615,W,345,grad(c,0,615,0,960,[[0,'rgba(7,12,20,0)'],[.52,'rgba(7,12,20,.43)'],[1,'rgba(7,12,20,.82)']]));
}
function city(c:C,t:number,warm=false){
 box(c,-80,-80,700,1100,grad(c,0,0,0,760,[[0,'#1B2C40'],[.45,'#60717A'],[.76,warm?'#D39A62':'#8F8B83'],[1,'#243744']]));
 glow(c,382,302,176,warm?'rgba(234,166,91,.42)':'rgba(217,180,132,.18)');
 for(let l=0;l<3;l++){const base=590+l*105,step=58+l*21,shift=t*(l+1)*1.5;for(let i=-2;i<12;i++){
  const x=i*step-shift,h=72+(i*i*31+l*47)%220;box(c,x,base-h,step-4,h,['#59656A','#394A56','#253541'][l]);
  if(l===1&&i%3===0){box(c,x+step*.62,base-h-34,8,34,'#394A56');}
  if(l>0)for(let y=base-h+14;y<base-12;y+=24)for(let j=11;j<step-10;j+=19)if((i*3+j+y)%5<2)box(c,x+j,y,7,9,l===2?'#A77A4E':'#8D8B75');
 }}
 box(c,-80,735,700,300,'#1A2935');stroke(c,'M -80 792 H 620','#53636A',2);
 const x=((t*68+60)%760)-110;glow(c,x+80,780,68,'rgba(244,164,76,.23)');box(c,x,773,76,15,'#2F3036');shape(c,'M '+x+' 773 l 16 -12 h 36 l 13 12 Z','#343B42');oval(c,x+14,790,8,8,'#111B24');oval(c,x+58,790,8,8,'#111B24');box(c,x+72,777,7,3,'#FFD29A');
}
// Recurring fictional narrator: short dark curls, warm brown skin, rust coat, brass earring.
// Same profile geometry across window, checkout, car and return. Pose, light and gaze are timed.
function portrait(c:C,x:number,y:number,s:number,t:number,pose:'look'|'work'|'drive'|'tired',light='warm',flip=false,hero=false,angle:FaceAngle='profile'){
 c.save();c.translate(x,y);c.scale(flip?-s:s,s);const bob=Math.sin(t*1.6)*1.7;c.translate(0,bob);
 const skin=light==='cold'?'#9A756A':'#B98969',lit=light==='cold'?'#C19B86':'#DAB28A',shadow=light==='cold'?'#62545B':'#865944';
 const hair='#222631',coat=light==='cold'?'#765151':'#A85C43';
 // Neck, shoulder, coat, fold highlights.
 shape(c,'M -30 20 Q -37 70 -51 83 L 12 103 L 48 68 Q 27 58 20 20 Z',shadow);
 shape(c,'M -51 69 Q -105 76 -138 122 L -158 276 L 135 276 L 111 123 Q 79 79 37 66 L 6 104 Z',grad(c,-100,84,108,240,[[0,coat],[.63,light==='cold'?'#51414B':'#794134'],[1,'#282A35']]));
 shape(c,'M -51 69 L 6 104 L -15 146 L -64 96 Z',light==='cold'?'#8D6260':'#C27654');shape(c,'M 37 66 L 6 104 L 37 136 L 59 89 Z',coat);
 stroke(c,'M -75 123 Q -58 176 -71 258 M 71 135 Q 86 191 91 267','#49343A',3);
 if(hero){drawHeroFace(c,t,pose,light,angle);}else{
 // Swept silhouette, asymmetric curls, brow, nose, jaw and rim light.
 shape(c,'M -75 -30 Q -91 -95 -49 -134 Q -11 -161 36 -138 Q 74 -119 71 -69 L 80 -42 L 101 -12 Q 104 -5 89 2 L 82 5 L 79 34 Q 68 61 36 61 L 2 43 Q -33 42 -56 17 Z',skin);
 shape(c,'M 25 -124 Q 60 -109 66 -72 L 76 -42 L 97 -12 L 82 -8 L 74 28 Q 64 48 43 54 L 13 42 Q 53 24 48 -8 Z',lit);
 shape(c,'M -79 -12 Q -98 -50 -84 -104 Q -75 -143 -36 -151 Q 9 -177 48 -145 Q 76 -132 77 -94 Q 47 -113 15 -99 Q -12 -72 -17 -28 Q -27 -1 -43 25 L -65 41 Z',hair);
 for(let i=0;i<15;i++){const a=2.75+i*.235;oval(c,-17+Math.cos(a)*68,-78+Math.sin(a)*67,17+(i%3)*3,19+(i%2)*3,hair);}
 stroke(c,'M -69 -102 Q -47 -141 -7 -145 M -59 -84 Q -40 -121 2 -129 M -45 -60 Q -29 -101 11 -110','#45434A',2.4);
 oval(c,-13,-2,16,24,skin);stroke(c,'M -17 -15 Q -1 -9 -12 7',shadow,3);oval(c,-8,17,5,7,'#C69B64');
 const blink=Math.abs(Math.sin(t*.63+1.3))>.996;const eyeY=pose==='tired'?-24:-28;
 stroke(c,'M 39 -45 Q 54 -51 66 -43',hair,3.8);
 stroke(c,blink?'M 44 -26 L 63 -25':'M 44 '+eyeY+' Q 55 '+(eyeY-8)+' 65 '+eyeY,hair,2.4);
 if(!blink)oval(c,58,eyeY+1,2.8,3.5,hair);
 stroke(c,'M 79 16 Q 70 '+(pose==='drive'?12:19)+' 60 17','#65424A',2.5);
 stroke(c,'M 72 35 Q 58 46 37 46',shadow,2);
 }
 if(pose==='work'){const a=Math.sin(t*2.7)*11;stroke(c,'M -86 137 Q -66 182 -12 '+(207+a)+' L 49 '+(210+a),coat,33);stroke(c,'M 45 '+(210+a)+' L 76 '+(204+a),skin,13);}
 if(pose==='tired'){stroke(c,'M -85 141 Q -68 202 8 215 L 47 172',coat,32);stroke(c,'M 47 172 Q 66 137 72 105',skin,13);}
 if(pose==='drive'){stroke(c,'M 76 136 Q 114 154 153 198',coat,32);stroke(c,'M 153 198 L 178 195',skin,13);}
 c.restore();
}
function windowShot(c:C,t:number,u:number,late=false,hero=false){
 c.save();c.translate(-u*16,0);city(c,t,false);c.restore();
 // Window panes, worn wall and a strong foreground silhouette.
 shape(c,'M -40 -40 H 86 V 735 H -40 Z','#222C36');box(c,465,-30,105,820,'#26313C');box(c,76,90,410,20,'#253541');box(c,263,104,13,580,'#293943');box(c,79,677,411,23,'#202D39');
 for(let i=0;i<9;i++)stroke(c,'M '+(82+i*41)+' 112 l 12 560','rgba(211,216,206,.055)',2);
 shape(c,'M -25 0 H 112 L 72 250 L 91 510 L 47 810 H -25 Z',grad(c,0,0,115,600,[[0,'#24313D'],[1,'#101D2A']]));
 box(c,0,700,540,260,grad(c,0,700,0,960,[[0,'#343C44'],[1,'#121E2A']]));
 if(!late){portrait(c,165,475,1.42,t,'look','cold',false,hero,'profile');shape(c,'M -20 720 Q 175 669 380 730 L 600 960 H -20Z','#1C2732');}
 else{
  // Window motif repeats. The empty chair and bills suggest the story rather than a new character.
  box(c,362,517,130,12,'#8C6F58');box(c,370,535,9,180,'#3B3439');box(c,472,535,9,180,'#3B3439');
  stroke(c,'M 423 547 V 683 M 480 547 V 683 M 423 554 H 480','#65574F',10);
  glow(c,421,427,174,'rgba(234,166,91,.23)');shape(c,'M 376 389 H 466 L 480 438 H 360 Z','#A88155');stroke(c,'M 420 438 V 518','#9B7C58',5);
  portrait(c,145,510,1.25,t,'tired','cold',false,hero,'near-front');shape(c,'M -15 714 L 540 620 L 580 960 H -20 Z',grad(c,0,635,0,960,[[0,'#62524A'],[1,'#262A33']]));
  shape(c,'M 250 714 L 367 693 L 402 744 L 281 770 Z','#AA9C82');stroke(c,'M 275 727 L 350 714 M 283 739 L 368 724 M 291 751 L 345 741','#736B64',2);
  oval(c,405,676,25,11,'#232F3B');box(c,383,638,44,38,'#87705F');oval(c,405,638,22,9,'#BA9A76');stroke(c,'M 427 645 Q 450 641 442 663 L 428 666','#87705F',5);
 }
}
function clock(c:C,x:number,y:number,r:number,t:number){oval(c,x,y,r+6,r+6,'#29343B');oval(c,x,y,r,r,'#B3AA92');for(let i=0;i<12;i++){const a=i*Math.PI/6;stroke(c,'M '+(x+Math.sin(a)*(r-9))+' '+(y-Math.cos(a)*(r-9))+' L '+(x+Math.sin(a)*(r-3))+' '+(y-Math.cos(a)*(r-3)),'#4B4A47',2);}const a=t*.3+.8;stroke(c,'M '+x+' '+y+' L '+(x+Math.sin(a)*r*.72)+' '+(y-Math.cos(a)*r*.72),'#282F36',3);stroke(c,'M '+x+' '+y+' L '+(x-r*.36)+' '+(y-r*.28),'#282F36',5);oval(c,x,y,4,4,'#A65E48');}
function store(c:C,t:number,u:number,hero=false){
 box(c,0,0,540,960,grad(c,0,0,0,960,[[0,'#39454C'],[.55,'#73756C'],[1,'#222C35']]));
 for(let i=0;i<3;i++){const y=205+i*137;box(c,-15,y+88,570,11,'#2D383F');for(let j=0;j<12;j++){const h=32+(j*17+i*23)%45;box(c,j*46+3,y+88-h,32,h,['#807F68','#9B775D','#697A78','#A59D83'][j%4]);box(c,j*46+7,y+93-h,24,8,'#B1A58B');}}
 shape(c,'M 0 0 H 540 V 115 L 380 164 H 170 L 0 105 Z','#2A353D');box(c,60,67,420,12,'#CAC7AB');glow(c,270,83,212,'rgba(233,224,182,.18)');
 clock(c,375,180,48,t);
 portrait(c,185,470,1.48,t,'work','cold',false,hero,'three-quarter');
 shape(c,'M -25 720 L 540 654 L 580 960 H -25 Z',grad(c,0,640,0,960,[[0,'#77736B'],[1,'#26313B']]));stroke(c,'M -20 720 L 560 652','#A99D84',4);
 shape(c,'M 365 551 L 498 567 L 482 663 L 355 647 Z','#303A41');shape(c,'M 375 564 L 487 575 L 476 620 L 366 609 Z','#647B78');box(c,385,642,69,13,'#232C34');
 const q=(t*28)%120;shape(c,'M '+(87+q)+' 699 l 42 -5 16 24 -49 8 Z','#A98A60');
 if(u>.84){const a=ease((u-.84)/.16);c.globalAlpha=a;box(c,0,0,W,H,'#19242E');clock(c,270,370,120,t);c.globalAlpha=1;}
}
function landscape(c:C,t:number,warm:boolean){
 box(c,0,0,W,H,grad(c,0,0,0,H,[[0,warm?'#4D555F':'#172737'],[.35,warm?'#C57951':'#405466'],[.52,warm?'#E7AD69':'#795E60'],[.75,'#293844'],[1,'#17232F']]));
 glow(c,270,370,warm?190:92,warm?'rgba(255,199,112,.58)':'rgba(217,143,89,.20)');oval(c,270,370,warm?69:24,warm?69:24,warm?'#F0BF79':'#B27C64');
 shape(c,'M -40 510 L 66 391 158 461 243 419 339 489 432 387 580 492 V 650 H -40Z',warm?'#826659':'#3A4B5A');
 shape(c,'M -40 591 L 100 495 195 524 270 492 399 530 580 477 V 790 H -40 Z',warm?'#756650':'#253B46');
 shape(c,'M 242 510 H 298 L 620 960 H -80 Z',warm?'#434348':'#222F3B');
 stroke(c,'M 242 510 L -60 960 M 298 510 L 600 960',warm?'#C4A37B':'#5A6570',3);
 for(let i=0;i<9;i++){let z=(i/9+t*.24)%1,y=513+z*z*445,dy=2+z*38;shape(c,'M '+(270-z*5)+' '+y+' L '+(270+z*5)+' '+y+' L '+(270+z*7)+' '+(y+dy)+' L '+(270-z*7)+' '+(y+dy)+' Z',warm?'#DFC08C':'#8D8A7F');}
 for(let i=0;i<8;i++){const z=(i/8+t*.13)%1,y=515+z*z*320,x=270+(i%2?-1:1)*(70+z*270),sz=2+z*7;stroke(c,'M '+x+' '+y+' v '+(-sz*6),warm?'#544A40':'#23313B',sz);stroke(c,'M '+(x-sz*3)+' '+(y-sz*5)+' h '+(sz*6),warm?'#544A40':'#23313B',2);}
}
function rearCar(c:C,x:number,y:number,s:number,t:number){c.save();c.translate(x,y+Math.sin(t*3)*1.1);c.scale(s,s);oval(c,0,30,106,17,'rgba(5,12,20,.55)');shape(c,'M -100 0 L -77 -43 Q -68 -55 -48 -58 H 48 Q 65 -56 78 -42 L 100 0 L 93 29 H -93 Z','#5F3939');shape(c,'M -65 -39 Q -56 -48 -44 -48 H 44 Q 55 -48 65 -39 L 74 -13 H -74 Z','#27343D');stroke(c,'M -80 -7 H 80 M -84 19 H 84','#A6795E',3);box(c,-90,26,23,17,'#121D28');box(c,67,26,23,17,'#121D28');glow(c,-75,4,31,'rgba(248,94,66,.42)');glow(c,75,4,31,'rgba(248,94,66,.42)');box(c,-87,-2,30,10,'#E87958');box(c,57,-2,30,10,'#E87958');box(c,-14,9,28,12,'#B5A78B');c.restore();}
function drive(c:C,t:number,u:number,hero=false){
 landscape(c,t,true);
 // Windshield reflection, dashboard, passing lights; protagonist is now in the passenger seat.
 shape(c,'M 0 0 H 540 V 68 L 470 126 H 62 L 0 98 Z','#202A34');
 shape(c,'M 0 0 L 112 112 L 143 633 L 66 754 H 0 Z','#202A34');shape(c,'M 540 0 L 457 120 L 416 644 L 540 775 Z','#27313A');
 shape(c,'M 0 735 Q 270 620 540 735 V 960 H 0 Z','#273039');
 stroke(c,'M 0 745 Q 270 662 540 745','#8B6854',5);
 oval(c,107,684,85,81,'#1B252E');oval(c,107,684,64,61,'#424044');stroke(c,'M 43 687 H 171 M 107 685 V 744','#1B252E',13);
 // Side profile faces the sunset. Same hair, coat and earring.
 portrait(c,404,445,1.5,t,'drive','warm',true,hero,'three-quarter');
 shape(c,'M 444 730 Q 492 648 540 620 V 960 H 365 Z','#24303B');
 for(let i=0;i<5;i++){const z=(t*.19+i/5)%1;stroke(c,'M '+(485-z*110)+' '+(180+z*120)+' l -65 90','rgba(250,203,136,.10)',6);}
 // A short exterior tracking shot reveals the same sedan in three dimensions.
 if(hero&&t>=1.05&&t<3.65){
  c.save();c.globalAlpha=ease((t-1.05)/.24)*(1-ease((t-3.32)/.33));
  // Isolate the whole shot in an opaque background; transition is a motivated cut,
  // not a transparent car overlay on the dashboard.
  if(t>1.17&&t<3.48)c.globalAlpha=1;
  landscape(c,t,true);
  drawHeroCar(c,270+Math.sin((t-1.05)*1.1)*12,655,.97,t,.63+.15*ease((t-1.05)/2.6),true);
  c.restore();
 }
 if(u<.13){c.globalAlpha=1-ease(u/.13);box(c,0,0,W,H,'#19242E');oval(c,270,370,126,126,'#BCA477');oval(c,270,370,104,104,'#333B43');for(let i=0;i<5;i++){let a=t*3+i*2*Math.PI/5;stroke(c,'M 270 370 L '+(270+Math.cos(a)*97)+' '+(370+Math.sin(a)*97),'#BCA477',10);}oval(c,270,370,19,19,'#BCA477');c.globalAlpha=1;}
}
function finalRoad(c:C,t:number,u:number,hero=false){landscape(c,t,false);if(hero)drawHeroCar(c,270,mix(700,539,ease(u)),mix(.86,.12,ease(u)),t,mix(.48,.08,ease(u)),false);else rearCar(c,270, mix(700,539,ease(u)),mix(.86,.12,ease(u)),t);if(u>.65){const a=ease((u-.65)/.35);c.globalAlpha=a*.30;shape(c,'M 0 0 H 540 V 960 H 0Z','#172534');c.globalAlpha=1;}}
function sceneArt(c:C,shot:string,t:number,u:number,mode:string,hero=false){
 // Overscan prevents blank edges during camera motion. All transforms derive from time.
 const z=mode==='pull'?mix(1.13,1.02,ease(u)):mode==='track'?1.06:mix(1.02,1.09,ease(u));
 c.save();c.translate(270+(mode==='track'?Math.sin(u*Math.PI)*-8:0),480);c.scale(z,z);c.translate(-270,-480);
 if(shot==='shop')store(c,t,u,hero);else if(shot==='drive')drive(c,t,u,hero);else if(shot==='return')windowShot(c,t,u,true,hero);else if(shot==='reflection')finalRoad(c,t,u,hero);else if(shot==='road'||shot==='night'){landscape(c,t,shot==='road');if(hero)drawHeroCar(c,270,645,.64,t,.58,shot==='road');else rearCar(c,270,645,.64,t);}else if(shot==='symbol'){landscape(c,t,false);oval(c,270,370,135,135,'#202932');oval(c,270,370,50,50,'#A76C50');oval(c,270,370,6,6,'#D6BA95');}else windowShot(c,t,u,false,hero);
 c.restore();
}
export function renderCinematicSongCover(c:C,w:number,h:number,s:OpenMotionScene,_b:OpenMotionBrandKit){
 const hero=!!s.doodle?.extras?.includes('song-hero-rigs-v21');
 c.save();c.scale(w/W,h/H);landscape(c,0,true);if(hero){portrait(c,130,450,1.29,0,'look','warm',false,true,'three-quarter');drawHeroCar(c,345,655,.76,0,.68,true);}else{rearCar(c,264,659,.83,0);portrait(c,139,446,1.37,0,'look','warm');}finish(c);
 box(c,0,0,W,340,grad(c,0,0,0,340,[[0,'rgba(11,19,29,.92)'],[1,'rgba(11,19,29,0)']]));
 text(c,'THE SONG EXPLAINED  /  '+field(s,'episode','01'),270,223,15,'#D4A574','center',650);
 const titles=field(s,'cover-title','FAST CAR').split('|').slice(0,2);titles.forEach((v,i)=>text(c,v,270,278+i*55,66,'#F9E8CD','center',900,446));
 text(c,field(s,'cover-hook','More than a car.'),270,708,28,'#F9E8CD','center',750);
 text(c,field(s,'artist',''),270,750,16,'#DEB58A','center',650);
 c.restore();
}
export function renderCinematicSong(c:C,w:number,h:number,s:OpenMotionScene,time:number,b:OpenMotionBrandKit){
 const t=Math.max(0,Math.min(s.durationSec,time)),u=t/Math.max(.01,s.durationSec),shot=field(s,'shot','longing');
 const cover=!!field(s,'cover-title');if(cover&&t<.85){renderCinematicSongCover(c,w,h,s,b);return;}
 c.save();c.scale(w/W,h/H);sceneArt(c,shot,t,u,field(s,'camera','push'),!!s.doodle?.extras?.includes('song-hero-rigs-v21'));finish(c);
 // Restrained typography. No repeated title card. Caption renderer handles narration.
 if(cover){const a=ease((t-.85)/.55)*(1-ease((t-3.5)/.9));c.globalAlpha=a;text(c,field(s,'artist',''),270,153,16,'#EAD0AA','center',600);c.globalAlpha=1;}
 if(shot==='reflection'&&s.headline){const a=ease((u-.40)/.22);c.globalAlpha=a;s.headline.split('|').slice(0,2).forEach((v,i)=>text(c,v,270,218+i*41,34,'#F5E6CD','center',800));c.globalAlpha=1;}
 if(shot==='return'&&u<.1){c.globalAlpha=(1-ease(u/.1))*.42;box(c,0,0,W,H,'#141F2B');c.globalAlpha=1;}
 c.restore();
}
