import {WASI,File,Directory,OpenFile,ConsoleStdout,PreopenDirectory} from '@bjorn3/browser_wasi_shim';
import {ESP_BOARDS} from '../dist/esp-boards.js';
import {normalizeESPFiles,espSourceKey} from '../dist/esp-source.js';
import {C_HEADERS,C_BRIDGE} from '../dist/c-hal.js';
import {normalizeFiles} from '../dist/source-files.js';
import {ESP_BUS_HEADERS} from '../dist/esp-bus-headers.js';
const enc=new TextEncoder();
export const ESP_CLANG_SHA256='7546c54c07c392e231ea450f8e3aaa6680346ffeb08e13d97d970b26d88666e5';
export const ESP_TARGETS={
 esp32c3:{chip:'esp32c3',id:5,text:0x40380000,data:0x3fc90000,stack:0x3fcde710,gpio:0x60004000,inputOffset:0x3c,matrix:0x554,signal:128,mux:0x60009000,uart:0x60000000,hz:160000000,maxPin:21,ram:240*1024},
 esp32c6:{chip:'esp32c6',id:13,text:0x40800000,data:0x40810000,stack:0x4087f000,gpio:0x60091000,inputOffset:0x3c,matrix:0x554,signal:128,mux:0x60090000,uart:0x60000000,hz:160000000,maxPin:30,ram:432*1024},
 esp32h2:{chip:'esp32h2',id:16,text:0x40800000,data:0x40810000,stack:0x4084f000,gpio:0x60091000,inputOffset:0x3c,matrix:0x554,signal:128,mux:0x60090000,uart:0x60000000,hz:96000000,maxPin:27,ram:240*1024},
 esp32c5:{chip:'esp32c5',id:23,text:0x40800000,data:0x40810000,stack:0x4085f000,gpio:0x60091000,inputOffset:0x64,enable:0x34,enableHigh:0x40,matrix:0xad4,signal:256,oeBit:10,mux:0x60090000,muxOffset:0,uart:0x60000000,hz:240000000,maxPin:28,ram:304*1024,imageOffset:0x2000},
 esp32p4:{chip:'esp32p4',id:18,text:0x4ff00000,data:0x4ff10000,stack:0x4ff9f000,gpio:0x500e0000,inputOffset:0x3c,matrix:0x558,signal:256,oeBit:10,mux:0x500e1000,uart:0x500ca000,hz:400000000,maxPin:54,ram:560*1024,imageOffset:0x2000},
 esp32s3:{chip:'esp32s3',id:9,text:0x40380000,data:0x3fc98000,stack:0x3fcff000,gpio:0x60004000,inputOffset:0x3c,matrix:0x554,signal:256,mux:0x60009000,uart:0x60000000,hz:240000000,maxPin:48,ram:400*1024,xtensa:true}
};
export const C3_TARGET=ESP_TARGETS.esp32c3;
export function coreHeader(target=C3_TARGET){return `#pragma once
${Object.entries(ESP_BOARDS[target.chip].aliases||{}).map(([k,v])=>'#define '+k+' '+v).join('\n')}
typedef unsigned char byte; typedef unsigned short uint16_t; typedef unsigned int uint32_t; typedef signed int int32_t; typedef unsigned long size_t;
#define HIGH 1
#define LOW 0
#define INPUT 0
#define OUTPUT 1
#define INPUT_PULLUP 2
#define DEC 10
#define HEX 16
#define OCT 8
#define BIN 2
#define F(s) (s)
#define lowByte(v) ((byte)((v)&255))
#define highByte(v) ((byte)(((v)>>8)&255))
#define bitRead(v,b) (((v)>>(b))&1)
#define bitSet(v,b) ((v)|=(1UL<<(b)))
#define bitClear(v,b) ((v)&=~(1UL<<(b)))
#define bitWrite(v,b,x) ((x)?bitSet(v,b):bitClear(v,b))
#define CIRCUITFORGE_ESP_CORE 1
inline volatile unsigned &reg(unsigned a){return *(volatile unsigned*)a;}
inline bool validPin(unsigned p){return ${ESP_BOARDS[target.chip].gpio.map(p=>'p=='+p).join('||')};}
inline void pinMode(unsigned p,int mode){if(!validPin(p))return;reg(${target.mux+(target.muxOffset??4)}+4*p)=(1u<<12)|(1u<<9)|(mode==INPUT_PULLUP?1u<<8:0);reg(${target.gpio+target.matrix}+4*p)=${target.signal}|(1u<<${target.oeBit??(target.xtensa?10:9)});unsigned a=${target.gpio}+ (p<32?${target.enable??0x20}:${target.enableHigh??0x2c}),b=1u<<(p%32);reg(a)=mode==OUTPUT?reg(a)|b:reg(a)&~b;}
inline void digitalWrite(unsigned p,int v){if(validPin(p))reg(${target.gpio}+(p<32?(v?8:12):(v?0x14:0x18)))=1u<<(p%32);}
inline int digitalRead(unsigned p){return validPin(p)?int((reg(${target.gpio+target.inputOffset}+(p<32?0:4))>>(p%32))&1):0;}
inline unsigned cycleCount(){unsigned n;asm volatile("${target.xtensa?'rsr.ccount':'rdcycle'} %0":"=r"(n));return n;}
struct CFClock {unsigned last,us,ms,sub,rem;};
inline CFClock &clockState(){static CFClock state={0,0,0,0,0};return state;}
inline void pollClock(){CFClock &s=clockState();unsigned n=cycleCount(),d=n-s.last;s.last=n;unsigned rem=d%${target.hz/1000000}+s.rem,u=d/${target.hz/1000000}+rem/${target.hz/1000000};s.rem=rem%${target.hz/1000000};s.us+=u;unsigned sub=s.sub+u;s.ms+=sub/1000;s.sub=sub%1000;}
inline unsigned micros(){pollClock();return clockState().us;}
inline unsigned millis(){pollClock();return clockState().ms;}
inline void delayMicroseconds(unsigned us){while(us){unsigned chunk=us>1000?1000:us;unsigned start=cycleCount(),ticks=chunk*${target.hz/1000000};while((unsigned)(cycleCount()-start)<ticks)asm volatile("nop");pollClock();us-=chunk;}}
inline void delay(unsigned ms){while(ms--)delayMicroseconds(1000);}
template<class T> T min(T a,T b){return a<b?a:b;} template<class T>T max(T a,T b){return a>b?a:b;}
template<class T> T constrain(T x,T a,T b){return x<a?a:x>b?b:x;}
inline long map(long x,long a,long b,long c,long d){return (x-a)*(d-c)/(b-a)+c;}
class CFSerial {public:
void begin(unsigned baud){if(baud)reg(${target.uart+0x14})=40000000/baud;}
int available(){return reg(${target.uart+0x1c})&1023;}
int read(){return available()?int(reg(${target.uart})&255):-1;}
size_t write(byte v){reg(${target.uart})=v;return 1;}
size_t write(const byte *s,size_t n){for(size_t i=0;i<n;i++)write(s[i]);return n;}
size_t write(const char *s){size_t n=0;if(s)while(s[n])write((byte)s[n++]);return n;}
void print(const char*s){if(s)while(*s)write(*s++);}
void print(char c){write((byte)c);}
void print(unsigned n,int base=10){if(base<2||base>16)return;char b[32];int i=0;do{unsigned digit=n%(unsigned)base;b[i++]=char(digit<10?'0'+digit:'A'+digit-10);n/=(unsigned)base;}while(n);while(i)write(b[--i]);}
void print(int n,int base=10){if(n<0&&base==10){write('-');print(0u-(unsigned)n,base);}else print((unsigned)n,base);}
void print(long n,int base=10){print((int)n,base);} void print(unsigned long n,int base=10){print((unsigned)n,base);}
void println(){print("\\r\\n");} void println(const char*s){print(s);println();} void println(char c){print(c);println();} void println(unsigned n,int base=10){print(n,base);println();} void println(int n,int base=10){print(n,base);println();} void println(long n,int base=10){print(n,base);println();} void println(unsigned long n,int base=10){print(n,base);println();}
}; static CFSerial Serial;
extern "C" void *memset(void*,int,size_t); extern "C" void *memcpy(void*,const void*,size_t);
`;}
// Xtensa window spills follow the architectural base-save and extra-save areas.
// Original generated handlers; offsets follow ESP-IDF v5.5.4 Xtensa ABI vectors.
const windowVectors=()=>{let lines=['.section .cf.window, "ax"'];for(const n of [4,8,12]){for(const restore of [false,true]){lines.push('.org '+((n/4-1)*128+(restore?64:0)));const base=n+1,scratch=restore?n-1:0,op=restore?'l32e':'s32e';for(let r=0;r<4;r++){lines.push(`${op} a${r},a${base},${-16+4*r}`);if(r===(restore?2:0)&&n>4)lines.push(`l32e a${scratch},a1,-12`);}for(let r=4;r<n;r++)lines.push(`${op} a${r},a${scratch},${-n*4+(r-4)*4}`);lines.push(restore?'rfwu':'rfwo');}}return lines.join('\n');};
const startSource=target=>`#include "Arduino.h"
${target.xtensa?`asm(".section .text.start,\\\"ax\\\"\\n.literal_position\\n.literal .Lstack,${target.stack}\\n.global _start\\n_start:\\n l32r a1,.Lstack\\n movi a2,${target.text}\\n wsr a2,vecbase\\n rsync\\n addi a2,a1,-12\\n s32i a1,a2,0\\n call8 cf_main\\n1: j 1b\\n");`:`asm(".section .text.start,\\\"ax\\\"\\n.global _start\\n_start:\\n li sp,${target.stack}\\n call cf_main\\n1: j 1b\\n");`}
extern "C" char __bss_start[],__bss_end[];
typedef void(*Init)(); extern "C" Init __init_start[],__init_end[];
void setup();void loop();
extern "C" void *memset(void *p,int v,size_t n){auto b=(unsigned char*)p;while(n--)*b++=(unsigned char)v;return p;}
extern "C" void *memcpy(void *p,const void*s,size_t n){auto b=(unsigned char*)p;auto a=(const unsigned char*)s;while(n--)*b++=*a++;return p;}
extern "C" void cf_main(){for(char*p=__bss_start;p<__bss_end;p++)*p=0;for(Init*p=__init_start;p<__init_end;p++)(*p)();setup();for(;;){pollClock();loop();}}
`;
const linker=target=>`ENTRY(_start)
MEMORY { IRAM (rx) : ORIGIN = ${target.text}, LENGTH = ${target.xtensa?32:64}K
DRAM (rw) : ORIGIN = ${target.data}, LENGTH = ${target.ram} }
SECTIONS { ${target.xtensa?'.vectors : ALIGN(1024) { KEEP(*(.cf.window)) } > IRAM':''} .text : { *(.literal*) *(.text.start) *(.text*) *(.rodata*) } > IRAM
.data : { *(.data*) *(.sdata*) __init_start = .; KEEP(*(.init_array*)) __init_end = .; } > DRAM
.bss (NOLOAD) : { __bss_start = .; *(.bss*) *(.sbss*) *(COMMON) __bss_end = .; } > DRAM
/DISCARD/ : { *(.eh_frame*) *(.comment*) } }
`;
export async function runESPTool(module,entries,args){
 let log='';const output=new ConsoleStdout(bytes=>{log+=new TextDecoder().decode(bytes);});
 const wasi=new WASI(args,[],[new OpenFile(new File([])),output,output,new PreopenDirectory('.',entries)],{debug:false});
 const instance=await WebAssembly.instantiate(module,{wasi_snapshot_preview1:wasi.wasiImport});
 const exit=wasi.start(instance);if(exit)throw Error(log||`Clang çıkış kodu ${exit}`);return log;
}
export function elfToESPImage(raw,target=C3_TARGET){
 const bytes=new Uint8Array(raw),v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(bytes.length<52||v.getUint32(0,true)!==0x464c457f||bytes[4]!==1||bytes[5]!==1||v.getUint16(18,true)!==(target.xtensa?94:243))throw Error('Geçersiz hedef ELF.');
 const entry=v.getUint32(24,true),offset=v.getUint32(28,true),count=v.getUint16(44,true),stride=v.getUint16(42,true),segments=[];let bss=0;
 if(stride<32||count>32||offset+count*stride>bytes.length)throw Error('ELF segment tablosu geçersiz.');
 const regions=[],textEnd=target.text+(target.xtensa?32:64)*1024;
 for(let i=0;i<count;i++){const p=offset+i*stride;if(v.getUint32(p,true)!==1)continue;const off=v.getUint32(p+4,true),addr=v.getUint32(p+8,true),size=v.getUint32(p+16,true),mem=v.getUint32(p+20,true),flags=v.getUint32(p+24,true),end=addr+mem;
  const code=addr>=target.text&&end<=textEnd,data=addr>=target.data&&end<=target.data+target.ram;
  if(size>mem||off+size>bytes.length||(!code&&!data)||end>0xffffffff||((flags&1)&&!code)||regions.some(r=>addr<r.end&&end>r.addr))throw Error('ELF segment sınırı aşıldı.');
  if(mem)regions.push({addr,end});bss+=mem-size;if(size)segments.push({addr,executable:!!(flags&1),bytes:bytes.slice(off,off+size)});
 }
 if(!segments.length||segments.length>16||!segments.some(s=>s.executable&&entry>=s.addr&&entry<s.addr+s.bytes.length))throw Error('ELF giriş adresi geçersiz.');
 const end=24+segments.reduce((n,s)=>n+8+Math.ceil(s.bytes.length/4)*4,0),image=new Uint8Array(Math.ceil((end+1)/16)*16),header=new DataView(image.buffer);
 image[0]=0xe9;image[1]=segments.length;image[2]=2;header.setUint32(4,entry,true);header.setUint16(12,target.id,true);
 let at=24,xor=0xef;for(const s of segments){const len=Math.ceil(s.bytes.length/4)*4;header.setUint32(at,s.addr,true);header.setUint32(at+4,len,true);image.set(s.bytes,at+8);for(const b of s.bytes)xor^=b;at+=8+len;}image[image.length-1]=xor;
 const binary=target.imageOffset?new Uint8Array(target.imageOffset+image.length).fill(255):image;if(target.imageOffset)binary.set(image,target.imageOffset);
 return{image:binary,entry,flashBytes:binary.length,staticRamBytes:bss+segments.filter(s=>s.addr>=target.data&&s.addr<target.data+target.ram).reduce((n,s)=>n+s.bytes.length,0)};
}
export async function compileESP(module,source,chip='esp32c3',files=[],language='arduino'){
 if(!Object.hasOwn(ESP_BOARDS,chip))throw Error('Desteklenmeyen ESP hedefi.');const base=ESP_TARGETS[ESP_BOARDS[chip].target||chip];if(!base)throw Error('İşlemci derleme hedefi desteklenmiyor.');const target={...base,chip};
 if(typeof source!=='string'||!source.trim()||enc.encode(source).length>100000)throw Error('Kaynak kod boş veya çok büyük.');
 const normalized=(language==='c'?normalizeFiles([{name:'main.c',content:source},...files],{language:'c'}):normalizeESPFiles(source,files)),tree=new Map();function put(path,content){const parts=path.split('/');let map=tree;for(const part of parts.slice(0,-1)){if(!map.has(part))map.set(part,new Map());map=map.get(part);}map.set(parts.at(-1),new File(enc.encode(content)));}
 for(const f of normalized)if(f.name!=='sketch.ino')put(f.name,f.content);if(language==='c')for(const[name,content]of Object.entries(C_HEADERS))put(name,content+(name==='cf_hal.h'?'\n'+Object.entries(ESP_BOARDS[chip].aliases||{}).map(([k,v])=>'#define '+k+' '+v).join('\n'):''));for(const[name,content]of Object.entries(ESP_BUS_HEADERS))put(name,content);put('Arduino.h',coreHeader(target));put('.cf/sketch.cpp',language==='c'?C_BRIDGE:'#include "Arduino.h"\n#line 1 "sketch.ino"\n'+source);put('.cf/start.cpp',startSource(target));if(target.xtensa)put('.cf/window.S',windowVectors());put('.cf/link.ld',linker(target));
 const directories=map=>new Map([...map].map(([k,v])=>[k,v instanceof Map?new Directory(directories(v)):v])),entries=directories(tree),units=['.cf/sketch.cpp','.cf/start.cpp',...(target.xtensa?['.cf/window.S']:[]),...normalized.filter(f=>/\.(cpp|c)$/.test(f.name)).map(f=>f.name)],objects=[];let log='';
 for(const [i,file]of units.entries()){const output='.cf/'+i+'.o';objects.push(output);log+=await runESPTool(module,entries,['clang',...(target.xtensa?['--target=xtensa-esp32s3-elf','-mcpu=esp32s3','-mtext-section-literals']:['--target=riscv32-unknown-elf','-march=rv32imc','-mabi=ilp32','-msmall-data-limit=0']),'-ffreestanding','-fno-threadsafe-statics','-fno-exceptions','-fno-rtti','-fno-builtin','-fno-unwind-tables','-nostdinc','-I.','-Os',...(file.endsWith('.S')?['-x','assembler']:file.endsWith('.c')?['-x','c','-std=c17','-Dmain=cf_c_main']:['-std=c++17']),'-c',file,'-o',output]);}
 log+=await runESPTool(module,entries,['ld.lld','-T','.cf/link.ld',...objects,'-o','.cf/firmware.elf']);
 const elf=new Uint8Array(entries.get('.cf').contents.get('firmware.elf').data);return {...elfToESPImage(elf,target),elf,log,chip,core:'CircuitForge ESP core 0.2',compiler:'Clang 22 / '+(target.xtensa?'Xtensa LX7':'RV32IMC'),bootFromROM:false,source,files:normalized.slice(1),sourceKey:language==='c'?JSON.stringify({chip,language,files:normalized}):espSourceKey(chip,source,files)};
}
