import type { OpenMotionScene } from '../types/openmotion';
const INK='#302823', SKIN='#F8EBDD', HAIR='#864825', RED='#DB5D50', GOLD='#E4B54B';
const W=512,H=910;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const u=clamp(n);return u*u*(3-2*u);};
function stroke(c:CanvasRenderingContext2D,w=4,color=INK){c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';}
function path(c:CanvasRenderingContext2D,draw:()=>void,fill?:string,w=4,color=INK){c.beginPath();draw();if(fill){c.fillStyle=fill;c.fill();}if(w){stroke(c,w,color);c.stroke();}}
function oval(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string,w=4){path(c,()=>c.ellipse(x,y,rx,ry,0,0,Math.PI*2),fill,w);}
function line(c:CanvasRenderingContext2D,a:number[],w=4,color=INK){path(c,()=>{c.moveTo(a[0],a[1]);for(let i=2;i<a.length;i+=2)c.lineTo(a[i],a[i+1]);},undefined,w,color);}
function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,fill:string,l=4){path(c,()=>c.roundRect(x,y,w,h,r),fill,l);}
function txt(c:CanvasRenderingContext2D,s:string,x:number,y:number,z=25,color=INK){c.font='700 '+z+'px Kalam, "Comic Sans MS", cursive';c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(s,x,y);}
function withTransform(c:CanvasRenderingContext2D,x:number,y:number,s:number,fn:()=>void,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);fn();c.restore();}
function star(c:CanvasRenderingContext2D,x:number,y:number,r:number,fill=GOLD){path(c,()=>{for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,d=i%2?r*.45:r;const xx=x+Math.cos(a)*d,yy=y+Math.sin(a)*d;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.closePath();},fill,2.7);}
function heart(c:CanvasRenderingContext2D,x:number,y:number,s:number){withTransform(c,x,y,s,()=>path(c,()=>{c.moveTo(0,11);c.bezierCurveTo(-27,-6,-12,-23,0,-9);c.bezierCurveTo(12,-23,27,-6,0,11);c.closePath();},'#D86962',2));}
function girl(c:CanvasRenderingContext2D,x:number,y:number,s:number,mood:string,pose:string,t:number,shirt=RED,male=false){withTransform(c,x,y,s,()=>{
 const a=pose==='alert', p=pose==='point', up=pose==='relieved', tired=pose==='exhausted';
 const rx=p?124:a?105:up?108:101, ry=p?-116:a?-150:up?-155:tired?101:66;
 const lx=a?-107:up?-108:-101,ly=a?-150:up?-155:82;
 line(c,[-23,75,-26,133,-31,160,-48,160],8);line(c,[24,75,27,133,28,160,47,160],8);
 if(!male)path(c,()=>{c.moveTo(44,-181);c.bezierCurveTo(124,-190,127,-98,69,-50);c.bezierCurveTo(84,-105,73,-140,40,-155);c.closePath();},HAIR,8);
 path(c,()=>{c.moveTo(-57,-36);c.quadraticCurveTo(-80,5,lx,ly);c.moveTo(57,-36);c.quadraticCurveTo(100,ry+65,rx,ry);},undefined,8);
 path(c,()=>{c.moveTo(-1,-77);c.bezierCurveTo(-105,-75,-104,82,-2,84);c.bezierCurveTo(99,86,104,-72,-1,-77);c.closePath();},shirt,8);
 c.save();c.beginPath();c.ellipse(0,1,76,77,0,0,Math.PI*2);c.clip();
 for(const yy of [-27,24])path(c,()=>{c.moveTo(-83,yy);c.quadraticCurveTo(0,yy+16,84,yy);},undefined,13,male?'#E9CA64':'#F4A59A');c.restore();
 path(c,()=>{c.moveTo(-57,-169);c.bezierCurveTo(-94,-124,-55,-63,1,-63);c.bezierCurveTo(61,-66,91,-126,58,-170);c.quadraticCurveTo(0,-203,-57,-169);c.closePath();},SKIN,8);
 path(c,()=>{c.moveTo(-67,-143);c.bezierCurveTo(-89,-192,-54,-211,0,-210);c.bezierCurveTo(55,-210,84,-191,70,-149);c.quadraticCurveTo(52,-179,24,-177);c.quadraticCurveTo(-10,-159,-42,-177);c.quadraticCurveTo(-60,-169,-67,-143);c.closePath();},male?'#513A28':HAIR,7);
 const closed=mood==='relaxed'||mood==='sleepy'||(mood==='happy'&&up)||(t%4.6>4.45);
 const worried=mood==='worried'||mood==='overwhelmed';
 for(const xx of [-25,25]){
 if(closed)path(c,()=>{c.moveTo(xx-12,-133);c.quadraticCurveTo(xx,-121,xx+12,-133);},undefined,5);
 else{oval(c,xx,-131,14,15,'#fffaf3',4.8);oval(c,xx+1,-131,7,8,INK,0);oval(c,xx+3,-134,2.7,3,'#fff',0);}
 oval(c,xx*1.75,-105,11,7,'#E9A095',0);
 if(worried)line(c,[xx-13,-152,xx+12,-157],4);
 }
 if(mood==='surprised'||mood==='overwhelmed')oval(c,0,-94,8,10,'#9B5449',4);
 else path(c,()=>{c.moveTo(-18,-98);c.quadraticCurveTo(0,worried?-113:-77,18,-98);},undefined,5);
 oval(c,lx,ly,13,14,SKIN,6);oval(c,rx,ry,13,14,SKIN,6);
 });}
function trophy(c:CanvasRenderingContext2D,x:number,y:number,s:number){withTransform(c,x,y,s,()=>{for(const k of [-1,1])path(c,()=>{c.moveTo(k*37,-31);c.quadraticCurveTo(k*71,-41,k*56,2);c.lineTo(k*25,18);},undefined,5);path(c,()=>{c.moveTo(-43,-44);c.lineTo(43,-44);c.quadraticCurveTo(44,15,0,28);c.quadraticCurveTo(-43,15,-43,-44);c.closePath();},GOLD,5);rect(c,-8,26,16,40,2,GOLD,4);rect(c,-34,60,68,14,4,GOLD,4);star(c,0,-10,15,'#F6E5A0');});}
function bubble(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,s=''){oval(c,x,y,rx,ry,'#FCFAF6',3);if(s)txt(c,s,x,y,20);}
function clock(c:CanvasRenderingContext2D,x:number,y:number,t:number){oval(c,x,y,88,88,'#FAF9F5',5);for(let i=0;i<12;i++){const a=i*Math.PI/6;line(c,[x+Math.sin(a)*71,y-Math.cos(a)*71,x+Math.sin(a)*80,y-Math.cos(a)*80],2.5);}const a=-Math.PI/2+Math.min(t,1.3)*.5;line(c,[x+Math.cos(a)*58,y+Math.sin(a)*58,x,y,x-45,y],4);line(c,[x,y,x+Math.sin(t*.65)*68,y-Math.cos(t*.65)*68],2.5,'#CC6257');}
function balance(c:CanvasRenderingContext2D,x:number,y:number,tilt:number){line(c,[x,y,x,y+125],5);line(c,[x-42,y+125,x+42,y+125],5);withTransform(c,x,y,1,()=>{line(c,[-112,0,112,0],5);for(const k of [-1,1]){line(c,[k*100,0,k*100-30,72,k*100+30,72,k*100,0],2.8);path(c,()=>{c.moveTo(k*100-39,72);c.quadraticCurveTo(k*100,109,k*100+39,72);c.closePath();},'#E8CB78',3);}},tilt);oval(c,x,y,8,8,GOLD,3);}
function phone(c:CanvasRenderingContext2D,x:number,y:number,s:number,apps=false,selected=false){withTransform(c,x,y,s,()=>{rect(c,-48,-90,96,180,10,'#FDFCF8',6);line(c,[-17,-79,17,-79],3);if(apps){const colors=['#D86A5D','#5BA9A0','#DDB74C','#7A9FC9','#BCA1CD','#79B68A','#E8A899','#E0BA63','#69A5AE'];const icons=['♡','✚','♫','⌂','☾','$','◎','✿','✧'];for(let i=0;i<9;i++){const xx=-31+(i%3)*31,yy=-50+Math.floor(i/3)*34;rect(c,xx-12,yy-12,25,25,5,colors[i],1.7);txt(c,icons[i],xx,yy,17);}if(selected){rect(c,-40,-63,45,45,8,'#D86A5D',2);txt(c,'♡',-17,-41,27);}}else{for(let i=0;i<4;i++)line(c,[-34,-47+i*23,33,-47+i*23],2,'#D5D4CE');}});}
function squirrel(c:CanvasRenderingContext2D,x:number,y:number,s:number,t:number){withTransform(c,x,y,s,()=>{path(c,()=>{c.moveTo(7,5);c.bezierCurveTo(42,21,47,-31,17,-37);c.bezierCurveTo(38,-8,9,-2,7,5);c.closePath();},'#A45E33',2.4);oval(c,0,4,15,14,'#B96F3D',2);oval(c,-13,-9,11,10,'#B96F3D',2);oval(c,-16,-19,4,6,'#B96F3D',1.5);oval(c,-18,-11,2,2,INK,0);line(c,[-9,15,-17,21,1,21],2);},Math.sin(t*7)*.12);}
function battery(c:CanvasRenderingContext2D,x:number,y:number,p:number){rect(c,x-48,y-21,96,42,5,'#FAFAF7',4);rect(c,x+49,y-8,6,16,2,INK,0);for(let i=0;i<5;i++)if(i<p*5)rect(c,x-42+i*17,y-14,13,28,1,'#75A67B',0);}
function rocket(c:CanvasRenderingContext2D,x:number,y:number){withTransform(c,x,y,1,()=>{path(c,()=>{c.moveTo(0,-90);c.quadraticCurveTo(55,-22,20,35);c.lineTo(-20,35);c.quadraticCurveTo(-52,-22,0,-90);c.closePath();},'#FFFDF8',4);oval(c,0,-26,10,13,'#97C1D5',3);for(const k of [-1,1])path(c,()=>{c.moveTo(k*25,0);c.lineTo(k*45,53);c.lineTo(k*17,36);c.closePath();},RED,3);path(c,()=>{c.moveTo(-13,39);c.quadraticCurveTo(-33,74,0,110);c.quadraticCurveTo(32,75,13,39);c.closePath();},GOLD,3);},-.16);}
function meter(c:CanvasRenderingContext2D,x:number,y:number,p:number){txt(c,'dopamine',x,y-41,22);rect(c,x-130,y-19,260,38,19,'#FAF9F4',4);if(p>.01)rect(c,x-122,y-11,244*p,22,11,GOLD,0);}
function table(c:CanvasRenderingContext2D,x:number,y:number){line(c,[x-74,y,x+74,y],6);line(c,[x-54,y,x-65,y+95],5);line(c,[x+54,y,x+65,y+95],5);}
function caption(c:CanvasRenderingContext2D,s:OpenMotionScene,t:number){const d=s.doodle!;const size=s.headline.length<16?43:35;c.font='700 '+size+'px Kalam, "Comic Sans MS", cursive';c.textAlign='left';c.textBaseline='middle';const words=s.headline.split(/\s+/),rows:string[][]=[];let row:string[]=[];for(const w of words){if(row.length&&c.measureText([...row,w].join(' ')).width>454){rows.push(row);row=[];}row.push(w);}if(row.length)rows.push(row);let i=0;const step=Math.min(.22,(s.durationSec*.7)/words.length);for(let j=0;j<rows.length;j++){let x=(W-c.measureText(rows[j].join(' ')).width)/2;for(const w of rows[j]){c.globalAlpha=smooth((t-i*step+.06)/.15);c.fillStyle=(d.emphasis??[]).some(e=>w.toLowerCase().replace(/[,.!?]/g,'')===e.toLowerCase())?d.highlightColor??RED:INK;c.fillText(w,x,132+j*39);x+=c.measureText(w+' ').width;i++;}}c.globalAlpha=1;}
const grain=Array.from({length:15000},(_,i)=>{let k=Math.imul(i+1,2654435761)>>>0;return [k%512,(k>>>9)%910,((k>>>19)%5)/150]});
const paperCache=new Map<string,HTMLCanvasElement>();
function paper(c:CanvasRenderingContext2D,bg:string){let layer=paperCache.get(bg);if(!layer){layer=document.createElement('canvas');layer.width=W;layer.height=H;const p=layer.getContext('2d');if(!p){c.fillStyle=bg;c.fillRect(0,0,W,H);return;}p.fillStyle=bg;p.fillRect(0,0,W,H);for(const [x,y,a] of grain){p.fillStyle='rgba(67,53,41,'+a+')';p.fillRect(x,y,1.3,1.3);}paperCache.set(bg,layer);}c.drawImage(layer,0,0);}
export function renderAdhdExperience(c:CanvasRenderingContext2D,w:number,h:number,s:OpenMotionScene,t:number){const d=s.doodle!;const prop=d.extras?.[1]??'intro';const bg=prop==='anger'?'#E6C3B7':d.palette==='shower'?'#C4C8D1':d.palette==='morning'?'#E9D4BF':'#E5E1D7';c.save();c.scale(w/W,h/H);paper(c,bg);
const mood=d.mood,shirt=d.shirtColor??RED;const g=(x=256,y=620,z=1,pose=d.pose??'neutral')=>girl(c,x,y,z,mood,pose,t,shirt);
switch(prop){
case 'intro':g(256,620,1,'point');break;
case 'trophy':g(256,620,.73,mood==='relaxed'?'point':'alert');trophy(c,mood==='relaxed'?337:256,371,.77);if(mood==='surprised')for(let i=0;i<9;i++){const a=i*2.4;star(c,256+Math.cos(a)*(98+i*4),565+Math.sin(a)*150,5,'#E6BF72');}break;
case 'relief':g(185,620,.77,'neutral');trophy(c,407,655,.85);bubble(c,385,390,69,37,'Pff...');break;
case 'star':case 'messages':g(prop==='star'?204:333,620,.77,'point');if(prop==='star'){star(c,405,480,49);for(let i=0;i<9;i++){let a=i*Math.PI*2/9;line(c,[405+Math.cos(a)*63,480+Math.sin(a)*63,405+Math.cos(a)*83,480+Math.sin(a)*83],2,'#DFC47B');}}else{withTransform(c,94,660,.85,()=>phone(c,0,0,1),-.19);bubble(c,132,515,67,25,'hallo?');bubble(c,176,457,74,26,'bel je nog?');bubble(c,93,400,57,25,'???');}for(let i=0;i<3;i++)heart(c,140+i*82,385-(i%2)*36+Math.sin(t*2+i)*4,.7);break;
case 'clock':g(118,646,.70,'neutral');clock(c,352,520,t);rect(c,291,645,124,65,1,GOLD,4);txt(c,d.clockText??'18:00',353,677,31);break;
case 'justice':case 'anger':g(prop==='anger'?197:256,644,.78,prop==='anger'?'alert':'point');balance(c,256,369,prop==='anger'?-.18:0);if(prop==='anger'){rect(c,410,662,68,100,32,'#9B9DA9',3);txt(c,'• •',444,703,20);for(let i=0;i<4;i++)line(c,[110+i*65,500,101+i*65,482,126+i*65,475],3,'#B86B56');}break;
case 'close':g(256,618,1.12,'neutral');break;
case 'diagnosis':case 'squirrels':g(251,675,.72,'neutral');bubble(c,255,383,195,79);oval(c,182,483,11,10,'#FCFAF6',2);oval(c,199,516,6,6,'#FCFAF6',2);if(prop==='diagnosis'){squirrel(c,253,384,.48,t);rect(c,376,580,83,110,5,'#F9FAF6',3);txt(c,'ADHD',418,611,20);txt(c,'✓',418,656,34,'#76A77F');}else for(let i=0;i<5;i++){const a=i*2*Math.PI/5+t*.8;squirrel(c,255+Math.cos(a)*142,383+Math.sin(a)*43,.85,t+i);}break;
case 'talk':g(121,651,.69,'neutral');girl(c,374,651,.69,'happy','point',t,'#449A9C',true);bubble(c,299,388,168,55);txt(c, t<.65?'Nou...':t<1.2?'Nou... dus...':'Nou... dus... weet',299,388,20);break;
case 'rocket':g(277,624,.83,'point');rocket(c,160,627);for(let i=0;i<3;i++){const y=420+i*65-Math.sin(t*2+i)*14;line(c,[390+i%2*50,y+33,390+i%2*50,y,380+i%2*50,y+11,390+i%2*50,y,400+i%2*50,y+11],3,'#DFBE7F');}break;
case 'battery':case 'empty':g(242,653,.67,'neutral');rocket(c,154,673);for(let i=0;i<(prop==='empty'?4:2);i++){rect(c,212,466-i*30,75,28,2,'#C6A37C',3);line(c,[248,467-i*30,248,491-i*30],1.5);}battery(c,418,582,prop==='empty'?0:1);break;
case 'call':case 'missed':case 'low':g(prop==='call'?226:168,650,.77,prop==='call'?'point':'neutral');meter(c,256,318,prop==='low' ? .03 : 1);if(prop==='call'){withTransform(c,339,505,.54,()=>phone(c,0,0,1),-.15);heart(c,117,444,.8);}else{table(c,382,711);withTransform(c,382,651,.46,()=>phone(c,0,0,1),prop==='missed'?Math.sin(t*18)*.045:0);}break;
case 'search':g(125,650,.76,'neutral');oval(c,112,365,28,35,'#F2D278',3);txt(c,'?',112,369,35,'#C76A54');rect(c,177,440,370,64,30,'#FAF9F5',4);oval(c,214,470,13,13,'#FAF9F5',3);line(c,[223,480,237,494],3);break;
case 'apps':case 'distract':g(117,665,.73,'point');phone(c,352,578,2.2,true,prop==='distract');if(prop==='apps')txt(c,'?',115,398,40);else for(let i=0;i<3;i++)heart(c,266+i*75,357+Math.sin(t*2+i)*12,.75);break;
default:g();
}caption(c,s,t);c.restore();}
