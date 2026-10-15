import {normalizeFiles} from './source-files.js';
import {indexedAVRArchive} from './avr-archive.js';
import {libraryBuildSelection} from './libraries.js';
// Independent project adapter: separate C++ translation units -> objects ->
// one AVR ELF. Tool modules/binaries/Arduino headers are loaded unmodified
// from the pinned distribution. No vendor implementation is copied here.
export async function buildProjectFirmware(input,{assetsBase,onProgress=()=>{},libraries:libraryManifest,board='uno'}={}){
  if(!['uno','nano','pro-mini','mega','mega2560','duemilanove','pro'].includes(board))throw Error('Desteklenmeyen derleme hedefi.');
  const mega=['mega','mega2560'].includes(board),mcu=mega?'atmega2560':'atmega328p',arch=mega?'avr6':'avr5',flashLimit=mega?253952:board==='uno'?32256:30720,ramLimit=mega?8192:2048;
  const files=normalizeFiles(input),base=new URL(assetsBase),logs=[],cache=new Map();
  const megaBase=new URL('./notices/mega-toolchain/',import.meta.url);
  const megaBytes=async path=>{const r=await fetch(new URL(path.replace(/^\//,''),megaBase));if(!r.ok)throw Error('Mega derleyici dosyası yüklenemedi: '+path);return new Uint8Array(await r.arrayBuffer());};
  const megaManifest=mega?JSON.parse(new TextDecoder().decode(await megaBytes('manifest.json'))):null;
  const bytes=path=>{if(!cache.has(path))cache.set(path,fetch(new URL(path,base)).then(async r=>{if(!r.ok)throw Error('Derleyici dosyası yüklenemedi: '+path);return new Uint8Array(await r.arrayBuffer());}));return cache.get(path);};
  const manifestResponse=await fetch(new URL('assets/manifest.json',base));if(!manifestResponse.ok)throw Error('Derleyici manifesti yüklenemedi.');const manifest=await manifestResponse.json();
  const selection=libraryBuildSelection(libraryManifest,manifest);
  const modules=await Promise.all(['cc1plus','avr-as','avr-ld','avr-objcopy'].map(t=>import(new URL('tools/'+t+'.mjs',base).href)));
  const mkdir=(fs,path)=>{let at='';for(const part of path.split('/').slice(0,-1).filter(Boolean)){at+='/'+part;try{fs.mkdir(at);}catch{if(!fs.analyzePath(at).exists)throw Error('VFS yolu açılamadı: '+at);}}};
  const put=(fs,path,content)=>{mkdir(fs,path);fs.writeFile(path,content);};
  const run=async(tool,factory,args,setup,out)=>{
    const start=logs.length;
    let mod=await factory({noInitialRun:true,locateFile:path=>new URL('tools/'+(path.endsWith('.wasm')?tool+'.wasm':path),base).href,print(){},printErr:line=>logs.push('['+tool+'] '+line)});
    await setup(mod.FS);
    try{const status=mod.callMain(args);if(status)throw Error('exit '+status);}catch(e){if(e.status!==0&&!/exit\(0\)/.test(e.message||''))throw Error(tool+'\n'+logs.slice(start).join('\n')+'\n'+(e.message||e));}
    const output=new Uint8Array(mod.FS.readFile(out));mod=null;return output;
  };
  const projectDir='/project',objects=[];
  const includes=['/sysroot/gcc/include','/sysroot/avr/include'],libraries=selection?.includes||['/arduino/core','/arduino/variant','/arduino/libraries/Wire/src','/arduino/libraries/Wire/src/utility','/arduino/libraries/SPI/src','/libraries/Servo/src','/libraries/Servo/src/avr','/libraries/Firmata','/libraries/Firmata/utility','/libraries/Adafruit_BMP085_Library','/libraries/DHT_sensor_library','/libraries/Adafruit_GFX_Library','/libraries/Adafruit_SSD1306','/libraries/VL53L0X','/libraries/Adafruit_BusIO','/libraries/Adafruit_Unified_Sensor'];
  const units=files.filter(f=>/\.(ino|cpp)$/.test(f.name));
  const softwareSerial=files.some(f=>/#\s*include\s*[<"]SoftwareSerial.h[>"]/.test(f.content));
  let softHeader;if(softwareSerial){if(selection&&!libraryManifest.locked.some(l=>l.id==='software-serial'))throw Error('SoftwareSerial kütüphanesini seçin.');softHeader=await (await fetch(new URL('./notices/SoftwareSerial.h',import.meta.url))).text();units.push({name:'_circuitforge/SoftwareSerial.cpp',content:await (await fetch(new URL('./notices/SoftwareSerial.cpp',import.meta.url))).text()});libraries.push('/software-serial');}
  for(let i=0;i<units.length;i++){
    const unit=units[i],asm='/build/unit'+i+'.s',obj='/build/unit'+i+'.o';onProgress('C++ '+(i+1)+'/'+units.length+' · '+unit.name);
    const args=['-quiet','-imultilib',arch,'-D__AVR_'+(mega?'ATmega2560':'ATmega328P')+'__','-D__AVR_DEVICE_NAME__='+mcu,'-DF_CPU=16000000L','-DARDUINO=10819','-DARDUINO_AVR_'+(board==='uno'?'UNO':board==='nano'?'NANO':mega?'MEGA2560':board==='duemilanove'?'DUEMILANOVE':'PRO'),'-DARDUINO_ARCH_AVR','-DUSE_OLED=0','-DUSE_TOF=0',...includes.flatMap(p=>['-isystem',p]),...libraries.flatMap(p=>['-I',p]),'-I',projectDir,projectDir+'/'+unit.name,'-mn-flash='+(mega?4:1),'-mno-skip-bug','-mmcu='+arch,'-Os','-std=gnu++11','-fpermissive','-fno-exceptions','-fno-threadsafe-statics','-fno-rtti','-fno-enforce-eh-specs','-ffunction-sections','-fdata-sections','-o',asm];
    const assembly=await run('cc1plus',modules[0].default,args,async fs=>{
      await Promise.all((selection?.headers||manifest.headerFiles).map(async path=>put(fs,path,await bytes('assets/fs'+path))));
      if(softHeader)put(fs,'/software-serial/SoftwareSerial.h',softHeader);
      if(mega)put(fs,'/arduino/variant/pins_arduino.h',await megaBytes('headers/pins_arduino.h'));
      if(['nano','pro-mini'].includes(board)){const pins=fs.readFile('/arduino/variant/pins_arduino.h',{encoding:'utf8'});put(fs,'/arduino/variant/pins_arduino.h',pins.replace(/(#define\s+NUM_ANALOG_INPUTS\s+)6/,(_,prefix)=>prefix+'8'));}
      for(const file of [...files,...units.filter(u=>!files.includes(u))])put(fs,projectDir+'/'+file.name,(file.name==='sketch.ino'?'#include <Arduino.h>\n':'')+'#line 1 "'+file.name+'"\n'+file.content);
      mkdir(fs,asm);
    },asm);
    const object=await run('avr-as',modules[1].default,['-mmcu='+mcu,'-o',obj,asm],fs=>put(fs,asm,assembly),obj);objects.push({path:obj,bytes:object});
  }
  onProgress('AVR linker · '+objects.length+' kaynak birimi');
  const core=mega?[...megaManifest.coreObjects,...(selection?selection.objects.filter(p=>p.startsWith('/objects/lib_')):['Wire','twi','SPI','BusIO_Register','I2CDevice','SPIDevice','GFX','SSD1306'].map(n=>'/objects/lib_'+n+'.o'))]:selection?.objects||['/objects/core_abi.o',...manifest.objectGroups.base,...manifest.objectGroups.oled],elfPath='/build/project.elf';
  const members=await Promise.all(core.map(async path=>({path,bytes:mega?await megaBytes(path):await bytes('assets'+path)})));
  if(!mega){const interruptResponse=await fetch(new URL('./notices/arduino-WInterrupts.o',import.meta.url));if(!interruptResponse.ok)throw Error('Arduino kesme nesnesi yüklenemedi.');members.push({path:'/objects/core_WInterrupts.o',bytes:new Uint8Array(await interruptResponse.arrayBuffer())});}
  const library=indexedAVRArchive(members);
  const elf=await run('avr-ld',modules[2].default,['-m',arch,'-Tdata='+(mega?'0x800200':'0x800100'),'--gc-sections','-o',elfPath,'/libs/crt'+mcu+'.o',...objects.map(o=>o.path),'/libs/circuitforge.a','-L/libs','-lm','-lc','-lgcc'],async fs=>{
    for(const obj of objects)put(fs,obj.path,obj.bytes);
    put(fs,'/ldscripts/'+arch+'.xn',mega?await megaBytes('ldscripts/avr6.xn'):await bytes('assets/ldscripts/avr5.xn'));
    put(fs,'/libs/circuitforge.a',library);
    await Promise.all((mega?megaManifest.libs:manifest.libs).map(async path=>put(fs,path,mega?await megaBytes(path):await bytes('assets'+path))));
  },elfPath);
  const output=await run('avr-objcopy',modules[3].default,['-O','ihex','-R','.eeprom',elfPath,'/build/project.hex'],fs=>put(fs,elfPath,elf),'/build/project.hex');
  const hex=new TextDecoder().decode(output),flashBytes=hex.split(/\r?\n/).reduce((sum,line)=>sum+(line.slice(7,9)==='00'?parseInt(line.slice(1,3),16):0),0);
  const ram=staticRamBytes(elf);
  return{hex,flashBytes,fitsTarget:flashBytes<=flashLimit,fitsRam:ram<=ramLimit,stderr:logs,sourceObjectCount:objects.length,libraryArchiveObjects:core.length,sourceUnits:units.map(f=>f.name),staticRamBytes:ram,board,flashLimit,ramLimit};
}
export function staticRamBytes(bytes){
  if(bytes.length<52||bytes[0]!==127||bytes[1]!==69||bytes[2]!==76||bytes[3]!==70||bytes[4]!==1||bytes[5]!==1)throw Error('ELF32 verisi geçersiz.');
  const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),offset=d.getUint32(32,true),size=d.getUint16(46,true),count=d.getUint16(48,true);if(size<40||offset+size*count>bytes.length)throw Error('ELF bölüm tablosu geçersiz.');
  let total=0;for(let i=0;i<count;i++){const at=offset+i*size,flags=d.getUint32(at+8,true),address=d.getUint32(at+12,true),length=d.getUint32(at+20,true);if((flags&3)===3&&address>=0x800100&&address<0x810000)total+=length;}return total;
}
