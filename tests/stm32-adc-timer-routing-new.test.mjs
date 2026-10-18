import test from 'node:test';
import assert from 'node:assert/strict';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {STMADC} from '../dist/stm32-adc.js';
import {STMTimers} from '../dist/stm32-timers.js';
import {STMTimer2} from '../dist/stm32-timer-modes.js';
for(const[id,board]of Object.entries(STM32_BOARDS))test(id+' NEW TIM1 complementary enable and ADC1/ADC2 independent clocks and trigger routing',()=>{
 const f4=board.cpu==='cortex-m4f',clock=f4?0x40023844:0x40021018,r={board,chip:id,count:0,regs:new Map([[clock,f4?257:(1<<11)|(1<<9)|(1<<10)]]),inputs:{},usarts:{divider:()=>1}};r.adc=new STMADC(r);r.adc2=f4?null:new STMADC(r,2);r.timer=new STMTimer2(r);r.timers=new STMTimers(r);const tim1=r.timers.units.find(t=>t.number===1),adcs=[r.adc,r.adc2].filter(Boolean);
 tim1.write(tim1.base+32,5,4);assert.equal(tim1.regs.get(32)&5,5);
 for(const adc of adcs)adc.regs.set(adc.base+8,1|(f4?1<<28|1<<16|1<<20:1<<20|1<<15));
 tim1.compare(0);tim1.trgo();for(const adc of adcs){assert.deepEqual(adc.triggerQueue,['tim1_0','injected']);adc.triggerQueue=[];adc.regs.set(adc.base+8,1|(f4?1<<28|3<<24:1<<20|3<<17));}
 r.timer.compare(1);for(const adc of adcs)assert.deepEqual(adc.triggerQueue,['tim2_1']);
 if(!f4){r.regs.set(clock,r.regs.get(clock)&~(1<<10));assert.equal(r.adc.clocked(),true);assert.equal(r.adc2.clocked(),false);}
});
