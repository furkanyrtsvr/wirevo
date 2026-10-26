export const flashHeaders={
 'hardware/flash.h':`#pragma once
#include <stdint.h>
#include <stddef.h>
#define FLASH_PAGE_SIZE 256u
#define FLASH_SECTOR_SIZE 4096u
void flash_range_erase(uint32_t,size_t);
void flash_range_program(uint32_t,const uint8_t*,size_t);
`,
 'pico/bootrom.h':`#pragma once
#include <stdint.h>
void reset_usb_boot(uint32_t,uint32_t);
`
};
export const flashRuntimeC=`
static void cf_flash_request(unsigned cmd,unsigned off,unsigned n,const void*data){volatile unsigned*r=(volatile unsigned*)0x5fffe200u;r[1]=off;r[2]=n;r[3]=(unsigned)data;r[0]=cmd;}
void flash_range_erase(unsigned off,unsigned n){cf_flash_request(1,off,n,0);}
void flash_range_program(unsigned off,const unsigned char*data,unsigned n){cf_flash_request(2,off,n,data);}
void reset_usb_boot(unsigned mask,unsigned disabled){(void)mask;(void)disabled;cf_flash_request(3,0,0,0);for(;;){}}
`;
