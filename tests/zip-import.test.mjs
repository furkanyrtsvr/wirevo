import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {projectZip} from '../dist/project-zip.js';import {readZip} from '../dist/zip-reader.js';import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
import {makeProject} from '../dist/templates.js';import {firmwareMatches,sourceKey} from '../dist/source-files.js';import {libraryManifest} from '../dist/libraries.js';import {UnoRuntime} from '../dist/uno-runtime.js';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/zip-reader.json',import.meta.url))),gcc=JSON.parse(readFileSync(new URL('./fixtures/multifile.json',import.meta.url)));
const bytes=key=>Uint8Array.from(Buffer.from(fixture[key],'base64'));
const encode=new TextEncoder(),project=()=>{const p=makeProject('multifile');p.code=gcc.files[0].content;p.files=gcc.files.slice(1);p.firmware={hex:gcc.result.hex,source:p.code,sourceKey:sourceKey(p),staticRamBytes:gcc.result.staticRamBytes};return p;};
const entriesFor=p=>[{name:'sketch.ino',content:p.code},...p.files||[],{name:'circuit.json',content:JSON.stringify(p)},{name:'firmware.hex',content:p.firmware.hex}];
function changeDirectory(b,mutate){const out=b.slice(),d=new DataView(out.buffer);for(let i=0;i<out.length-46;i++)if(d.getUint32(i,true)===0x02014b50){mutate(d,i);break;}return out;}
test('Python stored, raw deflate and streaming data descriptors decode with independent CRC',async()=>{for(const key of ['stored','deflate','descriptor'])assert.deepEqual(Object.fromEntries(await readZip(bytes(key))),fixture.files);});
test('Own UTF-8 ZIP nested headers and metadata roundtrip executes real multifile firmware',async()=>{
 const p=project();p.name='Türkçe · Devre';const before=JSON.stringify(p),zip=exportProjectZip(p),result=await importProjectBytes(zip);
 assert.equal(JSON.stringify(p),before);assert.equal(result.format,'ZIP');assert.deepEqual(result.project.files,p.files);assert.equal(result.project.name,p.name);assert.equal(firmwareMatches(result.project),true);assert.equal(result.project.firmware.staticRamBytes,166);
 let serial='';const runtime=new UnoRuntime(result.project.firmware.hex,{onSerial:c=>serial+=c});runtime.stepCycles(160000);assert.equal(serial,'1:2\r\n');assert.equal(runtime.readPin('D13').high,true);
});
test('Modified sketch/header discards stale HEX even for deliberately imported HEX',async()=>{
 for(const imported of [false,true])for(const file of ['sketch.ino','drivers/led.h']){const p=project();p.firmware.imported=imported;const entries=entriesFor(p);entries.find(e=>e.name===file).content+='\n// edit in ZIP';const result=await importProjectBytes(projectZip(entries));assert.equal(result.project.firmware,undefined);assert.match(result.warnings[0],/Kaynak değişmiş/);}
});
test('Separate manifest roundtrip locks exact dependencies and new firmware fingerprint',async()=>{
 const p=project();p.schemaVersion=5;p.libraries=libraryManifest([{id:'wire',version:'1.0'}]);p.firmware.sourceKey=sourceKey(p);const result=await importProjectBytes(exportProjectZip(p));assert.deepEqual(result.project.libraries,p.libraries);assert.equal(result.project.schemaVersion,5);assert.equal(firmwareMatches(result.project),true);
 const entries=entriesFor(p);entries.push({name:'libraries.json',content:JSON.stringify(libraryManifest([]))});await assert.rejects(importProjectBytes(projectZip(entries)),/manifestleri eşleşmiyor/);
});
test('Single wrapper directory imports but unrelated files or missing sketch/circuit cannot',async()=>{
 const entries=entriesFor(project());const wrapped=entries.map(e=>({...e,name:'workspace/'+e.name}));assert.equal((await importProjectBytes(projectZip(wrapped))).project.model,'multifile');
 await assert.rejects(importProjectBytes(projectZip([...wrapped,{name:'other.h',content:''}])),/tek proje klasöründe/);
 await assert.rejects(importProjectBytes(projectZip(entries.filter(e=>e.name!=='circuit.json'))),/circuit.json/);
 await assert.rejects(importProjectBytes(projectZip(entries.filter(e=>e.name!=='sketch.ino'))),/sketch.ino/);
 await assert.rejects(importProjectBytes(projectZip([...entries,{name:'readme.exe',content:'x'}])),/desteklenmeyen/);
});
test('HEX mismatch/checksum and malformed project fail before any project is returned',async()=>{
 const p=project(),entries=entriesFor(p);entries.find(e=>e.name==='firmware.hex').content=':0100000001FE\n:00000001FF\n';await assert.rejects(importProjectBytes(projectZip(entries)),/HEX/);
 entries.find(e=>e.name==='firmware.hex').content=':00000001FE\n';await assert.rejects(importProjectBytes(projectZip(entries)),/sağlama/);
 entries.find(e=>e.name==='circuit.json').content='{bad';await assert.rejects(importProjectBytes(projectZip(entries)),/JSON/);
});
test('JSON import retains old schema and checks firmware, all parser failures leave original bytes untouched',async()=>{
 const p=project(),data=encode.encode(JSON.stringify(p)),copy=data.slice();assert.deepEqual((await importProjectBytes(data)).project.files,p.files);assert.deepEqual(data,copy);
 for(const data of [encode.encode('{}'),new Uint8Array([255,255]),new Uint8Array(2000001)])await assert.rejects(importProjectBytes(data));
});
test('CRC, central/local names, truncation, encryption, method and split/ZIP64 are rejected',async()=>{
 const input=projectZip([{name:'sketch.ino',content:'abc'}]),corrupt=input.slice();corrupt[40]^=1;await assert.rejects(readZip(corrupt),/CRC/);
 const badName=input.slice();badName[30]=88;await assert.rejects(readZip(badName),/dosya adı/);
 await assert.rejects(readZip(input.slice(0,-1)),/dizin/);
 for(const mutate of [(d,i)=>d.setUint16(i+8,1,true),(d,i)=>d.setUint16(i+10,12,true),(d,i)=>d.setUint16(i+34,1,true),(d,i)=>d.setUint32(i+24,0xffffffff,true),(d,i)=>d.setUint32(i+42,0xfffffff0,true)])await assert.rejects(readZip(changeDirectory(input,mutate)));
});
test('Duplicate case paths, traversal, symlinks, overlapping records and declared ZIP bomb fail',async()=>{
 await assert.rejects(readZip(projectZip([{name:'A.h',content:''},{name:'a.h',content:''}])),/yinelenen/);
 const input=projectZip([{name:'safe.h',content:''}]);for(const name of ['../x.h','C:xx.h','\\xx.hx']){const modified=input.slice();for(let i=0;i<modified.length-name.length;i++)if(encode.encode('safe.h').every((b,j)=>modified[i+j]===b))modified.set(encode.encode(name),i);await assert.rejects(readZip(modified),/güvensiz/);}
 await assert.rejects(readZip(changeDirectory(input,(d,i)=>d.setUint32(i+38,0xa0000000,true))),/sembolik/);
 await assert.rejects(readZip(bytes('oversized')),/2 MB/);
 const bomb=changeDirectory(bytes('oversized'),(d,i)=>d.setUint32(i+24,100,true));const v=new DataView(bomb.buffer);v.setUint32(22,100,true);await assert.rejects(readZip(bomb),/boyut sınırını/);
 const duplicate=projectZip([{name:'A.h',content:''},{name:'B.h',content:''}]);const d=new DataView(duplicate.buffer);let centers=[];for(let i=0;i<duplicate.length-46;i++)if(d.getUint32(i,true)===0x02014b50)centers.push(i);d.setUint32(centers[1]+42,0,true);await assert.rejects(readZip(duplicate),/dosya adı|çakışan/);
});
