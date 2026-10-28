// Correct the common PWM register window and IRQ routing for exposed slices 0–7.
// RP2350 slices 8–11 have no pins on the supported Pico 2 boards and are not modeled.
export function installPicoPWM(runtime){
 const p=runtime.rp.pwm,newer=runtime.board.mcu==='RP2350',base=newer?0xf0:0xa0;
 const read=p.readUint32.bind(p),write=p.writeUint32.bind(p),enable=[0,0],force=[0,0];
 let sysClock=runtime.rp.clkSys;
 const updateClock=()=>{for(const ch of p.channels){ch.timer.frequency=sysClock;ch.updateEnable();}};
 Object.defineProperty(runtime.rp,'clkSys',{configurable:true,enumerable:true,get:()=>sysClock,set:value=>{sysClock=value;updateClock();}});
 updateClock();
 const status=n=>(p.intRaw|force[n])&enable[n]&255;
 Object.defineProperty(p,'intStatus',{get:()=>status(0)});
 p.gpioOnInput=index=>{if(p.gpioDirection&(1<<index))return;for(const ch of p.channels)if((ch.csr&1)&&(ch.pinB1===index||ch.pinB2===index))ch.gpioBChanged();};
 p.checkInterrupts=()=>{p.intEnable=enable[0];p.intForce=force[0];runtime.rp.setInterrupt(p.pwm_wrap_irq,!!status(0));if(newer)runtime.rp.setInterrupt(p.pwm_wrap_irq+1,!!status(1));};
 p.readUint32=offset=>{if(offset<0xa0)return read(offset);if(offset===base)return p.channels.reduce((bits,ch,i)=>bits|((ch.csr&1)<<i),0);if(offset===base+4)return p.intRaw;
  for(let n=0;n<(newer?2:1);n++){const first=base+8+n*12;if(offset===first)return enable[n];if(offset===first+4)return force[n];if(offset===first+8)return status(n);}return 0;};
 p.writeUint32=(offset,value)=>{if(offset<0xa0){const result=write(offset,value);if(offset%20===4)p.channels[Math.floor(offset/20)].updateEnable();return result;}value&=255;
  if(offset===base){for(let i=0;i<8;i++)p.channels[i].en=!!(value&(1<<i));return;}
  if(offset===base+4)p.intRaw&=~value;
  else for(let n=0;n<(newer?2:1);n++){const first=base+8+n*12;if(offset===first)enable[n]=value;else if(offset===first+4)force[n]=value;}
  p.checkInterrupts();
 };
}
