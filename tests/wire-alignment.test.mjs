import test from 'node:test';
import assert from 'node:assert/strict';
import {moveWireSegment,wirePoints,pinPoint} from '../dist/geometry.js';
import {validateProject,buildNets} from '../dist/core.js';
import {makeProject} from '../dist/templates.js';
import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';
test('fractional pin coordinates allow a small jog to be collapsed despite the 9.6 grid',()=>{
 const r=[{x:0,y:40.37},{x:25,y:40.37},{x:25,y:44.21},{x:60,y:44.21},{x:60,y:40.37},{x:100,y:40.37}];
 const aligned=moveWireSegment(r,2,-3,{grid:9.6,tolerance:5});assert.deepEqual(aligned,[r[0],r.at(-1)]);
 const free=moveWireSegment(r,2,-3);assert.ok(free.some(p=>p.y===41.21));assert.deepEqual(free[0],r[0]);assert.deepEqual(free.at(-1),r.at(-1));
});
test('direct line preserves physical endpoints and nets through JSON and ZIP',async()=>{
 const p=makeProject(),w=p.wires[0],nets=buildNets(p).groups;w.routing='direct';w.points=[];
 assert.deepEqual(wirePoints(p,w),[pinPoint(p,w.from),pinPoint(p,w.to)]);assert.deepEqual(buildNets(p).groups,nets);
 for(const q of [validateProject(JSON.parse(JSON.stringify(p))),(await importProjectBytes(exportProjectZip(p))).project]){assert.equal(q.wires[0].routing,'direct');assert.equal(wirePoints(q,q.wires[0]).length,2);}
 w.routing='unknown';assert.throws(()=>validateProject(p));
});
