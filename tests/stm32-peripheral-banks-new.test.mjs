import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {STMRuntime} from '../dist/stm32-runtime.js';
import {compileSTM} from '../src/stm32-compiler.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
function until(r,re){let out='';for(let i=0;i<200;i++){out+=r.step(10000);if(re.test(out))return out;}throw Error('Missing '+re+': '+out);}
for(const [id,b]of Object.entries(STM32_BOARDS))test(id+' NEW every present additional timer delivers a genuine ARM vector; GPIO lock and bit-band',async()=>{
 const f4=b.cpu==='cortex-m4f',timers=f4?[[1,0x40010000,0,25],[3,0x40000400,1,29],[4,0x40000800,2,30],[5,0x40000c00,3,50],[9,0x40014000,16,24],[10,0x40014400,17,25],[11,0x40014800,18,26]]:[[1,0x40012c00,11,25],[3,0x40000400,1,29],...(id==='stm32f103c6'?[]:[[4,0x40000800,2,30]])],name=irq=>({24:'TIM1_BRK_TIM9',25:f4?'TIM1_UP_TIM10':'TIM1_UP',26:'TIM1_TRG_COM_TIM11',29:'TIM3',30:'TIM4',50:'TIM5'}[irq]);
 const handlers=[...new Set(timers.map(t=>t[3]))].map(irq=>`void ${name(irq)}_IRQHandler(){${timers.filter(t=>t[3]===irq).map(([,base])=>`if(R(${base+16}u)&1){R(${base+16}u)=0;R(${base+12}u)=0;hits++;}`).join('')}}`).join('\n');
 const setup=timers.map(([n,base,bit,irq])=>`R(${f4?([1,9,10,11].includes(n)?0x40023844:0x40023840):(n===1?0x40021018:0x4002101c)}u)|=1u<<${bit};R(${base+40}u)=71;R(${base+44}u)=9;R(${base+20}u)=1;R(${base+16}u)=0;R(${base+12}u)=1;R(${0xe000e100+4*Math.floor(irq/32)}u)|=1u<<${irq%32};R(${base}u)=1;`).join('');
 const gpio=f4?0x40020000:0x40010800,lock=gpio+(f4?28:24),cfg=f4?`R(${gpio}u)=1u<<8;`:`R(${gpio}u)=(R(${gpio}u)&~(15u<<16))|(3u<<16);`,change=f4?`R(${gpio}u)=0;`:`R(${gpio}u)&=~(15u<<16);`,alias=0x42000000+( (f4?0x40023830:0x40021018)-0x40000000)*32+(f4?0:2)*4;
 const src=`#include <cf_hal.h>\n#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))\nvolatile unsigned hits,word;${handlers}\nint main(){cf_uart_begin(115200);${setup}while(hits<${timers.length});R(${alias}u)=1;${cfg}R(${lock}u)=65552;R(${lock}u)=16;R(${lock}u)=65552;unsigned latched=R(${lock}u);latched=R(${lock}u);${change}unsigned config=R(${gpio}u);unsigned bit=0x22000000+((unsigned)&word-0x20000000)*32+12;R(bit)=1;printf("TIMERS=%u LOCK=%u CFG=%u BIT=%u DONE",hits,!!(latched&65536),config,word);for(;;);}`;
 const c=await compileSTM(compiler,src,id),r=await new STMRuntime(c.image,{chip:id}).load();try{const out=until(r,/DONE/);assert.match(out,new RegExp('TIMERS='+timers.length+' LOCK=1'));assert.match(out,/BIT=8 DONE/);const config=r.readRegister(gpio);assert.equal(f4?(config>>>8)&3:(config>>>16)&15,f4?1:3);}finally{r.dispose();}
});
