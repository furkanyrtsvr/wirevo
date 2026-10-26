// Source-level subset for the documented virtual AP, NOT the CYW43 binary ABI.
export const cyw43Header=`#pragma once
#include <pico/stdlib.h>
typedef struct {unsigned wirevo_opaque;} cyw43_t;
extern cyw43_t cyw43_state;
#define CYW43_ITF_STA 0
#define CYW43_ITF_AP 1
#define CYW43_LINK_DOWN 0
#define CYW43_LINK_JOIN 1
#define CYW43_LINK_NOIP 2
#define CYW43_LINK_UP 3
#define CYW43_LINK_FAIL (-1)
#define CYW43_LINK_NONET (-2)
#define CYW43_LINK_BADAUTH (-3)
int cyw43_wifi_link_status(cyw43_t*,int);int cyw43_tcpip_link_status(cyw43_t*,int);int cyw43_wifi_get_mac(cyw43_t*,int,uint8_t[6]);int cyw43_wifi_get_rssi(cyw43_t*,int32_t*);int cyw43_wifi_leave(cyw43_t*,int);
`;
export const cyw43CompatC=`
cyw43_t cyw43_state;
int cyw43_arch_wifi_connect_async(const char*ssid,const char*pass,uint32_t auth){if(!ssid)return -22;NREG(8)=(unsigned)ssid;NREG(12)=(unsigned)pass;NREG(16)=auth;NREG(0)=3;return (int)NREG(4)==1?0:-1;}
void cyw43_arch_disable_sta_mode(void){NREG(0)=11;}
int cyw43_tcpip_link_status(cyw43_t*self,int itf){if(self!=&cyw43_state||itf!=CYW43_ITF_STA)return -22;return (int)NREG(4);}
int cyw43_wifi_link_status(cyw43_t*self,int itf){int n=cyw43_tcpip_link_status(self,itf);return n>=2?CYW43_LINK_JOIN:n==1?CYW43_LINK_DOWN:n;}
int cyw43_wifi_get_rssi(cyw43_t*self,int32_t*out){if(self!=&cyw43_state||!out)return -22;*out=(int)NREG(48);return 0;}
int cyw43_wifi_get_mac(cyw43_t*self,int itf,uint8_t mac[6]){if(self!=&cyw43_state||itf!=CYW43_ITF_STA||!mac)return -22;unsigned a=NREG(52),b=NREG(56);for(unsigned i=0;i<4;i++)mac[i]=a>>(i*8);mac[4]=b;mac[5]=b>>8;return 0;}
int cyw43_wifi_leave(cyw43_t*self,int itf){if(self!=&cyw43_state||itf!=CYW43_ITF_STA)return -22;NREG(0)=10;return 0;}
`;
