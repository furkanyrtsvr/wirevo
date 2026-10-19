import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {CATALOG} from '../dist/core.js';

// Add physically specific detail to the existing original artwork, retaining
// its package, display/actuator geometry, connector metal and licence notices.
// This intentionally does NOT turn every sensor into a generic PCB template.
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist/assets');
const ids='ina219,max6675,stepper28byj,l298n,loadcell,dht11,dht22,hx711,tm1637,ky040,keypad4x4,lm35,mq2,flame,sound,pir,irObstacle,tilt,hall,joystick,thermistor,soilCap,hcSr04,servo,sht31,bh1750,mpu6050,bmp280,ds18b20,tmp36,ldr,mhz19,rtc'.split(',');
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
if(only)for(const id of only)assert(ids.includes(id),`Unknown refinement ${id}`);
const r=(x,y,w,h,fill,rx=0,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const c=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const p=(d,stroke='#c2d2d9',width=.7,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const screw=(x,y,radius=2)=>c(x,y,radius,'#c7d2d8','stroke="#526776" stroke-width=".5"')+p(`M${x-radius*.65} ${y}h${radius*1.3}`,'#3f5360',.7);
const smd=(x,y,body='#bea478')=>r(x,y,4,7,body,.5)+r(x,y,4,1.3,'#d5dee2')+r(x,y+5.7,4,1.3,'#b8c9d1');
const vent=(x,y,w,h,n=5)=>Array.from({length:n},(_,i)=>r(x+i*w/n,y,w/n*.42,h,'#273d42',.7)).join('');
const mesh=(id,x,y,radius,color='#8c9da5')=>`<defs><pattern id="mesh078-${id}" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0L3 3M3 0L0 3" stroke="${color}" stroke-width=".45"/></pattern></defs>`+c(x,y,radius,`url(#mesh078-${id})`);
// v080: each of these forms was compared to a downloaded manufacturer photo.
// Private comparison records identify package-family rather than exact references.
const ink=(x,y,t,size=3.5,color='#b9c7cb')=>`<text x="${x}" y="${y}" fill="${color}" font-family="Arial,sans-serif" font-size="${size}" text-anchor="middle">${t}</text>`;
function detail080(id,m){
 if(id==='ina219')return r(34,33,36,29,'#225c45',1)+r(42,29,20,6,'none',.6,'stroke="#d8e5d7" stroke-width=".5"')+r(42,29,3,6,'#bcc9c9',.3)+r(59,29,3,6,'#bcc9c9',.3)+Array.from({length:4},(_,i)=>r(41,42+i*3,6,1.3,'url(#metal)',.15)+r(57,42+i*3,6,1.3,'url(#metal)',.15)).join('')+r(46,40,12,13,'#1a282c',.6)+c(48,42,0.6,'#a2b1b5')+ink(52,48,'219',3)+p('M43 35v3h8m10-3v3h-6','#9eb6a7',.5)+screw(47.2,14,3.6)+screw(56.8,14,3.6)+smd(23,39)+smd(77,42);
 if(id==='max6675')return r(35,32,32,31,'#194466',1)+Array.from({length:4},(_,i)=>r(36,38+i*5,5,2,'url(#metal)',.2)+r(61,38+i*5,5,2,'url(#metal)',.2)).join('')+r(40,35,22,26,'#1d2b33',1)+c(43,38,1,'#9aa9b1')+ink(51,46,'MAX',4)+ink(51,53,'6675',4)+r(38,6,26,20,'#4a9878',2,'stroke="#95b8a0" stroke-width=".6"')+r(38,20,26,6,'#357255',.7)+screw(46.2,14,3.8)+screw(55.8,14,3.8)+smd(22,40)+smd(76,44);
 if(id==='l298n'){
  let s=r(51,13,58,54,'#1a2126',1,'stroke="#596970" stroke-width=".7"');
  for(let i=0;i<8;i++)s+=r(53+i*7,14,3,49,'#303b42',.3)+p(`M${53+i*7} 14v47`,'#8a989f',.6)+p(`M${56+i*7} 15v47`,'#111b22',1.1);
  return s+r(72,32,16,12,'#202b32',1)+screw(80,38,3)+p('M51 66H109','#0d1820',1.5)+[30.5,120].map(x=>c(x,67,5.4,'#bec7c8','stroke="#485f69" stroke-width=".5"')+p(`M${x-3} 67h6m-3-3v6`,'#5c7078',.5)).join('');
 }
 if(id==='loadcell')return p('M5 9H165M5 37H165','#f1f4f5',.8)+r(53,17,57,11,'#647b86',5)+r(60,19,43,7,'#1c323c',3)+p('M56 16h51M59 30h45','#c8d5da',.55)+[15,28,142,155].map(x=>c(x,23.5,4.3,'#435b67','stroke="#c1d0d7" stroke-width="1"')+c(x,23.5,2.6,'#203642')).join('')+r(72,9.5,31,5,'#323c38',.7)+p('M74 10h27','#8e9b8c',.6)+['#a23d3a','#3c4547','#bfc3b4','#467c56'].map((color,i)=>p(`M${77+i*5} 14V44H${70.6+i*9.6}V51`,color,1.4)).join('');
 if(id==='dht11'){
  let s=r(3.1,3.1,37.8,42,'#2b96c9',2,'stroke="#6ab3cb" stroke-width=".65"');
  for(let row=0;row<6;row++)for(let col=0;col<4;col++)s+=r(6+col*8.5,7+row*5.7,5.5,3.6,'#185373',.3)+p(`M${6.4+col*8.5} ${10.7+row*5.7}h4.8`,'#72c3d8',.6);
  return s+p('M5 5H39M4 6V43','#85d0e3',.55)+r(7,41,30,2,'#227aab',.4);
 }
 if(id==='hx711')return p('M23 21H45M23 21v23','#9ea9a5',.65)+c(25,24,1,'#c8cfca')+smd(55,26)+smd(55,43,'#343e41')+r(12,60,21,8,'#a1282f',.5,'stroke="#e1c2b8" stroke-width=".6"')+p('M15 64h6m4 0h5','#d1d6ba',.7)+p('M7 56H53M55 57v23','#e2c7bd',.45)+Array.from({length:4},(_,i)=>c(13+i*13,82,1,'#d6b6a2')).join('');
 if(id==='tm1637')return p('M10.5 12.5H159.5V57.5H10.5Z','#d6d8d0',1.2)+r(11,13.1,148,1.5,'#f0f0e6',.2)+p('M11 58H159','#646e72',.9)+p('M15 60H155','#a6c5cd',.5);
 if(id==='keypad4x4'){
  const chars=['1','2','3','A','4','5','6','B','7','8','9','C','*','0','#','D'];let s='';
  for(let i=0;i<16;i++){
   const x=10+i%4*28,y=20+Math.floor(i/4)*28,red=i%4===3||i===12||i===14;
   s+=r(x,y,24,24,red?'#bd5a4a':'#4e939f',3,'stroke="#d6ded7" stroke-width=".9"')+r(x+1.4,y+1.5,21.2,20.7,'none',2,'stroke="#e1e7dc" stroke-width=".4"')+ink(x+12,y+16,chars[i],11,'#f0f3e4');
  }
  return s+p('M7 8H119V138H7Z','#d6ded8',1.1)+p('M10 11H116V135H10Z','#657774',.45)+Array.from({length:8},(_,i)=>p(`M${29.4+i*9.6} 146V152`,'#e9e9d6',2.4)).join('');
 }
 if(['lm35','tmp36','ds18b20'].includes(id))return '<path d="M5 7Q18 0 31 7V28Q18 34 5 28Z" fill="#1b252b" stroke="#09141a" stroke-width=".6"/>'+r(6,9,24,18,'#263139',1)+p('M7 8Q18 4 29 8','#7e8f98',.55)+p('M7 10V26','#50646f',.5)+ink(18,18,id==='ds18b20'?'DS18B20':id.toUpperCase(),id==='ds18b20'?3.2:4,'#adb9bd')+ink(18,24,'+  24',2.5,'#75858c')+p('M8.4 35V50M18 34V50M27.6 36V50','#d9e2e1',.55);
 if(id==='mq2')return c(38,29,22,'#c8c7b2','stroke="#f4f0d6" stroke-width=".8"')+c(38,29,19.5,'#7e8f88')+mesh(id,38,29,19.2,'#3c4d47')+c(38,29,20.4,'none','stroke="#eee9cc" stroke-width="1.4"')+p('M21 15A23 23 0 0 1 53 13','#fffbee',1.1)+p('M20 44A23 23 0 0 0 55 44','#8b8e78',1.4);
 if(id==='flame')return '<path d="M26 29V17Q26 10 33 10Q40 10 40 17V29Z" fill="#171b26" stroke="#4f596b" stroke-width=".6"/>'+p('M28 17q0-4 4-4','#d6d3dd',.8,'opacity=".65"')+r(25.5,27,15,3,'#303747',.7)+p('M29 31v5M36 31v5','#d1d9d9',.7)+r(9,41,16,17,'#286fba',1)+screw(17,49,3.8)+p('M14.2 46.2l5.6 5.6m0-5.6-5.6 5.6','#e1e7e4',.55);
 if(id==='sound')return c(33,22,13,'url(#metal)','stroke="#e1e8e7" stroke-width="1"')+c(33,22,10,'#1b2224')+'<defs><pattern id="felt080" width="2.8" height="2.8" patternUnits="userSpaceOnUse"><circle cx=".5" cy=".8" r=".3" fill="#657571"/><circle cx="1.9" cy="2.2" r=".2" fill="#a9b5aa"/></pattern></defs>'+c(33,22,9.7,'url(#felt080)')+p('M24 13A13 13 0 0 1 41 12','#f6faf5',.9)+p('M24 32A13 13 0 0 0 42 31','#566f76',1)+r(9,42,16,17,'#286fba',1)+screw(17,50,3.8);
 if(id==='pir'){
  let s='<defs><radialGradient id="dome080" cx=".38" cy=".28" r=".7"><stop stop-color="#ffffff"/><stop offset=".7" stop-color="#e4eae6"/><stop offset="1" stop-color="#bbc9c7"/></radialGradient></defs>'+c(44,39,31,'url(#dome080)','stroke="#b6c7c8" stroke-width=".7"');
  for(let ring=0;ring<3;ring++)for(let i=0;i<12;i++){
   const a=(i+ring*.5)*Math.PI/6,b=a+Math.PI/6,ri=ring*9.6,ro=ri+9.6;
   const xy=[[44+ri*Math.cos(a),39+ri*Math.sin(a)],[44+ro*Math.cos(a),39+ro*Math.sin(a)],[44+ro*Math.cos(b),39+ro*Math.sin(b)],[44+ri*Math.cos(b),39+ri*Math.sin(b)]].map(q=>q.map(v=>v.toFixed(2)).join(',')).join(' ');
   s+=`<polygon points="${xy}" fill="${(i+ring)%3===0?'#ffffff':'#d6e0db'}" fill-opacity=".26" stroke="#c8d4ce" stroke-width=".3"/>`;
  }
  return s+c(44,39,6.5,'#f5f6ee','stroke="#d7dfd5" stroke-width=".5"')+p('M21 19A30 30 0 0 1 66 17','#ffffff',1.1,'opacity=".75"');
 }
 if(id==='irObstacle')return [22,50].map((x,i)=>r(x-6,11,12,22,i?'#141b25':'#27303c',5,'stroke="#63737e" stroke-width=".6"')+r(x-7,29,14,3,'#283743',.6)+p(`M${x-4} 17q0-4 4-4`,'#94aab6',.9,'opacity=".5"')).join('')+r(9,44,16,17,'#367cae',1)+screw(17,52,3.8)+p('M14 49l6 6m0-6-6 6','#e8e9de',.5);
 if(id==='tilt')return r(13,14,18,28,'#62b6ce',7,'stroke="#a4d8dd" stroke-width=".7"')+'<ellipse cx="22" cy="15.5" rx="8.6" ry="2.7" fill="#c4e3de" stroke="#f0f6e7" stroke-width=".5"/>'+p('M16 18v19','#bfe6e5',1.2)+p('M29 18v19','#2b819c',1.2)+r(14,38,16,3,'#2d7f98',1)+screw(45,24,3.8);
 if(id==='hall')return r(25,10,17,19,'#1c262b',2)+p('M26 13l3-2h10l2 2v13','#5c727a',.6)+ink(33.5,20,'3144',3.1,'#9eafb4')+r(25.5,26,16,2,'#111c24',.3)+p('M28.5 30v7M33.5 30v7M38.5 30v7','#d6dedc',.55);
 if(id==='joystick')return '<defs><radialGradient id="rubber080" cx=".35" cy=".25" r=".8"><stop stop-color="#566065"/><stop offset=".5" stop-color="#323b40"/><stop offset="1" stop-color="#151f25"/></radialGradient></defs>'+r(9,32,14,20,'#5a9b91',2)+r(39,67,20,10,'#548c82',1)+c(48,41,24,'#1a252b','stroke="#0d181f" stroke-width="1.2"')+c(48,39.2,20.7,'url(#rubber080)','stroke="#697b81" stroke-width=".7"')+c(48,39,15.1,'#263238','stroke="#52666d" stroke-width=".5"')+p('M33 29A20 20 0 0 1 62 27','#8b9a9e',.7,'opacity=".55"')+screw(24,19,1.7)+screw(72,64,1.7);
 if(id==='thermistor')return p('M27 28V39M39 28V39','#d6e0dc',1.3)+'<ellipse cx="33" cy="22" rx="5.8" ry="8.8" fill="#202a2a" stroke="#526a61" stroke-width=".65"/>'+p('M30 17q1-3 3-3','#a0b4a7',.65)+screw(16,51,3.8);
 if(id==='soilCap')return '<path d="M8 64H50V164L29 173L8 164Z" fill="#24282a" stroke="#62685c" stroke-width=".7"/>'+p('M11 68V162L29 169L47 162V68','#747b69',.45)+r(12,101,34,23,'#24282a',.5)+ink(29,110,'CAPACITIVE',3.5,'#dde0ca')+ink(29,117,'SOIL SENSOR',3.5,'#dde0ca')+p('M8 65H50','#d8ddc1',.6)+smd(10,17)+smd(44,18)+r(23,48,12,5,'#315f47',.5,'stroke="#759a77" stroke-width=".5"');
 if(id==='servo')return r(24,43,46,28,'#174e90',1,'stroke="#649ac4" stroke-width=".6"')+ink(47,53,'MICRO SERVO',4,'#ede6c7')+ink(47,62,'9g',5,'#e4dcae')+p('M22 19V76M72 19V76','#b4d5e7',.9,'opacity=".45"')+p('M20 77H74','#0b2d50',1.2)+screw(28,16,1.7)+screw(66,16,1.7)+p('M25 8H68','#8dbce0',.8);
 if(id==='bh1750')return r(25,20,20,17,'#34423e',1,'stroke="#91a49d" stroke-width=".5"')+r(29,23,12,11,'#e3e7ce',.5)+r(32,25,6,7,'#acb9a6',.25)+r(32.5,25.5,2.1,6,'#d2dcc1',.15)+p('M26 21H44','#c2cec0',.55)+smd(15,24)+smd(51,24,'#3d4845');
 if(id==='mpu6050')return r(33,29,26,23,'#202b31',1,'stroke="#546c77" stroke-width=".5"')+c(36,32,1,'#a6b4bb')+ink(46,39,'MPU',3.8)+ink(46,45,'6050',3.8)+p('M34 30H57M34 30V50','#738893',.6)+smd(17,43)+r(69,18,15,8,'#2d404f',1)+p('M71 19h11','#8999a0',.6);
 if(id==='bmp280')return r(28,19,24,22,'#b5c2bd',1,'stroke="#6e848a" stroke-width=".7"')+p('M29 20H51M29 20V37','#f0f3e9',.8)+c(34,24,1.5,'#263d40','stroke="#dce4d9" stroke-width=".4"')+p('M31 34H49','#90a69f',.45)+r(29,38,22,2,'#526c6c',.2);
 if(id==='ldr')return c(18,18,13.8,'#dfc38b','stroke="#ae865e" stroke-width=".8"')+p('M9 11H25V14H11V17H25V20H11V23H26','#846044',1.5)+p('M10 10H25M10 16H24M10 22H25','#f4dba4',.45)+c(9,11,1.2,'#bac6bd')+c(26,23,1.2,'#bac6bd')+p('M10 7A13 13 0 0 1 27 9','#f8e3b8',.75);
 if(id==='mhz19')return r(13,12,112,49,'#d7b971',3,'stroke="#9c8148" stroke-width=".7"')+r(16,15,106,43,'#e2c78a',1)+p('M16 15H122M16 15V57','#f8e8b7',.9)+p('M16 59H121','#a28342',1.2)+r(20,33,21,18,'#e7dcc0',.5,'stroke="#b59e6a" stroke-width=".6"')+r(23,36,15,12,'#d0c5a7',.4)+r(83,19,22,8,'#c2a369',.5,'stroke="#f2db9a" stroke-width=".5"')+c(95,46,5.8,'#ba9c59','stroke="#f5e1a9" stroke-width=".8"')+c(95,46,2,'#8a723e')+p('M79 13V59','#bd9d59',.65);
 if(id==='rtc')return c(61,30,22,'#899b9e','stroke="#d4dddd" stroke-width=".8"')+c(61,30,19,'#cbd4d2','stroke="#839895" stroke-width=".5"')+r(42,23,5,15,'#647b80',.5,'stroke="#cbd6d3" stroke-width=".6"')+r(77,23,6,15,'#81969b',1,'stroke="#ecf0e9" stroke-width=".6"')+p('M48 19A20 20 0 0 1 74 16','#f4f6eb',1)+ink(61,28,'CR1220',3.7,'#718480')+ink(61,36,'+',8,'#748983')+r(13,53,20,7,'url(#metal)',3)+p('M16 54H30','#f4f6eb',.7);
 return null;
}
function detail(id,m){
 const w=m.width/m.scale;
 const updated=detail080(id,m);if(updated!==null)return updated;
 if(id==='dht22'){
  // The real AM2302/DHT22 has a chamfered mounting ear, not a square PCB.
  let s='<path d="M2.5 18L10 2.5H39L46.5 18V59H2.5ZM28 10a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0Z" fill="#e6e7dc" fill-rule="evenodd" stroke="#a6b4b1" stroke-width=".7"/>';
  s+=p('M3 18H46M10.5 4H38.5','#ffffff',.85)+p('M3 56H46','#a0aba8',.8);
  for(let row=0;row<5;row++)for(let col=0;col<4;col++)s+=r(6+col*9.5,23+row*6,6.8,3.5,'#74817d',.35)+p(`M${6.2+col*9.5} ${26.8+row*6}h6.3`,'#ffffff',.55);
  s+=r(6,54,37,3,'#d1d6cb',.5)+p('M18 18v3h3v-3m4 0v3h3v-3','#b6c1b7',.7);
  return s;
 }
 if(id==='dht11'||id==='dht22'){
  const blue=id==='dht11',h=blue?44:58,body=blue?'#2b91ca':'#e1e4db';
  let s=r(3.1,3.1,w-6.2,h-2.2,body,2.5,'stroke="#94b6bf" stroke-width=".55"');
  // Staggered deep ventilation grille; ribs remain moulded plastic, not a PCB.
  for(let row=0;row<(blue?5:7);row++)for(let col=0;col<3;col++){
   const x=6+col*(w-12)/3,y=7+row*5.8;
   s+=r(x,y,(w-12)/3-2,3.1,blue?'#175579':'#727f7f',.55)+p(`M${x+.5} ${y+3.4}h${(w-12)/3-3}`,blue?'#66b7dc':'#fafaf2',.5);
  }
  return s+p(`M5 5H${w-5}M4.5 6V${h-2}`,blue?'#8fcee5':'#ffffff',.7)+r(w*.46,h-6.5,w*.08,3,blue?'#1a648e':'#b3bfb9',.7);
 }
 if(id==='mq2')return c(38,29,20.7,'none','stroke="#ecf1f2" stroke-width="1.6"')+c(38,29,17.2,'#899b9f')+mesh(id,38,29,16.7,'#334d58')+p('M23 12A22 22 0 0 1 51 14','#ffffff',1.1,'opacity=".65"')+c(38,29,17.2,'none','stroke="#d6e0e3" stroke-width=".7"');
 if(id==='sound')return c(33,22,12.2,'#b3c3ca','stroke="#e8f0f3" stroke-width=".8"')+c(33,22,9.6,'#475b65')+mesh(id,33,22,9.3,'#a4b9c3')+c(33,22,2,'#1b303a')+p('M25 14A11 11 0 0 1 39 12','#ffffff',.8);
 if(id==='hcSr04')return [37,121].map((x,i)=>c(x,31,24.5,'url(#metal)','stroke="#8498a4" stroke-width=".7"')+c(x,31,21.5,'#18232b','stroke="#e2e9e9" stroke-width="1.5"')+mesh(id+i,x,31,20.1,'#54636a')+c(x,31,22.6,'none','stroke="#f3f5f4" stroke-width=".65"')+p(`M${x-15} 13A24 24 0 0 1 ${x+14} 12`,'#ffffff',1.2,'opacity=".8"')+p(`M${x-17} 47A24 24 0 0 0 ${x+17} 47`,'#586f7d',1.3)).join('');
 if(id==='pir'){
  let s=c(44,39,30.8,'#e5ebea','stroke="#a6b9c1" stroke-width=".8"');
  for(let ring=0;ring<4;ring++){
   const inner=ring*7.4,outer=inner+7.4,n=ring?12+ring*4:12;
   for(let i=0;i<n;i++){
    const a=i*Math.PI*2/n,b=(i+1)*Math.PI*2/n;
    const pts=[[44+inner*Math.cos(a),39+inner*Math.sin(a)],[44+outer*Math.cos(a),39+outer*Math.sin(a)],[44+outer*Math.cos(b),39+outer*Math.sin(b)],[44+inner*Math.cos(b),39+inner*Math.sin(b)]].map(q=>q.map(v=>v.toFixed(2)).join(',')).join(' ');
    s+=`<polygon points="${pts}" fill="${['#eef2ef','#dce5e5','#e6edeb','#f7f8f3'][(i+ring)%4]}" stroke="#c3d0d2" stroke-width=".35"/>`;
   }
  }
  return s+c(44,39,5.5,'#f6f8f3','stroke="#c7d5d7" stroke-width=".4"');
 }
 if(id==='ina219')return screw(47.2,14,3.4)+screw(56.8,14,3.4)+r(39,5.5,26,2,'#83ae91',.3)+p('M39 27v5h8m18-5v5h-8','#75a88e',1.2)+smd(23,39)+smd(77,42);
 if(id==='max6675')return screw(46.2,14,3.4)+screw(55.8,14,3.4)+r(38,5.5,26,2,'#76a38e',.4)+p('M39 26v4h7m17-4v4h-7','#7296b1',1)+smd(23,37)+smd(76,43);
 if(id==='loadcell')return p('M6 10H164M6 36H164','#f1f5f6',.65,'opacity=".7"')+[15,28,142,155].map(x=>c(x,23.5,4,'none','stroke="#cdd9df" stroke-width=".7"')+p(`M${x-2.7} 21.4l5.4 4.2`,'#385567',.5)).join('')+r(73,9.8,29,4.3,'#c4c9bb',.4)+Array.from({length:8},(_,i)=>p(`M${75+i*3.2} 10.5v2.8`,'#6c786f',.4)).join('');
 if(id==='hx711')return smd(55,26)+smd(57,44,'#3c4c51')+p('M23 21H45M23 21v23','#647b8a',.6)+c(25,24,1,'#b4c0c7')+r(13,60,20,8,'#366b4e',.6,'stroke="#b6c9a0" stroke-width=".5"')+p('M16 64h5m3 0h6','#d5ddb4',.7);
 if(id==='tm1637')return p('M11 12.8H159M11 13V57M159 13V57','#738087',.65)+p('M12 58H158','#0c151c',1.4)+r(13,13.2,144,1.1,'#c8d3d8',.2,'opacity=".25"');
 if(id==='ky040')return r(14,12,39,38,'#698c7c',3)+r(14,11,39,33,'url(#metal)',2,'stroke="#637e89" stroke-width=".7"')+p('M17 12V41H50V12','#e4ebec',.7)+p('M17 36v8m33-8v8','#536c78',1.4)+c(33.5,29,11.5,'#bbc9cf','stroke="#4d6572" stroke-width=".8"')+r(24.5,24,18,17,'#a0b1ba',3,'stroke="#526f7e" stroke-width=".7"')+Array.from({length:5},(_,i)=>p(`M25 ${27+i*2.4}q8.5 3 17 0`,'#5e7887',.7)+p(`M25 ${27.7+i*2.4}q8.5 3 17 0`,'#e4ebed',.45)).join('')+'<path d="M28 10L31 7.5H37L39 10V29Q33.5 33 28 29Z" fill="url(#metal)" stroke="#768d98" stroke-width=".65"/>'+r(29,11,5,17,'#dde5e7',.5)+p('M35 9V29','#6c8390',.8)+screw(17,15,1.4)+screw(50,40,1.4);
 if(id==='keypad4x4')return Array.from({length:16},(_,i)=>{const x=10+i%4*28,y=20+Math.floor(i/4)*28;return p(`M${x+4} ${y+1.3}h16m-19 2v17`,'#b4ccd8',.65,'opacity=".35"')+p(`M${x+4} ${y+23}h16`,'#0e1e31',1.1);}).join('')+p('M11 141H115','#3d5b7b',.8);
 if(['lm35','ds18b20','tmp36'].includes(id))return p('M5 8Q5 5 9 5H27','#afb6b8',.65,'opacity=".75"')+p('M5 10V27M31 9V27','#151d24',1.3)+p('M8.4 35V50M18 34V50M27.6 36V50','#eef1ef',.45)+r(7,29.3,22,1.2,'#0e171f',.5);
 if(id==='flame')return r(27,11,12,19,'#182332',5,'stroke="#626e80" stroke-width=".6"')+p('M29 15q0-3 3-3','#b4a9c6',1,'opacity=".65"')+r(26,28,14,2.5,'#4c4b62',1)+screw(17,49,3.8);
 if(id==='irObstacle')return p('M18 16q0-4 4-4M46 16q0-4 4-4','#ecf7f5',1,'opacity=".75"')+r(16,30,12,3,'#88aeba',.7)+r(44,30,12,3,'#253242',.7)+screw(17,52,3.8);
 if(id==='tilt')return r(14.3,16,15.4,25,'#397752',3,'stroke="#83a58e" stroke-width=".6"')+p('M17 18v18','#99bf9a',.8)+r(13,13,18,3.2,'#c3cec8',1)+p('M15 14h14','#f4f6eb',.5)+screw(45,24,3.8);
 if(id==='hall')return p('M26 13l3-2h10l2 2v13','#687c82',.7)+p('M29 13h8','#8d9d9b',.5)+r(25.2,25.8,16.3,2.5,'#10212c',.6)+p('M28.5 30v7M33.5 30v7M38.5 30v7','#e1e7e7',.5);
 if(id==='joystick')return c(48,40,16.6,'#293740','stroke="#758891" stroke-width=".6"')+c(48,40,13.1,'#17262f','stroke="#3f5560" stroke-width=".7"')+p('M37 33A14 14 0 0 1 58 32','#95a7af',.7,'opacity=".6"')+screw(24,19,1.7)+screw(72,64,1.7)+r(10,35,3,14,'#648176',.5)+r(42,69,14,2.5,'#648176',.5);
 if(id==='thermistor')return c(33,22,9.1,'#855c44','stroke="#b09370" stroke-width=".7"')+p('M27 17q3-3 7-3','#dbc19b',.85,'opacity=".75"')+p('M30 14l-3 10M35 14l-3 13','#574539',.45,'opacity=".35"')+screw(16,51,3.8);
 if(id==='soilCap')return p('M8 66H50M9 164l20 8 20-8','#edf0ba',.65,'opacity=".55"')+p('M10 68v93l19 8 18-8V69','#8a9c65',.5)+smd(10,17)+smd(44,18)+r(23,48,12,5,'#315f47',.5,'stroke="#759a77" stroke-width=".5"');
 if(id==='servo')return p('M23 17V75M71 18V76','#a2c9e6',.9,'opacity=".45"')+p('M20 77H74','#123655',1.1)+screw(28,16,1.7)+screw(66,16,1.7)+p('M25 8H68','#8dbce0',.8)+r(26,70,42,2,'#aabcc9',.4);
 if(id==='stepper28byj')return r(142,67,38,15,'#386c9a',4,'stroke="#8fb1cc" stroke-width=".7"')+r(117,45,88,15,'url(#metal)',7,'stroke="#718896" stroke-width=".7"')+c(161,53,33,'url(#metal)','stroke="#657f8e" stroke-width="1"')+c(161,51.5,30.5,'#c4cfd1','stroke="#eef2f1" stroke-width=".8"')+p('M139 30A30 30 0 0 1 183 30','#ffffff',.9)+p('M139 73A31 31 0 0 0 184 73','#667e8b',1)+[[-25,-7],[-14,-25],[15,-25],[27,-8],[25,12],[13,27],[-14,27],[-28,9]].map(([dx,dy])=>r(159+dx,51+dy,4,2,'#8d9fa8',.5)).join('')+c(161,36,10,'#96aab5','stroke="#edf2f1" stroke-width="1"')+c(161,36,6.8,'#b5c1c1','stroke="#687e87" stroke-width=".7"')+'<path d="M157.5 25H164.5V39Q161 42 157.5 39Z" fill="#d5d9cc" stroke="#8f9f9b" stroke-width=".6"/>'+p('M158.5 26v11','#f6f5e5',.7)+screw(122,52.5,2.8)+screw(200,52.5,2.8)+Array.from({length:5},(_,i)=>r(66.5,27+i*7,3.2,3.5,'#c3d0c5',.4)).join('');
 if(id==='l298n')return p('M52 14H108M52 14V65M108 14V65','#a7b3b8',.7)+screw(80,38,3)+p('M25 64V79M112 64V79','#dde4e1',.6)+c(30.5,67,5.2,'#b1b9b6','stroke="#485b66" stroke-width=".5"')+p('M27 67h7m-3.5-3.5v7','#586c75',.6);
 if(id==='sht31')return r(29,20,22,21,'#273638',1,'stroke="#839793" stroke-width=".5"')+r(32,23,16,15,'#f0f0e4',1,'stroke="#c3cdc4" stroke-width=".55"')+p('M34 24H45M33 25V35','#ffffff',.7)+p('M25 21v20m30-20v20','#0f3030',1.7)+p('M26.5 21v20m27-20v20','#568572',.5);
 if(id==='bh1750')return r(29,23,12,11,'#e5e5c9',.6,'stroke="#8d9d99" stroke-width=".5"')+r(32,25,6,7,'#899c9d',.2)+r(32.5,25.5,2,6,'#bbc7ba',.1,'opacity=".6"')+p('M26 21H44','#adb9ba',.55);
 if(id==='mpu6050')return p('M34 30H57M34 30V50','#6f7d86',.65)+c(36.5,33,1.1,'#b7c5ca')+smd(17,43)+r(69,18,15,8,'#2d404f',1)+p('M71 19h11','#8999a0',.6);
 if(id==='bmp280')return p('M29 20H51M29 20V37','#f2f4ef',.7)+r(30,21,20,16,'#bac4c0',.7,'stroke="#899f9f" stroke-width=".5"')+c(34,24,1.4,'#213941','stroke="#e0e7df" stroke-width=".4"')+p('M32 33h15','#8a9e9d',.4);
 if(id==='ldr')return c(18,18,13.4,'none','stroke="#f0d59d" stroke-width=".9"')+p('M10 8A13 13 0 0 1 26 8','#f7e3b7',.8)+p('M9 11H25M11 14h12M11 17h12M11 20h12M11 23h15','#ead3a6',.4,'opacity=".6"');
 if(id==='mhz19')return p('M16 15H122M16 15V57M122 16V57','#f4df8d',.8)+p('M20 59H118','#8c682e',1.3)+Array.from({length:8},(_,i)=>p(`M${26+i*10.5} 24v22`,'#2b3227',1.3)).join('')+screw(18,16,1.8)+screw(120,57,1.8);
 if(id==='rtc')return c(61,30,20.2,'none','stroke="#c7d5dc" stroke-width=".7"')+p('M45 19A20 20 0 0 1 76 19','#f4f7f8',1.1)+r(79,25,6,13,'#8b9da5',1,'stroke="#dce5e9" stroke-width=".6"')+r(40,25,5,13,'#758892',1)+p('M14 54h17','#f3f4ee',.8)+smd(18,9);
 throw Error(`No refinement for ${id}`);
}
let labels=0;
for(const id of ids){
 if(only&&!only.includes(id))continue;
 const m=CATALOG[id];assert(m?.asset,`Missing asset ${id}`);
 const file=path.join(base,m.asset);let svg=fs.readFileSync(file,'utf8');
 const view=svg.match(/viewBox="([^"]+)"/)[1];
 const pins=new Set((m.pinDefs??[]).flatMap(q=>[q.id,q.name].filter(Boolean)));
 svg=svg.replace(/<g data-refinement078="true">[\s\S]*?<\/g>/g,'');
 // Photo-dependent body material corrections; the original sockets and pin
 // coordinates stay intact. Replacements are intrinsically idempotent.
 if(id==='hx711')svg=svg.replace(/(<rect x="2" y="2" width="74" height="87" fill=")[^"]+/,'$1#b82935');
 if(id==='tm1637')svg=svg.replace(/(<rect x="10" y="12" width="150" height="46" fill=")[^"]+/,'$1#1b2329');
 if(id==='keypad4x4')svg=svg.replace(/(<rect x="2" y="2" width="122" height="144" fill=")[^"]+/,'$1#263533');
 if(['lm35','tmp36','ds18b20'].includes(id))svg=svg.replace(/<text\b[^>]*>TO-92<\/text>/g,'');
 if(id==='thermistor')svg=svg.replace(/<circle cx="33" cy="22"[^>]*\/>/g,'');
 if(['ina219','max6675','servo'].includes(id))svg=svg.replace(/<text\b[^>]*>(?:SHUNT ADC|EXTERNAL SHUNT|EXTERNAL K-TC|MICRO SERVO|SERVO|9g)<\/text>/g,'');
 if(id==='dht22')svg=svg.replace(/<rect\b([^>]*)\/>/g,(all,a)=>Number(a.match(/y="([\d.]+)"/)?.[1])<60?'':all).replace(/<text\b[^>]*>DHT22<\/text>/g,'');
 if(id==='stepper28byj')svg=svg.replace(/<rect\b[^>]*x="(?:119|121|157)"[^>]*\/>/g,'').replace(/<circle\b[^>]*cx="(?:161|123|199)"[^>]*\/>/g,'').replace(/<text\b[^>]*>(?:GEARED|STEPPER)<\/text>/g,'');
 svg=svg.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g,(all,a,t)=>{
  const size=Number(a.match(/font-size="([\d.]+)"/)?.[1]);
  if(size<=5.5&&pins.has(t.trim())){labels++;return '';}
  return all;
 });
 const art=detail(id,m);assert(art.length>80,`Insufficient physical refinement ${id}`);
 svg=svg.replace('</svg>',`<g data-refinement078="true">${art}</g></svg>`);
 assert.equal(svg.match(/viewBox="([^"]+)"/)[1],view);
 assert(!svg.includes('NaN')&&!svg.includes('undefined'),`Invalid numeric geometry ${id}`);
 fs.writeFileSync(file,svg);
 console.log(`${id}: ${m.asset}`);
}
console.log(`Refined ${only?.length??ids.length} original physical bodies; removed ${labels} tiny pin labels. No manifest or electrical coordinates changed.`);
