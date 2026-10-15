import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {LIBRARIES,libraryManifest,normalizeLibraries,libraryBuildSelection} from '../dist/libraries.js';import {suggestedLibraries} from '../dist/library-panel.js';
import {sourceKey,firmwareMatches} from '../dist/source-files.js';import {makeProject} from '../dist/templates.js';import {validateProject} from '../dist/core.js';import {compileSketch} from '../dist/compile-client.js';import {ProjectHistory} from '../dist/project-history.js';
test('Pinned SSD1306 resolves GFX/BusIO/Wire/SPI; unsupported versions and broken lock cannot be imported',()=>{
 const m=libraryManifest([{id:'ssd1306',version:'2.5.16'}]);assert.deepEqual(m.locked.map(l=>l.id),['busio','gfx','spi','ssd1306','wire']);assert.deepEqual(normalizeLibraries(m),m);
 for(const raw of [libraryManifest([])]){raw.toolchain='latest';assert.throws(()=>normalizeLibraries(raw));}
 for(const requested of [[{id:'wire',version:'latest'}],[{id:'evil',version:'1'}],[{id:'wire',version:'1.0'},{id:'wire',version:'1.0'}]])assert.throws(()=>libraryManifest(requested));
 assert.throws(()=>normalizeLibraries({...m,locked:m.locked.slice(1)}),/kilidi/);
});
test('Schema5, source key and history carry exact library requests; old firmware keys retain compatibility',()=>{
 const p=makeProject();p.firmware={hex:'h',source:p.code,sourceKey:sourceKey(p)};assert.equal(firmwareMatches(p),true);p.libraries=libraryManifest([]);assert.equal(firmwareMatches(p),false);p.firmware.sourceKey=sourceKey(p);assert.equal(firmwareMatches(p),true);
 p.libraries=libraryManifest([{id:'wire',version:'1.0'}]);assert.equal(firmwareMatches(p),false);p.firmware.sourceKey=sourceKey(p);const next=validateProject(p);assert.equal(next.schemaVersion,5);assert.equal(firmwareMatches(next),true);
 const store=new Map(),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},history=new ProjectHistory(storage,{key:'test',validate:validateProject});history.save(next);assert.deepEqual(history.load().project.libraries,next.libraries);
 const reordered=structuredClone(next);reordered.libraries.locked.reverse();assert.equal(sourceKey(reordered),sourceKey(next));
});
test('Compiler header/object inputs contain core and chosen dependencies only',()=>{
 const upstream={headerFiles:['/sysroot/avr/include/avr/io.h','/arduino/core/Arduino.h','/arduino/variant/pins_arduino.h','/arduino/libraries/Wire/src/Wire.h','/arduino/libraries/SPI/src/SPI.h','/libraries/Adafruit_GFX_Library/Adafruit_GFX.h'],objectGroups:{base:['/objects/core_main.o','/objects/lib_Wire.o','/objects/lib_twi.o','/objects/lib_SPI.o'],oled:['/objects/lib_GFX.o']}};
 const core=libraryBuildSelection(libraryManifest([]),upstream);assert.deepEqual(core.objects,['/objects/core_abi.o','/objects/core_main.o']);assert.equal(core.headers.length,3);assert.equal(core.includes.includes('/arduino/libraries/Wire/src'),false);
 const wire=libraryBuildSelection(libraryManifest([{id:'wire',version:'1.0'}]),upstream);assert.equal(wire.headers.includes('/arduino/libraries/Wire/src/Wire.h'),true);assert.equal(wire.headers.some(p=>p.includes('SPI')),false);assert.ok(wire.objects.includes('/objects/lib_twi.o'));assert.equal(libraryBuildSelection(undefined,upstream),null);
});
test('Literal include suggestions inspect all project files; dependencies are not guessed from component artwork',()=>{
 const p=makeProject('oled');assert.ok(suggestedLibraries(p).some(l=>l.id==='ssd1306'));p.code='void setup(){}';p.files=[{name:'a.h',content:'#include <Wire.h>\n'}];assert.deepEqual(suggestedLibraries(p),[{id:'wire',version:'1.0'}]);
});
test('Exact manifest crosses compiler worker boundary and bad versions fail before allocating a worker',async()=>{
 const old=globalThis.Worker,workers=[];globalThis.Worker=class{constructor(){workers.push(this);}postMessage(packet){this.packet=packet;}terminate(){this.terminated=true;}};
 try{const m=libraryManifest([{id:'wire',version:'1.0'}]),pending=compileSketch('void setup(){}',{libraries:m}),w=workers.at(-1);assert.deepEqual(w.packet.libraries,m);assert.equal(w.packet.files[0].name,'sketch.ino');w.onmessage({data:{ok:true,result:{hex:'h',fitsTarget:true}}});await pending;assert.equal(w.terminated,true);const before=workers.length;await assert.rejects(compileSketch('x',{libraries:{schemaVersion:1,toolchain:'latest',requested:[]}}));assert.equal(workers.length,before);}finally{globalThis.Worker=old;}
});
