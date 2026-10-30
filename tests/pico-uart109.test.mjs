import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compilePico} from '../src/pico-compiler.js';
import {PicoRuntime} from '../dist/pico-runtime.js';
import {PICO_BOARDS} from '../dist/pico-boards.js';
const base=JSON.parse(readFileSync(new URL('fixtures/pico109/laboratory.json',import.meta.url)));
const wasm=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
for(const id of Object.keys(PICO_BOARDS))test('109 physical break/stick parity/clock changes with both DHTs connected: '+id,async()=>{
 const p=structuredClone(base);p.components.find(c=>c.type==='board').params.model=id;
 assert.ok(p.wires.some(w=>w.from==='dht11:DATA'&&w.to==='mcu:GPIO10'));assert.ok(p.wires.some(w=>w.from==='dht22:DATA'&&w.to==='mcu:GPIO11'));
 const f=await compilePico(wasm,p.code,id,p.files,'c','arm'),r=new PicoRuntime(f.image,id);r.setDebugInfo(f.debugInfo);r.attachCircuit(p);
 const parityBits=[];let seen=0;r.rp.gpio[8].addListener(()=>{const t=r.uartPins.snapshot()[1],u=r.rp.uart[1];if(t.started>seen&&t.started<=8&&(u.lineCtrlRegister&130)===130){seen=t.started;const n=t.started;r.rp.clock.createAlarm(()=>parityBits[n-1]=r.rp.gpio[8].outputValue).schedule(9.5*16*u.baudDivider/r.rp.clkPeri*1e9);}});
 let serial='',t=performance.now();const val=n=>r.debugger.readVariable(f.debugInfo.variables.find(v=>v.name===n)).value;
 try{while(!/UART109 COMPLETE failures=\d+\r?\n/.test(serial)&&performance.now()-t<120000)serial+=r.step(1000);
 console.log(id,JSON.stringify({serial,parityBits,uart:r.uartPins.snapshot(),wall_ms:performance.now()-t}));
 assert.match(serial,/UART109 COMPLETE failures=0/,serial);assert.deepEqual(parityBits,[true,true,true,true,false,false,false,false]);assert.equal(val('mark_ok'),4);assert.equal(val('space_ok'),4);assert.ok(val('parity_error')&512);assert.equal(val('parity_clear'),0);
 assert.ok(val('break_word')&1024);assert.equal(val('break_extra'),0);assert.equal(val('break_recovery'),165);assert.equal(val('dht11_ok'),1);assert.equal(val('dht22_ok'),1);
 assert.equal(val('clock_word'),85);assert.equal(val('gate_word'),150);assert.equal(val('divider_word'),105);assert.equal(val('timeout_paused'),0);assert.equal(val('timeout_resumed'),64);
 assert.ok(r.uartPins.snapshot()[0].breakErrors>=1);assert.equal(r.uartPins.snapshot()[1].dropped,0);
 }finally{r.dispose();}
});
test('109 break waits for active character, preserves queued data, distinguishes short framing error and raises a real IRQ',async()=>{
 for(const id of ['pico','pico-2']){const p=JSON.parse(readFileSync(new URL('fixtures/pico109/break.json',import.meta.url)));p.components.find(c=>c.type==='board').params.model=id;const f=await compilePico(wasm,p.code,id,p.files,'c','arm'),r=new PicoRuntime(f.image,id);r.setDebugInfo(f.debugInfo);r.attachCircuit(p);const v=n=>r.debugger.readVariable(f.debugInfo.variables.find(x=>x.name===n)).value;try{const t=performance.now();while(!v('done')&&performance.now()-t<30000)r.step(1000);assert.equal(v('done'),1);assert.equal(v('first'),60);assert.ok(v('brk')&1024);assert.equal(v('held'),1);assert.equal(v('recovered'),109);assert.equal(v('short_low')&0x500,0x100);assert.ok(v('break_hits')>=1);assert.equal(v('irq_bytes'),1);assert.ok(v('irq_word')&1024);assert.equal(v('irq_status'),0);console.log('break IRQ',id,v('first'),v('brk'),v('short_low'),v('break_hits'));}finally{r.dispose();}}
});
test('109 real MH-Z19 replies at 48 MHz and 12 MHz after firmware retunes divisors; SPS with parity disabled is ignored',async()=>{
 for(const id of ['pico','pico-2']){const p=JSON.parse(readFileSync(new URL('fixtures/pico109/clock.json',import.meta.url)));p.components.find(c=>c.type==='board').params.model=id;const f=await compilePico(wasm,p.code,id,p.files,'c','arm'),r=new PicoRuntime(f.image,id);r.setDebugInfo(f.debugInfo);r.attachCircuit(p);const v=n=>r.debugger.readVariable(f.debugInfo.variables.find(x=>x.name===n)).value;try{const t=performance.now();while(!v('done')&&performance.now()-t<30000)r.step(1000);assert.equal(v('done'),1);assert.equal(v('usb_ok'),1);assert.equal(v('xosc_ok'),1);assert.equal(r.rp.clkPeri,12000000);assert.equal(r.circuit.peripherals.snapshot().uartDevices.modules.co2.requests,2);console.log('clock sensor',id,r.rp.clkPeri,r.uartPins.snapshot()[1]);}finally{r.dispose();}}
});
