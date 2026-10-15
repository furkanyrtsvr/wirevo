import {BOARD_EXAMPLES,makeBoardProject} from './board-examples.js';
import {ACQUISITION_EXAMPLES,makeAcquisitionProject} from './adc-acquisition-examples.js';
import {DIODE_EXAMPLES,makeDiodeProject} from './diode-examples.js';
import {SHIFT_EXAMPLES,makeShiftProject} from './shift-examples.js';
import {EXTRA_SENSOR_EXAMPLES,makeExtraSensorProject} from './extra-sensor-examples.js';
import {SPI_GPIO_EXAMPLES,makeSPIGPIOProject} from './spi-gpio-examples.js';
import {CHAIN_EXAMPLES,makeChainProject} from './chain-examples.js';
import {TFT_EXAMPLES,makeTFTProject} from './tft-examples.js';
import {ACTUATOR_EXAMPLES,makeActuatorProject} from './actuator-examples.js';
import {DIGITAL_EXAMPLES,makeDigitalProject} from './digital-examples.js';
import {BASIC_EXAMPLES,makeBasicProject} from './basic-examples.js';
import {SENSOR_EXAMPLES,makeSensorProject} from './sensor-examples.js';
import {EXPANDED_EXAMPLES,makeExpandedProject} from './expanded-examples.js';
import {placeOnBreadboard} from './mounting.js';
import {MODULE_SOURCES} from './module-templates.js';
import {CATALOG} from './core.js';
import {attachPlacement,placementCandidate} from './mounting.js';
import {pinPoint,localPoint} from './geometry.js';
import {OLED_SOURCES} from './oled-examples.js';
function mountAt(p,c,hole){const def=CATALOG[c.type].pinDefs[0],target=pinPoint(p,'bb:'+hole),local=localPoint(c,def.x,def.y);c.x=target.x-local.x;c.y=target.y-local.y;if(!attachPlacement(c,placementCandidate(p,c,{radius:.1})))throw Error('Şablon montajı geçersiz: '+c.id);}
export const TEMPLATES=[{id:'blink',name:'Uno · Blink',tag:'GPIO / UART'},{id:'button',name:'Uno · Buton',tag:'INPUT_PULLUP'},{id:'dimmer',name:'Uno · ADC / PWM',tag:'ADC0 → OC2B'},{id:'greenhouse',name:'Uno · Sera kontrolü',tag:'ADC0 / Röle'},{id:'uart',name:'Uno · UART Echo',tag:'USART0'},{id:'divider',name:'Uno · Gerilim bölücü',tag:'10k / 10k · ADC0'},{id:'npn',name:'Uno · NPN sürücü',tag:'NPN · 1k baz'},{id:'mosfet',name:'Uno · MOSFET sürücü',tag:'MOSFET · VGS / ID'},{id:'relay',name:'Uno · Röle kontakları',tag:'COM / NC / NO'},{id:'spdt',name:'Uno · SPDT anahtar',tag:'2→1 / 2→3'}];
TEMPLATES.push({id:'multifile',name:'Uno · Çoklu kaynak',tag:'sketch + led.cpp / led.h'});
TEMPLATES.push({id:'oled',name:'Uno · OLED sayaç',tag:'SSD1306 · Wire / GFX'},{id:'oled-adc',name:'Uno · OLED / ADC',tag:'A0 → OLED / PWM'},{id:'i2c-scan',name:'Uno · I²C tarayıcı',tag:'Adres / ACK · 100 kHz'});
TEMPLATES.push({id:'eeprom',name:'Uno · EEPROM R/W',tag:'24LC256 · 32 KB / ACK polling'},{id:'rtc',name:'Uno · RTC saat',tag:'DS1307 · BCD / 100 kHz'},{id:'i2c-modules',name:'Uno · I²C modüller',tag:'OLED + EEPROM + RTC'});
TEMPLATES.push(...BOARD_EXAMPLES,...ACQUISITION_EXAMPLES,...EXPANDED_EXAMPLES,...SENSOR_EXAMPLES,...BASIC_EXAMPLES,...DIGITAL_EXAMPLES,...ACTUATOR_EXAMPLES,...TFT_EXAMPLES,...CHAIN_EXAMPLES,...SPI_GPIO_EXAMPLES,...EXTRA_SENSOR_EXAMPLES,...SHIFT_EXAMPLES,...DIODE_EXAMPLES);
export const SOURCES={
  blink:`const uint8_t LED_PIN = 13;\nconst uint16_t INTERVAL = 500;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  Serial.println("D13 HIGH");\n  delay(INTERVAL);\n  digitalWrite(LED_PIN, LOW);\n  Serial.println("D13 LOW");\n  delay(INTERVAL);\n}\n`,
  button:`const uint8_t BUTTON_PIN = 2;\nconst uint8_t LED_PIN = 13;\n\nvoid setup() {\n  pinMode(BUTTON_PIN, INPUT_PULLUP);\n  pinMode(LED_PIN, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  bool pressed = digitalRead(BUTTON_PIN) == LOW;\n  digitalWrite(LED_PIN, pressed ? HIGH : LOW);\n  Serial.println(pressed ? "BUTTON ON" : "BUTTON OFF");\n  delay(100);\n}\n`,
  dimmer:`const uint8_t PWM_PIN = 3;\n\nvoid setup() {\n  pinMode(PWM_PIN, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  int adc = analogRead(A0);\n  int pwm = map(adc, 0, 1023, 0, 255);\n  analogWrite(PWM_PIN, pwm);\n  Serial.print("ADC=");\n  Serial.print(adc);\n  Serial.print(" PWM=");\n  Serial.println(pwm);\n  delay(100);\n}\n`,
  greenhouse:`const uint8_t PUMP_PIN = 7;\nconst int MOISTURE_THRESHOLD = 35;\n\nvoid setup() {\n  pinMode(PUMP_PIN, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  int adc = analogRead(A0);\n  int moisture = map(adc, 0, 1023, 0, 100);\n  bool pump = moisture < MOISTURE_THRESHOLD;\n  digitalWrite(PUMP_PIN, pump ? HIGH : LOW);\n  Serial.print("NEM=");\n  Serial.print(moisture);\n  Serial.println(pump ? " POMPA=ON" : " POMPA=OFF");\n  delay(200);\n}\n`,
  uart:`void setup() {\n  Serial.begin(115200);\n  Serial.println("CircuitForge USART0 ready");\n}\n\nvoid loop() {\n  if (Serial.available()) {\n    Serial.write(Serial.read());\n  }\n}\n`
};
export function makeProject(id='blink'){
 if(BOARD_EXAMPLES.some(e=>e.id===id))return makeBoardProject(makeProject({'soft-uart':'co2','mega-uart':'co2','mega-i2c':'sht31','mega-spi':'spi-adc'}[id]||'dimmer'),id);
  if(DIODE_EXAMPLES.some(e=>e.id===id))return makeDiodeProject(makeProject('uart'),id);
  if(SHIFT_EXAMPLES.some(e=>e.id===id))return makeShiftProject(makeProject('uart'),id);
  if(EXTRA_SENSOR_EXAMPLES.some(e=>e.id===id))return makeExtraSensorProject(makeProject('uart'),id);
  if(SPI_GPIO_EXAMPLES.some(e=>e.id===id))return makeSPIGPIOProject(makeProject('uart'),id);
  if(CHAIN_EXAMPLES.some(e=>e.id===id))return makeChainProject(makeProject('uart'),id);
  if(TFT_EXAMPLES.some(e=>e.id===id))return makeTFTProject(makeProject('uart'),id);
  if(ACTUATOR_EXAMPLES.some(e=>e.id===id))return makeActuatorProject(makeProject('uart'),id);
  if(DIGITAL_EXAMPLES.some(e=>e.id===id))return makeDigitalProject(makeProject('uart'),id);
  if(BASIC_EXAMPLES.some(e=>e.id===id))return makeBasicProject(makeProject('uart'),id);
  if(ACQUISITION_EXAMPLES.some(e=>e.id===id))return makeAcquisitionProject(makeProject('spi-adc'),id);
  if(SENSOR_EXAMPLES.some(e=>e.id===id))return makeSensorProject(makeProject('uart'),id);
  if(EXPANDED_EXAMPLES.some(e=>e.id===id))return makeExpandedProject(makeProject('uart'),id);
  if(MODULE_SOURCES[id]){
    const p=makeProject('uart');p.model=id;p.name=TEMPLATES.find(t=>t.id===id).name;p.code=MODULE_SOURCES[id];
    if(id!=='rtc'){p.components.push({id:'memory1',type:'eeprom',x:0,y:0,rotation:90,params:{}});placeOnBreadboard(p,p.components.at(-1),'bb');}
    if(id!=='eeprom')p.components.push({id:'rtc1',type:'rtc',x:790,y:480,rotation:0,params:{}});
    if(id==='i2c-modules')p.components.push({id:'oled1',type:'oled',x:585,y:480,rotation:0,params:{address:60}});
    const wire=(from,to,color,points=[])=>p.wires.push({id:'module'+p.wires.length,from,to,color,points});
    for(const c of p.components.filter(c=>['eeprom','rtc','oled'].includes(c.type))){
      for(const[pin,to,color]of [['VCC','5V','#ef4444'],['GND','GND.1','#64748b'],['SDA','A4','#3b82f6'],['SCL','A5','#f59e0b']]){
        const a=pinPoint(p,'uno:'+to),b=pinPoint(p,c.id+':'+pin),i=['VCC','GND','SDA','SCL'].indexOf(pin),y=620+i*14;
        wire('uno:'+to,c.id+':'+pin,color,[{x:a.x,y},{x:1025+i*14,y},{x:1025+i*14,y:b.y},{x:b.x,y:b.y}]);
      }
      if(c.type==='eeprom')for(const pin of ['A0','A1','A2','WP'])wire(c.id+':'+pin,'uno:GND.2','#64748b');
    }
    if(id==='eeprom')for(const [i,pin]of ['SDA','SCL'].entries()){
      const c={id:'pull'+i,type:'resistor',x:595+i*105,y:490,rotation:0,params:{ohms:4700}};p.components.push(c);wire('uno:5V',c.id+':1','#ef4444');wire(c.id+':2','memory1:'+pin,i?'#f59e0b':'#3b82f6');
    }
    return p;
  }

  if(OLED_SOURCES[id]){
    const p=makeProject(id==='oled-adc'?'dimmer':'blink');p.name=TEMPLATES.find(t=>t.id===id).name;p.model=id;p.code=OLED_SOURCES[id];
    p.components.push({id:'oled1',type:'oled',x:800,y:458,rotation:0,params:{address:60}});
    const wire=(from,to,color,points)=>p.wires.push({id:'oled'+p.wires.length,from,to,color,points});
    // Separate four routes beneath the breadboard; segment handles remain editable.
    for(const [pin,to,color,y]of [['GND.2','GND','#64748b',605],['5V','VCC','#ef4444',595],['A5','SCL','#f59e0b',585],['A4','SDA','#3b82f6',575]]){
      const a=pinPoint(p,'uno:'+pin),b=pinPoint(p,'oled1:'+to);wire('uno:'+pin,'oled1:'+to,color,[{x:a.x,y},{x:1000+(605-y)*1.5,y},{x:1000+(605-y)*1.5,y:b.y-22-(605-y)},{x:b.x,y:b.y-22-(605-y)}]);
    }p.settings.tracePins=['D3','D2','D7'];return p;
  }
  if(id==='multifile'){
    const p=makeProject('blink');p.name='Uno · Çoklu kaynak';p.model='multifile';p.schemaVersion=4;
    p.code='#include "led.h"\n\nvoid setup() {\n  initLed();\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  setLed(true);\n  Serial.println("LED HIGH");\n  delay(500);\n  setLed(false);\n  Serial.println("LED LOW");\n  delay(500);\n}\n';
    p.files=[{name:'led.h',content:'#pragma once\n\nvoid initLed();\nvoid setLed(bool on);\n'},{name:'led.cpp',content:'#include <Arduino.h>\n#include "led.h"\n\nstatic const uint8_t LED_PIN = 13;\n\nvoid initLed() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid setLed(bool on) {\n  digitalWrite(LED_PIN, on ? HIGH : LOW);\n}\n'}];return p;
  }
  if(['relay','spdt'].includes(id)){
    const p=makeProject(id==='relay'?'blink':'button');p.model=id;p.name=TEMPLATES.find(t=>t.id===id).name;
    const wire=(from,to,color)=>p.wires.push({id:'contact'+p.wires.length,from,to,color,points:[]});
    if(id==='relay'){
      p.components.push({id:'relay1',type:'relay',x:730,y:465,rotation:0,params:{activeHigh:true}});
      p.wires[0].from='relay1:NO';wire('uno:D13','relay1:IN','#14b8a6');wire('uno:5V','relay1:VCC','#ef4444');wire('uno:GND.1','relay1:GND','#64748b');wire('uno:5V','relay1:COM','#ef4444');
      p.settings.measurement={positive:'relay1:NO',negative:'uno:GND',current:'relay1:contact'};
    }else{
      p.components=p.components.filter(c=>c.id!=='button1');p.wires=p.wires.filter(w=>!w.from.startsWith('button1:')&&!w.to.startsWith('button1:'));
      p.components.push({id:'sw1',type:'spdt',x:810,y:455,rotation:0,params:{position:'left'}});
      wire('uno:D2','sw1:2','#3b82f6');wire('uno:GND.1','sw1:1','#64748b');wire('uno:5V','sw1:3','#ef4444');
      p.settings.measurement={positive:'sw1:2',negative:'uno:GND',current:'sw1:contact'};
    }p.settings.scopeMode='dc';return p;
  }
  if(['npn','mosfet'].includes(id)){
    const p=makeProject('blink');p.model=id;p.name=TEMPLATES.find(t=>t.id===id).name;p.settings.tracePins=['D3','D2','D7'];
    p.components.push({id:'q1',type:id,x:800,y:360,rotation:0,params:{}});
    p.wires=p.wires.filter(w=>!(w.from==='bb:b10'&&w.to==='bb:tn10'));p.wires[0].from='uno:5V';p.wires[0].color='#ef4444';
    const wire=(from,to,color,points=[])=>p.wires.push({id:'driver'+p.wires.length,from,to,color,points});
    wire('bb:b10','q1:'+(id==='npn'?'C':'D'),'#3b82f6',[{x:699,y:100},{x:1050,y:100},{x:1050,y:560},{x:790,y:560}]);
    wire('q1:'+(id==='npn'?'E':'S'),'bb:tn20','#64748b',[{x:920,y:560},{x:1110,y:560},{x:1110,y:205.36}]);
    if(id==='npn'){
      p.components.push({id:'rb',type:'resistor',x:620,y:430,rotation:0,params:{ohms:1000}});
      wire('uno:D13','rb:1','#14b8a6',[{x:268.975,y:578},{x:620,y:578}]);wire('rb:2','q1:B','#14b8a6',[{x:730,y:470},{x:847.25,y:470}]);
    }else{
      p.components.push({id:'rg',type:'resistor',x:610,y:430,rotation:0,params:{ohms:100000}});
      wire('uno:D13','q1:G','#14b8a6',[{x:268.975,y:578},{x:795,y:578},{x:795,y:525}]);wire('q1:G','rg:1','#f59e0b',[{x:795,y:525},{x:610,y:525}]);wire('rg:2','uno:GND.1','#64748b',[{x:700,y:600},{x:328.59,y:600}]);
    }
    mountAt(p,p.components.find(c=>c.id==='q1'),'e18');mountAt(p,p.components.find(c=>c.id===(id==='npn'?'rb':'rg')),'j18');for(const w of p.wires)if(w.id.startsWith('driver'))w.points=[];return p;
  }
  const c=(id,type,x,y,params={})=>({id,type,x,y,rotation:0,params});
  const components=[c('uno','board',100,205),c('bb','breadboard',550,160)],wires=[];
  const w=(from,to,color='#14b8a6',points=[])=>wires.push({id:'w'+(wires.length+1),from,to,color,points});
  const bbPoint=pin=>{const p=CATALOG.breadboard.pinDefs.find(p=>p.id===pin);return{x:550+p.x,y:160+p.y};};
  if(id==='divider'){
    for(const [name,hole]of [['r1','c5'],['r2','d11']]){const p=bbPoint(hole),anchor=CATALOG.resistor.pinDefs[0];components.push(c(name,'resistor',p.x-anchor.x,p.y-anchor.y,{ohms:10000}));}
    w('uno:5V','bb:b5','#ef4444',[{x:315.63,y:500},{x:520,y:500},{x:520,y:225}]);w('uno:A0','bb:e11','#3b82f6',[{x:380.43,y:530},{x:755,y:530}]);w('uno:GND.1','bb:c17','#64748b',[{x:328.59,y:550},{x:990,y:550},{x:990,y:275}]);
    const p={schemaVersion:3,name:'Uno · Gerilim bölücü',model:'divider',code:SOURCES.dimmer,components,wires,settings:{moisture:45,threshold:35,pot:60,pressed:false,probe:'A0'}};for(const part of components.filter(c=>c.type==='resistor'))attachPlacement(part,placementCandidate(p,part));return p;
  }
  if(id!=='greenhouse'&&id!=='uart'){
    const rp=bbPoint('c5'),lp=bbPoint('e11'),ra=CATALOG.resistor.pinDefs[0],la=CATALOG.led.pinDefs.find(p=>p.id==='A');
    components.push(c('r1','resistor',rp.x-ra.x,rp.y-ra.y,{ohms:220}),c('led1','led',lp.x-la.x,lp.y-la.y,{color:'red'}));
    w(id==='dimmer'?'uno:D3':'uno:D13','bb:b5','#14b8a6',[{x:id==='dimmer'?406.35:268.975,y:120},{x:bbPoint('b5').x,y:120}]);
    w('bb:c5','r1:1','#f59e0b');w('r1:2','bb:c11','#f59e0b');w('bb:e11','led1:A','#f59e0b');w('led1:K','bb:e10','#64748b');
    w('bb:b10','bb:tn10','#64748b');w('uno:GND.1','bb:tn1','#64748b',[{x:500,y:464.24},{x:500,y:205.36}]);
    w('uno:5V','bb:tp1','#ef4444',[{x:315.63,y:505},{x:525,y:505},{x:525,y:192.4}]);
  }
  if(id==='button'){components.push(c('button1','button',812,248,{pressed:false}));w('uno:D2','button1:1','#3b82f6',[{x:419.31,y:101},{x:1030,y:101},{x:1030,y:229},{x:785,y:229}]);w('button1:2','bb:tn20','#64748b');}
  if(id==='dimmer'){components.push(c('pot1','pot',828,340,{value:60}));w('uno:5V','pot1:VCC','#ef4444',[{x:315.63,y:520},{x:920,y:520}]);w('pot1:GND','uno:GND.2','#64748b',[{x:866,y:540},{x:341.55,y:540}]);w('pot1:OUT','uno:A0','#3b82f6',[{x:880,y:558},{x:380.43,y:558}]);}
  if(id==='greenhouse'){
    components.push(c('sensor1','sensor',636,226,{value:45}),c('relay1','relay',816,275));
    w('uno:5V','sensor1:VCC','#ef4444',[{x:315.63,y:520},{x:664,y:520}]);w('sensor1:GND','uno:GND.1','#64748b',[{x:700,y:540},{x:328.59,y:540}]);w('sensor1:OUT','uno:A0','#3b82f6',[{x:682,y:557},{x:380.43,y:557}]);
    w('uno:5V','relay1:VCC','#ef4444',[{x:315.63,y:505},{x:1020,y:505},{x:1020,y:245},{x:796,y:245}]);w('uno:D7','relay1:IN','#14b8a6',[{x:354.51,y:120},{x:1040,y:120},{x:1040,y:260},{x:786,y:260}]);w('relay1:GND','uno:GND.2','#64748b',[{x:788,y:330},{x:788,y:575},{x:341.55,y:575}]);
  }
  return{schemaVersion:3,name:TEMPLATES.find(t=>t.id===id)?.name||'Yeni proje',model:id,code:SOURCES[id]||SOURCES.blink,components,wires,settings:{moisture:45,threshold:35,pot:60,pressed:false,probe:id==='greenhouse'?'D7':id==='dimmer'?'D3':'D13'}};
}
export function emptyProject(){return{...makeProject(),name:'Untitled',model:'custom',components:[],wires:[],code:'void setup() {\n}\n\nvoid loop() {\n}\n'};}
