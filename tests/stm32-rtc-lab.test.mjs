import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {compileSTM} from '../src/stm32-compiler.js';import {STMRuntime} from '../dist/stm32-runtime.js';
test('Exported combined RTC/DMA/EXTI lab counts leap day through genuine prescaler and preserves backup on watchdog',async()=>{
 const p=JSON.parse(await readFile('docs/examples/stm32-rtc-acceptance-054.json','utf8')),compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));await STMRuntime.initialize(await readFile('dist/stm32/cortex-m4f.wasm'),'cortex-m4f');
 const c=await compileSTM(compiler,p.code,'nucleo-f401re',p.files),r=await new STMRuntime(c.image,{chip:'nucleo-f401re'}).load();r.attachCircuit(p);let text='';const until=re=>{for(let i=0;i<400;i++){text+=r.step(5000);if(re.test(text))return;}assert.match(text,re);};
 try{until(/A=ADC/);assert.match(text,/BACKUP BOOTS=1/);r.queueSerial('T');until(/RTC 2024-2-28 23:59:58 BACKUP=1/);r.queueSerial('F');until(/RTC TEST: 1024/);const target=r.count+84000000*.006;while(r.count<target)text+=r.step(5000);r.queueSerial('T');until(/RTC 2024-2-29 0:0:\d+ BACKUP=1/);r.queueSerial('R');until(/BOOT: IWDG RESET/);assert.match(text,/BACKUP BOOTS=2/);assert.equal(r.rtc.regs.get(16),31);r.queueSerial('T');until(/RTC 2024-2-29 0:0:\d+ BACKUP=2/);r.queueSerial('A');until(/ADC DMA: 1024 \/ 3071/);
 }finally{r.dispose();}
});
