// Small, bounded SVG path reader for the original cinematic illustrations.
// Deliberately replay commands through the current Canvas path. Avoids
// Path2D overloads and ellipse overloads on embedded WebKit contexts.
type C=CanvasRenderingContext2D;
type Command={op:string;args:number[]};
const cache=new Map<string,Command[]>();
const arity:Record<string,number>={M:2,L:2,H:1,V:1,Q:4,C:6,Z:0};
function parse(d:string):Command[]{
 const found=cache.get(d);if(found){cache.delete(d);cache.set(d,found);return found;}
 const tokens=d.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g)??[];
 const out:Command[]=[];let i=0,op='';
 while(i<tokens.length){
  if(/^[a-zA-Z]$/.test(tokens[i]))op=tokens[i++];
  const upper=op.toUpperCase(),n=arity[upper];
  if(n===undefined)throw new Error('Unsupported cinematic path command: '+op);
  if(n===0){out.push({op,args:[]});op='';continue;}
  const values=tokens.slice(i,i+n).map(Number);
  if(values.length!==n||values.some(v=>!Number.isFinite(v)))throw new Error('Incomplete cinematic path: '+op);
  out.push({op,args:values});i+=n;
  if(upper==='M')op=op==='M'?'L':'l';
 }
 if(cache.size>=192){const key=cache.keys().next().value;if(key!==undefined)cache.delete(key);}
 cache.set(d,out);return out;
}
export function traceSongPath(c:C,d:string){
 c.beginPath();let x=0,y=0,sx=0,sy=0;
 for(const {op,args:a} of parse(d)){
  const rel=op===op.toLowerCase(),dx=rel?x:0,dy=rel?y:0;
  switch(op.toUpperCase()){
   case 'M':x=dx+a[0];y=dy+a[1];sx=x;sy=y;c.moveTo(x,y);break;
   case 'L':x=dx+a[0];y=dy+a[1];c.lineTo(x,y);break;
   case 'H':x=dx+a[0];c.lineTo(x,y);break;
   case 'V':y=dy+a[0];c.lineTo(x,y);break;
   case 'Q':c.quadraticCurveTo(dx+a[0],dy+a[1],dx+a[2],dy+a[3]);x=dx+a[2];y=dy+a[3];break;
   case 'C':c.bezierCurveTo(dx+a[0],dy+a[1],dx+a[2],dy+a[3],dx+a[4],dy+a[5]);x=dx+a[4];y=dy+a[5];break;
   case 'Z':c.closePath();x=sx;y=sy;break;
  }
 }
}
// A rotated elliptical arc expressed as cubic segments. Uses only required
// numeric arguments and is accurate to subpixel precision at this design scale.
export function songEllipse(c:C,x:number,y:number,rx:number,ry:number,rotation=0,start=0,end=Math.PI*2){
 const sweep=end-start,n=Math.max(1,Math.ceil(Math.abs(sweep)/(Math.PI/2))),step=sweep/n;
 const co=Math.cos(rotation),si=Math.sin(rotation);
 const p=(u:number,v:number):[number,number]=>[x+co*u-si*v,y+si*u+co*v];
 c.moveTo(...p(rx*Math.cos(start),ry*Math.sin(start)));
 for(let i=0;i<n;i++){
  const a=start+i*step,b=a+step,k=4/3*Math.tan(step/4);
  const a1=p(rx*(Math.cos(a)-k*Math.sin(a)),ry*(Math.sin(a)+k*Math.cos(a)));
  const b1=p(rx*(Math.cos(b)+k*Math.sin(b)),ry*(Math.sin(b)-k*Math.cos(b)));
  const e=p(rx*Math.cos(b),ry*Math.sin(b));
  c.bezierCurveTo(...a1,...b1,...e);
 }
 if(Math.abs(Math.abs(sweep)-Math.PI*2)<1e-8)c.closePath();
}
