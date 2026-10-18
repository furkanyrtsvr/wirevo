import {C_HEADERS} from './c-hal.js';
const ports=[0x40004000,0x40005000,0x40006000,0x40007000,0x40024000,0x40025000];
const defines={SYSCTL_RCGCGPIO_R:0x400fe608,SYSCTL_RCGCUART_R:0x400fe618,SYSCTL_RCGCTIMER_R:0x400fe604,SYSCTL_RCGCADC_R:0x400fe638,SYSCTL_PRGPIO_R:0x400fea08,SYSCTL_RIS_R:0x400fe050,SYSCTL_RCC_R:0x400fe060,SYSCTL_RCC2_R:0x400fe070,NVIC_EN0_R:0xe000e100,NVIC_EN1_R:0xe000e104,NVIC_ST_CTRL_R:0xe000e010,NVIC_ST_RELOAD_R:0xe000e014,NVIC_ST_CURRENT_R:0xe000e018};
for(let p=0;p<6;p++)for(const[n,o]of Object.entries({DATA:0x3fc,DIR:0x400,IS:0x404,IBE:0x408,IEV:0x40c,IM:0x410,RIS:0x414,MIS:0x418,ICR:0x41c,AFSEL:0x420,DR2R:0x500,DR4R:0x504,DR8R:0x508,ODR:0x50c,PUR:0x510,PDR:0x514,DEN:0x51c,LOCK:0x520,CR:0x524,AMSEL:0x528,PCTL:0x52c}))defines['GPIO_PORT'+String.fromCharCode(65+p)+'_'+n+'_R']=ports[p]+o;
for(const[n,o]of Object.entries({DR:0,FR:0x18,IBRD:0x24,FBRD:0x28,LCRH:0x2c,CTL:0x30,IM:0x38,RIS:0x3c,MIS:0x40,ICR:0x44,CC:0xfc8}))defines['UART0_'+n+'_R']=0x4000c000+o;
export const tivaHeader=`#pragma once
#include <stdint.h>
#include <stdbool.h>
#define HWREG(x) (*((volatile uint32_t *)(x)))
#define HWREGH(x) (*((volatile uint16_t *)(x)))
#define HWREGB(x) (*((volatile uint8_t *)(x)))
#define CF_INPUT 0
#define CF_OUTPUT 1
#define CF_INPUT_PULLUP 2
#define CF_INPUT_PULLDOWN 3
${Array.from({length:6},(_,p)=>Array.from({length:8},(_,b)=>'#define P'+String.fromCharCode(65+p)+b+' '+(p*8+b)).join('\n')).join('\n')}
${Object.entries(defines).map(([k,v])=>'#define '+k+' HWREG(0x'+v.toString(16)+'u)').join('\n')}
${ports.map((v,p)=>'#define GPIO_PORT'+String.fromCharCode(65+p)+'_BASE 0x'+v.toString(16)+'u\n#define SYSCTL_PERIPH_GPIO'+String.fromCharCode(65+p)+' 0xf000080'+p+'u').join('\n')}
${Array.from({length:8},(_,i)=>'#define GPIO_PIN_'+i+' '+(1<<i)+'u').join('\n')}
#define GPIO_PIN_ALL 255u
#define GPIO_LOCK_KEY 0x4c4f434bu
#define GPIO_STRENGTH_2MA 1
#define GPIO_STRENGTH_4MA 2
#define GPIO_STRENGTH_8MA 4
#define GPIO_PIN_TYPE_STD 8
#define GPIO_PIN_TYPE_STD_WPU 10
#define GPIO_PIN_TYPE_STD_WPD 12
#define GPIO_PIN_TYPE_OD 9
#define GPIO_FALLING_EDGE 0
#define GPIO_RISING_EDGE 4
#define GPIO_BOTH_EDGES 1
#define GPIO_LOW_LEVEL 2
#define GPIO_HIGH_LEVEL 6
#define UART0_BASE 0x4000c000u
#define SYSCTL_PERIPH_UART0 0xf0001800u
#define TIMER0_BASE 0x40030000u
#define SYSCTL_PERIPH_TIMER0 0xf0000400u
${Array.from({length:5},(_,i)=>'#define TIMER'+(i+1)+'_BASE 0x'+(0x40031000+i*0x1000).toString(16)+'u\n#define SYSCTL_PERIPH_TIMER'+(i+1)+' 0xf000040'+(i+1)+'u').join('\n')}
#define TIMER_A 0xff
#define TIMER_CFG_PERIODIC 2
#define TIMER_CFG_ONE_SHOT 1
#define TIMER_TIMA_TIMEOUT 1
#define ADC0_BASE 0x40038000u
#define SYSCTL_PERIPH_ADC0 0xf0003800u
#define ADC1_BASE 0x40039000u
#define SYSCTL_PERIPH_ADC1 0xf0003801u
#define ADC_TRIGGER_PROCESSOR 0
#define ADC_CTL_CH0 0
#define ADC_CTL_CH1 1
#define ADC_CTL_CH2 2
#define ADC_CTL_CH3 3
#define ADC_CTL_CH4 4
#define ADC_CTL_CH5 5
#define ADC_CTL_CH6 6
#define ADC_CTL_CH7 7
#define ADC_CTL_CH8 8
#define ADC_CTL_CH9 9
#define ADC_CTL_CH10 10
#define ADC_CTL_CH11 11
#define ADC_CTL_END 0x20
#define ADC_CTL_IE 0x40
#define ADC_CTL_TS 0x80
#define INT_GPIOF 46
#define INT_UART0 21
#define INT_TIMER0A 35
${[0,1,2,3,4].map((i)=>'#define INT_GPIO'+String.fromCharCode(65+i)+' '+(16+i)).join('\n')}
${[21,23,35,70,92].map((n,i)=>'#define INT_TIMER'+(i+1)+'A '+(n+16)).join('\n')}
#define SYSCTL_USE_PLL 0
#define SYSCTL_USE_OSC 0x3800u
#define SYSCTL_OSC_MAIN 0
#define SYSCTL_OSC_INT 0x10u
#define SYSCTL_XTAL_16MHZ 0x540u
#define SYSCTL_SYSDIV_1 0x07800000u
#define SYSCTL_SYSDIV_2_5 0xc1000000u
#define SYSCTL_SYSDIV_5 0x02000000u
#define UART_CONFIG_WLEN_8 0x60
#define UART_CONFIG_STOP_ONE 0
#define UART_CONFIG_PAR_NONE 0
#define GPIO_PA0_U0RX 0x00000001u
#define GPIO_PA1_U0TX 0x00000401u
extern unsigned SystemCoreClock;
void SystemInit(void);void SysCtlClockSet(uint32_t);uint32_t SysCtlClockGet(void);void SysCtlDelay(uint32_t);
void SysCtlPeripheralEnable(uint32_t);void SysCtlPeripheralDisable(uint32_t);bool SysCtlPeripheralReady(uint32_t);
void GPIOPinTypeGPIOOutput(uint32_t,uint8_t);void GPIOPinTypeGPIOInput(uint32_t,uint8_t);void GPIOPinTypeUART(uint32_t,uint8_t);void GPIOPinTypeADC(uint32_t,uint8_t);void GPIOPinConfigure(uint32_t);void GPIOPadConfigSet(uint32_t,uint8_t,uint32_t,uint32_t);
void GPIOPinWrite(uint32_t,uint8_t,uint8_t);int32_t GPIOPinRead(uint32_t,uint8_t);
void GPIOIntTypeSet(uint32_t,uint8_t,uint32_t);void GPIOIntEnable(uint32_t,uint32_t);void GPIOIntDisable(uint32_t,uint32_t);void GPIOIntClear(uint32_t,uint32_t);uint32_t GPIOIntStatus(uint32_t,bool);
void UARTConfigSetExpClk(uint32_t,uint32_t,uint32_t,uint32_t);void UARTEnable(uint32_t);void UARTDisable(uint32_t);void UARTCharPut(uint32_t,unsigned char);int32_t UARTCharGetNonBlocking(uint32_t);bool UARTCharsAvail(uint32_t);
void IntEnable(uint32_t);void IntDisable(uint32_t);bool IntMasterEnable(void);bool IntMasterDisable(void);
void TimerConfigure(uint32_t,uint32_t);void TimerLoadSet(uint32_t,uint32_t,uint32_t);void TimerEnable(uint32_t,uint32_t);void TimerDisable(uint32_t,uint32_t);void TimerIntEnable(uint32_t,uint32_t);void TimerIntClear(uint32_t,uint32_t);uint32_t TimerIntStatus(uint32_t,bool);
void ADCSequenceConfigure(uint32_t,uint32_t,uint32_t,uint32_t);void ADCSequenceStepConfigure(uint32_t,uint32_t,uint32_t,uint32_t);void ADCSequenceEnable(uint32_t,uint32_t);void ADCProcessorTrigger(uint32_t,uint32_t);bool ADCIntStatus(uint32_t,uint32_t,bool);void ADCIntClear(uint32_t,uint32_t);int32_t ADCSequenceDataGet(uint32_t,uint32_t,uint32_t*);
void cf_gpio_mode(unsigned,int);void cf_gpio_write(unsigned,int);int cf_gpio_read(unsigned);int cf_gpio_valid(unsigned);
void cf_delay_ms(unsigned);void cf_delay_us(unsigned);unsigned cf_millis(void);void cf_uart_begin(unsigned);void cf_uart_write(unsigned char);int cf_uart_read(void);
`;
// Original, intentionally bounded source-compatible API; not the complete TI TivaWare distribution.
export const TIVA_HEADERS={...C_HEADERS,'cf_hal.h':tivaHeader,'tm4c123gh6pm.h':'#include <cf_hal.h>\n','inc/tm4c123gh6pm.h':'#include <cf_hal.h>\n','inc/hw_memmap.h':'#include <cf_hal.h>\n','inc/hw_types.h':'#include <cf_hal.h>\n','inc/hw_gpio.h':'#include <cf_hal.h>\n',...Object.fromEntries(['sysctl','gpio','pin_map','uart','interrupt','timer','adc'].map(n=>['driverlib/'+n+'.h','#include <cf_hal.h>\n']))};
export function tivaLibraries(files){const found=new Set(['cf_hal.h']);for(const f of files)for(const m of f.content.matchAll(/^\s*#\s*include\s*[<"]([^>"\r\n]+)[>"]/gm))if(Object.hasOwn(TIVA_HEADERS,m[1]))found.add(m[1]);return[...found].sort();}
export const tivaRuntimeC=String.raw`#include <cf_hal.h>
unsigned SystemCoreClock=16000000;
static unsigned port(unsigned p){const unsigned a[]={0x40004000,0x40005000,0x40006000,0x40007000,0x40024000,0x40025000};return a[p/8];}
void SystemInit(void){}
void SysCtlPeripheralEnable(uint32_t p){HWREG(0x400fe600+((p>>8)&255))|=1u<<(p&31);}
void SysCtlPeripheralDisable(uint32_t p){HWREG(0x400fe600+((p>>8)&255))&=~(1u<<(p&31));}
bool SysCtlPeripheralReady(uint32_t p){return !!(HWREG(0x400fea00+((p>>8)&255))&(1u<<(p&31)));}
uint32_t SysCtlClockGet(void){return SystemCoreClock;}
void SysCtlClockSet(uint32_t c){if(c&0x80000000u){if(c!= (SYSCTL_SYSDIV_2_5|SYSCTL_USE_PLL|SYSCTL_OSC_MAIN|SYSCTL_XTAL_16MHZ)){HWREG(0x4ffff000)=c;return;}HWREG(0x400fe070)=0xc1000000;HWREG(0x400fe060)=0x00400540;SystemCoreClock=80000000;}else{unsigned d=((c>>23)&15)+1;if(c&0x800){HWREG(0x400fe060)=c&~(1u<<22);SystemCoreClock=16000000;}else{HWREG(0x400fe060)=(c&~0x800u)|(1u<<22);SystemCoreClock=200000000/d;}HWREG(0x400fe070)&=~0x80000000u;}}
void SysCtlDelay(uint32_t n){__asm__ volatile("1: subs %0,%0,#1\n bne 1b":"+r"(n)::"cc");}
void GPIOPinTypeGPIOOutput(uint32_t b,uint8_t p){HWREG(b+0x420)&=~p;HWREG(b+0x528)&=~p;HWREG(b+0x400)|=p;HWREG(b+0x51c)|=p;}
void GPIOPinTypeGPIOInput(uint32_t b,uint8_t p){HWREG(b+0x420)&=~p;HWREG(b+0x528)&=~p;HWREG(b+0x400)&=~p;HWREG(b+0x51c)|=p;}
void GPIOPinTypeUART(uint32_t b,uint8_t p){HWREG(b+0x420)|=p;HWREG(b+0x528)&=~p;HWREG(b+0x51c)|=p;}
void GPIOPinTypeADC(uint32_t b,uint8_t p){HWREG(b+0x51c)&=~p;HWREG(b+0x528)|=p;HWREG(b+0x420)|=p;HWREG(b+0x400)&=~p;}
void GPIOPinConfigure(uint32_t p){unsigned b=0x40004000+((p>>16)&7)*0x1000,shift=(p>>8)&31;HWREG(b+0x52c)=(HWREG(b+0x52c)&~(15u<<shift))|((p&15)<<shift);}
void GPIOPadConfigSet(uint32_t b,uint8_t p,uint32_t strength,uint32_t type){HWREG(b+0x510)=(HWREG(b+0x510)&~p)|(type==10?p:0);HWREG(b+0x514)=(HWREG(b+0x514)&~p)|(type==12?p:0);HWREG(b+0x50c)=(HWREG(b+0x50c)&~p)|(type==9?p:0);HWREG(b+0x500)=strength==1?p:0;HWREG(b+0x504)=strength==2?p:0;HWREG(b+0x508)=strength==4?p:0;}
void GPIOPinWrite(uint32_t b,uint8_t p,uint8_t v){HWREG(b+(p<<2))=v;}int32_t GPIOPinRead(uint32_t b,uint8_t p){return HWREG(b+(p<<2));}
void GPIOIntTypeSet(uint32_t b,uint8_t p,uint32_t t){HWREG(b+0x404)=(HWREG(b+0x404)&~p)|((t&2)?p:0);HWREG(b+0x408)=(HWREG(b+0x408)&~p)|((t&1)?p:0);HWREG(b+0x40c)=(HWREG(b+0x40c)&~p)|((t&4)?p:0);}
void GPIOIntEnable(uint32_t b,uint32_t p){HWREG(b+0x410)|=p;}void GPIOIntDisable(uint32_t b,uint32_t p){HWREG(b+0x410)&=~p;}void GPIOIntClear(uint32_t b,uint32_t p){HWREG(b+0x41c)=p;}uint32_t GPIOIntStatus(uint32_t b,bool m){return HWREG(b+(m?0x418:0x414));}
void UARTConfigSetExpClk(uint32_t b,uint32_t clock,uint32_t baud,uint32_t cfg){if(!baud)return;HWREG(b+0x30)=0;unsigned d=(clock*4u+baud/2)/baud;HWREG(b+0x24)=d/64;HWREG(b+0x28)=d%64;HWREG(b+0x2c)=cfg;HWREG(b+0x30)=0x301;}
void UARTEnable(uint32_t b){HWREG(b+0x30)|=0x301;}void UARTDisable(uint32_t b){HWREG(b+0x30)&=~1u;}void UARTCharPut(uint32_t b,unsigned char c){while(HWREG(b+0x18)&32){}HWREG(b)=c;}bool UARTCharsAvail(uint32_t b){return !(HWREG(b+0x18)&16);}int32_t UARTCharGetNonBlocking(uint32_t b){return UARTCharsAvail(b)?HWREG(b):-1;}
void IntEnable(uint32_t n){n-=16;HWREG(0xe000e100+(n/32)*4)=1u<<(n%32);}void IntDisable(uint32_t n){n-=16;HWREG(0xe000e180+(n/32)*4)=1u<<(n%32);}bool IntMasterEnable(void){unsigned n;__asm__ volatile("mrs %0,primask\n cpsie i":"=r"(n)::"memory");return !!n;}bool IntMasterDisable(void){unsigned n;__asm__ volatile("mrs %0,primask\n cpsid i":"=r"(n)::"memory");return !!n;}
void TimerConfigure(uint32_t b,uint32_t c){HWREG(b+0xc)=0;HWREG(b)=0;HWREG(b+4)=c;}void TimerLoadSet(uint32_t b,uint32_t t,uint32_t n){(void)t;HWREG(b+0x28)=n;}void TimerEnable(uint32_t b,uint32_t t){(void)t;HWREG(b+0xc)|=1;}void TimerDisable(uint32_t b,uint32_t t){(void)t;HWREG(b+0xc)&=~1u;}void TimerIntEnable(uint32_t b,uint32_t p){HWREG(b+0x18)|=p;}void TimerIntClear(uint32_t b,uint32_t p){HWREG(b+0x24)=p;}uint32_t TimerIntStatus(uint32_t b,bool m){return HWREG(b+(m?0x20:0x1c));}
void ADCSequenceConfigure(uint32_t b,uint32_t s,uint32_t t,uint32_t p){HWREG(b)&=~(1u<<s);HWREG(b+0x14)=(HWREG(b+0x14)&~(15u<<(s*4)))|(t<<(s*4));HWREG(b+0x20)=(HWREG(b+0x20)&~(3u<<(s*4)))|(p<<(s*4));}
void ADCSequenceStepConfigure(uint32_t b,uint32_t s,uint32_t step,uint32_t c){unsigned a=b+0x40+s*0x20,shift=step*4;HWREG(a)=(HWREG(a)&~(15u<<shift))|((c&15)<<shift);HWREG(a+4)=(HWREG(a+4)&~(15u<<shift))|(((c>>4)&15)<<shift);}
void ADCSequenceEnable(uint32_t b,uint32_t s){HWREG(b)|=1u<<s;}void ADCProcessorTrigger(uint32_t b,uint32_t s){HWREG(b+0x28)=1u<<s;}bool ADCIntStatus(uint32_t b,uint32_t s,bool m){return !!(HWREG(b+(m?0xc:4))&(1u<<s));}void ADCIntClear(uint32_t b,uint32_t s){HWREG(b+0xc)=1u<<s;}int32_t ADCSequenceDataGet(uint32_t b,uint32_t s,uint32_t*p){unsigned n=0,a=b+0x40+s*0x20;while(!(HWREG(a+0xc)&256)&&n<8)p[n++]=HWREG(a+8);return n;}
int cf_gpio_valid(unsigned p){return p<48&&(p/8!=4||p%8<6)&&(p/8!=5||p%8<5);}
void cf_gpio_mode(unsigned p,int m){if(!cf_gpio_valid(p))return;SysCtlPeripheralEnable(0xf0000800u+p/8);unsigned b=port(p),mask=1u<<(p%8);if(p==PF0||p==PD7){HWREG(b+0x520)=GPIO_LOCK_KEY;HWREG(b+0x524)|=mask;}if(m==CF_OUTPUT)GPIOPinTypeGPIOOutput(b,mask);else{GPIOPinTypeGPIOInput(b,mask);GPIOPadConfigSet(b,mask,1,m==CF_INPUT_PULLUP?10:m==CF_INPUT_PULLDOWN?12:8);}}
void cf_gpio_write(unsigned p,int v){if(cf_gpio_valid(p))GPIOPinWrite(port(p),1u<<(p%8),v?255:0);}int cf_gpio_read(unsigned p){return cf_gpio_valid(p)?!!GPIOPinRead(port(p),1u<<(p%8)):0;}
void cf_delay_us(unsigned us){unsigned start=HWREG(0xe0001004),ticks=SystemCoreClock/1000000*us;while((unsigned)(HWREG(0xe0001004)-start)<ticks){}}
void cf_delay_ms(unsigned n){while(n--)cf_delay_us(1000);}unsigned cf_millis(void){return HWREG(0xe0001004)/(SystemCoreClock/1000);}
void cf_uart_begin(unsigned baud){SysCtlPeripheralEnable(SYSCTL_PERIPH_UART0);SysCtlPeripheralEnable(SYSCTL_PERIPH_GPIOA);GPIOPinConfigure(GPIO_PA0_U0RX);GPIOPinConfigure(GPIO_PA1_U0TX);GPIOPinTypeUART(GPIO_PORTA_BASE,3);UARTConfigSetExpClk(UART0_BASE,SystemCoreClock,baud,UART_CONFIG_WLEN_8);}
void cf_uart_write(unsigned char c){UARTCharPut(UART0_BASE,c);}int cf_uart_read(void){return UARTCharGetNonBlocking(UART0_BASE);}
void *memcpy(void*d,const void*s,unsigned n){unsigned char*a=d;const unsigned char*b=s;while(n--)*a++=*b++;return d;}void *memset(void*d,int c,unsigned n){unsigned char*a=d;while(n--)*a++=c;return d;}
extern unsigned _sidata,_sdata,_edata,_sbss,_ebss,_estack;extern int main(void);
void Default_Handler(void){for(;;){}}
${[['SysTick',-1],...['A','B','C','D','E','F'].map((p,i)=>['GPIOPort'+p,[0,1,2,3,4,30][i]]),['UART0',5],...[19,21,23,35,70,92].map((n,i)=>['Timer'+i+'A',n]),...Array.from({length:8},(_,i)=>['ADC'+(i>>>2)+'Seq'+(i%4),i<4?14+i:44+i])].map(([name])=>'void '+name+'_Handler(void)__attribute__((weak,alias("Default_Handler")));').join('\n')}
void Reset_Handler(void){unsigned*s=&_sidata,*d=&_sdata;while(d<&_edata)*d++=*s++;for(d=&_sbss;d<&_ebss;)*d++=0;HWREG(0xe000ed88)|=15u<<20;HWREG(0xe000edfc)|=1u<<24;HWREG(0xe0001000)=1;SystemInit();main();for(;;){}}
__attribute__((section(".vectors"),used))void(*const vectors[155])(void)={[0]=(void*)&_estack,[1]=Reset_Handler,[2]=Default_Handler,[3]=Default_Handler,[15]=SysTick_Handler,${[...['A','B','C','D','E','F'].map((p,i)=>['GPIOPort'+p,[0,1,2,3,4,30][i]]),['UART0',5],...[19,21,23,35,70,92].map((n,i)=>['Timer'+i+'A',n]),...Array.from({length:8},(_,i)=>['ADC'+(i>>>2)+'Seq'+(i%4),i<4?14+i:44+i])].map(([name,n])=>'['+(n+16)+']='+name+'_Handler').join(',')}};
`;
