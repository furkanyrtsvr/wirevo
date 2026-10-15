import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
import {createUnifiedProject,encodeBytes} from '../dist/unified-project.js';
import {validateProject} from '../dist/core.js';
import {sourceKey,projectFiles} from '../dist/source-files.js';
import {compileESP} from '../src/esp-compiler.js';
import {ESPRuntime} from '../dist/esp-runtime.js';
import {loadMicroPython} from '../dist/micropython/micropython.mjs';
import {PythonCircuit} from '../dist/python-circuit.js';
import {machineSource} from '../dist/python-machine.js';
const mp=await loadMicroPython({wasmBinary:await readFile('dist/micropython/micropython.wasm'),stdout:console.log});

const c=createUnifiedProject({board:'esp32c3',language:'micropython'}),r=new PythonCircuit('esp32c3',c);mp.FS.writeFile('machine.py',machineSource);mp.registerJsModule('_cf',{configure:(...a)=>r.configure(...a),write:(...a)=>r.write(...a),read:(...a)=>r.read(...a),delay_us:n=>r.advance(n)});mp.runPython('from machine import Pin\np=Pin(2,Pin.OUT)\np.on()\nprint("PIN",p.value())');console.log('LED',r.circuit.snapshot().leds);
const module=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));await ESPRuntime.initialize(await readFile('dist/esp32/pkg/esp_emu_bg.wasm'));
for(const chip of ['esp32c3','esp32c6','esp32s3']){const p=validateProject(createUnifiedProject({board:chip,language:'c'}));console.log('FILES',projectFiles(p)[0].name,sourceKey(p).length);const result=await compileESP(module,p.code,chip,[],'c'),rt=new ESPRuntime(result.image,{chip});rt.attachCircuit(p);let serial='';for(let i=0;i<10000000;i+=10000){serial+=rt.step(10000);if(serial.includes('C LED OFF'))break;}if(!serial.includes('C LED OFF'))throw Error(serial);p.firmware={format:'esp-bin',payload:encodeBytes(result.image),board:chip,source:p.code,sourceKey:sourceKey(p)};const imported=await importProjectBytes(exportProjectZip(p));if(sourceKey(imported.project)!==sourceKey(p))throw Error('C ZIP roundtrip');console.log(chip,serial);rt.dispose();}
