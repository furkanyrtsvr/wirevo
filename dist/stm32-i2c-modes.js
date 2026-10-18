import {STMI2C1 as Master} from './stm32-i2c.js';

// Legacy STM32 I2C slave shift register and electrical arbitration. Master
// and slave units can share the same physical nets, including clock stretch.
export class STMI2C1 extends Master {
 reset(){super.reset();this.slave={active:false,phase:'idle',bits:0,value:0,tdr:null,previous:null,matched:false};this.pec=0;this.statusSeen=false;}
 crc(byte){let c=this.pec^byte;for(let i=0;i<8;i++)c=((c<<1)^((c&128)?7:0))&255;this.pec=c;}
 arbitration(){this.sr1|=512;this.sr2&=~1;this.queue=[];this.done=null;this.next=Infinity;this.scl=this.sda=true;this.refresh();}
 transmit(value,address=false){super.transmit(value,address);for(let i=1;i<16;i+=2){const item=this.queue[i],previous=item.sample;item.sample=()=>{previous?.();if(item.sda&&this.level('sda')===false)this.arbitration();};}const done=this.done;this.done=()=>{done?.();if(!(this.sr1&0xff00))this.crc(value);};}
 receive(){super.receive();const done=this.done;this.done=()=>{done?.();if(this.rx.length)this.crc(this.rx.at(-1));};}
 slaveLoad(){const s=this.slave;if(s.tdr===null){this.sr1|=128;this.scl=false;s.phase='txwait';this.refresh();return;}s.shift=s.tdr;s.tdr=null;s.bits=0;s.phase='tx';this.sr1|=128;this.sda=!!(s.shift&128);this.scl=true;this.crc(s.shift);this.refresh();}
 addressed(value,ten=false){const own=this.regs.get(8)||0,dual=this.regs.get(12)||0;if(ten)return value===(own&255);const address=value>>>1;if(own&32768)return (value&0xf8)===0xf0&&((value>>>1)&3)===((own>>>8)&3);return address===(own>>>1&127)||!!(dual&1)&&address===(dual>>>1&127)||address===0&&!!(this.regs.get(0)&64);}
 slaveObserve(){const s=this.slave;if(!this.enabled()||this.queue.length||this.sr2&1||!((this.regs.get(8)||0)&0x83fe)&&!((this.regs.get(12)||0)&1))return;const scl=this.level('scl'),sda=this.level('sda');if(scl===null||sda===null)return;const before=s.previous;s.previous=[scl,sda];if(!before)return;
  if(before[1]&&!sda&&scl&&before[0]){s.active=true;s.phase='address';s.value=0;s.bits=0;s.matched=false;this.sr2=2;this.sda=true;this.pec=0;return;}
  if(!before[1]&&sda&&scl&&before[0]){if(s.active&&s.matched)this.sr1|=16;s.active=false;s.phase='idle';this.sr2=0;this.scl=this.sda=true;return;}
  if(!s.active)return;
  if(!before[0]&&scl){
   if(['address','address10','data'].includes(s.phase)){s.value=(s.value<<1)|(sda?1:0);if(++s.bits===8){const phase=s.phase,v=s.value;s.bits=0;s.value=0;this.crc(v);if(phase==='address'||phase==='address10'){s.matched=this.addressed(v,phase==='address10');this.direction=phase==='address'?!!(v&1):false;s.tenHeader=phase==='address'&&!!((this.regs.get(8)||0)&32768)&&!this.direction;s.nextPhase=s.tenHeader?'address10':this.direction?'tx':'data';s.addressDone=!s.tenHeader;}else{if(s.matched){if(this.rx.length<2){this.rx.push(v);this.sr1|=64;if(this.rx.length===2)this.sr1|=4;}else this.sr1|=2048;}s.nextPhase='data';s.addressDone=false;}s.ack=s.matched&&!!(this.regs.get(0)&1024);s.phase='ackprepare';}}
   else if(s.phase==='ack')s.ackClock=true;
   else if(s.phase==='tx'&&++s.bits===8)s.phase='txrelease';
   else if(s.phase==='txack'){s.masterACK=!sda;if(sda)this.sr1|=1024;s.phase='txackdone';}
  }
  if(before[0]&&!scl){
   if(s.phase==='ackprepare'){this.sda=!s.ack;s.phase='ack';s.ackClock=false;this.refresh();}
   else if(s.phase==='ack'&&s.ackClock){this.sda=true;s.phase=s.ack?s.nextPhase:'idle';if(s.ack&&s.addressDone){this.sr1|=2;this.sr2=2|(this.direction?4:0);this.scl=false;this.refresh();}else if(s.phase==='tx')this.slaveLoad();else this.refresh();}
   else if(s.phase==='txrelease'){this.sda=true;s.phase='txack';this.refresh();}
   else if(s.phase==='txackdone'){if(s.masterACK)this.slaveLoad();else{s.phase='idle';this.sda=true;this.refresh();}}
   else if(s.phase==='tx'){this.sda=!!(s.shift&(128>>>s.bits));this.refresh();}
  }
 }
 tick(){this.slaveObserve();const waiting=this.queue[0];if(waiting?.wait&&this.level('scl')===false){this.lowSince??=this.r.count;if((this.regs.get(0)&2)&&this.r.count-this.lowSince>this.r.board.hz*.025){this.sr1|=16384;this.queue=[];this.done=null;this.next=Infinity;this.scl=this.sda=true;}}else this.lowSince=null;super.tick();}
 read(a,n=4){const off=(a&~3)-this.base,s=this.slave;if(s.active){if(off===20){this.statusSeen=true;this.seen=this.sr1&3;return this.sr1;}if(off===24){const v=this.sr2|(this.pec<<8);if(this.seen&2){this.sr1&=~2;this.seen=0;if(this.direction)this.slaveLoad();else{this.scl=true;this.refresh();}}return v;}if(off===16){const v=this.rx.shift()??this.dr;this.dr=v;if(!this.rx.length)this.sr1&=~64;this.sr1&=~4;this.scl=true;this.refresh();return v;}}if(off===24){const v=super.read(a,n);return v|(n===4?this.pec<<8:0);}if(off===20)this.statusSeen=true;return super.read(a,n);}
 write(a,v,n=4){const off=(a&~3)-this.base,s=this.slave;if(off===8||off===12){this.regs.set(off,v&(off===8?0xc3ff:0xff));return true;}if(off===16&&s.active&&this.direction){s.tdr=v&255;this.sr1&=~128;if(s.phase==='txwait')this.slaveLoad();return true;}if(off===0&&this.statusSeen){this.sr1&=~16;this.statusSeen=false;}if(off===0&&!(v&32768)){const extra=v&~(1|256|512|1024|2048);if(extra&~(2|8|16|32|64|128|4096|8192))throw Error('I2C CR1 ayrılmış bitler.');const result=super.write(a,v&~extra,n);this.regs.set(0,(this.regs.get(0)||0)|extra);return result;}return super.write(a,v,n);}
 irqMask(){const cr=this.regs.get(4)||0;return super.irqMask()|(this.enabled()&&this.sr1&16&&cr&512?32:0);}
}
