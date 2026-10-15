import test,{beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadMicroPython} from '../dist/micropython/micropython.mjs';
import {PythonCircuit} from '../dist/python-circuit.js';
import {machineSource} from '../dist/python-machine.js';
import {createUnifiedProject} from '../dist/unified-project.js';
import {espExampleCircuit} from '../dist/esp-circuit-examples.js';
let runtime;
let mp;beforeEach(async()=>{mp=await loadMicroPython({wasmBinary:await readFile(new URL('../dist/micropython/micropython.wasm',import.meta.url)),stdout:()=>{}});
mp.FS.writeFile('machine.py',machineSource);mp.registerJsModule('_cf',{configure:(...a)=>runtime.configure(...a),write:(...a)=>runtime.write(...a),read:(...a)=>runtime.read(...a),delay_us:n=>runtime.advance(n)});});
test('official MicroPython executes Pin, mounted LED current and disconnect',()=>{
 const p=createUnifiedProject({board:'esp32c3',language:'micropython'});runtime=new PythonCircuit('esp32c3',p);
 mp.runPython('from machine import Pin\npin=Pin(2,Pin.OUT)\npin.on()');assert.ok(runtime.circuit.snapshot().leds.led1.current>.005);
 mp.runPython('pin.off()');assert.equal(runtime.circuit.snapshot().leds.led1.current,0);
 p.wires=[];runtime.circuit.update(p);mp.runPython('pin.on()');assert.equal(runtime.circuit.snapshot().leds.led1.current,0);
});
test('MicroPython syntax check accepts await without executing source and rejects return outside function',async()=>{
 mp.globals.set('_cf_check_source','print("MUST NOT RUN")\nawait js.cf.sleep(10)');await mp.runPythonAsync('compile(_cf_check_source,"main.py","exec")');
 mp.globals.set('_cf_check_source','return 42');await assert.rejects(async()=>mp.runPythonAsync('compile(_cf_check_source,"main.py","exec")'));mp.globals.delete('_cf_check_source');
});
test('SoftI2C reads SHT31 bytes from powered GPIO circuit and loses ACK when power is detached',()=>{
 const p=espExampleCircuit('sensor-sht31','esp32c3');runtime=new PythonCircuit('esp32c3',p);
 mp.runPython('from machine import Pin, SoftI2C\ni2c=SoftI2C(sda=Pin(4),scl=Pin(5),freq=10000)\ni2c.writeto(0x44,bytes([0x24,0]))');runtime.advance(20000);
 mp.runPython('data=i2c.readfrom(0x44,6)\ntemp=-45+175*((data[0]<<8)|data[1])/65535');assert.ok(Math.abs(mp.globals.get('temp')-25)<.01);
 p.components.find(c=>c.type==='sht31').params.temperature=37;runtime.circuit.update(p);mp.runPython('i2c.writeto(0x44,bytes([0x24,0]))');runtime.advance(20000);mp.runPython('data=i2c.readfrom(0x44,6)\ntemp=-45+175*((data[0]<<8)|data[1])/65535');assert.ok(Math.abs(mp.globals.get('temp')-37)<.01);
 p.wires=p.wires.filter(w=>!w.to.endsWith(':VIN'));runtime.circuit.update(p);assert.throws(()=>mp.runPython('i2c.writeto(0x44,bytes([0x24,0]))'));
});
test('SoftSPI samples actual MCP3008 potentiometer and tracks a circuit edit',()=>{
 const p=espExampleCircuit('sensor-adc','esp32c3');runtime=new PythonCircuit('esp32c3',p);
 mp.runPython('from machine import Pin, SoftSPI\nspi=SoftSPI(sck=Pin(4),mosi=Pin(5),miso=Pin(6),baudrate=20000)\ncs=Pin(7,Pin.OUT,value=1)\ndef read_adc():\n cs(0)\n b=bytearray(3)\n spi.write_readinto(bytes([1,128,0]),b)\n cs(1)\n return ((b[1]&3)<<8)|b[2]\nraw=read_adc()');assert.equal(mp.globals.get('raw'),512);
 p.components.find(c=>c.type==='pot').params.value=75;runtime.circuit.update(p);mp.runPython('raw=read_adc()');assert.equal(mp.globals.get('raw'),768);
});
