// Original recurring character. Profile and two three-quarter variants share
// hair, skin palette, cheek structure and earring. Expressions are time sampled.
type C=CanvasRenderingContext2D;
export type HeroPose='look'|'work'|'drive'|'tired';
export type FaceAngle='profile'|'three-quarter'|'near-front';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
function fill(c:C,d:string,col:string|CanvasGradient){c.fillStyle=col;c.fill(new Path2D(d));}
function line(c:C,d:string,col:string,w=2){c.strokeStyle=col;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.stroke(new Path2D(d));}
function oval(c:C,x:number,y:number,rx:number,ry:number,col:string|CanvasGradient){c.beginPath();c.ellipse(x,y,rx,ry,0,Math.PI*2);c.fillStyle=col;c.fill();}
function gradient(c:C,x:number,y:number,x2:number,y2:number,stops:[number,string][]){const g=c.createLinearGradient(x,y,x2,y2);stops.forEach(([a,b])=>g.addColorStop(a,b));return g;}
function spot(c:C,x:number,y:number,r:number,col:string){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');return g;}
const heads:Record<FaceAngle,string>={
 profile:'M -76 -44 C -84 -90 -64 -132 -20 -145 C 19 -157 52 -137 66 -108 C 76 -88 69 -69 73 -54 C 77 -39 83 -25 94 -14 Q 103 -5 92 0 L 79 4 Q 76 10 82 15 Q 77 21 78 27 C 77 45 64 58 45 61 Q 18 63 -5 43 C -39 43 -61 19 -76 -44 Z',
 'three-quarter':'M -77 -43 C -89 -91 -65 -138 -17 -148 C 29 -156 63 -132 77 -92 C 85 -67 77 -40 80 -19 Q 86 -8 75 4 L 73 20 Q 67 48 43 62 Q 21 75 -5 58 C -42 43 -65 21 -77 -43 Z',
 'near-front':'M -77 -40 C -87 -94 -58 -139 -11 -149 C 39 -157 72 -129 78 -84 Q 88 -46 71 -10 L 67 20 Q 59 51 35 65 Q 11 77 -11 65 C -49 47 -68 17 -77 -40 Z'
};
export function drawHeroFace(c:C,t:number,pose:HeroPose,light:string,angle:FaceAngle){
 const cold=light==='cold',tired=pose==='tired',work=pose==='work',hope=pose==='drive';
 const skin=cold?'#A77D70':'#BC8867',mid=cold?'#967064':'#A8755D',lit=cold?'#D0A992':'#E3B58B',shadow=cold?'#604D55':'#825340',hair='#20242D',ink='#352B31';
 const profile=angle==='profile',front=angle==='near-front',nearX=profile?55:front?38:48,farX=front?-25:12;
 const blink=clamp(1-Math.abs(((t+1.6)%4.4)-2.2)/.115),open=(tired ? .43 : work ? .70 : hope ? .98 : .85)*(1-blink);
 const tilt=tired ? .08 : work ? .025 : hope ? -.025 : -.03;
 c.save();c.translate(0,Math.sin(t*1.7)*.8);c.rotate(tilt+Math.sin(t*.8)*.013);
 fill(c,'M -79 -12 Q -99 -70 -77 -115 Q -55 -156 -10 -157 Q 44 -172 70 -125 L 78 -75 L -37 39 L -64 45 Z',hair);
 const head=new Path2D(heads[angle]);
 c.save();c.clip(head);
 c.fillStyle=gradient(c,-66,12,80,-77,[[0,shadow],[.37,mid],[.72,skin],[1,lit]]);c.fill(head);
 oval(c,nearX+3,-2,48,48,spot(c,nearX+3,-2,48,cold?'rgba(234,177,150,.30)':'rgba(255,209,154,.38)'));
 oval(c,nearX-12,-77,48,53,spot(c,nearX-12,-77,53,'rgba(242,200,163,.22)'));
 fill(c,profile?'M -21 19 Q 10 47 44 56 Q 65 54 78 34 L 78 62 L 5 80 L -50 31 Z':'M -42 15 Q -14 46 20 57 Q 50 61 74 31 L 65 77 L -31 74 Z','rgba(62,41,46,.23)');
 fill(c,'M -66 -56 Q -38 -99 7 -112 Q 35 -129 67 -108 L 66 -128 L -40 -150 L -90 -101 Z','rgba(37,34,43,.26)');
 c.restore();
 // Curls are painted in clusters, with a coherent sweep and small rim accents.
 fill(c,'M -79 8 C -96 -29 -97 -76 -78 -116 C -58 -151 -25 -160 5 -155 Q 52 -164 73 -130 Q 86 -108 74 -85 C 58 -110 29 -118 8 -101 C -12 -83 -16 -54 -27 -36 Q -38 -11 -56 21 L -65 41 Z',hair);
 for(let i=0;i<20;i++){const a=2.74+i*.183,rx=18+(i%4)*2,ry=18+(i%3)*3,x=-10+Math.cos(a)*72,y=-79+Math.sin(a)*71;
  oval(c,x,y,rx,ry,hair);c.save();c.beginPath();c.ellipse(x,y,rx*.74,ry*.68,-.3,Math.PI*1.08,Math.PI*1.78);c.strokeStyle=cold?'#41434B':'#4C4143';c.lineWidth=1.6;c.stroke();c.restore();
 }
 line(c,'M -65 -114 C -42 -146 -7 -150 24 -140 M -53 -99 Q -24 -133 5 -132',cold?'#555057':'#66524C',2.2);
 const earX=profile?-15:-51;oval(c,earX,-1,15,23,gradient(c,earX-14,-12,earX+12,14,[[0,shadow],[.5,skin],[1,lit]]));line(c,'M '+(earX-5)+' -12 Q '+(earX+10)+' -8 '+(earX+1)+' 6',shadow,3);
 c.beginPath();c.ellipse(earX+1,19,5.5,8,0,0,Math.PI*2);c.strokeStyle='#B8935F';c.lineWidth=2.8;c.stroke();line(c,'M '+(earX-2)+' 14 l 2 -2','#F3D0A0',1.8);
 function eye(x:number,y:number,width:number,far=false){
  const h=(far?5:7)*open,look=hope?2:work?1:0;
  line(c,'M '+(x-width*.55)+' '+(y-14)+' Q '+x+' '+(y-(tired?16:21))+' '+(x+width*.57)+' '+(y-13),ink,far?2.5:3.2);
  if(open<.12){line(c,'M '+(x-width/2)+' '+y+' Q '+x+' '+(y+2)+' '+(x+width/2)+' '+y,ink,2.1);return;}
  const d='M '+(x-width/2)+' '+y+' Q '+x+' '+(y-h)+' '+(x+width/2)+' '+y+' Q '+x+' '+(y+h*.64)+' '+(x-width/2)+' '+y+' Z';
  fill(c,d,cold?'#CFB6A1':'#E2C7AA');c.save();c.clip(new Path2D(d));oval(c,x+look+1,y,far?2.8:4.2,far?4:5.5,'#49362F');oval(c,x+look+1,y,1.9,3.3,'#211F24');oval(c,x+look-1,y-2,1.1,1.1,'#F9D8AF');c.restore();
  line(c,'M '+(x-width/2)+' '+y+' Q '+x+' '+(y-h)+' '+(x+width/2)+' '+y,ink,far?1.8:2.5);
  line(c,'M '+(x-width*.42)+' '+(y+4)+' Q '+x+' '+(y+h*.55+3)+' '+(x+width*.37)+' '+(y+3),shadow,.9);
 }
 if(!profile)eye(farX,-29,front?22:14,true);eye(nearX,-28,profile?23:27);
 if(profile){
  line(c,'M 73 -52 Q 75 -31 92 -12 Q 98 -7 90 -3',lit,2.6);line(c,'M 80 -1 Q 74 -7 71 0',shadow,2.1);
  fill(c,'M 62 12 Q 74 9 81 15 Q 74 20 62 17 Z','#8A5350');
  line(c,'M 62 17 Q 74 '+(hope?21:tired?14:18)+' 81 15',ink,1.5);
  line(c,'M 67 24 Q 74 25 77 22',lit,1.7);
 }else{
  const nx=front?13:43;
  fill(c,'M '+(nx-5)+' -38 Q '+(nx+5)+' -12 '+(nx+15)+' -1 Q '+(nx+4)+' 8 '+(nx-7)+' 4 Z',gradient(c,nx-10,-9,nx+16,-6,[[0,shadow],[.6,skin],[1,lit]]));
  line(c,'M '+(nx-8)+' 3 Q '+(nx-3)+' -1 '+(nx+1)+' 4 M '+(nx+8)+' 3 l 4 -2',shadow,1.8);
  const mx=nx-3,my=hope?23:24,dy=hope?5:tired?-1:2;
  fill(c,'M '+(mx-15)+' '+my+' Q '+(mx-4)+' '+(my-4)+' '+mx+' '+(my-2)+' Q '+(mx+7)+' '+(my-5)+' '+(mx+15)+' '+my+' Q '+mx+' '+(my+8)+' '+(mx-15)+' '+my+' Z','#935E56');
  line(c,'M '+(mx-15)+' '+my+' Q '+mx+' '+(my+dy)+' '+(mx+15)+' '+my,ink,1.5);line(c,'M '+(mx-6)+' '+(my+5)+' Q '+mx+' '+(my+7)+' '+(mx+8)+' '+(my+4),lit,1.2);
 }
 if(tired)line(c,'M '+(nearX-11)+' -16 Q '+nearX+' -10 '+(nearX+11)+' -16','rgba(73,45,56,.45)',1.7);
 line(c,profile?'M 76 31 Q 68 51 45 57':'M 67 32 Q 53 53 32 61',cold?'rgba(225,183,161,.45)':'rgba(255,208,156,.65)',2.2);
 c.restore();
}
