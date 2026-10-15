import {solveDC} from './dc-solver.js';

export const GENERATOR_HZ=16000000;
export function generatorVoltage(params={},cycle=0){
 const frequency=params.frequency??10,phase=((cycle/GENERATOR_HZ*frequency)%1+1)%1;
 const wave=params.wave??'square',unit=wave==='sine'?Math.sin(phase*2*Math.PI):wave==='triangle'?1-4*Math.abs(phase-.5):phase<(params.duty??50)/100?1:-1;
 return (params.offset??2.5)+(params.amplitude??2.5)*unit;
}
// Square edges are scheduled individually. Continuous waves use 64 samples
// per period, bounded at 10 us. All times are AVR cycles, never browser frames.
export function attachInstrumentRuntime(runtime,engine,initial){
 let project=initial,disposed=false,epoch=0;
 const render=()=>engine.setDrivers('instruments',project.components.filter(c=>c.type==='signalgen'&&(c.params.enabled??1)).map(c=>({endpoint:c.id+':OUT',voltage:generatorVoltage(c.params,runtime.cpu.cycles),ohms:50})));
 const schedule=()=>{
  if(disposed)return;const generators=project.components.filter(c=>c.type==='signalgen'&&(c.params.enabled??1));if(!generators.length)return;
  const cycle=runtime.cpu.cycles;let delay=Infinity;
  for(const c of generators){const period=GENERATOR_HZ/(c.params.frequency??10);if((c.params.wave??'square')==='square'){const phase=((cycle%period)+period)%period,edge=period*(c.params.duty??50)/100;delay=Math.min(delay,Math.max(1,Math.ceil((phase<edge-1e-7?edge:period)-phase)));}else delay=Math.min(delay,Math.max(160,Math.round(period/64)));}
  const token=epoch;runtime.cpu.addClockEvent(()=>{if(disposed||token!==epoch)return;render();schedule();},delay);
 };
 render();schedule();
 return{updateProject(next){project=next;epoch++;render();schedule();},dispose(){disposed=true;epoch++;engine.setDrivers('instruments',[]);}};
}
const passiveTypes=new Set(['switch','rheostat','resistor','ldr','pot','inductor','spdt','button','breadboard','capacitor','multimeter','ohmmeter']);
/** Resistance is a separate, de-energized 1 V test of the passive network.
 * Never infer ohms from the running circuit's V/I. Active devices are rejected.
 */
export function measureResistance(project,solution,positive,negative){
 const net=solution.netlist.net,a=net(positive),b=net(negative);if(a===undefined||b===undefined)return{value:null,status:'OL'};
 const branches=[];const add=(id,x,y,ohms)=>branches.push({id,a:net(id.split(':')[0]+':'+x),b:net(id.split(':')[0]+':'+y),ohms});
 for(const c of project.components){if(c.type==='switch'){if(c.params.closed??1)add(c.id,'1','2',.05);}else if(c.type==='rheostat')add(c.id,'1','2',Math.max(.001,(c.params.ohms??1000)*(c.params.value??50)/100));else if(c.type==='resistor')add(c.id,'1','2',c.params.ohms);else if(c.type==='ldr')add(c.id,'1','2',10000*(100/(c.params.lux??100))**.7);else if(c.type==='inductor')add(c.id,'1','2',c.params.dcr??1);else if(c.type==='pot'){const f=(c.params.value??50)/100,r=c.params.ohms||10000;add(c.id+':upper','VCC','OUT',Math.max(1e-6,r*(1-f)));add(c.id+':lower','OUT','GND',Math.max(1e-6,r*f));}else if(c.type==='spdt')add(c.id,'2',c.params.position==='right'?'3':'1',.05);else if(c.type==='multimeter'&&c.params.mode==='current')add(c.id,'A','COM',.1);else if(c.type==='multimeter'&&(c.params.mode??'voltage')==='voltage')add(c.id,'V','COM',1e7);}
 const reached=new Set([a,b]);for(let changed=true;changed;){changed=false;for(const r of branches)if(reached.has(r.a)||reached.has(r.b))for(const n of[r.a,r.b])if(!reached.has(n)){reached.add(n);changed=true;}}
 // A source at 0 V is still an energized source. Ground alone is acceptable.
 for(const c of project.components){if(c.type==='board'){for(const [endpoint,node]of solution.netlist.groups.flatMap(g=>g.map(e=>[e,net(e)])))if(endpoint.startsWith(c.id+':')&&!/^GND(?:\.\d)?$/.test(endpoint.split(':')[1])&&reached.has(node)&&solution.known.has(node))return{value:null,status:'LIVE'};}else if(c.type==='supply'||c.type==='signalgen'){if(reached.has(net(c.id+':'+(c.type==='supply'?'VCC':'OUT')))&&(c.type==='supply'||(c.params.enabled??1)))return{value:null,status:'LIVE'};}else if(!passiveTypes.has(c.type)&&solution.netlist.groups.some(g=>g.some(e=>e.startsWith(c.id+':'))&&reached.has(net(g[0]))))return{value:null,status:'ACTIVE'};}
 for(const node of reached){const v=solution.voltages.get(node);if(Number.isFinite(v)&&Math.abs(v)>.05)return{value:null,status:'LIVE'};}
 if(a===b)return{value:0,status:'OK'};
 const test=solveDC({known:new Map([[a,1],[b,0]]),branches:branches.filter(r=>reached.has(r.a)&&reached.has(r.b))});if(!test.converged)return{value:null,status:'OL'};
 let amps=0;for(const r of branches){const i=test.currents.get(r.id);if(Number.isFinite(i)){if(r.a===a)amps+=i;if(r.b===a)amps-=i;}}
 return amps>1e-12?{value:1/amps,status:'OK'}:{value:null,status:'OL'};
}
export function readInstrument(project,c,solution){
 if(!solution?.valid)return{value:null,status:'ERR',unit:''};
 if(c.type==='ohmmeter'||c.type==='multimeter'&&c.params.mode==='resistance'){const pins=c.type==='ohmmeter'?['P','N']:['V','COM'];return{...measureResistance(project,solution,c.id+':'+pins[0],c.id+':'+pins[1]),unit:'Ω'};}
 if(c.type==='multimeter'&&c.params.mode==='current'){const v=solution.currents.get(c.id+':ammeter');return{value:Number.isFinite(v)?v:null,status:Number.isFinite(v)?Math.abs(v)>10?'OVER':'OK':'OL',unit:'A'};}
 const pins=c.type==='signalgen'?['OUT','GND']:['V','COM'],a=solution.netlist.net(c.id+':'+pins[0]),b=solution.netlist.net(c.id+':'+pins[1]),vp=solution.voltages.get(a),vn=solution.voltages.get(b),v=a===b?0:Number.isFinite(vp)&&Number.isFinite(vn)?vp-vn:null;
 return{value:v,status:v===null?'OL':c.type==='signalgen'&&!(c.params.enabled??1)?'OFF':'OK',unit:'V'};
}
export function instrumentText(reading){if(reading.status!=='OK')return reading.status;const n=reading.value,u=reading.unit;if(u==='Ω'&&Math.abs(n)>=1e6)return(n/1e6).toFixed(3)+' MΩ';if(u==='Ω'&&Math.abs(n)>=1000)return(n/1000).toFixed(3)+' kΩ';if(u==='A'&&Math.abs(n)<1)return(n*1000).toFixed(3)+' mA';return n.toFixed(u==='Ω'?2:3)+' '+u;}
