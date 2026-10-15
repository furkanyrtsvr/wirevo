const HZ=16000000;
export function attachPulseRuntime(runtime,engine,initial){
 let project=initial,disposed=false,refreshing=false;const states=new Map();
 const refresh=()=>{
  if(disposed||refreshing)return;refreshing=true;const drivers=[],cycle=runtime.cpu.cycles;
  try{for(const c of project.components.filter(c=>['hcSr04','servo'].includes(c.type))){
   let s=states.get(c.id);if(!s){s={type:c.type,powered:false,high:false,rise:null,previousRise:null,period:null,pulse:null,angle:90,valid:false,echo:false,busy:false,captures:0,lastCapture:-Infinity,epoch:0};states.set(c.id,s);}
   const sol=engine.solution,n=sol.netlist.net,v=sol.voltages.get(n(c.id+':VCC')),g=sol.voltages.get(n(c.id+':GND')),supply=v-g,powered=Number.isFinite(v)&&Number.isFinite(g)&&supply>=(c.type==='servo'?4.5:4.5)&&supply<=5.5;
   if(!powered){if(s.powered)s.epoch++;s.powered=false;s.echo=false;s.busy=false;s.high=false;s.rise=null;s.valid=false;continue;}s.powered=true;
   const signal=sol.voltages.get(n(c.id+':'+(c.type==='servo'?'SIG':'TRIG'))),high=Number.isFinite(signal)&&signal-g>=2.5;
   if(high&&!s.high){if(c.type==='servo'){s.period=s.previousRise===null?null:(cycle-s.previousRise)/16;s.previousRise=cycle;}s.rise=cycle;}
   if(!high&&s.high&&s.rise!==null){s.pulse=(cycle-s.rise)/16;
    if(c.type==='servo'){const min=c.params.minPulse??544,max=c.params.maxPulse??2400;s.valid=s.pulse>=min&&s.pulse<=max&&s.period!==null&&s.period>=10000&&s.period<=30000;if(s.valid){s.angle=(s.pulse-min)/(max-min)*(c.params.maxAngle??180);s.captures++;}}
    else if(s.pulse>=10&&!s.busy&&cycle-s.lastCapture>=.06*HZ){s.lastCapture=cycle;s.captures++;s.distance=c.params.distance??100;s.busy=true;const token=++s.epoch;
     // Eight 40 kHz burst cycles: 200 us model start delay. Width is cm*58 us.
     const valid=()=>!disposed&&s.epoch===token&&s.powered&&project.components.some(p=>p.id===c.id&&p.type==='hcSr04');
     if(c.params.reflect??1){runtime.cpu.addClockEvent(()=>{if(!valid())return;s.echo=true;refresh();runtime.cpu.addClockEvent(()=>{if(!valid())return;s.echo=false;s.busy=false;refresh();},Math.round(s.distance*58*16));},3200);}else runtime.cpu.addClockEvent(()=>{if(valid()){s.busy=false;refresh();}},.06*HZ);
    }
   }s.high=high;
   if(c.type==='hcSr04')drivers.push({endpoint:c.id+':ECHO',voltage:g+(s.echo?supply:0),ohms:50});
  }engine.setDrivers('pulse-devices',drivers);}finally{refreshing=false;}
 };
 const unsubscribe=engine.subscribe(refresh);refresh();
 return{updateProject(next){project=next;for(const[id,s]of states)if(!project.components.some(c=>c.id===id&&c.type===s.type)){s.epoch++;states.delete(id);}refresh();},snapshot(){return Object.fromEntries([...states].map(([id,s])=>[id,{type:s.type,powered:s.powered,pulse:s.pulse,period:s.period,valid:s.valid,angle:s.angle,echo:s.echo,busy:s.busy,captures:s.captures,distance:s.distance}]));},dispose(){disposed=true;unsubscribe();engine.setDrivers('pulse-devices',[]);}};
}
