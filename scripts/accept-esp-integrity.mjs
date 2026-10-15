import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {ESP_BOARDS,validateESPImage} from '../dist/esp-boards.js';
import {createUnifiedProject} from '../dist/unified-project.js';
import {validateProject,buildNets} from '../dist/core.js';
import {validateESPCircuit,solveESPCircuit} from '../dist/esp-circuit.js';
import {examplePin} from '../dist/esp-example-bindings.js';
import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
const firmware=JSON.parse(await readFile('tests/fixtures/esp-board-profiles.json')),records=[];
for(const board of Object.keys(ESP_BOARDS)){
 const p=createUnifiedProject({board,language:'c'}),pin='mcu:GPIO'+examplePin(board,2);
 const q=structuredClone(p);q.components.push({id:'psu',type:'supply',x:200,y:200,rotation:0,params:{voltage:5}});q.wires.push({id:'overV',from:'psu:VCC',to:pin,color:'#ef4444'},{id:'overG',from:'psu:GND',to:'mcu:GND',color:'#64748b'});
 const dc=solveESPCircuit(q,board);assert.equal(dc.valid,false);assert.ok(dc.diagnostics.some(d=>d.code==='esp-gpio-overvoltage'));
 const broken=structuredClone(p);broken.wires[0].from='mcu:GPIO63';assert.throws(()=>validateProject(broken));assert.throws(()=>validateESPCircuit(broken,board));
 const reserved=ESP_BOARDS[board].pins?.find(p=>p.connectable===false);if(reserved){const b=structuredClone(p);b.wires[0].from='mcu:'+reserved.id;assert.throws(()=>validateProject(b));}
 const image=Buffer.from(firmware[board+':c'].bin,'base64'),offset=validateESPImage(image,board).offset||0,corrupt=Buffer.from(image);corrupt[offset+32]^=1;assert.throws(()=>validateESPImage(corrupt,board),/checksum/);
 const other=Object.keys(ESP_BOARDS).find(id=>ESP_BOARDS[id].chipId!==ESP_BOARDS[board].chipId);assert.throws(()=>validateESPImage(image,other));
 p.wires[0].routing='direct';const restored=(await importProjectBytes(exportProjectZip(p))).project;assert.equal(restored.wires[0].routing,'direct');assert.equal(buildNets(p).same(p.wires[0].from,p.wires[0].to),true);assert.equal(buildNets(restored).same(p.wires[0].from,p.wires[0].to),true);
 records.push({board,status:'passed',gpioOvervoltageRejected:true,invalidAndReservedPadsRejected:true,checksumRejected:true,crossChipImageRejected:true,directWireZipNetPreserved:true});console.log('PASS',board);
}
await writeFile('docs/esp32-integrity-acceptance.json',JSON.stringify(records,null,2));
