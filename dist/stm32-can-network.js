import {STMCAN as Loopback} from './stm32-can.js';
import {canFrameBits} from './stm32-can-frame.js';
function arbitration(frame){const tir=frame[0]>>>0,extended=!!(tir&4),base=tir>>>21;return base*2097152+(extended?1572864+((tir>>>3)&262143)*2+(tir&2?1:0):(tir&2?1048576:0));}
export class CANBus {
 constructor(){this.nodes=new Set();this.active=null;this.frames=0;}
 attach(node){node.bus?.detach(node);this.nodes.add(node);node.bus=this;return node;}
 detach(node){if(this.active?.node===node)this.active=null;this.nodes.delete(node);if(node.bus===this)node.bus=null;}
 tick(now){
  if(this.active&&now>=this.active.at){const {node,job,frame,bit}=this.active;this.active=null;let ack=false;for(const other of this.nodes)if(other!==node&&other.running()&&Math.abs(other.bitTicks()-bit)<bit*.015){other.receive(frame);if(!(other.btr&0x80000000))ack=true;}if(ack){node.finish(job,2);node.tec=Math.max(0,node.tec-1);node.esr=node.tec<<16;node.frames++;this.frames++;}else{node.tec=Math.min(256,node.tec+8);node.esr=(3<<4)|(Math.min(255,node.tec)<<16)|(node.tec>=96?1:0)|(node.tec>=128?2:0)|(node.tec>=256?4:0);node.msr|=4;node.busOffAt=now;if(node.mcr&16)node.finish(job,8);else job.submitted=now;}}
  if(this.active)return;const contenders=[];for(const node of this.nodes)if(node.running()&&node.tec<256&&!(node.btr&0x80000000))for(const job of node.pending)if((job.submitted??0)<=now)contenders.push({node,job,frame:node.tx[job.i].slice()});if(!contenders.length)return;contenders.sort((a,b)=>(a.job.submitted??0)-(b.job.submitted??0)||arbitration(a.frame)-arbitration(b.frame));const first=contenders[0],bit=first.node.bitTicks(),same=contenders.filter(c=>(c.job.submitted??0)<=(first.job.submitted??0)+bit);same.sort((a,b)=>arbitration(a.frame)-arbitration(b.frame));const winner=same[0];for(const lost of same.slice(1)){if(lost.node.mcr&16)lost.node.finish(lost.job,4);else lost.job.submitted=now+bit;}
  if(now<(winner.job.submitted??0)+bit)return;const wire=canFrameBits(winner.frame);this.active={...winner,wire,bit,at:now+wire.length*bit};
 }
}
export class STMCAN extends Loopback {
 reset(){if(this.bus?.active?.node===this)this.bus.active=null;super.reset();}
 bitTicks(){const apb=this.r.system?.pclk1||this.r.board.hz/2,quanta=1+((this.btr>>>16)&15)+1+((this.btr>>>20)&7)+1;return this.r.board.hz/apb*((this.btr&1023)+1)*quanta;}
 finish(job,result){this.pending=this.pending.filter(j=>j!==job);this.tx[job.i][0]&=~1;this.tsr|=(1<<(26+job.i))|((1|result)<<(8*job.i));}
 tick(){if(!this.bus||this.btr&0x40000000)return super.tick();if(this.tec>=256&&this.mcr&64&&this.r.count-(this.busOffAt||0)>=128*11*this.bitTicks()){this.tec=0;this.esr=0;this.msr|=4;}this.bus.tick(this.r.count);}
 write(a,v,n=4){const normal=this.bus&&!(this.btr&0x40000000),result=super.write(a,v,n);if(normal)for(const job of this.pending)job.submitted??=this.r.count;return result;}
}
