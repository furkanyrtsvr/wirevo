export function irqHeaders(board){const n=board.mcu==='RP2350';return {'hardware/irq.h':`#pragma once
#include <pico/stdlib.h>
typedef void (*irq_handler_t)(void);
#define DMA_IRQ_0 ${n?10:11}
#define DMA_IRQ_1 ${n?11:12}
${n?'#define DMA_IRQ_2 12\n#define DMA_IRQ_3 13':''}
#define IO_IRQ_BANK0 ${n?21:13}
#define ADC_IRQ_FIFO ${n?35:22}
#define PIO0_IRQ_0 ${n?15:7}
#define PIO0_IRQ_1 ${n?16:8}
#define PIO1_IRQ_0 ${n?17:9}
#define PIO1_IRQ_1 ${n?18:10}
${n?'#define PIO2_IRQ_0 19\n#define PIO2_IRQ_1 20':''}
void irq_set_exclusive_handler(uint,irq_handler_t);irq_handler_t irq_get_exclusive_handler(uint);void irq_remove_handler(uint,irq_handler_t);
void irq_set_enabled(uint,bool);bool irq_is_enabled(uint);void irq_set_pending(uint);void irq_clear(uint);void irq_set_priority(uint,uint8_t);uint8_t irq_get_priority(uint);
`, 'hardware/sync.h':`#pragma once
#include <pico/stdlib.h>
uint32_t save_and_disable_interrupts(void);void restore_interrupts(uint32_t);
`};}
export const gpioIRQHeader=`
#define GPIO_IRQ_LEVEL_LOW 1u
#define GPIO_IRQ_LEVEL_HIGH 2u
#define GPIO_IRQ_EDGE_FALL 4u
#define GPIO_IRQ_EDGE_RISE 8u
typedef void (*gpio_irq_callback_t)(uint,uint32_t);
void gpio_set_irq_enabled(uint,uint32_t,bool);void gpio_set_irq_callback(gpio_irq_callback_t);void gpio_set_irq_enabled_with_callback(uint,uint32_t,bool,gpio_irq_callback_t);uint32_t gpio_get_irq_event_mask(uint);void gpio_acknowledge_irq(uint,uint32_t);
`;
export function irqRuntimeC(board){const newer=board.mcu==='RP2350',count=newer?52:32;return `
#include <hardware/irq.h>
#include <hardware/sync.h>
static unsigned cf_vectors[2][128] __attribute__((aligned(512)));
static gpio_irq_callback_t cf_gpio_callback[2];
void cf_irq_init(void){unsigned core=get_core_num();for(unsigned i=0;i<128;i++)cf_vectors[core][i]=(unsigned)Default_Handler;cf_vectors[core][0]=(unsigned)&_estack;cf_vectors[core][1]=(unsigned)Reset_Handler;REG(0xe000ed08u)=(unsigned)cf_vectors[core];}
uint32_t save_and_disable_interrupts(void){uint32_t state;__asm__ volatile("mrs %0, primask\\n cpsid i":"=r"(state)::"memory");return state;}
void restore_interrupts(uint32_t state){__asm__ volatile("msr primask, %0"::"r"(state):"memory");}
void irq_set_exclusive_handler(uint n,irq_handler_t h){if(n<${count}&&h)cf_vectors[get_core_num()][n+16]=(unsigned)h;}
irq_handler_t irq_get_exclusive_handler(uint n){return n<${count}?(irq_handler_t)cf_vectors[get_core_num()][n+16]:(irq_handler_t)0;}
void irq_remove_handler(uint n,irq_handler_t h){if(n<${count}&&irq_get_exclusive_handler(n)==h){irq_set_enabled(n,0);cf_vectors[get_core_num()][n+16]=(unsigned)Default_Handler;}}
void irq_set_enabled(uint n,bool e){if(n<${count})REG((e?0xe000e100u:0xe000e180u)+(n/32)*4)=1u<<(n&31);}
bool irq_is_enabled(uint n){return n<${count}&&!!(REG(0xe000e100u+(n/32)*4)&(1u<<(n&31)));}
void irq_set_pending(uint n){if(n<${count})REG(0xe000e200u+(n/32)*4)=1u<<(n&31);}
void irq_clear(uint n){if(n<${count})REG(0xe000e280u+(n/32)*4)=1u<<(n&31);}
void irq_set_priority(uint n,uint8_t p){if(n<${count}){unsigned a=0xe000e400u+(n&~3u),s=(n&3)*8;REG(a)=(REG(a)&~(255u<<s))|((unsigned)p<<s);}}
uint8_t irq_get_priority(uint n){return n<${count}?REG(0xe000e400u+(n&~3u))>>((n&3)*8):0;}
static unsigned cf_gpio_irq_reg(uint kind,uint pin){return IO+${newer?'0x230u':'0xf0u'}+(kind?(${newer?'24u':'16u'}*(1+get_core_num()*3+kind-1)):0)+(pin/8)*4;}
void gpio_acknowledge_irq(uint p,uint32_t events){if(p<30)REG(cf_gpio_irq_reg(0,p))=(events&12u)<<((p&7)*4);}
uint32_t gpio_get_irq_event_mask(uint p){return p<30?(REG(cf_gpio_irq_reg(3,p))>>((p&7)*4))&15:0;}
void gpio_set_irq_enabled(uint p,uint32_t events,bool e){if(p<30){unsigned a=cf_gpio_irq_reg(1,p),mask=(events&15)<<((p&7)*4);gpio_acknowledge_irq(p,events);REG(a)=e?REG(a)|mask:REG(a)&~mask;}}
static void cf_gpio_irq_handler(void){unsigned core=get_core_num();for(uint p=0;p<30;p++){uint32_t events=gpio_get_irq_event_mask(p);if(events){gpio_acknowledge_irq(p,events);if(cf_gpio_callback[core])cf_gpio_callback[core](p,events);}}}
void gpio_set_irq_callback(gpio_irq_callback_t cb){cf_gpio_callback[get_core_num()]=cb;if(cb)irq_set_exclusive_handler(IO_IRQ_BANK0,cf_gpio_irq_handler);}
void gpio_set_irq_enabled_with_callback(uint p,uint32_t ev,bool e,gpio_irq_callback_t cb){gpio_set_irq_callback(cb);gpio_set_irq_enabled(p,ev,e);if(e)irq_set_enabled(IO_IRQ_BANK0,1);}
`;}
