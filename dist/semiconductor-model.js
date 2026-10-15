import {solveDC} from './dc-solver.js';

// Deliberately bounded DC models. NPN: fixed Vbe, beta and Vce(sat).
// MOSFET: ohmic switch at Vgs>=4V, open below, fixed-Vf body diode.
// These coefficients are explicit approximations, not fitted SPICE models.
export const NPN_MODEL={vbe:.7,beta:100,vceSat:.2};
export const MOS_MODEL={gateOn:4,rds:.035,bodyVf:.7};
export function solveSemiconductorDC(input){
 const {npns=[],mosfets=[],diodes=[]}=input;if(!npns.length&&!mosfets.length&&!diodes.length)return{...solveDC(input),deviceResults:new Map(),deviceSupport:[]};
 const sat=new Set(),on=new Set();let result,converged=false,passes=0;
 const baseId=q=>`$npn:${q.id}:be`,clampId=q=>`$npn:${q.id}:ce`,channelId=q=>`$mos:${q.id}:ds`,bodyId=q=>`$mos:${q.id}:body`;
 for(passes=0;passes<64;passes++){
  const branches=[...input.branches],leds=[...input.leds],clamps=[...input.clamps||[]],controlled=[...input.controlled||[]],nodes=new Set(input.nodes);
  for(const q of diodes){nodes.add(q.a);nodes.add(q.k);leds.push({id:'$diode:'+q.id+':f',a:q.a,k:q.k,vf:q.vf});if(q.vz)leds.push({id:'$diode:'+q.id+':r',a:q.k,k:q.a,vf:q.vz});}
  for(const q of npns){for(const n of[q.c,q.b,q.e])nodes.add(n);leds.push({id:baseId(q),a:q.b,k:q.e,vf:(q.model?.vbe??NPN_MODEL.vbe)});if(q.c===q.e)continue;if(sat.has(q.id))clamps.push({id:clampId(q),a:q.c,b:q.e,volts:(q.model?.vceSat??NPN_MODEL.vceSat)});else controlled.push({id:q.id,a:q.c,b:q.e,control:baseId(q),gain:(q.model?.beta??NPN_MODEL.beta)});}
  for(const q of mosfets){for(const n of[q.d,q.g,q.s])nodes.add(n);leds.push({id:bodyId(q),a:q.s,k:q.d,vf:(q.model?.bodyVf??MOS_MODEL.bodyVf)});if(on.has(q.id))branches.push({id:channelId(q),a:q.d,b:q.s,ohms:(q.model?.rds??MOS_MODEL.rds)});}
  result=solveDC({...input,nodes:[...nodes],branches,leds,clamps,controlled});
  if(!result.converged)break;
  let changed=false;
  for(const q of npns){if(q.c===q.e)continue;const ib=result.ledResults.get(baseId(q))?.current,vce=result.voltages.get(q.c)-result.voltages.get(q.e);if(sat.has(q.id)){const ic=result.clampCurrents.get(clampId(q));if(!(ib>1e-12)||ic>(q.model?.beta??NPN_MODEL.beta)*ib+1e-9){sat.delete(q.id);changed=true;}}else if(ib>1e-12&&Number.isFinite(result.voltages.get(q.c))&&Number.isFinite(result.voltages.get(q.e))&&vce<(q.model?.vceSat??NPN_MODEL.vceSat)-1e-7){sat.add(q.id);changed=true;}}
  for(const q of mosfets){const vg=result.voltages.get(q.g),vs=result.voltages.get(q.s),enabled=Number.isFinite(vg)&&Number.isFinite(vs)&&vg-vs>=(q.model?.gateOn??MOS_MODEL.gateOn);if(enabled!==on.has(q.id)){if(enabled)on.add(q.id);else on.delete(q.id);changed=true;}}
  if(!changed){converged=true;break;}
 }
 const diagnostics=result.diagnostics.map(d=>{const diode=(d.componentIds||[]).find(id=>id.startsWith('$diode:'));if(diode)return{...d,componentIds:d.componentIds.map(id=>id.startsWith('$diode:')?id.split(':')[1]:id),code:['led-ideal-source-conflict','led-unlimited-current'].includes(d.code)?'diode-unlimited-current':d.code};const internal=(d.componentIds||[]).find(id=>id.startsWith('$npn:')||id.startsWith('$mos:'));if(!internal)return d;const npn=internal.startsWith('$npn:'),unlimited=['led-ideal-source-conflict','led-unlimited-current'].includes(d.code);return{...d,componentIds:d.componentIds.map(id=>id.startsWith('$npn:')||id.startsWith('$mos:')?id.split(':')[1]:id),code:unlimited?(npn?'npn-base-unlimited-current':'mosfet-body-unlimited-current'):d.code};});
 if(!converged)diagnostics.push({code:'semiconductor-nonconvergence',message:'The bounded semiconductor DC solve did not converge.'});
 const deviceResults=new Map(),deviceSupport=[];
 for(const q of diodes){const f=result.ledResults.get('$diode:'+q.id+':f'),r=result.ledResults.get('$diode:'+q.id+':r'),current=f?.current===null||r?.current===null?null:(f?.current||0)-(r?.current||0),va=result.voltages.get(q.a),vk=result.voltages.get(q.k),voltage=Number.isFinite(va)&&Number.isFinite(vk)?va-vk:null;deviceResults.set(q.id,{type:q.type,state:current===null?'invalid':current>1e-9?'forward':current< -1e-9?'zener':'off',i:current,voltage});result.currents.set(q.id,current);if(f?.active||r?.active)deviceSupport.push([q.a,q.k]);if(Math.abs(current||0)>.15)diagnostics.push({code:'diode-overcurrent',componentIds:[q.id],message:'Diode current exceeds this 150mA bounded model range; no thermal damage model.'});}
 for(const q of npns){const be=result.ledResults.get(baseId(q)),ib=be?.current??null,vc=result.voltages.get(q.c),ve=result.voltages.get(q.e),vce=Number.isFinite(vc)&&Number.isFinite(ve)?vc-ve:null,ic=q.c===q.e?0:ib===null?null:ib>1e-12?(sat.has(q.id)?result.clampCurrents.get(clampId(q)):(q.model?.beta??NPN_MODEL.beta)*ib):0;
  const state=q.c===q.e?'bypassed':ib===null?'invalid':ib<=1e-12?'cutoff':sat.has(q.id)?'saturation':'active';deviceResults.set(q.id,{type:'npn',state,ib,ic,ie:ib===null||ic===null?null:ib+ic,vce,model:{...NPN_MODEL,...q.model}});
  if(be?.active&&ib>1e-12)deviceSupport.push([q.b,q.e]);if(ib>1e-12)deviceSupport.push([q.c,q.e]);
  if(vce!==null&&vce<-.001)diagnostics.push({code:'npn-reverse-unsupported',componentIds:[q.id],message:'Reverse collector/emitter operation is outside this NPN model.'});
  if(Math.abs(ic||0)>.6)diagnostics.push({code:'npn-overcurrent',componentIds:[q.id],message:'Collector current exceeds 600mA; thermal failure is not simulated.'});
 }
 for(const q of mosfets){const vg=result.voltages.get(q.g),vs=result.voltages.get(q.s),vd=result.voltages.get(q.d),vgs=Number.isFinite(vg)&&Number.isFinite(vs)?vg-vs:null,vds=Number.isFinite(vd)&&Number.isFinite(vs)?vd-vs:null,channel=on.has(q.id)?result.currents.get(channelId(q))||0:0,body=result.ledResults.get(bodyId(q))?.current??null;deviceResults.set(q.id,{type:'mosfet',state:on.has(q.id)?'on':body>1e-9?'body-diode':'off',vgs,vds,id:body===null?null:channel-body,bodyCurrent:body,model:{...MOS_MODEL,...q.model}});
  if(on.has(q.id)||body>1e-9)deviceSupport.push([q.d,q.s]);
  if(vgs===null)diagnostics.push({code:'mosfet-floating-gate',componentIds:[q.id],message:'Gate/source reference is floating; the channel stays off.'});
  else if(vgs>1&&vgs<(q.model?.gateOn??MOS_MODEL.gateOn))diagnostics.push({code:'mosfet-transition-unsupported',componentIds:[q.id],message:'1V<Vgs<4V lies outside the ohmic switch model; channel is treated as off.'});
  if(vgs!==null&&Math.abs(vgs)>16)diagnostics.push({code:'mosfet-gate-overvoltage',componentIds:[q.id],message:'Absolute gate/source voltage exceeds 16V; breakdown is not simulated.'});
 }
 // Internal BE/body diodes are not LEDs and must not enter display integration.
 for(const o of input.opamps||[])if(result.opampResults.get(o.id)?.voltage!==null)deviceSupport.push([o.out,o.ref]);
 const ledResults=new Map(input.leds.map(l=>[l.id,result.ledResults.get(l.id)]));
 return{...result,ledResults,leds:ledResults,deviceResults,deviceSupport,diagnostics,converged:result.converged&&converged,devicePasses:Math.min(64,passes+1)};
}
