import {readFile,writeFile} from 'node:fs/promises';import{fileURLToPath}from'node:url';import{buildProjectFirmware}from'../dist/gcc-project.js';
globalThis.window={};const nf=fetch;globalThis.fetch=async(u,o)=>String(u).startsWith('file:')?new Response(await readFile(fileURLToPath(u)),{headers:{'Content-Type':String(u).endsWith('.wasm')?'application/wasm':'application/octet-stream'}}):nf(u,o);
const code=`const byte pwmPins[]={2,3,4,5,6,7,8,9,10,11,12,13,44,45,46};
void setup(){Serial.begin(115200);for(byte i=0;i<15;i++)analogWrite(pwmPins[i],128);pinMode(A6,OUTPUT);pinMode(A7,OUTPUT);digitalWrite(A6,HIGH);digitalWrite(A7,HIGH);}
void loop(){Serial.print("A6=");Serial.print(analogRead(A6));Serial.print(" A7=");Serial.println(analogRead(A7));delay(100);}`;
const result=await buildProjectFirmware([{name:'sketch.ino',content:code}],{board:'mega',assetsBase:new URL('../research/compiler/node_modules/@horang-corp/avr-gcc-wasm/',import.meta.url).href});await writeFile(new URL('../tests/fixtures/mega-pwm.json',import.meta.url),JSON.stringify({code,result},null,2));console.log(JSON.stringify({flash:result.flashBytes,ram:result.staticRamBytes}));
