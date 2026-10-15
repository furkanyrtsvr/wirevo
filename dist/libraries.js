export const TOOLCHAIN='@horang-corp/avr-gcc-wasm@0.2.0';
export const LIBRARIES=[
 {id:'software-serial',name:'SoftwareSerial',version:'1.0',dependencies:[],roots:[],includes:['/software-serial'],objects:[],source:'./notices/arduino-avr-1.8.7-source.tar.bz2',license:'LGPL-2.1-or-later',licenseUrl:'./notices/FIRMWARE-NOTICES.md',headers:['SoftwareSerial.h']},
 {id:'wire',name:'Wire',version:'1.0',dependencies:[],roots:['/arduino/libraries/Wire/src'],includes:['/arduino/libraries/Wire/src','/arduino/libraries/Wire/src/utility'],objects:['lib_Wire.o','lib_twi.o'],source:'./notices/arduino-avr-1.8.7-source.tar.bz2',license:'LGPL-2.1-or-later',licenseUrl:'./notices/FIRMWARE-NOTICES.md',headers:['Wire.h']},
 {id:'spi',name:'SPI',version:'1.0',dependencies:[],roots:['/arduino/libraries/SPI/src'],includes:['/arduino/libraries/SPI/src'],objects:['lib_SPI.o'],source:'./notices/arduino-avr-1.8.7-source.tar.bz2',license:'GPL-2.0 / LGPL-2.1',licenseUrl:'./notices/FIRMWARE-NOTICES.md',headers:['SPI.h']},
 {id:'busio',name:'Adafruit BusIO',version:'1.17.4',dependencies:['wire','spi'],roots:['/libraries/Adafruit_BusIO'],includes:['/libraries/Adafruit_BusIO'],objects:['lib_BusIO_Register.o','lib_I2CDevice.o','lib_SPIDevice.o'],source:'./notices/Adafruit-BusIO-1.17.4-source.zip',license:'MIT',licenseUrl:'./notices/ADAFRUIT-BUSIO-LICENSE.txt',headers:['Adafruit_I2CDevice.h','Adafruit_SPIDevice.h','Adafruit_BusIO_Register.h']},
 {id:'gfx',name:'Adafruit GFX',version:'1.12.6',dependencies:['busio'],roots:['/libraries/Adafruit_GFX_Library'],includes:['/libraries/Adafruit_GFX_Library'],objects:['lib_GFX.o'],source:'./notices/Adafruit-GFX-1.12.6-source.zip',license:'BSD',licenseUrl:'./notices/ADAFRUIT-GFX-LICENSE.txt',headers:['Adafruit_GFX.h','gfxfont.h']},
 {id:'ssd1306',name:'Adafruit SSD1306',version:'2.5.16',dependencies:['gfx','wire','spi'],roots:['/libraries/Adafruit_SSD1306'],includes:['/libraries/Adafruit_SSD1306'],objects:['lib_SSD1306.o'],source:'./notices/Adafruit-SSD1306-2.5.16-source.zip',license:'BSD',licenseUrl:'./notices/ADAFRUIT-SSD1306-LICENSE.txt',headers:['Adafruit_SSD1306.h']},
];
const byID=new Map(LIBRARIES.map(l=>[l.id,l]));
export function libraryManifest(requested=[]){
 if(!Array.isArray(requested)||requested.length>LIBRARIES.length)throw Error('Kütüphane seçimi geçersiz.');
 const roots=[],seen=new Set();for(const item of requested){const lib=byID.get(item?.id);if(!lib||item.version!==lib.version||seen.has(lib.id))throw Error('Desteklenmeyen kütüphane/sürüm veya yinelenen seçim.');seen.add(lib.id);roots.push({id:lib.id,version:lib.version});}
 const locked=new Set();const visit=id=>{if(locked.has(id))return;locked.add(id);for(const dep of byID.get(id).dependencies)visit(dep);};for(const r of roots)visit(r.id);
 const sort=(a,b)=>a.id.localeCompare(b.id,'en');return{schemaVersion:1,toolchain:TOOLCHAIN,requested:roots.sort(sort),locked:[...locked].map(id=>({id,version:byID.get(id).version})).sort(sort)};
}
export function normalizeLibraries(raw){
 if(!raw||raw.schemaVersion!==1||raw.toolchain!==TOOLCHAIN)throw Error('Kütüphane manifesti veya toolchain sürümü desteklenmiyor.');
 const normalized=libraryManifest(raw.requested);
 if(raw.locked!==undefined){if(!Array.isArray(raw.locked)||JSON.stringify([...raw.locked].sort((a,b)=>String(a?.id).localeCompare(String(b?.id),'en')))!==JSON.stringify(normalized.locked))throw Error('Kütüphane bağımlılık kilidi eşleşmiyor.');}
 return normalized;
}
export function selectedLibraries(manifest){return normalizeLibraries(manifest).locked.map(l=>byID.get(l.id));}
export function libraryBuildSelection(manifest,upstream){
 // Missing manifest means 0.13 compatibility. It preserves old include paths,
 // library objects and firmware keys; explicit selections are strictly scoped.
 if(manifest===undefined)return null;
 const selected=selectedLibraries(manifest),roots=selected.flatMap(l=>l.roots),coreRoots=['/sysroot/','/arduino/core/','/arduino/variant/'];
 const headers=upstream.headerFiles.filter(p=>coreRoots.some(r=>p.startsWith(r))||roots.some(r=>p.startsWith(r+'/')));
 const objects=['/objects/core_abi.o',...upstream.objectGroups.base.filter(p=>p.startsWith('/objects/core_')),...selected.flatMap(l=>l.objects.map(o=>'/objects/'+o))];
 for(const p of objects)if(p!=='/objects/core_abi.o'&&!Object.values(upstream.objectGroups).flat().includes(p))throw Error('Kütüphane nesnesi toolchain paketinde yok: '+p);
 return{headers,objects,includes:['/arduino/core','/arduino/variant',...selected.flatMap(l=>l.includes)]};
}
