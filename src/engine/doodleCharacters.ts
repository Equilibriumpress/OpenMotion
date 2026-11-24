/**
 * Editable vector-character library for the hand-drawn explainer.
 *
 * Two coherent character rigs: a person (block haircut, expressive eyes,
 * olive shirt, slim limbs) and a cheerful pink brain (hand-shaped outline).
 * Unlike the first draft these are not assembled from unrelated ellipses.
 *
 * Geometry lives in local coordinates, with deterministic micro-keyframes.
 * Both Studio previews and video exports draw the same poses at a given time.
 */
const INK='#29282B';
const SKIN='#F6E7CD';
const PINK='#F0A0A2';
const SHIRT='#819D59';
type Mood='sleepy'|'relaxed'|'happy'|'worried'|'surprised'|'overwhelmed'|string;
export type DoodlePose='neutral'|'relieved'|'alert'|'exhausted'|'point';

function stroke(ctx:CanvasRenderingContext2D,width=2.7){
  ctx.strokeStyle=INK;
  ctx.lineWidth=width;
  ctx.lineCap='round';
  ctx.lineJoin='round';
}
function oval(ctx:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string,width=2.4){
  ctx.beginPath();
  ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);
  ctx.fillStyle=color;
  ctx.fill();
  if(width){stroke(ctx,width);ctx.stroke();}
}
function curve(ctx:CanvasRenderingContext2D,points:[number,number][],width=3){
  ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);
  stroke(ctx,width);ctx.stroke();
}
const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
/** Two brief blinks within a scene. No perpetual bouncing. */
function blinkAt(t:number){
  const phase=(t+2.4)%4.8;
  return phase<.15 ? 1-ease(phase/.15) : phase<.29 ? ease((phase-.15)/.14) : 1;
}
/** Head coordinates are centered on the face, not the hairline. */
export function drawDoodleHead(
  ctx:CanvasRenderingContext2D,
  x:number,y:number,mood:Mood,t:number,size=1
){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);
  const tilt=mood==='worried' ? -.035 : mood==='happy' ? .027 : mood==='sleepy' ? -.022 : 0;
  ctx.rotate(tilt);

  // Broad, nearly square head with subtly irregular hand-drawn jaw.
  ctx.fillStyle=SKIN;
  ctx.beginPath();
  ctx.moveTo(-41,-38);
  ctx.bezierCurveTo(-46,-13,-44,20,-34,36);
  ctx.bezierCurveTo(-23,55,10,56,31,40);
  ctx.bezierCurveTo(47,26,45,-8,41,-37);
  ctx.quadraticCurveTo(7,-52,-41,-38);
  ctx.closePath();ctx.fill();stroke(ctx,2.9);ctx.stroke();

  // The haircut from the reference is a flat dark block, not a round wig.
  ctx.fillStyle='#272529';ctx.beginPath();
  ctx.moveTo(-44,-26);
  ctx.lineTo(-43,-51);
  ctx.quadraticCurveTo(-9,-60,39,-52);
  ctx.lineTo(43,-27);
  ctx.lineTo(33,-29);
  ctx.quadraticCurveTo(9,-37,-14,-34);
  ctx.quadraticCurveTo(-28,-35,-40,-27);
  ctx.closePath();ctx.fill();

  const sleepy=mood==='sleepy'||mood==='relaxed';
  const worried=mood==='worried'||mood==='overwhelmed';
  const surprised=mood==='surprised'||mood==='overwhelmed';
  const blink=blinkAt(t);
  const yEye=1;
  if(sleepy||blink<.13){
    // Soft, closed eyelids in rest scenes.
    for(const cx of [-18,19]){
      ctx.beginPath();ctx.arc(cx,yEye,8.7,.11,Math.PI-.1);
      stroke(ctx,2.35);ctx.stroke();
    }
  }else{
    for(const cx of [-18,19]){
      oval(ctx,cx,yEye,surprised?11.3:10.2,Math.max(1,10.3*blink), '#FFFCF8',2);
      oval(ctx,cx+(worried?1.6:.6),yEye+1,3.4,Math.max(.8,3.8*blink), INK,0);
    }
    if(worried){
      curve(ctx,[[-30,-18],[-22,-22],[-10,-18]],1.8);
      curve(ctx,[[9,-18],[20,-24],[30,-20]],1.8);
    }
  }
  if(mood==='happy'||mood==='relaxed'){
    // Tiny cheek touches: redrawn as two understated strokes.
    ctx.strokeStyle='rgba(211,112,104,.35)';ctx.lineWidth=2;
    for(const cx of [-34,34]){
      ctx.beginPath();ctx.moveTo(cx-4,19);ctx.lineTo(cx+4,20);ctx.stroke();
    }
  }
  if(surprised){
    oval(ctx,1,30,7.5,10,'#A45E5B',2);
  }else if(worried){
    ctx.beginPath();ctx.moveTo(-9,34);ctx.quadraticCurveTo(0,23,11,35);
    stroke(ctx,2.3);ctx.stroke();
  }else if(sleepy){
    ctx.beginPath();ctx.moveTo(-7,27);ctx.quadraticCurveTo(2,32,10,27);
    stroke(ctx,2.1);ctx.stroke();
  }else{
    ctx.beginPath();ctx.moveTo(-12,27);ctx.quadraticCurveTo(0,42,13,27);
    stroke(ctx,2.4);ctx.stroke();
  }
  ctx.restore();
}

function hand(ctx:CanvasRenderingContext2D,x:number,y:number){
  oval(ctx,x,y,6.5,7,SKIN,2.5);
}
function arm(
  ctx:CanvasRenderingContext2D,
  side:-1|1,
  pose:DoodlePose,
  t:number
){
  const sx=side*43,sy=-21;
  let ex=side*73,ey=64;
  if(pose==='relieved'){ex=side*102;ey=-42+(side===1?Math.sin(Math.min(t,1.2)*2)*4:0);}
  if(pose==='alert'){ex=side*91;ey=-59+(side===1?Math.sin(Math.min(t,1.1)*4)*5:0);}
  if(pose==='exhausted'){ex=side*66;ey=83;}
  if(pose==='point'&&side===1){ex=106;ey=-26;}
  // Two-step bent arm instead of a long rigid diagonal.
  const elbowX=sx+(ex-sx)*.61,elbowY=sy+(ey-sy)*.40;
  ctx.beginPath();ctx.moveTo(sx,sy);
  ctx.quadraticCurveTo(elbowX,elbowY,ex,ey);
  stroke(ctx,3.7);ctx.stroke();hand(ctx,ex,ey);
}
/**
 * Person origin is the shirt center. Feet end roughly 141 local px lower;
 * face is roughly 105 px above. This matches the compact reference figure.
 */
export function drawDoodlePerson(
  ctx:CanvasRenderingContext2D,
  x:number,y:number,size:number,mood:Mood,
  t:number,raised=false,shirt=SHIRT,requestedPose?:DoodlePose
){
  const pose: DoodlePose = requestedPose ??
    (raised?'relieved':mood==='sleepy'?'exhausted':mood==='overwhelmed'?'alert':'neutral');
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);
  const breathing=1+.006*Math.sin(Math.min(t,3)*2.2);
  ctx.scale(breathing,1);

  // Hair-thin legs, each with its own angle and flat little shoe.
  curve(ctx,[[-21,79],[-22,119],[-25,139]],3.7);
  curve(ctx,[[19,79],[20,120],[25,139]],3.7);
  curve(ctx,[[-25,140],[-33,143]],3);
  curve(ctx,[[25,140],[32,143]],3);
  arm(ctx,-1,pose,t);
  arm(ctx,1,pose,t);

  // Pear/trapezoid tunic with a square, outlined belly pocket.
  ctx.fillStyle=shirt;ctx.beginPath();
  ctx.moveTo(-31,-49);
  ctx.bezierCurveTo(-55,-40,-60,-10,-56,19);
  ctx.bezierCurveTo(-57,55,-39,82,-1,85);
  ctx.bezierCurveTo(36,85,59,54,57,19);
  ctx.bezierCurveTo(56,-10,52,-39,31,-48);
  ctx.quadraticCurveTo(0,-60,-31,-49);
  ctx.closePath();ctx.fill();stroke(ctx,3.2);ctx.stroke();
  ctx.fillStyle='rgba(54,85,43,.15)';ctx.beginPath();
  ctx.moveTo(-26,27);ctx.lineTo(27,27);ctx.lineTo(23,57);ctx.lineTo(-23,57);ctx.closePath();
  ctx.fill();stroke(ctx,2.1);ctx.stroke();
  // Neck is only a short line, preserving the head's separate outline.
  curve(ctx,[[-8,-52],[-8,-60]],2.6);curve(ctx,[[9,-52],[9,-59]],2.6);
  drawDoodleHead(ctx,0,-106,mood,t,.9);
  ctx.restore();
}

/** Small pink character with recognisable folds, eyes, arms and thin legs. */
export function drawDoodleBrain(
 ctx:CanvasRenderingContext2D,
 x:number,y:number,size:number,t:number,happy=true
){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);
  // Restrict motion to a 1.5px rock during the first second.
  ctx.rotate(Math.sin(Math.min(t,1)*2.7)*.018);
  // Stick limbs behind the pink outline.
  curve(ctx,[[-23,51],[-22,86]],2.9);curve(ctx,[[22,52],[22,86]],2.9);
  curve(ctx,[[-23,86],[-31,86]],2.7);curve(ctx,[[22,86],[30,86]],2.7);
  curve(ctx,[[-47,5],[-77,-10]],3.1);curve(ctx,[[48,5],[78,-14]],3.1);
  oval(ctx,-79,-10,5.3,5.3,SKIN,2);oval(ctx,78,-14,5.3,5.3,SKIN,2);

  ctx.fillStyle=PINK;ctx.beginPath();
  ctx.moveTo(-45,-29);
  ctx.bezierCurveTo(-53,-44,-42,-59,-27,-54);
  ctx.bezierCurveTo(-17,-68,-1,-64,7,-55);
  ctx.bezierCurveTo(25,-67,44,-57,45,-40);
  ctx.bezierCurveTo(66,-34,61,-14,54,-3);
  ctx.bezierCurveTo(69,19,51,41,38,42);
  ctx.bezierCurveTo(29,57,6,57,-2,51);
  ctx.bezierCurveTo(-22,60,-40,48,-43,34);
  ctx.bezierCurveTo(-61,30,-64,9,-54,-6);
  ctx.bezierCurveTo(-65,-17,-58,-28,-45,-29);
  ctx.closePath();ctx.fill();stroke(ctx,3);ctx.stroke();

  // A few subtle folds, not anatomical squiggles.
  ctx.beginPath();
  ctx.moveTo(-2,-52);ctx.bezierCurveTo(-16,-36,-1,-27,-10,-17);
  ctx.moveTo(-39,-28);ctx.bezierCurveTo(-26,-34,-23,-17,-35,-11);
  ctx.moveTo(27,-34);ctx.bezierCurveTo(11,-21,30,-17,20,-6);
  stroke(ctx,1.75);ctx.stroke();
  if(happy){
    oval(ctx,-19,11,8.1,9.5,'#FFFCFA',2);
    oval(ctx,22,11,8.1,9.5,'#FFFCFA',2);
    oval(ctx,-17,11,3.1,3.5,INK,0);
    oval(ctx,24,11,3.1,3.5,INK,0);
    ctx.beginPath();ctx.moveTo(-6,28);ctx.quadraticCurveTo(2,39,12,28);
    stroke(ctx,2.3);ctx.stroke();
  }else{
    ctx.beginPath();ctx.arc(-19,14,7,.2,Math.PI-.1);
    ctx.arc(23,14,7,.2,Math.PI-.1);
    stroke(ctx,2.2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-8,33);ctx.quadraticCurveTo(3,22,13,33);
    stroke(ctx,2.3);ctx.stroke();
  }
  ctx.restore();
}
