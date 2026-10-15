import {DIGITAL_MODULES} from './digital-hardware.js';
import {partDefaults} from './part-parameters.js';
import {placeOnBreadboard} from './mounting.js';
export const DIGITAL_EXAMPLES=Object.entries(DIGITAL_MODULES).map(([id,d])=>({id:'digital-'+id,name:'Uno · '+d.name,tag:d.specs.interface}));
const DHT=type=>`uint16_t expectLevel(uint8_t level){uint16_t n=0;while((PIND & _BV(2))==level){if(++n>1000)return 0;}return n;}
bool readDHT(uint8_t *data){
 for(uint8_t i=0;i<5;i++)data[i]=0;
 pinMode(2,OUTPUT);digitalWrite(2,LOW);delay(${type==='dht11'?20:2});
 noInterrupts();pinMode(2,INPUT);delayMicroseconds(40);
 if(!expectLevel(0)||!expectLevel(_BV(2))){interrupts();return false;}
 for(uint8_t i=0;i<40;i++){uint16_t low=expectLevel(0),high=expectLevel(_BV(2));if(!low||!high){interrupts();return false;}data[i/8]=(data[i/8]<<1)|(high>low);}
 interrupts();return uint8_t(data[0]+data[1]+data[2]+data[3])==data[4];
}
void setup(){Serial.begin(115200);delay(1100);}
void loop(){uint8_t b[5];if(readDHT(b)){Serial.print("RH=");Serial.print(${type==='dht11'?'float(b[0])':'((b[0]<<8)|b[1])/10.0'},1);Serial.print(" T=");Serial.println(${type==='dht11'?'float(b[2])':'(((b[2]&127)<<8)|b[3])/10.0*(b[2]&128?-1:1)'},1);}else Serial.println("DHT timeout/checksum");delay(2100);}
`;
export const DIGITAL_SOURCES={
 'digital-dht11':DHT('dht11'),'digital-dht22':DHT('dht22'),
 'digital-hx711':`void setup(){Serial.begin(115200);pinMode(3,OUTPUT);digitalWrite(3,LOW);pinMode(2,INPUT);}
void loop(){unsigned long deadline=millis()+1000;while(digitalRead(2)&&millis()<deadline){}if(digitalRead(2)){Serial.println("HX timeout");return;}uint32_t raw=0;noInterrupts();for(uint8_t i=0;i<24;i++){digitalWrite(3,HIGH);delayMicroseconds(1);raw=(raw<<1)|digitalRead(2);digitalWrite(3,LOW);delayMicroseconds(1);}digitalWrite(3,HIGH);delayMicroseconds(1);digitalWrite(3,LOW);interrupts();if(raw&0x800000)raw|=0xff000000;Serial.print("HX A128=");Serial.println((int32_t)raw);delay(20);}
`,
 'digital-tm1637':`void startBus(){digitalWrite(2,HIGH);digitalWrite(3,HIGH);delayMicroseconds(5);digitalWrite(3,LOW);}
void stopBus(){digitalWrite(2,LOW);digitalWrite(3,LOW);digitalWrite(2,HIGH);delayMicroseconds(5);digitalWrite(3,HIGH);}
bool writeByte(uint8_t b){for(uint8_t i=0;i<8;i++){digitalWrite(2,LOW);digitalWrite(3,b&1);delayMicroseconds(5);digitalWrite(2,HIGH);delayMicroseconds(5);b>>=1;}digitalWrite(2,LOW);pinMode(3,INPUT_PULLUP);digitalWrite(2,HIGH);delayMicroseconds(5);bool ack=!digitalRead(3);digitalWrite(2,LOW);pinMode(3,OUTPUT);digitalWrite(3,LOW);return ack;}
void setup(){Serial.begin(115200);pinMode(2,OUTPUT);pinMode(3,OUTPUT);startBus();bool ack=writeByte(0x40);stopBus();startBus();ack&=writeByte(0xc0);uint8_t digits[4]={0x06,0x5b|0x80,0x4f,0x66};for(uint8_t i=0;i<4;i++)ack&=writeByte(digits[i]);stopBus();startBus();ack&=writeByte(0x8f);stopBus();Serial.println(ack?"TM1637 ACK - 12:34":"TM1637 NO ACK");}
void loop(){}
`,
 'digital-ky040':`volatile int16_t edges=0;volatile uint8_t prev=3;
void rotate(){uint8_t n=(digitalRead(2)?1:0)|(digitalRead(3)?2:0);const int8_t table[16]={0,1,-1,0,-1,0,0,1,1,0,0,-1,0,-1,1,0};edges+=table[(prev<<2)|n];prev=n;}
void setup(){Serial.begin(115200);pinMode(2,INPUT_PULLUP);pinMode(3,INPUT_PULLUP);pinMode(4,INPUT_PULLUP);attachInterrupt(digitalPinToInterrupt(2),rotate,CHANGE);attachInterrupt(digitalPinToInterrupt(3),rotate,CHANGE);}
void loop(){noInterrupts();int16_t n=edges;interrupts();Serial.print("ENC=");Serial.print(n/4);Serial.print(" SW=");Serial.println(digitalRead(4)==LOW);delay(100);}
`,
 'digital-keypad4x4':`const char keys[4][4]={{'1','2','3','A'},{'4','5','6','B'},{'7','8','9','C'},{'*','0','#','D'}};
void setup(){Serial.begin(115200);for(uint8_t i=0;i<4;i++){pinMode(i+2,INPUT);pinMode(i+6,INPUT_PULLUP);}}
void loop(){bool any=false;for(uint8_t row=0;row<4;row++){digitalWrite(row+2,LOW);pinMode(row+2,OUTPUT);delayMicroseconds(20);for(uint8_t col=0;col<4;col++)if(!digitalRead(col+6)){Serial.print(keys[row][col]);any=true;}pinMode(row+2,INPUT);}if(any)Serial.println();delay(100);}
`
};
export function makeDigitalProject(base,id){const e=DIGITAL_EXAMPLES.find(e=>e.id===id);if(!e)return null;const p=structuredClone(base),type=id.slice(8);p.model=id;p.name=e.name;p.code=DIGITAL_SOURCES[id];delete p.firmware;
 const part=(type,name,params={},x=650,y=420)=>{const c={id:name,type,x,y,rotation:0,params:{...partDefaults(type),...params}};p.components.push(c);return c;};
 const wire=(from,to,color='#14b8a6',points=[])=>p.wires.push({id:'digital'+p.wires.length,from,to,color,points});
 const c=part(type,'module');if(type.startsWith('dht')){placeOnBreadboard(p,c,'bb');part('resistor','pull',{ohms:5100},660,540);wire('pull:1','module:VCC','#ef4444');wire('pull:2','module:DATA');wire('module:DATA','uno:D2');}
 if(type!=='keypad4x4'){wire('uno:5V','module:VCC','#ef4444');wire('uno:GND.1','module:GND','#64748b');}
 if(type==='tm1637'){wire('uno:D2','module:CLK','#f59e0b');wire('uno:D3','module:DIO');}
 if(type==='hx711'){wire('uno:D2','module:DT');wire('uno:D3','module:SCK','#f59e0b');part('loadcell','bridge',{},650,150);for(const pin of['E+','E-','A+','A-'])wire('bridge:'+pin,'module:'+pin,pin==='E+'?'#ef4444':pin==='E-'?'#64748b':'#8b5cf6');}
 if(type==='ky040')for(const[pin,gpio]of[['CLK','D2'],['DT','D3'],['SW','D4']])wire('module:'+pin,'uno:'+gpio);
 if(type==='keypad4x4'){c.params.keyMask=1<<5;for(let i=0;i<4;i++){wire('module:R'+(i+1),'uno:D'+(i+2),'#f59e0b');wire('module:C'+(i+1),'uno:D'+(i+6),'#3b82f6');}}
 p.settings.probe='D2';p.settings.tracePins=['D3'];return p;
}
