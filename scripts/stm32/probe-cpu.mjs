import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const elf=await readFile('.sites-runtime/stm32/gate.elf'),v=new DataView(elf.buffer,elf.byteOffset,elf.byteLength),image=new Uint8Array(65536);
for(let i=0;i<v.getUint16(44,true);i++){const h=v.getUint32(28,true)+i*v.getUint16(42,true);if(v.getUint32(h,true)!==1)continue;const a=v.getUint32(h+12,true),size=v.getUint32(h+16,true),o=v.getUint32(h+4,true);if(size&&a>=0x08000000&&a+size<=0x08010000)image.set(elf.subarray(o,o+size),a-0x08000000);}
const writes=[],regs=new Map();let cycles=0;
const {instance:{exports:e}}=await WebAssembly.instantiate(await readFile('dist/stm32/cortex-m3.wasm'),{cf:{clock:n=>cycles=n,mmio_read:a=>regs.get(a)||0,mmio_write:(a,v,size)=>{writes.push({a,v,size,cycles});regs.set(a,v);}}});
const p=e.allocate(image.length);new Uint8Array(e.memory.buffer,p,image.length).set(image);const cpu=e.create(p,image.length,65536,20480);e.deallocate(p,image.length);assert.ok(cpu);e.step(cpu,1000);
assert.equal(e.register(cpu,13),0x20005000);assert.ok(writes.some(w=>w.a===0x40021018&&w.v===16));assert.ok(writes.some(w=>w.a===0x40011010&&w.v===8192));assert.ok(writes.some(w=>w.a===0x40011010&&w.v===536870912));e.destroy(cpu);console.log({realARM:true,cycles,writes});
