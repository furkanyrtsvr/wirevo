import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {compileESP} from '../src/esp-compiler.js';
import {ESPRuntime} from '../dist/esp-runtime.js';
import {createUnifiedProject} from '../dist/unified-project.js';
const module=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
await ESPRuntime.initialize(await readFile('dist/esp32/pkg/esp_emu_bg.wasm'));
const p=createUnifiedProject({board:'esp32c3',language:'c',starter:'sht31'});
const sources={invalid:`#include <cf_hal.h>
#include <stdio.h>
#include "cf_bus.h"
int main(void){cf_uart_begin(115200);cf_i2c i={0};cf_spi s={0};uint8_t data[1];unsigned n=0;
n+=cf_i2c_init(&i,4,4,10000)<0;n+=cf_i2c_init(&i,63,5,10000)<0;n+=cf_i2c_init(&i,4,5,0)<0;
n+=cf_i2c_read(&i,0x44,data,1)<0;n+=cf_i2c_init(&i,4,5,10000)==0;
n+=cf_i2c_read(&i,128,data,1)<0;n+=cf_i2c_write(&i,0x44,data,129)<0;
n+=cf_spi_init(&s,4,4,5,20000)<0;n+=cf_spi_init(&s,4,6,63,20000)<0;n+=cf_spi_init(&s,4,6,5,9999)<0;
printf("GUARDS=%u\\r\\n",n);return 0;}
`,crc:p.code.replace('else if(crc8(data)', 'else if((data[2]^=1),crc8(data)')};
const fixtures={};for(const [key,code]of Object.entries(sources)){
 const built=await compileESP(module,code,'esp32c3',p.files,'c'),r=new ESPRuntime(built.image,{chip:'esp32c3'});r.attachCircuit(p);let output='',instructions=0;
 try{while(instructions<5000000&&!output.includes(key==='invalid'?'GUARDS=10':'SHT31 CRC ERROR')){output+=r.step(10000);instructions+=10000;}assert.match(output,key==='invalid'?/GUARDS=10/:/SHT31 CRC ERROR/);fixtures[key]={source:code,files:p.files,bin:Buffer.from(built.image).toString('base64'),instructions,output};console.log(key,output.trim(),'OK');}finally{r.dispose();}
}
await writeFile('tests/fixtures/c-sensor-guards.json',JSON.stringify(fixtures));
