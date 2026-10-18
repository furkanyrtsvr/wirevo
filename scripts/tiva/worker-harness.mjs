import {parentPort} from 'node:worker_threads';import {readFile} from 'node:fs/promises';
const originalFetch=globalThis.fetch;
globalThis.fetch=async input=>String(input).startsWith('file:')?new Response(await readFile(new URL(input))):originalFetch(input);
globalThis.self=globalThis;globalThis.postMessage=d=>parentPort.postMessage(d);
await import('../../dist/tiva-worker.js');
parentPort.on('message',d=>self.onmessage({data:d}));
