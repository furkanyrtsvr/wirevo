// UART observes clk_peri, not a cached baud rate. CLK_PERI registers below
// cover the model's boot clock sources; PLL locking/analogue glitches are not
// invented here. Firmware can gate the clock before selecting another source.
export function installPicoUARTClock(r,changed){
 const rp=r.rp,newer=r.board.mcu==='RP2350',peripheral=rp.peripherals[newer?0x40010:0x40008];
 let hz=rp.clkPeri,ctrl=0x800,div=0x10000,pending=null,disposed=false;
 const originalRead=peripheral.readUint32.bind(peripheral),originalWrite=peripheral.writeUint32.bind(peripheral);
 Object.defineProperty(rp,'clkPeri',{configurable:true,get:()=>hz,set:value=>{if(!Number.isFinite(value)||value<0)throw Error('UART peripheral clock must be finite and nonnegative.');if(value!==hz){hz=value;changed();}}});
 const source=()=>{switch((ctrl>>>5)&7){case 0:return rp.clkSys;case 1:return r.hz;case 2:return 48000000;case 4:return 12000000;default:throw Error('UART clk_peri: ROSC/GPIN source needs an external clock model.');}};
 const apply=()=>{pending=null;if(disposed)return;rp.clkPeri=ctrl&0x800&&!(ctrl&0x400)?source()/(newer?((div>>>16)&3)||4:1):0;};
 const update=()=>{pending?.cancel();const delay=2e9/Math.max(1,hz||rp.clkSys);pending=rp.clock.createAlarm(apply);pending.schedule(delay);};
 peripheral.readUint32=offset=>offset===0x48?ctrl|(newer&&hz>0?0x10000000:0):offset===0x50?1:offset===0x4c&&newer?div:originalRead(offset);
 peripheral.writeUint32=(offset,value)=>{if(offset===0x48){ctrl=value&0xce0;update();}else if(offset===0x4c&&newer){div=value&0x30000;update();}else originalWrite(offset,value);};
 return{get hz(){return hz;},get ctrl(){return ctrl;},get divider(){return newer?((div>>>16)&3)||4:1;},dispose(){disposed=true;pending?.cancel();peripheral.readUint32=originalRead;peripheral.writeUint32=originalWrite;Object.defineProperty(rp,'clkPeri',{configurable:true,writable:true,value:hz});}};
}
