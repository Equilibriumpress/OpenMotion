// Original stereo procedural soundtrack, used by both preview and export.
const cache=new Map<string,Promise<AudioBuffer>>();
export function createParallaxAudio(seconds:number,variant:'window-seat'|'living-travel-poster'='window-seat'):Promise<AudioBuffer>{
 const duration=Math.max(.5,Math.round(seconds*100)/100);
 const key=variant+':'+duration;const old=cache.get(key);if(old)return old;
 const p=Promise.resolve().then(()=>{
 const rate=48000,frames=Math.ceil(rate*duration),b=new AudioBuffer({length:frames,numberOfChannels:2,sampleRate:rate});
 const l=b.getChannelData(0),r=b.getChannelData(1);let seed=621,low=0,wind=0;
 if(variant==='living-travel-poster'){
 const chord=[[130.81,164.81,196,261.63],[110,130.81,164.81,220],[87.31,130.81,174.61,220],[98,123.47,146.83,196]];
 for(let i=0;i<frames;i++){const t=i/rate,q=t/duration*22;seed=(Math.imul(seed,1664525)+1013904223)|0;const white=(seed>>>0)/2147483648-1;low=.978*low+.022*white;wind=.997*wind+.003*white;const fade=Math.max(0,Math.min(1,t/.5,(duration-t)/.8));const move=Math.max(0,Math.min(1,(q-2)/2,(21-q)/3));const f=chord[Math.min(3,Math.floor(q/5.5))];const beat=t%1.35;let music=0;for(let j=0;j<f.length;j++){music+=Math.sin(t*2*Math.PI*f[j])*.012+Math.sin(t*2*Math.PI*f[j]*2)*.003;}music+=Math.sin(beat*2*Math.PI*f[Math.floor(t/1.35)%4]*2)*Math.exp(-beat*5)*.032;const wheel=Math.exp(-(t*3.2%1)*29)*(white*.042+Math.sin(t*2*Math.PI*85)*.037)*move;const whistle=Math.exp(-Math.pow((q-4.1)/.48,2))*(Math.sin(t*2*Math.PI*415)+.45*Math.sin(t*2*Math.PI*554))*.034;const fall=Math.exp(-Math.pow((q-12)/4,2))*(low*.25+white*.012)*move;const chirp=Math.exp(-Math.pow((q-9.3)/.22,2))*Math.sin(2*Math.PI*(1700*t+35*Math.sin(t*7)))*.009;const paper=(Math.exp(-Math.pow((q-2.1)/.25,2))+Math.exp(-Math.pow((q-20.5)/.25,2)))*white*.017;const v=(music+wheel+whistle+fall+chirp+paper+wind*.35*move)*fade;l[i]=v+low*.018*move*fade;r[i]=v-low*.018*move*fade;}
 return b;
 }
 const chords=[[130.81,164.81,196,293.66],[110,130.81,164.81,261.63],[87.31,130.81,174.61,220],[98,146.83,196,246.94]];
 for(let i=0;i<frames;i++){const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)|0;const white=(seed>>>0)/2147483648-1;low=.982*low+.018*white;wind=.998*wind+.002*white;
 const fade=Math.min(1,t/1.1,(duration-t)/1.8);const slow=1-.78*Math.max(0,Math.min(1,(t-30)/7));const phase=(t*(t>30?2.1:2.7))%1;const clack=Math.exp(-phase*34)*(.07*Math.sin(t*2*Math.PI*92)+white*.065)*slow;
 const roll=(low*.37+Math.sin(t*2*Math.PI*37)*.026)*slow;const n=Math.floor(t/8),u=t%8;const env=Math.min(1,u/1.5,(8-u)/1.2);let music=0;for(const f of chords[n%4])music+=Math.sin(t*2*Math.PI*f)*.013*env;const beat=t%1.6;const note=chords[n%4][Math.floor(t/1.6)%4]*2;music+=Math.sin(beat*2*Math.PI*note)*Math.exp(-beat*4)*.024;
 const x=(music+clack+roll+wind*.3)*fade;l[i]=x+low*.025*fade;r[i]=x-low*.025*fade;
 }return b;
 }).catch(e=>{cache.delete(key);throw e;});cache.set(key,p);return p;
}
