import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
import {buildProjectFirmware} from '../dist/gcc-project.js';import {UnoRuntime,UNO_HZ} from '../dist/uno-runtime.js';import {makeProject} from '../dist/templates.js';import {attachCircuitRuntime} from '../dist/circuit-runtime.js';import {attachI2CRuntime} from '../dist/i2c-runtime.js';
globalThis.window={};const nativeFetch=globalThis.fetch;globalThis.fetch=async(u,o)=>String(u).startsWith('file:')?new Response(await readFile(fileURLToPath(u)),{headers:{'Content-Type':String(u).endsWith('.wasm')?'application/wasm':'application/octet-stream'}}):nativeFetch(u,o);
const assetsBase=new URL('../research/compiler/node_modules/@horang-corp/avr-gcc-wasm/',import.meta.url).href,fixtures={};
const advance=(r,s)=>{const end=r.cpu.cycles+s*UNO_HZ;while(r.cpu.cycles<end)r.stepCycles(Math.min(160000,end-r.cpu.cycles));};
for(const id of ['oled','oled-adc','i2c-scan']){
 const project=makeProject(id),result=await buildProjectFirmware([{name:'sketch.ino',content:project.code}],{assetsBase}),r=new UnoRuntime(result.hex,{onSerial:c=>serial+=c});let serial='';const dc=attachCircuitRuntime(r,project),bus=attachI2CRuntime(r,dc,project);advance(r,.45);const packet=bus.snapshot(),display=packet.displays.oled1;
 assert.equal(result.fitsRam,true);assert.equal(display.connected,true);assert.ok(packet.addressACK>0);assert.ok(packet.transactions.every(t=>t.end>t.cycle));
 if(id==='i2c-scan'){assert.match(serial,/ACK 0x3C\r\nDevices: 1/);assert.ok(packet.addressNACK>=125);assert.equal(display.on,false);}
 else{assert.equal(display.on,true);assert.ok(display.frame.some(Boolean));const before=display.frame.slice();if(id==='oled-adc'){project.components.find(c=>c.type==='pot').params.value=10;dc.updateProject(project);bus.updateProject(project);advance(r,.4);}else advance(r,1.0);assert.notDeepEqual(bus.snapshot().displays.oled1.frame,before);assert.ok(r.cpu.data[0x5e]<<8|r.cpu.data[0x5d]);}
 fixtures[id]={project,result};console.log(JSON.stringify({id,flash:result.flashBytes,staticRam:result.staticRamBytes,ACK:packet.addressACK,NACK:packet.addressNACK,bytes:packet.bytes,serial}));bus.dispose();dc.dispose();
}
// Real Wire error codes, repeated START and write-only SSD1306 read NACK.
const probe=makeProject('i2c-scan');probe.model='custom';probe.code=`#include <Wire.h>
void setup(){Wire.begin();Serial.begin(115200);Wire.beginTransmission(0x3C);Wire.write(0x80);Wire.write(0xAF);byte write=Wire.endTransmission(false);byte read=Wire.requestFrom((byte)0x3C,(byte)1);Wire.beginTransmission(0x3D);byte missing=Wire.endTransmission();Wire.beginTransmission(0x3C);Wire.write(1);byte malformed=Wire.endTransmission();Serial.print(write);Serial.print(':');Serial.print(read);Serial.print(':');Serial.print(missing);Serial.print(':');Serial.println(malformed);}
void loop(){}
`;
const result=await buildProjectFirmware([{name:'sketch.ino',content:probe.code}],{assetsBase});let serial='';const r=new UnoRuntime(result.hex,{onSerial:c=>serial+=c}),dc=attachCircuitRuntime(r,probe),bus=attachI2CRuntime(r,dc,probe);advance(r,.1);assert.equal(serial,'0:0:2:3\r\n');assert.equal(bus.snapshot().displays.oled1.on,true);fixtures['wire-protocol']={project:probe,result};console.log(JSON.stringify({id:'wire-protocol',serial,starts:bus.snapshot().starts,stops:bus.snapshot().stops}));bus.dispose();dc.dispose();
await writeFile(new URL('../tests/fixtures/oled.json',import.meta.url),JSON.stringify(fixtures,null,2));
