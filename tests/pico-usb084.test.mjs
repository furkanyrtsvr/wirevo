import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{gunzipSync}from'node:zlib';
import{compilePico}from'../src/pico-compiler.js';import{PicoRuntime}from'../dist/pico-runtime.js';import{PICO_BOARDS}from'../dist/pico-boards.js';import{validatePicoImage,packPicoImage}from'../dist/pico-image.js';
import{PICO_USB_EXAMPLES}from'../dist/pico-usb-examples.js';
const module=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
const sources={hid:`#include <tusb.h>
volatile unsigned leds;
void tud_hid_set_report_cb(uint8_t i,uint8_t id,hid_report_type_t type,const uint8_t*data,uint16_t n){if(n)leds=data[0];}
int main(void){wirevo_usb_set_mode(WIREVO_USB_HID);tud_init(0);while(!tud_mounted()){tud_task();}uint8_t keys[6]={HID_KEY_A,0,0,0,0,0};tud_hid_keyboard_report(0,2,keys);tud_hid_keyboard_report(0,0,0);while(1){tud_task();}}
`,mouse:`#include <tusb.h>
int main(void){wirevo_usb_set_mode(WIREVO_USB_MOUSE);tud_init(0);while(!tud_mounted()){tud_task();}tud_hid_mouse_report(0,1,12,-7,1,-1);while(1){tud_task();}}
`,msc:`#include <tusb.h>
static uint8_t disk[4096];volatile unsigned writes;
void tud_msc_capacity_cb(uint8_t lun,uint32_t*count,uint16_t*size){*count=8;*size=512;}
int32_t tud_msc_read10_cb(uint8_t lun,uint32_t lba,uint32_t offset,void*buffer,uint32_t n){if(lba>=8||offset+n>512)return -1;uint8_t*d=buffer;for(unsigned i=0;i<n;i++)d[i]=disk[lba*512+offset+i];return n;}
int32_t tud_msc_write10_cb(uint8_t lun,uint32_t lba,uint32_t offset,uint8_t*buffer,uint32_t n){if(lba>=8||offset+n>512)return -1;for(unsigned i=0;i<n;i++)disk[lba*512+offset+i]=buffer[i];writes++;return n;}
int main(void){wirevo_usb_set_mode(WIREVO_USB_MSC);tud_init(0);while(1){tud_task();}}
`,dfu:`#include <tusb.h>
static uint8_t staging[512];volatile unsigned downloads,manifested;
void tud_dfu_download_cb(uint8_t alt,uint16_t block,const uint8_t*data,uint16_t n){if(block>1||n>256){tud_dfu_finish_flashing(8);return;}for(unsigned i=0;i<n;i++)staging[block*256+i]=data[i];downloads++;tud_dfu_finish_flashing(0);}
uint16_t tud_dfu_upload_cb(uint8_t alt,uint16_t block,uint8_t*data,uint16_t n){if(block>1)return 0;for(unsigned i=0;i<n;i++)data[i]=staging[block*256+i];return n;}
void tud_dfu_manifest_cb(uint8_t alt){manifested++;tud_dfu_finish_flashing(0);}
int main(void){wirevo_usb_set_mode(WIREVO_USB_DFU);tud_init(0);while(1){tud_task();}}
`};
const firmware=new Map();for(const id of ['pico','pico-2']){const variants={};for(const[k,source]of Object.entries(sources))variants[k]=await compilePico(module,source,id);firmware.set(PICO_BOARDS[id].mcu,variants);}
function runtime(id,mode){const b=PICO_BOARDS[id],f=firmware.get(b.mcu)[mode],raw=validatePicoImage(f.image,b.mcu==='RP2040'?'pico':'pico-2'),r=new PicoRuntime(packPicoImage(raw,id),id);r.setDebugInfo(f.debugInfo);return r;}
function until(r,predicate,max=1200){for(let i=0;i<max;i++){r.step(1000);if(predicate())return;}assert.fail('New USB transaction timed out; '+JSON.stringify(r.usbHost.snapshot()));}
function control(r,req){const t=r.usbHost.startControl(req);until(r,()=>t.done,100);return t.data;}
function scsi(r,cmd,options){const t=r.usbHost.startSCSI(cmd,options);until(r,()=>t.done,200);return t;}
function value(r,name){return r.debugger.readVariable(r.debugger.info.variables.find(v=>v.name===name)).value;}
for(const id of Object.keys(PICO_BOARDS)){
 test(id+' HID keyboard descriptor, press/release and host LED output reach native callback',()=>{const r=runtime(id,'hid');try{until(r,()=>r.usbHost.initialized&&r.usbHost.reports.length>=2);assert.equal(r.usbHost.kind,'hid');assert.deepEqual(r.usbHost.reports[0],[2,0,4,0,0,0,0,0]);assert.deepEqual(r.usbHost.reports[1],Array(8).fill(0));const desc=control(r,{bm:0x81,request:6,value:0x2200,length:256});assert.equal(desc.at(-1),0xc0);control(r,{bm:0x21,request:9,value:0x200,length:1,data:[5]});assert.equal(value(r,'leds'),5);}finally{r.dispose();}});
 test(id+' MSC capacity and two-block WRITE10/READ10 use C storage; range error sets sense',()=>{const r=runtime(id,'msc');try{until(r,()=>r.usbHost.initialized);assert.equal(r.usbHost.kind,'msc');const capacity=scsi(r,[0x25,0,0,0,0,0,0,0,0,0],{length:8});assert.equal(capacity.status,0);assert.deepEqual(capacity.data,[0,0,0,7,0,0,2,0]);const data=Array.from({length:1024},(_,i)=>(i*13+7)&255);assert.equal(scsi(r,[0x2a,0,0,0,0,2,0,0,2,0],{length:1024,data}).status,0);assert.equal(value(r,'writes'),2);const back=scsi(r,[0x28,0,0,0,0,2,0,0,2,0],{length:1024});assert.equal(back.status,0);assert.deepEqual(back.data,data);const bad=scsi(r,[0x28,0,0,0,0,8,0,0,1,0],{length:512});assert.equal(bad.status,1);assert.equal(bad.residue,512);const sense=scsi(r,[3,0,0,0,18,0],{length:18});assert.equal(sense.data[2],5);assert.equal(sense.data[12],0x21);}finally{r.dispose();}});
 test(id+' DFU download/upload, GETSTATUS, manifestation and error recovery use native callbacks',()=>{const r=runtime(id,'dfu');try{until(r,()=>r.usbHost.initialized);assert.equal(r.usbHost.kind,'dfu');const data=Array.from({length:128},(_,i)=>255-i);control(r,{bm:0x21,request:1,value:1,length:128,data});assert.equal(value(r,'downloads'),1);assert.equal(control(r,{bm:0xa1,request:3,length:6})[4],5);control(r,{bm:0x21,request:6});assert.deepEqual(control(r,{bm:0xa1,request:2,value:1,length:128}),data);control(r,{bm:0x21,request:6});control(r,{bm:0x21,request:1});assert.equal(value(r,'manifested'),1);assert.equal(control(r,{bm:0xa1,request:3,length:6})[4],7);assert.equal(control(r,{bm:0xa1,request:3,length:6})[4],2);control(r,{bm:0x21,request:1,length:300,data:Array(300).fill(1)});assert.equal(control(r,{bm:0xa1,request:5,length:1})[0],10);control(r,{bm:0x21,request:4});assert.equal(control(r,{bm:0xa1,request:5,length:1})[0],2);}finally{r.dispose();}});
}
for(const id of ['pico','pico-2'])test(id+' new HID mouse descriptor sends signed movement and wheel/pan',()=>{const r=runtime(id,'mouse');try{until(r,()=>r.usbHost.reports.length>0);assert.deepEqual(r.usbHost.reports[0],[1,12,249,1,255]);const desc=control(r,{bm:0x81,request:6,value:0x2200,length:256});assert.deepEqual(desc.slice(0,4),[5,1,9,2]);control(r,{bm:0x21,request:11,value:0});assert.deepEqual(control(r,{bm:0xa1,request:3,length:1}),[0]);assert.equal(control(r,{bm:0xa1,request:1,value:0x100,length:8}).length,3);}finally{r.dispose();}});
for(const id of ['pico','pico-2'])test(id+' new polled class host also enumerates CDC and passes actual DPRAM serial bytes',async()=>{const f=await compilePico(module,'#include <pico/stdio_usb.h>\n#include <tusb.h>\nint main(void){stdio_usb_init();while(!stdio_usb_connected())tud_task();tud_cdc_write("NEW HOST",8);while(!tud_cdc_available())tud_task();int c=tud_cdc_read_char();tud_cdc_write_char((char)c);while(1)tud_task();}',id),r=new PicoRuntime(f.image,id);try{let out='';for(let i=0;i<1200&&!out.includes('NEW HOST');i++)out+=r.step(1000);assert.equal(r.usbHost.kind,'cdc');assert.match(out,/NEW HOST/);r.queueSerial('Q');for(let i=0;i<100&&!out.includes('Q');i++)out+=r.step(1000);assert.match(out,/Q/);}finally{r.dispose();}});
for(const id of ['pico','pico-2'])for(const[name,source]of Object.entries(PICO_USB_EXAMPLES))test(id+' new bundled '+name+' example compiles with actual class callbacks',async()=>{const f=await compilePico(module,source,id);assert.ok(f.image.length>80);});
