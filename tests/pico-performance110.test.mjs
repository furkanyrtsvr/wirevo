import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compilePico} from '../src/pico-compiler.js';
import {PicoRuntime} from '../dist/pico-runtime.js';
const wasm=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
const load=n=>JSON.parse(readFileSync(new URL('fixtures/pico110/'+n,import.meta.url)));
function setup(p,f,id='pico-2'){const r=new PicoRuntime(f.image,id);r.setDebugInfo(f.debugInfo);r.attachCircuit(p);return r;}
function run(r,f,finish,limit=60000){let serial='',instructions=0,t=performance.now();const execute=r.core.executeInstruction.bind(r.core);r.core.executeInstruction=()=>{instructions++;return execute();};while(!finish(serial)&&performance.now()-t<limit)serial+=r.step(1000);return{serial,instructions,wall_ms:performance.now()-t,wait:r.waitStats,uart:r.uartPins.snapshot()};}
test('110 dense serial output in the 56-part circuit preserves bytes and baud duration with far fewer executed instructions',async()=>{
 const p=load('serial-project.json'),before=load('baseline.json'),f=await compilePico(wasm,p.code,'pico-2',p.files,'c','arm'),r=setup(p,f);try{const done=f.debugInfo.variables.find(v=>v.name==='done'),result=run(r,f,()=>r.debugger.readVariable(done).value===1);assert.equal(result.serial,before.serial);assert.equal(result.uart[0].txBytes,192);assert.equal(result.uart[0].dropped,0);assert.equal(result.uart[0].burstBytes,192);assert.ok(result.instructions<before.instructions/20);const period=16*r.rp.uart[0].baudDivider/r.rp.clkPeri*1e9;assert.ok(Math.abs(result.uart[0].lastEnd-result.uart[0].burstStart-192*10*period)<1);console.log('110 before/after',JSON.stringify({before,after:result}));}finally{r.dispose();}
});
for(const id of ['pico','pico-2'])test('110 accelerated waits retain DHT, GPS, MH-Z19 and clock/IRQ behavior in the large circuit: '+id,async()=>{
 const p=JSON.parse(readFileSync(new URL('fixtures/pico109/laboratory.json',import.meta.url)));p.components.find(c=>c.type==='board').params.model=id;const f=await compilePico(wasm,p.code,id,p.files,'c','arm'),r=setup(p,f,id);try{const result=run(r,f,s=>/UART109 COMPLETE failures=\d+\r?\n/.test(s));assert.match(result.serial,/UART109 COMPLETE failures=0/);assert.match(result.serial,/DHT11=1 DHT22=1/);assert.match(result.serial,/GPS valid=2 bad=0 MHZ19 ppm=850 crc=1/);assert.equal(result.uart[1].dropped,0);console.log('110 sensors',id,JSON.stringify(result));}finally{r.dispose();}
});
test('110 declared UART waits stop at timer IRQs and preserve a receive timeout',async()=>{
 const p=load('serial-project.json');p.code='#include <pico/stdlib.h>\n#include <hardware/uart.h>\nvolatile unsigned done,hits;volatile int value;volatile uint32_t timeout_us;int64_t alarm(alarm_id_t id,void*u){hits++;return 0;}int main(void){stdio_init_all();gpio_set_function(0,GPIO_FUNC_UART);uart_init(uart0,9600);add_alarm_in_us(3000,alarm,0,true);for(int i=0;i<48;i++)uart_putc_raw(uart0,65);uart_tx_wait_blocking(uart0);uint32_t t=time_us_32();value=uart_is_readable_within_us(uart0,3000);timeout_us=time_us_32()-t;done=1;while(1)sleep_ms(100);}';const f=await compilePico(wasm,p.code,'pico-2',[],'c','arm'),r=setup(p,f);const val=n=>r.debugger.readVariable(f.debugInfo.variables.find(v=>v.name===n)).value;try{const result=run(r,f,()=>val('done')===1);assert.equal(val('hits'),1);assert.equal(val('value'),0);assert.ok(val('timeout_us')>=3000&&val('timeout_us')<3020);assert.equal(result.serial,'A'.repeat(48));console.log('110 IRQ/timeout',JSON.stringify({hits:val('hits'),timeout_us:val('timeout_us'),...result}));}finally{r.dispose();}
});
