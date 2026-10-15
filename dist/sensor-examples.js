import {placeOnBreadboard} from './mounting.js';import {pinPoint} from './geometry.js';
export const SENSOR_EXAMPLES=[{id:'sht31-stretch',name:'Uno · SHT31 clock stretching',tag:'I²C · SCL / SDA / CRC'},{id:'sht31',name:'Uno · SHT31 sıcaklık / nem',tag:'I²C · CRC / conversion'},{id:'bh1750',name:'Uno · BH1750 ışık',tag:'I²C · lux / MTreg'},{id:'mpu6050',name:'Uno · MPU6050 hareket',tag:'I²C · 6 eksen / INT / FIFO'},{id:'mcp23017',name:'Uno · MCP23017 GPIO',tag:'I²C · LED / buton / interrupt'},{id:'sensor-array',name:'Uno · Çoklu sensör',tag:'SHT31 + BH1750 + MPU6050'}];
const COMMON=`#include <Wire.h>
void regWrite(byte address,byte reg,byte value){Wire.beginTransmission(address);Wire.write(reg);Wire.write(value);Wire.endTransmission();}
bool regRead(byte address,byte reg,byte *data,byte n){Wire.beginTransmission(address);Wire.write(reg);if(Wire.endTransmission(false))return false;if(Wire.requestFrom(address,n)!=n)return false;for(byte i=0;i<n;i++)data[i]=Wire.read();return true;}
void busBegin(){Wire.begin();digitalWrite(A4,LOW);digitalWrite(A5,LOW);Wire.setClock(100000);}
`;
const SHT=`byte crc8(byte *b){byte c=255;for(byte i=0;i<2;i++){c^=b[i];for(byte j=0;j<8;j++)c=(c&128)?(byte)((c<<1)^0x31):(byte)(c<<1);}return c;}
void shtCommand(unsigned int c){Wire.beginTransmission(0x44);Wire.write((byte)(c>>8));Wire.write((byte)c);Wire.endTransmission();}
void readSHT(){shtCommand(0x2400);delay(16);if(Wire.requestFrom(0x44,6)!=6){Serial.println("SHT NACK");return;}byte b[6];for(byte i=0;i<6;i++)b[i]=Wire.read();if(crc8(b)!=b[2]||crc8(b+3)!=b[5]){Serial.println("SHT CRC ERROR");return;}unsigned int t=((unsigned int)b[0]<<8)|b[1],h=((unsigned int)b[3]<<8)|b[4];Serial.print("SHT T=");Serial.print(-45+175.0*t/65535,2);Serial.print(" RH=");Serial.println(100.0*h/65535,2);}
`;
const BH=`void lightCommand(byte cmd){Wire.beginTransmission(0x23);Wire.write(cmd);Wire.endTransmission();}
void readLight(){if(Wire.requestFrom(0x23,2)!=2){Serial.println("BH NACK");return;}unsigned int raw=(unsigned int)Wire.read()<<8;raw|=Wire.read();Serial.print("BH LUX=");Serial.println(raw/1.2,1);}
`;
const MPU=`void initMotion(){regWrite(0x68,0x6b,0);regWrite(0x68,0x1a,3);regWrite(0x68,0x19,9);regWrite(0x68,0x37,0x20);regWrite(0x68,0x38,1);}
int16_t motionWord(byte *b,byte i){return ((uint16_t)b[i]<<8)|b[i+1];}
void readMotion(){byte b[14];if(!regRead(0x68,0x3b,b,14)){Serial.println("MPU NACK");return;}Serial.print("MPU A=");for(byte i=0;i<3;i++){Serial.print(motionWord(b,i*2)/16384.0,2);Serial.print(i<2?',':' ');}Serial.print("G=");for(byte i=0;i<3;i++){Serial.print(motionWord(b,8+i*2)/131.0,1);Serial.print(i<2?',':' ');}Serial.print("T=");Serial.print(motionWord(b,6)/340.0+36.53,2);byte status=0;regRead(0x68,0x3a,&status,1);Serial.print(" INT=");Serial.println(status);}
`;
export const SENSOR_SOURCES={
 'sht31-stretch':COMMON+SHT+`void setup(){Serial.begin(115200);busBegin();Wire.setWireTimeout(25000,true);}void loop(){
 shtCommand(0x2c06);unsigned long start=micros();byte count=Wire.requestFrom(0x44,6);unsigned long wait=micros()-start;
 Serial.print("WAIT_US=");Serial.print(wait);Serial.print(" BYTES=");Serial.print(count);
 if(count==6){byte b[6];for(byte i=0;i<6;i++)b[i]=Wire.read();Serial.print(" CRC=");Serial.print(crc8(b)==b[2]&&crc8(b+3)==b[5]?"OK":"ERROR");unsigned int t=((unsigned int)b[0]<<8)|b[1];Serial.print(" T=");Serial.print(-45+175.0*t/65535,2);}
 Serial.println();delay(250);}`,

 sht31:COMMON+SHT+`void setup(){Serial.begin(115200);busBegin();}void loop(){readSHT();delay(250);}`,
 bh1750:COMMON+BH+`void setup(){Serial.begin(115200);busBegin();lightCommand(1);lightCommand(0x10);}void loop(){delay(130);readLight();delay(120);}`,
 mpu6050:COMMON+MPU+`void setup(){Serial.begin(115200);busBegin();pinMode(2,INPUT);initMotion();byte id=0;regRead(0x68,0x75,&id,1);Serial.print("WHO=");Serial.println(id,HEX);}void loop(){delay(100);Serial.print("PIN INT=");Serial.println(digitalRead(2));readMotion();}`,
 mcp23017:COMMON+`void setup(){Serial.begin(115200);busBegin();pinMode(2,INPUT);regWrite(0x20,0x00,0x7e);regWrite(0x20,0x01,0x7f);regWrite(0x20,0x0c,2);regWrite(0x20,0x04,2);regWrite(0x20,0x0a,0x40);}void loop(){static bool led=false;led=!led;regWrite(0x20,0x14,led?1:0);delay(20);byte flags=0,value=0;if(!regRead(0x20,0x0e,&flags,1)||!regRead(0x20,0x12,&value,1)){Serial.println("MCP NACK");delay(250);return;}Serial.print("GPIO=");Serial.print(value,HEX);Serial.print(" INTF=");Serial.print(flags,HEX);Serial.print(" IRQ=");Serial.println(digitalRead(2));delay(230);}`,
 'sensor-array':COMMON+SHT+BH+MPU+`void setup(){Serial.begin(115200);busBegin();lightCommand(0x10);initMotion();}void loop(){delay(130);readSHT();readLight();readMotion();delay(120);}`
};
export function makeSensorProject(base,id){const p=structuredClone(base);p.model=id;p.name=SENSOR_EXAMPLES.find(t=>t.id===id).name;p.code=SENSOR_SOURCES[id];delete p.firmware;
const part=(type,name,params={},x=720,y=460)=>{const c={id:name,type,x,y,rotation:0,params};p.components.push(c);return c;};
const wire=(from,to,color='#14b8a6')=>p.wires.push({id:'sensor'+p.wires.length,from,to,color,points:[]});
const bus=(c,supply='3.3V',vcc='VCC',gnd='GND')=>{wire('uno:'+supply,c.id+':'+vcc,'#ef4444');wire('uno:GND.1',c.id+':'+gnd,'#64748b');wire('uno:A4',c.id+':SDA','#3b82f6');wire('uno:A5',c.id+':SCL','#f59e0b');};
if(id==='sht31'||id==='sht31-stretch'||id==='sensor-array'){const c=part('sht31','climate',{temperature:25,humidity:50},565,445);bus(c,'3.3V','VIN');wire('climate:ADDR','uno:GND.2','#64748b');}
if(id==='bh1750'||id==='sensor-array'){const c=part('bh1750','light',{lux:500},id==='sensor-array'?710:640,445);bus(c);wire('light:ADDR','uno:GND.2','#64748b');}
if(id==='mpu6050'||id==='sensor-array'){const c=part('mpu6050','motion',{ax:0,ay:0,az:1,gx:0,gy:0,gz:0,temperature:25},id==='sensor-array'?830:640,445);bus(c);wire('motion:AD0','uno:GND.2','#64748b');wire('motion:INT','uno:D2','#8b5cf6');}
if(id==='mcp23017'){const c=part('mcp23017','io');placeOnBreadboard(p,c,'bb');bus(c,'5V','VDD','VSS');for(const pin of ['A0','A1','A2'])wire('io:'+pin,'uno:GND.2','#64748b');wire('io:RESET','uno:5V','#ef4444');wire('io:INTA','uno:D2','#8b5cf6');
 const button=part('button','button',{pressed:false},900,445);placeOnBreadboard(p,button,'bb');wire('button:1','io:GPA1','#14b8a6');wire('button:2','uno:GND.2','#64748b');
 const r=part('resistor','limit',{ohms:330},550,445),led=part('led','led',{color:'red'},650,445);wire('io:GPA0','limit:1','#14b8a6');wire('limit:2','led:A','#ef4444');wire('led:K','uno:GND.2','#64748b');
 for(const [pin,n]of [['SDA','data'],['SCL','clock']]){const r=part('resistor','pull-'+n,{ohms:4700},870,n==='data'?550:580);wire('pull-'+n+':1','uno:5V','#ef4444');wire('pull-'+n+':2','io:'+pin,pin==='SDA'?'#3b82f6':'#f59e0b');}
 p.settings.measurement={positive:'io:GPA0',negative:'io:VSS',current:'io:GPA0'};
}
for(const [i,w]of p.wires.entries()){const a=pinPoint(p,w.from),b=pinPoint(p,w.to),lane=620+(i%12)*12;w.points=[{x:a.x,y:lane},{x:b.x,y:lane}];}return p;}
