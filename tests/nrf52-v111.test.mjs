import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compileNRF52} from '../src/nrf52-compiler.js';
import {NRF52Runtime} from '../dist/nrf52-runtime.js';
import {NRF52_BOARDS} from '../dist/nrf52-boards.js';
import {createNRF52Project} from '../dist/nrf52-project.js';
import {validateProject,componentDefinition} from '../dist/core.js';
import {Worker} from 'node:worker_threads';
import {sourceKey} from '../dist/source-files.js';
const wasm=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
await NRF52Runtime.initialize(readFileSync(new URL('../dist/nrf52-cpu.wasm',import.meta.url)));
async function start(p){const id=p.components[0].params.model,f=await compileNRF52(wasm,p.code,id,p.files),r=await new NRF52Runtime(f.image,id).load();r.setDebugInfo(f.debugInfo);r.attachCircuit(p);return{r,f};}
const value=(r,n)=>r.debugger.readVariable(r.debugger.info.variables.find(v=>v.name===n)).value;
function until(r,predicate,max=4000000){let serial='';for(let i=0;i<max/1000&&!predicate(serial);i++)serial+=r.step(1000);assert.ok(predicate(serial),'CPU did not reach completion');return serial;}
for(const id of Object.keys(NRF52_BOARDS))test('111 actual C17 integrated sensor circuit: '+id,async()=>{
 const p=createNRF52Project({board:id,starter:'laboratory'});validateProject(p);const{r,f}=await start(p);try{
 const serial=until(r,()=>value(r,'done')===1);assert.match(serial,/LAB OK\r\n/);assert.equal(value(r,'failures'),0);assert.deepEqual(r.circuit.snapshot().devices.display.cells.map(row=>String.fromCharCode(...row)),['NRF52840        ','C17 OK          ']);assert.equal(value(r,'spi_value'),512);assert.ok(Math.abs(value(r,'adc_value')-1877)<=2);assert.ok(Math.abs(value(r,'temperature_raw')-25840)<=1);assert.ok(Math.abs(value(r,'humidity_raw')-36044)<=1);
 assert.equal(r.get(0x4000354c),3);assert.equal(r.get(0x4000353c),0);assert.equal(r.get(0x4000453c),3);assert.equal(r.circuit.snapshot().bus.addressNACK,0);assert.ok(r.circuit.snapshot().bus.repeatedStarts>=1);assert.ok(r.circuit.snapshot().leds['$nrf-led-'+r.board.ledPin].connected);assert.ok(Number.isFinite(r.inputVoltages[r.board.ledPin]));
 // Same firmware and pin graph can be saved and reopened; target-checked wrapper + debug info.
 validateProject({...p,firmware:{format:'nrf52-bin',board:id,payload:Buffer.from(f.image).toString('base64'),source:p.code,sourceKey:sourceKey(p),debugInfo:f.debugInfo}});
 const transitions=[];let last=r.inputs[r.board.ledPin];r.circuit.onTrace=(cycle,inputs)=>{const level=inputs[r.board.ledPin];if(level!==last){transitions.push(cycle);last=level;}};r.step(150000);assert.ok(transitions.length>=4);for(let i=1;i<transitions.length;i++)assert.ok(Math.abs(transitions[i]-transitions[i-1]-8000)<1,'PWM high/low phase must be 500 us');
 console.log(id,{serial:serial.trim(),ADC:value(r,'adc_value'),SPI:value(r,'spi_value'),cycles:r.count,edges:r.circuit.snapshot().bus.edges});
 }finally{r.dispose();}
});
test('111 four board pinouts, input tact button, active-high/low LEDs and reset',async()=>{
 for(const id of Object.keys(NRF52_BOARDS)){
 const p=createNRF52Project({board:id,starter:'buttons'});validateProject(p);const{r}=await start(p);try{r.step(4000);assert.equal(r.circuit.snapshot().leds['$nrf-led-'+r.board.ledPin].on,false);p.components.find(c=>c.id==='button').params.pressed=true;r.circuit.update(p);r.step(4000);assert.equal(r.circuit.snapshot().leds['$nrf-led-'+r.board.ledPin].on,true);r.reset();r.step(4000);assert.equal(r.circuit.snapshot().leds['$nrf-led-'+r.board.ledPin].on,true);}finally{r.dispose();}}
 assert.equal(NRF52_BOARDS['nice-nano-v2'].pins.find(p=>p.id==='RAW').voltage,undefined);
 assert.equal(NRF52_BOARDS['xiao-nrf52840'].pins.find(p=>p.id==='P0.04').name,'D4 / P0.04');
});
test('111 physical UARTE EasyDMA TX/RX loopback, parity, amounts and invalid RAM',async()=>{
 for(const id of Object.keys(NRF52_BOARDS)){
 const p=createNRF52Project({board:id,starter:'empty'}),b=NRF52_BOARDS[id],pin=n=>`P${n>>>5}.${String(n&31).padStart(2,'0')}`;
 p.wires=[{id:'loop',from:'mcu:'+pin(b.txPin),to:'mcu:'+pin(b.rxPin),color:'#14b8a6',points:[]}];
 p.code=`#include <cf_hal.h>\nvolatile unsigned done,bad;unsigned char tx[]={0x55,0xa5,0x37},rx[3];int main(void){NRF_UARTE0->PSEL.TXD=BOARD_TXD;NRF_UARTE0->PSEL.RXD=BOARD_RXD;NRF_UARTE0->BAUDRATE=0x01d7e000;NRF_UARTE0->CONFIG=14;NRF_UARTE0->ENABLE=8;NRF_UARTE0->RXD.PTR=(uint32_t)rx;NRF_UARTE0->RXD.MAXCNT=3;NRF_UARTE0->TXD.PTR=(uint32_t)tx;NRF_UARTE0->TXD.MAXCNT=3;NRF_UARTE0->TASKS_STARTRX=1;NRF_UARTE0->TASKS_STARTTX=1;while(!NRF_UARTE0->EVENTS_ENDRX||!NRF_UARTE0->EVENTS_ENDTX){}for(unsigned i=0;i<3;i++)if(tx[i]!=rx[i])bad++;done=1;while(1){__WFI();}}`;
 const{r}=await start(p);try{until(r,()=>value(r,'done')===1,500000);assert.equal(value(r,'bad'),0);assert.equal(r.get(0x4000253c),3);assert.equal(r.get(0x4000254c),3);assert.equal(r.get(0x40002480),0);assert.equal(r.uart(0x40002000).tx.finished,3);r.dmaRead(0,1,()=>{});assert.throws(()=>r.step(1),/SRAM/);}finally{r.dispose();}}
});
test('111 TIMER0 NVIC IRQ, GPIOTE input event and SAADC buffer contents',async()=>{
 const p=createNRF52Project({starter:'timer'});p.code=p.code.replace('100000','100');const{r}=await start(p);try{until(r,()=>value(r,'ticks')>=3,100000);assert.ok(r.count>=19200);assert.ok(r.count<60000);assert.equal(r.get(0x40008140),0);r.writeRegister(0x40006510,1|(8<<8)|(3<<16));r.inputs['P0.08']=false;r.observeGPIO();r.inputs['P0.08']=true;r.observeGPIO();assert.equal(r.get(0x40006100),1);}finally{r.dispose();}
});
test('111 real source breakpoint, line step, watched SRAM and FPU',async()=>{
 const p=createNRF52Project({starter:'empty'});p.code=`#include <cf_hal.h>\nvolatile unsigned counter;volatile float fraction;\nint main(void){\n counter=7;\n fraction=1.25f;\n fraction=fraction*2.0f;\n counter++;\n while(1){__WFI();}\n}\n`;
 const{r}=await start(p);try{r.debugger.configure([{file:'main.c',line:7}],['counter','fraction']);until(r,()=>r.debugger.reason==='breakpoint',100000);assert.equal(value(r,'counter'),7);assert.equal(value(r,'fraction'),2.5);assert.equal(r.debugger.location().line,7);r.debugger.beginStep();until(r,()=>r.debugger.reason==='line',10000);assert.equal(value(r,'counter'),8);assert.equal(r.debugger.snapshot(true).watches[0].value,8);}finally{r.dispose();}
});

test('111 browser worker ready/run/pause/reset/source-step protocol',async()=>{
 const p=createNRF52Project({starter:'empty'});p.code='#include <cf_hal.h>\nvolatile unsigned counter;\nint main(void){\n counter=10;\n counter++;\n while(1){__WFI();}\n}\n';const f=await compileNRF52(wasm,p.code,'nrf52840-supermini',p.files);
 const w=new Worker(new URL('../scripts/nrf52/worker-harness.mjs',import.meta.url));const queue=[],waiters=[];w.on('message',d=>waiters.length?waiters.shift()(d):queue.push(d));const next=()=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('nRF52 worker timeout')),10000),take=d=>{clearTimeout(timer);d.type==='error'?reject(Error(d.message)):resolve(d);};if(queue.length)take(queue.shift());else waiters.push(take);});
 try{w.postMessage({type:'load',chip:'nrf52840-supermini',language:'c',hex:Buffer.from(f.image).toString('base64'),circuit:p,circuitId:111,debugInfo:f.debugInfo,breakpoints:[{file:'main.c',line:5}],watches:['counter']});const ready=await next();assert.equal(ready.type,'ready');assert.equal(ready.circuitId,111);w.postMessage({type:'run'});let d=await next();while(!d.debug?.reason)d=await next();assert.equal(d.debug.reason,'breakpoint');assert.equal(d.running,false);assert.equal(d.debug.watches[0].value,10);w.postMessage({type:'debug-step'});d=await next();while(!d.debug?.reason)d=await next();assert.equal(d.debug.reason,'line');assert.equal(d.debug.watches[0].value,11);w.postMessage({type:'pause'});assert.equal((await next()).running,false);w.postMessage({type:'reset'});assert.equal((await next()).seconds,0);}finally{await w.terminate();}
});
