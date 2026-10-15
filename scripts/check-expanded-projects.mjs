import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
import {buildProjectFirmware} from '../dist/gcc-project.js';import {makeProject} from '../dist/templates.js';import {EXPANDED_EXAMPLES} from '../dist/expanded-examples.js';
globalThis.window={};const nativeFetch=globalThis.fetch;globalThis.fetch=async(u,o)=>String(u).startsWith('file:')?new Response(await readFile(fileURLToPath(u)),{headers:{'Content-Type':String(u).endsWith('.wasm')?'application/wasm':'application/octet-stream'}}):nativeFetch(u,o);
const assetsBase=new URL('../research/compiler/node_modules/@horang-corp/avr-gcc-wasm/',import.meta.url).href,fixtures={};
for(const {id} of EXPANDED_EXAMPLES){const project=makeProject(id),result=await buildProjectFirmware([{name:'sketch.ino',content:project.code}],{assetsBase});if(!result.fitsTarget||!result.fitsRam)throw Error(id+' target capacity');fixtures[id]={project,result};console.log(JSON.stringify({id,flash:result.flashBytes,ram:result.staticRamBytes}));}
await writeFile(new URL('../tests/fixtures/expanded-projects.json',import.meta.url),JSON.stringify(fixtures,null,2));
