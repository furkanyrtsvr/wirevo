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
export {MCP2515} from './expansion-can.js';
