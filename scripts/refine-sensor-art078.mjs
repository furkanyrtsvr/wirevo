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
const r=(x,y,w,h,fill,rx=0,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const c=(x,y,r,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
const p=(d,stroke='#c2d2d9',width=.7,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const screw=(x,y,radius=2)=>c(x,y,radius,'#c7d2d8','stroke="#526776" stroke-width=".5"')+p(`M${x-radius*.65} ${y}h${radius*1.3}`,'#3f5360',.7);
const smd=(x,y,body='#bea478')=>r(x,y,4,7,body,.5)+r(x,y,4,1.3,'#d5dee2')+r(x,y+5.7,4,1.3,'#b8c9d1');
const vent=(x,y,w,h,n=5)=>Array.from({length:n},(_,i)=>r(x+i*w/n,y,w/n*.42,h,'#273d42',.7)).join('');
const mesh=(id,x,y,radius,color='#8c9da5')=>`<defs><pattern id="mesh078-${id}" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 0L3 3M3 0L0 3" stroke="${color}" stroke-width=".45"/></pattern></defs>`+c(x,y,radius,`url(#mesh078-${id})`);
function detail(id,m){
 const w=m.width/m.scale;
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
 if(id==='hcSr04')return [37,121].map((x,i)=>c(x,31,24.3,'none','stroke="#dce5e8" stroke-width="1.3"')+c(x,31,21.7,'none','stroke="#5b707d" stroke-width=".8"')+mesh(id+i,x,31,17.5,'#829aa6')+p(`M${x-15} 13A24 24 0 0 1 ${x+14} 12`,'#ffffff',1.2,'opacity=".75"')).join('');
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
 if(id==='ky040')return c(33.5,29,14.7,'none','stroke="#e5ebed" stroke-width="1.1"')+p('M20 19l3 3m20-3-3 3M20 39l3-3m20 3-3-3','#5c7380',1)+r(30.3,16.2,6.4,15,'#bccbd1',1,'stroke="#607886" stroke-width=".7"')+p('M32 18v10','#eaf1f4',1)+screw(16.5,14,1.5)+screw(50.5,46,1.5);
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
 if(id==='stepper28byj')return p('M127 75Q161 90 195 75','#526c7d',1.2)+p('M129 29Q161 14 193 29','#f3f5f3',1,'opacity=".8"')+c(161,36,12.3,'none','stroke="#e6eef0" stroke-width=".8"')+p('M158 25v22','#e9edef',.7)+screw(123,53,2.4)+screw(199,53,2.4)+Array.from({length:5},(_,i)=>r(66.5,27+i*7,3.2,3.5,'#c3d0c5',.4)).join('');
 if(id==='l298n')return p('M52 14H108M52 14V65M108 14V65','#a7b3b8',.7)+screw(80,38,3)+p('M25 64V79M112 64V79','#dde4e1',.6)+c(30.5,67,5.2,'#b1b9b6','stroke="#485b66" stroke-width=".5"')+p('M27 67h7m-3.5-3.5v7','#586c75',.6);
 if(id==='sht31')return r(32,23,16,15,'#c4c6ad',.7,'stroke="#8d9d91" stroke-width=".5"')+r(34,25,12,11,'#6a7770',.4)+vent(35,26,10,9,4)+p('M30 21H50M30 21V39','#edf2df',.6);
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
 const m=CATALOG[id];assert(m?.asset,`Missing asset ${id}`);
 const file=path.join(base,m.asset);let svg=fs.readFileSync(file,'utf8');
 const view=svg.match(/viewBox="([^"]+)"/)[1];
 const pins=new Set((m.pinDefs??[]).flatMap(q=>[q.id,q.name].filter(Boolean)));
 svg=svg.replace(/<g data-refinement078="true">[\s\S]*?<\/g>/g,'');
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
console.log(`Refined ${ids.length} original physical bodies; removed ${labels} tiny pin labels. No manifest or electrical coordinates changed.`);
