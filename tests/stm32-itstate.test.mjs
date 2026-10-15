import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {compileSTM} from '../src/stm32-compiler.js';
import {STMRuntime} from '../dist/stm32-runtime.js';
import {createSTMProject} from '../dist/stm32-project.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
for(const board of ['stm32f103c6','weact-f411ce'])test(board+' real STMIA T1 stores R7 and advances full register list',async()=>{
 const c=await compileSTM(compiler,'#include <cf_hal.h>\n#include <stdio.h>\nint main(void){cf_uart_begin(115200);unsigned words[4]={0,0,0,99};unsigned *p=words;__asm volatile("movs r2, #1\\nmovs r3, #16\\nmovs r7, #4\\nstmia %0!, {r2,r3,r7}" : "+r"(p) :: "r2","r3","r7","memory");printf("WORDS=%u/%u/%u CANARY=%u DELTA=%u DONE",words[0],words[1],words[2],words[3],(unsigned)(p-words));for(;;){}}',board),r=await new STMRuntime(c.image,{chip:board}).load();try{r.attachCircuit(createSTMProject({board,starter:'empty'}));let out='';for(let i=0;i<100&&!out.includes('DONE');i++)out+=r.step(10000);assert.match(out,/WORDS=1\/16\/4 CANARY=99 DELTA=3 DONE/);}finally{r.dispose();}
});
for(const board of ['stm32f103c6','weact-f411ce'])test(board+' real Thumb IT interrupted by SysTick and SVC resumes next slot',async()=>{
 const code=`#include <stdio.h>
#include <cf_hal.h>
static unsigned table[128] __attribute__((aligned(512)));
volatile unsigned hits;
__attribute__((naked)) void handler(void){__asm volatile("ldr r2, =hits\\nldr r3, [r2]\\nadds r3, #1\\nstr r3, [r2]\\ncmp r3, r3\\nit eq\\nbxeq lr");}
int main(void){
 cf_uart_begin(115200);
 puts("IT TEST START");
 const unsigned *v=(const unsigned *)0x08000000;
 for(unsigned i=0;i<76;i++)table[i]=v[i];
 table[11]=(unsigned)handler; table[15]=(unsigned)handler;
 *(volatile unsigned*)0xe000ed08=(unsigned)table;
 unsigned a,b;
 __asm volatile("movs r0, #0\\ncmp r0, #0\\nittt eq\\nstreq %[pending], [%[icsr]]\\nmoveq r0, #7\\nmoveq r1, #9\\nmov %[a], r0\\nmov %[b], r1" : [a] "=r"(a),[b] "=r"(b) : [pending] "r"(1u<<26),[icsr] "r"(0xe000ed04u) : "r0","r1","cc","memory");
 printf("IRQ=%u A=%u B=%u\\n",hits,a,b);
 __asm volatile("movs r0, #0\\ncmp r0, #0\\nittt eq\\nsvceq #0\\nmoveq r0, #11\\nmoveq r1, #13\\nmov %[a], r0\\nmov %[b], r1" : [a] "=r"(a),[b] "=r"(b) :: "r0","r1","cc","memory");
 printf("SVC=%u A=%u B=%u\\n",hits,a,b);
 for(;;){}
}`;
 const c=await compileSTM(compiler,code,board),r=await new STMRuntime(c.image,{chip:board}).load();
 try{r.attachCircuit(createSTMProject({board,starter:'empty'}));let text='';for(let i=0;i<100&&!text.includes('SVC=2 A=11 B=13');i++)text+=r.step(10000);assert.match(text,/IRQ=1 A=7 B=9/);assert.match(text,/SVC=2 A=11 B=13/);}finally{r.dispose();}
});
