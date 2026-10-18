import {STMUSARTs as UARTs} from './stm32-usart.js';
import {UARTReceiver} from './uart-lines.js';

export class STMUSARTs extends UARTs {
 constructor(r){super(r);const f4=r.board.cpu==='cortex-m4f',number=f4?6:3;if(r.chip==='stm32f103c6')return;const u={number,base:f4?0x40011400:0x40004800,sr:0xc0,dr:0,tdr:null,shift:null,high:true,readSR:false,epoch:0};const cpu={get cycles(){return r.count;},addClockEvent:(fn,delay)=>{this.events.push({at:r.count+delay,unit:number,fn});this.events.sort((a,b)=>a.at-b.at);}};u.receiver=new UARTReceiver(cpu,()=>this.readLine(u),()=>this.format(u),frame=>this.receive(u,frame));this.units.push(u);}
 clocked(u){if(u.number<=2)return super.clocked(u);return !!(this.r.regs.get(u.number===6?0x40023844:0x4002101c)&(1<<(u.number===6?5:18)));}
 divider(u){return u.number===6?(this.r.system?.busDivider(2)??1)*(this.r.system?.factor()??1):super.divider(u);}
 pins(u){if(u.number===3){const map=((this.r.regs.get(0x40010004)||0)>>>4)&3;return map===3?{tx:'PD8',rx:'PD9'}:map===1?{tx:'PC10',rx:'PC11'}:{tx:'PB10',rx:'PB11'};}if(u.number===6)return{tx:['PC6','PA11'].find(p=>this.af(p,8)),rx:['PC7','PA12'].find(p=>this.af(p,8))};return super.pins(u);}
 af(pin,af){if(!pin||!this.r.board.gpio.includes(pin))return false;const bank=pin.charCodeAt(1)-65,n=+pin.slice(2),base=0x40020000+bank*1024;return !!(this.r.regs.get(0x40023830)&(1<<bank))&&((this.r.regs.get(base)>>>n*2)&3)===2&&((this.r.regs.get(base+32+(n>=8?4:0))>>>((n%8)*4))&15)===af;}
 mapped(pin,tx){if(this.r.board.cpu==='cortex-m4f'&&['PC6','PC7','PA11','PA12'].includes(pin))return this.af(pin,8);return super.mapped(pin,tx);}
 flowPins(u){return u.number===1?{cts:'PA11',rts:'PA12'}:u.number===2?{cts:'PA0',rts:'PA1'}:u.number===3?{cts:'PB13',rts:'PB14'}:{cts:'PG13',rts:'PG8'};}
 cts(u){const cr3=this.cr(u,20);if(!(cr3&512))return true;const pin=this.flowPins(u).cts;if(!this.r.board.gpio.includes(pin))return false;return this.r.inputs[pin]===false;}
 pump(u){if(!this.cts(u))return;return super.pump(u);}
 observe(){super.observe();for(const u of this.units){const cts=this.cts(u);if(u.lastCTS!==undefined&&u.lastCTS!==cts)u.sr|=512;u.lastCTS=cts;if(cts)this.pump(u);if(this.cr(u,16)&16384){const low=this.readLine(u)===false,format=this.format(u),period=format?.period||Infinity;if(low){u.breakAt??=this.r.count;if(this.r.count-u.breakAt>=period*((this.cr(u,16)&32)?11:10))u.sr|=256;}else u.breakAt=null;}}}
 write(a,v,n=4){const u=this.find(a&~3);if(!u)return false;const off=(a&~3)-u.base;if(off===20){if(v&~0x7c1)throw Error('USART IrDA/smartcard/half-duplex modu henüz desteklenmiyor.');const old=this.cr(u,20);this.r.regs.set(u.base+20,v&0x7ff);if((old^v)&512)this.pump(u);return true;}return super.write(a,v,n);}
 pending(u){if(!this.enabled(u))return false;const cr=this.cr(u),cr2=this.cr(u,16),cr3=this.cr(u,20);let sr=u.sr;if(!this.physical(u)&&this.terminal(u)&&this.r.rx.length)sr|=32;return !!((sr&32)&&(cr&32)||(sr&128)&&(cr&128)||(sr&64)&&(cr&64)||(sr&8)&&(cr&32)||(sr&6)&&(cr3&1)||(sr&1)&&(cr&256)||(sr&256)&&(cr2&64)||(sr&512)&&(cr3&1024));}
 irqMask(){let mask=0;for(const u of this.units)if(u.number<=2&&this.pending(u))mask|=1<<(u.number-1);return mask;}
 irqExtra(){let mask=0;for(const u of this.units)if(u.number>2&&this.pending(u))mask|=1<<(u.number===3?27:28);return mask;}
 outputs(states){super.outputs(states);for(const u of this.units)if(this.enabled(u)&&this.cr(u,20)&256){const pin=this.flowPins(u).rts;if(!this.r.board.gpio.includes(pin))continue;const mapped=this.r.board.cpu==='cortex-m4f'?this.af(pin,7):super.mapped(pin,true);if(mapped){const high=!!(u.sr&32);states[pin]={high,outputEnabled:true,voltage:high?3.3:0,mode:'USART'+u.number+'_RTS'};}}return states;}
}
