const TRIM=[27504,26435,-1000,36477,-10685,3024,2855,140,-7,15500,-14600,6000];
const u16=(bytes,n)=>bytes[n]|bytes[n+1]<<8;
export function compensateBMP(rawT,rawP,trim=TRIM){const[t1,t2,t3,p1,p2,p3,p4,p5,p6,p7,p8,p9]=trim,v1=(rawT/16384-t1/1024)*t2,v2=(rawT/131072-t1/8192)**2*t3,fine=v1+v2;let a=fine/2-64000,b=a*a*p6/32768+a*p5*2;b=b/4+p4*65536;a=(p3*a*a/524288+p2*a)/524288;a=(1+a/32768)*p1;let pressure=1048576-rawP;pressure=(pressure-b/4096)*6250/a;pressure+=(p9*pressure*pressure/2147483648+pressure*p8/32768+p7)/16;return{temperature:fine/5120,pressure};}
const invert=(target,fn,increasing)=>{let low=0,high=1048575;for(let n=0;n<21;n++){const mid=(low+high)>>1;if((fn(mid)<target)===increasing)low=mid+1;else high=mid;}return Math.max(0,Math.min(1048575,low));};
export class BMP280 {
 constructor(){this.environment={temperature:25,pressure:1013.25};this.reset();}
 reset(){this.registers=new Uint8Array(256);this.registers[0xd0]=0x58;for(let i=0;i<TRIM.length;i++){this.registers[0x88+2*i]=TRIM[i]&255;this.registers[0x89+2*i]=(TRIM[i]>>8)&255;}this.pointer=0;this.expectsPointer=true;this.pending=0;this.measuring=false;this.rawT=0x80000;this.rawP=0x80000;this.revision=(this.revision||0)+1;this.writeRaw();}
 setEnvironment(params={}){const temperature=params.temperature??25,pressure=params.pressure??1013.25;if(temperature===this.environment.temperature&&pressure===this.environment.pressure&&this.targetT!==undefined)return;this.environment={temperature,pressure};this.targetT=invert(temperature,t=>compensateBMP(t,415148).temperature,true);this.targetP=invert(pressure*100,p=>compensateBMP(this.targetT,p).pressure,false);}
 writeRaw(){for(const[address,value]of [[0xfa,this.rawT],[0xf7,this.rawP]]){this.registers[address]=value>>12;this.registers[address+1]=value>>4;this.registers[address+2]=(value&15)<<4;}}
 begin(write,cycle=0){this.tick(cycle);this.expectsPointer=write;this.readSnapshot=write?null:this.registers.slice();return true;}
 ready(){return true;}
 write(value,cycle=0){if(this.expectsPointer){this.pointer=value;this.expectsPointer=false;return true;}this.writeRegister(this.pointer++,value,cycle);this.pointer&=255;return true;}
 writeRegister(address,value,cycle=0){if(address===0xe0&&value===0xb6){this.reset();this.registers[0xf3]=1;this.pending=cycle+48000;return;}if(address===0xf4){this.registers[address]=value;if(value&3)this.start(cycle);}else if(address===0xf5&&!(this.registers[0xf4]&3))this.registers[address]=value&0xfc;}
 start(cycle){const c=this.registers[0xf4],os=n=>n?2**Math.min(n-1,4):0,t=os(c>>5),p=os((c>>2)&7),ms=1.25+2.3*t+(p?2.3*p+.575:0);this.pending=cycle+Math.ceil(ms*16000);this.measuring=true;this.registers[0xf3]|=8;}
 tick(cycle){if(!this.pending||cycle<this.pending)return;if(this.registers[0xf3]&1){this.registers[0xf3]&=~1;this.pending=0;return;}if(this.measuring){const c=this.registers[0xf4];this.setEnvironment(this.environment);this.rawT=c>>5?this.targetT:0x80000;this.rawP=(c>>2)&7?this.targetP:0x80000;this.writeRaw();this.revision++;this.measuring=false;this.registers[0xf3]&=~8;if((c&3)===3){const standby=[.5,62.5,125,250,500,1000,2000,4000][this.registers[0xf5]>>5];this.pending=cycle+standby*16000;}else{this.registers[0xf4]&=~3;this.pending=0;}}else if((this.registers[0xf4]&3)===3)this.start(cycle);}
 read(){const data=this.readSnapshot||this.registers;return data[this.pointer++&255];}
 stop(){}
 state(cycle=0){this.tick(cycle);return{temperature:this.environment.temperature,pressure:this.environment.pressure,rawT:this.rawT,rawP:this.rawP,mode:this.registers[0xf4]&3,measuring:this.measuring,revision:this.revision};}
}
