// AN3156 functional system-memory service, NOT a copy of ST's proprietary ROM.
// F103 low/medium-density ROM has USART1 only (AN2606); DFU is F401/F411 only.
const le32=b=>(b[0]|b[1]<<8|b[2]<<16|b[3]<<24)>>>0;
export class STMDFU {
 constructor(r){this.r=r;this.reset();}
 reset(){this.address=0;this.configuration=0;this.pointer=0x08000000;this.state=2;this.status=0;this.stage='setup';this.data=[];this.pending=null;this.afterStatus=null;this.disconnected=false;}
 active(){return this.r.board.cpu==='cortex-m4f'&&this.r.system.bootMode==='system'&&!this.disconnected;}
 hostReset(){if(!this.active())return 'DISCONNECTED';this.reset();return 'ACK';}
 error(status=15){this.status=status;this.state=10;this.pending=null;return 'STALL';}
 region(a,n){if(!Number.isInteger(a)||!Number.isInteger(n)||n<0||a+n>0x100000000)return null;if(a>=0x08000000&&a+n<=0x08000000+this.r.board.flashSize)return 'flash';if(a>=0x20000000&&a+n<=0x20000000+this.r.board.ram)return 'ram';if(a>=0x1fffc000&&a+n<=0x1fffc010)return 'options';return null;}
 descriptor(type,index){if(type===1)return Uint8Array.from([18,1,0,2,0,0,0,64,0x83,4,0x11,0xdf,0,0x22,1,2,3,1]);if(type===2)return Uint8Array.from([9,2,27,0,1,1,0,0x80,50,9,4,0,0,0,0xfe,1,2,4,9,0x21,0x0b,0xff,0,0,8,0x1a,1]);if(type===0x21)return this.descriptor(2,0).slice(18);if(type!==3)return null;if(!index)return Uint8Array.from([4,3,9,4]);const strings={1:'Wirevo functional STM32 boot service',2:'STM32 BOOTLOADER',3:Array.from(this.r.flash.uid,b=>b.toString(16).padStart(2,'0')).join(''),4:'@Internal Flash /0x08000000/04*016Kg,01*064Kg,'+(this.r.board.flashSize===262144?'01':'03')+'*128Kg'};if(!strings[index])return null;return Uint8Array.from([strings[index].length*2+2,3,...Array.from(strings[index],c=>[c.charCodeAt(0),0]).flat()]);}
 input(bytes,length,after=null){this.data=[...bytes.slice(0,length)];this.zero=this.data.length<length&&this.data.length%64===0;this.stage='data-in';this.afterStatus=after;return 'ACK';}
 setup(bytes){const[type,request,lo,hi,il,ih,nl,nh]=bytes,value=lo|hi<<8,index=il|ih<<8,length=nl|nh<<8;this.stage='status-in';this.afterStatus=null;this.data=[];this.zero=false;
  if(type===0x80&&request===6){const d=this.descriptor(hi,lo);return d?this.input(d,length):'STALL';}
  if(type===0&&request===5&&value<128&&!length){this.afterStatus=()=>{this.address=value;};return 'ACK';}
  if(type===0&&request===9&&value<=1&&!length){this.afterStatus=()=>{this.configuration=value;};return 'ACK';}
  if(type===0x80&&request===8&&length===1)return this.input([this.configuration],length);
  if(type===0x80&&request===0&&length===2)return this.input([0,0],length);
  if(type===0x81&&request===10&&!value&&!index&&length===1)return this.input([0],1);
  if(type===1&&request===11&&!value&&!index&&!length)return 'ACK';
  if(!this.configuration||index||!([0x21,0xa1].includes(type)))return 'STALL';
  if(type===0xa1&&request===5&&!value&&length===1)return this.input([this.state],1);
  if(type===0xa1&&request===3&&!value&&length===6){if(this.state===3||this.state===6){const leave=this.state===6;this.state=leave?7:4;const pending=this.pending;return this.input([0,1,0,0,this.state,0],6,()=>{if(leave){this.disconnected=true;this.r.system.goAddress=this.pointer;this.r.system.requestReset(7);}else this.execute(pending);});}return this.input([this.status,0,0,0,this.state,0],6);}
  if(type===0x21&&request===4&&!value&&!length&&this.state===10){this.afterStatus=()=>{this.status=0;this.state=2;};return 'ACK';}
  if(type===0x21&&request===6&&!value&&!length&&[2,3,5,9].includes(this.state)){this.afterStatus=()=>{this.state=2;this.pending=null;};return 'ACK';}
  if(type===0x21&&request===1&&[2,5].includes(this.state)&&length<=2048&&value!==1){if(!length){this.state=6;return 'ACK';}this.download={block:value,length,bytes:[]};this.stage='data-out';return 'ACK';}
  if(type===0xa1&&request===2&&[2,9].includes(this.state)&&length<=2048&&value!==1){if(!value){this.state=9;return this.input([0,0x21,0x41,0x92],length);}if(this.r.flash.rdp())return this.error(11);const a=this.pointer+(value-2)*length;if(!this.region(a,length))return this.error(1);this.state=9;return this.input(this.r.readMemory(a,length),length);}
  return this.error();
 }
 execute(p){this.pending=null;if(!p){this.error();return;}const b=p.bytes,e=this.r.exports,flash=this.r.flash,addr=()=>le32(b.slice(1));try{
  if(!p.block&&b[0]===0x21&&b.length===5){if(!this.region(addr(),1)){this.error(1);return;}this.pointer=addr();}
  else if(!p.block&&b[0]===0x92&&b.length===1){if(flash.rdp()===2){this.error(11);return;}e.boot_wait(this.r.cpu);e.flash_protection_clear(this.r.cpu);if(flash.rdp())e.flash_erase(this.r.cpu,0,this.r.board.flashSize);flash.storedOPT=0x0fffaaec;e.boot_clear_ram(this.r.cpu);e.boot_wait(this.r.cpu);this.disconnected=true;this.r.system.requestReset(7);return;}
  else if(!p.block&&b[0]===0x41&&[1,5].includes(b.length)){if(flash.rdp()){this.error(11);return;}let start=0,n=this.r.board.flashSize;if(b.length===5){if(this.region(addr(),1)!=='flash'){this.error(1);return;}const off=addr()-0x08000000;for(let i=0;i<8;i++){const [s,l]=flash.sector(i);if(off>=s&&off<s+l){start=s;n=Math.min(l,this.r.board.flashSize-s);break;}}}e.boot_wait(this.r.cpu);e.flash_clear_status(this.r.cpu,255);const ok=e.flash_erase(this.r.cpu,start,n);if(!ok&&!(e.flash_status(this.r.cpu)&8)){this.error(4);return;}e.boot_wait(this.r.cpu);}
  else if(p.block>1){const a=this.pointer+(p.block-2)*b.length;if(flash.rdp()){this.error(11);return;}const region=this.region(a,b.length);if(!region||region==='options'&&(a!==0x1fffc000||b.length!==16)||region!=='options'&&b.length<2){this.error(1);return;}if(region==='options'){const opt=(b[0]|b[1]<<8|b[8]<<16|b[9]<<24)>>>0;flash.optionLocked=false;flash.write(flash.base+20,opt|2,4);this.disconnected=true;this.r.system.requestReset(7);return;}e.flash_clear_status(this.r.cpu,255);e.flash_program_width(this.r.cpu,1);try{for(let i=0;i<b.length;i++){e.boot_wait(this.r.cpu);if(!e.memory_write(this.r.cpu,a+i,b[i],1)){this.error(3);return;}}}finally{e.flash_program_width(this.r.cpu,0);}e.boot_wait(this.r.cpu);if(e.flash_status(this.r.cpu)&3){this.error(3);return;}}
  else{this.error();return;}this.state=5;this.status=0;
 }catch{this.error(14);}}
 hostOut(address,endpoint,bytes,setup=false){if(!this.active()||address!==this.address)return 'DISCONNECTED';if(endpoint||!(bytes instanceof Uint8Array)||bytes.length>64)return 'STALL';if(setup){if(bytes.length!==8)return 'STALL';return this.setup(bytes);}if(this.stage==='status-out'&&!bytes.length){this.stage='setup';const fn=this.afterStatus;this.afterStatus=null;fn?.();return 'ACK';}if(this.stage!=='data-out')return 'STALL';const d=this.download;if(!bytes.length||d.bytes.length+bytes.length>d.length)return this.error();d.bytes.push(...bytes);if(d.bytes.length===d.length){this.pending=d;this.state=3;this.stage='status-in';}else if(bytes.length<64)return this.error();return 'ACK';}
 hostIn(address,endpoint){if(!this.active()||address!==this.address)return {status:'DISCONNECTED'};if(endpoint)return {status:'STALL'};if(this.stage==='status-in'){this.stage='setup';const fn=this.afterStatus;this.afterStatus=null;fn?.();return {status:'ACK',data:new Uint8Array()};}if(this.stage!=='data-in')return {status:'NAK'};const data=Uint8Array.from(this.data.splice(0,64));if(!this.data.length){if(!data.length||!this.zero)this.stage='status-out';this.zero=false;}return {status:'ACK',data};}
}
export function installBootUSB(r){const usb=r.usb;Object.defineProperty(usb,'tokenACK',{configurable:true,get:()=>r.system.bootMode!=='system'||!!r.systemROM});for(const name of ['hostReset','hostOut','hostIn']){const normal=usb[name].bind(usb);usb[name]=(...args)=>r.system.bootMode==='system'&&!r.systemROM?r.system.dfu[name](...args):normal(...args);}}
