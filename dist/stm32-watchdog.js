// Nominal LSI clock and APB1 window watchdog. Hardware reset is serviced in ARM.
export class STMWatchdogs {
 constructor(r){this.r=r;this.f4=r.board.cpu==='cortex-m4f';this.csr=this.f4?0x40023874:0x40021024;this.lsi=this.f4?32000:40000;this.i={enabled:false,unlocked:false,pr:0,rlr:4095,activePR:0,activeRLR:4095,counter:4095,next:Infinity,updates:[]};this.w={cr:127,cfr:127,sr:0,next:Infinity,clocked:false,remaining:0};this.pendingReset=0;}
 lsiOn(){return this.i.enabled||!!(this.r.regs.get(this.csr)&1);}
 iunit(){return this.r.board.hz/this.lsi*(4<<Math.min(this.i.activePR,6));}
 wclock(){return !!(this.r.regs.get(this.f4?0x40023840:0x4002101c)&2048);}
 wunit(){return 4096*(1<<((this.w.cfr>>>7)&3))*this.r.usarts.divider({number:2});}
 tick(){const n=this.r.count,i=this.i,w=this.w;if(this.lsiOn())for(const update of [...i.updates])if(update.at<=n){if(update.field==='pr')i.activePR=i.pr;else i.activeRLR=i.rlr;i.updates.splice(i.updates.indexOf(update),1);}
  while(i.enabled&&n>=i.next&&!this.pendingReset){if(i.counter--===0){this.pendingReset=1;break;}i.next+=this.iunit();}
  if(this.r.system?.mode&&this.r.system.mode!=='run')return;
  const clock=this.wclock();if(!clock){if(w.clocked)w.remaining=Math.max(0,w.next-n);w.clocked=false;w.next=Infinity;return;}if(!w.clocked){w.clocked=true;w.next=n+(w.remaining||this.wunit());w.remaining=0;}
  while(n>=w.next&&!this.pendingReset){const old=w.cr&127,counter=(old-1)&127;w.cr=(w.cr&128)|counter;if(counter===64)w.sr|=1;if((w.cr&128)&&old===64){this.pendingReset=2;break;}w.next+=this.wunit();}
 }
 irq(){return this.wclock()&&!!((this.w.cfr&512)&&(this.w.sr&1));}
 read(a,n){const aligned=a&~3;let v;if(aligned===this.csr)v=(this.r.resetFlags||0)|(this.lsiOn()?3:0);else if(aligned>=0x40003000&&aligned<=0x4000300c){const off=aligned-0x40003000;v=off===0?0:off===4?this.i.pr:off===8?this.i.rlr:this.i.updates.reduce((mask,u)=>mask|(u.field==='pr'?1:2),0);}else if(aligned>=0x40002c00&&aligned<=0x40002c08)v=[this.w.cr,this.w.cfr,this.w.sr][(aligned-0x40002c00)/4];else return undefined;return n===4?v>>>0:(v>>>((a&3)*8))&(n===1?255:65535);}
 write(a,v,n){const aligned=a&~3;if(aligned!==this.csr&&!(aligned>=0x40003000&&aligned<=0x4000300c)&&!(aligned>=0x40002c00&&aligned<=0x40002c08))return false;if(a!==aligned||![2,4].includes(n))throw Error('Watchdog register yazımı hizalı16/32bit olmalı.');this.tick();if(aligned===this.csr){if(v&(1<<24))this.r.resetFlags=0;this.r.regs.set(this.csr,v&1);return true;}
  if(aligned>=0x40003000){const off=aligned-0x40003000,i=this.i;if(off===0){i.unlocked=(v&65535)===0x5555;if((v&65535)===0xcccc&&!i.enabled){i.enabled=true;i.counter=4095;i.next=this.r.count+this.iunit();}if((v&65535)===0xaaaa){i.counter=i.activeRLR;i.next=this.r.count+this.iunit();}}else if(i.unlocked&&(off===4||off===8)){const field=off===4?'pr':'rlr';if(!i.updates.some(u=>u.field===field)){i[field]=v&(off===4?7:4095);i.updates.push({field,at:this.r.count+5*this.r.board.hz/this.lsi});}}return true;}
  if(!this.wclock())return true;const off=aligned-0x40002c00,w=this.w;if(off===0){const active=!!(w.cr&128);if((active&&((w.cr&127)>(w.cfr&127)))||((active||v&128)&&!(v&64)))this.pendingReset=2;w.cr=(v&127)|(active?128:v&128);}else if(off===4){w.cfr=(v&1023)|(w.cfr&512);}else w.sr&=v&1;return true;
 }
}
