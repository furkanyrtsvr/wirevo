// Disabled state machines have no cycle work. Keep the peripheral clock/alarm
// queue running, and immediately restore instruction stepping when any SM starts.
export function installIdlePIO(runtime){
 const rp=runtime.rp;let active=0;
 for(const pio of rp.pio)for(const machine of pio.machines){
  const descriptor=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(machine),'enabled');
  if(!descriptor?.get||!descriptor?.set)return;
  if(machine.enabled)active++;
  Object.defineProperty(machine,'enabled',{get(){return descriptor.get.call(this);},set(value){const before=descriptor.get.call(this);descriptor.set.call(this,value);active+=Number(!!descriptor.get.call(this))-Number(!!before);}});
 }
 const step=rp.stepThings.bind(rp);
 rp.stepThings=cycles=>{if(active||runtime.idlePIOAcceleration===false)step(cycles);else rp.clock.tick(cycles*1e9/rp.clkSys);};
}
