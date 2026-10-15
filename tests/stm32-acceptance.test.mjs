import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {compileSTM} from '../src/stm32-compiler.js';
import {STMRuntime} from '../dist/stm32-runtime.js';
test('Combined Nucleo lab: physical pots → ADC DMA SRAM, B1 → EXTI LED, watchdog reset → startup',async()=>{
 const p=JSON.parse(await readFile('docs/examples/stm32-acceptance-053.json','utf8'));
 const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
 await STMRuntime.initialize(await readFile('dist/stm32/cortex-m4f.wasm'),'cortex-m4f');
 const c=await compileSTM(compiler,p.code,'nucleo-f401re',p.files),r=await new STMRuntime(c.image,{chip:'nucleo-f401re'}).load();r.attachCircuit(p);
 let output='';const until=re=>{for(let i=0;i<300;i++){output+=r.step(10000);if(re.test(output))return;}assert.match(output,re);};
 try{
  until(/A=ADC/);r.queueSerial('A');until(/ADC DMA: 1024 \/ 3071/);
  p.components.find(c=>c.id==='pot1').params.value=50;r.circuit.update(p);r.queueSerial('A');until(/ADC DMA: 2048 \/ 3071/);
  p.settings.pressed=true;r.circuit.update(p);until(/B1 IRQ=1 LED=1/);assert.ok(r.inputVoltages.PA5>2.9);
  assert.doesNotMatch(output,/IWDG RESET/);r.queueSerial('R');until(/BOOT: IWDG RESET/);
  r.queueSerial('B');until(/EXTI B1: 0/);assert.ok(r.inputVoltages.PA5<.1);
 }finally{r.dispose();}
});

