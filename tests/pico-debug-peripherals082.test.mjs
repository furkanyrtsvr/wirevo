import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compilePico} from '../src/pico-compiler.js';
import {PicoRuntime} from '../dist/pico-runtime.js';
import {PICO_BOARDS} from '../dist/pico-boards.js';
import {packPicoImage,validatePicoImage} from '../dist/pico-image.js';
import {createPicoProject} from '../dist/pico-project.js';
import {validateProject} from '../dist/core.js';
const module=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
const debugSource=`#include "helper.h"
volatile int counter=3;
int main(void){
 int local=7;
 counter+=local;
 counter=twice(counter);
 while(1){counter++;}
}
`;
const files=[{name:'helper.h',content:'int twice(int value);\n'},{name:'helper.c',content:'int twice(int value){\n int result=value*2;\n return result;\n}\n'}];
const peripheralSource=`#include <pico/stdlib.h>
#include <hardware/adc.h>
#include <hardware/pwm.h>
#include <hardware/uart.h>
#include <hardware/i2c.h>
#include <hardware/spi.h>
volatile unsigned sample;volatile int nack,loopback;volatile unsigned done;
int main(void){
 adc_init();adc_gpio_init(26);adc_select_input(0);sample=adc_read();
 gpio_set_function(15,GPIO_FUNC_PWM);pwm_config c=pwm_get_default_config();pwm_config_set_wrap(&c,99);pwm_config_set_clkdiv_int(&c,100);pwm_init(pwm_gpio_to_slice_num(15),&c,false);pwm_set_gpio_level(15,25);pwm_set_enabled(pwm_gpio_to_slice_num(15),true);
 uart_init(uart1,9600);uart_puts(uart1,"UART1 OK");
 gpio_init(4);gpio_init(5);gpio_pull_up(4);gpio_pull_up(5);gpio_set_function(4,GPIO_FUNC_I2C);gpio_set_function(5,GPIO_FUNC_I2C);i2c_init(i2c0,100000);uint8_t byte=0;nack=i2c_write_blocking(i2c0,0x50,&byte,1,false);
 gpio_init(16);gpio_init(18);gpio_init(19);gpio_set_function(16,GPIO_FUNC_SPI);gpio_set_function(18,GPIO_FUNC_SPI);gpio_set_function(19,GPIO_FUNC_SPI);spi_init(spi0,500000);uint8_t tx=0xa5,rx=0;spi_write_read_blocking(spi0,&tx,&rx,1);loopback=rx;
 done=1;
 while(1){tight_loop_contents();}
}
`;
const compiled=new Map();for(const id of ['pico','pico-2'])compiled.set(PICO_BOARDS[id].mcu,{debug:await compilePico(module,debugSource,id,files),peripheral:await compilePico(module,peripheralSource,id)});
function runtimeFor(id,kind){const b=PICO_BOARDS[id],template=compiled.get(b.mcu)[kind],image=packPicoImage(validatePicoImage(template.image,b.mcu==='RP2040'?'pico':'pico-2'),id),r=new PicoRuntime(image,id);r.setDebugInfo(template.debugInfo);return r;}
function advance(r,max=100000){for(let n=0;n<max&&!r.debugger.reason;n+=1000)r.step(1000);assert.ok(r.debugger.reason,'CPU should stop');}
function variable(r,name){const v=r.debugger.snapshot(true).variables.find(v=>v.name===name);assert.ok(v,name+' visible');assert.ok(!v.unavailable,v.unavailable);return v.value;}
for(const id of Object.keys(PICO_BOARDS)){
 test(id+' breakpoint stops before actual store, line step and multi-file local watch',()=>{const r=runtimeFor(id,'debug');try{r.debugger.configure([{file:'main.c',line:5}],['counter','local']);advance(r);assert.equal(r.debugger.location().line,5);assert.equal(variable(r,'counter'),3);assert.equal(variable(r,'local'),7);const cycles=r.count;r.step(100);assert.equal(r.count,cycles,'stopped means no instruction executed');r.debugger.beginStep();advance(r);assert.equal(r.debugger.location().line,6);assert.equal(variable(r,'counter'),10);r.debugger.configure([{file:'helper.c',line:3}],['result','value']);r.debugger.resume();advance(r);assert.equal(r.debugger.location().file,'helper.c');assert.equal(variable(r,'value'),10);assert.equal(variable(r,'result'),20);assert.ok(!r.debugger.snapshot(true).variables.some(v=>v.name==='local'));r.debugger.configure([{file:'main.c',line:7}],[]);r.debugger.resume();advance(r);assert.equal(variable(r,'counter'),20);assert.throws(()=>r.debugger.memory(0x40000000,4));}finally{r.dispose();}});
 test(id+' ADC electrical input, PWM edges, UART1, I2C absent-device NACK and SPI wired loopback',()=>{const r=runtimeFor(id,'peripheral');try{const p=createPicoProject({board:id,starter:'empty'});p.wires=[['mcu:3V3','mcu:GPIO26'],['mcu:GPIO19','mcu:GPIO16']].map(([from,to],i)=>({id:'new'+i,from,to,color:'#14b8a6',points:[]}));r.attachCircuit(p);const edges=[];r.rp.gpio[15].addListener(v=>edges.push({v,t:r.rp.clock.nanos}));r.debugger.configure([{file:'main.c',line:15}],[]);let serial='';for(let n=0;n<300&&!r.debugger.reason;n++)serial+=r.step(1000);assert.ok(r.debugger.reason);assert.equal(variable(r,'sample'),4095);assert.equal(variable(r,'nack'),-1);assert.equal(variable(r,'loopback'),0xa5);assert.equal(variable(r,'done'),1);assert.match(serial,/UART1 OK/);assert.ok(edges.some(e=>e.v===0)&&edges.some(e=>e.v===1),'PWM produces timed high and low edges');}finally{r.dispose();}});
}
test('debug locations reject end-of-file breakpoints and unsupported variable expressions',()=>{const r=runtimeFor('pico','debug');try{r.debugger.configure([{file:'main.c',line:999}],['counter','counter+1']);assert.equal(r.debugger.breakpoints[0].resolvedLine,null);assert.deepEqual(r.debugger.watches,['counter']);assert.equal(r.debugger.readVariable({name:'x',type:{name:'int',size:4,encoding:5},location:[255]}).value,undefined);}finally{r.dispose();}});
test('debugger settings survive project JSON validation',()=>{const p=createPicoProject();p.settings.debugger={breakpoints:[{file:'main.c',line:5}],watches:['counter']};const next=validateProject(JSON.parse(JSON.stringify(p)));assert.deepEqual(next.settings.debugger,p.settings.debugger);p.settings.debugger.watches=['counter+1'];assert.throws(()=>validateProject(p));});
for(const id of ['pico','pico-2'])test(id+' new I2C master writes EEPROM, repeated-start reads actual stored byte',async()=>{const source=`#include <pico/stdlib.h>
#include <hardware/i2c.h>
volatile int written,readback;volatile unsigned value;
int main(void){
 gpio_init(4);gpio_init(5);gpio_pull_up(4);gpio_pull_up(5);gpio_set_function(4,GPIO_FUNC_I2C);gpio_set_function(5,GPIO_FUNC_I2C);i2c_init(i2c0,100000);
 uint8_t data[3]={0,12,0x5a},pointer[2]={0,12},rx=0;
 written=i2c_write_blocking(i2c0,0x50,data,3,false);sleep_ms(6);
 i2c_write_blocking(i2c0,0x50,pointer,2,true);readback=i2c_read_blocking(i2c0,0x50,&rx,1,false);value=rx;
 while(1){tight_loop_contents();}
}
`;const compiled=await compilePico(module,source,id),r=new PicoRuntime(compiled.image,id);try{const p=createPicoProject({board:id,starter:'empty'});p.components.push({id:'mem',type:'eeprom',x:650,y:200,rotation:0,params:{}});p.wires=[['mcu:3V3','mem:VCC'],['mcu:GND','mem:GND'],...['A0','A1','A2','WP'].map(n=>['mcu:GND','mem:'+n]),['mcu:GPIO4','mem:SDA'],['mcu:GPIO5','mem:SCL']].map(([from,to],i)=>({id:'ee'+i,from,to,color:'#14b8a6',points:[]}));r.attachCircuit(p);r.setDebugInfo(compiled.debugInfo);r.debugger.configure([{file:'main.c',line:9}],[]);advance(r,2000000);assert.equal(variable(r,'written'),3);assert.equal(variable(r,'readback'),1);assert.equal(variable(r,'value'),0x5a);assert.ok(r.circuit.stats.repeatedStarts>0);}finally{r.dispose();}});
