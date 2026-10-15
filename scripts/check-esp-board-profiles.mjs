import {readFile,writeFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {ESP_BOARDS,validateESPImage} from '../dist/esp-boards.js';
import {createUnifiedProject,unifiedExampleProject} from '../dist/unified-project.js';
import {compileESP} from '../src/esp-compiler.js';
import {ESPRuntime} from '../dist/esp-runtime.js';
import {examplePin} from '../dist/esp-example-bindings.js';
const module=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
await ESPRuntime.initialize(await readFile('dist/esp32/pkg/esp_emu_bg.wasm'));
const fixtures={};
for(const board of (process.argv.slice(2).length?process.argv.slice(2):Object.keys(ESP_BOARDS))){
 for(const language of ['arduino','c']){
  const p=createUnifiedProject({board,language}),led=examplePin(board,2);
  p.code=language==='c'?`#include <cf_hal.h>\n#include <stdio.h>\n#include "helper.h"\nint main(void){cf_gpio_mode(${led},CF_OUTPUT);cf_gpio_write(${led},1);cf_uart_begin(115200);puts("C_PROFILE_READY");printf("VALUE=%d\\n",helper());return 0;}\n`:`void setup(){pinMode(${led},OUTPUT);digitalWrite(${led},HIGH);Serial.begin(115200);Serial.println("PROFILE_READY");}void loop(){}\n`;
  if(language==='c')p.files=[{name:'helper.h',content:'#pragma once\nint helper(void);\n'},{name:'helper.c',content:'int helper(void){return 37;}\n'}];
  const built=await compileESP(module,p.code,board,p.files||[],language),r=new ESPRuntime(built.image,{chip:board});r.attachCircuit(p);let serial='',instructions=0;
  try{while(instructions<1000000&&!serial.includes(language==='c'?'VALUE=37':'PROFILE_READY')){serial+=r.step(5000);instructions+=5000;}assert.match(serial,/PROFILE_READY/);if(language==='c')assert.match(serial,/VALUE=37/);const s=r.circuit.snapshot();assert.ok(s.leds.led1.current>.005,board+' '+JSON.stringify(s.leds));assert.equal(validateESPImage(built.image,board).offset,ESP_BOARDS[board].imageOffset||0);fixtures[board+':'+language]={source:p.code,files:p.files||[],bin:Buffer.from(built.image).toString('base64'),instructions,serial,ledCurrent:s.leds.led1.current};console.log(board,language,instructions,'LED',s.leds.led1.current,'OK');}catch(e){console.log('FAILED',board,Array.from(r.emulator.gpio_state()),r.circuit.solution.diagnostics,r.circuit.project.wires,r.circuit.pins);throw e;}finally{r.dispose();}
  await writeFile('tests/fixtures/esp-board-profiles.json',JSON.stringify(fixtures));
 }
}
for(const board of ['esp32h2','esp32c5','esp32p4','xiao-esp32c6'])for(const id of ['sensor-sht31','sensor-adc']){
 const p=unifiedExampleProject(board,'arduino',id),built=await compileESP(module,p.code,board),r=new ESPRuntime(built.image,{chip:board});r.attachCircuit(p);let serial='',instructions=0;
 const expected=id==='sensor-adc'?'ADC=512':'TEMP x100=2500';try{while(instructions<12000000&&!serial.includes(expected)){serial+=r.step(10000);instructions+=10000;}assert.ok(serial.includes(expected),board+' '+id+' '+serial);fixtures[board+':'+id]={source:p.code,bin:Buffer.from(built.image).toString('base64'),instructions,serial};console.log(board,id,instructions,serial.trim(),'OK');}finally{r.dispose();}await writeFile('tests/fixtures/esp-board-profiles.json',JSON.stringify(fixtures));
}
// GPIO46 is output-capable on S3; validate actual CPU and physical LED, not a metadata assertion.
const p=createUnifiedProject({board:'nano-esp32'});p.wires[0].from='mcu:GPIO46';p.code='void setup(){pinMode(46,OUTPUT);digitalWrite(46,HIGH);Serial.begin(115200);Serial.println("GPIO46_OUT");}void loop(){}';
const built=await compileESP(module,p.code,'nano-esp32'),r=new ESPRuntime(built.image,{chip:'nano-esp32'});r.attachCircuit(p);let serial='';try{serial=r.step(10000);assert.match(serial,/GPIO46_OUT/);assert.ok(r.circuit.snapshot().leds.led1.current>.005);fixtures['nano-esp32:gpio46']={source:p.code,bin:Buffer.from(built.image).toString('base64'),instructions:10000,serial};console.log('Nano GPIO46 output OK');}finally{r.dispose();}
await writeFile('tests/fixtures/esp-board-profiles.json',JSON.stringify(fixtures));
