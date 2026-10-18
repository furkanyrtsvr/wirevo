// Original bounded C17 LCD helper; not TI TivaWare or Arduino LiquidCrystal.
export const tivaLCDHeader=`#pragma once
#include <cf_hal.h>
static unsigned cf_lcd_pins[6],cf_lcd_sda,cf_lcd_scl,cf_lcd_addr,cf_lcd_i2c,cf_lcd_cols;
static int cf_lcd_bus_ok=1;
static inline void cf_lcd_line(unsigned pin,unsigned high){if(high)cf_gpio_mode(pin,CF_INPUT);else{cf_gpio_write(pin,0);cf_gpio_mode(pin,CF_OUTPUT);}cf_delay_us(10);}
static inline int cf_lcd_i2c_byte(unsigned value){for(int b=7;b>=0;b--){cf_lcd_line(cf_lcd_sda,(value>>b)&1);cf_lcd_line(cf_lcd_scl,1);cf_lcd_line(cf_lcd_scl,0);}cf_lcd_line(cf_lcd_sda,1);cf_lcd_line(cf_lcd_scl,1);int ack=!cf_gpio_read(cf_lcd_sda);cf_lcd_line(cf_lcd_scl,0);return ack;}
static inline void cf_lcd_pcf(unsigned value){cf_lcd_line(cf_lcd_sda,1);cf_lcd_line(cf_lcd_scl,1);cf_lcd_line(cf_lcd_sda,0);cf_lcd_line(cf_lcd_scl,0);cf_lcd_bus_ok &= cf_lcd_i2c_byte(cf_lcd_addr<<1);cf_lcd_bus_ok &= cf_lcd_i2c_byte(value);cf_lcd_line(cf_lcd_sda,0);cf_lcd_line(cf_lcd_scl,1);cf_lcd_line(cf_lcd_sda,1);}
static inline void cf_lcd_nibble(unsigned value,unsigned data){if(cf_lcd_i2c){unsigned v=(value<<4)|8|data;cf_lcd_pcf(v|4);cf_lcd_pcf(v);}else{cf_gpio_write(cf_lcd_pins[0],data);for(unsigned b=0;b<4;b++)cf_gpio_write(cf_lcd_pins[2+b],(value>>b)&1);cf_gpio_write(cf_lcd_pins[1],1);cf_delay_us(1);cf_gpio_write(cf_lcd_pins[1],0);}cf_delay_us(50);}
static inline void cf_lcd_send(unsigned value,unsigned data){cf_lcd_nibble(value>>4,data);cf_lcd_nibble(value&15,data);}
static inline void cf_lcd_clear(void){cf_lcd_send(1,0);cf_delay_ms(2);}
static inline void cf_lcd_start(unsigned columns){cf_lcd_cols=columns;cf_delay_ms(50);cf_lcd_nibble(3,0);cf_delay_ms(5);cf_lcd_nibble(3,0);cf_delay_ms(1);cf_lcd_nibble(3,0);cf_lcd_nibble(2,0);cf_lcd_send(0x28,0);cf_lcd_send(0x0c,0);cf_lcd_send(6,0);cf_lcd_clear();}
static inline void cf_lcd_init(unsigned rs,unsigned e,unsigned d4,unsigned d5,unsigned d6,unsigned d7,unsigned columns){cf_lcd_i2c=0;unsigned p[6]={rs,e,d4,d5,d6,d7};for(unsigned i=0;i<6;i++){cf_lcd_pins[i]=p[i];cf_gpio_mode(p[i],CF_OUTPUT);cf_gpio_write(p[i],0);}cf_lcd_start(columns);}
static inline int cf_lcd_i2c_init(unsigned sda,unsigned scl,unsigned address,unsigned columns){cf_lcd_i2c=1;cf_lcd_sda=sda;cf_lcd_scl=scl;cf_lcd_addr=address;cf_lcd_bus_ok=1;cf_lcd_line(sda,1);cf_lcd_line(scl,1);cf_lcd_start(columns);return cf_lcd_bus_ok;}
static inline void cf_lcd_cursor(unsigned col,unsigned row){if(row<2&&col<cf_lcd_cols)cf_lcd_send(0x80|(row?0x40:0)|col,0);}
static inline void cf_lcd_print(const char *s){while(*s)cf_lcd_send((unsigned char)*s++,1);}
`;
