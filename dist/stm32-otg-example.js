export const STM_OTG_DEVICE=String.raw`#include <cf_hal.h>
#include <stdio.h>
/* F401/F411 OTG FS, dedicated FIFO RAM, EP0 control + EP1 vendor bulk echo.
   F401 HCLK=84 MHz / PLLQ=7; F411 HCLK=96 MHz / PLLQ=8: USB=48 MHz. */
#define R(a) (*(volatile unsigned*)(a))
#define U 0x50000000u
#define IN(e,o) R(U+0x900+32*(e)+(o))
#define OUT(e,o) R(U+0xb00+32*(e)+(o))
static const unsigned char device[]={18,1,0,2,0,0,0,64,0xad,0xde,0xef,0xbe,0,1,0,0,0,1};
static const unsigned char config[]={9,2,32,0,1,1,0,0x80,50,9,4,0,0,2,0xff,0,0,0,7,5,1,2,64,0,0,7,5,0x81,2,64,0,0};
static unsigned pending_address,configured;volatile unsigned irq_count;
static unsigned char received[4][64];static unsigned length[4];
static void arm(unsigned ep){OUT(ep,16)=(ep?0:3u<<29)|(1u<<19)|64;OUT(ep,0)|=(1u<<31)|(1u<<26);}
static void send(unsigned ep,const unsigned char *p,unsigned n){IN(ep,16)=(1u<<19)|n;IN(ep,0)|=(1u<<31)|(1u<<26);for(unsigned i=0;i<n;i+=4){unsigned v=0;for(unsigned j=0;j<4&&i+j<n;j++)v|=(unsigned)p[i+j]<<(8*j);R(U+0x1000+0x1000*ep)=v;}}
static void setup(void){unsigned char*q=received[0];unsigned len=q[6]|q[7]<<8;pending_address=0;
 if(q[0]==0x80&&q[1]==6&&!q[2]&&!q[4]&&!q[5]&&(q[3]==1||q[3]==2)){const unsigned char*p=q[3]==1?device:config;unsigned n=q[3]==1?sizeof device:sizeof config;send(0,p,len<n?len:n);}
 else if(q[0]==0&&q[1]==5&&q[2]<128&&!q[3]&&!len){pending_address=q[2]|128;send(0,q,0);}
 else if(q[0]==0&&q[1]==9&&q[2]<=1&&!q[3]&&!len){configured=q[2];IN(1,0)=(2u<<18)|(1u<<22)|64|(1u<<27)|(configured?1u<<15:0);OUT(1,0)=(2u<<18)|64|(1u<<27)|(configured?1u<<15:0);if(configured)arm(1);send(0,q,0);}
 else if(q[0]==0x80&&q[1]==8&&len==1){q[0]=configured;send(0,q,1);}
 else {IN(0,0)|=1u<<21;OUT(0,0)|=1u<<21;arm(0);return;}arm(0);}
void OTG_FS_IRQHandler(void){irq_count++;unsigned g=R(U+20);
 if(g&(1u<<12)){R(U+20)=1u<<12;pending_address=configured=0;R(U+0x800)=3;R(U+0x81c)=0x00030003;R(U+0x810)=3;R(U+0x814)=11;IN(0,0)=1u<<27;OUT(0,0)=1u<<27;arm(0);puts("USB RESET");}
 if(g&(1u<<13))R(U+20)=1u<<13;
 while(R(U+20)&16){unsigned s=R(U+32),ep=s&15,n=(s>>4)&2047,type=(s>>17)&15;if(type==2||type==6){length[ep]=n;for(unsigned i=0;i<n;i+=4){unsigned v=R(U+0x1000);for(unsigned j=0;j<4&&i+j<n;j++)received[ep][i+j]=v>>(8*j);}}}
 for(unsigned ep=0;ep<2;ep++){unsigned o=OUT(ep,8);if(o&8){OUT(ep,8)=8;setup();}if(o&1){OUT(ep,8)=1;if(ep==1&&configured){send(1,received[1],length[1]);printf("USB BULK %u\n",length[1]);}else arm(ep);}unsigned i=IN(ep,8);if(i&1){IN(ep,8)=1;if(!ep&&pending_address){R(U+0x800)=(R(U+0x800)&~0x7f0)|((pending_address&127)<<4);printf("USB ADDRESS %u\n",pending_address&127);pending_address=0;}if(ep==1&&configured)arm(1);}}
}
int main(void){cf_uart_begin(115200);R(0x40023830)|=1;/* PA11/PA12 AF10 USB */
 R(0x40020000)=(R(0x40020000)&~(15u<<22))|(10u<<22);R(0x40020024)=(R(0x40020024)&~(255u<<12))|(170u<<12);
 R(0x40023834)|=128;R(0x40023814)|=128;R(0x40023814)&=~128u;
 R(U+12)=(1u<<30)|64|(6u<<10);R(U+16)=1;while(!(R(U+16)&(1u<<31))){}
 R(U+12)=(1u<<30)|64|(6u<<10);R(U+56)=(1u<<16)|(1u<<21);R(U+36)=128;R(U+40)=(64u<<16)|128;R(U+0x104)=(64u<<16)|192;
 R(U+0x800)=3;R(U+24)=(1u<<12)|(1u<<13)|(1u<<18)|(1u<<19)|16;R(U+8)=1;R(U+0x804)=0;
 R(0xe000e108)=1u<<3;puts("USB DEVICE READY");for(;;)__asm volatile("wfi");}
`;
