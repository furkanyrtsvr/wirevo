// Only memoryless electrical parts may reuse a DC solution. Device controllers
// still receive every bus edge/time event; their protocol state is never cached.
const STATIC_PARTS=new Set(['board','breadboard','resistor','led','pot','button','tact6','sht31','lcd8','lcd16','lcd20','eeprom','aht20','adxl345','ads1115','bme280','bme680','vl53l0x','ina226','ina219','max30102','bh1750','mpu6050','ds3231','tcs34725','bmp280','rtc','levelShift','mhz19','gps','dht11','dht22','ds18b20','hx711','loadcell','hcSr04','max6675','cd4067','lm35','tmp36','mq2','flame','sound','thermistor','soilCap','water','rain','soilProbe','sensor','joystick','ldr','pir','irObstacle','tilt','hall','i2sMic','irReceiver','irEmitter']);
export class PicoCircuitCache {
 constructor(project){this.enabled=project.components.every(c=>STATIC_PARTS.has(c.type));this.entries=new Map();this.hits=0;this.misses=0;}
 solve(pins,drivers,reactive,calculate){
  if(!this.enabled||reactive)return calculate();
  const key=JSON.stringify([Object.entries(pins).map(([id,s])=>[id,s.outputEnabled?s.voltage:null,s.mode]),drivers]);
  if(this.entries.has(key)){this.hits++;return this.entries.get(key);}
  this.misses++;const value=calculate();if(value.valid){if(this.entries.size>=128)this.entries.delete(this.entries.keys().next().value);this.entries.set(key,value);}return value;
 }
}
