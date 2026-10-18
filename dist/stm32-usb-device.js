// Explicit virtual peripheral for exercising MCU host firmware. It implements
// a USB control state machine and an EP1 vendor echo interface, not a PC device.
export class STMUSBDevice {
 constructor(){this.descriptor=Uint8Array.from([18,1,0,2,0,0,0,64,0xad,0xde,0x66,0,0,1,0,0,0,1]);this.configuration=Uint8Array.from([9,2,32,0,1,1,0,0x80,50,9,4,0,0,2,255,0,0,0,7,5,1,2,64,0,0,7,5,0x81,2,64,0,0]);this.hostReset();}
 hostReset(){this.address=0;this.configured=false;this.control=[];this.echo=[];this.stalled=new Set();this.pendingAddress=null;this.stage='setup';return 'ACK';}
 hostOut(address,endpoint,bytes,setup=false){if(address!==this.address)return 'DISCONNECTED';if(!(bytes instanceof Uint8Array)||bytes.length>64)return 'STALL';if(setup){if(endpoint||bytes.length!==8)return 'STALL';const[type,request,lo,hi,indexLo,indexHi,nLo,nHi]=bytes,value=lo|hi<<8,index=indexLo|indexHi<<8,length=nLo|nHi<<8;this.control=[];this.stage='status-in';this.pendingAddress=null;
   if(request===6&&type===128){const data=hi===1?this.descriptor:hi===2?this.configuration:null;if(!data)return 'STALL';this.control=[...data.slice(0,length)];this.stage='data-in';}
   else if(request===5&&type===0&&value<=127)this.pendingAddress=value;
   else if(request===9&&type===0&&value<=1)this.configured=!!value;
   else if(request===8&&type===128){this.control=[this.configured?1:0];this.stage='data-in';}
   else if(request===0&&type&128){this.control=[this.stalled.has(index)?1:0,0];this.stage='data-in';}
   else if((request===1||request===3)&&type===2&&value===0){if(request===3)this.stalled.add(index);else this.stalled.delete(index);}
   else return 'STALL';return 'ACK';
  }if(endpoint===0){if(!bytes.length&&this.stage==='status-out'){this.stage='setup';return 'ACK';}return 'STALL';}if(!this.configured||endpoint!==1)return 'NAK';if(this.stalled.has(endpoint))return 'STALL';if(this.echo.length+bytes.length>8192)return 'NAK';this.echo.push(...bytes);return 'ACK';}
 hostIn(address,endpoint){if(address!==this.address)return{status:'DISCONNECTED'};if(endpoint===0){if(this.stage==='status-in'){if(this.pendingAddress!==null)this.address=this.pendingAddress;this.stage='setup';return{status:'ACK',data:new Uint8Array()};}if(this.stage!=='data-in')return{status:'NAK'};const data=Uint8Array.from(this.control.splice(0,64));if(!this.control.length)this.stage='status-out';return{status:'ACK',data};}if(!this.configured||endpoint!==1)return{status:'NAK'};if(this.stalled.has(128|endpoint))return{status:'STALL'};if(!this.echo.length)return{status:'NAK'};return{status:'ACK',data:Uint8Array.from(this.echo.splice(0,64))};}
}
