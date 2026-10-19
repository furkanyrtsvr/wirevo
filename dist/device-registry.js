import {BME680,VL53L0X} from './expansion-gas-tof.js';
import {PN532} from './expansion-nfc.js';
import {BME280,INA226,TCS34725,MAX30102} from './expansion-sensors.js';
import {EXPANSION_I2C} from './expansion-i2c.js';
import {INA219} from './ina219.js';
import {CharacterLCD} from './lcd-controller.js';
import {BMP280} from './bmp280.js';
import {EEPROM24LC256,DS1307} from './i2c-devices.js';
import {SSD1306} from './ssd1306.js';
import {SHT31} from './sht31.js';import {BH1750} from './bh1750.js';import {MPU6050} from './mpu6050.js';import {MCP23017} from './mcp23017.js';
import {logic} from './bus-electrical.js';
// One electrical/controller contract shared by canonical DC nets and TWI.
// New transports can register their own descriptors without changing net identity.
const strap=(value,supply)=>logic(value,supply),binary=(v,pin,supply)=>strap(v(pin),supply);
const addressStrap=(pin,low,high)=>(v,supply)=>{const bit=binary(v,pin,supply);return{address:bit?high:low,valid:bit!==null};};
const basic=(create,min=3,max=5.5,pullup=4700)=>({bus:'I2C',create,power:{vcc:'VCC',gnd:'GND',min,max},pins:{data:'SDA',clock:'SCL'},pullup,maxFrequency:400000,configuration:()=>({valid:true})});
export const DEVICE_REGISTRY={...EXPANSION_I2C,
 bme680:{...basic(()=>new BME680(),1.8,3.6),defaultAddress:118,configuration:addressStrap('ADDR',118,119)},
 vl53l0x:{...basic(()=>new VL53L0X(),2.7,3.6),defaultAddress:41,configuration:(v,s)=>({valid:Number.isFinite(v('XSHUT')),resetAsserted:v('XSHUT')<.3*s})},
 pn532:{...basic(()=>new PN532(),2.7,3.6),defaultAddress:36,configuration:(v,s)=>({valid:Number.isFinite(v('RST')),resetAsserted:v('RST')<.3*s})},
 bme280:{...basic(()=>new BME280(),1.8,3.6),defaultAddress:118,configuration:addressStrap('ADDR',118,119)},
 ina226:{...basic(()=>new INA226(),2.7,3.6),defaultAddress:64,configuration:(v,s)=>{const b=['A0','A1'].map(p=>binary(v,p,s));return{valid:b.every(x=>x!==null),address:64+(b[0]?1:0)+(b[1]?4:0)};},update:(v,c)=>c.setAnalog(v)},
 tcs34725:{...basic(()=>new TCS34725(),2.7,3.6),defaultAddress:41},
 max30102:{...basic(()=>new MAX30102(),2.7,3.6),defaultAddress:87},
 ina219:{...basic(()=>new INA219(),3,5.5,0),defaultAddress:64,ioMargin:.3,configuration:(v,supply,nets,id)=>{const pick=pin=>{if(nets.same(id+':'+pin,id+':SDA'))return 2;if(nets.same(id+':'+pin,id+':SCL'))return 3;const val=v(pin);if(!Number.isFinite(val))return null;return val<=.3*supply?0:val>=.7*supply?1:null;};const a=pick('A0'),b=pick('A1');return{address:64+(b??0)*4+(a??0),valid:a!==null&&b!==null};},update:(v,controller)=>controller.setAnalog(v('VIN+'),v('VIN-'),v('GND'))},
 oled:{...basic(()=>new SSD1306()),writeOnly:true,defaultAddress:60,addressParameter:true},
 rtc:{...basic(()=>new DS1307(),4.5),defaultAddress:104,maxFrequency:100000},
 eeprom:{...basic(()=>new EEPROM24LC256(),2.5,5.5,0),defaultAddress:80,configuration:(v,supply)=>{const bits=['A0','A1','A2'].map(p=>binary(v,p,supply));return{address:80|bits.reduce((n,b,i)=>n|(b?1<<i:0),0),valid:bits.every(b=>b!==null),writeProtected:binary(v,'WP',supply)!==false};}},
 lcd20:{...basic(()=>new CharacterLCD(20,4),2.7),defaultAddress:39,addressParameter:true,maxFrequency:100000},
 lcd8:{...basic(()=>new CharacterLCD(8),2.7),defaultAddress:39,addressParameter:true,maxFrequency:100000},
 lcd16:{...basic(()=>new CharacterLCD(16),2.7),defaultAddress:39,addressParameter:true,maxFrequency:100000},
 bmp280:{...basic(()=>new BMP280(),1.71,3.6),pins:{data:'SDI',clock:'SCK'},defaultAddress:118,configuration:(v,supply)=>({...addressStrap('SDO',118,119)(v,supply),valid:binary(v,'CSB',supply)===true&&binary(v,'SDO',supply)!==null})},
 sht31:{...basic(()=>new SHT31(),2.15),power:{vcc:'VIN',gnd:'GND',min:2.15,max:5.5},defaultAddress:68,maxFrequency:1000000,parameters:['temperature','humidity'],configuration:addressStrap('ADDR',68,69),unsupportedPins:['ALERT']},
 bh1750:{...basic(()=>new BH1750(),2.4,3.6),defaultAddress:35,ioMargin:.5,parameters:['lux'],configuration:addressStrap('ADDR',35,92)},
 mpu6050:{...basic(()=>new MPU6050(),2.375,3.46),defaultAddress:104,ioMargin:.5,parameters:['temperature','ax','ay','az','gx','gy','gz'],configuration:addressStrap('AD0',104,105),drivenPins:['INT'],unsupportedPins:['XDA','XCL']},
 mcp23017:{...basic(()=>new MCP23017(),1.8,5.5,0),power:{vcc:'VDD',gnd:'VSS',min:1.8,max:5.5},defaultAddress:32,maxFrequency:s=>s>=4.5?1700000:s>=2.7?400000:100000,configuration:(v,supply)=>{const bits=['A0','A1','A2'].map(p=>binary(v,p,supply));return{address:32|bits.reduce((n,b,i)=>n|(b?1<<i:0),0),valid:bits.every(b=>b!==null),resetAsserted:binary(v,'RESET',supply)!==true};},drivenPins:[...Array.from({length:16},(_,i)=>'GP'+(i<8?'A':'B')+(i&7)),'INTA','INTB'],outputOnly:['GPA7','GPB7']}
};
export const deviceDefinition=type=>DEVICE_REGISTRY[type];
