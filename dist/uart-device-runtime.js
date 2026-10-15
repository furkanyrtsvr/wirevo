import {poweredDevice} from './bus-electrical.js';
import {UARTReceiver,UARTTransmitter,uartFormat} from './uart-lines.js';
export const mhzChecksum=bytes=>(256-bytes.slice(1,8).reduce((a,b)=>a+b,0))&255;
/** Both hardware USART and firmware GPIO/SoftwareSerial use one physical decoder. */
export function attachUARTDevices(runtime,engine,initial){
 let project=initial,disposed=false,events=[],devices=new Map();const cpu=runtime.cpu,board=()=>project.components.find(c=>c.type==='board'),prefix=()=>board()?.id;
 const logic=ep=>{const dc=engine.solution,v=dc.voltages.get(dc.netlist.net(ep));return Number.isFinite(v)?v>=2.5:null;};
 const drive=(owner,ep,high)=>engine.setDrivers(owner,high===null?[]:[{endpoint:ep,voltage:high?5:0,ohms:50}]);
 runtime.externalOutputPins=new Set();const previousPump=runtime.pumpSerial;
 const channels=runtime.usarts.map((usart,index)=>{
  const {tx:txPin,rx:rxPin}=runtime.bus.uart[index],owner='$usart-'+index;
  const hwTX=new UARTTransmitter(cpu,high=>{if(prefix())drive(owner+'-tx',prefix()+':'+txPin,high);});
  const previousTX=usart.onByteTransmit,previousConfig=usart.onConfigurationChange;
  const rx=new UARTReceiver(cpu,()=>logic(prefix()+':'+rxPin),()=>usart.rxEnable?uartFormat(usart):null,frame=>{usart.writeByte(frame.value,true);if(frame.error==='framing')cpu.data[usart.config.UCSRA]|=0x10;if(frame.error==='parity')cpu.data[usart.config.UCSRA]|=4;});
  const terminal=new UARTTransmitter(cpu,high=>{if(prefix())drive(owner+'-terminal',prefix()+':'+rxPin,high);});
  const pump=()=>{if(!usart.rxEnable||terminal.busy)return;const queue=runtime.serialQueues[index];if(queue.length){drive(owner+'-terminal',prefix()+':'+rxPin,true);terminal.enqueue(queue.shift(),uartFormat(usart));}};
  const originalPump=terminal.pump.bind(terminal);terminal.pump=()=>{originalPump();if(!terminal.busy)pump();};
  const configure=()=>{previousConfig?.();if(usart.txEnable){runtime.externalOutputPins.add(txPin);if(!hwTX.busy)drive(owner+'-tx',prefix()+':'+txPin,true);}else{runtime.externalOutputPins.delete(txPin);hwTX.cancel();}if(!usart.rxEnable){rx.cancel();terminal.cancel();}pump();};
  usart.onConfigurationChange=configure;usart.onByteTransmit=byte=>{previousTX?.(byte);if(usart.txEnable)hwTX.enqueue(byte,uartFormat(usart));};
  return {usart,hwTX,rx,terminal,pump,configure,previousTX,previousConfig};
 });
 runtime.pumpSerial=(port=0)=>channels[port]?.pump();
 const configure=()=>channels.forEach(c=>c.configure());
 const refresh=()=>{const dc=engine.solution,b=board();for(const d of devices.values()){const c=project.components.find(c=>c.id===d.id);if(!c)continue;const p=poweredDevice(dc,d.id,{min:4.5});if(d.powered&&!p.powered){d.buffer=[];d.epoch++;d.tx.cancel();d.rx.cancel();}Object.assign(d,p);d.ppm=c.params.ppm??800;const find=ep=>b&&Object.keys(runtime.snapshot().pins).find(pin=>dc.netlist.same(ep,b.id+':'+pin));d.rxPin=find(d.id+':RX');d.txPin=find(d.id+':TX');d.connected=!!(d.powered&&d.rxPin&&d.txPin&&d.rxPin!==d.txPin);d.channel=runtime.bus.uart.findIndex(p=>d.rxPin===p.tx&&d.txPin===p.rx);d.hardware=d.channel>=0;const u=runtime.usarts[d.channel];d.format=!d.hardware||(Math.abs(u.baudRate-9600)<=192&&u.bitsPerChar===8&&u.stopBits===1&&!u.parityEnabled);}
 for(const d of devices.values())d.conflict=d.connected&&[...devices.values()].some(o=>o!==d&&o.connected&&dc.netlist.same(d.id+':TX',o.id+':TX'));
 };
 const packet=(d,frame)=>{refresh();if(frame.error||!d.connected||!d.format||d.conflict){d.buffer=[];return;}const byte=frame.value;if(!d.buffer.length&&byte!==255)return;d.buffer.push(byte);if(d.buffer.length<9)return;const request=d.buffer;d.buffer=[];if(mhzChecksum(request)!==request[8]){d.badChecksum++;return;}if(request[0]!==255||request[1]!==1||request[2]!==0x86)return;const response=[255,0x86,d.ppm>>8,d.ppm&255,0,0,0,0,0];response[8]=mhzChecksum(response);const epoch=d.epoch;d.requests++;events.push({cycle:cpu.cycles,id:d.id,request,response});if(events.length>128)events.shift();cpu.addClockEvent(()=>{if(disposed||epoch!==d.epoch)return;refresh();if(d.connected&&d.format&&!d.conflict)for(const value of response)d.tx.enqueue(value,{period:16000000/9600,bits:8,stops:1,parity:null});},320000);};
 const reconcile=()=>{for(const c of project.components.filter(c=>c.type==='mhz19'))if(!devices.has(c.id)){const d={id:c.id,buffer:[],epoch:0,requests:0,badChecksum:0};d.tx=new UARTTransmitter(cpu,high=>drive('$uart:'+d.id,d.id+':TX',high));d.rx=new UARTReceiver(cpu,()=>logic(d.id+':RX'),()=>({period:16000000/9600,bits:8,stops:1,parity:null}),f=>packet(d,f));devices.set(c.id,d);}for(const[id,d]of devices)if(!project.components.some(c=>c.id===id&&c.type==='mhz19')){d.epoch++;d.tx.cancel();d.rx.cancel();devices.delete(id);}refresh();for(const d of devices.values())if(d.powered&&!d.tx.busy)drive('$uart:'+d.id,d.id+':TX',true);};
 let refreshing=false;const observe=()=>{if(refreshing||disposed)return;refreshing=true;try{refresh();for(const c of channels)c.rx.observe();for(const d of devices.values())if(d.powered)d.rx.observe();}finally{refreshing=false;}};
 const unsubscribe=engine.subscribe(observe);reconcile();configure();
 return{updateProject(next){for(const c of channels){c.hwTX.cancel();c.terminal.cancel();c.rx.cancel();}for(const d of devices.values()){d.epoch++;d.buffer=[];d.rx.cancel();d.tx.cancel();}project=next;reconcile();configure();},snapshot(consume=false){refresh();const result={events:[...events],modules:Object.fromEntries([...devices].map(([id,d])=>[id,{type:'mhz19',powered:d.powered,connected:d.connected,format:d.format,conflict:d.conflict,voltage:d.voltage,ppm:d.ppm,requests:d.requests,badChecksum:d.badChecksum,rxPin:d.rxPin,txPin:d.txPin,transport:d.hardware?'USART'+d.channel:'GPIO UART'}]))};if(consume)events=[];return result;},dispose(){disposed=true;unsubscribe();for(const d of devices.values()){d.epoch++;d.rx.cancel();d.tx.cancel();}for(const c of channels){c.hwTX.cancel();c.terminal.cancel();c.rx.cancel();}runtime.externalOutputPins.clear();for(const c of channels){c.usart.onByteTransmit=c.previousTX;c.usart.onConfigurationChange=c.previousConfig;}runtime.pumpSerial=previousPump;}};
}
