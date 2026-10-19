import {attachShiftRuntime} from './shift-runtime.js';
import {attachSPIGPIORuntime} from './spi-gpio-runtime.js';
import {attachSPIRuntime} from './spi-runtime.js';
import {attachTFTRuntime} from './tft-runtime.js';
import {attachDigitalRuntime} from './digital-devices.js';
import {attachPulseRuntime} from './pulse-devices.js';
import {attachActuatorRuntime} from './actuator-devices.js';
import {attachThermocoupleRuntime} from './thermocouple-runtime.js';
import {attachBasicRuntime} from './basic-devices.js';
import {attachInstrumentRuntime} from './instruments.js';
import {attachUARTDevices} from './uart-device-runtime.js';

// Reuse the Arduino component models on native electrical nets. The facade
// supplies model time and resolved GPIO only: no invented AVR registers or SPI.
const models=[
 ['shiftDevices',['hc595','hc165'],attachShiftRuntime],
 ['spiGPIO',['mcp23s17'],attachSPIGPIORuntime],
 ['spi',['matrix8','digits8','bmp280'],(r,e,p)=>attachSPIRuntime(r,e,p,{gpioOnly:true,types:['matrix8','digits8','bmp280']})],
 ['tftDevices',['tft7735','tft7789'],attachTFTRuntime],
 ['digitalDevices',['dht11','dht22','hx711','tm1637','ky040'],attachDigitalRuntime],
 ['pulseDevices',['hcSr04','servo'],attachPulseRuntime],
 ['actuatorDevices',['ws2812','stepper28byj'],attachActuatorRuntime],
 ['thermocouple',['max6675'],attachThermocoupleRuntime],
 ['basicDevices',['pir'],attachBasicRuntime],
 ['instruments',['signalgen'],attachInstrumentRuntime],
 ['uartDevices',['mhz19'],attachUARTDevices]
];
export class NativeComponents {
 constructor(circuit){this.c=circuit;this.adapters=new Map();this.observers=new Set();this.drivers=new Map();this.revision=0;this.active=false;const self=this;
  this.runtime={cpu:{get cycles(){return self.c.cycle();},addClockEvent(fn,delay){self.c.clockEvents.push({at:Math.ceil(self.c.cycle()+Math.max(1,delay)),fn,moduleEvent:true});self.c.clockEvents.sort((a,b)=>a.at-b.at);}},usarts:[],bus:{uart:[]},get gpioPins(){return Object.keys(self.c.pins||{});},readPin(pin){const p=self.c.pins?.[pin]||{},v=self.c.solution.voltages.get(self.c.solution.netlist.net(self.c.board.id+':'+pin));return{...p,high:p.outputEnabled?!!p.high:Number.isFinite(v)&&v>=2.31};},snapshot(){return{pins:self.c.pins||{}};}};
  this.engine={get solution(){return self.c.solution;},subscribe(fn){self.observers.add(fn);return()=>self.observers.delete(fn);},setDrivers(owner,next){const old=self.drivers.get(owner)||[];if(JSON.stringify(old)!==JSON.stringify(next)){self.drivers.set(owner,next);self.revision++;}return self.c.solution;},deviceController(id,type,create){return self.c.controllers.get(id)?.controller??create();}};
  this.update(circuit.project);
 }
 suspend(){this.active=false;}
 update(project){this.active=false;for(const[name,types,attach]of models){const wanted=project.components.some(c=>types.includes(c.type)),old=this.adapters.get(name);if(wanted){if(old)old.updateProject(project);else this.adapters.set(name,attach(this.runtime,this.engine,project));}else if(old){old.dispose();this.adapters.delete(name);}}this.active=true;}
 settle(base){if(!this.active||!this.adapters.size)return;for(let i=0;i<8;i++){const next=[...base,...[...this.drivers.values()].flat()];if(JSON.stringify(next)!==JSON.stringify(this.c.drivers)){this.c.drivers=next;this.c.solve();}const before=this.revision;for(const fn of this.observers)fn(this.c.solution);if(before===this.revision)return;}throw Error('Ortak bileşen çıkışları aynı çevrimde kararlı hale gelmedi.');}
 snapshot(){return Object.fromEntries([...this.adapters].filter(([name])=>name!=='instruments').map(([name,adapter])=>[name,adapter.snapshot()]));}
 dispose(){this.active=false;for(const adapter of this.adapters.values())adapter.dispose();this.adapters.clear();this.observers.clear();this.drivers.clear();}
}
