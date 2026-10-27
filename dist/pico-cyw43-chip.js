import {crc32} from './project-zip.js';
import {CYW43Backplane} from './pico-cyw43-backplane.js';
// ROM-independent CYW43439 host bus subset. No chip CPU or radio firmware runs here.
// Register/command references: georgerobotics/cyw43-driver src/cyw43_spi.{c,h}, cyw43_ll.c.
const word=(a,o)=>((a[o]||0)|(a[o+1]||0)<<8|(a[o+2]||0)<<16|(a[o+3]||0)<<24)>>>0;
const bytes=n=>Uint8Array.of(n,n>>>8,n>>>16,n>>>24);
const swap=a=>Uint8Array.from(a,(_,i)=>a[i^1]||0);
export class CYW43Chip {
 constructor({vbus=()=>true,onPower=()=>{},onLED=()=>{}}={}){this.vbus=vbus;this.onPower=onPower;this.onLED=onLED;this.powered=false;this.rom=null;this.romChecksum=null;this.ram=new Uint8Array(0x80000);this.stats={transactions:0,readBytes:0,writtenBytes:0,aborts:0,errors:0};this.reset();}
 loadROM(bytes){if(!(bytes instanceof Uint8Array)||bytes.length!==0xa0000)throw Error('CYW43439 ROM tam 640 KiB olmalı; RAM firmware dosyası ROM değildir.');this.rom=bytes.slice();this.romChecksum=crc32(this.rom);}
 reset(){this.backplane=new CYW43Backplane(this);this.bus=new Uint8Array(32);this.f1=new Map();this.window=0;this.interrupts=0;this.mask=0;this.gpioOut=0;this.gpioEnable=0;this.tx=[];this.selected=false;this.frame=null;this.lastError=null;this.ram.fill(0);this.onLED(false);this.updateIRQ();}
 power(value){value=!!value;if(value===this.powered)return;this.powered=value;this.reset();this.onPower(value);}
 fault(bits,message){this.interrupts|=bits;this.lastError=message;this.stats.errors++;this.updateIRQ();}
 get status(){return (this.interrupts&7)|((this.interrupts&24)?128:0);}
 get led(){return this.powered&&!!(this.gpioOut&this.gpioEnable&1);}
 setLED(value){this.setGPIO(0,value);}
 setGPIO(pin,value){if(!this.powered||pin<0||pin>1)return;this.gpioEnable|=1<<pin;this.gpioOut=(this.gpioOut&~(1<<pin))|(+!!value<<pin);this.onLED(this.led);}
 get gpioInput(){return this.powered?((this.gpioOut&this.gpioEnable&3)|(this.vbus()?4:0)):0;} // Board supply is USB-powered; WL_GPIO2 is VBUS sense.
 updateIRQ(){this.irq=this.powered&&!!(this.interrupts&this.mask);if(this.rp&&!this.selected)this.rp.gpio[24].setInputValue(this.irq===!!(this.bus[0]&0x20));}
 select(value){value=!!value;if(value===this.selected)return;if(!value){const f=this.frame;if(f){if(!f.command||f.position<f.length){this.stats.aborts++;this.fault(8,'Incomplete gSPI transaction');}else if(f.write)this.commit(f);this.stats.transactions++;}this.frame=null;}this.selected=value;if(value&&this.powered)this.frame={header:[],command:false,position:0,payload:[],bit:0,input:0,output:0,swapped:!(this.bus[0]&1)};this.updateIRQ();}
 // One byte as seen on the data line, MSB first within each byte.
 transfer(value){if(!this.powered||!this.selected||!this.frame)return 255;const f=this.frame;if(!f.command){f.header.push(value&255);if(f.header.length===4){const c=word(f.swapped?swap(f.header):f.header,0);f.command=true;f.write=!!(c&0x80000000);f.increment=!!(c&0x40000000);f.fn=c>>>28&3;f.address=c>>>11&0x1ffff;f.length=c&0x7ff;f.delay=!f.write?(f.fn===1?(this.bus[0x1d]||this.bus[1]):(this.bus[2]&4?this.bus[0x1c+f.fn]:0)):0;f.position=0;if(!f.length){f.invalid=true;this.fault(8,'Zero-length gSPI command is not supported');}if(!f.write){const data=Uint8Array.from({length:f.length},(_,i)=>this.readByte(f.fn,f.address+(f.increment?i:0)));f.response=f.swapped?swap(data):data;}}return 0;}if(f.delay){f.delay--;return 0;}const i=f.position++;if(i<f.length){if(f.write){f.payload.push(value&255);return 0;}this.stats.readBytes++;return f.response[i];}const statusIndex=i-((f.length+3)&~3);return (this.bus[2]&1)&&statusIndex>=0&&statusIndex<4?bytes(this.status)[statusIndex]:0;}
 commit(f){if(f.invalid)return;const payload=f.swapped?swap(f.payload):f.payload;if(f.fn===2){if(this.tx.length>=8){this.fault(4,'F2 transmit FIFO full; no firmware consumer');return;}this.tx.push(Uint8Array.from(payload));this.stats.writtenBytes+=payload.length;return;}for(let i=0;i<f.length;i++)this.writeByte(f.fn,f.address+(f.increment?i:0),payload[i]);this.stats.writtenBytes+=f.length;this.updateIRQ();}
 readByte(fn,address){if(fn===0){if(address>=4&&address<6)return this.interrupts>>>((address-4)*8)&255;if(address>=6&&address<8)return this.mask>>>((address-6)*8)&255;if(address>=8&&address<12)return this.status>>>((address-8)*8)&255;if(address===12)return 3;if(address===14||address===16)return 0; // F2/F3 not ready without firmware.
   if(address>=20&&address<24)return bytes(0xfeedbead)[address-20];return this.bus[address]||0;}
  if(fn===1){if(address>=0x10000)return this.f1.get(address)||0;const a=(this.window+(address&0x7fff))>>>0;if(a<this.ram.length)return this.ram[a];if(a>=0x800000&&a<0x8a0000&&this.rom)return this.rom[a-0x800000];const mapped=this.backplane.readByte(a);if(mapped!==null)return mapped;if(a>=0x18000000&&a<0x18000004)return bytes(43439)[a-0x18000000];if(a>=0x18000060&&a<0x1800006c){const reg=a&~3,v=reg===0x18000060?((this.gpioOut&this.gpioEnable&3)|(this.vbus()?4:0)):reg===0x18000064?this.gpioOut:this.gpioEnable;return v>>>((a&3)*8)&255;}this.fault(1,a>=0x800000&&a<0x8a0000||a>=0x1e000000&&a<0x1e0a0000?'WLAN ROM unavailable':'Unimplemented backplane address 0x'+a.toString(16));return 255;}
  this.fault(3,'F2/F3 data unavailable without firmware');return 255;
 }
 writeByte(fn,address,value){if(fn===0){if(address>=4&&address<6){this.interrupts&=~(value<<((address-4)*8));return;}if(address>=6&&address<8){const shift=(address-6)*8;this.mask=(this.mask&~(255<<shift))|value<<shift;return;}if(address<4||address>=0x1c&&address<=0x1f)this.bus[address]=value;return;}
  if(fn!==1){this.fault(8,'Unsupported gSPI function');return;}if(address>=0x10000){if(address>=0x1000a&&address<=0x1000c){const shift=(address-0x1000a+1)*8;this.window=((this.window&~(255<<shift))|(value<<shift))>>>0;this.window&=0xffff8000;}
   if(address===0x1000e)value=(value&0x3f)|(value&8?0x40:0)|(value&0x10?0xc0:0);if(address===0x1001f)value=(value&1)?value|2:0;this.f1.set(address,value);return;}
  const a=(this.window+(address&0x7fff))>>>0;if(a<this.ram.length){this.ram[a]=value;return;}if(a>=0x800000&&a<0x8a0000){this.fault(1,'WLAN ROM is read-only');return;}if(this.backplane.writeByte(a,value))return;if(a>=0x18000064&&a<0x1800006c){const key=a<0x18000068?'gpioOut':'gpioEnable',shift=(a&3)*8;this[key]=((this[key]&~(255<<shift))|value<<shift)>>>0;this.onLED(this.led);return;}this.fault(1,'Backplane write unavailable at 0x'+a.toString(16));
 }
 attach(rp){this.rp=rp;const pin=n=>rp.gpio[n],high=n=>pin(n).value===1;this.listeners=[pin(23).addListener(()=>this.power(high(23))),pin(25).addListener(()=>this.select(!high(25))),pin(29).addListener(()=>{if(!this.powered||!this.selected||!this.frame)return;const f=this.frame;if(high(29)){if(f.bit===0){ // Prepare output without consuming a host byte.
    f.output=this.peek();
   }f.input=(f.input<<1)|+high(24);if(++f.bit===8){this.transfer(f.input);f.input=0;f.bit=0;}}
   else if(pin(24).value>=2){const bit=f.bit===0?7:7-f.bit;pin(24).setInputValue(!!((f.bit===0?this.peek():f.output)&(1<<bit)));}})];this.power(high(23));this.select(!high(25));this.updateIRQ();}
 peek(){const f=this.frame;if(!f?.command||f.delay)return 0;if(f.position<f.length)return f.write?0:(f.response?.[f.position]||0);const i=f.position-((f.length+3)&~3);return (this.bus[2]&1)&&i>=0&&i<4?bytes(this.status)[i]:0;}
 snapshot(){return{powered:this.powered,model:'CYW43439 gSPI / backplane subset',firmwareRunning:false,romAvailable:!!this.rom,rom:this.rom?{base:0x800000,bytes:this.rom.length,crc32:this.romChecksum,source:'user-supplied',executing:false}:null,ramBytes:this.ram.length,backplane:this.backplane.snapshot(),window:this.window>>>0,interrupts:this.interrupts,irq:this.irq,led:this.led,txPending:this.tx.length,lastError:this.lastError,stats:{...this.stats}};}
 dispose(){for(const remove of this.listeners||[])remove();this.listeners=[];this.rp=null;}
}
