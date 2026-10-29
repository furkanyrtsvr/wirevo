// PL011 holding FIFO plus a separate shift register. All deadlines are in ns;
// a fractional baud divider carries its phase across contiguous characters.
export class PicoUARTTX {
 constructor(clock,format,allowed,drive,complete,changed){Object.assign(this,{clock,format,allowed,drive,complete,changed});this.queue=[];this.active=false;this.epoch=0;this.deadline=0;this.dropped=0;this.started=0;this.finished=0;this.lastEnd=0;this.burstStart=0;this.burstBytes=0;}
 get busy(){return this.active||this.queue.length>0;}
 write(value,capacity){if(this.queue.length>=capacity){this.dropped++;return false;}this.queue.push(value);this.changed('write');this.pump();return true;}
 pump(contiguous=false){if(this.active||!this.queue.length||!this.allowed())return;const f=this.format();if(!f)return;
  const value=this.queue.shift(),bits=[false];let ones=0;for(let i=0;i<f.bits;i++){const b=!!(value&(1<<i));bits.push(b);ones+=+b;}if(f.parity)bits.push(f.parity==='odd'?!(ones%2):!!(ones%2));bits.push(true);
  this.active=true;this.started++;const epoch=this.epoch,start=contiguous?this.deadline:this.clock.nanos;if(!contiguous){this.burstStart=start;this.burstBytes=0;}this.deadline=start+(1+f.bits+(f.parity?1:0)+f.stops)*f.period;
  const at=(time,fn)=>this.clock.createAlarm(()=>{if(epoch===this.epoch)fn();}).schedule(Math.max(0,Math.round(time)-this.clock.nanos));
  this.drive(false);this.changed('shift');for(let i=1;i<bits.length;i++)at(start+i*f.period,()=>this.drive(bits[i]));
  at(this.deadline,()=>{this.active=false;this.finished++;this.burstBytes++;this.lastEnd=this.clock.nanos;this.drive(true);this.complete(value);this.changed('complete');this.pump(true);});
 }
 flush(){this.queue=[];this.changed('flush');}
 cancel(){this.epoch++;this.queue=[];this.active=false;this.drive(true);}
}
