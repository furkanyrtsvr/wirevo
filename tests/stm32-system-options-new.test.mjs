import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {STMRuntime} from '../dist/stm32-runtime.js';
import {compileSTM} from '../src/stm32-compiler.js';

const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
function until(r,pattern){let out='';for(let i=0;i<300;i++){out+=r.step(20000);if(pattern.test(out))return out;}throw Error('Missing '+pattern+': '+out);}
for(const [id,b] of Object.entries(STM32_BOARDS))test(id+' NEW option WRP reload and real SYSRESETREQ reject ARM Flash programming',async()=>{
 const f4=b.cpu==='cortex-m4f',base=f4?0x40023c00:0x40022000,target=0x08000000+b.flashSize-1024;
 const option=f4?`R(F+8)=0x08192a3b;R(F+8)=0x4c5d6e7f;R(F+20)=(0x0fffaaec&~(1u<<${16+(b.flashSize===262144?5:7)}))|2;`:`R(F+8)=0x45670123;R(F+8)=0xcdef89ab;R(F+16)=512|32|64;R(F+16)=512|16;for(unsigned i=0;i<8;i++){unsigned v=i==0?0xa5:255;if(i>=4&&i==${4+Math.floor((b.flashSize/4096-1)/8)})v&=~(1u<<${(b.flashSize/4096-1)%8});H(0x1ffff800+i*2)=v;}`;
 const src=`#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))\n#define H(a) (*(volatile unsigned short*)(a))\nint main(){cf_uart_begin(115200);unsigned F=${base}u;R(F+4)=0x45670123;R(F+4)=0xcdef89ab;if(!(cf_reset_flags()&(1u<<28))){${option}R(0xe000ed0c)=0x05fa0004;for(;;);}R(F+16)=${f4?'1|(2<<8)':'1'};${f4?'R':'H'}(${target}u)=0;printf("RELOAD=%u PROTECTED=%u DONE",!!(cf_reset_flags()&(1u<<28)),!!(R(F+12)&16));for(;;);}`;
 const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{const out=until(r,/DONE/);assert.match(out,/RELOAD=1 PROTECTED=1 DONE/);assert.equal(r.readMemory(target,2)[0],255);}finally{r.dispose();}
});
for(const [id,b] of Object.entries(STM32_BOARDS))test(id+' NEW dynamic HSI/HSE/APB clocks, CSS, PVD, NRST and STOP domain pause',async()=>{
 const c=await compileSTM(compiler,'#include <cf_hal.h>\nint main(){for(;;)__asm volatile("wfi");}',id),r=await new STMRuntime(c.image,{chip:id}).load();try{
  const s=r.system,base=s.base,cf=base+(s.f4?8:4);r.writeRegister(base,0x90001);r.writeRegister(cf,1|(4<<(s.f4?10:8)));assert.equal(s.hclk,b.hse);assert.equal(s.pclk1,b.hse/2);
  s.setHSE(false);assert.equal(s.hclk,s.hsi);assert.ok(s.cir&128);assert.equal(s.powerState(0,0),4);r.writeRegister(base+(s.f4?12:8),1<<23);assert.equal(s.cir&128,0);
  r.writeRegister(s.f4?0x40023840:0x4002101c,1<<28);r.writeRegister(0x40007000,(s.f4?0x8000:0)|16|(7<<5));s.setSupply(2.5);assert.ok(r.readRegister(0x40007004)&4);s.setSupply(3.3);assert.equal(r.readRegister(0x40007004)&4,0);
  r.writeRegister(0x40007000,s.f4?0x8000:0);r.writeRegister(r.exti.base,1);r.writeRegister(r.exti.base+8,1);assert.equal(s.powerState(1,4),1);assert.equal(s.mode,'stop');r.exti.internalEdge(0,true);assert.equal(s.powerState(1,4),2);assert.equal(s.mode,'run');assert.equal(s.hclk,s.hsi);
  s.setNRST(false);assert.equal(s.powerState(0,0),1);s.setNRST(true);r.step(1);assert.ok(r.resetFlags&(1<<26));
 }finally{r.dispose();}
});
