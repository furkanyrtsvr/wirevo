import {INA226 as BaseINA,TCS34725 as BaseTCS,MAX30102 as BaseMAX} from './expansion-sensors.js';
const HZ=16000000,signed=n=>n&32768?n-65536:n;
export class INA226 extends BaseINA {
 reset(){super.reset();this.alert=false;}
 tick(c){const before=this.samples;super.tick(c);if(this.samples===before)return;const q=this.words,mask=q[6],conditions=[[32768,signed(q[1])>signed(q[7])],[16384,signed(q[1])<signed(q[7])],[8192,q[2]>q[7]],[4096,q[2]<q[7]],[2048,q[3]>q[7]]],chosen=conditions.find(([bit])=>mask&bit),active=!!chosen?.[1];if(active)q[6]|=16;else if(!(mask&1))q[6]&=~16;this.alert=!!(q[6]&16)||!!((mask&1024)&&(q[6]&8));}
 read(){const v=super.read();if(this.pointer===6&&this.index%2===0){this.words[6]&=~24;this.alert=false;}return v;}
 drivers(v){return(this.alert?!!(this.words[6]&2):!(this.words[6]&2))?[]:[{pin:'ALERT',voltage:0,ohms:50}];}
 state(){return{...super.state(),alert:this.alert,mask:this.words[6]};}
}
export class TCS34725 extends BaseTCS {
 reset(){super.reset();this.outside=0;}
 write(v,c){if(this.first&&(v&0xe0)===0xe0){if((v&31)===6)this.r[0x13]&=~16;this.first=false;return true;}return super.write(v,c);}
 tick(c){const before=this.samples;super.tick(c);if(before===this.samples)return;const n=this.r[0x14]|this.r[0x15]<<8,lo=this.r[4]|this.r[5]<<8,hi=this.r[6]|this.r[7]<<8,counts=[1,1,2,3,5,10,15,20,25,30,35,40,45,50,55,60],p=this.r[12]&15;this.outside=n<lo||n>hi?this.outside+1:0;if((this.r[0]&16)&&(p===0||this.outside>=counts[p]))this.r[0x13]|=16;}
 drivers(){return this.r[0x13]&16?[{pin:'INT',voltage:0,ohms:50}]:[];}
 state(){return{...super.state(),interrupt:!!(this.r[0x13]&16)};}
}
export class MAX30102 extends BaseMAX {
 reset(){super.reset();this.r[0]=1;this.collected=0;this.sumRed=0;this.sumIR=0;this.partial=0;this.temperatureAt=null;}
 setEnvironment(p){super.setEnvironment(p);this.temperature=p.temperature??25;}
 width(){return this.channels().length*3;}
 channels(){const mode=this.r[9]&7;if(mode===2)return[1];if(mode===3)return[1,2];if(mode===7)return[this.r[0x11]&7,this.r[0x11]>>4&7,this.r[0x12]&7,this.r[0x12]>>4&7].filter(n=>[1,2,5,6].includes(n));return[];}
 writeRegister(a,v,c){if(a===0x21&&v&1){this.r[a]=v;this.temperatureAt=c+HZ*.029;return;}if(a===4||a===6){this.r[a]=v&31;if(this.r[4]===this.r[6]){this.fifo=[];this.partial=0;}return;}if(a===5){this.r[a]=v&31;return;}super.writeRegister(a,v,c);if(a===9&&!this.channels().length)this.until=null;}
 tick(c){if(this.temperatureAt!==null&&c>=this.temperatureAt){const n=Math.floor(this.temperature??25);this.r[0x1f]=n&255;this.r[0x20]=Math.round(((this.temperature??25)-n)*16)&15;this.r[0x21]=0;this.r[1]|=2;this.temperatureAt=null;}if(this.until===null||c<this.until)return;const interval=HZ/([50,100,200,400,800,1000,1600,3200][this.r[10]>>2&7]);this.until=c+interval;const channels=this.channels(),bytes=channels.length*3;if(!bytes)return;this.collected++;this.sumRed+=this.environment.red;this.sumIR+=this.environment.infrared;const avg=[1,2,4,8,16,32,32,32][this.r[8]>>5&7];if(this.collected%avg)return;const averaged={red:this.sumRed/avg,infrared:this.sumIR/avg};this.sumRed=0;this.sumIR=0;const capacity=32*bytes;if(this.fifo.length+bytes>capacity){this.r[5]=Math.min(31,this.r[5]+1);if(this.r[8]&16){this.fifo.splice(0,bytes);this.r[6]=(this.r[6]+1)&31;}else{this.r[0]|=128;return;}}const max=2**[15,16,17,18][this.r[10]&3]-1;for(const channel of channels){const raw=channel===1||channel===5?averaged.red:averaged.infrared,n=Math.max(0,Math.min(max,Math.round(raw)));this.fifo.push(n>>16,n>>8&255,n&255);}this.r[4]=(this.r[4]+1)&31;this.r[0]|=64;if(this.fifo.length/bytes>=32-(this.r[8]&15))this.r[0]|=128;this.samples++;}
 read(c){if(this.pointer===7){if(!this.fifo.length)return 0;const v=this.fifo.shift();if(++this.partial>=this.width()){this.partial=0;this.r[6]=(this.r[6]+1)&31;}return v;}return super.read(c);}
 nextEvent(){const a=[this.until,this.temperatureAt].filter(Number.isFinite);return a.length?Math.min(...a):null;}
 drivers(){return(this.r[0]&this.r[2])||(this.r[1]&this.r[3])?[{pin:'INT',voltage:0,ohms:50}]:[];}
 state(){return{...super.state(),temperature:this.temperature,channels:this.channels(),overflow:this.r[5],irq:!!((this.r[0]&this.r[2])||(this.r[1]&this.r[3]))};}
}
