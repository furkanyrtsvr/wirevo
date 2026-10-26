// ROM-profile ARMv8-M inter-state branches and APSR_nzcvqg.
// This supplies the boot ROM path, not full SAU/MPU/secure interrupt isolation.
export function installM33ROM(core){
 const regs=core.regs,chip=core.chip,fields=['msp','psp','msplim','psplim','primask','basepri','faultmask','control'],saved={},execute=core.executeInstruction.bind(core);const stats={bxns:0,sg:0,apsr:0};
 function change(secure){if(core.secure===secure)return;regs.syncSpToBanked();if(secure){for(const f of fields){regs[f+'_ns']=regs[f];regs[f]=saved[f]||0;}}else{for(const f of fields){saved[f]=regs[f];regs[f]=regs[f+'_ns'];}}core.secure=secure;regs.syncSpFromBanked();}
 core.executeInstruction=()=>{if(core.waiting||regs.itState)return execute();const pc=core.PC,op=chip.readUint16(pc),op2=chip.readUint16(pc+2);
  if((op&0xfff0)===0xf380&&op2===0x8c00){regs.xpsr=(regs.xpsr&~0xf80f0000)|(regs.r[op&15]&0xf80f0000);core.PC=pc+4;core.cycles++;stats.apsr++;return;}
  if((op&0xff87)===0x4704){if(!core.secure)throw Error('BXNS yalnız Secure durumda kullanılabilir.');const rm=(op>>>3)&15;if(rm===13||rm===15)throw Error('ROM BXNS register biçimi desteklenmiyor.');const target=regs.r[rm];if(target>=0xfeffffff)throw Error('ROM özel güvenlik dönüşü desteklenmiyor.');if(!(target&1))change(false);core.PC=target&~1;core.cycles+=2;stats.bxns++;return;}
  if(op===0xe97f&&op2===0xe97f&&!core.secure){change(true);regs.lr&=~1;stats.sg++;}execute();
 };return{stats};
}
