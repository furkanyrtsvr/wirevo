import test from 'node:test';
import assert from 'node:assert/strict';
import {makeProject} from '../dist/templates.js';
import {simulate,validateProject} from '../dist/core.js';
import {measureResistance} from '../dist/instruments.js';
import {readMeasurement} from '../dist/measurement.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function circuit(parts,connections){const p=makeProject('custom');p.components=parts.map(([id,type,params={}],i)=>({id,type,params,x:i*150,y:0,rotation:0}));p.wires=connections.map(([from,to],i)=>({id:'w'+i,from,to,color:'#ef4444',points:[]}));p.settings.measurement={positive:'source:VCC',negative:'source:GND',current:'load:i'};return p;}
test('Editable diode and zener drops reach the canonical circuit calculation and JSON validation',()=>{
 const p=makeProject('diode-lab');p.components.find(c=>c.id==='forward').params.vf=1.2;p.components.find(c=>c.id==='clamp').params.vz=7.5;
 validateProject(p);const d=simulate(p).dc;assert.ok(d.valid);near(d.voltages.get(d.netlist.net('clamp:K')),7.5);near(d.currents.get('forward'),.0038);
 p.components.find(c=>c.id==='clamp').params.vz=-1;assert.throws(()=>validateProject(p),/aralık/);
});
test('A generic coil relay draws winding current and routes an isolated load to NO, then releases to NC',()=>{
 const p=circuit([['source','supply',{voltage:12}],['coil','supply',{voltage:5}],['relay','coilRelay',{nominalVoltage:5,coilOhms:100}],['load','resistor',{ohms:1000}]], [['coil:VCC','relay:A1'],['coil:GND','relay:A2'],['source:VCC','relay:COM'],['relay:NO','load:1'],['load:2','source:GND']]);
 validateProject(p);let s=simulate(p);assert.ok(s.dc.valid);assert.equal(s.relays.relay,true);near(s.dc.currents.get('relay:coil'),.05);near(s.dc.currents.get('load'),12/1000.05);
 p.components.find(c=>c.id==='coil').params.voltage=2;s=simulate(p);assert.ok(s.dc.valid);assert.equal(s.relays.relay,false);near(s.dc.currents.get('relay:coil'),.02);near(s.dc.currents.get('load'),0);assert.equal(s.dc.contactResults.get('relay').target,'NC');
});
test('Switch opening interrupts real load current; rheostat position changes total series resistance',()=>{
 const p=circuit([['source','supply',{voltage:5}],['sw','switch',{closed:1}],['adjust','rheostat',{ohms:1000,value:50}],['load','resistor',{ohms:1000}]], [['source:VCC','sw:1'],['sw:2','adjust:1'],['adjust:2','load:1'],['load:2','source:GND']]);
 validateProject(p);let d=simulate(p).dc;assert.ok(d.valid);near(d.currents.get('load'),5/1500.05);
 p.components.find(c=>c.id==='adjust').params.value=100;d=simulate(p).dc;near(d.currents.get('load'),5/2000.05);
 p.components.find(c=>c.id==='sw').params.closed=0;d=simulate(p).dc;assert.ok(d.valid);near(d.currents.get('load'),0);near(readMeasurement(d,{...p.settings.measurement,current:'sw:contact'}).current,0);
});
test('Ohmmeter includes rheostat and switch resistance in a de-energized passive network',()=>{
 const p=circuit([['sw','switch',{closed:1}],['adjust','rheostat',{ohms:1000,value:50}],['load','resistor',{ohms:1000}]], [['sw:2','adjust:1'],['adjust:2','load:1']]);p.settings.measurement={positive:'sw:1',negative:'load:2',current:'load:i'};validateProject(p);
 let d=simulate(p).dc;near(measureResistance(p,d,'sw:1','load:2').value,1500.05);p.components[0].params.closed=0;d=simulate(p).dc;assert.equal(measureResistance(p,d,'sw:1','load:2').status,'OL');
});
test('Generic MOSFET channel resistance is used under load',()=>{
 const p=circuit([['source','supply',{voltage:5}],['q','mosfet',{rds:10,gateOn:3}],['load','resistor',{ohms:100}]], [['source:VCC','load:1'],['load:2','q:D'],['source:VCC','q:G'],['source:GND','q:S']]);validateProject(p);const d=simulate(p).dc;assert.ok(d.valid);near(d.currents.get('load'),5/110);near(d.deviceResults.get('q').vds,50/110);
});
test('NPN base current and editable beta determine collector load current',()=>{
 const p=circuit([['source','supply',{voltage:5}],['q','npn',{beta:10,vbe:.7,vceSat:.2}],['base','resistor',{ohms:10000}],['load','resistor',{ohms:100}]], [['source:VCC','load:1'],['load:2','q:C'],['source:VCC','base:1'],['base:2','q:B'],['source:GND','q:E']]);
 validateProject(p);let d=simulate(p).dc;assert.ok(d.valid);near(d.currents.get('load'),.0043);p.components.find(c=>c.id==='q').params.beta=20;d=simulate(p).dc;near(d.currents.get('load'),.0086);assert.equal(d.deviceResults.get('q').state,'active');
});
test('Opamp open loop gain and output resistance affect its loaded voltage',()=>{
 const p=circuit([['source','supply',{voltage:12}],['input','supply',{voltage:.1}],['amp','opamp',{gain:10,outputOhms:10}],['load','resistor',{ohms:1000}]], [['source:VCC','amp:V+'],['source:GND','amp:V-'],['source:GND','input:GND'],['input:VCC','amp:IN1+'],['source:GND','amp:IN1-'],['source:GND','amp:IN2+'],['source:GND','amp:IN2-'],['amp:OUT1','load:1'],['load:2','source:GND']]);
 validateProject(p);const d=simulate(p).dc;assert.ok(d.valid);near(d.voltages.get(d.netlist.net('amp:OUT1')),1000/1010);
});
