import {uf2Family} from './pico-flash.js';
export function parseROMUF2(bytes,board){
 if(!(bytes instanceof Uint8Array)||!bytes.length||bytes.length%512||bytes.length>board.flashSize*2)throw Error('ROM UF2 dosya boyutu geçersiz.');const pages=new Map(),blocks=new Map();let total=0;
 for(let at=0;at<bytes.length;at+=512){const block=bytes.slice(at,at+512),v=new DataView(block.buffer,block.byteOffset,block.byteLength),address=v.getUint32(12,true),number=v.getUint32(20,true),count=v.getUint32(24,true),family=v.getUint32(28,true),flags=v.getUint32(8,true);
  if(v.getUint32(0,true)!==0x0a324655||v.getUint32(4,true)!==0x9e5d5157||v.getUint32(508,true)!==0x0ab16f30||v.getUint32(16,true)!==256)throw Error('ROM UF2 imzası/sayfa boyutu geçersiz.');
  if(![0x2000,0xa000].includes(flags)||family!==uf2Family(board)&&!(board.mcu==='RP2350'&&family===0xe48bff57))throw Error('ROM UF2 ailesi/bayrakları bu kart için desteklenmiyor.');
  if(address<0x10000000||address%256||address+256>0x10000000+board.flashSize||!count||count>board.flashSize/256||number>=count||total&&total!==count)throw Error('ROM UF2 adres/blok sınırı geçersiz.');total=count;
  if(blocks.has(number)){if(block.some((b,i)=>b!==blocks.get(number)[i]))throw Error('ROM UF2 çakışan tekrar blok.');continue;}if(pages.has(address))throw Error('ROM UF2 üst üste gelen adresler.');blocks.set(number,block);pages.set(address,block.slice(32,288));
 }if(blocks.size!==total)throw Error('ROM UF2 eksik blok içeriyor.');return{blocks:[...blocks.values()],pages};
}
export function programROMBlock(runtime,block){const transaction=runtime.usbHost.startSCSI([0x2a,0,0,0,0,100,0,0,1,0],{length:512,data:block});for(let i=0;i<1500&&!transaction.done;i++)runtime.step(1000);if(!transaction.done||transaction.status!==0||transaction.residue)throw Error('Özgün ROM flash aktarımı tamamlanmadı.');}
export function verifyROMFlash(runtime,pages){for(const[address,bytes]of pages)if(bytes.some((b,i)=>runtime.rp.flash[address-0x10000000+i]!==b))throw Error('ROM flash doğrulaması başarısız: 0x'+address.toString(16)+'. ROM bu görüntüyü reddetmiş olabilir.');return{pages:pages.size,bytes:pages.size*256};}
