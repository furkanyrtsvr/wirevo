import {UARTReceiver,UARTTransmitter} from './uart-lines.js';
// PL011 byte registers <-> timed GPIO waveform. The circuit remains the only
// path between a UART pad and an attached module; there is no sensor shortcut.
export function installPicoUARTPins(r){
 const rp=r.rp,txPads=[[0,12,16,28],[4,8,20,24]],levels=[true,true],channels=[];
 const cpu={get cycles(){return rp.clock.nanos*.016;},addClockEvent(fn,delay){rp.clock.createAlarm(fn).schedule(Math.max(1,delay/.016));}};
 const format=u=>{const baud=rp.clkPeri/(16*u.baudDivider);return u.enabled&&Number.isFinite(baud)&&baud>0&&!(u.lineCtrlRegister&128)?{period:16000000/baud,bits:u.wordLength,stops:u.lineCtrlRegister&8?2:1,parity:u.lineCtrlRegister&2?(u.lineCtrlRegister&4?'even':'odd'):null}:null;};
 const txChannel=pin=>txPads.findIndex(pads=>pads.includes(pin));
 const rawEnable=rp.gpioRawOutputEnable.bind(rp),rawValue=rp.gpioRawOutputValue.bind(rp);
 rp.gpioRawOutputEnable=pin=>{const index=txChannel(pin),u=rp.uart[index];return index>=0&&rp.gpio[pin].functionSelect===2?u.enabled&&u.txEnabled&&!(u.ctrlRegister&128):rawEnable(pin);};
 rp.gpioRawOutputValue=pin=>{const index=txChannel(pin);return index>=0&&rp.gpio[pin].functionSelect===2?levels[index]:rawValue(pin);};
 for(const [index,u]of rp.uart.entries()){
  const stats={txBytes:0,rxBytes:0,framingErrors:0,parityErrors:0};let selected=null;
  const rxPads=()=>txPads[index].map(p=>p+1).filter(p=>rp.gpio[p]?.functionSelect===2&&rp.gpio[p].inputEnable&&r.board.gpio.includes(p));
  const read=()=>{const pads=rxPads(),c=r.circuit;if(!c)return null;const connected=pads.filter(p=>Number.isFinite(c.solution?.voltages.get(c.solution.netlist.net(c.board.id+':GPIO'+p))));if(connected.length!==1)return null;return rp.gpio[connected[0]].inputValue;};
  const tx=new UARTTransmitter(cpu,high=>{levels[index]=high!==false;for(const p of txPads[index])rp.gpio[p]?.checkForUpdates();});
  const rx=new UARTReceiver(cpu,read,()=>u.enabled&&u.rxEnabled&&!(u.ctrlRegister&128)?format(u):null,frame=>{if(frame.error==='parity')stats.parityErrors++;else if(frame.error)stats.framingErrors++;stats.rxBytes++;u.feedFrame(frame.value,frame.error);});
  const configure=()=>{const next=JSON.stringify([u.ctrlRegister,u.lineCtrlRegister,u.intDivisor,u.fracDivisor,rxPads()]);if(next!==selected){rx.cancel();selected=next;}if(!u.enabled||!u.txEnabled||u.ctrlRegister&128)tx.cancel();for(const p of txPads[index])rp.gpio[p]?.checkForUpdates();};
  const transport=u.pinTransport={write(value){const f=format(u);if(f){stats.txBytes++;tx.enqueue(value,f);}},get busy(){return tx.busy;},configure};
  channels.push({u,tx,rx,configure,stats,transport,rxPads});
 }
 return{observe(){for(const c of channels){const pads=c.rxPads().join(',');if(c.pads!==pads){c.pads=pads;c.rx.cancel();}c.rx.observe();}},snapshot(){return channels.map((c,index)=>({index,...c.stats,busy:c.tx.busy,queued:c.tx.queue.length,rxPads:c.rxPads()}));},dispose(){for(const c of channels){c.tx.cancel(false);c.rx.cancel();delete c.u.pinTransport;}}};
}
