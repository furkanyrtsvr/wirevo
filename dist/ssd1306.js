// CircuitForge transaction-level SSD1306 model. GDDRAM is controller memory,
// independent of Arduino SRAM. Command meanings: Solomon SSD1306 rev1.1.
const ARGS={0x20:1,0x21:2,0x22:2,0x81:1,0x8d:1,0xa8:1,0xd3:1,0xd5:1,0xd9:1,0xda:1,0xdb:1,0x26:6,0x27:6,0x29:5,0x2a:5,0xa3:2};
export class SSD1306 {
  constructor(){this.revision=0;this.reset();}
  reset(){this.ram=new Uint8Array(1024);this.column=0;this.page=0;this.columnStart=0;this.columnEnd=127;this.pageStart=0;this.pageEnd=7;this.mode=2;this.on=false;this.inverse=false;this.entire=false;this.remap=false;this.scanReverse=false;this.startLine=0;this.offset=0;this.multiplex=63;this.contrast=127;this.clock=0x80;this.scroll=null;this.scrollActive=false;this.scrollOrigin=0;this.verticalArea=[0,64];this.pending=null;this.begin();this.revision++;}
  begin(){this.expectControl=true;this.control=0;}
  write(value,cycle=0){
    value&=255;
    if(this.expectControl){if(value&0x3f)return false;this.control=value;this.expectControl=false;return true;}
    if(this.control&0x40)this.data(value);else this.command(value,cycle);
    if(this.control&0x80)this.expectControl=true;return true;
  }
  data(value){const index=this.page*128+this.column;if(this.ram[index]!==value){this.ram[index]=value;this.revision++;}
    if(this.mode===1){if(++this.page>this.pageEnd){this.page=this.pageStart;if(++this.column>this.columnEnd)this.column=this.columnStart;}}
    else if(this.mode===0){if(++this.column>this.columnEnd){this.column=this.columnStart;if(++this.page>this.pageEnd)this.page=this.pageStart;}}
    else this.column=(this.column+1)&127;
  }
  command(value,cycle=0){
    if(this.pending){this.pending.args.push(value);if(this.pending.args.length===this.pending.count){const p=this.pending;this.pending=null;this.apply(p.command,p.args,cycle);}return;}
    if(ARGS[value]){this.pending={command:value,args:[],count:ARGS[value]};return;}
    this.apply(value,[],cycle);
  }
  apply(cmd,a,cycle){
    if(cmd<=0x0f)this.column=(this.column&0x70)|cmd;
    else if(cmd<=0x1f)this.column=(this.column&15)|((cmd&7)<<4);
    else if(cmd>=0x40&&cmd<=0x7f)this.startLine=cmd&63;
    else if(cmd>=0xb0&&cmd<=0xb7)this.page=cmd&7;
    else switch(cmd){
      case 0x20:if(a[0]<3)this.mode=a[0];break;
      case 0x21:{const start=a[0]&127,end=a[1]&127;if(start<=end){this.columnStart=start;this.columnEnd=end;this.column=start;}break;}
      case 0x22:{const start=a[0]&7,end=a[1]&7;if(start<=end){this.pageStart=start;this.pageEnd=end;this.page=start;}break;}
      case 0x81:this.contrast=a[0];break;
      case 0xa0:this.remap=false;break;case 0xa1:this.remap=true;break;
      case 0xa4:this.entire=false;break;case 0xa5:this.entire=true;break;
      case 0xa6:this.inverse=false;break;case 0xa7:this.inverse=true;break;
      case 0xa8:if(a[0]>=15&&a[0]<64)this.multiplex=a[0];break;
      case 0xae:this.on=false;break;case 0xaf:this.on=true;break;
      case 0xc0:this.scanReverse=false;break;case 0xc8:this.scanReverse=true;break;
      case 0xd3:this.offset=a[0]&63;break;case 0xd5:this.clock=a[0];break;
      case 0x26:case 0x27:case 0x29:case 0x2a:this.scroll={direction:cmd===0x26||cmd===0x29?1:-1,start:a[1]&7,end:a[3]&7,interval:[5,64,128,256,3,4,25,2][a[2]&7],vertical:cmd===0x29||cmd===0x2a?a[4]&63:0};break;
      case 0x2e:this.scrollActive=false;break;
      case 0x2f:this.scrollActive=true;this.scrollOrigin=cycle;break;
      case 0xa3:if(a[0]<64&&a[1]>0&&a[0]+a[1]<=64)this.verticalArea=[a[0],a[1]];break;
      // Charge pump / precharge / COM pins / VCOMH affect electrical drive,
      // not this monochrome digital framebuffer; arguments are consumed.
    }this.revision++;
  }
  frame(cycle=0){
    const pixels=new Uint8Array(1024);if(!this.on)return pixels;
    // Fixed nominal 60 Hz panel refresh for scroll only; not oscillator calibration.
    const steps=this.scrollActive&&this.scroll?Math.floor(Math.max(0,cycle-this.scrollOrigin)/16000000*60/this.scroll.interval):0;
    for(let y=0;y<64;y++)for(let x=0;x<128;x++){
      let row=this.scanReverse?y:63-y;if(row>this.multiplex)continue;
      row=(row+this.startLine-this.offset+64)&63;let col=this.remap?x:127-x;
      if(this.scrollActive&&this.scroll&&(row>>3)>=this.scroll.start&&(row>>3)<=this.scroll.end){col=(col-this.scroll.direction*steps%128+128)&127;const[top,height]=this.verticalArea;if(row>=top&&row<top+height)row=top+((row-top-this.scroll.vertical*steps)%height+height)%height;}
      const bit=this.entire||!!(this.ram[(row>>3)*128+col]&(1<<(row&7)));
      if(this.inverse?!bit:bit)pixels[(y>>3)*128+x]|=1<<(y&7);
    }return pixels;
  }
}
// Horizontal runs create a compact, crisp SVG path in the display's pixel space.
export function oledPath(frame){let d='';for(let y=0;y<64;y++){let x=0;while(x<128){while(x<128&&!(frame[(y>>3)*128+x]&(1<<(y&7))))x++;const start=x;while(x<128&&(frame[(y>>3)*128+x]&(1<<(y&7))))x++;if(x>start)d+=`M${start} ${y+.5}h${x-start}`;}}return d;}
