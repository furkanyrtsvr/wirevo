import {RFID_CARD} from './expansion-rfid-cards.js';
import {COLORS,validWireColor} from './wire-colors.js';
export {COLORS} from './wire-colors.js';
import {EXPANSION_CATALOG} from './expansion-hardware.js';
import {normalizePinConfig} from './stm32-pin-config.js';
import {BLUETOOTH_PART} from './bluetooth-model.js';
import {NET_LABEL,joinNetLabels,netLabelDefinition} from './net-label.js';
import {validateSTMImage} from './stm32-image.js';
import {validatePicoImage} from './pico-image.js';
import {validateTivaImage} from './tiva-image.js';
import {validateESPImage} from './esp-boards.js';
import {GENERIC_CATALOG} from './generic-hardware.js';
import {BOARD_EXAMPLES} from './board-examples.js';
import {BOARDS,boardDefinition,projectBoard,boardKey as boardKeyLocal} from './board-hardware.js';
import {DIODE_CATALOG} from './diode-hardware.js';
import {SHIFT_CATALOG} from './shift-hardware.js';
import {EXTRA_SENSOR_CATALOG} from './extra-sensor-hardware.js';
import {SPI_GPIO_CATALOG} from './spi-gpio-hardware.js';
import {TFT_CATALOG} from './tft-hardware.js';
import {ACTUATOR_CATALOG} from './actuator-hardware.js';
import {LOADCELL_CATALOG} from './loadcell-hardware.js';
import {DIGITAL_CATALOG} from './digital-hardware.js';
import {PULSE_CATALOG} from './pulse-hardware.js';
import {validatePartParameters} from './part-parameters.js';
import {LAB_CATALOG} from './lab-hardware.js';
import {BASIC_CATALOG} from './basic-hardware.js';
import {SENSOR_CATALOG} from './sensor-hardware.js';
import {EXPANDED_CATALOG} from './expanded-hardware.js';
import {ANALOG_ASSETS} from './opamp-hardware.js';
import {solveProjectDC} from './dc-project.js';
import {UNO,BREADBOARD} from './hardware.js';
import {COMPONENT_ASSETS} from './component-hardware.js';
import {SEMICONDUCTOR_ASSETS} from './semiconductor-hardware.js';
import {CONTACT_ASSETS} from './contact-hardware.js';
import {I2C_MODULES} from './module-hardware.js';
import {OLED} from './oled-hardware.js';
import {mountErrors} from './mounting.js';
import {validMeasurement} from './measurement.js';
import {projectFiles,mainFile} from './source-files.js';
import {normalizeLibraries} from './libraries.js';
const scale=1.35;
const physical=(definition,category,detail)=>({name:definition.name,category,detail,width:definition.width*scale,height:definition.height*scale,pinDefs:definition.pins.map(p=>({...p,x:p.x*scale,y:p.y*scale})),pins:definition.pins.filter(p=>p.connectable!==false).map(p=>p.id),asset:definition.asset,scale});
export const CATALOG={
  rfidCard:RFID_CARD,netLabel:NET_LABEL,bluetooth:BLUETOOTH_PART,...EXPANSION_CATALOG,
  ...LAB_CATALOG,
  ...GENERIC_CATALOG,...DIODE_CATALOG,...SHIFT_CATALOG,...EXTRA_SENSOR_CATALOG,...SPI_GPIO_CATALOG,...TFT_CATALOG,...ACTUATOR_CATALOG,...LOADCELL_CATALOG,...DIGITAL_CATALOG,...BASIC_CATALOG,...PULSE_CATALOG,
  ...SENSOR_CATALOG,
  ...EXPANDED_CATALOG,
  ...Object.fromEntries(Object.entries(ANALOG_ASSETS).map(([type,d])=>[type,physical(d,'Temel',d.package)])),
  board:physical(UNO,'Kartlar','ATmega328P · 16 MHz'),
  breadboard:physical(BREADBOARD,'Temel','400 delik · 4 güç rayı'),
  ...Object.fromEntries(Object.entries(COMPONENT_ASSETS).map(([type,d])=>[type,physical({...d,name:{led:'LED',resistor:'Direnç',button:'Buton 12 mm',pot:'Potansiyometre'}[type]},['button','pot'].includes(type)?'Girişler':type==='led'?'Çıkışlar':'Temel',{led:'2 V · 20 mA',resistor:'220 Ω · ¼ W',button:'4 pin · anlık kontak',pot:'10 kΩ · analog'}[type])])),
  ...Object.fromEntries(Object.entries(SEMICONDUCTOR_ASSETS).map(([type,d])=>[type,physical(d,'Temel',d.package+' · '+(type==='npn'?'C / B / E':'G / D / S · tab=D'))])),
  sensor:{name:'Analog nem girişi',category:'Girişler',detail:'0–5 V · sensör modeli',width:92,height:112,pins:['VCC','OUT','GND'],pinDefs:[{id:'VCC',x:28,y:107},{id:'OUT',x:46,y:107},{id:'GND',x:64,y:107}]},
  relay:physical({...CONTACT_ASSETS.relay,name:'Röle modülü'},'Çıkışlar','5 V · COM / NO / NC'),
  spdt:physical({...CONTACT_ASSETS.spdt,name:'SPDT anahtar'},'Girişler','2→1 / 2→3 · kontak'),
  oled:physical(OLED,'Çıkışlar','128×64 · I²C 0x3C / 0x3D'),
  eeprom:physical(I2C_MODULES.eeprom,'Temel','32 KB · DIP-8 · I²C'),
  rtc:physical(I2C_MODULES.rtc,'Girişler','DS1307 · I²C 0x68'),
  supply:{name:'DC güç kaynağı',category:'Temel',detail:'0–30 V DC · ideal',width:112,height:84,pins:['VCC','GND'],pinDefs:[{id:'VCC',x:35,y:76},{id:'GND',x:77,y:76}]}
};
export const BOARD_CATALOG=Object.fromEntries(Object.entries(BOARDS).map(([key,d])=>[key,physical(d,'Kartlar',d.mcu+' · '+(d.hz/1e6)+' MHz')]));
export const componentDefinition=c=>c?.type==='netLabel'?netLabelDefinition(c):c?.type==='board'?BOARD_CATALOG[c.params?.model||'uno']:CATALOG[c?.type];

export const endpoint=(id,pin)=>`${id}:${pin}`;
export function pinExists(p,e){if(typeof e!=='string')return false;const [id,pin,...extra]=e.split(':');return !extra.length&&p.components.some(c=>c.id===id&&componentDefinition(c)?.pins.includes(pin));}
const finite=n=>Number.isFinite(n)&&Math.abs(n)<=10000;
export function validateProject(raw){
  if(!raw||![1,2,3,4,5].includes(raw.schemaVersion))throw new Error('Desteklenmeyen proje şeması.');
  if(![...BOARD_EXAMPLES.map(e=>e.id),'nano-adc','mini-adc','soft-uart','blink','button','dimmer','greenhouse','custom','uart','divider','npn','mosfet','relay','spdt','multifile','oled','oled-adc','i2c-scan','eeprom','rtc','i2c-modules','lcd8','lcd16','matrix8','digits8','bmp280','spi-adc','adc-acquisition-low','adc-acquisition-high','onewire','co2','light','opamp','rc','rl','sht31','sht31-stretch','bh1750','mpu6050','mcp23017','sensor-array','lab-wave','lab-ohms','basic-lm35','basic-mq2','basic-flame','basic-sound','basic-pir','basic-irObstacle','basic-tilt','basic-hall','basic-joystick','basic-thermistor','basic-soilCap','pulse-distance','pulse-servo','digital-dht11','digital-dht22','digital-hx711','digital-tm1637','digital-ky040','digital-keypad4x4','actuator-ws2812','actuator-stepper','actuator-bridge','tft-7735','tft-7789','max-chain','spi-gpio','ina219','max6675','shift-595','shift-165','shift-165-chain','diode-lab','diode-clip'].includes(raw.model))throw new Error('Proje modeli geçersiz.');
  if(typeof raw.name!=='string'||!raw.name.trim()||raw.name.length>100||typeof raw.code!=='string'||raw.code.length>100000)throw new Error('Proje adı veya kod geçersiz.');
  if(!Array.isArray(raw.components)||raw.components.length>150||!Array.isArray(raw.wires)||raw.wires.length>600)throw new Error('Devre sınırı: 150 bileşen, 600 kablo.');
  if(raw.components.filter(c=>c?.type==='board').length>1)throw new Error('Bir MCU kartı desteklenir.');
  const ids=new Set();
  for(const c of raw.components){if(!c||!CATALOG[c.type]||typeof c.id!=='string'||!/^[\w-]{1,40}$/.test(c.id)||ids.has(c.id))throw new Error('Bileşen kimliği geçersiz.');ids.add(c.id);if(c.type==='board'&&!Object.hasOwn(BOARDS,c.params?.model||'uno'))throw Error('Desteklenmeyen kart modeli.');validatePartParameters(c);for(const key of ['mirrorX','mirrorY'])if(c[key]!==undefined&&typeof c[key]!=='boolean')throw Error('Bileşen aynalama ayarı geçersiz.');if(!finite(c.x)||!finite(c.y)||c.rotation!==undefined&&![0,90,180,270].includes(c.rotation))throw new Error('Bileşen konumu geçersiz.');if(!c.params||typeof c.params!=='object'||Array.isArray(c.params))throw new Error('Bileşen ayarları geçersiz.');if(c.type==='supply'&&c.params.voltage!==undefined&&(!Number.isFinite(c.params.voltage)||c.params.voltage<0||c.params.voltage>30))throw Error('Güç kaynağı: 0–30 V.');if(c.type==='resistor'&&(!Number.isFinite(c.params.ohms)||c.params.ohms<.001||c.params.ohms>1e7))throw new Error('Direnç: 1 mΩ–10 MΩ.');if(['pot','sensor'].includes(c.type)&&c.params.value!==undefined&&(!Number.isFinite(c.params.value)||c.params.value<0||c.params.value>100))throw new Error('Analog giriş: %0–100.');if(c.params.pressed!==undefined&&typeof c.params.pressed!=='boolean')throw new Error('Buton durumu geçersiz.');if(c.type==='spdt'&&c.params.position!==undefined&&!['left','right'].includes(c.params.position))throw Error('Anahtar konumu geçersiz.');if(c.type==='relay'&&c.params.activeHigh!==undefined&&typeof c.params.activeHigh!=='boolean')throw Error('Röle aktif seviyesi geçersiz.');if(c.type==='oled'&&c.params.address!==undefined&&![60,61].includes(c.params.address))throw Error('OLED adresi: 0x3C veya 0x3D.');if(c.type==='led'&&c.params.color!==undefined&&!['red','green','blue','yellow'].includes(c.params.color))throw new Error('LED rengi geçersiz.');}
  const wireIds=new Set();
  for(const w of raw.wires){if(!w||typeof w.id!=='string'||!/^[\w-]{1,40}$/.test(w.id)||wireIds.has(w.id)||!pinExists(raw,w.from)||!pinExists(raw,w.to)||w.from===w.to)throw new Error('Kablo veya pin geçersiz.');wireIds.add(w.id);if(w.routing!==undefined&&!['direct','orthogonal'].includes(w.routing))throw Error('Kablo çizim biçimi geçersiz.');if(!validWireColor(w.color)||w.points!==undefined&&(!Array.isArray(w.points)||w.points.length>64||w.points.some(p=>!p||!finite(p.x)||!finite(p.y))))throw new Error('Kablo rotası geçersiz.');}
  const gpioPins=new Set(projectBoard(raw).pins.filter(p=>p.port).map(p=>p.net||p.id)),gpio=p=>typeof p==='string'&&gpioPins.has(p);
  const s=raw.settings;if(!s||!['moisture','threshold','pot'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=100)||typeof s.pressed!=='boolean')throw new Error('Giriş ayarları geçersiz.');
  if(s.tracePins!==undefined&&(!Array.isArray(s.tracePins)||s.tracePins.length>3||s.tracePins.some(p=>!gpio(p))||new Set(s.tracePins).size!==s.tracePins.length))throw new Error('Analizör kanalları geçersiz.');
  if(s.measurement!==undefined&&!validMeasurement(raw,s.measurement,pinExists))throw Error('Ölçüm probu veya akım dalı geçersiz.');
  if(s.scopeMode!==undefined&&!['gpio','dc'].includes(s.scopeMode))throw Error('Ölçüm görünümü geçersiz.');
  const project={schemaVersion:3,name:raw.name,model:raw.model,code:raw.code,components:raw.components.map(c=>({id:c.id,type:c.type,x:c.x,y:c.y,rotation:c.rotation||0,...(c.mirrorX!==undefined?{mirrorX:c.mirrorX}:{}),...(c.mirrorY!==undefined?{mirrorY:c.mirrorY}:{}),params:{...c.params},...(c.mount?{mount:{boardId:c.mount.boardId,pins:{...c.mount.pins}}}:{})})),wires:raw.wires.map(w=>({id:w.id,from:w.from,to:w.to,color:w.color,...(w.routing?{routing:w.routing}:{}),points:(w.points||[]).map(p=>({x:p.x,y:p.y}))})),settings:{moisture:s.moisture,threshold:s.threshold,pot:s.pot,pressed:s.pressed,probe:gpio(s.probe)?s.probe:projectBoard(raw).architecture==='stm32'?'PA0':projectBoard(raw).architecture==='pico'?'GPIO15':projectBoard(raw).architecture==='esp32'?'GPIO2':'D13'}};
  if(projectBoard(project).architecture==='pico'&&raw.language!=='c')throw Error('Pico başlangıç profili C17 gerektirir.');
  if(projectBoard(project).architecture==='tiva'&&raw.language!=='c')throw Error('Tiva LaunchPad yalnız C17 dili gerektirir.');
  if(projectBoard(project).architecture==='stm32'&&!['c','cpp','micropython'].includes(raw.language))throw Error('STM32 C17, C++17 veya MicroPython dili gerektirir.');
  if(raw.language!==undefined){if(!['arduino','c','cpp','micropython'].includes(raw.language)||(projectBoard(project).architecture==='stm32'?!['c','cpp','micropython'].includes(raw.language):projectBoard(project).architecture==='tiva'||projectBoard(project).architecture==='pico'?raw.language!=='c':raw.language==='cpp'||projectBoard(project).architecture!=='esp32'&&raw.language!=='arduino'))throw Error('Kart/dil seçimi desteklenmiyor.');project.language=raw.language;}
  const mounts=mountErrors(project);if(mounts.length)throw new Error(mounts[0]);
  if(s.stm32Pins!==undefined){if(projectBoard(project).architecture!=='stm32')throw Error('STM32 pin ayarı başka mimaride kullanılamaz.');project.settings.stm32Pins=normalizePinConfig(s.stm32Pins,boardKeyLocal(project));}
  if(s.tracePins)project.settings.tracePins=[...s.tracePins];
  if(s.measurement)project.settings.measurement={...s.measurement};
  if(s.scopeMode)project.settings.scopeMode=s.scopeMode;
  if(raw.files!==undefined){project.files=projectFiles(raw).filter(f=>f.name!==mainFile(raw));project.schemaVersion=project.files.length?4:3;}
  if(raw.libraries!==undefined){if(['stm32','tiva','pico'].includes(projectBoard(project).architecture))throw Error('STM32 Arduino kütüphane manifesti desteklenmiyor.');project.libraries=normalizeLibraries(raw.libraries);project.schemaVersion=5;}
  if(s.debugger!==undefined){const d=s.debugger;if(!d||!Array.isArray(d.breakpoints)||d.breakpoints.length>256||!Array.isArray(d.watches)||d.watches.length>64||d.breakpoints.some(b=>!b||typeof b.file!=='string'||b.file.length>200||!Number.isInteger(b.line)||b.line<1||b.line>100000)||d.watches.some(n=>typeof n!=='string'||!/^[A-Za-z_]\w{0,79}$/.test(n)))throw Error('Debugger ayarları geçersiz.');project.settings.debugger={breakpoints:d.breakpoints.map(b=>({file:b.file,line:b.line})),watches:[...d.watches]};}
  if(s.picoNetwork!==undefined){const n=s.picoNetwork;if(!n||typeof n.ssid!=='string'||n.ssid.length>32||typeof n.password!=='string'||n.password.length>63||typeof n.enabled!=='boolean')throw Error('Sanal Pico ağ ayarları geçersiz.');project.settings.picoNetwork={ssid:n.ssid,password:n.password,enabled:n.enabled};}
  if(raw.firmware?.board&&!BOARDS[raw.firmware.board])throw Error('Firmware kart hedefi geçersiz.');
  if(raw.firmware&&projectBoard(project).architecture==='esp32'){if(!['esp-bin','micropython'].includes(raw.firmware.format)||typeof raw.firmware.payload!=='string'||raw.firmware.payload.length>800000||raw.firmware.board!==boardKeyLocal(project))throw Error('ESP program verisi geçersiz.');if(raw.firmware.format!==(project.language==='micropython'?'micropython':'esp-bin')||typeof raw.firmware.source!=='string'||raw.firmware.source.length>100000)throw Error('Firmware dili/kaynağı geçersiz.');if(raw.firmware.format==='esp-bin'){let bytes;try{bytes=Uint8Array.from(atob(raw.firmware.payload),c=>c.charCodeAt(0));}catch{throw Error('Firmware base64 geçersiz.');}validateESPImage(bytes,raw.firmware.board,{bootFromROM:!!raw.firmware.bootFromROM});}else if(raw.firmware.payload!==raw.firmware.source)throw Error('Python programı kaynakla eşleşmiyor.');project.firmware={...raw.firmware};}
  else if(raw.firmware&&projectBoard(project).architecture==='pico'){const f=raw.firmware;if(f.format!=='pico-bin'||f.board!==boardKeyLocal(project)||typeof f.payload!=='string'||f.payload.length>800000||typeof f.source!=='string'||f.source.length>100000)throw Error('Pico firmware verisi geçersiz.');validatePicoImage(Uint8Array.from(atob(f.payload),c=>c.charCodeAt(0)),f.board);project.firmware={...f};}
  else if(raw.firmware&&projectBoard(project).architecture==='tiva'){const f=raw.firmware;if(f.format!=='tiva-bin'||f.board!==boardKeyLocal(project)||typeof f.payload!=='string'||f.payload.length>400000||typeof f.source!=='string'||f.source.length>100000)throw Error('Tiva firmware verisi geçersiz.');validateTivaImage(Uint8Array.from(atob(f.payload),c=>c.charCodeAt(0)));project.firmware={...f};}
  else if(raw.firmware&&projectBoard(project).architecture==='stm32'){const f=raw.firmware;if(f.format!==(project.language==='micropython'?'micropython':'stm32-bin')||f.board!==boardKeyLocal(project)||typeof f.payload!=='string'||f.payload.length>800000||typeof f.source!=='string'||f.source.length>100000)throw Error('STM32 firmware verisi geçersiz.');if(project.language==='micropython'){if(f.payload!==f.source)throw Error('Python programı kaynakla eşleşmiyor.');}else validateSTMImage(Uint8Array.from(atob(f.payload),c=>c.charCodeAt(0)),f.board);project.firmware={...f};}
  else if(raw.firmware){if(typeof raw.firmware.hex!=='string'||raw.firmware.hex.length>800000||typeof raw.firmware.source!=='string'||raw.firmware.source.length>100000)throw new Error('Firmware verisi geçersiz.');project.firmware={hex:raw.firmware.hex,source:raw.firmware.source,imported:!!raw.firmware.imported,...(raw.firmware.board?{board:raw.firmware.board}:{})};}
  if(raw.firmware?.sourceKey!==undefined){if(typeof raw.firmware.sourceKey!=='string'||raw.firmware.sourceKey.length>250000)throw Error('Firmware kaynak eşlemesi geçersiz.');project.firmware.sourceKey=raw.firmware.sourceKey;}
  if(raw.firmware?.staticRamBytes!==undefined){if(!Number.isSafeInteger(raw.firmware.staticRamBytes)||raw.firmware.staticRamBytes<0||raw.firmware.staticRamBytes>(projectBoard(project).architecture?projectBoard(project).ram:65536))throw Error('SRAM ölçümü geçersiz.');project.firmware.staticRamBytes=raw.firmware.staticRamBytes;}
  return project;
}
export function buildNets(project,definition=componentDefinition){
  const parent=new Map();for(const c of project.components)for(const p of definition(c).pins)parent.set(endpoint(c.id,p),endpoint(c.id,p));
  const root=a=>{if(!parent.has(a))return undefined;let p=a;while(p!==parent.get(p))p=parent.get(p);let n=a;while(n!==p){const next=parent.get(n);parent.set(n,p);n=next;}return p;};
  const join=(a,b)=>{a=root(a);b=root(b);if(a!==undefined&&b!==undefined&&a!==b)parent.set(a,b);};
  for(const c of project.components){const groups=new Map();for(const p of definition(c).pinDefs){if(p.connectable===false)continue;const group=p.bus||p.net;if(group){if(groups.has(group))join(endpoint(c.id,p.id),groups.get(group));else groups.set(group,endpoint(c.id,p.id));}}if(['button','tact6'].includes(c.type)&&(c.params.pressed??project.settings.pressed))join(endpoint(c.id,'1'),endpoint(c.id,'2'));}
  for(const c of project.components)if(c.type==='board')for(const p of definition(c).pinDefs)if(p.port&&p.net&&p.connectable!==false&&p.id!==p.net){const alias=endpoint(c.id,p.net);if(!parent.has(alias))parent.set(alias,alias);join(alias,endpoint(c.id,p.id));}
  for(const w of project.wires)join(w.from,w.to);
  joinNetLabels(project,join);
  for(const c of project.components)if(c.mount)for(const [pin,hole]of Object.entries(c.mount.pins))join(endpoint(c.id,pin),endpoint(c.mount.boardId,hole));
  const groups=new Map();for(const p of parent.keys()){const r=root(p);if(!groups.has(r))groups.set(r,[]);groups.get(r).push(p);}
  return {groups:[...groups.values()],net:root,same:(a,b)=>root(a)!==undefined&&root(a)===root(b)};
}
export function simulate(project,time=0,firmware=null){
  const netlist=buildNets(project),dc=solveProjectDC(project,firmware,netlist),leds={},relays={},issues=[];
  if(firmware?.dc?.valid&&(firmware.dc.mode==='cycle-transient'||firmware.dc.externalDevices)){dc.voltages=new Map(Object.entries(firmware.dc.voltages||{}));dc.currents=new Map(Object.entries(firmware.dc.currents||{}));for(const key of ['ledResults','deviceResults','opampResults','contactResults','sensorResults'])if(firmware.dc[key])dc[key]=new Map(Object.entries(firmware.dc[key]));dc.ledDisplay=new Map([...dc.ledResults].map(([id,l])=>[id,{...l,averageCurrent:l.current}]));dc.diagnostics=firmware.dc.diagnostics||dc.diagnostics;dc.valid=true;dc.converged=true;}
  const integrated=firmware?.dc?.valid&&['synchronous-dc','cycle-transient'].includes(firmware.dc.mode)&&firmware.dc.windowCycles>0?firmware.dc.ledAverageCurrents:null;
  for(const d of dc.diagnostics){const ids=(d.componentIds||[]).join(', ');if(d.code==='ideal-source-conflict')issues.push('Kısa devre: gerilim kaynakları doğrudan bağlı.');else if(['led-ideal-source-conflict','led-unlimited-current'].includes(d.code))issues.push(ids+': seri direnç eksik.');else if(d.code==='ideal-parallel-current-sharing')issues.push(ids+': paralel LED akımları ideal modelde eşit paylaşılır.');else if(d.code==='multiple-pwm-average-unsupported')issues.push('Çoklu PWM: akım anlık DC durumundan hesaplanır.');else if(['dc-nonconvergence','singular-network'].includes(d.code))issues.push('DC ağı çözülemedi; bağlantıları kontrol edin.');}
  const deviceMessages={'npn-base-unlimited-current':'Baz direnci gerekli.','mosfet-body-unlimited-current':'Gövde diyodu ideal kaynağa doğrudan bağlı.','npn-reverse-unsupported':'Ters C/E bağlantısı model dışında.','mosfet-floating-gate':'Gate/source boşta; kanal OFF.','mosfet-transition-unsupported':'VGS geçiş bölgesi model dışında; kanal OFF.','mosfet-gate-overvoltage':'VGS sınırı ±16V aşıldı.','npn-overcurrent':'IC 600mA sınırını aşıyor.','ideal-clamp-conflict':'Aktif eleman gerilim koşulu kaynakla çakışıyor.','contact-source-conflict':'Kontak farklı ideal kaynakları kısa devre ediyor.','contact-nonconvergence':'Kontak geri beslemesi kararlı değil.','source-feedback-nonconvergence':'Sensör/kontak besleme geri beslemesi kararlı değil.','opamp-input-range':'Opamp giriş ortak mod aralığı dışında.','opamp-supply-unsupported':'Opamp beslemesi 3–30 V dışında.','opamp-output-current':'Opamp çıkış akımı 20mA üzerinde; sınırlama modeli yok.','semiconductor-nonconvergence':'Yarı iletken DC çözümü kararlı değil.'};
  for(const d of dc.diagnostics)if(deviceMessages[d.code])issues.push((d.componentIds||[]).join(', ')+': '+deviceMessages[d.code]);
  if(firmware?.dc?.stepLimited)issues.push('RC/RL: 10 µs çözüm adımı bu değerler için sınırlı; hızlı geçişler yaklaşık.');
  for(const c of project.components){
    if(c.type==='led'){const l=dc.ledDisplay.get(c.id),average=Number.isFinite(integrated?.[c.id])?integrated[c.id]:l?.averageCurrent||0,amps=dc.valid?Math.max(0,average):0,a=dc.voltages.get(netlist.net(endpoint(c.id,'A'))),k=dc.voltages.get(netlist.net(endpoint(c.id,'K')));leds[c.id]={on:amps>1e-9,current:amps*1000,voltage:Number.isFinite(a)&&Number.isFinite(k)?a-k:0,brightness:Math.min(1,amps/.0136),connected:Number.isFinite(a)&&Number.isFinite(k)};if(amps>.02)issues.push(c.id+': LED akımı 20 mA üstünde.');}
    if(['relay','coilRelay'].includes(c.type))relays[c.id]=dc.valid&&!!dc.contactResults?.get(c.id)?.energized;
  }
  const board=project.components.find(c=>c.type==='board'),outputPin=project.settings.probe||'D13',voltage=board?dc.voltages.get(netlist.net(endpoint(board.id,outputPin))):null;
  return{output:voltage??0,floating:voltage===null||voltage===undefined,outputPin,leds,relays,issues:[...new Set(issues)].filter(i=>!integrated||i!=='Çoklu PWM: akım anlık DC durumundan hesaplanır.'),nets:netlist.groups,moisture:project.settings.moisture,sources:dc.voltages,inputs:dc.inputs,dc};
}
export function getInputs(project,firmware=null){return solveProjectDC(project,firmware,buildNets(project),{pwmAverage:false}).inputs;}
