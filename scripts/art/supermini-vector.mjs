import {NRF52_BOARDS} from '../../dist/nrf52-boards.js';
// Hand-drawn PCB artwork based on the supplied black SuperMini reference.
// Keep all contact centres and the LED aligned to the existing project geometry.
export function superminiVector(){
 const b=NRF52_BOARDS['nrf52840-supermini'];
 const t=(x,y,s,size=2.1,extra='')=>`<text x="${x}" y="${y}" fill="#eeeede" font-family="Arial,sans-serif" font-size="${size}" ${extra}>${s}</text>`;
 const smd=(x,y,w,h,fill='#b4a88a')=>`<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx=".25" fill="#c4cbc5"/><rect x="${x+.55}" y="${y}" width="${w-1.1}" height="${h}" fill="${fill}"/></g>`;
 let s=`<svg xmlns="http://www.w3.org/2000/svg" width="92" height="146" viewBox="0 0 92 146"><title>SuperMini nRF52840 — referans fotoğrafa göre çizilmiş siyah PCB</title><defs><linearGradient id="metal" x2=".9" y2="1"><stop stop-color="#f1f2e9"/><stop offset=".3" stop-color="#9ca6a4"/><stop offset=".55" stop-color="#e7e9df"/><stop offset="1" stop-color="#7b8685"/></linearGradient><linearGradient id="pcb" x2="1" y2="1"><stop stop-color="#242b2d"/><stop offset="1" stop-color="#101618"/></linearGradient></defs><rect x="13" y="13" width="66" height="125" rx="1.8" fill="url(#pcb)" stroke="#68706a" stroke-width=".6"/>`;
 for(let i=0;i<10;i++)s+=`<path d="M21 ${43+i*8}h${6+i%3}l${6+i%4} 6v7m36-${13+i%5}h-8l-5 5" stroke="#39433f" stroke-width=".45" fill="none"/>`;
 // USB-C shield, retention tabs and exposed contact fanout.
 s+=`<rect x="28" y="9" width="36" height="27" rx="2" fill="url(#metal)" stroke="#adb7b0" stroke-width=".6"/><path d="M30 12h32M30 33h32" stroke="#f1f1e6" stroke-width=".5"/><rect x="32" y="8.5" width="28" height="4.5" rx="2" fill="#273333" stroke="#c6cfc2" stroke-width=".7"/><path d="M35 11h22" stroke="#c2ad71" stroke-width=".85"/><path d="M28 17h-3v5h3m36-5h3v5h-3M28 28h-3v5h3m36-5h3v5h-3" fill="none" stroke="#c2cac2" stroke-width="1.6"/>`;
 for(let i=0;i<12;i++)s+=`<rect x="${32+i*2.3}" y="36" width=".9" height="3" fill="#bfc9c1"/>`;
 for(let i=0;i<5;i++)s+=smd(27+i*8,42,4,1.8,i%2?'#222c2b':'#ae9e7c');
 s+=smd(27,48,9,5,'#26302f')+smd(52,48,11,5,'#26302f')+smd(43,47,3,7);
 s+=`<rect x="26" y="59" width="7" height="16" rx="1.4" fill="url(#metal)" stroke="#bfc7bb" stroke-width=".5"/>${t(30.5,72,'32 MHz',1.7,'transform="rotate(-90 30.5 72)"')}<rect x="59" y="69" width="12" height="8" rx="1.2" fill="url(#metal)"/>${t(65,74,'32.768',1.5,'text-anchor="middle"')}`;
 for(let i=0;i<5;i++)s+=smd(35+i*4,57,2.5,1.5)+smd(38+i*4,64,2.5,1.6,'#25312e');
 s+='<g transform="translate(46 97) rotate(45)">';
 for(let i=0;i<10;i++){let p=-14+i*3;s+=`<path d="M${p} -18v-3M${p} 18v3M-18 ${p}h-3M18 ${p}h3" stroke="#bfc8c0" stroke-width="1.35"/>`;}
 s+=`<rect x="-18" y="-18" width="36" height="36" rx="1.2" fill="#202729" stroke="#444c49" stroke-width=".6"/><circle cx="-14" cy="-14" r=".7" fill="#a6afa3"/>${t(0,-5,'NORDIC',2.5,'text-anchor="middle"')}${t(0,0,'nRF52840',3,'text-anchor="middle"')}${t(0,5,'QIAA',2.3,'text-anchor="middle"')}</g>`;
 // Passives surround, rather than obscure, the processor and lower test pads.
 for(const [x,y] of [[24,80],[22,88],[64,84],[66,93],[24,106],[60,112],[23,116],[56,120]])s+=smd(x,y,4,1.8);
 for(const p of b.pins.filter(p=>p.connectable!==false)){
  s+=`<circle cx="${p.x}" cy="${p.y}" r="3.25" fill="#c6a356" stroke="#f0dd9b" stroke-width=".5"/><circle cx="${p.x}" cy="${p.y}" r="1.95" fill="#3a3d29" stroke="#7e743d" stroke-width=".35"/>`;
  if(p.side==='bottom')continue;
  let label=p.name.replace(/^GND\.\d+$/,'GND').replace('RESET','RST');
  s+=t(p.side==='left'?12:80,p.y+.9,label,2.6,p.side==='left'?'text-anchor="end"':'');
 }
 s+=`<rect x="39" y="130" width="13" height="5.7" rx=".5" fill="#bdc5b3" stroke="#758274" stroke-width=".45"/><rect x="42" y="130.5" width="7" height="4.7" fill="#d3d5c6"/><circle cx="45.498" cy="132.865" r="1.35" fill="#b1c5b6"/>${t(60,134,'SuperMini',2.0,'text-anchor="middle"')}</svg>`;
 return s;
}
