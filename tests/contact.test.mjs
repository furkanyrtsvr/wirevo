import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {makeProject} from '../dist/templates.js';import {simulate,validateProject,CATALOG} from '../dist/core.js';
import {UnoRuntime} from '../dist/uno-runtime.js';import {attachCircuitRuntime} from '../dist/circuit-runtime.js';
import {readMeasurement} from '../dist/measurement.js';import {CONTACT_ASSETS} from '../dist/contact-hardware.js';
const firmware=JSON.parse(fs.readFileSync(new URL('../dist/template-firmware.json',import.meta.url)));
const state=high=>({pins:{D13:{outputEnabled:true,voltage:high?5:0,high}}});
const advance=(r,n)=>{const end=r.cpu.cycles+n;while(r.cpu.cycles<end)r.stepCycles(Math.min(160000,end-r.cpu.cycles));};
const near=(a,b,t=1e-7)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
function relay(){return makeProject('relay');}
function voltage(s,ep){return s.dc.voltages.get(s.dc.netlist.net(ep));}
test('Real relay and SPDT artwork terminals map to six and three connectable pins; contact parameters survive JSON',()=>{
 assert.deepEqual(CATALOG.relay.pins,['VCC','GND','IN','NC','COM','NO']);assert.deepEqual(CATALOG.spdt.pins,['1','2','3']);
 for(const type of ['relay','spdt'])for(const p of CONTACT_ASSETS[type].pins){assert.ok(p.x>=0&&p.x<=CONTACT_ASSETS[type].width);assert.ok(p.y>=0&&p.y<=CONTACT_ASSETS[type].height);}
 for(const name of ['relay','spdt'])assert.equal(validateProject(makeProject(name)).model,name);
 const p=relay();p.components.find(c=>c.type==='relay').params.activeHigh='false';assert.throws(()=>validateProject(p),/aktif/);
 const s=makeProject('spdt');s.components.find(c=>c.type==='spdt').params.position='middle';assert.throws(()=>validateProject(s),/konumu/);
});
test('Relay contacts carry isolated load current, default NC and energized NO; open NO stays floating',()=>{
 const p=relay(),on=simulate(p,0,state(true)),off=simulate(p,0,state(false));assert.equal(on.relays.relay1,true);assert.equal(on.dc.contactResults.get('relay1').target,'NO');assert.equal(off.dc.contactResults.get('relay1').target,'NC');
 near(on.leds.led1.current,3000/220.05);near(readMeasurement(on.dc,p.settings.measurement).current,3/220.05);
 assert.equal(voltage(off,'relay1:NO'),null);near(off.leds.led1.current,0);
 // Changing contact load to 3.3V must not inherit control-module 5V.
 p.wires.find(w=>w.to==='relay1:COM').from='uno:3.3V';const lowLoad=simulate(p,0,state(true));near(lowLoad.leds.led1.current,1300/220.05);near(voltage(lowLoad,'relay1:COM'),3.3);near(voltage(lowLoad,'relay1:VCC'),5);
});
test('HIGH/LOW input, lost power, ground and floating IN select deterministic deenergized contacts',()=>{
 const p=relay();p.components.find(c=>c.type==='relay').params.activeHigh=false;assert.equal(simulate(p,0,state(false)).relays.relay1,true);assert.equal(simulate(p,0,state(true)).relays.relay1,false);
 for(const endpoint of ['relay1:VCC','relay1:GND','relay1:IN']){const q=structuredClone(p);q.wires=q.wires.filter(w=>w.to!==endpoint&&w.from!==endpoint);const s=simulate(q,0,state(false));assert.equal(s.relays.relay1,false,endpoint);assert.equal(s.dc.contactResults.get('relay1').target,'NC');}
});
test('Closed contact source conflicts and self oscillating relay control are blocked in bounded passes',()=>{
 const p=relay();p.wires.push({id:'short',from:'relay1:NO',to:'uno:GND',color:'#64748b',points:[]});const short=simulate(p,0,state(true));assert.equal(short.dc.valid,false);assert.ok(short.dc.diagnostics.some(d=>d.code==='contact-source-conflict'));
 const q=relay();q.wires=q.wires.filter(w=>w.to!=='relay1:IN');q.wires.push({id:'feedback',from:'relay1:NC',to:'relay1:IN',color:'#14b8a6',points:[]});const loop=simulate(q);assert.equal(loop.dc.valid,false);assert.equal(loop.dc.contactPasses,16);assert.ok(loop.dc.diagnostics.some(d=>d.code==='contact-nonconvergence'));
});
test('SPDT selects common2 to left1 or right3, carries signed pull-up current and reaches real AVR input',()=>{
 const p=makeProject('spdt'),r=new UnoRuntime(firmware.button.hex),engine=attachCircuitRuntime(r,p);r.stepCycles(200000);assert.equal(r.readPin('D2').high,false);assert.equal(r.readPin('D13').high,true);assert.equal(engine.solution.contactResults.get('sw1').target,'1');
 p.components.find(c=>c.type==='spdt').params.position='right';engine.updateProject(p);advance(r,2000000);assert.equal(r.readPin('D2').high,true);assert.equal(r.readPin('D13').high,false);assert.equal(engine.solution.contactResults.get('sw1').target,'3');
 near(readMeasurement(engine.solution,p.settings.measurement).voltage,5);engine.dispose();
});
test('Real Blink GPIO switches relay load without UI polling and paused topology changes release the coil',()=>{
 const p=relay(),r=new UnoRuntime(firmware.blink.hex),engine=attachCircuitRuntime(r,p);r.stepCycles(16000);assert.equal(engine.solution.contactResults.get('relay1').energized,true);near(engine.solution.ledResults.get('led1').current,3/220.05);
 advance(r,8200000);assert.equal(engine.solution.contactResults.get('relay1').energized,false);near(engine.solution.ledResults.get('led1').current,0);
 advance(r,8200000);assert.equal(engine.solution.contactResults.get('relay1').energized,true);const q=structuredClone(p);q.wires=q.wires.filter(w=>w.to!=='relay1:VCC');engine.updateProject(q);assert.equal(engine.solution.contactResults.get('relay1').energized,false);engine.dispose();
});
