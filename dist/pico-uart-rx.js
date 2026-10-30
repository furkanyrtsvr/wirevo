import {PicoUARTBitClock} from './pico-uart-bit-clock.js';
// PL011 RX: one stop-bit sample, fixed mark/space parity, one zero per break.
export class PicoUARTRX {
 constructor(clock,read,format,frame){Object.assign(this,{clock,read,format,frame});this.timer=new PicoUARTBitClock(clock);this.high=true;this.busy=false;this.waitMark=false;}
 observe(){const high=this.read();if(this.waitMark){if(high===true)this.waitMark=false;this.high=high;return;}if(high===false&&this.high===true&&!this.busy)this.start();this.high=high;}
 start(){const f=this.format();if(!f||!(f.cycles>0))return;this.busy=true;this.cycles=f.cycles;this.timer.start(f.period);let value=0,ones=0,flags=0,allLow=true;
  const sample=()=>{const h=this.read();if(h!==false)allLow=false;return h;};
  this.timer.at(.5,()=>{if(sample()!==false)this.cancel();});
  for(let i=0;i<f.bits;i++)this.timer.at(1.5+i,()=>{const h=sample();if(h===null)flags|=1;if(h===true){value|=1<<i;ones++;}});
  if(f.parity)this.timer.at(1.5+f.bits,()=>{const expected=f.parity==='mark'?true:f.parity==='space'?false:f.parity==='odd'?!(ones%2):!!(ones%2);if(sample()!==expected)flags|=2;});
  const stop=1+f.bits+(f.parity?1:0),deliver=()=>{this.busy=false;this.frame({value,flags,format:f});};
  this.timer.at(stop+.5,()=>{if(sample()!==true)flags|=1;
   if(allLow){this.timer.at(stop+f.stops,()=>{if(this.read()===false){flags|=5;this.waitMark=true;}deliver();});}else deliver();
  });
 }
 reclock(hz){if(this.busy)this.timer.setPeriod(hz>0?this.cycles*1e9/hz:Infinity);}
 cancel(){this.timer.cancel();this.busy=false;this.waitMark=false;this.high=this.read();}
}
