import {usbClassHeader} from './pico-usb-classes.js';
import {cyw43Header} from './pico-cyw43-compat.js';
export function advancedHeaders(board){return{
 'pico/multicore.h':`#pragma once
#include <pico/stdlib.h>
void multicore_launch_core1(void(*)(void));void multicore_reset_core1(void);void multicore_launch_core1_with_stack(void(*)(void),uint32_t*,unsigned);
void multicore_fifo_push_blocking(uint32_t);uint32_t multicore_fifo_pop_blocking(void);bool multicore_fifo_rvalid(void);bool multicore_fifo_wready(void);void multicore_fifo_drain(void);uint get_core_num(void);
`,
 'hardware/dma.h':`#pragma once
#include <pico/stdlib.h>
typedef struct {uint32_t ctrl;} dma_channel_config;
#define DMA_SIZE_8 0
#define DMA_SIZE_16 1
#define DMA_SIZE_32 2
#define DREQ_FORCE 63
dma_channel_config dma_channel_get_default_config(uint);void channel_config_set_transfer_data_size(dma_channel_config*,uint);void channel_config_set_read_increment(dma_channel_config*,bool);void channel_config_set_write_increment(dma_channel_config*,bool);void channel_config_set_dreq(dma_channel_config*,uint);void channel_config_set_chain_to(dma_channel_config*,uint);void channel_config_set_ring(dma_channel_config*,bool,uint);void channel_config_set_bswap(dma_channel_config*,bool);void channel_config_set_irq_quiet(dma_channel_config*,bool);
void dma_channel_set_irq0_enabled(uint,bool);void dma_channel_set_irq1_enabled(uint,bool);void dma_irqn_set_channel_enabled(uint,uint,bool);bool dma_irqn_get_channel_status(uint,uint);void dma_irqn_acknowledge_channel(uint,uint);void dma_channel_acknowledge_irq0(uint);void dma_channel_acknowledge_irq1(uint);void dma_channel_abort(uint);
int dma_claim_unused_channel(bool);void dma_channel_unclaim(uint);bool dma_channel_is_busy(uint);void dma_channel_wait_for_finish_blocking(uint);void dma_channel_configure(uint,const dma_channel_config*,volatile void*,const void*,uint32_t,bool);void dma_start_channel_mask(uint32_t);void dma_channel_set_read_addr(uint,const void*,bool);void dma_channel_set_write_addr(uint,volatile void*,bool);void dma_channel_set_trans_count(uint,uint32_t,bool);
`,
 'hardware/pio.h':`#pragma once
#include <pico/stdlib.h>
typedef struct {volatile uint32_t clkdiv,execctrl,shiftctrl,addr,instr,pinctrl;} pio_sm_hw_t;
typedef struct {volatile uint32_t ctrl,fstat,fdebug,flevel,txf[4],rxf[4],irq,irq_force,input_sync_bypass,dbg_padout,dbg_padoe,dbg_cfginfo,instr_mem[32];pio_sm_hw_t sm[4];} pio_hw_t;
typedef pio_hw_t* PIO;
#define pio0 ((PIO)0x50200000u)
#define pio1 ((PIO)0x50300000u)
${board.mcu==='RP2350'?'#define pio2 ((PIO)0x50400000u)':''}
typedef struct {uint32_t clkdiv,execctrl,shiftctrl,pinctrl;} pio_sm_config;
typedef struct pio_program {const uint16_t*instructions;uint8_t length;int8_t origin;} pio_program_t;
enum pio_src_dest {pio_pins=0,pio_x=1,pio_y=2,pio_null=3,pio_pindirs=4,pio_exec_mov=4,pio_status=5,pio_isr=6,pio_osr=7};
pio_sm_config pio_get_default_sm_config(void);void sm_config_set_wrap(pio_sm_config*,uint,uint);void sm_config_set_set_pins(pio_sm_config*,uint,uint);void sm_config_set_out_pins(pio_sm_config*,uint,uint);void sm_config_set_in_pins(pio_sm_config*,uint);void sm_config_set_out_shift(pio_sm_config*,bool,bool,uint);void sm_config_set_in_shift(pio_sm_config*,bool,bool,uint);void sm_config_set_clkdiv_int_frac(pio_sm_config*,uint16_t,uint8_t);
int pio_add_program(PIO,const pio_program_t*);bool pio_can_add_program(PIO,const pio_program_t*);void pio_remove_program(PIO,const pio_program_t*,uint);int pio_claim_unused_sm(PIO,bool);void pio_sm_unclaim(PIO,uint);
int pio_sm_init(PIO,uint,uint,const pio_sm_config*);void pio_sm_set_enabled(PIO,uint,bool);void pio_gpio_init(PIO,uint);void pio_sm_set_consecutive_pindirs(PIO,uint,uint,uint,bool);void pio_sm_exec(PIO,uint,uint);void pio_sm_put_blocking(PIO,uint,uint32_t);uint32_t pio_sm_get_blocking(PIO,uint);bool pio_sm_is_tx_fifo_full(PIO,uint);bool pio_sm_is_rx_fifo_empty(PIO,uint);uint pio_get_dreq(PIO,uint,bool);
static inline uint pio_encode_set(enum pio_src_dest d,uint v){return 0xe000u|((uint)d<<5)|(v&31);}
static inline uint pio_encode_out(enum pio_src_dest d,uint n){return 0x6000u|((uint)d<<5)|(n&31);}
static inline uint pio_encode_in(enum pio_src_dest d,uint n){return 0x4000u|((uint)d<<5)|(n&31);}
static inline uint pio_encode_pull(bool e,bool b){return 0x8080u|(e?64:0)|(b?32:0);}
static inline uint pio_encode_push(bool e,bool b){return 0x8000u|(e?64:0)|(b?32:0);}
static inline uint pio_encode_jmp(uint a){return a&31;}static inline uint pio_encode_nop(void){return 0xa042u;}static inline uint pio_encode_delay(uint n){return(n&31)<<8;}
`,
 'hardware/pio_instructions.h':'#pragma once\n#include <hardware/pio.h>\n',
 'pico/stdio_usb.h':`#pragma once
#include <pico/stdlib.h>
bool stdio_usb_init(void);bool stdio_usb_connected(void);
`,
 'tusb.h':`#pragma once
#include <pico/stdlib.h>
bool tud_init(uint8_t);void tud_task(void);bool tud_mounted(void);bool tud_cdc_connected(void);uint32_t tud_cdc_available(void);uint32_t tud_cdc_read(void*,uint32_t);int32_t tud_cdc_read_char(void);uint32_t tud_cdc_write(const void*,uint32_t);uint32_t tud_cdc_write_char(char);uint32_t tud_cdc_write_flush(void);
${usbClassHeader}
`,
 ...(board.wireless?{'cyw43.h':cyw43Header,'pico/cyw43_arch.h':`#pragma once
#include <pico/stdlib.h>
#include <cyw43.h>
#define CYW43_AUTH_OPEN 0
#define CYW43_AUTH_WPA2_AES_PSK 0x00400004u
#define CYW43_WL_GPIO_LED_PIN 0
#define CYW43_WL_GPIO_SMPS_PIN 1
#define CYW43_WL_GPIO_VBUS_PIN 2
#define CYW43_WL_GPIO_COUNT 3
#define CYW43_ITF_STA 0
int cyw43_arch_init(void);void cyw43_arch_deinit(void);void cyw43_arch_enable_sta_mode(void);int cyw43_arch_wifi_connect_timeout_ms(const char*,const char*,uint32_t,uint32_t);void cyw43_arch_gpio_put(uint,bool);bool cyw43_arch_gpio_get(uint);void cyw43_arch_poll(void);
int cyw43_arch_wifi_connect_async(const char*,const char*,uint32_t);void cyw43_arch_disable_sta_mode(void);
`,'wirevo/net.h':`#pragma once
#include <pico/stdlib.h>
// Explicit simulator network: virtual AP + local UDP echo, no Internet or CYW43 binary.
int wirevo_net_link_status(void);int wirevo_udp_send(const char*,uint16_t,const void*,uint);int wirevo_udp_recv(void*,uint);
int wirevo_ble_advertise(const char*);bool wirevo_ble_connected(void);int wirevo_ble_write(const void*,uint);int wirevo_ble_read(void*,uint);
`}:{})};}
export function advancedRuntimeC(board){const gen2=board.mcu==='RP2350',writeShift=gen2?6:5,chainShift=gen2?13:11,treqShift=gen2?17:15,busy=gen2?26:24;return`
#include <pico/multicore.h>
#include <hardware/dma.h>
#include <hardware/pio.h>
#define CF_SERVICE 0x5fffe000u
static unsigned cf_core1_stack[512] __attribute__((aligned(8)));static void(*cf_core1_entry)(void);
static void cf_core1_trampoline(void){cf_irq_init();cf_core1_entry();for(;;)__asm__ volatile("nop");}
uint get_core_num(void){return REG(0xd0000000u);}
void multicore_reset_core1(void){REG(CF_SERVICE+8)=0;}
void multicore_launch_core1_with_stack(void(*entry)(void),uint32_t*stack,unsigned bytes){cf_core1_entry=entry;REG(CF_SERVICE+4)=(unsigned)stack+bytes;REG(CF_SERVICE+8)=(unsigned)cf_core1_trampoline;}
void multicore_launch_core1(void(*entry)(void)){multicore_launch_core1_with_stack(entry,cf_core1_stack,sizeof cf_core1_stack);}
bool multicore_fifo_rvalid(void){return !!(REG(0xd0000050u)&1);}bool multicore_fifo_wready(void){return !!(REG(0xd0000050u)&2);}
void multicore_fifo_push_blocking(uint32_t v){while(!multicore_fifo_wready()){}REG(0xd0000054u)=v;}
uint32_t multicore_fifo_pop_blocking(void){while(!multicore_fifo_rvalid()){}return REG(0xd0000058u);}void multicore_fifo_drain(void){while(multicore_fifo_rvalid())(void)REG(0xd0000058u);}
static unsigned cf_dma_claimed;
void channel_config_set_ring(dma_channel_config*c,bool write,uint bits){c->ctrl=(c->ctrl&~(31u<<${gen2?8:6}))|((bits&15)<<${gen2?8:6})|(write?1u<<${gen2?12:10}:0);}
void channel_config_set_bswap(dma_channel_config*c,bool e){c->ctrl=(c->ctrl&~(1u<<${gen2?24:22}))|(e?1u<<${gen2?24:22}:0);}
void channel_config_set_irq_quiet(dma_channel_config*c,bool e){c->ctrl=(c->ctrl&~(1u<<${gen2?23:21}))|(e?1u<<${gen2?23:21}:0);}
void dma_irqn_set_channel_enabled(uint n,uint ch,bool e){if(n<${gen2?4:2}&&ch<${gen2?16:12}){unsigned a=0x50000404u+n*16,mask=1u<<ch;REG(a)=e?REG(a)|mask:REG(a)&~mask;}}
void dma_channel_set_irq0_enabled(uint ch,bool e){dma_irqn_set_channel_enabled(0,ch,e);}void dma_channel_set_irq1_enabled(uint ch,bool e){dma_irqn_set_channel_enabled(1,ch,e);}
bool dma_irqn_get_channel_status(uint n,uint ch){return n<${gen2?4:2}&&ch<${gen2?16:12}&&!!(REG(0x5000040cu+n*16)&(1u<<ch));}
void dma_irqn_acknowledge_channel(uint n,uint ch){if(n<${gen2?4:2}&&ch<${gen2?16:12})REG(0x5000040cu+n*16)=1u<<ch;}
void dma_channel_acknowledge_irq0(uint ch){dma_irqn_acknowledge_channel(0,ch);}void dma_channel_acknowledge_irq1(uint ch){dma_irqn_acknowledge_channel(1,ch);}
void dma_channel_abort(uint ch){if(ch<${gen2?16:12}){REG(${gen2?'0x50000464u':'0x50000444u'})=1u<<ch;while(REG(${gen2?'0x50000464u':'0x50000444u'})&(1u<<ch)){} }}

dma_channel_config dma_channel_get_default_config(uint ch){dma_channel_config c={1u|(2u<<2)|(1u<<4)|(ch<<${chainShift})|(63u<<${treqShift})};return c;}
void channel_config_set_transfer_data_size(dma_channel_config*c,uint n){c->ctrl=(c->ctrl&~12u)|((n&3)<<2);}
void channel_config_set_read_increment(dma_channel_config*c,bool e){c->ctrl=(c->ctrl&~16u)|(e?16u:0);}
void channel_config_set_write_increment(dma_channel_config*c,bool e){c->ctrl=(c->ctrl&~(1u<<${writeShift}))|(e?(1u<<${writeShift}):0);}
void channel_config_set_dreq(dma_channel_config*c,uint d){c->ctrl=(c->ctrl&~(63u<<${treqShift}))|((d&63)<<${treqShift});}
void channel_config_set_chain_to(dma_channel_config*c,uint d){c->ctrl=(c->ctrl&~(15u<<${chainShift}))|((d&15)<<${chainShift});}
int dma_claim_unused_channel(bool required){for(unsigned i=0;i<${gen2?16:12};i++)if(!(cf_dma_claimed&(1u<<i))){cf_dma_claimed|=1u<<i;return i;}(void)required;return -1;}
void dma_channel_unclaim(uint ch){cf_dma_claimed&=~(1u<<ch);}
bool dma_channel_is_busy(uint ch){return !!(REG(0x5000000cu+ch*64)&(1u<<${busy}));}void dma_channel_wait_for_finish_blocking(uint ch){while(dma_channel_is_busy(ch)){} }
void dma_channel_configure(uint ch,const dma_channel_config*c,volatile void*dst,const void*src,uint32_t count,bool trigger){unsigned a=0x50000000u+ch*64;REG(a+0x10)=c->ctrl;REG(a)=(unsigned)src;REG(a+4)=(unsigned)dst;REG(a+8)=count;if(trigger)REG(a+12)=c->ctrl;}
void dma_start_channel_mask(uint32_t mask){REG(${gen2?'0x50000450u':'0x50000430u'})=mask;}
void dma_channel_set_read_addr(uint ch,const void*p,bool t){REG(0x50000000u+ch*64+(t?0x3c:0))=(unsigned)p;}
void dma_channel_set_write_addr(uint ch,volatile void*p,bool t){REG(0x50000000u+ch*64+(t?0x2c:4))=(unsigned)p;}
void dma_channel_set_trans_count(uint ch,uint32_t n,bool t){REG(0x50000000u+ch*64+(t?0x1c:8))=n;}
static unsigned cf_pio_used[${gen2?3:2}],cf_pio_claimed[${gen2?3:2}];
static unsigned cf_pio_index(PIO p){return ((unsigned)p-0x50200000u)/0x100000u;}
pio_sm_config pio_get_default_sm_config(void){pio_sm_config c={65536u,31u<<12,(1u<<18)|(1u<<19),0};return c;}
void sm_config_set_wrap(pio_sm_config*c,uint b,uint t){c->execctrl=(c->execctrl&~((31u<<7)|(31u<<12)))|((b&31)<<7)|((t&31)<<12);}
void sm_config_set_set_pins(pio_sm_config*c,uint b,uint n){c->pinctrl=(c->pinctrl&~((31u<<5)|(7u<<26)))|((b&31)<<5)|((n&7)<<26);}
void sm_config_set_out_pins(pio_sm_config*c,uint b,uint n){c->pinctrl=(c->pinctrl&~(31u|(63u<<20)))|(b&31)|((n&63)<<20);}
void sm_config_set_in_pins(pio_sm_config*c,uint b){c->pinctrl=(c->pinctrl&~(31u<<15))|((b&31)<<15);}
void sm_config_set_out_shift(pio_sm_config*c,bool r,bool a,uint n){c->shiftctrl=(c->shiftctrl&~((1u<<19)|(1u<<17)|(31u<<25)))|(r?1u<<19:0)|(a?1u<<17:0)|((n&31)<<25);}
void sm_config_set_in_shift(pio_sm_config*c,bool r,bool a,uint n){c->shiftctrl=(c->shiftctrl&~((1u<<18)|(1u<<16)|(31u<<20)))|(r?1u<<18:0)|(a?1u<<16:0)|((n&31)<<20);}
void sm_config_set_clkdiv_int_frac(pio_sm_config*c,uint16_t i,uint8_t f){c->clkdiv=((unsigned)i<<16)|((unsigned)f<<8);}
static int cf_pio_offset(PIO p,const pio_program_t*prog){if(!prog||!prog->length||prog->length>32)return -1;for(unsigned i=0;i+prog->length<=32;i++){if(prog->origin>=0&&i!=(unsigned)prog->origin)continue;unsigned mask=prog->length==32?~0u:((1u<<prog->length)-1)<<i;if(!(cf_pio_used[cf_pio_index(p)]&mask))return i;}return -1;}
bool pio_can_add_program(PIO p,const pio_program_t*prog){return cf_pio_offset(p,prog)>=0;}
int pio_add_program(PIO p,const pio_program_t*prog){int off=cf_pio_offset(p,prog);if(off<0)return -1;for(unsigned i=0;i<prog->length;i++){unsigned ins=prog->instructions[i];if((ins&0xe000)==0)ins=(ins&~31u)|((ins+off)&31);p->instr_mem[off+i]=ins;}cf_pio_used[cf_pio_index(p)]|=prog->length==32?~0u:((1u<<prog->length)-1)<<off;return off;}
void pio_remove_program(PIO p,const pio_program_t*prog,uint off){cf_pio_used[cf_pio_index(p)]&=~(prog->length==32?~0u:((1u<<prog->length)-1)<<off);}
int pio_claim_unused_sm(PIO p,bool required){unsigned i=cf_pio_index(p);for(unsigned n=0;n<4;n++)if(!(cf_pio_claimed[i]&(1u<<n))){cf_pio_claimed[i]|=1u<<n;return n;}(void)required;return -1;}
void pio_sm_unclaim(PIO p,uint sm){cf_pio_claimed[cf_pio_index(p)]&=~(1u<<sm);}
void pio_sm_set_enabled(PIO p,uint sm,bool e){p->ctrl=(p->ctrl&~(1u<<sm))|(e?1u<<sm:0);}
int pio_sm_init(PIO p,uint sm,uint pc,const pio_sm_config*cfg){if(sm>3||pc>31)return -1;pio_sm_config def=pio_get_default_sm_config();if(!cfg)cfg=&def;pio_sm_set_enabled(p,sm,0);p->sm[sm].clkdiv=cfg->clkdiv;p->sm[sm].execctrl=cfg->execctrl;p->sm[sm].shiftctrl=cfg->shiftctrl^(1u<<31);p->sm[sm].shiftctrl=cfg->shiftctrl;p->sm[sm].pinctrl=cfg->pinctrl;p->ctrl|=1u<<(sm+4);p->sm[sm].instr=pio_encode_jmp(pc);return 0;}
void pio_gpio_init(PIO p,uint pin){gpio_init(pin);gpio_set_function(pin,6+cf_pio_index(p));}
void pio_sm_exec(PIO p,uint sm,uint ins){p->sm[sm].instr=ins;}
void pio_sm_set_consecutive_pindirs(PIO p,uint sm,uint base,uint count,bool out){unsigned old=p->sm[sm].pinctrl;for(unsigned i=0;i<count;i++){p->sm[sm].pinctrl=(old&~((31u<<5)|(7u<<26)))|(((base+i)&31)<<5)|(1u<<26);pio_sm_exec(p,sm,pio_encode_set(pio_pindirs,out?1:0));}p->sm[sm].pinctrl=old;}
bool pio_sm_is_tx_fifo_full(PIO p,uint sm){return !!(p->fstat&(1u<<(16+sm)));}bool pio_sm_is_rx_fifo_empty(PIO p,uint sm){return !!(p->fstat&(1u<<(8+sm)));}
void pio_sm_put_blocking(PIO p,uint sm,uint32_t n){while(pio_sm_is_tx_fifo_full(p,sm)){}p->txf[sm]=n;}uint32_t pio_sm_get_blocking(PIO p,uint sm){while(pio_sm_is_rx_fifo_empty(p,sm)){}return p->rxf[sm];}
uint pio_get_dreq(PIO p,uint sm,bool tx){return cf_pio_index(p)*8+sm+(tx?0:4);}
`;}
