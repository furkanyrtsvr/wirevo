import fs from 'node:fs';
import {photoBody079} from './photo-bodies079.mjs';
import {photoPackage080} from './photo-packages080.mjs';
import {photoBody080} from './photo-bodies080.mjs';
import {bareBody,bareTypes} from './expansion-bare078.mjs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {EXPANSION_MODULES} from '../dist/expansion-hardware.js';

// Deterministic, original vector illustrations. Electrical connector coordinates
// come exclusively from the manifest; artwork never invents extra terminals.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist','assets');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const rect=(x,y,w,h,fill,rx=0,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const circle=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const text=(x,y,t,size=6,fill='#e1f2f7',extra='')=>`<text x="${x}" y="${y}" fill="${fill}" font-family="Arial, sans-serif" font-size="${size}" ${extra}>${esc(t)}</text>`;
const line=(x1,y1,x2,y2,stroke='#4e9b91',width=.6)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}"/>`;
const chip=(cx,cy,w=30,h=24)=>{
 let s=rect(cx-w/2,cy-h/2,w,h,'#1b2630',2,'stroke="#0c151c" stroke-width="1"');
 for(let i=0;i<6;i++)for(const side of[-1,1])s+=rect(cx+side*w/2-(side<0?4:0),cy-h/2+2+i*(h-4)/6,4,1.5,'url(#metal)');
 return s+circle(cx-w/2+3,cy-h/2+3,1.1,'#8996a3');
};
const socket=(x,y)=>rect(x-3.8,y-4.5,7.6,9,'#111d27',.7)+rect(x-2,y-2,4,4,'#d7b24e',.5)+rect(x-.8,y-.8,1.6,1.6,'#26323b',.2);
const passive=(x,y)=>rect(x,y,4,7,'#d0b48d',.6)+rect(x,y,4,1.2,'#ced8df')+rect(x,y+5.8,4,1.2,'#ced8df');
const crystal=(x,y,w=20)=>rect(x-w/2,y-4,w,8,'url(#metal)',3,'stroke="#3c596d" stroke-width=".7"')+line(x-w/3,y-2,x+w/3,y-2,'#f1f5f7',.6);
const screw=(x,y)=>rect(x-6,y-7,12,14,'#2d9bb2',1.4,'stroke="#13495b"')+circle(x,y,3.5,'url(#metal)')+line(x-2.6,y,x+2.6,y,'#334653',1);
const trimmer=(x,y)=>rect(x-7,y-7,14,14,'#3979b0',1)+circle(x,y,4.3,'url(#metal)')+line(x-3,y,x+3,y,'#2d485e',1.1);
// Distinct module silhouettes, inspired by manufacturer photographs rather than
// copies of their photographs, logos, routing, or branding. Coordinates are local.
function distinctive(id,m){
 const w=m.width,cx=w/2;
 if(id==='mfrc522'||id==='pn532'){
  let s='',aw=w*.52,ax=12;
  for(let i=0;i<4;i++)s+=rect(ax+i*3,26+i*3,aw-i*6,43-i*6,'none',5,`stroke="${id==='mfrc522'?'#accbd9':'#eedfc6'}" stroke-width="1.15"`);
  s+=text(ax+aw/2,51,id==='mfrc522'?'13.56 MHz':'NFC',id==='mfrc522'?6:9,'#f2f3e7','text-anchor="middle"');
  s+=chip(w*.79,43,24,24)+crystal(w*.79,64,22);
  s+=passive(w*.66,55)+passive(w*.9,29);
  if(id==='pn532')s+=rect(w*.67,67,28,7,'#172a34',1)+rect(w*.69,68,6,5,'#e4e4d2',.5)+rect(w*.78,68,6,5,'#e4e4d2',.5);
  return s;
 }
 if(id==='dfplayer')return rect(cx-31,25,62,46,'url(#metal)',3,'stroke="#4a6874"')+rect(cx-23,31,46,28,'#1a2a36',1)+rect(cx-20,34,40,22,'#292b32',1)+text(cx,47,'microSD',7,'#eef0e9','text-anchor="middle"')+rect(cx-23,61,46,6,'#3b4850',1)+chip(cx+37,44,11,17);
 if(id==='gps')return rect(cx-31,26,49,44,'#3b515c',2,'stroke="#c1cdd0"')+rect(cx-27,30,41,35,'#bdad7c',2,'stroke="#e5d6a9"')+circle(cx-6.5,47,3.5,'#ccb57b')+rect(cx+24,27,20,22,'url(#metal)',2)+text(cx+34,39,'GNSS',4.5,'#405566','text-anchor="middle"')+circle(cx+34,62,8,'#d0ad4a')+circle(cx+34,62,3.5,'#192a35');
 if(id==='mcp2515')return chip(cx-27,45,40,25)+chip(cx+20,43,18,15)+crystal(cx-24,67,24)+screw(w-21,42)+screw(w-21,59)+rect(14,66,19,5,'#dbc44f',1)+rect(17,65,5,7,'#1b2a32',.5);
 if(id==='a4988'||id==='drv8825'){
  let s=rect(cx-47,23,94,49,id==='a4988'?'#2d825a':'#755295',2,'stroke="#d6d8bd" stroke-width=".7"')+chip(cx-3,46,25,25)+trimmer(cx+28,40);
  for(const y of[29,64])for(let i=0;i<7;i++)s+=circle(cx-39+i*13,y,2.3,'#e1c360')+circle(cx-39+i*13,y,1,'#35443f');
  return s+passive(cx-32,39)+passive(cx-22,52);
 }
 if(id==='tb6612')return chip(cx-12,46,45,26)+screw(w-25,39)+screw(w-25,58)+passive(20,35)+passive(28,49);
 if(['bme280','bme680'].includes(id))return rect(cx-15,30,30,30,'url(#metal)',2,'stroke="#314958"')+circle(cx+7,37,2.4,'#243640')+line(cx-9,50,cx+6,50,'#869d9f',1.1)+passive(cx-32,36)+passive(cx+25,43);
 if(id==='aht20')return rect(cx-20,29,40,35,'#e7e5cf',2,'stroke="#87958d"')+[[-8,-4],[0,-4],[8,-4],[-8,4],[0,4],[8,4]].map(([x,y])=>rect(cx+x-2,46+y-1,4,2,'#6c7e78',.7)).join('')+passive(cx+27,39);
 if(id==='vl53l0x')return rect(cx-18,29,36,34,'#151d25',3,'stroke="#8f98a4"')+circle(cx-8,45,6,'#702b4b')+circle(cx+8,45,7,'#392843')+circle(cx-8,44,2.6,'#c890a6')+circle(cx+8,43,3.2,'#6f789c')+passive(cx+26,36);
 if(id==='tcs34725')return rect(cx-13,31,26,29,'#34383c',2,'stroke="#cad0bd"')+rect(cx-9,35,18,18,'#5d5b68',1)+rect(cx-6,38,6,6,'#8b5563')+rect(cx+1,38,6,6,'#5f9367')+rect(cx-6,45,6,5,'#5a77a7')+rect(cx+1,45,6,5,'#c5c9c9')+circle(cx+29,44,6,'#edf4d3','stroke="#b6bd96"')+passive(cx-31,37);
 if(id==='max30102')return rect(cx-18,30,36,28,'#19252d',2,'stroke="#7b94a4"')+rect(cx-13,35,12,15,'#66233a',1)+rect(cx+3,35,10,15,'#10151e',1)+circle(cx-7,42,3,'#c64550')+passive(cx+27,37)+passive(cx-32,44);
 if(id==='ds3231')return chip(cx-23,45,32,23)+circle(cx+23,46,21,'#6b7c89','stroke="#cbd7dc" stroke-width="1.4"')+circle(cx+23,46,17,'url(#metal)')+text(cx+23,50,'+',13,'#506779','text-anchor="middle"')+crystal(cx-24,65,22);
 if(id==='adxl345')return chip(cx,46,24,24)+line(cx+25,59,cx+40,59,'#e8ecdb',1)+line(cx+25,59,cx+25,41,'#e8ecdb',1)+text(cx+41,60,'X',5)+text(cx+24,38,'Y',5)+passive(cx-30,39);
 if(id==='ina226')return chip(cx-12,46,24,18)+rect(cx+12,31,28,26,'#bac5c9',1,'stroke="#4f6574"')+text(cx+26,47,'R100',5.5,'#344452','text-anchor="middle"')+screw(21,39)+screw(21,59);
 if(id==='ads1115')return chip(cx,45,32,22)+text(cx,47,'ADS1115',5,'#cbd5d9','text-anchor="middle"')+[-36,-27,25,34].map(dx=>passive(cx+dx,37)).join('');
 if(id==='mcp4725')return chip(cx,45,19,15)+passive(cx-24,36)+passive(cx+20,44)+circle(cx+31,31,3,'#d7be61')+circle(cx+31,31,1.4,'#293d43');
 if(id==='pca9685'){
  let s=chip(cx-38,45,35,26);
  for(let i=0;i<16;i++)for(let j=0;j<3;j++)s+=rect(74+i*9.1,30+j*11,7.5,8,j===0?'#c4aa45':j===1?'#b94e55':'#26353c',.6)+circle(77.75+i*9.1,34+j*11,1.2,'#101a22');
  return s+screw(27,44)+screw(43,44);
 }
 if(id==='pcf8574'||id==='cd4067'||id==='fram'||id==='spiFlash')return chip(cx,45,id==='cd4067'?64:46,24)+text(cx,47,{pcf8574:'PCF8574',cd4067:'74HC4067',fram:'FRAM',spiFlash:'W25Q32'}[id],6,'#c1cdd5','text-anchor="middle"')+passive(cx-39,36)+passive(cx+35,45);
 if(id==='levelShift')return [0,1,2,3].map(i=>chip(cx-29+i*19,43,9,11)+passive(cx-31+i*19,60)).join('');
 if(id==='pnp')return rect(cx-17,30,34,28,'#263642',9,'stroke="#758c9b"')+rect(cx-17,47,34,10,'#1a2630')+[-10,0,10].map(dx=>rect(cx+dx-1,57,2,17,'url(#metal)')).join('')+text(cx,44,'PNP',7,'#bfc9d2','text-anchor="middle"');
 if(id==='pmos')return rect(cx-17,22,34,15,'url(#metal)',2)+circle(cx,29,3.5,'#283946')+rect(cx-19,36,38,29,'#1b2934',2)+[-11,0,11].map(dx=>rect(cx+dx-1.3,65,2.6,11,'url(#metal)')).join('')+text(cx,53,'P-MOS',6,'#becbd5','text-anchor="middle"');
 if(id==='optocoupler')return [-1,1].flatMap(side=>[-7,7].map(dy=>rect(cx+side*18-(side<0?6:0),44+dy-1.5,6,3,'url(#metal)'))).join('')+rect(cx-18,29.5,36,29,'#1b2630',2,'stroke="#0c151c"')+text(cx,46,'PC817',7,'#cad4da','text-anchor="middle"')+circle(cx-10,36,1.2,'#cbd4da');
 if(id==='irEmitter')return line(cx-8,64,cx-8,43,'#afc2ce',2)+line(cx+8,64,cx+8,43,'#afc2ce',2)+circle(cx,36,17,'#555578','stroke="#a3b3c6"')+rect(cx-17,46,34,5,'#595d83',2)+circle(cx-6,30,4,'#a4b5d4','opacity=".65"');
 if(id==='irReceiver')return rect(cx-19,31,38,30,'#17252f',7,'stroke="#607e8c"')+circle(cx,42,12,'#141824','stroke="#788199"')+circle(cx-3,39,4,'#434153')+[-10,0,10].map(dx=>line(cx+dx,61,cx+dx,72,'#a4bac6',2)).join('');
 if(id==='rs485')return chip(cx-10,45,31,24)+screw(w-25,38)+screw(w-25,57)+rect(17,58,17,7,'#d2b848',1)+rect(20,57,5,9,'#243540',.5);
 if(id==='i2sMic')return rect(cx-18,27,36,35,'url(#metal)',2)+circle(cx,43,4,'#0f202c')+circle(cx,43,7,'none','stroke="#a2b5bf" stroke-width="1"')+text(cx,71,'MEMS',6,'#dce9e8','text-anchor="middle"');
 if(id==='i2sAmp')return chip(cx-10,46,29,24)+screw(w-26,38)+screw(w-26,58)+passive(20,38)+rect(23,59,11,10,'#2a3b46',1);
 if(id==='water'){
  let s=rect(cx-26,23,52,49,'#9b4436',3,'stroke="#d7b072"');for(let i=0;i<8;i++)s+=line(cx-21+i*6,30,cx-21+i*6,66,'#d6b35d',2);return s;
 }
 if(id==='rain'){
  let s=rect(cx-31,25,62,43,'#31434b',2,'stroke="#c3c9b9"');for(let i=0;i<6;i++)s+=`<path d="M${cx-26} ${30+i*6}h52m-48 -2v4m10 -4v4m10 -4v4m10 -4v4m10 -4v4" stroke="#cbd6be" stroke-width="1.3"/>`;return s;
 }
 if(id==='soilProbe')return rect(cx-27,23,54,14,'#2d5870',2)+rect(cx-23,35,11,39,'#a99752',2)+rect(cx+12,35,11,39,'#a99752',2)+line(cx-17,39,cx-17,69,'#e2cf7a',2)+line(cx+17,39,cx+17,69,'#e2cf7a',2)+chip(cx,30,15,9);
 return null;
}
function terminals(m){
 return m.pins.map(p=>{
  const x=Number(p.x),y=Number(p.y);
  let s=bareTypes.has(m._id)?circle(x,y,1.4,'#c4ccd0'):socket(x,y);
  if(m.kind==='button')return '';

  // Pin names are drawn once by the shared high-contrast workspace layer.
  return `<g data-pin="${esc(p.id)}" data-x="${x}" data-y="${y}">${s}</g>`;
 }).join('');
}
function body(id,m){
 const w=m.width,h=m.height,cx=w/2,cy=h/2;
 const pkg=photoPackage080(id,m);if(pkg)return pkg;
 const photo=photoBody079(id,m);if(photo)return photo;
 const module=photoBody080(id,m);if(module)return module;
 if(m.kind==='button'){
  const p=m.pins.map(p=>rect(p.x<cx?p.x:cx+9,p.y-2,p.x<cx?cx-9-p.x:p.x-cx-9,4,'url(#metal)',.3,`data-pin="${esc(p.id)}" data-x="${p.x}" data-y="${p.y}"`)).join('');
  return p+rect(cx-13.2,8.8,26.4,26.4,'#17232d',2,'stroke="#0b141d"')+rect(cx-11.2,10.8,22.4,22.4,'url(#metal)',1)+[[-9,-9],[9,-9],[-9,9],[9,9]].map(([dx,dy])=>circle(cx+dx,22+dy,1.15,'#324755')).join('')+circle(cx,22,8.3,'#111d27')+circle(cx,m.pressed?22.5:21.6,m.pressed?6.5:6.9,'url(#cap)',`stroke="${m.pressed?'#67c5de':'#91aabd'}" stroke-width="${m.pressed?1.1:.7}"`);
 }
 if(m.kind==='lcd'){
  const d=m.display??{x:20,y:32,width:w-40,height:h-62};
  let s=rect(3,3,w-6,h-15,'url(#green)',4,'stroke="#082c23" stroke-width="1.5"');
  for(const x of[11,w-11])for(const y of[11,h-23])s+=circle(x,y,4,'#c6ad58')+circle(x,y,2,'#142e26');
  s+=rect(d.x-6,d.y-6,d.width+12,d.height+12,'#1b2532',4,'stroke="#9ba5ad" stroke-width="1.5"')+rect(d.x,d.y,d.width,d.height,'#253f95',1);
  const cols=d.columns??20,rows=d.rows??4,cw=d.width/(cols+1),ch=d.height/(rows+.7);
  let dots='';
  for(let py=0;py<7;py++)for(let px=0;px<5;px++)dots+=rect(cw*.6+px*cw*.115,ch*.4+py*ch*.09,cw*.083,ch*.065,'#536ac2',.15);
  s+=`<defs><pattern id="lcd-dot-cells" x="${d.x}" y="${d.y}" width="${cw}" height="${ch}" patternUnits="userSpaceOnUse">${dots}</pattern></defs>`+rect(d.x,d.y,cw*cols,ch*rows,'url(#lcd-dot-cells)');
  return s+text(w/2,18,m.name,8,'#f2f3c5','text-anchor="middle"');
 }
 if(['tft','epaper','touch'].includes(m.kind)){
  const d=m.display??{x:18,y:28,width:w-36,height:h-62};
  const touch=m.kind==='touch',paper=m.kind==='epaper';
  let s=rect(4,4,w-8,h-18,paper?'#244e47':touch?'#225c70':'#225d7b',4,'stroke="#102832" stroke-width="1.4"');
  for(const x of[11,w-11])for(const y of[12,h-25])s+=circle(x,y,3.4,'#bca24f')+circle(x,y,1.8,'#162832');
  s+=rect(d.x-5,d.y-5,d.width+10,d.height+10,touch?'#628993':'#17212a',3,`stroke="${paper?'#a9b0b5':'#6e8493'}" stroke-width="1.1"`);
  s+=rect(d.x,d.y,d.width,d.height,paper?'#e8e8de':touch?'#a3c9cb':'#080e16',touch?1:0);
  if(touch){
   s+=rect(d.x+4,d.y+4,d.width-8,d.height-8,'#88b6bc',1,'stroke="#c9e4e1" stroke-width=".7" opacity=".7"');
   s+=`<path d="M${d.x+7} ${d.y+7}H${d.x+d.width-7}L${d.x+7} ${d.y+d.height-7}Z" fill="#e8f7ee" opacity=".1"/>`;
   for(const[x,y]of[[d.x+12,d.y+12],[d.x+d.width-12,d.y+d.height-12]])s+=line(x-4,y,x+4,y,'#356b79',.6)+line(x,y-4,x,y+4,'#356b79',.6);
  }else if(!paper){
   s+=`<path d="M${d.x+1} ${d.y+1}H${d.x+d.width-1}V${d.y+12}L${d.x+1} ${d.y+28}Z" fill="#162333" opacity=".32"/>`;
  }
  const flexY=d.y+d.height+6,flexH=Math.max(5,h-19-flexY);
  s+=rect(cx-23,flexY,46,flexH,'#b98a31',.5,'stroke="#e0b05b" stroke-width=".5"');
  for(let i=0;i<12;i++)s+=line(cx-20+i*3.6,flexY+1,cx-20+i*3.6,flexY+flexH-1,'#e2bd68',.65);
  if(flexH>13)s+=rect(cx-26,flexY+flexH-8,52,7,'#192a35',1)+rect(cx-24,flexY+flexH-8,48,2,'#758791',.3);
  s+=text(cx,18,touch?'XPT2046 · RESISTIVE TOUCH':paper?'SSD1680 · E-PAPER':'ILI9341 · TFT LCD',Math.min(7,w/32),'#dcece6','text-anchor="middle" font-weight="600"');
  return s;
 }
 if(bareTypes.has(id))return bareBody(id,m,distinctive(id,m));
 const pcb={mfrc522:'#176f9c',pn532:'#ab433c',dfplayer:'#286950',gps:'#215d8b',mcp2515:'#255b8c',a4988:'#29784e',drv8825:'#765091',tb6612:'#843e69',bme280:'#60528e',bme680:'#5b4a83',vl53l0x:'#3f618a',max30102:'#893c4a',pca9685:'#356783'}[id]??['#237e73','#1e617d','#3e5d9b','#7d3d5b','#30674a'][Object.keys(EXPANSION_MODULES).indexOf(id)%5];
 let s=rect(4,4,w-8,h-18,pcb,4,'stroke="#10282b" stroke-width="1.3"');
 for(const x of[11,w-11])s+=circle(x,12,3.1,'#d0b763')+circle(x,12,1.6,'#14232a');
 // No invented fan-shaped traces across the photographed module face.
 s+='<g>';
 const unique=distinctive(id,m);
 if(unique!==null){s+=unique;
 }else if(m.kind==='segment'){
  const n=id==='segment4'?4:1,boxW=Math.min(w-27,n*27+12),start=cx-boxW/2;
  s+=rect(start,22,boxW,51,'#151b22',3,'stroke="#4b5261" stroke-width="1.2"');
  for(let i=0;i<n;i++){
   const x=start+6+i*(boxW-12)/n,dw=(boxW-12)/n-5;
   for(const[a,b,ww,hh]of[[2,0,dw-4,3],[dw-3,3,3,14],[dw-3,21,3,14],[2,35,dw-4,3],[0,21,3,14],[0,3,3,14],[2,17,dw-4,3]])s+=rect(x+a,28+b,ww,hh,'#5e242c',1);
   s+=circle(x+dw+2,65,1.4,'#5e242c');
  }
 }else if(m.kind==='bar'){
  s+=rect(cx-52,27,104,36,'#e4ded2',3,'stroke="#64717c"');
  for(let i=0;i<10;i++)s+=rect(cx-48+i*9.6,31,7.5,28,i<3?'#95484b':i<7?'#77914b':'#b39845',1);
 }else if(m.kind==='rgb'){
  s+=line(cx-15,72,cx-7,55,'#b9c3cc',2)+line(cx-5,72,cx-2,55,'#b9c3cc',2)+line(cx+5,72,cx+2,55,'#b9c3cc',2)+line(cx+15,72,cx+7,55,'#b9c3cc',2);
  s+=circle(cx,42,20,'url(#lens)','stroke="#a1c8cc" stroke-width="1.2"')+circle(cx-6,35,5,'#f3fbff','opacity=".8"')+rect(cx-18,55,36,5,'#b4d2d1',2);
 }else if(m.kind==='buzzer'){
  s+=circle(cx,44,26,'#111922','stroke="#617b8c" stroke-width="1.5"')+circle(cx,43,21,'#202e3a','stroke="#0b121a" stroke-width="2"')+circle(cx,43,6,'#060b10')+text(cx+16,32,'+',9,'#ccdbe5','text-anchor="middle"');
 }else if(id==='dcmotor'){
  s+=rect(cx-25,28,50,39,'url(#metal)',8,'stroke="#3a4d5e"')+rect(cx+23,37,14,8,'#647681',1)+rect(cx+35,39,11,4,'#d4b358',1)+rect(cx-27,33,7,28,'#263745',2);
  s+=line(cx-18,31,cx+16,31,'#edf2f4',1.3)+line(cx-18,62,cx+16,62,'#485d6e',1);
 }else if(m.kind==='probe'){
  s+=rect(cx-26,24,52,21,'#254f61',3,'stroke="#9ab0ac" stroke-width=".6"');
  for(const dx of[-16,9])s+=rect(cx+dx,42,7,33,'#c6b460',1)+line(cx+dx+3,45,cx+dx+3,71,'#edf0ad',.8);
  s+=chip(cx,34,16,10);
 }else if(m.kind==='chip'){
  s+=chip(cx,45,Math.min(w-40,58),32)+text(cx,47,id.toUpperCase(),6,'#98a7b0','text-anchor="middle"');
 }else if(id==='sdCard'){
  s+=rect(cx-26,25,52,42,'url(#metal)',3,'stroke="#344e5d" stroke-width="1.2"')+rect(cx-19,31,38,27,'#182a36',1)+rect(cx-18,58,36,7,'#1e2930',1)+text(cx,48,'microSD',7,'#c1ccd5','text-anchor="middle"');
 }else if(m.kind==='storage'){
  s+=chip(cx,44,43,27)+text(cx,47,id==='spiFlash'?'W25Q32':'MEMORY',6,'#a0afbc','text-anchor="middle"');
 }else if(m.kind==='motor'){
  s+=chip(cx,43,33,29);
  for(let i=0;i<3;i++)s+=rect(cx+25+i*8,29,6,25,'#a6bec5',1,'stroke="#425e67"');
  s+=rect(cx-45,30,22,23,'#4088a0',2,'stroke="#124353"');
  for(const y of[36,47])s+=circle(cx-34,y,3,'#bfd0d5','stroke="#243c49"')+line(cx-36,y,cx-32,y,'#233b49',1);
 }else{
  s+=chip(cx,45,id==='adxl345'?25:34,id==='adxl345'?25:23);
  if(id==='ds3231')s+=circle(cx+32,45,17,'url(#metal)','stroke="#4d6477" stroke-width="1.5"')+text(cx+32,47,'+',11,'#536b7c','text-anchor="middle"');
  if(id==='aht20')s+=rect(cx-10,37,20,16,'#e3dfcc',1)+circle(cx,44,2,'#566b68');
  for(const dx of[-28,27])s+=rect(cx+dx,36,5,10,'#d5b995',.6)+rect(cx+dx,34.5,5,2,'#a8b9c4')+rect(cx+dx,45.5,5,2,'#a8b9c4');
 }
 const label=({mfrc522:'RFID-RC522',pn532:'PN532',mcp2515:'MCP2515',buzzerActive:'ACTIVE BUZZER'}[id]||id.toUpperCase());
 s+='</g>';
 // Preserve the full physical silhouette; live text uses a small lower annotation.
 // Shared workspace pin labels sit outside the package, without opaque bands.
 // No empty black status boxes over the physical artwork.

 s+=text(cx,16,label,Math.min(7,(w-24)/(label.length*.53)),'#f5f9ee','text-anchor="middle" font-weight="600"');
 return s;
}
const defs=`<defs><linearGradient id="clear-epoxy" x2="1" y2=".2"><stop stop-color="#d6e9ec" stop-opacity=".8"/><stop offset=".35" stop-color="#eef9fc" stop-opacity=".55"/><stop offset=".7" stop-color="#a6c1cb" stop-opacity=".65"/><stop offset="1" stop-color="#607c8c" stop-opacity=".9"/></linearGradient><linearGradient id="black-plastic" x2="1" y2="0"><stop stop-color="#131c23"/><stop offset=".4" stop-color="#46515b"/><stop offset="1" stop-color="#152029"/></linearGradient><linearGradient id="metal" x2=".8" y2="1"><stop stop-color="#dce5e9"/><stop offset=".35" stop-color="#869baa"/><stop offset=".6" stop-color="#c4d0d8"/><stop offset="1" stop-color="#637e90"/></linearGradient><linearGradient id="cap" x2=".3" y2="1"><stop stop-color="#748a99"/><stop offset="1" stop-color="#17232e"/></linearGradient><linearGradient id="green" x2="0" y2="1"><stop stop-color="#28765c"/><stop offset="1" stop-color="#164c3b"/></linearGradient><radialGradient id="lens" cx=".3" cy=".25"><stop stop-color="#f1fcff"/><stop offset=".35" stop-color="#b9dfed" stop-opacity=".9"/><stop offset="1" stop-color="#688f9d" stop-opacity=".8"/></radialGradient></defs>`;
for(const[id,definition]of Object.entries(EXPANSION_MODULES)){
 const m={...definition,_id:id};
 if(!/^[-a-zA-Z0-9]+\.svg$/.test(m.asset))throw Error(`Unsafe asset name: ${m.asset}`);
 if(m.asset==='pushbutton-12mm.svg'||m.asset==='pushbutton-12mm-pressed.svg')throw Error('Existing button artwork is protected');
 const svg=`<!-- Original Wirevo vector artwork; generated by scripts/generate-expansion-art.mjs. -->\n<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}" viewBox="0 0 ${m.width} ${m.height}"><title>${esc(m.name)}</title>${defs}${body(id,m)}${terminals(m)}</svg>\n`;
 fs.writeFileSync(path.join(out,m.asset),svg);
 if(id==='tact6')fs.writeFileSync(path.join(out,'tact-6x6-pressed.svg'),`<!-- Original Wirevo pressed tact switch. -->\n<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}" viewBox="0 0 ${m.width} ${m.height}"><title>${esc(m.name)} pressed</title>${defs}${body(id,{...m,pressed:true})}</svg>\n`);
}
console.log(`Generated ${Object.keys(EXPANSION_MODULES).length} original SVG assets.`);
