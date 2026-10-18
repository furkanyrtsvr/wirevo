import {File,Directory} from '@bjorn3/browser_wasi_shim';
import {runESPTool} from './esp-compiler.js';
import {normalizeFiles} from '../dist/source-files.js';
import {TIVA_HEADERS,tivaRuntimeC,tivaLibraries} from '../dist/tiva-sdk.js';
import {packTivaImage} from '../dist/tiva-image.js';
export async function compileTiva(module,source,board='ek-tm4c123gxl',extras=[],language='c'){
 if(board!=='ek-tm4c123gxl'||language!=='c')throw Error('Tiva LaunchPad yalnız C17 / main.c destekler.');
 const sources=normalizeFiles([{name:'main.c',content:source},...extras],{language:'c'});
 for(const f of sources)if(Object.hasOwn(TIVA_HEADERS,f.name)||['cf_tiva_runtime.c','link.ld'].includes(f.name))throw Error('Tiva SDK dosya adı ayrılmıştır: '+f.name);
 const files=new Map(sources.map(f=>[f.name,f.content]));for(const[n,s]of Object.entries(TIVA_HEADERS))files.set(n,s);files.set('cf_tiva_runtime.c',tivaRuntimeC);
 files.set('link.ld',`ENTRY(Reset_Handler)
MEMORY { FLASH (rx) : ORIGIN = 0, LENGTH = 256K RAM (rw) : ORIGIN = 0x20000000, LENGTH = 32K }
_estack = ORIGIN(RAM)+LENGTH(RAM);
SECTIONS { .vectors : { KEEP(*(.vectors)) } > FLASH .text : { *(.text*) *(.rodata*) } > FLASH .ARM.exidx : { *(.ARM.exidx*) } > FLASH .data : { _sdata = .; *(.data*) _edata = .; } > RAM AT> FLASH _sidata = LOADADDR(.data); .bss (NOLOAD) : { _sbss = .; *(.bss*) *(COMMON) _ebss = .; } > RAM ASSERT(_ebss <= _estack-2048,"Tiva SRAM: 2 KiB stack rezervi gerekli") /DISCARD/ : { *(.comment*) *(.eh_frame*) } }`);
 const root=new Map();for(const[path,s]of files){let node=root;const parts=path.split('/');for(const part of parts.slice(0,-1)){if(!node.has(part))node.set(part,new Map());if(!(node.get(part) instanceof Map))throw Error('Kaynak yol çakışması.');node=node.get(part);}if(node.get(parts.at(-1)) instanceof Map)throw Error('Kaynak yol çakışması.');node.set(parts.at(-1),new File(new TextEncoder().encode(s)));}
 const dirs=m=>new Map([...m].map(([k,v])=>[k,v instanceof Map?new Directory(dirs(v)):v])),entries=dirs(root),objects=[];let log='Tiva C17 SDK · otomatik başlıklar: '+tivaLibraries(sources).join(', ')+'\n';
 for(const f of [...sources.filter(f=>f.name.endsWith('.c')),{name:'cf_tiva_runtime.c'}]){const o='unit'+objects.length+'.o';log+=await runESPTool(module,entries,['clang','--target=arm-none-eabi','-mcpu=cortex-m4','-mthumb','-mfpu=fpv4-sp-d16','-mfloat-abi=hard','-std=c17','-ffreestanding','-nostdinc','-I.','-Os','-fno-builtin','-ffunction-sections','-fdata-sections','-Werror=implicit-function-declaration','-c',f.name,'-o',o]);objects.push(o);}
 log+=await runESPTool(module,entries,['ld.lld','--threads=1','--gc-sections','-T','link.ld',...objects,'-o','firmware.elf']);
 const elf=entries.get('firmware.elf').data,v=new DataView(elf.buffer,elf.byteOffset,elf.byteLength),segments=[];let end=0,staticRamBytes=0;
 for(let i=0;i<v.getUint16(44,true);i++){const h=v.getUint32(28,true)+i*v.getUint16(42,true);if(v.getUint32(h,true)!==1)continue;const p=v.getUint32(h+12,true),a=v.getUint32(h+8,true),n=v.getUint32(h+16,true),mem=v.getUint32(h+20,true),o=v.getUint32(h+4,true);if(a>=0x20000000)staticRamBytes=Math.max(staticRamBytes,a+mem-0x20000000);if(n){if(p+n>262144)throw Error('Tiva Flash segmenti geçersiz.');segments.push({p,n,o});end=Math.max(end,p+n);}}
 const bytes=new Uint8Array(end);for(const s of segments)bytes.set(elf.subarray(s.o,s.o+s.n),s.p);return{image:packTivaImage(bytes),elf,flashBytes:bytes.length,staticRamBytes,log};
}
