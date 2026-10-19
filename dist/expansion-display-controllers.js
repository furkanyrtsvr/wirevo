export class XPT2046 {
 constructor(){this.environment={x:2048,y:2048,pressed:false};this.reset();}
 reset(){this.tx=255;this.phase=0;this.samples=0;}
 select(){this.phase=0;this.tx=255;}
 deselect(){}
 setEnvironment(p){this.environment={x:p.x??2048,y:p.y??2048,pressed:!!p.pressed};}
 transfer(v){if(v&128){const ch=v>>4&7,e=this.environment;this.value=e.pressed?(ch===1?e.y:ch===5?e.x:ch===3?1200:ch===4?2800:0):0;this.phase=1;this.samples++;return this.tx=this.value>>5;}if(this.phase===1){this.phase=2;return this.tx=(this.value&31)<<3;}return this.tx=0;}
 drivers(){return this.environment.pressed?[{pin:'IRQ',voltage:0,ohms:50}]:[];}
 state(){return{...this.environment,samples:this.samples};}
}
export class EPaper {
 constructor(){this.ram=new Uint8Array(4736).fill(255);this.frame=this.ram.slice();this.reset();}
 reset(){this.tx=255;this.cmd=0;this.x=0;this.y=0;this.x0=0;this.x1=15;this.y0=0;this.y1=295;this.until=null;this.revision=0;this.writes=0;this.args=[];}
 select(){this.tx=255;}
 deselect(){}
 setPins(p){this.data=p.dc;if(p.reset===false&&!this.resetLow)this.reset();this.resetLow=p.reset===false;}
 transfer(v,c){if(this.resetLow)return this.tx=255;if(!this.data){this.cmd=v;this.args=[];if(v===0x12)this.reset();if(v===0x20)this.until=c+3200000;}else if(this.cmd===0x24){if(this.x>=0&&this.x<16&&this.y>=0&&this.y<296){this.ram[this.y*16+this.x]=v;this.writes++;}if(++this.x>this.x1){this.x=this.x0;if(++this.y>this.y1)this.y=this.y0;}}else{this.args.push(v);if(this.cmd===0x44&&this.args.length===2)[this.x0,this.x1]=this.args;if(this.cmd===0x45&&this.args.length===4){this.y0=this.args[0]+this.args[1]*256;this.y1=this.args[2]+this.args[3]*256;}if(this.cmd===0x4e)this.x=v;if(this.cmd===0x4f&&this.args.length===2)this.y=this.args[0]+v*256;}return this.tx=255;}
 tick(c){if(this.until!==null&&c>=this.until){this.frame=this.ram.slice();this.until=null;this.revision++;}}
 nextEvent(){return this.until;}
 drivers(v){return[{pin:'BUSY',voltage:this.until===null?0:v,ohms:50}];}
 state(){return{columns:128,rows:296,writes:this.writes,busy:this.until!==null,revision:this.revision,frame:Array.from(this.frame)};}
}
export class MCP2515 {
 constructor(){this.reset();}
 reset(){this.r=new Uint8Array(256);this.r[0x0e]=0x80;this.r[0x0f]=0x87;this.select();this.frames=0;}
 select(){this.tx=255;this.op=null;this.phase=0;this.addr=0;this.mask=0;}
 deselect(){}
 transmit(index){const base=0x30+index*16,dlc=this.r[base+5]&15;if((this.r[15]&0xe0)!==0x40){this.r[base]|=0x18;this.r[0x1c]=Math.min(255,this.r[0x1c]+8);this.r[0x2d]|=0x20;return;}this.r[base]&=~8;this.r[0x2c]|=4<<index;this.frames++;if((this.r[15]&0xe0)===0x40){const dest=this.r[0x2c]&1?0x70:0x60;this.r.set(this.r.slice(base+1,base+6+Math.min(8,dlc)),dest+1);this.r[0x2c]|=dest===0x60?1:2;}}
 transfer(v){if(this.op===null){this.op=v;this.phase=0;if(v===0xc0){this.reset();this.op=0xc0;}if((v&0xf8)===0x80)for(let i=0;i<3;i++)if(v&(1<<i))this.transmit(i);if(v===0xa0)return this.tx=((this.r[0x2c]&3)|((this.r[0x2c]&0x1c)<<1));return this.tx=255;}this.phase++;if(this.op===3){if(this.phase===1){this.addr=v;return this.tx=this.r[this.addr];}this.addr=(this.addr+1)&255;return this.tx=this.r[this.addr];}if(this.op===2){if(this.phase===1)this.addr=v;else{this.r[this.addr]=v;if(this.addr===15)this.r[14]=(this.r[14]&31)|(v&0xe0);if([0x30,0x40,0x50].includes(this.addr)&&v&8)this.transmit((this.addr-0x30)/16);this.addr=(this.addr+1)&255;}}if(this.op===5){if(this.phase===1)this.addr=v;else if(this.phase===2)this.mask=v;else{this.r[this.addr]=(this.r[this.addr]&~this.mask)|(v&this.mask);if(this.addr===15)this.r[14]=(this.r[14]&31)|(this.r[15]&0xe0);}}return this.tx=255;}
 drivers(){return this.r[0x2b]&this.r[0x2c]?[{pin:'INT',voltage:0,ohms:50}]:[];}
 state(){return{mode:this.r[14]>>5,frames:this.frames,interrupt:this.r[0x2c],loopback:(this.r[14]&0xe0)===0x40};}
}
