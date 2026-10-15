import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {compileSTM} from '../src/stm32-compiler.js';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {createSTMProject} from '../dist/stm32-project.js';
import {encodeBytes,circuitPayload} from '../dist/unified-project.js';
const module=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const chip of Object.keys(STM32_BOARDS))test(chip+' unchanged worker real payload load/run/pause/reset/step/terminate',async()=>{
const p=createSTMProject({board:chip,starter:'button'}),c=await compileSTM(module,p.code,chip),w=new Worker(new URL('../scripts/stm32/worker-harness.mjs',import.meta.url));let queue=[],waiter;
w.on('message',d=>{queue.push(d);waiter?.();});w.on('error',e=>{queue.push({type:'error',message:e.message});waiter?.();});
async function next(predicate){const end=Date.now()+15000;while(Date.now()<end){while(queue.length){const d=queue.shift();if(d.type==='error')throw Error(d.message);if(predicate(d))return d;}await new Promise(r=>{const t=setTimeout(r,50);waiter=()=>{clearTimeout(t);r();};});}throw Error('STM worker response timeout');}
try{w.postMessage({type:'load',chip,hex:encodeBytes(c.image),language:'c',circuit:circuitPayload(p),circuitId:7,pins:['PA0','PA1'],traceId:12});const ready=await next(d=>d.type==='ready');assert.equal(ready.cycles,0);assert.equal(ready.circuitId,7);w.postMessage({type:'run'});const run=await next(d=>/BUTTON=0/.test(d.serial));assert.ok(run.cycles>0);assert.ok(run.edges.some(e=>e.pin==='PA1'&&e.high));w.postMessage({type:'pause'});await next(d=>d.type==='snapshot'&&!d.running);queue=[];w.postMessage({type:'reset'});const reset=await next(d=>d.type==='snapshot'&&!d.running);assert.equal(reset.cycles,0);w.postMessage({type:'step'});const step=await next(d=>d.type==='snapshot');assert.ok(step.cycles>0);assert.match(step.serial,/BUTTON=0/);}finally{await w.terminate();}
});
