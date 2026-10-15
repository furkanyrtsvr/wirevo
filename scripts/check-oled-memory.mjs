import {buildProjectFirmware} from '../dist/gcc-project.js';import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';import {makeProject} from '../dist/templates.js';import {UnoRuntime} from '../dist/uno-runtime.js';import {attachCircuitRuntime} from '../dist/circuit-runtime.js';import {attachI2CRuntime} from '../dist/i2c-runtime.js';
globalThis.window={};globalThis.fetch=async u=>new Response(await readFile(fileURLToPath(u)),{headers:{'Content-Type':String(u).endsWith('.wasm')?'application/wasm':'application/octet-stream'}});
const fixtures={};
for(const id of ['oled','oled-adc']){
 const p=makeProject(id);p.code=p.code.replace('display.setTextColor(SSD1306_WHITE);','display.setTextColor(SSD1306_WHITE);GPIOR1=(uint16_t)display.getBuffer();GPIOR2=(uint16_t)display.getBuffer()>>8;');
 const result=await buildProjectFirmware([{name:'sketch.ino',content:p.code}],{assetsBase:new URL('../research/compiler/node_modules/@horang-corp/avr-gcc-wasm/',import.meta.url).href});
 const r=new UnoRuntime(result.hex);let minimumSP=2303;const tick=r.cpu.tick.bind(r.cpu);r.cpu.tick=()=>{tick();minimumSP=Math.min(minimumSP,r.cpu.SP);};const dc=attachCircuitRuntime(r,p),bus=attachI2CRuntime(r,dc,p);
 for(let i=0;i<140;i++){if(id==='oled-adc'&&i%40===0){p.components.find(c=>c.type==='pot').params.value=[0,25,60,100][i/40];dc.updateProject(p);bus.updateProject(p);}r.stepCycles(160000);}
 const buffer=r.cpu.data[0x4a]|r.cpu.data[0x4b]<<8,heapEnd=buffer+1024,margin=minimumSP-heapEnd;assert.ok(buffer>=256);assert.ok(margin>=16,'OLED heap/stack overlap or insufficient tested margin');assert.ok(r.cpu.data.slice(heapEnd-13,heapEnd).every(b=>b===0),'display tail corrupted');
 fixtures[id]={result,project:p,buffer,heapEnd,minimumSP,margin};console.log(JSON.stringify({id,staticRam:result.staticRamBytes,buffer,heapEnd,minimumSP,margin}));bus.dispose();dc.dispose();
}
await writeFile(new URL('../tests/fixtures/oled-memory.json',import.meta.url),JSON.stringify(fixtures,null,2));
