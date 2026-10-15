import {partDefaults} from './part-parameters.js';
export const ACTUATOR_EXAMPLES=[{id:'actuator-ws2812',name:'Uno · WS2812 renk şeridi',tag:'8 RGB · GRB / cycle / latch'},{id:'actuator-stepper',name:'Uno · ULN2003 step motor',tag:'8 faz · half-step / kalibre'},{id:'actuator-bridge',name:'Uno · L298N çift köprü',tag:'EN / yön / fren / yük'}];
export const ACTUATOR_SOURCES={
 'actuator-ws2812':`void byteOut(uint8_t b){asm volatile(".rept 8\\n\\t sbi %1,6\\n\\t nop\\n\\t sbrs %0,7\\n\\t cbi %1,6\\n\\t .rept 7\\n\\t nop\\n\\t .endr\\n\\t cbi %1,6\\n\\t .rept 4\\n\\t nop\\n\\t .endr\\n\\t lsl %0\\n\\t .endr":"+r"(b):"I"(_SFR_IO_ADDR(PORTD)));}
void setup(){pinMode(6,OUTPUT);Serial.begin(115200);}
void loop(){noInterrupts();for(uint8_t i=0;i<8;i++){byteOut(i*25);byteOut(255-i*25);byteOut(i*16);}interrupts();delayMicroseconds(80);Serial.println("WS2812 GRB frame");delay(100);}
`,
 'actuator-stepper':`const uint8_t pattern[8]={8,12,4,6,2,3,1,9};
void setup(){Serial.begin(115200);for(uint8_t i=0;i<4;i++)pinMode(2+i,OUTPUT);}
void loop(){static uint16_t step=0;uint8_t p=pattern[step&7];for(uint8_t i=0;i<4;i++)digitalWrite(2+i,(p>>(3-i))&1);step++;if(!(step&63)){Serial.print("HALF_STEPS=");Serial.println(step);}delay(4);}
`,
 'actuator-bridge':`void setup(){Serial.begin(115200);for(uint8_t i=2;i<=7;i++)pinMode(i,OUTPUT);}
void loop(){uint8_t mode=(millis()/1000)%4;digitalWrite(2,mode!=3);digitalWrite(3,mode==0);digitalWrite(4,mode==1);digitalWrite(5,HIGH);digitalWrite(6,LOW);digitalWrite(7,HIGH);Serial.print("BRIDGE=");Serial.print(mode);Serial.print(" OUT1_ADC=");Serial.println(analogRead(A0));delay(100);}
`
};
export function makeActuatorProject(base,id){const e=ACTUATOR_EXAMPLES.find(e=>e.id===id);if(!e)return null;const p=structuredClone(base);p.model=id;p.name=e.name;p.code=ACTUATOR_SOURCES[id];delete p.firmware;
 const part=(type,name,params={},x=650,y=420)=>{const c={id:name,type,x,y,rotation:0,params:{...partDefaults(type),...params}};p.components.push(c);return c;};const wire=(from,to,color='#14b8a6')=>p.wires.push({id:'actuator'+p.wires.length,from,to,color,points:[]});
 if(id==='actuator-ws2812'){part('ws2812','module');wire('uno:5V','module:VCC','#ef4444');wire('uno:GND.1','module:GND','#64748b');wire('uno:D6','module:DIN');p.settings.probe='D6';}
 if(id==='actuator-stepper'){part('stepper28byj','module');wire('uno:5V','module:VCC','#ef4444');wire('uno:GND.1','module:GND','#64748b');for(let i=0;i<4;i++)wire('uno:D'+(i+2),'module:IN'+(i+1));p.settings.probe='D2';p.settings.tracePins=['D3','D4','D5'];}
 if(id==='actuator-bridge'){part('l298n','module',{},650,420);part('supply','motor',{voltage:5},895,190);part('resistor','loadA',{ohms:100},520,565);part('resistor','loadB',{ohms:200},940,555);wire('motor:VCC','module:VS','#ef4444');wire('motor:GND','uno:GND.1','#64748b');wire('uno:GND.1','module:GND','#64748b');wire('uno:5V','module:VSS','#ef4444');['ENA','IN1','IN2','ENB','IN3','IN4'].forEach((pin,i)=>wire('uno:D'+(i+2),'module:'+pin));for(const[id,a,b]of[['loadA','OUT1','OUT2'],['loadB','OUT3','OUT4']]){wire(id+':1','module:'+a,'#3b82f6');wire(id+':2','module:'+b,'#8b5cf6');}wire('uno:A0','module:OUT1','#f59e0b');p.settings.measurement={positive:'module:OUT1',negative:'module:OUT2',current:'loadA:i'};p.settings.scopeMode='dc';}
 return p;
}
