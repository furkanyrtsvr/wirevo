// ROM-independent reset-wrapper and SRAM bank-control registers used by cyw43_ll.c.
// This does not execute the ARMCM3 or infer undocumented SRAM geometry/OTP values.
export class CYW43Backplane {
 constructor(chip){this.chip=chip;this.reset();}
 reset(){this.cores=new Map([0x18102000,0x18103000,0x18104000].map(base=>[base,{ioctrl:1,reset:base===0x18103000?1:0}]));this.bank=0;this.pda=new Map();}
 read32(address){for(const[base,c]of this.cores){if(address===base+0x408)return c.ioctrl;if(address===base+0x800)return c.reset;}if(address===0x18004010)return this.bank;if(address===0x18004044)return this.pda.get(this.bank)||0;return null;}
 write32(address,value){for(const[base,c]of this.cores){if(address===base+0x408){c.ioctrl=value;return true;}if(address===base+0x800){c.reset=value&1;return true;}}if(address===0x18004010){this.bank=value;return true;}if(address===0x18004044){this.pda.set(this.bank,value);return true;}return false;}
 readByte(address){const n=this.read32((address&~3)>>>0);return n===null?null:n>>>((address&3)*8)&255;}
 writeByte(address,value){const a=(address&~3)>>>0,prior=this.read32(a);if(prior===null)return false;const shift=(address&3)*8;return this.write32(a,((prior&~(255<<shift))|(value<<shift))>>>0);}
 snapshot(){return{cores:[...this.cores].map(([base,c])=>({base,clockEnabled:!!(c.ioctrl&1),reset:!!c.reset,halted:!!(c.ioctrl&0x20)||!!c.reset})),selectedSRAMBank:this.bank,bankPowerControls:Object.fromEntries(this.pda),cpuExecuting:false};}
}
