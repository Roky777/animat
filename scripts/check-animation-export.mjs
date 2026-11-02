import fs from'node:fs/promises';import assert from'node:assert/strict';
import{collectAnimationFiles}from'../animation-library/sparky/export-pack.js';import{makeZip}from'../animation-library/sparky/zip.js';
const base=new URL('../animation-library/sparky/',import.meta.url),manifest=JSON.parse(await fs.readFile(new URL('manifest.json',base),'utf8'));
const fetcher=async url=>{try{const bytes=await fs.readFile(url);return{ok:true,status:200,json:async()=>JSON.parse(bytes),arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)}}catch{return{ok:false,status:404}}};
const chosen=manifest.animations.find(c=>c.title==='Thank you for making this for me'),files=await collectAnimationFiles([chosen],{baseURL:base,manifest,fetcher}),byName=new Map(files.map(f=>[f.name,f]));
assert.equal(byName.size,files.length);const selected=JSON.parse(byName.get('sparky-animations/manifest.json').data);assert.equal(selected.animations.length,1);assert.equal(selected.animations[0].id,chosen.id);
for(const suffix of ['.skel','.atlas','.png'])assert(files.some(f=>f.name.endsWith(suffix)),`Missing ${suffix}`);
for(const name of ['files.json','preview.html','export-pack.js','zip.js','player.js','README.md','PACK_CONTENTS.md','AGENT_INSTRUCTIONS.md',`clips/${chosen.id}.json`])assert(byName.has('sparky-animations/'+name),name);
for(const file of files.filter(f=>f.name.endsWith('.png'))){const bytes=new Uint8Array(file.data);assert.equal(Buffer.from(bytes.subarray(0,8)).toString('hex'),'89504e470d0a1a0a')}
const blob=makeZip(files);await fs.writeFile('/private/tmp/sparky-animation-export-test.zip',new Uint8Array(await blob.arrayBuffer()));console.log(`PASS: selected clip, ${files.length} complete pack resources, Spine skeleton/atlases, PNG sheets and standalone download dependencies (${(blob.size/1048576).toFixed(1)} MiB).`);
