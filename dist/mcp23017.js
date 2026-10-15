// MCP23017 revision E: A7/B7 output-only. 16 output / 14 input model.
export class MCP23017{
 constructor({inputMask=127}={}){this.inputMask=inputMask;this.reset();}
 reset(){this.reg=Array.from({length:11},()=>[0,0]);this.reg[0]=[255,255];this.iocon=0;this.pointer=0;this.first=true;this.inputs=[0,0];this.unknown=[this.inputMask,this.inputMask];this.previous=[0,0];this.flags=[0,0];this.capture=[0,0];this.lastGPIO=[0,0];this.revision=0;}
 map(a){if(this.iocon&128){const port=(a&16)?1:0,index=a&15;return index<=10?[index,port]:null;}return a<=21?[a>>1,a&1]:null;}
 advance(){if(this.iocon&32){if(!(this.iocon&128))this.pointer^=1;}else if(this.iocon&128)this.pointer=this.pointer>=0x1a?0:this.pointer+1;else this.pointer=(this.pointer+1)%22;}
 raw(port){const dir=this.reg[0][port];return ((this.inputs[port]&~this.unknown[port])|(this.reg[10][port]&this.unknown[port]&~dir))&~(dir&~this.inputMask)&255;}
 gpio(port){return this.raw(port)^(this.reg[1][port]&this.reg[0][port]&this.inputMask);}
 inputLevels(values){for(let p=0;p<2;p++){let bits=0,unknown=0;for(let i=0;i<8;i++){const v=values[p*8+i];if(v===null)unknown|=1<<i;else if(v)bits|=1<<i;}this.inputs[p]=bits;this.unknown[p]=unknown;const now=this.raw(p),enabled=this.reg[2][p]&this.reg[0][p]&this.inputMask&~unknown,ref=(this.previous[p]&~this.reg[4][p])|(this.reg[3][p]&this.reg[4][p]),changed=(now^ref)&enabled;if(changed){if(!this.flags[p])this.capture[p]=now;this.flags[p]|=changed;}this.previous[p]=now;this.lastGPIO[p]=now;}}
 begin(write){this.first=write;}
 write(b){if(this.first){this.pointer=b&31;this.first=false;return true;}const map=this.map(this.pointer);if(map){const [k,p]=map;if(k===5)this.iocon=b&0xfe;else if(k===9||k===10)this.reg[10][p]=b;else if(k<7)this.reg[k][p]=b;this.revision++;}this.advance();return true;}
 read(){const map=this.map(this.pointer);let v=0;if(map){const[k,p]=map;if(k===5)v=this.iocon;else if(k===7)v=this.flags[p];else if(k===8){v=this.capture[p];this.flags[p]=0;}else if(k===9){v=this.gpio(p);this.flags[p]=0;}else v=this.reg[k][p];}this.advance();return v;}
 drivers(voltage,ground=0){const result=[];for(let p=0;p<2;p++)for(let i=0;i<8;i++){const pin='GP'+(p?'B':'A')+i;if(!(this.reg[0][p]&(1<<i)))result.push({pin,voltage:ground+((this.reg[10][p]&(1<<i))?voltage:0),ohms:50});else if((this.inputMask&(1<<i))&&this.reg[6][p]&(1<<i))result.push({pin,voltage:ground+voltage,ohms:100000});}for(let p=0;p<2;p++){const active=!!(this.iocon&64?(this.flags[0]|this.flags[1]):this.flags[p]),high=this.iocon&4?!active:this.iocon&2?active:!active;if(this.iocon&4&&high)continue;result.push({pin:p?'INTB':'INTA',voltage:ground+(high?voltage:0),ohms:50});}return result;}
 state(){return{iodir:this.reg[0].slice(),olat:this.reg[10].slice(),gpio:[this.gpio(0),this.gpio(1)],unknown:this.unknown.slice(),interrupt:this.flags.slice(),capture:this.capture.slice(),iocon:this.iocon,revision:this.revision,outputOnly:this.inputMask===127?['GPA7','GPB7']:[]};}
}
