import test from 'node:test';
import assert from 'node:assert/strict';
import {STMRTC} from '../dist/stm32-rtc-events.js';
import {STMEXTI} from '../dist/stm32-exti.js';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
for(const [id,board]of Object.entries(STM32_BOARDS).filter(([,b])=>b.cpu==='cortex-m3'))test(id+' NEW F1 backup tamper flags, erase, IRQ, calibration and PC13 output',()=>{
 const r={board,count:0,regs:new Map([[0x4002101c,(1<<28)|(1<<27)]]),inputs:{}},rtc=new STMRTC(r);r.rtc=rtc;rtc.pwr|=256;
 rtc.backup[0]=123;rtc.write(0x40006c30,1,4);rtc.write(0x40006c34,4,4);rtc.tamper(true);assert.equal(rtc.backup[0],0);assert.equal(rtc.read(0x40006c34,4),772);assert.ok(rtc.irqExtra()&(1<<9));rtc.write(0x40006c34,7,4);assert.equal(rtc.read(0x40006c34,4),4);
 rtc.write(0x40006c30,0,4);rtc.write(0x40006c2c,1|128,4);rtc.calibrationPulse=1048575;const before=rtc.pulses;rtc.pulse();assert.equal(rtc.pulses,before);rtc.pulse();assert.equal(rtc.pulses,before+1);assert.equal(rtc.outputs({PC13:{}}).PC13.mode,'RTC_OUT');rtc.systemReset();assert.equal(rtc.read(0x40006c2c,4),129);rtc.backupReset();assert.equal(rtc.read(0x40006c2c,4),0);
});
for(const [id,board]of Object.entries(STM32_BOARDS).filter(([,b])=>b.cpu==='cortex-m4f'))test(id+' NEW RTC timestamp overflow, tamper erase, shift, DST and calibrated pulses',()=>{
 const r={board,count:0,regs:new Map([[0x40023840,1<<28]]),inputs:{},watchdogs:{lsiOn:()=>true,lsi:32000}},rtc=new STMRTC(r);r.rtc=rtc;r.exti=new STMEXTI(r);rtc.pwr|=256;rtc.unlocked=true;
 rtc.regs.set(0,0x123456);rtc.regs.set(4,0x241018);rtc.writeCalendar(8,2048|32768|32);rtc.timestamp(true);assert.equal(rtc.read(0x40002834,4),0x123456);assert.ok(rtc.regs.get(12)&2048);rtc.timestamp(true);assert.ok(rtc.regs.get(12)&4096);
 rtc.backup[0]=123;rtc.writeCalendar(76,5);rtc.tamper(true);assert.equal(rtc.backup[0],0);assert.ok(rtc.regs.get(12)&8192);
 rtc.regs.set(0,0x123400);rtc.regs.set(16,0x000000ff);rtc.sync=200;rtc.writeCalendar(48,100);assert.equal(rtc.sync,100);rtc.writeCalendar(8,32|(1<<16));assert.equal((rtc.regs.get(0)>>>16)&63,0x13);rtc.writeCalendar(8,32|(1<<17));assert.equal((rtc.regs.get(0)>>>16)&63,0x12);
 rtc.writeCalendar(64,0x8000);const before=rtc.pulses;for(let i=0;i<2048;i++)rtc.pulse();assert.equal(rtc.pulses-before,2049);rtc.systemReset();assert.equal(rtc.unlocked,false);assert.equal(rtc.read(0x40002840,4),0x8000);
});
