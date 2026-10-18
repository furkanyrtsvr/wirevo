import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {STMRuntime} from '../dist/stm32-runtime.js';
import {compileSTM} from '../src/stm32-compiler.js';
import {createSTMProject} from '../dist/stm32-project.js';
import {blankPinConfig,generatePinSources,normalizePinConfig} from '../dist/stm32-pin-config.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
for(const[id,b]of Object.entries(STM32_BOARDS)){
 test(id+' NEW physical NRST holds ARM, release resets, unwired boot jumpers survive circuit solve',async()=>{
  const c=await compileSTM(compiler,'#include <cf_hal.h>\n#include <stdio.h>\nint main(){cf_uart_begin(115200);printf("PINRESET=%u DONE",!!(cf_reset_flags()&(1u<<26)));for(;;);}',id),r=await new STMRuntime(c.image,{chip:id}).load();
  try{const p=createSTMProject({board:id,starter:'empty'});p.wires=[{id:'reset-low',from:'mcu:NRST',to:'mcu:GND',color:'#14b8a6',points:[]}];r.attachCircuit(p);r.step(20000);assert.equal(r.system.nrst,false);assert.equal(r.serial,'');p.wires=[];r.attachCircuit(p);let out='';for(let i=0;i<30&&!out.includes('DONE');i++)out+=r.step(10000);assert.match(out,/PINRESET=1 DONE/);
   p.settings.stm32Pins=blankPinConfig();p.settings.stm32Pins.boot0=true;p.settings.stm32Pins.boot1=true;r.attachCircuit(p);r.system.observePins();assert.equal(r.system.boot0,true);assert.equal(r.system.boot1,true);
   const cfg=blankPinConfig();cfg.pins.PA8={function:'hw_TIM1_CH1',pwmHz:2000,pwmDuty:25};const normalized=normalizePinConfig(cfg,id),g=generatePinSources(normalized,id);assert.equal(normalized.pins.PA8.pwmHz,2000);assert.match(JSON.stringify(g.files),/= 499u/);assert.match(JSON.stringify(g.files),/= 125u/);
  }finally{r.dispose();}
 });
 if(b.cpu==='cortex-m4f')test(id+' NEW native DMA FIFO byte writes preserve following SRAM sentinel',async()=>{
  const src='#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))\nvolatile unsigned source[2]={0x04030201,0x08070605};volatile struct {unsigned char bytes[8];unsigned guard;} target={{0},0x12345678};int main(){cf_uart_begin(115200);R(0x40023830)|=1u<<22;R(0x40026414)=2;R(0x40026418)=(unsigned)source;R(0x4002641c)=(unsigned)&target;R(0x40026424)=7;R(0x40026410)=1|(2<<6)|(1<<9)|(1<<10)|(2<<11);while(R(0x40026410)&1);printf("BYTES=%u,%u GUARD=%u DONE",target.bytes[0],target.bytes[7],target.guard);for(;;);}';
  const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{let out='';for(let i=0;i<30&&!out.includes('DONE');i++)out+=r.step(10000);assert.match(out,/BYTES=1,8 GUARD=305419896 DONE/);}finally{r.dispose();}
 });
}
