import {deviceDefinition} from './device-registry.js';
import {pinVoltage,logic} from './bus-electrical.js';
import {createI2CLines} from './i2c-lines.js';
/** Uno hardware TWI master, cycle-scheduled transaction events. Bus membership
 * uses canonical nets and synchronous open-drain DC line levels. Hardware
 * master only; no slave MCU / multi-master / analog rise-time claim. */
export function attachI2CRuntime(runtime,circuitRuntime,project){
  const twi=runtime.twi,previous=twi.eventHandler,devices=new Map();let active=[],transaction=null,transactions=[],disposed=false;
  const stats={starts:0,stops:0,addressACK:0,addressNACK:0,bytes:0};
  const lines=createI2CLines(runtime,circuitRuntime,()=>project);
  let refreshing=false,clockEpoch=0,clockAt=null;
  const arm=()=>{const cycle=runtime.cpu.cycles,events=[...devices.values()].filter(d=>d.powered&&!d.resetAsserted).map(d=>d.controller.nextEvent?.(cycle)).filter(Number.isFinite),next=events.length?Math.min(...events):null;if(next===clockAt)return;const epoch=++clockEpoch;clockAt=next;if(next!==null)runtime.cpu.addClockEvent(()=>{if(disposed||epoch!==clockEpoch)return;clockAt=null;refresh();},Math.max(1,next-cycle));};
  const refresh=()=>{
    if(refreshing||disposed)return;refreshing=true;
    try{
      const dc=circuitRuntime.solution,nets=dc.netlist,board=project.components.find(c=>c.type==='board');
      const adjacency=new Map();for(const b of dc.branches){if(/:(sda|scl)-pullup$/.test(b.id))continue;for(const[a,c]of [[b.a,b.b],[b.b,b.a]]){if(!adjacency.has(a))adjacency.set(a,[]);adjacency.get(a).push(c);}}
      // A driven GPIO may power another device, but its own supply must trace
      // to a real rail. Recursive owner checks break phantom self/cyclic feeds.
      const supplied=(node,owners=new Set())=>{const seen=new Set([node]),queue=[node];for(let i=0;i<queue.length;i++){const at=queue[i];if(dc.known.has(at)){if(!String(at).startsWith('$driver:'))return true;const owner=String(at).split(':')[1],definition=deviceDefinition(project.components.find(c=>c.id===owner)?.type);if(definition&&!owners.has(owner)){const v=pinVoltage(dc,owner,definition.power.vcc),g=pinVoltage(dc,owner,definition.power.gnd),nextOwners=new Set([...owners,owner]);if(Number.isFinite(v)&&Number.isFinite(g)&&Math.abs(g)<.02&&v-g>=definition.power.min&&v-g<=definition.power.max&&supplied(nets.net(owner+':'+definition.power.vcc),nextOwners))return true;}}for(const n of adjacency.get(at)||[])if(!seen.has(n)){seen.add(n);queue.push(n);}}return false;};
      const drivers=[];
      for(const[id,d]of devices){
        const def=deviceDefinition(d.type),n=pin=>nets.net(id+':'+pin),v=pin=>pinVoltage(dc,id,pin),gnd=v(def.power.gnd),supply=v(def.power.vcc),supplyPresent=supplied(n(def.power.vcc),new Set([id]));
        const powered=!!(dc.valid&&Number.isFinite(gnd)&&Math.abs(gnd)<.02&&Number.isFinite(supply)&&supply-gnd>=def.power.min&&supply-gnd<=def.power.max&&supplyPresent);
        if(d.powered&&!powered)d.controller.reset(runtime.cpu.cycles);d.powered=powered;d.voltage=supplyPresent&&Number.isFinite(supply)&&Number.isFinite(gnd)?supply-gnd:null;
        const config=def.configuration(v,d.voltage,nets,id);if(config.resetAsserted&&!d.resetAsserted)d.controller.reset(runtime.cpu.cycles);Object.assign(d,config);
        if(config.address!==undefined)d.address=config.address;if(def.dynamicAddress)d.address=def.dynamicAddress(d.controller);
        d.controller.setSupply?.(d.voltage);d.controller.setEnvironment?.(project.components.find(c=>c.id===id)?.params);
        if(powered&&!d.resetAsserted){def.update?.(v,d.controller);d.controller.tick?.(runtime.cpu.cycles);if(d.type==='mcp23017')d.controller.inputLevels(Array.from({length:16},(_,i)=>logic(v('GP'+(i<8?'A':'B')+(i&7)),d.voltage)));}
        const {data,clock}=def.pins,values=[v(data),v(clock)];d.overvoltage=def.ioMargin!==undefined&&values.some(value=>Number.isFinite(value)&&value>supply+def.ioMargin);
        d.connected=!!(powered&&!d.resetAsserted&&config.valid&&board&&nets.same(id+':'+data,board.id+':'+runtime.bus.twi.data)&&nets.same(id+':'+clock,board.id+':'+runtime.bus.twi.clock)&&n(data)!==n(clock)&&!d.overvoltage&&!runtime.readPin(runtime.bus.twi.data).outputEnabled&&!runtime.readPin(runtime.bus.twi.clock).outputEnabled&&twi.sclFrequency<=(typeof def.maxFrequency==='function'?def.maxFrequency(d.voltage):def.maxFrequency));
        if(powered&&!d.resetAsserted)for(const driver of d.controller.drivers?.(d.voltage,gnd)||[])drivers.push({...driver,endpoint:id+':'+driver.pin});
      }
      circuitRuntime.setDrivers('i2c',drivers);arm();
    }finally{refreshing=false;}
  };
  const reconcile=()=>{const ids=new Set();for(const c of project.components.filter(c=>deviceDefinition(c.type)?.bus==='I2C')){ids.add(c.id);const def=deviceDefinition(c.type),address=def.addressParameter?c.params.address??def.defaultAddress:def.defaultAddress,old=devices.get(c.id);if(old&&old.type===c.type)old.address=address;else devices.set(c.id,{id:c.id,type:c.type,address,controller:circuitRuntime.deviceController?.(c.id,c.type,def.create)??def.create(),powered:false,connected:false});}for(const id of devices.keys())if(!ids.has(id))devices.delete(id);refresh();};
  const finish=()=>{if(transaction){transactions.push({...transaction,end:runtime.cpu.cycles});if(transactions.length>128)transactions.shift();transaction=null;}active=[];};
  const eligible=()=>{refresh();return active.filter(d=>d.connected&&devices.get(d.id)===d&&d.address===transaction?.address);};
  const endpoint=d=>d.id+':'+deviceDefinition(d.type).pins.data;
  const oldControl=runtime.cpu.writeHooks[twi.config.TWCR];
  runtime.cpu.writeHooks[twi.config.TWCR]=(...args)=>{const result=oldControl(...args);if(!(args[0]&4)){lines.abort();active=[];transaction=null;twi.busy=false;}return result;};
  twi.eventHandler={
    start(repeated){finish();stats.starts++;lines.start(ok=>{if(ok)twi.completeStart();else{twi.busy=false;twi.updateStatus(0);}});},
    stop(){stats.stops++;lines.stop(()=>{refresh();for(const d of active)if(d.powered)d.controller.stop?.(runtime.cpu.cycles,d.writeProtected);finish();twi.completeStop();});},
    connectToSlave(address,write){transaction={cycle:runtime.cpu.cycles,address,write,frequency:twi.sclFrequency,ack:false,data:[],byteCount:0,dataACK:true};const header=(address<<1)|(write?0:1);lines.byte(header,{ackSlaves:received=>{refresh();active=[...devices.values()].filter(d=>received===header&&d.connected&&d.address===address&&(write||!deviceDefinition(d.type).writeOnly)&&(d.controller.ready?.(runtime.cpu.cycles,write)??true));for(const d of active)d.controller.begin(write,runtime.cpu.cycles);return active.map(endpoint);}},(_,ack)=>{transaction.ack=ack;ack?stats.addressACK++:stats.addressNACK++;if(!ack)active=[];twi.completeConnect(ack);});},
    writeByte(byte){lines.byte(byte,{ackSlaves:received=>{const acknowledged=[];for(const d of eligible())if(d.controller.write(received,runtime.cpu.cycles))acknowledged.push(endpoint(d));refresh();return acknowledged;}},(received,ack)=>{stats.bytes++;if(transaction){if(transaction.data.length<32)transaction.data.push(received);transaction.byteCount++;transaction.dataACK&&=ack;}twi.completeWrite(ack);});},
    // Read collisions resolve as open-drain wired AND. Final master NACK is
    // handled by AVR TWI; each byte still consumes nine bus clocks.
    readByte(ack){const stretchers=eligible().map(d=>({endpoint:d.id+':'+deviceDefinition(d.type).pins.clock,until:d.controller.stretchUntil?.(runtime.cpu.cycles)}));lines.waitForDevices(stretchers,()=>{const values=new Map(eligible().map(d=>[d,d.controller.read(runtime.cpu.cycles)]));lines.byte(255,{read:true,ack,slaves:bit=>eligible().filter(d=>values.has(d)&&!(values.get(d)&(128>>bit))).map(endpoint)},received=>{refresh();stats.bytes++;if(transaction){if(transaction.data.length<32)transaction.data.push(received);transaction.byteCount++;}twi.completeRead(received);});});},
  };
  reconcile();const unsubscribe=circuitRuntime.subscribe(refresh);
  return{
    updateProject(next){lines.abort();if(twi.busy){twi.busy=false;twi.updateStatus(0);}finish();project=next;reconcile();},
    snapshot(consume=false){refresh();const displays=Object.fromEntries([...devices].filter(([,d])=>d.type==='oled').map(([id,d])=>[id,{address:d.address,powered:d.powered,connected:d.connected,voltage:d.voltage,on:d.powered&&d.controller.on,contrast:d.controller.contrast,revision:d.controller.revision,scroll:d.controller.scrollActive,frame:d.powered?d.controller.frame(runtime.cpu.cycles):new Uint8Array(1024)}]));const result={...stats,frequency:twi.sclFrequency,transactions:[...transactions],displays,modules:Object.fromEntries([...devices].filter(([,d])=>d.type!=='oled').map(([id,d])=>[id,{type:d.type,address:d.address,powered:d.powered,connected:d.connected,voltage:d.voltage,writeProtected:d.writeProtected,resetAsserted:d.resetAsserted,overvoltage:d.overvoltage,...d.controller.state(runtime.cpu.cycles)}]))};if(consume)transactions=[];return result;},
    dispose(){disposed=true;clockEpoch++;unsubscribe();lines.dispose();circuitRuntime.setDrivers('i2c',[]);runtime.cpu.writeHooks[twi.config.TWCR]=oldControl;twi.busy=false;if(twi.eventHandler!==previous)twi.eventHandler=previous;},
  };
}
