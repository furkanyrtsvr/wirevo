// Original CC0 physical-package refinements. Preserve every electrical anchor and display rectangle.
// References describe package families; these are illustrations, not manufacturing footprints.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {TFT_MODULES} from '../dist/tft-hardware.js';
import {OLED} from '../dist/oled-hardware.js';
import {LAB_MODULES} from '../dist/lab-hardware.js';
import {EXPANDED_MODULES} from '../dist/expanded-hardware.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','dist','assets');
export const PACKAGE_ART078_REFERENCES={
  led:'https://www.kingbrightusa.com/webimages/catalog/Through-HoleLED-P17-27.pdf',
  lcd:'https://learn.adafruit.com/character-lcds/lcd-varieties',
  dip:'https://www.ti.com/lit/ds/symlink/sn74hc595.pdf',
  oled:'https://learn.adafruit.com/monochrome-oled-breakouts/overview',
  transistor:'https://www.onsemi.com/pdf/datasheet/p2n2222a-d.pdf',
  trimmer:'https://www.bourns.com/docs/product-datasheets/3296.pdf',
  relay:'https://omronfs.omron.com/en_US/ecb/products/pdf/en-g2r.pdf'
};
const R=(x,y,w,h,fill,stroke='none',sw=.5,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const P=(d,stroke,sw=.5,fill='none',extra='')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${extra}/>`;
const C=(x,y,r,fill,stroke='none',sw=.5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const T=(x,y,t,size=4,color='#d7dfdf',extra='')=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="monospace" font-size="${size}" fill="${color}" ${extra}>${t}</text>`;
const files=new Map();
const add=(names,art,transform=s=>s)=>{for(const name of names.split(' '))files.set(name,{art,transform});};
const smd=(x,y)=>R(x,y,4,2,'#c5bb99','#45524e',.3,.2)+R(x+1,y,2,2,'#484644');
// Discrete components retain their appropriate molded/glass/ceramic form, never a PCB.
add('led-red led-red-on led-green led-blue led-yellow',P('M16.2 15.6Q17.1 11.4 20.2 11.1','#fff',1.1,'none','opacity=".4" stroke-linecap="round"')+P('M15.35 31.6V40.9M24.8 31.6V41','#f3f7fa',.45));
add('resistor-220 resistor-1000 resistor-10000',P('M16.8 3.2Q20 1.8 23 2.9M35 2.9Q38 1.8 41.6 3.2','#fff5d9',.55,'none','opacity=".5"')+P('M1 4.9H13.7M45.2 4.9H57.9','#f3f6f7',.4));
add('capacitor',P('M8 18.5Q9 22 12.8 22.7','#9b602d',.4));
add('inductor',P('M16.1 2.8H49.4','#ffcf99',.65,'none','opacity=".55"')+P('M1.2 6.5H13.7M54.1 6.5H66','#e2edf2',.55));
add('1n4148-do35 bzx55c5v1-do35',P('M15.5 3.2H27.7','#ffdfac',.65,'none','opacity=".75"')+P('M2 5.2H13M35 5.2H46','#eef2f5',.45));
add('p2n2222a-to92',P('M5.5 9.8Q18 4.2 30.4 9.8','#687079',.65)+P('M6 12.1V24','#90969a',.45,'none','opacity=".65"')+T(18,26,'NPN',3.1,'#c4c9c7'));
add('irlz44n-to220',P('M7.1 26.5H40.9M7 27V50','#66707a',.7)+R(13,6.5,22,1,'#f3f4ef')+T(24,49,'N-CH',3.6,'#c1c6c3'));
// Replace schematic symbols with physical controls, without moving the two/five terminals.
const trimmer=R(11,7,27,20,'#176faf','#082c56',.8,1.4)+R(12,8,25,3,'#4390c3','none',0,.8)+C(24.5,16.6,7,'#cdb055','#756124',.7)+C(24.5,16.6,5.6,'#d9c173','#827035',.5)+P('M19.6 16.6H29.4','#534d33',1.7)+P('M5 20H10.7M38 20H43.4','#acb5bc',2.2)+P('M5 19.5H10.7M38 19.5H43.4','#eef3f7',.65)+T(24.5,25,'RVAR',3.3,'#eff5e8');
add('basic-rheostat',trimmer,s=>s.replace(/<g\b[\s\S]*?<\/g>/,''));
const bareRelay=R(4,3,50,32,'#b6bcb9','#9faeac',.7,2)+R(6,5,46,28,'#e2dfc5','#667575',.5,1)+R(9,8,19,21,'#836b4e','#4f4433',.7,2)+Array.from({length:8},(_,i)=>P(`M10 ${10+i*2.2}H27`,'#d59b60',1.1)).join('')+R(14,7,9,23,'#b27e44','none',0,1)+P('M31 26V12H45M34 26L44 15M44 26V13M51 26V22H46','#8a8264',1.7)+C(44,13,1.4,'#d8d6be','#75726a',.5)+P('M5 43V35M14.6 43V35M33.8 43V35M43.4 43V35M53 43V35','#a6b4bd',2.2)+R(5,4,48,30,'#e2f1e7','#e4f5ed',.5,1)+P('M7 6H50M7 6V31','#fff',.6);
// Semi-transparent final cover leaves the coil and contacts visible.
for(const name of ['basic-relay','basic-relay-on']){
  let art=bareRelay.replace('fill="#e2f1e7"','fill="#e2f1e7" fill-opacity=".13"');
  if(name.endsWith('-on'))art=art.replace('M31 26V12H45M34 26L44 15M44 26V13M51 26V22H46','M31 26V12H45M34 26L48 22M44 26V13M51 26V22H46').replaceAll('#d59b60','#edbb71');
  add(name,art,s=>s.replace(/<g\b[\s\S]*?<\/g>/,''));
}
// DIP bodies: chamfer highlights and laser marks, silver legs remain untouched.
for(const [name,label]of Object.entries({'74hc595-dip16':'HC595','74hc165-dip16':'HC165','74hc4050-dip16':'HC4050','mcp23s17-dip28':'MCP23S17','mcp23017-dip28':'MCP23017','mcp3008-dip16':'MCP3008','lm358':'LM358','24lc256':'24LC256'})){
  const p=path.join(root,name+'.svg');if(!fs.existsSync(p))continue;
  const s=fs.readFileSync(p,'utf8'),m=s.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/),w=+m[1],h=+m[2];
  add(name,P(`M12.8 7V${h-7}M13.2 ${h-6.3}H${w-13.2}`,'#657079',.65,'none','opacity=".65"')+P(`M${w-12.7} 9V${h-7}`,'#0b1015',.8)+C(15.4,12,1.1,'#92948b')+T(w/2+2,h/2+1,label,Math.min(4.1,(h-18)/label.length),'#c9ceca',`transform="rotate(-90 ${w/2+2} ${h/2+1})"`),s=>s.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g,''));
}
// Instruments are injection-molded equipment, not blue rectangles.
add('lab-multimeter lab-ohmmeter',P('M9 22V15Q9 9 16 9H134Q141 9 141 16V22M10 143V156Q10 164 18 164H132Q140 164 140 156V143','#e4b94b',3.3)+P('M7 34V137M143 34V137','#f2cb59',3.2)+Array.from({length:4},(_,i)=>P(`M5 ${96+i*5}H9M141 ${96+i*5}H145`,'#a88b3b',1.3)).join('')+C(18,18,1.8,'#333e43','#8e9c9d',.4)+C(132,18,1.8,'#333e43','#8e9c9d',.4));
add('lab-signal-generator',P('M8 17V11Q8 7 13 7H207Q212 7 212 12V18','#d5dde1',1.2)+Array.from({length:6},(_,i)=>P(`M${156+i*7} 117V123`,'#15212a',2)).join('')+C(12,123,1.5,'#9baab3')+C(208,123,1.5,'#9baab3'));
// Display windows remain completely clear: all additions are on the surrounding frame/PCB.
for(const [name,w,h]of [['lcd-8x2-parallel',220,132],['lcd-8x2-i2c',220,132],['lcd-16x2-parallel',302,140],['lcd-16x2-i2c',302,140]]){
  add(name,P(`M18 28H${w-18}`,'#b1b8b1',.7)+P(`M18 28V102M${w-18} 28V102`,'#48535a',1.2)+[18,w-18].map(x=>R(x-2.5,50,5,11,'#838b8a','#343e40',.4,.8)).join('')+P(`M19 24H${w-19}`,'#d5e5d1',.5)+smd(17,h-22)+smd(w-24,h-22),s=>s.replace(/<text\b[^>]*font-size="4"[^>]*>[\s\S]*?<\/text>/g,''));
}
for(const [name,screenH]of [['st7735-tft128x160',149],['st7789-tft240x240',122]]){
  let detail=P(`M12 10H132M12 10V${screenH+8}`,'#f4f4e7',.7)+P(`M132 10V${screenH+8}`,'#6b7c87',1)+R(54,screenH+10,36,1.2,'#c8ac5c')+smd(9,screenH+14)+smd(130,screenH+14);
  if(name==='st7735-tft128x160'){
    // Amber polyimide ribbon and brushed metal lips, observed in the actual product photograph.
    // Nothing enters display [18,16,108,135]; screen exclusion also enforces that invariant.
    detail+=R(11.5,9.5,121,2.4,'#e4e8e5','#8c969b',.3,.6)+R(11.5,12,2.1,143,'#d2d8d6')+R(130.5,12,2.1,143,'#a0adb3')+P('M13 11H131M12.5 13V154','#fff',.65);
    detail+=P('M46 152.5H98L94 167H50Z','#a45f17',.6,'#c98b29')+R(48,153,48,3.1,'#e0b259')+R(50,157.2,44,6.2,'#d39837');
    for(let i=0;i<18;i++)detail+=P(`M${51+i*2.4} 156.5V164.8`,'#9b5d15',.35);
    detail+=R(51,165.2,42,2,'#282a24','#c9bb7a',.4,.3)+P('M49 154H95','#f8d58c',.6);
  }
  add(name,detail);
}
add('ssd1306-128x64',P('M.8 4.7H26.9M.8 4.7V18.3','#6b8791',.12)+P('M2.5 19H5M22.7 19H25.2','#9fbcbd',.18)+R(2.6,19.6,1.2,.65,'#ad9e75','#60746d',.06)+R(23.4,19.6,1.2,.65,'#ad9e75','#60746d',.06));
add('max7219-matrix8',P('M15 16H135M15 16V130','#616b6c',.8)+P('M17 130H133','#111b20',1.2)+smd(8,133)+smd(132,133));
add('max7219-digits8',P('M17 15H257','#6b777a',.8)+P('M17 86H257','#071014',1.2)+smd(8,88)+smd(260,88));
let strip=P('M4 12.7H216M4 37.3H216','#80918a',.55)+C(7.1,25,2.7,'#bc9d54','#dacf98',.5)+C(7.1,25,1.6,'#1a2020')+C(212.9,25,2.7,'#bc9d54','#dacf98',.5)+C(212.9,25,1.6,'#1a2020');
for(let i=0;i<8;i++){
  const x=24+i*24.5;
  // Preserve all 8 pixel centers and their 16px active areas; details sit along the narrow PCB edges.
  strip+=R(x-8.4,16.3,16.8,.7,'#fff7e4')+R(x-8.4,33,16.8,.65,'#a7b1ab')+R(x-2.5,12.8,5,2.2,'#b5a484','#68736d',.25,.2)+R(x-1.5,12.8,3,2.2,'#555246')+P(`M${x-2} 35.9H${x+2}L${x+.5} 34.9M${x+2} 35.9L${x+.5} 36.9`,'#d5ddd4',.45);
}
// The simulator's fixed four terminals are reached by visible leads, not an oversized fictitious PCB.
for(const x of [95.6,105.2,114.8,124.4])strip+=P(`M${x} 38V55`,'#74858c',1.65)+P(`M${x-.25} 38V55`,'#dce4e5',.5)+C(x,55,2.2,'#c6aa5d','#e1d297',.45)+C(x,55,.9,'#27322e');
add('ws2812-strip8',strip,s=>s.replace(/<rect x="2" y="(?:2|12)" width="216" height="(?:44|26)" fill="#[\da-f]+" rx="3"\/>/,'<rect x="2" y="12" width="216" height="26" fill="#111b1a" rx="3"/>').replace(/<path\b[^>]*\/>/g,'').replace(/<text\b[^>]*>[\s\S]*?<\/text>/g,'').replace(/<rect\b(?=[^>]*\by="(?:50.8|53.5)")[^>]*\/>/g,''));
add('bluetooth-hc05',P('M50 15H100M50 15V54','#fff',.65,'none','opacity=".65"')+P('M15 9V33H20V14H25V33H30V14H35V33H40V9','#d5bf62',1.6)+smd(82,63)+smd(91,63));
add('pushbutton-12mm pushbutton-12mm-pressed',P('M14.4 4H52.3M14.4 4V38','#eef3f2',.5,'none','opacity=".6"')+P('M19 22.6A14.6 14.6 0 0 1 33.6 8.2','#aab7bc',.55,'none','opacity=".55"'));
add('potentiometer potentiometer-body',P('M16 30Q17 16 31 12','#d6e3df',.6,'none','opacity=".45"'));
// The adapted relay already has a genuine blue cuboid and terminals: preserve it in all states.
add('relay-module relay-module-powered relay-module-energized',P('M37 9H82M37 9V49','#d7eaff',.45,'none','opacity=".25"'));
export const PACKAGE_ART078_ASSETS=[...files.keys()].map(n=>n+'.svg');
// Hardware metadata is in physical source units, while OLED's asset viewBox is mm.
// Scale both axes from actual viewBox/definition dimensions rather than hardcoding a conversion.
const screenDefinitions=[TFT_MODULES.tft7735,TFT_MODULES.tft7789,OLED,...Object.values(LAB_MODULES),...['lcd8p','lcd16p','lcd8','lcd16','matrix8','digits8'].map(k=>EXPANDED_MODULES[k])];
export const PACKAGE_ART078_SCREENS=Object.fromEntries(screenDefinitions.map(d=>[d.asset,d]));
export function screenExclusion078(asset,viewBox){
  const d=PACKAGE_ART078_SCREENS[asset];if(!d)return null;
  const [, ,w,h]=viewBox,ratioX=w/d.width,ratioY=h/d.height;
  const clean=n=>Math.round(n*1e9)/1e9;
  const x=clean(d.display.x*ratioX),y=clean(d.display.y*ratioY),width=clean(d.display.width*ratioX),height=clean(d.display.height*ratioY);
  return {x,y,width,height,path:`M0 0H${w}V${h}H0Z M${x} ${y}H${clean(x+width)}V${clean(y+height)}H${x}Z`};
}
export function refinePackageArt078(onlyAssets=null){
  const changed=[];
  for(const[name,{art,transform}]of files){if(onlyAssets&&!onlyAssets.includes(name+'.svg'))continue;const p=path.join(root,name+'.svg');if(!fs.existsSync(p))throw Error('Missing package artwork: '+name);const original=fs.readFileSync(p,'utf8');let s=original.replace(/<!--078:start-->[\s\S]*?<!--078:end-->/g,'');s=transform(s);const viewBox=s.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number),exclusion=screenExclusion078(name+'.svg',viewBox);const clip=exclusion?`<defs><clipPath id="art078-display-exclusion" clipPathUnits="userSpaceOnUse"><path d="${exclusion.path}" fill-rule="evenodd" clip-rule="evenodd"/></clipPath></defs>`:'',clipAttribute=exclusion?' clip-path="url(#art078-display-exclusion)"':'';s=s.replace(/<\/svg>\s*$/,`<!--078:start-->${clip}<g data-art078="physical-refinement" pointer-events="none"${clipAttribute}>${art}</g><!--078:end--></svg>\n`);if(s!==original){fs.writeFileSync(p,s);changed.push(name+'.svg');}}
  return changed;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify({refined:refinePackageArt078()}));
