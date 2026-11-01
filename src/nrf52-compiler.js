import {TINYUSB_FILES} from '../dist/nrf52-tinyusb-sources.js';
import {TINYUSB_CONFIG,TINYUSB_DCD_HEADER,TINYUSB_DCD_C,TINYUSB_C_FILES} from '../dist/nrf52-tinyusb-sdk.js';
import {File,Directory} from '@bjorn3/browser_wasi_shim';
import {runESPTool} from './esp-compiler.js';
import {normalizeFiles} from '../dist/source-files.js';
import {nrfHeaders,nrfRuntimeC} from '../dist/nrf52-sdk.js';
import {readDebugELF} from '../dist/nrf52-debug-info.js';
import {NRF52_BOARDS} from '../dist/nrf52-boards.js';
import {packNRF52Image} from '../dist/nrf52-image.js';
export async function compileNRF52(module,source,board='nrf52840-supermini',extras=[],language='c'){
 if(!NRF52_BOARDS[board]||language!=='c')throw Error('nRF52840 yalnız C17 / main.c destekler.');
 const TIVA_HEADERS=nrfHeaders(NRF52_BOARDS[board]),tivaRuntimeC=nrfRuntimeC;const sources=normalizeFiles([{name:'main.c',content:source},...extras],{language:'c'});
 for(const f of sources)if(Object.hasOwn(TIVA_HEADERS,f.name)||['cf_nrf_runtime.c','link.ld'].includes(f.name))throw Error('nRF52840 SDK dosya adı ayrılmıştır: '+f.name);
 const tiny=sources.some(f=>/^\s*#\s*include\s*[<"](?:tusb\.h|wirevo_usb_dcd\.h)[>"]/m.test(f.content));
 const files=new Map(sources.map(f=>[f.name,f.content]));for(const[n,s]of Object.entries(TIVA_HEADERS))files.set(n,s);files.set('cf_nrf_runtime.c',tivaRuntimeC);
 if(tiny){for(const n of ['tusb_config.h','wirevo_usb_dcd.h','wirevo_usb_dcd.c','string.h','assert.h','inttypes.h'])if(sources.some(f=>f.name===n))throw Error('TinyUSB sabit tarayıcı portu dosyası ayrılmıştır: '+n);files.set('stddef.h',files.get('stddef.h')+'\n#define offsetof(t,m) __builtin_offsetof(t,m)\n');files.set('inttypes.h','#pragma once\n#include <stdint.h>\n#define PRIu32 "u"\n#define PRIx32 "x"\n');files.set('stdint.h',files.get('stdint.h')+'\ntypedef unsigned int uintptr_t;typedef int intptr_t;\n#define UINT8_MAX 255\n#define UINT16_MAX 65535\n#define UINT32_MAX 4294967295u\n');for(const [n,c] of Object.entries(TINYUSB_FILES)){if(files.has(n))throw Error('TinyUSB kaynak adı ayrılmıştır: '+n);files.set(n,c);}files.set('tusb_config.h',TINYUSB_CONFIG);files.set('wirevo_usb_dcd.h',TINYUSB_DCD_HEADER);files.set('wirevo_usb_dcd.c',TINYUSB_DCD_C);files.set('string.h','#pragma once\n#include <stddef.h>\nvoid *memcpy(void*,const void*,size_t);void *memset(void*,int,size_t);void *memmove(void*,const void*,size_t);int memcmp(const void*,const void*,size_t);size_t strlen(const char*);\n');files.set('assert.h','#pragma once\n#define assert(x) ((void)0)\n');}

 files.set('link.ld',`ENTRY(Reset_Handler)
MEMORY { FLASH (rx) : ORIGIN = 0, LENGTH = 1024K RAM (rw) : ORIGIN = 0x20000000, LENGTH = 256K }
_estack = ORIGIN(RAM)+LENGTH(RAM);
SECTIONS { .vectors : { KEEP(*(.vectors)) } > FLASH .text : { *(.text*) *(.rodata*) } > FLASH .ARM.exidx : { *(.ARM.exidx*) } > FLASH .data : { _sdata = .; *(.data*) _edata = .; } > RAM AT> FLASH _sidata = LOADADDR(.data); .bss (NOLOAD) : { _sbss = .; *(.bss*) *(COMMON) _ebss = .; } > RAM ASSERT(_ebss <= _estack-2048,"nRF52840 SRAM: 2 KiB stack rezervi gerekli") /DISCARD/ : { *(.comment*) *(.eh_frame*) } }`);
 const root=new Map();for(const[path,s]of files){let node=root;const parts=path.split('/');for(const part of parts.slice(0,-1)){if(!node.has(part))node.set(part,new Map());if(!(node.get(part) instanceof Map))throw Error('Kaynak yol çakışması.');node=node.get(part);}if(node.get(parts.at(-1)) instanceof Map)throw Error('Kaynak yol çakışması.');node.set(parts.at(-1),new File(new TextEncoder().encode(s)));}
 const dirs=m=>new Map([...m].map(([k,v])=>[k,v instanceof Map?new Directory(dirs(v)):v])),entries=dirs(root),objects=[];let log=(tiny?'Gerçek TinyUSB 0.18.0 / boot HID keyboard / Wirevo virtual DCD; no Nordic USBD/RADIO\n':'')+'nRF52840 C17 / 64 MHz / 1 MiB flash / 256 KiB SRAM; Nordic register headers; bounded peripherals\n';
 for(const f of [...sources.filter(f=>f.name.endsWith('.c')),{name:'cf_nrf_runtime.c'},...(tiny?[...TINYUSB_C_FILES,'wirevo_usb_dcd.c'].map(name=>({name})):[])]){const o='unit'+objects.length+'.o';log+=await runESPTool(module,entries,['clang','--target=arm-none-eabi','-mcpu=cortex-m4','-mthumb','-mfpu=fpv4-sp-d16','-mfloat-abi=hard','-std=c17','-ffreestanding','-nostdinc','-I.','-O0','-g','-gdwarf-4','-fno-omit-frame-pointer','-fno-inline','-fno-builtin','-ffunction-sections','-fdata-sections','-Werror=implicit-function-declaration','-c',f.name,'-o',o]);objects.push(o);}
 log+=await runESPTool(module,entries,['ld.lld','--threads=1','--gc-sections','-T','link.ld',...objects,'-o','firmware.elf']);
 const elf=entries.get('firmware.elf').data,v=new DataView(elf.buffer,elf.byteOffset,elf.byteLength),segments=[];let end=0,staticRamBytes=0;
 for(let i=0;i<v.getUint16(44,true);i++){const h=v.getUint32(28,true)+i*v.getUint16(42,true);if(v.getUint32(h,true)!==1)continue;const p=v.getUint32(h+12,true),a=v.getUint32(h+8,true),n=v.getUint32(h+16,true),mem=v.getUint32(h+20,true),o=v.getUint32(h+4,true);if(a>=0x20000000)staticRamBytes=Math.max(staticRamBytes,a+mem-0x20000000);if(n){if(p+n>1048576)throw Error('nRF52840 Flash segmenti geçersiz.');segments.push({p,n,o});end=Math.max(end,p+n);}}
 const bytes=new Uint8Array(end);for(const s of segments)bytes.set(elf.subarray(s.o,s.o+s.n),s.p);return{image:packNRF52Image(bytes,board),elf,debugInfo:readDebugELF(elf,sources.map(f=>f.name)),flashBytes:bytes.length,staticRamBytes,log};
}
