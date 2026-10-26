import {RP2040,RP2350} from './pico-engine.js';
import {crc32} from './project-zip.js';
import {PICO_BOARDS} from './pico-boards.js';
import {PicoUSBHost} from './pico-usb-host.js';
import {installROMUSB} from './pico-rom-usb.js';
import {installROMNOR} from './pico-rom-nor.js';
import {installM33ROM} from './pico-m33-rom.js';
export class PicoROMRuntime{
 constructor(id,rom){
  this.board=PICO_BOARDS[id];if(!this.board)throw Error('Pico kartı geçersiz.');this.newer=this.board.mcu==='RP2350';const size=this.newer?32768:16384,checksum=this.newer?0x8ea874c3:0xbb547a1f;
  if(!(rom instanceof Uint8Array)||rom.length!==size||crc32(rom)!==checksum)throw Error(this.newer?'Doğrulanmış RP2350 A2 ROM .bin (32768 bayt) gerekli.':'Doğrulanmış RP2040 B1 ROM .bin (16384 bayt) gerekli.');
  this.rp=this.newer?new RP2350({coreArch:'arm'}):new RP2040();this.rp.loadBootrom(new Uint32Array(Uint8Array.from(rom).buffer));this.rp.flash.fill(255);this.core=this.newer?this.rp.armCore0:this.rp.core[0];this.rp.logger={debug(){},info(){},warn(){},error(){}};this.rp.usbCtrl.debug=()=>{};
  this.resetFlags=1;this.cacheBase=this.newer?0x13ffc000:0x15000000;this.xipSRAM=new DataView(new ArrayBuffer(16384));const read=this.rp.readUint32.bind(this.rp),write=this.rp.writeUint32.bind(this.rp);
  this.rp.readUint32=a=>(a>>>0)>=this.cacheBase&&(a>>>0)<this.cacheBase+16384?this.xipSRAM.getUint32(a-this.cacheBase,true):!this.newer&&(a>>>0)===0x40064008?this.resetFlags:read(a);
  this.rp.writeUint32=(a,v)=>{if((a>>>0)>=this.cacheBase&&(a>>>0)<this.cacheBase+16384){this.xipSRAM.setUint32(a-this.cacheBase,v,true);return;}if(!this.newer&&(a&0xffffcfff)===0x40064008){const type=(a>>>12)&3,old=this.resetFlags,data=type===1?old^v:type===2?old|v:type===3?old&~v:v;this.resetFlags=(old&7)|(data&0x11000000);return;}write(a,v);};
  for(const width of [8,16]){const get=this.rp['readUint'+width].bind(this.rp),set=this.rp['writeUint'+width].bind(this.rp);this.rp['readUint'+width]=a=>(a>>>0)>=this.cacheBase&&(a>>>0)<this.cacheBase+16384?this.xipSRAM['getUint'+width](a-this.cacheBase,true):get(a);this.rp['writeUint'+width]=(a,v)=>{if((a>>>0)>=this.cacheBase&&(a>>>0)<this.cacheBase+16384)this.xipSRAM['setUint'+width](a-this.cacheBase,v,true);else set(a,v);};}if(this.newer)this.security=installM33ROM(this.core);this.nor=installROMNOR(this.rp,this.board.flashSize);installROMUSB(this.rp.usbCtrl);this.usbHost=new PicoUSBHost(this.rp.usbCtrl);this.rp.usbCtrl.onROMCancelRead=ep=>this.usbHost.pendingReads.delete(ep);
 }
 step(count){for(let i=0;i<count;i++){const before=this.core.cycles;this.rp.currentCore=0;this.core.executeInstruction();this.rp.stepThings(this.core.cycles-before);}}
 snapshot(){return{pc:this.core.PC,cycles:this.core.cycles,usb:this.usbHost.snapshot(),revision:this.newer?'RP2350 A2':'RP2040 B1',mode:'Original ROM · isolated flash',flashWrite:true,nor:{...this.nor.stats},security:this.security?{secure:this.core.secure,...this.security.stats}:null};}
}
