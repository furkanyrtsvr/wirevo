// Titan TM1637 V2.4: LSB-first two-wire commands, not I²C.
export class TM1637 {
 constructor(){this.reset();}
 reset(){this.ram=new Uint8Array(6);this.on=false;this.intensity=0;this.auto=true;this.address=0;this.words=0;this.mode='write';}
 start(){this.first=true;}
 byte(b){this.words++;if(this.first){this.first=false;if((b&0xc0)===0x40){this.auto=!(b&4);this.mode=b&2?'read':'write';}else if((b&0xf0)===0xc0){this.address=b&15;this.mode='ram';}else if((b&0xf0)===0x80){this.on=!!(b&8);this.intensity=b&7;this.mode='write';}}else if(this.mode==='ram'){if(this.address<6)this.ram[this.address]=b;if(this.auto)this.address++;}}
 state(){return{frame:this.on?Array.from(this.ram):Array(6).fill(0),ram:Array.from(this.ram),on:this.on,intensity:this.intensity,words:this.words,duty:[1,2,4,10,11,12,13,14][this.intensity]/16};}
}
