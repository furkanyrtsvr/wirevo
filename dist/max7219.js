export const CODE_B=[0x7e,0x30,0x6d,0x79,0x33,0x5b,0x5f,0x70,0x7f,0x7b,0x01,0x4f,0x37,0x0e,0x67,0];
export class MAX7219 {
 constructor(){this.reset();}
 reset(){this.registers=new Uint8Array(16);this.shift=0;this.bits=0;this.words=0;this.revision=(this.revision||0)+1;}
 clock(high){this.shift=((this.shift<<1)|(high?1:0))&65535;this.bits++;}
 fall(){return (this.shift>>15)&1;}
 load(){if(this.bits<16)return false;const address=(this.shift>>8)&15,value=this.shift&255;this.words++;if(address>=1&&address<=12||address===15){this.registers[address]=value;this.revision++;}return true;}
 frame(){const r=this.registers;if(r[15]&1)return new Uint8Array(8).fill(255);if(!(r[12]&1))return new Uint8Array(8);return Uint8Array.from({length:8},(_,i)=>i>(r[11]&7)?0:(r[9]&(1<<i))?(r[i+1]&128)|CODE_B[r[i+1]&15]:r[i+1]);}
 state(){return{frame:this.frame(),on:!!(this.registers[12]&1),test:!!(this.registers[15]&1),intensity:this.registers[10]&15,scanLimit:this.registers[11]&7,decode:this.registers[9],words:this.words,bits:this.bits,revision:this.revision};}
}
