import {BMP280,compensateBMP} from './bmp280.js';
import {Registers} from './expansion-i2c.js';
const HZ=16000000,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export class BME280 extends BMP280 {
 constructor(){super();this.environment.humidity=50;}
 reset(){super.reset();this.registers[0xd0]=0x60;this.registers[0xa1]=75;this.registers[0xe1]=0x6a;this.registers[0xe2]=1;this.registers[0xe3]=0;this.registers[0xe4]=0x14;this.registers[0xe5]=0x25;this.registers[0xe6]=3;this.registers[0xe7]=30;this.registers[0xfd]=0x80;this.registers[0xfe]=0;}
 setEnvironment(p){super.setEnvironment(p);this.environment.humidity=p.humidity??50;}
 writeRegister(a,v,c){if(a===0xf2)this.registers[a]=v&7;else super.writeRegister(a,v,c);}
 tick(c){const rev=this.revision;super.tick(c);if(this.revision===rev)return;const fine=compensateBMP(this.rawT,this.rawP).temperature*5120,comp=raw=>{let h=fine-76800;h=(raw-(325*64+50/16384*h))*(362/65536*(1+30/67108864*h*(1+0/67108864*h)));return clamp(h*(1-75*h/524288),0,100);};let low=0,high=65535;for(let i=0;i<16;i++){const mid=(low+high)>>1;if(comp(mid)<this.environment.humidity)low=mid+1;else high=mid;}this.registers[0xfd]=low>>8;this.registers[0xfe]=low&255;}
 state(c){return{...super.state(c),humidity:this.environment.humidity,rawH:this.registers[0xfd]*256+this.registers[0xfe]};}
}
export class INA226 {
 constructor(){this.reset();this.input={valid:false};}
 reset(){this.words=new Uint16Array(256);this.words[0]=0x4127;this.words[0xfe]=0x5449;this.words[0xff]=0x2260;this.pointer=0;this.samples=0;this.until=null;}
 duration(){const t=[140,204,332,588,1100,2116,4156,8244],c=this.words[0],mode=c&7;return ((mode&1?t[c>>3&7]:0)+(mode&2?t[c>>6&7]:0))*[1,4,16,64,128,256,512,1024][c>>9&7]*16;}
 setAnalog(v){const plus=v('VIN+'),minus=v('VIN-'),g=v('GND');this.input={valid:[plus,minus,g].every(Number.isFinite)&&plus-g>=0&&plus-g<=36&&minus-g>=0&&minus-g<=36,shunt:plus-minus,bus:minus-g};}
 begin(w,c){this.tick(c);this.first=w;this.data=[];this.index=0;this.latched=this.words[this.pointer];}
 write(v,c){if(this.first){this.pointer=v;this.first=false;}else{this.data.push(v);if(this.data.length===2){const n=this.data[0]*256+v;if(this.pointer===0&&n&0x8000)this.reset();else this.words[this.pointer]=n;this.data=[];if(this.pointer===0)this.until=c+this.duration();}}return true;}
 tick(c){if(this.until===null){if(this.words[0]&7)this.until=c+this.duration();return;}if(c<this.until)return;const q=this.words;this.valid=this.input.valid;q[1]=this.valid?Math.round(clamp(this.input.shunt/.0000025,-32768,32767))&65535:0;q[2]=this.valid?Math.round(clamp(this.input.bus/.00125,0,65535)):0;const signed=q[1]&0x8000?q[1]-65536:q[1];q[4]=Math.round(signed*q[5]/2048)&65535;q[3]=Math.round(q[4]*q[2]*.00125/25)&65535;this.samples++;q[6]|=8;this.until=(q[0]&4)?c+this.duration():null;}
 nextEvent(){return this.until;}
 read(){return this.index++%2?this.latched&255:this.latched>>8;}
 state(){return{samples:this.samples,inputValid:this.valid,busVoltage:this.words[2]*.00125,shuntVoltage:(this.words[1]&32768?this.words[1]-65536:this.words[1])*.0000025};}
}
export class TCS34725 extends Registers {
 constructor(){super(32);this.reset();this.environment={red:1500,green:2500,blue:1000,clear:5000};}
 reset(){this.r.fill(0);this.r[0x12]=0x44;this.r[1]=255;this.until=null;this.samples=0;}
 setEnvironment(p){this.environment=Object.fromEntries(['red','green','blue','clear'].map(k=>[k,p[k]??({red:1500,green:2500,blue:1000,clear:5000}[k])]));}
 write(v,c){if(this.first){this.pointer=v&31;this.auto=!!(v&32);this.first=false;}else{this.r[this.pointer]=v;if(this.pointer===0)this.until=(v&3)===3?c+Math.ceil((256-this.r[1])*2.4*16000):null;if(this.auto)this.pointer=(this.pointer+1)&31;this.revision++;}return true;}
 read(c){this.tick(c);const v=(this.latched||this.r)[this.pointer];if(this.auto)this.pointer=(this.pointer+1)&31;return v;}
 tick(c){if(this.until===null||c<this.until)return;for(const[k,i]of [['clear',0],['red',1],['green',2],['blue',3]]){const n=clamp(Math.round(this.environment[k]),0,65535);this.r[0x14+i*2]=n&255;this.r[0x15+i*2]=n>>8;}this.r[0x13]|=1;this.samples++;this.until=c+Math.ceil((256-this.r[1])*2.4*16000);}
 nextEvent(){return this.until;}
 state(){return{...this.environment,samples:this.samples,revision:this.revision};}
}
export class MAX30102 extends Registers {
 constructor(){super();this.reset();this.environment={red:50000,infrared:60000};}
 reset(){this.r.fill(0);this.r[0xff]=0x15;this.r[0xfe]=3;this.fifo=[];this.until=null;this.samples=0;}
 setEnvironment(p){this.environment={red:p.red??50000,infrared:p.infrared??60000};}
 writeRegister(a,v,c){if(a===9&&v&64){this.reset();return;}this.r[a]=v;if(a===9||a===10)this.until=this.r[9]&128||!(this.r[9]&7)?null:c+HZ/([50,100,200,400,800,1000,1600,3200][this.r[10]>>2&7]);}
 tick(c){if(this.until===null||c<this.until)return;const mode=this.r[9]&7,values=mode===2?[this.environment.red]:[this.environment.red,this.environment.infrared];if(this.fifo.length+values.length*3<=192){for(const v of values){const n=clamp(Math.round(v),0,262143);this.fifo.push(n>>16,n>>8&255,n&255);}this.r[4]=(this.r[4]+1)&31;this.r[0]|=64;this.samples++;}else{this.r[5]=Math.min(31,this.r[5]+1);this.r[0]|=128;}this.until=c+HZ/([50,100,200,400,800,1000,1600,3200][this.r[10]>>2&7]);}
 read(c){if(this.pointer===7){const v=this.fifo.shift()??0;if(this.fifo.length%((this.r[9]&7)===2?3:6)===0)this.r[6]=(this.r[6]+1)&31;return v;}const p=this.pointer,v=super.read(c);if(p<2)this.r[p]=0;return v;}
 nextEvent(){return this.until;}
 drivers(){return this.r[0]&this.r[2]?[{pin:'INT',voltage:0,ohms:50}]:[];}
 state(){return{...this.environment,samples:this.samples,fifoBytes:this.fifo.length,mode:this.r[9]&7};}
}
