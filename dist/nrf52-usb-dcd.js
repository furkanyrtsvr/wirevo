// A virtual TinyUSB DCD bridge. Explicitly NOT Nordic USBD register emulation.
const BASE=0x5fffc000;
export class NRF52USBDCD{
 constructor(r){this.r=r;this.enabled=false;this.connected=false;this.configured=false;this.events=[];this.queue=[];this.trace=[];this.descriptors={};this.open=new Map();this.epoch=0;this.ptr=0;this.len=0;this.ep=0;this.result=0;this.busy=false;this.suspended=false;}
 owns(a){return a>=BASE&&a<BASE+256;}
 read(a){const e=this.events[0]||{};return({0:0x55420113,4:e.type||0,8:e.a||0,12:e.b||0,16:e.c||0,20:(this.connected?1:0)|(this.configured?2:0)|(this.busy?0x80000000:0),24:this.ptr,28:this.len,32:this.ep,36:this.result>>>0,40:Math.floor(this.r.count/64000)})[a-BASE]??0;}
 write(a,v){switch(a-BASE){case 24:this.ptr=v>>>0;break;case 28:this.len=v>>>0;break;case 32:this.ep=v>>>0;break;case 44:this.command(v);break;default:throw Error('TinyUSB DCD servis yazmacı geçersiz.');}}
 emit(type,a=0,b=0,c=0){if(this.events.length>=64)throw Error('TinyUSB DCD olay kuyruğu doldu.');this.events.push({type,a,b,c});}
 log(x){this.trace.push(x);this.trace=this.trace.slice(-64);}
 command(op){this.result=0;if(op===1){this.enabled=true;this.r.keyboard.usb.initialized=true;this.r.keyboard.usb.backend='TinyUSB 0.18.0 / virtual DCD';return;}if(op===2){this.events.shift();return;}if(op===4){this.open.set(this.ep,{maxPacket:this.len});return;}if(op===5){this.fail('STALL');return;}if(op===6){this.open.clear();return;}if(op===7){this.completeControl();return;}if(op===8){this.enabled=false;this.host({action:'disconnect'});return;}if(op===9){if(this.suspended){this.suspended=false;this.emit(6);}return;}if(op!==3){this.result=-5;return;}
  const p=this.ptr,n=this.len,ep=this.ep,epoch=this.epoch;
  if(this.busy||!this.connected||this.suspended||n>64||(n&&(p<0x20000000||p+n>0x20040000))){this.result=-3;return;}
  if(ep===0x81&&!this.configured&&this.open.has(ep)){this.deferredIN={p,n,epoch};return;}
  this.busy=true;
  const done=data=>{if(epoch!==this.epoch)return;this.busy=false;if(ep===0x80){if(!this.ctrl)return this.fail('EP0 without SETUP');this.ctrl.received.push(...data);this.emit(3,ep,n,0);}else if(ep===0){if(!this.ctrl)return this.fail('OUT without SETUP');const out=this.ctrl.out||[],chunk=out.slice(this.ctrl.outOffset,this.ctrl.outOffset+n);if(n&&chunk.length!==n)return this.fail('OUT data length');this.ctrl.outOffset+=n;this.busy=true;this.r.dmaWrite(p,chunk,()=>{if(epoch!==this.epoch)return;this.busy=false;this.emit(3,ep,chunk.length,0);});}else if(ep===0x81&&this.configured&&this.open.has(ep)&&n===8){const oldLED=this.r.keyboard.usb.leds;this.r.keyboard.result=0;this.r.keyboard.accept(this.r.keyboard.usb,data);if(oldLED!==this.r.keyboard.usb.leds)this.enqueue('SET_REPORT LEDs',[33,9,0,2,0,0,1,0],[this.r.keyboard.usb.leds]);if(this.r.keyboard.result)this.log('HID report rejected by host decoder');this.result=0;this.emit(3,ep,n,0);}else{this.result=-3;this.emit(3,ep,0,1);}};
  if(ep&128)this.r.dmaRead(p,n,done);else done([]);
 }
 setup(label,request,out=[]){return{label,request,out,received:[],outOffset:0};}
 next(){if(this.ctrl||!this.queue.length)return;this.ctrl=this.queue.shift();const b=this.ctrl.request;this.log('SETUP '+this.ctrl.label);this.emit(2,(b[0]|b[1]<<8|b[2]<<16|b[3]<<24)>>>0,(b[4]|b[5]<<8|b[6]<<16|b[7]<<24)>>>0);}
 enqueue(label,request,out=[]){if(this.queue.length>=32)throw Error('USB kontrol kuyruğu dolu.');this.queue.push(this.setup(label,request,out));this.next();}
 completeControl(){const c=this.ctrl;if(!c)return;this.log('ACK '+c.label);if(c.label.startsWith('GET_'))this.descriptors[c.label]=c.received;if(c.label==='GET_HID_REPORT_DESCRIPTOR'){const dev=this.descriptors.GET_DEVICE_DESCRIPTOR,config=this.descriptors.GET_CONFIGURATION_DESCRIPTOR,report=this.descriptors.GET_HID_REPORT_DESCRIPTOR;if(dev?.length!==18||config?.length!==34||config[4]!==1||config[14]!==3||config[15]!==1||config[16]!==1||config[29]!==0x81||config[31]!==8||!report?.length||!this.open.has(0x81))return this.fail('Keyboard descriptors/endpoints missing');this.configured=true;this.r.keyboard.usb.connected=true;this.r.keyboard.usb.enumeration=this.trace.slice();if(this.deferredIN){const {p,n,epoch}=this.deferredIN;this.deferredIN=null;if(epoch===this.epoch){this.ptr=p;this.len=n;this.ep=0x81;this.command(3);}}}
  if(c.label==='SET_CONFIGURATION 0'){this.configured=false;this.r.keyboard.usb.connected=false;}
  if(c.label==='SET_REPORT LEDs')this.r.keyboard.usb.leds=c.out[0];
  if(c.label.startsWith('SET_PROTOCOL'))this.r.keyboard.usb.protocol=c.request[2];
  if(c.label.startsWith('SET_IDLE'))this.r.keyboard.usb.idle=c.request[3];
  this.ctrl=null;this.next();
 }
 fail(reason){this.result=-3;this.busy=false;this.log('ERROR '+reason);this.ctrl=null;this.queue=[];this.configured=false;this.r.keyboard.usb.connected=false;}
 host(d){const c=this.r.keyboard.usb;if(d.action==='connect'){if(!this.enabled)throw Error('Önce TinyUSB firmware’ini çalıştırın.');if(this.connected)return;this.epoch++;this.events=[];this.queue=[];this.ctrl=null;this.open.clear();this.deferredIN=null;this.descriptors={};this.trace=[];this.connected=true;this.configured=false;this.suspended=false;c.connected=false;c.report=Array(8).fill(0);this.emit(1);this.enqueue('GET_DEVICE_DESCRIPTOR',[128,6,0,1,0,0,18,0]);this.enqueue('SET_ADDRESS 1',[0,5,1,0,0,0,0,0]);this.enqueue('GET_CONFIGURATION_DESCRIPTOR',[128,6,0,2,0,0,255,0]);this.enqueue('SET_CONFIGURATION 1',[0,9,1,0,0,0,0,0]);this.enqueue('GET_HID_REPORT_DESCRIPTOR',[129,6,0,34,0,0,255,0]);return;}
  if(d.action==='disconnect'){this.epoch++;this.connected=false;this.configured=false;this.busy=false;this.suspended=false;this.events=[];this.queue=[];this.ctrl=null;this.deferredIN=null;this.open.clear();this.r.keyboard.disconnect(c);this.emit(4);this.log('DISCONNECT');return;}
  if(d.action==='clear'){c.text='';c.events=[];return;}
  if(!this.configured)throw Error('USB enumeration henüz tamamlanmadı.');
  if(this.suspended&&!['resume','suspend'].includes(d.action))throw Error('Önce USB resume ile bağlantıyı uyandırın.');
  if(d.action==='leds'){if(!Number.isInteger(d.value)||d.value<0||d.value>31)throw Error('LED 0..31 olmalı.');this.enqueue('SET_REPORT LEDs',[33,9,0,2,0,0,1,0],[d.value]);return;}
  if(d.action==='protocol'){if(![0,1].includes(d.value))throw Error('Protokol 0 veya 1 olmalı.');this.enqueue('SET_PROTOCOL '+d.value,[33,11,d.value,0,0,0,0,0]);return;}
  if(d.action==='idle'){if(!Number.isInteger(d.value)||d.value<0||d.value>255)throw Error('Idle 0..255 olmalı.');this.enqueue('SET_IDLE '+d.value,[33,10,0,d.value,0,0,0,0]);return;}
  if(d.action==='suspend'){this.suspended=true;c.connected=false;c.report=Array(8).fill(0);this.emit(5);this.log('SUSPEND');return;}
  if(d.action==='resume'){this.suspended=false;c.connected=true;this.emit(6);this.log('RESUME');return;}
  if(d.action==='get-protocol'){this.enqueue('GET_PROTOCOL',[161,3,0,0,0,0,1,0]);return;}
  if(d.action==='get-idle'){this.enqueue('GET_IDLE',[161,2,0,0,0,0,1,0]);return;}
  if(d.action==='get-report'){this.enqueue('GET_REPORT',[161,1,0,1,0,0,8,0]);return;}
  throw Error('TinyUSB host komutu desteklenmiyor.');
 }
 snapshot(){return{backend:'TinyUSB 0.18.0 / Wirevo virtual DCD',enabled:this.enabled,connected:this.connected,configured:this.configured,suspended:this.suspended,trace:[...this.trace],descriptors:Object.fromEntries(Object.entries(this.descriptors).map(([k,v])=>[k,[...v]])),pending:this.events.length,control:this.ctrl?.label||null,error:this.result};}
}
