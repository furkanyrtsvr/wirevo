import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {createSTMProject} from '../dist/stm32-project.js';
import {compileSTM} from '../src/stm32-compiler.js';
import {STMRuntime} from '../dist/stm32-runtime.js';

const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
function until(r,pattern){let out='';for(let i=0;i<300;i++){out+=r.step(20000);if(pattern.test(out))return out;}throw Error('Flash firmware output missing '+pattern+': '+out);}
function source(board,b){
 const f4=b.cpu==='cortex-m4f',size=b.flashSize,target=0x08000000+(f4?(size===262144?131072:393216):size-1024),sector=size===262144?5:7;
 return `#include <cf_hal.h>\n#include <stdio.h>\n#include <stdint.h>\n#define R32(a) (*(volatile uint32_t*)(a))\n#define R16(a) (*(volatile uint16_t*)(a))\n+int main(void){cf_uart_begin(115200);const uintptr_t target=0x${target.toString(16)}u;const uintptr_t flash=0x${(f4?0x40023c00:0x40022000).toString(16)}u;const uintptr_t uid=0x${(f4?0x1fff7a10:0x1ffff7e8).toString(16)}u;const uintptr_t fs=0x${(f4?0x1fff7a22:0x1ffff7e0).toString(16)}u;uint32_t before=${f4?'R32(target)':'R16(target)'};if(before==0xffffffffu${f4?'':' || before==0xffffu'}){${f4?'R32(target)=0x11223344u;':'R16(target)=0x1234u;'}uint32_t locked=R32(flash+12);R32(flash+12)=locked;R32(flash+4)=0x45670123u;R32(flash+4)=0xcdef89abu;${f4?`R32(flash+16)=2u|(2u<<8)|(${sector}u<<3);R32(flash+16)|=1u<<16;R32(flash+16)=1u|(2u<<8);R32(target)=0x11223344u;`:`R32(flash+16)=2u;R32(flash+20)=target;R32(flash+16)=2u|64u;R32(flash+16)=1u;R16(target)=0x1234u;`}uint32_t sr=R32(flash+12);printf("FIRST SIZE=%u UID=%08lx%08lx%08lx LOCKERR=%u DATA=%08lx EOP=%u DONE",R16(fs),(unsigned long)R32(uid),(unsigned long)R32(uid+4),(unsigned long)R32(uid+8),locked!=0,(unsigned long)${f4?'R32(target)':'R16(target)'},(sr&${f4?'1':'32'})!=0);}else printf("PERSIST SIZE=%u DATA=%08lx DONE",R16(fs),(unsigned long)before);for(;;){}}`;
}

for(const [board,b] of Object.entries(STM32_BOARDS))test(board+' physical Flash lock/erase/program, UID, density and reset persistence',async()=>{
 const execute=b.cpu==='cortex-m4f'?'R32(target+4)=0x4770202au;':'R16(target+4)=0x202au;R16(target+6)=0x4770u;';
 const firmware=source(board,b).replace('+int main','int main').replaceAll('uintptr_t','uint32_t').replaceAll('%08lx','%u').replaceAll('(unsigned long)','').replace('uint32_t sr=',execute+'unsigned executed=((unsigned(*)(void))(target+5))();printf("EXEC=%u ",executed);uint32_t sr=');
 const c=await compileSTM(compiler,firmware,board),r=await new STMRuntime(c.image,{chip:board}).load();
 try{r.attachCircuit(createSTMProject({board,starter:'empty'}));const expected=b.cpu==='cortex-m4f'?'287454020':'4660',first=until(r,/DONE/);assert.match(first,/EXEC=42/);assert.match(first,new RegExp('FIRST SIZE='+b.flashSize/1024));assert.match(first,/LOCKERR=1/);assert.match(first,new RegExp('DATA='+expected));assert.match(first,/EOP=1/);r.reset();const second=until(r,/DONE/);assert.match(second,new RegExp('PERSIST SIZE='+b.flashSize/1024));assert.match(second,new RegExp('DATA='+expected));const uid=b.cpu==='cortex-m4f'?0x1fff7a10:0x1ffff7e8;assert.ok(r.readMemory(uid,12).some(v=>v));}finally{r.dispose();}
});
