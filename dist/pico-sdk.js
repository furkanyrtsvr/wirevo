import {flashHeaders,flashRuntimeC} from './pico-flash-sdk.js';
import {C_HEADERS} from './c-hal.js';
import {tivaLCDHeader} from './tiva-lcd-sdk.js';
import {peripheralHeaders,peripheralRuntimeC} from './pico-peripheral-sdk.js';
import {advancedHeaders,advancedRuntimeC} from './pico-advanced-sdk.js';
import {usbRuntimeC} from './pico-usb-sdk.js';
import {radioRuntimeC} from './pico-radio-sdk.js';
export function picoHeaders(board){const h=`#pragma once
#include <stdint.h>
#include <stdbool.h>
typedef unsigned int uint;
#define GPIO_IN 0
#define GPIO_OUT 1
#define GPIO_FUNC_UART 2
#define GPIO_FUNC_SIO 5
#define GPIO_FUNC_SPI 1
#define GPIO_FUNC_I2C 3
#define GPIO_FUNC_PWM 4
#define CF_INPUT 0
#define CF_OUTPUT 1
#define CF_INPUT_PULLUP 2
#define CF_INPUT_PULLDOWN 3
${!board.wireless?'#define PICO_DEFAULT_LED_PIN 25':''}
#define PICO_RP2040 ${board.mcu==='RP2040'?1:0}
#define PICO_RP2350 ${board.mcu==='RP2350'?1:0}
void gpio_init(uint);void gpio_set_dir(uint,bool);void gpio_put(uint,bool);bool gpio_get(uint);
void gpio_pull_up(uint);void gpio_pull_down(uint);void gpio_disable_pulls(uint);void gpio_set_function(uint,uint);
void sleep_ms(uint32_t);void sleep_us(uint64_t);uint32_t time_us_32(void);void tight_loop_contents(void);
void stdio_init_all(void);void cf_uart_begin(unsigned);void cf_uart_write(unsigned char);int cf_uart_read(void);
uint get_core_num(void);
void cf_gpio_mode(unsigned,int);void cf_gpio_write(unsigned,int);int cf_gpio_read(unsigned);int cf_gpio_valid(unsigned);
void cf_delay_ms(unsigned);void cf_delay_us(unsigned);unsigned cf_millis(void);
`;return{...C_HEADERS,...flashHeaders,...peripheralHeaders,...advancedHeaders(board),'cf_hal.h':h,'pico/stdlib.h':h,'pico/time.h':h,'hardware/gpio.h':h,'cf_lcd.h':tivaLCDHeader};}
export function picoRuntimeC(board){const gen2=board.mcu==='RP2350',io=gen2?'0x40028000u':'0x40014000u',pads=gen2?'0x40038000u':'0x4001c000u',timer=gen2?'0x400b0028u':'0x40054028u',uart=gen2?'0x40070000u':'0x40034000u';return`#include <pico/stdlib.h>
#define REG(a) (*(volatile unsigned *)(a))
#define IO ${io}
#define PADS ${pads}
#define UART ${uart}
extern int cf_usb_stdio_enabled;unsigned tud_cdc_write_char(char);int tud_cdc_read_char(void);
unsigned __aeabi_uidiv(unsigned n,unsigned d){if(!d)return 0;unsigned q=0,b=1;while(!(d&0x80000000u)&&d<n){d<<=1;b<<=1;}while(b){if(n>=d){n-=d;q|=b;}d>>=1;b>>=1;}return q;}
int __aeabi_idiv(int n,int d){unsigned a=n<0?0u-(unsigned)n:(unsigned)n,b=d<0?0u-(unsigned)d:(unsigned)d,q=__aeabi_uidiv(a,b);return (n<0)!=(d<0)?(int)(0u-q):(int)q;}
__attribute__((naked)) void __aeabi_uidivmod(void){__asm__ volatile("push {r4, lr}\\n push {r0, r1}\\n bl __aeabi_uidiv\\n pop {r2, r3}\\n mov r1, r0\\n muls r1, r3\\n subs r1, r2, r1\\n pop {r4, pc}");}
__attribute__((naked)) void __aeabi_idivmod(void){__asm__ volatile("push {r4, lr}\\n push {r0, r1}\\n bl __aeabi_idiv\\n pop {r2, r3}\\n mov r1, r0\\n muls r1, r3\\n subs r1, r2, r1\\n pop {r4, pc}");}
int cf_gpio_valid(unsigned p){return p<${gen2?30:30};}
void cf_bus_mux(uint,uint);
void gpio_set_function(uint p,uint f){if(cf_gpio_valid(p)){cf_bus_mux(p,f);REG(IO+4+p*8)=f;}}
void gpio_set_dir(uint p,bool out){if(cf_gpio_valid(p))REG(out?${gen2?'0xd0000038u':'0xd0000024u'}:${gen2?'0xd0000040u':'0xd0000028u'})=1u<<p;}
void gpio_put(uint p,bool v){if(cf_gpio_valid(p))REG(v?${gen2?'0xd0000018u':'0xd0000014u'}:${gen2?'0xd0000020u':'0xd0000018u'})=1u<<p;}
bool gpio_get(uint p){return cf_gpio_valid(p)&&!!(REG(0xd0000004u)&(1u<<p));}
void gpio_disable_pulls(uint p){if(cf_gpio_valid(p))REG(PADS+4+p*4)&=~12u;}
void gpio_pull_up(uint p){if(cf_gpio_valid(p))REG(PADS+4+p*4)=(REG(PADS+4+p*4)&~4u)|8u;}
void gpio_pull_down(uint p){if(cf_gpio_valid(p))REG(PADS+4+p*4)=(REG(PADS+4+p*4)&~8u)|4u;}
void gpio_init(uint p){if(cf_gpio_valid(p)){REG(PADS+4+p*4)=(REG(PADS+4+p*4)&~(128u|256u))|64u;gpio_set_function(p,GPIO_FUNC_SIO);gpio_set_dir(p,0);gpio_put(p,0);}}
uint32_t time_us_32(void){return REG(${timer});}
void sleep_us(uint64_t n){while(n){unsigned part=n>1000000?1000000:(unsigned)n,start=time_us_32();while((unsigned)(time_us_32()-start)<part){}n-=part;}}
void sleep_ms(uint32_t n){while(n--)sleep_us(1000);}
void tight_loop_contents(void){__asm__ volatile("nop");}
void cf_gpio_mode(unsigned p,int m){gpio_init(p);gpio_disable_pulls(p);if(m==CF_OUTPUT)gpio_set_dir(p,1);else if(m==CF_INPUT_PULLUP)gpio_pull_up(p);else if(m==CF_INPUT_PULLDOWN)gpio_pull_down(p);}
void cf_gpio_write(unsigned p,int v){gpio_put(p,v!=0);}int cf_gpio_read(unsigned p){return gpio_get(p);}
void cf_delay_ms(unsigned n){sleep_ms(n);}void cf_delay_us(unsigned n){sleep_us(n);}unsigned cf_millis(void){return time_us_32()/1000;}
void cf_uart_begin(unsigned baud){unsigned divisor=${board.hz}u/(16u*(baud?baud:115200));gpio_init(0);gpio_init(1);gpio_set_function(0,GPIO_FUNC_UART);gpio_set_function(1,GPIO_FUNC_UART);REG(UART+0x30)=0;REG(UART+0x24)=divisor;REG(UART+0x28)=0;REG(UART+0x2c)=0x60;REG(UART+0x30)=0x301;}
void stdio_init_all(void){cf_uart_begin(115200);}
void cf_uart_write(unsigned char c){if(cf_usb_stdio_enabled){tud_cdc_write_char(c);return;}while(REG(UART+0x18)&32u){}REG(UART)=c;}
int cf_uart_read(void){if(cf_usb_stdio_enabled)return tud_cdc_read_char();return (REG(UART+0x18)&16u)?-1:(REG(UART)&255);}
void *memcpy(void*d,const void*s,unsigned n){unsigned char*a=d;const unsigned char*b=s;while(n--)*a++=*b++;return d;}void *memset(void*d,int c,unsigned n){unsigned char*a=d;while(n--)*a++=c;return d;}
void __aeabi_memcpy(void*d,const void*s,unsigned n){memcpy(d,s,n);}void __aeabi_memcpy4(void*d,const void*s,unsigned n){memcpy(d,s,n);}void __aeabi_memcpy8(void*d,const void*s,unsigned n){memcpy(d,s,n);}
void __aeabi_memclr(void*d,unsigned n){memset(d,0,n);}void __aeabi_memclr4(void*d,unsigned n){memset(d,0,n);}void __aeabi_memclr8(void*d,unsigned n){memset(d,0,n);}
void __aeabi_memset(void*d,unsigned n,int v){memset(d,v,n);}void __aeabi_memset4(void*d,unsigned n,int v){memset(d,v,n);}void __aeabi_memset8(void*d,unsigned n,int v){memset(d,v,n);}
extern unsigned _sidata,_sdata,_edata,_sbss,_ebss,_estack;extern int main(void);
void Default_Handler(void){for(;;){}}
void Reset_Handler(void){unsigned*s=&_sidata,*d=&_sdata;while(d<&_edata)*d++=*s++;for(d=&_sbss;d<&_ebss;)*d++=0;main();for(;;){}}
__attribute__((section(".vectors"),used))void(*const vectors[16])(void)={[0]=(void*)&_estack,[1]=Reset_Handler,[2]=Default_Handler,[3]=Default_Handler};
`+peripheralRuntimeC(board)+advancedRuntimeC(board)+usbRuntimeC()+radioRuntimeC(board)+flashRuntimeC;}
