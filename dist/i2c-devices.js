// Behavioral controllers, 16 MHz simulation cycles. No host wall clock.
const HZ=16000000,bcd=n=>(Math.floor(n/10)<<4)|(n%10),decimal=n=>(n>>4)*10+(n&15);
export class EEPROM24LC256 {
  constructor(){this.memory=new Uint8Array(32768).fill(255);this.pointer=0;this.revision=0;this.reset();}
  reset(){this.pending=new Map();this.committing=null;this.busyUntil=0;this.position=0;}
  tick(cycle){if(this.committing&&cycle>=this.busyUntil){for(const[a,v]of this.committing)this.memory[a]=v;this.committing=null;this.revision++;}}
  ready(cycle){this.tick(cycle);return cycle>=this.busyUntil;}
  begin(write){this.position=0;this.pending=new Map();this.writing=write;}
  write(byte){if(this.position===0)this.high=byte&127;else if(this.position===1){this.pointer=((this.high<<8)|byte)&32767;this.page=this.pointer&~63;this.offset=this.pointer&63;}else{this.pending.set(this.page|this.offset,byte);this.offset=(this.offset+1)&63;this.pointer=this.page|this.offset;}this.position++;return true;}
  read(){const v=this.memory[this.pointer];this.pointer=(this.pointer+1)&32767;return v;}
  stop(cycle,writeProtected=false){if(this.writing&&this.pending.size&&!writeProtected){this.committing=new Map(this.pending);this.busyUntil=cycle+80000;}this.pending.clear();}
  state(cycle){this.tick(cycle);return{pointer:this.pointer,busy:cycle<this.busyUntil,revision:this.revision,preview:Array.from(this.memory.slice(0,16))};}
}
export class DS1307 {
  constructor(){this.reset();}
  reset(){this.registers=new Uint8Array(64);this.registers.set([0x80,0,0,1,1,1,0]);this.pointer=0;this.lastCycle=0;this.revision=0;}
  tick(cycle){
    if(this.registers[0]&128){this.lastCycle=cycle;return;}
    const seconds=Math.floor((cycle-this.lastCycle)/HZ);if(seconds<=0)return;this.lastCycle+=seconds*HZ;
    const r=this.registers,mode12=!!(r[2]&64),hour=mode12?(decimal(r[2]&31)%12)+(r[2]&32?12:0):decimal(r[2]&63);
    const sec=decimal(r[0]&127),minute=decimal(r[1]&127),day=decimal(r[4]&63),month=decimal(r[5]&31),year=decimal(r[6]);
    if(sec>59||minute>59||hour>23||day<1||day>31||month<1||month>12||year>99)return;
    const date=new Date(Date.UTC(2000+year,month-1,day,hour,minute,sec)),oldDay=Math.floor(date.getTime()/86400000);date.setUTCSeconds(date.getUTCSeconds()+seconds);
    const newHour=date.getUTCHours();r[0]=bcd(date.getUTCSeconds());r[1]=bcd(date.getUTCMinutes());r[2]=mode12?64|(newHour>=12?32:0)|bcd(newHour%12||12):bcd(newHour);
    r[3]=((Math.max(1,r[3]&7)-1+Math.floor(date.getTime()/86400000)-oldDay)%7)+1;r[4]=bcd(date.getUTCDate());r[5]=bcd(date.getUTCMonth()+1);r[6]=bcd((date.getUTCFullYear()-2000)%100);this.revision++;
  }
  begin(write,cycle){this.tick(cycle);this.first=write;this.latched=this.registers.slice();}
  write(byte,cycle){if(this.first){this.pointer=byte&63;this.first=false;}else{this.registers[this.pointer]=byte;if(this.pointer===0)this.lastCycle=cycle;this.pointer=(this.pointer+1)&63;this.revision++;}return true;}
  read(){const value=this.latched[this.pointer];this.pointer=(this.pointer+1)&63;return value;}
  state(cycle){this.tick(cycle);const r=this.registers,mode12=!!(r[2]&64);return{halted:!!(r[0]&128),revision:this.revision,registers:Array.from(r.slice(0,8)),time:[decimal(r[2]&(mode12?31:63)),decimal(r[1]&127),decimal(r[0]&127)].map(n=>String(n).padStart(2,'0')).join(':')+(mode12?(r[2]&32?' PM':' AM'):''),date:[2000+decimal(r[6]),decimal(r[5]&31),decimal(r[4]&63)].join('-')};}
}
