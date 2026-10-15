// Legacy STM32 CRC peripheral: fixed non-reflected 0x04c11db7, word input.
export class STMCRC {
 constructor(r){this.r=r;this.data=0xffffffff;this.id=0;}
 clocked(){return !!(this.r.regs.get(this.r.board.cpu==='cortex-m4f'?0x40023830:0x40021014)&(1<<(this.r.board.cpu==='cortex-m4f'?12:6)));}
 read(a,n){const aligned=a&~3;if(aligned<0x40023000||aligned>0x40023008)return undefined;const value=aligned===0x40023000?this.data:aligned===0x40023004?this.id:0;return n===4?value>>>0:(value>>>((a&3)*8))&(n===1?255:65535);}
 write(a,v,n){const aligned=a&~3;if(aligned<0x40023000||aligned>0x40023008)return false;if(!this.clocked())return true;if(aligned===0x40023000){if(n!==4||a!==aligned)throw Error('STM32 CRC DR word32bit yazım gerektirir.');let crc=(this.data^(v>>>0))>>>0;for(let i=0;i<32;i++)crc=((crc<<1)^((crc>>>31)?0x04c11db7:0))>>>0;this.data=crc;}else if(aligned===0x40023004){if(a===aligned)this.id=v&255;}else if(v&1)this.data=0xffffffff;return true;}
 reset(){this.data=0xffffffff;this.id=0;}
}
