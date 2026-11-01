export const TINYUSB_CONFIG=`#pragma once
#define CFG_TUSB_MCU OPT_MCU_NONE
#define CFG_TUSB_OS OPT_OS_NONE
#define CFG_TUSB_RHPORT0_MODE (OPT_MODE_DEVICE | OPT_MODE_FULL_SPEED)
#define CFG_TUD_ENABLED 1
#define CFG_TUD_ENDPOINT0_SIZE 64
#define CFG_TUD_HID 1
#define CFG_TUD_HID_EP_BUFSIZE 64
#define TUP_DCD_ENDPOINT_MAX 2
#define CFG_TUSB_DEBUG 0
`;
export const TINYUSB_DCD_HEADER=`#pragma once
/* Poll the Wirevo virtual controller BEFORE tud_task(). The actual TinyUSB
 * core, control endpoint and HID class run as C on the simulated ARM CPU. */
void wirevo_usb_poll(void);
`;
export const TINYUSB_DCD_C=`#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include "device/dcd.h"
static volatile uint32_t * const bridge=(volatile uint32_t*)0x5fffc000;
static int cmd(unsigned op){while(bridge[5]&0x80000000u){}bridge[11]=op;while(bridge[5]&0x80000000u){}return (int)bridge[9];}
bool dcd_init(uint8_t p,const tusb_rhport_init_t *init){(void)p;(void)init;return cmd(1)==0;}
bool dcd_deinit(uint8_t p){(void)p;cmd(8);return true;}
void dcd_int_enable(uint8_t p){(void)p;}
void dcd_int_disable(uint8_t p){(void)p;}
void dcd_int_handler(uint8_t p){(void)p;}
void dcd_connect(uint8_t p){(void)p;}
void dcd_disconnect(uint8_t p){(void)p;cmd(8);}
void dcd_remote_wakeup(uint8_t p){(void)p;cmd(9);}
void dcd_sof_enable(uint8_t p,bool en){(void)p;(void)en;}
void dcd_set_address(uint8_t p,uint8_t a){(void)a;dcd_edpt_xfer(p,0x80,0,0);}
bool dcd_edpt_open(uint8_t p,const tusb_desc_endpoint_t *e){(void)p;if(e->bEndpointAddress!=0x81||e->bmAttributes.xfer!=TUSB_XFER_INTERRUPT||tu_edpt_packet_size(e)>64)return false;bridge[8]=e->bEndpointAddress;bridge[7]=tu_edpt_packet_size(e);return cmd(4)==0;}
void dcd_edpt_close_all(uint8_t p){(void)p;cmd(6);}
void dcd_edpt_close(uint8_t p,uint8_t ep){(void)p;(void)ep;cmd(6);}
bool dcd_edpt_xfer(uint8_t p,uint8_t ep,uint8_t *buf,uint16_t len){(void)p;bridge[6]=(uint32_t)buf;bridge[7]=len;bridge[8]=ep;return cmd(3)==0;}
void dcd_edpt_stall(uint8_t p,uint8_t ep){(void)p;(void)ep;cmd(5);}
void dcd_edpt_clear_stall(uint8_t p,uint8_t ep){(void)p;(void)ep;}
void dcd_edpt0_status_complete(uint8_t p,const tusb_control_request_t *r){(void)p;(void)r;cmd(7);}
uint32_t tusb_time_millis_api(void){return bridge[10];}
void wirevo_usb_poll(void){unsigned budget=16;while(budget--&&bridge[1]){unsigned type=bridge[1],a=bridge[2],b=bridge[3],c=bridge[4];cmd(2);switch(type){case 1:dcd_event_bus_reset(0,TUSB_SPEED_FULL,false);break;case 2:{uint32_t setup[2]={a,b};dcd_event_setup_received(0,(uint8_t*)setup,false);break;}case 3:dcd_event_xfer_complete(0,a,b,c,false);break;case 4:dcd_event_bus_signal(0,DCD_EVENT_UNPLUGGED,false);break;case 5:dcd_event_bus_signal(0,DCD_EVENT_SUSPEND,false);break;case 6:dcd_event_bus_signal(0,DCD_EVENT_RESUME,false);break;}}}
void *memcpy(void *dst,const void *src,size_t n){unsigned char*d=dst;const unsigned char*s=src;while(n--)*d++=*s++;return dst;}
void *memset(void *dst,int c,size_t n){unsigned char*d=dst;while(n--)*d++=(unsigned char)c;return dst;}
void *memmove(void *dst,const void *src,size_t n){unsigned char*d=dst;const unsigned char*s=src;if(d<s){for(size_t i=0;i<n;i++)d[i]=s[i];}else{while(n){--n;d[n]=s[n];}}return dst;}
int memcmp(const void*a,const void*b,size_t n){const unsigned char*x=a,*y=b;while(n--){if(*x!=*y)return *x-*y;x++;y++;}return 0;}
size_t strlen(const char*s){size_t n=0;while(s[n])n++;return n;}
`;
export const TINYUSB_C_FILES=['tusb.c','common/tusb_fifo.c','device/usbd.c','device/usbd_control.c','class/hid/hid_device.c'];
