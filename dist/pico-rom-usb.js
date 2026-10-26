// USB buffer completion adapter for the original RP2040 ROM's double buffers.
// The normal application USB controller remains unchanged.
export function installROMUSB(usb){
 const view=usb.rp2040.usbDPRAMView,done=new Map(),pending=new Set(),generation=new Map();let which=0,abort=0,abortDone=0;
 const rd=usb.readUint32.bind(usb),wr=usb.writeUint32.bind(usb);
 function complete(ep,out,index){const bit=ep*2+(out?1:0),q=done.get(bit)||[];q.push(index);done.set(bit,q);if(q[0])which|=1<<bit;else which&=~(1<<bit);usb.indicateBufferReady(ep,out);}
 function cancel(ep,out){const bit=ep*2+(out?1:0);generation.set(bit,(generation.get(bit)||0)+1);done.delete(bit);which&=~(1<<bit);usb.buffStatus&=~(1<<bit);for(let i=0;i<2;i++)pending.delete(ep+':'+out+':'+i);if(out){usb.romReads?.delete(ep);usb.onROMCancelRead?.(ep);}usb.buffStatusUpdated();}
 usb.readUint32=off=>off===0x5c?which:off===0x60?abort:off===0x64?abortDone:rd(off);
 usb.writeUint32=(off,value)=>{if(off===0x60){abort=value;for(let bit=0;bit<32;bit++)if(value&(1<<bit)){cancel(bit>>1,!!(bit&1));abortDone|=1<<bit;}return;}if(off===0x64){abortDone&=~usb.rawWriteValue;return;}if(off===0x58){for(let bit=0;bit<32;bit++)if(usb.rawWriteValue&(1<<bit)){const q=done.get(bit);q?.shift();if(q?.[0])which|=1<<bit;else which&=~(1<<bit);}wr(off,value);for(const[bit,q]of done)if(q.length)usb.indicateBufferReady(bit>>1,!!(bit&1));}else wr(off,value);};
 usb.DPRAMUpdated=(offset,value)=>{
  if(offset<0x80||offset>0xfc)return;const ep=(offset-0x80)>>3,out=!!(offset&4),double=ep>0&&!!(usb.readEndpointControlReg(ep,out)&0x40000000),bit=ep*2+(out?1:0);if(value&4096){cancel(ep,out);value&=~4096;view.setUint32(offset,value,true);}const epoch=generation.get(bit)||0;
  for(let index=0;index<(double?2:1);index++){const shift=index*16,half=(value>>>shift)&65535,key=ep+':'+out+':'+index;if(!(half&1024)||pending.has(key))continue;const size=half&1023,buffer=usb.getEndpointBufferOffset(ep,out)+index*64;pending.add(key);
   if(out){if(!usb.romReads)usb.romReads=new Map();const q=usb.romReads.get(ep)||[];q.push({offset,index,size,buffer,key,epoch});usb.romReads.set(ep,q);if(q.length===1)usb.onEndpointRead?.(ep,size);}
   else{const data=usb.rp2040.usbDPRAM.slice(buffer,buffer+size);usb.rp2040.clock.createAlarm(()=>{if((generation.get(bit)||0)!==epoch)return;let control=view.getUint16(offset+index*2,true);view.setUint16(offset+index*2,control&~(1024|32768),true);pending.delete(key);complete(ep,false,index);usb.onEndpointWrite?.(ep,data);}).schedule(10000);}
  }
 };
 usb.endpointReadDone=(ep,data)=>{const request=usb.romReads?.get(ep)?.shift();if(!request)return;usb.rp2040.clock.createAlarm(()=>{const{offset,index,size,buffer,key,epoch}=request;if((generation.get(ep*2+1)||0)!==epoch)return;const n=Math.min(size,data.length),control=view.getUint16(offset+index*2,true);usb.rp2040.usbDPRAM.set(data.subarray(0,n),buffer);view.setUint16(offset+index*2,(control&~(1024|1023))|32768|n,true);pending.delete(key);complete(ep,true,index);}).schedule(10000);const next=usb.romReads?.get(ep)?.[0];if(next)usb.onEndpointRead?.(ep,next.size);};
}
