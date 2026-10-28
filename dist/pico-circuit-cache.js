// Only memoryless electrical parts may reuse a DC solution. Device controllers
// still receive every bus edge/time event; their protocol state is never cached.
const STATIC_PARTS=new Set(['board','breadboard','resistor','led','pot','button','tact6','sht31','lcd8','lcd16','lcd20','eeprom']);
export class PicoCircuitCache {
 constructor(project){this.enabled=project.components.every(c=>STATIC_PARTS.has(c.type));this.entries=new Map();this.hits=0;this.misses=0;}
 solve(pins,drivers,reactive,calculate){
  if(!this.enabled||reactive)return calculate();
  const key=JSON.stringify([Object.entries(pins).map(([id,s])=>[id,s.outputEnabled?s.voltage:null,s.mode]),drivers]);
  if(this.entries.has(key)){this.hits++;return this.entries.get(key);}
  this.misses++;const value=calculate();if(value.valid){if(this.entries.size>=128)this.entries.delete(this.entries.keys().next().value);this.entries.set(key,value);}return value;
 }
}
