import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {STMRuntime} from '../dist/stm32-runtime.js';
import {compileSTM} from '../src/stm32-compiler.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
const prefix='#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))\n';
function until(r,pattern){let out='';for(let i=0;i<50&&!pattern.test(out);i++)out+=r.step(10000);assert.match(out,pattern);return out;}
for(const[id,b]of Object.entries(STM32_BOARDS)){
 test(id+' v066 RDP preserves user-Flash access but blocks a real SRAM routine data load',async()=>{
  const f4=b.cpu==='cortex-m4f',F=f4?0x40023c00:0x40022000,option=f4?'R(0x40023c08)=0x08192a3b;R(0x40023c08)=0x4c5d6e7f;R(0x40023c14)=0x0fff55ee;':'R(0x40022008)=0x45670123;R(0x40022008)=0xcdef89ab;R(0x40022010)=512|32|64;R(0x40022010)=512|16;for(unsigned i=0;i<8;i++)*(volatile unsigned short*)(0x1ffff800+i*2)=i?255:0;';
  const src=prefix+`int main(){cf_uart_begin(115200);if(!(cf_reset_flags()&(1u<<28))){R(${F+4}u)=0x45670123;R(${F+4}u)=0xcdef89ab;${option}R(0xe000ed0c)=0x05fa0004;for(;;);}R(0x20002000)=0x68084901;R(0x20002004)=0xbf004770;R(0x20002008)=0x08000000;unsigned ram=((unsigned(*)(void))0x20002001)();printf("RDP FLASH=%u SRAM=%u DONE",!!R(0x08000000),ram);for(;;);}`;
  const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{until(r,/RDP FLASH=1 SRAM=0 DONE/);assert.throws(()=>r.readMemory(0x08000000,4),/RDP/);}finally{r.dispose();}
 });
 test(id+' v066 native Flash busy completion and atomic doubleword / halfword',async()=>{
  const f4=b.cpu==='cortex-m4f',F=f4?0x40023c00:0x40022000,target=0x08000000+b.flashSize-8;
  const src=prefix+`int main(){cf_uart_begin(115200);R(${F+4}u)=0x45670123;R(${F+4}u)=0xcdef89ab;R(${F+16}u)=${f4?'769':'1'};${f4?`R(${target}u)=0x11223344;R(${target+4}u)=0x55667788;`:`*(volatile unsigned short*)${target}u=0x3344;`}printf("PROGRAM=%u EOP=%u DONE",${f4?`R(${target}u)`:`*(volatile unsigned short*)${target}u`},!!(R(${F+12}u)&${f4?1:32}));for(;;);}`;
  const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{until(r,new RegExp('PROGRAM='+(f4?287454020:13124)+' EOP=1 DONE'));r.writeRegister(F+12,0x1ff);r.writeRegister(F+16,f4?513:1);r.exports.memory_write(r.cpu,target+4,f4?0x55667788:0x7788,f4?4:2);assert.ok(r.flash.status()&(f4?65536:1));r.step(1);assert.equal(r.flash.status()&(f4?65536:1),0);assert.ok(r.flash.status()&(f4?1:32));}finally{r.dispose();}
 });
 if(b.cpu==='cortex-m4f')test(id+' v066 native PCROP allows instruction fetch but blocks data reads after option reload',async()=>{
  const target=0x08000000+b.flashSize-8,sector=b.flashSize===262144?5:7;
  const src=prefix+`int main(){cf_uart_begin(115200);if(!(cf_reset_flags()&(1u<<28))){R(0x40023c04)=0x45670123;R(0x40023c04)=0xcdef89ab;R(0x40023c10)=769;R(${target}u)=0x47702007;R(${target+4}u)=0x12345678;R(0x40023c08)=0x08192a3b;R(0x40023c08)=0x4c5d6e7f;R(0x40023c14)=0x8000aaee|(1u<<${16+sector});R(0xe000ed0c)=0x05fa0004;for(;;);}unsigned returned=((unsigned(*)(void))${target+1}u)();unsigned data=R(${target}u);printf("PCROP RET=%u DATA=%u RDERR=%u DONE",returned,data,!!(R(0x40023c0c)&256));for(;;);}`;
  const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{until(r,/PCROP RET=7 DATA=0 RDERR=1 DONE/);r.writeRegister(0x40023c0c,256);assert.equal(r.flash.status()&256,0);}finally{r.dispose();}
 });
 test(id+' v066 native TIM1 TRGO clocks TIM2 through ITR0 and honors prescaler',async()=>{
  const f4=b.cpu==='cortex-m4f',tim1=f4?0x40010000:0x40012c00;
  const src=prefix+`int main(){cf_uart_begin(115200);R(${f4?0x40023840:0x4002101c}u)|=1;R(${f4?0x40023844:0x40021018}u)|=1u<<${f4?0:11};R(0x40000028)=1;R(0x4000002c)=65535;R(0x40000014)=1;R(0x40000008)=7;R(0x40000000)=1;R(${tim1+4}u)=32;for(unsigned i=0;i<10;i++)R(${tim1+20}u)=1;printf("CHAIN=%u DONE",R(0x40000024));for(;;);}`;
  const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{until(r,/CHAIN=5 DONE/);}finally{r.dispose();}
 });
}
