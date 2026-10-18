import {STMOTG as Device} from './stm32-otg.js';
const BASE=0x50000000,ENABLE=0x80000000;

// OTG_FS has eight host channels and no internal DMA engine. The peer is
// another USB register model (or a protocol device), never a fabricated ACK.
export class STMOTG extends Device {
 reset(){super.reset();this.hostRegs=new Map([[0x400,0],[0x404,48000],[0x408,0],[0x418,0]]);this.channels=Array.from({length:8},()=>({character:0,size:0,interrupt:0,mask:0,split:0,fifo:[],due:Infinity}));this.port=0;this.frameAt=this.r.count;}
 hostMode(){return !!(this.regs.get(12)&(1<<29));}
 attachDevice(device){this.peer=device||null;this.port=(this.port&~5)|(device?3:2)|(1<<17);this.events|=1<<24;}
 active(){return !this.hostMode()&&super.active();}
 hostPending(){return this.channels.reduce((mask,c,i)=>mask|((c.interrupt&c.mask)?1<<i:0),0);}
 status(){if(!this.hostMode())return super.status();return (1|this.events|(this.rx.length?16:0)|(this.hostPending()&(this.hostRegs.get(0x418)||0)?1<<25:0))>>>0;}
 tick(){if(!this.hostMode()||!this.clocked())return;const hz=this.r.board.hz,elapsed=Math.floor((this.r.count-this.frameAt)/(hz/1000));if(elapsed>0){this.hostRegs.set(0x408,((this.hostRegs.get(0x408)||0)+elapsed)&65535);this.frameAt+=elapsed*hz/1000;this.events|=8;}for(let i=0;i<8;i++){const c=this.channels[i];if(c.due>this.r.count)continue;c.due=Infinity;if(!(c.character&ENABLE))continue;this.transfer(i,c);}}
 transfer(i,c){
  const incoming=!!(c.character&32768),ep=c.character>>>11&15,address=c.character>>>22&127,mps=c.character&2047,remaining=c.size&0x7ffff,packetCount=c.size>>>19&1023,setup=(c.size>>>29&3)===3;
  const halt=flags=>{c.interrupt|=flags|2;c.character&=~ENABLE;c.due=Infinity;};
  if(!this.peer||!(this.port&4)||!mps){halt(128);return;}
  let reply;if(incoming)reply=this.peer.hostIn(address,ep);else{const n=Math.min(mps,remaining);if(c.fifo.length<Math.ceil(n/4)){c.due=this.r.count+this.r.board.hz/1000000;return;}const data=Uint8Array.from({length:n},(_,j)=>c.fifo[j>>>2]>>>((j&3)*8)&255);reply={status:this.peer.hostOut(address,ep,data,setup)};if(reply.status==='ACK')c.fifo.splice(0,Math.ceil(n/4));}
  if(reply.status==='NAK'){halt(16);return;}if(reply.status==='STALL'){halt(8);return;}if(reply.status!=='ACK'){halt(128);return;}
  const n=incoming?(reply.data?.length||0):Math.min(mps,remaining);if(n>mps||n>remaining){halt(256);return;}
  if(incoming){const bytes=reply.data||[];for(let j=0;j<n;j+=4)this.payload.push(((bytes[j]||0)|((bytes[j+1]||0)<<8)|((bytes[j+2]||0)<<16)|((bytes[j+3]||0)<<24))>>>0);this.rx.push(i|(n<<4)|(2<<17));}
  const left=Math.max(0,remaining-n),packets=Math.max(0,packetCount-1);c.size=(c.size&0xe0000000)|(packets<<19)|left;c.interrupt|=32;
  if(!left||!packets||incoming&&n<mps){this.rx.push(i|(3<<17));halt(1);}else c.due=this.r.count+this.r.board.hz/12000000*(n*8+50);
 }
 channel(a){const off=(a&~3)-BASE;if(off<0x500||off>=0x600)return null;return{unit:this.channels[(off-0x500)>>>5],off:off&31};}
 read(a,n=4){this.tick();const off=(a&~3)-BASE,c=this.channel(a);if(this.hostMode()&&c){return (c.off===0?c.unit.character:c.off===4?c.unit.split:c.off===8?c.unit.interrupt:c.off===12?c.unit.mask:c.off===16?c.unit.size:0)>>>0;}if(this.hostMode()){if(off===0x440)return this.port>>>0;if(off===0x414)return this.hostPending();if(off===0x410)return 0x80000|(Math.max(0,320-this.payload.length)&65535);if(this.hostRegs.has(off))return this.hostRegs.get(off)>>>0;}return super.read(a,n);}
 write(a,v,n=4){const off=(a&~3)-BASE;if(off===8)v&=~32; // DMAEN is not implemented in the F401/F411 silicon.
  if(off===12){this.regs.set(12,v>>>0);return true;}if(this.hostMode()){
   if(a%4||n!==4)throw Error('OTG host register hizalı32bit olmalı.');const c=this.channel(a);if(c){const u=c.unit;if(c.off===0){u.character=v>>>0;if(v&0x40000000){u.character&=~ENABLE;u.interrupt|=2;u.due=Infinity;}else if(v&ENABLE){this.clock48();u.due=this.r.count+Math.max(1,this.r.board.hz/12000000*50);}}else if(c.off===4)u.split=v;else if(c.off===8)u.interrupt&=~v;else if(c.off===12)u.mask=v&2047;else if(c.off===16)u.size=v>>>0;return true;}
   if(off===0x440){const old=this.port;this.port=(old&~(v&10))&~(256|4096);this.port|=v&(256|4096);if(old&256&&!(v&256)){const ack=this.peer?.hostReset();this.port=ack==='ACK'?this.port|12:this.port&~4;this.events|=1<<24;}return true;}
   if(this.hostRegs.has(off)){this.hostRegs.set(off,v>>>0);return true;}if(off>=0x1000&&off<0x9000&&!(off%0x1000)){let index=off/0x1000-1;if(index===0)index=this.channels.findIndex(c=>c.character&ENABLE&&!(c.character&32768));if(index<0)index=0;const fifo=this.channels[index]?.fifo;if(!fifo||fifo.length>=320)throw Error('OTG host TX FIFO kapasitesi aşıldı.');fifo.push(v>>>0);return true;}
  }return super.write(a,v,n);
 }
}
