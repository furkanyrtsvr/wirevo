import {pinPoint} from './geometry.js';
export const ACQUISITION_EXAMPLES=[{id:'adc-acquisition-low',name:'Uno · ADC düşük empedans',tag:'MCP3008 · 1 kΩ / acquisition'},{id:'adc-acquisition-high',name:'Uno · ADC yüksek empedans',tag:'MCP3008 · 100 kΩ / acquisition'}];
export const ACQUISITION_SOURCE=`#include <SPI.h>
unsigned int readADC(byte channel,unsigned long hz){SPI.beginTransaction(SPISettings(hz,MSBFIRST,SPI_MODE0));digitalWrite(10,LOW);SPI.transfer(1);byte h=SPI.transfer(0x80|(channel<<4));byte l=SPI.transfer(0);digitalWrite(10,HIGH);SPI.endTransaction();return ((h&3)<<8)|l;}
void setup(){Serial.begin(115200);pinMode(10,OUTPUT);digitalWrite(10,HIGH);SPI.begin();}
void loop(){for(byte i=0;i<3;i++){unsigned long hz=i==0?1000000:i==1?125000:4000000;readADC(1,hz);unsigned int value=readADC(0,hz);Serial.print("HZ=");Serial.print(hz);Serial.print(" CH0=");Serial.println(value);}delay(250);}`;
export function makeAcquisitionProject(base,id){const p=structuredClone(base);p.model=id;p.name=ACQUISITION_EXAMPLES.find(e=>e.id===id).name;p.code=ACQUISITION_SOURCE;delete p.firmware;p.components.find(c=>c.id==='pot1').params.value=50;
 p.wires=p.wires.filter(w=>w.from!=='pot1:OUT'&&w.to!=='adc:CH0');const r={id:'source-r',type:'resistor',x:940,y:510,rotation:0,params:{ohms:id.endsWith('high')?100000:1000}};p.components.push(r);
 for(const [i,from,to]of [[0,'pot1:OUT','source-r:1'],[1,'source-r:2','adc:CH0']]){const a=pinPoint(p,from),b=pinPoint(p,to);p.wires.push({id:'acquire-'+i,from,to,color:'#14b8a6',points:[{x:a.x,y:755+i*13},{x:b.x,y:755+i*13}]});}return p;
}
