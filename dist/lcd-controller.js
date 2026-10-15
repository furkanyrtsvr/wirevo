// HD44780 command/DDRAM/CGRAM through the common PCF8574 backpack mapping.
// P0 RS, P1 RW, P2 E, P3 backlight, P4..7 D4..7. Bus ACK is PCF8574's.
export class CharacterLCD {
 constructor(columns=8){this.columns=columns;this.reset();}
 reset(){this.ddram=new Uint8Array(128).fill(32);this.cgram=new Uint8Array(64);this.address=0;this.cg=false;this.fourBit=false;this.half=null;this.latch=255;this.readHalf=false;this.readByte=0;this.display=false;this.cursor=false;this.blink=false;this.increment=true;this.entryShift=false;this.shift=0;this.busyUntil=0;this.revision=(this.revision||0)+1;}
 begin(){return true;}
 stop(){}
 write(value,cycle=0){const previous=this.latch;this.latch=value&255;const rw=!!(value&2),rs=!!(value&1);if(!rw||((value^previous)&3))this.readHalf=false;
 if(!(previous&4)&&(value&4)&&rw&&!this.readHalf)this.readByte=rs?(this.cg?this.cgram[this.address&63]:this.ddram[this.address&127]):(cycle<this.busyUntil?128:0)|(this.address&127);
 if((previous&4)&&!(value&4)){if(rw){if(this.fourBit&&!this.readHalf)this.readHalf=true;else{this.readHalf=false;if(rs){this.move(this.increment?1:-1);this.busyUntil=cycle+592;}}}else if(cycle>=this.busyUntil){const nibble=value>>4;if(!this.fourBit)this.execute(nibble<<4,rs,cycle);else if(this.half===null)this.half={nibble,rs};else{const first=this.half;this.half=null;this.execute((first.nibble<<4)|nibble,first.rs,cycle);}}}return true;}
 execute(byte,data,cycle){this.revision++;this.busyUntil=cycle+Math.ceil(37e-6*16000000);if(data){(this.cg?this.cgram:this.ddram)[this.address&(this.cg?63:127)]=byte;this.move(this.increment?1:-1);if(this.entryShift)this.shift=(this.shift+(this.increment?1:39))%40;return;}
 if(byte&128){this.address=byte&127;this.cg=false;}else if(byte&64){this.address=byte&63;this.cg=true;}else if(byte&32){this.fourBit=!(byte&16);this.half=null;}else if(byte&16){if(byte&8)this.shift=(this.shift+(byte&4?39:1))%40;else this.move(byte&4?1:-1);}else if(byte&8){this.display=!!(byte&4);this.cursor=!!(byte&2);this.blink=!!(byte&1);}else if(byte&4){this.increment=!!(byte&2);this.entryShift=!!(byte&1);}else if(byte&2){this.address=0;this.cg=false;this.shift=0;this.busyUntil=cycle+24320;}else if(byte&1){this.ddram.fill(32);this.address=0;this.cg=false;this.shift=0;this.busyUntil=cycle+24320;}}
 move(direction){if(this.cg)this.address=(this.address+direction+64)%64;else if(direction>0)this.address=this.address===39?64:this.address===103?0:(this.address+1)&127;else this.address=this.address===64?39:this.address===0?103:(this.address-1)&127;}
 read(cycle=0){if(!(this.latch&2)||!(this.latch&4))return this.latch;const nibble=this.fourBit&&this.readHalf?this.readByte&15:this.readByte>>4;return(this.latch&15)|((nibble<<4)&this.latch&240);}
 state(cycle=0){const cells=Array.from({length:2},(_,row)=>Array.from({length:this.columns},(_,col)=>this.ddram[row*64+(col+this.shift)%40]));return{columns:this.columns,cells,cgram:Array.from(this.cgram),on:this.display,backlight:!!(this.latch&8),cursor:this.cursor,blink:this.blink,cursorAddress:this.address,shift:this.shift,revision:this.revision,busy:cycle<this.busyUntil};}
}
