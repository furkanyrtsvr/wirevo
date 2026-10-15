/** Cycle-driven open-drain TWI lines. HIGH releases the sink; the DC solution
 * determines the actual level. Each SCL rise waits for electrical release.
 * Half periods are instruction-quantized, with no analog rise-time claim. */
export function createI2CLines(runtime,engine,getProject){
 const cpu=runtime.cpu,{data:dataPin,clock:clockPin}=runtime.bus.twi;let epoch=0,disposed=false,masterData=false,masterClock=false,slaveData=[],stretch=[],fault=false;
 const half=()=>Math.max(1,Math.ceil(8000000/runtime.twi.sclFrequency));
 const board=()=>getProject().components.find(c=>c.type==='board')?.id;
 const drivers=()=>[
  ...(masterData&&board()?[{endpoint:board()+':'+dataPin,voltage:0,ohms:50}]:[]),
  ...(masterClock&&board()?[{endpoint:board()+':'+clockPin,voltage:0,ohms:50}]:[]),
  ...slaveData.map(endpoint=>({endpoint,voltage:0,ohms:50})),
  ...stretch.map(endpoint=>({endpoint,voltage:0,ohms:50}))];
 const sync=()=>engine.setDrivers('i2c-lines',drivers());
 const high=pin=>{const dc=engine.solution,v=dc.voltages.get(dc.netlist.net(board()+':'+pin));return Number.isFinite(v)&&v>=2.5;};
 const later=(fn,cycles=half())=>{const token=epoch;cpu.addClockEvent(()=>{if(!disposed&&token===epoch)fn();},Math.max(1,cycles));};
 const clockHigh=fn=>{masterClock=false;sync();const wait=()=>{if(high(clockPin))later(fn);else later(wait);};wait();};
 const low=()=>{masterClock=true;sync();};
 const data=(sink,slaves=[])=>{masterData=sink;slaveData=slaves;sync();};
 return{
  start(done){fault=false;data(false);clockHigh(()=>{if(!high(dataPin))fault=true;data(true);later(()=>{low();done(!fault);});});},
  stop(done){low();data(true);later(()=>clockHigh(()=>{data(false);later(done);}));},
  byte(value,{read=false,ack=false,slaves=()=>[],ackSlaves=()=>[]}={},done){
   let bit=0,received=0;
   const next=()=>{
    low();const one=!!(value&(128>>bit));data(!read&&!one,read?slaves(bit):[]);
    later(()=>clockHigh(()=>{received=(received<<1)|(high(dataPin)?1:0);low();if(++bit<8)next();else ninth();}));
   };
   const ninth=()=>{const endpoints=read?[]:ackSlaves(received);data(read&&ack,endpoints);later(()=>clockHigh(()=>{const acknowledged=!high(dataPin);low();data(false);done(received,acknowledged&&!fault);}));};next();
  },
  waitForDevices(devices,done){
   const untils=devices.map(d=>({endpoint:d.endpoint,until:d.until})).filter(d=>Number.isFinite(d.until)&&d.until>cpu.cycles);
   if(!untils.length){done();return;}
   low();stretch=untils.map(d=>d.endpoint);sync();const at=Math.max(...untils.map(d=>d.until));
   later(()=>{stretch=[];sync();done();},at-cpu.cycles);
  },
  abort(){epoch++;masterData=masterClock=false;slaveData=[];stretch=[];fault=false;sync();},
  dispose(){this.abort();disposed=true;},
 };
}
