import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
import {buildProjectFirmware} from '../dist/gcc-project.js';import {makeProject} from '../dist/templates.js';
globalThis.window={};const nativeFetch=globalThis.fetch;globalThis.fetch=async(u,o)=>String(u).startsWith('file:')?new Response(await readFile(fileURLToPath(u)),{headers:{'Content-Type':String(u).endsWith('.wasm')?'application/wasm':'application/octet-stream'}}):nativeFetch(u,o);
const assetsBase=new URL('../research/compiler/node_modules/@horang-corp/avr-gcc-wasm/',import.meta.url).href,fixtures={};
for(const id of ['stretch','no-stretch','fast','timeout']){
 const project=makeProject('sht31-stretch');
 if(id==='no-stretch')project.code=project.code.replace('shtCommand(0x2c06)','shtCommand(0x2400)');
 if(id==='fast')project.code=project.code.replace('Wire.setClock(100000)','Wire.setClock(400000)');
 if(id==='timeout')project.code=project.code.replace('25000,true','2000,true');
 const result=await buildProjectFirmware([{name:'sketch.ino',content:project.code}],{assetsBase});if(!result.fitsTarget||!result.fitsRam)throw Error(id+' capacity');fixtures[id]={project,result};console.log(JSON.stringify({id,flash:result.flashBytes,ram:result.staticRamBytes}));
 if(id==='stretch'){const path=new URL('../dist/template-firmware.json',import.meta.url),cache=JSON.parse(await readFile(path));cache['sht31-stretch']={source:project.code,hex:result.hex,flashBytes:result.flashBytes,staticRamBytes:result.staticRamBytes};await writeFile(path,JSON.stringify(cache));}
}
await writeFile(new URL('../tests/fixtures/i2c-lines.json',import.meta.url),JSON.stringify(fixtures,null,2));
