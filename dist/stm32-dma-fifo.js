import {STMDMA as DirectDMA} from './stm32-dma.js';

// F4 FIFO packs/unpacks widths using actual ARM bus reads and writes. The
// bridge supplies each read result; no synthetic SRAM mirror is maintained.
export class STMDMA extends DirectDMA {
 read(a,n){const found=this.channel(a&~3);if(this.f4&&found?.field===5){const bytes=found.c.state?.fifo?.length||0,level=bytes===0?4:bytes<4?0:bytes<8?1:bytes<12?2:bytes<16?3:5;return (found.c.regs[5]&~56)|(level<<3);}return super.read(a,n);}
 write(a,v,n){const found=this.channel(a&~3);if(this.f4&&found?.field===5)v&=0x87;return super.write(a,v,n);}
 next(){
  if(this.f4)for(const c of this.active){const s=c.state;if(!s||!this.clocked(c)||!(c.regs[5]&4))continue;const output=s.dir===1?s.psize:s.msize;if((s.fifo?.length||0)>=output){let value=0;for(let i=0;i<output;i++)value|=s.fifo[i]<<(i*8);this.current={c,fifoWrite:true,writeSize:output,dest:s.dir===1?s.pa:s.ma,value};if(!this.valid(this.current.dest,output,true)){this.complete(1);continue;}return output<<8|0x20000;}}
  const request=super.next();if(!request||!this.f4)return request;
  const current=this.current,c=current.c,s=c.state;if(!(c.regs[5]&4))return request;
  s.fifo??=[];const output=s.dir===1?s.psize:s.msize;
  if(s.dir!==1&&s.remaining*s.psize<output){this.flags[c.bank][c.index>>>2]|=1<<[0,6,16,22][c.index%4];this.complete(1);return 0;}
  const input=s.dir===1?s.msize:s.psize;current.fifoRead=true;current.readSize=input;current.source=s.dir===1?s.ma:s.pa;
  if(!this.valid(current.source,input,false)){this.complete(1);return 0;}return input|0x10000;
 }
 readComplete(value){const current=this.current;if(!current?.fifoRead)return;const s=current.c.state;for(let i=0;i<current.readSize;i++)s.fifo.push((value>>>(i*8))&255);if(s.dir===1){if(s.minc)s.ma+=s.msize;}else if(s.pinc)s.pa+=s.psize;this.current=null;}
 complete(error){const current=this.current;if(!current?.fifoWrite)return super.complete(error);const {c}=current,s=c.state;if(error)return super.complete(error);s.fifo.splice(0,current.writeSize);if(s.dir===1){if(s.pinc)s.pa+=s.psize;}else if(s.minc)s.ma+=s.msize;
  const before=s.remaining;s.remaining-=s.dir===1?1:s.msize/s.psize;c.regs[1]=s.remaining;this.current=null;
  if(before>Math.floor(s.total/2)&&s.remaining<=Math.floor(s.total/2)&&s.total>1)this.status(c,'ht');
  if(!s.remaining){this.status(c,'tc');if(s.circular){s.remaining=s.total;c.regs[1]=s.total;s.pa=s.initialPA;if(s.double){c.regs[0]^=1<<19;s.initialMA=c.regs[c.regs[0]&(1<<19)?4:3];}s.ma=s.initialMA;s.fifo=[];}else{c.regs[0]&=~1;c.state=null;this.active.delete(c);}}
 }
}
