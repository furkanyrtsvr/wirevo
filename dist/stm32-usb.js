// STM32F103 USB FS device controller: PMA single/double buffer and ISO.
// USB host tokens are explicit API calls; bytes always come from ARM firmware.
const BASE=0x40005c00,PMA=0x40006000;
export class STMUSB {
 constructor(r){this.r=r;this.tokenACK=true;this.reset();}
 reset(){this.ep=new Uint16Array(8);this.pma=new Uint16Array(256);this.cntr=3;this.events=0;this.daddr=0;this.btable=0;this.packets=0;this.doubleStarted=new Set();this.frame=0;this.frameAt=this.r.count;}
 clocked(){return this.r.board.cpu!=='cortex-m4f'&&!!(this.r.regs.get(0x4002101c)&(1<<23));}
 clock48(){const cr=this.r.regs.get(0x40021000)||0,c=this.r.regs.get(0x40021004)||0,hse=this.r.board.hse||8000000,source=c&(1<<16)?hse/(c&(1<<17)?2:1):4000000,mul=Math.min(16,((c>>>18)&15)+2),hz=source*mul/(c&(1<<22)?1:1.5);if(!(cr&(1<<24))||Math.abs(hz-48000000)>1)throw Error('USB FS için RCC üzerinden 48 MHz saat gerekli.');}
 active(){return this.clocked()&&!(this.cntr&3)&&!!(this.daddr&128);}
 shared(){if(this.r.regs.get(0x4002101c)&(1<<25))throw Error('STM32F103 USB ve CAN aynı 512 bayt SRAM’i paylaşır; birlikte çalıştırılamaz.');}
 istr(){for(let i=0;i<8;i++)if(this.ep[i]&0x8080)return this.events|0x8000|(this.ep[i]&0x8000?16:0)|i;return this.events;}
 irqExtra(){if(!this.clocked())return 0;const high=(this.cntr&0x8000)&&this.ep.some(e=>(e&0x8080)&&this.buffered(e));return ((this.istr()&this.cntr&0xff00)?8:0)|(high?4:0);}
 index(ep){return this.ep.findIndex(v=>(v&15)===ep&&(v&0x3030));}
 table(i,o){const at=this.btable+i*8+o;this.bounds(at,2);return at>>>1;}
 address(value){return value===(this.daddr&127);}
 hostReset(){if(!this.clocked()||(this.cntr&3))return 'DISCONNECTED';this.shared();this.clock48();this.ep.fill(0);this.doubleStarted.clear();this.frame=0;this.frameAt=this.r.count;this.daddr=0;this.events=0x400;this.packets=0;return 'ACK';}
 buffered(e){return (e&0x600)===0x400||(e&0x700)===0x100;}
 iso(e){return (e&0x600)===0x400;}
 buffer(i,incoming){const e=this.ep[i],double=this.buffered(e);return double?((e&(incoming?0x40:0x4000))?4:0):(incoming?0:4);}
 conflict(i,incoming){const e=this.ep[i];return !this.iso(e)&&this.buffered(e)&&this.doubleStarted.has(i+':'+incoming)&&!!(e&0x40)===!!(e&0x4000);}
 tick(){if(!this.active())return;const frames=Math.floor((this.r.count-this.frameAt)/(this.r.board.hz/1000));if(frames>0){this.frame=(this.frame+frames)&2047;this.frameAt+=frames*this.r.board.hz/1000;this.events|=512;}}
 hostOut(address,endpoint,data,setup=false,token={}){
  if(!(data instanceof Uint8Array)||data.length>1023)throw Error('USB FS paket sınırı 1023 bayt.');
  if(!this.active()||!this.address(address))return 'DISCONNECTED';this.shared();this.clock48();const i=this.index(endpoint);if(i<0)return 'NAK';const e=this.ep[i],iso=this.iso(e),double=this.buffered(e),status=e>>>12&3;
  if(status===1&&!setup)return iso?'NO_RESPONSE':'STALL';if(!setup&&!iso&&status&&token.crcValid!==false&&['DATA0','DATA1'].includes(token.pid)&&token.pid!==(e&0x4000?'DATA1':'DATA0'))return 'ACK';if(status!==3&&!(setup&&(e&0x600)===0x200))return iso?'NO_RESPONSE':'NAK';
  if(setup&&data.length!==8)throw Error('USB SETUP 8 bayt olmalı.');if(!iso&&data.length>64)throw Error('USB bulk/control/interrupt paket sınırı 64 bayt.');
  if(token.crcValid===false){this.events|=8192;return iso?'DROPPED':'CRC_ERROR';}
  const expected=setup||iso?'DATA0':e&0x4000?'DATA1':'DATA0';if(token.pid&&token.pid!==expected){if(token.pid==='DATA0'||token.pid==='DATA1')return iso?'DROPPED':'ACK';this.events|=8192;return 'PID_ERROR';}
  if(!setup&&this.conflict(i,false))return 'NAK';const offset=this.buffer(i,false),count=this.pma[this.table(i,offset+2)],capacity=count&0x8000?(((count>>>10)&31)+1)*32:((count>>>10)&31)*2;
  if(data.length>capacity){this.events|=16384;return iso?'DROPPED':'NAK';}const at=this.pma[this.table(i,offset)];this.bounds(at,data.length);
  for(let n=0;n<data.length;n+=2)this.pma[(at+n)>>>1]=data[n]|((data[n+1]||0)<<8);this.pma[this.table(i,offset+2)]=(count&0xfc00)|data.length;
  this.ep[i]=(e&~0x800)|0x8000|(setup?0x800:0);if(setup)this.ep[i]=(this.ep[i]&~0x7070)|0x6060;else{this.ep[i]^=0x4000;if(!double)this.ep[i]=(this.ep[i]&~0x3000)|0x2000;this.doubleStarted.add(i+':false');}this.packets++;return iso?'ISO':'ACK';
 }
 hostIn(address,endpoint,token={}){
  if(!this.active()||!this.address(address))return {status:'DISCONNECTED'};this.shared();this.clock48();const i=this.index(endpoint);if(i<0)return {status:'NAK'};const e=this.ep[i],iso=this.iso(e),double=this.buffered(e),status=e>>>4&3;
  if(status===1)return {status:iso?'NO_RESPONSE':'STALL'};if(status!==3)return {status:iso?'NO_RESPONSE':'NAK'};if(this.conflict(i,true))return {status:'NAK'};
  const offset=this.buffer(i,true),at=this.pma[this.table(i,offset)],count=this.pma[this.table(i,offset+2)]&1023;this.bounds(at,count);if(!iso&&count>64)throw Error('USB TX paket sınırı 64 bayt.');
  const data=Uint8Array.from({length:count},(_,n)=>(this.pma[(at+n)>>>1]>>>((n&1)*8))&255),pid=iso?'DATA0':e&0x40?'DATA1':'DATA0';
  if(iso||token.ack!==false){this.ep[i]=(e|0x80)^0x40;if(!double)this.ep[i]=(this.ep[i]&~0x30)|0x20;this.doubleStarted.add(i+':true');this.packets++;}
  return {status:iso?'ISO':'ACK',data,pid,handshake:!iso};
 }
 bounds(at,n){if((at&1)||at+n>512)throw Error('USB PMA adresi 512 bayt sınırını aşıyor.');}
 read(a,n){if(a>=PMA&&a<PMA+1024){if(a%4||![2,4].includes(n))throw Error('USB PMA hizalı16/32bit erişim gerektirir.');return this.clocked()?this.pma[(a-PMA)/4]:0;}if(a<BASE||a>BASE+0x50)return undefined;if(this.r.board.cpu==='cortex-m4f')throw Error('F401/F411 USB OTG FS farklı register mimarisi kullanır; F103 USB PMA geçerli değil.');if(a%4||![2,4].includes(n))throw Error('USB register hizalı16/32bit olmalı.');if(!this.clocked())return 0;const o=a-BASE;if(o<32)return this.ep[o/4];if(o===0x40)return this.cntr;if(o===0x44)return this.istr();if(o===0x48){this.tick();return this.frame;}if(o===0x4c)return this.daddr;if(o===0x50)return this.btable;throw Error('USB register kapsam dışı.');}
 write(a,v,n){if(a>=PMA&&a<PMA+1024){if(a%4||![2,4].includes(n))throw Error('USB PMA hizalı16/32bit erişim gerektirir.');if(this.clocked()){this.shared();this.pma[(a-PMA)/4]=v&65535;}return true;}if(a<BASE||a>BASE+0x50)return false;if(this.r.board.cpu==='cortex-m4f')throw Error('F401/F411 USB OTG FS farklı register mimarisi kullanır; F103 USB PMA geçerli değil.');if(a%4||![2,4].includes(n))throw Error('USB register hizalı16/32bit olmalı.');if(!this.clocked())return true;this.shared();const o=a-BASE;v&=65535;if(o<32){const old=this.ep[o/4];if((old^v)&0x700){this.doubleStarted.delete(o/4+':true');this.doubleStarted.delete(o/4+':false');}this.ep[o/4]=(old&v&0x8080)|((old^v)&0x7070)|(v&0x070f)|((v&0x8000)?old&0x800:0);return true;}if(o===0x40){this.cntr=v;if(v&1){this.ep.fill(0);this.events=0;this.daddr=0;}return true;}if(o===0x44){this.events&=v;return true;}if(o===0x48)return true;if(o===0x4c){this.daddr=v&255;return true;}if(o===0x50){this.btable=v&0x1f8;return true;}throw Error('USB register yazımı kapsam dışı.');}
}
