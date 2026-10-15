import {placeOnBreadboard} from './mounting.js';
import {pinPoint} from './geometry.js';
export const EXPANDED_EXAMPLES=[{id:'lcd8',name:'Uno · LCD 8×2',tag:'I²C · PCF8574 / HD44780'},{id:'lcd16',name:'Uno · LCD 16×2 / sıcaklık',tag:'TMP36 → ADC → I²C'},{id:'matrix8',name:'Uno · SPI LED matris',tag:'MAX7219 · 8×8'},{id:'digits8',name:'Uno · SPI sekiz hane',tag:'MAX7219 · Code-B'},{id:'bmp280',name:'Uno · Basınç / sıcaklık',tag:'BMP280 · I²C / compensation'},{id:'spi-adc',name:'Uno · SPI ADC',tag:'MCP3008 · 10 bit / CH0'},{id:'onewire',name:'Uno · 1-Wire sıcaklık',tag:'DS18B20 · CRC / 12 bit'},{id:'co2',name:'Uno · UART CO₂',tag:'MH-Z19B · 9600 / checksum'},{id:'light',name:'Uno · Işık / analog',tag:'LDR · gerilim bölücü'},{id:'opamp',name:'Uno · Opamp kazanç',tag:'Opamp · iki kanal / ADC'},{id:'rc',name:'Uno · RC şarj',tag:'100 μF / 1 kΩ · transient'},{id:'rl',name:'Uno · RL akımı',tag:'100 mH / 100 Ω · transient'}];
const LCD_SOURCE=columns=>`#include <Wire.h>
const byte LCD=0x27;
void nibble(byte n, byte rs=0) { byte v=(n<<4)|8|rs; Wire.beginTransmission(LCD); Wire.write(v|4); Wire.write(v); Wire.endTransmission(); delayMicroseconds(50); }
void send(byte v,byte rs=0) { nibble(v>>4,rs); nibble(v&15,rs); }
void text(const char *s) { while(*s) send(*s++,1); }
void setup() { Serial.begin(115200);Wire.begin();delay(50);nibble(3);delay(5);nibble(3);delay(1);nibble(3);nibble(2);send(0x28);send(0x0c);send(6);send(1);delay(2);send(0x80);text("${columns===8?'CF 8x2':'CircuitForge'}"); }
void loop() { send(0xc0);char buffer[${columns+1}];${columns===8?'snprintf(buffer,sizeof(buffer),"%8lu",millis()/1000);':'int adc=analogRead(A0);float temp=(adc*5.0/1024.0-.5)*100; char value[8];dtostrf(temp,5,1,value);snprintf(buffer,sizeof(buffer),"Temp %s C   ",value);'}text(buffer);Serial.println(buffer);delay(500); }
`;
const MAX_SOURCE=matrix=>`#include <SPI.h>
const byte CS=10;
void reg(byte address,byte value) { SPI.beginTransaction(SPISettings(1000000,MSBFIRST,SPI_MODE0));digitalWrite(CS,LOW);SPI.transfer(address);SPI.transfer(value);digitalWrite(CS,HIGH);SPI.endTransaction(); }
void setup(){Serial.begin(115200);pinMode(CS,OUTPUT);digitalWrite(CS,HIGH);SPI.begin();reg(15,0);reg(9,${matrix?0:255});reg(10,5);reg(11,7);reg(12,1);}
void loop(){unsigned long count=millis()/250;${matrix?'for(byte row=1;row<=8;row++)reg(row,1<<((row+count)&7));Serial.print("MATRIX ");':'unsigned long number=count;for(byte digit=1;digit<=8;digit++){reg(digit,number%10);number/=10;}Serial.print("DIGITS ");'}Serial.println(count);delay(250);}
`;
const BMP_SOURCE=`#include <Wire.h>
const byte SENSOR=0x76;
void writeReg(byte r,byte v){Wire.beginTransmission(SENSOR);Wire.write(r);Wire.write(v);Wire.endTransmission();}
void readReg(byte r,byte *b,byte n){Wire.beginTransmission(SENSOR);Wire.write(r);Wire.endTransmission(false);Wire.requestFrom(SENSOR,n);for(byte i=0;i<n;i++)b[i]=Wire.available()?Wire.read():0;}
uint16_t word(byte *b,byte i){return b[i]|((uint16_t)b[i+1]<<8);}
uint16_t t1,p1;int16_t t2,t3,p2,p3,p4,p5,p6,p7,p8,p9;
void setup(){Serial.begin(115200);Wire.begin();byte id;readReg(0xd0,&id,1);Serial.print("BMP ID=");Serial.println(id,HEX);byte c[24];readReg(0x88,c,24);t1=word(c,0);t2=word(c,2);t3=word(c,4);p1=word(c,6);p2=word(c,8);p3=word(c,10);p4=word(c,12);p5=word(c,14);p6=word(c,16);p7=word(c,18);p8=word(c,20);p9=word(c,22);}
void loop(){writeReg(0xf4,0x25);delay(20);byte b[6];readReg(0xf7,b,6);long rawP=((long)b[0]<<12)|((long)b[1]<<4)|(b[2]>>4),rawT=((long)b[3]<<12)|((long)b[4]<<4)|(b[5]>>4);float v1=(rawT/16384.0-t1/1024.0)*t2,v2=(rawT/131072.0-t1/8192.0);v2=v2*v2*t3;float fine=v1+v2,temp=fine/5120.0,a=fine/2.0-64000.0,c=a*a*p6/32768.0+a*p5*2.0;c=c/4.0+p4*65536.0;a=(p3*a*a/524288.0+p2*a)/524288.0;a=(1.0+a/32768.0)*p1;float pressure=(1048576.0-rawP-c/4096.0)*6250.0/a;pressure+=(p9*pressure*pressure/2147483648.0+pressure*p8/32768.0+p7)/16.0;Serial.print("T=");Serial.print(temp,2);Serial.print(" P=");Serial.println(pressure/100.0,2);delay(500);}
`;
const ADC_SOURCE=`#include <SPI.h>
const byte CS=10;
void setup(){Serial.begin(115200);pinMode(CS,OUTPUT);digitalWrite(CS,HIGH);SPI.begin();}
void loop(){SPI.beginTransaction(SPISettings(1000000,MSBFIRST,SPI_MODE0));digitalWrite(CS,LOW);SPI.transfer(1);byte high=SPI.transfer(0x80);byte low=SPI.transfer(0);digitalWrite(CS,HIGH);SPI.endTransaction();unsigned int value=((high&3)<<8)|low;Serial.print("MCP CH0=");Serial.println(value);delay(250);}
`;
const ONE_SOURCE=`const byte DQ=2;
bool resetBus(){noInterrupts();pinMode(DQ,OUTPUT);digitalWrite(DQ,LOW);delayMicroseconds(480);pinMode(DQ,INPUT);delayMicroseconds(70);bool present=!digitalRead(DQ);delayMicroseconds(410);interrupts();return present;}
void writeSlot(bool bit){noInterrupts();pinMode(DQ,OUTPUT);digitalWrite(DQ,LOW);delayMicroseconds(bit?6:60);pinMode(DQ,INPUT);delayMicroseconds(bit?64:10);interrupts();}
bool readSlot(){noInterrupts();pinMode(DQ,OUTPUT);digitalWrite(DQ,LOW);delayMicroseconds(6);pinMode(DQ,INPUT);delayMicroseconds(9);bool bit=digitalRead(DQ);delayMicroseconds(55);interrupts();return bit;}
void writeByte(byte b){for(byte i=0;i<8;i++){writeSlot(b&1);b>>=1;}}
byte readByte(){byte b=0;for(byte i=0;i<8;i++)if(readSlot())b|=1<<i;return b;}
byte crc(byte *b,byte n){byte c=0;for(byte i=0;i<n;i++){byte v=b[i];for(byte j=0;j<8;j++){byte mix=(c^v)&1;c>>=1;if(mix)c^=0x8c;v>>=1;}}return c;}
void setup(){Serial.begin(115200);pinMode(DQ,INPUT);}
void loop(){if(!resetBus()){Serial.println("NO DS18B20");delay(500);return;}writeByte(0xcc);writeByte(0x44);delay(800);resetBus();writeByte(0xcc);writeByte(0xbe);byte scratch[9];for(byte i=0;i<9;i++)scratch[i]=readByte();if(crc(scratch,8)!=scratch[8])Serial.println("CRC ERROR");else{int16_t value=scratch[0]|((uint16_t)scratch[1]<<8);Serial.print("DS T=");Serial.println(value/16.0,2);}delay(200);}
`;
const CO2_SOURCE=`void setup(){Serial.begin(9600);}
void loop(){const byte command[9]={255,1,0x86,0,0,0,0,0,0x79};while(Serial.available())Serial.read();Serial.write(command,9);byte b[9]={0};unsigned long start=millis();byte n=0;while(n<9&&millis()-start<250)if(Serial.available())b[n++]=Serial.read();byte sum=0;for(byte i=1;i<8;i++)sum+=b[i];if(n==9&&b[0]==255&&b[1]==0x86&&b[8]==(byte)(256-sum)){Serial.print("CO2=");Serial.println(((uint16_t)b[2]<<8)|b[3]);}else Serial.println("CO2 TIMEOUT / CRC");delay(500);}
`;
const ANALOG_SOURCE=`void setup(){Serial.begin(115200);}
void loop(){Serial.print("ADC=");Serial.println(analogRead(A0));delay(100);}
`;
const REACTIVE_SOURCE=`void setup(){Serial.begin(115200);pinMode(7,OUTPUT);digitalWrite(7,LOW);delay(100);}
void loop(){digitalWrite(7,HIGH);for(byte i=0;i<20;i++){Serial.print("UP ");Serial.println(analogRead(A0));delay(10);}digitalWrite(7,LOW);for(byte i=0;i<20;i++){Serial.print("DOWN ");Serial.println(analogRead(A0));delay(10);}}
`;
export const EXPANDED_SOURCES={lcd8:LCD_SOURCE(8),lcd16:LCD_SOURCE(16),matrix8:MAX_SOURCE(true),digits8:MAX_SOURCE(false),bmp280:BMP_SOURCE,'spi-adc':ADC_SOURCE,onewire:ONE_SOURCE,co2:CO2_SOURCE,light:ANALOG_SOURCE,opamp:ANALOG_SOURCE,rc:REACTIVE_SOURCE,rl:REACTIVE_SOURCE};
export function makeExpandedProject(base,id){const definition=EXPANDED_EXAMPLES.find(e=>e.id===id);if(!definition)return null;const p=structuredClone(base);p.model=id;p.name=definition.name;p.code=EXPANDED_SOURCES[id];delete p.firmware;const part=(type,name=type,params={},x=630,y=450)=>{const c={id:name,type,x,y,rotation:0,params};p.components.push(c);return c;};
 const wire=(from,to,color='#14b8a6')=>{const a=pinPoint(p,from),b=pinPoint(p,to),i=p.wires.length,lane=620+(i%8)*13;p.wires.push({id:'ext'+i,from,to,color,points:[{x:a.x,y:lane},{x:b.x,y:lane}]});};
 const power=(c,vcc='VCC',gnd='GND',supply='5V')=>{wire('uno:'+supply,c.id+':'+vcc,'#ef4444');wire('uno:GND.1',c.id+':'+gnd,'#64748b');};
 if(id.startsWith('lcd')){const c=part(id,'display',{address:39},540,440);power(c);wire('uno:A4','display:SDA','#3b82f6');wire('uno:A5','display:SCL','#f59e0b');if(id==='lcd16'){const sensor=part('tmp36','temp',{temperature:25},880,215);power(sensor);wire('temp:OUT','uno:A0','#8b5cf6');placeOnBreadboard(p,sensor,'bb');}}
 else if(id==='matrix8'||id==='digits8'){const c=part(id,'display',{},520,460);power(c);for(const[pin,to,color]of [['DIN','D11','#3b82f6'],['CLK','D13','#f59e0b'],['CS','D10','#14b8a6']])wire('uno:'+to,'display:'+pin,color);}
 else if(id==='bmp280'){const c=part(id,'pressure',{temperature:25,pressure:1013.25});power(c,'VCC','GND','3.3V');wire('pressure:CSB','uno:3.3V','#ef4444');wire('pressure:SDO','uno:GND.2','#64748b');wire('uno:A4','pressure:SDI','#3b82f6');wire('uno:A5','pressure:SCK','#f59e0b');}
 else if(id==='spi-adc'){const c=part('mcp3008','adc');power(c,'VDD','DGND');wire('adc:AGND','uno:GND.2','#64748b');wire('adc:VREF','uno:5V','#ef4444');for(const[pin,to,color]of [['DIN','D11','#3b82f6'],['DOUT','D12','#8b5cf6'],['CLK','D13','#f59e0b'],['CS','D10','#14b8a6']])wire('uno:'+to,'adc:'+pin,color);const pot=part('pot','pot1',{value:60},850,470);power(pot);wire('pot1:OUT','adc:CH0','#14b8a6');for(let i=1;i<8;i++)wire('adc:CH'+i,'uno:GND.2','#64748b');placeOnBreadboard(p,c,'bb');}
 else if(id==='onewire'){const c=part('ds18b20','temp',{temperature:25});power(c,'VDD');wire('temp:DQ','uno:D2','#3b82f6');const pull=part('resistor','pull',{ohms:4700},780,475);wire('pull:1','uno:5V','#ef4444');wire('pull:2','temp:DQ','#3b82f6');placeOnBreadboard(p,c,'bb');}
 else if(id==='co2'){const c=part('mhz19','air',{ppm:800});power(c);wire('air:RX','uno:D1','#3b82f6');wire('air:TX','uno:D0','#8b5cf6');}
 else if(id==='light'){const c=part('ldr','light',{lux:100});const r=part('resistor','divider',{ohms:10000},800,460);wire('uno:5V','light:1','#ef4444');wire('light:2','divider:1','#3b82f6');wire('light:2','uno:A0','#3b82f6');wire('divider:2','uno:GND.1','#64748b');placeOnBreadboard(p,c,'bb');}
 else if(id==='opamp'){const c=part('opamp','amp');power(c,'V+','V-');const sensor=part('tmp36','temp',{temperature:25},800,475);power(sensor);wire('temp:OUT','amp:IN1+','#3b82f6');wire('amp:OUT1','uno:A0','#8b5cf6');const upper=part('resistor','feedback',{ohms:10000},650,490),lower=part('resistor','gain',{ohms:10000},650,530);wire('amp:OUT1','feedback:1','#14b8a6');wire('feedback:2','amp:IN1-','#14b8a6');wire('amp:IN1-','gain:1','#f59e0b');wire('gain:2','uno:GND.1','#64748b');wire('amp:IN2+','uno:GND.2','#64748b');wire('amp:IN2-','amp:OUT2','#14b8a6');placeOnBreadboard(p,c,'bb');}
 else if(id==='rc'||id==='rl'){const r=part('resistor','r1',{ohms:id==='rc'?1000:100},580,450),reactive=part(id==='rc'?'capacitor':'inductor','reactive',id==='rc'?{farads:.0001,esr:1}:{henries:.1,dcr:1},770,470);wire('uno:D7','r1:1','#14b8a6');wire('r1:2','reactive:1','#3b82f6');wire('reactive:1','uno:A0','#3b82f6');wire('reactive:2','uno:GND.1','#64748b');p.settings.measurement={positive:'reactive:1',negative:'reactive:2',current:'reactive:i'};p.settings.scopeMode='dc';}
 for(const w of p.wires){const a=pinPoint(p,w.from),b=pinPoint(p,w.to);w.points=[{x:a.x,y:620+(p.wires.indexOf(w)%8)*13},{x:b.x,y:620+(p.wires.indexOf(w)%8)*13}];}return p;}
