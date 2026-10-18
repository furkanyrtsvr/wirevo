import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';import {STMRuntime} from '../dist/stm32-runtime.js';import {compileSTM} from '../src/stm32-compiler.js';import {createSTMProject} from '../dist/stm32-project.js';import {blankPinConfig,generatePinSources} from '../dist/stm32-pin-config.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
const prefix='#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))\n';function until(r,re){let out='';for(let i=0;i<40;i++){out+=r.step(20000);if(re.test(out))return out;}throw Error('Missing '+re+': '+out);}
for(const [id,b]of Object.entries(STM32_BOARDS)){
 const endpoint=pin=>'mcu:'+b.pins.find(p=>p.net===pin&&p.connectable!==false).id;
 test(id+' NEW SPI1 automatically clocks CRC and compares the received polynomial remainder',async()=>{
  const p=createSTMProject({board:id,starter:'empty'});p.wires=[{id:'loop',from:endpoint('PA7'),to:endpoint('PA6'),color:'#14b8a6',points:[]}];const src=prefix+'int main(){cf_uart_begin(115200);cf_spi1_begin(500000);R(0x40013000)|=8192|4096;unsigned v=cf_spi1_transfer(165);while(R(0x40013008)&128);printf("DATA=%u TXCRC=%u RXCRC=%u ERROR=%u DONE",v,R(0x40013018),R(0x40013014),!!(R(0x40013008)&16));for(;;);}';
  const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{r.attachCircuit(p);assert.match(until(r,/DONE/),/DATA=165 TXCRC=114 RXCRC=114 ERROR=0 DONE/);}finally{r.dispose();}
 });
 if(id!=='stm32f103c6')test(id+' NEW SPI2 slave exchanges physical MOSI/MISO with SPI1 and raises IRQ36',async()=>{
  const cfg=blankPinConfig();for(const [kind,pin]of [['SCK','PB13'],['MISO','PB14'],['MOSI','PB15']])cfg.pins[pin]={function:'hw_SPI2_'+kind};const g=generatePinSources(cfg,id),p=createSTMProject({board:id,starter:'empty'});p.wires=[['PA5','PB13'],['PA6','PB14'],['PA7','PB15']].map(([a,z],i)=>({id:'bus'+i,from:endpoint(a),to:endpoint(z),color:'#14b8a6',points:[]}));
  const f1=b.cpu==='cortex-m3'?'R(0x40010c04)=(R(0x40010c04)&~0xfff00000u)|0x4b400000u;':'';
  const src=prefix+`volatile unsigned received,hit;void SPI2_IRQHandler(){received=R(0x4000380c);R(0x40003804)=0;hit++;}int main(){cf_uart_begin(115200);cf_spi1_begin(500000);R(0x40003800)=0;${f1}R(0x40003800)=512|64;R(0x4000380c)=90;R(0x40003804)=64;R(0xe000e104)=16;unsigned answer=cf_spi1_transfer(165);for(unsigned i=0;i<10000&&!hit;i++);printf("MASTER=%u SLAVE=%u IRQ=%u DONE",answer,received,hit);for(;;);}`;
  const c=await compileSTM(compiler,src,id,g.files),r=await new STMRuntime(c.image,{chip:id}).load();try{r.attachCircuit(p);assert.match(until(r,/DONE/),/MASTER=90 SLAVE=165 IRQ=1 DONE/);}finally{r.dispose();}
 });
}
