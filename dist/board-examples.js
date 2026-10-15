export const BOARD_EXAMPLES=[{id:'nano-adc',name:'Nano · A6 / A7 / PWM',tag:'ATmega328P · 8 ADC',board:'nano'},{id:'mini-adc',name:'Pro Mini · A6 / A7 / PWM',tag:'5 V /16 MHz · ATmega328P',board:'pro-mini'},{id:'soft-uart',name:'Uno · SoftwareSerial CO₂',tag:'MH-Z19B · D2 / D3 · 9600'},{id:'mega-adc',name:'Mega 2560 · A15 / Timer5 / SRAM',tag:'16 ADC · D44 PWM · 3 KB SRAM',board:'mega'},{id:'mega-uart',name:'Mega 2560 · Serial1 CO₂',tag:'MH-Z19B · RX19 / TX18',board:'mega'},{id:'mega-i2c',name:'Mega 2560 · I²C sıcaklık / nem',tag:'SHT31 · SDA20 / SCL21',board:'mega'},{id:'mega-spi',name:'Mega 2560 · SPI ADC',tag:'MCP3008 · D50–D53',board:'mega'},{id:'duemilanove-adc',name:'Duemilanove · ADC / PWM',tag:'ATmega328P · 6 ADC',board:'duemilanove'},{id:'pro-adc',name:'Arduino Pro · ADC / PWM',tag:'5 V / 16 MHz · 6 ADC',board:'pro'}];
export const BOARD_SOURCES={
 'nano-adc':`#if !defined(ARDUINO_AVR_NANO)
#error Wrong board target
#endif
void setup(){Serial.begin(115200);pinMode(3,OUTPUT);}void loop(){int a=analogRead(A6),b=analogRead(A7);analogWrite(3,a/4);Serial.print("A6=");Serial.print(a);Serial.print(" A7=");Serial.println(b);delay(100);}`,
 'mini-adc':`#if !defined(ARDUINO_AVR_PRO)
#error Wrong board target
#endif
void setup(){Serial.begin(115200);pinMode(3,OUTPUT);}void loop(){int a=analogRead(A6),b=analogRead(A7);analogWrite(3,a/4);Serial.print("A6=");Serial.print(a);Serial.print(" A7=");Serial.println(b);delay(100);}`,
 'soft-uart':`#include <SoftwareSerial.h>
SoftwareSerial sensor(2,3);
void setup(){Serial.begin(115200);sensor.begin(9600);}
void loop(){const byte command[9]={255,1,0x86,0,0,0,0,0,0x79};while(sensor.available())sensor.read();sensor.write(command,9);byte b[9]={0};unsigned long start=millis();byte n=0;while(n<9&&millis()-start<250)if(sensor.available())b[n++]=sensor.read();byte sum=0;for(byte i=1;i<8;i++)sum+=b[i];if(n==9&&b[0]==255&&b[1]==0x86&&b[8]==(byte)(256-sum)){Serial.print("SOFT_CO2=");Serial.println(((uint16_t)b[2]<<8)|b[3]);}else{Serial.print("SOFT_TIMEOUT=");Serial.println(n);}delay(100);}`
};
BOARD_SOURCES['mega-adc']=`#if !defined(ARDUINO_AVR_MEGA2560)
#error Wrong board target
#endif
volatile byte memoryProbe[3000];
void setup(){Serial.begin(115200);pinMode(44,OUTPUT);pinMode(53,OUTPUT);digitalWrite(53,HIGH);memoryProbe[0]=37;memoryProbe[2999]=77;}
void loop(){int a=analogRead(A15);analogWrite(44,a/4);Serial.print("A15=");Serial.print(a);Serial.print(" PWM44=");Serial.print(a/4);Serial.print(" SRAM=");Serial.print(memoryProbe[0]);Serial.print('/');Serial.println(memoryProbe[2999]);delay(100);}`;
BOARD_SOURCES['mega-uart']=`#if !defined(ARDUINO_AVR_MEGA2560)
#error Wrong board target
#endif
void setup(){Serial.begin(115200);Serial1.begin(9600);}
void loop(){const byte command[9]={255,1,0x86,0,0,0,0,0,0x79};while(Serial1.available())Serial1.read();Serial1.write(command,9);byte b[9]={0};unsigned long start=millis();byte n=0;while(n<9&&millis()-start<250)if(Serial1.available())b[n++]=Serial1.read();byte sum=0;for(byte i=1;i<8;i++)sum+=b[i];if(n==9&&b[0]==255&&b[1]==0x86&&b[8]==(byte)(256-sum)){Serial.print("SERIAL1_CO2=");Serial.println(((uint16_t)b[2]<<8)|b[3]);}else{Serial.print("SERIAL1_TIMEOUT=");Serial.println(n);}delay(100);}`;
for(const [id,macro] of [['duemilanove-adc','DUEMILANOVE'],['pro-adc','PRO']])BOARD_SOURCES[id]=`#if !defined(ARDUINO_AVR_${macro})
#error Wrong board target
#endif
void setup(){Serial.begin(115200);pinMode(3,OUTPUT);}void loop(){int a=analogRead(A0),b=analogRead(A5);analogWrite(3,a/4);Serial.print("A0=");Serial.print(a);Serial.print(" A5=");Serial.println(b);delay(100);}`;
export function makeBoardProject(base,id){const p=structuredClone(base),d=BOARD_EXAMPLES.find(e=>e.id===id);p.model=id;p.name=d.name;p.code=BOARD_SOURCES[id]||p.code;delete p.firmware;
 if(id==='soft-uart'){for(const w of p.wires){if(w.from==='uno:D0')w.from='uno:D2';if(w.to==='uno:D0')w.to='uno:D2';if(w.from==='uno:D1')w.from='uno:D3';if(w.to==='uno:D1')w.to='uno:D3';}p.settings.probe='D3';p.settings.tracePins=['D2','D1','D0'];return p;}
 const board=p.components.find(c=>c.type==='board');board.params.model=d.board;if(d.board==='mega'){for(const c of p.components)if(c!==board)c.x+=200;for(const w of p.wires)w.points=[];}
 const remap=m=>{for(const w of p.wires)for(const end of ['from','to'])if(w[end].startsWith(board.id+':')){const pin=w[end].slice(board.id.length+1);if(m[pin])w[end]=board.id+':'+m[pin];}};
 if(['mega-uart','mega-i2c','mega-spi'].includes(id)){if(id==='mega-i2c')p.code=p.code.replace(/digitalWrite\(A4,/g,'digitalWrite(20,').replace(/digitalWrite\(A5,/g,'digitalWrite(21,');remap(id==='mega-uart'?{D0:'D19',D1:'D18'}:id==='mega-i2c'?{A4:'D20',A5:'D21',SDA:'D20',SCL:'D21'}:{D10:'D53',D11:'D51',D12:'D50',D13:'D52'});if(id==='mega-spi')p.code=p.code.replace(/const\s+(?:int|byte)\s+CS\s*=\s*10\s*;/,'const byte CS=53;').replace(/pinMode\(10,/g,'pinMode(53,').replace(/digitalWrite\(10,/g,'digitalWrite(53,');p.settings.probe=id==='mega-uart'?'D18':id==='mega-i2c'?'D21':'D52';p.settings.tracePins=id==='mega-uart'?['D19','D1','D0']:id==='mega-i2c'?['D20','D13','D2']:['D51','D50','D53'];return p;}
 p.wires=[];p.components=p.components.filter(c=>['board','breadboard','pot','led','resistor'].includes(c.type));
 const pot=p.components.find(c=>c.type==='pot');if(!pot)p.components.push({id:'pot1',type:'pot',x:620,y:400,rotation:0,params:{value:50}});else pot.params.value=50;
 const pp=(pot||p.components.at(-1)).id,power=d.board==='pro-mini'?'VCC':'5V';
 const input=id==='mega-adc'?'A15':['duemilanove-adc','pro-adc'].includes(id)?'A0':'A6',second=['duemilanove-adc','pro-adc'].includes(id)?'A5':'A7',output=id==='mega-adc'?'D44':'D3';
 const wire=(from,to,color='#14b8a6')=>p.wires.push({id:'b'+p.wires.length,from,to,color,points:[]});wire('uno:'+power,pp+':VCC');wire('uno:GND',pp+':GND');wire(pp+':OUT','uno:'+input);if(id!=='mega-adc')wire('uno:'+power,'uno:'+second);
 const led=p.components.find(c=>c.type==='led'),r=p.components.find(c=>c.type==='resistor');if(led&&r){wire('uno:'+output,r.id+':1');wire(r.id+':2',led.id+':A');wire(led.id+':K','uno:GND');}p.settings.probe=output;p.settings.tracePins=id==='mega-adc'?['D53','D13','D2']:['D13','D2','D7'];p.settings.measurement={positive:'uno:'+input,negative:'uno:GND',current:'@led'};return p;}
