import fs from 'node:fs';import vm from 'node:vm';import {pathToFileURL} from 'node:url';
const root=new URL('../animation-library/sparky/',import.meta.url).pathname.replace(/\/$/,'');
const sandbox={console,Float32Array,Int16Array,Uint16Array,Uint8Array,Int8Array,Int32Array,Uint32Array,ArrayBuffer,DataView,Math,Map,Set,WeakMap,WeakSet};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(root+'/runtime/vendor/spine-webgl.min.js','utf8'),sandbox);const S=sandbox.spine;
const source=root+'/runtime/character-upgrade/06-lucas-construction/source/';const atlas=new S.TextureAtlas(fs.readFileSync(source+'Lucas_Activity_Icecream.atlas','utf8'));const data=new S.SkeletonBinary(new S.AtlasAttachmentLoader(atlas)).readSkeletonData(new Uint8Array(fs.readFileSync(source+'Lucas_Activity_Icecream.skel')));
import assert from 'node:assert/strict';
const dir=root+'/runtime/character-upgrade/12-sparky-final/';
const atlasFor=name=>new S.TextureAtlas(fs.readFileSync(dir+name,'utf8'));

const {makePaintedProfile:after}=await import(pathToFileURL(dir+'motion-fit-painted.js'));
const args=()=>[S,data,JSON.parse(fs.readFileSync(dir+'mesh-model.json')),atlasFor('Sparky_Painted.atlas'),JSON.parse(fs.readFileSync(dir+'paint-registration.json')),atlasFor('Native_Props.atlas'),atlasFor('SleeveFeather.atlas'),atlasFor('Shirt-Redraw-v2.atlas'),atlasFor('Measured-Arms-v1.atlas'),atlasFor('Unified-Shirt-v2.atlas'),atlasFor('Shorts-Redraw-v3.atlas')];


const profile=after(...args(),atlasFor('Reference-Iris-v1.atlas'),atlasFor('Glove-Gloss-v1.atlas'));
const{holdingHands}=await import(pathToFileURL(dir+'holding-hands.js').href+'?v=1');
const{armDiagnostics}=await import(pathToFileURL(dir+'continuous-sleeve-garment.js').href+'?v=1');
const{group}=await import(pathToFileURL(dir+'../09-lucas-shape-first/shape-profile.js'));
const manifest=JSON.parse(fs.readFileSync(root+'/manifest.json'));let samples=0,holdingSamples=0,overlapSamples=0,maxWristError=0;
for(const clip of manifest.animations){
 const sk=new S.Skeleton(data),state=new S.AnimationState(new S.AnimationStateData(data)),entry=state.setAnimation(0,clip.name,false),frames=Math.max(1,Math.ceil(clip.duration*6));
 for(let i=0;i<=frames;i++){
  sk.setToSetupPose();entry.trackTime=clip.duration*i/frames;state.apply(sk);sk.updateWorldTransform(S.Physics.none);
  const out=profile.sample({skeleton:sk,entry,fixedTime:entry.trackTime});
  const order=new Set(out.drawOrder);assert.equal(order.size,out.drawOrder.length,'Duplicate draw slot');
  for(const slot of out.drawOrder){const a=slot.getAttachment();if(!a?.vertices)continue;assert(a.vertices.every(Number.isFinite),clip.name+' '+slot.data.name);for(const index of a.triangles??[])assert(index>=0&&index<a.vertices.length/2)}
  const holding=holdingHands(S,profile.base.fitted,sk);
  if(holding){for(const side of ['L','R']){const actual=armDiagnostics[side].wrist,target=holding.wrists.get(side),error=Math.hypot(actual[0]-target[0],actual[1]-target[1]);maxWristError=Math.max(maxWristError,error);assert(error<1e-7,'Holding palm and skin wrist separated');const palm=out.findSlot('Prop:Hold_front'+(side==='R'?'2':''));assert(palm.getAttachment());assert(out.drawOrder.indexOf(palm)>out.drawOrder.indexOf(out.findSlot('ForearmTop_'+side)))}holdingSamples++}
  const gesture=sk.drawOrder.some(sl=>sl.getAttachment()&&sl.color.a>.1&&['Palms/S/Lu_Point2','Palms/Palm_2','Palms/Lucas_Palm_25'].includes(sl.getAttachment().path));
  if(gesture){const rank=side=>sk.drawOrder.reduce((r,sl,index)=>group(sl.data.name)==='hand'+side&&sl.getAttachment()&&sl.color.a>.1?index:r,-1),sides=['L','R'].sort((a,b)=>rank(a)-rank(b));for(const side of sides){const hand=out.findSlot('Hand_'+side);assert(out.drawOrder.indexOf(hand)>out.drawOrder.indexOf(out.findSlot('ForearmTop_'+side)))}assert(out.drawOrder.indexOf(out.findSlot('Hand_'+sides[0]))<out.drawOrder.indexOf(out.findSlot('ForearmTop_'+sides[1])),'Crossing arm lost source depth');overlapSamples++}
  samples++;
 }
 console.log(clip.title+' passed');
}
console.log(JSON.stringify({entries:manifest.animations.length,samples,holdingSamples,overlapSamples,maxWristError,finiteMeshes:true,uniqueDrawSlots:true},null,2));
