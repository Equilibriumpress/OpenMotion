import type { OpenMotionScene, OpenMotionBrandKit } from '../types/openmotion';

// Original editorial character and diagrams, rendered by the existing Canvas pipeline.
const W=512,H=910,ink='#243538',paper='#F5EDDF',rust='#B94F36',teal='#253E43',light='#FFF9EF',sand='#E9D4BD',muted='#766E61';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>{const a=clamp(v);return a*a*(3-2*a);};
type C=CanvasRenderingContext2D;
function box(c:C,x:number,y:number,w:number,h:number,fill:string,r=10,stroke?:string){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
function oval(c:C,x:number,y:number,rx:number,ry:number,fill:string,stroke?:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function path(c:C,d:string,fill:string,stroke?:string,w=2){const p=new Path2D(d);if(fill!=='none'){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke(p);}}
function line(c:C,x:number,y:number,a:number,b:number,color=ink,w=1.5){c.beginPath();c.moveTo(x,y);c.lineTo(a,b);c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.stroke();}
function txt(c:C,s:string,x:number,y:number,size=20,color=ink,weight=600,align:CanvasTextAlign='left',max=430){c.fillStyle=color;c.font=weight+' '+size+'px system-ui, sans-serif';c.textAlign=align;c.textBaseline='alphabetic';c.fillText(s,x,y,max);}
function arrow(c:C,x:number,y:number,a:number,b:number,color=rust){line(c,x,y,a,b,color,2);const ang=Math.atan2(b-y,a-x);line(c,a,b,a-9*Math.cos(ang-.5),b-9*Math.sin(ang-.5),color,2);line(c,a,b,a-9*Math.cos(ang+.5),b-9*Math.sin(ang+.5),color,2);}
function reveal(c:C,p:number,draw:()=>void){c.save();c.globalAlpha=ease(p);c.translate(0,10*(1-ease(p)));draw();c.restore();}
function host(c:C,x:number,y:number,s:number,t:number,speaking:boolean,gesture:number){
 c.save();c.translate(x,y+Math.sin(t*1.9)*1.5);c.scale(s,s);
 // Articulated arm under the torso and head; palm and cuff stay attached.
 const g=ease(gesture),a=-.25-g*.85+.035*Math.sin(t*3);
 c.save();c.translate(55,56);c.rotate(a);box(c,-15,-9,30,66,teal,14);c.translate(0,52);c.rotate(-.8*g);box(c,-13,-5,26,42,teal,12);box(c,-12,28,24,10,'#38585D',3);oval(c,0,46,12,15,'#E7B18D');line(c,-5,41,-5,51,'#B97E5D',1);c.restore();
 path(c,'M-83 111 Q-78 45 -37 34 L-20 27 H20 L37 34 Q78 45 83 111 V143 H-83Z',teal);
 path(c,'M-29 34 L0 62 29 34 19 143 H-19Z',light);
 path(c,'M-38 35 L-19 76 -34 91 -27 143 M38 35 L19 76 34 91 27 143','none','#486367',2);
 line(c,-58,101,-58,140,'#486367',2);box(c,-16,12,32,39,'#D99D76',9);
 oval(c,-43,-15,8,12,'#D99D76');oval(c,43,-15,8,12,'#D99D76');
 oval(c,0,-20,45,56,'#E7B18D');
 path(c,'M-45 -19 Q-62 -85 -6 -83 Q46 -99 48 -34 L34 -45 Q6 -29 -31 -52 L-42 -19Z','#253238');
 path(c,'M-39 -53 Q-20 -82 16 -75','none','#465456',2);
 const blink=(t%4.8>4.57&&t%4.8<4.75);
 line(c,-30,-41,-12,-43,ink,2);line(c,12,-43,30,-41,ink,2);
 oval(c,-19,-22,15,15,'rgba(255,255,255,.08)',ink);oval(c,19,-22,15,15,'rgba(255,255,255,.08)',ink);
 line(c,-4,-22,4,-22,ink,2);line(c,-34,-21,-44,-21,ink,2);line(c,34,-21,44,-21,ink,2);
 if(blink){line(c,-24,-22,-12,-22,ink,2);line(c,12,-22,24,-22,ink,2);}else{oval(c,-18,-22,3.3,4,ink);oval(c,18,-22,3.3,4,ink);}
 path(c,'M0 -16 L-4 -3 H3','none','#A56B51',1.8);
 const mouth=speaking?2+5*Math.abs(Math.sin(t*15.3)*Math.sin(t*5.7)):0;
 if(mouth>2){oval(c,0,12,10,mouth,'#734A40');line(c,-5,9,5,9,light,1.5);}else path(c,'M-12 11 Q0 21 12 11','none',ink,2);
 c.restore();
}
function network(c:C,x:number,y:number,t:number){oval(c,x,y,95,95,sand);const pts=[[x-62,y-37],[x,y-69],[x+61,y-32],[x,y+45]];for(const [a,b] of [[0,1],[1,2],[2,3],[3,0],[1,3],[0,2]])line(c,pts[a][0],pts[a][1],pts[b][0],pts[b][1],teal,2);pts.forEach(([a,b],i)=>oval(c,a,b,12,12,i===3?rust:light,teal));const p=(t*.8)%1;oval(c,x,y-69+114*p,4,4,rust);}
function frame(c:C,episode:string){c.fillStyle=paper;c.fillRect(0,0,W,H);box(c,42,46,24,8,rust,0);txt(c,'SIMPLY EXPLAINED',78,57,15,ink,750);line(c,42,89,470,89,'#C9BBA7');line(c,42,660,470,660,'#C9BBA7');txt(c,episode+' / TECHNOLOGY',42,117,13,rust,750);txt(c,'BIG IDEAS. MADE VISUAL.',42,838,12,muted,650);txt(c,'SE',470,838,12,muted,750,'right');}
function heading(c:C,k:string,a:string,b:string){txt(c,k,42,158,14,rust,750);txt(c,a,42,211,41,ink,800);if(b)txt(c,b,42,256,41,ink,800);}
function chat(c:C,x:number,y:number,w:number,h:number){box(c,x,y,w,h,light,16,'#C9BBA7');box(c,x+15,y+15,w-30,24,teal,6);[0,1,2].forEach(i=>oval(c,x+26+i*10,y+27,2.4,2.4,light));}
export function renderSimplyExplained(c:C,width:number,height:number,scene:OpenMotionScene,localTime:number,_brand:OpenMotionBrandKit):void{
 const extras=scene.doodle?.extras??[],get=(k:string)=>extras.find(v=>v.startsWith(k+':'))?.slice(k.length+1),shot=get('shot')??'hook',episode=get('episode')??'01',t=Math.max(0,Math.min(scene.durationSec,localTime)),speaking=t>.3&&t<Math.min(scene.durationSec-.45,Number(get('speech-end')??scene.durationSec));
 c.save();c.scale(width/W,height/H);frame(c,episode);
 switch(shot){
 case 'cover':
  txt(c,'HOW AI',42,220,65,ink,800);txt(c,'ACTUALLY',42,285,65,ink,800);txt(c,'WORKS',42,350,65,ink,800);
  network(c,370,507,t);host(c,152,528,1,t,false,0);txt(c,'FROM PROMPT TO ANSWER',42,702,19,ink,750);txt(c,'Big ideas. Made visual.',42,738,16,muted,500);break;
 case 'hook':
  heading(c,'01 / THE QUESTION','Behind the','answer');
  chat(c,176,298,294,260);
  reveal(c,t/.7,()=>{box(c,200,360,245,48,sand,12);txt(c,'Why is the sky blue?',215,390,17,ink,650, 'left',216);});
  reveal(c,(t-1.6)/.7,()=>{box(c,200,430,245,87,'#DCE5DD',12);txt(c,'Sunlight scatters…',215,461,18,ink,650);for(let i=0;i<2;i++)box(c,215,478+i*13,155+i*28,4,'#9EB4A8',2);});
  host(c,111,507,.79,t,speaking,.5);txt(c,'Alex',42,638,15,muted,650);break;
 case 'training':
  heading(c,'02 / BEFORE YOU ASK','Learn from','examples');
  for(let i=0;i<9;i++){const x=46+(i%3)*78,y=302+Math.floor(i/3)*53;reveal(c,(t-i*.18)/.5,()=>{box(c,x,y,66,42,light,5,'#C9BBA7');for(let j=0;j<3;j++)box(c,x+8,y+9+j*8,32+(i+j)%3*8,3,muted,1);});}
  txt(c,'TRAINING TEXT',46,490,12,muted,750);
  arrow(c,276,371,320,371);network(c,390,381,t);
  reveal(c,(t-3)/.8,()=>{box(c,293,503,177,70,teal,10);txt(c,'PARAMETERS',381,530,12,light,750,'center');txt(c,'adjusted',381,555,20,light,700,'center');});
  host(c,114,563,.62,t,speaking,.45);break;
 case 'tokens':
  heading(c,'03 / THE INPUT','Text becomes','tokens');
  box(c,42,305,428,67,light,12,'#C9BBA7');txt(c,'The sky is blue.',63,347,27,ink,650);
  arrow(c,256,386,256,432);
  ['The',' sky',' is',' blue','.'].forEach((word,i)=>{const x=[42,126,218,285,395][i],w=[77,85,60,103,49][i];reveal(c,(t-1-i*.34)/.5,()=>{box(c,x,452,w,58,i%2?sand:'#DCE5DD',8);txt(c,word.trim(),x+w/2,488,23,ink,700,'center',w-8);});});
  txt(c,'Illustrative token split',42,540,15,muted,500);host(c,392,575,.57,t,speaking,.5);break;
 case 'prediction': {
  heading(c,'04 / THE MODEL','What comes','next?');
  const step=Math.min(2,Math.floor(t/4)),phase=t-step*4;
  const prompts=['The sky is','The sky is blue','The sky is blue today'];
  const choices=[['blue','clear','dark'],['today','.','above'],['.','and','because']];
  const values=[[.62,.24,.14],[.46,.36,.18],[.71,.19,.10]][step];
  box(c,42,298,428,58,teal,9);txt(c,prompts[step],61,334,25,light,700);
  txt(c,'ILLUSTRATIVE PROBABILITIES',42,390,12,muted,750);
  choices[step].forEach((word,i)=>{const y=407+i*57;box(c,42,y,428,46,light,7);txt(c,word,54,y+29,20,ink,650);box(c,169,y+10,211,26,'#E7DDCF',4);box(c,169,y+10,Math.max(1,211*values[i]*ease(phase/.65)),26,i===0?rust:teal,4);txt(c,Math.round(values[i]*100)+'%',452,y+29,17,ink,750,'right');});
  reveal(c,(phase-2.2)/.4,()=>{txt(c,'SELECTED: '+choices[step][0],42,609,17,rust,750);});break;}
 case 'response':
  heading(c,'05 / GENERATION','One step at','a time');
  chat(c,42,300,428,286);txt(c,'Why is the sky blue?',65,366,24,ink,700);
  ['Sunlight',' scatters',' in',' the',' atmosphere.',' Blue',' light',' scatters',' more.'].forEach((_,i)=>{if(t<.6+i*.55)return;const row=i<5?0:1;const phrase=(row===0?['Sunlight',' scatters',' in',' the',' atmosphere.']:['Blue',' light',' scatters',' more.']).slice(0,row===0?Math.min(i+1,5):i-4).join('');c.save();txt(c,phrase,65,430+row*48,22,ink,650,'left',390);c.restore();});
  host(c,393,579,.55,t,speaking,.45);break;
 case 'limits':
  heading(c,'06 / THE LIMIT','Fluent does','not mean true');
  box(c,42,302,428,101,light,12,'#C9BBA7');txt(c,'A confident answer',61,340,23,ink,700);txt(c,'is not proof.',61,374,24,rust,750);
  reveal(c,(t-1.2)/.6,()=>{box(c,42,430,428,74,'#DCE5DD',10);txt(c,'CHECK IMPORTANT FACTS',61,474,20,teal,750);path(c,'M415 462 L426 473 447 450','none',teal,4);});
  host(c,125,555,.67,t,speaking,.6);txt(c,'Prediction ≠ verification',210,608,18,ink,750,'left',258);break;
 }
 c.restore();
}
