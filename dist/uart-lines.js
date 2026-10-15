/** Cycle-scheduled asynchronous UART frames on canonical electrical nets. */
export class UARTReceiver {
 constructor(cpu,read,format,onFrame){Object.assign(this,{cpu,read,format,onFrame});this.high=true;this.epoch=0;this.busy=false;}
 observe(){const high=this.read();if(high===false&&this.high===true&&!this.busy)this.start();this.high=high;}
 start(){const f=this.format();if(!f||!(f.period>0)||(f.bits>8&&!(f.bits===9&&f.allow9))||f.bits<5)return;this.busy=true;const epoch=++this.epoch,start=this.cpu.cycles;let value=0,ones=0,error=null;
 const at=(symbols,fn)=>this.cpu.addClockEvent(()=>{if(epoch===this.epoch)fn();},Math.max(1,Math.round(symbols*f.period)));
 at(.5,()=>{if(this.read()!==false){this.cancel();}});
 for(let i=0;i<f.bits;i++)at(1.5+i,()=>{const high=this.read();if(high===null)error='floating';if(high){value|=1<<i;ones++;}});
 if(f.parity)at(1.5+f.bits,()=>{const expected=f.parity==='odd'?!(ones%2):!!(ones%2);if(this.read()!==expected)error='parity';});
 const stop=1+f.bits+(f.parity?1:0),rxStops=f.receiveStops??f.stops;for(let i=0;i<rxStops;i++)at(stop+.5+i,()=>{if(this.read()!==true)error='framing';});
 // Receive completes at the final stop-bit sample, before the next start edge.
 // Waiting until the full frame boundary can miss contiguous byte starts.
 at(stop+rxStops-.5,()=>{this.busy=false;this.onFrame({value,error,start,cycle:this.cpu.cycles,format:f});});
 }
 cancel(){this.epoch++;this.busy=false;this.high=this.read();}
}
export class UARTTransmitter {
 constructor(cpu,drive){this.cpu=cpu;this.drive=drive;this.queue=[];this.epoch=0;this.busy=false;}
 enqueue(value,f){if(this.queue.length>=16384)throw Error('UART giriş kuyruğu dolu.');this.queue.push({value,f:{...f}});this.pump();}
 pump(){if(this.busy||!this.queue.length)return;this.busy=true;const {value,f}=this.queue.shift(),bits=[false];let ones=0;for(let i=0;i<f.bits;i++){const bit=!!(value&(1<<i));bits.push(bit);ones+=bit?1:0;}if(f.parity)bits.push(f.parity==='odd'?!(ones%2):!!(ones%2));for(let i=0;i<f.stops;i++)bits.push(true);const epoch=this.epoch;this.drive(bits[0]);for(let i=1;i<bits.length;i++)this.cpu.addClockEvent(()=>{if(epoch===this.epoch)this.drive(bits[i]);},Math.round(i*f.period));this.cpu.addClockEvent(()=>{if(epoch!==this.epoch)return;this.drive(true);this.busy=false;this.pump();},Math.round(bits.length*f.period));}
 cancel(release=true){this.epoch++;this.queue=[];this.busy=false;if(release)this.drive(null);}
}
export const uartFormat=u=>({period:(u.UBRR+1)*u.multiplier,bits:u.bitsPerChar,stops:u.stopBits,parity:u.parityEnabled?(u.parityOdd?'odd':'even'):null});
