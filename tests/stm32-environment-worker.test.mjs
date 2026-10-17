import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {compileSTM} from '../src/stm32-compiler.js';
import {createSTMProject} from '../dist/stm32-project.js';
import {workspaceCircuitPayload,encodeBytes} from '../dist/unified-project.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const chip of ['stm32f103c6','weact-f411ce'])test(chip+' workspace worker receives project-local internal ADC environment on load and circuit update',async()=>{
 const p=createSTMProject({board:chip,starter:'internal-adc'});p.settings.stm32Pins.internalTemperature=65;p.settings.stm32Pins.internalVBAT=2.4;
 const built=await compileSTM(compiler,p.code,chip),worker=new Worker(new URL('../scripts/stm32/worker-harness.mjs',import.meta.url));let queue=[],wake;
 worker.on('message',d=>{queue.push(d);wake?.();});worker.on('error',e=>{queue.push({type:'error',message:e.message});wake?.();});
 async function next(predicate){const end=Date.now()+60000;while(Date.now()<end){while(queue.length){const d=queue.shift();if(d.type==='error')throw Error(d.message);if(predicate(d))return d;}await new Promise(r=>{const t=setTimeout(r,50);wake=()=>{clearTimeout(t);r();};});}throw Error('worker timeout');}
 try{
  worker.postMessage({type:'load',chip,hex:encodeBytes(built.image),circuit:workspaceCircuitPayload(p),circuitId:1,pins:[]});await next(d=>d.type==='ready');worker.postMessage({type:'run'});
  const q=v=>Math.round(v/3.3*4095),f4=chip.startsWith('weact');let received='';await next(d=>{received+=d.serial||'';return received.includes('TEMP_RAW='+q(f4?.86:1.258))&&received.includes(' OK');});const first={serial:received};
  assert.match(first.serial,new RegExp('TEMP_RAW='+q(f4?.86:1.258)));if(f4)assert.match(first.serial,new RegExp('VBAT_RAW='+q(.6)));
  worker.postMessage({type:'pause'});await next(d=>d.type==='snapshot'&&!d.running);queue=[];
  p.settings.stm32Pins.internalTemperature=25;p.settings.stm32Pins.internalVBAT=3;worker.postMessage({type:'circuit',circuit:workspaceCircuitPayload(p),circuitId:2});await next(d=>d.circuitId===2);worker.postMessage({type:'run'});
  received='';await next(d=>{received+=d.serial||'';return received.includes('TEMP_RAW='+q(f4?.76:1.43))&&received.includes('VBAT_RAW='+q(.75))||!f4&&received.includes('TEMP_RAW='+q(1.43))&&received.includes(' OK');});if(f4)assert.match(received,new RegExp('VBAT_RAW='+q(.75)));
 }finally{await worker.terminate();}
});
for(const [chip,unit]of [['weact-f411ce',1],['nucleo-f401re',2]])test(chip+' worker reports physical BRR/APB baud correctly in OVER8 mode',async()=>{
 const p=createSTMProject({board:chip,starter:'empty'}),built=await compileSTM(compiler,'#include <cf_hal.h>\n#include <stdio.h>\nint main(void){cf_uart_begin(9600);cf_usart'+unit+'_oversampling(8);puts("OVER8 BAUD READY");for(;;){}}',chip),worker=new Worker(new URL('../scripts/stm32/worker-harness.mjs',import.meta.url));
 try{const message=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('worker OVER8 timeout')),30000);worker.on('error',reject);worker.on('message',d=>{if(d.type==='error'){clearTimeout(timer);reject(Error(d.message));}else if(d.type==='ready')worker.postMessage({type:'step'});else if(d.serial?.includes('OVER8 BAUD READY')){clearTimeout(timer);resolve(d);}});worker.postMessage({type:'load',chip,hex:encodeBytes(built.image),circuit:workspaceCircuitPayload(p),circuitId:1,pins:[]});});assert.equal(message.uart.baudRate,9600);}finally{await worker.terminate();}
});
