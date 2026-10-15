import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {compileESP,ESP_CLANG_SHA256} from '../src/esp-compiler.js';
import {ESP_BOARDS,ESP_EXAMPLES} from '../dist/esp-boards.js';
import {ESPRuntime} from '../dist/esp-runtime.js';
const wasm=gunzipSync(await readFile(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url)));
if(createHash('sha256').update(wasm).digest('hex')!==ESP_CLANG_SHA256)throw Error('Compiler SHA mismatch');
const module=await WebAssembly.compile(wasm);
await ESPRuntime.initialize(await readFile(new URL('../dist/esp32/pkg/esp_emu_bg.wasm',import.meta.url)));
const fixtures={};
for(const chip of ['esp32c3','esp32c6','esp32s3'])for(const e of ESP_EXAMPLES){
const built=await compileESP(module,e.code,chip,e.files||[]),runtime=new ESPRuntime(built.image,{chip});let output='',sawHigh=false,sawLow=false;
runtime.setInput(3,false);if(e.id==='echo')runtime.queueSerial('ESP_UART_ACCEPT\r\n');
for(let i=0;i<110;i++){output+=runtime.step(100000);const pin=runtime.snapshot().pins.find(p=>p.pin===2);if(pin.output){if(pin.high)sawHigh=true;else sawLow=true;}}
if(e.id==='blink'&&(!sawHigh||!sawLow||!output.includes('LED ON')||!output.includes('LED OFF')))throw Error(chip+' Blink');
if(e.id==='button'&&(!sawHigh||!output.includes('BUTTON=1')))throw Error(chip+' button');
if(e.id==='echo'&&!output.includes('ESP_UART_ACCEPT\r\n'))throw Error(chip+' UART echo '+output);
if(e.id==='counter'&&!output.includes('COUNT=37 RAM=37/77 ms='))throw Error(chip+' constructors/RAM '+output);
if(e.id==='format'&&!output.includes('HEX=DEADBEEF\r\nBIN=101010\r\nSIGNED=-2147483648\r\nCHAR=A\r\nOK\r\n'))throw Error(chip+' Serial formatting '+output);
if(e.id==='multifile'&&(!sawHigh||!sawLow||!output.includes('MULTI HIGH')||!output.includes('MULTI LOW')))throw Error(chip+' separate CPP/header link '+output);
fixtures[chip+':'+e.id]={source:e.code,files:e.files||[],sourceKey:built.sourceKey,bin:Buffer.from(built.image).toString('base64'),staticRamBytes:built.staticRamBytes,flashBytes:built.flashBytes,output,sawHigh,sawLow};runtime.dispose();
console.log(chip,e.id,built.flashBytes,built.staticRamBytes,'OK');}
await mkdir(new URL('../tests/fixtures/',import.meta.url),{recursive:true});
await writeFile(new URL('../tests/fixtures/esp-projects.json',import.meta.url),JSON.stringify(fixtures,null,2));
await writeFile(new URL('../dist/esp32/examples.json',import.meta.url),JSON.stringify({...JSON.parse(await readFile(new URL('../dist/esp32/examples.json',import.meta.url))),...Object.fromEntries(Object.entries(fixtures).map(([k,v])=>[k,{source:v.source,files:v.files,sourceKey:v.sourceKey,bin:v.bin,staticRamBytes:v.staticRamBytes,flashBytes:v.flashBytes}]))}));
