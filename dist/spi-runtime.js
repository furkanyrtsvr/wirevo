import {sourceResistance} from './source-impedance.js';
import {MAX7219} from './max7219.js';
import {MCP3008} from './mcp3008.js';
import {BMP280} from './bmp280.js';
import {pinVoltage,poweredDevice,logic} from './bus-electrical.js';
const TYPES=['matrix8','digits8','mcp3008','bmp280'],OVERRIDE={none:0,set:2,clear:3};
/** Hardware SPI master plus edge-driven devices. The same devices also accept
 * firmware bit-banged pins through the actual DC nets; no source-code parser. */
export function attachSPIRuntime(runtime,engine,initial,{gpioOnly=false,types=TYPES}={}){
 let project=initial,disposed=false,generation=0,transactions=[],byteCount=0,devices=new Map(),driveSignature='',refreshing=false;
 const bus=runtime.bus?.spi,spi=runtime.spi,cpu=runtime.cpu,port=gpioOnly?null:runtime.ports[bus.port],previous=spi?.onByte,oldControl=cpu.writeHooks?.[0x4c];
 const drivePin=(pin,high)=>port.timerOverridePin(pin,high?OVERRIDE.set:OVERRIDE.clear);
 const syncIdle=()=>{const control=cpu.data[0x4c];if(control&0x40&&control&0x10)drivePin(bus.clockBit,!!(control&8));else{generation++;port.timerOverridePin(bus.clockBit,OVERRIDE.none);port.timerOverridePin(bus.mosiBit,OVERRIDE.none);spi.reset();}};
 if(!gpioOnly){cpu.writeHooks[0x4c]=(...args)=>{const result=oldControl?.(...args);cpu.addClockEvent(()=>{if(!disposed)syncIdle();},1);return result;};
 spi.onByte=value=>{
  const epoch=generation,control=cpu.data[0x4c],master=!!(control&16),cpol=!!(control&8),cpha=!!(control&4),lsb=!!(control&32),half=spi.clockDivider/2,cycle=cpu.cycles;let received=0;
  if(!master){cpu.addClockEvent(()=>{if(!disposed&&epoch===generation)spi.completeTransfer(0);},spi.transferCycles);return;}
  if(!cpha)drivePin(bus.mosiBit,!!(value&(1<<(lsb?0:7))));
  const sample=bit=>{if(runtime.readPin(bus.miso).high)received|=1<<(lsb?bit:7-bit);};
  for(let edge=0;edge<16;edge++)cpu.addClockEvent(()=>{if(disposed||epoch!==generation)return;const bit=edge>>1,leading=!(edge&1);
   if(leading){if(cpha)drivePin(bus.mosiBit,!!(value&(1<<(lsb?bit:7-bit))));drivePin(bus.clockBit,!cpol);if(!cpha)sample(bit);}else{drivePin(bus.clockBit,cpol);if(cpha)sample(bit);else if(bit<7)drivePin(bus.mosiBit,!!(value&(1<<(lsb?bit+1:6-bit))));}
   if(edge===15){spi.completeTransfer(received);byteCount++;transactions.push({cycle,end:cpu.cycles,mosi:value,miso:received,frequency:16000000/(half*2),mode:(cpol?2:0)|(cpha?1:0),lsb});if(transactions.length>128)transactions.shift();}
  },half*(edge+1));
 };
 }
 const refresh=()=>{if(refreshing||disposed)return;refreshing=true;try{if(!gpioOnly){const ss=runtime.readPin(bus.ss);if((cpu.data[0x4c]&0x50)===0x50&&!ss.outputEnabled&&!ss.high){generation++;cpu.data[0x4c]&=~16;cpu.setInterruptFlag(spi.SPI);spi.reset();port.timerOverridePin(bus.mosiBit,OVERRIDE.none);port.timerOverridePin(bus.clockBit,OVERRIDE.none);}}const dc=engine.solution,drivers=[];
  for(const[id,d]of devices){const c=project.components.find(c=>c.id===id);if(!c)continue;const v=pin=>pinVoltage(dc,id,pin),mcp=d.type==='mcp3008',bmp=d.type==='bmp280',power=poweredDevice(dc,id,mcp?{vcc:'VDD',gnd:'DGND',min:2.7}:bmp?{min:1.71,max:3.6}:{min:4});
   if(d.powered&&!power.powered)d.controller.reset();Object.assign(d,power);if(bmp){d.controller.setEnvironment(c.params);d.controller.tick(cpu.cycles);}
   const sampleMCP=(channel,single)=>{const plus=v('CH'+channel),minus=single?v('AGND'):v('CH'+(channel^1)),ref=v('VREF')-v('AGND'),rp=sourceResistance(dc,id+':CH'+channel,project),rm=single?0:sourceResistance(dc,id+':CH'+(channel^1),project);return Number.isFinite(plus)&&Number.isFinite(minus)&&ref>0&&rp!==null&&rm!==null?{voltage:plus-minus,reference:ref,ohms:rp+rm}:null;};
   const supply=power.voltage||5,clk=logic(v(bmp?'SCK':'CLK'),supply),din=logic(v(bmp?'SDI':'DIN'),supply),cs=logic(v(bmp?'CSB':'CS'),supply);
   d.connected=power.powered&&clk!==null&&din!==null&&cs!==null&&(!mcp||Number.isFinite(v('AGND'))&&Math.abs(v('AGND'))<.02&&v('VREF')>=.25&&v('VREF')<=supply+.001);
   d.overvoltage=bmp&&['SCK','SDI','CSB'].some(pin=>v(pin)>supply+.3);
   if(!mcp&&!bmp&&power.powered)drivers.push({endpoint:id+':DOUT',voltage:d.output?supply:0,ohms:50});
   if(!d.connected){d.lastClock=clk;d.lastCS=cs;d.spiBits=0;d.tx=null;d.command=false;d.writeAddress=false;continue;}
   if(mcp||bmp){if(d.lastCS!==cs){d.spiBits=0;d.spiByte=0;d.tx=null;d.read=false;d.command=false;d.writeAddress=false;if(mcp){d.controller.select();}else d.controller.begin(false,cpu.cycles);}}
   if(!clk&&d.lastClock===true){if(!mcp&&!bmp)d.output=d.controller.fall();if(mcp&&!cs){const bit=d.controller.fall(sampleMCP,cpu.cycles);if(bit!==null)d.output=bit;}if(bmp&&!cs&&d.tx!==null){d.output=(d.tx>>(7-d.txBit))&1;d.txBit=(d.txBit+1)%8;}}
   if(clk&&d.lastClock===false){if(!mcp&&!bmp)d.controller.clock(din);else if(!cs&&mcp)d.controller.rise(din,sampleMCP,cpu.cycles,supply);else if(!cs&&bmp){d.spiByte=((d.spiByte||0)<<1)|(din?1:0);if(++d.spiBits===8){const byte=d.spiByte&255;d.spiBits=0;d.spiByte=0;if(!d.command){d.read=!!(byte&128);d.address=byte|128;d.command=true;if(d.read){d.controller.begin(false,cpu.cycles);d.controller.pointer=d.address;d.tx=d.controller.read();d.txBit=0;}}else if(d.read){d.tx=d.controller.read();d.txBit=0;}else if(d.writeAddress){d.address=byte|128;d.writeAddress=false;}else{d.controller.writeRegister(d.address,byte,cpu.cycles);d.writeAddress=true;}}}}
   if(cs&&d.lastCS===false){if(!mcp&&!bmp)d.controller.load();if(bmp){d.command=false;d.controller.stop();}}
   if((mcp||bmp)&&!cs&&d.output!==undefined&&(mcp?d.controller.output!==null:d.tx!==null))drivers.push({endpoint:id+':'+(mcp?'DOUT':'SDO'),voltage:d.output?supply:0,ohms:50});
   if(!mcp&&!bmp&&power.powered)drivers.at(-1).voltage=d.output?supply:0;
   d.lastClock=clk;d.lastCS=cs;
  }
  const signature=JSON.stringify(drivers);if(signature!==driveSignature){driveSignature=signature;engine.setDrivers('spi',drivers);}
 }finally{refreshing=false;}};
 const reconcile=()=>{const ids=new Set();for(const c of project.components.filter(c=>types.includes(c.type))){ids.add(c.id);if(devices.get(c.id)?.type!==c.type)devices.set(c.id,{id:c.id,type:c.type,controller:c.type==='mcp3008'?new MCP3008():c.type==='bmp280'?(engine.deviceController?.(c.id,c.type,()=>new BMP280())??new BMP280()):new MAX7219(),powered:false,lastClock:null,lastCS:null,spiBits:0,output:['matrix8','digits8'].includes(c.type)?0:undefined,command:false});}for(const id of devices.keys())if(!ids.has(id))devices.delete(id);refresh();};
 reconcile();const unsubscribe=engine.subscribe(refresh);
 return{updateProject(next){project=next;reconcile();},snapshot(consume=false){refresh();const result={byteCount,transactions:[...transactions],master:gpioOnly?false:spi.isMaster,frequency:gpioOnly?null:spi.spiFrequency,modules:Object.fromEntries([...devices].map(([id,d])=>[id,{type:d.type,powered:d.powered,connected:d.connected,voltage:d.voltage,overvoltage:d.overvoltage,...d.controller.state(cpu.cycles)}]))};if(consume)transactions=[];return result;},dispose(){disposed=true;generation++;unsubscribe();engine.setDrivers('spi',[]);if(!gpioOnly){spi.onByte=previous;if(cpu.writeHooks[0x4c])cpu.writeHooks[0x4c]=oldControl;port.timerOverridePin(bus.mosiBit,OVERRIDE.none);port.timerOverridePin(bus.clockBit,OVERRIDE.none);}}};
}
