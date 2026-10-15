// ROHM BH1750FVI, nominal oscillator/conversion timing at 16 MHz CPU.
const HZ=16000000,MODES=new Set([0x10,0x11,0x13,0x20,0x21,0x23]);
export class BH1750{
 constructor(){this.lux=100;this.reset();}
 reset(){this.on=false;this.mode=0;this.mtreg=69;this.raw=0;this.pending=null;this.pointer=0;this.revision=0;this.supported=true;}
 setEnvironment(p){this.lux=p?.lux??100;}
 start(cycle){const duration=((this.mode&3)===3?16:120)*this.mtreg/69;this.pending={until:cycle+Math.ceil(duration*HZ/1000),lux:this.lux};this.duration=Math.ceil(duration*HZ/1000);}
 tick(cycle){if(this.pending&&cycle>=this.pending.until){this.raw=Math.max(0,Math.min(65535,Math.round(this.pending.lux*1.2*this.mtreg/69*((this.mode&3)===1?2:1))));this.revision++;if(this.mode&32){this.on=false;this.pending=null;}else{const next=this.pending.until+(Math.floor((cycle-this.pending.until)/this.duration)+1)*this.duration;this.pending={until:next,lux:this.lux};}}}
 nextEvent(){return this.pending?.until??null;}
 begin(write,cycle){this.tick(cycle);this.pointer=0;this.latched=this.raw;}
 write(b,cycle){this.tick(cycle);this.supported=true;if(b===0){this.on=false;this.pending=null;}else if(b===1)this.on=true;else if(b===7){if(this.on)this.raw=0;}else if((b&0xe0)===0x40||(b&0xe0)===0x60){const n=(b&0xe0)===0x40?((b&7)<<5)|(this.mtreg&31):(this.mtreg&0xe0)|(b&31);this.mtreg=n;}else if(MODES.has(b)){if(this.mtreg<31||this.mtreg>254){this.supported=false;return false;}this.on=true;this.mode=b;this.start(cycle);}else{this.supported=false;return false;}return true;}
 read(cycle){this.tick(cycle);return this.pointer++===0?this.latched>>8:this.pointer===2?this.latched&255:255;}
 state(cycle){this.tick(cycle);return{lux:this.raw/(1.2*this.mtreg/69*((this.mode&3)===1?2:1)),environmentLux:this.lux,raw:this.raw,mode:this.mode,mtreg:this.mtreg,measuring:!!this.pending,on:this.on,revision:this.revision,supported:this.supported};}
}
