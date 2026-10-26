import {RP2040} from './pico-engine.js';
import {crc32} from './project-zip.js';
import {PICO_BOARDS} from './pico-boards.js';
import {PicoUSBHost} from './pico-usb-host.js';
import {installROMUSB} from './pico-rom-usb.js';
export class PicoROMRuntime{
 constructor(id,rom){if(!(rom instanceof Uint8Array)||rom.length!==16384||crc32(rom)!==0xbb547a1f)throw Error('Doğrulanmış RP2040 B1 ROM .bin (16384 bayt) gerekli.');const bootromB1=new Uint32Array(rom.slice().buffer);this.board=PICO_BOARDS[id];if(this.board?.mcu!=='RP2040')throw Error('Özgün ROM oturumu şu anda yalnız RP2040 içindir. RP2350 güvenlik geçişi desteklenmiyor.');this.rp=new RP2040();this.rp.loadBootrom(bootromB1);this.rp.flash.fill(255);this.core=this.rp.core[0];this.rp.logger={debug(){},info(){},warn(){},error(){}};this.rp.usbCtrl.debug=()=>{};this.resetFlags=1;const read=this.rp.readUint32.bind(this.rp),write=this.rp.writeUint32.bind(this.rp);this.rp.readUint32=a=>(a>>>0)===0x40064008?this.resetFlags:read(a);this.rp.writeUint32=(a,v)=>{if((a&0xffffcfff)===0x40064008){const type=(a>>>12)&3,old=this.resetFlags,data=type===1?old^v:type===2?old|v:type===3?old&~v:v;this.resetFlags=(old&7)|(data&0x11000000);return;}write(a,v);};installROMUSB(this.rp.usbCtrl);this.usbHost=new PicoUSBHost(this.rp.usbCtrl);}
 step(count){for(let i=0;i<count;i++){const before=this.core.cycles;this.rp.currentCore=0;this.core.executeInstruction();this.rp.stepThings(this.core.cycles-before);}}
 snapshot(){return{pc:this.core.PC,cycles:this.core.cycles,usb:this.usbHost.snapshot(),revision:'RP2040 B1',mode:'Original ROM · isolated erased flash',flashWrite:false};}
}
