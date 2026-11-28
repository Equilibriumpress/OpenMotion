import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import type { OpenMotionProject, OpenMotionScene } from '../types/openmotion';

/** Actual CC0 VRM assets by Polygonal Mind, 100 Avatars round 3.
 * Source registry: https://github.com/ToxSam/open-source-avatars/blob/main/data/avatars/100avatars-r3.json
 * VRM 0.x: use expression bind indices, not guessed target names.
 */
export const CARTOONS=[
 {id:'jenny',name:'Jenny',number:281,url:'https://arweave.net/kgTirc4OvUWbJhIKC2CB3_pYsYuB62KTj90IdE8s3sk',thumb:'https://arweave.net/4a6_AfH-PHvFMXqja7V42pF9hCn9ceIj5z5NAsK2SSs'},
 {id:'agnes',name:'Agnes',number:243,url:'https://arweave.net/c8mrbRq29sfQdovW1l_D2JYGOaCNF3JxTaUsmHTSNAg',thumb:'https://arweave.net/3tfu9NtwHFFrjZdw539J862UwKGc6yBsaL1b7z9sSOg'},
 {id:'anna',name:'Anna',number:270,url:'https://arweave.net/RqDioyluCcxDNHFPoXLUlbEQjhP1Fy9HtaGzLFVh0mE',thumb:'https://arweave.net/w1coZXsJed2XwPaVJ-vBz2yb2NYu-g8AIzwwmZbY-Gk'}
] as const;
export type CartoonId=typeof CARTOONS[number]['id'];
export const CARTOON_MARKER='cartoon-cinema-v1';
export function cartoonId(s:OpenMotionScene):CartoonId|null{
 if(!s.doodle?.extras?.includes(CARTOON_MARKER))return null;
 const id=s.doodle.extras.find(x=>x.startsWith('cartoon-avatar:'))?.slice(15);
 return CARTOONS.find(x=>x.id===id)?.id??'jenny';
}
export function hasCartoon(p:OpenMotionProject){return p.scenes.some(s=>cartoonId(s)!==null);}
export function applyCartoon(p:OpenMotionProject,id:CartoonId):OpenMotionProject{
 return {...p,scenes:p.scenes.map(s=>s.doodle?{...s,doodle:{...s.doodle,extras:[...(s.doodle.extras??[]).filter(x=>x!=='presenter-lab-rocketbox'&&x!==CARTOON_MARKER&&!x.startsWith('character-preset:')&&!x.startsWith('cartoon-avatar:')),CARTOON_MARKER,'cartoon-avatar:'+id]}}:s)};
}
type Bind={mesh:THREE.Mesh;index:number;weight:number};
type Arm={upper:THREE.Object3D;lower:THREE.Object3D;hand:THREE.Object3D;upperBase:THREE.Quaternion;lowerBase:THREE.Quaternion;side:number};
type Rig={arms:Arm[];id:CartoonId;renderer:THREE.WebGLRenderer;stage:THREE.Scene;camera:THREE.PerspectiveCamera;model:THREE.Object3D;groups:Map<string,Bind[]>;head:THREE.Object3D;headBase:THREE.Quaternion;faceMeshes:THREE.Mesh[]};
let rig:Rig|undefined,loading:Promise<void>|undefined,error='';
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export function cartoonReady(id:CartoonId){return rig?.id===id;}
function dispose(r:Rig){
 const assets=new Set<{dispose():void}>();
 r.model.traverse(o=>{if(o instanceof THREE.Mesh){assets.add(o.geometry);for(const mat of Array.isArray(o.material)?o.material:[o.material]){assets.add(mat);for(const v of Object.values(mat))if(v instanceof THREE.Texture)assets.add(v);}}});
 for(const a of assets)a.dispose();r.renderer.dispose();
}
export async function prepareCartoon(id:CartoonId):Promise<void>{
 if(rig?.id===id)return;
 if(loading){try{await loading;}catch{/* retry other model */}return prepareCartoon(id);}
 if(rig){dispose(rig);rig=undefined;}error='';
 loading=(async()=>{
  let renderer:THREE.WebGLRenderer|undefined;
  try{
   const source=CARTOONS.find(x=>x.id===id);if(!source)throw Error('Onbekend cartoonpersonage.');
   const response=await fetch(source.url,{signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error('VRM download mislukt: '+response.status);
   const asset=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(await response.arrayBuffer(),'');
   const json=asset.parser.json,vrm=json.extensions?.VRM;
   if(!vrm||String(vrm.meta?.licenseName).toUpperCase()!=='CC0')throw Error('VRM 0.x CC0 metadata ontbreekt.');
   const model=asset.scene,stage=new THREE.Scene();stage.add(model);
   // VRM 0.x is authored facing -Z. Rotate once to face the camera at +Z.
   model.rotation.y+=Math.PI;model.updateMatrixWorld(true);
   const meshes=new Map<number,THREE.Mesh[]>(),faceMeshes:THREE.Mesh[]=[];
   model.traverse(o=>{
    if(!(o instanceof THREE.Mesh))return;
    o.frustumCulled=false;
    const association=asset.parser.associations.get(o);
    const meshIndex=association?.meshes;
    if(typeof meshIndex==='number'){const list=meshes.get(meshIndex)??[];list.push(o);meshes.set(meshIndex,list);}
    if(o.morphTargetInfluences)faceMeshes.push(o);
    for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof THREE.MeshStandardMaterial){m.roughness=.92;m.metalness=0;}
   });
   // Some loader versions attach mesh association to the parent node rather than its primitive.
   for(let i=0;i<(json.nodes?.length??0);i++){
    const meshIndex=json.nodes[i]?.mesh;if(typeof meshIndex!=='number'||meshes.has(meshIndex))continue;
    const node=await asset.parser.getDependency('node',i) as THREE.Object3D;
    const list:THREE.Mesh[]=[];node.traverse(o=>{if(o instanceof THREE.Mesh&&o.morphTargetInfluences)list.push(o);});
    if(list.length)meshes.set(meshIndex,list);
   }
   const groups=new Map<string,Bind[]>();
   for(const g of vrm.blendShapeMaster?.blendShapeGroups??[]){
    const name=String(g.presetName??g.name??'').toLowerCase(),binds:Bind[]=[];
    for(const b of g.binds??[])for(const mesh of meshes.get(b.mesh)??[]){
      if(mesh.morphTargetInfluences&&Number.isInteger(b.index)&&b.index>=0&&b.index<mesh.morphTargetInfluences.length)binds.push({mesh,index:b.index,weight:clamp(Number(b.weight)/100)});
    }
    if(binds.length)groups.set(name,binds);
   }
   if(!['a','i','u','e','o','blink'].every(x=>groups.has(x)))throw Error('Model mist bruikbare VRM-mondvormen of knipperanimatie.');
   const headNode=vrm.humanoid?.humanBones?.find((x:{bone:string})=>x.bone==='head')?.node;
   if(!Number.isInteger(headNode))throw Error('Hoofdbot ontbreekt.');
   const head=await asset.parser.getDependency('node',headNode) as THREE.Object3D;
   const arms:Arm[]=[];
   for(const side of ['left','right']){
    const ids=['UpperArm','LowerArm','Hand'].map(part=>vrm.humanoid?.humanBones?.find((x:{bone:string})=>x.bone===side+part)?.node);
    if(!ids.every(Number.isInteger))continue;
    const [upper,lower,hand]=await Promise.all(ids.map(n=>asset.parser.getDependency('node',n))) as THREE.Object3D[];
    arms.push({upper,lower,hand,upperBase:upper.quaternion.clone(),lowerBase:lower.quaternion.clone(),side:side==='left'?1:-1});
   }
   model.updateMatrixWorld(true);
   const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),pos=head.getWorldPosition(new THREE.Vector3());
   if(!Number.isFinite(size.y)||size.y<=.01)throw Error('Ongeldige VRM geometrie.');
   // Frame bust rather than T-pose arms; adapt to stylized head proportions.
   const faceBox=new THREE.Box3(),vertex=new THREE.Vector3();
   for(const k of ['blink','a'])for(const bind of groups.get(k)??[]){
    const delta=bind.mesh.geometry.morphAttributes.position?.[bind.index];if(!delta)continue;
    for(let i=0;i<delta.count;i++){if(Math.abs(delta.getX(i))+Math.abs(delta.getY(i))+Math.abs(delta.getZ(i))>1e-4)faceBox.expandByPoint(bind.mesh.localToWorld(bind.mesh.getVertexPosition(i,vertex)));}
   }
   const height=size.y*.40,target=faceBox.isEmpty()?pos.clone().add(new THREE.Vector3(0,size.y*.055,0)):faceBox.getCenter(new THREE.Vector3()).add(new THREE.Vector3(0,-size.y*.025,0));
   const camera=new THREE.PerspectiveCamera(26,160/198,Math.max(.001,size.y*.002),size.y*100);
   camera.position.copy(target).add(new THREE.Vector3(0,size.y*.008,height/(2*Math.tan(THREE.MathUtils.degToRad(13)))+size.z*.16));camera.lookAt(target);camera.updateProjectionMatrix();
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
   stage.add(new THREE.HemisphereLight('#FFF4E4','#6B7886',2.2));
   const key=new THREE.DirectionalLight('#FFF3E5',1.8);key.position.copy(target).add(new THREE.Vector3(-size.y,size.y,size.y*2));stage.add(key);
   const rim=new THREE.DirectionalLight('#DDEBFF',.8);rim.position.copy(target).add(new THREE.Vector3(size.y,size.y*.2,-size.y));stage.add(rim);
   rig={id,renderer,stage,camera,model,groups,head,headBase:head.quaternion.clone(),faceMeshes,arms};
  }catch(e){renderer?.dispose();error=e instanceof Error?e.message:String(e);throw e;}
 })().finally(()=>{loading=undefined;});
 return loading;
}
function cue(s:OpenMotionScene,k:string){return s.doodle?.extras?.find(x=>x.startsWith(k+':'))?.slice(k.length+1)??'';}
function add(r:Rig,name:string,v:number){
 for(const b of r.groups.get(name)??[]){const a=b.mesh.morphTargetInfluences!;a[b.index]=clamp(a[b.index]+v*b.weight);}
}
// Aim the segment in world space rather than assuming a particular bone's local axis.
function aimSegment(bone:THREE.Object3D,child:THREE.Object3D,target:THREE.Vector3){
 if(!bone.parent)return;
 bone.updateWorldMatrix(true,true);
 const start=bone.getWorldPosition(new THREE.Vector3()),end=child.getWorldPosition(new THREE.Vector3());
 const dir=end.sub(start);if(dir.lengthSq()<1e-8)return;
 const q=new THREE.Quaternion().setFromUnitVectors(dir.normalize(),target.normalize());
 const world=bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(q);
 const parent=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
 bone.quaternion.copy(parent.multiply(world));bone.updateWorldMatrix(true,true);
}
function poseArms(r:Rig,shot:string,u:number){
 for(const arm of r.arms){
  arm.upper.quaternion.copy(arm.upperBase);arm.lower.quaternion.copy(arm.lowerBase);
 }
 r.model.updateMatrixWorld(true);
 // Small presentation gesture on the screen-right arm; no T-pose.
 for(const arm of r.arms){
  const origin=arm.upper.getWorldPosition(new THREE.Vector3()),root=r.head.getWorldPosition(new THREE.Vector3());
  const side=Math.sign(origin.x-root.x)||arm.side;
  const gesture=side>0&&shot!=='cover'&&shot!=='limits'?Math.sin(Math.PI*u)*(.65+.2*Math.sin(u*Math.PI*4)):0;
  aimSegment(arm.upper,arm.lower,new THREE.Vector3(side*(.15+gesture*.45),-1,.10+gesture*.25));
  aimSegment(arm.lower,arm.hand,new THREE.Vector3(side*(.12+gesture*.28),-1+gesture*1.35,.20+gesture*.55));
 }
}

const shapes=['','a','i','o','u','e','i','a'];
export function renderCartoon(c:CanvasRenderingContext2D,s:OpenMotionScene,t:number){
 const id=cartoonId(s);
 if(!rig||rig.id!==id){c.save();c.font='600 12px system-ui';c.fillStyle='#766E61';c.fillText(error?'Cartoon niet geladen':'Cartoon laden…',18,750,164);c.restore();return;}
 const r=rig,energy=cue(s,'host-energy'),mouth=cue(s,'host-mouth'),idx=clamp(t*30,0,Math.max(0,energy.length-1)),i=Math.floor(idx),f=idx-i;
 const a=energy.length?((Number(energy[i])||0)*(1-f)+(Number(energy[Math.min(i+1,energy.length-1)])||0)*f)/9:0;
 const blink=cue(s,'host-blinks').split(',').filter(Boolean).map(Number).reduce((n,b)=>Math.max(n,1-clamp(Math.abs(t-b)/.10)),0);
 // Absolute time, no stateful mixer or animation loop. Reset all morphs each frame.
 for(const mesh of r.faceMeshes)mesh.morphTargetInfluences!.fill(0);
 add(r,'blink',blink);
 const shot=cue(s,'shot'),u=clamp(t/Math.max(.001,s.durationSec)),look=shot==='cover'||shot==='limits'?0:Math.sin(Math.PI*u)*.16;
 const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(.025*Math.sin(t*2.1),look,.035*Math.sin(t*1.35)));
 r.head.quaternion.copy(r.headBase).multiply(q);
 poseArms(r,shot,u);
 const current=Number(mouth[Math.min(i,Math.max(0,mouth.length-1))])||0;
 if(a>.06&&current>0){
  let total=0;const w:Record<string,number>={};
  for(let d=-2;d<=2;d++){const v=Number(mouth[Math.max(0,Math.min(mouth.length-1,i+d))])||0,k=shapes[v],amount=Math.max(0,3-Math.abs(d-f));if(k)w[k]=(w[k]??0)+amount;total+=amount;}
  for(const [k,v] of Object.entries(w))add(r,k,a*.82*v/Math.max(1,total));
 }
 // Keep emotions mild so their mouth bindings do not overwhelm speech.
 add(r,shot==='limits'?'sorrow':'joy',(shot==='cover'?.28:.12)*(1-a));
 const scale=Math.max(1,c.getTransform().a),w=Math.ceil(160*scale),h=Math.ceil(198*scale);
 if(r.renderer.domElement.width!==w||r.renderer.domElement.height!==h)r.renderer.setSize(w,h,false);
 r.renderer.render(r.stage,r.camera);
 c.save();c.beginPath();c.roundRect(12,610,160,198,12);c.clip();c.drawImage(r.renderer.domElement,12,610,160,198);c.restore();
}
