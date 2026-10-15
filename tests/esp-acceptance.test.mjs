import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ESP_BOARDS} from '../dist/esp-boards.js';
import {createUnifiedProject,unifiedExamples,unifiedExampleProject} from '../dist/unified-project.js';
import {sourceKey} from '../dist/source-files.js';
const groups=await Promise.all(['a','b','c'].map(g=>readFile(new URL('../docs/esp32-acceptance/'+g+'.json',import.meta.url),'utf8').then(JSON.parse)));
const cases=groups.flatMap(g=>g.cases),workers=JSON.parse(await readFile(new URL('../docs/esp32-worker-acceptance.json',import.meta.url))),integrity=JSON.parse(await readFile(new URL('../docs/esp32-integrity-acceptance.json',import.meta.url)));
test('ESP release approval is complete and still matches every offered source, physical board and language',()=>{
 assert.equal(cases.length,321);assert.equal(new Set(cases.map(c=>c.board+':'+c.language+':'+c.example)).size,321);assert.ok(groups.every(g=>g.failures.length===0));
 for(const board of Object.keys(ESP_BOARDS))for(const language of ['arduino','c','micropython'])for(const e of unifiedExamples(createUnifiedProject({board,language}))){const record=cases.find(c=>c.board===board&&c.language===language&&c.example===e.id);assert.equal(record?.status,'passed');const p=unifiedExampleProject(board,language,e.id);assert.equal(record.sourceSha256,createHash('sha256').update(sourceKey(p)).digest('hex'));assert.ok(record.zip);if(language!=='micropython')assert.ok(record.imageSha256&&record.instructions>0);}
});
test('ESP lifecycle and integrity approvals contain all fourteen boards and three languages without missing rows',()=>{
 assert.equal(workers.length,42);assert.equal(integrity.length,14);
 for(const board of Object.keys(ESP_BOARDS)){assert.equal(integrity.find(r=>r.board===board)?.status,'passed');for(const language of ['arduino','c','micropython']){const r=workers.find(r=>r.board===board&&r.language===language);assert.equal(r?.status,'passed');assert.ok(r.load&&r.run&&r.pause&&r.terminate);if(language==='micropython')assert.ok(r.blockedPythonTerminable);else assert.ok(r.step&&r.reset);}}
});
test('STM32 compiler gate is labelled honestly and enforces F103C8 hardware capacities',async()=>{
 const gate=JSON.parse(await readFile(new URL('../docs/stm32-toolchain-gate.json',import.meta.url)));assert.match(gate.scope,/runtime unverified/);assert.equal(gate.f103c8.machine,40);assert.equal(gate.f103c8.initialSP,0x20005000);assert.ok(gate.f103c8.resetVector&1);assert.equal(gate.f103c8.flashBytes,65536);assert.equal(gate.f103c8.ramBytes,20480);assert.ok(gate.f103c8.ramOverflowRejected&&gate.f103c8.flashOverflowRejected);
});
