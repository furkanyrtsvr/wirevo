// PL011 receive-side behavior missing from the upstream peripheral model.
// Byte callbacks remain an abstraction; this is not a bit-accurate TX shifter.
export function installPicoUART(runtime){
 for(const uart of runtime.rp.uart){
  const read=uart.readUint32.bind(uart),write=uart.writeUint32.bind(uart);let ifls=0x12,timeout=false,overrun=false;
  const alarm=runtime.rp.clock.createAlarm(()=>{timeout=uart.enabled&&!uart.rxFIFO.empty;uart.checkInterrupts();});
  const capacity=()=>uart.fifosEnabled?32:1;
  const touch=()=>{alarm.cancel();timeout=false;if(uart.enabled&&uart.rxEnabled&&!uart.rxFIFO.empty&&uart.baudRate>0&&Number.isFinite(uart.baudRate))alarm.schedule(32e9/uart.baudRate);};
  uart.checkInterrupts=()=>{const threshold=uart.fifosEnabled?([4,8,16,24,28][(ifls>>>3)&7]??16):1;
   uart.interruptStatus=(uart.enabled&&uart.txEnabled?32:0)|(uart.enabled&&uart.rxEnabled&&uart.rxFIFO.itemCount>=threshold?16:0)|(timeout?64:0)|(overrun?1024:0);
   runtime.rp.setInterrupt(uart.irq,!!(uart.interruptStatus&uart.interruptMask));
  };
  const receive=value=>{if(!uart.enabled||!uart.rxEnabled)return;if(uart.rxFIFO.itemCount>=capacity())overrun=true;else uart.rxFIFO.push(value&((1<<uart.wordLength)-1));touch();uart.checkInterrupts();};
  uart.feedByte=value=>{if(!(uart.ctrlRegister&128))receive(value);};
  uart.readUint32=offset=>{if(offset===4)return overrun?8:0;if(offset===0x34)return ifls;if(offset===0x18)return 128|(uart.rxFIFO.empty?16:0)|(uart.rxFIFO.itemCount>=capacity()?64:0);const value=read(offset);if(offset===0){touch();uart.checkInterrupts();}return value;};
  uart.writeUint32=(offset,value)=>{
   if(offset===0){if(!uart.enabled||!uart.txEnabled)return;const data=value&((1<<uart.wordLength)-1);if(uart.ctrlRegister&128)receive(data);else write(offset,data);return;}
   if(offset===4){overrun=false;uart.checkInterrupts();return;}
   if(offset===0x34){ifls=value&0x3f;uart.checkInterrupts();return;}
   if(offset===0x44){if(value&1024)overrun=false;if(value&64)touch();uart.checkInterrupts();return;}
   const oldFIFO=uart.fifosEnabled;write(offset,value);
   if(offset===0x2c&&oldFIFO!==uart.fifosEnabled)uart.rxFIFO.reset();
   if([0x24,0x28,0x2c,0x30].includes(offset))touch();
   uart.checkInterrupts();
  };
 }
}
