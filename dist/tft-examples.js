import {partDefaults} from './part-parameters.js';
export const TFT_EXAMPLES=[{id:'tft-7735',name:'Uno · ST7735 renk ekranı',tag:'128×160 · RGB565 · 74HC4050'},{id:'tft-7789',name:'Uno · ST7789 renk ekranı',tag:'240×240 · SPI / pixel RAM'}];
const code=w=>`#include <SPI.h>
void command(uint8_t c){digitalWrite(8,LOW);digitalWrite(10,LOW);SPI.transfer(c);digitalWrite(10,HIGH);}
void data(uint8_t b){digitalWrite(8,HIGH);digitalWrite(10,LOW);SPI.transfer(b);digitalWrite(10,HIGH);}
void send16(uint16_t v){data(v>>8);data(v);}
void rect(uint16_t x,uint16_t y,uint16_t width,uint16_t height,uint16_t color){command(0x2a);send16(x);send16(x+width-1);command(0x2b);send16(y);send16(y+height-1);command(0x2c);digitalWrite(8,HIGH);digitalWrite(10,LOW);for(uint32_t n=0;n<(uint32_t)width*height;n++){SPI.transfer(color>>8);SPI.transfer(color);}digitalWrite(10,HIGH);}
void setup(){Serial.begin(115200);pinMode(8,OUTPUT);pinMode(9,OUTPUT);pinMode(10,OUTPUT);digitalWrite(10,HIGH);digitalWrite(9,LOW);delay(2);digitalWrite(9,HIGH);delay(125);SPI.begin();SPI.beginTransaction(SPISettings(1000000,MSBFIRST,SPI_MODE0));command(0x11);delay(125);command(0x3a);data(0x55);command(0x36);data(0);command(0x29);rect(0,0,${w},40,0xf800);rect(0,40,${w},40,0x07e0);rect(0,80,${w},40,0x001f);rect(10,10,20,20,0xffff);Serial.println("TFT RGB565 READY");}
void loop(){static uint8_t n=0;rect(10,130,24,12,(n++&1)?0xffe0:0x07ff);delay(300);}
`;
export const TFT_SOURCES={'tft-7735':code(128),'tft-7789':code(240)};
export function makeTFTProject(base,id){const e=TFT_EXAMPLES.find(e=>e.id===id);if(!e)return null;const p=structuredClone(base);p.model=id;p.name=e.name;p.code=TFT_SOURCES[id];delete p.firmware;
 p.components.push({id:'module',type:id==='tft-7735'?'tft7735':'tft7789',x:730,y:290,rotation:0,params:partDefaults(id==='tft-7735'?'tft7735':'tft7789')},{id:'buffer',type:'hc4050',x:625,y:390,rotation:0,params:{}});
 const wire=(from,to,color='#14b8a6')=>p.wires.push({id:'tft'+p.wires.length,from,to,color,points:[]});for(const id of['module','buffer']){wire('uno:3.3V',id+':VCC','#ef4444');wire('uno:GND.1',id+':GND','#64748b');}wire('uno:3.3V','module:BL','#ef4444');[['D13','SCK'],['D11','MOSI'],['D10','CS'],['D8','DC'],['D9','RST']].forEach(([pin,to],i)=>{wire('uno:'+pin,'buffer:A'+(i+1));wire('buffer:Y'+(i+1),'module:'+to,'#3b82f6');});wire('uno:GND.1','buffer:A6','#64748b');p.settings.probe='D13';p.settings.tracePins=['D11','D10','D8'];return p;
}
