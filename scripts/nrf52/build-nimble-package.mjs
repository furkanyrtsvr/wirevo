// Reproducible NimBLE ARM library; compiled with the same browser WASM Clang.
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {File,Directory} from '@bjorn3/browser_wasi_shim';
import {runESPTool} from '../../src/esp-compiler.js';
const root=new URL('../../src/vendor/nimble-1.8.0/',import.meta.url),files={};
async function walk(url,prefix=''){for(const e of(await readdir(url,{withFileTypes:true})).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)){if(e.isDirectory())await walk(new URL(e.name+'/',url),prefix+e.name+'/');else if(/\.[ch]$/.test(e.name))files[prefix+e.name]=await readFile(new URL(e.name,url),'utf8');}}
await walk(root);
const units=JSON.parse(await readFile(new URL('units.json',root))),port=await readFile(new URL('../../src/nrf52/nimble-port/wirevo_npl.c',import.meta.url),'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex'),sourceHash=hash(JSON.stringify({files,units,port,flags:'arm-m4-hardfp-O2-g0-v1'}));
const output=new URL('../../dist/nrf52-nimble-sdk.js',import.meta.url);
let current=false;try{current=(await readFile(output,'utf8')).startsWith('// source-sha256: '+sourceHash+'\n');}catch{}
if(current)console.log('NimBLE ARM library matches source');
if(!current){
const module=await WebAssembly.compile(gunzipSync(await readFile(new URL('../../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
const tree=new Map();for(const[n,c]of Object.entries(files)){let m=tree;const p=n.split('/');for(const k of p.slice(0,-1)){if(!m.has(k))m.set(k,new Map());m=m.get(k);}m.set(p.at(-1),new File(new TextEncoder().encode(c)));}
const dir=m=>new Map([...m].map(([k,v])=>[k,v instanceof Map?new Directory(dir(v)):v])),entries=dir(tree),objects=[];
const cache=new URL('../../research/nimble-build/',import.meta.url);await mkdir(cache,{recursive:true});
for(const unit of units){const key=new URL(hash(sourceHash+unit)+'.o',cache),obj='sdk'+objects.length+'.o';let bytes;try{bytes=await readFile(key);}catch{console.log('NimBLE',unit);await runESPTool(module,entries,['clang','--target=arm-none-eabi','-mcpu=cortex-m4','-mthumb','-mfpu=fpv4-sp-d16','-mfloat-abi=hard','-std=c17','-ffreestanding','-nostdinc','-I.','-O2','-g0','-fno-omit-frame-pointer','-fno-inline','-fno-builtin','-ffunction-sections','-fdata-sections','-Werror=implicit-function-declaration','-c',unit,'-o',obj]);bytes=entries.get(obj).data;await writeFile(key,bytes);}objects.push(Buffer.from(bytes).toString('base64'));}
const headers=Object.fromEntries(Object.entries(files).filter(([n])=>n.endsWith('.h')));
await writeFile(output,'// source-sha256: '+sourceHash+'\n// Apache NimBLE 1.8.0 / TinyCrypt; licenses and reproducible sources in src/vendor/nimble-1.8.0.\nexport const NIMBLE_SDK='+JSON.stringify({headers,objects,port})+';\n');
await writeFile(new URL('../../dist/notices/NIMBLE-SOURCES.json',import.meta.url),JSON.stringify({version:'1.8.0',upstream:'https://github.com/apache/mynewt-nimble/tree/nimble_1_8_0_tag',sourceHash,compiler:'bundled WASM Clang; ARM Cortex-M4 hardfp; C17 -O2 -g0',files:Object.fromEntries(Object.entries(files).map(([n,s])=>[n,hash(s)])),portSha256:hash(port),objects:objects.map(s=>hash(Buffer.from(s,'base64')))},null,2)+'\n');
console.log('NimBLE packaged:',objects.length,'ARM objects');

}
