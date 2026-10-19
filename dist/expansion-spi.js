// Byte-level chips driven by physical mode-0 GPIO clocks by expansion-runtime.
export class SPIFlash {
 constructor(){this.memory=new Map();this.reset();}
 reset(){this.wel=false;this.busyUntil=0;this.revision=0;this.select();}
 select(c=0){this.op=null;this.position=0;this.address=0;this.pending=[];this.tx=255;this.cycle=c;}
 get(a){return this.memory.get(a&0x3fffff)??255;}
 transfer(v,c){this.cycle=c;if(this.op===null){this.op=v;this.position=0;if(v===6&&c>=this.busyUntil)this.wel=true;if(v===4)this.wel=false;return this.tx=v===0x9f?0xef:v===5?this.status(c):255;}this.position++;if(this.op===0x9f)return this.tx=[0x40,0x16,0xff][(this.position-1)%3];if(this.op===5)return this.tx=this.status(c);if([3,0x0b,2,0x20,0xd8].includes(this.op)){if(this.position<=3){this.address=((this.address<<8)|v)&0x3fffff;this.page=this.address&~255;if(this.position===3&&this.op===3)return this.tx=this.get(this.address++);return this.tx=255;}if(this.op===0x0b&&this.position===4)return this.tx=this.get(this.address++);if([3,0x0b].includes(this.op))return this.tx=this.get(this.address++);if(this.op===2)this.pending.push([this.page|(this.address++&255),v]);}return this.tx=255;}
 status(c){return(c<this.busyUntil?1:0)|(this.wel?2:0);}
 deselect(c){if(!this.wel||c<this.busyUntil)return;if(this.op===2&&this.pending.length){for(const[a,v]of this.pending)this.memory.set(a,this.get(a)&v);this.busyUntil=c+11200;this.wel=false;this.revision++;}else if([0x20,0xd8,0xc7,0x60].includes(this.op)){const size=this.op===0x20?4096:this.op===0xd8?65536:4194304,start=this.address&~(size-1);for(const a of this.memory.keys())if(a>=start&&a<start+size)this.memory.delete(a);this.busyUntil=c+800000;this.wel=false;this.revision++;}}
 state(){return{kind:'W25Q32',bytes:4194304,writeEnabled:this.wel,busy:this.cycle<this.busyUntil,revision:this.revision,preview:Array.from({length:16},(_,i)=>this.get(i))};}
}
export class SDCard {
 constructor(){this.blocks=new Map();this.reset();}
 reset(){this.idle=true;this.app=false;this.initialized=false;this.writes=0;this.reads=0;this.select();}
 select(){this.command=[];this.queue=[];this.writing=null;this.tx=255;}
 block(n){if(this.blocks.has(n))return this.blocks.get(n);const b=new Uint8Array(512);if(n===0){b.set([0xeb,0x3c,0x90,0x57,0x49,0x52,0x45,0x56,0x4f,0x20,0,2,1,1,0,2,0,2,0,64,0xf8,64,0,32,0,64,0]);b.set([0x80,0,0x29,0x75,0,0,0],36);b.set(new TextEncoder().encode('WIREVO SD  FAT16   '),43);b[510]=0x55;b[511]=0xaa;}if(n===1||n===65)b.set([0xf8,0xff,0xff,0xff]);return b;}
 transfer(v){if(this.queue.length)return this.tx=this.queue.shift();if(this.writing){const w=this.writing;if(!w.started){if(v===0xfe)w.started=true;}else{w.data.push(v);if(w.data.length===514){if(w.block<16384){this.blocks.set(w.block,Uint8Array.from(w.data.slice(0,512)));this.writes++;this.queue=[5,0,0xff];}else this.queue=[0x0d];this.writing=null;}}return this.tx=255;}
 if(!this.command.length){if((v&0xc0)!==0x40)return this.tx=255;this.command=[v];return this.tx=255;}this.command.push(v);if(this.command.length<6)return this.tx=255;const b=this.command,cmd=b[0]&63,arg=(b[1]*16777216+b[2]*65536+b[3]*256+b[4])>>>0;this.command=[];let r=this.idle?1:0;
 if(cmd===0){this.idle=true;this.initialized=false;r=1;}else if(cmd===8)this.queue=[r,0,0,1,0xaa];else if(cmd===55){this.app=true;}else if(cmd===41&&this.app){this.app=false;this.idle=false;this.initialized=true;r=0;}else if(cmd===58)this.queue=[r,0x80,0xff,0x80,0];else if(cmd===16){if(arg!==512)r|=0x40;}else if(this.initialized&&cmd===17){const n=arg>>>9;if(n>=16384)r=0x20;else{this.reads++;this.queue=[0,0xff,0xfe,...this.block(n),0xff,0xff];}}else if(this.initialized&&cmd===24){this.writing={block:arg>>>9,data:[],started:false};}else if(this.initialized&&cmd===9){const csd=[0,0x26,0,0x32,0x5f,0x59,0,0xff,0xc0,0,0x80,0,0x0a,0x40,0,0xff];this.queue=[0,0xff,0xfe,...csd,0xff,0xff];}else if(cmd!==0&&cmd!==55&&cmd!==41&&cmd!==16)r|=4;
 if(!this.queue.length)this.queue=[r];return this.tx=255;}
 deselect(){}
 state(){return{kind:'SPI SDSC 8MiB FAT16',initialized:this.initialized,idle:this.idle,reads:this.reads,writes:this.writes,blockSize:512,blocks:16384};}
}
