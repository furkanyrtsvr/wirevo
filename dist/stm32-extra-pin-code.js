// Board-generated initialization for independently modelled peripheral units.
export function extraPinCode(config,b){
 const f4=b.cpu==='cortex-m4f',lines=[],groups=new Map(),R=a=>'(*(volatile unsigned*)'+a+'u)';
 for(const[pin,v]of Object.entries(config.pins)){
  const m=/^hw_(TIM(1|3|4|5|9|10|11)_CH[1-4]|SPI[2-5]_(?:NSS|SCK|MISO|MOSI)|I2C[23]_(?:SDA|SCL)|USART(?:3|6)_(?:TX|RX))$/.exec(v.function);if(!m)continue;
  const name=m[1],unit=name.split('_')[0],bank=pin.charCodeAt(1)-65,n=+pin.slice(2),input=/_RX$|_MISO$/.test(name),od=unit.startsWith('I2C');
  if(!groups.has(unit))groups.set(unit,[]);groups.get(unit).push({pin,name,value:v});
  if(f4){const base=0x40020000+bank*1024,af=unit.startsWith('TIM')?['TIM1'].includes(unit)?1:['TIM3','TIM4','TIM5'].includes(unit)?2:3:unit.startsWith('I2C')?(['PB3','PB4','PB8','PB9'].includes(pin)?9:4):unit==='USART6'?8:unit.startsWith('USART')?7:unit==='SPI3'||unit==='SPI5'?6:unit==='SPI4'&&pin[1]!=='E'?6:5;
   lines.push(`    ${R(0x40023830)} |= ${1<<bank}u;`, `    ${R(base)} = (${R(base)} & ~(${3}u<<${n*2})) | (2u<<${n*2});`,`    ${R(base+4)} = (${R(base+4)} & ~(1u<<${n})) | (${od?1:0}u<<${n});`,`    ${R(base+32+(n>=8?4:0))} = (${R(base+32+(n>=8?4:0))} & ~(15u<<${n%8*4})) | (${af}u<<${n%8*4});`);
  }else{const reg=0x40010800+bank*1024+(n>=8?4:0),mode=input?4:od?15:11;lines.push(`    ${R(0x40021018)} |= ${1<<(bank+2)}u;`,`    ${R(reg)} = (${R(reg)} & ~(15u<<${n%8*4})) | (${mode}u<<${n%8*4});`);}
 }
 for(const[unit,pins]of groups){const n=+unit.match(/\d+$/)[0],has=signal=>pins.some(p=>p.name===unit+'_'+signal);let base,enable,bit;
  if(unit.startsWith('TIM')){base={1:f4?0x40010000:0x40012c00,3:0x40000400,4:0x40000800,5:0x40000c00,9:0x40014000,10:0x40014400,11:0x40014800}[n];const period=Math.max(1,Math.round(1000000/(pins[0].value.pwmHz??1000))),apb2=[1,9,10,11].includes(n);enable=f4?(apb2?0x40023844:0x40023840):(apb2?0x40021018:0x4002101c);bit=n===1?(f4?0:11):{3:1,4:2,5:3,9:16,10:17,11:18}[n];lines.push(`    ${R(enable)} |= (1u<<${bit});`,`    ${R(base+40)} = ${b.hz/1000000-1}u;`,`    ${R(base+44)} = ${period-1}u;`);for(const p of pins){const ch=+p.name.at(-1)-1,ccm=base+(ch<2?24:28),shift=ch%2*8,duty=p.value.pwmDuty??0;lines.push(`    ${R(ccm)} = (${R(ccm)} & ~(255u<<${shift})) | (104u<<${shift});`,`    ${R(base+52+ch*4)} = ${Math.round(duty*period/100)}u;`,`    ${R(base+32)} |= (1u<<${ch*4});`);}if(n===1)lines.push(`    ${R(base+68)} |= 32768u;`);lines.push(`    ${R(base+20)} = 1u;`,`    ${R(base)} = 129u;`);}
  else if(unit.startsWith('SPI')){if(!['SCK','MISO','MOSI'].every(has))throw Error(unit+' SCK/MISO/MOSI birlikte seçilmeli.');base={2:0x40003800,3:0x40003c00,4:0x40013400,5:0x40015000}[n];const apb2=n>=4;enable=f4?(apb2?0x40023844:0x40023840):0x4002101c;bit={2:14,3:15,4:13,5:20}[n];lines.push(`    ${R(enable)} |= 1u<<${bit};`,`    ${R(base+4)} = ${has('NSS')?4:0}u;`,`    ${R(base)} = ${64|4|(5<<3)|(has('NSS')?0:768)}u;`);}
  else if(unit.startsWith('I2C')){if(!has('SDA')||!has('SCL'))throw Error(unit+' SDA/SCL birlikte seçilmeli.');base=n===2?0x40005800:0x40005c00;enable=f4?0x40023840:0x4002101c;const hz=f4?b.hz/2:b.hz/2;lines.push(`    ${R(enable)} |= 1u<<${20+n};`,`    ${R(base+4)} = ${hz/1000000}u;`,`    ${R(base+28)} = ${Math.ceil(hz/200000)}u;`,`    ${R(base+32)} = ${hz/1000000+1}u;`,`    ${R(base)} = 1u;`);}
  else {if(!has('TX')||!has('RX'))throw Error(unit+' TX/RX birlikte seçilmeli.');base=n===6?0x40011400:0x40004800;enable=n===6?0x40023844:0x4002101c;bit=n===6?5:18;lines.push(`    ${R(enable)} |= 1u<<${bit};`,`    ${R(base+8)} = ${Math.round((n===6?b.hz:b.hz/2)/9600)}u;`,`    ${R(base+12)} = 8204u;`);}
 }
 return lines;
}
