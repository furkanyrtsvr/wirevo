import fs from 'node:fs';
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
function terminals(m){
 return m.pins.map(p=>{
  const x=Number(p.x),y=Number(p.y);
  let s=circle(x,y,3.6,'#ba983c')+circle(x,y,2.15,'#222d32')+circle(x,y,.75,'#8e9d9c');
  if(m.kind==='button')return '';
  s+=text(x,y-6,p.id,4.3,'#edf8ef','text-anchor="middle"');
  return `<g data-pin="${esc(p.id)}" data-x="${x}" data-y="${y}">${s}</g>`;
 }).join('');
}
function body(id,m){
 const w=m.width,h=m.height,cx=w/2,cy=h/2;
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
 const pcb=['#237e73','#1e617d','#3e5d9b','#7d3d5b','#30674a'][Object.keys(EXPANSION_MODULES).indexOf(id)%5];
 let s=rect(4,4,w-8,h-18,pcb,4,'stroke="#10282b" stroke-width="1.3"');
 for(const x of[11,w-11])s+=circle(x,12,3.1,'#d0b763')+circle(x,12,1.6,'#14232a');
 for(const p of m.pins)s+=line(p.x,p.y-6,cx+(p.x-cx)*.7,64,'#8fbd9c',.5);
 if(m.kind==='segment'){
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
 const label=m.name.length>35?m.name.slice(0,34)+'…':m.name;
 s+=text(cx,19,label,Math.min(7,(w-24)/(label.length*.53)),'#f1f4d8','text-anchor="middle" font-weight="600"');
 s+=text(cx,79,String(m.detail??'').split(' · ')[0],5,'#d3e6da','text-anchor="middle"');
 return s;
}
const defs=`<defs><linearGradient id="metal" x2=".8" y2="1"><stop stop-color="#dce5e9"/><stop offset=".35" stop-color="#869baa"/><stop offset=".6" stop-color="#c4d0d8"/><stop offset="1" stop-color="#637e90"/></linearGradient><linearGradient id="cap" x2=".3" y2="1"><stop stop-color="#748a99"/><stop offset="1" stop-color="#17232e"/></linearGradient><linearGradient id="green" x2="0" y2="1"><stop stop-color="#28765c"/><stop offset="1" stop-color="#164c3b"/></linearGradient><radialGradient id="lens" cx=".3" cy=".25"><stop stop-color="#f1fcff"/><stop offset=".35" stop-color="#b9dfed" stop-opacity=".9"/><stop offset="1" stop-color="#688f9d" stop-opacity=".8"/></radialGradient></defs>`;
for(const[id,m]of Object.entries(EXPANSION_MODULES)){
 if(!/^[-a-zA-Z0-9]+\.svg$/.test(m.asset))throw Error(`Unsafe asset name: ${m.asset}`);
 if(m.asset==='pushbutton-12mm.svg'||m.asset==='pushbutton-12mm-pressed.svg')throw Error('Existing button artwork is protected');
 const svg=`<!-- Original Wirevo vector artwork; generated by scripts/generate-expansion-art.mjs. -->\n<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}" viewBox="0 0 ${m.width} ${m.height}"><title>${esc(m.name)}</title>${defs}${body(id,m)}${terminals(m)}</svg>\n`;
 fs.writeFileSync(path.join(out,m.asset),svg);
 if(id==='tact6')fs.writeFileSync(path.join(out,'tact-6x6-pressed.svg'),`<!-- Original Wirevo pressed tact switch. -->\n<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}" viewBox="0 0 ${m.width} ${m.height}"><title>${esc(m.name)} pressed</title>${defs}${body(id,{...m,pressed:true})}</svg>\n`);
}
console.log(`Generated ${Object.keys(EXPANSION_MODULES).length} original SVG assets.`);
