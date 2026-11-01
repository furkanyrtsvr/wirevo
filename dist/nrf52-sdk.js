// Freestanding Wirevo helpers; Nordic MDK register layout is separately attributed.
import {NRF52_KEYBOARD_HEADER} from './nrf52-keyboard-sdk.js';
import {NRF_REGISTER_HEADERS} from './nrf52-register-headers.js';
import {C_HEADERS} from './c-hal.js';
const gpio=`#pragma once
#include <nrf.h>
typedef enum{NRF_GPIO_PIN_NOPULL=0,NRF_GPIO_PIN_PULLDOWN=1,NRF_GPIO_PIN_PULLUP=3}nrf_gpio_pin_pull_t;
static inline NRF_GPIO_Type* cf_port(unsigned p){return p<32?NRF_P0:NRF_P1;}
static inline void nrf_gpio_cfg_output(unsigned p){cf_port(p)->PIN_CNF[p%32]=3;}
static inline void nrf_gpio_cfg_input(unsigned p,nrf_gpio_pin_pull_t pull){cf_port(p)->PIN_CNF[p%32]=(unsigned)pull<<2;}
static inline void nrf_gpio_pin_set(unsigned p){cf_port(p)->OUTSET=1u<<(p%32);}
static inline void nrf_gpio_pin_clear(unsigned p){cf_port(p)->OUTCLR=1u<<(p%32);}
static inline unsigned nrf_gpio_pin_read(unsigned p){return(cf_port(p)->IN>>(p%32))&1;}
static inline void nrf_gpio_pin_write(unsigned p,unsigned v){if(v)nrf_gpio_pin_set(p);else nrf_gpio_pin_clear(p);}
static inline void nrf_gpio_pin_toggle(unsigned p){nrf_gpio_pin_write(p,!((cf_port(p)->OUT>>(p%32))&1));}
`;
export function nrfHeaders(b){const pin=n=>+n[1]*32+(+n.slice(3));return{'wirevo_keyboard.h':NRF52_KEYBOARD_HEADER,...NRF_REGISTER_HEADERS,...Object.fromEntries(['stdint.h','stddef.h','stdbool.h','stdio.h'].map(k=>[k,C_HEADERS[k]])),'nrf_gpio.h':gpio,'cf_lcd.h':lcd,'nrf_delay.h':'#pragma once\n#include <cf_hal.h>\n#define nrf_delay_us cf_delay_us\n#define nrf_delay_ms cf_delay_ms\n','cf_hal.h':`#pragma once
#include <stdint.h>
#include <stdbool.h>
#include <nrf_gpio.h>
#define CF_INPUT 0
#define CF_OUTPUT 1
#define CF_INPUT_PULLUP 2
#define CF_INPUT_PULLDOWN 3
#define LED_BUILTIN ${pin(b.ledPin)}u
#define BOARD_LED_ACTIVE_LOW ${b.ledChannels[0].activeLow?1:0}
#define BOARD_TXD ${b.txPin}u
#define BOARD_RXD ${b.rxPin}u
#define BOARD_SDA ${b.sdaPin}u
#define BOARD_SCL ${b.sclPin}u
#define BOARD_SCK ${b.sckPin}u
#define BOARD_MOSI ${b.mosiPin}u
#define BOARD_MISO ${b.misoPin}u
${Array.from({length:48},(_,n)=>'#define P'+(n>>>5)+'_'+String(n%32).padStart(2,'0')+' '+n+'u').join('\n')}
static inline void cf_gpio_mode(unsigned p,int mode){if(mode==CF_OUTPUT)nrf_gpio_cfg_output(p);else nrf_gpio_cfg_input(p,mode==CF_INPUT_PULLUP?NRF_GPIO_PIN_PULLUP:mode==CF_INPUT_PULLDOWN?NRF_GPIO_PIN_PULLDOWN:NRF_GPIO_PIN_NOPULL);}
static inline void cf_gpio_write(unsigned p,int v){nrf_gpio_pin_write(p,v);}
static inline int cf_gpio_read(unsigned p){return nrf_gpio_pin_read(p);}
void cf_delay_us(uint32_t us);void cf_delay_ms(uint32_t ms);
void cf_uart_begin(unsigned baud);void cf_uart_write(unsigned char ch);
static inline int cf_uart_read(void){if(!NRF_UART0->EVENTS_RXDRDY)return -1;NRF_UART0->EVENTS_RXDRDY=0;return (int)NRF_UART0->RXD;}
int cf_twim_transfer(unsigned addr,const uint8_t*tx,unsigned nt,uint8_t*rx,unsigned nr);
void cf_spim_transfer(const uint8_t*tx,unsigned nt,uint8_t*rx,unsigned nr);
unsigned cf_adc_read(unsigned analog);void cf_pwm_start(unsigned pin,unsigned period,unsigned duty);
`};}
const irqNames=['POWER_CLOCK','RADIO','UARTE0_UART0','SPIM0_SPIS0_TWIM0_TWIS0_SPI0_TWI0','SPIM1_SPIS1_TWIM1_TWIS1_SPI1_TWI1','NFCT','GPIOTE','SAADC','TIMER0','TIMER1','TIMER2','RTC0','TEMP','RNG','ECB','CCM_AAR','WDT','RTC1','QDEC','COMP_LPCOMP','SWI0_EGU0','SWI1_EGU1','SWI2_EGU2','SWI3_EGU3','SWI4_EGU4','SWI5_EGU5','TIMER3','TIMER4','PWM0','PDM','RESERVED30','RESERVED31','MWU','PWM1','PWM2','SPIM2_SPIS2_SPI2','RTC2','I2S','FPU','USBD','UARTE1','QSPI','CRYPTOCELL','RESERVED43','RESERVED44','PWM3','RESERVED46','SPIM3'];
export const nrfRuntimeC=`#include <cf_hal.h>
unsigned SystemCoreClock=64000000;void SystemInit(void){*(volatile unsigned*)0xe000ed88|=0x00f00000;__DSB();__ISB();}
extern unsigned _sidata,_sdata,_edata,_sbss,_ebss,_estack;int main(void);
void Default_Handler(void){while(1){}}
void Reset_Handler(void){unsigned*s=&_sidata;for(unsigned*d=&_sdata;d<&_edata;) *d++=*s++;for(unsigned*d=&_sbss;d<&_ebss;) *d++=0;SystemInit();(void)main();while(1){}}
${['NMI','HardFault','MemManage','BusFault','UsageFault','SVC','DebugMon','PendSV','SysTick',...irqNames].map(n=>'void '+n+'_Handler(void)__attribute__((weak,alias("Default_Handler")));').join('\n')}
${irqNames.map(n=>'void '+n+'_IRQHandler(void)__attribute__((weak,alias("Default_Handler")));').join('\n')}
__attribute__((section(".vectors"),used)) void(*const vectors[])(void)={(void*)&_estack,Reset_Handler,NMI_Handler,HardFault_Handler,MemManage_Handler,BusFault_Handler,UsageFault_Handler,0,0,0,0,SVC_Handler,DebugMon_Handler,0,PendSV_Handler,SysTick_Handler,${irqNames.map(n=>n+'_IRQHandler').join(',')}};
void cf_delay_us(uint32_t us){NRF_TIMER4->TASKS_STOP=1;NRF_TIMER4->MODE=0;NRF_TIMER4->BITMODE=3;NRF_TIMER4->PRESCALER=4;NRF_TIMER4->TASKS_CLEAR=1;NRF_TIMER4->TASKS_START=1;do{NRF_TIMER4->TASKS_CAPTURE[0]=1;}while(NRF_TIMER4->CC[0]<us);NRF_TIMER4->TASKS_STOP=1;}
void cf_delay_ms(uint32_t ms){while(ms--)cf_delay_us(1000);}
void cf_uart_begin(unsigned baud){NRF_UART0->ENABLE=0;NRF_UART0->PSEL.TXD=BOARD_TXD;NRF_UART0->PSEL.RXD=BOARD_RXD;NRF_UART0->PSEL.CTS=0xffffffff;NRF_UART0->PSEL.RTS=0xffffffff;NRF_UART0->BAUDRATE=((baud*4096u)/15625u)<<10;NRF_UART0->CONFIG=0;NRF_UART0->ENABLE=4;NRF_UART0->TASKS_STARTTX=1;NRF_UART0->TASKS_STARTRX=1;}
void cf_uart_write(unsigned char ch){NRF_UART0->EVENTS_TXDRDY=0;NRF_UART0->TXD=ch;while(!NRF_UART0->EVENTS_TXDRDY){}}
int cf_twim_transfer(unsigned addr,const uint8_t*tx,unsigned nt,uint8_t*rx,unsigned nr){
NRF_TWIM0->ENABLE=0;NRF_TWIM0->PSEL.SDA=BOARD_SDA;NRF_TWIM0->PSEL.SCL=BOARD_SCL;NRF_TWIM0->FREQUENCY=0x01980000;NRF_TWIM0->ADDRESS=addr;NRF_TWIM0->ENABLE=6;NRF_TWIM0->EVENTS_ERROR=0;NRF_TWIM0->ERRORSRC=7;
NRF_TWIM0->EVENTS_STOPPED=0;NRF_TWIM0->TXD.PTR=(uint32_t)tx;NRF_TWIM0->TXD.MAXCNT=nt;NRF_TWIM0->RXD.PTR=(uint32_t)rx;NRF_TWIM0->RXD.MAXCNT=nr;
NRF_TWIM0->SHORTS=(nt&&nr)?((1u<<7)|(1u<<12)):(1u<<(nr?12:9));
if(nt)NRF_TWIM0->TASKS_STARTTX=1;else if(nr)NRF_TWIM0->TASKS_STARTRX=1;else return 0;
while(!NRF_TWIM0->EVENTS_STOPPED&&!NRF_TWIM0->EVENTS_ERROR){}
if(NRF_TWIM0->EVENTS_ERROR){NRF_TWIM0->TASKS_STOP=1;return -1;}while(!NRF_TWIM0->EVENTS_STOPPED){}NRF_TWIM0->EVENTS_STOPPED=0;return 0;}
void cf_spim_transfer(const uint8_t*tx,unsigned nt,uint8_t*rx,unsigned nr){NRF_SPIM1->ENABLE=0;NRF_SPIM1->PSEL.SCK=BOARD_SCK;NRF_SPIM1->PSEL.MOSI=BOARD_MOSI;NRF_SPIM1->PSEL.MISO=BOARD_MISO;NRF_SPIM1->FREQUENCY=0x02000000;NRF_SPIM1->CONFIG=0;NRF_SPIM1->ORC=255;NRF_SPIM1->TXD.PTR=(uint32_t)tx;NRF_SPIM1->TXD.MAXCNT=nt;NRF_SPIM1->RXD.PTR=(uint32_t)rx;NRF_SPIM1->RXD.MAXCNT=nr;NRF_SPIM1->EVENTS_END=0;NRF_SPIM1->ENABLE=7;NRF_SPIM1->TASKS_START=1;while(!NRF_SPIM1->EVENTS_END){}}
unsigned cf_adc_read(unsigned analog){int16_t v=0;NRF_SAADC->ENABLE=1;NRF_SAADC->CH[0].PSELP=analog+1;NRF_SAADC->CH[0].CONFIG=0;NRF_SAADC->RESOLUTION=2;NRF_SAADC->RESULT.PTR=(uint32_t)&v;NRF_SAADC->RESULT.MAXCNT=1;NRF_SAADC->EVENTS_END=0;NRF_SAADC->TASKS_START=1;NRF_SAADC->TASKS_SAMPLE=1;while(!NRF_SAADC->EVENTS_END){}NRF_SAADC->TASKS_STOP=1;return (unsigned)v;}
void cf_pwm_start(unsigned pin,unsigned period,unsigned duty){static uint16_t sample;sample=(uint16_t)(0x8000u|duty);NRF_PWM0->ENABLE=1;NRF_PWM0->MODE=0;NRF_PWM0->PRESCALER=4;NRF_PWM0->COUNTERTOP=period;NRF_PWM0->DECODER=0;NRF_PWM0->PSEL.OUT[0]=pin;for(unsigned i=1;i<4;i++)NRF_PWM0->PSEL.OUT[i]=0xffffffff;NRF_PWM0->SEQ[0].PTR=(uint32_t)&sample;NRF_PWM0->SEQ[0].CNT=1;NRF_PWM0->SEQ[0].REFRESH=0;NRF_PWM0->SEQ[0].ENDDELAY=0;NRF_PWM0->LOOP=0;NRF_PWM0->TASKS_SEQSTART[0]=1;}
`;

// PCF8574 backpack: P0 RS, P1 RW, P2 E, P3 backlight, P4..7 data.
const lcd=`#pragma once
#include <cf_hal.h>
static inline void cf_lcd_nibble(unsigned v,unsigned rs){uint8_t a=(uint8_t)(v|rs|8);uint8_t tx[]={a,(uint8_t)(a|4),a};cf_twim_transfer(0x27,tx,3,0,0);}
static inline void cf_lcd_byte(unsigned value,unsigned rs){cf_lcd_nibble(value&0xf0,rs);cf_lcd_nibble((value<<4)&0xf0,rs);cf_delay_us(50);}
static inline void cf_lcd_init(void){cf_delay_ms(40);cf_lcd_nibble(0x30,0);cf_delay_ms(5);cf_lcd_nibble(0x30,0);cf_delay_us(150);cf_lcd_nibble(0x30,0);cf_lcd_nibble(0x20,0);cf_lcd_byte(0x28,0);cf_lcd_byte(0x0c,0);cf_lcd_byte(0x06,0);cf_lcd_byte(1,0);cf_delay_ms(2);}
static inline void cf_lcd_cursor(unsigned col,unsigned row){cf_lcd_byte(0x80|(row?0x40:0)|col,0);}
static inline void cf_lcd_print(const char*s){while(*s)cf_lcd_byte((unsigned char)*s++,1);}
`;
