// Small, source-compatible teaching subset. I2C/SPI are GPIO-driven masters,
// so every bit still passes through the electrical circuit and device model.
export const peripheralHeaders={
 'hardware/adc.h':`#pragma once
#include <pico/stdlib.h>
void adc_init(void);void adc_gpio_init(uint);void adc_select_input(uint);uint adc_get_selected_input(void);uint16_t adc_read(void);void adc_set_temp_sensor_enabled(bool);void adc_run(bool);void adc_set_round_robin(uint);void adc_fifo_setup(bool,bool,uint,bool,bool);bool adc_fifo_is_empty(void);uint adc_fifo_get_level(void);uint16_t adc_fifo_get(void);uint16_t adc_fifo_get_blocking(void);void adc_fifo_drain(void);void adc_irq_set_enabled(bool);void adc_set_clkdiv(float);
`,
 'hardware/pwm.h':`#pragma once
#include <pico/stdlib.h>
#define GPIO_FUNC_PWM 4
typedef struct {uint32_t csr,div,top;} pwm_config;
uint pwm_gpio_to_slice_num(uint);uint pwm_gpio_to_channel(uint);pwm_config pwm_get_default_config(void);
void pwm_config_set_wrap(pwm_config*,uint16_t);void pwm_config_set_clkdiv_int(pwm_config*,uint);void pwm_init(uint,pwm_config*,bool);
void pwm_set_wrap(uint,uint16_t);void pwm_set_chan_level(uint,uint,uint16_t);void pwm_set_gpio_level(uint,uint16_t);void pwm_set_enabled(uint,bool);void pwm_set_clkdiv_int_frac(uint,uint8_t,uint8_t);void pwm_set_counter(uint,uint16_t);uint16_t pwm_get_counter(uint);
`,
 'hardware/uart.h':`#pragma once
#include <pico/stdlib.h>
typedef struct {uint index;} uart_inst_t;extern uart_inst_t cf_uart0,cf_uart1;
#define uart0 (&cf_uart0)
#define uart1 (&cf_uart1)
uint uart_init(uart_inst_t*,uint);void uart_putc_raw(uart_inst_t*,char);void uart_putc(uart_inst_t*,char);void uart_puts(uart_inst_t*,const char*);int uart_getc(uart_inst_t*);bool uart_is_readable(uart_inst_t*);bool uart_is_writable(uart_inst_t*);void uart_write_blocking(uart_inst_t*,const uint8_t*,unsigned);void uart_read_blocking(uart_inst_t*,uint8_t*,unsigned);
`,
 'hardware/i2c.h':`#pragma once
#include <pico/stdlib.h>
typedef struct {uint index;} i2c_inst_t;extern i2c_inst_t cf_i2c0,cf_i2c1;
#define i2c0 (&cf_i2c0)
#define i2c1 (&cf_i2c1)
#define PICO_ERROR_GENERIC (-1)
uint i2c_init(i2c_inst_t*,uint);int i2c_write_blocking(i2c_inst_t*,uint8_t,const uint8_t*,unsigned,bool);int i2c_read_blocking(i2c_inst_t*,uint8_t,uint8_t*,unsigned,bool);
`,
 'hardware/spi.h':`#pragma once
#include <pico/stdlib.h>
typedef struct {uint index;} spi_inst_t;extern spi_inst_t cf_spi0,cf_spi1;
#define spi0 (&cf_spi0)
#define spi1 (&cf_spi1)
#define SPI_CPOL_0 0
#define SPI_CPOL_1 1
#define SPI_CPHA_0 0
#define SPI_CPHA_1 1
#define SPI_MSB_FIRST 0
#define SPI_LSB_FIRST 1
uint spi_init(spi_inst_t*,uint);void spi_set_format(spi_inst_t*,uint,uint,uint,uint);int spi_write_read_blocking(spi_inst_t*,const uint8_t*,uint8_t*,unsigned);int spi_write_blocking(spi_inst_t*,const uint8_t*,unsigned);int spi_read_blocking(spi_inst_t*,uint8_t,uint8_t*,unsigned);
`};
export function peripheralRuntimeC(board){const newer=board.mcu==='RP2350';return`
#include <hardware/adc.h>
#include <hardware/pwm.h>
#include <hardware/uart.h>
#include <hardware/i2c.h>
#include <hardware/spi.h>
#define ADC ${newer?'0x400a0000u':'0x4004c000u'}
#define PWM ${newer?'0x400a8000u':'0x40050000u'}
static unsigned cf_mux[30];
void cf_bus_mux(uint p,uint f){if(p<30)cf_mux[p]=f;}
void adc_init(void){REG(ADC)=1;}
void adc_gpio_init(uint p){gpio_init(p);gpio_disable_pulls(p);REG(PADS+4+p*4)&=~64u;gpio_set_function(p,31);}
void adc_select_input(uint n){REG(ADC)=(REG(ADC)&~(7u<<12))|((n&7u)<<12);}
uint adc_get_selected_input(void){return (REG(ADC)>>12)&7;}
void adc_set_temp_sensor_enabled(bool e){REG(ADC)=(REG(ADC)&~2u)|(e?2u:0);}
void adc_run(bool on){REG(ADC)=(REG(ADC)&~8u)|(on?8u:0);}
void adc_set_round_robin(uint mask){REG(ADC)=(REG(ADC)&~(31u<<16))|((mask&31u)<<16);}
void adc_fifo_setup(bool en,bool dreq,uint threshold,bool err,bool shift){REG(ADC+8)=(en?1u:0)|(shift?2u:0)|(err?4u:0)|(dreq?8u:0)|((threshold&15)<<24);}
bool adc_fifo_is_empty(void){return !!(REG(ADC+8)&256u);}uint adc_fifo_get_level(void){return(REG(ADC+8)>>16)&15;}
uint16_t adc_fifo_get(void){return REG(ADC+12);}uint16_t adc_fifo_get_blocking(void){while(adc_fifo_is_empty()){}return adc_fifo_get();}
void adc_fifo_drain(void){while(!adc_fifo_is_empty())(void)adc_fifo_get();}
void adc_irq_set_enabled(bool e){REG(ADC+0x18)=e?1:0;}
void adc_set_clkdiv(float value){union{float f;unsigned bits;}v={value};unsigned exp=(v.bits>>23)&255,scaled=0;if(!(v.bits>>31)&&exp&&exp<255){int shift=(int)exp-127-15;unsigned mant=(v.bits&0x7fffffu)|0x800000u;scaled=shift>=1?0xffffffu:shift==0?mant:shift<=-24?0:mant>>(-shift);}REG(ADC+16)=scaled;}
uint16_t adc_read(void){REG(ADC)|=4;while(!(REG(ADC)&256)){}return REG(ADC+4)&4095;}
uint pwm_gpio_to_slice_num(uint p){return(p>>1)&7;}uint pwm_gpio_to_channel(uint p){return p&1;}
pwm_config pwm_get_default_config(void){pwm_config c={0,16,65535};return c;}
void pwm_config_set_wrap(pwm_config*c,uint16_t v){c->top=v;}
void pwm_config_set_clkdiv_int(pwm_config*c,uint v){c->div=(v&255)<<4;}
void pwm_init(uint s,pwm_config*c,bool e){unsigned a=PWM+s*20;REG(a)=0;REG(a+4)=c->div;REG(a+8)=0;REG(a+12)=0;REG(a+16)=c->top;REG(a)=c->csr|(e?1u:0);}
void pwm_set_wrap(uint s,uint16_t v){REG(PWM+s*20+16)=v;}
void pwm_set_chan_level(uint s,uint ch,uint16_t v){unsigned a=PWM+s*20+12,shift=(ch&1)*16;REG(a)=(REG(a)&~(65535u<<shift))|((unsigned)v<<shift);}
void pwm_set_gpio_level(uint p,uint16_t v){pwm_set_chan_level(pwm_gpio_to_slice_num(p),p&1,v);}
void pwm_set_enabled(uint s,bool e){REG(PWM+s*20)=(REG(PWM+s*20)&~1u)|(e?1u:0);}
void pwm_set_clkdiv_int_frac(uint s,uint8_t i,uint8_t f){REG(PWM+s*20+4)=((unsigned)i<<4)|(f&15);}
void pwm_set_counter(uint s,uint16_t n){REG(PWM+s*20+8)=n;}uint16_t pwm_get_counter(uint s){return REG(PWM+s*20+8);}
uart_inst_t cf_uart0={0},cf_uart1={1};
static unsigned cf_ua(uart_inst_t*u){return UART+u->index*${newer?'0x8000u':'0x4000u'};}
uint uart_init(uart_inst_t*u,uint baud){unsigned a=cf_ua(u),scaled=${board.hz}u*4u/(baud?baud:115200);REG(a+0x30)=0;REG(a+0x24)=scaled>>6;REG(a+0x28)=scaled&63;REG(a+0x2c)=0x60;REG(a+0x30)=0x301;return ${board.hz}u*4u/scaled;}
bool uart_is_readable(uart_inst_t*u){return !(REG(cf_ua(u)+0x18)&16u);}bool uart_is_writable(uart_inst_t*u){return !(REG(cf_ua(u)+0x18)&32u);}
void uart_putc_raw(uart_inst_t*u,char c){while(!uart_is_writable(u)){}REG(cf_ua(u))=(unsigned char)c;}void uart_putc(uart_inst_t*u,char c){uart_putc_raw(u,c);}
int uart_getc(uart_inst_t*u){while(!uart_is_readable(u)){}return REG(cf_ua(u))&255;}
void uart_puts(uart_inst_t*u,const char*s){while(*s)uart_putc_raw(u,*s++);}
void uart_write_blocking(uart_inst_t*u,const uint8_t*s,unsigned n){while(n--)uart_putc_raw(u,*s++);}void uart_read_blocking(uart_inst_t*u,uint8_t*d,unsigned n){while(n--)*d++=uart_getc(u);}
i2c_inst_t cf_i2c0={0},cf_i2c1={1};spi_inst_t cf_spi0={0},cf_spi1={1};
static unsigned cf_half_i[2]={5,5},cf_half_s[2]={1,1},cf_cp[2],cf_ph[2],cf_spi_invalid[2];
static int cf_pin(unsigned bus,unsigned f,unsigned role){for(unsigned p=0;p<30;p++){if(cf_mux[p]!=f)continue;if(f==3&&((p>>1)&1)==bus&&(p&1)==role)return p;if(f==1&&((p>>3)&1)==bus&&(p&3)==role)return p;}return -1;}
// Open-drain lines: release means input, never actively drive I2C high.
static void cf_od(unsigned p,bool high){gpio_set_dir(p,!high);gpio_put(p,0);}
static void cf_bus_pin(unsigned p){REG(IO+4+p*8)=5;gpio_put(p,0);}
uint i2c_init(i2c_inst_t*i,uint baud){cf_half_i[i->index]=500000u/(baud?baud:100000);if(!cf_half_i[i->index])cf_half_i[i->index]=1;return 500000u/cf_half_i[i->index];}
static bool cf_scl(unsigned p,bool high,unsigned t){cf_od(p,high);unsigned start=time_us_32();while(high&&!gpio_get(p)){if((unsigned)(time_us_32()-start)>10000)return false;}sleep_us(t);return true;}
static int cf_i2c(i2c_inst_t*i,uint8_t addr,const uint8_t*src,uint8_t*dst,unsigned n,bool nostop){int s=cf_pin(i->index,3,0),c=cf_pin(i->index,3,1);if(s<0||c<0)return -1;unsigned t=cf_half_i[i->index];cf_bus_pin(s);cf_bus_pin(c);cf_od(s,1);if(!cf_scl(c,1,t))return -1;cf_od(s,0);sleep_us(t);cf_scl(c,0,t);
 for(unsigned j=0;j<=n;j++){unsigned b=j?(src?src[j-1]:255):((unsigned)addr<<1)|(dst?1u:0),value=0;for(unsigned k=0;k<8;k++){cf_od(s,!!(b&(128u>>k)));sleep_us(t);if(!cf_scl(c,1,t))return -1;value=(value<<1)|gpio_get(s);cf_scl(c,0,t);}if(j&&dst)dst[j-1]=value;cf_od(s,(j&&dst)?j==n:1);sleep_us(t);if(!cf_scl(c,1,t))return -1;bool ack=!gpio_get(s);cf_scl(c,0,t);cf_od(s,1);if((!j||src)&&!ack){cf_od(s,0);cf_scl(c,1,t);cf_od(s,1);return -1;}}
 if(!nostop){cf_od(s,0);sleep_us(t);if(!cf_scl(c,1,t))return -1;cf_od(s,1);sleep_us(t);}return n;}
int i2c_write_blocking(i2c_inst_t*i,uint8_t a,const uint8_t*s,unsigned n,bool ns){return cf_i2c(i,a,s,0,n,ns);}int i2c_read_blocking(i2c_inst_t*i,uint8_t a,uint8_t*d,unsigned n,bool ns){return cf_i2c(i,a,0,d,n,ns);}
uint spi_init(spi_inst_t*s,uint baud){cf_half_s[s->index]=500000u/(baud?baud:500000);if(!cf_half_s[s->index])cf_half_s[s->index]=1;return 500000u/cf_half_s[s->index];}
void spi_set_format(spi_inst_t*s,uint bits,uint cp,uint ph,uint order){cf_cp[s->index]=cp;cf_ph[s->index]=ph;cf_spi_invalid[s->index]=bits!=8||order!=SPI_MSB_FIRST||cp>1||ph>1;}
static int cf_spi(spi_inst_t*s,const uint8_t*src,uint8_t*dst,unsigned n,uint8_t fill){if(cf_spi_invalid[s->index])return -1;int rx=cf_pin(s->index,1,0),ck=cf_pin(s->index,1,2),tx=cf_pin(s->index,1,3);if(ck<0||tx<0)return -1;cf_bus_pin(ck);cf_bus_pin(tx);gpio_set_dir(ck,1);gpio_set_dir(tx,1);if(rx>=0){cf_bus_pin(rx);gpio_set_dir(rx,0);}unsigned cp=cf_cp[s->index],ph=cf_ph[s->index],t=cf_half_s[s->index];gpio_put(ck,cp);for(unsigned j=0;j<n;j++){unsigned b=src?src[j]:fill,v=0;for(unsigned k=0;k<8;k++){if(!ph)gpio_put(tx,!!(b&(128u>>k)));sleep_us(t);gpio_put(ck,!cp);if(ph)gpio_put(tx,!!(b&(128u>>k)));else v=(v<<1)|(rx>=0?gpio_get(rx):1);sleep_us(t);gpio_put(ck,cp);if(ph)v=(v<<1)|(rx>=0?gpio_get(rx):1);}if(dst)dst[j]=v;}return n;}
int spi_write_read_blocking(spi_inst_t*s,const uint8_t*a,uint8_t*b,unsigned n){return cf_spi(s,a,b,n,255);}int spi_write_blocking(spi_inst_t*s,const uint8_t*a,unsigned n){return cf_spi(s,a,0,n,255);}int spi_read_blocking(spi_inst_t*s,uint8_t f,uint8_t*b,unsigned n){return cf_spi(s,0,b,n,f);}
`;}
