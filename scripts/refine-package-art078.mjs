// Original CC0 physical-package refinements. Preserve every electrical anchor and display rectangle.
// References describe package families; these are illustrations, not manufacturing footprints.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {TFT_MODULES} from '../dist/tft-hardware.js';
import {OLED} from '../dist/oled-hardware.js';
import {LAB_MODULES} from '../dist/lab-hardware.js';
import {EXPANDED_MODULES} from '../dist/expanded-hardware.js';
import {CATALOG} from '../dist/core.js';
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
// v080: each package family was compared against downloaded real product photographs.
// Private photograph provenance lives outside dist in .sites-runtime/reference-photos/v080-packages.
// Physical body materials may be opaque; no opaque label or status-panel rectangles are introduced.
export const PACKAGE_ART080_PARTS={
  bluetooth:{assets:['bluetooth-hc05.svg'],changes:['Replace fictitious RF shield with actual exposed QFP package and tinned perimeter leads','Refine gold meander antenna, crystal and translucent sleeve edge']},
  signalgen:{assets:['lab-signal-generator.svg'],changes:['Light molded instrument face with reinforced rubber corners','Knurled control-ring marks and steel BNC ferrule; generic instrument family, not a SIGLENT replica']},
  multimeter:{assets:['lab-multimeter.svg'],changes:['Light injection-molded face with separate protective jacket','Radial range marks and metallic socket rims; generic meter family']},
  ohmmeter:{assets:['lab-ohmmeter.svg'],changes:['Light molded resistance-meter face and protective case','Separate range-ring ticks and bright terminal ferrules; virtual generic instrument']},
  switch:{assets:['basic-switch.svg','basic-switch-closed.svg'],changes:['Folded steel case lips and mounting crimps over black slide-switch body','Preserve separate OFF/ON thumb positions and fixed two terminals']},
  rheostat:{assets:['basic-rheostat.svg'],changes:['Blue molded ribbed adjustment wheel instead of gold screw-cap look','Preserve two lead endpoints and configurable resistance']},
  coilRelay:{assets:['basic-relay.svg','basic-relay-on.svg'],changes:['Graphite molded relay shell and corner seams instead of open schematic cutaway','Distinct subdued mechanical status flag without changing coil/contact terminals']},
  diode:{assets:['1n4148-do35.svg'],changes:['Translucent amber glass meniscus and internal electrode hints','Bright tinned axial-lead edge; black cathode band retained']},
  zener:{assets:['bzx55c5v1-do35.svg'],changes:['DO-35 glass-package meniscus and electrode highlights from same physical family','Cathode band and distinct zener model retained']},
  hc595:{assets:['74hc595-dip16.svg'],changes:['Folded tinned PDIP leads meet molded body','Graphite body edge, pin-one notch and ejector marks']},
  hc165:{assets:['74hc165-dip16.svg'],changes:['Folded tinned PDIP-16 leads and graphite mold parting edge','Family photo reused without copying unrelated chip identity']},
  mcp23s17:{assets:['mcp23s17-dip28.svg'],changes:['Folded PDIP-28 leads and recessed ejector circles','MCP23017 package-family photo only; SPI identity retained']},
  tft7789:{assets:['st7789-tft240x240.svg'],changes:['Bright stamped metal frame lips around the unchanged square active screen','Amber flex with copper traces and dark connector below the glass']},
  hc4050:{assets:['74hc4050-dip16.svg'],changes:['Realistic bent tinned PDIP-16 lead knees and matte black plastic edge','Model name and all sixteen physical lead anchors retained']},
  mcp23017:{assets:['mcp23017-dip28.svg'],changes:['Molded graphite PDIP-28 body with subtle circular ejector marks','Individual bent silver leads refined from actual MCP23017 photograph']},
  lcd8p:{assets:['lcd-8x2-parallel.svg'],changes:['Black folded-metal bezel and light side retention clips','More saturated green PCB solder mask, no changes to 8x2 window or sixteen terminals']},
  lcd16p:{assets:['lcd-16x2-parallel.svg'],changes:['Folded black metal frame with retaining lips and plated corner-hole highlights','Green solder-mask material refined while keeping 16x2 pixel region and sixteen terminals']},
  lcd8:{assets:['lcd-8x2-i2c.svg'],changes:['8x2 folded bezel and side retention clips','Preserve four-terminal I2C variant and existing active text window']},
  lcd16:{assets:['lcd-16x2-i2c.svg'],changes:['Green PCB material and folded black bezel with silver retention tabs','Preserve I2C terminal positions and 16x2 text region']},
  mcp3008:{assets:['mcp3008-dip16.svg'],changes:['Graphite PDIP-16 mold edges with individual tinned lead knees','ADC identity and channel pinout retained despite shared package-family photograph']},
  matrix8:{assets:['max7219-matrix8.svg'],changes:['Off-white molded matrix package sidewall behind black LED face','Beveled outer lips without touching the 8x8 active LED grid']},
  digits8:{assets:['max7219-digits8.svg'],changes:['Cream molded seven-segment package sidewall and subtle eight-body joints','Keep all eight active digits and SPI connector geometry unchanged']},
  opamp:{assets:['lm358.svg'],changes:['Matte molded PDIP-8 body, ejector mark and folded silver leads','Generic PDIP-8 photograph used only for package, not ATtiny silicon identity']},
  capacitor:{assets:['capacitor.svg'],changes:['Smooth yellow ceramic encapsulation and glossy upper edge','Preserve nonpolar radial model and both metal leads; no false fixed capacitance marking']},
  inductor:{assets:['inductor.svg'],changes:['Replace exposed gold coil with dense red insulated thread winding and black ferrite bobbin shoulders','Whole axial assembly fitted inside original 67.2x14.4 viewBox; preserve two endpoints and configurable inductance']},
  led:{assets:['led-red.svg','led-red-on.svg','led-green.svg','led-blue.svg','led-yellow.svg'],changes:['Epoxy flange highlight, internal anvil edge and bright formed lead edges','All color and powered variants retain optical center and electrical endpoints']},
  resistor:{assets:['resistor-220.svg','resistor-1000.svg','resistor-10000.svg'],changes:['Rounded lacquer end-cap highlights and brighter tinned axial lead edges','Existing resistance color bands retained in every value variant']},
  button:{assets:['pushbutton-12mm.svg','pushbutton-12mm-pressed.svg'],changes:['Stamped-metal side lips, crimp dimples and pressed/unpressed cap highlights','All four contact anchors and click-target geometry preserved']},
  pot:{assets:['potentiometer.svg','potentiometer-body.svg'],changes:['Remove fictitious blue PCB and white disc; draw bare gold-brown metal casing, phenolic wafer and threaded metal shaft/nut','Preserve runtime rotary pivot at 37.795276,30.23622 and all three original terminal endpoints']},
  npn:{assets:['p2n2222a-to92.svg'],changes:['TO-92 flat front with molded seam and rounded shoulder bevel','Individual formed silver lead shoulders retained in C/B/E order']},
  mosfet:{assets:['irlz44n-to220.svg'],changes:['Brushed metal tab edge and molded black package shoulders','Three bright folded lead knees; hole and drain-tab connector remain clear']},
  relay:{assets:['relay-module.svg','relay-module-powered.svg','relay-module-energized.svg'],changes:['Match actual Pololu package materials: green PCB, graphite black relay case and blue screw-terminal block','Preserve original input/contact anchors and powered/contact LED states across all three variants']},
  spdt:{assets:['slide-switch-left.svg','slide-switch-right.svg'],changes:['Silver folded case rails over black molded base','Preserve left/right selector travel and all three leg anchors']},
  oled:{assets:['ssd1306-128x64.svg'],changes:['Amber flex tails and dark bonded driver region below glass','Fine glass edge and plated mounting-hole material; active 128x64 aperture excluded']},
  eeprom:{assets:['24lc256.svg'],changes:['PDIP-8 black mold seam and ejector mark','Folded tinned legs preserve all EEPROM pins and identity']}
};
export const PACKAGE_ART080_ASSETS=Object.values(PACKAGE_ART080_PARTS).flatMap(p=>p.assets);
const amend080=(id,extra,transform=s=>s,replace=false)=>{
  for(const asset of PACKAGE_ART080_PARTS[id].assets){const name=asset.replace(/\.svg$/,''),old=files.get(name)||{art:'',transform:s=>s};files.set(name,{art:(replace?'':old.art)+`<g data-art080="${id}">${typeof extra==='function'?extra(asset):extra}</g>`,transform:s=>transform(old.transform(s))});}
};
// Used only when the old package itself is the mismatch. Root size/viewBox and all catalogue anchors stay intact.
const emptyPackageBody080=s=>{const at=s.indexOf('<svg'),end=s.indexOf('>',at);return s.slice(0,end+1)+'<!-- Original Wirevo physical-package illustration. Electrical anchors retained. --></svg>';};
// An HC-05 module has an exposed controller IC, not a large metal RF can.
let qfp='';for(let i=0;i<9;i++)qfp+=R(45.5,16+i*4.3,3,1.7,'#b9c0b8')+R(101.5,16+i*4.3,3,1.7,'#b9c0b8');for(let i=0;i<10;i++)qfp+=R(52+i*4.5,10.6,1.7,2.8,'#b9c0b8')+R(52+i*4.5,55.6,1.7,2.8,'#b9c0b8');
amend080('bluetooth',qfp+P('M18 14H36V19H22V24H36V29H22V34H36','#d7bd59',1.65)+R(82,64,15,5,'#bdc3bd','#626f72',.45,1.1)+P('M15 10H105M15 10V71','#c2e3e0',.7,'none','opacity=".35"'),s=>s.replace('fill="url(#shield)" stroke="#788c99"','fill="#23282a" stroke="#111818"').replace(/<path d="M19 13h19[\s\S]*?\/>/,'').replaceAll('fill="#3b5262"','fill="#d4d5c7"').replaceAll('fill="#566d7d"','fill="#afb4aa"'),true);
const radial=(cx,cy,r,n,color)=>Array.from({length:n},(_,i)=>{const a=(i/(n-1)*260-220)*Math.PI/180;return P(`M${cx+Math.cos(a)*r} ${cy+Math.sin(a)*r}L${cx+Math.cos(a)*(r+2)} ${cy+Math.sin(a)*(r+2)}`,color,.65);}).join('');
amend080('signalgen',radial(154,107,18,19,'#d2d6d1')+C(55,126,7.6,'none','#d2d8d4',1)+P('M8 10H28M8 10V25M192 10H212V25M8 117V135H27M193 135H212V117','#4c5558',3.4),s=>s.replace('fill="#2d3b47"','fill="#d2d7d1"'));
amend080('multimeter',radial(75,123,27,16,'#4b5955')+C(29,166,8.1,'none','#d1d2c9',.8)+C(121,166,8.1,'none','#d1d2c9',.8),s=>s.replace('fill="#294353"','fill="#d9ded9"'));
amend080('ohmmeter',radial(75,126,25,14,'#5b6052')+C(43,166,8.1,'none','#d1d2c9',.8)+C(107,166,8.1,'none','#d1d2c9',.8),s=>s.replace('fill="#514a35"','fill="#c6ccbf"'));
amend080('switch',P('M12 2H37V25M12 2V10','#bdc3bd',.85)+R(11.5,23.7,25.5,.8,'#929b95')+P('M13 3V5M36 3V5M13 23V25M36 23V25','#e0e2d8',1.3));
let ribs='';for(let i=0;i<18;i++){let a=i*Math.PI/9;ribs+=P(`M${24.5+Math.cos(a)*6.1} ${16.6+Math.sin(a)*6.1}L${24.5+Math.cos(a)*7.1} ${16.6+Math.sin(a)*7.1}`,'#76c5e8',.5);}
amend080('rheostat',C(24.5,16.6,7.3,'#2189c1','#0e3e69',.6)+ribs+C(24.5,16.6,5.3,'#328fbe','#64bde0',.5)+P('M20.1 16.6H28.9','#0c4565',1.5));
amend080('coilRelay',asset=>R(4.4,3.5,49.2,30.8,'#2b2e2e','#111918',.6,1.4)+P('M5.2 4.5H52.3M5.2 4.5V32.8','#6f7771',.65)+P('M6 32.5H51.8','#151b1c',1.1)+T(29,18,'RELAY',5.4,'#bac0b2')+T(29,25,'SPDT',3.5,'#929b8e')+C(47,8.5,1.5,asset.includes('-on')?'#ce9c55':'#565c55'));
for(const id of ['diode','zener'])amend080(id,P('M16 3.6Q24 2.8 32 3.6','#ffe0b5',.55,'none','opacity=".7"')+P('M15.1 5.9H19M24 5.9H28.7','#765344',1.1)+P('M16 8.8H28','#9c3f24',.55)+P('M2 6.8H13M35 6.8H46','#6d7779',.45));
for(const id of ['hc595','hc165','mcp23s17','hc4050','mcp23017','mcp3008','opamp','eeprom']){
  const def=CATALOG[id],h=def.height/def.scale;let knees='';for(const pin of def.pinDefs){const x=pin.x/def.scale,y=pin.y/def.scale,left=x<22;
    knees+=P(left?`M8.7 ${y-1.4}H11.4L12.2 ${y-.6}V${y+1.4}H8.7`:`M36.1 ${y-1.4}H33.4L32.6 ${y-.6}V${y+1.4}H36.1`,'#bac4c4',.55,'#929d9b')+P(left?`M9 ${y-1}H11.5`:`M33.4 ${y-1}H35.9`,'#f1f3e9',.5);}
  amend080(id,knees+C(22.4,17,3.1,'none','#474d49',.45)+(h>65?C(22.4,h-17,3.1,'none','#474d49',.45):'')+P(`M12.5 6.5V${h-7}M32.1 7V${h-7}`,'#4b504c',.55),s=>s.replaceAll('stop-color="#4c5a62"','stop-color="#424641"').replaceAll('stop-color="#26333b"','stop-color="#292d2a"').replaceAll('stop-color="#141f27"','stop-color="#151b19"'));
}
amend080('tft7789',R(11.6,9.4,120.8,2.3,'#e1e6e0','#8a9599',.35,.4)+P('M12.5 12V128M131.6 12V128','#cbd4d2',1.1)+P('M46 125.5H98L94 140H50Z','#ad731e',.55,'#c6953d')+Array.from({length:18},(_,i)=>P(`M${51+i*2.4} 129V139`,'#966222',.32)).join('')+R(51,139.5,42,2.2,'#282b26','#c6b16c',.4));
for(const id of ['lcd8p','lcd16p','lcd8','lcd16']){const d=CATALOG[id],w=d.width/d.scale;amend080(id,P(`M18 27H${w-18}V103H18Z`,'#111a1c',1.4)+P(`M19 28H${w-19}`,'#a4adaa',.7)+P(`M19 103H${w-19}`,'#020b0b',1.4)+R(16,49,4.1,10,'#a6aca4','#4d5754',.45,.4)+R(w-20.1,49,4.1,10,'#a6aca4','#4d5754',.45,.4)+P(`M6.1 6.2L9.4 9.3M${w-9.4} 6.2L${w-6.1} 9.3`,'#e2d5a3',.55),s=>s.replaceAll('stop-color="#28664a"','stop-color="#24754c"').replaceAll('stop-color="#15422f"','stop-color="#11452e"'));}
amend080('matrix8',R(13,14,122,2.5,'#d4d5c9')+R(13,131,122,2.6,'#b4b7aa')+R(13,17,2.6,113,'#c4c7b9')+R(132.4,17,2.6,113,'#949c91'));
amend080('digits8',R(11,17,252,2.3,'#cfd1c4')+R(11,75.8,252,3.8,'#d6d5c4')+Array.from({length:7},(_,i)=>P(`M${44+i*31} 76V79.6`,'#798075',.45)).join(''));
amend080('capacitor',P('M7.4 12.5Q8.7 6.5 14.4 5.3','#fff0b8',.8,'none','opacity=".7"')+P('M8.1 23.2L9.6 27M20.7 23.2L19.2 27','#c7c6aa',1.2),s=>s.replaceAll('stop-color="#edb778"','stop-color="#f6d873"').replaceAll('stop-color="#c98a49"','stop-color="#d1aa43"').replaceAll('stop-color="#855526"','stop-color="#9a7629"'));
let windings='';for(let i=0;i<48;i++)windings+=P(`M${18.1+i*.66} 2.4Q${17.5+i*.66} 7.2 ${18.1+i*.66} 12.1`,i%4?'#9c453c':'#d4775b',.39);
const redChoke=P('M4.8 7.2H62.4','#59635f',2.2)+P('M4.8 6.95H62.4','#d6dcd3',.85)+R(12.8,4.1,6.8,6.2,'#202b24','#0d1813',.45,1.2)+R(47.6,4.1,6.8,6.2,'#202b24','#0d1813',.45,1.2)+R(17.1,1.5,33,11.4,'#8f382e','#622b27',.45,2.8)+windings+P('M18.5 4.2Q33 7 49 3.8M18.2 9.1Q32 7.8 49.1 10.4','#c36950',.3)+P('M14 5H16M51.8 5H53.1','#55645a',.45);
amend080('inductor',redChoke,emptyPackageBody080,true);
amend080('led',P('M13 29.9Q20 33 27.4 29.9','#d8e1ce',.5,'none','opacity=".65"')+P('M17.1 24.3L20.4 20.5L23.1 24.3','#d5d8bb',.55,'none','opacity=".52"')+P('M15.5 33.5V41.6M24.8 33.5V41.6','#b4bfbd',.7));
amend080('resistor',P('M13.8 4.4Q15.1 2 17.8 2.3M41.3 2.3Q44 2 45.3 4.4','#f4e4c3',.55)+P('M2 6.1H12.8M46 6.1H57.6','#8b9491',.45));
amend080('button',P('M12.4 8V36M54.6 8V36','#e6e8dd',1)+P('M14 14H16M14 31H16M51.1 14H53.1M51.1 31H53.1','#687371',1.2)+P('M21 14.3Q25 9.9 31 9.4','#aeb6b0',.55,'none','opacity=".7"'));
const pcx=37.795276,pcy=30.23622,potTerminals=[29.026772,38.626772,48.226772];
let barePot='<defs><linearGradient id="pot080-metal"><stop stop-color="#68736d"/><stop offset=".2" stop-color="#e0e3d8"/><stop offset=".45" stop-color="#9da79e"/><stop offset=".7" stop-color="#d5dbcd"/><stop offset="1" stop-color="#707c75"/></linearGradient><linearGradient id="pot080-case" x2="0" y2="1"><stop stop-color="#b6a273"/><stop offset=".45" stop-color="#9a8658"/><stop offset="1" stop-color="#655d3b"/></linearGradient></defs>';
barePot+=C(pcx,41.1,27.6,'url(#pot080-case)','#4e5037',.9)+P('M14.8 43Q37.8 35.7 60.8 43L60.8 60.8Q37.8 69.1 14.8 60.8Z','#76532b',.65,'#b48748')+P('M15.7 44Q37.8 37.9 59.9 44','#dcc58a',.65)+P('M14.9 58.5Q37.8 66.2 60.5 58.5','#6c4c28',.7);
// Six-sided retaining nut leaves the runtime's white position indicator legible around the metal shaft.
barePot+=P(`M${pcx-23.8} ${pcy-12.8}L${pcx} ${pcy-24.7}L${pcx+23.8} ${pcy-12.8}V${pcy+12.8}L${pcx} ${pcy+24.7}L${pcx-23.8} ${pcy+12.8}Z`,'#69746b',.8,'url(#pot080-metal)')+P(`M${pcx-22.4} ${pcy-12}L${pcx} ${pcy-23.1}L${pcx+22.4} ${pcy-12}`,'#edf0e3',.75)+C(pcx,pcy,17,'#8a9389','#515e54',.7)+C(pcx,pcy,14.4,'url(#pot080-metal)','#c6cec0',.65)+C(pcx,pcy,10.5,'#a8b1a5','#566359',.7);
for(let i=0;i<16;i++){const a=i*Math.PI/8;barePot+=P(`M${pcx+Math.cos(a)*9.4} ${pcy+Math.sin(a)*9.4}L${pcx+Math.cos(a)*10.5} ${pcy+Math.sin(a)*10.5}`,'#5e6b62',.65);}
barePot+=P(`M${pcx-8.6} ${pcy+3.7}L${pcx+8.6} ${pcy-3.7}`,'#4c5851',2.3)+P(`M${pcx-8.4} ${pcy+3.2}L${pcx+8.1} ${pcy-3.9}`,'#d3dacc',.45);
for(const x of potTerminals)barePot+=P(`M${x} 60.8V68.031496`,'#8c978d',2.2)+P(`M${x-.35} 61V68.031496`,'#dfe4d8',.6)+C(x,60.8,2.65,'#c4b16f','#d7cca3',.65)+C(x,60.8,1.2,'#58472b');
amend080('pot',barePot,emptyPackageBody080,true);
amend080('npn',P('M5.5 10.8Q18 5.5 30.5 10.8M6 30.1H30','#626962',.6)+P('M8.4 33V42M18 33V42M27.6 33V42','#d2d7cc',.65));
amend080('mosfet',P('M8.5 4H39.5M8.5 4V22','#f0f0e5',.65)+P('M7 54H41','#141c19',1.1)+P('M14.4 55V60M24 55V60M33.6 55V60','#edf0e7',.85)+P('M8 25.1H40','#747a72',.6));
const relayDetail=P('M59.4 12H104.5V47.3M59.4 12V47.3','#717d70',.65)+P('M59.5 47.5H104.5','#151d19',1.1)+T(82,25,'RELAY',5.1,'#c0c6b7')+T(82,33,'SPDT',3.5,'#a0ad9b')+[20.1,29.7,39.3].map(y=>C(113.7,y,2.7,'none','#c0c4b5',.65)).join('')+[[20,4.3],[123.5,4.3],[20,54],[123.5,54]].map(([x,y])=>C(x,y,2.25,'#a3b79b','#d0d8bd',.45)+C(x,y,1.35,'#183f2c')).join('');
amend080('relay',relayDetail,s=>s.replaceAll('fill="#d40000"','fill="#1b7047"').replace('<path fill="#1989ff" d="M15.439 2.88h12.475v9.939H15.439zM28.599 3.86h3.098v7.941h-3.098z"></path>','<path fill="#303830" d="M15.439 2.88h12.475v9.939H15.439z"></path><path fill="#2585b0" d="M28.599 3.86h3.098v7.941h-3.098z"></path>').replace(/<text x="110\.636"[\s\S]*?<\/text>/,''),true);
amend080('spdt',R(2.2,2.6,27.6,1.1,'#b7bfba')+P('M2.1 3.3V24H29.8V3.3','#858f89',.9)+P('M3 24H29','#dde0d5',.5));
amend080('oled',R(11.4,18,4.8,1.7,'#8a5b25','#c29a58',.1)+P('M11.7 18.2V19.6M12 18.2V19.6M15.6 18.2V19.6M15.9 18.2V19.6','#e0be6d',.1)+R(12.1,18,3.4,1.2,'#101817')+P('M1.7 5H26','#abc2c3',.1));
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
