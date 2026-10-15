import {MEGA_TIMERS,MEGA_UARTS,MEGA_PORTS,MEGA_ADC,MEGA_PINS} from './mega2560-config.js';
import {attachDCSense} from './dc-sense.js';
import { CPU, avrInstruction, AVRIOPort, AVRTimer, AVRUSART, AVRADC, AVRTWI, AVRSPI, spiConfig, twiConfig, portBConfig, portCConfig, portDConfig, timer0Config, timer1Config, timer2Config, usart0Config, adcConfig } from 'avr8js';

export const UNO_HZ = 16000000;

/** Parse Intel HEX, checking every record before firmware touches simulated flash. */
export function parseHex(text,{flashSize=32768}={}) {
  if(![32768,262144].includes(flashSize))throw new Error("Desteklenmeyen flash kapasitesi.");
  const flash = new Uint8Array(flashSize);
  let upper = 0, end = false, used = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (end || !/^:[\da-f]+$/i.test(line) || line.length % 2 !== 1) throw new Error('Geçersiz Intel HEX kaydı.');
    const bytes = Uint8Array.from(line.slice(1).match(/../g), b=>parseInt(b,16));
    const count=bytes[0], address=(bytes[1]<<8)|bytes[2], type=bytes[3];
    if (bytes.length !== count+5 || bytes.reduce((sum,b)=>sum+b,0)%256 !== 0) throw new Error('Intel HEX sağlama toplamı hatalı.');
    const data=bytes.subarray(4,4+count);
    if (type===0) {
      const offset=upper+address;
      if (offset+count>flash.length) throw new Error('Firmware '+(flashSize===32768?'ATmega328P':'ATmega2560')+' flash kapasitesini aşıyor.');
      flash.set(data,offset); used=Math.max(used,offset+count);
    } else if (type===1) { if (count!==0) throw new Error('Geçersiz EOF kaydı.'); end=true; }
    else if (type===2) { if(count!==2) throw new Error('Geçersiz segment kaydı.'); upper=((data[0]<<8)|data[1])*16; }
    else if (type===4) { if(count!==2) throw new Error('Geçersiz adres kaydı.'); upper=((data[0]<<8)|data[1])*65536; }
    else if (type!==3 && type!==5) throw new Error('Desteklenmeyen Intel HEX kaydı.');
  }
  if (!end || !used) throw new Error('Firmware boş veya EOF kaydı eksik.');
  return {program:new Uint16Array(flash.buffer), flashBytes:used};
}

function unoPin(pin) {
  const n=Number(String(pin).replace(/^D/,''));
  if (/^A[0-5]$/.test(pin)) return {port:'C',index:Number(pin.slice(1))};
  if (Number.isInteger(n) && n>=0 && n<=7) return {port:'D',index:n};
  if (Number.isInteger(n) && n>=8 && n<=13) return {port:'B',index:n-8};
  throw new Error('Geçersiz Uno GPIO pini: '+pin);
}

/** Executes actual ATmega328P instructions. No source-pattern behavioral emulation. */
export class UnoRuntime {
  constructor(hex,{onSerial=()=>{},onPin=()=>{},onSerialPort=()=>{},board='uno',dcSense=true}={}) {
    if(!['uno','nano','pro-mini','mega','duemilanove','pro'].includes(board))throw Error('Desteklenmeyen MCU hedefi.');this.board=board;const mega=board==='mega';this.analogChannels=mega?16:['nano','pro-mini'].includes(board)?8:6;
    this.pinMap=mega?MEGA_PINS:Object.fromEntries([...Array.from({length:14},(_,i)=>['D'+i,unoPin('D'+i)]),...Array.from({length:this.analogChannels},(_,analog)=>['A'+analog,{port:'C',index:analog,analog,analogOnly:analog>=6}])]);
    this.bus={twi:mega?{data:'D20',clock:'D21'}:{data:'A4',clock:'A5'},spi:mega?{port:'B',ss:'D53',mosi:'D51',miso:'D50',clock:'D52',mosiBit:2,clockBit:1}:{port:'B',ss:'D10',mosi:'D11',miso:'D12',clock:'D13',mosiBit:3,clockBit:5},uart:mega?[{rx:'D0',tx:'D1'},{rx:'D19',tx:'D18'},{rx:'D17',tx:'D16'},{rx:'D15',tx:'D14'}]:[{rx:'D0',tx:'D1'}]};
    const firmware=parseHex(hex,{flashSize:mega?262144:32768});
    this.cpu=new CPU(firmware.program,mega?8192+256:2048);
    this.timers=(mega?MEGA_TIMERS:[timer0Config,timer1Config,timer2Config]).map(c=>new AVRTimer(this.cpu,c));
    this.ports=Object.fromEntries(Object.entries(mega?MEGA_PORTS:{B:portBConfig,C:portCConfig,D:portDConfig}).map(([name,c])=>[name,new AVRIOPort(this.cpu,c)]));
    const uartConfigs=mega?MEGA_UARTS:[usart0Config];this.usarts=uartConfigs.map(c=>new AVRUSART(this.cpu,c,UNO_HZ));this.usart=this.usarts[0];
    this.adc=new AVRADC(this.cpu,mega?MEGA_ADC:adcConfig);
    this.twi=new AVRTWI(this.cpu,mega?{...twiConfig,twiInterrupt:78}:twiConfig,UNO_HZ);
    this.spi=new AVRSPI(this.cpu,mega?{...spiConfig,spiInterrupt:48}:spiConfig,UNO_HZ);
    this.events=[];this.pinHistory=new Map();this.lastSnapshotCycle=0;this.analogInputs=new Map();this.digitalInputs=new Map();this.serialQueues=this.usarts.map(()=>[]);this.serialQueue=this.serialQueues[0];this.rxEvents=[];
    this.usarts.forEach((usart,port)=>{usart.onByteTransmit=byte=>{onSerialPort(port,byte);if(port===0)onSerial(String.fromCharCode(byte));};usart.onRxComplete=()=>{this.rxEvents.push({port,cycle:this.cpu.cycles,time:this.cpu.cycles/UNO_HZ});if(this.rxEvents.length>256)this.rxEvents.shift();this.pumpSerial(port);};usart.onConfigurationChange=()=>this.pumpSerial(port);});
    for(let uartIndex=0;uartIndex<this.usarts.length;uartIndex++){
    const usart0Config=uartConfigs[uartIndex];
    // AVR8js 0.21 clears RXC on every UCSR0B rewrite while RX stays enabled,
    // including Arduino's transmit-interrupt updates. Preserve pending receive
    // data; the hardware flushes RXC only when the receiver is disabled.
    const receiveInterrupt={address:usart0Config.rxCompleteInterrupt,flagRegister:usart0Config.UCSRA,flagMask:0x80,enableRegister:usart0Config.UCSRB,enableMask:0x80,constant:true};
    // UCSR0A's RXC/UDRE/error bits are read-only, while TXC is write-one-to-clear.
    // Arduino writes TXC during transmit; AVR8js 0.21's hook otherwise wipes
    // a concurrent RXC flag, dropping bytes when receive and transmit overlap.
    const writeStatusA=this.cpu.writeHooks[usart0Config.UCSRA];
    this.cpu.writeHooks[usart0Config.UCSRA]=(value,oldValue,...rest)=>{
      const status=oldValue&0xbc,transmitComplete=value&0x40?0:oldValue&0x40;
      const handled=writeStatusA(value,oldValue,...rest);
      this.cpu.data[usart0Config.UCSRA]|=status|transmitComplete;
      if(status&0x80)this.cpu.setInterruptFlag(receiveInterrupt);
      return handled;
    };
    const writeControlB=this.cpu.writeHooks[usart0Config.UCSRB];
    this.cpu.writeHooks[usart0Config.UCSRB]=(value,oldValue,...rest)=>{
      const pending=Boolean(this.cpu.data[usart0Config.UCSRA]&0x80),handled=writeControlB(value,oldValue,...rest);
      if(value&0x10){if(pending)this.cpu.setInterruptFlag(receiveInterrupt);}
      else this.cpu.clearInterrupt(receiveInterrupt);
      return handled;
    };
    }
    this.running=false;
    this.flashBytes=firmware.flashBytes;
    for(const [name,port] of Object.entries(this.ports)) port.addListener((value,previous)=>{
      const changed=value^previous;
      for(const [pin,p] of Object.entries(this.pinMap)) if(!p.analogOnly&&p.port===name&&(changed&(1<<p.index))) {
        const index=p.index;
        const event={pin,high:Boolean(value&(1<<index)),cycle:this.cpu.cycles,time:this.cpu.cycles/UNO_HZ};
        const history=this.pinHistory.get(pin)||{high:false,lastCycle:0,highCycles:0};
        if(history.high)history.highCycles+=this.cpu.cycles-history.lastCycle;
        history.high=event.high;history.lastCycle=this.cpu.cycles;this.pinHistory.set(pin,history);
        this.events.push(event); if(this.events.length>2000)this.events.shift(); onPin(event);
      }
    });
    // AVR8js exposes driven logic through setPin, but no floating-input API.
    // Recompute undriven input logic whenever firmware changes PORT/DDR/PIN,
    // preserving the real INPUT_PULLUP bit and existing peripheral hooks.
    for(const [name,port]of Object.entries(this.ports))for(const address of [port.portConfig.PORT,port.portConfig.DDR,port.portConfig.PIN]){
      const hook=this.cpu.writeHooks[address];
      this.cpu.writeHooks[address]=(...args)=>{const handled=hook?.(...args);this.syncInputs(name);return handled;};
    }
    this.syncInputs();
    if(dcSense)attachDCSense(this);
  }
  syncInputs(onlyPort=null){
    for(const[name,port]of Object.entries(this.ports)){
      if(onlyPort&&name!==onlyPort)continue;
      for(const[pin,p]of Object.entries(this.pinMap)){if(p.port!==name||p.analogOnly)continue;const index=p.index;
        const high=this.digitalInputs.has(pin)?this.digitalInputs.get(pin):this.analogInputs.has(pin)?this.analogInputs.get(pin)>=2.5:Boolean(this.cpu.data[port.portConfig.PORT]&(1<<index));
        port.setPin(index,high);
      }
    }
  }
  resolvePin(pin){pin=String(pin);if(/^\d+$/.test(pin))pin='D'+pin;if(this.board==='mega'&&/^D\d+$/.test(pin)&&+pin.slice(1)>=54&&+pin.slice(1)<=69)pin='A'+(+pin.slice(1)-54);const p=this.pinMap[pin];if(!p)throw Error('Geçersiz GPIO pini: '+pin);return{pin,...p};}
  setDigital(pin,high){const p=this.resolvePin(pin);if(p.analogOnly)throw Error('Bu pin yalnızca analog giriştir.');this.digitalInputs.set(p.pin,Boolean(high));this.analogInputs.delete(p.pin);if(p.analog!==undefined)this.adc.channelValues[p.analog]=high?5:0;this.syncInputs(p.port);}
  setAnalog(pin,volts){const p=this.resolvePin(pin);if(p.analog===undefined)throw Error('Analog giriş gerekli.');const voltage=Math.max(0,Math.min(5,Number(volts)||0));this.adc.channelValues[p.analog]=voltage;this.analogInputs.set(p.pin,voltage);this.digitalInputs.delete(p.pin);this.syncInputs(p.port);}
  replaceInputs(inputs={}){
    const digital=new Map(),analog=new Map();
    for(const[pin,high]of Object.entries(inputs.digital||{})){const p=this.resolvePin(pin);if(p.analogOnly)throw Error('Bu pin yalnızca analog giriştir.');digital.set(p.pin,Boolean(high));}
    for(const[pin,volts]of Object.entries(inputs.analog||{})){const p=this.resolvePin(pin);if(p.analog===undefined)throw Error('Analog giriş gerekli.');analog.set(p.pin,Math.max(0,Math.min(5,Number(volts)||0)));digital.delete(p.pin);}
    this.digitalInputs=digital;this.analogInputs=analog;
    for(let i=0;i<this.analogChannels;i++){const pin='A'+i;this.adc.channelValues[i]=analog.has(pin)?analog.get(pin):digital.get(pin)?5:0;}this.syncInputs();
  }
  queueSerial(text,port=0){return this.queueSerialBytes(new TextEncoder().encode(String(text)),port);}
  queueSerialBytes(bytes,port=0){const queue=this.serialQueues[port];if(!queue)throw Error('Geçersiz UART kanalı.');if(!Array.from(bytes).every(b=>Number.isInteger(b)&&b>=0&&b<=255))throw Error('Geçersiz UART byte.');if(queue.length+bytes.length>16384)throw Error('UART giriş kuyruğu dolu.');queue.push(...bytes);this.pumpSerial(port);return queue.length;}
  pumpSerial(port=0){const queue=this.serialQueues[port],uart=this.usarts[port];if(queue?.length&&uart.writeByte(queue[0],false))queue.shift();}
  readPin(pin){const p=this.resolvePin(pin);pin=p.pin;if(p.analogOnly)return{state:2,mode:'ANALOG',outputEnabled:false,high:false,voltage:this.analogInputs.get(pin)??0,analogOnly:true};const port=this.ports[p.port],state=port.pinState(p.index),high=state<2?state===1:Boolean(this.cpu.data[port.portConfig.PIN]&(1<<p.index)),voltage=state>=2&&this.analogInputs.has(pin)?this.analogInputs.get(pin):high?5:0;return{state,mode:state>=2?'INPUT':'OUTPUT',outputEnabled:state<2,high,voltage};}
  snapshot(consumeAverage=false) {
    const pins={},span=this.cpu.cycles-this.lastSnapshotCycle;
    const read=pin=>{
      const value=this.readPin(pin),history=this.pinHistory.get(pin),sum=history?history.highCycles+(history.high?this.cpu.cycles-history.lastCycle:0):0;
      const duty=value.outputEnabled&&span?Math.max(0,Math.min(1,sum/span)):value.high?1:0;
      pins[pin]={...value,duty,averageVoltage:value.outputEnabled?duty*5:value.voltage};
      if(history&&consumeAverage){history.highCycles=0;history.lastCycle=this.cpu.cycles;}
    };
    for(const pin of Object.keys(this.pinMap))read(pin);
    if(consumeAverage)this.lastSnapshotCycle=this.cpu.cycles;
    const uarts=this.usarts.map((u,i)=>({baudRate:u.baudRate,rxEnabled:u.rxEnable,txEnabled:u.txEnable,queuedRx:this.serialQueues[i].length+(u.rxBusy?1:0)}));
    return {board:this.board,cycles:this.cpu.cycles,seconds:this.cpu.cycles/UNO_HZ,pins,flashBytes:this.flashBytes,uart:uarts[0],uarts};
  }
  stepCycles(cycles=200000) {const target=this.cpu.cycles+Math.max(1,Math.min(1600000,cycles));while(this.cpu.cycles<target){avrInstruction(this.cpu);this.cpu.tick();}return this.snapshot();}
  start(onFrame=()=>{},speed=1) {
    this.stop();this.running=true;let wall=performance.now(),baseline=this.cpu.cycles;
    const frame=()=>{
      if(!this.running)return;
      const target=baseline+(performance.now()-wall)/1000*UNO_HZ*Math.max(.1,Math.min(10,speed));
      const chunk=Math.min(320000,Math.max(0,target-this.cpu.cycles));
      if(chunk)this.stepCycles(chunk);
      onFrame(this.snapshot());this.timeout=setTimeout(frame,0);
    };frame();
  }
  stop(){this.running=false;clearTimeout(this.timeout);}
}
