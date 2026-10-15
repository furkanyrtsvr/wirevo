import {MCP23017} from './mcp23017.js';
export class MCP23S17 extends MCP23017 {
 constructor(){super({inputMask:255});this.select();}
 select(){this.phase=0;this.accepted=false;this.reading=false;this.tx=null;this.requests=this.requests??0;}
 peek(){const map=this.map(this.pointer);if(!map)return 0;const[k,p]=map;return k===5?this.iocon:k===7?this.flags[p]:k===8?this.capture[p]:k===9?this.gpio(p):this.reg[k][p];}
 transfer(byte,address=0){if(this.phase===0){this.accepted=(byte&0xf0)===0x40&&(!(this.iocon&8)||((byte>>1)&7)===address);this.reading=!!(byte&1);this.phase=1;if(this.accepted)this.requests++;return null;}if(!this.accepted)return null;if(this.phase===1){this.pointer=byte&31;this.first=false;this.phase=2;this.tx=this.reading?this.peek():null;}else if(this.reading){this.read();this.tx=this.peek();}else this.write(byte);return this.tx;}
 state(){return{...super.state(),requests:this.requests,haen:!!(this.iocon&8)};}
}
