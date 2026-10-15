// Compiler/linker gate only. No STM32 CPU or GPIO simulation is claimed here.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {File} from '@bjorn3/browser_wasi_shim';
import {runESPTool,ESP_CLANG_SHA256} from '../../src/esp-compiler.js';
const bytes=gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz'));
const hash=b=>createHash('sha256').update(b).digest('hex');assert.equal(hash(bytes),ESP_CLANG_SHA256);
const module=await WebAssembly.compile(bytes),enc=new TextEncoder(),file=s=>new File(enc.encode(s));
const report={scope:'compiler/linker only; runtime unverified',compilerSha256:hash(bytes),objects:[]};
for(const cpu of ['cortex-m3','cortex-m4']){
 const files=new Map([['main.c',file('volatile unsigned x;int main(void){x=42;return x;}')]]);
 await runESPTool(module,files,['clang','--target=arm-none-eabi','-mcpu='+cpu,'-mthumb','-ffreestanding','-nostdinc','-Os','-c','main.c','-o','main.o']);
 const b=files.get('main.o').data;assert.equal(new DataView(b.buffer,b.byteOffset,b.byteLength).getUint16(18,true),40);
 report.objects.push({cpu,machine:40,bytes:b.length,sha256:hash(b)});
}
const startup='.syntax unified\n.thumb\n.section .vectors,"a",%progbits\n.word 0x20005000\n.word Reset_Handler\n.section .text\n.global Reset_Handler\n.thumb_func\nReset_Handler:\n bl main\n1: b 1b\n';
const linker='ENTRY(Reset_Handler)\nMEMORY { FLASH (rx) : ORIGIN = 0x08000000, LENGTH = 64K RAM (rw) : ORIGIN = 0x20000000, LENGTH = 20K }\nSECTIONS { .vectors : { KEEP(*(.vectors)) } > FLASH .text : { *(.text*) *(.rodata*) } > FLASH .ARM.exidx : { *(.ARM.exidx*) } > FLASH .data : { *(.data*) } > RAM AT> FLASH .bss : { *(.bss*) *(COMMON) } > RAM }';
const gpio='volatile unsigned *const RCC=(void*)0x40021018;volatile unsigned *const CRH=(void*)0x40011004;volatile unsigned *const BSRR=(void*)0x40011010;int main(void){*RCC|=16;*CRH=(*CRH&~(15u<<20))|(2u<<20);*BSRR=1u<<13;*BSRR=1u<<29;for(;;){}}';
async function link(source){const files=new Map([['main.c',file(source)],['start.S',file(startup)],['link.ld',file(linker)]]);
 for(const name of ['main.c','start.S'])await runESPTool(module,files,['clang','--target=arm-none-eabi','-mcpu=cortex-m3','-mthumb','-ffreestanding','-nostdinc','-Os',...(name.endsWith('.S')?['-x','assembler']:[]),'-c',name,'-o',name+'.o']);
 await runESPTool(module,files,['ld.lld','--threads=1','-T','link.ld','start.S.o','main.c.o','-o','gate.elf']);return files.get('gate.elf').data;
}
const elf=await link(gpio),view=new DataView(elf.buffer,elf.byteOffset,elf.byteLength);assert.equal(view.getUint16(18,true),40);
let vector;for(let i=0;i<view.getUint16(44,true);i++){const h=view.getUint32(28,true)+i*view.getUint16(42,true);if(view.getUint32(h,true)!==1)continue;const a=view.getUint32(h+8,true),n=view.getUint32(h+20,true);assert.ok(a>=0x08000000&&a+n<=0x08010000||a>=0x20000000&&a+n<=0x20005000);if(a===0x08000000){const o=view.getUint32(h+4,true);vector={initialSP:view.getUint32(o,true),resetVector:view.getUint32(o+4,true)};}}
assert.equal(vector.initialSP,0x20005000);assert.ok(vector.resetVector&1);assert.equal(view.getUint32(24,true),vector.resetVector);
await assert.rejects(link('volatile unsigned char ram[21000];int main(void){ram[20999]=37;return ram[0];}'),/RAM|overflow|will not fit/);
await assert.rejects(link('volatile const unsigned char flash[70000]={1};int main(void){return flash[69999];}'),/FLASH|overflow|will not fit/);
report.f103c8={flashBytes:65536,ramBytes:20480,machine:40,entry:view.getUint32(24,true),...vector,elfSha256:hash(elf),ramOverflowRejected:true,flashOverflowRejected:true};
await mkdir('.sites-runtime/stm32',{recursive:true});await writeFile('.sites-runtime/stm32/gate.elf',elf);
await writeFile('docs/stm32-toolchain-gate.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
