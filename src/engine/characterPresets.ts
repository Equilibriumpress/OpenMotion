// Catalog and outfit semantics adapted from Avatar Studio (MIT, Rohit Biradar).
// Models: Microsoft Rocketbox (MIT). Full notices in public/character-studio-licenses.txt.
import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';
export const CHARACTER_REV='2fd9ec82fbe1613d40ae38aadcca3f410725f740';
const BASE='https://cdn.jsdelivr.net/gh/memoriesrohit/avatar-studio@'+CHARACTER_REV+'/models/';
export const PEOPLE=[
 ['sophia','Sophia','formal'],['mia','Mia','smart'],['priya','Priya','casual'],['emma','Emma','casual'],['aisha','Aisha','formal'],['olivia','Olivia','smart'],['mei','Mei','casual'],['hannah','Hannah','casual'],
 ['daniel','Daniel','formal'],['marcus','Marcus','formal'],['arjun','Arjun','smart'],['ryan','Ryan','smart'],['james','James','formal'],['kenji','Kenji','formal'],['leo','Leo','smart'],['ethan','Ethan','casual'],['noah','Noah','smart'],['luca','Luca','smart'],['carlos','Carlos','casual'],['andre','Andre','casual']
] as const;
export const TOPS=['formal','shirt','tee','original'] as const;
export const MOVES=['Idle','Talk','Confident','Think','Wave','Shrug','Clap','Laugh','Walk','Argue','Cheer','Drink','Phone'] as const;
export const EXPRESSIONS=['Neutral','Smile','Confident','Serious','Surprised','Excited','Big laugh','Angry','Sad','Wink'] as const;
export interface CharacterPreset {name:string;person:string;top:typeof TOPS[number];tint:string|null;trousers:'black'|'blue';expression:typeof EXPRESSIONS[number];move:typeof MOVES[number];}
export const DEFAULT_CHARACTER:CharacterPreset={name:'Alex',person:'sophia',top:'formal',tint:'#2f5d50',trousers:'black',expression:'Confident',move:'Talk'};
export function sanitizeCharacter(input:unknown):CharacterPreset{
 const p=(input&&typeof input==='object'?input:{}) as Partial<CharacterPreset>;
 return {name:typeof p.name==='string'?p.name.trim().slice(0,40)||'Alex':'Alex',person:PEOPLE.some(x=>x[0]===p.person)?p.person!:DEFAULT_CHARACTER.person,top:TOPS.includes(p.top!)?p.top!:'formal',tint:p.tint===null?null:typeof p.tint==='string'&&/^#[a-f0-9]{6}$/i.test(p.tint)?p.tint:DEFAULT_CHARACTER.tint,trousers:p.trousers==='blue'?'blue':'black',expression:EXPRESSIONS.includes(p.expression!)?p.expression!:'Confident',move:MOVES.includes(p.move!)?p.move!:'Talk'};
}
export function characterModel(p:CharacterPreset){const x=PEOPLE.find(v=>v[0]===p.person)??PEOPLE[0];return BASE+x[0]+'_'+x[2]+'.glb';}
export function characterThumb(person:string){return BASE+'thumbs/'+(PEOPLE.find(x=>x[0]===person)?.[0]??'sophia')+'.jpg';}
export function characterFromScene(s:OpenMotionScene):CharacterPreset|null{
 const data=s.doodle?.extras?.find(x=>x.startsWith('character-preset:'));
 if(!data)return null;try{return sanitizeCharacter(JSON.parse(data.slice('character-preset:'.length)));}catch{return null;}
}
export function applyCharacter(p:OpenMotionProject,c:CharacterPreset):OpenMotionProject{
 const preset=sanitizeCharacter(c);
 return {...p,scenes:p.scenes.map(s=>s.doodle?{...s,doodle:{...s.doodle,extras:[...(s.doodle.extras??[]).filter(x=>!x.startsWith('character-preset:')&&x!=='presenter-lab-rocketbox'),'presenter-lab-rocketbox','character-preset:'+JSON.stringify(preset)]}}:s)};
}
