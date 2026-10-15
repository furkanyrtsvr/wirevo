import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {compileSTM} from '../src/stm32-compiler.js';import {STMRuntime} from '../dist/stm32-runtime.js';import {STM32_BOARDS} from '../dist/stm32-boards.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
for(const board of ['stm32f103c6','nucleo-f401re','weact-f411ce'])test(board+' native WFI cycles preserve partial TIM2 PSC phase across RCC gate and explicit CNT write',async()=>{
 const c=await compileSTM(compiler,'#include <cf_hal.h>\n#include <stdio.h>\nint main(void){cf_uart_begin(115200);puts("SLEEP READY");for(;;)__asm volatile("wfi");}',board),r=await new STMRuntime(c.image,{chip:board}).load();
 try{let text='';for(let i=0;i<100&&!text.includes('SLEEP READY');i++)text+=r.step(10000);assert.match(text,/SLEEP READY/);r.step(10000);const f4=STM32_BOARDS[board].cpu==='cortex-m4f',en=f4?0x40023840:0x4002101c,cf=f4?0x40023808:0x40021004,bits=(r.readRegister(cf)>>(f4?10:8))&7,apb=bits<4?1:1<<(bits-3),ratio=apb>1?apb/2:1,w=(o,v)=>r.writeRegister(0x40000000+o,v);
  r.writeRegister(en,r.readRegister(en)|1);w(40,9);w(44,99);w(20,1);w(0,1);r.step(7*ratio);assert.equal(r.readRegister(0x40000024),0);
  r.writeRegister(en,r.readRegister(en)&~1);r.step(1000);assert.equal(r.readRegister(0x40000024),0);r.writeRegister(en,r.readRegister(en)|1);r.step(2*ratio);assert.equal(r.readRegister(0x40000024),0);r.step(ratio);assert.equal(r.readRegister(0x40000024),1);
  r.step(7*ratio);w(0,0);r.step(1000);w(36,20);w(0,1);r.step(2*ratio);assert.equal(r.readRegister(0x40000024),20);r.step(ratio);assert.equal(r.readRegister(0x40000024),21);
 }finally{r.dispose();}
});
