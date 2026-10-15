import {bindExampleWires} from './esp-example-bindings.js';
import {CATALOG,componentDefinition,buildNets,COLORS} from './core.js';
import {ESP_BOARDS} from './esp-boards.js';
import {ESP_PIN_DEFS} from './esp-pin-defs.js';
import {validatePartParameters} from './part-parameters.js';
import {solveProjectDC,DC_FAILURES} from './dc-project.js';
export const ESP_PARTS=['bluetooth','netLabel','resistor','led','button','pot','supply','spdt','diode','zener','npn','mosfet','rheostat','switch','coilRelay','lm35','thermistor','soilCap','joystick','irObstacle','tilt','flame','sound','pir','ldr','oled','sht31','bh1750','bmp280','mpu6050','eeprom','mcp3008','ds18b20','tmp36','relay','opamp','multimeter','hall','mq2','breadboard'];
export function espBoardDefinition(chip){const b=ESP_BOARDS[chip];return{id:chip,ioVoltage:3.3,logicHigh:2.475,supplyPin:'3V3',pins:ESP_PIN_DEFS[chip],name:b.title||b.name+' '+b.board,width:b.width||220,height:b.height||460,asset:b.asset};}
export function espPartDefinition(c,chip){if(c.type!=='board')return componentDefinition(c);const d=espBoardDefinition(chip);return{...d,pinDefs:d.pins,pins:d.pins.filter(p=>p.connectable!==false).map(p=>p.id)};}
export function validateESPCircuit(raw,chip){
 if(!Object.hasOwn(ESP_BOARDS,chip)||!raw||!Array.isArray(raw.components)||raw.components.length>150||!Array.isArray(raw.wires)||raw.wires.length>600)throw Error('Devre sınırı: 150 bileşen / 600 kablo.');
 const ids=new Set(),position=n=>Number.isFinite(n)&&Math.abs(n)<10000,components=raw.components.map(c=>{
  if(!c||!['board',...ESP_PARTS].includes(c.type)||!/^[\w-]{1,40}$/.test(c.id)||ids.has(c.id)||!position(c.x)||!position(c.y)||!c.params||typeof c.params!=='object'||Array.isArray(c.params))throw Error('ESP devre bileşeni geçersiz.');ids.add(c.id);
  if(c.type!=='board')validatePartParameters(c);
  if(c.type==='resistor'&&(!(c.params.ohms>=.001)||c.params.ohms>1e7))throw Error('Direnç: 1 mΩ–10 MΩ.');
  if(c.type==='pot'&&(!(c.params.value>=0)||c.params.value>100))throw Error('Pot değeri: %0–100.');
  if(c.type==='supply'&&(!(c.params.voltage>=0)||c.params.voltage>30))throw Error('Güç kaynağı: 0–30 V.');
  if(c.type==='button'&&typeof c.params.pressed!=='boolean')throw Error('Buton durumu geçersiz.');
  if(c.type==='spdt'&&c.params.position!==undefined&&!['left','right'].includes(c.params.position))throw Error('Anahtar konumu geçersiz.');
  if(c.type==='oled'&&c.params.address!==undefined&&![60,61].includes(c.params.address))throw Error('OLED adresi: 0x3C / 0x3D.');
  if(c.type==='led'&&c.params.color!==undefined&&!['red','green','blue','yellow','white'].includes(c.params.color))throw Error('LED rengi geçersiz.');
  if(c.type==='relay'&&c.params.activeHigh!==undefined&&typeof c.params.activeHigh!=='boolean')throw Error('Röle polaritesi geçersiz.');
  for(const key of ['mirrorX','mirrorY'])if(c[key]!==undefined&&typeof c[key]!=='boolean')throw Error('ESP bileşen aynalama ayarı geçersiz.');
  if(c.rotation!==undefined&&![0,90,180,270].includes(c.rotation))throw Error('ESP devresinde döndürme henüz desteklenmiyor.');
  return{id:c.id,type:c.type,x:c.x,y:c.y,params:{...c.params},...(c.mirrorX!==undefined?{mirrorX:c.mirrorX}:{}),...(c.mirrorY!==undefined?{mirrorY:c.mirrorY}:{}),...(c.rotation?{rotation:c.rotation}:{}),...(c.mount?{mount:structuredClone(c.mount)}:{})};
 });
 if(components.filter(c=>c.type==='board').length!==1)throw Error('ESP devresi bir kart içermelidir.');
 const definition=c=>espPartDefinition(c,chip),pins=new Set(components.flatMap(c=>definition(c).pins.map(p=>c.id+':'+p))),wireIds=new Set();
 const wires=raw.wires.map(w=>{if(!w||!/^[\w-]{1,40}$/.test(w.id)||wireIds.has(w.id)||!pins.has(w.from)||!pins.has(w.to)||w.from===w.to||!COLORS.includes(w.color))throw Error('ESP kablo/pin geçersiz.');wireIds.add(w.id);if(w.routing!==undefined&&!['direct','orthogonal'].includes(w.routing))throw Error('Kablo çizim biçimi geçersiz.');return{id:w.id,from:w.from,to:w.to,color:w.color,...(w.routing?{routing:w.routing}:{}),...(w.points?{points:structuredClone(w.points)}:{})};});
 return{components,wires,settings:{pressed:false,moisture:50,pot:50}};
}
export function createESPBench(chip){const raw=({components:[{id:'mcu',type:'board',x:30,y:30,params:{}},{id:'r1',type:'resistor',x:360,y:100,params:{ohms:220}},{id:'led1',type:'led',x:510,y:90,params:{color:'red',vf:2}},{id:'btn1',type:'button',x:360,y:260,params:{pressed:false}}],wires:[['mcu:GPIO2','r1:1'],['r1:2','led1:A'],['led1:K','mcu:GND'],['mcu:GPIO3','btn1:1'],['btn1:2','mcu:GND']].map(([from,to],i)=>({id:'w'+i,from,to,color:i>2?'#3b82f6':'#14b8a6'}))});raw.wires=bindExampleWires(chip,raw.wires);return validateESPCircuit(raw,chip);}
export function solveESPCircuit(project,chip,pins={},drivers=[]){
 const definition=espBoardDefinition(chip),netlist=buildNets(project,c=>espPartDefinition(c,chip));
 const result=solveProjectDC(project,{pins},netlist,{board:definition,pwmAverage:false,drivers});
 const board=project.components.find(c=>c.type==='board'),diagnostics=[...result.diagnostics];
 for(const p of definition.pins.filter(p=>p.port)){const voltage=result.voltages.get(netlist.net(board.id+':'+p.id));if(Number.isFinite(voltage)&&(voltage>3.6||voltage<-.3))diagnostics.push({code:'esp-gpio-overvoltage',componentIds:[board.id],pin:p.id,message:p.id+' 3.3 V GPIO sınırını aşıyor.'});}
 const fault=diagnostics.find(d=>DC_FAILURES.includes(d.code)||d.code==='esp-gpio-overvoltage');
 return{...result,diagnostics,valid:!fault&&result.valid,fault};
}
