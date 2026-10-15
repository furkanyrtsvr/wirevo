import {parentPort} from 'node:worker_threads';
import {readFile} from 'node:fs/promises';
import {STMRuntime} from '../../dist/stm32-runtime.js';
await STMRuntime.initialize(await readFile(new URL('../../dist/stm32/cortex-m3.wasm',import.meta.url)));
await STMRuntime.initialize(await readFile(new URL('../../dist/stm32/cortex-m4f.wasm',import.meta.url)),'cortex-m4f');
globalThis.self=globalThis;globalThis.postMessage=d=>parentPort.postMessage(d);
await import('../../dist/stm32-worker.js');
parentPort.on('message',data=>self.onmessage({data}));
