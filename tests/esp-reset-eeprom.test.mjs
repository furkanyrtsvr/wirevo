import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ESP_BOARDS} from '../dist/esp-boards.js';
import {ESPRuntime} from '../dist/esp-runtime.js';
import {unifiedExampleProject} from '../dist/unified-project.js';
const firmware=JSON.parse(await readFile(new URL('./fixtures/esp-board-profiles.json',import.meta.url)));
await ESPRuntime.initialize(await readFile(new URL('../dist/esp32/pkg/esp_emu_bg.wasm',import.meta.url)));
for(const board of Object.keys(ESP_BOARDS))test(`${board}: MCU reset preserves external EEPROM bytes and pending write deadline`,()=>{
 const p=unifiedExampleProject(board,'arduino','sensor-eeprom'),r=new ESPRuntime(Buffer.from(firmware[board+':arduino'].bin,'base64'),{chip:board});
 try{r.attachCircuit(p);r.step(10000);const d=r.circuit.controllers.get('sensor1');assert.ok(d.powered);
  // Memory contents are external to the MCU. A real pending STOP write is rebased.
  d.controller.memory[10]=77;d.controller.revision=3;
  const cycle=r.circuit.cycle();d.controller.begin(true,cycle);d.controller.write(0,cycle);d.controller.write(20,cycle);d.controller.write(99,cycle);d.controller.stop(cycle,false);
  assert.equal(d.controller.memory[20],255);assert.ok(d.controller.committing);const remaining=d.controller.busyUntil-cycle;
  r.reset();const after=r.circuit.controllers.get('sensor1').controller;
  assert.equal(r.snapshot().cycles,0);assert.equal(after.memory[10],77);assert.equal(after.memory[20],255);assert.equal(after.revision,3);assert.equal(after.busyUntil,remaining);
  for(let i=0;i<3;i++)r.step(1000000);r.circuit.snapshot();assert.equal(after.memory[20],99);assert.equal(after.revision,4);
  r.reset();assert.equal(r.circuit.controllers.get('sensor1').controller.memory[20],99);
  p.wires=p.wires.filter(w=>!w.to.endsWith('sensor1:VCC'));r.circuit.update(p);assert.equal(r.circuit.controllers.get('sensor1').powered,false);
  r.reset();assert.equal(r.circuit.controllers.get('sensor1').controller.memory[20],99);assert.equal(r.circuit.controllers.get('sensor1').powered,false);
 }finally{r.dispose();}
});
