import {STMFlash as BaseFlash} from './stm32-flash.js';

// PM0075 / RM0368 / RM0383: nonvolatile options are latched on reset.
export class STMFlash extends BaseFlash {
 constructor(r){super(r);this.storedOPT=0x0fffaaec;this.permanentRDP=false;this.systemReset();}
 systemReset(){super.systemReset();this.activeOption=this.option.slice();this.activeOPT=this.storedOPT??0x0fffaaec;this.optcr=this.activeOPT|1;this.localStatus=0;this.keyFailed=false;this.optKeyFailed=false;}
 rdp(){return this.f4?this.permanentRDP?2:((this.activeOPT>>>8)&255)===0xaa?0:1:this.activeOption[0]===0xa5?0:1;}
 user(){return this.f4?(this.activeOPT>>>5)&7:this.activeOption[2]&7;}
 writeMask(){const o=this.activeOption;return this.f4?(this.activeOPT>>>16)&0xfff:(o[8]|o[10]<<8|o[12]<<16|o[14]<<24)>>>0;}
 applyProtection(){const e=this.r.exports;if(!this.r.cpu||!e.flash_protection_clear)return;e.flash_protection_clear(this.r.cpu);const mask=this.writeMask();for(let i=0;i<(this.f4?8:32);i++)if(!(mask&(1<<i))){const [a,n]=this.f4?this.sector(i):[i*4096,4096];if(a<this.r.board.flashSize)e.flash_protect(this.r.cpu,a,Math.min(n,this.r.board.flashSize-a));}e.flash_program_width(this.r.cpu,0);if(!(this.user()&1))this.r.watchdogs.write(0x40003000,0xcccc,4);}
 status(){const s=this.rawStatus();return super.status()|(this.localStatus||0)|(s&8?16:0);}
 clearStatus(v){super.clearStatus(v);this.localStatus&=~v;if(v&16)this.r.exports.flash_clear_status(this.r.cpu,8);}
 read(a,n=4){const x=a&~3;let v;if(x===this.base+16&&!this.f4)v=this.cr|(!this.optionLocked?512:0);else if(!this.f4&&x===this.base+28){const o=this.activeOption;let bad=0;for(let i=0;i<16;i+=2)if((o[i]^o[i+1])!==255&&!(o[i]===255&&o[i+1]===255))bad=1;v=bad|(this.rdp()?2:0)|(o[2]<<2)|(o[4]<<10)|(o[6]<<18);}else if(!this.f4&&x===this.base+32)v=this.writeMask();else return super.read(a,n);return n===4?v>>>0:(v>>>((a&3)*8))&(n===1?255:65535);}
 unlock(v,option=false){v>>>=0;const field=option?'optKeyStage':'keyStage',failed=option?'optKeyFailed':'keyFailed',first=option&&this.f4?0x08192a3b:0x45670123,second=option&&this.f4?0x4c5d6e7f:0xcdef89ab;if(this[failed]||option&&this.permanentRDP)return;if(!this[field]&&v===first)this[field]=1;else if(this[field]===1&&v===second){this[field]=0;if(option){this.optionLocked=false;this.optcr&=~1;}else{this.locked=false;this.cr&=~(this.f4?0x80000000:128);}}else{this[field]=0;this[failed]=true;}}
 unprotectErase(){this.r.exports.flash_protection_clear(this.r.cpu);this.r.exports.flash_erase(this.r.cpu,0,this.r.board.flashSize);this.applyProtection();}
 eraseF1(){if(this.locked)return;if(this.cr&32){if(this.optionLocked){this.localStatus|=16;return;}this.option.fill(255);this.localStatus|=32;}else super.eraseF1();this.cr&=~64;}
 eraseF4(){super.eraseF4();this.cr&=~65536;}
 writeOption(a,v,n){if(this.f4||a<0x1ffff800||a+n>0x1ffff810)return false;if(this.locked||this.optionLocked||!(this.cr&16)){this.localStatus|=16;return true;}const i=a-0x1ffff800;if(n!==2||i%2||this.option[i]!==255||this.option[i+1]!==255){this.localStatus|=4;return true;}this.option[i]=v&255;this.option[i+1]=(v&255)^255;this.localStatus|=32;if(i===0&&this.rdp()&&(v&255)===0xa5)this.unprotectErase();return true;}
 write(a,v,n=4){const x=a&~3;if(this.f4&&x===this.base+20){if(n!==4||a!==x)throw Error('FLASH_OPTCR yazımı hizalı32bit olmalı.');if(this.optionLocked)return true;this.optcr=(v&~2)>>>0;if(v&2){const old=(this.storedOPT>>>8)&255,next=(v>>>8)&255;this.storedOPT=(v&~3)>>>0;if(old!==0xaa&&next===0xaa)this.unprotectErase();if(next===0xcc)this.permanentRDP=true;this.localStatus|=1;}if(v&1)this.optionLocked=true;return true;}if(!this.f4&&x===this.base+16){if(this.locked&&!(v&128))return true;if(!(v&512))this.optionLocked=true;}return super.write(a,v,n);}
}
