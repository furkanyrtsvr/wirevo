import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {gunzipSync} from 'node:zlib';
import {compilePico} from '../src/pico-compiler.js';import {PicoRuntime} from '../dist/pico-runtime.js';import {PICO_BOARDS} from '../dist/pico-boards.js';import {packPicoImage,validatePicoImage} from '../dist/pico-image.js';import {createPicoProject} from '../dist/pico-project.js';
const wasm=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
export const source=`#include <pico/stdlib.h>
#include <hardware/spi.h>
#include <hardware/uart.h>
#include <hardware/irq.h>
#include <hardware/adc.h>
#include <stdio.h>
volatile unsigned errors,received,done,rx0,rx1;
void rx_handler(void){while(uart_is_readable(uart1)){(void)uart_getc(uart1);received++;}}
int main(void){
 stdio_init_all();gpio_init(15);gpio_set_dir(15,GPIO_OUT);adc_gpio_init(26);if(*(volatile uint32_t*)((PICO_RP2350?0x40038000u:0x4001c000u)+4+26*4)&64u)errors|=32768;
 spi_inst_t* buses[2]={spi0,spi1};unsigned widths[6]={4,7,8,9,12,16};
 gpio_set_function(16,GPIO_FUNC_SPI);gpio_set_function(18,GPIO_FUNC_SPI);gpio_set_function(19,GPIO_FUNC_SPI);
 gpio_set_function(8,GPIO_FUNC_SPI);gpio_set_function(10,GPIO_FUNC_SPI);gpio_set_function(11,GPIO_FUNC_SPI);
 for(unsigned b=0;b<2;b++){spi_inst_t*s=buses[b];spi_init(s,250000);if(spi_get_index(s)!=b||spi_get_baudrate(s)!=250000)errors|=1;
  for(unsigned w=0;w<6;w++)for(unsigned mode=0;mode<4;mode++){
   unsigned bits=widths[w],mask=(1u<<bits)-1;uint16_t tx[2]={0xa53c,0x192e},rx[2]={0,0},fill=0;
   spi_set_format(s,bits,mode>>1,mode&1,SPI_MSB_FIRST);
   if(spi_write16_read16_blocking(s,tx,rx,2)!=2||rx[0]!=(tx[0]&mask)||rx[1]!=(tx[1]&mask))errors|=2;
   if(spi_read16_blocking(s,0xc387,&fill,1)!=1||fill!=(0xc387&mask))errors|=4;
   if(spi_write16_blocking(s,tx,1)!=1)errors|=8;
  }
  spi_set_format(s,8,0,0,SPI_LSB_FIRST);uint8_t byte=0;if(spi_write_blocking(s,&byte,1)!=-1)errors|=16;
  spi_init(s,100000);uint8_t tx8=0xb6,rx8=0;if(spi_write_read_blocking(s,&tx8,&rx8,1)!=1||rx8!=tx8)errors|=32;
  if(b)rx1=rx8;else rx0=rx8;spi_deinit(s);if(spi_write_blocking(s,&byte,1)!=-1)errors|=64;
 }
 if(uart_init(uart1,57600)<57000||uart_set_baudrate(uart1,57600)>58000)errors|=128;uart_get_hw(uart1)->cr|=128;
 if(uart_get_index(uart1)!=1||!uart_is_enabled(uart1))errors|=128;
 for(unsigned bits=5;bits<=8;bits++){uart_set_format(uart1,bits,2,UART_PARITY_EVEN);if((uart_get_hw(uart1)->lcr_h&0xee)!=(((bits-5)<<5)|14))errors|=256;uart_putc_raw(uart1,255);if(uart_getc(uart1)!=(int)((1u<<bits)-1))errors|=256;}
 uart_set_format(uart1,8,1,UART_PARITY_NONE);uart_set_fifo_enabled(uart1,false);uart_putc_raw(uart1,0x31);uart_putc_raw(uart1,0x32);
 if(uart_getc(uart1)!=0x31||!(uart_get_hw(uart1)->rsr&8))errors|=512;uart_get_hw(uart1)->rsr=0;
 uart_set_fifo_enabled(uart1,true);uart_set_translate_crlf(uart1,true);uart_puts(uart1,"A\\r\\nB\\n");
 uint8_t expected[6]={'A',13,10,'B',13,10};for(unsigned i=0;i<6;i++)if(uart_getc(uart1)!=expected[i])errors|=1024;
 uint32_t start=time_us_32();if(uart_is_readable_within_us(uart1,30)||time_us_32()-start<30)errors|=2048;
 irq_set_exclusive_handler(UART1_IRQ,rx_handler);uart_set_irqs_enabled(uart1,true,false);irq_set_enabled(UART1_IRQ,true);
 uart_putc_raw(uart1,0x61);sleep_us(800);if(received!=1)errors|=4096;
 for(unsigned i=0;i<16;i++)uart_putc_raw(uart1,i);sleep_us(800);if(received!=17)errors|=8192;
 uart_set_irq_enables(uart1,false,false);irq_set_enabled(UART1_IRQ,false);uart_deinit(uart1);uart_putc_raw(uart1,'X');if(uart_is_enabled(uart1)||uart_is_readable(uart1))errors|=16384;
 gpio_put(15,!errors);done=102;puts(errors?"SDK102_FAIL":"SDK102_OK");while(1)tight_loop_contents();
}
`;
const images=new Map();for(const id of ['pico','pico-2'])images.set(PICO_BOARDS[id].mcu,{id,...await compilePico(wasm,source,id)});
function runtime(id){const t=images.get(PICO_BOARDS[id].mcu);return new PicoRuntime(packPicoImage(validatePicoImage(t.image,t.id),id),id);}
for(const id of Object.keys(PICO_BOARDS))test(id+' real C: two SPI buses 4–16 bits/four modes and UART loopback FIFO/IRQ',()=>{const r=runtime(id);try{const p=createPicoProject({board:id});p.wires.push(...[['GPIO19','GPIO16'],['GPIO11','GPIO8']].map(([a,b],i)=>({id:'loop102_'+i,from:'mcu:'+a,to:'mcu:'+b,color:'#14b8a6',points:[]})));r.attachCircuit(p);let out='';for(let i=0;i<3000&&!out.includes('SDK102_OK')&&!out.includes('SDK102_FAIL');i++)out+=r.step(3000);if(!out.includes('SDK102_OK')){r.setDebugInfo(images.get(r.board.mcu).debugInfo);throw Error(out+' '+JSON.stringify(r.debugger.snapshot(true).variables.filter(v=>['errors','done','received','rx0','rx1'].includes(v.name))));}assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);}finally{r.dispose();}});
for(const id of ['pico','pico-2'])test(id+' PL011 threshold, timeout, overflow and disabled RX/TX are register-observable',()=>{const r=runtime(id);try{const u=r.rp.uart[1],write=(a,v)=>u.writeUint32(a,v),read=a=>u.readUint32(a);write(0x2c,0x70);write(0x24,81);write(0x28,24);write(0x30,0);u.feedByte(0xa5);write(0,0x55);assert.equal(u.rxFIFO.itemCount,0);assert.equal(r.serial,'');write(0x30,0x301);write(0x34,0);write(0x38,0x50);for(let i=0;i<3;i++)u.feedByte(i);assert.equal(read(0x40)&16,0);u.feedByte(3);assert.equal(read(0x40)&16,16);read(0);assert.equal(read(0x40)&16,0);r.rp.stepThings(r.hz/100);assert.equal(read(0x40)&64,64);while(u.rxFIFO.itemCount)read(0);assert.equal(read(0x40)&0x50,0);for(let i=0;i<33;i++)u.feedByte(i);assert.equal(u.rxFIFO.itemCount,32);assert.equal(read(4),8);write(0x44,1024);assert.equal(read(4),0);write(0x2c,0x60);assert.equal(u.rxFIFO.itemCount,0);u.feedByte(0xff);assert.equal(read(0x18)&64,64);write(0x30,0x81);write(0,0x66);assert.equal(u.rxFIFO.itemCount,1); // TX disabled
 }finally{r.dispose();}});

for(const id of ['pico','pico-2'])test(id+' terminal input is paced at configured baud even with FIFO disabled',async()=>{const c=await compilePico(wasm,'#include <pico/stdlib.h>\n#include <hardware/uart.h>\n#include <stdio.h>\nint main(void){stdio_init_all();uart_set_fifo_enabled(uart0,false);puts("READY102");uint8_t data[4];uart_read_blocking(uart0,data,4);puts(data[0]==65&&data[1]==66&&data[2]==67&&data[3]==68?"INPUT102_OK":"INPUT102_FAIL");while(1)tight_loop_contents();}\n',id);const r=new PicoRuntime(c.image,id);try{let out='';for(let i=0;i<300&&!out.includes('READY102');i++)out+=r.step(1000);assert.match(out,/READY102/);r.queueSerial('AB');r.queueSerial('CD');out='';for(let i=0;i<500&&!out.includes('INPUT102_OK');i++)out+=r.step(1000);assert.match(out,/INPUT102_OK/);assert.equal(r.rp.uart[0].readUint32(4),0);}finally{r.dispose();}});

for(const id of ['pico','pico-2'])for(const starter of ['uart102','spi102'])test(id+' new selectable '+starter+' example compiles and drives its real circuit',async()=>{const p=createPicoProject({board:id,starter});const c=await compilePico(wasm,p.code,id),r=new PicoRuntime(c.image,id);try{r.attachCircuit(p);let out='',expected=starter==='uart102'?'UART loopback OK':'SPI16 OK';for(let i=0;i<500&&!out.includes(expected);i++)out+=r.step(1000);assert.ok(out.includes(expected),out);assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);}finally{r.dispose();}});
test('Pico 2 Hazard3 runs the new UART SDK example without a desktop helper',async()=>{const p=createPicoProject({board:'pico-2',starter:'uart102',architecture:'riscv'});const c=await compilePico(wasm,p.code,'pico-2',[],'c','riscv'),r=new PicoRuntime(c.image,'pico-2');try{r.attachCircuit(p);let out='';for(let i=0;i<500&&!out.includes('UART loopback OK');i++)out+=r.step(1000);assert.match(out,/UART loopback OK/);r.step(1000);assert.ok(r.circuit.solution.ledResults.get('led1').current>.003);}finally{r.dispose();}});
