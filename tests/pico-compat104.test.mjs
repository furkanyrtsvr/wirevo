import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compilePico} from '../src/pico-compiler.js';
import {PicoRuntime} from '../dist/pico-runtime.js';
import {PICO_BOARDS} from '../dist/pico-boards.js';
import {packPicoImage,validatePicoImage} from '../dist/pico-image.js';
import {createPicoProject} from '../dist/pico-project.js';
const wasm=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
const code=`#include <pico/stdlib.h>
#include <hardware/gpio.h>
#include <stdio.h>
volatile unsigned errors,done;
#define CHECK(x,b) do {if(!(x))errors|=1u<<(b);}while(0)
int main(void){
 stdio_init_all();const uint32_t a=1u<<14,b=1u<<15,mask=a|b;
 gpio_init_mask(mask|(1u<<16));gpio_set_function_masked(mask,GPIO_FUNC_SIO);gpio_set_pulls(16,false,true);
 gpio_set_dir_out_masked(mask);CHECK(gpio_is_dir_out(14)&&gpio_get_dir(15)==GPIO_OUT,0);
 gpio_put_masked(mask,a);CHECK(gpio_get_out_level(14)&&!gpio_get_out_level(15)&&gpio_get(16),1);
 gpio_set_mask(b);gpio_clr_mask(a);CHECK(!gpio_get(16)&&gpio_get_out_level(15),2);
 gpio_xor_mask(mask);CHECK(gpio_get(16)&&!gpio_get_out_level(15),3);
 gpio_put_all(mask);CHECK((gpio_get_all()&mask)==mask,4);
 gpio_set_dir_masked(mask,b);CHECK(!gpio_is_dir_out(14)&&gpio_is_dir_out(15),5);
 gpio_set_dir_all_bits(mask);CHECK(gpio_get_dir(14)==GPIO_OUT,6);
 gpio_set_outover(14,GPIO_OVERRIDE_INVERT);CHECK(!gpio_get(16)&&gpio_get_out_level(14),7);
 gpio_set_outover(14,GPIO_OVERRIDE_HIGH);CHECK(gpio_get(16),8);
 gpio_set_outover(14,GPIO_OVERRIDE_LOW);CHECK(!gpio_get(16),9);
 gpio_set_outover(14,GPIO_OVERRIDE_NORMAL);
 gpio_set_oeover(14,GPIO_OVERRIDE_LOW);CHECK(!gpio_get(16)&&gpio_get_dir(14)==GPIO_OUT,10);
 gpio_set_oeover(14,GPIO_OVERRIDE_NORMAL);CHECK(gpio_get(16),11);
 gpio_set_input_enabled(16,false);CHECK(!gpio_get(16),12);gpio_set_input_enabled(16,true);
 gpio_set_inover(16,GPIO_OVERRIDE_INVERT);CHECK(!gpio_get(16),13);
 gpio_set_inover(16,GPIO_OVERRIDE_HIGH);CHECK(gpio_get(16),14);
 gpio_set_inover(16,GPIO_OVERRIDE_NORMAL);
 gpio_set_pulls(16,true,false);CHECK(gpio_is_pulled_up(16)&&!gpio_is_pulled_down(16),15);
 gpio_set_pulls(16,false,true);CHECK(!gpio_is_pulled_up(16)&&gpio_is_pulled_down(16),16);
 gpio_set_input_hysteresis_enabled(16,false);CHECK(!gpio_is_input_hysteresis_enabled(16),17);
 gpio_set_input_hysteresis_enabled(16,true);CHECK(gpio_is_input_hysteresis_enabled(16),18);
 gpio_set_slew_rate(14,GPIO_SLEW_RATE_FAST);CHECK(gpio_get_slew_rate(14)==GPIO_SLEW_RATE_FAST,19);
 gpio_set_drive_strength(14,GPIO_DRIVE_STRENGTH_12MA);CHECK(gpio_get_drive_strength(14)==GPIO_DRIVE_STRENGTH_12MA,20);
 gpio_set_dir_in_masked(a);gpio_set_oeover(14,GPIO_OVERRIDE_HIGH);CHECK(gpio_get(16)&&!gpio_is_dir_out(14),21);
 gpio_init(14);CHECK(gpio_get_function(14)==GPIO_FUNC_SIO&&!gpio_get_out_level(14)&&!gpio_get(16),22);
 gpio_set_dir(14,true);gpio_put(14,true);gpio_deinit(14);CHECK(gpio_get_function(14)==GPIO_FUNC_NULL&&!gpio_get(16),23);
 gpio_init(14);gpio_set_dir(14,true);gpio_put(14,true);
 unsigned pads=PICO_RP2350?0x40038000u:0x4001c000u;volatile unsigned*pad=(volatile unsigned*)(pads+4+14*4);
 *pad|=128;CHECK(!gpio_get(16)&&gpio_get_out_level(14),24);*pad&=~128u;CHECK(gpio_get(16),25);
 #if PICO_RP2350
 *pad|=256;CHECK(!gpio_get(16),26);*pad&=~256u;CHECK(gpio_get(16),27);
 #endif
 gpio_put(15,errors==0);done=104;puts(errors?"GPIO104_FAIL":"GPIO104_OK");while(1)tight_loop_contents();
}`;
const compiled=new Map();
async function firmware(id,arch){const base=PICO_BOARDS[id].mcu==='RP2040'?'pico':'pico-2',key=base+arch;let f=compiled.get(key);if(!f){f=await compilePico(wasm,code,base,[],'c',arch);compiled.set(key,f);}return {...f,image:packPicoImage(validatePicoImage(f.image,base),id,arch)};}
function finish(r,marker){let out='';for(let i=0;i<1500&&!out.includes(marker)&&!out.includes('_FAIL');i++)out+=r.step(2000);assert.ok(out.includes(marker),out+' '+JSON.stringify(r.debugger?.snapshot(true).variables.filter(v=>['errors','done'].includes(v.name))));}
for(const[id,b]of Object.entries(PICO_BOARDS))for(const arch of b.mcu==='RP2350'?['arm','riscv']:['arm'])test(id+' '+arch+' new GPIO SDK mask, override, pad and electrical feedback',async()=>{
 const f=await firmware(id,arch),r=new PicoRuntime(f.image,id);try{r.setDebugInfo(f.debugInfo);r.attachCircuit(createPicoProject({board:id,starter:'gpio104'}));finish(r,'GPIO104_OK');assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);assert.equal(r.pinStates().GPIO14.outputEnabled,true);}finally{r.dispose();}
});
for(const id of ['pico','pico-2'])test(id+' output-disable and RP2350 isolation release physical driver without erasing latch',async()=>{
 const f=await firmware(id,'arm'),r=new PicoRuntime(f.image,id);try{r.attachCircuit(createPicoProject({board:id,starter:'gpio104'}));finish(r,'GPIO104_OK');const pads=id==='pico'?0x4001c000:0x40038000,addr=pads+4+15*4,original=r.rp.readUint32(addr);for(const bit of id==='pico'?[128]:[128,256]){r.rp.writeUint32(addr,original|bit);r.circuit.refresh(true);assert.equal(r.pinStates().GPIO15.outputEnabled,false);assert.ok(r.circuit.solution.ledResults.get('led1').current<.00001);r.rp.writeUint32(addr,original);r.circuit.refresh(true);assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);}}finally{r.dispose();}
});
for(const id of ['pico','pico-2'])test(id+' selectable GPIO104 example compiles, reads real wire and toggles LED',async()=>{
 const p=createPicoProject({board:id,starter:'gpio104'}),f=await compilePico(wasm,p.code,id),r=new PicoRuntime(f.image,id);try{r.attachCircuit(p);finish(r,'GPIO104 feedback OK');const edges=[];r.rp.gpio[15].addListener(v=>edges.push(v));for(let i=0;i<1800&&!(edges.includes(0)&&edges.includes(1));i++)r.step(20000);assert.ok(edges.includes(0)&&edges.includes(1));}finally{r.dispose();}
});
