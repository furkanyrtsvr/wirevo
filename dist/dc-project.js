import {boardDefinition,boardGPIO} from './board-hardware.js';
import {stampTFT} from './tft-runtime.js';
import {stampActuator} from './actuator-devices.js';
import {stampDigital} from './digital-devices.js';
import {deviceDefinition} from './device-registry.js';
import {solveContactDC} from './contact-model.js';
import {generatorVoltage} from './instruments.js';
import {stampBasicDevices} from './basic-devices.js';

export const DC_FAILURES=['ideal-source-conflict','led-ideal-source-conflict','led-unlimited-current','dc-nonconvergence','singular-network','ideal-clamp-conflict','semiconductor-nonconvergence','diode-unlimited-current','npn-base-unlimited-current','mosfet-body-unlimited-current','npn-reverse-unsupported','contact-source-conflict','contact-nonconvergence','source-feedback-nonconvergence'];

const GPIO=[...Array.from({length:14},(_,i)=>`D${i}`),...Array.from({length:6},(_,i)=>`A${i}`)];
const RAILS={'GND':0,'GND.1':0,'GND.2':0,'5V':5,'3.3V':3.3,'IOREF':5};

/** Uses the owner's canonical netlist (including breadboard/mount connections).
 * No dependency on dist/core.js or drawing geometry. Currents are amperes.
 */
export function solveProjectDC(project,firmware,netlist,{pwmAverage=true,drivers=[],reactive=null,board:customBoard=null}={}){
  if(!netlist?.net)throw new Error('A canonical netlist.net(endpoint) function is required.');
  const board=project.components.find(c=>c.type==='board'),definition=board&&(customBoard||boardDefinition(board)),GPIO=definition?boardGPIO(definition):[],ioVoltage=definition?.ioVoltage??5;
  const net=(c,p)=>netlist.net(`${typeof c==='string'?c:c.id}:${p}`);
  const build=(overrides={})=>{
    const known=new Map(),branches=[],leds=[],npns=[],mosfets=[],diodes=[],relays=[],switches=[],sensors=[],opamps=[],nodes=new Set(),diagnostics=[],pullups=new Map();
    const addNode=n=>{if(n!==undefined)nodes.add(n);return n;};
    const set=(n,value,id)=>{if(n===undefined)return;addNode(n);if(known.has(n)&&Math.abs(known.get(n)-value)>.02)diagnostics.push({code:'ideal-source-conflict',componentIds:[id],node:n,message:'Incompatible ideal voltage sources share one net.'});else known.set(n,value);};
    const branch=(id,a,b,ohms)=>{if(a===undefined||b===undefined)return;addNode(a);addNode(b);branches.push({id,a,b,ohms});};
    if(board){
      for(const p of definition.pins)if(p.voltage!==undefined)set(net(board,p.id),p.voltage,board.id);
      for(const pin of GPIO){const n=addNode(net(board,pin)),state=firmware?.pins?.[pin];if(!state)continue;
        if(state.outputEnabled)set(n,overrides[pin]??state.voltage??(state.high?ioVoltage:0),board.id);
        else if(state.state===3||state.mode==='INPUT_PULLUP'){const id=`$pullup:${pin}`;branch(id,net(board,definition.supplyPin||(definition.id==='pro-mini'?'VCC':'5V')),n,30000);pullups.set(pin,id);}
      }
    }
    for(const c of project.components){
      if(c.type==='supply'){set(net(c,'VCC'),c.params.voltage??5,c.id);set(net(c,'GND'),0,c.id);}
      else if(c.type==='signalgen'){set(net(c,'GND'),0,c.id);if((c.params.enabled??1)&&!drivers.some(d=>d.endpoint===c.id+':OUT')){const source='$driver:'+c.id+':OUT';set(source,generatorVoltage(c.params),c.id);branch(source,source,net(c,'OUT'),50);}}
      else if(c.type==='multimeter'){if(c.params.mode==='current')branch(c.id+':ammeter',net(c,'A'),net(c,'COM'),.1);else if((c.params.mode??'voltage')==='voltage')branch(c.id+':voltmeter',net(c,'V'),net(c,'COM'),1e7);}
      else if(stampTFT(c,{net,branch,sensors,addNode})){}
      else if(stampActuator(c,{net,branch,sensors,addNode})){}
      else if(stampDigital(c,{net,branch})){}
      else if(stampBasicDevices(c,{net,branch,sensors,addNode,drivers})){}
      else if(c.type==='switch'){if(c.params.closed??1)branch(c.id+':contact',net(c,'1'),net(c,'2'),.05);}
      else if(c.type==='rheostat')branch(c.id,net(c,'1'),net(c,'2'),Math.max(.001,(c.params.ohms??1000)*(c.params.value??50)/100));
      else if(c.type==='coilRelay'){branch(c.id+':coil',net(c,'A1'),net(c,'A2'),c.params.coilOhms??70);relays.push({id:c.id,vcc:net(c,'A1'),gnd:net(c,'A2'),com:net(c,'COM'),no:net(c,'NO'),nc:net(c,'NC'),coil:true,nominalVoltage:c.params.nominalVoltage??5});}
      else if(c.type==='resistor')branch(c.id,net(c,'1'),net(c,'2'),c.params.ohms);
      else if(deviceDefinition(c.type)?.bus==='I2C'){
        const def=deviceDefinition(c.type);addNode(net(c,def.power.gnd));addNode(net(c,def.power.vcc));
        if(def.pullup){branch(c.id+':sda-pullup',net(c,def.power.vcc),net(c,def.pins.data),def.pullup);branch(c.id+':scl-pullup',net(c,def.power.vcc),net(c,def.pins.clock),def.pullup);}
      }
      else if(c.type==='capacitor'){const a=addNode(net(c,'1')),b=addNode(net(c,'2')),stamp=reactive?.get(c.id);if(stamp){branch(c.id,a,b,stamp.ohms);branches.at(-1).offset=stamp.offset;}}
      else if(c.type==='inductor'){const stamp=reactive?.get(c.id);branch(c.id,net(c,'1'),net(c,'2'),stamp?.ohms??c.params.dcr??1);if(stamp)branches.at(-1).offset=stamp.offset;}
      else if(c.type==='opamp'){for(const i of[1,2])opamps.push({id:c.id+':'+i,out:addNode(net(c,'OUT'+i)),plus:addNode(net(c,'IN'+i+'+')),minus:addNode(net(c,'IN'+i+'-')),ref:addNode(net(c,'V-')),vcc:addNode(net(c,'V+')),gain:c.params.gain??100000,outputOhms:c.params.outputOhms??50});}
      else if(c.type==='ldr')branch(c.id,net(c,'1'),net(c,'2'),10000*(100/(c.params.lux??100))**.7);
      else if(c.type==='tmp36')sensors.push({id:c.id,vcc:addNode(net(c,'VCC')),gnd:addNode(net(c,'GND')),out:addNode(net(c,'OUT')),absolute:.5+.01*(c.params.temperature??25),min:2.7,max:5.5});
      else if(c.type==='pot'){
        const fraction=Math.max(0,Math.min(1,(c.params.value??project.settings.pot)/100)),total=c.params.ohms||10000;
        branch(`${c.id}:upper`,net(c,'VCC'),net(c,'OUT'),Math.max(1e-6,total*(1-fraction)));
        branch(`${c.id}:lower`,net(c,'OUT'),net(c,'GND'),Math.max(1e-6,total*fraction));
      }else if(c.type==='led'){const a=addNode(net(c,'A')),k=addNode(net(c,'K'));if(a!==undefined&&k!==undefined)leds.push({id:c.id,a,k,vf:c.params.vf??2});}
      else if(c.type==='sensor')sensors.push({id:c.id,vcc:addNode(net(c,'VCC')),gnd:addNode(net(c,'GND')),out:addNode(net(c,'OUT')),fraction:(c.params.value??project.settings.moisture)/100});
      else if(['diode','zener'].includes(c.type))diodes.push({id:c.id,type:c.type,a:addNode(net(c,'A')),k:addNode(net(c,'K')),vf:c.params.vf??.7,vz:c.type==='zener'?(c.params.vz??5.1):null});
      else if(c.type==='npn')npns.push({id:c.id,c:net(c,'C'),b:net(c,'B'),e:net(c,'E'),model:c.params});
      else if(c.type==='relay')relays.push({id:c.id,vcc:addNode(net(c,'VCC')),gnd:addNode(net(c,'GND')),input:addNode(net(c,'IN')),com:addNode(net(c,'COM')),no:addNode(net(c,'NO')),nc:addNode(net(c,'NC')),nominalVoltage:c.params.nominalVoltage??5,activeHigh:c.params.activeHigh!==false});
      else if(c.type==='spdt')switches.push({id:c.id,common:addNode(net(c,'2')),left:addNode(net(c,'1')),right:addNode(net(c,'3')),position:c.params.position||'left'});
      else if(c.type==='mosfet')mosfets.push({id:c.id,d:net(c,'D'),g:net(c,'G'),s:net(c,'S'),model:c.params});
    }
    for(const d of drivers){const n=netlist.net(d.endpoint);if(n===undefined||!Number.isFinite(d.voltage))continue;const source='$driver:'+d.endpoint;set(source,d.voltage,source);branch(source,source,n,d.ohms??50);}
    const solution=solveContactDC({nodes:[...nodes],known,branches,leds,npns,mosfets,diodes,opamps},relays,switches,sensors);
    return {...solution,known:solution.known,branches:solution.branches,leds,pullups,diagnostics:[...diagnostics,...solution.diagnostics]};
  };
  const instant=build(),digital={},analog={},sense={};
  for(const c of project.components.filter(c=>c.type==='switch'&&c.params.closed===0))instant.currents.set(c.id+':contact',0);
  if(!reactive)for(const c of project.components.filter(c=>c.type==='capacitor'))instant.currents.set(c.id,[net(c,'1'),net(c,'2')].every(n=>Number.isFinite(instant.voltages.get(n)))?0:null);
  // Determine source support with only this pin's own pull-up removed.
  // Feeding an unconnected pin's own weak pull-up back as an external HIGH
  // would incorrectly hold it HIGH after firmware disables that pull-up.
  const externallySupported=(pin,target)=>{
    const adjacency=new Map();
    const connect=(a,b)=>{if(!adjacency.has(a))adjacency.set(a,[]);if(!adjacency.has(b))adjacency.set(b,[]);adjacency.get(a).push(b);adjacency.get(b).push(a);};
    for(const b of instant.branches)if(b.id!==instant.pullups.get(pin))connect(b.a,b.b);
    for(const l of instant.leds)if(instant.ledResults.get(l.id)?.active)connect(l.a,l.k);
    for(const [a,b]of instant.deviceSupport)connect(a,b);
    const visited=new Set([target]),queue=[target];
    for(let i=0;i<queue.length;i++){const n=queue[i];if(instant.known.has(n))return true;for(const neighbor of adjacency.get(n)||[])if(!visited.has(neighbor)){visited.add(neighbor);queue.push(neighbor);}}
    return false;
  };
  let valid=instant.converged&&!instant.diagnostics.some(d=>DC_FAILURES.includes(d.code));
  if(board&&valid)for(const pin of GPIO){
    if(firmware?.pins?.[pin]?.outputEnabled)continue;
    const n=net(board,pin),volts=instant.voltages.get(n);
    if(!Number.isFinite(volts))continue;
    if(externallySupported(pin,n)){if(!definition.pins.find(p=>p.id===pin)?.analogOnly)digital[pin]=volts>=(definition.logicHigh??2.5);if(pin.startsWith('A'))analog[pin]=Math.max(0,Math.min(ioVoltage,volts));}
    else if(pin.startsWith('A')&&instant.pullups.has(pin))sense[pin]=Math.max(0,Math.min(5,volts));
  }
  const diagnostics=[...instant.diagnostics],ledDisplay=new Map([...instant.ledResults].map(([id,l])=>[id,{...l,averageCurrent:l.current}]));
  const pwm=Object.entries(firmware?.pins||{}).filter(([pin,state])=>state.outputEnabled&&Number.isFinite(state.duty)&&state.duty>1e-6&&state.duty<1-1e-6);
  if(pwmAverage&&pwm.length===1){
    const[pin,state]=pwm[0],low=build({[pin]:0}),high=build({[pin]:5});
    for(const[id,l]of ledDisplay){const off=low.ledResults.get(id)?.current,on=high.ledResults.get(id)?.current;const average=Number.isFinite(off)&&Number.isFinite(on)?off*(1-state.duty)+on*state.duty:null;l.averageCurrent=average;l.on=average!==null&&average>1e-9;}
    for(const solution of[low,high])for(const d of solution.diagnostics)if(!['floating-nodes','ideal-parallel-current-sharing'].includes(d.code)&&!diagnostics.some(existing=>existing.code===d.code&&JSON.stringify(existing.componentIds)===JSON.stringify(d.componentIds)))diagnostics.push(d);
  }else if(pwmAverage&&pwm.length>1)diagnostics.push({code:'multiple-pwm-average-unsupported',message:'Multiple PWM output phases are not determined by duty values; LED display uses the present DC state.'});
  valid=valid&&!diagnostics.some(d=>DC_FAILURES.includes(d.code));
  return {...instant,diagnostics,valid,inputs:valid?{digital,analog,sense}:{digital:{},analog:{},sense:{}},ledDisplay,netlist};
}
