import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';import {createSTMProject} from '../dist/stm32-project.js';
import {compileSTM} from '../src/stm32-compiler.js';import {STMRuntime} from '../dist/stm32-runtime.js';
import {blankPinConfig,generatePinSources,hardwareFunctions,configuredProject} from '../dist/stm32-pin-config.js';
import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
async function run(board,code){const p=createSTMProject({board,starter:'adc'});p.code=code;p.files=[];const c=await compileSTM(compiler,code,board),r=await new STMRuntime(c.image,{chip:board}).load();r.attachCircuit(p);return {r,p};}
function until(r,pattern){let text='';for(let i=0;i<200;i++){text+=r.step(10000);if(pattern.test(text))return text;}throw Error('Missing '+pattern+': '+text);}
const prefix='#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))\n';
for(const board of Object.keys(STM32_BOARDS))test(board+' SPI1 reads live MCP3008 over physical nets at PCLK2/BR speed',async()=>{
 const {r,p}=await run(board,prefix+'int main(void){cf_uart_begin(115200);cf_gpio_mode(PA4,CF_OUTPUT);cf_gpio_write(PA4,1);int hz=cf_spi1_begin(500000);printf("HZ=%d ",hz);for(;;){cf_gpio_write(PA4,0);cf_spi1_transfer(1);unsigned hi=cf_spi1_transfer(128),lo=cf_spi1_transfer(0);cf_gpio_write(PA4,1);printf("ADC=%u ",((hi&3)<<8)|lo);cf_delay_ms(1);}}');
 try{const expected=STM32_BOARDS[board].hz/256;assert.match(until(r,/ADC=512 /),new RegExp('HZ='+expected));for(const[value,adc]of [[0,0],[100,1023],[50,512]]){p.components.find(v=>v.type==='pot').params.value=value;r.circuit.update(p);until(r,new RegExp('ADC='+adc+' '));}p.wires=p.wires.filter(w=>!w.to.endsWith(':DOUT'));r.circuit.update(p);until(r,/ADC=0 /);assert.equal(r.spi.sr&128,0);}finally{r.dispose();}
});
for(const board of Object.keys(STM32_BOARDS))test(board+' genuine SPI1 IRQ35, OVR DR→SR clear and RCC reset',async()=>{
 const f4=STM32_BOARDS[board].cpu==='cortex-m4f',rst=f4?0x40023824:0x4002100c;
 const {r}=await run(board,prefix+`volatile unsigned done,irq;void SPI1_IRQHandler(void){irq++;done=R(0x4001300c);R(0x40013004)=0;}int main(void){cf_uart_begin(115200);cf_gpio_mode(PA4,CF_OUTPUT);cf_gpio_write(PA4,1);cf_spi1_begin(500000);R(0x40013004)=64;R(0xe000e104)=1u<<3;R(0x4001300c)=0xa5;while(!irq)__asm volatile("wfi");printf("IRQ=%u DATA=%u ",irq,done);R(0x4001300c)=1;while(R(0x40013008)&128){}R(0x4001300c)=2;while(R(0x40013008)&128){}unsigned first=R(0x40013008),again=R(0x40013008),data=R(0x4001300c),clear=R(0x40013008),after=R(0x40013008);R(${rst})=1u<<12;R(${rst})=0;printf("OVR=%u AGAIN=%u CLEAR=%u AFTER=%u RESET=%u",first&64,again&64,clear&64,after&64,R(0x40013000));for(;;){}}`);
 try{const s=until(r,/RESET=0/);assert.match(s,/IRQ=1 DATA=0/);assert.match(s,/OVR=64 AGAIN=64 CLEAR=64 AFTER=0 RESET=0/);}finally{r.dispose();}
});
for(const board of Object.keys(STM32_BOARDS))test(board+' MVN immediate preserves APSR unless S is set, including following IT condition',async()=>{
 const {r}=await run(board,prefix+String.raw`int main(void){cf_uart_begin(115200);unsigned a,b,c;__asm volatile("movs r0,#0\n cmp r0,#0\n mvn r1,#1\n mrs %0,apsr\n it eq\n moveq r0,#7\n mov %1,r0\n mvns r1,#1\n mrs %2,apsr":"=r"(a),"=r"(b),"=r"(c)::"r0","r1","cc");printf("MVN=%u IT=%u MVNS=%u",(a>>30)&3,b,(c>>30)&3);for(;;){}}`);
 try{assert.match(until(r,/MVNS=/),/MVN=1 IT=7 MVNS=2/);}finally{r.dispose();}
});
test('SPI1 pin config generates hardware init, rejects missing pins, preserves old software ZIP and project scope',async()=>{
 const planned=blankPinConfig();planned.pins.PA4={function:'hw_SPI1_NSS'};assert.match(generatePinSources(planned,'stm32f103c8').files[1].content,/pin plan only/);assert.doesNotMatch(generatePinSources(planned,'stm32f103c8').files[1].content,/cf_spi1_begin/);const old=createSTMProject({starter:'adc'}),before=structuredClone(old);const cfg=blankPinConfig();cfg.pins.PA5={function:'hw_SPI1_SCK'};assert.throws(()=>generatePinSources(cfg,'stm32f103c8'),/MISO/);cfg.pins.PA6={function:'hw_SPI1_MISO'};cfg.pins.PA7={function:'hw_SPI1_MOSI'};cfg.hwSpi1Hz=1000000;
 for(const board of Object.keys(STM32_BOARDS)){const g=generatePinSources(cfg,board);assert.match(g.files[1].content,/cf_spi1_begin\(1000000\)/);assert.equal(g.busFiles.length,0);assert.equal(hardwareFunctions(board,'PA5').find(f=>f.name==='SPI1_SCK').status,'supported');assert.equal(hardwareFunctions(board,'PA4').find(f=>f.name==='SPI1_NSS').status,'planned');}
 const q=configuredProject(old,cfg,'stm32f103c8');assert.deepEqual(old,before);const imported=(await importProjectBytes(exportProjectZip(q))).project;assert.equal(imported.settings.stm32Pins.hwSpi1Hz,1000000);assert.match(imported.code,/cf_spi_transfer/);assert.ok(imported.files.some(f=>f.name==='cf_bus.c'));
});
for(const board of Object.keys(STM32_BOARDS))test(board+' SPI1 gating aborts pending edges, unsupported modes/AF fail explicitly and reopen succeeds',async()=>{
 const {r}=await run(board,prefix+'int main(void){cf_uart_begin(115200);cf_spi1_begin(500000);puts("BOOT");for(;;){}}');
 try{until(r,/BOOT/);const en=STM32_BOARDS[board].cpu==='cortex-m4f'?0x40023844:0x40021018,cr=r.readRegister(0x40013000);for(const bit of [4096,8192,16384,32768])assert.throws(()=>r.writeRegister(0x40013000,cr|bit),/yalnız/);r.writeRegister(0x40013000,cr);r.writeRegister(0x40013004,3);assert.equal(r.readRegister(0x40013004)&3,3);assert.equal(r.spi.next,Infinity);r.writeRegister(0x40013004,0);r.writeRegister(0x4001300c,0xa5,1);assert.ok(r.readRegister(0x40013008)&128);assert.throws(()=>r.writeRegister(0x40013000,cr^8),/BSY/);r.writeRegister(en,r.regs.get(en)&~(1<<12));assert.equal(r.spi.next,Infinity);assert.equal(r.spi.sr&128,0);r.step(1000);r.writeRegister(en,r.regs.get(en)|(1<<12));assert.equal(r.spi.sr&1,0);r.writeRegister(0x4001300c,0,2);r.step(5000);assert.equal(r.readRegister(0x4001300c,1),0);const gpio=STM32_BOARDS[board].cpu==='cortex-m4f'?0x40020020:0x40010800;r.writeRegister(0x40013000,0);r.writeRegister(gpio,0);assert.throws(()=>r.writeRegister(0x40013000,cr),/AF/);}finally{r.dispose();}
});
for(const board of ['stm32f103c6','nucleo-f411re'])test(board+' SPI1 TXE/ERR IRQ35 executes on ARM and hardware double buffer preserves old receive data',async()=>{
 const {r}=await run(board,prefix+`volatile unsigned count;void SPI1_IRQHandler(void){count++;R(0x40013004)=0;}int main(void){cf_uart_begin(115200);cf_spi1_begin(500000);R(0xe000e104)=1u<<3;R(0x40013004)=128;while(!count)__asm volatile("nop");printf("TXE IRQ=%u ",count);count=0;R(0x4001300c)=1;R(0x4001300c)=2;unsigned full=R(0x40013008);while(R(0x40013008)&128){}R(0x40013004)=32;while(!count)__asm volatile("nop");unsigned sr=R(0x40013008),dr=R(0x4001300c),clearing=R(0x40013008),after=R(0x40013008);printf("FULL=%u ERR IRQ=%u OVR=%u AFTER=%u DATA=%u",full&2,count,sr&64,after&64,dr);for(;;){}}`);
 try{assert.match(until(r,/DATA=/),/TXE IRQ=1 FULL=0 ERR IRQ=1 OVR=64 AFTER=0 DATA=0/);}finally{r.dispose();}
});
