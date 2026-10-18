import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const bytes=await readFile('dist/tiva/cortex-m4f.wasm'),sha256=createHash('sha256').update(bytes).digest('hex');
await writeFile('dist/tiva-integrity.js','export const TIVA_WASM_SHA256='+JSON.stringify(sha256)+';\n');
await writeFile('dist/tiva/provenance.json',JSON.stringify({engine:'Zmu ARMv7E-M FPv4-SP-D16',upstream:'https://github.com/jjkt/zmu',upstreamCommit:'72feb753fea97babc00cc88f2c75e814efc1bfd2',license:'Apache-2.0',bridge:'src/tiva/src/lib.rs',source:'src/stm32/vendor/zmu_cortex_m',flashOrigin:0,flashBytes:262144,ramOrigin:0x20000000,ramBytes:32768,target:'wasm32-unknown-unknown',artifact:{file:'cortex-m4f.wasm',bytes:bytes.length,sha256},scope:'Independent TM4C123 bridge; shared instruction engine, no STM32 peripheral alias. Functional model, not physical cycle equivalence.'},null,2));
let licenses='Wirevo Tiva engine: Zmu Apache-2.0. Original Tiva bridge, bounded C API and board SVG by Wirevo. No vendor ROM or full TivaWare distribution bundled.\n\n'+await readFile('src/stm32/vendor/ZMU-LICENSE.txt','utf8');
const root='research/stm32/toolchain/cargo/registry/src';for(const dir of await readdir(root))for(const crate of await readdir(root+'/'+dir)){const base=root+'/'+dir+'/'+crate;for(const name of (await readdir(base)).filter(n=>/^LICENSE|^COPYING/i.test(n)))try{licenses+='\n\n===== '+crate+' / '+name+' =====\n'+await readFile(base+'/'+name,'utf8');}catch{}}
await writeFile('dist/notices/TIVA-LICENSES.txt',licenses);console.log({bytes:bytes.length,sha256});
