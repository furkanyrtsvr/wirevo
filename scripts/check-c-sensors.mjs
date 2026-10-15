import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {compileESP,ESP_CLANG_SHA256} from '../src/esp-compiler.js';
import {ESPRuntime} from '../dist/esp-runtime.js';
import {createUnifiedProject} from '../dist/unified-project.js';
const wasm=gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz'));assert.equal(createHash('sha256').update(wasm).digest('hex'),ESP_CLANG_SHA256);
const module=await WebAssembly.compile(wasm);await ESPRuntime.initialize(await readFile('dist/esp32/pkg/esp_emu_bg.wasm'));
const fixtures={};
for(const board of (process.argv.slice(2).length?process.argv.slice(2):['esp32c3','esp32c6','esp32s3','esp32h2','esp32c5','esp32p4','xiao-esp32c6','nano-esp32']))for(const starter of ['sht31','adc']){
 const p=createUnifiedProject({board,language:'c',starter}),b=await compileESP(module,p.code,board,p.files,'c'),r=new ESPRuntime(b.image,{chip:board});
 let output='',instructions=0;r.attachCircuit(p);
 try{while(instructions<14000000&&!output.includes(starter==='adc'?'ADC=512':'TEMP x100=2500')){output+=r.step(10000);instructions+=10000;}
  assert.ok(output.includes(starter==='adc'?'ADC=512 mV=1650':'TEMP x100=2500 HUM x100=5000'),board+' '+starter+' '+output);
  fixtures[board+':'+starter]={source:p.code,files:p.files,bin:Buffer.from(b.image).toString('base64'),instructions,output,staticRamBytes:b.staticRamBytes};
  console.log(board,starter,instructions,output.trim(),'OK');
 }finally{r.dispose();}
 await writeFile('tests/fixtures/c-sensors.json',JSON.stringify(fixtures));
}
