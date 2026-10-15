import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {createSTMProject} from '../dist/stm32-project.js';
import {compileSTM} from '../src/stm32-compiler.js';
import {STMRuntime} from '../dist/stm32-runtime.js';
import {blankPinConfig,generatePinSources,configuredProject} from '../dist/stm32-pin-config.js';

const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
const base=b=>STM32_BOARDS[b].cpu==='cortex-m4f'?0x40011000:0x40013800;
function project(board,tx='PA9',rx='PA10'){
 const b=STM32_BOARDS[board],p=createSTMProject({board,starter:'bluetooth'});
 const pin=n=>b.pins.find(v=>v.connectable!==false&&v.net===n).id;
 p.wires=p.wires.map(w=>({...w,from:w.to==='bt1:RX'?'mcu:'+pin(tx):w.to==='bt1:TX'?'mcu:'+pin(rx):w.from}));
 return p;
}
async function runtime(p){const board=p.components[0].params.model,c=await compileSTM(compiler,p.code,board,p.files),r=await new STMRuntime(c.image,{chip:board}).load();r.attachCircuit(p);return r;}
function wait(r,fn,limit=700){for(let i=0;i<limit;i++){r.step(10000);if(fn())return;}throw Error('USART acceptance timeout');}

for(const board of Object.keys(STM32_BOARDS))for(const [tx,rx]of [['PA9','PA10'],['PB6','PB7']])test(board+' genuine USART1 '+tx+'/'+rx+' physical 8N1 and NVIC IRQ37 echo',async()=>{
 const p=project(board,tx,rx),u=base(board);
 const config=blankPinConfig();config.pins[tx]={function:'hw_USART1_TX'};config.pins[rx]={function:'hw_USART1_RX'};
 const g=configuredProject(p,config,board);g.code=`#include "cf_board_config.h"
 volatile unsigned irqs,received;
 void USART1_IRQHandler(void){int c=cf_usart1_read();if(c>=0){irqs++;received=c;cf_gpio_write(PA0,c=='1');cf_usart1_write(c);}}
 int main(void){cf_gpio_mode(PA0,CF_OUTPUT);*(volatile unsigned*)${u+12}|=32;*(volatile unsigned*)0xE000E104=1u<<5;cf_usart1_write('R');for(;;){__asm volatile("wfi");}}`;
 const r=await runtime(g);try{
  r.circuit.bluetoothCommand({action:'connect',id:'bt1'});
  wait(r,()=>r.circuit.bluetooth.snapshot().devices.bt1.received.includes('R'));
  assert.equal(r.readRegister(u+8),Math.round(STM32_BOARDS[board].hz/9600));
  r.circuit.bluetoothCommand({action:'send',id:'bt1',text:'1'});
  wait(r,()=>r.circuit.bluetooth.snapshot().devices.bt1.received.includes('R1'));
  assert.equal(r.pinStates().PA0.high,true);
  assert.equal(r.pinStates()[tx].mode,'USART1_TX');if(!board.startsWith('nucleo'))assert.throws(()=>r.queueSerial('ignored'),/fiziksel netten/);
  r.circuit.bluetoothCommand({action:'send',id:'bt1',text:'0'});
  wait(r,()=>r.circuit.bluetooth.snapshot().devices.bt1.received.includes('R10'));
  assert.equal(r.pinStates().PA0.high,false);
  assert.equal(r.readRegister(u)&40,0);
  // True bank1 enable/disable and packed priority word, executed through the ARM bus.
  g.code='#include <cf_hal.h>\n#include <stdio.h>\nint main(void){cf_uart_begin(115200);volatile unsigned *en=(unsigned*)0xE000E104,*dis=(unsigned*)0xE000E184,*prio=(unsigned*)0xE000E424;*en=32;*prio=0x40302010;printf("NVIC=%u PRIOR=%u ",*en,*prio);*dis=32;printf("OFF=%u",*dis);for(;;){}}';
  const c2=await compileSTM(compiler,g.code,board),r2=await new STMRuntime(c2.image,{chip:board}).load();
  try{assert.match(r2.step(10000),/NVIC=32 PRIOR=1076895760 OFF=0/);}finally{r2.dispose();}
 }finally{r.dispose();}
});

for(const board of Object.keys(STM32_BOARDS))test(board+' USART overrun keeps first byte; SR then DR clears error',async()=>{
 const p=project(board);p.code='#include <cf_hal.h>\nint main(void){cf_usart1_begin(9600,PA9,PA10);for(;;){}}';
 const r=await runtime(p),u=base(board);try{r.step(10000);r.circuit.bluetoothCommand({action:'connect',id:'bt1'});r.circuit.bluetoothCommand({action:'send',id:'bt1',text:'AB'});wait(r,()=>!!(r.usarts.units[0].sr&8));
  assert.equal(r.usarts.units[0].dr,65);assert.equal(r.usarts.units[0].sr&40,40);
  assert.equal(r.readRegister(u+4),65);assert.equal(r.usarts.units[0].sr&40,8);
  assert.equal(r.readRegister(u)&8,8);r.readRegister(u+4);assert.equal(r.readRegister(u)&40,0);
    r.writeRegister(u+4,67);assert.equal(r.readRegister(u)&192,128);
  r.writeRegister(u+4,68);assert.equal(r.readRegister(u)&192,0);
  wait(r,()=>r.circuit.bluetooth.snapshot().devices.bt1.received.includes('CD'));
  assert.equal(r.readRegister(u)&192,192);
  r.writeRegister(u+12,0);assert.equal(r.readRegister(u),0);
 }finally{r.dispose();}
});

test('USART1 configuration is project-local, validates remap pairs and duplicate signals',()=>{
 const a=createSTMProject({starter:'empty'}),b=createSTMProject({starter:'empty'}),config=blankPinConfig();config.pins.PA9={function:'hw_USART1_TX'};config.pins.PA10={function:'hw_USART1_RX'};
 const out=configuredProject(a,config,'stm32f103c8');assert.equal(a.settings.stm32Pins,undefined);assert.equal(b.settings.stm32Pins,undefined);assert.equal(out.settings.stm32Pins.pins.PA9.function,'hw_USART1_TX');assert.match(out.files.find(f=>f.name==='cf_board_config.c').content,/cf_usart1_begin\(9600,PA9,PA10\)/);
 delete config.pins.PA10;assert.throws(()=>generatePinSources(config,'stm32f103c8'),/birlikte/);config.pins.PB7={function:'hw_USART1_RX'};assert.throws(()=>generatePinSources(config,'stm32f103c8'),/remap/);config.pins.PB6={function:'hw_USART1_TX'};assert.throws(()=>generatePinSources(config,'stm32f103c8'),/iki pine/);
});

for(const board of Object.keys(STM32_BOARDS))test(board+' actual baud mismatch sets framing error and SR/DR clears it',async()=>{const p=project(board);p.code='#include <cf_hal.h>\nint main(void){cf_usart1_begin(19200,PA9,PA10);for(;;){}}';const r=await runtime(p),u=base(board);try{r.step(10000);r.circuit.bluetoothCommand({action:'connect',id:'bt1'});r.circuit.bluetoothCommand({action:'send',id:'bt1',text:String.fromCharCode(0)});wait(r,()=>!!(r.usarts.units[0].sr&2));assert.equal(r.usarts.units[0].sr&34,34);r.readRegister(u+4);assert.equal(r.usarts.units[0].sr&2,2);r.readRegister(u);r.readRegister(u+4);assert.equal(r.usarts.units[0].sr&2,0);}finally{r.dispose();}});
