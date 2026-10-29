// PL011 receive-side behavior missing from the upstream peripheral model.
// The optional pin transport supplies the scheduled electrical TX/RX path.
export function installPicoUART(runtime){
 for(const uart of runtime.rp.uart){
  const read=uart.readUint32.bind(uart),write=uart.writeUint32.bind(uart);let ifls=0x12,timeout=false,overrun=false,receiveErrors=0,txIRQ=false,ctsIRQ=false,dmacr=0,previousTX=0;
  const alarm=runtime.rp.clock.createAlarm(()=>{timeout=uart.enabled&&!uart.rxFIFO.empty;uart.checkInterrupts();});
  const capacity=()=>uart.fifosEnabled?32:1;
  const touch=()=>{alarm.cancel();timeout=false;if(uart.enabled&&uart.rxEnabled&&!uart.rxFIFO.empty&&uart.baudRate>0&&Number.isFinite(uart.baudRate))alarm.schedule(512e9*uart.baudDivider/runtime.rp.clkPeri);};
  uart.txThreshold=()=>uart.fifosEnabled?([4,8,16,24,28][ifls&7]??16):0;
  uart.rxThreshold=()=>uart.fifosEnabled?([4,8,16,24,28][(ifls>>>3)&7]??16):1;
  uart.txEvent=event=>{const count=uart.pinTransport?.count??0,threshold=uart.txThreshold();if(count>threshold||event==='flush')txIRQ=false;else if(event==='shift'&&previousTX>threshold)txIRQ=true;previousTX=count;uart.checkInterrupts();};
  uart.ctsChanged=()=>{ctsIRQ=true;uart.checkInterrupts();};
  uart.checkInterrupts=()=>{const threshold=uart.fifosEnabled?([4,8,16,24,28][(ifls>>>3)&7]??16):1;
   uart.interruptStatus=(txIRQ?32:0)|(ctsIRQ?2:0)|(uart.enabled&&uart.rxEnabled&&uart.rxFIFO.itemCount>=threshold?16:0)|(timeout?64:0)|(overrun?1024:0)|(receiveErrors<<7);
   runtime.rp.setInterrupt(uart.irq,!!(uart.interruptStatus&uart.interruptMask));
   uart.pinTransport?.refreshOutputs();
   const request=(id,on)=>on?runtime.rp.dma_setDREQ(id):runtime.rp.dma_clearDREQ(id);
   request(uart.dreq.tx,uart.enabled&&uart.txEnabled&&!!(dmacr&2)&&(uart.pinTransport?.count??0)<capacity());
   request(uart.dreq.rx,uart.enabled&&uart.rxEnabled&&!!(dmacr&1)&&!uart.rxFIFO.empty&&(!(dmacr&4)||!receiveErrors&&!overrun));
  };
  const receive=(value,error=null)=>{if(!uart.enabled||!uart.rxEnabled)return;if(uart.rxFIFO.itemCount>=capacity())overrun=true;else {const flags=error==='parity'?2:error?1:0;receiveErrors|=flags;uart.rxFIFO.push((value&((1<<uart.wordLength)-1))|(flags<<8));}touch();uart.checkInterrupts();};
  uart.receiveLoopback=value=>receive(value);
  uart.feedFrame=(value,error)=>{if(!(uart.ctrlRegister&128))receive(value,error);};
  uart.feedByte=value=>{if(!(uart.ctrlRegister&128))receive(value);};
  uart.readUint32=offset=>{if(offset===4)return (overrun?8:0)|receiveErrors;if(offset===0x34)return ifls;if(offset===0x48)return dmacr;if(offset===0x18)return ((uart.pinTransport?.count??0)===0?128:0)|((uart.pinTransport?.count??0)>=capacity()?32:0)|(uart.pinTransport?.cts?1:0)|(uart.pinTransport?.busy?8:0)|(uart.rxFIFO.empty?16:0)|(uart.rxFIFO.itemCount>=capacity()?64:0);const value=read(offset);if(offset===0){touch();uart.checkInterrupts();}return value;};
  uart.writeUint32=(offset,value)=>{
   if(offset===0){const data=value&((1<<uart.wordLength)-1);if(uart.pinTransport)uart.pinTransport.write(data);else if(uart.ctrlRegister&128)receive(data);else write(offset,data);return;}
   if(offset===4){overrun=false;receiveErrors=0;uart.checkInterrupts();return;}
   if(offset===0x48){dmacr=value&7;uart.checkInterrupts();return;}
   if(offset===0x34){ifls=value&0x3f;uart.checkInterrupts();return;}
   if(offset===0x44){if(value&32)txIRQ=false;if(value&2)ctsIRQ=false;if(value&1024)overrun=false;receiveErrors&=~((value>>>7)&7);if(value&64)touch();uart.checkInterrupts();return;}
   const oldFIFO=uart.fifosEnabled;write(offset,value);
   if(offset===0x2c&&oldFIFO!==uart.fifosEnabled){uart.rxFIFO.reset();uart.pinTransport?.flush();}
   if([0x24,0x28,0x2c,0x30].includes(offset)){touch();uart.pinTransport?.configure();}
   uart.checkInterrupts();
  };
 }
}
