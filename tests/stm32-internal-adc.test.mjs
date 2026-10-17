import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';import {blankPinConfig,normalizePinConfig} from '../dist/stm32-pin-config.js';import {createSTMProject} from '../dist/stm32-project.js';import {validateProject} from '../dist/core.js';import {compileSTM} from '../src/stm32-compiler.js';import {STMRuntime} from '../dist/stm32-runtime.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
function code(f4,wait=true,sampling=7){const b=f4?0x40012000:0x40012400;return `#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))
unsigned sample(unsigned ch){R(${b+52})=ch;R(${b+8})|=1u<<${f4?30:22};while(!(R(${b})&2)){}return R(${b+76});}
int main(void){cf_uart_begin(115200);cf_adc_config(PB0);R(${b+12})=${sampling}u<<18|${sampling}u<<21|${sampling}u<<24;${f4?'R(0x40012304)=(1u<<16)|(1u<<23);':`R(${b+8})|=1u<<23;`}${wait?'cf_delay_ms(1);':''}for(;;){unsigned t=sample(16),v=sample(17);printf("TEMP=%u VREF=%u ",t,v);${f4?'R(0x40012304)=(1u<<16)|(1u<<22);printf("BAT=%u ",sample(18));R(0x40012304)=(1u<<16)|(1u<<23);cf_delay_ms(1);':''}puts("DONE");cf_delay_ms(1);}}`;}
function until(r,pattern){let s='';for(let n=0;n<300;n++){s+=r.step(10000);if(pattern.test(s))return s;}throw Error('Missing '+pattern+': '+s);}
const quantize=v=>Math.round(v/3.3*4095);
for(const [board,b]of Object.entries(STM32_BOARDS))test(board+' native internal ADC responds to project temperature/VBAT and preserves JSON settings',async()=>{
 const f4=b.cpu==='cortex-m4f',p=createSTMProject({board,starter:'empty'});p.settings.stm32Pins={...blankPinConfig(),internalTemperature:25,internalVBAT:3};
 const compiled=await compileSTM(compiler,code(f4),board),r=await new STMRuntime(compiled.image,{chip:board}).load();try{r.attachCircuit(validateProject(p));
 let s=until(r,/DONE/);assert.match(s,new RegExp('TEMP='+quantize(f4?.76:1.43)+' VREF='+quantize(f4?1.21:1.2)));if(f4)assert.match(s,new RegExp('BAT='+quantize(.75)));
 p.settings.stm32Pins.internalTemperature=65;p.settings.stm32Pins.internalVBAT=2.4;r.circuit.update(validateProject(JSON.parse(JSON.stringify(p))));
 const t=quantize(f4?.86:1.258);s=until(r,new RegExp('TEMP='+t));assert.match(s,new RegExp('TEMP='+t));if(f4){s+=until(r,/DONE/);assert.match(s,new RegExp('BAT='+quantize(.6)));}
 }finally{r.dispose();}
});
for(const board of ['stm32f103c6','weact-f411ce'])for(const [label,wait,sampling,message]of [['startup',false,7,/10 us/],['sampling',true,0,/örnekleme/]])test(board+' internal ADC rejects insufficient '+label,async()=>{
 const p=createSTMProject({board,starter:'empty'}),f4=STM32_BOARDS[board].cpu==='cortex-m4f',c=await compileSTM(compiler,code(f4,wait,sampling),board),r=await new STMRuntime(c.image,{chip:board}).load();try{r.attachCircuit(p);assert.throws(()=>until(r,/DONE/),message);}finally{r.dispose();}
});
test('internal analog settings validate strict finite bounds and stay local to each project',()=>{
 const raw=blankPinConfig();raw.internalTemperature=65;raw.internalVBAT=2.4;assert.equal(normalizePinConfig(raw,'weact-f411ce').internalTemperature,65);assert.equal(blankPinConfig().internalTemperature,25);
 for(const [key,value]of [['internalTemperature',NaN],['internalTemperature',126],['internalVBAT',-1],['internalVBAT',Infinity]])assert.throws(()=>normalizePinConfig({...raw,[key]:value},'weact-f411ce'));
});

test('F401/F411 internal mux uses VBAT channel18, VREF17 and guards channel16 alias while VBATE is set',async()=>{
 const {STMADC}=await import('../dist/stm32-adc.js');const a=new STMADC({board:{cpu:'cortex-m4f'}});a.regs.set(0x40012304,1<<23);assert.equal(a.pin(16),'TEMP');assert.equal(a.pin(18),'TEMP');assert.equal(a.pin(17),'VREFINT');a.regs.set(0x40012304,(1<<23)|(1<<22));assert.equal(a.pin(18),'VBAT');assert.equal(a.pin(17),'VREFINT');assert.throws(()=>a.pin(16),/kanal18/);
});
