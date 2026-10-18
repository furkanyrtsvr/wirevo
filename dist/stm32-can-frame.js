// Bosch CAN 2.0B serialization, MSB first. CRC-15 polynomial 0x4599.
// Stuff SOF through CRC sequence, not delimiters, ACK, EOF or intermission.
export function canFrameBits(frame,ack=true){
 const tir=frame[0]>>>0,extended=!!(tir&4),remote=!!(tir&2),bits=[0],put=(value,n)=>{for(let i=n-1;i>=0;i--)bits.push(value>>>i&1);};
 if(extended){const id=tir>>>3;put(id>>>18,11);bits.push(1,1);put(id&0x3ffff,18);bits.push(remote?1:0,0,0);}else{put(tir>>>21,11);bits.push(remote?1:0,0,0);}
 const dlc=frame[1]&15;put(dlc,4);if(!remote)for(let i=0;i<Math.min(dlc,8);i++)put(frame[2+(i>>>2)]>>>((i&3)*8)&255,8);
 let crc=0;for(const bit of bits){const feedback=((crc>>>14)&1)^bit;crc=(crc<<1)&0x7fff;if(feedback)crc^=0x4599;}put(crc,15);
 const wire=[];let last=-1,run=0,stuffed=0;for(const bit of bits){wire.push(bit);run=bit===last?run+1:1;last=bit;if(run===5){wire.push(bit^1);stuffed++;last=bit^1;run=1;}}
 wire.push(1,ack?0:1,1,...Array(10).fill(1));return {bits:Uint8Array.from(wire),crc,stuffed,length:wire.length};
}
