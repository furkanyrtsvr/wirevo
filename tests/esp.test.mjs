import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {ESP_BOARDS,ESP_EXAMPLES,validateESPImage} from '../dist/esp-boards.js';
import {ESPRuntime} from '../dist/esp-runtime.js';
import {ESP_TARGETS,elfToESPImage,ESP_CLANG_SHA256} from '../src/esp-compiler.js';
const fixtures=JSON.parse(await readFile(new URL('./fixtures/esp-projects.json',import.meta.url)));
await ESPRuntime.initialize(await readFile(new URL('../dist/esp32/pkg/esp_emu_bg.wasm',import.meta.url)));
for(const chip of ['esp32c3','esp32c6','esp32s3'])for(const example of ESP_EXAMPLES)test(chip+' real CPU / '+example.id,()=>{
 const f=fixtures[chip+':'+example.id];assert.equal(f.source,example.code);const image=Buffer.from(f.bin,'base64');assert.equal(image.length,f.flashBytes);validateESPImage(image,chip);
 const runtime=new ESPRuntime(image,{chip,inputs:{3:false}});try{if(example.id==='echo')runtime.queueSerial('REAL_UART\r\n');let serial='',high=false,low=false;
 for(let i=0;i<110;i++){serial+=runtime.step(100000);const pin=runtime.snapshot().pins.find(p=>p.pin===2);if(pin.output){high ||= pin.high;low ||= !pin.high;}}
 if(example.id==='blink'){assert.ok(high&&low);assert.match(serial,/LED ON/);assert.match(serial,/LED OFF/);}
 if(example.id==='button'){assert.ok(high);assert.match(serial,/BUTTON=1/);runtime.setInput(3,true);let released='';for(let i=0;i<50;i++)released+=runtime.step(100000);assert.match(released,/BUTTON=0/);assert.equal(runtime.snapshot().pins.find(p=>p.pin===2).high,false);}
 if(example.id==='echo')assert.match(serial,/REAL_UART\r\n/);
 if(example.id==='counter'){assert.match(serial,/COUNT=37 RAM=37\/77 ms=/);assert.ok(f.staticRamBytes>=2052);}
 if(example.id==='format')assert.match(serial,/HEX=DEADBEEF\r\nBIN=101010\r\nSIGNED=-2147483648\r\nCHAR=A\r\nOK\r\n/);
 if(example.id==='multifile'){assert.ok(high&&low);assert.match(serial,/MULTI HIGH/);assert.match(serial,/MULTI LOW/);assert.deepEqual(f.files,example.files);}
 const first=runtime.snapshot();assert.ok(first.cycles>0);assert.ok(first.registers.length>=16);assert.equal(first.hz,ESP_BOARDS[chip].hz);runtime.reset();assert.equal(runtime.snapshot().cycles,0);assert.equal(runtime.snapshot().pins.find(p=>p.pin===3).high,example.id==='button');
 }finally{runtime.dispose();}
});
test('ESP image validation rejects cross-chip, checksum, segment and size corruption',()=>{
 const original=Buffer.from(fixtures['esp32c3:blink'].bin,'base64');assert.throws(()=>validateESPImage(original,'esp32c6'),/eşleşmiyor/);
 const changed=Buffer.from(original);changed[40]^=1;assert.throws(()=>validateESPImage(changed,'esp32c3'),/checksum/);
 assert.throws(()=>validateESPImage(original.subarray(0,30),'esp32c3'),/boyutu/);
 const bad=Buffer.from(original);bad.writeUInt32LE(0xffffffff,28);assert.throws(()=>validateESPImage(bad,'esp32c3'),/segment/);
 assert.throws(()=>validateESPImage(new Uint8Array(4*1024*1024+1),'esp32c3'),/boyutu/);
 assert.throws(()=>validateESPImage(original,'esp32'),/Geçersiz/);
});
test('ESP ROM boot merged image validates header at 0x1000',()=>{const b=Buffer.from(fixtures['esp32s3:blink'].bin,'base64'),merged=new Uint8Array(4096+b.length).fill(255);merged.set(b,4096);assert.equal(validateESPImage(merged,'esp32s3',{bootFromROM:true}).offset,4096);assert.throws(()=>validateESPImage(merged,'esp32s3'),/adresinden/);});
test('ESP GPIO inputs, message and memory bounds are board-aware',()=>{const runtime=new ESPRuntime(Buffer.from(fixtures['esp32s3:echo'].bin,'base64'),{chip:'esp32s3'});try{assert.throws(()=>runtime.setInput(22,false),/GPIO/);runtime.setInput(42,false);assert.equal(runtime.snapshot().pins.find(p=>p.pin===42).high,false);assert.throws(()=>runtime.queueSerial('x'.repeat(4097)),/4096/);assert.throws(()=>runtime.step(1000001),/Adım/);assert.throws(()=>runtime.readMemory(-1),/Bellek/);assert.throws(()=>runtime.readMemory(0,4097),/Bellek/);assert.equal(runtime.readMemory(0x40380000,32).length,32);}finally{runtime.dispose();}});
test('Pinned Clang binary and official emulator assets retain provenance',async()=>{const compressed=await readFile(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url));assert.ok(compressed.length<25*1024*1024);const wasm=gunzipSync(compressed);assert.equal(wasm.length,80735841);assert.equal(createHash('sha256').update(wasm).digest('hex'),ESP_CLANG_SHA256);assert.equal(wasm.readUInt32LE(0),0x6d736100);for(const chip of Object.keys(ESP_BOARDS)){const svg=await readFile(new URL('../dist/assets/'+ESP_BOARDS[chip].asset,import.meta.url),'utf8');assert.match(svg,/CC0/);assert.match(svg,/viewBox="0 0 [\d.]+ [\d.]+"/);const t=ESP_TARGETS[ESP_BOARDS[chip].target||chip];assert.ok((t.chip==='esp32c3'?t.text-0x700000:t.text)+65536<=t.data||t.xtensa);}});
test('ELF conversion fails closed on malformed targets and program tables',()=>{assert.throws(()=>elfToESPImage(new Uint8Array(50)),/ELF/);const fake=new Uint8Array(52),v=new DataView(fake.buffer);v.setUint32(0,0x464c457f,true);fake[4]=1;fake[5]=1;v.setUint16(18,243,true);v.setUint32(28,52,true);v.setUint16(42,32,true);v.setUint16(44,10,true);assert.throws(()=>elfToESPImage(fake),/tablosu/);assert.throws(()=>elfToESPImage(fake,ESP_TARGETS.esp32s3),/hedef/);});
test('ELF conversion bounds executable entry and every load region including S3 IRAM alias',()=>{for(const target of Object.values(ESP_TARGETS)){const raw=new Uint8Array(88),v=new DataView(raw.buffer);v.setUint32(0,0x464c457f,true);raw[4]=raw[5]=1;v.setUint16(18,target.xtensa?94:243,true);v.setUint32(24,target.text,true);v.setUint32(28,52,true);v.setUint16(42,32,true);v.setUint16(44,1,true);v.setUint32(52,1,true);v.setUint32(56,84,true);v.setUint32(60,target.text,true);v.setUint32(68,4,true);v.setUint32(72,4,true);v.setUint32(76,5,true);assert.equal(elfToESPImage(raw,target).entry,target.text);v.setUint32(60,target.text+(target.xtensa?32:64)*1024-2,true);assert.throws(()=>elfToESPImage(raw,target),/segment/);v.setUint32(60,target.text,true);v.setUint32(76,4,true);assert.throws(()=>elfToESPImage(raw,target),/giriş/);v.setUint32(76,5,true);v.setUint32(60,target.data,true);v.setUint32(24,target.data,true);assert.throws(()=>elfToESPImage(raw,target),/segment/);}});
