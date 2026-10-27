import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {bootromB1,bootrom_rp2350_A2} from 'rp2350js/bootroms';
import {NativePicoSDK} from '../dist/pico-sdk-native.js';
import {nativeSDKImage} from '../dist/pico-sdk-image.js';
import {writeUF2} from '../dist/pico-flash.js';
import {PICO_BOARDS} from '../dist/pico-boards.js';
import {createPicoProject} from '../dist/pico-project.js';
import {validateProject} from '../dist/core.js';
import {encodeBytes} from '../dist/unified-project.js';
import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
const fixture=name=>readFileSync(new URL('./fixtures/pico093/'+name,import.meta.url)),meta=JSON.parse(fixture('provenance.json'));
for(const[id,b]of Object.entries(PICO_BOARDS))test(id+' new full CMake / official SDK firmware boots through original ROM and drives circuit from core1',async()=>{
 const image=fixture(b.mcu+'.bin');assert.equal(createHash('sha256').update(image).digest('hex'),meta[b.mcu].sha256);
 const uf2=writeUF2(image,id),parsed=nativeSDKImage(uf2,id);assert.deepEqual(parsed.subarray(0,image.length),new Uint8Array(image));
 const p=createPicoProject({board:id});p.code=fixture('main.c').toString();p.files=[{name:'CMakeLists.txt',content:fixture('CMakeLists.txt').toString()}];p.firmware={format:'pico-sdk-bin',board:id,source:p.code,payload:encodeBytes(parsed),imported:true};
 const q=(await importProjectBytes(exportProjectZip(validateProject(p)))).project;assert.equal(q.firmware.format,'pico-sdk-bin');
 const rom=new Uint8Array((b.mcu==='RP2350'?bootrom_rp2350_A2:bootromB1).buffer),r=new NativePicoSDK(id,rom,parsed,q);try{let serial='';for(let i=0;i<1200&&!serial.includes('SDK_NATIVE_PASS 73');i++)serial+=r.step(10000);assert.match(serial,/SDK_NATIVE_PASS 73/,'PC '+r.core.PC.toString(16)+' '+serial);assert.ok(r.rp.core[1].cycles>10000);assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);assert.equal(r.picoSnapshot().execution,'pico-sdk-native');assert.equal(r.stage,'running');}finally{r.dispose();}
});
test('new native SDK UF2 rejects the wrong chip family and truncated/overlapping data',()=>{const b=fixture('RP2040.bin'),uf2=writeUF2(b,'pico');assert.throws(()=>nativeSDKImage(uf2,'pico-2'),/ailesi/);assert.throws(()=>nativeSDKImage(uf2.subarray(0,-512),'pico'),/eksik/);const bad=uf2.slice();new DataView(bad.buffer).setUint32(12,0x20000000,true);assert.throws(()=>nativeSDKImage(bad,'pico'),/adres/);});
