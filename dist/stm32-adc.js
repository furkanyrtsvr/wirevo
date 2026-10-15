// Regular ADC1 12-bit scan/continuous, alignment and F4 EOCS/OVR.
// Conversion values come from physical DC nets, never sensor controller state.
export class STMADC {
 constructor(runtime){this.r=runtime;this.f4=runtime.board.cpu==='cortex-m4f';this.base=this.f4?0x40012000:0x40012400;this.regs=new Map([[this.base+36,4095]]);this.pending=null;this.sequence=null;this.dmaStopped=false;this.triggerQueue=[];this.regularReturn=null;this.regularDisc=null;this.injectedDisc=null;}
 clocked(){return !!(this.r.regs.get(this.f4?0x40023844:0x40021018)&(1<<(this.f4?8:9)));}
 handles(a){return a>=this.base&&a<=this.base+0x50||this.f4&&a===0x40012304;}
 read(a,n){const aligned=a&~3;if(!this.handles(aligned))return undefined;let v=this.regs.get(aligned)||0;if(aligned===this.base+0x4c){this.regs.set(this.base,(this.regs.get(this.base)||0)&~2);if(this.r.dma)this.r.dma.pendingADC=false;}return n===4?v>>>0:(v>>>((a&3)*8))&(n===1?255:65535);}
 write(a,v,n){
  const aligned=a&~3;if(!this.handles(aligned))return false;
  if(n!==4||a!==aligned)throw Error('ADC register yazımı 32-bit hizalı olmalı.');
  if(aligned===this.base){this.regs.set(aligned,(this.regs.get(aligned)||0)&v);return true;}
  if(aligned>=this.base+60&&aligned<=this.base+76)return true;
  if(aligned>=this.base+20&&aligned<=this.base+40)v&=4095;
  this.regs.set(aligned,v>>>0);
  if(aligned===this.base+8){if(!(v&256)){this.dmaStopped=false;if(this.r.dma)this.r.dma.pendingADC=false;}if(!(v&1)){this.pending=null;this.sequence=null;this.regularReturn=null;this.regularDisc=null;this.injectedDisc=null;this.triggerQueue=[];return true;}if(!this.f4&&(v&12)){this.regs.set(aligned,v&~12);return true;}if(v&(this.f4?1<<30:1<<22))this.start();if(v&(this.f4?1<<22:1<<21))this.startInjected();}return true;
 }
 pin(channel){if(channel>15)throw Error('ADC1 dahili sıcaklık/VREF/VBAT kanalları henüz desteklenmiyor.');const pin=channel<8?'PA'+channel:channel<10?'PB'+(channel-8):'PC'+(channel-10);if(!this.r.board.gpio.includes(pin))throw Error('ADC kanalı kart başlığında kullanılamıyor: '+pin);return pin;}
 start(external=false){
  const cr=this.regs.get(this.base+8)||0,cr1=this.regs.get(this.base+4)||0;
  if(!this.clocked()||!(cr&1))return;
  if(this.pending){this.regs.set(this.base+8,cr&~(this.f4?1<<30:1<<22));return;}
  if(cr1&~(31|32|64|128|256|512|1024|2048|4096|(7<<13)|(1<<22)|(1<<23)|(this.f4?(1<<26)|(3<<24):0)))throw Error('ADC1 injected/discontinuous henüz desteklenmiyor.');
  this.checkDiscontinuous(cr1,cr);
  const allowed=this.f4?1|2|2048|1024|256|512|(1<<22)|(15<<16)|(3<<20)|(15<<24)|(3<<28)|(1<<30):1|2|2048|256|(1<<21)|(7<<12)|(1<<15)|(7<<17)|(1<<20)|(1<<22);
  if(cr&~allowed)throw Error('ADC1 external trigger/DMA/internal kanal henüz desteklenmiyor.');
  if(this.f4&&((this.regs.get(0x40012304)||0)&~(3<<16)))throw Error('ADC1 common register modu henüz desteklenmiyor.');
  if(!this.f4&&(!external&&(!(cr&(1<<20))||((cr>>>17)&7)!==7)))throw Error('F103 ADC1 yazılım EXTSEL/EXTTRIG seçimi gerekli.');
  if(this.f4&&((this.regs.get(this.base)||0)&32))return;
  const count=cr1&256?1+(((this.regs.get(this.base+0x2c)||0)>>>20)&15):1;
  const channels=Array.from({length:count},(_,i)=>((this.regs.get(this.base+(i<6?0x34:i<12?0x30:0x2c))||0)>>>((i%6)*5))&31);
  channels.forEach(c=>this.pin(c));
  const disc=!!(cr1&2048),key=JSON.stringify([channels,cr1&0x300e900,cr&2048]);
  this.sequence=disc&&this.regularDisc?.key===key?this.regularDisc:{key,channels,index:0,eocs:this.f4&&!!(cr&1024),left:!!(cr&2048),bits:this.f4?[12,10,8,6][(cr1>>>24)&3]:12};this.sequence.disc=disc;this.sequence.remaining=1+((cr1>>>13)&7);this.regularDisc=null;
  this.regs.set(this.base,(this.regs.get(this.base)||0)|16);
  this.regs.set(this.base+8,cr&~(this.f4?1<<30:1<<22));
  this.schedule(this.r.count);
 }
 startInjected(auto=false,at=this.r.count,external=false){const cr=this.regs.get(this.base+8)||0,cr1=this.regs.get(this.base+4)||0,js=this.f4?1<<22:1<<21;if(!this.clocked()||!(cr&1))return;this.regs.set(this.base+8,cr&~js);if(this.sequence?.injected)return;if(!auto&&(cr1&1024))return;if(!this.f4&&!auto&&!external&&(!(cr&(1<<15))||((cr>>>12)&7)!==7))throw Error('F103 injected yazılım JEXTSEL/JEXTTRIG seçimi gerekli.');this.checkDiscontinuous(cr1,cr);const jsqr=this.regs.get(this.base+56)||0,count=cr1&256?1+((jsqr>>>20)&3):1,channels=Array.from({length:count},(_,i)=>(jsqr>>>((4-count+i)*5))&31);channels.forEach(c=>this.pin(c));this.regularReturn=this.sequence;this.pending=null;const disc=!!(cr1&4096),key=JSON.stringify([channels,cr1&0x3001100,cr&2048]);this.sequence=disc&&this.injectedDisc?.key===key?this.injectedDisc:{key,channels,index:0,injected:true,left:!!(cr&2048),bits:this.f4?[12,10,8,6][(cr1>>>24)&3]:12};this.sequence.disc=disc;this.injectedDisc=null;this.regs.set(this.base,(this.regs.get(this.base)||0)|8);this.schedule(at);}
 checkDiscontinuous(cr1,cr){if((cr1&6144)===6144)throw Error('ADC regular ve injected discontinuous birlikte kullanılamaz.');if((cr1&6144)&&(cr1&1024))throw Error('ADC auto-injected/discontinuous birlikte kullanılamaz.');if((cr1&2048)&&(cr&2))throw Error('ADC continuous/discontinuous birlikte kullanılamaz.');}
 schedule(at){
  const channel=this.sequence.channels[this.sequence.index],pin=this.pin(channel);
  this.r.circuit?.refresh(true);const voltage=this.r.inputVoltages?.[pin];
  if(!Number.isFinite(voltage))throw Error('ADC girişi boşta: '+pin);if(voltage<-.000001||voltage>3.300001)throw Error('ADC girişi 0–3.3 V aralığında olmalı.');
  const sampling=((this.regs.get(this.base+(channel<10?16:12))||0)>>>((channel<10?channel:channel-10)*3))&7,samples=this.f4?[3,15,28,56,84,112,144,480]:[1.5,7.5,13.5,28.5,41.5,55.5,71.5,239.5],prescale=this.f4?((this.regs.get(0x40012304)||0)>>>16)&3:((this.r.regs.get(0x40021004)||0)>>>14)&3,divider=(2+prescale*2)*this.r.usarts.divider({number:1});
  if(this.r.board.hz/divider>(this.f4?36000000:14000000))throw Error('ADC saat sınırı aşıldı.');
  const max=(1<<this.sequence.bits)-1,value=Math.max(0,Math.min(max,Math.round(voltage/3.3*max)));
  this.pending={at:at+Math.ceil((samples[sampling]+(this.f4?this.sequence.bits:12.5))*divider),value};
 }
 tick(){
  if(this.pending&&!this.clocked()){this.pending=null;this.sequence=null;this.regularReturn=null;this.regularDisc=null;this.injectedDisc=null;return;}
  const queued=this.triggerQueue.splice(0);if(queued.some(q=>q!=='injected'))this.start(true);if(queued.includes('injected'))this.startInjected(false,this.r.count,true);
  while(this.pending?.at<=this.r.count){
   const {at,value}=this.pending,s=this.sequence,last=s.index===s.channels.length-1,sr=this.regs.get(this.base)||0;
   this.pending=null;const cr1=this.regs.get(this.base+4)||0,channel=s.channels[s.index];if((cr1&(1<<(s.injected?22:23)))&&(!(cr1&512)||(cr1&31)===channel)){const sample=value<<(12-s.bits),lo=(this.regs.get(this.base+40)||0)&4095,hi=(this.regs.get(this.base+36)??4095)&4095;if(sample<lo||sample>hi)this.regs.set(this.base,(this.regs.get(this.base)||0)|1);}
   if(s.injected){const corrected=value-((this.regs.get(this.base+20+s.index*4)||0)&4095);this.regs.set(this.base+60+s.index*4,(s.left?corrected<<(16-s.bits):corrected)&65535);if(last||s.disc){if(last)this.regs.set(this.base,(this.regs.get(this.base)||0)|4);else{s.index++;this.injectedDisc=s;}this.sequence=this.regularReturn;this.regularReturn=null;if(this.sequence)this.schedule(at);}else{s.index++;this.schedule(at);}continue;}
   this.regs.set(this.base+0x4c,s.left?value<<(16-s.bits):value);
   const dma=!!((this.regs.get(this.base+8)||0)&256);if(this.f4&&(s.eocs||dma)&&(sr&2)){this.regs.set(this.base,(this.regs.get(this.base)||0)|32);this.r.dma.pendingADC=false;this.sequence=null;return;}
   if(s.disc||s.eocs||last||dma)this.regs.set(this.base,(this.regs.get(this.base)||0)|2);if(dma&&!this.dmaStopped)this.r.dma.pendingADC=true;
   if(last){const continuous=!!((this.regs.get(this.base+8)||0)&2);s.index=0;if(cr1&1024){this.sequence=continuous?s:null;this.startInjected(true,at);continue;}if(!continuous){this.sequence=null;return;}}else {s.index++;if(s.disc&&!--s.remaining){this.regularDisc=s;this.sequence=null;return;}}
   this.schedule(at);
  }
 }
 externalTrigger(source,rising=true){const cr=this.regs.get(this.base+8)||0;if(!(cr&1)||!this.clocked())return;const edge=en=>en===3||en===(rising?1:2),select=this.f4?(cr>>>24)&15:(cr>>>17)&7,enable=this.f4?(cr>>>28)&3:cr&(1<<20)?1:0,expected=this.f4?select===15?'exti11':select>=3&&select<=5?'tim2_'+(select-1):null:select===6?'exti11':select===3?'tim2_1':null;if(edge(enable)&&source===expected)this.triggerQueue.push(source);const js=this.f4?(cr>>>16)&15:(cr>>>12)&7,je=this.f4?(cr>>>20)&3:cr&(1<<15)?1:0,jexpected=js===(this.f4?15:6)?'exti15':js===(this.f4?2:3)?'tim2_0':null;if(edge(je)&&source===jexpected)this.triggerQueue.push('injected');}

 dmaComplete(){if(this.f4&&!((this.regs.get(this.base+8)||0)&512))this.dmaStopped=true;}
 irq(){const cr1=this.regs.get(this.base+4)||0,sr=this.regs.get(this.base)||0;return this.clocked()&&!!((cr1&128)&&(sr&4)||(cr1&64)&&(sr&1)||(cr1&32)&&(sr&2)||this.f4&&(cr1&(1<<26))&&(sr&32));}
}
