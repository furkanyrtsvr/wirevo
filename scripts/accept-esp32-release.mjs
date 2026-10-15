import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {ESP_BOARDS,validateESPImage} from '../dist/esp-boards.js';
import {createUnifiedProject,unifiedExamples,unifiedExampleProject} from '../dist/unified-project.js';
import {compileESP,ESP_CLANG_SHA256} from '../src/esp-compiler.js';
import {validateProject,buildNets} from '../dist/core.js';
import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
import {sourceKey,firmwareMatches} from '../dist/source-files.js';
import {examplePin} from '../dist/esp-example-bindings.js';
import {ESPRuntime} from '../dist/esp-runtime.js';
import {PythonCircuit} from '../dist/python-circuit.js';
import {loadMicroPython} from '../dist/micropython/micropython.mjs';
import {machineSource} from '../dist/python-machine.js';
const hash=b=>createHash('sha256').update(b).digest('hex');
const group=process.env.CF_AUDIT_GROUP||'all',boards=process.argv.slice(2).length?process.argv.slice(2):Object.keys(ESP_BOARDS);
await mkdir('docs/esp32-acceptance',{recursive:true});
const compiler=gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz'));assert.equal(hash(compiler),ESP_CLANG_SHA256);
const module=await WebAssembly.compile(compiler),emu=await readFile('dist/esp32/pkg/esp_emu_bg.wasm');await ESPRuntime.initialize(emu);
const report={schema:1,group,compilerSha256:hash(compiler),emulatorSha256:hash(emu),cases:[],checks:[],failures:[]};
const save=()=>writeFile('docs/esp32-acceptance/'+group+'.json',JSON.stringify(report,null,2));
const patterns={blink:/LED OFF/,button:/BUTTON=0/,echo:/AUDIT_UART/,counter:/COUNT=37 RAM=37\/77 ms=/,format:/HEX=DEADBEEF\r\nBIN=101010\r\nSIGNED=-2147483648\r\nCHAR=A\r\nOK/,multifile:/MULTI LOW/,
 'sensor-scan':/I2C 0x44/,'sensor-sht31':/TEMP x100=2500 HUM x100=5000/,'sensor-bh1750':/LUX=120/,'sensor-mpu6050':/WHO=68/,'sensor-oled':/OLED FRAME DONE/,'sensor-adc':/ADC=512 mV=1650/,'sensor-ir':/OBSTACLE=0/,'sensor-bmp280':/BMP TEMP x100=2500/,'sensor-eeprom':/EEPROM=37\/77/,'sensor-onewire':/DS TEMP x100=2500/,'sensor-analog':/CH0=232/,'sensor-relay':/RELAY=1/,sht31:/TEMP x100=2500 HUM x100=5000/,adc:/ADC=512 mV=1650/};
function until(r,pattern,max){let output='',instructions=0;const start=performance.now();while(instructions<max&&!pattern.test(output)){output=(output+r.step(10000)).slice(-4000);instructions+=10000;if(performance.now()-start>240000)throw Error('Native case exceeded 240s '+output);}assert.match(output,pattern);return{output,instructions};}
async function roundtrip(p,payload,format){p.firmware={format,board:p.components.find(c=>c.type==='board').params.model,payload,source:p.code,sourceKey:sourceKey(p)};const q=(await importProjectBytes(exportProjectZip(p))).project;assert.equal(sourceKey(q),sourceKey(p));assert.equal(q.firmware.payload,payload);assert.ok(firmwareMatches(q));}
for(const board of boards){
 for(const language of ['arduino','c'])for(const e of unifiedExamples(createUnifiedProject({board,language}))){
  let r;const key=board+':'+language+':'+e.id,start=performance.now();
  try{const p=validateProject(unifiedExampleProject(board,language,e.id)),b=await compileESP(module,p.code,board,p.files||[],language);
   validateESPImage(b.image,board);r=new ESPRuntime(b.image,{chip:board});r.attachCircuit(p);if(e.id==='echo')r.queueSerial('AUDIT_UART\r\n');
   const result=until(r,patterns[e.id],Math.ceil(80000000*ESP_BOARDS[board].hz/160000000));
   if(e.id==='sensor-scan')assert.ok(result.output.includes('I2C 0x23'));
   const snapshot=r.circuit.snapshot();if(e.id==='sensor-oled'){assert.ok(snapshot.devices.sensor1.on);assert.ok(snapshot.devices.sensor1.frame.some(v=>v));}
   if(e.id==='sensor-relay')assert.ok(Object.values(snapshot.contacts).some(v=>v.energized));
   if(e.id==='blink')assert.match(result.output,/LED ON/);if(e.id==='multifile')assert.match(result.output,/MULTI HIGH/);
   if(e.id==='button'){p.components.find(c=>c.type==='button').params.pressed=true;r.circuit.update(p);until(r,/BUTTON=1/,5000000);assert.ok(r.circuit.snapshot().leds.led1.current>.005);}
   await roundtrip(p,Buffer.from(b.image).toString('base64'),'esp-bin');
   r.reset();assert.equal(r.snapshot().cycles,0);
   report.cases.push({board,language,example:e.id,status:'passed',sourceSha256:hash(Buffer.from(sourceKey(p))),imageSha256:hash(b.image),flashBytes:b.image.length,staticRamBytes:b.staticRamBytes,...result,elapsedMs:Math.round(performance.now()-start),zip:true,reset:true});
   console.log('PASS',key,result.instructions,Math.round(performance.now()-start)+'ms');
  }catch(error){report.cases.push({board,language,example:e.id,status:'failed',error:error.message});report.failures.push(key+': '+error.message);console.log('FAIL',key,error.message);}
  finally{r?.dispose();await save();}
 }
 // Execute the actual infinite application source, bounded only by a JS await rejection.
 for(const e of unifiedExamples(createUnifiedProject({board,language:'micropython'}))){
  const key=board+':micropython:'+e.id;let mp;try{
   const p=validateProject(unifiedExampleProject(board,'micropython',e.id)),runtime=new PythonCircuit(board,p);let output='',sleeps=0,sawHigh=false,sawLow=false;
   mp=await loadMicroPython({wasmBinary:await readFile('dist/micropython/micropython.wasm'),stdout:s=>output+=s+'\n',stderr:()=>{}});
   mp.FS.writeFile('machine.py',machineSource+'\n'+Object.entries(runtime.board.aliases||{}).map(([k,v])=>k+'='+v).join('\n'));
   mp.registerJsModule('_cf',{configure:(...a)=>runtime.configure(...a),write:(...a)=>runtime.write(...a),read:(...a)=>runtime.read(...a),delay_us:n=>runtime.advance(n)});
   mp.registerJsModule('js',{cf:{sleep:async ms=>{
    const led=runtime.circuit.snapshot().leds.led1;if(led){sawHigh ||= led.current>.005;sawLow ||= led.current===0;}
    if(++sleeps===4)throw Error('AUDIT_COMPLETED');
    runtime.advance(ms*1000);
    if(e.id==='sht31'&&sleeps===2){p.components.find(c=>c.type==='sht31').params.temperature=37;runtime.circuit.update(p);}
   }}});
   mp.globals.set('_source',p.code);await mp.runPythonAsync('compile(_source,"main.py","exec")');
   await assert.rejects(mp.runPythonAsync(p.code));
   if(e.id==='blink'){assert.match(output,/Python LED ON/);assert.match(output,/Python LED OFF/);assert.ok(sawHigh&&sawLow);}else{assert.match(output,/TEMP= 25/);assert.match(output,/TEMP= 37/);assert.ok(!output.includes('NO ACK')&&!output.includes('CRC ERROR'));
    p.wires=p.wires.filter(w=>!w.to.endsWith(':VIN'));runtime.circuit.update(p);assert.throws(()=>mp.runPython('i2c.writeto(0x44,bytes([0x24,0]))'));}
   await roundtrip(p,p.code,'micropython');report.cases.push({board,language:'micropython',example:e.id,status:'passed',sourceSha256:hash(Buffer.from(sourceKey(p))),output,zip:true,boundedAtAwait:true});console.log('PASS',key);
  }catch(error){report.cases.push({board,language:'micropython',example:e.id,status:'failed',error:error.message});report.failures.push(key+': '+error.message);console.log('FAIL',key,error.message);}finally{await save();}
 }
 // Every physical header also gets independent Python SPI and powered-network checks.
 try{const p=unifiedExampleProject(board,'arduino','sensor-adc'),runtime=new PythonCircuit(board,p),mp=await loadMicroPython({wasmBinary:await readFile('dist/micropython/micropython.wasm'),stdout:()=>{}});mp.FS.writeFile('machine.py',machineSource);mp.registerJsModule('_cf',{configure:(...a)=>runtime.configure(...a),write:(...a)=>runtime.write(...a),read:(...a)=>runtime.read(...a),delay_us:n=>runtime.advance(n)});
  const pin=n=>examplePin(board,n);mp.runPython(`from machine import Pin, SoftSPI\nspi=SoftSPI(sck=Pin(${pin(4)}),mosi=Pin(${pin(5)}),miso=Pin(${pin(6)}),baudrate=20000)\ncs=Pin(${pin(7)},Pin.OUT,value=1)\ndef sample():\n cs(0)\n b=bytearray(3)\n spi.write_readinto(bytes([1,128,0]),b)\n cs(1)\n return ((b[1]&3)<<8)|b[2]\nraw=sample()`);assert.equal(mp.globals.get('raw'),512);p.components.find(c=>c.type==='pot').params.value=75;runtime.circuit.update(p);mp.runPython('raw=sample()');assert.equal(mp.globals.get('raw'),768);
  report.checks.push({board,check:'python-spi-live',status:'passed',values:[512,768]});
 }catch(error){report.failures.push(board+':python-spi-live '+error.message);report.checks.push({board,check:'python-spi-live',status:'failed',error:error.message});}
 const p=validateProject(createUnifiedProject({board,language:'micropython'})),n=buildNets(p);for(const c of p.components.filter(c=>c.mount))for(const [pin,hole]of Object.entries(c.mount.pins))assert.ok(n.same(c.id+':'+pin,c.mount.boardId+':'+hole));report.checks.push({board,check:'mounted-breadboard-nets',status:'passed'});await save();
}
console.log('COMPLETE',group,'cases',report.cases.length,'failures',report.failures.length);if(report.failures.length)process.exitCode=1;
