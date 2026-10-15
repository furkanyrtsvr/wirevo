import test from 'node:test';import assert from 'node:assert/strict';
import {CATALOG,validateProject,componentDefinition,buildNets} from '../dist/core.js';
import {localPoint,pinPoint,componentBounds} from '../dist/geometry.js';
import {mirrorComponents} from '../dist/component-transform.js';
import {emptyProject} from '../dist/templates.js';
import {placeOnBreadboard,mountErrors} from '../dist/mounting.js';
import {createSTMProject} from '../dist/stm32-project.js';
import {supportedPart} from '../dist/unified-project.js';
import {validateESPCircuit,createESPBench} from '../dist/esp-circuit.js';
for(const type of ['bluetooth','opamp','board','breadboard','resistor','netLabel'])for(const rotation of [0,90,180,270])test(type+' world mirror X/Y at '+rotation,()=>{
 const p=emptyProject();const c={id:'part',type,x:31,y:47,rotation,params:type==='netLabel'?{name:'TEST'}:{}};p.components=[c];const d=componentDefinition(c),bounds=componentBounds(c),before=d.pinDefs.map(pin=>pinPoint(p,'part:'+pin.id));
 for(const axis of ['x','y']){mirrorComponents(p,['part'],axis);d.pinDefs.forEach((pin,i)=>{const after=pinPoint(p,'part:'+pin.id),expected={...before[i]};expected[axis]=2*c[axis]+bounds[axis==='x'?'width':'height']-before[i][axis];assert.ok(Math.abs(after.x-expected.x)<1e-8&&Math.abs(after.y-expected.y)<1e-8);});mirrorComponents(p,['part'],axis);assert.equal(c.rotation,rotation);d.pinDefs.forEach((pin,i)=>assert.deepEqual(pinPoint(p,'part:'+pin.id),before[i]));}
});
test('breadboard mirror keeps all mounted pin/hole pairs and electrical nets',()=>{
 const p=emptyProject();p.components=[{id:'bb',type:'breadboard',x:100,y:100,rotation:90,params:{}},{id:'amp',type:'opamp',x:0,y:0,rotation:0,params:{}}];assert.equal(placeOnBreadboard(p,p.components[1],'bb'),true);assert.deepEqual(mountErrors(p),[]);const pins={...p.components[1].mount.pins};
 for(const axis of ['x','y','x','y']){mirrorComponents(p,['bb'],axis);assert.deepEqual(mountErrors(p),[]);assert.deepEqual(p.components[1].mount.pins,pins);}
});
test('standalone mounted part detaches when mirrored; project persistence retains both axes',()=>{
 const p=emptyProject();p.components=[{id:'bb',type:'breadboard',x:100,y:100,rotation:0,params:{}},{id:'amp',type:'opamp',x:0,y:0,rotation:0,params:{}}];assert.ok(placeOnBreadboard(p,p.components[1],'bb'));mirrorComponents(p,['amp'],'x');assert.equal(p.components[1].mount,undefined);mirrorComponents(p,['amp'],'y');const q=validateProject(JSON.parse(JSON.stringify(p)));assert.equal(q.components[1].mirrorX,true);assert.equal(q.components[1].mirrorY,true);p.components[1].mirrorX='yes';assert.throws(()=>validateProject(p),/aynalama/);
});
test('ESP circuit retains mirror flags and rejects nonboolean import',()=>{const p=createESPBench('esp32c3');p.components[0].mirrorX=true;p.components[0].mirrorY=true;const q=validateESPCircuit(p,'esp32c3');assert.equal(q.components[0].mirrorX,true);assert.equal(q.components[0].mirrorY,true);p.components[0].mirrorY=1;assert.throws(()=>validateESPCircuit(p,'esp32c3'),/aynalama/);});
test('Opamp is a usable Basic library component on STM32, without a duplicate alias',()=>{assert.equal(CATALOG.opamp.category,'Temel');assert.equal(supportedPart(createSTMProject({starter:'empty'}),'opamp'),true);assert.equal(CATALOG.opamp.pins.length,8);});
