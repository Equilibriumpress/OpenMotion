import { OpenMotionScene } from '../types/openmotion';
import { getCachedPhoto } from './imageCache';
import { projectAssetUrl } from './projectAudio';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x)};
type C=CanvasRenderingContext2D;
type Cat='oliver'|'boss'|'luna'|'bob';
const fur:Record<Cat,string>={oliver:'#ce8749',boss:'#8d8b88',luna:'#e8e3d9',bob:'#35363c'};
const jacket:Record<Cat,string>={oliver:'#748c94',boss:'#29343e',luna:'#80756d',bob:'#455461'};
function rect(c:C,x:number,y:number,w:number,h:number,color:string,r=0){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()}
function oval(c:C,x:number,y:number,rx:number,ry:number,color:string){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
function line(c:C,x:number,y:number,X:number,Y:number,color:string,width=4){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.stroke()}
function photo(c:C,id:Cat,x:number,y:number,w:number,h:number,zoom=1){
  const img=getCachedPhoto(projectAssetUrl('assets/cat-office/'+id+'.jpg'));
  if(!img){rect(c,x,y,w,h,'#454850',20);c.fillStyle='white';c.font='600 27px Arial';c.textAlign='center';c.fillText('Photo unavailable',x+w/2,y+h/2);return}
  const f=Math.max(w/img.naturalWidth,h/img.naturalHeight)*zoom;
  const dw=img.naturalWidth*f,dh=img.naturalHeight*f;
  c.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
function caption(c:C,text:string,y:number,size=66){
  c.save();c.textAlign='center';c.textBaseline='middle';c.font='900 '+size+'px Arial, sans-serif';c.lineJoin='round';c.strokeStyle='rgba(0,0,0,.95)';c.lineWidth=11;c.fillStyle='white';
  const lines:string[]=[];let row='';for(const word of text.split(/\s+/)){const next=row?row+' '+word:word;if(c.measureText(next).width>890&&row){lines.push(row);row=word}else row=next}if(row)lines.push(row);
  lines.forEach((l,i)=>{const yy=y+(i-(lines.length-1)/2)*size*1.12;c.strokeText(l,520,yy);c.fillText(l,520,yy)});c.restore()
}
function office(c:C,meeting=false){
  const g=c.createLinearGradient(0,0,0,1920);g.addColorStop(0,'#b7c5c8');g.addColorStop(.64,'#e1d6c5');g.addColorStop(1,'#5b514a');rect(c,0,0,1080,1920,'#b8c2c3');c.fillStyle=g;c.fillRect(0,0,1080,1920);
  rect(c,45,270,990,720,'#596b75',14);rect(c,58,282,964,692,'#a8c5d3',8);
  for(let i=0;i<9;i++){const x=65+i*118, top=670-(i*137%230);rect(c,x,top,100,970-top,'#8ba1ac');for(let j=top+25;j<945;j+=42)rect(c,x+12,j,74,7,'#bfd0d5')}
  line(c,540,280,540,974,'#596b75',13);line(c,60,630,1020,630,'#596b75',10);
  rect(c,0,995,1080,17,'#b4a69b');rect(c,0,1012,1080,908,'#a89b8c');
  if(meeting){rect(c,125,250,830,425,'#263139',15);rect(c,140,265,800,395,'#f7f5ef',7);c.fillStyle='#40505a';c.font='bold 36px Arial';c.fillText('Q4 ALIGNMENT',190,330);for(let i=0;i<5;i++)rect(c,210+i*122,550-i*31,68,70+i*31,i%2?'#b38d64':'#718d98',5);line(c,200,625,840,625,'#839198',4)}
}
function cat(c:C,id:Cat,x:number,y:number,s:number,t:number,pose='neutral'){
  const phase=t*2.4+(id==='bob'?2:0);const breathe=Math.sin(phase)*4;
  c.save();c.translate(x,y+breathe);c.scale(s,s);
  oval(c,0,255,155,35,'#00000026');
  rect(c,-138,-12,276,260,jacket[id],85);
  c.fillStyle='#e4e1dd';c.beginPath();c.moveTo(-55,-1);c.lineTo(55,-1);c.lineTo(0,155);c.fill();
  c.fillStyle=id==='boss'?'#c25c4f':'#889aa3';c.beginPath();c.moveTo(-13,30);c.lineTo(13,30);c.lineTo(24,110);c.lineTo(0,136);c.lineTo(-24,110);c.fill();
  c.save();c.translate(0,-92);c.rotate((pose==='sleep'?-.18:pose==='shock'?Math.sin(t*9)*.045:Math.sin(phase)*.012));
  // Deliberately visible photographic collage silhouette, not a fabricated live animal shot.
  c.beginPath();c.moveTo(-147,-40);c.lineTo(-140,-176);c.quadraticCurveTo(-131,-198,-62,-145);c.quadraticCurveTo(0,-162,62,-145);c.quadraticCurveTo(131,-198,140,-176);c.lineTo(147,-40);c.bezierCurveTo(160,72,70,119,0,119);c.bezierCurveTo(-70,119,-160,72,-147,-40);c.closePath();c.clip();
  rect(c,-170,-200,340,340,fur[id]);photo(c,id,-170,-200,340,340,1.08);
  if(pose==='talk'||pose==='scream'){const a=pose==='scream'?1:.35+.5*Math.abs(Math.sin(t*19));oval(c,0,53,23+a*20,7+a*34,'#281a1b');oval(c,0,61+a*12,13+a*12,5+a*5,'#c77d82')}
  if(pose==='sleep'){line(c,-96,-18,-33,-12,'#1f2123',8);line(c,33,-12,96,-18,'#1f2123',8)}
  c.restore();
  oval(c,-100,191+Math.sin(t*16)*((pose==='type')?12:1),39,31,fur[id]);oval(c,100,191+Math.cos(t*16)*((pose==='type')?12:1),39,31,fur[id]);c.restore()
}
function table(c:C,y:number,meeting=false){c.fillStyle='#62554b';c.beginPath();c.moveTo(meeting?150:0,y);c.lineTo(meeting?930:1080,y);c.lineTo(1080,y+300);c.lineTo(0,y+300);c.closePath();c.fill();rect(c,0,y+300,1080,80,'#493e37')}
function desk(c:C,t:number,loop:boolean){
 office(c);cat(c,'oliver',380,1045,1.7,t,'type');
 const enter=loop?ease(t/.38):1;cat(c,'boss',840+(1-enter)*330,975,1.37,t,((loop?t>.35&&t<1.15:t>.65&&t<1.6)?'talk':'neutral'));
 table(c,1320);rect(c,95,1060,435,310,'#252d32',18);rect(c,112,1078,401,270,'#4c626b',8);rect(c,270,1370,100,45,'#303a3d',5);rect(c,163,1435,420,50,'#363b40',8);
 for(let i=0;i<13;i++)rect(c,177+i*29,1446,24,20,'#757c7e',3);
 oval(c,685,1437,62,20,'#00000033');rect(c,640,1348,100,90,'#f2e9d9',12);oval(c,690,1350,48,12,'#71462c');c.strokeStyle='#f2e9d9';c.lineWidth=13;c.beginPath();c.arc(747,1392,26,-1.5,1.5);c.stroke();
}
function reaction(c:C,t:number,scream:boolean){
 const zoom=(scream?1.16:1)+ease(t/.24)*.20+(scream?.028*Math.sin(t*53):0);c.save();c.translate(540+(scream?Math.sin(t*67)*9:0),960);c.scale(zoom,zoom);c.translate(-540,-960);
 c.save();c.beginPath();c.rect(0,0,1080,1920);c.clip();photo(c,'oliver',0,0,1080,1920,1.02);c.restore();
 if(scream){const v=c.createRadialGradient(540,960,260,540,960,960);v.addColorStop(0,'#00000000');v.addColorStop(1,'#48160877');c.fillStyle=v;c.fillRect(0,0,1080,1920);}
 c.restore();
}
export function renderCatOffice(c:C,w:number,h:number,scene:OpenMotionScene,t:number){
 const spec=scene.catOffice!;c.save();c.scale(w/1080,h/1920);
 const shot=spec.shot;
 if(shot==='desk'||shot==='loop'){desk(c,t,shot==='loop')}
 else if(shot==='reaction'||shot==='scream'){reaction(c,t,shot==='scream')}
 else if(shot==='meeting'){
   office(c,true);
   cat(c,'boss',790,920,1.17,t,'neutral');cat(c,'oliver',260,1170,1.14,t);cat(c,'luna',540,1155,1.08,t);cat(c,'bob',840,1195,1.08,t,t>2?'sleep':'neutral');table(c,1440,true);
   oval(c,540,765,95,95,'#f5f0e6');oval(c,540,765,82,82,'#ddd9d2');oval(c,540,765,75,75,'#fff');
   const a=t*8;line(c,540,765,540+60*Math.sin(a),765-60*Math.cos(a),'#3b4447',7);line(c,540,765,540+40*Math.sin(a/12),765-40*Math.cos(a/12),'#3b4447',9);
 }else{
   office(c,true);c.save();c.translate(540,1020);const z=1+.10*ease((t-1.8)/1.7);c.scale(z,z);c.translate(-540,-1020);
   const speaking=(spec.cues??[]).some(q=>t>=q.start&&t<q.end);cat(c,'boss',570,1150,2.35,t,speaking?'talk':'neutral');table(c,1580,true);c.restore();
 }
 if(scene.headline)caption(c,scene.headline,178,62);
 const q=(spec.cues??[]).find(q=>t>=q.start&&t<q.end);if(q)caption(c,q.text,1460,67);
 c.restore();
}
