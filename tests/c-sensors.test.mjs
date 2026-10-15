import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ESP_BOARDS} from '../dist/esp-boards.js';
import {createUnifiedProject,unifiedExamples} from '../dist/unified-project.js';
import {validateProject} from '../dist/core.js';
import {sourceKey,firmwareMatches} from '../dist/source-files.js';
import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
import {ESPRuntime} from '../dist/esp-runtime.js';
const fixtures=JSON.parse(await readFile(new URL('./fixtures/c-sensors.json',import.meta.url)));
await ESPRuntime.initialize(await readFile(new URL('../dist/esp32/pkg/esp_emu_bg.wasm',import.meta.url)));
const step=(r,n)=>{let output='';for(let i=0;i<n;i+=10000)output+=r.step(Math.min(10000,n-i));return output;};
for(const [key,f]of Object.entries(fixtures))test(`${key}: actual C17 bus driver, physical sensor and editable source ZIP`,async()=>{
 const [board,starter]=key.split(':'),p=validateProject(createUnifiedProject({board,language:'c',starter}));
 assert.equal(p.code,f.source);assert.deepEqual(p.files,f.files);const r=new ESPRuntime(Buffer.from(f.bin,'base64'),{chip:board});
 try{r.attachCircuit(p);assert.match(step(r,f.instructions),starter==='adc'?/ADC=512 mV=1650/:/TEMP x100=2500 HUM x100=5000/);
  if(['esp32c3','xiao-esp32c6'].includes(board)){
   p.components.find(c=>c.type===(starter==='adc'?'pot':'sht31')).params[starter==='adc'?'value':'temperature']=starter==='adc'?75:37;
   r.reset();r.attachCircuit(p);assert.match(step(r,f.instructions),starter==='adc'?/ADC=768 mV=2475/:/TEMP x100=3699|TEMP x100=3700/);
   if(starter==='sht31'){p.wires=p.wires.filter(w=>!w.to.endsWith(':VIN'));r.reset();r.attachCircuit(p);assert.match(step(r,100000),/SHT31 NO ACK/);}
  }
 }finally{r.dispose();}
 p.firmware={format:'esp-bin',board,payload:f.bin,source:p.code,sourceKey:sourceKey(p)};
 const q=(await importProjectBytes(exportProjectZip(p))).project;assert.equal(sourceKey(q),sourceKey(p));assert.ok(firmwareMatches(q));
 q.files.find(f=>f.name==='cf_bus.c').content+='\n// user edit\n';assert.equal(firmwareMatches(q),false);
});
test('all fourteen physical ESP headers expose both C17 sensor presets and preserve bus sources',async()=>{
 for(const board of Object.keys(ESP_BOARDS)){
  assert.deepEqual(unifiedExamples(createUnifiedProject({board,language:'c'})).map(e=>e.id),['blink','sht31','adc']);
  for(const starter of ['sht31','adc']){const p=validateProject(createUnifiedProject({board,language:'c',starter}));assert.equal(p.files.length,2);assert.equal(p.language,'c');assert.ok(p.components.some(c=>c.type==='breadboard'));assert.equal(sourceKey((await importProjectBytes(exportProjectZip(p))).project),sourceKey(p));}
 }
});
const guards=JSON.parse(await readFile(new URL('./fixtures/c-sensor-guards.json',import.meta.url)));
for(const [key,f]of Object.entries(guards))test(`C17 ${key}: actual machine-code rejection path`,()=>{
 const p=createUnifiedProject({board:'esp32c3',language:'c',starter:'sht31'}),r=new ESPRuntime(Buffer.from(f.bin,'base64'),{chip:'esp32c3'});
 try{r.attachCircuit(p);assert.match(step(r,f.instructions),key==='invalid'?/GUARDS=10/:/SHT31 CRC ERROR/);}finally{r.dispose();}
});
