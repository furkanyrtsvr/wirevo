// Pinned C3 Arduino SDK experiment; SDK archives remain outside product dist.
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {Directory,File} from '@bjorn3/browser_wasi_shim';
import {runESPTool,ESP_CLANG_SHA256} from '../../src/esp-compiler.js';
const root=new URL('../../research/esp32/',import.meta.url),tree=new Map();
let bytes=0;
async function load(path){const entries=new Map();for(const e of await readdir(path,{withFileTypes:true})){if(!e.isFile())continue;const data=await readFile(new URL(e.name,path));entries.set(e.name,new File(data));bytes+=data.length;}return new Directory(entries);}
for(const [name,path] of Object.entries({lib:'sdk-linkset/lib/',ld:'sdk/esp32c3-libs/ld/',config:'sdk/esp32c3-libs/dio_qspi/',sys:'sdk-linkset/sys/',gcc:'sdk-linkset/gcc/'}))tree.set(name,await load(new URL(path,root)));
for(const [name,path] of [['sketch.o','sketch-clang.o'],['core.a','core-clang.a']])tree.set(name,new File(await readFile(new URL('native-c3/'+path,root))));
const flagsFile=async name=>(await readFile(new URL('sdk/esp32c3-libs/flags/'+name,root),'utf8')).trim().split(/\s+/);
const flags=(await flagsFile('ld_flags')).filter(t=>!t.startsWith('-march=')&&!['-nostartfiles','-fno-rtti','-fno-lto'].includes(t)).flatMap(t=>t.startsWith('-Wl,')?t.slice(4).split(','):[t]).filter(t=>!['--no-warn-rwx-segments','--orphan-handling=warn','--cref'].includes(t));
// LLD evaluates this forward alias before REGION_ALIAS. Both regions coincide.
const patch=(name,from,to)=>{const f=tree.get('ld').contents.get(name),text=new TextDecoder().decode(f.data);if(!text.includes(from))throw Error('Pinned linker script changed: '+name);f.data=new TextEncoder().encode(text.replace(from,to));};
patch('memory.ld','ORIGIN(rtc_data_seg)','ORIGIN(rtc_iram_seg)');
// GNU places this orphan in DRAM. Give LLD an explicit equivalent placement.
patch('sections.ld','    _data_end = ABSOLUTE(.);','    KEEP (*(.fini_array .fini_array.*))\n    _data_end = ABSOLUTE(.);');
const wasm=gunzipSync(await readFile(new URL('../../dist/esp32/compiler/clang.wasm.gz',import.meta.url)));
if(createHash('sha256').update(wasm).digest('hex')!==ESP_CLANG_SHA256)throw Error('Clang SHA mismatch');
const module=await WebAssembly.compile(wasm);
console.log('LLD virtual archives:',bytes,'bytes');
// No map file: the current WASI File append implementation copies its buffer.
console.log(await runESPTool(module,tree,['ld.lld','--threads=1','--no-relax','-Llib','-Lld','-Lconfig','-Lsys','-Lgcc',...flags,...await flagsFile('ld_scripts'),'--wrap=esp_panic_handler','--start-group','sketch.o','core.a',...new Set(await flagsFile('ld_libs')),'--end-group','-EL','-o','lld.elf']));
await writeFile(new URL('native-c3/lld.elf',root),tree.get('lld.elf').data);
console.log('LLD ELF saved; run package.py lld and check-boot.mjs lld.');
