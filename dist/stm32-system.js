// STM32F103 / STM32F401 / STM32F411 clock, reset and low-power domains.
// Time is expressed in nominal-board ticks so peripheral deadlines and physical
// circuit events retain a common, continuous timeline across clock changes.
export class STMSystem {
 constructor(r){this.r=r;this.f4=r.board.cpu==='cortex-m4f';this.base=this.f4?0x40023800:0x40021000;this.hsi=this.f4?16000000:8000000;this.seconds=0;this.lastCPU=0;this.pendingReset=0;this.nrst=true;this.hsePresent=true;this.supply=3.3;this.boot0=false;this.boot1=false;this.mode='run';this.bootMode='flash';this.csr=0;this.reset();}
 reset(){this.oscillators=new Map([[1,{at:0,ready:true}]]);this.mode='run';this.goAddress=undefined;this.source=0;this.hclk=this.hsi;this.pclk1=this.hsi;this.pclk2=this.hsi;this.cir=0;this.pwrCSR=this.csr&3;this.bootMode=this.boot0?(this.boot1?'sram':'system'):'flash';this.bootState={stage:'sync',command:0,data:[],address:0};}
 factor(){return this.r.board.hz/this.hclk;}
 i2sHz(){if(!this.f4||!(this.r.regs.get(this.base)&(1<<26)))return 0;const main=this.r.regs.get(this.base+4)||0,pll=this.r.regs.get(this.base+0x84)??0x20003000,m=main&63,n=(pll>>>6)&511,div=(pll>>>28)&7;return m&&div?(main&(1<<22)?this.r.board.hse:this.hsi)/m*n/div:0;}
 irqExtra(){return ((this.r.exti?.regs.get(0)||0)&(this.r.exti?.regs.get(20)||0)&65536?1<<10:0)|(this.cir&(this.cir>>>8)&127?1<<11:0);}
 busDivider(bus=1){const cf=this.r.regs.get(this.base+(this.f4?8:4))||0,n=(cf>>>(this.f4?(bus===1?10:13):(bus===1?8:11)))&7;return n<4?1:1<<(n-3);}
 clocks(){
  const cf=this.r.regs.get(this.base+(this.f4?8:4))||0,cr=this.r.regs.get(this.base)||0;
  const ready=which=>which<3&&this.oscReady([1,65536,1<<24][which]);
  let selected=cf&3;if(!ready(selected)||selected===3)selected=this.source;if(!ready(selected))selected=0;
  let sys=this.hsi;
  if(selected===1)sys=this.r.board.hse;
  if(selected===2){if(this.f4){const p=this.r.regs.get(this.base+4)||0,m=p&63,n=(p>>>6)&511,div=2*(((p>>>16)&3)+1);sys=(p&(1<<22)?this.r.board.hse:this.hsi)/m*n/div;}else sys=(cf&(1<<16)?this.r.board.hse/(cf&(1<<17)?2:1):this.hsi/2)*Math.min(16,((cf>>>18)&15)+2);}
  if(!Number.isFinite(sys)||sys<=0){selected=0;sys=this.hsi;}
  const hp=(cf>>>4)&15,ahb=hp<8?1:2**[1,2,3,4,6,7,8,9][hp-8];this.source=selected;this.hclk=sys/ahb;this.pclk1=this.hclk/this.busDivider(1);this.pclk2=this.hclk/this.busDivider(2);
 }
 oscReady(bit){const cr=this.r.regs.get(this.base)||0,osc=this.oscillators.get(bit);return !!(cr&bit)&&!!osc?.ready&&(bit!==65536||this.hsePresent)&&(bit!==(1<<24)||!(this.f4?(this.r.regs.get(this.base+4)&(1<<22)):(this.r.regs.get(this.base+4)&(1<<16)))||this.hsePresent);}
 settleClocks(){let changed=false;for(const[bit,osc]of this.oscillators)if(!osc.ready&&this.r.count>=osc.at&&(bit!==65536||this.hsePresent)&&(![1<<24,1<<26].includes(bit)||this.oscReady(this.f4?(this.r.regs.get(this.base+4)&(1<<22)?65536:1):(this.r.regs.get(this.base+4)&(1<<16)?65536:1)))){osc.ready=true;this.cir|=bit===1?4:bit===65536?8:bit===(1<<24)?16:32;changed=true;}if(changed)this.write(this.base+(this.f4?8:4),this.r.regs.get(this.base+(this.f4?8:4))||0);if(this.backupReadyAt!==undefined&&this.r.count>=this.backupReadyAt){this.pwrCSR|=8;this.backupReadyAt=undefined;}}
 clock(cpu){
  const delta=cpu>=this.lastCPU?cpu-this.lastCPU:cpu;this.lastCPU=cpu;
  this.r.count+=delta*this.factor();this.seconds=this.r.count/this.r.board.hz;
  this.settleClocks();this.observePins();
 }
 observePins(){
  const c=this.r.circuit;if(c?.solution){const nets=c.solution.netlist,v=c.solution.voltages,id=c.board.id;
   const nr=v.get(nets.net(id+':NRST'));if(Number.isFinite(nr))this.setNRST(nr>=2.31);
   const p=this.r.board.pins.find(p=>p.net==='BOOT0'&&p.connectable!==false);if(p&&c.project.wires.some(w=>w.from===id+':'+p.id||w.to===id+':'+p.id)){const b=v.get(nets.net(id+':'+p.id));if(Number.isFinite(b))this.boot0=b>=2.31;}
   if(c.project.wires.some(w=>w.from===id+':PB2'||w.to===id+':PB2')&&this.r.inputs.PB2!==undefined)this.boot1=!!this.r.inputs.PB2;
   const supply=v.get(nets.net(id+':'+this.r.board.supplyPin));if(Number.isFinite(supply))this.setSupply(supply);
  }
 }
 setNRST(high){high=!!high;if(high&&!this.nrst)this.requestReset(3);this.nrst=high;}
 setBoot(boot0,boot1=false){this.boot0=!!boot0;this.boot1=!!boot1;}
 requestReset(reason){this.pendingReset=reason;}
 setSupply(volts){const before=this.supply;this.supply=volts;const pwr=this.r.rtc?.pwr||0,threshold=[2.2,2.3,2.4,2.5,2.6,2.7,2.8,2.9][(pwr>>>5)&7],low=!!(pwr&16)&&volts<threshold,was=!!(this.pwrCSR&4);this.pwrCSR=low?this.pwrCSR|4:this.pwrCSR&~4;if(was!==low)this.r.exti?.internalEdge(16,low);if(volts<1.8&&before>=1.8)this.brownout=true;if(this.brownout&&volts>=1.8){this.brownout=false;this.requestReset(4);}}
 setHSE(present){const old=this.hsePresent;this.hsePresent=!!present;if(old&&!present&&(this.r.regs.get(this.base)&(1<<19))){this.cir|=128;this.oscillators.set(1,{at:this.r.count+this.r.board.hz*.000002,ready:false});this.r.regs.set(this.base,(this.r.regs.get(this.base)|1)&~((1<<16)|(1<<24)));const a=this.base+(this.f4?8:4);this.r.regs.set(a,(this.r.regs.get(a)||0)&~3);this.clocks();this.nmi=true;}}
 pause(){this.pauseAt=this.r.count;for(const timer of [this.r.timer,...this.r.timers?.units||[]])if(timer){const cnt=timer.phase(),phase=timer.prescalerPhase();timer.hold(cnt,phase);}this.mode=(this.r.rtc.pwr&2)?'standby':'stop';const user=this.r.flash.user(),resetMask=this.mode==='standby'?4:2;if(!(user&resetMask)){this.requestReset(8);return;}if(this.mode==='standby'){this.csr|=2;this.pwrCSR|=2;this.r.circuit?.refresh(true);}}
 wake(){const standby=this.mode==='standby',elapsed=this.r.count-(this.pauseAt??this.r.count);this.mode='run';this.pwrCSR|=1;this.csr=this.pwrCSR&3;
  if(standby){this.requestReset(6);return;}
  // Synchronous peripherals stop rather than catching up a whole STOP interval.
  if(Number.isFinite(this.r.watchdogs?.w.next))this.r.watchdogs.w.next+=elapsed;
  for(const unit of [this.r.timer,...this.r.timers?.units||[],this.r.spi,this.r.i2c,...this.r.buses?.spi||[],...this.r.buses?.i2c||[]]){if(Number.isFinite(unit?.next))unit.next+=elapsed;if(unit&&Number.isFinite(unit.origin))unit.origin+=elapsed;if(unit?.i2s)unit.i2s.next+=elapsed;}
  for(const a of [this.r.adc,this.r.adc2])if(a?.pending)a.pending.at+=elapsed;
  for(const e of this.r.usarts?.events||[])e.at+=elapsed;
  this.oscillators.set(1,{at:this.r.count,ready:true});const cr=(this.r.regs.get(this.base)||0)|1;this.r.regs.set(this.base,cr&~((1<<16)|(1<<24)));const a=this.base+(this.f4?8:4);this.r.regs.set(a,(this.r.regs.get(a)||0)&~15);this.clocks();
 }
 powerState(sleeping,scr){
  if(this.nmi){this.nmi=false;return 4;}if(!this.nrst||this.brownout||this.bootMode==='system')return 1;
  if(sleeping&&(scr&4)&&this.mode==='run')this.pause();
  if(this.mode==='run')return 0;
  const exti=this.r.exti,pr=exti?.regs.get(20)||0,wake=pr&((exti?.regs.get(0)||0)|(exti?.regs.get(4)||0))&(this.mode==='standby'?((1<<17)|(1<<21)|(1<<22)):0xffffffff);
  const pin=!!this.r.inputs.PA0;if(pin&&!this.wakePin&&(this.pwrCSR&256))this.wakeRequested=true;this.wakePin=pin;
  if(wake||this.wakeRequested){this.wakeRequested=false;this.wake();return 2;}return 1;
 }
 takeReset(){const reason=this.pendingReset;if(!reason)return 0;this.pendingReset=0;if(reason!==6&&reason!==7)this.r.resetFlags|=1<<(reason===3?26:reason===4?(this.f4?25:27):reason===8?31:28);const go=this.goAddress;this.r.exports.flash_program_width(this.r.cpu,0);this.r.resetPeripherals();if(reason===7&&go!==undefined){this.bootMode='flash';this.goAddress=go;}this.r.flash.applyProtection();this.r.circuit?.refresh(true);return reason;}
 read(a,n=4){const x=a&~3;let v;
  if(x===this.base){const cr=this.r.regs.get(x)||0;v=(cr&~((1<<27)|(1<<25)|(1<<17)|2))|(this.oscReady(1)?2:0)|(this.oscReady(65536)?1<<17:0)|(this.oscReady(1<<24)?1<<25:0)|(this.f4&&this.oscReady(1<<26)?1<<27:0);}
  else if(x===this.base+(this.f4?8:4)){v=((this.r.regs.get(x)||0)&~12)|(this.source<<2);}
  else if(x===this.base+(this.f4?12:8))v=this.cir;
  else if(this.f4&&x===this.base+0x84)v=this.r.regs.get(x)??0x20003000;
  else if(x===0x40007000)v=this.r.rtc.powerClock()?this.r.rtc.pwr:0;
  else if(x===0x40007004)v=this.r.rtc.powerClock()?this.pwrCSR|(this.f4?16384:0):0;
  else return undefined;return n===4?v>>>0:(v>>>((a&3)*8))&(n===1?255:65535);
 }
 write(a,v,n=4){const x=a&~3,cf=this.base+(this.f4?8:4),cir=this.base+(this.f4?12:8),owned=[this.base,cf,cir,0x40007000,0x40007004,...(this.f4?[this.base+4,this.base+0x84]:[])].includes(x);if(!owned)return false;
  if(n!==4||a!==x)throw Error('RCC/PWR erişimi hizalı32bit olmalı.');v>>>=0;
  if(this.f4&&x===this.base+0x84){if(!(this.r.regs.get(this.base)&(1<<26)))this.r.regs.set(x,v&0x70007fc0);return true;}if(x===0x40007000){if(!this.r.rtc.powerClock())return true;const keep=this.r.rtc.pwr;if(v&4){this.pwrCSR&=~1;this.csr&=~1;}if(v&8){this.pwrCSR&=~2;this.csr&=~2;}this.r.rtc.pwr=v&(this.f4?0x000fc3f3:0x1f3);if(this.f4&&!(v&0xc000))this.r.rtc.pwr|=keep&0xc000;this.setSupply(this.supply);return true;}
  if(x===0x40007004){if(this.f4){if(v&512)this.backupReadyAt=this.r.count+this.r.board.hz*.000032;else{this.backupReadyAt=undefined;this.pwrCSR&=~8;}}if(this.r.rtc.powerClock())this.pwrCSR=(this.pwrCSR&~(256|512))|(v&(256|512))|(0);return true;}
  if(x===cir){this.cir=((this.cir&~((v>>>16)&255))&255)|(v&0x7f00);return true;}
  const old=this.r.regs.get(x)||0;if(this.f4&&x===this.base+4&&this.r.regs.get(this.base)&(1<<24))return true;
  const snapshots=[this.r.timer,...this.r.timers?.units||[]].filter(Boolean).map(timer=>({timer,cnt:timer.phase(),phase:timer.prescalerPhase(),unit:timer.unit()})),oldP1=this.pclk1,oldP2=this.pclk2;
  if(x===this.base){const active=this.source===0?1:this.source===1?65536:1<<24;v|=old&active;const newly=v&~old;for(const [bit,delay]of [[1,.000002],[65536,.0005],[1<<24,.0001],[1<<26,.0001]]){if(newly&bit)this.oscillators.set(bit,{at:this.r.count+this.r.board.hz*delay,ready:false});else if(!(v&bit))this.oscillators.delete(bit);}}
  this.r.regs.set(x,v);this.clocks();
  for(const {timer,cnt,phase,unit}of snapshots){timer.hold(cnt,phase*timer.unit()/unit);timer.schedule();}
  if(Number.isFinite(this.r.watchdogs?.w.next))this.r.watchdogs.w.next=this.r.count+(this.r.watchdogs.w.next-this.r.count)*oldP1/this.pclk1;
  for(const unit of [this.r.spi,...this.r.buses?.spi||[],this.r.i2c,...this.r.buses?.i2c||[]]){const apb2=unit===this.r.spi||[4,5].includes(unit.number),ratio=apb2?oldP2/this.pclk2:oldP1/this.pclk1;if(Number.isFinite(unit?.next))unit.next=this.r.count+(unit.next-this.r.count)*ratio;if(unit?.shift)unit.shift.half*=ratio;}
  for(const adc of [this.r.adc,this.r.adc2])if(adc?.pending)adc.pending.at=this.r.count+(adc.pending.at-this.r.count)*oldP2/this.pclk2;
  for(const event of this.r.usarts?.events||[])event.at=this.r.count+(event.at-this.r.count)*([2,3].includes(event.unit)?oldP1/this.pclk1:oldP2/this.pclk2);
  return true;
 }
 // AN3155 USART boot protocol. This implements commands, not ST ROM bytes.
 bootByte(byte){
  const b=this.bootState,ack=()=>{this.r.serial+='\x79';},nak=()=>{this.r.serial+='\x1f';},out=bytes=>{this.r.serial+=String.fromCharCode(...bytes);};
  if(b.stage==='sync'){if(byte===0x7f){ack();b.stage='command';}return;}
  if(b.stage==='command'){b.command=byte;b.stage='complement';return;}
  if(b.stage==='complement'){if((b.command^byte)!==255){nak();b.stage='command';return;}const commands=[0,1,2,0x11,0x21,0x31,0x44];if(!commands.includes(b.command)||this.r.flash.rdp()&&![0,1,2].includes(b.command)){nak();b.stage='command';return;}ack();if(b.command===0){out([commands.length,0x31,...commands]);ack();b.stage='command';}else if(b.command===1){out([0x31,0,0]);ack();b.stage='command';}else if(b.command===2){out([1,4,this.f4?(this.r.board.family==='f411'?0x31:0x33):this.r.board.flashSize===32768?0x12:0x10]);ack();b.stage='command';}else{b.data=[];b.stage=b.command===0x44?'erase':'address';}return;}
  b.data.push(byte);
  if(b.stage==='address'&&b.data.length===5){const d=b.data;if((d[0]^d[1]^d[2]^d[3])!==d[4]){nak();b.stage='command';return;}b.address=(d[0]*0x1000000+(d[1]<<16)+(d[2]<<8)+d[3])>>>0;b.data=[];ack();b.stage=b.command===0x11?'read':b.command===0x31?'write':'go';if(b.stage==='go'){this.bootMode='flash';this.goAddress=b.address;this.requestReset(7);b.stage='command';}}
  else if(b.stage==='read'&&b.data.length===2){const [length,check]=b.data;if((length^check)!==255)nak();else{ack();out(this.r.readMemory(b.address,length+1));}b.stage='command';}
  else if(b.stage==='write'&&b.data.length===b.data[0]+3){const d=b.data,check=d.reduce((a,v)=>a^v,0);if(check)nak();else{const e=this.r.exports;e.flash_program_width(this.r.cpu,this.f4?1:2);let ok=true;for(let i=0;i<=d[0];i+=this.f4?1:2)ok=!!e.memory_write(this.r.cpu,b.address+i,this.f4?d[i+1]:d[i+1]|(d[i+2]??255)<<8,this.f4?1:2)&&ok;e.flash_program_width(this.r.cpu,0);this.r.flash.rawStatus()&11?nak():ok?ack():nak();}b.stage='command';}
  else if(b.stage==='erase'&&b.data.length>=3){const d=b.data,count=(d[0]<<8)|d[1],needed=count===65535?3:2+(count+1)*2+1;if(d.length!==needed)return;if(d.reduce((a,v)=>a^v,0))nak();else{let ok=true;if(count===65535)ok=this.r.flash.r.exports.flash_erase(this.r.cpu,0,this.r.board.flashSize);else for(let i=0;i<=count;i++){const page=(d[2+i*2]<<8)|d[3+i*2],[a,n]=this.f4?this.r.flash.sector(page):[page*1024,1024];ok=!!this.r.exports.flash_erase(this.r.cpu,a,n)&&ok;}ok?ack():nak();}b.stage='command';}
 }
}
