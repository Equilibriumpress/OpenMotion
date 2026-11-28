import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';

// The model is the converted MIT-licensed Microsoft Rocketbox Business female 04.
// Upstream: https://github.com/InterviewFlowAI/talking-avatar (v0.3.0).
// Only Presenter Lab requests this asset. The main series remains unchanged.
export const ROCKETBOX_URL='https://cdn.jsdelivr.net/npm/@interviewflowai/talking-avatar@0.3.0/dist/avatars/female.glb';
export const ROCKETBOX_MARKER='presenter-lab-rocketbox';
type Morph={weights:number[];index:number;name:string};
type Rig={renderer:THREE.WebGLRenderer;stage:THREE.Scene;camera:THREE.PerspectiveCamera;model:THREE.Object3D;morphs:Morph[];head?:THREE.Bone;headBase?:THREE.Euler};
let rig:Rig|undefined,loading:Promise<void>|undefined,loadError='';
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function hasRocketbox(project:OpenMotionProject){return project.scenes.some(s=>s.doodle?.extras?.includes(ROCKETBOX_MARKER));}
export function rocketboxReady(){return !!rig;}
export function rocketboxError(){return loadError;}
export async function prepareRocketbox():Promise<void>{
 if(rig)return;
 if(loading)return loading;
 loadError='';
 loading=(async()=>{
  let renderer:THREE.WebGLRenderer|undefined;
  try{
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
   renderer.setPixelRatio(1);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
   renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
   const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
   const asset=await loader.loadAsync(ROCKETBOX_URL);
   const stage=new THREE.Scene(),model=asset.scene;stage.add(model);
   model.updateMatrixWorld(true);
   const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
   if(!Number.isFinite(size.y)||size.y<=.001)throw Error('Rocketbox model heeft geen geldige geometrie.');
   // Frame a full-body model above the chest; a portrait-only asset gets fitted as-is.
   const fullBody=size.y/Math.max(.001,size.x)>2.05;
   const cropHeight=fullBody?size.y*.36:Math.max(size.y,size.x*1.25)*1.12;
   const target=new THREE.Vector3(center.x,fullBody?bounds.max.y-cropHeight*.48:center.y,center.z);
   const camera=new THREE.PerspectiveCamera(29,160/198,Math.max(.001,size.y*.002),Math.max(100,size.y*100));
   camera.position.set(target.x,target.y,target.z+cropHeight/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov*.5)))+size.z*.20);
   camera.lookAt(target);camera.updateProjectionMatrix();
   stage.add(new THREE.HemisphereLight('#FFF4E4','#6B7886',2.4));
   const key=new THREE.DirectionalLight('#FFF2DF',3.2);key.position.copy(target).add(new THREE.Vector3(-size.y,size.y,size.y*2));stage.add(key);
   const fill=new THREE.DirectionalLight('#DDEBFF',1.25);fill.position.copy(target).add(new THREE.Vector3(size.y,size.y*.2,size.y));stage.add(fill);
   const morphs:Morph[]=[];let head:THREE.Bone|undefined;
   model.traverse(o=>{
    if(o instanceof THREE.Bone&&/^(?:mixamorig[:_])?head$/i.test(o.name))head=o;
    if(o instanceof THREE.Mesh&&o.morphTargetDictionary&&o.morphTargetInfluences){
     for(const [name,index] of Object.entries(o.morphTargetDictionary))morphs.push({weights:o.morphTargetInfluences,index,name:name.toLowerCase()});
    }
   });
   if(!morphs.some(m=>/viseme_aa|ae_aa_h|jawopen/.test(m.name)))throw Error('Rocketbox model mist verwachte mond-morphs.');
   rig={renderer,stage,camera,model,morphs,head,headBase:head?.rotation.clone()};
  }catch(e){renderer?.dispose();loadError=e instanceof Error?e.message:String(e);throw e;}
 })().finally(()=>{loading=undefined;});
 return loading;
}
const mouthPatterns=[
 /viseme_(sil|pp)$|mouthclose$|(?:mbp|m_b_p)_h$/,
 /viseme_aa$|ae_aa_h$|jawopen$/,
 /viseme_(e|i)$|(?:ee|ih)_h$/,
 /viseme_o$|(?:oh|ao)_h$|mouthfunnel$/,
 /viseme_u$|(?:ou|uw)_h$|mouthpucker$/,
 /viseme_ff$|(?:fv|f_v)_h$/,
 /viseme_(th|dd|nn)$|(?:th|td)_h$/,
 /viseme_(kk|ch|ss|rr)$|(?:ch|sh)_h$/
];
function cue(s:OpenMotionScene,key:string){return s.doodle?.extras?.find(x=>x.startsWith(key+':'))?.slice(key.length+1)??'';}
export function renderRocketboxPresenter(c:CanvasRenderingContext2D,s:OpenMotionScene,t:number){
 if(!rig){
  c.save();c.fillStyle='#766E61';c.font='600 12px system-ui';c.fillText(loadError?'3D-avatar niet geladen':'3D-avatar laden…',18,750,164);c.restore();return;
 }
 const r=rig,energy=cue(s,'host-energy'),shapes=cue(s,'host-mouth'),f=clamp(t*30,0,Math.max(0,energy.length-1)),i=Math.floor(f),frac=f-i;
 const a=energy.length?((Number(energy[i])||0)*(1-frac)+(Number(energy[Math.min(i+1,energy.length-1)])||0)*frac)/9:0;
 const v=shapes.length?clamp(Number(shapes[Math.min(i,shapes.length-1)])||0,0,7):0;
 const blinks=cue(s,'host-blinks').split(',').filter(Boolean).map(Number);
 const blink=blinks.reduce((n,b)=>Math.max(n,1-clamp(Math.abs(t-b)/.10)),0);
 const shot=cue(s,'shot'),look=shot==='cover'||shot==='limits'?0:Math.sin(Math.PI*clamp(t/Math.max(.001,s.durationSec)))*.12;
 if(r.head&&r.headBase){r.head.rotation.copy(r.headBase);r.head.rotation.y+=look;r.head.rotation.z+=Math.sin(t*1.3)*.025;}
 for(const m of r.morphs){
  let x=0;
  if(/eyeblink(left|right)$|blink_[lr]$/.test(m.name))x=blink;
  else if(/browinnerup$/.test(m.name))x=shot==='limits'?.08:.18;
  else if(/mouthsmile(left|right)$/.test(m.name))x=shot==='cover'?.16:.07;
  else if(/jawopen$/.test(m.name))x=v===0?0:a*.22;
  else if(v===0&&mouthPatterns[0].test(m.name))x=a>.08?.65:0;
  else if(v>0&&mouthPatterns[v].test(m.name))x=a*.78;
  m.weights[m.index]=x;
 }
 const scale=Math.max(1,c.getTransform().a),w=Math.ceil(160*scale),h=Math.ceil(198*scale);
 if(r.renderer.domElement.width!==w||r.renderer.domElement.height!==h)r.renderer.setSize(w,h,false);
 r.renderer.render(r.stage,r.camera);
 c.save();c.beginPath();c.roundRect(12,610,160,198,12);c.clip();c.drawImage(r.renderer.domElement,12,610,160,198);c.restore();
}
