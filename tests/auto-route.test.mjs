import test from 'node:test';
import assert from 'node:assert/strict';
import {createSTMProject} from '../dist/stm32-project.js';
import {buildNets,validateProject} from '../dist/core.js';
import {wirePoints,pinPoint} from '../dist/geometry.js';
import {routeProjectWires,routeSelectedWire,parallelClearance,wireCrossings,colorProjectWires} from '../dist/wire-router.js';
import {exportProjectZip,importProjectBytes} from '../dist/project-import.js';

test('auto route preserves every endpoint, part position, program and electrical group; JSON/ZIP retain new routes',async()=>{
 const p=createSTMProject({starter:'controller'}),parts=structuredClone(p.components),ends=p.wires.map(w=>[w.from,w.to]),code=p.code,before=buildNets(p),eps=ends.flat();
 p.wires[0].routing='direct';routeProjectWires(p,{force:true,recolor:true});validateProject(p);
 assert.deepEqual(p.components,parts);assert.equal(p.code,code);assert.deepEqual(p.wires.map(w=>[w.from,w.to]),ends);
 for(const q of [p,validateProject(JSON.parse(JSON.stringify(p))),(await importProjectBytes(exportProjectZip(p))).project]){const after=buildNets(q);for(const a of eps)for(const b of eps)assert.equal(after.same(a,b),before.same(a,b));for(const w of q.wires){const ps=wirePoints(q,w);assert.deepEqual(ps[0],pinPoint(q,w.from));assert.deepEqual(ps.at(-1),pinPoint(q,w.to));for(let i=1;i<ps.length;i++)assert.ok(ps[i].x===ps[i-1].x||ps[i].y===ps[i-1].y);}}
});
test('signal palette distinguishes actual SPI/I2C/supply nets and is stable on reroute',()=>{
 const p=createSTMProject({starter:'environment'}),color=ep=>p.wires.find(w=>w.from===ep||w.to===ep)?.color;
 assert.equal(color('adc1:VDD'),'#ef4444');assert.equal(color('adc1:AGND'),'#64748b');
 assert.equal(color('adc1:CLK'),'#f59e0b');assert.equal(color('adc1:DIN'),'#22c55e');assert.equal(color('adc1:DOUT'),'#14b8a6');assert.equal(color('mem1:SDA'),'#3b82f6');assert.equal(color('mem1:SCL'),'#f59e0b');
 const colors=p.wires.map(w=>w.color);colorProjectWires(p);assert.deepEqual(p.wires.map(w=>w.color),colors);
});
test('single-wire routing leaves all other routes and manual colors intact',()=>{
 const p=createSTMProject({starter:'controller'}),others=structuredClone(p.wires.slice(1));p.wires[0].routing='direct';routeSelectedWire(p,p.wires[0]);assert.deepEqual(p.wires.slice(1),others);assert.notEqual(p.wires[0].routing,'direct');
});
test('parallel clearance measures overlapping projections only; crossing marks do not create electrical joins',()=>{
 assert.equal(parallelClearance({x:0,y:0},{x:100,y:0},{x:10,y:16},{x:50,y:16}),16);
 assert.equal(parallelClearance({x:0,y:0},{x:5,y:0},{x:10,y:2},{x:50,y:2}),Infinity);
 const p=createSTMProject({starter:'empty'});p.components.push(...['a','b','c','d'].map((id,i)=>({id,type:'netLabel',x:[0,100,50,50][i],y:[34,34,-16,84][i],params:{name:id}})));p.wires=[{id:'h',from:'a:NET',to:'b:NET',color:'#3b82f6',routing:'direct'},{id:'v',from:'c:NET',to:'d:NET',color:'#22c55e',routing:'direct'}];
 assert.deepEqual(wireCrossings(p).get('v'),[{x:50,y:50}]);assert.equal(buildNets(p).same('a:NET','c:NET'),false);
});
test('mirrored and rotated body escapes retain physical endpoint coordinates',()=>{
 const p=createSTMProject({starter:'controller'});const board=p.components.find(c=>c.type==='board');board.mirrorX=true;board.mirrorY=true;board.rotation=90;routeProjectWires(p,{force:true});validateProject(p);for(const w of p.wires){const ps=wirePoints(p,w);assert.deepEqual(ps[0],pinPoint(p,w.from));assert.deepEqual(ps.at(-1),pinPoint(p,w.to));}
});
