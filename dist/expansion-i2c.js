import {BMP280,compensateBMP} from './bmp280.js';
import {DS1307} from './i2c-devices.js';
const HZ=16000000,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rates=[8,16,32,64,128,250,475,860];
export class Registers {
 constructor(size=256){this.r=new Uint8Array(size);this.pointer=0;this.revision=0;this.first=true;}
 begin(write,cycle){this.tick?.(cycle);this.first=write;this.latched=this.r.slice();}
 write(v,cycle){if(this.first){this.pointer=v;this.first=false;}else{this.writeRegister(this.pointer++%this.r.length,v,cycle);this.revision++;}return true;}
 writeRegister(a,v){this.r[a]=v;}
 read(cycle){this.tick?.(cycle);return this.latched?.[this.pointer++%this.r.length]??this.r[this.pointer++%this.r.length];}
 stop(){}
 state(){return{revision:this.revision};}
}
export class ADS1115 {
 constructor(){this.reset();}
 reset(){this.words=[0,0x8583,0x8000,0x7fff];this.pointer=0;this.first=true;this.readyAt=null;this.samples=0;this.inputs=Array(4).fill(null);}
 setAnalog(v){this.inputs=Array.from({length:4},(_,i)=>v('A'+i));}
 begin(write,c){this.tick(c);this.first=write;this.bytes=[];this.readIndex=0;this.latched=this.words[this.pointer];}
 write(v,c){if(this.first){this.pointer=v&3;this.first=false;}else{this.bytes.push(v);if(this.bytes.length===2){const w=this.bytes[0]*256+v;this.words[this.pointer]=w;this.bytes=[];if(this.pointer===1&&((w&0x8000)||!(w&256)))this.start(c);}}return true;}
 start(c){this.words[1]&=0x7fff;this.readyAt=c+Math.ceil(HZ/rates[(this.words[1]>>5)&7]);}
 tick(c){if(this.readyAt===null||c<this.readyAt)return;const config=this.words[1],mux=config>>12&7,gain=[6.144,4.096,2.048,1.024,.512,.256,.256,.256][config>>9&7],pairs=[[0,1],[0,3],[1,3],[2,3]],a=mux>=4?mux-4:pairs[mux][0],b=mux>=4?null:pairs[mux][1],plus=this.inputs[a],minus=b===null?0:this.inputs[b];this.valid=Number.isFinite(plus)&&Number.isFinite(minus);this.words[0]=this.valid?Math.round(clamp((plus-minus)/gain,-1,32767/32768)*32768)&65535:0;this.words[1]|=0x8000;this.samples++;this.readyAt=null;if(!(config&256))this.start(c);}
 nextEvent(){return this.readyAt;}
 read(){return this.readIndex++%2?this.latched&255:this.latched>>8;}
 state(){return{samples:this.samples,code:this.words[0]&32768?this.words[0]-65536:this.words[0],valid:this.valid,busy:this.readyAt!==null};}
}
export class MCP4725 {
 constructor(){this.reset();}
 reset(){this.eeprom??=0;this.code=this.eeprom;this.powerDown=this.savedPowerDown??0;this.busyUntil=0;this.revision=0;}
 begin(write){this.data=[];this.index=0;}
 write(v,c){this.data.push(v);const b=this.data;if((b[0]&0xc0)===0&&b.length===2){this.code=((b[0]&15)<<8)|b[1];this.powerDown=b[0]>>4&3;this.revision++;}else if([0x40,0x60].includes(b[0]&0xe0)&&b.length===3){this.code=(b[1]<<4)|(b[2]>>4);this.powerDown=b[0]>>1&3;if((b[0]&0xe0)===0x60){this.eeprom=this.code;this.savedPowerDown=this.powerDown;this.busyUntil=c+400000;}this.revision++;}return b.length<=3;}
 read(c){return[(c>=this.busyUntil?128:0)|(this.powerDown<<1),this.code>>4,(this.code&15)<<4,this.eeprom>>8,this.eeprom&255][this.index++%5];}
 drivers(v){return this.powerDown?[{pin:'OUT',voltage:0,ohms:[0,1000,100000,500000][this.powerDown]}]:[{pin:'OUT',voltage:v*this.code/4096,ohms:1}];}
 state(){return{code:this.code,eeprom:this.eeprom,powerDown:this.powerDown,revision:this.revision};}
}
export class PCF8574 {
 constructor(){this.reset();}
 reset(){this.latch=255;this.levels=Array(8).fill(null);this.interrupt=false;this.revision=0;}
 setAnalog(v,supply){const next=Array.from({length:8},(_,i)=>v('P'+i)),bits=a=>a.reduce((n,x,i)=>n|(Number.isFinite(x)&&x>=.7*supply?1<<i:0),0);if(bits(next)!==bits(this.levels))this.interrupt=true;this.levels=next;}
 begin(){this.interrupt=false;}
 write(v){this.latch=v;this.interrupt=false;this.revision++;return true;}
 read(){this.interrupt=false;return this.levels.reduce((n,v,i)=>n|(v>=2?1<<i:0),0);}
 drivers(v){return [...Array.from({length:8},(_,i)=>({pin:'P'+i,voltage:this.latch&(1<<i)?v:0,ohms:this.latch&(1<<i)?33000:50})),...(this.interrupt?[{pin:'INT',voltage:0,ohms:50}]:[])];}
 state(){return{latch:this.latch,gpio:this.levels.reduce((n,v,i)=>n|(v>=2?1<<i:0),0),revision:this.revision};}
}
export class PCA9685 extends Registers {
 constructor(){super();this.reset();}
 reset(){this.r.fill(0);this.r[0]=1;this.r[1]=4;this.r[0xfe]=30;this.cycle=0;this.oe=true;}
 setAnalog(v){this.oe=!(v('OE')<=.6);}
 write(v,c){if(this.first){this.pointer=v;this.first=false;}else{this.writeRegister(this.pointer,v,c);if(this.r[0]&32)this.pointer=(this.pointer+1)&255;this.revision++;}return true;}
 tick(c){this.cycle=c;}
 get period(){return HZ*(this.r[0xfe]+1)*4096/25000000;}
 channel(i){const a=6+i*4,on=this.r[a]|(this.r[a+1]&15)<<8,off=this.r[a+2]|(this.r[a+3]&15)<<8;return{on,off,fullOn:!!(this.r[a+1]&16),fullOff:!!(this.r[a+3]&16)};}
 high(i){const x=this.channel(i),phase=Math.floor((this.cycle%this.period)/this.period*4096);return !(this.r[0]&16)&&!x.fullOff&&(x.fullOn||(x.on<=x.off?phase>=x.on&&phase<x.off:phase>=x.on||phase<x.off));}
 nextEvent(c){if(this.oe||this.r[0]&16)return null;let next=Infinity;for(let i=0;i<16;i++){const x=this.channel(i);if(x.fullOn||x.fullOff||x.on===x.off)continue;for(const count of[x.on,x.off]){let t=Math.floor(c/this.period)*this.period+count/4096*this.period;if(t<=c+1)t+=this.period;next=Math.min(next,t);}}return Number.isFinite(next)?Math.ceil(next):null;}
 drivers(v){return this.oe?[]:Array.from({length:16},(_,i)=>({pin:'PWM'+i,voltage:this.high(i)?v:0,ohms:50}));}
 state(){return{revision:this.revision,hz:HZ/this.period,enabled:!this.oe,duties:Array.from({length:16},(_,i)=>{const x=this.channel(i);return x.fullOff?0:x.fullOn?1:((x.off-x.on+4096)%4096)/4096;})};}
}
export class AHT20 {
 constructor(){this.reset();this.environment={temperature:25,humidity:50};}
 reset(){this.calibrated=false;this.until=null;this.pointer=0;this.samples=0;this.frame=Array(7).fill(0);}
 setEnvironment(p){this.environment={temperature:p.temperature??25,humidity:p.humidity??50};}
 begin(write,c){this.tick(c);this.data=[];this.pointer=0;}
 write(v,c){this.data.push(v);if(v===0xba&&this.data.length===1)this.reset();if(this.data.length===3){if(this.data[0]===0xbe)this.calibrated=true;if(this.data[0]===0xac&&this.calibrated)this.until=c+1280000;}return this.data.length<=3;}
 tick(c){if(this.until===null||c<this.until)return;const h=Math.round(clamp(this.environment.humidity,0,100)/100*1048575),t=Math.round(clamp(this.environment.temperature+50,0,200)/200*1048575),b=[8,h>>12,(h>>4)&255,((h&15)<<4)|(t>>16),t>>8&255,t&255];let crc=255;for(const v of b){crc^=v;for(let i=0;i<8;i++)crc=crc&128?((crc<<1)^0x31)&255:crc<<1&255;}this.frame=[...b,crc];this.until=null;this.samples++;}
 nextEvent(){return this.until;}
 read(){return this.until!==null?this.pointer++===0?0x88:0xff:this.samples?this.frame[this.pointer++%7]:this.pointer++===0?(this.calibrated?8:0):0;}
 state(){return{...this.environment,samples:this.samples,calibrated:this.calibrated,busy:this.until!==null};}
}
export class ADXL345 extends Registers {
 constructor(){super();this.reset();this.environment={ax:0,ay:0,az:1};}
 reset(){this.r.fill(0);this.r[0]=0xe5;this.r[0x2c]=10;this.last=0;this.samples=0;}
 setEnvironment(p){this.environment={ax:p.ax??0,ay:p.ay??0,az:p.az??1};}
 tick(c){if(!(this.r[0x2d]&8)){this.last=c;return;}const period=HZ/(6.25*2**((this.r[0x2c]&15)-6));if(c-this.last<period)return;this.last=c;const full=!!(this.r[0x31]&8),range=this.r[0x31]&3,scale=full?256:256/2**range;['ax','ay','az'].forEach((k,i)=>{const n=Math.round(clamp(this.environment[k]*scale,-32768,32767));this.r[0x32+i*2]=n&255;this.r[0x33+i*2]=n>>8&255;});this.r[0x30]|=128;this.samples++;}
 read(c){const p=this.pointer,v=super.read(c);if(p>=0x32&&p<=0x37)this.r[0x30]&=~128;return v;}
 nextEvent(c){return this.r[0x2d]&8?Math.max(c+1,this.last+HZ/(6.25*2**((this.r[0x2c]&15)-6))):null;}
 drivers(v){const active=!!(this.r[0x2e]&this.r[0x30]);return[{pin:'INT1',voltage:active?v:0,ohms:50}];}
 state(){return{...this.environment,samples:this.samples,enabled:!!(this.r[0x2d]&8)};}
}
export class DS3231 extends Registers {
 constructor(){super(19);this.reset();this.environment={temperature:25};}
 reset(){this.r.fill(0);this.r.set([0,0,0,1,1,1,0]);this.r[14]=0x1c;this.r[15]=0x80;this.last=0;this.samples=0;}
 setEnvironment(p){this.environment={temperature:p.temperature??25};}
 tick(c){if(!(this.r[14]&128)){const seconds=Math.floor((c-this.last)/HZ);if(seconds>0){const helper=new DS1307();helper.registers.set(this.r.slice(0,7));helper.lastCycle=this.last;helper.tick(c);this.r.set(helper.registers.slice(0,7));this.last+=seconds*HZ;this.samples+=seconds;}}else this.last=c;const t=Math.round(this.environment.temperature*4);this.r[17]=(t>>2)&255;this.r[18]=(t&3)<<6;}
 writeRegister(a,v){if(a===0)this.last=this.cycle??0;if(a<17)this.r[a]=v;}
 begin(w,c){this.cycle=c;super.begin(w,c);}
 nextEvent(c){return this.r[14]&128?null:Math.max(c+1,this.last+HZ);}
 state(c){this.tick(c);return{time:Array.from(this.r.slice(0,3)).reverse().map(v=>v.toString(16).padStart(2,'0')).join(':'),temperature:this.environment.temperature,revision:this.revision};}
}
export class FRAM {
 constructor(){this.memory=new Uint8Array(32768).fill(255);this.reset();}
 reset(){this.pointer=0;this.index=0;this.revision=0;}
 begin(write){this.index=0;this.writeMode=write;this.pending=[];}
 write(v){if(this.index===0)this.high=v&127;else if(this.index===1)this.pointer=(this.high<<8)|v;else this.pending.push([this.pointer++&32767,v]);this.index++;return true;}
 read(){return this.memory[this.pointer++&32767];}
 stop(c,wp){if(!wp)for(const[a,v]of this.pending){this.memory[a]=v;this.revision++;}this.pending=[];}
 state(){return{pointer:this.pointer,revision:this.revision,preview:Array.from(this.memory.slice(0,16))};}
}
const desc=(create,min=2.7)=>({bus:'I2C',create,power:{vcc:'VCC',gnd:'GND',min,max:3.6},pins:{data:'SDA',clock:'SCL'},pullup:4700,maxFrequency:400000,configuration:()=>({valid:true})});
const bits=(v,prefix,count=3)=>{const b=Array.from({length:count},(_,i)=>v(prefix+i));return{valid:b.every(Number.isFinite),address:b.reduce((n,x,i)=>n|(x>=2?1<<i:0),0)};};
export const EXPANSION_I2C={
 ads1115:{...desc(()=>new ADS1115(),2),defaultAddress:72,configuration:(v,s)=>({valid:Number.isFinite(v('ADDR')),address:72+(v('ADDR')>=.7*s?1:0)}),update:(v,c)=>c.setAnalog(v)},
 mcp4725:{...desc(()=>new MCP4725()),defaultAddress:96,configuration:(v,s)=>({valid:Number.isFinite(v('A0')),address:96+(v('A0')>=.7*s?1:0)})},
 pcf8574:{...desc(()=>new PCF8574(),2.5),defaultAddress:32,configuration:v=>{const b=bits(v,'A');return{...b,address:32+b.address};},update:(v,c)=>c.setAnalog(v,3.3)},
 pca9685:{...desc(()=>new PCA9685(),2.3),defaultAddress:64,update:(v,c)=>c.setAnalog(v)},
 aht20:{...desc(()=>new AHT20(),2.2),defaultAddress:56},
 adxl345:{...desc(()=>new ADXL345(),2),defaultAddress:83,configuration:(v,s)=>({valid:v('CS')>=.7*s&&Number.isFinite(v('SDO')),address:v('SDO')>=.7*s?29:83})},
 ds3231:{...desc(()=>new DS3231(),2.3),defaultAddress:104},
 fram:{...desc(()=>new FRAM(),2.7),defaultAddress:80,configuration:v=>{const b=bits(v,'A');return{...b,address:80+b.address,writeProtected:!(v('WP')<.6)};}},
};
