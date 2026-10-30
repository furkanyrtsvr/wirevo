import {PicoUARTRX} from './pico-uart-rx.js';
import {installPicoUARTClock} from './pico-uart-clock.js';
import {PicoUARTTX} from './pico-uart-tx.js';
// PL011 byte registers <-> timed GPIO waveform. The circuit remains the only
// path between a UART pad and an attached module; there is no sensor shortcut.
export function installPicoUARTPins(r){
 const rp=r.rp,txPads=[[0,12,16,28],[4,8,20,24]],levels=[true,true],channels=[];
 const format=u=>{const cycles=16*u.baudDivider;return u.enabled&&Number.isFinite(cycles)&&cycles>0?{cycles,period:rp.clkPeri>0?cycles*1e9/rp.clkPeri:Infinity,bits:u.wordLength,stops:u.lineCtrlRegister&8?2:1,parity:u.lineCtrlRegister&2?(u.lineCtrlRegister&128?(u.lineCtrlRegister&4?'space':'mark'):(u.lineCtrlRegister&4?'even':'odd')):null}:null;};
 const txChannel=pin=>txPads.findIndex(pads=>pads.includes(pin)),rtsChannel=pin=>txPads.findIndex(pads=>pads.some(p=>p+3===pin));
 const rawEnable=rp.gpioRawOutputEnable.bind(rp),rawValue=rp.gpioRawOutputValue.bind(rp);
 rp.gpioRawOutputEnable=pin=>{const index=txChannel(pin),rts=rtsChannel(pin),u=rp.uart[index];if(rp.gpio[pin].functionSelect!==2)return rawEnable(pin);if(index>=0)return !(u.ctrlRegister&128)&&(u.enabled&&u.txEnabled||channels[index]?.tx.active);if(rts>=0)return true;return rawEnable(pin);};
 rp.gpioRawOutputValue=pin=>{if(rp.gpio[pin].functionSelect!==2)return rawValue(pin);const index=txChannel(pin),rts=rtsChannel(pin);return index>=0?levels[index]:rts>=0?channels[rts]?.rtsHigh()??true:rawValue(pin);};
 for(const [index,u]of rp.uart.entries()){
  const stats={txBytes:0,rxBytes:0,framingErrors:0,parityErrors:0,breakErrors:0};let rx;let selected=null,lastCTS=null,refreshing=false;
  const rxPads=()=>txPads[index].map(p=>p+1).filter(p=>rp.gpio[p]?.functionSelect===2&&rp.gpio[p].inputEnable&&r.board.gpio.includes(p));
  const read=()=>{if(u.ctrlRegister&128)return levels[index];const pads=rxPads(),c=r.circuit;if(!c)return null;const connected=pads.filter(p=>Number.isFinite(c.solution?.voltages.get(c.solution.netlist.net(c.board.id+':GPIO'+p))));if(connected.length!==1)return null;return rp.gpio[connected[0]].inputValue;};
  const ctsPads=()=>txPads[index].map(p=>p+2).filter(p=>rp.gpio[p]?.functionSelect===2&&rp.gpio[p].inputEnable&&r.board.gpio.includes(p));
  const rtsHigh=()=>u.ctrlRegister&16384?!(u.enabled&&u.rxEnabled&&u.rxFIFO.itemCount<u.rxThreshold()):!(u.ctrlRegister&2048);
  const cts=()=>{if(u.ctrlRegister&128)return !rtsHigh();const pads=ctsPads();return pads.length===1&&rp.gpio[pads[0]].inputValue===false;};
  const refreshOutputs=()=>{if(refreshing)return;refreshing=true;try{for(const p of txPads[index]){rp.gpio[p]?.checkForUpdates();rp.gpio[p+3]?.checkForUpdates();}}finally{refreshing=false;}};
  const tx=new PicoUARTTX(rp.clock,()=>format(u),()=>u.enabled&&u.txEnabled&&(!(u.ctrlRegister&32768)||cts()),high=>{levels[index]=high;refreshOutputs();if(u.ctrlRegister&128)rx?.observe();},value=>{stats.txBytes++;if(!(u.ctrlRegister&128))u.onByte?.(value);},event=>u.txEvent(event));
  rx=new PicoUARTRX(rp.clock,read,()=>u.enabled&&u.rxEnabled?format(u):null,frame=>{if(frame.flags&2)stats.parityErrors++;if(frame.flags&1)stats.framingErrors++;if(frame.flags&4)stats.breakErrors++;stats.rxBytes++;if(u.ctrlRegister&128)u.receiveLoopback(frame.value,frame.flags);else u.feedFrame(frame.value,frame.flags);});
  const configure=()=>{const next=JSON.stringify([u.ctrlRegister,u.lineCtrlRegister,u.intDivisor,u.fracDivisor,rxPads()]);if(next!==selected){rx.cancel();selected=next;}tx.setBreak(!!(u.enabled&&u.txEnabled&&(u.lineCtrlRegister&1)));tx.pump();refreshOutputs();};
  const observe=()=>{const current=cts();const changed=lastCTS!==null&&current!==lastCTS;lastCTS=current;if(changed){u.ctsChanged();tx.pump();}};
  const transport=u.pinTransport={write(value){return tx.write(value,u.fifosEnabled?32:1);},get busy(){return tx.busy;},get count(){return tx.queue.length;},get cts(){return cts();},configure,refreshOutputs,flush:()=>tx.flush()};
  channels.push({u,tx,rx,configure,stats,transport,rxPads,rtsHigh,observe});

 }
 const clockState=installPicoUARTClock(r,()=>{for(const c of channels){c.tx.reclock(rp.clkPeri);c.rx.reclock(rp.clkPeri);c.u.periClockChanged?.();c.configure();}});
 return{clockState,observe(){for(const c of channels){const pads=c.rxPads().join(',');if(c.pads!==pads){c.pads=pads;c.rx.cancel();}c.rx.observe();c.observe();}},snapshot(){return channels.map((c,index)=>({index,...c.stats,busy:c.tx.busy,breaking:c.tx.breaking,clockHz:rp.clkPeri,queued:c.tx.queue.length,dropped:c.tx.dropped,started:c.tx.started,finished:c.tx.finished,lastEnd:c.tx.lastEnd,burstStart:c.tx.burstStart,burstBytes:c.tx.burstBytes,cts:c.transport.cts,rtsHigh:c.rtsHigh(),rxPads:c.rxPads()}));},dispose(){clockState.dispose();for(const c of channels){c.tx.cancel(false);c.rx.cancel();delete c.u.pinTransport;}}};
}
