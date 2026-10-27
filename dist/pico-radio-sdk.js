import {cyw43CompatC} from './pico-cyw43-compat.js';
export function radioRuntimeC(board){return board.wireless?`
#include <pico/cyw43_arch.h>
#include <wirevo/net.h>
#define NREG(n) REG(0x5fffe100u+(n))
int cyw43_arch_init(void){gpio_init(25);gpio_put(25,1);gpio_set_dir(25,1);gpio_init(23);gpio_put(23,1);gpio_set_dir(23,1);NREG(0)=1;return (int)NREG(4)<0?-1:0;}void cyw43_arch_deinit(void){NREG(0)=0;gpio_put(23,0);}
void cyw43_arch_enable_sta_mode(void){NREG(0)=2;}
int cyw43_arch_wifi_connect_timeout_ms(const char*ssid,const char*pass,uint32_t auth,uint32_t timeout){if(cyw43_arch_wifi_connect_async(ssid,pass,auth))return -1;unsigned start=time_us_32();int state;while((state=(int)NREG(4))==1||state==2){if((unsigned)(time_us_32()-start)/1000>=timeout){NREG(0)=4;return -1;}}return state==3?0:-1;}
void cyw43_arch_gpio_put(uint pin,bool value){if(pin<2)NREG(64)=(pin<<1)|value;}bool cyw43_arch_gpio_get(uint pin){return pin<3&&!!(NREG(60)&(1u<<pin));}
void cyw43_arch_poll(void){(void)NREG(4);}int wirevo_net_link_status(void){return (int)NREG(4);}
int wirevo_udp_send(const char*ip,uint16_t port,const void*data,uint len){NREG(24)=(unsigned)ip;NREG(28)=port;NREG(32)=(unsigned)data;NREG(36)=len;NREG(0)=5;return (int)NREG(40);}
int wirevo_udp_recv(void*data,uint len){NREG(32)=(unsigned)data;NREG(36)=len;NREG(0)=6;return (int)NREG(40);}
int wirevo_ble_advertise(const char*name){NREG(8)=(unsigned)name;NREG(0)=7;return (int)NREG(40);}bool wirevo_ble_connected(void){return !!NREG(44);}
int wirevo_ble_write(const void*data,uint len){NREG(32)=(unsigned)data;NREG(36)=len;NREG(0)=8;return (int)NREG(40);}int wirevo_ble_read(void*data,uint len){NREG(32)=(unsigned)data;NREG(36)=len;NREG(0)=9;return (int)NREG(40);}
`+cyw43CompatC:'';}
