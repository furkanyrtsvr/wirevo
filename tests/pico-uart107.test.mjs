import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compilePico} from '../src/pico-compiler.js';
import {PicoRuntime} from '../dist/pico-runtime.js';
import {PICO_BOARDS} from '../dist/pico-boards.js';
const base=JSON.parse(readFileSync(new URL('fixtures/pico107/uart-laboratory.json',import.meta.url)));
const wasm=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
const compile=(p,id='pico-2',arch='arm')=>compilePico(wasm,p.code,id,p.files,'c',arch);
const setup=(p,f,id='pico-2')=>{const r=new PicoRuntime(f.image,id);r.setDebugInfo(f.debugInfo);r.attachCircuit(p);return r;};
function until(r,check,limit=120000){let serial='',t=performance.now();while(!check(serial)&&performance.now()-t<limit)serial+=r.step(1000);assert.ok(check(serial),'UART sensor project timeout: '+serial.slice(-250));return serial;}
function single(id='pico-2'){const p=structuredClone(base);p.components.find(c=>c.type==='board').params.model=id;p.code=p.code.replace('i<=15','i<=1');return p;}
function record(s,n){const m=s.match(new RegExp('CO2 round='+n+' n=(\\d+) crc=(\\d+) ppm=(-?\\d+)'));assert.ok(m,'round '+n+' missing');return m.slice(1).map(Number);}
test('107 big sensor project: physical UART data, CRC, breaks, baud, parity, enable bits, mux and recovery',async()=>{
 const p=structuredClone(base),f=await compile(p),r=setup(p,f);let serial='',round=0;const rx=p.wires.find(w=>w.from==='co2:RX'),tx=p.wires.find(w=>w.from==='co2:TX'),echo=p.wires.find(w=>w.from==='distance:ECHO'),co2=p.components.find(c=>c.id==='co2');
 const start=performance.now();try{
 while(!serial.includes('UART LAB COMPLETE')&&performance.now()-start<120000){serial+=r.step(1000);const ready=[...serial.matchAll(/READY (\d+)\r?\n/g)].at(-1);if(!ready||+ready[1]===round)continue;round=+ready[1];if(round===2)co2.params.ppm=1200;rx.to=round===3?'mcu:GPIO22':round===12?'mcu:GPIO20':'mcu:GPIO8';tx.to=round===4?'mcu:GPIO22':round===12?'mcu:GPIO21':'mcu:GPIO9';if(round===12)p.wires=p.wires.filter(w=>w!==echo);else if(!p.wires.includes(echo))p.wires.push(echo);r.circuit.update(p);}
 assert.match(serial,/GPS valid=2 bad=0 RMC=1 GGA=1/);assert.match(serial,/UART LAB COMPLETE/);assert.deepEqual(record(serial,1),[9,1,850]);for(const n of [2,7,9,12,13,15])assert.deepEqual(record(serial,n),[9,1,1200]);for(const n of [3,4,5,6,8,10,11,14])assert.deepEqual(record(serial,n),[0,0,-1]);
 const stats=r.uartPins.snapshot();assert.ok(stats[0].rxBytes>=139);assert.ok(stats[1].txBytes>=100);assert.equal(stats[0].framingErrors,0);assert.equal(stats[0].parityErrors,0);assert.equal(r.circuit.peripherals.snapshot().uartDevices.modules.co2.requests,10);
 console.log('New UART laboratory:',JSON.stringify({wall_ms:performance.now()-start,uart:stats,serial}));
 }finally{r.dispose();}
});
test('107 all eight ARM Pico boards: same 56-part project receives checked NMEA and 850 ppm',async()=>{
 for(const id of Object.keys(PICO_BOARDS)){const p=single(id),f=await compile(p,id),r=setup(p,f,id);try{const s=until(r,s=>s.includes('UART LAB COMPLETE'));assert.match(s,/GPS valid=2 bad=0 RMC=1 GGA=1/,id);assert.deepEqual(record(s,1),[9,1,850],id);console.log('UART profile:',id);}finally{r.dispose();}}
});
test('107 GPS unplugged: no NMEA is invented, independent MH-Z19 still returns valid data',async()=>{
 const p=single();p.wires=p.wires.filter(w=>w.from!=='gps:TX');const f=await compile(p),r=setup(p,f);try{const s=until(r,s=>s.includes('UART LAB COMPLETE'));assert.match(s,/GPS valid=0 bad=0 RMC=0 GGA=0/);assert.deepEqual(record(s,1),[9,1,850]);assert.equal(r.uartPins.snapshot()[0].rxBytes,0);}finally{r.dispose();}
});
test('107 reset during pending UART frame discards old queue and decodes fresh sensor frames',async()=>{
 const p=single(),f=await compile(p),r=setup(p,f);try{until(r,()=>r.uartPins.snapshot()[0].rxBytes>=1);r.reset();r.setDebugInfo(f.debugInfo);assert.equal(r.uartPins.snapshot()[0].rxBytes,0);assert.equal(r.uartPins.snapshot()[1].txBytes,0);const s=until(r,s=>s.includes('UART LAB COMPLETE'));assert.match(s,/GPS valid=2 bad=0 RMC=1 GGA=1/);assert.deepEqual(record(s,1),[9,1,850]);}finally{r.dispose();}
});
test('107 Hazard3 Pico 2: hardware MH-Z19 waveform and checked response in same circuit',async()=>{
 const p=single();p.code=p.code.replace('gps_window(1200000);','');const f=await compile(p,'pico-2','riscv'),r=setup(p,f);try{const s=until(r,s=>s.includes('UART LAB COMPLETE'));assert.deepEqual(record(s,1),[9,1,850]);}finally{r.dispose();}
});
test('107 wrong GPS baud yields no valid NMEA while the independent MH-Z19 remains correct',async()=>{
 const p=single();p.code=p.code.replace('uart_init(uart0,9600)','uart_init(uart0,4800)');const f=await compile(p),r=setup(p,f);try{const s=until(r,s=>s.includes('UART LAB COMPLETE'));assert.match(s,/GPS valid=0 /);assert.deepEqual(record(s,1),[9,1,850]);assert.ok(r.uartPins.snapshot()[0].rxBytes>0);}finally{r.dispose();}
});

test('107 published sensor project compiles and reports checked GPS and MH-Z19 success',async()=>{const p=JSON.parse(readFileSync(new URL('fixtures/pico107/public-laboratory.json',import.meta.url))),f=await compile(p),r=setup(p,f);try{const s=until(r,s=>/UART LAB COMPLETE failures=0/.test(s));assert.match(s,/NMEA \$GPRMC/);assert.match(s,/NMEA \$GPGGA/);assert.match(s,/MH-Z19 n=9 crc=1 ppm=850/);}finally{r.dispose();}});

test('107 GPS parity mismatch reports receive errors and clear restores error status',async()=>{const p=single();p.code=p.code.replace('uart_init(uart0,9600);','uart_init(uart0,9600);uart_set_format(uart0,8,1,UART_PARITY_EVEN);');const f=await compile(p),r=setup(p,f);try{const s=until(r,s=>s.includes('UART LAB COMPLETE'));assert.deepEqual(record(s,1),[9,1,850]);const errors=r.uartPins.snapshot()[0];assert.ok(errors.framingErrors+errors.parityErrors>0);assert.ok(r.rp.readUint32(0x40070004)&3);r.rp.writeUint32(0x40070004,0);assert.equal(r.rp.readUint32(0x40070004)&3,0);}finally{r.dispose();}});
test('107 physical MH-Z19 reply reaches UART RX timeout IRQ and FIFO on both Pico MCU families',async()=>{
 for(const id of ['pico','pico-2']){const p=single(id);p.files=p.files.filter(f=>f.name==='lab.h');p.code='#include "lab.h"\n#include <hardware/irq.h>\nvolatile unsigned done,count,hits;volatile uint8_t bytes[9];void received(void){hits++;while(uart_is_readable(uart1)){unsigned n=count;uint8_t b=uart_getc(uart1);if(n<9){bytes[n]=b;count=n+1;}}uart_get_hw(uart1)->icr=0x7ff;}int main(void){gpio_set_function(8,GPIO_FUNC_UART);gpio_set_function(9,GPIO_FUNC_UART);uart_init(uart1,9600);irq_set_exclusive_handler(UART1_IRQ,received);irq_set_enabled(UART1_IRQ,true);uart_set_irq_enables(uart1,true,false);uint8_t q[]={255,1,134,0,0,0,0,0,121};uart_write_blocking(uart1,q,9);sleep_ms(100);done=1;while(1)sleep_ms(10);}';const f=await compile(p,id),r=setup(p,f,id);try{const variable=n=>f.debugInfo.variables.find(v=>v.name===n);until(r,()=>r.debugger.readVariable(variable('done')).value===1);assert.equal(r.debugger.readVariable(variable('count')).value,9,id);assert.ok(r.debugger.readVariable(variable('hits')).value>=1,id);const loc=r.debugger.expression(variable('bytes').location).value;assert.deepEqual(Array.from(r.debugger.memory(loc,4)),[255,134,3,82]);}finally{r.dispose();}}
});
