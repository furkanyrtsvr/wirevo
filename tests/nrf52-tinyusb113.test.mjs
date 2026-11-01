import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compileNRF52} from '../src/nrf52-compiler.js';
import {NRF52Runtime} from '../dist/nrf52-runtime.js';
import {NRF52_BOARDS} from '../dist/nrf52-boards.js';
import {createNRF52Project} from '../dist/nrf52-project.js';
const module=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
await NRF52Runtime.initialize(readFileSync(new URL('../dist/nrf52-cpu.wasm',import.meta.url)));
const until=(r,fn,label)=>{for(let n=0;n<2000000&&!fn();n+=1000)r.step(1000);assert.ok(fn(),label+' '+JSON.stringify(r.usbDCD.snapshot()));};
test('113 browser port refuses a user configuration that it would otherwise silently overwrite',async()=>{
 const p=createNRF52Project({starter:'tinyusb'});p.files.push({name:'tusb_config.h',content:'#define CFG_TUD_HID 3'});
 await assert.rejects(()=>compileNRF52(module,p.code,'nrf52840-supermini',p.files),/tusb_config.h/);
});
for(const board of Object.keys(NRF52_BOARDS))test('113 actual TinyUSB core / HID C + electrical tact + callbacks: '+board,async()=>{
 const p=createNRF52Project({board,starter:'tinyusb'}),f=await compileNRF52(module,p.code,board,p.files),r=await new NRF52Runtime(f.image,board).load();r.attachCircuit(p);r.setDebugInfo(f.debugInfo);
 const variable=n=>r.debugger.readVariable(f.debugInfo.variables.find(v=>v.name===n)).value;
 const host=(action,extra={})=>r.keyboard.host({transport:'usb',action,...extra});
 const key=(id,pressed)=>{p.components.find(c=>c.id===id).params.pressed=pressed;r.circuit.update(p);};
 try{
  until(r,()=>r.usbDCD.enabled,'DCD initialized by actual tusb_init');host('connect');until(r,()=>r.usbDCD.configured,'real control enumeration');r.step(30000);
  assert.equal(variable('mounts'),1);const d=r.usbDCD.descriptors;
  assert.equal(d.GET_DEVICE_DESCRIPTOR.length,18);assert.deepEqual(d.GET_DEVICE_DESCRIPTOR.slice(8,12),[0xfe,0xca,0x13,0x40]);
  assert.equal(d.GET_CONFIGURATION_DESCRIPTOR.length,34);assert.equal(d.GET_HID_REPORT_DESCRIPTOR.length,65);
  key('keyA',true);until(r,()=>r.keyboard.usb.text==='a','actual HID interrupt IN');const count=r.keyboard.usb.reports;r.step(50000);assert.equal(r.keyboard.usb.reports,count,'held key does not flood endpoint');
  key('keyA',false);until(r,()=>r.keyboard.usb.report.every(x=>x===0),'release packet');
  key('keyShift',true);key('keyB',true);until(r,()=>r.keyboard.usb.text==='aB','shift+B');key('keyShift',false);key('keyB',false);until(r,()=>r.keyboard.usb.report.every(x=>x===0),'modifier release');
  host('leds',{value:2});until(r,()=>variable('usb_leds')===2,'SET_REPORT C callback');assert.equal(r.keyboard.usb.leds,2);r.step(10000);assert.equal(r.pinStates()[r.board.ledPin].high,!r.board.ledChannels[0].activeLow);
  host('protocol',{value:0});host('get-protocol');host('idle',{value:13});host('get-idle');host('get-report');until(r,()=>!r.usbDCD.ctrl&&!r.usbDCD.queue.length,'class control transfers');
  assert.equal(variable('protocol_changes'),1);assert.deepEqual(d.GET_PROTOCOL,[0]);assert.deepEqual(d.GET_IDLE,[13]);assert.deepEqual(d.GET_REPORT,Array(8).fill(0));
  host('suspend');assert.throws(()=>host('leds',{value:0}),/resume/);until(r,()=>variable('suspends')===1,'suspend C callback');const before=r.keyboard.usb.reports;key('keyA',true);r.step(30000);assert.equal(r.keyboard.usb.reports,before);host('resume');until(r,()=>variable('resumes')===1&&r.keyboard.usb.report[2]===4,'resume held key');
  host('disconnect');until(r,()=>variable('unmounts')===1,'unplug callback');assert.equal(r.keyboard.usb.connected,false);host('connect');until(r,()=>r.usbDCD.configured&&variable('mounts')===2,'re-enumeration');
  r.reset();assert.equal(r.usbDCD.enabled,false);assert.equal(r.keyboard.usb.connected,false);
 }finally{r.dispose();}
});
