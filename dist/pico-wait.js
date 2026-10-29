// Browser compatibility sleep hint. Never skips arbitrary firmware instructions.
// Resume the CPU at every scheduled event, so IRQs and peripheral edges remain observable.
export function advancePicoWait(r,count,maxNanos=Infinity){
 const until=r.sleepUntil;r.sleepUntil=0;
 if(!until||r.architecture==='riscv'||r.core.interruptsUpdated||count<=1||r.waitAcceleration===false||r.services.core1||r.debugger?.stepping||r.debugger?.addresses.size||r.rp.pio.some(p=>p.machines.some(m=>m.enabled)))return false;
 const clock=r.rp.clock,now=clock.nanos;
 let delta=Math.min(until-now,maxNanos-now,1e6);
 if(clock.nextAlarm)delta=Math.min(delta,Math.max(0,clock.nextAlarm.nanos-now));
 const external=r.circuit?.clockEvents[0];if(external)delta=Math.min(delta,Math.max(0,external.at/.016-now));
 const cycles=Math.floor(delta*r.rp.clkSys/1e9);if(cycles<1)return false;
 r.core.cycles+=cycles;clock.tick(cycles*1e9/r.rp.clkSys);
 r.count=r.core.cycles;r.referenceCycles=clock.nanos*.016;
 if(r.circuit?.clockEvents[0]?.at<=r.referenceCycles)r.circuit.refresh(true);
 r.waitStats??={advances:0,nanos:0};r.waitStats.advances++;r.waitStats.nanos+=clock.nanos-now;
 return true;
}
