import {componentDefinition} from './core.js';
import {DIODE_BODIES} from './diode-hardware.js';
import {SHIFT_BODIES} from './shift-hardware.js';
import {EXTRA_SENSOR_BODIES} from './extra-sensor-hardware.js';
import {SPI_GPIO_BODIES} from './spi-gpio-hardware.js';
import {TFT_BODIES} from './tft-hardware.js';
import {ACTUATOR_BODIES} from './actuator-hardware.js';
import {LOADCELL_BODIES} from './loadcell-hardware.js';
import {DIGITAL_BODIES} from './digital-hardware.js';
import {PULSE_BODIES} from './pulse-hardware.js';
import {BASIC_BODIES} from './basic-hardware.js';
import {LAB_BODIES} from './lab-hardware.js';
import {SENSOR_BODIES} from './sensor-hardware.js';
import {EXPANDED_BODIES} from './expanded-hardware.js';
import {ANALOG_ASSETS} from './opamp-hardware.js';
import {CATALOG} from './core.js';
import {localPoint,pinPoint} from './geometry.js';

// Projected artwork bodies in unscaled SVG units, excluding exposed leads.
// These are 2D editing clearances, not mechanical tolerances or 3D volumes.
const BODIES={...DIODE_BODIES,...SHIFT_BODIES,...EXTRA_SENSOR_BODIES,...SPI_GPIO_BODIES,...TFT_BODIES,...ACTUATOR_BODIES,...LOADCELL_BODIES,...DIGITAL_BODIES,...BASIC_BODIES,...PULSE_BODIES,...LAB_BODIES,...SENSOR_BODIES,...EXPANDED_BODIES,...Object.fromEntries(Object.entries(ANALOG_ASSETS).map(([id,d])=>[id,d.body])),eeprom:[12,4,20.8,42],led:[11.2816,8.2931,17.438,26.494],resistor:[10.4818,0,38.537,11.3386],button:[11.2139,.2494,44.8554,44.8554],pot:[.567,.567,74.457,62.8],npn:[3,4,30,28],mosfet:[5,3,38,52]};
export function bodyBounds(c){
  const d=componentDefinition(c),b=BODIES[c.type]||[0,0,d.width/(d.scale||1),d.height/(d.scale||1)],s=d.scale||1;
  const [x,y,w,h]=b.map(n=>n*s),points=[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([px,py])=>localPoint(c,px,py));
  const left=c.x+Math.min(...points.map(p=>p.x)),top=c.y+Math.min(...points.map(p=>p.y));
  return{x:left,y:top,width:Math.max(...points.map(p=>p.x))+c.x-left,height:Math.max(...points.map(p=>p.y))+c.y-top};
}
const contains=(b,p)=>p.x>b.x+.5&&p.x<b.x+b.width-.5&&p.y>b.y+.5&&p.y<b.y+b.height-.5;
const overlaps=(a,b)=>Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)>.5&&Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y)>.5;
export function coveredHoles(project,ignore=new Set()){
  const covered=new Map(),parts=project.components.filter(c=>c.type!=='breadboard'&&!ignore.has(c.id)).map(c=>({c,b:bodyBounds(c)}));
  for(const board of project.components.filter(c=>c.type==='breadboard'))for(const hole of CATALOG.breadboard.pinDefs){
    const key=board.id+':'+hole.id,p=pinPoint(project,key);
    const ids=parts.filter(({c,b})=>!(c.mount?.boardId===board.id&&Object.values(c.mount.pins).includes(hole.id))&&contains(b,p)).map(({c})=>c.id);
    if(ids.length)covered.set(key,ids);
  }return covered;
}
export function placementClearance(project,c,candidate){
  const proposed={...c,x:candidate.x,y:candidate.y},body=bodyBounds(proposed);
  for(const other of project.components)if(other.id!==c.id&&other.type!=='breadboard'&&overlaps(body,bodyBounds(other)))return 'Gövde çakışıyor: '+other.id;
  const blocked=coveredHoles(project,new Set([c.id]));
  for(const hole of Object.values(candidate.pins)){const ids=blocked.get(candidate.boardId+':'+hole);if(ids)return 'Delik kapalı: '+hole.toUpperCase()+' · '+ids.join(', ');}
  if(c.type==='button'){
    const contacts=new Map();
    for(const def of CATALOG.button.pinDefs){const hole=CATALOG.breadboard.pinDefs.find(p=>p.id===candidate.pins[def.id]);if(!hole)continue;if(!contacts.has(def.bus))contacts.set(def.bus,new Set());contacts.get(def.bus).add(hole.bus);}
    if([...contacts.get('1')||[]].some(bus=>contacts.get('2')?.has(bus)))return 'Buton kontakları aynı şeritte · R ile döndürün';
  }
  if(['diode','zener','npn','mosfet','eeprom','opamp','capacitor','inductor','ds18b20','tmp36','lm35','hc4050','mcp3008','ldr','hc595','hc165','mcp23s17','mcp23017'].includes(c.type)){
    const buses=Object.values(candidate.pins).map(id=>CATALOG.breadboard.pinDefs.find(p=>p.id===id)?.bus);
    if(new Set(buses).size!==buses.length)return 'Bacaklar aynı şeritte · R ile döndürün';
  }return '';
}
