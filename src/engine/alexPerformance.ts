import type { OpenMotionScene } from '../types/openmotion';
export const PERFORMANCE_MARKER='alex-performance-v1';
export const EMOTIONS=['authored','curious','explain','enthusiastic','thoughtful','warning','closing'] as const;
export type AlexEmotion=typeof EMOTIONS[number];
export type AlexPerformance={emotion:AlexEmotion;motion:number;hair:number;look:'authored'|'viewer'|'graphic';};
export const DEFAULT_PERFORMANCE:AlexPerformance={emotion:'authored',motion:.65,hair:.55,look:'authored'};
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function sanitizePerformance(x:unknown):AlexPerformance{
 const p=(x&&typeof x==='object'?x:{}) as Partial<AlexPerformance>;
 return {emotion:EMOTIONS.includes(p.emotion!)?p.emotion!:'authored',motion:typeof p.motion==='number'&&Number.isFinite(p.motion)?clamp(p.motion):.65,hair:typeof p.hair==='number'&&Number.isFinite(p.hair)?clamp(p.hair):.55,look:p.look==='viewer'||p.look==='graphic'?p.look:'authored'};
}
const cache=new WeakMap<OpenMotionScene,AlexPerformance>();
export function performanceFor(s:OpenMotionScene){
 const old=cache.get(s);if(old)return old;
 const raw=s.doodle?.extras?.find(x=>x.startsWith('alex-performance:'))?.slice('alex-performance:'.length);
 let p=DEFAULT_PERFORMANCE;try{if(raw)p=sanitizePerformance(JSON.parse(raw));}catch{/* preserve authored performance */}
 cache.set(s,p);return p;
}
export function withPerformance(s:OpenMotionScene,p:AlexPerformance):OpenMotionScene{
 if(!s.doodle)return s;
 const extras=(s.doodle.extras??[]).filter(x=>x!==PERFORMANCE_MARKER&&!x.startsWith('alex-performance:')&&x!=='presenter-lab-rocketbox'&&x!=='cartoon-cinema-v1'&&!x.startsWith('character-preset:')&&!x.startsWith('cartoon-avatar:'));
 for(const marker of ['simply-explained-v2','alex-26','alex-27-layout',PERFORMANCE_MARKER])if(!extras.includes(marker))extras.push(marker);
 extras.push('alex-performance:'+JSON.stringify(sanitizePerformance(p)));
 return {...s,doodle:{...s.doodle,extras}};
}
export type PerformancePose={yaw:number;tilt:number;gazeX:number;gazeY:number;brow:number;smile:number;arm:number;gesture:number};
const expressions:Record<AlexEmotion,{brow:number;smile:number;tilt:number;eye:number;lean:number}>={
 authored:{brow:0,smile:0,tilt:0,eye:0,lean:0},curious:{brow:.38,smile:.12,tilt:-.14,eye:.16,lean:.10},
 explain:{brow:.08,smile:.14,tilt:0,eye:.03,lean:.08},enthusiastic:{brow:.26,smile:.38,tilt:-.10,eye:.14,lean:.25},
 thoughtful:{brow:-.06,smile:-.08,tilt:.16,eye:-.10,lean:-.06},warning:{brow:-.27,smile:-.36,tilt:.04,eye:-.08,lean:.12},
 closing:{brow:.12,smile:.30,tilt:0,eye:.03,lean:0}
};
export function directPose(p:PerformancePose,config:AlexPerformance,t:number,duration:number){
 const a=expressions[config.emotion],m=.50+config.motion*.55,edge=clamp(Math.min(t,duration-t)/.35),fade=edge*edge*(3-2*edge);
 // Deterministic eye darts: small, brief shifts, never a random or playback-dependent animation.
 const micro=(Math.sin(t*2.7)+.4*Math.sin(t*5.1))*.055*fade;
 const gx=config.look==='viewer'?0:config.look==='graphic'?.85:p.gazeX;
 const gy=config.look==='viewer'?0:config.look==='graphic'?-.55:p.gazeY;
 return {...p,yaw:clamp((config.look==='viewer'?p.yaw*.45:config.look==='graphic'?Math.max(.5,p.yaw):p.yaw)*m,-1,1),
 tilt:clamp(p.tilt*m+a.tilt*fade,-1,1),gazeX:clamp(gx+micro,-1,1),gazeY:clamp(gy+micro*.35,-1,1),
 brow:clamp(p.brow+a.brow*fade,-1,1),smile:clamp(p.smile+a.smile*fade,-1,1),arm:clamp(.10+(p.arm-.10)*m),gesture:p.gesture};
}
export function expressionDetail(p:AlexPerformance){return expressions[p.emotion];}
export type SpeechShape={width:number;opening:number;teeth:number;tongue:number;closure:number};
const widths=[1,1.05,1.12,.70,.52,1,.92,.82],openings=[0,.85,.42,.76,.58,.28,.52,.33];
/** Symmetric coarticulation with explicit closures and silence. Same result at any frame order. */
export function sampleSpeechShape(energy:string,mouth:string,t:number):SpeechShape{
 const i=Math.max(0,Math.floor(t*30)),f=Math.max(0,t*30-i);
 const at=(s:string,k:number)=>Number(s[Math.max(0,Math.min(s.length-1,k))])||0;
 const level=(at(energy,i)*(1-f)+at(energy,i+1)*f)/9;
 const current=at(mouth,i);
 if(level<.06||current===0)return {width:1,opening:0,teeth:0,tongue:0,closure:1};
 let w=0,o=0,teeth=0,tongue=0,total=0;
 for(let d=-2;d<=2;d++){
  const n=clamp(at(mouth,i+d),0,7),weight=Math.max(0,2.7-Math.abs(d-f));
  w+=widths[n]*weight;o+=openings[n]*weight;
  teeth+=([2,5,6,7].includes(n)?1:0)*weight;tongue+=(n===1?1:0)*weight;total+=weight;
 }
 return {width:w/Math.max(1,total),opening:clamp(o/Math.max(1,total)*level),teeth:teeth/Math.max(1,total),tongue:tongue/Math.max(1,total),closure:0};
}
