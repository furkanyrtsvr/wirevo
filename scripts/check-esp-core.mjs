import {readFile,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';import {gunzipSync} from 'node:zlib';import {createHash} from 'node:crypto';
import {compileESP,ESP_TARGETS,ESP_CLANG_SHA256} from '../src/esp-compiler.js';import {ESPRuntime} from '../dist/esp-runtime.js';
const bytes=gunzipSync(await readFile(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url)));assert.equal(createHash('sha256').update(bytes).digest('hex'),ESP_CLANG_SHA256);const module=await WebAssembly.compile(bytes);
await ESPRuntime.initialize(await readFile(new URL('../dist/esp32/pkg/esp_emu_bg.wasm',import.meta.url)));const results={};
for(const[chip,target]of Object.entries(ESP_TARGETS)){
 const source=`void setup(){Serial.begin(115200);CFClock&s=clockState();s.last=0xfffffff0u;s.us=0xfffffff0u;s.ms=0xfffffffau;s.sub=990;s.rem=0;delay(10);Serial.print("WRAP_US=");Serial.println(micros());Serial.print("WRAP_MS=");Serial.println(millis());${target.xtensa?'pinMode(42,OUTPUT);digitalWrite(42,HIGH);pinMode(46,OUTPUT);digitalWrite(46,HIGH);':''}}void loop(){}`;
 const built=await compileESP(module,source,chip),runtime=new ESPRuntime(built.image,{chip});let output='';try{for(let i=0;i<50;i++)output+=runtime.step(100000);const us=Number(output.match(/WRAP_US=(\d+)/)?.[1]),ms=Number(output.match(/WRAP_MS=(\d+)/)?.[1]);assert.ok(us>=9900&&us<11000,output);assert.ok(ms>=4&&ms<=5,output);if(target.xtensa){assert.equal(runtime.snapshot().pins.find(p=>p.pin===42).output,true);assert.equal(runtime.snapshot().pins.find(p=>p.pin===42).high,true);assert.equal(runtime.snapshot().pins.find(p=>p.pin===46).output,true);}}finally{runtime.dispose();}
 await assert.rejects(compileESP(module,`volatile byte memory[${target.ram+1}];void setup(){memory[0]=1;memory[${target.ram}]=2;}void loop(){}`,chip),/DRAM|overflowed|will not fit/);
 if(target.xtensa)await assert.rejects(compileESP(module,'volatile const byte memory[40000]={1};void setup(){Serial.println((unsigned)memory[39999]);}void loop(){}',chip),/IRAM|overflowed|will not fit/);
 await assert.rejects(compileESP(module,'void setup(){analogRead(0);}void loop(){}',chip),/undeclared identifier/);
 await assert.rejects(compileESP(module,'#include <WiFi.h>\nvoid setup(){}void loop(){}',chip),/file not found/);
 results[chip]={clockOutput:output,flashBytes:built.flashBytes,ramOverflowRejected:true,unsupportedADCRejected:true,unsupportedWiFiRejected:true,...(target.xtensa?{iramAliasOverlapPrevented:true,gpio42High:true,gpio46Output:true}:{})};console.log(chip,'clock wrap / linker bounds / unsupported API OK');
}
await writeFile(new URL('../tests/fixtures/esp-core-acceptance.json',import.meta.url),JSON.stringify(results,null,2));
