import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeFiles,projectFiles,sourceKey,firmwareMatches} from '../dist/source-files.js';
import {validateProject} from '../dist/core.js';import {makeProject} from '../dist/templates.js';import {parseCompilerDiagnostics} from '../dist/diagnostics.js';import {staticRamBytes} from '../dist/gcc-project.js';
test('Sources validate safe relative paths, duplicate case, byte limits and a single sketch entry',()=>{
 const main={name:'sketch.ino',content:'void setup(){}'};
 for(const name of ['../led.cpp','x/../led.cpp','/root.cpp','led.js','a:bad.cpp','a//b.h'])assert.throws(()=>normalizeFiles([main,{name,content:''}]));
 assert.throws(()=>normalizeFiles([main,{name:'LED.h',content:''},{name:'led.h',content:''}]));assert.throws(()=>normalizeFiles([main,{name:'second.ino',content:''}]));
 assert.throws(()=>normalizeFiles([main,{name:'a.h',content:'ç'.repeat(50000)}]));assert.equal(normalizeFiles([main,{name:'drivers/led.cpp',content:''}]).length,2);
});
test('All source contents AND paths invalidate firmware; switching tab or source order cannot',()=>{
 const p=makeProject();p.files=[{name:'led.h',content:'int led();'},{name:'led.cpp',content:'int led(){return 1;}'}];p.firmware={hex:'h',source:p.code,sourceKey:sourceKey(p)};assert.equal(firmwareMatches(p),true);
 p.files.reverse();assert.equal(firmwareMatches(p),true);p.files[0].content+='// changed';assert.equal(firmwareMatches(p),false);p.files[0].content=p.files[0].content.replace('// changed','');p.files[0].name='other.cpp';assert.equal(firmwareMatches(p),false);
 const legacy=makeProject();legacy.firmware={hex:'h',source:legacy.code};assert.equal(firmwareMatches(legacy),true);legacy.files=[{name:'led.h',content:''}];assert.equal(firmwareMatches(legacy),false);
});
test('Schema4 JSON/history retains all files and source fingerprint; old projects stay readable',()=>{
 const p=makeProject();p.schemaVersion=4;p.files=[{name:'led.h',content:'#pragma once\n'},{name:'led.cpp',content:'int f(){return 2;}'}];p.firmware={hex:'h',source:p.code,sourceKey:sourceKey(p),staticRamBytes:188};
 const q=validateProject(JSON.parse(JSON.stringify(p)));assert.deepEqual(q.files,p.files);assert.equal(firmwareMatches(q),true);assert.equal(q.firmware.staticRamBytes,188);assert.equal(projectFiles(q).length,3);assert.equal(validateProject(makeProject()).schemaVersion,3);
 assert.throws(()=>validateProject({...p,files:{name:'bad.cpp'}}));
});
test('GCC user header and CPP locations are navigable while compiler headers remain external',()=>{
 const d=parseCompilerDiagnostics('led.cpp:4:2: error: bad\nled.h:2:1: warning: header\n/arduino/core/Arduino.h:8:1: error: external',['sketch.ino','led.cpp','led.h']);assert.deepEqual(d.map(x=>x.navigable),[true,true,false]);assert.equal(d[0].file,'led.cpp');assert.equal(d[0].line,4);
});
test('ELF static SRAM excludes flash and non-allocated debug sections and checks bounds',()=>{
 const b=new Uint8Array(52+4*40),d=new DataView(b.buffer);b.set([127,69,76,70,1,1]);d.setUint32(32,52,true);d.setUint16(46,40,true);d.setUint16(48,4,true);
 for(const [i,flags,address,size] of [[0,3,0x800100,20],[1,3,0x800114,40],[2,2,0,100],[3,0,0x800140,500]]){const at=52+i*40;d.setUint32(at+8,flags,true);d.setUint32(at+12,address,true);d.setUint32(at+20,size,true);}assert.equal(staticRamBytes(b),60);assert.throws(()=>staticRamBytes(b.slice(0,60)));assert.throws(()=>staticRamBytes(new Uint8Array(52)));
});
