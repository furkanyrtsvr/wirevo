// TIM2 up/down/center counting, PWM and physical input capture with CC/overcapture IRQ28.
export class STMTimer2 {
 constructor(runtime){this.r=runtime;this.f4=runtime.board.cpu==='cortex-m4f';this.max=this.f4?0xffffffff:65535;this.regs=new Map([[44,this.max]]);this.active={psc:0,arr:this.max,ccr:[0,0,0,0]};this.origin=0;this.savedPhase=0;this.next=Infinity;this.changed=false;this.oc=[false,false,false,false];this.encoderLevels=null;this.encoderPsc=0;this.captures=Array.from({length:4},()=>({level:null,edges:0}));}
 clocked(){return !!(this.r.regs.get(this.f4?0x40023840:0x4002101c)&1);}
 enabled(){return (!this.r.system||this.r.system.mode==='run')&&this.clocked()&&!!((this.regs.get(0)||0)&1);}
 ratio(){const apb=this.r.system?.busDivider(1)??this.r.usarts.divider({number:2});return (apb>1?apb/2:1)*(this.r.system?.factor()??1);}
 unit(){return (this.active.psc+1)*this.ratio();}
 center(){return ((this.regs.get(0)||0)>>>5)&3;}
 down(){return !!((this.regs.get(0)||0)&16);}
 period(){return (this.center()?2*this.active.arr:this.active.arr+1)*this.unit();}
 encoder(){return (this.regs.get(8)||0)&7;}
 prescalerPhase(){return this.enabled()&&!this.encoder()?((this.r.count-this.origin)%this.unit()+this.unit())%this.unit():this.savedPhase;}
 hold(cnt,phase){this.regs.set(36,cnt);this.savedPhase=phase;const pos=this.center()?(this.down()?2*this.active.arr-cnt:cnt):this.down()?this.active.arr-cnt:cnt;this.origin=this.r.count-pos*this.unit()-phase;}
 phase(){if(!this.enabled()||this.encoder())return this.regs.get(36)||0;const steps=Math.floor((this.r.count-this.origin)/this.unit());if(this.center()){const arr=this.active.arr;if(!arr)return 0;const pos=((steps%(2*arr))+2*arr)%(2*arr),down=pos>=arr;this.regs.set(0,down?(this.regs.get(0)||0)|16:(this.regs.get(0)||0)&~16);return down?2*arr-pos:pos;}const pos=((steps%(this.active.arr+1))+this.active.arr+1)%(this.active.arr+1);return this.down()?this.active.arr-pos:pos;}
 ccm(ch){return ((this.regs.get(ch<2?24:28)||0)>>>((ch%2)*8))&255;}
 load(){this.active.psc=(this.regs.get(40)||0)&65535;this.active.arr=(this.regs.get(44)??this.max)>>>0;this.active.ccr=Array.from({length:4},(_,i)=>(this.regs.get(52+i*4)||0)>>>0);}
 schedule(){if(!this.enabled()||this.encoder()||this.center()&&!this.active.arr){this.next=Infinity;return;}if(this.center()||this.down()){const unit=this.unit(),arr=this.active.arr,cycle=this.center()?2*arr:arr+1,steps=(this.r.count-this.origin)/unit,pos=((steps%cycle)+cycle)%cycle;let delta=cycle-pos;const candidates=this.center()?[arr,cycle]:[cycle];for(let ch=0;ch<4;ch++)if(!(this.ccm(ch)&3)&&this.active.ccr[ch]<=arr){const c=this.active.ccr[ch];candidates.push(...(this.center()?[c,cycle-c]:[arr-c]));}for(const edge of candidates)if(edge>pos)delta=Math.min(delta,edge-pos);this.next=this.r.count+Math.max(1,delta*unit);return;}const period=this.period(),phase=(this.r.count-this.origin)%period;let delta=period-phase;for(let ch=0;ch<4;ch++){if(this.ccm(ch)&3)continue;const edge=this.active.ccr[ch]*this.unit();if(edge>phase&&edge<period)delta=Math.min(delta,edge-phase);}this.next=this.r.count+Math.max(1,delta);}
 update(software=false,stopCount=0){const cr=this.regs.get(0)||0;if(cr&2)return;this.load();if(!software||!(cr&4))this.regs.set(16,(this.regs.get(16)||0)|1);if(cr&8){this.regs.set(0,cr&~1);this.regs.set(36,stopCount);this.savedPhase=0;}}
 tick(){this.capture();if(!this.enabled())return;if(this.center()||this.down()){this.tickAdvanced();return;}while(this.r.count>=this.next&&this.enabled()){
  const at=this.next,period=this.period(),overflow=at-this.origin>=period,oldARR=this.active.arr;
  let sr=this.regs.get(16)||0;
  for(let ch=0;ch<4;ch++)if(!(this.ccm(ch)&3)){
   const value=this.active.ccr[ch];if(overflow?value===0||value>oldARR:at-this.origin===value*this.unit()){sr|=1<<(ch+1);this.compare(ch);}
  }
  this.regs.set(16,sr);
  if(overflow){this.origin+=period;this.update();}
  this.changed=true;
  // Schedule from the event, preserving chronology if a CPU batch spans events.
  const now=this.r.count;this.r.count=at;this.schedule();this.r.count=now;
 }}
 tickAdvanced(){while(this.r.count>=this.next&&this.enabled()){const at=this.next,now=this.r.count,arr=this.active.arr,unit=this.unit(),center=this.center(),cycle=center?2*arr:arr+1,steps=Math.round((at-this.origin)/unit),pos=((steps%cycle)+cycle)%cycle,arrivalDown=center?pos>=arr:true,boundary=center?pos===0||pos===arr:pos===0,cnt=center?(pos>=arr?2*arr-pos:pos):arr-pos;this.r.count=at;this.phase();let sr=this.regs.get(16)||0;for(let ch=0;ch<4;ch++)if(!(this.ccm(ch)&3)){const value=this.active.ccr[ch],match=value===cnt||(center?pos===arr:boundary)&&value>arr;if(match){this.compare(ch);if(!center||center===3||center===1&&arrivalDown||center===2&&!arrivalDown)sr|=1<<(ch+1);}}this.regs.set(16,sr);if(boundary){this.update(false,cnt);this.hold(center?Math.min(cnt,this.active.arr):this.active.arr,0);}this.changed=true;this.schedule();this.r.count=now;}}
 compare(ch){for(const adc of [this.r.adc,this.r.adc2])adc?.externalTrigger('tim'+(this.number??2)+'_'+ch,true);const mode=(this.ccm(ch)>>>4)&7;if(mode===1)this.oc[ch]=true;if(mode===2)this.oc[ch]=false;if(mode===3)this.oc[ch]=!this.oc[ch];}
 inputLevel(pin){const v=this.r.inputVoltages?.[pin];return this.r.circuit?Number.isFinite(v)&&v<=.99?false:Number.isFinite(v)&&v>=2.31?true:null:!!this.r.inputs[pin];}
 countEncoder(){const sms=this.encoder();if(!sms)return;const levels=[0,1].map(ch=>this.mapped('PA'+ch,true)&&(this.ccm(ch)&3)===1?this.inputLevel('PA'+ch):null);if(levels.includes(null)||!this.clocked()){this.encoderLevels=null;return;}const cc=this.regs.get(32)||0,now=levels.map((v,ch)=>v!==!!(cc&(2<<ch*4))),before=this.encoderLevels;this.encoderLevels=now;if(!before||!this.enabled())return;const changed=now.map((v,i)=>v!==before[i]);if(changed[0]===changed[1])return;
  const ch=changed[0]?0:1,down=ch===0?now[0]===now[1]:now[0]!==now[1],cr=this.regs.get(0)||0;this.regs.set(0,down?cr|16:cr&~16);
  if(sms===1&&ch===0||sms===2&&ch===1)return;if(++this.encoderPsc<=this.active.psc)return;this.encoderPsc=0;
  const old=this.regs.get(36)||0,overflow=down?old===0:old>=this.active.arr,next=overflow?down?this.active.arr:0:old+(down?-1:1);this.regs.set(36,next>>>0);
  let sr=this.regs.get(16)||0;for(let i=0;i<4;i++)if(!(this.ccm(i)&3)&&(next===this.active.ccr[i]||overflow&&this.active.ccr[i]>this.active.arr)){sr|=1<<(i+1);this.compare(i);}this.regs.set(16,sr);if(overflow)this.update();this.changed=true;
 }
 latch(ch){for(const adc of [this.r.adc,this.r.adc2])adc?.externalTrigger('tim'+(this.number??2)+'_'+ch,true);const flag=1<<(ch+1),sr=this.regs.get(16)||0;this.regs.set(52+ch*4,this.phase()>>>0);this.regs.set(16,sr|flag|(sr&flag?1<<(ch+9):0));}
 capture(){this.countEncoder();for(let ch=0;ch<4;ch++){const mode=this.ccm(ch),select=mode&3,cc=(this.regs.get(32)>>>ch*4)&15,state=this.captures[ch],source=select===2?ch^1:ch,pin='PA'+source;if(!this.clocked()||!select||!(cc&1)||!this.mapped(pin,true)){state.level=null;state.edges=0;continue;}const level=this.inputLevel(pin);if(level===null){state.level=null;continue;}if(state.level!==null&&state.level!==level&&((cc&10)===10||level===!(cc&2))){if(++state.edges>=(1<<((mode>>>2)&3))){state.edges=0;this.latch(ch);}}state.level=level;}}
 read(a,n){const off=(a&~3)-0x40000000;if(off<0||off>0x4c)return undefined;if(off===0)this.phase();let v=off===36?this.phase():this.regs.get(off)||0;if(off>=52&&off<=64&&(this.ccm((off-52)/4)&3))this.regs.set(16,(this.regs.get(16)||0)&~(1<<((off-52)/4+1)));return n===4?v>>>0:(v>>>((a&3)*8))&(n===1?255:65535);}
 write(a,v,n){const off=(a&~3)-0x40000000;if(off<0||off>0x4c)return false;if(n!==4){const shift=(a&3)*8,mask=(n===1?255:65535)<<shift;v=((this.regs.get(off)||0)&~mask)|((v<<shift)&mask);}if([36,44,52,56,60,64].includes(off)&&!this.f4)v&=65535;
  if(off===8&&v&&((this.regs.get(0)||0)&96))throw Error('TIM2 encoder/center-aligned birleşimi desteklenmiyor.');if(off===8&&(v&~3))throw Error('TIM2 external/slave clock/trigger modu henüz desteklenmiyor.');if(off===8&&((this.regs.get(0)||0)&1)&&v!==(this.regs.get(8)||0))throw Error('TIM2 encoder clock seçimi CEN=0 gerektirir.');if(off===4&&v)throw Error('TIM2 master TRGO/control modu henüz desteklenmiyor.');if(off===12&&(v&~31)||off===20&&(v&~31)||(off===72||off===76)&&v)throw Error('TIM2 DMA/trigger/diğer eventler henüz desteklenmiyor.');
  const cnt=this.phase(),old=this.regs.get(off)||0,prescalerPhase=this.prescalerPhase();if(off===0&&this.encoder())v=(v&~16)|(old&16);if(off===0&&this.encoder()&&(v&96))throw Error('TIM2 encoder/center-aligned birleşimi desteklenmiyor.');if(off===0&&((old^v)&96)&&(old&1))throw Error('TIM2 CMS değişimi CEN=0 gerektirir.');if(off===0&&(v&96))v=(v&~16)|((old&96)?old&16:0);if((off===0&&this.encoder()&&(v&8))||(off===8&&v&&((this.regs.get(0)||0)&8)))throw Error('TIM2 encoder/one-pulse birleşimi henüz desteklenmiyor.');
  if(off===24||off===28)for(let j=0;j<2;j++){const mode=(v>>>j*8)&255,select=mode&3,ch=(off===24?0:2)+j;if(select===3||select&&(mode&240))throw Error('TIM2 TRC/dijital capture filtresi henüz desteklenmiyor.');if(!select&&(mode&132))throw Error('TIM2 output fast/clear trigger henüz desteklenmiyor.');if((this.regs.get(32)&(1<<ch*4))&&((mode^this.ccm(ch))&3))throw Error('TIM2 CCxS değişimi CCxE=0 gerektirir.');}
  if(off===32)for(let ch=0;ch<4;ch++){const cc=(v>>>ch*4)&15;if(cc&4)throw Error('TIM2 complementary kanal desteklenmiyor.');if((this.ccm(ch)&3)&&(cc&8)&&(!this.f4||!(cc&2)))throw Error('TIM2 capture polarity seçimi bu profilde desteklenmiyor.');}
  if(off>=52&&off<=64&&(this.ccm((off-52)/4)&3))return true;
  if(off===16)this.regs.set(16,(this.regs.get(16)||0)&v);else this.regs.set(off,v>>>0);
  if(off===24||off===28)for(let j=0;j<2;j++){const ch=(off===24?0:2)+j;if(((old^v)>>>j*8)&255)this.captures[ch]={level:null,edges:0};}if(off===32)for(let ch=0;ch<4;ch++)if(((old^v)>>>ch*4)&15)this.captures[ch]={level:null,edges:0};
  if(off===8){this.regs.set(36,cnt);this.encoderLevels=null;this.encoderPsc=0;this.origin=this.r.count-cnt*this.unit();}
  if(off===0&&((old^v)&113)){this.hold(cnt,prescalerPhase);this.encoderLevels=null;}
  if(off===20&&v&1){this.origin=this.r.count;this.savedPhase=0;this.encoderPsc=0;this.update(true);const reset=this.down()&&!this.center()?this.active.arr:0;if(this.center())this.regs.set(0,(this.regs.get(0)||0)&~16);this.hold(reset,0);this.regs.set(20,0);}
  if(off===20){for(let ch=0;ch<4;ch++)if(v&(1<<(ch+1))){if(this.ccm(ch)&3)this.latch(ch);else{this.regs.set(16,(this.regs.get(16)||0)|(1<<(ch+1)));this.compare(ch);}}this.regs.set(20,0);}
  if(off===44&&!((this.regs.get(0)||0)&128)){this.active.arr=v>>>0;if(this.center()||this.down())this.hold(cnt,prescalerPhase);}
  if(off>=52&&off<=64&&!((this.ccm((off-52)/4))&8))this.active.ccr[(off-52)/4]=v>>>0;
  if(off===36)this.hold(v,prescalerPhase);this.changed=true;this.schedule();this.r.circuit?.refresh(true);return true;
 }
 mapped(pin,input=false){const n=+pin.slice(2);if(!this.r.board.gpio.includes(pin))return false;if(this.f4)return !!(this.r.regs.get(0x40023830)&1)&&((this.r.regs.get(0x40020000)>>>n*2)&3)===2&&((this.r.regs.get(0x40020020)>>>n*4)&15)===1;return !!(this.r.regs.get(0x40021018)&4)&&(input?(((this.r.regs.get(0x40010800)>>>n*4)&15)===4||((this.r.regs.get(0x40010800)>>>n*4)&15)===8):((this.r.regs.get(0x40010800)>>>n*4)&15)===11)&&!((this.r.regs.get(0x40010004)||0)&0x300);}
 outputs(states){if(!this.clocked())return states;const cnt=this.phase(),down=this.down();for(let ch=0;ch<4;ch++){const mode=this.ccm(ch);if(mode&3){const pin='PA'+((mode&3)===2?ch^1:ch);if(this.f4&&states[pin]&&this.mapped(pin,true)){const pull=((this.r.regs.get(0x4002000c)||0)>>>((+pin.slice(2))*2))&3;states[pin].mode=pull===1?'INPUT_PULLUP':pull===2?'INPUT_PULLDOWN':'INPUT';}continue;}const pin='PA'+ch,ccer=(this.regs.get(32)>>>ch*4)&15;if(!(ccer&1)||!this.mapped(pin))continue;const oc=(mode>>>4)&7,ref=oc===4?false:oc===5?true:oc===6?(down?cnt<=this.active.ccr[ch]:cnt<this.active.ccr[ch]):oc===7?(down?cnt>this.active.ccr[ch]:cnt>=this.active.ccr[ch]):this.oc[ch],high=ref!==!!(ccer&2);states[pin]={high,outputEnabled:true,voltage:high?3.3:0,mode:oc>=6?'TIM2_PWM':'TIM2_OC'};}return states;}
 irq(){return this.clocked()&&!!((this.regs.get(12)||0)&(this.regs.get(16)||0)&31);}
}
