import {STMTimer2 as Modes} from './stm32-timer-modes.js';
import {STMTimer2 as Counter} from './stm32-timer.js';

const CONFIG={1:[0x40012c00,0,1],3:[0x40000400,1,2],4:[0x40000800,2,2],5:[0x40000c00,3,2],9:[0x40014000,16,3],10:[0x40014400,17,3],11:[0x40014800,18,3]};
class Timer extends Modes {
 constructor(r,number){super(r);this.number=number;[this.base,this.enableBit,this.af]=CONFIG[number];if(number===1){this.base=this.f4?0x40010000:0x40012c00;this.enableBit=this.f4?0:11;}this.apb2=[1,9,10,11].includes(number);this.max=this.f4&&number===5?0xffffffff:65535;this.regs.set(44,this.max);this.active.arr=this.max;this.channels=number>=10?1:number===9?2:4;this.deadline=Array(4).fill(0);this.refs=Array(4).fill(null);}
 clocked(){return !!(this.r.regs.get(this.f4?(this.apb2?0x40023844:0x40023840):(this.apb2?0x40021018:0x4002101c))&(1<<this.enableBit));}
 ratio(){const div=this.r.system?.busDivider(this.apb2?2:1)??1;return (div>1?div/2:1)*(this.r.system?.factor()??1);}
 pads(ch){if(ch>=this.channels)return [];if(this.number===1)return [['PA8'],['PA9'],['PA10'],['PA11']][ch];if(this.number===3){if(!this.f4){const remap=((this.r.regs.get(0x40010004)||0)>>>10)&3;return remap===3?['PC'+(6+ch)]:remap===2?[['PB4'],['PB5'],['PB0'],['PB1']][ch]:[['PA6'],['PA7'],['PB0'],['PB1']][ch];}return [['PA6','PB4','PC6'],['PA7','PB5','PC7'],['PB0','PC8'],['PB1','PC9']][ch];}return this.number===4?[['PB6'],['PB7'],['PB8'],['PB9']][ch]:this.number===5?['PA'+ch]:this.number===9?[ch?'PA3':'PA2']:this.number===10?['PB8']:['PB9'];}
 mapped(pin,input=false){if(!pin||!this.r.board.gpio.includes(pin))return false;const n=+pin.slice(2),bank=pin.charCodeAt(1)-65,base=(this.f4?0x40020000:0x40010800)+bank*1024;if(this.f4)return !!(this.r.regs.get(0x40023830)&(1<<bank))&&((this.r.regs.get(base)>>>n*2)&3)===2&&((this.r.regs.get(base+32+(n>=8?4:0))>>>((n%8)*4))&15)===this.af;const c=(this.r.regs.get(base+(n<8?0:4))>>>((n%8)*4))&15;return !!(this.r.regs.get(0x40021018)&(1<<(bank+2)))&&(input?!(c&3)&&[1,2].includes(c>>>2):!!(c&3)&&(c>>>2)===2);}
 compare(ch){this.requestDMA(ch+1);for(const adc of [this.r.adc,this.r.adc2])adc?.externalTrigger('tim'+this.number+'_'+ch,true);const mode=(this.ccm(ch)>>>4)&7;if(mode===1)this.oc[ch]=true;if(mode===2)this.oc[ch]=false;if(mode===3)this.oc[ch]=!this.oc[ch];if(((this.regs.get(4)>>>4)&7)===3&&ch===0)this.trgo();}
 trgo(){for(const adc of [this.r.adc,this.r.adc2])adc?.externalTrigger('tim'+this.number+'_trgo',true);for(const timer of [this.r.timer,...this.r.timers?.units||[]])if(timer!==this)timer.internalTrigger?.(this.number);}
 update(software=false,stopCount=0){Counter.prototype.update.call(this,software,stopCount);this.requestDMA(0);if(((this.regs.get(4)>>>4)&7)===2)this.trgo();}
 read(a,n=4){const off=a-this.base;if(off<0||off>0x50)return undefined;return super.read(0x40000000+off,n);}
 write(a,v,n=4){let off=a-this.base;if(a>=0x40000000&&a<=0x40000050)off=a-0x40000000;if(off<0||off>0x50)return false;if([44,52,56,60,64].includes(off)&&this.max===65535)v&=65535;if(off===32&&this.number===1){const result=super.write(0x40000020,v&~0x444,n);this.regs.set(32,v&0xffff);this.r.circuit?.refresh(true);return result;}if(off===68&&this.number===1){const old=this.regs.get(68)||0,lock=(old>>>8)&3;if(lock)v=(v&~0x7cff)|(old&0x7cff);this.regs.set(68,v&65535);return true;}return super.write(0x40000000+off,v,n);}
 outputs(states){if(this.number===1&&!((this.regs.get(68)||0)&32768))return states;super.outputs(states);if(this.number!==1)return states;const bd=this.regs.get(68)||0,dt=bd&255,ticks=dt<128?dt:dt<192?(64+(dt&63))*2:dt<224?(32+(dt&31))*8:(32+(dt&31))*16,delay=ticks*this.ratio();for(let ch=0;ch<3;ch++){const main=this.pad(ch),complement=['PB13','PB14','PB15'][ch],cc=(this.regs.get(32)>>>ch*4)&15,high=main?states[main]?.high:false;if(high!==this.refs[ch]){this.refs[ch]=high;this.deadline[ch]=this.r.count+delay;}if(cc&4&&this.mapped(complement)){const active=this.r.count>=this.deadline[ch];states[complement]={high:active&&(!high!==!!(cc&8)),outputEnabled:true,voltage:active&&(!high!==!!(cc&8))?3.3:0,mode:'TIM1_CH'+(ch+1)+'N'};if(main&&this.r.count<this.deadline[ch])states[main]={...states[main],high:false,voltage:0};}}return states;}
}
export class STMTimers {
 constructor(r){this.r=r;const f4=r.board.cpu==='cortex-m4f';this.units=(f4?[1,3,4,5,9,10,11]:r.chip==='stm32f103c6'?[1,3]:[1,3,4]).map(n=>new Timer(r,n));}
 read(a,n){for(const t of this.units){const v=t.read(a,n);if(v!==undefined)return v;}}
 write(a,v,n){for(const t of this.units)if(a>=t.base&&a<=t.base+0x50)return t.write(a,v,n);return false;}
 tick(){for(const t of this.units)t.tick();}
 outputs(states){for(const t of this.units)t.outputs(states);return states;}
 irqExtra(){let mask=0;for(const t of this.units){const flags=(t.regs.get(16)||0)&(t.regs.get(12)||0);if(!t.clocked()||!flags)continue;if(t.number===1){if(flags&128)mask|=1<<12;if(flags&1)mask|=1<<13;if(flags&96)mask|=1<<14;if(flags&30)mask|=1<<15;}else mask|=1<<({3:16,4:17,5:18,9:12,10:13,11:14}[t.number]);}return mask;}
 resetBus(apb2,value){for(let i=0;i<this.units.length;i++){const t=this.units[i];if(t.apb2===apb2&&value&(1<<t.enableBit))this.units[i]=new Timer(this.r,t.number);}}
}
