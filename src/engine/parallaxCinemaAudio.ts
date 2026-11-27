// Original stereo procedural soundtrack, used by both preview and export.
const cache=new Map<number,Promise<AudioBuffer>>();
export function createParallaxAudio(seconds:number):Promise<AudioBuffer>{
 const duration=Math.max(.5,Math.round(seconds*100)/100);
 const old=cache.get(duration);if(old)return old;
 const p=Promise.resolve().then(()=>{
 const rate=48000,frames=Math.ceil(rate*duration),b=new AudioBuffer({length:frames,numberOfChannels:2,sampleRate:rate});
 const l=b.getChannelData(0),r=b.getChannelData(1);let seed=621,low=0,wind=0;
 const chords=[[130.81,164.81,196,293.66],[110,130.81,164.81,261.63],[87.31,130.81,174.61,220],[98,146.83,196,246.94]];
 for(let i=0;i<frames;i++){const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)|0;const white=(seed>>>0)/2147483648-1;low=.982*low+.018*white;wind=.998*wind+.002*white;
 const fade=Math.min(1,t/1.1,(duration-t)/1.8);const slow=1-.78*Math.max(0,Math.min(1,(t-30)/7));const phase=(t*(t>30?2.1:2.7))%1;const clack=Math.exp(-phase*34)*(.07*Math.sin(t*2*Math.PI*92)+white*.065)*slow;
 const roll=(low*.37+Math.sin(t*2*Math.PI*37)*.026)*slow;const n=Math.floor(t/8),u=t%8;const env=Math.min(1,u/1.5,(8-u)/1.2);let music=0;for(const f of chords[n%4])music+=Math.sin(t*2*Math.PI*f)*.013*env;const beat=t%1.6;const note=chords[n%4][Math.floor(t/1.6)%4]*2;music+=Math.sin(beat*2*Math.PI*note)*Math.exp(-beat*4)*.024;
 const x=(music+clack+roll+wind*.3)*fade;l[i]=x+low*.025*fade;r[i]=x-low*.025*fade;
 }return b;
 }).catch(e=>{cache.delete(duration);throw e;});cache.set(duration,p);return p;
}
