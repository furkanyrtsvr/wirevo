import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {compilePico} from '../src/pico-compiler.js';
import {PICO_BOARDS} from '../dist/pico-boards.js';
import {PicoRuntime} from '../dist/pico-runtime.js';
import {packPicoImage,validatePicoImage} from '../dist/pico-image.js';
import {readUF2,writeUF2} from '../dist/pico-flash.js';
const module=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
const source=`#include <pico/stdlib.h>
#include <hardware/flash.h>
#include <pico/bootrom.h>
volatile unsigned done;
int main(void){const volatile unsigned char*p=(const volatile unsigned char*)0x101ff000u;unsigned char page[256];if(p[0]==10){done=2;while(1){}}
flash_range_erase(0x1ff000,FLASH_SECTOR_SIZE);for(unsigned i=0;i<256;i++)page[i]=170;flash_range_program(0x1ff000,page,256);for(unsigned i=0;i<256;i++)page[i]=15;flash_range_program(0x1ff000,page,256);done=p[0]==10;reset_usb_boot(0,0);while(1){}}
`;
const built=new Map();
async function firmware(id){const key=PICO_BOARDS[id].mcu,base=key==='RP2350'?'pico-2':'pico';if(!built.has(key))built.set(key,compilePico(module,source,base));const f=await built.get(key);return{...f,image:packPicoImage(validatePicoImage(f.image,base),id)};}
function tiny(id,value=7){const raw=new Uint8Array(256).fill(255),v=new DataView(raw.buffer);v.setUint32(0,0x20000000+PICO_BOARDS[id].ram,true);v.setUint32(4,0x10000009,true);v.setUint16(8,0x2000|value,true);v.setUint16(10,0xe7fe,true);return raw;}
for(const id of Object.keys(PICO_BOARDS)){
 test(id+' native flash program 1→0, reset persistence and reset_usb_boot halts CPU',async()=>{const f=await firmware(id),r=new PicoRuntime(f.image,id);try{r.setDebugInfo(f.debugInfo);for(let i=0;i<300&&!r.flashService.bootsel;i++)r.step(1000);assert.equal(r.flashService.bootsel,true);assert.deepEqual([...r.flashState.slice(0x1ff000,0x1ff100)],Array(256).fill(10));const count=r.count;r.step(1000);assert.equal(r.count,count);r.reset();r.setDebugInfo(f.debugInfo);r.step(3000);const value=r.debugger.readVariable(f.debugInfo.variables.find(v=>v.name==='done')).value;assert.equal(value,2);assert.equal(r.flashState[0x1ff000],10);assert.throws(()=>r.flashService.erase(1,4096));assert.throws(()=>r.flashService.program(r.board.flashSize,new Uint8Array(256)));assert.throws(()=>r.flashService.write(0x5fffe200,99));}finally{r.dispose();}});
 test(id+' BOOTSEL UF2 replaces native code, clears stale debug, preserves other sectors',()=>{const raw=tiny(id),r=new PicoRuntime(packPicoImage(raw,id),id);try{r.flashService.program(r.board.flashSize-256,new Uint8Array(256).fill(42));const file=writeUF2(tiny(id,19),id);assert.throws(()=>r.flashService.loadUF2(file));r.flashService.bootsel=true;r.flashService.loadUF2(file);assert.equal(r.flashState.at(-1),42);assert.equal(r.debugger,null);r.step(3);assert.equal(r.registers()[0],19);r.reset();r.step(3);assert.equal(r.registers()[0],19);}finally{r.dispose();}});
 test(id+' UF2 malformed, wrong family, duplicate, missing and invalid vectors reject atomically',()=>{const raw=tiny(id),good=writeUF2(raw,id),r=new PicoRuntime(packPicoImage(raw,id),id);try{r.flashService.bootsel=true;const before=r.flashState.slice();const bad=[];bad.push(good.slice(0,-1));for(const[off,value]of[[0,0],[28,0],[12,0x20000000],[24,2],[16,512],[32,0],[36,0]]){const f=good.slice();new DataView(f.buffer).setUint32(off,value,true);bad.push(f);}const duplicate=new Uint8Array(1024);duplicate.set(good);duplicate.set(good,512);bad.push(duplicate);for(const f of bad){assert.throws(()=>r.flashService.loadUF2(f));assert.deepEqual(r.flashState,before);}const two=new Uint8Array(512).fill(255);two.set(raw);const multi=writeUF2(two,id),reverse=new Uint8Array(multi.length);reverse.set(multi.subarray(512),0);reverse.set(multi.subarray(0,512),512);assert.deepEqual(readUF2(reverse,id),two);}finally{r.dispose();}});
}
