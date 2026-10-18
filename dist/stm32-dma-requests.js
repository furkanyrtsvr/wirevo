import {STMDMA as FIFO} from './stm32-dma-fifo.js';

const SPI_MAP={2:[['0:3:0'],['0:4:0']],3:[['0:0:0','0:2:0'],['0:5:0','0:7:0']],4:[['1:0:4','1:3:5','1:4:4'],['1:1:4','1:4:5']],5:[['1:3:2','1:5:7'],['1:4:2','1:5:5','1:6:7']]};
const I2C_MAP={2:[['0:2:7','0:3:7'],['0:7:7']],3:[['0:1:1','0:2:3'],['0:4:3','0:5:6']]};
const TIMER_F4={1:[['1:5:6'],['1:1:6','1:3:6','1:6:0'],['1:2:6','1:6:0'],['1:6:6','1:6:0'],['1:4:6'],['1:4:6'],['1:4:6']],2:[['0:1:3','0:7:3'],['0:5:3'],['0:6:3'],['0:1:3'],['0:6:3','0:7:3']],3:[['0:2:5'],['0:4:5'],['0:5:5'],['0:7:5'],['0:2:5']],4:[['0:6:2'],['0:0:2'],['0:3:2'],['0:7:2'],[]],5:[['0:0:6','0:6:6'],['0:2:6'],['0:4:6'],['0:0:6'],['0:1:6','0:3:6']]};
const TIMER_F1={1:[[4],[1],[2],[5],[3],[3],[3]],2:[[1],[4],[6],[0],[6]],3:[[2],[5],[],[1],[2]],4:[[6],[0],[3],[4],[]]};
export class STMDMA extends FIFO {
 key(c){return this.f4?c.bank+':'+c.index+':'+((c.regs[0]>>>25)&7):c.index;}
 matches(c){const s=c.state,key=this.key(c);if(s.mem2mem)return true;
  for(const spi of [...this.r.buses?.spi||[],...this.r.buses?.extensions||[]])if(s.pa===spi.base+12){const maps=this.f4?spi.parent?(spi.number===2?[['0:3:3'],['0:4:2']]:[['0:0:3','0:2:2'],['0:5:2']]):SPI_MAP[spi.number]:[[3],[4]];return spi.enabled()&&!!(spi.regs.get(4)&(s.dir===0?1:2))&&!!(spi.sr&(s.dir===0?1:2))&&maps[s.dir]?.includes(key);}
  for(const i2c of this.r.buses?.i2c||[])if(s.pa===i2c.base+16){const maps=this.f4?I2C_MAP[i2c.number]:[[4],[3]];return i2c.enabled()&&!!(i2c.regs.get(4)&2048)&&!(i2c.sr1&2)&&(s.dir===0?i2c.direction&&!!(i2c.sr1&64):!i2c.direction&&!!(i2c.sr1&128))&&maps[s.dir]?.includes(key);}
  for(const u of this.r.usarts.units.filter(u=>u.number>2))if(s.pa===u.base+4){const maps=u.number===3?[[2],[1]]:[['1:1:5','1:2:5'],['1:6:5','1:7:5']];return this.r.usarts.enabled(u)&&!!(this.r.usarts.cr(u,20)&(s.dir===0?64:128))&&!!(u.sr&(s.dir===0?32:128))&&maps[s.dir]?.includes(key);}
  if(this.f4&&s.pa===0x40012c80){const sd=this.r.sdio;return !!(sd.clocked()&&sd.data&&(sd.regs.get(0x40012c2c)&8)&&['1:3:4','1:6:4'].includes(key)&&sd.data.write===(s.dir===1));}
  for(const timer of [this.r.timer,...this.r.timers?.units||[]]){const n=timer.number??2,base=timer.base??0x40000000,maps=(this.f4?TIMER_F4:TIMER_F1)[n];if(!maps||s.pa<base||s.pa>base+76)continue;for(let event=0;event<7;event++)if(timer.dmaPending?.[event]&&maps[event]?.includes(key)){c.timerRequest={timer,event};return true;}}
  return super.matches(c);
 }
 i2cLast(unit=this.r.i2c){if(unit===this.r.i2c)return super.i2cLast();const maps=this.f4?I2C_MAP[unit.number]:[[4],[3]];return [...this.active].some(c=>c.state?.dir===0&&c.state.pa===unit.base+16&&c.state.total>=2&&c.state.remaining===1&&maps[0].includes(this.key(c)));}
 valid(a,size,write){if(size>4||a%size)return false;if(super.valid(a,size,write))return true;if(this.f4&&this.r.sdio.present&&a===0x40012c80)return size===4;for(const spi of [...this.r.buses?.spi||[],...this.r.buses?.extensions||[]])if(a===spi.base+12)return true;for(const u of this.r.usarts.units)if(a===u.base+4)return true;for(const i of this.r.buses?.i2c||[])if(a===i.base+16)return true;return [this.r.timer,...this.r.timers?.units||[]].some(t=>a>=(t.base??0x40000000)&&a<=(t.base??0x40000000)+76);}
 next(){for(const c of this.active){const s=c.state;if(this.f4&&s&&!s.total&&(c.regs[0]&32)&&s.pa===0x40012c80&&this.r.sdio.data){s.total=s.remaining=this.r.sdio.data.bytes.length/s.psize;c.regs[1]=s.total;}}return super.next();}
 clearRequest(c){const request=c?.timerRequest;if(!request)return;if(c.state?.pa===(request.timer.base??0x40000000)+76){c.timerBurst??=((request.timer.regs.get(72)>>>8)&31)+1;if(--c.timerBurst>0)return;}request.timer.dmaPending[request.event]=false;c.timerRequest=null;c.timerBurst=0;}
 readComplete(v){const c=this.current?.c,receive=c?.state?.dir===0;super.readComplete(v);if(receive)this.clearRequest(c);}
 complete(error){const c=this.current?.c;this.clearRequest(c);return super.complete(error);}
}
