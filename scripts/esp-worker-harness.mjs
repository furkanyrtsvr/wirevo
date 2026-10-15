// Node transport for the unchanged browser worker, for lifecycle acceptance.
import {parentPort} from 'node:worker_threads';
import {readFile} from 'node:fs/promises';
import {ESPRuntime} from '../dist/esp-runtime.js';
globalThis.self=globalThis;
globalThis.postMessage=data=>parentPort.postMessage(data);
const fetchNetwork=globalThis.fetch;
globalThis.fetch=async(input,init)=>{const url=String(input?.url||input);return url.startsWith('file:')?new Response(await readFile(new URL(url)),{headers:{'Content-Type':url.endsWith('.wasm')?'application/wasm':'text/javascript'}}):fetchNetwork(input,init);};
await ESPRuntime.initialize(await readFile(new URL('../dist/esp32/pkg/esp_emu_bg.wasm',import.meta.url)));
await import('../dist/unified-worker.js');
parentPort.on('message',data=>self.onmessage({data}));
parentPort.postMessage({type:'harness-ready'});
