// Original freestanding C ABI. The user translation unit is compiled as C17.
export const C_BRIDGE=`#include "Arduino.h"
extern "C" int cf_c_main(void);
extern "C" int cf_gpio_valid(unsigned p){return validPin(p);}
extern "C" void cf_gpio_mode(unsigned p,int m){pinMode(p,m);}
extern "C" void cf_gpio_write(unsigned p,int v){digitalWrite(p,v);}
extern "C" int cf_gpio_read(unsigned p){return digitalRead(p);}
extern "C" void cf_delay_ms(unsigned n){delay(n);}
extern "C" void cf_delay_us(unsigned n){delayMicroseconds(n);}
extern "C" unsigned cf_millis(void){return millis();}
extern "C" void cf_uart_begin(unsigned n){Serial.begin(n);}
extern "C" void cf_uart_write(unsigned char c){Serial.write(c);}
void setup(){cf_c_main();} void loop(){}
`;
export const C_HEADERS={
 'cf_hal.h':`#pragma once
#define CF_INPUT 0
#define CF_OUTPUT 1
#define CF_INPUT_PULLUP 2
int cf_gpio_valid(unsigned);
void cf_gpio_mode(unsigned,int); void cf_gpio_write(unsigned,int); int cf_gpio_read(unsigned);
void cf_delay_ms(unsigned); void cf_delay_us(unsigned); unsigned cf_millis(void);
void cf_uart_begin(unsigned); void cf_uart_write(unsigned char);
`,
 'stdint.h':'#pragma once\ntypedef unsigned char uint8_t; typedef signed char int8_t; typedef unsigned short uint16_t; typedef short int16_t; typedef unsigned int uint32_t; typedef int int32_t; typedef unsigned long long uint64_t; typedef long long int64_t;\n',
 'stdbool.h':'#pragma once\n#define bool _Bool\n#define true 1\n#define false 0\n',
 'stddef.h':'#pragma once\ntypedef __SIZE_TYPE__ size_t;\n#define NULL ((void*)0)\n',
 'stdio.h':String.raw`#pragma once
#include <cf_hal.h>
typedef __builtin_va_list cf_va_list;
static inline int putchar(int c){cf_uart_write((unsigned char)c);return c;}
static inline int puts(const char *s){while(*s)putchar(*s++);putchar('\r');putchar('\n');return 0;}
static inline void cf_number(unsigned n,unsigned base){char b[32];int i=0;do{unsigned d=n%base;b[i++]=d<10?'0'+d:'A'+d-10;n/=base;}while(n);while(i)putchar(b[--i]);}
static inline int printf(const char *fmt,...){cf_va_list ap;__builtin_va_start(ap,fmt);while(*fmt){if(*fmt!='%'){putchar(*fmt++);continue;}fmt++;switch(*fmt++){case '%':putchar('%');break;case 's':{const char*s=__builtin_va_arg(ap,const char*);if(s)while(*s)putchar(*s++);break;}case 'c':putchar(__builtin_va_arg(ap,int));break;case 'd':{int n=__builtin_va_arg(ap,int);if(n<0){putchar('-');cf_number(0u-(unsigned)n,10);}else cf_number(n,10);break;}case 'u':cf_number(__builtin_va_arg(ap,unsigned),10);break;case 'x':case 'X':cf_number(__builtin_va_arg(ap,unsigned),16);break;default:__builtin_va_end(ap);return -1;}}__builtin_va_end(ap);return 0;}
`
};
