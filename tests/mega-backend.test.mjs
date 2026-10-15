import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Mega2560Runtime} from '../src/mega2560-runtime.js';
import {parseHex} from '../src/uno-runtime.js';
const hex=readFileSync(new URL('./fixtures/mega-backend.hex',import.meta.url),'utf8');
test('native avr6 core executes with three-byte PC, far flash, >2KB SRAM and four USARTs',()=>{
 const serial=['','','',''];const r=new Mega2560Runtime(hex,{onSerial:(i,b)=>serial[i]+=String.fromCharCode(b)});
 r.adc.channelValues[15]=2.5;r.stepCycles(4000000);
 assert.equal(r.cpu.pc22Bits,true);assert.equal(r.cpu.data.length,0x2200);
 assert.match(serial[0],/FAR=77 MEGA A15=512 MS=\d+/);
 const times=[...serial[0].matchAll(/MS=(\d+)/g)].map(m=>+m[1]);assert.ok(times.length>=2);assert.ok(times[1]>=times[0]+100);
 assert.match(serial[1],/^AA/);assert.match(serial[2],/^BB/);assert.match(serial[3],/^CC/);
 assert.equal(r.ports.B.pinState(0),1); // Arduino D53
});
test('Mega Timer5 drives OC5C on PL5 using native Arduino analogWrite(44)',()=>{
 const r=new Mega2560Runtime(hex);const edges=[];r.ports.L.addListener((v,p)=>{if((v^p)&32)edges.push(r.cpu.cycles);});r.stepCycles(1000000);
 assert.equal(r.timers.length,6);assert.ok(edges.length>20);
 const periods=edges.slice(3).map((v,i,a)=>i?v-a[i-1]:0).filter(v=>v>0);assert.ok(periods.every(v=>Math.min(Math.abs(v-16384),Math.abs(v-16256))<=5));
});
test('Mega extended HEX is explicitly rejected by Uno and retained by the Mega parser',()=>{
 assert.throws(()=>parseHex(hex),/ATmega328P flash/);
 const p=parseHex(hex,{flashSize:262144});assert.equal(new Uint8Array(p.program.buffer)[0x20000],77);
 assert.throws(()=>parseHex(hex,{flashSize:1000000}),/kapasitesi/);
});
