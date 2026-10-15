export const BASIC_TYPES=['lm35','mq2','flame','sound','pir','irObstacle','tilt','hall','joystick','thermistor','soilCap'];
export const ntcResistance=(temperature=25,r25=10000,beta=3950)=>r25*Math.exp(beta*(1/(temperature+273.15)-1/298.15));
// Generic breakouts have explicit, editable polarity. AO/DO are electrical
// outputs; normalized environmental inputs do not claim real gas/dB calibration.
export function stampBasicDevices(c,{net,branch,sensors,addNode,drivers}){
 if(!BASIC_TYPES.includes(c.type))return false;
 const p=c.params,vcc=addNode(net(c,'VCC')),gnd=addNode(net(c,'GND'));
 const output=(pin,definition,id=c.id)=>{if(drivers.some(d=>d.endpoint===c.id+':'+pin))return;sensors.push({id,vcc,gnd,out:addNode(net(c,pin)),min:c.type==='hall'?4.5:c.type==='mq2'?4.9:3.3,max:c.type==='hall'?24:c.type==='mq2'?5.1:5.5,ohms:50,...definition});};
 const pullup=(pin,ohms=10000)=>branch(c.id+':'+pin+'-pullup',vcc,net(c,pin),ohms);
 const digital=(pin,active)=>{pullup(pin);output(pin,{openDrain:true,active:p.activeLow===0?!active:active},c.id+':digital');};
 if(c.type==='lm35')output('OUT',{absolute:.01*(p.temperature??25),min:4,max:30,ohms:1});
 else if(c.type==='mq2'){const rs=p.rs??10000,rl=p.rl??10000;branch(c.id+':rs',vcc,net(c,'AO'),rs);branch(c.id+':rl',net(c,'AO'),gnd,rl);digital('DO',rl/(rs+rl)*100>=(p.threshold??50));}
 else if(c.type==='thermistor'){const r=ntcResistance(p.temperature??25,p.r25??10000,p.beta??3950),fixed=p.fixed??10000;branch(c.id+':fixed',vcc,net(c,'AO'),fixed);branch(c.id+':ntc',net(c,'AO'),gnd,r);digital('DO',(p.temperature??25)>=(p.threshold??30));}
 else if(c.type==='joystick'){for(const[pin,key]of[['VRX','x'],['VRY','y']]){const f=(p[key]??50)/100;branch(c.id+':'+pin+'-upper',vcc,net(c,pin),Math.max(1e-6,10000*(1-f)));branch(c.id+':'+pin+'-lower',net(c,pin),gnd,Math.max(1e-6,10000*f));}pullup('SW');if(p.switchClosed)branch(c.id+':switch',net(c,'SW'),gnd,.05);}
 else if(c.type==='pir')output('OUT',{absolute:p.motion?3.3:0,min:5,max:20});
 else if(c.type==='soilCap')output('AO',{fraction:.8-.6*(p.moisture??50)/100,ohms:100});
 else if(['flame','sound'].includes(c.type)){const level=p.level??0;output('AO',{fraction:1-level/100});digital('DO',level>=(p.threshold??50));}
 else digital(c.type==='irObstacle'?'OUT':'DO',Boolean(p.active));
 return true;
}
// PIR high/hold/inhibit is a timed state machine, including H/L retrigger.
// Warm-up is an explicit model setting; default is zero for immediate editing.
export function attachBasicRuntime(runtime,engine,initial){
 let project=initial,epoch=0,disposed=false,refreshing=false,scheduledAt=Infinity;const states=new Map();
 const refresh=()=>{
  if(disposed||refreshing)return;refreshing=true;let next=Infinity;const drivers=[],cycle=runtime.cpu.cycles;
  try{for(const c of project.components.filter(c=>c.type==='pir')){
   let s=states.get(c.id);if(!s){s={phase:'warmup',until:cycle+(c.params.warmup??0)*16000000,previous:false,powered:false};states.set(c.id,s);}
   const sol=engine.solution,n=sol.netlist.net,v=sol.voltages.get(n(c.id+':VCC')),g=sol.voltages.get(n(c.id+':GND')),powered=Number.isFinite(v)&&Number.isFinite(g)&&v-g>=5&&v-g<=20,motion=!!c.params.motion,hold=(c.params.hold??5)*16000000,inhibit=(c.params.inhibit??2)*16000000;
   if(!powered){s.powered=false;s.previous=false;s.phase='off';s.until=Infinity;continue;}
   if(!s.powered){s.powered=true;s.phase='warmup';s.until=cycle+(c.params.warmup??0)*16000000;s.previous=false;}
   if(s.phase==='high'&&(c.params.retrigger??1)&&motion)s.until=Math.max(s.until,cycle+hold);
   if(s.phase!=='idle'&&cycle>=s.until){if(s.phase==='high'){s.phase='inhibit';s.until=cycle+inhibit;}else{s.phase='idle';s.until=Infinity;}}
   if(s.phase==='idle'&&motion){s.phase='high';s.until=cycle+hold;}
   else if(s.phase==='high'&&(c.params.retrigger??1)&&motion&&!s.previous)s.until=cycle+hold;
   // H maintains high while the simulated movement remains active.
   if(s.phase==='high'&&(c.params.retrigger??1)&&motion)s.until=Math.max(s.until,cycle+hold);
   s.previous=motion;if(s.phase!=='idle')next=Math.min(next,s.until);
   drivers.push({endpoint:c.id+':OUT',voltage:g+(s.phase==='high'?3.3:0),ohms:50});
  }engine.setDrivers('basic-devices',drivers);}finally{refreshing=false;}
  if(next===scheduledAt)return;scheduledAt=next;const token=++epoch;if(Number.isFinite(next))runtime.cpu.addClockEvent(()=>{if(!disposed&&epoch===token){scheduledAt=Infinity;refresh();}},Math.max(1,Math.ceil(next-cycle)));
 };
 const unsubscribe=engine.subscribe(refresh);refresh();
 return{updateProject(next){project=next;for(const id of states.keys())if(!project.components.some(c=>c.id===id&&c.type==='pir'))states.delete(id);refresh();},snapshot(){return Object.fromEntries([...states].map(([id,s])=>[id,{phase:s.phase,powered:s.powered,remaining:Math.max(0,(s.until-runtime.cpu.cycles)/16000000)}]));},dispose(){disposed=true;epoch++;unsubscribe();engine.setDrivers('basic-devices',[]);}};
}
