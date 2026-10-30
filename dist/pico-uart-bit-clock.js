// Deadlines expressed as fractional UART bit positions. A clock gate freezes
// the position; changing the peripheral frequency preserves the elapsed phase.
export class PicoUARTBitClock {
 constructor(clock){this.clock=clock;this.alarm=clock.createAlarm(()=>this.fire());this.tasks=[];this.period=Infinity;this.origin=clock.nanos;this.phase=0;}
 position(){return this.phase+(Number.isFinite(this.period)?(this.clock.nanos-this.origin)/this.period:0);}
 timeAt(bit){return this.origin+(bit-this.phase)*this.period;}
 start(period,origin=this.clock.nanos){this.cancel();this.period=period;this.origin=origin;this.phase=0;}
 at(bit,fn){this.tasks.push({bit,fn});this.tasks.sort((a,b)=>a.bit-b.bit);this.arm();}
 arm(){this.alarm.cancel();if(this.tasks.length&&Number.isFinite(this.period)&&this.period>0)this.alarm.schedule(Math.max(0,Math.round(this.timeAt(this.tasks[0].bit))-this.clock.nanos));}
 fire(){const task=this.tasks.shift();task?.fn();this.arm();}
 setPeriod(period){this.phase=this.position();this.origin=this.clock.nanos;this.period=period;this.arm();}
 cancel(){this.alarm.cancel();this.tasks=[];}
}
