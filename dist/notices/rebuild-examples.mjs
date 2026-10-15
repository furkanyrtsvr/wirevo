// Rebuild exact published example sources with the same pinned compiler package.
// Install first: npm install @horang-corp/avr-gcc-wasm@0.2.0
// Usage: node rebuild-examples.mjs ../template-firmware.json ./rebuilt-firmware.json
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
globalThis.window={};
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,options)=>String(url).startsWith('file:')?new Response(await readFile(fileURLToPath(url)),{headers:{'Content-Type':String(url).endsWith('.wasm')?'application/wasm':'application/octet-stream'}}):originalFetch(url,options);
const {buildFirmware}=await import('@horang-corp/avr-gcc-wasm/firmware-builder');
const sourceFile=process.argv[2]||new URL('../template-firmware.json',import.meta.url);
const outputFile=process.argv[3]||new URL('./rebuilt-firmware.json',import.meta.url);
const examples=JSON.parse(await readFile(sourceFile,'utf8')),rebuilt={};
for(const[id,example]of Object.entries(examples)){
  const source=example.source;
  const result=await buildFirmware({source:'#include <Arduino.h>\n#line 1 "sketch.ino"\n'+source});
  rebuilt[id]={source,hex:result.hex,flashBytes:result.flashBytes};
  console.log(`${id}: ${result.flashBytes} flash bytes`);
}
await writeFile(outputFile,JSON.stringify(rebuilt));
