// Original artwork informed by privately downloaded component photographs.
// Electrical anchors and live display/LED positions intentionally stay unchanged.
export const PHOTO_PACKAGES080=['tact6','segment1','segment4','ledbar','lcd20p','lcd20','dcmotor','optocoupler','pnp','pmos','ili9341','xpt2046','epaper','irEmitter','irReceiver'];
const R=(x,y,w,h,f,rx=0,e='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${e}/>`;
const P=(d,s='#bac4c9',w=1,f='none',e='')=>`<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}" ${e}/>`;
const C=(x,y,r,f,e='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${e}/>`;
const T=(x,y,t,n=5,f='#c9cece')=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${n}" fill="${f}">${t}</text>`;
const hole=(x,y)=>C(x,y,3.5,'#bbae77')+C(x,y,2.4,'#172b33');
const seg=['M8 0h16l4 3-4 3H8L4 3Z','M28 5v16l-3 3-3-3V8Z','M28 27v16l-6-3V30l3-3Z','M8 44h16l4 3-4 3H8l-4-3Z','M2 27l6 3v10l-6 3Z','M2 5l6 3v13l-3 3-3-3Z','M8 22h16l3 3-3 3H8l-3-3Z'];
export function photoPackage080(id,m){if(!PHOTO_PACKAGES080.includes(id))return null;const w=m.width,h=m.height,cx=w/2;
let s='';const leads=(y=65,span=8)=>m.pins.map((p,i)=>P(`M${cx+(i-(m.pins.length-1)/2)*span} ${y}V${Math.max(y+6,76)}L${p.x} 86V${p.y}`,'#acb9c0',1.7,'none','stroke-linecap="round"')).join('');
if(id==='tact6'){
 s=m.pins.map(p=>R(p.x<cx?p.x:cx+10,p.y-1.5,p.x<cx?cx-10-p.x:p.x-cx-10,3,'url(#metal)',.4,`data-pin="${p.id}" data-x="${p.x}" data-y="${p.y}"`)).join('');
 s+=R(cx-13,9,26,27,'#18222a',2)+R(cx-12,10,24,23,'url(#metal)',1,'stroke="#b8c3c5" stroke-width=".7"');
 for(const dx of[-9,9])for(const yy of[13,30])s+=C(cx+dx,yy,1.3,'#313a3e')+C(cx+dx-.25,yy-.2,.5,'#c2c9c7');
 s+=C(cx,21.6,7.4,'#171d20','stroke="#7b8587" stroke-width=".8"')+C(cx,m.pressed?22.7:21.2,m.pressed?5.9:6.4,'#292f31')+P(`M${cx-4.3} 18.5q4-4 8.3 .2`,'#596164',.7);
}else if(id==='dcmotor'){
 s=leads(65,17)+R(cx-28,27,56,38,'url(#metal)',10,'stroke="#71818c" stroke-width=".8"')+R(cx-33,31,12,30,'#e5e4d5',5,'stroke="#8e9e9f" stroke-width=".7"')+R(cx+22,28,10,36,'#b2bec2',4)+P(`M${cx+30} 40h15v6h-15Z`,'#7c887d',.7,'#d0ceb0')+R(cx+43,41.2,5,3.6,'#e1dcc1',.5);
 s+=P(`M${cx-17} 30H${cx+14}M${cx-17} 62H${cx+14}`,'#edf2f0',1)+R(cx-4,30,14,3,'#343e41',1)+R(cx-4,59,14,3,'#536065',1)+C(cx-26,40,2.3,'#2d3538')+C(cx-26,53,2.3,'#2d3538')+P(`M${cx-35} 39h8m-8 17h8`,'#b69f65',1.5);
}else if(id==='pnp'){
 s=leads(59,8)+P(`M${cx-16} 57V36Q${cx-16} 27 ${cx} 27Q${cx+16} 27 ${cx+16} 36V57Z`,'#626b6c',.7,'#20282c')+R(cx-15,39,30,20,'#303638',.7)+P(`M${cx-13} 36q13-11 26 0`,'#758084',.6)+T(cx,48,'PNP',5,'#aeb5b4')+P(`M${cx-14} 58h28`,'#151c20',1.3);
}else if(id==='pmos'){
 s=leads(67,10)+R(cx-16,18,32,25,'url(#metal)',1.5,'stroke="#8d9ca2" stroke-width=".7"')+C(cx,28,4.7,'#15222a','stroke="#e6eceb" stroke-width="1"')+R(cx-19,38,38,30,'#22282b',1.8,'stroke="#687277" stroke-width=".7"')+P(`M${cx-17} 40h34M${cx-17} 41v24`,'#4e5558',.7)+T(cx,54,'P-CH',5,'#b7bcb8')+P(`M${cx-15} 65h30`,'#11171b',1.1);
}else if(id==='optocoupler'){
 s=m.pins.map((p,i)=>{const left=i<2,x=cx+(left?-19:19),y=37+(i%2)*17;return P(`M${x} ${y}h${left?-5:5}v15L${p.x} 84V${p.y}`,'#c3ccd0',2.2);}).join('');
 s+=R(cx-19,26,38,39,'#a5adb1',1)+R(cx-18.5,25,37,35,'#262c30',1.7,'stroke="#697277" stroke-width=".7"')+P(`M${cx-16} 27h32`,'#656e70',.8)+C(cx-12,32,1.3,'#949a93')+T(cx,42,'PC817',5.7,'#b5bdb5')+T(cx,51,'OPTO',3.7,'#8b9791');
}else if(id==='irEmitter'){
 s=leads(60,11)+P(`M${cx-16} 58V36a16 16 0 0 1 32 0v22Z`,'#9294b9',.9,'#3a326b')+P(`M${cx-12} 55V38h10v17m9 0V39h5v16`,'#c0bdd4',.6,'#9a94b5')+`<ellipse cx="${cx}" cy="59" rx="19" ry="4" fill="#5b528a" stroke="#b1adcb" stroke-width=".7"/>`+P(`M${cx-10} 35q0-10 8-11`,'#e3def8',3.2,'none','stroke-linecap="round" opacity=".8"')+P(`M${cx+11} 34v15`,'#a5a4cd',1);
}else if(id==='irReceiver'){
 s=leads(62,9)+R(cx-17,28,34,35,'#20272c',4,'stroke="#6c7a80" stroke-width=".6"')+P(`M${cx-15} 31h30v26h-30Z`,'#303a40',.7,'#10191f')+`<ellipse cx="${cx}" cy="43" rx="12" ry="13" fill="#202333" stroke="#636373" stroke-width=".7"/>`+P(`M${cx-7} 38q3-7 9-4`,'#747186',1.1)+R(cx-18,55,36,7,'#272e33',1)+P(`M${cx-12} 29h24`,'#858d8e',.6);
}else if(id==='segment1'||id==='segment4'){
 const n=id==='segment4'?4:1,scale=n===4?.76:1,x=cx-n*19*scale-4,fw=n*38*scale+8;s=leads(77,5)+R(x,15,fw,66,'#c3c8c1',2,'stroke="#828d8d" stroke-width=".7"')+R(x+1.5,17,fw-3,60,'#202729',1)+P(`M${x+2} 18h${fw-4}`,'#4e5554',1);
 for(let i=0;i<n;i++){s+=`<g transform="translate(${cx-n*19*scale+i*38*scale} 23) scale(${scale} 1)">${seg.map(d=>`<path d="${d}" fill="#4b4545" stroke="#696064" stroke-width=".25"/>`).join('')}<circle cx="32" cy="47" r="2.5" fill="#54484b"/></g>`;}
}else if(id==='ledbar'){
 s=leads(70,5)+R(cx-58,17,116,53,'#d9dace',1.2,'stroke="#a5aaa1" stroke-width=".7"')+R(cx-55.5,20,111,47,'#1f2628',.8)+P(`M${cx-57} 69h114M${cx+57} 20v49`,'#f4f3e9',.8);
 for(let i=0;i<10;i++)s+=R(cx-55+i*11,26,8,36,'#bbb9ad',.6,'stroke="#848783" stroke-width=".45"');
}else if(id==='lcd20p'||id==='lcd20'){
 const d=m.display;s=R(3,3,w-6,h-15,'#246340',2,'stroke="#739d76" stroke-width=".7"');for(const x of[11,w-11])for(const y of[11,h-23])s+=hole(x,y);
 s+=R(d.x-7,d.y-7,d.width+14,d.height+14,'#6e7979',1)+R(d.x-5,d.y-5,d.width+10,d.height+10,'#161f26',2,'stroke="#b1b9b0" stroke-width=".7"')+R(d.x,d.y,d.width,d.height,'#183b87',.5)+P(`M${d.x-3} ${d.y-3}H${d.x+d.width+3}M${d.x-4} ${d.y}V${d.y+d.height}`,'#424c51',.8);
 const cw=d.width/21,ch=d.height/4.7;let dots='';for(let py=0;py<7;py++)for(let px=0;px<5;px++)dots+=R(cw*.6+px*cw*.115,ch*.4+py*ch*.09,cw*.083,ch*.065,'#2d519f',.1);
 s+=`<defs><pattern id="lcd080-cells" x="${d.x}" y="${d.y}" width="${cw}" height="${ch}" patternUnits="userSpaceOnUse">${dots}</pattern></defs>`+R(d.x,d.y,cw*20,ch*4,'url(#lcd080-cells)')+T(cx,18,'2004A',6,'#dce8cb');
 for(const x of[16,w-21])s+=R(x,60,5,15,'#9ba79e',.5);
 for(let i=0;i<16;i++)s+=C(22+i*7,12,1.4,'#b5ac75')+C(22+i*7,12,.65,'#254639');
 if(id==='lcd20')s+=T(w-64,h-23,'I²C backpack',4.7,'#b8d7bf');
}else{
 const d=m.display,paper=id==='epaper',touch=id==='xpt2046';
 s=R(4,4,w-8,h-18,touch?'#234453':paper?'#1d4941':'#24537c',3,'stroke="#869ca0" stroke-width=".8"');for(const x of[11,w-11])for(const y of[12,h-25])s+=hole(x,y);
 s+=R(d.x-6,d.y-6,d.width+12,d.height+12,paper?'#d6d6c8':'#b4bfbe',1)+R(d.x-3,d.y-3,d.width+6,d.height+6,paper?'#303b37':'#222e37',1)+R(d.x,d.y,d.width,d.height,paper?'#e8e8de':touch?'#a3c9cb':'#080e16');
 if(touch){s+=R(d.x+4,d.y+4,d.width-8,d.height-8,'#88b6bc',1,'stroke="#c9e4e1" stroke-width=".7" opacity=".7"')+P(`M${d.x+7} ${d.y+8}H${d.x+d.width-8}`,'#e6f0e5',.6);}
 const fy=d.y+d.height+5,fh=Math.max(5,h-20-fy);s+=P(`M${cx-24} ${fy}h48l-4 ${fh}h-40Z`,'#9f6827',.6,'#c78d32');for(let i=0;i<16;i++)s+=P(`M${cx-20+i*2.6} ${fy+1}v${fh-2}`,'#e5b762',.6);s+=R(cx-25,fy+fh-2,50,3,'#30383a',.5)+P(`M${d.x-4} ${d.y-4}H${d.x+d.width+4}M${d.x-4} ${d.y-4}V${d.y+d.height+3}`,'#edf0e7',.8);
 s+=T(cx,18,paper?'2.9 E-PAPER':touch?'RESISTIVE TOUCH':'2.8 TFT',5,'#d3e2d7');
}
return `<g data-photo-package080="${id}">${s}</g>`;}
