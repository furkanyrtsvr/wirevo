// Electrical companions only. No MCU-specific registers or ideal hidden wires.
export function stampExpansion(c,{net,branch,sensors,addNode,leds,npns,mosfets,relays}){
 const p=c.params||{},type=c.type,out=(pin,options)=>sensors.push({id:c.id+':'+pin,vcc:addNode(net(c,'VCC')),gnd:addNode(net(c,'GND')),out:addNode(net(c,pin)),min:2.7,max:5.5,ohms:50,...options});
 if(type==='tact6')return true;
 if(type==='irEmitter'){leds.push({id:c.id+':ir',a:addNode(net(c,'A')),k:addNode(net(c,'K')),vf:1.2});return true;}
 if(type==='rs485'||type==='irReceiver'||type==='i2sMic'||type==='i2sAmp'){branch(c.id+':supply',net(c,'VCC'),net(c,'GND'),10000);return true;}
 if(type==='rgbled'){for(const[pin,vf]of [['R',1.9],['G',2.7],['B',2.8]])leds.push({id:c.id+':'+pin,a:addNode(net(c,pin)),k:addNode(net(c,'K')),vf});return true;}
 if(type==='segment1'||type==='segment4'){for(let digit=0;digit<(type==='segment4'?4:1);digit++)for(const s of ['A','B','C','D','E','F','G','DP'])leds.push({id:c.id+':'+digit+':'+s,a:addNode(net(c,s)),k:addNode(net(c,type==='segment1'?'K':'K'+(digit+1))),vf:1.9});return true;}
 if(type==='ledbar'){for(let i=0;i<10;i++)leds.push({id:c.id+':'+i,a:addNode(net(c,'A'+i)),k:addNode(net(c,'K'+i)),vf:1.9});return true;}
 if(type==='dcmotor'){branch(c.id+':winding',net(c,'P'),net(c,'N'),p.ohms??100);return true;}
 if(type==='buzzerPassive'){branch(c.id+':piezo',net(c,'P'),net(c,'N'),100000);return true;}
 if(type==='buzzerActive'){branch(c.id+':supply',net(c,'VCC'),net(c,'GND'),1000);branch(c.id+':input',net(c,'IN'),net(c,'GND'),100000);return true;}
 if(type==='pnp'){npns.push({id:c.id,c:net(c,'C'),b:net(c,'B'),e:net(c,'E'),polarity:-1,model:p});return true;}
 if(type==='pmos'){mosfets.push({id:c.id,d:net(c,'D'),g:net(c,'G'),s:net(c,'S'),polarity:-1,model:p});return true;}
 if(type==='optocoupler'){leds.push({id:c.id+':input',a:addNode(net(c,'A')),k:addNode(net(c,'K')),vf:1.2});sensors.push({id:c.id+':collector',vcc:net(c,'C'),gnd:net(c,'E'),out:addNode(net(c,'C')),min:0,max:30,ohms:50,compute:(s,v,g)=>(s.ledResults.get(c.id+':input')?.current||0)>.0001?g:null});return true;}
 if(['water','rain','soilProbe'].includes(type)){const level=p.level??50;out('AO',{fraction:type==='water'?level/100:1-level/100,ohms:100});if(type!=='water'){branch(c.id+':pullup',net(c,'VCC'),net(c,'DO'),10000);out('DO',{openDrain:true,active:level>=(p.threshold??50)});}return true;}
 if(type==='levelShift'){for(let i=0;i<4;i++){branch(c.id+':low-pullup'+i,net(c,'LV'),net(c,'L'+i),10000);branch(c.id+':high-pullup'+i,net(c,'HV'),net(c,'H'+i),10000);mosfets.push({id:c.id+':'+i,g:net(c,'LV'),s:net(c,'L'+i),d:net(c,'H'+i),model:{gateOn:1,rds:1}});}return true;}
 if(type==='cd4067'){branch(c.id+':load',net(c,'VCC'),net(c,'GND'),100000);for(let i=0;i<16;i++){const gate=addNode('$mux:'+c.id+':'+i);sensors.push({id:c.id+':gate'+i,vcc:net(c,'VCC'),gnd:net(c,'GND'),out:gate,min:2.7,max:6,ohms:1,compute:(s,high,g)=>{const at=pin=>s.voltages.get(net(c,pin));return at('EN')<=.3*high&&['S0','S1','S2','S3'].every((pin,b)=>{const n=at(pin);return Number.isFinite(n)&&(i&(1<<b)?n>=.7*high:n<=.3*high);})?high:g;}});relays.push({id:c.id+':mux'+i,vcc:net(c,'VCC'),gnd:net(c,'GND'),input:gate,com:net(c,'SIG'),no:net(c,'C'+i),nc:addNode('$muxoff:'+c.id+':'+i),nominalVoltage:2.7,contactOhms:70});}return true;}
 if(['a4988','drv8825','tb6612'].includes(type)){branch(c.id+':logic',net(c,'VCC'),net(c,'GND'),10000);if(type==='tb6612')for(const pair of ['A','B'])for(const pin of [1,2])out(pair+'O'+pin,{vcc:net(c,'VM'),min:2.5,max:15,compute:(s,v,g)=>{const val=p=>s.voltages.get(net(c,p)),hi=p=>val(p)>=2,lo=p=>val(p)<=.8;if(!hi('STBY')||!Number.isFinite(val('PWM'+pair)))return null;if(lo('PWM'+pair))return g;const a=val(pair+'IN1'),b=val(pair+'IN2');if(![a,b].every(Number.isFinite))return null;return (pin===1?a:b)>=2?v-.1:g+.1;}});return true;}
 return false;
}
