import {readFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {compileESP} from '../../src/esp-compiler.js';import {compileSTM} from '../../src/stm32-compiler.js';import {compileTiva} from '../../src/tiva-compiler.js';
import {ESPRuntime} from '../../dist/esp-runtime.js';import {STMRuntime} from '../../dist/stm32-runtime.js';import {TivaRuntime} from '../../dist/tiva-runtime.js';import {createUnifiedProject} from '../../dist/unified-project.js';import {partDefaults} from '../../dist/part-parameters.js';
const clang=WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz'))),images=new Map();
export const targets={esp32:{board:'esp32c3',pins:['GPIO4','GPIO5','GPIO6','GPIO7','GPIO8','GPIO9','GPIO10','GPIO3'],ids:[4,5,6,7,8,9,10,3]},stm32:{board:'stm32f103c8',pins:['PA0','PA1','PA2','PA3','PA4','PA5','PA6','PA7'],ids:[0,1,2,3,4,5,6,7]},tiva:{board:'ek-tm4c123gxl',pins:['PB0','PB1','PB2','PB3','PE4','PE5','PA2','PA3'],ids:[8,9,10,11,36,37,2,3]}};
export function source(t){return `#include <cf_hal.h>
static const unsigned pins[8]={${t.ids.join(',')}};
static int get(void){int n;do{n=cf_uart_read();}while(n<0);return n;}
static unsigned hex(void){int c=get();return c<='9'?c-'0':c-'A'+10;}
static unsigned byte(void){unsigned a=hex();return a*16+hex();}
static void out(unsigned n){cf_uart_write("0123456789ABCDEF"[(n>>4)&15]);cf_uart_write("0123456789ABCDEF"[n&15]);}
static void mode(unsigned i,unsigned m){cf_gpio_mode(pins[i],m);}
static void wr(unsigned i,unsigned v){cf_gpio_write(pins[i],v);}
static int rd(unsigned i){return cf_gpio_read(pins[i]);}
static void low(unsigned i){wr(i,0);mode(i,1);}static void release(unsigned i){mode(i,2);}
static void uartsoft(unsigned v){wr(0,0);cf_delay_us(103);for(unsigned b=0;b<8;b++){wr(0,(v>>b)&1);cf_delay_us(103);}wr(0,1);cf_delay_us(103);}
static void tick(void){cf_delay_us(5);}static void stop(void){low(0);tick();release(1);tick();release(0);tick();}
static void start(void){release(0);release(1);tick();low(0);tick();low(1);}
static unsigned send(unsigned v){for(int b=7;b>=0;b--){if(v&(1u<<b))release(0);else low(0);tick();release(1);tick();low(1);}release(0);tick();release(1);tick();unsigned ack=!rd(0);low(1);return ack;}
static unsigned receive(unsigned last){unsigned v=0;release(0);for(int i=0;i<8;i++){tick();release(1);tick();v=v*2+rd(0);low(1);}if(last)release(0);else low(0);tick();release(1);tick();low(1);release(0);return v;}
static void nibble(unsigned n,unsigned data){wr(0,data);for(unsigned b=0;b<4;b++)wr(2+b,(n>>b)&1);wr(1,1);cf_delay_us(2);wr(1,0);cf_delay_us(50);}
static void lcd(unsigned v,unsigned data){nibble(v>>4,data);nibble(v&15,data);}
int main(void){cf_uart_begin(115200);cf_uart_write('!');for(;;){int op=get();unsigned p,a,v,n;switch(op){
case 'M':p=hex();a=hex();if(p<8)mode(p,a);break;
case 'W':p=hex();v=hex();if(p<8)wr(p,v);break;
case 'R':p=hex();out(p<8?rd(p):255);break;
case 'D':n=byte();n=n*256+byte();cf_delay_us(n);break;
case 'S':v=byte();a=0;for(int b=7;b>=0;b--){wr(1,(v>>b)&1);wr(0,1);cf_delay_us(2);a=a*2+rd(2);wr(0,0);cf_delay_us(2);}out(a);break;
case 'J':a=byte();n=byte();start();v=send(a<<1);while(n--)v&=send(byte());stop();out(v);break;
case 'Q':a=byte();n=byte();start();v=send((a<<1)|1);out(v);for(unsigned i=0;i<n;i++)out(receive(i+1==n));stop();break;
case 'Y':uartsoft(byte());break;
case 'N':for(a=0;a<100;a++){for(n=0;n<50000&&rd(1);n++);cf_delay_us(150);v=0;for(p=0;p<8;p++){if(rd(1))v|=1u<<p;cf_delay_us(103);}for(n=0;n<5000&&!rd(1);n++);out(v);}break;
case 'I':for(n=0;n<16;n++){wr(0,1);cf_delay_us(9);wr(0,0);cf_delay_us(9);}out(rd(1));cf_delay_us(500);out(rd(1));break;
case 'Z':for(n=0;n<50000&&rd(1);n++);cf_delay_us(150);v=0;for(p=0;p<8;p++){if(rd(1))v|=1u<<p;cf_delay_us(103);}out(v);break;
case 'V':n=byte();release(0);release(1);tick();low(0);tick();low(1);while(n--){v=byte();for(unsigned b=0;b<8;b++){if(v&(1u<<b))release(0);else low(0);tick();release(1);tick();low(1);}release(0);tick();release(1);tick();out(!rd(0));low(1);}low(0);tick();release(1);tick();release(0);break;
case 'X':for(unsigned px=0;px<8;px++)for(unsigned color=0;color<3;color++)for(int bit=7;bit>=0;bit--){if(color==1){${t.board==='esp32c3'?'*(volatile unsigned*)0x60004008=16;__asm__ volatile(".rept 125; nop; .endr");*(volatile unsigned*)0x6000400c=16;':t.board==='stm32f103c8'?'*(volatile unsigned*)0x40010810=1;__asm__ volatile(".rept 55; nop; .endr");*(volatile unsigned*)0x40010814=1;':'*(volatile unsigned*)0x40005004=1;__asm__ volatile(".rept 6; nop; .endr");*(volatile unsigned*)0x40005004=0;'}}else{${t.board==='esp32c3'?'*(volatile unsigned*)0x60004008=16;__asm__ volatile(".rept 35; nop; .endr");*(volatile unsigned*)0x6000400c=16;':t.board==='stm32f103c8'?'*(volatile unsigned*)0x40010810=1;__asm__ volatile(".rept 20; nop; .endr");*(volatile unsigned*)0x40010814=1;':'*(volatile unsigned*)0x40005004=1;__asm__ volatile("nop");*(volatile unsigned*)0x40005004=0;'}}}cf_delay_us(100);break;
case 'L':for(p=0;p<6;p++){mode(p,1);wr(p,0);}nibble(3,0);cf_delay_ms(5);nibble(3,0);cf_delay_ms(1);nibble(3,0);nibble(2,0);lcd(0x28,0);lcd(0x0c,0);lcd(6,0);lcd(1,0);cf_delay_ms(2);lcd('C',1);lcd(0xc0,0);lcd('2',1);break;
case 'O':low(0);cf_delay_us(500);release(0);cf_delay_us(70);out(!rd(0));cf_delay_us(430);break;
case 'T':v=byte();for(unsigned b=0;b<8;b++){low(0);cf_delay_us(v&(1<<b)?3:60);release(0);cf_delay_us(v&(1<<b)?60:3);}break;
case 'U':n=byte();while(n--){v=0;for(unsigned b=0;b<8;b++){low(0);cf_delay_us(3);release(0);cf_delay_us(10);if(rd(0))v|=1u<<b;cf_delay_us(50);}out(v);}break;
case 'H':low(0);cf_delay_ms(19);release(0);cf_delay_us(40);out(!rd(0));for(n=0;n<10000&&!rd(0);n++);for(n=0;n<10000&&rd(0);n++);for(a=0;a<5;a++){v=0;for(p=0;p<8;p++){for(n=0;n<10000&&!rd(0);n++);cf_delay_us(35);v=v*2+rd(0);for(n=0;n<10000&&rd(0);n++);}out(v);}break;
case 'P':n=byte();n=n*256+byte();wr(0,1);cf_delay_us(n);wr(0,0);break;
case '!':cf_uart_write('!');break;
default:cf_uart_write('?');return 1;}}}
`;}
async function image(family){if(!images.has(family))images.set(family,(async()=>{const t=targets[family],m=await clang,s=source(t);return family==='esp32'?(await compileESP(m,s,t.board,[],'c')).image:family==='stm32'?(await compileSTM(m,s,t.board)).image:(await compileTiva(m,s)).image;})());return images.get(family);}
export function component(type,id=type,params={}){return{type,id,x:350,y:40,rotation:0,params:{...partDefaults(type),...({resistor:{ohms:1000},led:{color:'red'},button:{pressed:false},spdt:{position:'left'},pot:{value:50},sensor:{value:50},supply:{voltage:5}}[type]||{}),...params}};}
export class CBoard {
 static async create(family){const t=targets[family],bytes=await image(family);let r;if(family==='esp32'){await ESPRuntime.initialize(await readFile('dist/esp32/pkg/esp_emu_bg.wasm'));r=new ESPRuntime(bytes,{chip:t.board});}else if(family==='stm32'){await STMRuntime.initialize(await readFile('dist/stm32/cortex-m3.wasm'));r=await new STMRuntime(bytes,{chip:t.board}).load();}else{await TivaRuntime.initialize(await readFile('dist/tiva/cortex-m4f.wasm'));r=await new TivaRuntime(bytes).load();}const b=new CBoard(family,r);await b.until();return b;}
 constructor(family,r){this.family=family;this.r=r;this.target=targets[family];this.output='';}
 async until(){for(let i=0;i<25000;i++){this.output+=this.r.step(1000);if(this.output.includes('!')){const at=this.output.indexOf('!'),value=this.output.slice(0,at);this.output=this.output.slice(at+1);return value;}}throw Error(this.family+' C firmware timeout: '+this.output);}
 project(types=[],links=[]){const p=createUnifiedProject({board:this.target.board,language:this.family==='avr'?'arduino':'c',starter:'empty'});p.components=p.components.filter(c=>c.type==='board');p.components.push(...types.map(t=>typeof t==='string'?component(t):t));p.wires=links.map(([a,b],i)=>({id:'v074-w'+i,from:typeof a==='number'?'mcu:'+this.target.pins[a]:a.startsWith('@')?'mcu:'+a.slice(1):a,to:typeof b==='number'?'mcu:'+this.target.pins[b]:b.startsWith('@')?'mcu:'+b.slice(1):b,color:'#14b8a6'}));if(this.r.circuit)this.r.circuit.update(p);else this.r.attachCircuit(p);this.p=p;return p;}
 async exec(commands){let answer='',batch='';const flush=async()=>{if(batch){this.r.queueSerial(batch+'!');answer+=await this.until();batch='';}};for(let at=0;at<commands.length;){const op=commands[at],length=op==='J'?5+2*parseInt(commands.slice(at+3,at+5),16):op==='V'?3+2*parseInt(commands.slice(at+1,at+3),16):({M:3,W:3,R:2,D:5,S:3,Q:5,L:1,O:1,T:3,U:3,H:1,P:5,Y:3,X:1,Z:1,N:1,I:1}[op]);if(!length)throw Error('Unknown C command '+op);if(batch.length+length>(this.serialBatchLimit??60))await flush();batch+=commands.slice(at,at+length);at+=length;}await flush();return answer;}
 // Only use for firmware delay commands in fixtures with no pending bus edges.
 // STM uses its deterministic native elapsed-cycles API for passive warmup.
 // Other CPUs execute the delay; these startup waits need no GPIO
 // observation until completion. Never used for RC, pulses or interrupt tests.
 async startupWait(us){if(this.family==='stm32'){this.r.exports.elapsed(this.r.cpu,Math.round(us*this.r.board.hz/1000000));this.c.refresh(true);return;}for(let left=us;left>0;left-=60000){this.r.queueSerial(delay(Math.min(left,60000))+'!');let done=false;for(let n=0;n<1000;n++){const c=this.c;this.r.circuit=null;let output;try{output=this.family==='esp32'?this.r.emulator.run_batch(100000):this.family==='stm32'?this.r.runCPU(100000):this.r.step(100000);}finally{this.r.circuit=c;}if(output.includes('!')){assertEmpty(output.replace('!',''));done=true;break;}}if(!done)throw Error('Startup C delay timeout');this.c.refresh(true);}}
 get c(){return this.r.circuit;}
 voltage(ep){return this.c.solution.voltages.get(this.c.solution.netlist.net(ep));}
 snapshot(){return this.c.snapshot();}
 dispose(){this.r.dispose();}
}
export const hx=n=>(n&255).toString(16).toUpperCase().padStart(2,'0');
function assertEmpty(value){if(value)throw Error('Unexpected startup UART '+value);}
export const delay=us=>'D'+hx(us>>8)+hx(us);
export const i2c=(addr,bytes)=>'J'+hx(addr)+hx(bytes.length)+bytes.map(hx).join('');
export const i2cRead=(addr,count)=>'Q'+hx(addr)+hx(count);
export const modes=(n,mode=1)=>Array.from({length:n},(_,i)=>'M'+i+mode+'W'+i+'0').join('');
