import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
import {buildProjectFirmware} from '../dist/gcc-project.js';import {libraryManifest} from '../dist/libraries.js';import {sourceKey} from '../dist/source-files.js';import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
import {makeProject} from '../dist/templates.js';import {UnoRuntime} from '../dist/uno-runtime.js';import {attachCircuitRuntime} from '../dist/circuit-runtime.js';import {attachI2CRuntime} from '../dist/i2c-runtime.js';
globalThis.window={};const nativeFetch=globalThis.fetch;globalThis.fetch=async(u,o)=>String(u).startsWith('file:')?new Response(await readFile(fileURLToPath(u)),{headers:{'Content-Type':String(u).endsWith('.wasm')?'application/wasm':'application/octet-stream'}}):nativeFetch(u,o);
const assetsBase=new URL('../research/compiler/node_modules/@horang-corp/avr-gcc-wasm/',import.meta.url).href;
const files=JSON.parse(await readFile(new URL('../tests/fixtures/multifile.json',import.meta.url))).files;
const core=await buildProjectFirmware(files,{assetsBase,libraries:libraryManifest([])});assert.equal(core.staticRamBytes,166);let serial='';let r=new UnoRuntime(core.hex,{onSerial:c=>serial+=c});r.stepCycles(160000);assert.equal(serial,'1:2\r\n');
await assert.rejects(()=>buildProjectFirmware([{name:'sketch.ino',content:'#include <Wire.h>\nvoid setup(){}void loop(){}'}],{assetsBase,libraries:libraryManifest([])}),/Wire.h: No such file/);
await assert.rejects(()=>buildProjectFirmware([{name:'sketch.ino',content:'#include <Adafruit_SSD1306.h>\nvoid setup(){}void loop(){}'}],{assetsBase,libraries:libraryManifest([{id:'wire',version:'1.0'}])}),/Adafruit_SSD1306.h: No such file/);
const results=[];
for(const id of ['i2c-scan','oled']){
 const p=makeProject(id);p.schemaVersion=5;p.libraries=libraryManifest([{id:id==='oled'?'ssd1306':'wire',version:id==='oled'?'2.5.16':'1.0'}]);
 const result=await buildProjectFirmware([{name:'sketch.ino',content:p.code}],{assetsBase,libraries:p.libraries});p.firmware={hex:result.hex,source:p.code,sourceKey:sourceKey(p),staticRamBytes:result.staticRamBytes};
 const restored=await importProjectBytes(exportProjectZip(p));assert.deepEqual(restored.project.libraries,p.libraries);assert.ok(restored.project.firmware);let output='';r=new UnoRuntime(result.hex,{onSerial:c=>output+=c});const dc=attachCircuitRuntime(r,restored.project),bus=attachI2CRuntime(r,dc,restored.project);
 for(let i=0;i<120;i++)r.stepCycles(160000);
 const state=bus.snapshot();if(id==='oled'){assert.equal(state.displays.oled1.on,true);assert.ok(state.displays.oled1.frame.some(Boolean));assert.ok(state.addressACK>0);}else assert.match(output,/ACK 0x3C/);
 bus.dispose();dc.dispose();results.push({id,result,project:restored.project});
}
const busCode='#include <Adafruit_I2CDevice.h>\nAdafruit_I2CDevice device(0x3C);\nvoid setup(){Serial.begin(115200);Serial.println(device.begin());}\nvoid loop(){}';
const busResult=await buildProjectFirmware([{name:'sketch.ino',content:busCode}],{assetsBase,libraries:libraryManifest([{id:'busio',version:'1.17.4'}])});serial='';r=new UnoRuntime(busResult.hex,{onSerial:c=>serial+=c});const p=makeProject('oled'),dc=attachCircuitRuntime(r,p),bus=attachI2CRuntime(r,dc,p);for(let i=0;i<10;i++)r.stepCycles(160000);assert.equal(serial,'1\r\n');bus.dispose();dc.dispose();
const spi=await buildProjectFirmware([{name:'sketch.ino',content:'#include <SPI.h>\nvoid setup(){Serial.begin(115200);SPI.begin();SPI.beginTransaction(SPISettings(4000000,MSBFIRST,SPI_MODE0));Serial.println(SPCR,HEX);SPI.endTransaction();}\nvoid loop(){}'}],{assetsBase,libraries:libraryManifest([{id:'spi',version:'1.0'}])});serial='';r=new UnoRuntime(spi.hex,{onSerial:c=>serial+=c});r.stepCycles(160000);assert.equal(serial,'50\r\n');
await writeFile(new URL('../tests/fixtures/library-project.json',import.meta.url),JSON.stringify({core:{files,result:core},examples:results,busio:{source:busCode,result:busResult},spi:{result:spi}},null,2));
console.log(JSON.stringify({checks:7,core:[core.flashBytes,core.staticRamBytes],examples:results.map(x=>({id:x.id,flash:x.result.flashBytes,ram:x.result.staticRamBytes,objects:x.result.libraryArchiveObjects})),busio:busResult.flashBytes,spi:spi.flashBytes}));
