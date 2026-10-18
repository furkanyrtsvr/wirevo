import {STMRTC as Calendar} from './stm32-rtc.js';

// Timestamp/tamper, smooth calibration, shift and daylight saving registers.
export class STMRTC extends Calendar {
 constructor(r){super(r);this.eventRegs=new Map();this.calibrationPulse=0;this.tamperLevel=null;}
 backupReset(){super.backupReset();this.eventRegs=new Map();this.calibrationPulse=0;this.tamperLevel=null;}
 systemReset(){super.systemReset();this.unlocked=false;this.key=0;}
 sourceHz(){if(this.r.system?.mode&&this.r.system.mode!=='run'&&((this.bdcr>>>8)&3)===3)return 0;return super.sourceHz();}
 decrementDate(){const dr=this.regs.get(4)||0,decode=v=>(v&15)+(v>>>4)*10,encode=v=>(Math.floor(v/10)<<4)|(v%10);let day=decode(dr&63),month=decode((dr>>>8)&31),year=decode((dr>>>16)&255),week=(dr>>>13)&7;if(--day<1){if(--month<1){month=12;year=(year+99)%100;}day=[31,year%4===0?29:28,31,30,31,30,31,31,30,31,30,31][month-1];}week=week===1?7:week-1;this.regs.set(4,encode(day)|(encode(month)<<8)|(week<<13)|(encode(year)<<16));}
 write(a,v,n=4){if(!this.f4&&[0x40006c2c,0x40006c30,0x40006c34].includes(a&~3)){if(!this.busClock()||!this.writable())return true;const off=(a&~3)-0x40006c00;if(off===52){let flags=this.eventRegs.get(52)||0;if(v&1)flags&=~256;if(v&2)flags&=~512;this.eventRegs.set(52,(flags&~4)|(v&4));}else this.eventRegs.set(off,v&(off===44?1023:3));return true;}return super.write(a,v,n);}
 outputs(states){if(!states.PC13)return states;const cr=this.f4?this.regs.get(8)||0:this.eventRegs.get(44)||0;if(this.f4?!!(this.eventRegs.get(76)&1):!!(this.eventRegs.get(48)&1)){states.PC13={high:false,outputEnabled:false,voltage:0,mode:'RTC_TAMPER'};return states;}let high,open=false;if(this.f4){if(cr&(1<<23))high=cr&(1<<19)?!!(this.calendarSnapshot().ss&128):!!(this.pulses&32);else{const select=(cr>>>21)&3;if(!select)return states;high=!!((this.regs.get(12)||0)&(select===1?256:select===2?512:1024));if(cr&(1<<20))high=!high;open=!(this.eventRegs.get(76)&(1<<18));}}else{if(cr&128)high=!!(this.pulses&32);else if(cr&256)high=!!((this.regs.get(4)||0)&(cr&512?1:2));else return states;}states.PC13={high,outputEnabled:!open||!high,voltage:high?3.3:0,mode:'RTC_OUT'};return states;}
 writeCalendar(off,v){
  const cr=this.regs.get(8)||0,flags=this.regs.get(12)||0;
  if(off===8&&this.unlocked){
   const base=v&0x7767;super.writeCalendar(off,base);
   let next=v&0x00ffffff;
   if(v&(1<<16))this.adjustHour(1);if(v&(1<<17))this.adjustHour(-1);
   next&=~((1<<16)|(1<<17));this.regs.set(8,next);return;
  }
  if(!this.unlocked&&[44,48,64,76].includes(off))return;
  if(off===44){if(flags&128)this.eventRegs.set(44,v&0x1f);return;}
  if(off===48){if(flags&8)return;const sub=v&32767,pr=this.regs.get(16),a=((pr>>>16)&127)+1,s=(pr&32767)+1;if(sub>=s)return;let sync=this.sync-sub*a;if(v&0x80000000)this.increment();if(sync<0){sync+=a*s;this.decrement();}this.sync=sync;return;}
  if(off===64){this.eventRegs.set(off,v&0xe1ff);return;}
  if(off===76){this.eventRegs.set(off,v&0x0007ffff);return;}
  if([52,56,60].includes(off))return;
  super.writeCalendar(off,v);
 }
 adjustHour(delta){let tr=this.regs.get(0)||0,h=((tr>>>20)&3)*10+((tr>>>16)&15);if(this.regs.get(8)&64){h=h%12+(tr&0x400000?12:0);h=(h+delta+24)%24;tr=(tr&~0x7f0000)|((h%12||12)%10<<16)|(Math.floor((h%12||12)/10)<<20)|(h>=12?0x400000:0);}else{h=(h+delta+24)%24;tr=(tr&~0x3f0000)|((h%10)<<16)|(Math.floor(h/10)<<20);}this.regs.set(0,tr);}
 decrement(){const tr=this.regs.get(0)||0;let sec=(tr&15)+((tr>>>4)&7)*10,min=((tr>>>8)&15)+((tr>>>12)&7)*10;if(sec>0)sec--;else{sec=59;if(min>0)min--;else{min=59;const h=((tr>>>16)&15)+((tr>>>20)&3)*10;if(this.regs.get(8)&64?h===12&&!(tr&0x400000):h===0)this.decrementDate();this.adjustHour(-1);}}const current=this.regs.get(0)||0;this.regs.set(0,(current&~0x7f7f)|((sec%10)|(Math.floor(sec/10)<<4))|(((min%10)|(Math.floor(min/10)<<4))<<8));}
 timestamp(rising=true){if(!this.f4)return;const cr=this.regs.get(8)||0;if(!(cr&2048)||rising===!!(cr&8))return;const snapshot=this.calendarSnapshot(),flags=this.regs.get(12)||0;if(flags&2048)this.regs.set(12,flags|4096);else{this.eventRegs.set(52,snapshot.tr);this.eventRegs.set(56,snapshot.dr&0xffff);this.eventRegs.set(60,snapshot.ss);this.regs.set(12,flags|2048);}if(cr&32768)this.r.exti?.internalEdge(21,true);}
 tamper(rising=true){if(!this.f4){const cr=this.eventRegs?.get(48)||0;if(cr&1&&rising!==!!(cr&2)){this.backup.fill(0);this.eventRegs.set(52,(this.eventRegs.get(52)||0)|768);}return;}const ta=this.eventRegs?.get(76)||0;if(!this.f4||!(ta&1)||rising===!!(ta&2))return;this.backup.fill(0);this.regs.set(12,(this.regs.get(12)||0)|8192);if(ta&4)this.r.exti?.internalEdge(21,true);if(ta&128)this.timestamp(rising);}
 observe(){const pin=this.r.inputs?.PC13,ta=this.eventRegs?.get(76)||0,filter=this.f4?(ta>>>11)&3:0;if(filter&&ta&1){const frequency=32768>>((ta>>>8)&7),period=this.r.board.hz*frequency/(this.sourceHz()||32768);this.tamperSample??={at:this.r.count,level:pin,count:0,fired:false};const sample=this.tamperSample;if(this.r.count-sample.at>=period){sample.at=this.r.count;if(sample.level!==pin){sample.level=pin;sample.count=0;sample.fired=false;}if(pin===!!(ta&2)){if(++sample.count>=(1<<filter)&&!sample.fired){this.tamper(!(ta&2));sample.fired=true;}}else{sample.count=0;sample.fired=false;}}}if(pin!==undefined&&this.tamperLevel!==null&&pin!==this.tamperLevel){this.timestamp(pin);if(!filter)this.tamper(pin);}this.tamperLevel=pin??null;}
 pulse(){if(!this.f4){this.calibrationPulse=(this.calibrationPulse||0)+1;const cal=this.eventRegs?.get(44)&127,k=(this.calibrationPulse-1)%1048576+1;if(cal&&Math.floor(k*cal/1048576)!==Math.floor((k-1)*cal/1048576))return;super.pulse();return;}this.calibrationPulse=(this.calibrationPulse||0)+1;const cal=this.eventRegs?.get(64)||0,window=cal&16384?1<<18:cal&8192?1<<19:1<<20,remove=cal&(window===(1<<18)?127:window===(1<<19)?255:511),add=cal&32768?window/2048:0;const k=(this.calibrationPulse-1)%window+1;if(remove&&Math.floor(k*remove/window)!==Math.floor((k-1)*remove/window))return;super.pulse();if(add&&Math.floor(k*add/window)!==Math.floor((k-1)*add/window))super.pulse();}
 tick(){super.tick();this.observe();}
 irqExtra(){if(!this.f4)return super.irqExtra()|((this.eventRegs?.get(52)||0)&512&&(this.eventRegs?.get(52)||0)&4?1<<9:0);return super.irqExtra()|((this.r.exti?.regs.get(20)||0)&(this.r.exti?.regs.get(0)||0)&(1<<21)?1<<9:0);}
 read(a,n=4){if(!this.f4&&[0x40006c2c,0x40006c30,0x40006c34].includes(a&~3)){const v=this.eventRegs?.get((a&~3)-0x40006c00)||0;return n===4?v>>>0:(v>>>((a&3)*8))&(n===1?255:65535);}const off=(a&~3)-0x40002800;if(this.f4&&[44,48,52,56,60,64,76].includes(off)){const v=this.eventRegs?.get(off)||0;return n===4?v>>>0:(v>>>((a&3)*8))&(n===1?255:65535);}return super.read(a,n);}
}
