// Polled CDC ACM subset. Firmware handles real USB SETUP packets and DPRAM.
export function usbRuntimeC(){return`
#include <tusb.h>
#include <pico/stdio_usb.h>
#define UREG(a) REG(0x50110000u+(a))
#define DPR(a) REG(0x50100000u+(a))
int cf_usb_stdio_enabled;
static unsigned cf_usb_started,cf_usb_mounted,cf_usb_connected,cf_usb_left,cf_usb_pos,cf_usb_rxpos;
static const unsigned char*cf_usb_data;
static const unsigned char cf_usb_device[]={18,1,0,2,2,0,0,64,0x8a,0x2e,0x0a,0,0,1,0,0,0,1};
static const unsigned char cf_usb_config[]={9,2,67,0,2,1,0,0x80,50,9,4,0,0,1,2,2,1,0,5,0x24,0,0x10,1,5,0x24,1,0,1,4,0x24,2,2,5,0x24,6,0,1,7,5,0x83,3,8,0,16,9,4,1,0,2,10,0,0,0,7,5,0x81,2,64,0,0,7,5,2,2,64,0,0};
static const unsigned char cf_usb_line[]={0,0xc2,1,0,0,0,8};
static void cf_usb_ep0_packet(void){unsigned n=cf_usb_left>64?64:cf_usb_left;volatile unsigned char*p=(volatile unsigned char*)0x50100100u;for(unsigned i=0;i<n;i++)p[i]=cf_usb_data[cf_usb_pos+i];cf_usb_left-=n;cf_usb_pos+=n;DPR(0x80)=0x8400u|n;}
static void cf_usb_reply(const unsigned char*data,unsigned n,unsigned requested){cf_usb_data=data;cf_usb_left=n<requested?n:requested;cf_usb_pos=0;cf_usb_ep0_packet();}
bool tud_init(uint8_t port){(void)port;if(cf_usb_started)return true;cf_usb_started=1;DPR(8)=0xa8000180u;DPR(20)=0xa80001c0u;UREG(0x74)=9;UREG(0x40)=1;return true;}
void tud_task(void){if(!cf_usb_started)return;unsigned status=UREG(0x50),buffers=UREG(0x58);if(status&(1u<<19)){cf_usb_connected=cf_usb_mounted=0;cf_usb_left=0;UREG(0x50)=1u<<19;return;}if(status&(1u<<17)){volatile unsigned char*s=(volatile unsigned char*)0x50100000u;unsigned req=s[1],value=s[2]|((unsigned)s[3]<<8),len=s[6]|((unsigned)s[7]<<8);UREG(0x50)=1u<<17;cf_usb_left=0;UREG(0x58)=buffers;if(req==6){if((value>>8)==2)cf_usb_reply(cf_usb_config,sizeof cf_usb_config,len);else cf_usb_reply(cf_usb_device,sizeof cf_usb_device,len);}else if(req==9){cf_usb_mounted=value==1;cf_usb_rxpos=0;DPR(0x94)=0x400u|64;cf_usb_reply(cf_usb_device,0,0);}else if(req==0x22){cf_usb_connected=!!(value&1);cf_usb_reply(cf_usb_device,0,0);}else if(req==0x21)cf_usb_reply(cf_usb_line,7,len);else cf_usb_reply(cf_usb_device,0,0);return;}if(buffers&1){UREG(0x58)=1;if(cf_usb_left)cf_usb_ep0_packet();}}
bool tud_mounted(void){tud_task();return cf_usb_mounted;}bool tud_cdc_connected(void){tud_task();return cf_usb_mounted&&cf_usb_connected;}
bool stdio_usb_init(void){cf_usb_stdio_enabled=1;return tud_init(0);}bool stdio_usb_connected(void){return tud_cdc_connected();}
uint32_t tud_cdc_available(void){tud_task();unsigned ctrl=DPR(0x94);return (ctrl&0x8000)?(ctrl&1023)-cf_usb_rxpos:0;}
uint32_t tud_cdc_read(void*dst,uint32_t len){unsigned n=tud_cdc_available();if(n>len)n=len;unsigned char*d=dst;volatile unsigned char*s=(volatile unsigned char*)0x501001c0u;for(unsigned i=0;i<n;i++)d[i]=s[cf_usb_rxpos++];if(n&&cf_usb_rxpos==(DPR(0x94)&1023)){cf_usb_rxpos=0;UREG(0x58)=1u<<5;DPR(0x94)=0x400u|64;}return n;}
int32_t tud_cdc_read_char(void){unsigned char c;return tud_cdc_read(&c,1)?c:-1;}
uint32_t tud_cdc_write(const void*src,uint32_t len){tud_task();if(!tud_cdc_connected())return 0;const unsigned char*s=src;for(unsigned off=0;off<len;){unsigned n=len-off;if(n>64)n=64;volatile unsigned char*d=(volatile unsigned char*)0x50100180u;for(unsigned i=0;i<n;i++)d[i]=s[off+i];DPR(0x88)=0x8400u|n;off+=n;}return len;}
uint32_t tud_cdc_write_char(char c){return tud_cdc_write(&c,1);}uint32_t tud_cdc_write_flush(void){tud_task();return 0;}
`;}
