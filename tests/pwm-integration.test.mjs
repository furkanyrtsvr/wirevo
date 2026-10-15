import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {UnoRuntime} from '../dist/uno-runtime.js';import {attachGPIOEdges} from '../dist/gpio-edges.js';
import {attachCircuitRuntime} from '../dist/circuit-runtime.js';import {makeProject} from '../dist/templates.js';import {simulate} from '../dist/core.js';
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures/pwm-phase.json',import.meta.url)));
function project(){const p=makeProject();p.components=p.components.filter(c=>c.type==='board');p.components.push({id:'r',type:'resistor',x:500,y:50,rotation:0,params:{ohms:220}},{id:'led',type:'led',x:650,y:50,rotation:0,params:{color:'red'}});p.wires=[['uno:D3','r:1'],['r:2','led:A'],['led:K','uno:D11']].map(([from,to],i)=>({id:'w'+i,from,to,color:'#14b8a6',points:[]}));return p;}
function advance(r,n){while(n>0){const before=r.cpu.cycles;r.stepCycles(Math.min(n,160000));n-=r.cpu.cycles-before;}}
function reference(packet,start,end){const level={...packet.startLevels};let cycle=start,charge=0;const current=()=>level.D3&&!level.D11?3/220:0;for(const e of packet.events){charge+=current()*(e.cycle-cycle);level[e.pin]=e.high;cycle=e.cycle;}charge+=current()*(end-cycle);return charge/(end-start);}
for(const mode of['aligned','inverted'])test(`Real timer PWM ${mode}: current integral agrees with individual pad edges, not averaged voltages`,()=>{
 const p=project(),r=new UnoRuntime(fixtures[mode].hex),g=attachGPIOEdges(r,{pins:['D3','D11'],capacity:8192}),engine=attachCircuitRuntime(r,p);
 advance(r,200000);g.drain();engine.snapshot(true);const start=r.cpu.cycles;advance(r,1600000);const packet=g.drain(),frame=engine.snapshot(true),expected=reference(packet,start,r.cpu.cycles);
 assert.equal(packet.dropped,0);assert.ok(packet.events.length>150);assert.ok(frame.cachedStates<=128);assert.ok(Math.abs(frame.ledAverageCurrents.led-expected)<1e-10);
 if(mode==='aligned')assert.equal(expected,0);else assert.ok(expected>.0067&&expected<.007);
 const ui=simulate(p,r.cpu.cycles/16000000,{...r.snapshot(),dc:frame});assert.ok(Math.abs(ui.leds.led.current-expected*1000)<1e-7);assert.ok(!ui.issues.some(i=>i.startsWith('Çoklu PWM')));
});
test('Consuming unequal report windows preserves weighted PWM current and topology updates discard stale charge',()=>{
 const p=project(),r=new UnoRuntime(fixtures.inverted.hex),g=attachGPIOEdges(r,{pins:['D3','D11']}),e=attachCircuitRuntime(r,p);advance(r,200000);g.drain();e.snapshot(true);const start=r.cpu.cycles;
 advance(r,123457);const a=e.snapshot(true);advance(r,345678);const b=e.snapshot(true);const expected=reference(g.drain(),start,r.cpu.cycles),weighted=(a.ledAverageCurrents.led*a.windowCycles+b.ledAverageCurrents.led*b.windowCycles)/(a.windowCycles+b.windowCycles);
 assert.ok(Math.abs(weighted-expected)<1e-10);assert.equal(e.snapshot().windowCycles,0);const next=structuredClone(p);next.components.find(c=>c.id==='r').params.ohms=1000;e.updateProject(next);assert.equal(e.snapshot().windowCycles,0);advance(r,1600000);const c=e.snapshot(true);assert.ok(c.ledAverageCurrents.led>.0014&&c.ledAverageCurrents.led<.0016);
});
