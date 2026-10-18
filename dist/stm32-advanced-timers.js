import {STMTimers as Bank,Timer} from './stm32-timers.js';
// TIM1 control preloads are separate from CCR/ARR update preloads.
export class AdvancedTimer extends Timer {
 constructor(r){super(r,1);this.controls=new Map([[24,0],[28,0]]);this.activeCCER=0;this.lockWritten=false;}
 reference(ch){const mode=(this.ccm(ch)>>>4)&7,cnt=this.phase();return mode===6?(this.down()?cnt<=this.active.ccr[ch]:cnt<this.active.ccr[ch]):mode===7?(this.down()?cnt>this.active.ccr[ch]:cnt>=this.active.ccr[ch]):super.reference(ch);}
 update(software=false,stopCount=0){if(this.regs.get(0)&2)return;return super.update(software,stopCount);}
 ccm(ch){const off=ch<2?24:28,shift=(ch%2)*8,raw=this.regs.get(off)||0,active=this.controls?.get(off)??raw;return (((raw&~0x7070)|(active&0x7070))>>>shift)&255;}
 commute(){if(this.regs.get(4)&1){for(const off of [24,28])this.controls.set(off,this.regs.get(off)||0);this.activeCCER=this.regs.get(32)||0;}this.regs.set(16,(this.regs.get(16)||0)|32);this.requestDMA(5);this.changed=true;this.r.circuit?.refresh(true);}
 triggerEvent(sm){if((this.regs.get(4)&5)===5)this.commute();super.triggerEvent(sm);this.requestDMA(6);}
 write(a,v,n=4){const off=a-this.base,old=this.regs.get(off)||0,lock=(this.regs.get(68)>>>8)&3;if(off===68){let mask=this.lockWritten?0x300:0;if(lock)mask|=0x70ff;if(lock>=2)mask|=0xc00;v=(v&~mask)|(old&mask);this.regs.set(68,v&65535);this.lockWritten=true;this.breakInput();return true;}
  if(off===48)v&=255;
  if(off===4&&lock)v=(v&~0x7f00)|(old&0x7f00);
  if(off===32&&lock>=2)for(let ch=0;ch<4;ch++)if(!(this.ccm(ch)&3)){const mask=0xa<<(ch*4);v=(v&~mask)|(old&mask);}
  if((off===24||off===28)&&lock>=3)for(let ch=0;ch<2;ch++)if(!((old>>>(ch*8))&3)){const mask=0x78<<(ch*8);v=(v&~mask)|(old&mask);}
  if(off===12){this.regs.set(12,v&0x7fff);return true;}
  if(off===20&&v&32){this.commute();v&=~32;}
  const result=super.write(a,v,n);if(!(this.regs.get(4)&1)){if(off===24||off===28)this.controls.set(off,this.regs.get(off)||0);if(off===32)this.activeCCER=this.regs.get(32)||0;}return result;
 }
 outputs(states){const bd=this.regs.get(68)||0,cc=((this.regs.get(32)||0)&~0x555)|(this.activeCCER&0x555),moe=!!(bd&32768),cr2=this.regs.get(4)||0,dt=bd&255,ticks=dt<128?dt:dt<192?(64+(dt&63))*2:dt<224?(32+(dt&31))*8:(32+(dt&31))*16,delay=ticks*this.ratio()*(1<<Math.min(2,(this.regs.get(0)>>>8)&3));
  for(let ch=0;ch<4;ch++){const ref=this.reference(ch);if(ref!==this.refs[ch]){this.refs[ch]=ref;this.deadline[ch]=this.r.count+delay;}const ready=this.r.count>=this.deadline[ch];for(const [pin,enable,polarity,idle,logical,name]of [[this.pad(ch),1<<(ch*4),2<<(ch*4),1<<(8+ch*2),ref,''],...(ch<3?[[['PB13','PB14','PB15'][ch],4<<(ch*4),8<<(ch*4),1<<(9+ch*2),!ref,'N']]:[])])if(pin&&this.mapped(pin)){const selected=!!(cc&enable),high=moe?(selected?!!(logical&&ready)!==!!(cc&polarity):!!(cc&polarity)):!!(cr2&idle),drive=moe?selected||!!(bd&2048):!!(bd&1024);states[pin]={high,outputEnabled:drive,voltage:high?3.3:0,mode:'TIM1_CH'+(ch+1)+name};}}
  return states;
 }
}
export class STMTimers extends Bank {
 constructor(r){super(r);this.units[0]=new AdvancedTimer(r);}
 resetBus(apb2,value){super.resetBus(apb2,value);const t=this.units[0];if(t.apb2===apb2&&value&(1<<t.enableBit))this.units[0]=new AdvancedTimer(this.r);}
}
