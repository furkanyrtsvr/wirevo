import test from 'node:test';import assert from 'node:assert/strict';import {compileSketch} from '../dist/compile-client.js';
const all=[];class CompilerWorker{constructor(){all.push(this);this.terminations=0;}postMessage(packet){this.packet=packet;}terminate(){this.terminations++;}}
test('Cancelled compilation releases the worker and cannot accept a late firmware result',async()=>{
 const old=globalThis.Worker;globalThis.Worker=CompilerWorker;
 try{const c=new AbortController(),promise=compileSketch('void setup(){}',{signal:c.signal}),w=all.at(-1);assert.match(w.packet.source,/#line 1 "sketch.ino"/);c.abort();await assert.rejects(promise,{name:'AbortError'});assert.equal(w.terminations,1);w.onmessage({data:{ok:true,result:{hex:'late',fitsTarget:true}}});assert.equal(w.terminations,1);
 const before=all.length;await assert.rejects(compileSketch('x',{signal:c.signal}),{name:'AbortError'});assert.equal(all.length,before);
 }finally{globalThis.Worker=old;}
});
test('Timeout and progress failure both release compiler resources without hanging',async()=>{
 const old=globalThis.Worker;globalThis.Worker=CompilerWorker;
 try{const pending=compileSketch('x',{timeout:10}),w=all.at(-1);await assert.rejects(pending,/süre sınırı/);assert.equal(w.terminations,1);
 const failure=compileSketch('x',{onProgress(){throw Error('progress failed');}}),last=all.at(-1);await assert.rejects(failure,/progress failed/);assert.equal(last.terminations,1);
 }finally{globalThis.Worker=old;}
});
test('Successful GCC warnings survive the worker result while oversize firmware is rejected',async()=>{
 const old=globalThis.Worker;globalThis.Worker=CompilerWorker;
 try{const promise=compileSketch('x'),w=all.at(-1),result={hex:'hex',fitsTarget:true,flashBytes:5000,stderr:['sketch.ino:1:2: warning: example']};w.onmessage({data:{ok:true,result}});assert.deepEqual(await promise,result);assert.equal(w.terminations,1);
 const bad=compileSketch('x');all.at(-1).onmessage({data:{ok:true,result:{hex:'oversize',fitsTarget:false,flashBytes:40000}}});await assert.rejects(bad,/32256/);assert.equal(all.at(-1).terminations,1);
 }finally{globalThis.Worker=old;}
});
test('Multiple source progress does not finish compilation, cancellation releases it, SRAM overflow cannot run',async()=>{
 const old=globalThis.Worker;globalThis.Worker=CompilerWorker;
 try{const source=[{name:'sketch.ino',content:'void setup(){}'},{name:'led.cpp',content:'int f(){return 1;}'}],progress=[],controller=new AbortController(),p=compileSketch(source,{signal:controller.signal,onProgress:x=>progress.push(x)}),w=all.at(-1);assert.deepEqual(w.packet.files,source);w.onmessage({data:{progress:'C++ led.cpp'}});assert.equal(w.terminations,0);assert.ok(progress.includes('C++ led.cpp'));controller.abort();await assert.rejects(p,{name:'AbortError'});assert.equal(w.terminations,1);
 const oversized=compileSketch(source);all.at(-1).onmessage({data:{ok:true,result:{hex:'h',fitsTarget:true,fitsRam:false,staticRamBytes:2500}}});await assert.rejects(oversized,/SRAM.*2048/);
 }finally{globalThis.Worker=old;}
});
