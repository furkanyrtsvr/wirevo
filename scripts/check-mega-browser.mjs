import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import {buildProjectFirmware} from '../dist/gcc-project.js';
globalThis.window={};const nativeFetch=fetch;globalThis.fetch=async(u,o)=>String(u).startsWith('file:')?new Response(await readFile(fileURLToPath(u)),{headers:{'Content-Type':String(u).endsWith('.wasm')?'application/wasm':'application/octet-stream'}}):nativeFetch(u,o);
const assetsBase=new URL('../research/compiler/node_modules/@horang-corp/avr-gcc-wasm/',import.meta.url).href;
const code=`#include <Arduino.h>
#if !defined(__AVR_ATmega2560__) || !defined(ARDUINO_AVR_MEGA2560)
#error Wrong board
#endif
volatile byte big[3000];
void setup(){Serial.begin(115200);Serial1.begin(9600);Serial2.begin(19200);Serial3.begin(38400);pinMode(53,OUTPUT);digitalWrite(53,HIGH);analogWrite(44,128);}
void loop(){big[2999]=7;Serial.print("A15=");Serial.println(analogRead(A15));Serial1.write('A');Serial2.write('B');Serial3.write('C');delay(100);}`;
const r=await buildProjectFirmware([{name:'sketch.ino',content:code}],{board:'mega',assetsBase,onProgress:console.log});console.log(JSON.stringify({...r,hex:undefined}));await writeFile(new URL('../tests/fixtures/mega-browser.json',import.meta.url),JSON.stringify({code,result:r},null,2));

const {Mega2560Runtime}=await import('../src/mega2560-runtime.js');
const serial=['','','',''];const runtime=new Mega2560Runtime(r.hex,{onSerial:(p,b)=>serial[p]+=String.fromCharCode(b)});runtime.adc.channelValues[15]=2.5;runtime.stepCycles(4000000);
if(!serial[0].includes('A15=512')||!serial[1].startsWith('AA')||!serial[2].startsWith('BB')||!serial[3].startsWith('CC')||runtime.ports.B.pinState(0)!==1)throw Error('WASM Mega runtime acceptance failed');console.log(JSON.stringify({serial}));
const {libraryManifest}=await import('../dist/libraries.js');
const libraryCode=`#include <Arduino.h>
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_SSD1306.h>
Adafruit_SSD1306 oled(128,64,&Wire,-1);
void setup(){Serial.begin(115200);Wire.begin();SPI.begin();oled.begin(SSD1306_SWITCHCAPVCC,0x3c);oled.clearDisplay();oled.setTextSize(1);oled.print("MEGA");oled.display();Serial.println("LIBS OK");}
void loop(){}`;
const libResult=await buildProjectFirmware([{name:'sketch.ino',content:libraryCode}],{board:'mega',assetsBase,libraries:libraryManifest([{id:'ssd1306',version:'2.5.16'}])});if(!libResult.fitsRam||!libResult.fitsTarget)throw Error('Mega library capacity');console.log(JSON.stringify({libraries:{flash:libResult.flashBytes,ram:libResult.staticRamBytes,objects:libResult.libraryArchiveObjects}}));
for(const board of ['duemilanove','pro']){const macro=board==='pro'?'PRO':'DUEMILANOVE';const source=`#include <Arduino.h>
#if !defined(ARDUINO_AVR_${macro}) || NUM_ANALOG_INPUTS != 6
#error Wrong board
#endif
void setup(){Serial.begin(115200);Serial.println("${board} OK");pinMode(13,OUTPUT);digitalWrite(13,HIGH);}
void loop(){}`;const built=await buildProjectFirmware([{name:'sketch.ino',content:source}],{board,assetsBase});if(!built.fitsRam||!built.fitsTarget)throw Error(board+' capacity');console.log(JSON.stringify({board,flash:built.flashBytes,ram:built.staticRamBytes}));}
const farFiles=[{name:'sketch.ino',content:'#include <Arduino.h>\n'+Array.from({length:5},(_,i)=>`extern const byte block${i}[30000] PROGMEM;`).join('\n')+'\nvoid setup(){Serial.begin(115200);'+Array.from({length:5},(_,i)=>`Serial.println(pgm_read_byte_far(pgm_get_far_address(block${i})));`).join('')+'}\nvoid loop(){}'},...Array.from({length:5},(_,i)=>({name:`block${i}.cpp`,content:`#include <Arduino.h>\nextern const byte block${i}[30000] PROGMEM = {77};`}))];
const farResult=await buildProjectFirmware(farFiles,{board:'mega',assetsBase,libraries:libraryManifest([])});if(farResult.flashBytes<131072||!farResult.fitsTarget)throw Error('Mega far flash not linked');const farSerial=['','','',''];const farRuntime=new Mega2560Runtime(farResult.hex,{onSerial:(p,b)=>farSerial[p]+=String.fromCharCode(b)});farRuntime.stepCycles(2000000);if(farSerial[0]!=='77\r\n'.repeat(5))throw Error('WASM far flash ELPM failed: '+farSerial[0]);console.log(JSON.stringify({farFlash:farResult.flashBytes,serial:farSerial[0]}));
