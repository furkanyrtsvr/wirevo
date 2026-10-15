import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
import {buildProjectFirmware} from '../dist/gcc-project.js';import {UnoRuntime,UNO_HZ} from '../dist/uno-runtime.js';import {makeProject} from '../dist/templates.js';import {attachCircuitRuntime} from '../dist/circuit-runtime.js';import {attachI2CRuntime} from '../dist/i2c-runtime.js';
globalThis.window={};const nativeFetch=globalThis.fetch;globalThis.fetch=async(u,o)=>String(u).startsWith('file:')?new Response(await readFile(fileURLToPath(u)),{headers:{'Content-Type':String(u).endsWith('.wasm')?'application/wasm':'application/octet-stream'}}):nativeFetch(u,o);
const assetsBase=new URL('../research/compiler/node_modules/@horang-corp/avr-gcc-wasm/',import.meta.url).href,fixtures={};
for(const id of ['eeprom','rtc','i2c-modules']){
 const project=makeProject(id),result=await buildProjectFirmware([{name:'sketch.ino',content:project.code}],{assetsBase});let serial='';const r=new UnoRuntime(result.hex,{onSerial:c=>serial+=c}),dc=attachCircuitRuntime(r,project),bus=attachI2CRuntime(r,dc,project);
 const end=r.cpu.cycles+3.2*UNO_HZ;while(r.cpu.cycles<end)r.stepCycles(Math.min(160000,end-r.cpu.cycles));const packet=bus.snapshot();
 assert.equal(result.fitsRam,true);assert.ok(packet.addressACK>0);assert.ok(packet.transactions.filter(t=>!t.write&&t.ack).every(t=>t.byteCount>0));
 if(id==='eeprom'){assert.match(serial,/WRITE=0\r\nEEPROM: CF1/);assert.ok(packet.addressNACK>0);assert.deepEqual(packet.modules.memory1.preview.slice(0,3),[67,70,49]);}
 if(id==='rtc'){assert.match(serial,/RTC SET=0\r\n12:34:58/);assert.match(serial,/12:35:1/);assert.equal(packet.modules.rtc1.halted,false);}
 if(id==='i2c-modules'){assert.match(serial,/ACK 0x3C\r\nACK 0x50\r\nACK 0x68\r\nDevices: 3/);}
 fixtures[id]={project,result};console.log(JSON.stringify({id,flash:result.flashBytes,staticRam:result.staticRamBytes,ACK:packet.addressACK,NACK:packet.addressNACK,serial}));bus.dispose();dc.dispose();
}
await writeFile(new URL('../tests/fixtures/i2c-modules.json',import.meta.url),JSON.stringify(fixtures,null,2));
