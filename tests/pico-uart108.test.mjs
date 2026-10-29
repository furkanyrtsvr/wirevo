import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compilePico} from '../src/pico-compiler.js';
import {PicoRuntime} from '../dist/pico-runtime.js';
import {PICO_BOARDS} from '../dist/pico-boards.js';
const base=JSON.parse(readFileSync(new URL('fixtures/pico108/laboratory.json',import.meta.url)));
const wasm=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
for(const id of Object.keys(PICO_BOARDS))test('108 new FIFO/CTS/RTS/fractional timing in the large sensor circuit: '+id,async()=>{
 const p=structuredClone(base);p.components.find(c=>c.type==='board').params.model=id;
 const f=await compilePico(wasm,p.code,id,p.files,'c','arm'),r=new PicoRuntime(f.image,id);
 r.setDebugInfo(f.debugInfo);r.attachCircuit(p);let serial='',lastPhase=0;const phases={},gates=[],started=performance.now();let lastGate=false;r.rp.gpio[22].addListener(()=>{const high=r.rp.gpio[22].outputEnable&&r.rp.gpio[22].outputValue;if(high&&!lastGate)r.rp.clock.createAlarm(()=>gates.push(r.uartPins.snapshot()[1])).schedule(2e6);lastGate=high;});
 const value=n=>r.debugger.readVariable(f.debugInfo.variables.find(v=>v.name===n)).value;
 try{while(!/UART108 COMPLETE failures=\d+\r?\n/.test(serial)&&performance.now()-started<120000){serial+=r.step(1000);const phase=value('phase');if(phase!==lastPhase){lastPhase=phase;phases[phase]={nanos:r.rp.clock.nanos,uart:r.uartPins.snapshot(),rts:r.circuit.solution.voltages.get(r.circuit.solution.netlist.net('mcu:GPIO11'))};}}
 assert.match(serial,/UART108 COMPLETE failures=0/,serial);assert.match(serial,/GPS valid=2 bad=0 RMC=1 GGA=1/);assert.equal(value('reply_ok'),1);assert.equal(phases[1].uart[1].queued,32);assert.equal(phases[1].uart[1].dropped,1);assert.equal(phases[1].uart[1].busy,true);
 assert.equal(gates[2].queued,8);assert.equal(gates[2].started-gates[2].finished,0);assert.equal(gates[2].cts,false);
 assert.ok(value('disabled_flags')&8);assert.equal(value('disabled_flags')&128,0);assert.equal(value('rts_full'),1);assert.equal(value('rts_empty'),0);
 assert.equal(r.uartPins.snapshot()[1].dropped,2);const t=r.uartPins.snapshot()[1],u=r.rp.uart[1];assert.equal(t.burstBytes,64);assert.ok(Math.abs((t.lastEnd-t.burstStart)-64*10*16*u.baudDivider/r.rp.clkPeri*1e9)<1,'fractional phase error under 1 ns');console.log(id,JSON.stringify({serial,phases,gates,final:r.uartPins.snapshot(),wall_ms:performance.now()-started}));
 }finally{r.dispose();}
});
test('108 new TX and CTS interrupts execute firmware handlers; manual RTS drives the real pad',async()=>{
 for(const id of ['pico','pico-2']){const p=JSON.parse(readFileSync(new URL('fixtures/pico108/irq.json',import.meta.url)));p.components.find(c=>c.type==='board').params.model=id;const f=await compilePico(wasm,p.code,id,p.files,'c','arm'),r=new PicoRuntime(f.image,id);r.setDebugInfo(f.debugInfo);r.attachCircuit(p);const val=n=>r.debugger.readVariable(f.debugInfo.variables.find(v=>v.name===n)).value;try{const at=performance.now();while(!val('done')&&performance.now()-at<30000)r.step(1000);assert.equal(val('done'),1);assert.ok(val('tx_hits')>=1,id);assert.ok(val('cts_hits')>=2,id);assert.equal(val('manual_low'),0);assert.equal(val('manual_high'),1);console.log('IRQ',id,val('tx_hits'),val('cts_hits'));}finally{r.dispose();}}
});
test('108 UART DMA requests respect DMACR, FIFO capacity and physical CTS without lost writes',async()=>{
 for(const id of ['pico','pico-2']){const p=JSON.parse(readFileSync(new URL('fixtures/pico108/dma.json',import.meta.url)));p.code=p.code.replace('DREQ_NUMBER',id==='pico'?22:30);p.components.find(c=>c.type==='board').params.model=id;const f=await compilePico(wasm,p.code,id,p.files,'c','arm'),r=new PicoRuntime(f.image,id);r.setDebugInfo(f.debugInfo);r.attachCircuit(p);const val=n=>r.debugger.readVariable(f.debugInfo.variables.find(v=>v.name===n)).value;try{const at=performance.now();while(!val('done')&&performance.now()-at<30000)r.step(1000);assert.equal(val('done'),1);assert.equal(val('without_dma'),64);assert.equal(val('with_cts'),32);assert.ok(val('full')&32);const t=r.uartPins.snapshot()[1];assert.equal(t.txBytes,64);assert.equal(t.dropped,0);console.log('DMA',id,t);}finally{r.dispose();}}
});
