import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {STM32_BOARDS} from '../dist/stm32-boards.js';import {createSTMProject,availableSTMExamples} from '../dist/stm32-project.js';import {compileSTM} from '../src/stm32-compiler.js';import {STMRuntime} from '../dist/stm32-runtime.js';import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
const compiler=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));for(const cpu of ['cortex-m3','cortex-m4f'])await STMRuntime.initialize(await readFile('dist/stm32/'+cpu+'.wasm'),cpu);
for(const board of Object.keys(STM32_BOARDS))for(const language of ['c','cpp'])test(board+' '+language+' production internal ADC example compiles, runs and exports without external wiring',async()=>{
 const p=createSTMProject({board,language,starter:'internal-adc'});assert.ok(availableSTMExamples(board,language).some(e=>e.id==='internal-adc'));assert.ok(!availableSTMExamples(board,'micropython').some(e=>e.id==='internal-adc'));
 assert.equal(p.wires.length,0);const c=await compileSTM(compiler,p.code,board,p.files||[],language),r=await new STMRuntime(c.image,{chip:board}).load();try{r.attachCircuit(p);let s='';for(let i=0;i<100&&!s.includes(' OK');i++)s+=r.step(10000);assert.match(s,/INTERNAL TEMP_RAW=\d+ VREF_RAW=\d+/);assert.match(s,/ OK/);if(STM32_BOARDS[board].cpu==='cortex-m4f')assert.match(s,/VBAT_RAW=\d+/);
 const {project:imported}=await importProjectBytes(await exportProjectZip(p));assert.equal(imported.language,language);assert.equal(imported.settings.stm32Pins.internalTemperature,25);assert.equal(imported.settings.stm32Pins.internalVBAT,3);
 }finally{r.dispose();}
});
