import {readFile} from 'node:fs/promises';
import {stringifyESPProject} from '../dist/esp-project.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createUnifiedProject,encodeBytes,unifiedExamples,unifiedExampleProject} from '../dist/unified-project.js';
import {validateProject,buildNets} from '../dist/core.js';
import {projectFiles,sourceKey,firmwareMatches} from '../dist/source-files.js';
import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
import {LogicAnalyzer} from '../dist/logic-analyzer.js';
for(const board of ['esp32c3','esp32c6','esp32s3'])for(const language of ['arduino','c','micropython'])test(`${board} ${language}: mounted breadboard and JSON/ZIP source roundtrip`,async()=>{
 const p=validateProject(createUnifiedProject({board,language}));
 assert.equal(projectFiles(p)[0].name,{arduino:'sketch.ino',c:'main.c',micropython:'main.py'}[language]);
 for(const c of p.components.filter(c=>['resistor','led'].includes(c.type))){assert.ok(c.mount);for(const [pin,hole]of Object.entries(c.mount.pins))assert.ok(buildNets(p).same(c.id+':'+pin,c.mount.boardId+':'+hole));}
 const json=await importProjectBytes(new TextEncoder().encode(JSON.stringify(p))),zip=await importProjectBytes(exportProjectZip(p));
 assert.deepEqual(json.project,p);assert.deepEqual(zip.project,{...p,files:[]});
 if(language==='micropython'){p.firmware={format:'micropython',board,payload:p.code,source:p.code,sourceKey:sourceKey(p)};assert.ok(firmwareMatches(p));assert.ok(firmwareMatches((await importProjectBytes(exportProjectZip(p))).project));p.code+='\nprint(42)';assert.equal(firmwareMatches(p),false);}
});
test('language/architecture and protected runtime sources cannot be silently mixed',()=>{
 assert.throws(()=>createUnifiedProject({board:'uno',language:'c'}));
 const p=createUnifiedProject({board:'esp32c3',language:'micropython'});p.files=[{name:'machine.py',content:'fake'}];assert.throws(()=>validateProject(p));
 const c=createUnifiedProject({board:'esp32c3',language:'c'});c.files=[{name:'cf_hal.h',content:'fake'}];assert.throws(()=>validateProject(c));
 c.files=[];c.firmware={format:'micropython',board:'esp32c3',payload:c.code,source:c.code};assert.throws(()=>validateProject(c));
 c.firmware={format:'esp-bin',board:'esp32c3',payload:encodeBytes(new Uint8Array([1,2,3])),source:c.code};assert.throws(()=>validateProject(c));
});
test('ESP GPIO trace preserves observed edges including GPIO above bank zero',()=>{const a=new LogicAnalyzer({pins:['GPIO2','GPIO48']});a.append([{pin:'GPIO2',cycle:0,high:false,seed:true},{pin:'GPIO2',cycle:16,high:true},{pin:'GPIO48',cycle:32,high:true}],64);assert.equal(a.edges.length,2);assert.deepEqual(a.pins,['GPIO2','GPIO48']);});

for(const board of ['uno','nano','pro-mini','mega','duemilanove','pro'])for(const starter of ['blink','empty'])test(`${board}: new project ${starter} includes selected board and breadboard`,()=>{const p=validateProject(createUnifiedProject({board,starter}));assert.equal(p.components.find(c=>c.type==='board').params.model,board);assert.ok(p.components.some(c=>c.type==='breadboard'));});
test('legacy ESP JSON migrates real firmware into the common workspace',async()=>{const fixtures=JSON.parse(await readFile(new URL('./fixtures/esp-projects.json',import.meta.url)));for(const chip of ['esp32c3','esp32c6','esp32s3']){const f=fixtures[chip+':blink'],text=stringifyESPProject({chip,source:f.source,image:Buffer.from(f.bin,'base64'),firmwareSource:f.source,example:'blink'}),result=await importProjectBytes(new TextEncoder().encode(text));assert.equal(result.project.components.find(c=>c.type==='board').params.model,chip);assert.equal(result.project.firmware.payload,f.bin);assert.ok(firmwareMatches(result.project));}});

test('all 54 original ESP examples open in the common workspace with the selected target',()=>{for(const board of ['esp32c3','esp32c6','esp32s3']){const list=unifiedExamples(createUnifiedProject({board}));assert.equal(list.length,18);for(const e of list){const p=validateProject(unifiedExampleProject(board,'arduino',e.id));assert.equal(p.components.find(c=>c.type==='board').params.model,board);assert.ok(p.components.some(c=>c.type==='breadboard'));}}});
test('ESP example catalog follows project language',()=>{const py=unifiedExamples(createUnifiedProject({board:'esp32c3',language:'micropython'})),c=unifiedExamples(createUnifiedProject({board:'esp32c3',language:'c'}));assert.deepEqual(py.map(e=>e.id),['blink','sht31']);assert.deepEqual(c.map(e=>e.id),['blink','sht31','adc']);assert.equal(validateProject(unifiedExampleProject('esp32s3','micropython','sht31')).language,'micropython');});
