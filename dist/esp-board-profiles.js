// Original board drawings and manufacturer-verified header facts. No Wokwi SVG copy.
const espDocs=(family,board)=>`https://docs.espressif.com/projects/esp-dev-kits/en/latest/${family}/${board}/user_guide.html`;
const profiles=[];
function add(id,meta,left,right,layout='rows'){
 const width=layout==='xiao'?84:layout==='nano'?210:layout==='p4'?460:220,height=layout==='xiao'?108:layout==='nano'?86:layout==='p4'?350:460,seen=new Map();
 const defs=[];for(const [side,labels]of [['left',left],['right',right]])for(const [i,raw]of labels.entries()){
  const label=String(raw),match=label.match(/^(?:GPIO|TX|RX)?(\d+)$/),net=match?'GPIO'+match[1]:label==='G'?'GND':['VBUS'].includes(label)?'5V':label;
  const base=match?net:label==='G'?'GND':label.startsWith('NC')?'NC':label,n=seen.get(base)||0;seen.set(base,n+1);const pin={id:base+(n?'.'+n:''),name:meta.aliasLabels?.[net]||label,net};
  if(match)Object.assign(pin,{port:'ESP',bit:Number(match[1])});else if(net==='GND')pin.voltage=0;else if(net==='3V3'||id==='esp32h2'&&net==='VBAT')pin.voltage=3.3;else if(net==='5V')pin.voltage=5;
  if(['RST','RESET','LDO_EN','VUSB'].includes(label)||label.startsWith('NC'))pin.connectable=false;
  if(layout==='nano'){pin.x=12+i*12.6;pin.y=side==='left'?7:79;}
  else if(layout==='p4'){pin.x=20+i*21;pin.y=side==='left'?296:320;}
  else if(layout==='xiao'){pin.x=side==='left'?6:78;pin.y=17+i*12;}
  else{pin.x=side==='left'?17:203;pin.y=86+i*311/Math.max(left.length-1,right.length-1);}
  defs.push(pin);
 }
 const gpio=[...new Set(defs.filter(p=>p.port).map(p=>p.bit))].sort((a,b)=>a-b);
 profiles.push({id,...meta,width,height,layout,pins:defs,gpio,pads:defs.length,asset:id+'.svg'});
}
add('esp32h2',{name:'ESP32-H2',board:'DevKitM-1 · v1.3 N4',arch:'RISC-V · RV32IMAC',target:'esp32h2',hz:96000000,flash:4*1024*1024,chipId:16,ram:240*1024,mux:0x60090000,muxOffset:4,source:espDocs('esp32h2','esp32-h2-devkitm-1'),examplePins:{6:11,7:10},reserved:'GPIO13/14: 32 kHz kristal; GPIO6/7: modül flash'},['3V3','RST',0,1,2,3,'NC13','NC14',4,5,'NC','VBAT','G','5V','G'],['G','TX24','RX23',10,11,25,12,8,22,'G',9,'G',27,26,'G']);
add('esp32c5',{name:'ESP32-C5',board:'DevKitC-1 · v1.2 N8R8',arch:'RISC-V · RV32IMAC',target:'esp32c5',hz:240000000,flash:8*1024*1024,chipId:23,ram:304*1024,mux:0x60090000,muxOffset:0,imageOffset:0x2000,source:espDocs('esp32c5','esp32-c5-devkitc-1'),reserved:'GPIO15: N8R8 PSRAM; dahili PSRAM modeli yok'},['3V3','RST',2,3,0,1,6,7,8,9,10,26,25,'5V','G','NC'],['G','TX11','RX12',24,23,'NC15',27,4,5,'NC',28,'G',14,13,'G','NC']);
add('esp32p4',{name:'ESP32-P4',board:'Function-EV · v1.5.2 J1',arch:'RISC-V · RV32IMAF',target:'esp32p4',hz:400000000,flash:16*1024*1024,chipId:18,ram:560*1024,mux:0x500e1000,muxOffset:4,imageOffset:0x2000,source:espDocs('esp32p4','esp32-p4-function-ev-board'),reserved:'J1: GPIO0/1 kristal, GPIO45 SD_PWRn; kamera/LCD/PSRAM/Ethernet model dışı'},['5V','5V','G','TX37','RX38',22,'G',5,4,'G','NC1',36,32,'NC','G',54,'G',46,27,'NC45'],['3V3',7,8,23,'G',21,20,6,'3V3',3,2,'NC0','G','NC',33,26,48,53,47,'G'],'p4');
for(const [family,nums,url]of [
 ['esp32c3',[2,3,4,5,6,7,21,20,8,9,10],'https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/'],
 ['esp32c6',[0,1,2,21,22,23,16,17,19,20,18],'https://wiki.seeedstudio.com/xiao_esp32c6_getting_started/'],
 ['esp32s3',[1,2,3,4,5,6,43,44,7,8,9],'https://wiki.seeedstudio.com/xiao_esp32s3_getting_started/']]){
 const aliases=Object.fromEntries(nums.map((n,i)=>['D'+i,n])),aliasLabels=Object.fromEntries(nums.map((n,i)=>['GPIO'+n,'D'+i+' / '+n]));
 add('xiao-'+family,{name:family==='esp32s3'?'ESP32-S3':family==='esp32c6'?'ESP32-C6':'ESP32-C3',board:'Seeed XIAO',title:'Seeed XIAO '+family.replace('esp32','ESP32-').toUpperCase(),target:family,aliases,aliasLabels,source:url,flash:family==='esp32s3'?8*1024*1024:4*1024*1024,...(family==='esp32c6'?{examplePins:{2:0,3:1,4:22,5:23,6:20,7:2}}:{})},nums.slice(0,7),['5V','G','3V3',...nums.slice(7).reverse()],'xiao');
}
const nanoAliases={D0:44,D1:43,D2:5,D3:6,D4:7,D5:8,D6:9,D7:10,D8:17,D9:18,D10:21,D11:38,D12:47,D13:48,A0:1,A1:2,A2:3,A3:4,A4:11,A5:12,A6:13,A7:14,B0:46,B1:0,LED_BUILTIN:48,LEDR:46,LEDG:0,LEDB:45};
add('nano-esp32',{name:'ESP32-S3',board:'Arduino Nano ESP32',title:'Arduino Nano ESP32 · NORA-W106',target:'esp32s3',aliases:nanoAliases,aliasLabels:Object.fromEntries(Object.entries(nanoAliases).filter(([k])=>!k.startsWith('LED')).map(([k,v])=>['GPIO'+v,k+' / '+v])),source:'https://docs.arduino.cc/resources/pinouts/ABX00083-full-pinout.pdf',flash:16*1024*1024,reserved:'VUSB: açık lehim köprüsü; GPIO45 RGB LED, haricî başlık yok; native GPIO numaraları'},[47,38,21,18,17,10,9,8,7,6,5,'G','RESET',44,43],[48,'3V3',46,1,2,3,4,11,12,13,14,'VUSB',0,'G','VIN'],'nano');
add('esp32c3-devkitc02',{name:'ESP32-C3',board:'DevKitC-02',target:'esp32c3',source:espDocs('esp32c3','esp32-c3-devkitc-02')},['G','3V3','3V3','RST','G',4,5,6,7,'G',8,9,'5V','5V','G'],['G',0,1,2,3,'G',10,'G','RX20','TX21','G',18,19,'G','G']);
add('esp32c6-devkitm1',{name:'ESP32-C6',board:'DevKitM-1',target:'esp32c6',flash:4*1024*1024,source:espDocs('esp32c6','esp32-c6-devkitm-1')},['3V3','RST',2,3,4,5,0,1,8,6,7,14,'G','5V','G'],['G','TX16','RX17',23,22,21,20,19,18,15,9,'G',13,12,'G']);
add('esp32s3-devkitm1',{name:'ESP32-S3',board:'DevKitM-1',target:'esp32s3',source:espDocs('esp32s3','esp32-s3-devkitm-1')},['3V3',0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,'5V','G'],['G','RST',46,45,'RX44','TX43',42,41,40,39,38,37,36,35,34,33,26,21,20,19,48,47]);
add('esp32c3-rust',{name:'ESP32-C3',board:'DevKit-RUST-1',target:'esp32c3',source:'https://github.com/esp-rs/esp-rust-board/blob/master/hardware/esp-rust-board/schematic/esp-rust-board.pdf',reserved:'SHTC3/ICM42670P/WS2812/batarya devresi model dışı'},['RESET','3V3','NC','G',0,1,2,3,4,5,6,7,8,21,20,9],['VBAT','LDO_EN','VBUS','NC','NC','NC','NC','NC',18,19,8,10]);
export const ESP_PROFILES=profiles;
export const PROFILE_PIN_DEFS=Object.fromEntries(profiles.map(p=>[p.id,p.pins]));
export function expandESPBoards(base){const out={...base};for(const p of profiles){const inherited=out[p.target]||{};out[p.id]={...inherited,...p,hz:p.hz||inherited.hz,chipId:p.chipId??inherited.chipId,flash:p.flash||inherited.flash};}return out;}
