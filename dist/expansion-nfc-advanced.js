import {ClassicCard,crcA} from './expansion-classic-card.js';
const validCRC=b=>b.length>=2&&crcA(b.slice(0,-2)).every((v,i)=>v===b[b.length-2+i]);
export class MFRC522 {
 constructor(){this.tag=new ClassicCard();this.reset();}
 reset(){this.r=new Uint8Array(64);this.r[0x37]=0x92;this.fifo=[];this.select();this.tag.reset();this.pending=null;this.transactions=0;}
 setEnvironment(p){this.tag.setEnvironment(p);}
 select(){this.tx=255;this.address=null;}
 deselect(){}
 setPins(p){if(p.reset===false&&!this.resetLow)this.reset();this.resetLow=p.reset===false;}
 reg(a){return a===9?this.fifo[0]??0:a===10?this.fifo.length:a===8?(this.r[8]&~8)|(this.tag.auth?8:0):this.r[a];}
 put(a,v){if(a===9){if(this.fifo.length<64)this.fifo.push(v);else this.r[6]|=16;return;}if(a===10&&v&128){this.fifo=[];return;}if(a===4||a===5){this.r[a]&=~v;return;}this.r[a]=v;if(a===8&&!(v&8))this.tag.auth=null;if(a===1){this.r[6]=0;if(v===15)this.reset();if(v===3){const crc=crcA(this.fifo);this.r[34]=crc[0];this.r[33]=crc[1];this.r[5]|=4;}if(v===14){const b=this.fifo,ok=b.length===12&&this.tag.authenticate(b[0],b[1],b.slice(2,8),b.slice(8));this.r[8]=ok?8:0;this.r[6]=ok?0:1;this.r[4]=ok?16:1;}}if(a===13&&v&128&&this.r[1]===12)this.exchange();}
 exchange(){let b=this.fifo;this.fifo=[];this.r[6]=0;this.r[12]=0;const t=this.tag;let answer=[],nibble=false;if(!t.present||!(this.r[20]&3)){this.r[4]=1;return;}if(this.r[18]&128)b=[...b,...crcA(b)];const nak=()=>{answer=[4];nibble=true;};
 if(this.pending){const p=this.pending;this.pending=null;if(!validCRC(b)){this.r[6]|=4;answer=[5];nibble=true;}else if(p.op===0xa0){if(t.write(p.block,b.slice(0,-2))){answer=[10];nibble=true;}else nak();}else if(b.length===6&&t.adjust(p.op,p.block,(b[0]|b[1]<<8|b[2]<<16|b[3]<<24)|0)){/* value operand success is intentionally silent */}else nak();}
 else if(b[0]===0x26||b[0]===0x52){if(b[0]===0x52||!t.halted){t.reset();answer=[4,0];}}
 else if(!t.halted&&b[0]===0x93&&b[1]===0x20){const u=t.uid();answer=[...u,u.reduce((a,b)=>a^b,0)];}
 else if(!t.halted&&b[0]===0x93&&b[1]===0x70&&b.length===9&&validCRC(b)&&b.slice(2,6).every((v,i)=>v===t.uid()[i])&&b[6]===t.uid().reduce((a,b)=>a^b,0)){t.selected=true;answer=[8,...crcA([8])];}
 else if(!validCRC(b)){this.r[6]|=4;answer=[5];nibble=true;}
 else if(b[0]===0x50&&b[1]===0){t.halted=true;t.auth=null;}
 else if(b[0]===0x30){const data=t.read(b[1]);if(data)answer=[...data,...crcA(data)];else nak();}
 else if([0xa0,0xc0,0xc1,0xc2].includes(b[0])){const allowed=b[0]===0xa0?(b[1]&3)===3?!!t.auth:t.permission(b[1],1):t.permission(b[1],b[0]===0xc1?2:3);if(allowed&&b[1]>0&&b[1]<64){this.pending={op:b[0],block:b[1]};answer=[10];nibble=true;}else nak();}
 else if(b[0]===0xb0&&t.transfer(b[1])){answer=[10];nibble=true;}else nak();this.fifo=answer;this.r[12]=nibble?4:0;this.r[4]=answer.length?0x30:1;this.transactions++;}
 transfer(v){if(this.address===null){this.address=v>>1&63;this.reading=!!(v&128);return this.tx=this.reading?this.reg(this.address):255;}if(this.reading){if(this.address===9)this.fifo.shift();return this.tx=this.reg(this.address);}this.put(this.address,v);return this.tx=255;}
 drivers(){return this.r[2]&this.r[4]?[{pin:'IRQ',voltage:0,ohms:50}]:[];}
 state(){return{uid:this.tag.uid(),present:this.tag.present,authenticated:!!this.tag.auth,sector:this.tag.auth?.sector??null,transactions:this.transactions,fifoBytes:this.fifo.length,error:this.r[6]};}
}
export class PN532 {
 constructor(){this.tag=new ClassicCard();this.reset();}
 reset(){this.frames=[];this.buffer=[];this.index=0;this.commands=0;this.errors=0;this.sam=false;this.rf=true;this.target=false;this.registers=new Map();this.tag.reset();}
 setEnvironment(p){this.tag.setEnvironment(p);if(!this.tag.present)this.target=false;}
 begin(w){this.writing=w;this.index=0;if(w)this.buffer=[];}
 write(v){if(this.buffer.length>=512)return false;this.buffer.push(v);return true;}
 read(){if(this.index++===0)return this.frames.length?1:0;return this.frames[0]?.[this.index-2]??0;}
 exchange(args){const t=this.tag,op=args[1],block=args[2];if(args[0]!==1||!this.target)return[0x27];if(!t.present||!this.rf)return[1];if([0x60,0x61].includes(op))return[t.authenticate(op,block,args.slice(3,9),args.slice(9,13))?0:0x14];if(!t.auth||t.auth.sector!==(block>>2))return[0x14];if(op===0x30){const b=t.read(block);return b?[0,...b]:[0x10];}if(op===0xa0)return[t.write(block,args.slice(3))?0:0x10];if([0xc0,0xc1,0xc2].includes(op)){if(args.length!==7)return[0x10];return[t.adjust(op,block,(args[3]|args[4]<<8|args[5]<<16|args[6]<<24)|0)?0:0x10];}if(op===0xb0)return[t.transfer(block)?0:0x10];return[0x10];}
 command(cmd,args){if(cmd===0)return args[0]===0?args:[0];if(cmd===2)return[0x32,1,6,7];if(cmd===4)return[0,0,this.target?1:0,...(this.target?[1,0,0,0]:[]),this.sam?1:0];if(cmd===0x14){this.sam=true;return[];}if(cmd===0x32){if(args[0]===1){this.rf=!!(args[1]&1);if(!this.rf){this.target=false;this.tag.reset();}}return[];}if(cmd===6){const out=[];for(let i=0;i<args.length;i+=2)out.push(this.registers.get(args[i]*256+args[i+1])??0);return out;}if(cmd===8){for(let i=0;i<args.length;i+=3)this.registers.set(args[i]*256+args[i+1],args[i+2]);return[];}if(cmd===0x4a){this.target=!!(this.rf&&this.tag.present&&args[0]===1&&args[1]===0);if(this.target){this.tag.reset();this.tag.selected=true;}return this.target?[1,1,4,0,8,4,...this.tag.uid()]:[0];}if(cmd===0x40)return this.exchange(args);if(cmd===0x44||cmd===0x52){if(args[0]!==0&&args[0]!==1)return[0x27];this.target=false;this.tag.auth=null;return[0];}return[0x7f];}
 stop(){if(!this.writing){if(this.frames[0]&&this.index>=this.frames[0].length+1)this.frames.shift();return;}const b=this.buffer,at=b.findIndex((v,i)=>v===255&&i>=2&&b[i-1]===0&&b[i-2]===0);if(at<0){this.errors++;return;}let n=b[at+1],start=at+3;if(n===255&&b[at+2]===255){n=b[at+3]*256+b[at+4];if((b[at+3]+b[at+4]+b[at+5])%256){this.errors++;return;}start=at+6;}else if((n+b[at+2])%256){this.errors++;return;}const data=b.slice(start,start+n);if(n<2||n>265||data.length!==n||((data.reduce((a,b)=>a+b,0)+(b[start+n]??1))&255)||data[0]!==0xd4||b[start+n+1]!==0){this.errors++;return;}if(this.frames.length>=32){this.errors++;return;}const cmd=data[1],out=this.command(cmd,data.slice(2)),response=[0xd5,(cmd+1)&255,...out],length=response.length,header=length<255?[0,0,255,length,(-length)&255]:[0,0,255,255,255,length>>8,length&255,(-((length>>8)+(length&255)))&255];this.frames.push([0,0,255,0,255,0],[...header,...response,(-response.reduce((a,b)=>a+b,0))&255,0]);this.commands++;}
 drivers(){return this.frames.length?[{pin:'IRQ',voltage:0,ohms:50}]:[];}
 state(){return{uid:this.tag.uid(),present:this.tag.present,authenticated:!!this.tag.auth,sector:this.tag.auth?.sector??null,commands:this.commands,errors:this.errors,sam:this.sam,pendingFrames:this.frames.length};}
}
