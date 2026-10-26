import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{gunzipSync}from'node:zlib';
import{compilePico}from'../src/pico-compiler.js';import{PicoRuntime}from'../dist/pico-runtime.js';import{PICO_BOARDS}from'../dist/pico-boards.js';import{validatePicoImage,packPicoImage}from'../dist/pico-image.js';import{createPicoProject}from'../dist/pico-project.js';
import{validateProject}from'../dist/core.js';import{unifiedExamples}from'../dist/unified-project.js';
const module=await WebAssembly.compile(gunzipSync(readFileSync(new URL('../dist/esp32/compiler/clang.wasm.gz',import.meta.url))));
test('new virtual AP settings survive JSON; wireless examples only appear on W models',()=>{for(const id of Object.keys(PICO_BOARDS)){const p=createPicoProject({board:id,starter:'usb'});p.settings.picoNetwork={ssid:'Lab',password:'test1234',enabled:false};const next=validateProject(JSON.parse(JSON.stringify(p)));assert.deepEqual(next.settings.picoNetwork,p.settings.picoNetwork);assert.equal(unifiedExamples(p).some(e=>e.id==='radio'),PICO_BOARDS[id].wireless);}});
for(const id of ['pico','pico-2-w'])test(id+' new bundled dual-core/PIO/DMA example executes FIFO response',async()=>{const p=createPicoProject({board:id,starter:'advanced'}),f=await compilePico(module,p.code,id),r=new PicoRuntime(f.image,id);try{let out='';for(let i=0;i<20&&!out.includes('42');i++)out+=r.step(1000);assert.match(out,/Core 1 cevabi: 42/);assert.equal(r.services.core1,true);}finally{r.dispose();}});
const source=`#include <pico/stdlib.h>
#include <pico/multicore.h>
#include <hardware/dma.h>
#include <hardware/pio.h>
#include <tusb.h>
#include <pico/stdio_usb.h>
#include <stdio.h>
volatile unsigned shared,core_id,dma_result,usb_ready,received;
void second(void){core_id=get_core_num();unsigned n=multicore_fifo_pop_blocking();shared=n+1;multicore_fifo_push_blocking(shared);while(1){tight_loop_contents();}}
int main(void){
 unsigned src[4]={11,22,33,44},dst[4]={0};int ch=dma_claim_unused_channel(false);dma_channel_config dc=dma_channel_get_default_config(ch);channel_config_set_write_increment(&dc,true);dma_channel_configure(ch,&dc,dst,src,4,true);dma_channel_wait_for_finish_blocking(ch);dma_result=dst[0]+dst[1]+dst[2]+dst[3];
 multicore_launch_core1(second);multicore_fifo_push_blocking(41);unsigned answer=multicore_fifo_pop_blocking();if(answer!=42)shared=999;
 const uint16_t instructions[]={0xe001,0xe000};const pio_program_t prog={instructions,2,-1};int offset=pio_add_program(pio0,&prog);pio_sm_config pc=pio_get_default_sm_config();sm_config_set_set_pins(&pc,15,1);sm_config_set_wrap(&pc,offset,offset+1);sm_config_set_clkdiv_int_frac(&pc,10000,0);pio_sm_init(pio0,0,offset,&pc);pio_gpio_init(pio0,15);pio_sm_set_consecutive_pindirs(pio0,0,15,1,true);pio_sm_set_enabled(pio0,0,true);
 stdio_usb_init();while(!stdio_usb_connected()){tud_task();}usb_ready=1;puts("USB CDC OK");while(!tud_cdc_available()){tud_task();}received=tud_cdc_read_char();tud_cdc_write_char((char)received);
 while(1){tud_task();}
}
`;
const firmware=new Map();for(const id of ['pico','pico-2'])firmware.set(PICO_BOARDS[id].mcu,await compilePico(module,source,id));
function value(r,name){const v=r.debugger.info.variables.find(v=>v.name===name);return r.debugger.readVariable(v).value;}
for(const id of Object.keys(PICO_BOARDS))test(id+' new DMA copy + two native cores/FIFO + PIO waveform + USB enumeration/CDC RX/TX',()=>{const b=PICO_BOARDS[id],f=firmware.get(b.mcu),raw=validatePicoImage(f.image,b.mcu==='RP2040'?'pico':'pico-2'),r=new PicoRuntime(packPicoImage(raw,id),id);try{r.attachCircuit(createPicoProject({board:id}));r.setDebugInfo(f.debugInfo);let output='',fed=false;const edges=[];r.rp.gpio[15].addListener(v=>edges.push(v));for(let n=0;n<1600;n++){output+=r.step(1000);if(r.usbHost.initialized&&!fed){r.queueSerial('Z');fed=true;}if(value(r,'received')===90&&output.includes('Z'))break;}assert.equal(value(r,'dma_result'),110);assert.equal(value(r,'core_id'),1);assert.equal(value(r,'shared'),42);assert.ok(r.rp.core[1].cycles>0);assert.ok(edges.includes(0)&&edges.includes(1));assert.equal(value(r,'usb_ready'),1);assert.equal(r.usbHost.initialized,true);assert.equal(value(r,'received'),90);assert.match(output,/USB CDC OK/);assert.match(output,/Z/);}finally{r.dispose();}});
for(const id of ['pico-w','pico-wh','pico-2-w','pico-2-w-headers'])test(id+' virtual radio authenticates AP, rejects wrong password, UDP echoes real payload',async()=>{const src=`#include <pico/stdlib.h>
#include <pico/cyw43_arch.h>
#include <wirevo/net.h>
volatile int bad,good,sent,got;volatile unsigned result,led;
int main(void){cyw43_arch_init();cyw43_arch_enable_sta_mode();bad=cyw43_arch_wifi_connect_timeout_ms("WirevoLab","wrong",CYW43_AUTH_WPA2_AES_PSK,20);good=cyw43_arch_wifi_connect_timeout_ms("WirevoLab","wirevo1234",CYW43_AUTH_WPA2_AES_PSK,20);unsigned char tx[3]={10,20,30},rx[3]={0};sent=wirevo_udp_send("192.168.4.1",7,tx,3);got=wirevo_udp_recv(rx,3);result=rx[0]+rx[1]+rx[2];cyw43_arch_gpio_put(0,true);led=cyw43_arch_gpio_get(0);while(1){tight_loop_contents();}}`;
 const f=await compilePico(module,src,id),r=new PicoRuntime(f.image,id);try{r.setDebugInfo(f.debugInfo);for(let i=0;i<200&&value(r,'led')!==1;i++)r.step(1000);assert.equal(value(r,'bad'),-1);assert.equal(value(r,'good'),0);assert.equal(value(r,'sent'),3);assert.equal(value(r,'got'),3);assert.equal(value(r,'result'),60);assert.equal(value(r,'led'),1);assert.equal(r.services.snapshot().radio.link,3);}finally{r.dispose();}});
test('non-wireless Pico rejects integrated CYW43 header',async()=>{await assert.rejects(compilePico(module,'#include <pico/cyw43_arch.h>\nint main(void){return 0;}','pico'),/not found/);});
for(const id of ['pico-w','pico-wh','pico-2-w','pico-2-w-headers'])test(id+' virtual BLE host exchange executes native C receive/write and reset clears link',async()=>{const f=await compilePico(module,'#include <pico/stdlib.h>\n#include <pico/cyw43_arch.h>\n#include <wirevo/net.h>\nvolatile unsigned done;int main(void){cyw43_arch_init();wirevo_ble_advertise("PicoLab");while(!wirevo_ble_connected()){}unsigned char data[4];while(wirevo_ble_read(data,4)!=4){}wirevo_ble_write(data,4);done=1;while(1){}}',id),r=new PicoRuntime(f.image,id);try{r.setDebugInfo(f.debugInfo);r.step(2000);assert.equal(r.services.ble.name,'PicoLab');assert.throws(()=>r.services.bleCommand({action:'send',text:'PING'}));r.services.bleCommand({action:'connect'});r.services.bleCommand({action:'send',text:'PING'});for(let i=0;i<10&&!value(r,'done');i++)r.step(1000);assert.equal(value(r,'done'),1);assert.equal(r.services.snapshot().radio.ble.received,'PING');r.reset();assert.equal(r.services.snapshot().radio.ble,null);}finally{r.dispose();}});
for(const id of ['pico','pico-2'])test(id+' DMA paced by PIO TX DREQ drains beyond FIFO depth',async()=>{const f=await compilePico(module,`#include <pico/stdlib.h>
#include <hardware/pio.h>
#include <hardware/dma.h>
volatile unsigned finished;
int main(void){
 const uint16_t code[]={0x80a0,0x6001};const pio_program_t prog={code,2,-1};
#if PICO_RP2350
 PIO p=pio2;
#else
 PIO p=pio1;
#endif
 int off=pio_add_program(p,&prog);pio_sm_config cfg=pio_get_default_sm_config();sm_config_set_wrap(&cfg,off,off+1);sm_config_set_out_pins(&cfg,15,1);pio_sm_init(p,0,off,&cfg);pio_gpio_init(p,15);pio_sm_set_consecutive_pindirs(p,0,15,1,true);
 unsigned words[12]={1,0,1,0,1,0,1,0,1,0,1,0};int ch=dma_claim_unused_channel(false);dma_channel_config dc=dma_channel_get_default_config(ch);channel_config_set_dreq(&dc,pio_get_dreq(p,0,true));dma_channel_configure(ch,&dc,&p->txf[0],words,12,true);pio_sm_set_enabled(p,0,true);dma_channel_wait_for_finish_blocking(ch);finished=1;while(1){tight_loop_contents();}}
`,id),r=new PicoRuntime(f.image,id);try{r.setDebugInfo(f.debugInfo);const edges=[];r.rp.gpio[15].addListener(v=>edges.push(v));for(let i=0;i<60&&!value(r,'finished');i++)r.step(1000);r.step(1000);assert.equal(value(r,'finished'),1);assert.ok(edges.filter(v=>v===1).length>=6);assert.equal(r.rp.dma.channels[0].transCount,0);}finally{r.dispose();}});
