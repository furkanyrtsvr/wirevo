import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ESP_BOARDS,validateESPImage} from '../dist/esp-boards.js';
import {ESP_PIN_DEFS} from '../dist/esp-pin-defs.js';
import {ESPRuntime} from '../dist/esp-runtime.js';
import {createUnifiedProject,unifiedExamples,unifiedExampleProject} from '../dist/unified-project.js';
import {validateProject,buildNets} from '../dist/core.js';
import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
import {examplePin} from '../dist/esp-example-bindings.js';
import {loadMicroPython} from '../dist/micropython/micropython.mjs';
import {PythonCircuit} from '../dist/python-circuit.js';
import {machineSource} from '../dist/python-machine.js';
import {sourceKey} from '../dist/source-files.js';
const fixtures=JSON.parse(await readFile(new URL('./fixtures/esp-board-profiles.json',import.meta.url)));
await ESPRuntime.initialize(await readFile(new URL('../dist/esp32/pkg/esp_emu_bg.wasm',import.meta.url)));
for(const board of Object.keys(ESP_BOARDS)){
 for(const language of ['arduino','c'])test(`${board}: actual ${language} CPU/LED/UART, independent C translation unit and ZIP`,async()=>{
  const f=fixtures[board+':'+language];assert.ok(f,'Run scripts/check-esp-board-profiles.mjs');const image=Buffer.from(f.bin,'base64'),p=createUnifiedProject({board,language});p.code=f.source;p.files=f.files;
  const r=new ESPRuntime(image,{chip:board});try{r.attachCircuit(p);const serial=r.step(f.instructions);assert.match(serial,/PROFILE_READY/);if(language==='c')assert.match(serial,/VALUE=37/);assert.ok(r.circuit.snapshot().leds.led1.current>.005);assert.equal(r.snapshot().hz,ESP_BOARDS[board].hz);}finally{r.dispose();}
  p.firmware={format:'esp-bin',board,payload:f.bin,source:p.code,sourceKey:sourceKey(p)};const q=(await importProjectBytes(exportProjectZip(p))).project;assert.equal(q.firmware.payload,f.bin);assert.equal(q.components.find(c=>c.type==='board').params.model,board);assert.equal(validateESPImage(image,board).offset,ESP_BOARDS[board].imageOffset||0);
 });
 test(`${board}: official MicroPython Pin executes and mounted nets match selected board`,async()=>{
  const p=validateProject(createUnifiedProject({board,language:'micropython'})),runtime=new PythonCircuit(board,p),mp=await loadMicroPython({wasmBinary:await readFile(new URL('../dist/micropython/micropython.wasm',import.meta.url)),stdout:()=>{}});
  mp.FS.writeFile('machine.py',machineSource+'\n'+Object.entries(runtime.board.aliases||{}).map(([k,v])=>k+'='+v).join('\n'));mp.registerJsModule('_cf',{configure:(...a)=>runtime.configure(...a),write:(...a)=>runtime.write(...a),read:(...a)=>runtime.read(...a),delay_us:n=>runtime.advance(n)});
  mp.runPython(`from machine import Pin\np=Pin(${examplePin(board,2)},Pin.OUT)\np.on()`);assert.ok(runtime.circuit.snapshot().leds.led1.current>.005);mp.runPython('p.off()');assert.equal(runtime.circuit.snapshot().leds.led1.current,0);
  for(const c of p.components.filter(c=>['resistor','led'].includes(c.type))){assert.ok(c.mount);for(const [pin,hole]of Object.entries(c.mount.pins))assert.ok(buildNets(p).same(c.id+':'+pin,c.mount.boardId+':'+hole));}
  for(const e of unifiedExamples(p))validateProject(unifiedExampleProject(board,'micropython',e.id));
  if(runtime.board.aliases?.D0!==undefined){p.wires[0].from='mcu:GPIO'+runtime.board.aliases.D0;runtime.circuit.update(p);mp.runPython('from machine import D0\na=Pin(D0,Pin.OUT)\na.on()');assert.ok(runtime.circuit.snapshot().leds.led1.current>.005);}
 });
}
for(const board of ['esp32h2','esp32c5','esp32p4','xiao-esp32c6'])for(const id of ['sensor-sht31','sensor-adc'])test(`${board}: real remapped ${id} protocol`,()=>{
 const f=fixtures[board+':'+id],p=unifiedExampleProject(board,'arduino',id),r=new ESPRuntime(Buffer.from(f.bin,'base64'),{chip:board});try{r.attachCircuit(p);assert.equal(p.code,f.source);let serial='';for(let n=0;n<f.instructions;n+=10000)serial+=r.step(Math.min(10000,f.instructions-n));assert.ok(serial.includes(id==='sensor-adc'?'ADC=512':'TEMP x100=2500'),serial);const state=r.circuit.snapshot();assert.ok(state.devices[id==='sensor-adc'?'adc1':'sensor1'].powered);}finally{r.dispose();}
});
for(const board of ['esp32h2','esp32c5','esp32p4','xiao-esp32c6'])test(`${board}: official MicroPython physical I2C/SPI with remapped pins and live edits`,async()=>{
 let runtime=new PythonCircuit(board,unifiedExampleProject(board,'arduino','sensor-sht31'));
 const mp=await loadMicroPython({wasmBinary:await readFile(new URL('../dist/micropython/micropython.wasm',import.meta.url)),stdout:()=>{}});
 mp.FS.writeFile('machine.py',machineSource);mp.registerJsModule('_cf',{configure:(...a)=>runtime.configure(...a),write:(...a)=>runtime.write(...a),read:(...a)=>runtime.read(...a),delay_us:n=>runtime.advance(n)});
 const pin=n=>examplePin(board,n);
 mp.runPython(`from machine import Pin, SoftI2C, SoftSPI\ni2c=SoftI2C(sda=Pin(${pin(4)}),scl=Pin(${pin(5)}),freq=10000)\ni2c.writeto(0x44,bytes([0x24,0]))`);runtime.advance(20000);
 mp.runPython('data=i2c.readfrom(0x44,6)\ntemp=-45+175*((data[0]<<8)|data[1])/65535');assert.ok(Math.abs(mp.globals.get('temp')-25)<.01);
 const p=unifiedExampleProject(board,'arduino','sensor-adc');runtime=new PythonCircuit(board,p);
 mp.runPython(`spi=SoftSPI(sck=Pin(${pin(4)}),mosi=Pin(${pin(5)}),miso=Pin(${pin(6)}),baudrate=20000)\ncs=Pin(${pin(7)},Pin.OUT,value=1)\ndef sample():\n cs(0)\n b=bytearray(3)\n spi.write_readinto(bytes([1,128,0]),b)\n cs(1)\n return ((b[1]&3)<<8)|b[2]\nraw=sample()`);assert.equal(mp.globals.get('raw'),512);
 p.components.find(c=>c.type==='pot').params.value=75;runtime.circuit.update(p);mp.runPython('raw=sample()');assert.equal(mp.globals.get('raw'),768);
});
test('H2/C5 reserved crystal and PSRAM pads, Nano and XIAO aliases match manufacturer tables',()=>{
 assert.equal(ESP_BOARDS.esp32h2.gpio.includes(13),false);assert.equal(ESP_BOARDS.esp32h2.gpio.includes(14),false);assert.equal(ESP_BOARDS.esp32c5.gpio.includes(15),false);
 assert.equal(ESP_BOARDS.esp32p4.gpio.includes(0),false);assert.equal(ESP_BOARDS.esp32p4.gpio.includes(1),false);assert.equal(ESP_BOARDS.esp32p4.gpio.includes(45),false);assert.equal(ESP_BOARDS.esp32p4.gpio.includes(54),true);
 assert.equal(ESP_BOARDS['xiao-esp32c6'].aliases.D4,22);assert.equal(ESP_BOARDS['xiao-esp32s3'].aliases.D6,43);assert.equal(ESP_BOARDS['nano-esp32'].aliases.D13,48);assert.equal(ESP_BOARDS['nano-esp32'].aliases.LEDR,46);
 for(const [id,b]of Object.entries(ESP_BOARDS)){assert.ok(b.source.startsWith('https://'));assert.equal(new Set(ESP_PIN_DEFS[id].map(p=>p.id)).size,ESP_PIN_DEFS[id].length);}
});
test('S3 GPIO46 has a real output driver; P4 GPIO54 second bank is handled by Python',()=>{
 const f=fixtures['nano-esp32:gpio46'],p=createUnifiedProject({board:'nano-esp32'});p.wires[0].from='mcu:GPIO46';const r=new ESPRuntime(Buffer.from(f.bin,'base64'),{chip:'nano-esp32'});try{r.attachCircuit(p);assert.match(r.step(f.instructions),/GPIO46_OUT/);assert.ok(r.snapshot().pins.find(p=>p.pin===46).output);assert.ok(r.circuit.snapshot().leds.led1.current>.005);}finally{r.dispose();}
 const py=createUnifiedProject({board:'esp32p4',language:'micropython'});py.wires[0].from='mcu:GPIO54';const runtime=new PythonCircuit('esp32p4',py);runtime.configure(54,1,false,1);assert.ok(runtime.circuit.snapshot().leds.led1.current>.005);
});
