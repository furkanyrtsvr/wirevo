import {BASIC_MODULES} from './basic-hardware.js';
import {partDefaults} from './part-parameters.js';
import {placeOnBreadboard} from './mounting.js';
export const BASIC_EXAMPLES=Object.entries(BASIC_MODULES).map(([id,d])=>({id:'basic-'+id,name:'Uno · '+d.name,tag:d.specs.interface}));
BASIC_EXAMPLES.push({id:'lab-wave',name:'Uno · Jeneratör / V / A',tag:'Cycle · 50 Ω / seri şönt'},{id:'lab-ohms',name:'Pasif ağ · Ohmmetre',tag:'1 kΩ ∥ 1 kΩ = 500 Ω'});
BASIC_EXAMPLES.push({id:'pulse-distance',name:'Uno · Ultrasonik mesafe',tag:'HC-SR04 · pulseIn / ECHO'},{id:'pulse-servo',name:'Uno · Mikro servo',tag:'544–2400 µs · kalibre PWM'});
const ANALOG=`void setup(){Serial.begin(115200);pinMode(2,INPUT);}
void loop(){Serial.print("A0=");Serial.print(analogRead(A0));Serial.print(" A1=");Serial.print(analogRead(A1));Serial.print(" D2=");Serial.println(digitalRead(2));delay(100);}
`;
const WAVE=`void setup(){Serial.begin(115200);}
void loop(){Serial.print("WAVE=");Serial.println(analogRead(A0));delay(5);}
`;
export const BASIC_SOURCES=Object.fromEntries(BASIC_EXAMPLES.map(e=>[e.id,e.id==='lab-wave'?WAVE:e.id==='lab-ohms'?'void setup(){}\nvoid loop(){}\n':ANALOG]));
BASIC_SOURCES['pulse-distance']=`void setup(){Serial.begin(115200);pinMode(7,OUTPUT);pinMode(2,INPUT);digitalWrite(7,LOW);}
void loop(){digitalWrite(7,HIGH);delayMicroseconds(10);digitalWrite(7,LOW);unsigned long echo=pulseIn(2,HIGH,30000);Serial.print("ECHO=");Serial.print(echo);Serial.print(" CM=");Serial.println(echo/58.0,1);delay(70);}
`;
BASIC_SOURCES['pulse-servo']=`void setup(){Serial.begin(115200);pinMode(9,OUTPUT);}
void loop(){unsigned int widths[3]={600,1500,2300};unsigned int width=widths[(millis()/1000)%3];digitalWrite(9,HIGH);delayMicroseconds(width);digitalWrite(9,LOW);delayMicroseconds(10000-width);delayMicroseconds(10000);Serial.print("PULSE=");Serial.println(width);}
`;
export function makeBasicProject(base,id){
 const e=BASIC_EXAMPLES.find(e=>e.id===id);if(!e)return null;const p=structuredClone(base);p.model=id;p.name=e.name;p.code=BASIC_SOURCES[id];delete p.firmware;
 const part=(type,name,params={},x=650,y=420)=>{const c={id:name,type,x,y,rotation:0,params:{...partDefaults(type),...params}};p.components.push(c);return c;};
 const wire=(from,to,color='#14b8a6',points=[])=>p.wires.push({id:'basic'+p.wires.length,from,to,color,points});
 if(id==='lab-wave'){
  p.components=p.components.filter(c=>c.type!=='breadboard');
  part('signalgen','gen',{frequency:10},490,115);part('multimeter','volts',{},490,350);part('multimeter','amps',{mode:'current'},725,350);part('resistor','load',{ohms:1000},815,240);
  wire('gen:OUT','amps:A','#ef4444',[{x:785,y:310},{x:915,y:310}]);wire('amps:COM','load:1','#ef4444');wire('load:2','gen:GND','#64748b');wire('uno:GND','gen:GND','#64748b');wire('volts:V','load:1','#3b82f6');wire('volts:COM','gen:GND','#64748b');wire('uno:A0','load:1','#8b5cf6');
  p.settings.measurement={positive:'load:1',negative:'gen:GND',current:'amps:ammeter'};p.settings.scopeMode='dc';
 }else if(id==='lab-ohms'){
  p.components=p.components.filter(c=>c.type!=='breadboard');part('ohmmeter','ohms',{},540,155);part('resistor','r1',{ohms:1000},850,250);part('resistor','r2',{ohms:1000},850,350);wire('ohms:P','r1:1','#ef4444');wire('ohms:N','r1:2','#64748b');wire('r1:1','r2:1','#ef4444');wire('r1:2','r2:2','#64748b');
 }else if(id==='pulse-distance'||id==='pulse-servo'){
  const type=id==='pulse-distance'?'hcSr04':'servo';part(type,'module');wire('uno:5V','module:VCC','#ef4444');wire('uno:GND.1','module:GND','#64748b');if(type==='servo')wire('uno:D9','module:SIG','#f59e0b');else{wire('uno:D7','module:TRIG','#f59e0b');wire('module:ECHO','uno:D2','#3b82f6');p.settings.probe='D2';p.settings.tracePins=['D7'];}
 }else{
  const type=id.slice(6),c=part(type,'module');if(type==='lm35'){placeOnBreadboard(p,c,'bb');c.params.temperature=25;}
  if(type==='mq2')c.params.rs=5000;if(['flame','sound'].includes(type))c.params.level=75;if(['hall','tilt','irObstacle'].includes(type))c.params.active=1;if(type==='pir'){c.params.motion=1;c.params.hold=.5;c.params.inhibit=.2;}if(type==='joystick')Object.assign(c.params,{x:25,y:75,switchClosed:1});if(type==='thermistor')c.params.temperature=35;
  wire('uno:5V','module:VCC','#ef4444');wire('uno:GND.1','module:GND','#64748b');const pins=BASIC_MODULES[type].pins.map(p=>p.id),analog=pins.includes('AO')?'AO':pins.includes('VRX')?'VRX':type==='lm35'?'OUT':null,digital=pins.includes('DO')?'DO':pins.includes('SW')?'SW':!analog?'OUT':null;
  if(analog)wire('module:'+analog,'uno:A0','#3b82f6');if(pins.includes('VRY'))wire('module:VRY','uno:A1','#8b5cf6');else wire('uno:A1','uno:GND.2','#64748b');if(digital)wire('module:'+digital,'uno:D2','#f59e0b');else wire('uno:D2','uno:GND.2','#64748b');
  p.settings.measurement={positive:'module:'+(analog||digital),negative:'module:GND',current:'@led'};p.settings.scopeMode='dc';
 }return p;
}
