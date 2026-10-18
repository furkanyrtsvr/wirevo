import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {STMRuntime} from '../dist/stm32-runtime.js';
import {compileSTM} from '../src/stm32-compiler.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
function until(r,re){let out='';for(let i=0;i<200;i++){out+=r.step(10000);if(re.test(out))return out;}throw Error('Missing '+re+': '+out);}
for(const [id,b]of Object.entries(STM32_BOARDS)){
 test(id+' NEW actual ARM STOP WFI resumes, STANDBY restarts with backup flag',async()=>{
  const f4=b.cpu==='cortex-m4f',src=`#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))\nint main(){cf_uart_begin(115200);R(${f4?'0x40023840':'0x4002101c'})|=1u<<28;if(R(0x40007004)&2){puts("STANDBY RESET DONE");for(;;);}puts("BEFORE STOP");R(0x40007000)=${f4?'0x8000':'0'};R(${f4?'0x40013c00':'0x40010400'})=1;R(${f4?'0x40013c08':'0x40010408'})=1;R(0xe000ed10)=4;__asm volatile("dsb; wfi");R(0xe000ed10)=0;cf_uart_begin(115200);puts("AFTER STOP");R(${f4?'0x40013c14':'0x40010414'})=1;R(0x40007000)=${f4?'0x8002':'2'};R(0xe000ed10)=4;__asm volatile("dsb; wfi");for(;;);}`;
  const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{
   assert.match(until(r,/BEFORE STOP/),/BEFORE STOP/);r.step(10000);assert.equal(r.system.mode,'stop');r.exti.internalEdge(0,true);assert.match(until(r,/AFTER STOP/),/AFTER STOP/);r.step(10000);assert.equal(r.system.mode,'standby');r.system.wakeRequested=true;assert.match(until(r,/DONE/),/STANDBY RESET DONE/);
  }finally{r.dispose();}
 });
 test(id+' NEW BOOT0 USART protocol returns device ID and reads real Flash',async()=>{
  const c=await compileSTM(compiler,'int main(){for(;;);}',id),r=await new STMRuntime(c.image,{chip:id}).load();try{r.system.setBoot(true);r.system.requestReset(3);r.step(1);assert.equal(r.system.bootMode,'system');const send=a=>{for(const v of a)r.system.bootByte(v);const s=r.serial;r.serial='';return [...s].map(c=>c.charCodeAt(0));};assert.deepEqual(send([0x7f]),[0x79]);const idReply=send([2,0xfd]);assert.equal(idReply[0],0x79);assert.equal(idReply.at(-1),0x79);assert.equal(idReply.length,5);assert.deepEqual(send([0x11,0xee]),[0x79]);assert.deepEqual(send([8,0,0,0,8]),[0x79]);assert.deepEqual(send([7,0xf8]),[0x79,...r.image.slice(0,8)]);}finally{r.dispose();}
 });
 if(b.cpu==='cortex-m4f')test(id+' NEW native DMA2 FIFO packs eight byte reads into two SRAM words',async()=>{
  const src=`#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))\nvolatile unsigned char source[8]={1,2,3,4,5,6,7,8};volatile unsigned target[2];int main(){cf_uart_begin(115200);R(0x40023830)|=1u<<22;R(0x40026414)=8;R(0x40026418)=(unsigned)source;R(0x4002641c)=(unsigned)target;R(0x40026424)=7;R(0x40026410)=1|(2<<6)|(1<<9)|(1<<10)|(2<<13)|(1<<21)|(1<<23);while(R(0x40026410)&1);printf("FIFO=%u,%u TC=%u DONE",target[0],target[1],!!(R(0x40026400)&32));for(;;);}`;
  const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{assert.match(until(r,/DONE/),/FIFO=67305985,134678021 TC=1 DONE/);}finally{r.dispose();}
 });
 if(b.cpu==='cortex-m4f')test(id+' NEW native USART DMA double buffer alternates M0/M1 and keeps stream enabled',async()=>{
  const u=b.terminalNumber===2?2:1,bank=u===1?0x40026400:0x40026000,stream=bank+16+(u===1?2:5)*24,uart=u===1?0x40011000:0x40004400;
  const src=`#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))\nvolatile unsigned char first,second;int main(){cf_uart_begin(115200);R(0x40023830)|=1u<<${u===1?22:21};R(${stream+4}u)=1;R(${stream+8}u)=${uart+4}u;R(${stream+12}u)=(unsigned)&first;R(${stream+16}u)=(unsigned)&second;R(${stream}u)=(4u<<25)|(1u<<18)|1;R(${uart+20}u)|=64;puts("DMA READY");while(second!=66);R(${uart+20}u)&=~64;printf("DBM=%u,%u EN=%u CT=%u DONE",first,second,R(${stream}u)&1,!!(R(${stream}u)&(1<<19)));for(;;);}`;
  const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{until(r,/DMA READY/);r.queueSerial('AB');assert.match(until(r,/DONE/),/DBM=65,66 EN=1 CT=0 DONE/);}finally{r.dispose();}
 });
}
