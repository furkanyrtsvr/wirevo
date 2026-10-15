import {solveSemiconductorDC} from './semiconductor-model.js';

// A bounded, zero-delay DC contact model. 50mΩ is an explicit approximation;
// Module coil current, bounce, operate/release time and AC ratings are not simulated.
// Generic coil relays stamp their own DC winding resistance; inductance is omitted.
export const CONTACT_OHMS=.05;
export function solveContactDC(input,relays=[],switches=[],sensors=[]){
 const energized=new Set(),sensorOutputs=new Map();let result,branches,known,sourceDiagnostics=[],sensorResults=new Map(),states=new Map(),stable=false,passes=0;
 for(passes=0;passes<16;passes++){
  branches=[...input.branches];states=new Map();known=new Map(input.known);sourceDiagnostics=[];
  for(const s of sensors)if(sensorOutputs.has(s.id)){const volts=sensorOutputs.get(s.id);if(s.ohms){const source='$sensor:'+s.id;known.set(source,volts);branches.push({id:source,a:source,b:s.out,ohms:s.ohms});}else if(known.has(s.out)&&Math.abs(known.get(s.out)-volts)>.02)sourceDiagnostics.push({code:'ideal-source-conflict',componentIds:[s.id],node:s.out,message:'Sensor output conflicts with an ideal source.'});else known.set(s.out,volts);}
  const add=(c,a,b,target,on=false,powered=false)=>{branches.push({id:c.id+':contact',a,b,ohms:CONTACT_OHMS});states.set(c.id,{target,energized:on,powered,ohms:CONTACT_OHMS});};
  for(const s of switches)add(s,s.common,s[s.position==='right'?'right':'left'],s.position==='right'?'3':'1');
  for(const r of relays){const on=energized.has(r.id);add(r,r.com,on?r.no:r.nc,on?'NO':'NC',on);}
  result=solveSemiconductorDC({...input,known,branches});if(!result.converged)break;
  let changed=false;
  for(const r of relays){const v=result.voltages.get(r.vcc),g=result.voltages.get(r.gnd),i=result.voltages.get(r.input),powered=Number.isFinite(v)&&Number.isFinite(g)&&(r.coil?Math.abs(v-g):v-g)>=(r.nominalVoltage??5)*.9;
   const on=powered&&(r.coil||Number.isFinite(i)&&(r.activeHigh!==false?i-g>=2.5:i-g<=2.0));
   states.get(r.id).powered=powered;
   if(on!==energized.has(r.id)){if(on)energized.add(r.id);else energized.delete(r.id);changed=true;}
  }
  sensorResults=new Map();for(const s of sensors){const v=result.voltages.get(s.vcc),g=result.voltages.get(s.gnd),powered=Number.isFinite(v)&&Number.isFinite(g)&&v-g>=(s.min??3)&&v-g<=(s.max??30),output=s.compute?(powered?s.compute(result,v,g):null):powered&&(!s.openDrain||s.active)?g+(s.openDrain?0:s.absolute??(v-g)*s.fraction):null; sensorResults.set(s.id,{powered,output:powered?result.voltages.get(s.out):null,openDrain:!!s.openDrain,sinking:powered&&!!s.openDrain&&!!s.active});const previous=sensorOutputs.get(s.id);
   if(output===null){if(sensorOutputs.delete(s.id))changed=true;}else if(previous===undefined||Math.abs(output-previous)>1e-7){sensorOutputs.set(s.id,output);changed=true;}
  }
  if(!changed){stable=true;break;}
 }
 const diagnostics=[...result.diagnostics,...sourceDiagnostics];
 if(!stable)diagnostics.push({code:sensors.length?'source-feedback-nonconvergence':'contact-nonconvergence',componentIds:[...relays,...sensors].map(r=>r.id),message:'The bounded contact/control DC iteration did not converge.'});
 for(const b of branches.filter(b=>b.id.endsWith(':contact'))){if(known.has(b.a)&&known.has(b.b)&&Math.abs(known.get(b.a)-known.get(b.b))>.02)diagnostics.push({code:'contact-source-conflict',componentIds:[b.id.split(':')[0]],message:'A closed contact connects incompatible ideal sources.'});}
 return{...result,known,branches,sensorResults,contactResults:states,contactPasses:Math.min(16,passes+1),diagnostics,converged:result.converged&&stable};
}
