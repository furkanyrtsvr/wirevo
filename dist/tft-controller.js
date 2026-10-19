// Write-only ST77xx controller, fixed generic panel crop; physical RAM coordinates.
export class TFTController {
 constructor(type){this.type=type;this.width=type==='tft7735'?132:240;this.height=type==='tft7735'?162:320;this.pixels=new Uint16Array(this.width*this.height);this.revision=0;this.writes=0;this.errors=0;this.reset(true);}
 reset(hardware=false,cycle=0){this.sleep=true;this.on=false;this.madctl=0;this.inverted=false;if(hardware)this.format=6;this.command=0;this.args=[];this.hi=null;this.window=[0,0,this.width-1,this.height-1];this.x=0;this.y=0;this.readyAt=cycle+120*16000;this.revision++;}
 byte(value,data,cycle=0){value&=255;if(!data){this.command=value;this.args=[];this.hi=null;
  if(value===1)this.reset(false,cycle);
  if(value===0x10)this.sleep=true;
  if(value===0x11&&cycle>=this.readyAt){this.sleep=false;this.readyAt=cycle+120*16000;}
  if(value===0x28)this.on=false;if(value===0x29)this.on=true;
  if(value===0x20)this.inverted=false;if(value===0x21)this.inverted=true;
  if(value===0x2c){this.x=this.window[0];this.y=this.window[1];}return;}
 if(this.command===0x36){this.madctl=value;return;}if(this.command===0x3a){this.format=value&7;return;}
 if(this.command===0x2a||this.command===0x2b){this.args.push(value);if(this.args.length===4){const a=(this.args[0]<<8)|this.args[1],b=(this.args[2]<<8)|this.args[3];if(this.command===0x2a){this.window[0]=a;this.window[2]=b;}else{this.window[1]=a;this.window[3]=b;}}return;}
 if(this.command!==0x2c||this.sleep||cycle<this.readyAt)return;
 if(this.format!==5){this.errors++;return;}if(this.hi===null){this.hi=value;return;}
 let pixel=(this.hi<<8)|value;this.hi=null;let x=this.x,y=this.y;if(this.madctl&0x20)[x,y]=[y,x];if(this.madctl&0x40)x=this.width-1-x;if(this.madctl&0x80)y=this.height-1-y;
 if(x>=0&&x<this.width&&y>=0&&y<this.height&&this.window[0]<=this.window[2]&&this.window[1]<=this.window[3]){if(this.madctl&8)pixel=((pixel&31)<<11)|(pixel&0x7e0)|((pixel>>11)&31);this.pixels[y*this.width+x]=pixel;this.writes++;this.revision++;}else this.errors++;
 if(++this.x>this.window[2]){this.x=this.window[0];if(++this.y>this.window[3])this.y=this.window[1];}
 }
 frame(offsetX=0,offsetY=0){const w=this.type==='tft7735'?128:240,h=this.type==='tft7735'?160:this.type==='ili9341'?320:240,out=new Uint16Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)out[y*w+x]=this.pixels[(y+offsetY)*this.width+x+offsetX]??0;return out;}
}
