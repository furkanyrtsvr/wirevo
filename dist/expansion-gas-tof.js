import {Registers} from './expansion-i2c.js';
const HZ=16000000,clip=(n,a,b)=>Math.max(a,Math.min(b,n));
// Original inverse model using the public Bosch compensation register format.
// Calibration constants below are synthetic, not extracted device ROM data.
export class BME680 extends Registers {
 constructor(){super();this.reset();this.environment={temperature:25,humidity:50,pressure:1013.25,gasResistance:100000};}
 reset(){this.r.fill(0);this.r[0xd0]=0x61;this.r[2]=16;const word=(a,v)=>{this.r[a]=v&255;this.r[a+1]=v>>8&255;};word(0xe9,25000);word(0x8a,25000);word(0x8e,36000);word(0x90,-10000);word(0x94,2800);this.r[0xe1]=22;this.r[0xe2]=0xab;this.r[0xe3]=4;word(0xeb,-2500);this.r[0xed]=0;this.r[0xee]=4;this.until=null;this.samples=0;}
 setEnvironment(p){this.environment={temperature:p.temperature??25,humidity:p.humidity??50,pressure:p.pressure??1013.25,gasResistance:p.gasResistance??100000};}
 writeRegister(a,v,c){if(a===0xe0&&v===0xb6){this.reset();return;}if([0x70,0x71,0x72,0x74,0x75].includes(a)||a>=0x5a&&a<=0x6d)this.r[a]=v;if(a===0x74&&(v&3)===1){const wait=this.r[0x64]&63,mult=4**(this.r[0x64]>>6);this.until=c+Math.ceil((20+(this.r[0x71]&16?wait*mult:0))*16000);this.r[0x1d]=0x60;}}
 tick(c){if(this.until===null||c<this.until)return;const e=this.environment,rawT=Math.round((e.temperature*5120/25000+25000/1024)*16384),fine=(rawT/16384-25000/1024)*25000,a=(1+(-10000*(fine/2-64000)/524288)/32768)*36000,rawP=Math.round(1048576-(e.pressure*100*a/6250+2800*16)),rawH=Math.round(e.humidity*262144/362+75*16),raw=(at,v)=>{v=clip(v,0,1048575);this.r[at]=v>>12;this.r[at+1]=v>>4&255;this.r[at+2]=(v&15)<<4;};raw(0x1f,rawP);raw(0x22,rawT);this.r[0x25]=rawH>>8;this.r[0x26]=rawH&255;const k1=[0,0,0,0,0,-1,0,-.8,0,0,-.2,-.5,0,-1,0,0],k2=[0,0,0,0,.1,.7,0,-.8,-.1,0,0,0,0,0,0,0];let range=0,adc=0,best=Infinity;for(let r=0;r<16;r++){const n=512+1340*(1+k1[r]/100)*(1/(e.gasResistance*(1+k2[r]/100)*.000000125*2**r)-1),error=Math.abs(n-clip(n,0,1023));if(error<best){range=r;adc=Math.round(clip(n,0,1023));best=error;}}this.r[0x2a]=adc>>2;this.r[0x2b]=(adc&3)<<6|range|(this.r[0x71]&16?0x30:0);this.r[0x1d]=0x80;this.r[0x1e]=++this.samples&255;this.r[0x74]&=~3;this.until=null;this.revision++;}
 nextEvent(){return this.until;}
 state(){return{...this.environment,samples:this.samples,busy:this.until!==null,revision:this.revision};}
}
export class VL53L0X extends Registers {
 constructor(){super();this.reset();this.environment={distance:100};}
 reset(){this.r.fill(0);this.r[0xc0]=0xee;this.r[0xc1]=0xaa;this.r[0xc2]=0x10;this.r[0x83]=1;this.r[0x91]=0x3c;this.r.fill(255,0x92,0x98);this.r[0x8a]=0x29;this.until=null;this.samples=0;this.continuous=false;}
 setEnvironment(p){this.environment={distance:p.distance??100};}
 writeRegister(a,v,c){this.r[a]=v;if(a===0&&(v&7)){this.continuous=!!(v&6);this.until=c+320000;this.r[0x13]=0;}if(a===0x0b&&v&1)this.r[0x13]=0;}
 tick(c){if(this.until===null||c<this.until)return;const n=clip(Math.round(this.environment.distance),0,8190);this.r[0x1e]=n>>8;this.r[0x1f]=n&255;this.r[0x14]=0x58;this.r[0x13]=4;this.r[0]&=~1;this.samples++;this.until=this.continuous?c+320000:null;}
 nextEvent(){return this.until;}
 drivers(){return this.r[0x13]&7?[{pin:'GPIO1',voltage:0,ohms:50}]:[];}
 state(){return{distance:this.environment.distance,samples:this.samples,busy:this.until!==null};}
}
