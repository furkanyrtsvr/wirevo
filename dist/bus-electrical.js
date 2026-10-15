export function pinVoltage(dc,id,pin){return dc.voltages.get(dc.netlist.net(id+':'+pin));}
export function poweredDevice(dc,id,{vcc='VCC',gnd='GND',min=3,max=5.5}={}){const v=pinVoltage(dc,id,vcc),g=pinVoltage(dc,id,gnd);return{powered:!!(dc.valid&&Number.isFinite(v)&&Number.isFinite(g)&&Math.abs(g)<.02&&v-g>=min&&v-g<=max),voltage:Number.isFinite(v)&&Number.isFinite(g)?v-g:null,ground:g};}
export const logic=(value,supply=5)=>!Number.isFinite(value)?null:value<=.3*supply?false:value>=.7*supply?true:null;
