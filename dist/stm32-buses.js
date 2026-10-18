import {SPIUnit,I2SExtension} from './stm32-i2s.js';
import {STMI2C1 as I2C} from './stm32-i2c-modes.js';

class I2CUnit extends I2C {
 constructor(r,number){super(r);this.number=number;this.f4=r.board.cpu==='cortex-m4f';this.base=number===2?0x40005800:0x40005c00;}
 clocked(){return !!(this.r.regs.get(this.f4?0x40023840:0x4002101c)&(1<<(20+this.number)));}
 pins(){return this.number===2?{scl:['PB10'].find(p=>this.mapped(p)),sda:['PB11',...(this.f4?['PB3']:[]),...(this.r.board.family==='f411'?['PB9']:[])].find(p=>this.mapped(p))}:{scl:['PA8'].find(p=>this.mapped(p)),sda:['PC9',...(this.f4?['PB4']:[]),...(this.r.board.family==='f411'?['PB8']:[])].find(p=>this.mapped(p))};}
 mapped(pin){if(!pin||!this.r.board.gpio.includes(pin))return false;const n=+pin.slice(2),bank=pin.charCodeAt(1)-65,base=(this.f4?0x40020000:0x40010800)+bank*1024;if(this.f4){const af=['PB3','PB4','PB8','PB9'].includes(pin)?9:4;return !!(this.r.regs.get(0x40023830)&(1<<bank))&&((this.r.regs.get(base)>>>n*2)&3)===2&&!!(this.r.regs.get(base+4)&(1<<n))&&((this.r.regs.get(base+32+(n>=8?4:0))>>>((n%8)*4))&15)===af;}const c=(this.r.regs.get(base+(n<8?0:4))>>>((n%8)*4))&15;return !!(this.r.regs.get(0x40021018)&(1<<(bank+2)))&&!!(c&3)&&(c>>>2)===3;}
 outputs(states){super.outputs(states);for(const[kind,p]of Object.entries(this.pins()))if(states[p]?.mode?.startsWith('I2C1_'))states[p].mode='I2C'+this.number+'_'+kind.toUpperCase();return states;}
}
export class STMBuses {
 constructor(r){this.r=r;const f4=r.board.cpu==='cortex-m4f';this.spi=(f4?[2,3,4,...(r.board.family==='f411'?[5]:[])]:r.chip==='stm32f103c6'?[]:[2]).map(n=>new SPIUnit(r,n));this.extensions=f4?this.spi.filter(s=>[2,3].includes(s.number)).map(s=>new I2SExtension(r,s)):[];this.i2c=(f4?[2,3]:r.chip==='stm32f103c6'?[]:[2]).map(n=>new I2CUnit(r,n));}
 read(a,n){for(const u of [...this.spi,...this.extensions,...this.i2c]){const v=u.read(a,n);if(v!==undefined)return v;}}
 write(a,v,n){for(const u of [...this.spi,...this.extensions,...this.i2c])if(u.write(a,v,n))return true;return false;}
 tick(){for(const u of [...this.spi,...this.extensions,...this.i2c])u.tick();}
 outputs(states){for(const u of [...this.spi,...this.extensions,...this.i2c])u.outputs(states);return states;}
 irqExtra(){let mask=0;for(const u of [...this.spi,...this.extensions])if(u.irq())mask|=1<<({2:19,3:20,4:21,5:22}[u.number]);for(const u of this.i2c){const irq=u.irqMask(),shift=u.number===2?23:25;if(irq&32)mask|=1<<shift;if(irq&64)mask|=1<<(shift+1);}return mask;}
 resetBus(apb2,value){for(const [array,Kind]of [[this.spi,SPIUnit],[this.i2c,I2CUnit]])for(let i=0;i<array.length;i++){const u=array[i],spi=u instanceof SPIUnit,second=spi&&[1,4,5].includes(u.number),bit=spi?{1:12,2:14,3:15,4:13,5:20}[u.number]:20+u.number;if(second===apb2&&value&(1<<bit)){array[i]=new Kind(this.r,u.number);if(spi&&[2,3].includes(u.number)){const at=this.extensions.findIndex(e=>e.number===u.number);if(at>=0)this.extensions[at]=new I2SExtension(this.r,array[i]);}}}}
}
export {SPIUnit};
