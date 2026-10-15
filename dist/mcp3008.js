// DS21295D §5: D0 rise to following falling edge, 1.5 clocks before null bit.
export class MCP3008 {
 constructor(){this.reset();}
 select(){const saved={samples:this.samples||0,code:this.code,valid:this.valid,held:this.held,sourceOhms:this.sourceOhms,reference:this.reference,acquisitionCycles:this.acquisitionCycles,acquisitionErrorLSB:this.acquisitionErrorLSB,frequency:this.frequency,timingError:this.timingError};this.reset();Object.assign(this,saved);}
 reset(){this.count=0;this.command=0;this.code=0;this.channel=0;this.single=true;this.samples=0;this.valid=false;this.output=null;this.held=0;this.acquiring=false;this.frequency=null;this.timingError=null;this.acquisitionErrorLSB=0;this.lastRise=null;this.transferTimingError=null;this.sourceOhms=undefined;}
 acquire(sample,cycle){
  const input=sample(this.channel,this.single);this.input=input;
  if(!input||!Number.isFinite(input.voltage)||!Number.isFinite(input.ohms)||input.ohms<0||!(input.reference>0)){this.valid=false;this.sourceOhms=undefined;return;}
  const dt=Math.max(0,cycle-this.sampleCycle)/16000000,tau=(input.ohms+1000)*20e-12;
  this.held=input.voltage+(this.held-input.voltage)*Math.exp(-dt/tau);this.sampleCycle=cycle;this.sourceOhms=input.ohms;this.reference=input.reference;this.valid=true;
 }
 rise(high,sample,cycle=0,supply=5){
  if(this.lastRise!==null){const period=cycle-this.lastRise;if(period>0){this.frequency=16000000/period;const max=supply>=5?3600000:1350000;this.transferTimingError ||= this.frequency>max?'clock-too-fast':this.frequency<10000?'clock-too-slow':null;this.timingError=this.transferTimingError;}}
  this.lastRise=cycle;
  if(!this.count){if(high)this.count=1;return;}this.count++;
  if(this.count<=5)this.command=(this.command<<1)|(high?1:0);
  if(this.count===5){this.single=!!(this.command&8);this.channel=this.command&7;this.acquiring=true;this.sampleCycle=cycle;this.sampleStart=cycle;this.valid=false;}
  else if(this.acquiring)this.acquire(sample,cycle);
 }
 fall(sample,cycle=0){
  if(this.acquiring&&sample)this.acquire(sample,cycle);
  if(this.count===6&&this.acquiring){this.acquiring=false;this.acquisitionCycles=cycle-this.sampleStart;this.samples++;this.valid&&=!this.timingError;this.acquisitionErrorLSB=this.valid?Math.abs(this.input.voltage-this.held)/this.reference*1024:null;this.code=this.valid?Math.max(0,Math.min(1023,Math.floor(this.held/this.reference*1024))):0;}
  if(this.count<6)this.output=null;else if(this.count===6)this.output=0;else if(this.count<=16)this.output=(this.code>>(16-this.count))&1;else if(this.count<=25)this.output=(this.code>>(this.count-16))&1;else this.output=0;return this.output;
 }
 state(){return{channel:this.channel,code:this.valid?this.code:null,single:this.single,samples:this.samples,acquiring:this.acquiring,heldVoltage:this.held,sourceOhms:this.sourceOhms,acquisitionCycles:this.acquisitionCycles,acquisitionErrorLSB:this.acquisitionErrorLSB,frequency:this.frequency,timingError:this.timingError,sourceSupported:this.sourceOhms!==undefined};}
}
