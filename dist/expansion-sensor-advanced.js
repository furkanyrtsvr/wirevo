import {ADS1115 as BaseADS,ADXL345 as BaseADXL,DS3231 as BaseRTC,EXPANSION_I2C} from './expansion-i2c.js';
const HZ=16000000,signed=x=>x&32768?x-65536:x;
export class ADS1115 extends BaseADS {
 reset(){super.reset();this.asserted=false;this.matches=0;this.readyPulse=null;}
 setSupply(v){this.supply=v;}
 setAnalog(v){super.setAnalog(v);this.inputs=this.inputs.map(n=>Number.isFinite(n)&&n>=0&&n<=(this.supply??3.3)?n:null);}
 tick(c){this.cycle=c;if(this.readyPulse!==null&&c>=this.readyPulse){this.readyPulse=null;this.asserted=false;}const before=this.samples;super.tick(c);if(this.samples===before)return;const q=this.words,cfg=q[1],code=signed(q[0]),low=signed(q[2]),high=signed(q[3]);if((cfg&3)===3){this.asserted=false;return;}if((q[3]&32768)&&!(q[2]&32768)){this.asserted=true;this.readyPulse=c+Math.ceil(HZ*.000008);return;}const outside=cfg&16?code<low||code>high:code>high;this.matches=outside?this.matches+1:0;if(this.matches>=[1,2,4][cfg&3])this.asserted=true;else if(!(cfg&4)&&(cfg&16?!outside:code<low))this.asserted=false;}
 nextEvent(){const events=[super.nextEvent(),this.readyPulse].filter(Number.isFinite);return events.length?Math.min(...events):null;}
 read(){const v=super.read();if(this.pointer===0&&(this.words[1]&4)&&this.readIndex%2===0){this.asserted=false;this.matches=0;}return v;}
 drivers(v){if((this.words[1]&3)===3)return [];if(this.readyPulse!==null&&this.readyPulse<=this.cycle){this.readyPulse=null;this.asserted=false;}const active=!!(this.words[1]&8);return(this.asserted?active:!active)?[]:[{pin:'ALERT',voltage:0,ohms:50}];}
 begin(w,c){this.cycle=c;super.begin(w,c);}
 state(){return{...super.state(),alert:this.asserted};}
}
export class ADXL345 extends BaseADXL {
 reset(){super.reset();this.fifo=[];this.triggered=false;this.pendingData=false;this.freefallSince=null;this.inactiveSince=null;this.tapSince=null;this.lastTap=null;this.previousAxes=[0,0,1];}
 writeRegister(a,v,c){const previous=this.r[a];this.r[a]=v;if(a===0x38&&(v>>6)!==(previous>>6)){this.fifo=[];this.triggered=false;}if(a===0x2d&&!(v&8))this.last=c;}
 status(){this.r[0x39]=(this.triggered?128:0)|this.fifo.length;this.r[0x30]=(this.r[0x30]&0x7d)|(this.fifo.length||this.pendingData?128:0)|(this.fifo.length>=(this.r[0x38]&31||1)?2:0);}
 tick(c){const period=HZ/(6.25*2**((this.r[0x2c]&15)-6));let count=0;if(!(this.r[0x2d]&8)){this.last=c;return;}while(c-this.last>=period&&count++<4096)this.sample(Math.ceil(this.last+period));}
 sample(c){const before=this.samples;super.tick(c);if(before===this.samples)return;const axes=['ax','ay','az'].map(k=>this.environment[k]),activity=axes.some((n,i)=>(this.r[0x27]&(64>>i))&&Math.abs(this.r[0x27]&128?n-this.previousAxes[i]:n)>this.r[0x24]*.0625),inactive=axes.every((n,i)=>!(this.r[0x27]&(4>>i))||Math.abs(this.r[0x27]&8?n-this.previousAxes[i]:n)<this.r[0x25]*.0625);if(activity)this.r[0x30]|=16;this.inactiveSince=inactive?(this.inactiveSince??c):null;if(this.inactiveSince!==null&&c-this.inactiveSince>=this.r[0x26]*HZ&&this.r[0x27]&7)this.r[0x30]|=8;const ff=this.r[0x28]>0&&axes.every(n=>Math.abs(n)<this.r[0x28]*.0625);this.freefallSince=ff?(this.freefallSince??c):null;if(this.freefallSince!==null&&c-this.freefallSince>=this.r[0x29]*.005*HZ)this.r[0x30]|=4;const tapping=axes.some((n,i)=>(this.r[0x2a]&(4>>i))&&Math.abs(n)>this.r[0x1d]*.0625);if(tapping&&this.tapSince===null)this.tapSince=c;if(!tapping&&this.tapSince!==null){const span=c-this.tapSince;if(span<=this.r[0x21]*.000625*HZ){this.r[0x30]|=64;const gap=c-(this.lastTap??-Infinity);if(gap>=this.r[0x22]*.00125*HZ&&gap<=(this.r[0x22]+this.r[0x23])*.00125*HZ)this.r[0x30]|=32;this.lastTap=c;}this.tapSince=null;}this.previousAxes=axes;const sample=Array.from(this.r.slice(0x32,0x38)),mode=this.r[0x38]>>6;if(mode===3&&!this.triggered){const source=this.r[0x30]&this.r[0x2e]&0x7c,mask=this.r[0x2f],trigger=this.r[0x38]&32?source&mask:source&~mask;if(trigger){this.triggered=true;const n=this.r[0x38]&31;this.fifo=n?this.fifo.slice(-n):[];}}if(mode){if(this.fifo.length===32){this.r[0x30]|=1;if(mode===2||mode===3&&!this.triggered)this.fifo.shift();}if(this.fifo.length<32)this.fifo.push(sample);}this.pendingData=true;this.status();}
 begin(w,c){super.begin(w,c);if(!w&&this.pointer>=0x32&&this.pointer<=0x37){this.dataStart=this.pointer;this.readData=true;if(this.fifo.length)this.latched.set(this.fifo[0],0x32);}}
 read(c){const p=this.pointer,v=this.latched?.[p]??this.r[p];this.pointer=(p+1)&255;if(p===0x30){this.r[0x30]&=0x83;this.status();}if(p===0x37&&this.readData){if(this.fifo.length)this.fifo.shift();this.pendingData=false;this.r[0x30]&=~129;this.readData=false;this.status();}return v;}
 drivers(v){const flags=this.r[0x2e]&this.r[0x30],map=this.r[0x2f],invert=!!(this.r[0x31]&32);return[1,2].map((n,i)=>({pin:'INT'+n,voltage:(!!(flags&(i?map:~map))!==invert)?v:0,ohms:50}));}
 state(){return{...super.state(),fifoEntries:this.fifo.length,interrupt:this.r[0x30]};}
}
const hour=x=>x&64?((x&31)%0x20===0x12?0:((x&15)+10*((x>>4)&1)))+(x&32?12:0):(x&15)+10*((x>>4)&3);
export class DS3231 extends BaseRTC {
 reset(){super.reset();this.cycle=0;this.temperatureUntil=null;}
 match(start,count){for(let i=0;i<count;i++){const a=this.r[start+i];if(a&128)continue;const actual=i===count-1?this.r[a&64?3:4]:this.r[start===7?i:i+1];if(i===(start===7?2:1)){if(hour(a)!==hour(actual))return false;}else if((a&(i===count-1?63:127))!==(actual&(i===count-1?63:127)))return false;}return true;}
 tick(c){this.cycle=c;let remaining=Math.min(86400,Math.max(0,Math.floor((c-this.last)/HZ)));while(remaining-->0&&!(this.r[14]&128)){super.tick(this.last+HZ);if(this.match(7,4))this.r[15]|=1;if(this.r[0]===0&&this.match(11,3))this.r[15]|=2;}super.tick(c);if(this.temperatureUntil!==null&&c>=this.temperatureUntil){this.r[14]&=~32;this.r[15]&=~4;this.temperatureUntil=null;}}
 writeRegister(a,v,c){if(a===15){this.r[15]=(this.r[15]&v&0x83)|(this.r[15]&4)|(v&8);return;}super.writeRegister(a,v);if(a===0)this.last=c;if(a===14&&v&32){this.r[15]|=4;this.temperatureUntil=c+HZ*.2;}}
 nextEvent(c){return Math.min(super.nextEvent(c)??Infinity,this.temperatureUntil??Infinity,(this.r[14]&4)?Infinity:Math.floor(c/(HZ/(2*[1,1024,4096,8192][(this.r[14]>>3)&3]))+1)*HZ/(2*[1,1024,4096,8192][(this.r[14]>>3)&3]));}
 drivers(v){const control=this.r[14],alarm=!!(this.r[15]&control&3),square=!!(Math.floor(this.cycle/(HZ/(2*[1,1024,4096,8192][(control>>3)&3])))&1);return(control&4?alarm:!square)?[{pin:'SQW',voltage:0,ohms:50}]:[];}
 state(c){return{...super.state(c),alarm1:!!(this.r[15]&1),alarm2:!!(this.r[15]&2)};}
}
export const ADVANCED_SENSORS={
 ads1115:{...EXPANSION_I2C.ads1115,create:()=>new ADS1115(),configuration:(v,s,nets,id)=>({valid:Number.isFinite(v('ADDR')),address:72+(nets.same(id+':ADDR',id+':SDA')?2:nets.same(id+':ADDR',id+':SCL')?3:v('ADDR')>=.7*s?1:0)})},
 adxl345:{...EXPANSION_I2C.adxl345,create:()=>new ADXL345()},ds3231:{...EXPANSION_I2C.ds3231,create:()=>new DS3231()}
};
