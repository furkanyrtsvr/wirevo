// Original vectors compared with downloaded product photographs, not pasted image cards.
export function photoBody079(id,m){
 const w=m.width,cx=w/2;
 const r=(x,y,a,b,fill,rx=0,extra='')=>`<rect x="${x}" y="${y}" width="${a}" height="${b}" fill="${fill}" rx="${rx}" ${extra}/>`;
 const c=(x,y,a,fill,extra='')=>`<circle cx="${x}" cy="${y}" r="${a}" fill="${fill}" ${extra}/>`;
 const p=(d,stroke='#b3bdbe',sw=.7,fill='none')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
 const t=(x,y,s,n=4,fill='#dce5df',extra='')=>`<text x="${x}" y="${y}" font-size="${n}" font-family="Arial,sans-serif" fill="${fill}" ${extra}>${s}</text>`;
 const smd=(x,y,a=4,b=2)=>r(x,y,a,b,'#b3afa2',.3)+r(x+1,y,a-2,b,'#4e4b40',.15);
 const ic=(x,y,a,b,n=6)=>{let s='';for(let i=0;i<n;i++){const yy=y+2+i*(b-4)/(n-1);s+=r(x-3,yy,4,1.4,'url(#metal)',.25)+r(x+a-1,yy,4,1.4,'url(#metal)',.25);}return s+r(x,y,a,b,'#26262b',1.2,'stroke="#57545b" stroke-width=".6"')+c(x+3,y+3,.8,'#838286');};
 const hole=(x,y)=>c(x,y,3,'#d8cc9b')+c(x,y,2.2,'#111e29');
 if(id==='mcp2515'){
  const x=cx-29;let s=r(x,4,58,84,'#254274',1.4,'stroke="#99adb6" stroke-width=".7" data-photo-reference="mcp2515"');
  s+=hole(x+4.5,8.5)+hole(x+53.5,8.5)+hole(x+4.5,83.5)+hole(x+53.5,83.5);
  s+=r(x+8,10,43,5,'#d5bd63',.4);for(let i=0;i<7;i++)s+=r(x+10+i*5.8,8,1.5,6,'url(#metal)',.15);
  s+=ic(x+20,25,24,27,10)+t(x+22,37,'MCP2515',3.4,'#929198')+c(x+23,48,1,'#14171c');
  s+=r(x+31,55,22,9,'url(#metal)',4,'stroke="#d9dee2" stroke-width=".6"')+r(x+33,56.4,18,5.5,'#92979b',2)+t(x+35,60.6,'8.000',3.6,'#eeeae2');
  s+=ic(x+9,63,13,10,4)+t(x+10,68.5,'1050',2.2,'#92999a');
  s+=r(x+31,70,22,14,'#166fa6',1,'stroke="#4da8cc" stroke-width=".6"')+r(x+31,79.5,22,4.5,'#125683',.6);
  for(const xx of[x+36.5,x+47.5])s+=c(xx,75,3.6,'#082c44')+c(xx,75,2.6,'url(#metal)')+p(`M${xx-1.8} 75l3.6 -1`,'#45525a',.9);
  for(const [xx,yy]of[[x+8,25],[x+8,30],[x+10,42],[x+18,57],[x+37,65],[x+45,65]])s+=smd(xx,yy);
  s+=r(x+7,52,3,5,'#cbd0b0',.5)+r(x+8,52.5,1,4,'#69a66d',.3)+t(x+4,22,'VCC GND CS SO SI SCK INT',2.3,'#ecefe0');
  s+=p(`M${x+7} 36h7v17h12M${x+25} 60v6h3M${x+17} 77v4h10`,'#426596',.4);
  return '<g data-photo-body="mcp2515">'+s+'</g>';
 }
 if(id==='mfrc522'){
  let s=r(3,17,w-6,65,'#123f70',1.2,'stroke="#91a5b3" stroke-width=".7" data-photo-reference="rc522"');
  for(const [x,y]of[[8,22],[8,77],[w-8,22],[w-8,77]])s+=hole(x,y);
  const ax=w*.31,ay=49;
  for(const rr of[5,10,16,22])s+=p(`M${ax-rr*.6} ${ay-rr}a${rr*1.12} ${rr*1.12} 0 0 0 0 ${rr*2}M${ax+rr*.6} ${ay-rr}a${rr*1.12} ${rr*1.12} 0 0 1 0 ${rr*2}`,'#d4dce0',.85);
  s+=c(ax,ay,1.1,'#eef3ee');s+=ic(w*.68,36,16,20,6)+r(w*.69,65,20,7,'url(#metal)',3,'stroke="#abb6ba" stroke-width=".6"')+t(w*.71,69.8,'27.120',2.7,'#5c626a');
  for(let i=0;i<5;i++){s+=smd(w*.59,31+i*7,3,4)+smd(w*.9,32+i*6,3,3);}
  s+=t(7,61,'RFID-RC522',4.2,'#dce5e7','transform="rotate(-90 7 61)"');
  return '<g data-photo-body="mfrc522">'+s+'</g>';
 }
 if(id==='dfplayer'){
  const x=cx-34;let s=r(x,9,68,77,'#192d29',1,'stroke="#b2b5a6" stroke-width=".6" data-photo-reference="dfplayer"');
  for(let i=0;i<8;i++)for(const xx of[x+4,x+64])s+=c(xx,15+i*9,2.4,'#adb1a2')+c(xx,15+i*9,1.2,'#343e37');
  for(let i=0;i<5;i++)s+=smd(x+12+i*8.5,13,5,3);
  s+=ic(x+16,20,35,8,8)+t(cx,33,'DFPlayer Mini',5,'#d5e1dc','text-anchor="middle"');
  s+=p(`M${x+9} 38h50v43l-6 4H${x+9}Z`,'#d0d1c6',.8,'url(#metal)');
  s+=r(x+13,39,42,40,'#b7b8ab',1,'stroke="#e5e2d2" stroke-width=".7"');
  s+=p(`M${x+14} 40h38m-38 0v35M${x+56} 41v15l-4 2v16l4 4`,'#e2e0d4',.75);
  s+=p(`M${x+10} 41h4v15h-4m43 19v-8h5v12`,'#2b3634',1.2);
  s+=r(x+20,79,27,3,'#333d37',.3);
  return '<g data-photo-body="dfplayer">'+s+'</g>';
 }
 return null;
}
