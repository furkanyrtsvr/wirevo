// Original vectors: physical details compared with locally downloaded product photography.
// These are illustrations, not manufacturer footprints. Simulator terminals remain separate.
export const PHOTO_BODY080_IDS=['a4988','drv8825','tb6612','aht20','ds3231','adxl345','water','rain','soilProbe','ads1115','mcp4725','pcf8574','pca9685','cd4067','levelShift','fram','spiFlash','sdCard','bme280','bme680','vl53l0x','pn532','ina226','tcs34725','max30102','i2sMic','i2sAmp','rs485','gps','buzzerActive'];
export function photoBody080(id,m){
 if(!PHOTO_BODY080_IDS.includes(id))return null;
 const w=m.width,cx=w/2;
 const R=(x,y,a,b,f,rx=0,e='')=>`<rect x="${x}" y="${y}" width="${a}" height="${b}" fill="${f}" rx="${rx}" ${e}/>`;
 const C=(x,y,r,f,e='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${e}/>`;
 const P=(d,stroke='#cbd4d4',sw=.7,f='none')=>`<path d="${d}" fill="${f}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
 const T=(x,y,s,n=4,f='#e9ece0',e='')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${n}" fill="${f}" ${e}>${s}</text>`;
 const H=(x,y,r=2.5)=>C(x,y,r+1,'#d4c58c')+C(x,y,r,'#343e3d')+C(x-.3,y-.3,r-.7,'#172229');
 const via=(x,y)=>C(x,y,2.05,'#cfbb7b')+C(x,y,1.05,'#152e37');
 const smd=(x,y,a=4,b=2.2)=>R(x,y,a,b,'#b7bcb4',.25)+R(x+Math.min(.8,a/4),y+.1,Math.max(a-1.6,1),b-.2,'#99826b',.15);
 const IC=(x,y,a,b,n=5)=>{let q='';for(let i=0;i<n;i++){const yy=y+1.6+i*(b-4)/(n-1);q+=R(x-2.5,yy,3.5,1.1,'url(#metal)',.15)+R(x+a-1,yy,3.5,1.1,'url(#metal)',.15);}return q+R(x,y,a,b,'#242a2e',.6,'stroke="#555e60" stroke-width=".5"')+C(x+2.3,y+2.3,.65,'#808789');};
 const jst=(x,y,a=12,b=10)=>R(x,y,a,b,'#eeead7',.8,'stroke="#b9b9a8" stroke-width=".7"')+R(x+1.8,y+2,a-3.6,b-3.6,'#cac8b4',.25)+R(x+2,y,a-4,2,'#fffdeb',.2)+P(`M${x+3} ${y+b-2}v-4m3 4v-4m3 4v-4`,'#9a997f',.6);
 const board=(x,y,a,b,color='#1d5984',radius=2)=>R(x+.6,y+1,a,b,'#101b26',radius,'opacity=".35"')+R(x,y,a,b,color,radius,'stroke="#9aa8a0" stroke-width=".6"');
 const row=(x,y,n,step=6)=>Array.from({length:n},(_,i)=>via(x+i*step,y)).join('');
 const cap=(x,y,r=5)=>C(x,y,r,'#303a43')+C(x,y,r-1,'url(#metal)')+P(`M${x-r+2} ${y}h${(r-2)*2}M${x} ${y-r+2}v${(r-2)*2}`,'#7b8387',.65);
 let s='';
 if(id==='a4988'||id==='drv8825'){
  const x=cx-28,drv=id==='drv8825';s=board(x,8,56,76,drv?'#675186':'#3c826a',1);
  for(let i=0;i<8;i++)s+=via(x+4.5,13+i*9.3)+via(x+51.5,13+i*9.3);
  s+=IC(cx-10,drv?24:33,20,drv?27:20,8)+T(cx,drv?37:45,drv?'DRV8825':'A4988',3.5,'#b7beb6','text-anchor="middle"');
  const py=drv?68:19;s+=R(x+33,py-4,11,11,'url(#metal)',5,'stroke="#d0d8cd" stroke-width=".6"')+C(x+38.5,py+1.5,3.3,'#a18a5b')+P(`M${x+36.1} ${py+3.9}l4.8 -4.8`,'#3c3a32',1);
  for(const [xx,yy]of[[x+13,14],[x+20,14],[x+13,25],[x+37,41],[x+15,66],[x+37,58],[x+24,74]])s+=smd(xx,yy,5,3);
  s+=P(`M${x+11} 79v-7h7m24-55v12h-4`,'#72a78b',.5);
 }
 else if(id==='tb6612'){
  const x=cx-30;s=board(x,11,60,70,'#4a8b74',1);for(let i=0;i<8;i++)s+=via(x+5,17+i*8.6)+via(x+55,17+i*8.6);
  s+=IC(x+18,28,25,28,12)+T(cx,41,'TB6612',4,'#adb5b1','text-anchor="middle"')+T(cx,46,'FNG',3.4,'#adb5b1','text-anchor="middle"');
  for(const [xx,yy]of[[x+17,18],[x+33,19],[x+16,66],[x+28,69],[x+41,66]])s+=smd(xx,yy,6,3);
 }
 else if(id==='pca9685'){
  const a=Math.min(w-16,205),x=cx-a/2;s=board(x,14,a,67,'#16679e',2);
  for(const xx of[x+5,x+a-5])s+=H(xx,19)+H(xx,76);
  s+=IC(cx-13,25,26,24,12)+T(cx,36,'PCA9685',3.6,'#a9b5ba','text-anchor="middle"');
  s+=R(x+16,19,24,11,'#207a43',1,'stroke="#88b48c" stroke-width=".6"');for(let i=0;i<2;i++)s+=C(x+22+i*12,24,3,'url(#metal)')+P(`M${x+20+i*12} 24h4`,'#535e5d',.8);
  s+=cap(x+a-22,27,8)+T(x+10,45,'16 CHANNEL PWM',4.2);
  for(let i=0;i<16;i++){const xx=x+12+i*(a-24)/15;for(let j=0;j<3;j++)s+=via(xx,57+j*8);s+=T(xx,52,i,2.8,'#d9e2d9','text-anchor="middle"');}
  for(const [xx,yy]of[[cx-32,23],[cx+25,35],[cx-25,34],[cx+25,42]])s+=smd(xx,yy);
 }
 else if(id==='cd4067'){
  const x=cx-28;s=board(x,5,56,82,'#ae3837',1);for(let i=0;i<12;i++)s+=via(x+5,10+i*6.5)+via(x+51,10+i*6.5);
  s+=IC(cx-12,33,24,23,12)+T(cx,43,'74HC4067',3.2,'#b4b4ab','text-anchor="middle"')+T(cx,75,'16 CHANNEL',3.8,'#f0d9ce','text-anchor="middle"');
  for(let i=0;i<5;i++)s+=P(`M${x+10} ${12+i*4}h${11+i*3}v${16-i*3}`,'#d37c70',.5);
  s+=smd(cx-4,63,8,3);
 }
 else if(id==='levelShift'){
  const x=cx-34;s=board(x,14,68,64,'#1866a0',2);s+=H(x+5,20)+H(x+63,20);s+=row(x+9,70,6,10)+row(x+9,27,6,10);
  for(let i=0;i<4;i++){const xx=x+11+i*13;s+=IC(xx,42,7,8,2)+smd(xx,35,7,2)+smd(xx,56,7,2);}
  s+=T(cx,21,'4-CHANNEL LEVEL SHIFT',3.6,'#d9e7dc','text-anchor="middle"');
 }
 else if(id==='water'){
  const x=cx-22;s=board(x,8,44,76,'#27332e',3);s+=H(x+6,15)+H(x+38,15)+jst(cx-8,19,16,13);
  // SEN0121 has exposed nested gold loops, not a large IC or an invented PCB caption.
  for(const [xx,yy]of[[cx-9,45],[cx+9,45],[cx-9,63],[cx+9,63],[cx,54]])for(const rr of[3.2,5.5,7.8])s+=C(xx,yy,rr,'none',`stroke="#ceb970" stroke-width="1"`);
  s+=T(cx,79,'WATER',3.8,'#dbe1cf','text-anchor="middle"');
 }
 else if(id==='rain'){
  const x=cx-44;s=board(x,17,88,59,'#147c8a',1);s+=H(x+21,17,2)+H(x+21,76,2)+jst(x+4,33,13,24);
  s+=R(x+29,23,53,47,'#2b7283',1);for(let i=0;i<10;i++)s+=P(`M${x+34} ${26+i*4.2}h44`,'#d6d5b4',1.6);
  s+=P(`M${x+32} 27v41m48-40v40`,'#d7d8bd',1.5)+smd(x+21,40,4,7);
 }
 else if(id==='soilProbe'){
  const x=cx-26;s=P(`M${x} 8h52v24l-3 44-8 9-4-6-2-41H${cx-9}l-2 41-4 6-8-9Z`,'#a2ac9d',.7,'#30382d');
  s+=P(`M${x+4} 34h13l-2 43-5 5-5-7ZM${x+35} 34h13l-1 41-5 7-5-5Z`,'#d6ca8b',.5,'#cabc7d');
  s+=jst(cx-9,10,18,14)+T(cx,31,'MOISTURE',3.4,'#e5e6d5','text-anchor="middle"');
 }
 else if(id==='ds3231'){
  const x=cx-33;s=board(x,14,66,65,'#126cac',4);s+=H(x+6,20)+H(x+60,73)+row(x+10,71,6,9.3);
  s+=IC(cx-17,31,34,25,8)+T(cx,43,'DS3231',4,'#b9c0ba','text-anchor="middle"');
  s+=T(cx,25,'PRECISION RTC',4,'#f0e9d1','text-anchor="middle"')+smd(x+11,59,7,3)+smd(x+46,59,7,3)+R(x+48,24,6,4,'#bbbda8',.5);
 }
 else if(id==='adxl345'){
  const x=cx-38;s=board(x,15,76,62,'#303537',3);s+=H(x+5,21)+H(x+71,71)+row(x+9,69,8,8.2)+jst(x+2,36,12,16)+jst(x+62,36,12,16);
  s+=R(cx-8,34,16,14,'#363b3e',.8,'stroke="#9da8aa" stroke-width=".6"')+C(cx-4,38,.8,'#8b9490');
  s+=P(`M${cx} 58v-8m0 8h10m-10 0-6-5`,'#ece8d4',.7)+T(cx+12,59,'X',3)+T(cx-2,49,'Y',3)+T(cx,26,'ADXL345',4.5,'#e6e5d9','text-anchor="middle"');
  for(const [xx,yy]of[[cx-19,33],[cx+14,35],[cx-19,43],[cx+14,44]])s+=smd(xx,yy,4,3);
 }
 else if(['aht20','ads1115','mcp4725','pcf8574','bme280','bme680','vl53l0x'].includes(id)){
  const x=cx-39;s=board(x,15,78,62,'#303638',3);for(const [xx,yy]of[[x+5,21],[x+73,21],[x+5,71],[x+73,71]])s+=H(xx,yy,2.3);
  s+=jst(x+2,35,12,17)+jst(x+64,35,12,17)+row(x+17,69,Math.min(id==='pcf8574'?8:6,8),id==='pcf8574'?6.3:8.8);
  s+=T(cx,26,id.toUpperCase(),4.6,'#efeadc','text-anchor="middle"');
  if(id==='aht20')s+=R(cx-8,35,16,18,'#e0dfd5',1,'stroke="#a8b1aa" stroke-width=".6"')+R(cx-4,40,8,7,'#acaea7',.4)+P(`M${cx-4} 43h8`,'#dadbd0',.7);
  if(id==='ads1115')s+=IC(cx-8,36,16,20,5)+T(cx,48,'ADS',3,'#969f9e','text-anchor="middle"')+smd(cx+16,38,6,3)+smd(cx-22,50,6,3);
  if(id==='mcp4725')s+=IC(cx-5,38,10,12,3)+smd(cx-20,39,6,3)+smd(cx+13,40,6,3)+P(`M${cx-17} 57h34`,'#8d9893',.45);
  if(id==='pcf8574'){s+=IC(cx-13,34,26,24,8)+T(cx,47,'PCF8574',3.3,'#afb5af','text-anchor="middle"')+row(x+16,32,8,6.5);}
  if(id==='bme280'||id==='bme680'){
   s+=R(cx-7,36,14,14,id==='bme280'?'#abb7b5':'#b4a37b',1,'stroke="#e0dcd0" stroke-width=".7"')+C(cx+2,40,1.2,'#353b3b')+R(cx-5,47,10,3,'#566264',.3);
   if(id==='bme680')s+=R(cx-3,38,3,3,'#3d4040',.3);
  }
  if(id==='vl53l0x')s+=R(cx-12,35,24,15,'#333c3e',1,'stroke="#abb2aa" stroke-width=".6"')+R(cx-10,38,8,8,'#20232c',1)+R(cx+3,38,7,8,'#4d284e',1)+C(cx-6,42,2,'#6d5076')+C(cx+6,42,2,'#2c244b');
  for(const [xx,yy]of[[cx-20,34],[cx+15,52],[cx-18,56],[cx+18,32]])s+=smd(xx,yy,4.5,2.7);
 }
 else if(id==='fram'){
  const x=cx-37;s=board(x,17,74,59,'#1469a4',3);s+=H(x+6,23)+H(x+68,23)+row(x+9,68,8,8);
  s+=IC(cx-14,35,28,19,4)+T(cx,45,'MB85RC256',3.5,'#b9c1ba','text-anchor="middle"')+T(cx,29,'I2C FRAM',4.7,'#eeefdd','text-anchor="middle"');
  s+=smd(x+10,42,6,3)+smd(x+57,41,6,3)+row(x+26,59,3,9);
 }
 else if(id==='spiFlash'){
  const x=cx-36;s=board(x,17,72,60,'#343936',3);s+=H(x+5,23)+H(x+67,23)+row(x+10,69,8,7.5);
  s+=IC(cx-15,37,30,19,4)+T(cx,48,'W25Q32',4,'#9fa9a4','text-anchor="middle"')+T(cx,28,'SPI FLASH',4.2,'#e2e4d8','text-anchor="middle"');s+=smd(x+10,51,5,3)+smd(x+58,34,5,3);
 }
 else if(id==='sdCard'){
  const x=cx-36;s=board(x,9,72,77,'#166eaa',2);s+=H(x+5,15)+H(x+67,15)+row(x+12,77,6,9.6);
  s+=P(`M${x+14} 21h42v34l-6 4H${x+14}Z`,'#d8dcd1',.8,'url(#metal)')+R(x+18,23,34,29,'#b5beb9',1)+P(`M${x+18} 25h30m-30 3v22m28-23v10l4 3v10`,'#e6e9df',.8);
  s+=R(x+21,53,25,4,'#1d2728',.3)+IC(x+22,63,25,7,4)+smd(x+5,39,5,3)+smd(x+59,40,6,3);
 }
 else if(id==='pn532'){
  const a=Math.min(w-8,111),x=cx-a/2;s=board(x,10,a,75,'#1573b5',2);for(const [xx,yy]of[[x+5,15],[x+a-5,15],[x+5,80],[x+a-5,80]])s+=H(xx,yy,2.3);
  // Real PN532 breakout: open antenna area is most of the board; IC cluster is one end.
  const ax=x+8,aw=a*.5;for(let i=0;i<4;i++)s+=R(ax+i*2,22+i*2,aw-i*4,48-i*4,'none',3,`stroke="#1a8ac7" stroke-width=".9"`);
  s+=R(x+a-38,32,17,17,'#303c42',.6,'stroke="#798d92" stroke-width=".4"')+C(x+a-35,35,.65,'#c4cbc4');
  s+=R(x+a-38,58,19,6,'url(#metal)',2)+smd(x+a-16,31,4,6)+smd(x+a-17,45,4,6)+smd(x+a-37,24,5,3);
  s+=row(x+a-42,73,5,7)+T(x+15,48,'NFC',6.2,'#d1e6e3');
 }
 else if(id==='ina226'){
  const x=cx-36;s=board(x,14,72,65,'#2b6689',1);s+=H(x+6,20)+H(x+6,32)+row(x+10,71,8,7.5);
  s+=R(x+15,25,27,12,'url(#metal)',.5)+R(x+20,25,17,12,'#343c3f',.3)+T(x+28.5,33.2,'R100',5,'#e2e2ce','text-anchor="middle"');
  s+=IC(x+25,45,18,13,5)+T(x+29,62,'INA226',4.1)+smd(x+49,32,5,3)+smd(x+49,40,5,3)+smd(x+15,48,5,3);
  s+=T(x+53,21,'VCC',3.2,'#dce5d7')+T(x+53,27,'GND',3.2,'#dce5d7');
 }
 else if(id==='tcs34725'){
  const x=cx-36;s=board(x,17,72,60,'#2867aa',2);s+=H(x+5,24)+H(x+67,24)+row(x+10,69,6,10.4);
  s+=T(cx,29,'TCS34725',4.7,'#eff1dc','text-anchor="middle"')+R(cx-10,37,20,15,'#56616c',1)+R(cx-6,40,12,9,'#212331',.5)+R(cx-4,42,8,5,'#57485e',.3);
  s+=R(x+13,41,9,9,'#ece6c9',1)+R(x+15,43,5,5,'#faf3bb',.5)+smd(x+49,43,6,3)+smd(x+32,57,6,3)+smd(x+14,57,6,3);
 }
 else if(id==='max30102'){
  const x=cx-32;s=board(x,8,64,78,'#202b2b',1);for(let i=0;i<7;i++)for(const xx of[x+4,x+60])s+=via(xx,15+i*10.5);
  s+=T(cx,21,'MAX30102',4,'#e0e4d7','text-anchor="middle"');
  s+=R(cx-12,30,24,35,'#565650',2,'stroke="#9b9c8e" stroke-width=".7"')+R(cx-9,33,18,12,'#161f20',1)+R(cx-9,48,18,14,'#282924',1);
  s+=R(cx-6,35,5,7,'#ad8e25',.5)+R(cx+2,35,4,7,'#677b5d',.5)+R(cx-6,51,12,8,'#665b2b',.3)+P(`M${cx-3} 51v8m3-8v8m3-8v8`,'#a08f48',.4);
  s+=smd(x+15,70,6,3)+smd(x+44,71,5,3)+C(x+43,26,1.2,'#748d47');
 }
 else if(id==='i2sMic'){
  const x=cx-29;s=board(x,19,58,56,'#176aa6',3);s+=H(x+6,25)+H(x+52,25)+row(x+9,67,6,8);
  s+=R(cx-10,36,20,17,'url(#metal)',1,'stroke="#d8dfd6" stroke-width=".8"')+R(cx-8,38,16,13,'#abb9b9',.7)+C(cx+4,42,2,'#1c2d38')+C(cx+4,42,.8,'#080e17');
  s+=smd(x+9,48,5,3)+smd(x+44,48,5,3)+T(cx,32,'I2S MEMS',4,'#e2eadf','text-anchor="middle"');
 }
 else if(id==='i2sAmp'){
  const x=cx-35;s=board(x,12,70,71,'#1b69a1',3);s+=H(x+6,18)+H(x+64,18)+row(x+9,75,8,7.5);
  s+=R(x+13,19,40,22,'#45a16f',1.5,'stroke="#b0cead" stroke-width=".8"')+R(x+13,35,40,6,'#297751',.6);
  for(const xx of[x+23,x+43])s+=C(xx,27,6,'#1e473e')+C(xx,27,4.3,'url(#metal)')+P(`M${xx-2.5} 27l5 -1`,'#3b5855',1);
  s+=IC(cx-7,49,14,13,4)+T(cx,69,'MAX98357A',3.6,'#e2e8d8','text-anchor="middle"')+smd(x+11,51,7,3)+smd(x+51,51,7,3)+cap(x+51,63,4);
 }
 else if(id==='rs485'){
  const x=cx-21;s=board(x,4,42,84,'#2a302f',1);s+=row(x+5,11,5,8)+row(x+9,81,4,8);
  s+=IC(cx-8,24,16,22,4)+IC(cx-8,51,16,14,4)+T(cx,36,'485',4,'#b4b9b1','text-anchor="middle"');
  for(const [xx,yy]of[[x+5,23],[x+29,28],[x+5,53],[x+29,53],[x+17,71]])s+=smd(xx,yy,5,3);
  s+=R(x+5,67,4,4,'#b44038',.6)+R(x+31,67,4,4,'#718a49',.6)+T(cx,76,'RS485',3.2,'#ececdb','text-anchor="middle"');
 }
 else if(id==='gps'){
  const x=cx-38;s=board(x,8,76,78,'#176ea9',2);for(const [xx,yy]of[[x+5,14],[x+71,14],[x+5,79],[x+71,79]])s+=H(xx,yy,2.1);
  s+=row(x+13,78,8,7.2)+R(x+15,24,46,39,'url(#metal)',1,'stroke="#c9d0be" stroke-width=".7"')+R(x+18,25,40,32,'#d8bd83',1)+R(x+23,30,30,22,'#e2d9b7',.8)+C(cx,41,5.5,'#c6bb95')+P(`M${cx-1} 37v7l4 2`,'#777867',1);
  s+=T(cx,20,'GPS / GNSS',4,'#e7ebd9','text-anchor="middle"')+IC(x+52,66,12,6,3)+smd(x+13,68,7,3)+smd(x+27,68,5,3);
 }
 else if(id==='buzzerActive'){
  const x=cx-32;s=board(x,11,64,72,'#29557e',1.5);s+=H(x+6,17,2)+H(x+58,77,2)+jst(x+3,34,13,26);
  s+=R(cx-4,30,29,32,'#161e25',6)+`<ellipse cx="${cx+10.5}" cy="34" rx="18.5" ry="15.5" fill="#38414a" stroke="#101a24" stroke-width="1.3"/>`+`<ellipse cx="${cx+10.5}" cy="33" rx="15" ry="12" fill="#202832"/>`+C(cx+10.5,33,3,'#050d16');
  s+=T(cx+10.5,45,'+',6,'#8b9391','text-anchor="middle"')+T(cx+5,73,'BUZZER',4,'#dce4d8','text-anchor="middle"')+smd(x+17,64,5,3);
 }
 return `<g data-photo-body="${id}" data-photo-body080="${id}">${s}</g>`;
}
