// Functional flash/BOOTSEL service. No vendor boot ROM or QSPI timing model.
import {PICO_BOARDS} from './pico-boards.js';
export const FLASH_BASE=0x10000000;
export const uf2Family=b=>b.mcu==='RP2350'?0xe48bff59:0xe48bff56;
export function readUF2(bytes,id){
 const b=PICO_BOARDS[id];if(!b||!(bytes instanceof Uint8Array)||!bytes.length||bytes.length%512||bytes.length>b.flashSize*2)throw Error('UF2 boyutu geçersiz.');
 const pages=new Map(),numbers=new Set();let total=0,end=0;
 for(let at=0;at<bytes.length;at+=512){const v=new DataView(bytes.buffer,bytes.byteOffset+at,512),n=v.getUint32(20,true),count=v.getUint32(24,true),off=v.getUint32(12,true)-FLASH_BASE;
  if(v.getUint32(0,true)!==0x0a324655||v.getUint32(4,true)!==0x9e5d5157||v.getUint32(508,true)!==0x0ab16f30)throw Error('UF2 imzası geçersiz.');
  if(v.getUint32(8,true)!==0x2000||v.getUint32(28,true)!==uf2Family(b))throw Error('UF2 ailesi veya bayrakları desteklenmiyor.');
  if(v.getUint32(16,true)!==256||off<0||off%256||off+256>b.flashSize||!count||count>b.flashSize/256||n>=count||numbers.has(n)||pages.has(off)||(total&&total!==count))throw Error('UF2 blok/adres/sıra bilgisi geçersiz.');
  total=count;numbers.add(n);pages.set(off,bytes.slice(at+32,at+288));end=Math.max(end,off+256);
 }
 if(numbers.size!==total)throw Error('UF2 eksik blok içeriyor.');
 const image=new Uint8Array(end).fill(255);for(const[off,data]of pages)image.set(data,off);
 validateFlashVector(image,b);return image;
}
export function validateFlashVector(image,b){const v=new DataView(image.buffer,image.byteOffset,image.byteLength),sp=v.getUint32(0,true),pc=v.getUint32(4,true);if(sp<0x20000008||sp>0x20000000+b.ram||(sp&7)||!(pc&1)||pc<FLASH_BASE+8||pc>=FLASH_BASE+image.length)throw Error('Doğrudan vektör tablosu gereklidir. SDK boot2/picobin/ROM görüntüleri bu modelde desteklenmez.');}
export function writeUF2(image,id){const b=PICO_BOARDS[id];if(!b||!image.length||image.length>b.flashSize)throw Error('Flash boyutu geçersiz.');const count=Math.ceil(image.length/256),out=new Uint8Array(count*512);for(let i=0;i<count;i++){const at=i*512,v=new DataView(out.buffer,at,512);[0x0a324655,0x9e5d5157,0x2000,FLASH_BASE+i*256,256,i,count,uf2Family(b)].forEach((n,j)=>v.setUint32(j*4,n,true));out.fill(255,at+32,at+288);out.set(image.subarray(i*256,(i+1)*256),at+32);v.setUint32(508,0x0ab16f30,true);}return out;}
export class PicoFlash{
 constructor(runtime){this.r=runtime;this.args=new Map();this.bootsel=false;}
 range(off,len,align){if(!Number.isInteger(off)||!Number.isInteger(len)||off<0||len<=0||off%align||len%align||off+len>this.r.board.flashSize)throw Error('Flash hizalama veya kapasite sınırı.');}
 erase(off,len){this.range(off,len,4096);this.r.flashState.fill(255,off,off+len);this.r.rp.flash.set(this.r.flashState.subarray(off,off+len),off);}
 program(off,data){this.range(off,data.length,256);for(let i=0;i<data.length;i++)this.r.flashState[off+i]&=data[i];this.r.rp.flash.set(this.r.flashState.subarray(off,off+data.length),off);}
 loadUF2(bytes){if(!this.bootsel)throw Error('Önce BOOTSEL moduna geçin.');const next=readUF2(bytes,this.r.chip),sectors=new Set();for(let at=0;at<bytes.length;at+=512){const v=new DataView(bytes.buffer,bytes.byteOffset+at,512);sectors.add(Math.floor((v.getUint32(12,true)-FLASH_BASE)/4096)*4096);}for(const off of sectors)this.erase(off,4096);for(let at=0;at<bytes.length;at+=512){const v=new DataView(bytes.buffer,bytes.byteOffset+at,512);this.program(v.getUint32(12,true)-FLASH_BASE,bytes.subarray(at+32,at+288));}this.r.image=next;this.r.debugger=null;this.r.reset();}
 read(address){return(address>>>0)===0x5fffe210?+this.bootsel:null;}
 write(address,value){const off=(address>>>0)-0x5fffe200;if(off<0||off>0x1f)return false;value>>>=0;if(off===0){if(value===3){this.bootsel=true;return true;}const start=this.args.get(4)||0,len=this.args.get(8)||0;if(value===1)this.erase(start,len);else if(value===2){const ptr=this.args.get(12)||0;if(ptr<0x20000000||ptr+len>0x20000000+this.r.board.ram)throw Error('Flash program kaynağı RAM olmalı.');this.range(start,len,256);this.program(start,Uint8Array.from({length:len},(_,i)=>this.r.rp.readUint8(ptr+i)));}else throw Error('Flash komutu geçersiz.');}else this.args.set(off,value);return true;}
}
