import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';

// The model is the converted MIT-licensed Microsoft Rocketbox Business female 04.
// Upstream: https://github.com/InterviewFlowAI/talking-avatar (v0.3.0).
// Face framing and morph-name compatibility informed by upstream renderer (MIT).
// See public/presenter-lab-licenses.txt.
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
   // Anchor framing to the actual face vertices; a T-pose bounding box is not a portrait.
   const faceBox=new THREE.Box3(),vertex=new THREE.Vector3();
   model.traverse(o=>{
    if(!(o instanceof THREE.Mesh)||!o.morphTargetDictionary)return;
    for(const [name,index] of Object.entries(o.morphTargetDictionary)){
     if(!/^(eyeblink(left|right)|jawopen)$|(?:leyeclose|reyeclose|mouthopen)_h$/i.test(name))continue;
     const delta=o.geometry.morphAttributes.position?.[index];if(!delta)continue;
     for(let i=0;i<delta.count;i++){if(Math.abs(delta.getX(i))+Math.abs(delta.getY(i))+Math.abs(delta.getZ(i))>1e-4)faceBox.expandByPoint(o.localToWorld(o.getVertexPosition(i,vertex)));}
    }
   });
   const faceBone=model.getObjectByName('Head');
   const target=!faceBox.isEmpty()?faceBox.getCenter(new THREE.Vector3()):faceBone?faceBone.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.05,0)):new THREE.Vector3(center.x,bounds.max.y-size.y*.10,center.z);
   // Rocketbox assets are in metres; crop at the head/neck (upstream framing reference).
   const cropHeight=Math.max(.42,.3/(160/198));
   const camera=new THREE.PerspectiveCamera(22,160/198,.01,100);
   camera.position.set(target.x,target.y+.025,target.z+cropHeight/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))));
   camera.lookAt(target.x,target.y+.008,target.z);camera.updateProjectionMatrix();
   stage.add(new THREE.HemisphereLight('#FFF4E4','#6B7886',1.8));
   const key=new THREE.DirectionalLight('#FFF2DF',2.4);key.position.copy(target).add(new THREE.Vector3(-.8,.5,1.2));stage.add(key);
   const fill=new THREE.DirectionalLight('#DDEBFF',.9);fill.position.copy(target).add(new THREE.Vector3(.9,.15,1));stage.add(fill);
   const morphs:Morph[]=[];const bones:THREE.Bone[]=[];
   model.traverse(o=>{
    if(o instanceof THREE.Bone&&/^(?:mixamorig[:_])?head$/i.test(o.name))bones.push(o);
    if(o instanceof THREE.Mesh&&o.morphTargetDictionary&&o.morphTargetInfluences){
     for(const [name,index] of Object.entries(o.morphTargetDictionary))morphs.push({weights:o.morphTargetInfluences,index,name:name.toLowerCase()});
    }
   });
   if(!morphs.some(m=>/viseme_aa|ae_aa_h|jawopen/.test(m.name)))throw Error('Rocketbox model mist verwachte mond-morphs.');
   const head=bones[0];
   rig={renderer,stage,camera,model,morphs,head,headBase:head?.rotation.clone()};
  }catch(e){renderer?.dispose();loadError=e instanceof Error?e.message:String(e);throw e;}
 })().finally(()=>{loading=undefined;});
 return loading;
}
const mouthPatterns=[
 /viseme_(sil|pp)$|mouthclose$|(?:mpb_up|mpb_down|mbp|m_b_p)_h$/,
 /viseme_aa$|ae_aa_h$|jawopen$/,
 /viseme_(e|i)$|(?:ax_e|td_i|ee|ih)_h$/,
 /viseme_o$|(?:ao_a|oh|ao)_h$|mouthfunnel$/,
 /viseme_u$|(?:uw_u|ou|uw|kiss)_h$|mouthpucker$/,
 /viseme_ff$|(?:fv|f_v)_h$/,
 /viseme_(th|dd|nn)$|(?:td_i|th|td)_h$/,
 /viseme_(kk|ch|ss|rr)$|(?:kg|sh_ch|s|uh_oo|ch|sh)_h$/
];
function cue(s:OpenMotionScene,key:string){return s.doodle?.extras?.find(x=>x.startsWith(key+':'))?.slice(key.length+1)??'';}
export function renderRocketboxPresenter(c:CanvasRenderingContext2D,s:OpenMotionScene,t:number){
 if(!rig){
  c.save();c.fillStyle='#766E61';c.font='600 12px system-ui';c.fillText(loadError?'3D-avatar niet geladen':'3D-avatar laden…',18,750,164);c.restore();return;
 }
 const r=rig,energy=cue(s,'host-energy'),shapes=cue(s,'host-mouth'),f=clamp(t*30,0,Math.max(0,energy.length-1)),i=Math.floor(f),frac=f-i;
 const a=energy.length?((Number(energy[i])||0)*(1-frac)+(Number(energy[Math.min(i+1,energy.length-1)])||0)*frac)/9:0;
 // Symmetric, time-local smoothing (no mutable playback history).
 const weights=Array(8).fill(0) as number[];
 for(let d=-2;d<=2;d++){
  const k=Math.max(0,Math.min(shapes.length-1,i+d)),v=shapes.length?clamp(Number(shapes[k])||0,0,7):0;
  const w=Math.max(0,3-Math.abs(d-frac));weights[v]+=w;
 }
 const sum=weights.reduce((n,x)=>n+x,0)||1;for(let n=0;n<8;n++)weights[n]/=sum;
 const closure=shapes.length?Number(shapes[Math.min(i,shapes.length-1)])===0:true;
 if(closure){weights.fill(0);weights[0]=1;}
 const blinks=cue(s,'host-blinks').split(',').filter(Boolean).map(Number);
 const blink=blinks.reduce((n,b)=>Math.max(n,1-clamp(Math.abs(t-b)/.10)),0);
 const shot=cue(s,'shot'),look=shot==='cover'||shot==='limits'?0:Math.sin(Math.PI*clamp(t/Math.max(.001,s.durationSec)))*.12;
 if(r.head&&r.headBase){r.head.rotation.copy(r.headBase);r.head.rotation.y+=look;r.head.rotation.z+=Math.sin(t*1.3)*.025;}
 for(const m of r.morphs){
  let x=0;
  if(/eyeblink(left|right)$|blink_[lr]$|(?:leyeclose|reyeclose)_h$/.test(m.name))x=blink;
  else if(/browinnerup$|(?:lbrowup|rbrowup)_h$/.test(m.name))x=shot==='limits'?.08:.18;
  else if(/mouthsmile(left|right)$/.test(m.name))x=shot==='cover'?.16:.07;
  else if(/jawopen$|mouthopen_h$/.test(m.name))x=a*.14*(1-weights[0]);
  else if(mouthPatterns[0].test(m.name))x=a>.08?.7*weights[0]:0;
  else for(let v=1;v<8;v++)if(mouthPatterns[v].test(m.name))x=Math.max(x,a*weights[v]*(v===1?.52:.85));
  m.weights[m.index]=x;
 }
 const scale=Math.max(1,c.getTransform().a),w=Math.ceil(160*scale),h=Math.ceil(198*scale);
 if(r.renderer.domElement.width!==w||r.renderer.domElement.height!==h)r.renderer.setSize(w,h,false);
 r.renderer.render(r.stage,r.camera);
 c.save();c.beginPath();c.roundRect(12,610,160,198,12);c.clip();c.drawImage(r.renderer.domElement,12,610,160,198);c.restore();
}
