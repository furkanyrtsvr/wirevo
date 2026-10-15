import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ESPRuntime} from '../dist/esp-runtime.js';
import {ESP_BOARDS,validateESPImage} from '../dist/esp-boards.js';
import {ESP_PIN_DEFS} from '../dist/esp-pin-defs.js';
import {ESP_PARTS,createESPBench,validateESPCircuit,solveESPCircuit} from '../dist/esp-circuit.js';
import {ESP_CIRCUIT_EXAMPLES,espExampleCircuit} from '../dist/esp-circuit-examples.js';
import {stringifyESPProject,parseESPProject} from '../dist/esp-project.js';
import {normalizeESPFiles,espSourceKey} from '../dist/esp-source.js';
await ESPRuntime.initialize(await readFile(new URL('../dist/esp32/pkg/esp_emu_bg.wasm',import.meta.url)));
const basic=JSON.parse(await readFile(new URL('./fixtures/esp-projects.json',import.meta.url)));
const fixtures=JSON.parse(await readFile(new URL('./fixtures/esp-circuits.json',import.meta.url)));
function runtime(chip,id,project=espExampleCircuit(id,chip)){const f=fixtures[chip+':'+id]||basic[chip+':'+id],r=new ESPRuntime(Buffer.from(f.bin,'base64'),{chip});r.attachCircuit(project);return r;}
function until(r,pattern,max=12000000){let text='';for(let n=0;n<max;n+=10000){text+=r.step(10000);if(pattern.test(text))return text;}assert.match(text,pattern);return text;}
test('ESP import rejects malformed basic controls and OLED addresses',()=>{for(const [type,params] of [['spdt',{position:'bad'}],['oled',{address:0}],['led',{color:'bad'}],['relay',{activeHigh:'yes'}]]){const p=createESPBench('esp32c3');p.components.push({id:'bad',type,x:700,y:0,params});assert.throws(()=>validateESPCircuit(p,'esp32c3'));}});
test('Real GPIO energizes relay and multimeter reads the resolved 3.3 V supply',()=>{const chip='esp32c3',p=espExampleCircuit('sensor-relay',chip);p.components.push({id:'meter1',type:'multimeter',x:600,y:300,params:{mode:'voltage'}});p.wires.push({id:'meterV',from:'mcu:3V3',to:'meter1:V',color:'#14b8a6'},{id:'meterG',from:'mcu:GND',to:'meter1:COM',color:'#14b8a6'});const r=runtime(chip,'sensor-relay',p);try{until(r,/RELAY=1/);const s=r.circuit.snapshot();assert.ok(Object.values(s.contacts).some(c=>c.energized));assert.equal(s.meters.meter1.status,'OK');assert.ok(Math.abs(s.meters.meter1.value-3.3)<1e-6);}finally{r.dispose();}});
for(const chip of ['esp32c3','esp32c6','esp32s3']){
 test(chip+' pad aliases, floating inputs, button pull-up and wired LED',()=>{
  const p=createESPBench(chip),dc=solveESPCircuit(p,chip);assert.equal(dc.netlist.net('mcu:GND'),dc.netlist.net('mcu:GND.1'));
  assert.equal(ESP_PIN_DEFS[chip].filter(p=>p.port).length,ESP_BOARDS[chip].gpio.length);
  const r=new ESPRuntime(Buffer.from(basic[chip+':button'].bin,'base64'),{chip});try{r.attachCircuit(p);assert.equal(r.snapshot().pins.find(p=>p.pin===3).voltage,null);assert.throws(()=>r.setInput(3,false),/devre/);until(r,/BUTTON=0/);
   assert.ok(r.snapshot().pins.find(p=>p.pin===3).voltage>3.2);p.components.find(c=>c.type==='button').params.pressed=true;r.circuit.update(p);until(r,/BUTTON=1/);assert.equal(r.snapshot().pins.find(p=>p.pin===3).voltage,0);assert.ok(r.circuit.snapshot().leds.led1.current>.005);
   r.reset();assert.equal(r.snapshot().cycles,0);until(r,/BUTTON=1/);
  }finally{r.dispose();}
 });
 test(chip+' real SPI ADC follows pot changes without recompiling',()=>{const p=espExampleCircuit('sensor-adc',chip),r=runtime(chip,'sensor-adc',p);try{until(r,/ADC=512 mV=1650/);p.components.find(c=>c.id==='pot1').params.value=75;r.circuit.update(p);until(r,/ADC=768 mV=2475/);const state=r.circuit.snapshot();assert.ok(state.devices.adc1.powered);assert.ok(Math.abs(state.wireVoltages.w10-2.475)<.001);
   p.wires=p.wires.filter(w=>!w.to.endsWith('adc1:VDD'));r.circuit.update(p);assert.equal(r.circuit.snapshot().devices.adc1.powered,false);r.reset();assert.equal(r.circuit.snapshot().devices.adc1.powered,false);
  }finally{r.dispose();}});
}
test('SHT31 environment changes feed actual conversion and CRC; detached supply cannot phantom-power',()=>{const p=espExampleCircuit('sensor-sht31','esp32c3'),r=runtime('esp32c3','sensor-sht31',p);try{until(r,/TEMP x100=2500 HUM x100=5000/);Object.assign(p.components.find(c=>c.id==='sensor1').params,{temperature:40,humidity:75});r.circuit.update(p);until(r,/TEMP x100=3999 HUM x100=7499/);
 p.wires=p.wires.filter(w=>!w.to.endsWith('sensor1:VIN'));r.circuit.update(p);assert.equal(r.circuit.snapshot().devices.sensor1.powered,false);until(r,/SHT31 NO ACK/);p.wires=espExampleCircuit('sensor-sht31','esp32c3').wires;r.circuit.update(p);until(r,/TEMP x100=3999 HUM x100=7499/);
 p.wires=p.wires.filter(w=>!w.to.endsWith('sensor1:SDA'));r.circuit.update(p);until(r,/SHT31 NO ACK/);
}finally{r.dispose();}});
test('DS18B20 reads negative 9-bit conversion through real slots, presence and CRC',()=>{const p=espExampleCircuit('sensor-onewire','esp32c3');p.components.find(c=>c.id==='sensor1').params.temperature=-10.5;const r=runtime('esp32c3','sensor-onewire',p);try{until(r,/DS TEMP x100=-1050/,24000000);const s=r.circuit.snapshot();assert.equal(s.devices.sensor1.resolution,9);assert.ok(s.devices.sensor1.conversions>=1);assert.ok(s.bus.onewireResets>=3&&s.bus.onewireSlots>=100);p.wires=p.wires.filter(w=>!w.to.endsWith('sensor1:VDD'));r.circuit.update(p);assert.equal(r.circuit.snapshot().devices.sensor1.powered,false);}finally{r.dispose();}});
test('Every sensor preset has chip-specific genuine image and valid physical circuit',()=>{for(const chip of ['esp32c3','esp32c6','esp32s3'])for(const e of ESP_CIRCUIT_EXAMPLES){const f=fixtures[chip+':'+e.id];assert.ok(f,chip+':'+e.id);assert.equal(f.source,e.code);assert.equal(f.sourceKey,espSourceKey(chip,e.code));validateESPImage(Buffer.from(f.bin,'base64'),chip);validateESPCircuit(f.circuit,chip);assert.ok(f.instructions>0);assert.ok(f.output.length);}});
test('ESP circuit rejects corrupt pins, duplicate IDs, unsafe values, 5 V GPIO and reserved bus headers',()=>{assert.ok(ESP_PARTS.length>=37);let p=createESPBench('esp32c3');p.wires[0].to='r1:99';assert.throws(()=>validateESPCircuit(p,'esp32c3'),/pin/);p=createESPBench('esp32c3');p.components.push({...p.components[1]});assert.throws(()=>validateESPCircuit(p,'esp32c3'),/bileşeni/);p=createESPBench('esp32c3');p.components[1].params.ohms=NaN;assert.throws(()=>validateESPCircuit(p,'esp32c3'),/Direnç/);p=createESPBench('esp32c3');p.wires.push({id:'ov',from:'mcu:5V',to:'mcu:GPIO3',color:'#14b8a6'});assert.equal(solveESPCircuit(p,'esp32c3').fault.code,'esp-gpio-overvoltage');for(const name of ['Wire.h','SPI.h','libs/arduino.h'])assert.throws(()=>normalizeESPFiles('void setup(){}',[{name,content:''}]),/Kaynak/);});
test('v3 project carries independent circuit plus firmware and accepts legacy v2',()=>{const chip='esp32c3',e=ESP_CIRCUIT_EXAMPLES.find(e=>e.id==='sensor-adc'),f=fixtures[chip+':'+e.id],circuit=espExampleCircuit(e.id,chip),image=Buffer.from(f.bin,'base64');circuit.components.find(c=>c.id==='pot1').params.value=75;const text=stringifyESPProject({chip,source:e.code,circuit,example:e.id,image,firmwareSource:e.code});assert.equal(JSON.parse(text).version,3);const parsed=parseESPProject(text);assert.deepEqual(parsed.circuit,circuit);assert.deepEqual(Buffer.from(parsed.image),image);const broken=JSON.parse(text);broken.circuit.wires[0].from='missing:VCC';assert.throws(()=>parseESPProject(JSON.stringify(broken)),/pin/);const old=JSON.parse(text);old.version=2;delete old.circuit;assert.deepEqual(parseESPProject(JSON.stringify(old)).circuit,createESPBench(chip));});

