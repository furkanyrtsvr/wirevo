import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {gunzipSync} from 'node:zlib';
import {compilePico} from '../src/pico-compiler.js';import {PicoRuntime} from '../dist/pico-runtime.js';import {PICO_BOARDS} from '../dist/pico-boards.js';import {packPicoImage,validatePicoImage} from '../dist/pico-image.js';import {createPicoProject} from '../dist/pico-project.js';
const wasm=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
const pwmSource=`#include <pico/stdlib.h>
#include <hardware/pwm.h>
#include <hardware/irq.h>
#include <stdio.h>
volatile unsigned errors,wraps,done,gated,wraps1;
void on_wrap(void){if(pwm_get_irq_status_mask()&128){pwm_clear_irq(7);wraps++;}}
#if PICO_RP2350
void on_wrap1(void){if(pwm_irqn_get_status_mask(1)&128){pwm_clear_irq(7);wraps1++;}}
#endif
int main(void){stdio_init_all();gpio_set_function(14,GPIO_FUNC_PWM);gpio_set_function(15,GPIO_FUNC_PWM);gpio_set_function(12,GPIO_FUNC_PWM);gpio_set_function(13,GPIO_FUNC_PWM);gpio_init(10);gpio_set_dir(10,GPIO_OUT);
 pwm_config c=pwm_get_default_config();pwm_config_set_clkdiv(&c,16.5f);pwm_config_set_wrap(&c,999);pwm_config_set_output_polarity(&c,false,true);pwm_config_set_phase_correct(&c,false);pwm_config_set_clkdiv_mode(&c,PWM_DIV_FREE_RUNNING);if(c.div!=264||c.csr!=8)errors|=1;pwm_init(7,&c,false);pwm_set_both_levels(7,200,750);
 pwm_config gate=pwm_get_default_config();pwm_config_set_clkdiv_int_frac4(&gate,1,0);pwm_config_set_clkdiv_mode(&gate,PWM_DIV_B_RISING);pwm_init(6,&gate,false);
 pwm_set_mask_enabled(192);unsigned base=PICO_RP2350?0x400a8000:0x40050000,off=PICO_RP2350?0xf0:0xa0;if(*(volatile unsigned*)(base+off)!=192)errors|=2;
 for(unsigned i=0;i<6;i++){gpio_put(10,1);sleep_us(2);gpio_put(10,0);sleep_us(2);}gated=pwm_get_counter(6);if(gated!=6)errors|=4;
 irq_set_exclusive_handler(PWM_IRQ_WRAP,on_wrap);pwm_set_irq_enabled(7,true);irq_set_enabled(PWM_IRQ_WRAP,true);sleep_ms(4);if(!wraps)errors|=8;
 pwm_set_irq_mask_enabled(128,false);irq_set_enabled(PWM_IRQ_WRAP,false);pwm_clear_irq(7);if(pwm_get_irq_status_mask())errors|=16;
 #if PICO_RP2350
 irq_set_exclusive_handler(PWM_IRQ_WRAP_1,on_wrap1);pwm_irqn_set_slice_enabled(1,7,true);irq_set_enabled(PWM_IRQ_WRAP_1,true);sleep_ms(2);if(!wraps1)errors|=64;pwm_irqn_set_slice_enabled(1,7,false);irq_set_enabled(PWM_IRQ_WRAP_1,false);pwm_clear_irq(7);
#endif
 pwm_set_clkdiv(7,32.25f);if(*(volatile unsigned*)(base+7*20+4)!=516)errors|=32;pwm_set_output_polarity(7,false,true);pwm_set_phase_correct(7,false);
 done=103;puts(errors?"PWM103_FAIL":"PWM103_OK");while(1)tight_loop_contents();}
`;
const i2cSource=`#include <pico/stdlib.h>
#include <hardware/i2c.h>
#include <stdio.h>
volatile unsigned errors,elapsed,done;volatile int result;
int main(void){stdio_init_all();gpio_set_function(4,GPIO_FUNC_I2C);gpio_set_function(5,GPIO_FUNC_I2C);gpio_pull_up(4);gpio_pull_up(5);i2c_init(i2c0,100000);if(i2c_get_index(i2c0)!=0||i2c_set_baudrate(i2c0,100000)!=100000)errors|=1;
 uint8_t write[3]={0,16,0x5a},pointer[2]={0,16},read=0;
#ifdef FAULT_CLOCK
 unsigned start=time_us_32();result=i2c_write_timeout_us(i2c0,0x50,write,3,false,200);elapsed=time_us_32()-start;if(result!=PICO_ERROR_TIMEOUT||elapsed<190||elapsed>400)errors|=2;
#elif defined(NO_DEVICE)
 result=i2c_read_timeout_us(i2c0,0x51,&read,1,false,20000);if(result!=PICO_ERROR_GENERIC)errors|=4;
#else
 result=i2c_write_timeout_us(i2c0,0x50,write,3,false,50000);if(result!=3)errors|=8;sleep_ms(6);
 result=i2c_write_blocking_until(i2c0,0x50,pointer,2,true,delayed_by_us(get_absolute_time(),50000));if(result!=2)errors|=16;
 result=i2c_read_blocking_until(i2c0,0x50,&read,1,false,delayed_by_us(get_absolute_time(),50000));if(result!=1||read!=0x5a)errors|=32;
#endif
 result=i2c_read_timeout_us(i2c0,0x50,&read,1,false,0);if(result!=PICO_ERROR_TIMEOUT)errors|=64;
 i2c_deinit(i2c0);if(i2c_read_timeout_us(i2c0,0x50,&read,1,false,1000)!=PICO_ERROR_GENERIC)errors|=128;
 done=103;puts(errors?"I2C103_FAIL":"I2C103_OK");while(1)tight_loop_contents();}
`;
const compiled=new Map();
async function make(id,kind){const family=PICO_BOARDS[id].mcu,key=family+':'+kind;let t=compiled.get(key);if(!t){const base=family==='RP2040'?'pico':'pico-2',sources={pwm:pwmSource,i2c:i2cSource,clock:'#define FAULT_CLOCK\n'+i2cSource,nack:'#define NO_DEVICE\n'+i2cSource};t={id:base,...await compilePico(wasm,sources[kind],base)};compiled.set(key,t);}const r=new PicoRuntime(packPicoImage(validatePicoImage(t.image,t.id),id),id);r.setDebugInfo(t.debugInfo);return r;}

function finish(r,marker){let out='';for(let i=0;i<2000&&!out.includes(marker);i++){out+=r.step(2000);if(out.includes('_FAIL'))break;}assert.ok(out.includes(marker),out+' '+JSON.stringify(r.debugger.snapshot(true).variables.filter(v=>['errors','wraps','done','result','elapsed','gated','wraps1'].includes(v.name))));}
const wire=(id,a,b)=>({id,from:a,to:b,color:'#14b8a6',points:[]});
function project(id,kind){const p=createPicoProject({board:id});if(kind==='pwm')p.wires.push(wire('gate103','mcu:GPIO10','mcu:GPIO13'));if(kind==='clock')p.wires.push(wire('clock103','mcu:GPIO5','mcu:GND'));if(kind==='i2c'){p.components.push({id:'memory103',type:'eeprom',x:470,y:100,rotation:0,params:{address:80}});for(const[n,port]of [['VCC','3V3'],['GND','GND'],['A0','GND'],['A1','GND'],['A2','GND'],['WP','GND'],['SDA','GPIO4'],['SCL','GPIO5']])p.wires.push(wire('eeprom103_'+n,'memory103:'+n,'mcu:'+port));}return p;}
for(const id of Object.keys(PICO_BOARDS)){
 test(id+' new PWM fractional divider, gated counter, wrap IRQ and real output edges',async()=>{const r=await make(id,'pwm');try{r.attachCircuit(project(id,'pwm'));const edges=[];r.rp.gpio[15].addListener(value=>edges.push({value,t:r.rp.clock.nanos}));finish(r,'PWM103_OK');const at=r.rp.clock.nanos;r.step(200000);const rising=edges.filter(e=>e.value===1&&e.t>at).map(e=>e.t);assert.ok(rising.length>3);const period=rising.at(-1)-rising.at(-2),expected=32.25*1000/r.hz*1e9;assert.ok(Math.abs(period-expected)<expected*.03,period+' vs '+expected);assert.ok(edges.some(e=>e.value===0));}finally{r.dispose();}});
 test(id+' new I2C timeout/until APIs write and repeated-start read a wired EEPROM',async()=>{const r=await make(id,'i2c');try{r.attachCircuit(project(id,'i2c'));finish(r,'I2C103_OK');}finally{r.dispose();}});
}
for(const id of ['pico','pico-2'])for(const kind of ['clock','nack'])test(id+' I2C '+kind+' returns bounded timeout or NACK and releases SDA',async()=>{const r=await make(id,kind);try{r.attachCircuit(project(id,kind));finish(r,'I2C103_OK');assert.equal(r.pinStates().GPIO4.outputEnabled,false);}finally{r.dispose();}});
for(const id of ['pico','pico-2'])test(id+' PWM register enable alias, masked force and independent RP2350 IRQ masks',async()=>{const r=await make(id,'pwm');try{const p=r.rp.pwm,b=id==='pico'?0xa0:0xf0;p.writeUint32(0,0);p.writeUint32(8,0);p.writeUint32(4,40);r.rp.stepThings(2000);assert.equal(p.readUint32(8),0,'divider writes must not start a disabled slice');p.writeUint32(b,129);assert.equal(p.readUint32(b),129);p.writeUint32(b+12,128);assert.equal(p.readUint32(b+16),0);p.writeUint32(b+8,128);assert.equal(p.readUint32(b+16),128);p.writeUint32(b+12,0);assert.equal(p.readUint32(b+16),0);if(id==='pico-2'){p.writeUint32(b+20,2);p.writeUint32(b+24,2);assert.equal(p.readUint32(b+28),2);assert.equal(p.readUint32(b+16),0);p.writeUint32(0xa0,255);assert.equal(p.readUint32(b),129);}}finally{r.dispose();}});

for(const id of ['pico','pico-2'])for(const starter of ['pwm103','i2c103'])test(id+' new '+starter+' project runs through the compiled firmware and circuit',async()=>{const p=createPicoProject({board:id,starter}),c=await compilePico(wasm,p.code,id),r=new PicoRuntime(c.image,id);try{r.attachCircuit(p);let out='',expected=starter==='pwm103'?'PWM103 IRQ OK':'I2C103 EEPROM 0x5A OK';for(let i=0;i<1200&&!out.includes(expected);i++)out+=r.step(2000);assert.ok(out.includes(expected),out);if(starter==='i2c103')assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);}finally{r.dispose();}});

test('Pico 2 PWM follows system-clock changes without divider writes',async()=>{const r=await make('pico-2','pwm');try{const p=r.rp.pwm;p.writeUint32(0,0);p.writeUint32(4,16);p.writeUint32(8,0);p.writeUint32(16,65535);p.writeUint32(0,1);r.rp.stepThings(100);let before=p.readUint32(8);r.rp.clkSys=75000000;assert.equal(p.channels[0].timer.frequency,75000000);r.rp.stepThings(100);let after=p.readUint32(8);assert.ok(after>before);p.writeUint32(0,0);r.rp.clkSys=150000000;assert.equal(p.channels[0].timer.enable,false);}finally{r.dispose();}});
