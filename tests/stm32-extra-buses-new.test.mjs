import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';import {createSTMProject} from '../dist/stm32-project.js';
import {blankPinConfig,generatePinSources} from '../dist/stm32-pin-config.js';
import {compileSTM} from '../src/stm32-compiler.js';import {STMRuntime} from '../dist/stm32-runtime.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
const prefix='#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))\n';
function until(r,re){let out='';for(let i=0;i<80;i++){out+=r.step(20000);if(re.test(out))return out;}throw Error('Missing '+re+': '+out);}
function endpoint(b,pin){return 'mcu:'+b.pins.find(p=>p.net===pin&&p.connectable!==false).id;}
for(const [id,b]of Object.entries(STM32_BOARDS)){
 if(id==='stm32f103c6')continue;
 for(const number of b.cpu==='cortex-m4f'?[2,3,...(b.family==='f411'&&id.startsWith('nucleo')?[4,5]:[])]:[2])test(id+' NEW generated SPI'+number+' sends real loopback and native receive IRQ',async()=>{
  const pins=number===4?['PB13','PA11','PA1']:number===5?['PB0','PA12','PA10']:number===2?['PB13','PB14','PB15']:id.startsWith('nucleo')?['PC10','PC11','PC12']:['PB3','PB4','PB5'],cfg=blankPinConfig();for(const[k,p]of pins.entries())cfg.pins[p]={function:'hw_SPI'+number+'_'+['SCK','MISO','MOSI'][k]};const g=generatePinSources(cfg,id),base={2:0x40003800,3:0x40003c00,4:0x40013400,5:0x40015000}[number],irq={2:36,3:51,4:84,5:85}[number];
  const src=prefix+`volatile unsigned received,hit;void SPI${number}_IRQHandler(){received=R(${base+12}u);R(${base+4}u)=0;hit++;}int main(){cf_uart_begin(115200);R(${base+4}u)=64;R(${0xe000e100+4*Math.floor(irq/32)}u)|=1u<<${irq%32};R(${base+12}u)=165;while(!hit)__asm volatile("wfi");printf("SPI${number}=%u IRQ=%u DONE",received,hit);for(;;);}`;
  const p=createSTMProject({board:id,starter:'empty'});p.wires=[{id:'loop',from:endpoint(b,pins[2]),to:endpoint(b,pins[1]),color:'#14b8a6',points:[]}];const c=await compileSTM(compiler,src,id,g.files),r=await new STMRuntime(c.image,{chip:id}).load();try{r.attachCircuit(p);assert.match(until(r,/DONE/),new RegExp('SPI'+number+'=165 IRQ=1 DONE'));}finally{r.dispose();}
 });
 const number=b.cpu==='cortex-m4f'?6:3,pins=number===3?['PB10','PB11']:['PC6','PC7'];
 if(pins.every(p=>b.gpio.includes(p)))test(id+' NEW generated USART'+number+' physical loopback and independent native IRQ',async()=>{
  const cfg=blankPinConfig();cfg.pins[pins[0]]={function:'hw_USART'+number+'_TX'};cfg.pins[pins[1]]={function:'hw_USART'+number+'_RX'};const g=generatePinSources(cfg,id),base=number===3?0x40004800:0x40011400,irq=number===3?39:71;
  const src=prefix+`volatile unsigned hit,value;void USART${number}_IRQHandler(){if(R(${base}u)&32){value=R(${base+4}u);hit++;}}int main(){cf_uart_begin(115200);R(${base+12}u)|=32;R(${0xe000e100+Math.floor(irq/32)*4}u)|=1u<<${irq%32};R(${base+4}u)=90;while(!hit)__asm volatile("wfi");printf("UART${number}=%u IRQ=%u DONE",value,hit);for(;;);}`;
  const p=createSTMProject({board:id,starter:'empty'});p.wires=[{id:'loop',from:endpoint(b,pins[0]),to:endpoint(b,pins[1]),color:'#14b8a6',points:[]}];const c=await compileSTM(compiler,src,id,g.files),r=await new STMRuntime(c.image,{chip:id}).load();try{r.attachCircuit(p);assert.match(until(r,/DONE/),new RegExp('UART'+number+'=90 IRQ=1 DONE'));}finally{r.dispose();}
 });
 for(const n of [...(b.cpu!=='cortex-m4f'||!id.startsWith('nucleo')||b.family==='f411'?[2]:[]),...(b.cpu==='cortex-m4f'?[3]:[])])test(id+' NEW generated I2C'+n+' reads SHT31 over its own physical nets',async()=>{
  const scl=n===2?'PB10':'PA8',sda=n===2?(b.cpu!=='cortex-m4f'?'PB11':id.startsWith('nucleo')?'PB9':'PB3'):id.startsWith('nucleo')?'PC9':'PB4',cfg=blankPinConfig();cfg.pins[sda]={function:'hw_I2C'+n+'_SDA'};cfg.pins[scl]={function:'hw_I2C'+n+'_SCL'};const g=generatePinSources(cfg,id),base=n===2?0x40005800:0x40005c00;
  const src=prefix+`#define B ${base}u\nstatic void wait(unsigned mask){unsigned timeout=0;while(!(R(B+20)&mask)){if(++timeout>10000){printf("WAIT FAIL mask=%u SR=%u DONE",mask,R(B+20));for(;;);}}}static void start(unsigned address){R(B)|=256;wait(1);R(B+16)=address;wait(2);unsigned v=R(B+20);v=R(B+24);(void)v;}int main(){cf_uart_begin(115200);R(B)|=1024;start(136);wait(128);R(B+16)=36;wait(128);R(B+16)=0;wait(4);R(B)|=512;while(R(B)&512);cf_delay_ms(20);start(137);unsigned char data[6];for(unsigned i=0;i<3;i++){wait(64);data[i]=R(B+16);}wait(4);R(B)&=~1024u;data[3]=R(B+16);wait(4);R(B)|=512;data[4]=R(B+16);data[5]=R(B+16);while(R(B)&512);printf("I2C${n}=%u,%u DONE",data[0],data[1]);for(;;);}`;
  const p=createSTMProject({board:id,starter:'sht31'}),from=endpoint(b,'PB7'),clock=endpoint(b,'PB6');for(const w of p.wires)for(const key of ['from','to'])w[key]=w[key]===from?endpoint(b,sda):w[key]===clock?endpoint(b,scl):w[key];const c=await compileSTM(compiler,src,id,g.files),r=await new STMRuntime(c.image,{chip:id}).load();try{r.attachCircuit(p);assert.match(until(r,/DONE/),new RegExp('I2C'+n+'=102,102 DONE'));}finally{r.dispose();}
 });
}
