import test from 'node:test';
import assert from 'node:assert/strict';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {createSTMProject} from '../dist/stm32-project.js';
import {buildNets} from '../dist/core.js';
import {wirePoints} from '../dist/geometry.js';
import {routeProjectWires,sharedLength} from '../dist/wire-router.js';

for(const board of Object.keys(STM32_BOARDS))for(const starter of ['environment','controller'])test(board+' '+starter+' routes separate interior lanes and preserves electrical nets',()=>{
 const p=createSTMProject({board,starter}),before=buildNets(p),endpoints=p.wires.map(w=>[w.from,w.to]);
 routeProjectWires(p);const after=buildNets(p);
 for(const[a,b]of endpoints)assert.equal(before.same(a,b),after.same(a,b));
 for(let i=0;i<p.wires.length;i++)for(let j=0;j<i;j++){
  const a=wirePoints(p,p.wires[i]),b=wirePoints(p,p.wires[j]);
  // Shared fan-out at the actual pin is legal; long middle sections must separate.
  for(let x=2;x<a.length-1;x++)for(let y=2;y<b.length-1;y++)
   assert.equal(sharedLength(a[x-1],a[x],b[y-1],b[y]),0,p.wires[i].id+' / '+p.wires[j].id);
 }
});
