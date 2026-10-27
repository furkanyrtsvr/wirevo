import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{bootromB1,bootrom_rp2350_A2}from'rp2350js/bootroms';import{NativePicoPython}from'../dist/pico-native-python.js';import{PICO_BOARDS}from'../dist/pico-boards.js';import{PICO_NATIVE_FIRMWARE}from'../dist/pico-native-firmware.js';import{createPicoProject}from'../dist/pico-project.js';import{sourceKey}from'../dist/source-files.js';import{exportProjectZip,importProjectBytes}from'../dist/project-import.js';
const code=`import _thread,time,helper
from machine import Pin
led=Pin(15,Pin.OUT)
gate=_thread.allocate_lock()
shared=[0,False,0]
def second():
 for i in range(10):
  with gate: shared[0]+=1
  time.sleep_ms(1)
 led.on()
 with gate:
  shared[2]=_thread.get_ident()
  shared[1]=True
def run_pair():
 shared[1]=False
 _thread.start_new_thread(second,())
 for i in range(10):
  with gate:shared[0]+=1
  time.sleep_ms(1)
 while not shared[1]:time.sleep_ms(1)
 time.sleep_ms(10)
run_pair()
run_pair()
print('NATIVE_PASS',_thread.get_ident(),shared[2],shared[0],helper.answer)
while True:time.sleep_ms(20)
`;
for(const[id,b]of Object.entries(PICO_BOARDS))test(id+' new upstream RP2 native interpreter uses real core1, shared globals/locks and native files',()=>{const p=createPicoProject({board:id,language:'micropython',pythonEngine:'rp2-native'}),rom=new Uint8Array((b.mcu==='RP2350'?bootrom_rp2350_A2:bootromB1).buffer),fw=readFileSync(new URL('../dist/pico-native-fw/'+PICO_NATIVE_FIRMWARE[b.mcu].file,import.meta.url)),r=new NativePicoPython(id,rom,fw,p,code,[{name:'helper.py',content:'answer=42\n'}]);try{let serial='';for(let i=0;i<3000&&!serial.includes('NATIVE_PASS 1 2 40 42');i++)serial+=r.step(10000);assert.match(serial,/NATIVE_PASS 1 2 40 42/,'PCs '+r.core.PC.toString(16)+' / '+r.rp.core[1].PC.toString(16)+' '+serial.slice(-800));assert.equal(r.nativePython,true);assert.equal(r.picoSnapshot().execution,'micropython-rp2-native');assert.ok(r.power.resets[1]>=2);assert.ok(r.rp.core[1].cycles>100000);assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);assert.ok(r.nor.stats.pages>0,'helper.py was written through native flash');if(b.mcu==='RP2350')assert.ok(r.coprocessor.instructions>0);assert.doesNotMatch(serial,/Traceback|Unhandled exception/);}finally{r.dispose();}});
test('new native engine survives project ZIP and has a distinct cache key',async()=>{const p=createPicoProject({board:'pico-2-w',language:'micropython',starter:'thread093'});assert.equal(p.settings.picoPythonEngine,'rp2-native');const native=sourceKey(p),q=(await importProjectBytes(exportProjectZip(p))).project;assert.equal(q.settings.picoPythonEngine,'rp2-native');q.settings.picoPythonEngine='wasm';assert.notEqual(sourceKey(q),native);});
for(const id of ['pico','pico-2'])test(id+' new direct module-level _thread starter retains module globals',()=>{const p=createPicoProject({board:id,language:'micropython',starter:'thread093'}),b=PICO_BOARDS[id],rom=new Uint8Array((b.mcu==='RP2350'?bootrom_rp2350_A2:bootromB1).buffer),fw=readFileSync(new URL('../dist/pico-native-fw/'+PICO_NATIVE_FIRMWARE[b.mcu].file,import.meta.url)),r=new NativePicoPython(id,rom,fw,p,p.code);try{let out='';for(let i=0;i<3000&&!out.includes('ortak sayac: 20');i++)out+=r.step(10000);assert.match(out,/ortak sayac: 20/);assert.doesNotMatch(out,/NameError|Traceback|Unhandled exception/);assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);}finally{r.dispose();}});
