import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';import {createSTMProject} from '../dist/stm32-project.js';
import {compileSTM} from '../src/stm32-compiler.js';import {STMRuntime} from '../dist/stm32-runtime.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
function project(board){const b=STM32_BOARDS[board],p=createSTMProject({board,starter:'environment'});p.wires.push({id:'nativeadc',from:'pot1:OUT',to:'mcu:'+b.pins.find(v=>v.net==='PB0'&&v.connectable!==false).id,color:'#3b82f6',points:[]});return p;}
for(const board of Object.keys(STM32_BOARDS))test(board+' native ADC1 samples live 0/50/100 percent potentiometer',async()=>{
 const p=project(board);p.code='#include <cf_hal.h>\n#include <stdio.h>\nint main(void){cf_uart_begin(115200);for(;;){printf("ADC=%d ",cf_adc_read(PB0));cf_delay_ms(1);}}';
 const c=await compileSTM(compiler,p.code,board,p.files),r=await new STMRuntime(c.image,{chip:board}).load();try{r.attachCircuit(p);for(const[value,expected]of [[50,2048],[0,0],[100,4095]]){p.components.find(v=>v.id==='pot1').params.value=value;r.circuit.update(p);let text='';for(let i=0;i<100&&!text.includes('ADC='+expected+' ');i++)text+=r.step(10000);assert.ok(text.includes('ADC='+expected+' '),text);}
  const base=r.adc.base;assert.ok(!(r.readRegister(base)&2));
 }finally{r.dispose();}
});
for(const board of Object.keys(STM32_BOARDS))test(board+' genuine ADC IRQ18 and DR read clear EOC',async()=>{
 const p=project(board),f4=STM32_BOARDS[board].cpu==='cortex-m4f',base=f4?0x40012000:0x40012400;
 p.code=`#include <cf_hal.h>
 #include <stdio.h>
 volatile unsigned ready,value;
 void ADC1_IRQHandler(void){value=*(volatile unsigned*)${base+76};ready=1;}
 int main(void){cf_uart_begin(115200);cf_adc_config(PB0);*(volatile unsigned*)${base+52}=8;*(volatile unsigned*)${base+16}=5u<<24;*(volatile unsigned*)${base+4}=32;*(volatile unsigned*)0xe000e100=1u<<18;*(volatile unsigned*)${base+8}|=1u<<${f4?30:22};while(!ready){__asm volatile("wfi");}printf("ADC IRQ=%u",value);for(;;){}}`;
 const c=await compileSTM(compiler,p.code,board,p.files),r=await new STMRuntime(c.image,{chip:board}).load();try{r.attachCircuit(p);let text='';for(let i=0;i<100&&!text.includes('ADC IRQ=2048');i++)text+=r.step(10000);assert.match(text,/ADC IRQ=2048/);assert.equal(r.readRegister(base)&2,0);}finally{r.dispose();}
});

for(const board of Object.keys(STM32_BOARDS))test(board+' real RCC peripheral resets clear USART1, ADC1 and TIM2 registers',async()=>{const p=project(board),f4=STM32_BOARDS[board].cpu==='cortex-m4f',adc=f4?0x40012000:0x40012400,uart=f4?0x40011000:0x40013800,rst1=f4?0x40023820:0x40021010,rst2=f4?0x40023824:0x4002100c; p.code=`#include <cf_hal.h>
#include <stdio.h>
int main(void){cf_usart1_begin(9600,PA9,PA10);cf_adc_config(PB0);cf_pwm_begin(PA0,1000,25);*(volatile unsigned*)${rst1}=1;*(volatile unsigned*)${rst1}=0;*(volatile unsigned*)${rst2}=(1u<<${f4?4:14})|(1u<<${f4?8:9});*(volatile unsigned*)${rst2}=0;unsigned u=*(volatile unsigned*)${uart+12},a=*(volatile unsigned*)${adc+8},t=*(volatile unsigned*)0x40000000;cf_uart_begin(115200);printf("RESET UART=%u ADC=%u TIM=%u",u,a,t);for(;;){}}`;const c=await compileSTM(compiler,p.code,board,p.files),r=await new STMRuntime(c.image,{chip:board}).load();try{r.attachCircuit(p);let out='';for(let i=0;i<200&&!out.includes('RESET UART=0 ADC=0 TIM=0');i++)out+=r.step(10000);assert.match(out,/RESET UART=0 ADC=0 TIM=0/);}finally{r.dispose();}});
