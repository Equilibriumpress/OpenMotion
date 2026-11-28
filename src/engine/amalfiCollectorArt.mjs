// Original vector artwork for the Amalfi Collector pilot. Coordinates in poster units.
const N=v=>+v.toFixed(2), rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const P=(a,d,f='none',s,w=1,o=1)=>a.push({d,f,...(s?{s,w}:{}),...(o!==1?{o}:{})});
const O=(a,x,y,rx,ry,f,o=1)=>P(a,`M${N(x-rx)} ${N(y)}a${N(rx)} ${N(ry)} 0 1 0 ${N(2*rx)} 0a${N(rx)} ${N(ry)} 0 1 0 ${N(-2*rx)} 0Z`,f,undefined,1,o);
const R=(a,x,y,w,h,f)=>P(a,`M${N(x)} ${N(y)}h${N(w)}v${N(h)}h${N(-w)}Z`,f);
export const gradients={};const G=(id,x1,y1,x2,y2,stops)=>{gradients[id]={x1,y1,x2,y2,stops};return '@'+id};
export const layers=[];const L=(id,depth)=>{const a=[];layers.push({id,depth,shapes:a});return a};
let a=L('sky',0);
R(a,-220,-220,980,1450,G('sky',0,120,0,510,[[0,'#487d91'],[.46,'#92b9b1'],[.82,'#e1cf9f'],[1,'#eed7a6']]));
P(a,'M275 291Q342 269 400 279T570 271L570 280Q465 297 354 294Z','#f4e3b8',undefined,1,.42);
P(a,'M380 334Q446 313 530 325T720 314L720 324Q544 346 380 334Z','#f5e1b4',undefined,1,.32);
for(let i=0;i<220;i++){let x=-50+rnd(i+2300)*650,y=155+rnd(i+2700)*325;P(a,`M${N(x)} ${N(y)}l${N(.5+rnd(i+91)*1.2)} .15`,'none',i%3?'#f8e4b7':'#345f6a',.6,.12)}
a=L('distant',.08);
P(a,'M-180 376L-30 215 26 248 68 228 115 289 147 302 194 347 258 370 292 405 349 425 394 451 600 461 760 470V640H-180Z','#829b91');
P(a,'M-180 398L-30 215 26 248 68 228 55 285 112 312 147 302 194 347 258 370 292 405 349 425 394 451 760 470V640H-180Z','#577e7c');
P(a,'M-180 428Q-25 306 23 331T112 363L152 392 231 417 290 449 395 470 760 481V640H-180Z','#719d92');
P(a,'M67 244L91 273 115 289 147 302 194 347 258 370 292 405 349 425 394 451 327 436 258 408 200 379 166 345 112 325 92 290Z','#648b85',undefined,1,.62);
for(let i=0;i<38;i++){const x=28+rnd(i+170)*328,y=291+x*.42+rnd(i+220)*12;P(a,`M${N(x)} ${N(y)}q5 3 12 3`,'none','#b8c2a0',.7,.32)}
a=L('sea',.18);R(a,-220,463,980,770,G('sea',0,455,0,1040,[[0,'#6da9a5'],[.3,'#358b93'],[.68,'#176c80'],[1,'#114b60']]));
P(a,'M-220 475Q160 462 760 474M290 515Q460 505 760 512M322 555Q495 541 760 552','none','#b8ccaa',1.2,.53);
for(let i=0;i<94;i++){let y=475+rnd(i+1200)*287,spread=8+(y-475)*.22,x=411+(rnd(i+1320)-.5)*spread*2,w=3+rnd(i+1470)*(4+(y-475)*.07);P(a,`M${N(x)} ${N(y)}q${N(w*.45)} -.8 ${N(w)} 0`,'none','#e5d6a5',.7+rnd(i+1580)*1.3,.13+rnd(i+1620)*.35)}
for(let i=0;i<130;i++){let y=470+rnd(i+3)*405,x=-100+rnd(i+401)*820,w=5+(y-465)/13+rnd(i+83)*23;P(a,`M${N(x)} ${N(y)}q${N(w*.47)} -${N(.5+rnd(i)*1.5)} ${N(w)} 0`,'none',i%5===0?'#ead6a0':i%3===0?'#1a6a7d':'#83b9b0',.5+rnd(i+4)*.7,.19+rnd(i+22)*.35)}
a=L('cliff',.37);const cliff='M-220 230Q-38 225 33 268L92 307 124 361 174 378 204 426 250 455 276 498 306 526 342 588 335 638 294 677 241 694 174 734 88 750-220 817Z';
P(a,cliff,G('rock',-15,280,300,740,[[0,'#d7c08d'],[.4,'#a89b70'],[.8,'#777e61'],[1,'#5b7462']]));
P(a,'M-220 510Q-34 474 58 522L122 582 174 651 173 734 88 750-220 817Z','#667e59');P(a,'M174 378 204 426 250 455 276 498 306 526 342 588 335 638 294 677 241 694 260 646 252 593 210 551 187 487Z','#8d805e');
for(let i=0;i<80;i++){let y=365+rnd(i+7)*365,x=-65+rnd(i+33)*Math.min(345,(y-260)*.85),w=7+rnd(i+80)*29;P(a,`M${N(x)} ${N(y)}l${N(w*.45)} -${N(w*.24)} ${N(w*.55)} ${N(w*.09)}`,'none',['#dac18d','#8f7955','#6b825d'][i%3],.65+rnd(i)*1.2,.55)}
// Olive and cypress patches on the exposed hillside, with irregular brush-like contour edges.
for(let i=0;i<19;i++){const y=365+i*16,x=140+i*8.6+rnd(i+231)*17,w=9+rnd(i+244)*17;P(a,`M${N(x-w)} ${N(y)}q${N(w*.4)} -${N(w*.72)} ${N(w*.9)} -${N(w*.35)}q${N(w*.55)} -${N(w*.64)} ${N(w*.9)} ${N(w*.2)}q${N(w*.4)} ${N(w*.55)} -${N(w*.3)} ${N(w*.7)}q${N(-w*.8)} ${N(w*.2)} -${N(w*1.5)} -${N(w*.55)}Z`,['#5e7b5d','#77936a','#526d53'][i%3],undefined,1,.86);P(a,`M${N(x-2)} ${N(y-2)}q3 -4 9 -3`,'none','#a0aa78',1.2,.7)}
P(a,'M119 748Q208 724 294 677Q330 652 342 622L357 641Q324 698 260 720L185 758Z','#e7c998');
P(a,'M142 751Q217 733 301 690Q334 671 351 641','none','#f8e9c2',2.2,.9);
a=L('town',.51);
const palettes=[['#f5deae','#c5a278','#aa785c'],['#e3a18a','#b9725d','#9c5848'],['#edbc7f','#ba8d5c','#996a49'],['#f5e6bf','#bfa67f','#ad906b'],['#c87961','#995344','#7d493c'],['#e6b6a1','#b87d69','#9f6452']];
// Hand-placed footprints, varying roof, floor count, loggia and facade angles. Painter order is back to front.
const homes=[[-25,350,48,53,11,1,1],[27,364,31,42,9,3,2],[60,383,39,49,10,0,0],[94,407,31,37,8,2,1],[-28,411,58,66,14,3,0],[36,426,37,48,10,4,2],[77,445,43,59,12,1,1],[123,464,38,53,11,0,0],[165,485,28,40,9,2,2],[-25,481,53,68,13,2,1],[32,499,50,59,11,0,0],[85,518,35,47,10,5,1],[123,542,50,67,13,3,2],[178,560,39,54,10,4,0],[220,581,33,45,9,0,1],[-22,561,53,62,12,5,2],[35,580,46,57,12,3,1],[84,602,48,65,13,2,0],[136,623,45,52,10,1,1],[185,641,33,48,9,0,2],[234,649,41,57,11,5,1],[279,668,31,43,8,2,0],[-20,638,56,60,13,0,0],[41,653,41,51,11,4,2],[85,676,50,68,14,3,1],[141,695,44,55,10,2,0],[190,713,39,46,9,5,1],[-17,710,53,50,13,1,1],[41,727,54,60,13,0,0],[99,748,50,54,11,3,2]];
function house([x,y,w,h,d,p,k],i){const [f,sh,roof]=palettes[p],t=y-h,sk=N(d*.48),top=N(t-sk),id='wall'+i;
 P(a,`M${x+4} ${y-2}h${w+d+10}l-9 12h${-(w+d+10)}Z`,'#425f50',undefined,1,.26);
 P(a,`M${x} ${t}h${w}v${h}h${-w}Z`,G(id,x,t,x+w,y,[[0,f],[.65,f],[1,sh]]));P(a,`M${x+w} ${t}l${d} -${sk}v${h}l${-d} ${sk}Z`,sh);P(a,`M${x-2} ${t}l${d+2} -${sk}h${w}l${-d} ${sk}Z`,roof);
 if(k===0){P(a,`M${x-4} ${t}l${N(w*.52)} -${N(w*.25)} ${N(w*.48+4)} ${N(w*.25)}Z`,roof);P(a,`M${N(x+w*.52-4)} ${N(t-w*.25)}l${d+3} -${sk} ${N(w*.48+1)} ${N(w*.25)}l${-d-3} ${sk}Z`,'#8e6250');for(let z=1;z<5;z++)P(a,`M${N(x-2+w*z/5)} ${t}l${N(w*.52-w*z/5)} -${N(w*.25)}`,'none','#ebbd89',.55,.6)}
 if(k===1){P(a,`M${x+1} ${t-2}v-5h${w-2}v5`,'none','#f6dfb4',2);P(a,`M${x+w-8} ${t-3}v-8h5v8`,'#b68b65');}
 if(k===2){P(a,`M${x} ${t}q${N(w*.5)} -${N(w*.43)} ${w} 0Z`,f);P(a,`M${x+w} ${t}l${d} -${sk}q${N(-w*.1)} -${N(w*.25)} ${N(-w*.5-d*.4)} -${N(w*.19)}l${N(-d*.6)} ${sk}Q${x+w-8} ${N(t-w*.18)} ${x+w} ${t}Z`,sh);}
 R(a,x-1,t,w+2,2,'#f8e2b3');let cols=w>45?(i%4===0?2:3):2,rows=h>58?(i%5===0?2:3):2;
 for(let u=0;u<cols;u++)for(let v=0;v<rows;v++){let wx=N(x+(u+.5)*w/cols-3.8),wy=N(t+8+v*(h-15)/rows),h0=9.5;
  P(a,(i+v)%4===1?`M${wx} ${wy+1}h7.6v${h0-1}h-7.6Z`:`M${wx} ${wy+h0}v-7q3.8 -5.3 7.6 0v7Z`,'#314e50');P(a,`M${N(wx+5.9)} ${N(wy+2)}v6.8`,'none','#88a298',.7,.7);R(a,wx-2.7,wy+.7,2.1,h0,'#73917b');R(a,wx+8.2,wy+.7,2.1,h0,'#557867');R(a,wx-1.6,wy+h0,10.8,1.3,'#f7d8a6');
  if((i+u+v)%4===0){P(a,`M${wx-3} ${wy+h0+1}h14v2h-14Z`,'#b79b70');P(a,`M${wx-3} ${wy+h0+1}v-5m4 5v-5m4 5v-5m4 5v-5`,'none','#6e6450',.8);}
  if((i+u+v)%7===0)P(a,`M${wx-3} ${wy-1}h13l2 3h-17Z`,'#b86d56');
 }
 for(let v=0;v<rows;v++){let wy=t+10+v*(h-15)/rows;P(a,`M${x+w+3} ${N(wy-2)}l${N(d*.45)} -2v7l${N(-d*.45)} 2Z`,'#506c61');}
 if(w>41){P(a,`M${N(x+w*.42)} ${y}v-11q5 -7 10 0v11Z`,'#775b47');}if(i%5===2){P(a,`M${x+2} ${t+3}h${w-4}v3h${4-w}Z`,'#a97b59',undefined,1,.42);P(a,`M${x+2} ${y-7}h${w-4}`,'none','#d4b68a',1.2);}if(i%6===0){P(a,`M${x+3} ${t+5}v${h-8}`,'none','#fff0c8',1.4,.6);}
 for(let z=0;z<16;z++){let xx=x+2+rnd(i*31+z)*(w-4),yy=t+3+rnd(i*31+z+200)*(h-6);P(a,`M${N(xx)} ${N(yy)}l${N(.7+rnd(i*17+z)*1.5)} .3`,'none',z%3?'#f9e3b7':'#aa9271',.5,.28)}
}
for(let i=0;i<homes.length;i++){if([4,9,15,22,27].includes(i)){let [x,y]=homes[i];P(a,`M-180 ${y+7}Q70 ${y+1} ${x+210} ${y+62}l-8 9Q80 ${y+15} -180 ${y+17}Z`,'#c9ad7b');}house(homes[i],i)}
// Individually illustrated villa loggia with broad arcades and sunlit terrace, interrupting the smaller house rhythm.
P(a,'M-24 578L-24 529Q5 508 35 524L57 535V578Z','#f3d9aa');P(a,'M57 535l17 -12v52l-17 3Z','#af9872');P(a,'M-29 529Q5 506 35 519L65 531 57 536Q16 516 -24 534Z','#b06c51');
for(let i=0;i<3;i++){let x=-13+i*23;P(a,`M${x} 571v-22q8 -11 16 0v22Z`,'#546b5a');P(a,`M${x+2} 571v-20q6 -8 12 0v20Z`,'#294f4e');P(a,`M${x-1} 572h18`,'none','#f8e5bd',2);}
P(a,'M-28 578H60L75 571V577L60 584H-28Z','#dfc59a');P(a,'M-28 577H60L75 571','none','#ffedc5',2);
// Stone stair linking upper villas with the waterfront.
for(let i=0;i<19;i++){let x=160+i*3.1,y=509+i*8.2;P(a,`M${N(x)} ${N(y)}l9 -3 8 4 -9 3Z`,'#e9cea0');P(a,`M${N(x)} ${N(y)}l8 4 9 -3v2l-9 3 -8 -4Z`,'#a48b6a');}
// Santa Maria Assunta-inspired church, prominent independently drawn landmark.
P(a,'M223 718L223 645 247 620 277 640 277 718Z',G('church',223,630,278,718,[[0,'#fff0c8'],[1,'#c6a579']]));P(a,'M277 640l21 -12v74l-21 16Z','#a78d6a');P(a,'M216 646L247 614 283 643 277 649 247 624 223 651Z','#d4ad7a');P(a,'M232 651v62m36 -62v62','none','#e1bf8c',3);P(a,'M239 718v-24q10 -16 20 0v24Z','#645d4b');O(a,248,660,7.4,7.4,'#839c80');O(a,248,660,4.7,4.7,'#e5cda0');P(a,'M247 660h2m-1 -5v10','none','#759184',.9);
P(a,'M247 642V609Q270 599 292 610V641Z','#d6b786');P(a,'M239 611Q243 570 268 559Q295 568 300 611Z',G('dome',239,564,300,614,[[0,'#d9b85b'],[.46,'#61a28a'],[1,'#316d80']]));
for(let row=0;row<8;row++){let yy=566+row*5.5,span=Math.sqrt(Math.max(0,1-((611-yy)/53)**2))*31;for(let k=-5;k<=5;k++){let x=268+k*5.5+(row%2)*2.75;if(Math.abs(x-268)>span-3)continue;P(a,`M${N(x-2.6)} ${N(yy)}q2.6 -2.6 5.2 0v3q-2.6 3.8 -5.2 0Z`,['#d7b85b','#4b9682','#35758b'][(row+k+12)%3]);}}
P(a,'M239 611H300M248 619H291','none','#efcea0',3);P(a,'M268 559v-12m-5 5h10','none','#665d46',1.5);
P(a,'M301 714V622H323V704Z','#e7c99b');P(a,'M323 622l11 -6v81l-11 7Z','#b39b74');P(a,'M296 622Q312 594 328 622Z','#b36a51');P(a,'M305 633h13v17h-13Z','#4a6e62');P(a,'M303 655h17m-15 18h15','none','#ab8c65',1.5);
// Coastal road and stone retaining wall share the scooter's analytic centreline.
export const roadY=x=>785-.08*(x-260)+.00021*(x-260)**2;
const curve=(dy)=>Array.from({length:61},(_,i)=>{const x=-220+i*16;return (i?'L':'M')+x+' '+N(roadY(x)+dy)}).join('');
a=L('road',.73);P(a,curve(-7)+'V1110H-220Z','#9a8d6a');P(a,curve(0)+'V1110H-220Z',G('road',0,735,0,910,[[0,'#e8c994'],[1,'#b49a74']]));P(a,curve(20)+'V1110H-220Z','#9c8a67');P(a,curve(25)+'V1110H-220Z','#6a7b5c');P(a,curve(-7),'none','#f4d4a0',2.4);P(a,curve(20),'none','#675e49',2);for(let i=0;i<41;i++){let x=-210+i*23;P(a,`M${x} ${N(roadY(x)+22)}v9`,'none','#706d56',.8)}
a=L('terrace',1);P(a,'M-220 873Q20 824 150 863Q285 901 440 865L760 822V1160H-220Z',G('terrace',0,820,0,1000,[[0,'#d7bb88'],[.52,'#a78961'],[1,'#6f6953']]));
P(a,'M-220 866Q20 817 150 856Q285 894 440 858L760 815','none','#f2d5a1',9);
P(a,'M-220 886Q20 837 150 876Q285 914 440 878L760 835','none','#866c51',3);
for(let i=0;i<20;i++){let x=-35+i*32,y=860+13*Math.sin((x-40)/540*Math.PI*2);P(a,`M${x} ${N(y-15)}v49m0 -45q-12 11 0 25q12 -10 0 -25`,'none','#294f46',2.2)}
P(a,'M-220 839Q20 790 150 829Q285 867 440 831L760 788','none','#234f47',3.3);
for(let i=0;i<22;i++){let x=i*27-10,y=904+18*Math.sin(i*.65);P(a,`M${x} ${N(y)}l${N(30+i*.5)} 29`,'none','#e2c18a',1,.65)}
// Terracotta planter with rim and curved shaded side.
P(a,'M23 850Q61 861 95 848L83 908Q60 919 35 907Z',G('pot',23,850,94,909,[[0,'#d69a72'],[.48,'#ad684d'],[1,'#724d3e']]));O(a,59,847,37,10,'#b97b56');O(a,59,847,30,6,'#665f43');P(a,'M25 853Q59 865 94 851','none','#e8af7b',3);
export const objects={boat:[],scooter:[],leaves:[],flowers:[]};a=objects.boat;
P(a,'M-34 0Q0 5 38 -3L26 11H-20Z','#f0d7a7');P(a,'M-30 3Q4 7 34 0L25 8H-20Z','#a86d55');P(a,'M1 -69V2','none','#766149',1.8);P(a,'M-2 -66Q-16 -40 -32 -7L-2 -5Z',G('sail',-32,-55,0,-8,[[0,'#fff0cb'],[1,'#d0bc93']]));P(a,'M5 -57Q23 -31 34 -9L5 -6Z','#b86651');P(a,'M-2 -66Q-16 -40 -32 -7','none','#fff1ce',.8);P(a,'M-25 -14L-4 -9','none','#c2ad8a',.8);
a=objects.scooter;for(let x of [-25,24]){O(a,x,-7,10,9,'#243b3a');O(a,x,-7,6,5.4,'#d9c8a5');O(a,x,-7,2.5,2.2,'#6d8075')}
P(a,'M-38 -13Q-40 -35 -25 -44Q-10 -50 2 -34L10 -15Q14 -11 20 -19L21 -39Q22 -48 29 -46L36 -33 39 -15 32 -9H-30Z',G('vespa',-26,-45,31,-10,[[0,'#ed9a76'],[.37,'#c34f40'],[1,'#843b33']]));P(a,'M-35 -19Q-36 -34 -24 -41Q-12 -45 -5 -34L-1 -19Z','#de8b66');P(a,'M-30 -17Q-28 -27 -21 -29Q-10 -30 -5 -21','none','#f4cba0',2);P(a,'M19 -20 21 -39Q22 -48 29 -46L35 -34 29 -19Z','#dfa16f');P(a,'M29 -46 35 -43 39 -31 34 -20 29 -19Z','#9c4536');P(a,'M-19 -43h20q6 0 7 5h-27Z','#384c45');P(a,'M26 -47v-11h13','none','#344e48',2.8);O(a,38,-53,6,4.2,'#f4daa1');P(a,'M37 -58l5 -9','none','#344e48',1.7);O(a,43,-68,3,2,'#c6bd9c');P(a,'M-15 -41Q-13 -53 -4 -59L5 -56 13 -46 29 -56 32 -52 14 -39 3 -48 1 -39Z','#edc49a');P(a,'M-10 -53Q-10 -63 -1 -67Q8 -68 12 -57L4 -49Z','#f3d9b0');O(a,0,-73,7.5,7,'#b77d5e');P(a,'M-9 -74Q0 -86 11 -73Z','#e7d8b7');P(a,'M-12 -41Q-7 -30 4 -24L18 -20','none','#365952',7);P(a,'M17 -20l8 1','none','#574c42',4);
a=objects.leaves;
P(a,'M-65 403Q-13 264 100 207Q144 185 190 205M-2 307Q68 291 122 329M42 254Q99 259 144 246M565 390Q506 273 520 175M520 255Q480 232 451 238','none','#42513d',9);
P(a,'M-65 403Q-13 264 100 207Q144 185 190 205M-2 307Q68 291 122 329M42 254Q99 259 144 246M565 390Q506 273 520 175','none','#9c9163',2);
for(let i=0;i<42;i++){let x=i<31?-12+rnd(i+8)*189:448+rnd(i+8)*102,y=i<31?202+rnd(i+17)*139:182+rnd(i+17)*154,dx=(i%2?1:-1)*(12+rnd(i+81)*13);P(a,`M${N(x)} ${N(y)}q${N(dx*.5)} -17 ${N(dx)} -4q${N(-dx*.45)} 18 ${N(-dx)} 4Z`,['#305a45','#50764c','#739257','#3e694a'][i%4]);P(a,`M${N(x)} ${N(y)}l${N(dx*.87)} -4`,'none','#a0a56b',.65,.8)}
for(const [x,y,z] of [[37,253,1],[75,225,.9],[120,282,1],[154,330,.85],[493,239,1],[522,319,.9]]){O(a,x,y,9*z,13*z,G('lemon'+x,x-8,y-10,x+8,y+12,[[0,'#f9df86'],[.65,'#d6b64e'],[1,'#ae9143']]));O(a,x-3,y-4,2.5*z,4.5*z,'#ffec9e');P(a,`M${x} ${y-13*z}q2 -5 5 -7`,'none','#536d42',1.3)}
for(let i=0;i<24;i++){let x=2+rnd(i+810)*105,y=207+rnd(i+920)*66,z=3+rnd(i+90)*4;for(let k=0;k<3;k++){let th=k*2*Math.PI/3;O(a,x+Math.cos(th)*z*.7,y+Math.sin(th)*z*.6,z*.68,z*.48,['#b75a73','#d88d9b','#e8adac'][(i+k)%3])}O(a,x,y,1.2,1.2,'#f1d8a5')}
a=objects.flowers;P(a,'M58 847Q26 807 35 765M58 847Q94 806 122 780M58 847Q51 801 72 766','none','#4f7050',3);
for(let i=0;i<36;i++){let x=18+rnd(i+67)*111,y=755+rnd(i+13)*75;P(a,`M${N(x)} ${N(y)}q-11 -9 -15 2q6 11 15 -2Z`,['#3d6950','#628456','#7f965c'][i%3]);let z=3+rnd(i+70)*4;for(let k=0;k<3;k++){let th=k*2*Math.PI/3;O(a,x+Math.cos(th)*z*.7,y+Math.sin(th)*z*.6,z*.68,z*.48,['#b75a73','#d88d9b','#e8adac'][(i+k)%3])}O(a,x,y,1.2,1.2,'#f1d8a5')}
// Title, static frame and object positions are shared by SVG and Canvas.
export const design={paper:'#f3e4c4',ink:'#234e50',frame:{x:21,y:150,w:498,h:737},headline:'AMALFI',sub:'COSTA AMALFITANA',footer:'AN ITALIAN SUMMER',boat:[402,650],distantBoat:[478,553],scooterX:243};
export const staticTransforms={boat:[402,650,1,0],distantBoat:[478,553,.5,0],scooter:[243,roadY(243),.82,Math.atan(-.08+.00042*(243-260))],leaves:[0,0,1,0],flowers:[0,0,1,0]};
export function svgPoster(){const defs=Object.entries(gradients).map(([id,g])=>`<linearGradient id="g${id}" gradientUnits="userSpaceOnUse" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}">${g.stops.map(([offset,color])=>`<stop offset="${offset}" stop-color="${color}"/>`).join('')}</linearGradient>`).join('');const S=ss=>ss.map(v=>`<path d="${v.d}" fill="${v.f.startsWith('@')?'url(#g'+v.f.slice(1)+')':v.f}"${v.s?` stroke="${v.s}" stroke-width="${v.w}" stroke-linecap="round" stroke-linejoin="round"`:''}${v.o!==undefined?` opacity="${v.o}"`:''} fill-rule="evenodd"/>`).join('');const obj=(name,tr)=>`<g transform="translate(${tr[0]} ${tr[1]}) rotate(${tr[3]*180/Math.PI}) scale(${tr[2]})">${S(objects[name])}</g>`;let body='';for(const l of layers){body+=S(l.shapes);if(l.id==='sea')body+=obj('boat',staticTransforms.boat)+obj('boat',staticTransforms.distantBoat);if(l.id==='road')body+=obj('scooter',staticTransforms.scooter);if(l.id==='terrace')body+=obj('leaves',staticTransforms.leaves)+obj('flowers',staticTransforms.flowers)}const f=design.frame;return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 540 960"><defs>${defs}<clipPath id="frame"><rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}"/></clipPath></defs><rect width="540" height="960" fill="${design.paper}"/><g clip-path="url(#frame)">${body}</g><rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="none" stroke="${design.ink}" stroke-width="1"/><g fill="${design.ink}" text-anchor="middle"><text x="270" y="39" font-family="Arial,sans-serif" font-size="10" letter-spacing="3">LIVING TRAVEL POSTERS · 02</text><text x="270" y="103" font-family="Georgia,serif" font-weight="bold" font-size="70" letter-spacing="4">AMALFI</text><text x="270" y="131" font-family="Arial,sans-serif" font-size="12" letter-spacing="4">COSTA AMALFITANA</text><text x="270" y="917" font-family="Georgia,serif" font-style="italic" font-size="19">An Italian Summer</text><text x="270" y="939" font-family="Arial,sans-serif" font-size="8" letter-spacing="2">COLLECTOR EDITION · ORIGINAL ILLUSTRATION</text></g></svg>`}
