import test from 'node:test';import assert from 'node:assert/strict';
import {STMTimer2} from '../dist/stm32-timer.js';
import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {compileSTM} from '../src/stm32-compiler.js';import {STMRuntime} from '../dist/stm32-runtime.js';import {createSTMProject} from '../dist/stm32-project.js';
const base=0x40000000;
function fixture(f4,cr){const r={count:0,board:{cpu:f4?'cortex-m4f':'cortex-m3',gpio:[]},regs:new Map([[f4?0x40023840:0x4002101c,1]]),usarts:{divider:()=>1},inputs:{}};const t=new STMTimer2(r),w=(o,v)=>t.write(base+o,v,4),step=n=>{r.count+=n;t.tick();};w(40,9);w(44,4);w(52,2);w(0,cr);w(20,1);w(16,0);w(12,3);w(0,cr|1);return {r,t,w,step};}
for(const f4 of [false,true]){
 test((f4?'F4':'F1')+' downcount ARR reload, CC match, underflow, UG and paused PSC',()=>{const {t,w,step}=fixture(f4,16);assert.equal(t.phase(),4);step(20);assert.equal(t.phase(),2);assert.equal(t.regs.get(16)&3,2);w(16,0);step(20);assert.equal(t.phase(),0);assert.equal(t.regs.get(16)&1,0);step(10);assert.equal(t.phase(),4);assert.equal(t.regs.get(16)&1,1);w(16,0);step(7);w(0,16);step(100);w(0,17);step(2);assert.equal(t.phase(),4);step(1);assert.equal(t.phase(),3);w(20,1);assert.equal(t.phase(),4);});
 for(const cms of [1,2,3])test((f4?'F4':'F1')+' center CMS'+cms+' triangular CNT/DIR, upper/lower update and CC direction selection',()=>{const {t,w,step}=fixture(f4,cms<<5);assert.equal(t.phase(),0);step(20);assert.equal(t.phase(),2);assert.equal(t.regs.get(16)&2,cms===1?0:2);w(16,0);step(20);assert.equal(t.phase(),4);assert.equal(t.regs.get(0)&16,16);assert.equal(t.regs.get(16)&1,1);w(16,0);step(20);assert.equal(t.phase(),2);assert.equal(t.regs.get(16)&2,cms===2?0:2);w(16,0);step(20);assert.equal(t.phase(),0);assert.equal(t.regs.get(0)&16,0);assert.equal(t.regs.get(16)&1,1);});
 test((f4?'F4':'F1')+' center DIR read-only, CEN mode guard, OPM boundary and preload reload',()=>{const {t,w,step}=fixture(f4,96|128);assert.throws(()=>w(0,1),/CEN=0/);w(0,97|128|16);assert.equal(t.read(base,4)&16,0);w(40,19);w(44,6);step(40);assert.equal(t.phase(),4);assert.equal(t.active.arr,6);assert.equal(t.unit(),20);assert.equal(t.read(base,4)&16,16);w(0,96|128|16);w(20,1);assert.equal(t.phase(),0);w(0,96|128|8|1);step(120);assert.equal(t.enabled(),false);assert.equal(t.phase(),6);});
}
for(const cms of [1,2,3])test('CMS'+cms+' OC toggle occurs both directions while CC interrupt flag is gated',()=>{const {t,w,step}=fixture(true,cms<<5);w(24,3<<4);step(20);assert.equal(t.oc[0],true);w(16,0);step(40);assert.equal(t.oc[0],false);assert.equal(t.regs.get(16)&2,cms===2?0:2);});
test('Center CCR outside ARR flags on overflow only, not the lower update',()=>{const {t,w,step}=fixture(true,96);w(52,9);step(40);assert.equal(t.regs.get(16)&3,3);w(16,0);step(40);assert.equal(t.regs.get(16)&3,1);});
for(const f4 of [false,true])test((f4?'F4':'F1')+' downward PWM1/PWM2 physical reference and active ARR write preserve CNT',()=>{const {t,w,step}=fixture(f4,16);t.mapped=()=>true;w(24,6<<4);w(32,1);assert.equal(t.outputs({}).PA0.high,false);step(20);assert.equal(t.outputs({}).PA0.high,true);w(44,6);assert.equal(t.phase(),2);step(10);assert.equal(t.phase(),1);w(24,7<<4);assert.equal(t.outputs({}).PA0.high,false);});
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
for(const board of ['stm32f103c6','nucleo-f401re','weact-f411ce'])for(const cms of [0,1,2,3])test(board+' native ARM '+(cms?'CMS'+cms:'downcount')+' real compare/update IRQ and direction',async()=>{
 const p=createSTMProject({board,starter:'empty'});p.code=`#include <cf_hal.h>
 #include <stdio.h>
 #define R(a) (*(volatile unsigned*)(a))
 volatile unsigned compared,updated,up,down;
 void TIM2_IRQHandler(void){unsigned s=R(0x40000010);if(s&2){compared++;if(R(0x40000000)&16)down++;else up++;}if(s&1)updated++;R(0x40000010)=~s;}
 int main(void){cf_uart_begin(115200);cf_pwm_begin(PA0,100,25);R(0x40000000)=4;R(0x40000028)=999;R(0x4000002c)=99;R(0x40000034)=50;R(0x40000000)=4|${cms?cms<<5:16};R(0x40000014)=1;R(0x40000010)=0;R(0xe000e100)=1u<<28;R(0x4000000c)=3;R(0x40000000)=5|${cms?cms<<5:16};while(updated<2)__asm volatile("wfi");R(0x40000000)&=~1u;printf("CMP=%u UPDATE=%u UP=%u DOWN=%u DONE",compared,updated,up,down);for(;;)__asm volatile("wfi");}`;
 const c=await compileSTM(compiler,p.code,board,p.files),r=await new STMRuntime(c.image,{chip:board}).load();try{r.attachCircuit(p);let text='';for(let i=0;i<1000&&!text.includes('DONE');i++)text+=r.step(5000);assert.match(text,new RegExp(cms===0?'CMP=2 UPDATE=2 UP=0 DOWN=2 DONE':cms===1?'CMP=1 UPDATE=2 UP=0 DOWN=1 DONE':cms===2?'CMP=1 UPDATE=2 UP=1 DOWN=0 DONE':'CMP=2 UPDATE=2 UP=1 DOWN=1 DONE'));}finally{r.dispose();}
});
