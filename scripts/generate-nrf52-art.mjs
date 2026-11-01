import {writeFile} from 'node:fs/promises';
import {NRF52_BOARDS} from '../dist/nrf52-boards.js';
const defs=`<defs><linearGradient id="usb" x2="0" y2="1"><stop stop-color="#f3f4ef"/><stop offset=".3" stop-color="#a0a6a3"/><stop offset=".65" stop-color="#e6e8e2"/><stop offset="1" stop-color="#858e8a"/></linearGradient><linearGradient id="shield" x2=".8" y2="1"><stop stop-color="#e3e4df"/><stop offset=".45" stop-color="#b7bdb9"/><stop offset="1" stop-color="#d9dcd7"/></linearGradient><linearGradient id="chip" x2="1" y2="1"><stop stop-color="#343b3a"/><stop offset="1" stop-color="#181d1d"/></linearGradient></defs>`;
const text=(x,y,s,size=2.5,color='#e2e1ce',extra='')=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${color}" ${extra}>${s}</text>`;
function passive(x,y,w=3.7,h=1.7,body='#565b52',rotation=0){return `<g transform="translate(${x} ${y}) rotate(${rotation})"><rect width="${w}" height="${h}" rx=".35" fill="#aebbb7"/><rect x=".65" width="${w-1.3}" height="${h}" fill="${body}"/><path d="M.4 .3h.4m${w-1.5} 0h.5" stroke="#e5e8e0" stroke-width=".3"/></g>`;}
function chip(x,y,w,h,label,rotation=0){let pins='';for(let i=2;i<w-1;i+=2)for(const yy of [-.9,h])pins+=`<rect x="${i}" y="${yy}" width=".7" height="1" fill="#b2b8ae"/>`;for(let i=2;i<h-1;i+=2)for(const xx of [-.9,w])pins+=`<rect x="${xx}" y="${i}" width="1" height=".7" fill="#b2b8ae"/>`;return`<g transform="translate(${x} ${y}) rotate(${rotation} ${w/2} ${h/2})">${pins}<rect width="${w}" height="${h}" rx=".7" fill="url(#chip)" stroke="#3e4745" stroke-width=".4"/><circle cx="2" cy="2" r=".6" fill="#84938b"/>${text(w/2,h/2-1,'NORDIC',2,'#929b93','text-anchor="middle"')}${text(w/2,h/2+3,label,2,'#929b93','text-anchor="middle"')}</g>`;}
for(const b of Object.values(NRF52_BOARDS)){
 const xiao=b.id.startsWith('xiao'),red=b.id==='nrf52840-supermini',sense=b.id.endsWith('sense'),W=b.width,H=b.height,bg=red?'#b92530':'#202b2c',edge=red?'#e46f6d':'#5d6962';let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><title>${b.name} · referansa göre çizilmiş kart / ${b.revision}</title>${defs}<rect x="1" y="6" width="${W-2}" height="${H-7}" rx="${xiao?7:3}" fill="${bg}" stroke="${edge}" stroke-width="1"/><rect x="2.3" y="7.3" width="${W-4.6}" height="${H-9.6}" rx="${xiao?6:2}" fill="none" stroke="${red?'#d94946':'#394947'}" stroke-width=".4"/>`;
 // Subtle copper routing rather than decorative blocks behind labels.
 for(let i=0;i<(xiao?7:13);i++){const y=18+i*9.6;s+=`<path d="M10 ${y}h${7+i%3*2}l${xiao?3:9} ${xiao?2:6}v${xiao?4:9} M${W-10} ${y}h-${8+i%4}l-${xiao?3:10} ${xiao?2:6}" fill="none" stroke="${red?'#d94746':'#47544a'}" stroke-width=".45" opacity=".6"/>`;}
 for(const p of b.pins.filter(p=>p.connectable!==false)){s+=`<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#c7a46b" stroke="#eee2b2" stroke-width=".45"/><circle cx="${p.x}" cy="${p.y}" r="2" fill="${bg}" stroke="#7c7255" stroke-width=".45"/>`;if(p.side!=='bottom')s+=text(p.side==='left'?11:W-11,p.y+1,p.name.replace('BAT+ / RAW','BAT+').replace(/^GND\.\d+$/,'GND').replace(/D(\d+) \/ P\d.\d+/,'D$1'),xiao?2.15:2.5,'#e8e6d4',p.side==='right'?'text-anchor="end"':'');}
 const ux=xiao?18:29,uw=xiao?32:34;
 s+=`<path d="M${ux-1} 7h${uw+2}v18h-${uw+2}z" fill="#0f171b"/><rect x="${ux}" y="1" width="${uw}" height="23" rx="2" fill="url(#usb)" stroke="#73827e" stroke-width=".6"/><path d="M${ux+2} 3h${uw-4}M${ux+2} 22h${uw-4}" stroke="#f2f2e7" stroke-width=".5"/><rect x="${ux+4}" y="0" width="${uw-8}" height="5" rx="2" fill="#222a2c" stroke="#b7c2ba" stroke-width=".6"/><path d="M${ux+6} 2.5h${uw-12}" stroke="#b7a679" stroke-width="1.1"/><rect x="${ux+5}" y="18" width="5" height="2" rx=".7" fill="#48514d"/><rect x="${ux+uw-10}" y="18" width="5" height="2" rx=".7" fill="#48514d"/>`;
 for(let i=0;i<12;i++)s+=`<rect x="${ux+4+i*(uw-8)/12}" y="24" width=".65" height="2.1" fill="#c4c7b0"/>`;
 if(xiao){
  s+=`<rect x="13" y="30" width="42" height="39" rx="2" fill="url(#shield)" stroke="#697673" stroke-width=".7"/><rect x="14.3" y="31.3" width="39.4" height="36.4" rx="1" fill="none" stroke="#f1f0e8" stroke-width=".35"/>${text(34,39,'seeed studio',5.1,'#3e4948','text-anchor="middle" font-weight="bold"')}${text(34,45,'XIAO-nRF52840',3,'#48534f','text-anchor="middle"')}${text(34,51,'2.4 GHz / Cortex-M4F',2.5,'#626b65','text-anchor="middle"')}${text(34,61,'FCC   CE',4.6,'#56615b','text-anchor="middle"')}`;
  // Actual reset tact at the upper-left of USB, RGB indicator on upper-right.
  s+=`<rect x="9" y="8" width="7" height="11" rx="1" fill="#9ca7a4" stroke="#cfd8cb" stroke-width=".5"/><ellipse cx="12.5" cy="13.5" rx="2.7" ry="3" fill="#586965"/><circle cx="12.5" cy="13.5" r="1.15" fill="#263c38"/><rect x="53" y="10" width="4" height="3" fill="#d6e5d1" stroke="#7c897c" stroke-width=".5"/>`;
  s+=passive(18,76,6,3,'#7a847e')+passive(26,76,10,4,'#264d67')+passive(42,74,3,2)+passive(43,78,3,2)+passive(49,74,3,2);
  if(sense)s+=`<rect x="48" y="73" width="9" height="9" fill="#414a43" stroke="#8c9687" stroke-width=".5"/><circle cx="54" cy="76" r=".75" fill="#171e17"/>${text(52.5,80,'MIC',1.6,'#aeb8a4','text-anchor="middle"')}`;
 }else if(red){
  s+=chip(24,34,12,6,'',0)+chip(53,34,12,6,'',0);for(let i=0;i<6;i++)s+=passive(28+i*5,29,2,1.4,'#b7a78b',90);
  s+=`<rect x="23" y="48" width="6" height="16" rx="2" fill="url(#shield)" stroke="#dfdfcd" stroke-width=".5"/>${text(26,56,'32 MHz',2,'#626f66','text-anchor="middle" transform="rotate(-90 26 56)"')}<rect x="62" y="63" width="13" height="9" rx="2" fill="url(#shield)" stroke="#ece8cc" stroke-width=".6"/>`;
  s+=chip(28,78,37,37,'nRF52840',45);
  for(let i=0;i<7;i++)s+=passive(20+i*6,71+(i%2)*4,3,1.8,'#baa889',45)+passive(23+i*6,118+(i%2)*3,3,1.8,'#baa889',-45);
  s+=`<rect x="40" y="135" width="12" height="4" rx=".6" fill="#d7dfd0" stroke="#63796f" stroke-width=".6"/>`;
 }else{
  s+=chip(53,32,15,17,'',0)+chip(29,69,34,34,'nRF52840',0);
  for(let i=0;i<6;i++){s+=passive(23+i*6,54,3.4,1.9,'#ae9e80',90);s+=passive(26+i*6,63,2.4,1.5);s+=passive(22+i*7,110,3,1.7);}
  s+=`<rect x="21" y="35" width="9" height="6" rx="1" fill="url(#shield)" stroke="#c3c6ba" stroke-width=".5"/>${text(46,136,'nice!nano',6.5,'#e6e6d8','text-anchor="middle" font-weight="bold"')}${text(46,140,'v2.0',2.8,'#e6e6d8','text-anchor="middle"')}<path d="M30 145h6l4-3 6 3 6-3 4 3h6" fill="none" stroke="#d9d8bf" stroke-width="1.1"/>`;
 }
 s+='</svg>';await writeFile(new URL('../dist/assets/'+b.asset,import.meta.url),s);
}
console.log('Four nRF52840 board SVGs generated from documented references.');
