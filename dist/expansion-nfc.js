const uid=p=>[(p.uid??0xdeadbeef)>>>24,(p.uid??0xdeadbeef)>>>16&255,(p.uid??0xdeadbeef)>>>8&255,(p.uid??0xdeadbeef)&255];
export const crcA=bytes=>{let crc=0x6363;for(let v of bytes){v^=crc&255;v^=(v<<4)&255;crc=((crc>>8)^(v<<8)^(v<<3)^(v>>4))&65535;}return[crc&255,crc>>8];};
export class MFRC522 {
 constructor(){this.card=new Uint8Array(1024);this.environment={uid:0xdeadbeef,present:1};this.reset();}
 reset(){this.r=new Uint8Array(64);this.r[0x37]=0x92;this.fifo=[];this.select();this.authenticated=false;this.transactions=0;this.pendingWrite=null;}
 setEnvironment(p){this.environment={uid:p.uid??0xdeadbeef,present:p.present??1};}
 select(){this.tx=255;this.address=null;}
 deselect(){}
 setPins(p){if(p.reset===false&&!this.resetLow)this.reset();this.resetLow=p.reset===false;}
 reg(a){if(a===9)return this.fifo[0]??0;if(a===10)return this.fifo.length;return this.r[a];}
 put(a,v){if(a===9){if(this.fifo.length<64)this.fifo.push(v);return;}if(a===10&&v&128){this.fifo=[];return;}if(a===4||a===5){this.r[a]&=~v;return;}this.r[a]=v;if(a===1){if(v===15)this.reset();if(v===3){const c=crcA(this.fifo);this.r[0x22]=c[0];this.r[0x21]=c[1];this.r[5]|=4;}if(v===0x0e){this.authenticated=this.environment.present&&this.fifo.slice(2,8).every(v=>v===255);this.r[8]=this.authenticated?8:0;this.r[4]=0x10;}}if(a===13&&v&128&&this.r[1]===0x0c)this.exchange();}
 exchange(){const b=this.fifo;this.fifo=[];this.r[6]=0;this.r[12]=0;if(!this.environment.present||!(this.r[0x14]&3)){this.r[4]=1;return;}let answer=[];if(this.pendingWrite!==null){if(b.length>=16&&this.authenticated){this.card.set(b.slice(0,16),this.pendingWrite*16);answer=[10];this.r[12]=4;}this.pendingWrite=null;}else if(b[0]===0x26||b[0]===0x52){answer=[4,0];this.authenticated=false;}else if(b[0]===0x93&&b[1]===0x20){const u=uid(this.environment);answer=[...u,u.reduce((a,b)=>a^b,0)];}else if(b[0]===0x93&&b[1]===0x70)answer=[8,...crcA([8])];else if(b[0]===0x30&&this.authenticated&&b[1]<64){const data=Array.from(this.card.slice(b[1]*16,b[1]*16+16));answer=[...data,...crcA(data)];}else if(b[0]===0xa0&&this.authenticated&&b[1]<64){this.pendingWrite=b[1];answer=[10];this.r[12]=4;}else this.r[6]=1;this.fifo=answer;this.r[4]=answer.length?0x30:1;this.transactions++;}
 transfer(v){if(this.address===null){this.address=v>>1&63;this.reading=!!(v&128);return this.tx=this.reading?this.reg(this.address):255;}if(this.reading){if(this.address===9)this.fifo.shift();return this.tx=this.reg(this.address);}this.put(this.address,v);return this.tx=255;}
 drivers(){return this.r[2]&this.r[4]?[{pin:'IRQ',voltage:0,ohms:50}]:[];}
 state(){return{uid:uid(this.environment),present:!!this.environment.present,transactions:this.transactions,authenticated:this.authenticated,fifoBytes:this.fifo.length};}
}
export class PN532 {
 constructor(){this.card=new Uint8Array(1024);this.environment={uid:0xdeadbeef,present:1};this.reset();}
 reset(){this.frames=[];this.buffer=[];this.index=0;this.commands=0;this.sam=false;this.errors=0;}
 setEnvironment(p){this.environment={uid:p.uid??0xdeadbeef,present:p.present??1};}
 begin(write){this.writing=write;this.index=0;if(write)this.buffer=[];}
 write(v){if(this.buffer.length>=512)return false;this.buffer.push(v);return true;}
 read(){if(this.index++===0)return this.frames.length?1:0;return this.frames[0]?.[this.index-2]??0;}
 stop(){if(!this.writing){if(this.frames[0]&&this.index>=this.frames[0].length+1)this.frames.shift();return;}const b=this.buffer,at=b.findIndex((v,i)=>v===255&&i>=2&&b[i-1]===0&&b[i-2]===0);if(at<0||b[at+1]+b[at+2]!==256){this.errors++;return;}const n=b[at+1],data=b.slice(at+3,at+3+n);if(data.length!==n||((data.reduce((a,b)=>a+b,0)+(b[at+3+n]??1))&255)||data[0]!==0xd4){this.errors++;return;}const cmd=data[1],args=data.slice(2);let out=[];if(cmd===2)out=[0x32,1,6,7];else if(cmd===0x14){this.sam=true;out=[];}else if(cmd===0x4a)out=this.environment.present?[1,1,4,0,8,4,...uid(this.environment)]:[0];else if(cmd===0x40){if(!this.environment.present)out=[1];else if(args[1]===0x30&&args[2]<64)out=[0,...this.card.slice(args[2]*16,args[2]*16+16)];else if(args[1]===0xa0&&args[2]<64&&args.length>=19){this.card.set(args.slice(3,19),args[2]*16);out=[0];}else if([0x60,0x61].includes(args[1]))out=[0];else out=[0x7f];}else out=[0x7f];const response=[0xd5,(cmd+1)&255,...out],length=response.length;this.frames.push([0,0,255,0,255,0],[0,0,255,length,(-length)&255,...response,(-response.reduce((a,b)=>a+b,0))&255,0]);this.commands++;}
 drivers(){return this.frames.length?[{pin:'IRQ',voltage:0,ohms:50}]:[];}
 state(){return{uid:uid(this.environment),present:!!this.environment.present,commands:this.commands,errors:this.errors,sam:this.sam,pendingFrames:this.frames.length};}
}
