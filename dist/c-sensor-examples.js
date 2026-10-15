// Original, editable C17 application sources. All bus traffic uses actual GPIO.
const header=`#pragma once
#include <stdint.h>
typedef struct { unsigned sda, scl, half_us; } cf_i2c;
typedef struct { unsigned sck, miso, mosi, half_us; } cf_spi;
int cf_i2c_init(cf_i2c*, unsigned sda, unsigned scl, unsigned hz);
int cf_i2c_write(cf_i2c*, unsigned address, const uint8_t*, unsigned count);
int cf_i2c_read(cf_i2c*, unsigned address, uint8_t*, unsigned count);
int cf_spi_init(cf_spi*, unsigned sck, unsigned miso, unsigned mosi, unsigned hz);
uint8_t cf_spi_transfer(cf_spi*, uint8_t);
`;
const transport=`#include "cf_bus.h"
#include <cf_hal.h>
// Open drain: drive LOW or release with a real internal pull-up.
static void low(unsigned p) { cf_gpio_write(p,0); cf_gpio_mode(p,CF_OUTPUT); }
static void release(unsigned p) { cf_gpio_mode(p,CF_INPUT_PULLUP); }
static void tick(cf_i2c *b) { cf_delay_us(b->half_us); }
static int clock_high(cf_i2c *b) {
    release(b->scl); tick(b);
    return cf_gpio_read(b->scl); // bounded failure; no clock-stretch support
}
static void stop(cf_i2c *b) { low(b->sda); tick(b); clock_high(b); release(b->sda); tick(b); }
static int start(cf_i2c *b) {
    release(b->sda); if(!clock_high(b)||!cf_gpio_read(b->sda)) return 0;
    low(b->sda); tick(b); low(b->scl); return 1;
}
static int send(cf_i2c *b,uint8_t v) {
    for(int i=7;i>=0;--i) {
        if(v&(1u<<i)) release(b->sda); else low(b->sda);
        tick(b); if(!clock_high(b)) {low(b->scl); return 0;} low(b->scl);
    }
    release(b->sda); tick(b);
    int ok=clock_high(b)&&!cf_gpio_read(b->sda); low(b->scl); return ok;
}
int cf_i2c_init(cf_i2c *b,unsigned sda,unsigned scl,unsigned hz) {
    if(!b||sda==scl||!cf_gpio_valid(sda)||!cf_gpio_valid(scl)||hz<1000||hz>10000) return -1;
    b->sda=sda; b->scl=scl; b->half_us=(500000+hz-1)/hz;
    release(sda); release(scl); return 0;
}
int cf_i2c_write(cf_i2c *b,unsigned address,const uint8_t *data,unsigned count) {
    if(!b||!b->half_us||address>127||count>128||(!data&&count)) return -1;
    if(!start(b)||!send(b,(uint8_t)(address<<1))) {stop(b);return -1;}
    for(unsigned i=0;i<count;++i) if(!send(b,data[i])) {stop(b);return -1;}
    stop(b); return (int)count;
}
int cf_i2c_read(cf_i2c *b,unsigned address,uint8_t *data,unsigned count) {
    if(!b||!b->half_us||address>127||!count||count>128||!data) return -1;
    if(!start(b)||!send(b,(uint8_t)((address<<1)|1))) {stop(b);return -1;}
    for(unsigned i=0;i<count;++i) {
        uint8_t v=0; release(b->sda);
        for(int bit=0;bit<8;++bit) {tick(b);if(!clock_high(b)){stop(b);return -1;}v=(v<<1)|cf_gpio_read(b->sda);low(b->scl);}
        data[i]=v; if(i+1<count) low(b->sda); else release(b->sda);
        tick(b); if(!clock_high(b)){stop(b);return -1;}low(b->scl); release(b->sda);
    }
    stop(b); return (int)count;
}
int cf_spi_init(cf_spi *b,unsigned sck,unsigned miso,unsigned mosi,unsigned hz) {
    if(!b||sck==miso||sck==mosi||miso==mosi||!cf_gpio_valid(sck)||!cf_gpio_valid(miso)||!cf_gpio_valid(mosi)||hz<10000||hz>20000) return -1;
    b->sck=sck;b->miso=miso;b->mosi=mosi;b->half_us=(500000+hz-1)/hz;
    cf_gpio_write(sck,0);cf_gpio_mode(sck,CF_OUTPUT);cf_gpio_mode(mosi,CF_OUTPUT);cf_gpio_mode(miso,CF_INPUT_PULLUP);return 0;
}
uint8_t cf_spi_transfer(cf_spi *b,uint8_t v) {
    if(!b||!b->half_us) return 0;
    uint8_t rx=0;
    for(int i=7;i>=0;--i){cf_gpio_write(b->mosi,(v>>i)&1);cf_delay_us(b->half_us);cf_gpio_write(b->sck,1);cf_delay_us(b->half_us);rx=(rx<<1)|cf_gpio_read(b->miso);cf_gpio_write(b->sck,0);}
    return rx;
}
`;
const sht31=`#include <cf_hal.h>
#include <stdio.h>
#include "cf_bus.h"
enum { SDA = 4, SCL = 5 };
static uint8_t crc8(const uint8_t *p) {
    uint8_t crc=255;
    for(int n=0;n<2;++n){crc^=p[n];for(int i=0;i<8;++i)crc=(crc&128)?(crc<<1)^0x31:crc<<1;}
    return crc;
}
int main(void) {
    cf_uart_begin(115200); cf_i2c bus={0};
    if(cf_i2c_init(&bus,SDA,SCL,10000)<0){puts("I2C INVALID PINS/FREQUENCY");return 1;}
    while(1) {
        const uint8_t cmd[2]={0x24,0};uint8_t data[6];
        if(cf_i2c_write(&bus,0x44,cmd,2)!=2){puts("SHT31 NO ACK");cf_delay_ms(100);continue;}
        cf_delay_ms(20);
        if(cf_i2c_read(&bus,0x44,data,6)!=6) puts("SHT31 READ ERROR");
        else if(crc8(data)!=data[2]||crc8(data+3)!=data[5]) puts("SHT31 CRC ERROR");
        else {
            unsigned t=((unsigned)data[0]<<8)|data[1],h=((unsigned)data[3]<<8)|data[4];
            printf("TEMP x100=%d HUM x100=%u\\r\\n",(int)(17500u*t/65535u)-4500,10000u*h/65535u);
        }
        cf_delay_ms(100);
    }
}
`;
const adc=`#include <cf_hal.h>
#include <stdio.h>
#include "cf_bus.h"
enum { SCK = 4, MISO = 6, MOSI = 5, CS = 7 };
int main(void) {
    cf_uart_begin(115200);cf_spi bus={0};
    if(!cf_gpio_valid(CS)||cf_spi_init(&bus,SCK,MISO,MOSI,20000)<0){puts("SPI INVALID PINS/FREQUENCY");return 1;}
    cf_gpio_write(CS,1);cf_gpio_mode(CS,CF_OUTPUT);
    while(1){
        cf_gpio_write(CS,0);cf_spi_transfer(&bus,1);
        unsigned high=cf_spi_transfer(&bus,128),low=cf_spi_transfer(&bus,0);
        cf_gpio_write(CS,1);unsigned raw=((high&3)<<8)|low;
        printf("ADC=%u mV=%u\\r\\n",raw,raw*3300u/1024u);cf_delay_ms(100);
    }
}
`;
export const C_SENSOR_EXAMPLES=[
 {id:'sht31',name:'C17 · I²C SHT31',detail:'cf_bus.c / CRC-8',circuit:'sensor-sht31',code:sht31},
 {id:'adc',name:'C17 · SPI MCP3008',detail:'cf_bus.c / potansiyometre',circuit:'sensor-adc',code:adc}
];
export const cBusFiles=()=>[{name:'cf_bus.h',content:header},{name:'cf_bus.c',content:transport}];
