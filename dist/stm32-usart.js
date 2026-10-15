import {UARTReceiver} from './uart-lines.js';

// STM32F1 RM0008 / F401 RM0368 / F411 RM0383: SR, DR, BRR, CR1..3.
// USART1/2 physical nets; an unmapped terminal unit keeps its byte adapter.
export class STMUSARTs {
 constructor(runtime){
  this.r=runtime;this.events=[];this.epoch=0;this.changed=false;
  const f4=runtime.board.cpu==='cortex-m4f';
  this.units=[1,2].map(number=>({number,base:number===1?(f4?0x40011000:0x40013800):0x40004400,sr:0xc0,dr:0,tdr:null,shift:null,high:true,readSR:false,epoch:0}));
  const self=this,cpu={get cycles(){return self.r.count;},addClockEvent(fn,delay){self.events.push({at:self.r.count+delay,fn});self.events.sort((a,b)=>a.at-b.at);}};
  for(const u of this.units)u.receiver=new UARTReceiver(cpu,()=>this.readLine(u),()=>this.format(u),frame=>this.receive(u,frame));
 }
 find(a){return this.units.find(u=>a>=u.base&&a<=u.base+24);}
 cr(u,off=12){return this.r.regs.get(u.base+off)||0;}
 clocked(u){const f4=this.r.board.cpu==='cortex-m4f',a=f4?(u.number===1?0x40023844:0x40023840):(u.number===1?0x40021018:0x4002101c);return !!(this.r.regs.get(a)&(1<<(u.number===1?(f4?4:14):17)));}
 enabled(u,mask=0){return this.clocked(u)&&!!(this.cr(u)&8192)&&(!mask||!!(this.cr(u)&mask));}
 divider(u){const f4=this.r.board.cpu==='cortex-m4f',cf=this.r.regs.get(f4?0x40023808:0x40021004)||0,n=(cf>>>(f4?(u.number===1?13:10):(u.number===1?11:8)))&7;return n<4?1:1<<(n-3);}
 terminal(u){return u.number===(this.r.board.terminalNumber??1);}
 pins(u){if(u.number===2){if(this.r.board.cpu!=='cortex-m4f'&&(this.r.regs.get(0x40010004)&8))return null;return {tx:'PA2',rx:'PA3'};}const f4=this.r.board.cpu==='cortex-m4f';if(!f4)return this.r.regs.get(0x40010004)&4?{tx:'PB6',rx:'PB7'}:{tx:'PA9',rx:'PA10'};return{tx:['PA9','PB6',...(this.r.board.family==='f411'?['PA15']:[])].find(p=>this.mapped(p,true)),rx:['PA10','PB7',...(this.r.board.family==='f411'?['PB3']:[])].find(p=>this.mapped(p,false))};}
 mapped(pin,tx){if(!pin||!this.r.board.gpio.includes(pin))return false;const bank=pin.charCodeAt(1)-65,n=+pin.slice(2),f4=this.r.board.cpu==='cortex-m4f';if(f4){const base=0x40020000+bank*1024;return !!(this.r.regs.get(0x40023830)&(1<<bank))&&((this.r.regs.get(base)>>>n*2)&3)===2&&((this.r.regs.get(base+32+(n>=8?4:0))>>>((n%8)*4))&15)===7;}
  const base=0x40010800+bank*1024,c=(this.r.regs.get(base+(n<8?0:4))>>>((n%8)*4))&15;return !!(this.r.regs.get(0x40021018)&(1<<(bank+2)))&&(tx?!!(c&3)&&(c>>>2)===2:!(c&3)&&[1,2].includes(c>>>2));
 }
 physical(u){const p=this.pins(u);return !!(p&&this.mapped(p.tx,true));}
 format(u,receive=true){if(!this.enabled(u,receive?4:8))return null;const p=this.pins(u);if(!p||!this.mapped(p.tx,true)||(receive&&!this.mapped(p.rx,false)))return null;const cr=this.cr(u),cr2=this.cr(u,16),brr=this.cr(u,8)&65535,stop=(cr2>>>12)&3;if(!brr||(cr&32768)||![0,2].includes(stop))return null;const parity=cr&1024?(cr&512?'odd':'even'):null;return{period:brr*this.divider(u),bits:(cr&4096?9:8)-(parity?1:0),stops:stop===2?2:1,receiveStops:1,allow9:true,parity};}
 readLine(u){const f=this.format(u),pin=this.pins(u)?.rx;if(!f||!pin)return null;const voltage=this.r.inputVoltages?.[pin];return Number.isFinite(voltage)?voltage<.99?false:voltage>=2.31&&voltage<=3.6?true:null:this.r.circuit?null:!!this.r.inputs[pin];}
 observe(){for(const u of this.units)if(this.format(u))u.receiver.observe();else u.receiver.cancel();}
 receive(u,frame){if(!this.enabled(u,4))return;if(u.sr&32)u.sr|=8;else{u.dr=frame.value;u.sr|=32;}if(frame.error)u.sr|=frame.error==='parity'?1:frame.error==='floating'?4:2;}
 schedule(u,delay,fn){const epoch=u.epoch;this.events.push({at:this.r.count+delay,fn:()=>{if(epoch===u.epoch)fn();}});this.events.sort((a,b)=>a.at-b.at);}
 pump(u){if(u.shift!==null||u.tdr===null||!this.enabled(u,8))return;const f=this.format(u,false);if(!f)return;const value=u.tdr&((1<<f.bits)-1);u.shift=value;u.tdr=null;u.sr|=128;u.sr&=~64;u.high=false;this.changed=true;let ones=0;
  for(let i=0;i<f.bits;i++){ones+=(value>>i)&1;this.schedule(u,(i+1)*f.period,()=>{u.high=!!(value&(1<<i));this.changed=true;});}
  if(f.parity)this.schedule(u,(f.bits+1)*f.period,()=>{u.high=f.parity==='odd'?!(ones%2):!!(ones%2);this.changed=true;});
  const stop=1+f.bits+(f.parity?1:0);this.schedule(u,stop*f.period,()=>{u.high=true;this.changed=true;});
  this.schedule(u,(stop+f.stops)*f.period,()=>{u.shift=null;if(this.terminal(u))this.r.serial+=String.fromCharCode(value&255);if(u.tdr===null)u.sr|=64;this.pump(u);});
 }
 tick(){while(this.events[0]?.at<=this.r.count)this.events.shift().fn();for(const u of this.units)if(u.shift!==null&&!this.enabled(u))this.cancel(u);}
 cancel(u){u.epoch++;u.shift=null;u.tdr=null;u.high=true;u.sr=0xc0;u.dr=0;u.readSR=false;u.receiver.cancel();this.changed=true;}
 read(a,n){const u=this.find(a&~3);if(!u)return undefined;const off=(a&~3)-u.base;let value=this.cr(u,off);if(off===0){u.readSR=true;value=this.enabled(u)?u.sr:0;if(!this.physical(u)&&this.terminal(u)&&this.enabled(u,4)&&this.r.rx.length)value|=32;}
  if(off===4){if(!this.physical(u)&&this.terminal(u))value=this.enabled(u,4)?this.r.rx.shift()??0:0;else{value=u.dr;u.sr&=~32;}if(u.readSR)u.sr&=~31;u.readSR=false;}
  return n===4?value>>>0:(value>>>((a&3)*8))&(n===1?255:65535);
 }
 write(a,v,n){const u=this.find(a&~3);if(!u)return false;const off=(a&~3)-u.base;if(n!==4){const shift=(a&3)*8,mask=(n===1?255:65535)<<shift;v=((this.r.regs.get(a&~3)||0)&~mask)|((v<<shift)&mask);}
  if(off===4){if(this.enabled(u,8)){if(this.physical(u)){if(u.tdr!==null)throw Error('USART TDR dolu: TXE beklenmeli.');u.tdr=v&511;u.sr&=~(128|64);this.pump(u);}else if(this.terminal(u))this.r.serial+=String.fromCharCode(v&255);}return true;}
  if(off===0){u.sr&=v|~(64|32|16|8|4|2|1);return true;}
  if(off===12){if((v&8192)&&(v&32768))throw Error('STM32 fiziksel USART OVER8 henüz desteklenmiyor.');if(!(v&8192))this.cancel(u);}
  if(off===16&&![0,0x2000].includes(v&0x3000))throw Error('STM32 USART 0.5/1.5 stop bit henüz desteklenmiyor.');if(off===20&&(v&~193))throw Error('STM32 USART flow-control/half-duplex henüz desteklenmiyor.');
  this.r.regs.set(u.base+off,v>>>0);this.changed=true;this.r.circuit?.refresh(true);return true;
 }
 irqMask(){let mask=0;for(const u of this.units){const cr=this.cr(u);if(!(cr&(224|256))&&!(this.cr(u,20)&1)||!this.enabled(u))continue;let sr=u.sr;if(!this.physical(u)&&this.terminal(u)&&this.r.rx.length)sr|=32;if((sr&32)&&(cr&32)||(sr&128)&&(cr&128)||(sr&64)&&(cr&64)||(sr&8)&&(cr&32)||(sr&6)&&(this.cr(u,20)&1)||(sr&1)&&(cr&256))mask|=1<<(u.number-1);}return mask;}
 outputs(states){for(const u of this.units){const p=this.pins(u);if(p&&this.physical(u)&&this.enabled(u,8))states[p.tx]={high:u.high,outputEnabled:true,voltage:u.high?3.3:0,mode:'USART'+u.number+'_TX'};if(p?.rx&&this.mapped(p.rx,false)&&this.r.board.cpu==='cortex-m4f'){const bank=p.rx.charCodeAt(1)-65,n=+p.rx.slice(2),pull=(this.r.regs.get(0x4002000c+bank*1024)>>>n*2)&3;states[p.rx].mode=pull===1?'INPUT_PULLUP':pull===2?'INPUT_PULLDOWN':'INPUT';}}return states;}
}
