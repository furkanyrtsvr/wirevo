import {ParallelLCD,PARALLEL_LCD_TYPES} from './lcd-parallel.js';
import {ReactiveNetwork} from './reactive-network.js';
import {buildNets} from './core.js';
import {solveProjectDC,DC_FAILURES} from './dc-project.js';

/** Zero-delay DC coupling at GPIO events and ADC sample time. Cache only
 * electrical GPIO state, never UI frames. Changed topology/parameters clear it.
 * Reactive companions use bounded backward Euler steps; no SPICE/AC/thermal claim.
 */
export function attachCircuitRuntime(runtime,project,{capacity=128}={}){
  let netlist=buildNets(project),solving=false,dirty=true,solution=null,lastInputs='',revision=1,lastIntegralCycle=runtime.cpu.cycles,windowStart=runtime.cpu.cycles;
  const ledCharge=new Map();let temporal=new ReactiveNetwork(project,runtime.cpu.cycles),previousState=null,disposed=false,clockEpoch=0;
  const parallel=new Map();const reconcileLCD=()=>{for(const c of project.components.filter(c=>PARALLEL_LCD_TYPES.includes(c.type))){if(!parallel.has(c.id)||parallel.get(c.id).type!==c.type)parallel.set(c.id,{type:c.type,controller:new ParallelLCD(c.type==='lcd8p'?8:16)});}for(const id of parallel.keys())if(!project.components.some(c=>c.id===id&&c.type===parallel.get(id).type))parallel.delete(id);};reconcileLCD();
  const controllers=new Map(),observers=new Set(),drivers=new Map();
  const integrate=(cycle=runtime.cpu.cycles)=>{const delta=cycle-lastIntegralCycle;if(delta>0&&solution)for(const[id,led]of solution.ledResults)ledCharge.set(id,(ledCharge.get(id)||0)+Math.max(0,led.current||0)*delta);lastIntegralCycle=cycle;};
  const cache=new Map(),stats={solves:0,cacheHits:0,cycle:0};
  const firmwareState=()=>{
    const pins={};let signature='';
    for(const[pin,p]of Object.entries(runtime.pinMap)){if(p.analogOnly)continue;const port=runtime.ports[p.port],bit=p.index,state=runtime.externalOutputPins?.has(pin)?2:port.pinState(bit);
      // addListener fires before PIN is refreshed; pinState already contains
      // the new output override and DDR. Reading PIN here would lag one edge.
      pins[pin]={state,outputEnabled:state<2,high:state===1,voltage:state===1?5:0,mode:state===3?'INPUT_PULLUP':state<2?'OUTPUT':'INPUT'};signature+=state;
    }return{pins,signature};
  };
  const calculate=(state,reactive=null)=>{const value=solveProjectDC(project,state,netlist,{pwmAverage:false,drivers:[...drivers.values()].flat(),reactive});stats.solves++;return value;};
  const advance=()=>{if(!temporal.active||!previousState)return;let changed=false;while(temporal.cycle<runtime.cpu.cycles){const next=Math.min(runtime.cpu.cycles,temporal.cycle+temporal.stepCycles),dt=(next-temporal.cycle)/16000000;integrate(next);solution=calculate(previousState,temporal.stamps(dt));if(!solution.valid)throw Error('Geçici devre ağı çözülemedi.');temporal.commit(solution,dt,next);changed=true;}if(changed)dirty=true;};
  const armClock=()=>{if(!temporal.active||disposed)return;const epoch=clockEpoch;runtime.cpu.addClockEvent(()=>{if(disposed||epoch!==clockEpoch)return;dirty=true;solve();armClock();},temporal.stepCycles);};
  const solve=()=>{
    if(solving){dirty=true;return solution;}
    solving=true;
    try{
      advance();let iterations=0;
      while(dirty){
        dirty=false;if(++iterations>8)throw Error('DC geri beslemesi aynı çevrimde kararlı hale gelmedi.');
        integrate();const state=firmwareState();let entry=temporal.active?null:cache.get(state.signature);
        if(entry){stats.cacheHits++;cache.delete(state.signature);cache.set(state.signature,entry);}
        else{
          solution=calculate(state,temporal.active?temporal.stamps():null);
          entry={solution,inputsSignature:JSON.stringify(solution.inputs)};if(!temporal.active)cache.set(state.signature,entry);
          if(cache.size>capacity)cache.delete(cache.keys().next().value);
        }
        solution=entry.solution;previousState=state;stats.cycle=runtime.cpu.cycles;
        if(!solution.valid){const fault=solution.diagnostics.find(d=>DC_FAILURES.includes(d.code));throw Error(fault?.code==='ideal-source-conflict'?'Kısa devre: GPIO veya besleme kaynakları çakışıyor.':['contact-nonconvergence','source-feedback-nonconvergence'].includes(fault?.code)?'Sensör/kontak besleme geri beslemesi kararlı değil.':fault?.code==='npn-base-unlimited-current'?'NPN bazında akım sınırlama direnci gerekiyor.':fault?.code==='mosfet-body-unlimited-current'?'MOSFET gövde diyodu ideal kaynağa doğrudan bağlı.':fault?.code==='npn-reverse-unsupported'?'NPN ters C/E bağlantısı bu modelin dışında.':['led-ideal-source-conflict','led-unlimited-current'].includes(fault?.code)?'LED için seri direnç gerekiyor.':'DC ağı çözülemedi; bağlantıları kontrol edin.');}
        if(entry.inputsSignature!==lastInputs){lastInputs=entry.inputsSignature;runtime.replaceInputs(solution.inputs);}
        const lcdDrivers=[...parallel].flatMap(([id,d])=>d.controller.sample(solution,id,runtime.cpu.cycles));if(JSON.stringify(lcdDrivers)!==JSON.stringify(drivers.get('parallel-lcd')||[])){drivers.set('parallel-lcd',lcdDrivers);cache.clear();dirty=true;}
        for(const observer of observers)observer(solution);
      }return solution;
    }finally{solving=false;}
  };
  const mark=()=>{dirty=true;solve();};
  const listeners=[];
  for(const port of Object.values(runtime.ports)){port.addListener(mark);listeners.push([port,mark]);}
  const originalADC=runtime.adc.onADCRead;
  const adcRead=input=>{solve();return originalADC(input);};runtime.adc.onADCRead=adcRead;
  try{solve();armClock();}catch(error){for(const[port,listener]of listeners)port.removeListener(listener);runtime.adc.onADCRead=originalADC;throw error;}
  return{
    deviceController(id,type,create){const key=id+':'+type;if(!controllers.has(key))controllers.set(key,create());return controllers.get(key);},
    setDrivers(owner,next){const before=JSON.stringify(drivers.get(owner)||[]);if(before===JSON.stringify(next))return solution;if(!solving)advance();drivers.set(owner,next);cache.clear();dirty=true;return solve();},
    updateProject(next){advance();integrate();project=next;reconcileLCD();for(const key of controllers.keys())if(!project.components.some(c=>key===c.id+':'+c.type))controllers.delete(key);netlist=buildNets(project);const previous=temporal;temporal=new ReactiveNetwork(project,runtime.cpu.cycles);for(const c of temporal.parts)if(previous.parts.some(old=>old.id===c.id&&old.type===c.type))temporal.history.set(c.id,previous.history.get(c.id)||0);previousState=null;clockEpoch++;armClock();cache.clear();lastInputs='';ledCharge.clear();windowStart=runtime.cpu.cycles;revision++;dirty=true;return solve();},
    solve,
    subscribe(observer){observers.add(observer);return()=>observers.delete(observer);},
    get solution(){return solution;},
    snapshot(consume=false){solve();integrate();const externalDevices=[...drivers.values()].some(d=>d.length>0),span=runtime.cpu.cycles-windowStart,ledAverageCurrents=Object.fromEntries([...solution?.ledResults||[]].map(([id,led])=>[id,span?(ledCharge.get(id)||0)/span:Math.max(0,led.current||0)]));const result={parallelLCD:Object.fromEntries([...parallel].map(([id,d])=>[id,{type:d.type,...d.controller.state(runtime.cpu.cycles)}])),mode:temporal.active?'cycle-transient':'synchronous-dc',externalDevices,reactive:temporal.state(solution),transientSteps:temporal.steps,stepCycles:temporal.stepCycles,stepLimited:temporal.limited,voltages:temporal.active||externalDevices?Object.fromEntries(solution.voltages):undefined,currents:temporal.active||externalDevices?Object.fromEntries(solution.currents):undefined,...(temporal.active||externalDevices?Object.fromEntries(['ledResults','deviceResults','opampResults','contactResults','sensorResults'].map(key=>[key,Object.fromEntries(solution[key]||[])])):{}),diagnostics:temporal.active||externalDevices?solution.diagnostics:undefined,revision,...stats,cachedStates:cache.size,valid:solution?.valid??false,windowCycles:span,ledAverageCurrents};if(consume){ledCharge.clear();windowStart=runtime.cpu.cycles;}return result;},
    dispose(){disposed=true;clockEpoch++;for(const[port,listener]of listeners)port.removeListener(listener);if(runtime.adc.onADCRead===adcRead)runtime.adc.onADCRead=originalADC;},
  };
}
