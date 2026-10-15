import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';import {createSTMProject} from '../dist/stm32-project.js';
import {compileSTM} from '../src/stm32-compiler.js';import {STMRuntime} from '../dist/stm32-runtime.js';
import {blankPinConfig,generatePinSources} from '../dist/stm32-pin-config.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
for(const board of Object.keys(STM32_BOARDS))test(board+' genuine TIM2 PWM1 1kHz/25% drives real LED nets',async()=>{
 const p=createSTMProject({board,starter:'environment'});p.code='#include <cf_hal.h>\nint main(void){cf_pwm_begin(PA0,1000,25);for(;;){__asm volatile("wfi");}}';
 const c=await compileSTM(compiler,p.code,board,p.files),r=await new STMRuntime(c.image,{chip:board}).load();try{r.attachCircuit(p);r.step(10000);const edges=[];let previous=r.pinStates().PA0.high,highCurrent=false,lowCurrent=false;for(let i=0;i<2500;i++){r.step(100);const s=r.pinStates().PA0.high;if(s!==previous){edges.push({cycle:r.count,high:s});previous=s;}const current=r.circuit.solution.ledResults.get('led1').current;highCurrent||=current>.005;lowCurrent||=current===0;}
  assert.ok(highCurrent&&lowCurrent);const rise=edges.filter(e=>e.high),fall=edges.filter(e=>!e.high);assert.ok(rise.length>=2&&fall.length>=2);
  const period=STM32_BOARDS[board].hz/1000;assert.ok(Math.abs(rise[1].cycle-rise[0].cycle-period)<=200);
  const highEnd=fall.find(e=>e.cycle>rise[0].cycle);assert.ok(Math.abs(highEnd.cycle-rise[0].cycle-period*.25)<=200);
  assert.equal(r.pinStates().PA0.mode,'TIM2_PWM');
  r.writeRegister(0x40000034,0);r.step(100000);assert.equal(r.pinStates().PA0.high,false);
  r.writeRegister(0x40000034,(r.readRegister(0x4000002c)+1));r.step(100000);assert.equal(r.pinStates().PA0.high,true);
 }finally{r.dispose();}
});
for(const board of Object.keys(STM32_BOARDS))test(board+' TIM2 update IRQ28 wakes ARM and SR zero clears UIF',async()=>{
 const p=createSTMProject({board,starter:'empty'});p.code=`#include <cf_hal.h>
 #include <stdio.h>
 volatile unsigned ticks;
 void TIM2_IRQHandler(void){*(volatile unsigned*)0x40000010=0;ticks++;}
 int main(void){cf_uart_begin(115200);cf_pwm_begin(PA0,1000,50);*(volatile unsigned*)0xe000e100=1u<<28;*(volatile unsigned*)0x4000000c=1;while(ticks<3){__asm volatile("wfi");}printf("TIM IRQ=%u",ticks);*(volatile unsigned*)0x4000000c=0;for(;;){}}`;
 const c=await compileSTM(compiler,p.code,board,p.files),r=await new STMRuntime(c.image,{chip:board}).load();try{r.attachCircuit(p);let text='';for(let i=0;i<100&&!text.includes('TIM IRQ=3');i++)text+=r.step(10000);assert.match(text,/TIM IRQ=3/);r.writeRegister(0x40000010,0);assert.equal(r.readRegister(0x40000010)&1,0);}finally{r.dispose();}
});
test('TIM2 generated PWM validates common frequency and duty limits',()=>{
 const c=blankPinConfig();c.pins.PA0={function:'hw_TIM2_CH1',pwmHz:1000,pwmDuty:25};assert.match(generatePinSources(c,'stm32f103c8').files[1].content,/cf_pwm_begin\(PA0,1000,25\)/);
 c.pins.PA1={function:'hw_TIM2_CH2',pwmHz:2000,pwmDuty:50};assert.throws(()=>generatePinSources(c,'stm32f103c8'),/aynı frekans/);c.pins.PA1.pwmHz=1000;c.pins.PA1.pwmDuty=101;assert.throws(()=>generatePinSources(c,'stm32f103c8'),/sınırı/);
});
for(const board of ['stm32f103c6','nucleo-f401re','weact-f411ce'])test(board+' TIM2 CR1 writes preserve CNT and CEN pause/resume holds PWM output',async()=>{
 const p=createSTMProject({board,starter:'environment'});p.code='#include <cf_hal.h>\nint main(void){cf_pwm_begin(PA0,1000,50);for(;;)__asm volatile("wfi");}';const c=await compileSTM(compiler,p.code,board,p.files),r=await new STMRuntime(c.image,{chip:board}).load();
 try{r.attachCircuit(p);r.step(10000);const before=r.readRegister(0x40000024),cr=r.readRegister(0x40000000),state=r.pinStates().PA0.high;assert.ok(before>0);r.writeRegister(0x40000000,cr);assert.equal(r.readRegister(0x40000024),before);r.writeRegister(0x40000000,cr&~1);r.step(10000);assert.equal(r.readRegister(0x40000024),before);assert.equal(r.pinStates().PA0.outputEnabled,true);assert.equal(r.pinStates().PA0.high,state);r.writeRegister(0x40000000,cr);assert.equal(r.readRegister(0x40000024),before);r.step(100);assert.ok(r.readRegister(0x40000024)>before);}finally{r.dispose();}
});
