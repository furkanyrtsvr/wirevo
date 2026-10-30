import {PicoUARTBitClock} from './pico-uart-bit-clock.js';
// PL011 holding FIFO plus a separate shift register. All deadlines are in ns;
// a fractional baud divider carries its phase across contiguous characters.
export class PicoUARTTX {
 constructor(clock,format,allowed,drive,complete,changed){Object.assign(this,{clock,format,allowed,drive,complete,changed});this.timer=new PicoUARTBitClock(clock);this.queue=[];this.active=false;this.breaking=false;this.breakRequested=false;this.deadline=0;this.dropped=0;this.started=0;this.finished=0;this.lastEnd=0;this.burstStart=0;this.burstBytes=0;}
 get busy(){return this.active||this.breaking||this.queue.length>0;}
 write(value,capacity){if(this.queue.length>=capacity){this.dropped++;return false;}this.queue.push(value);this.changed('write');this.pump();return true;}
 pump(contiguous=false){if(this.active||this.breaking||this.breakRequested||!this.queue.length||!this.allowed())return;const f=this.format();if(!f||!Number.isFinite(f.period))return;
  const value=this.queue.shift(),bits=[false];let ones=0;for(let i=0;i<f.bits;i++){const b=!!(value&(1<<i));bits.push(b);ones+=+b;}if(f.parity)bits.push(f.parity==='mark'?true:f.parity==='space'?false:f.parity==='odd'?!(ones%2):!!(ones%2));bits.push(true);
  this.active=true;this.started++;this.cycles=f.cycles;const start=contiguous?this.deadline:this.clock.nanos;if(!contiguous){this.burstStart=start;this.burstBytes=0;}this.timer.start(f.period,start);const length=1+f.bits+(f.parity?1:0)+f.stops;
  this.deadline=this.timer.timeAt(length);this.frameLength=length;
  this.drive(false);this.changed('shift');for(let i=1;i<bits.length;i++)this.timer.at(i,()=>this.drive(bits[i]));
  this.timer.at(length,()=>{this.deadline=this.timer.timeAt(length);this.active=false;this.finished++;this.burstBytes++;this.lastEnd=this.clock.nanos;this.drive(true);this.complete(value);this.changed('complete');if(this.breakRequested)this.setBreak(true);else this.pump(true);});
 }
 setBreak(on){this.breakRequested=on;if(this.active)return;if(this.breaking!==on){this.breaking=on;this.drive(!on);this.changed('break');}if(!on)this.pump();}
 reclock(hz){if(this.active){this.timer.setPeriod(hz>0?this.cycles*1e9/hz:Infinity);this.deadline=this.timer.timeAt(this.frameLength);}else this.pump();}
 flush(){this.queue=[];this.changed('flush');}
 cancel(){this.timer.cancel();this.queue=[];this.active=false;this.breakRequested=this.breaking=false;this.drive(true);}
}
