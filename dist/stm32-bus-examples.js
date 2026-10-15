export const STM_CAN_LOOPBACK=String.raw`#include <cf_hal.h>
#include <stdio.h>
/* F103 bxCAN internal loopback, 500 kbit/s at APB1 36 MHz.
   No external CAN transceiver/bus is represented by this example. */
#define R(a) (*(volatile unsigned*)(a))
#define CAN 0x40006400u
volatile unsigned received,transmitted;
void USB_HP_CAN1_TX_IRQHandler(void){unsigned t=R(CAN+8);for(unsigned i=0;i<3;i++)if(t&(1u<<(8*i))){if(t&(2u<<(8*i)))transmitted++;R(CAN+8)=1u<<(8*i);}}
void USB_LP_CAN1_RX0_IRQHandler(void){while(R(CAN+12)&3){unsigned id=R(CAN+0x1b0),dlc=R(CAN+0x1b4)&15,data=R(CAN+0x1b8);printf("CAN RX id=%X dlc=%u data=%X\n",id>>21,dlc,data);received++;R(CAN+12)=32;}}
int main(void){cf_uart_begin(115200);R(0x4002101c)|=1u<<25;
 R(CAN)=1;while(!(R(CAN+4)&1)){}R(CAN+28)=0x40000000u|(12u<<16)|(1u<<20)|3u;
 R(CAN+0x200)=1;R(CAN+0x20c)=1;R(CAN+0x240)=0x321u<<21;R(CAN+0x244)=0xffe00006u;R(CAN+0x21c)=1;R(CAN+0x200)=0;
 R(CAN+20)=3;R(0xe000e100)=(1u<<19)|(1u<<20);R(CAN)=0;while(R(CAN+4)&1){}
 puts("CAN LOOPBACK READY");for(unsigned n=0;n<3;n++){unsigned a=CAN+0x180+16*n;R(a+4)=4;R(a+8)=0x12345670u+n;R(a+12)=0;R(a)=(0x321u<<21)|1u;}
 while(received<3||transmitted<3)__asm volatile("wfi");printf("CAN OK RX=%u TX=%u\n",received,transmitted);for(;;)__asm volatile("wfi");}
`;
export const STM_USB_DEVICE=String.raw`#include <cf_hal.h>
#include <stdio.h>
/* F103 USB FS vendor device, endpoint0 control + endpoint1 bulk echo.
   Use CircuitForge's virtual USB host. No connection to the PC USB stack. */
#define R(a) (*(volatile unsigned*)(a))
#define U 0x40005c00u
static const unsigned char device[]={18,1,0,2,0,0,0,64,0xad,0xde,0xef,0xbe,0,1,0,0,0,1};
static const unsigned char config[]={9,2,32,0,1,1,0,0x80,50,9,4,0,0,2,0xff,0,0,0,7,5,1,2,64,0,0,7,5,0x81,2,64,0,0};
static unsigned pending_address,configured;volatile unsigned irq_count;
static unsigned short pm_read(unsigned a){return *(volatile unsigned short*)(0x40006000u+2*a);}
static void pm_write(unsigned a,unsigned v){*(volatile unsigned short*)(0x40006000u+2*a)=v;}
static void status(unsigned ep,unsigned mask,unsigned v){unsigned e=R(U+ep*4);R(U+ep*4)=(e&0x70f)|0x8080|((e^v)&mask);}
static void clear_rx(unsigned ep){R(U+ep*4)=(R(U+ep*4)&0x70f)|0x80;}
static void clear_tx(unsigned ep){R(U+ep*4)=(R(U+ep*4)&0x70f)|0x8000;}
static void send(unsigned ep,const unsigned char *p,unsigned n){unsigned at=ep?0x140:0x80;for(unsigned i=0;i<n;i+=2)pm_write(at+i,p[i]|(i+1<n?(unsigned)p[i+1]<<8:0));pm_write(ep*8+2,n);status(ep,0x30,0x30);}
static void arm(unsigned ep){pm_write(ep*8+6,0x8400);status(ep,0x3000,0x3000);}
static void setup(void){unsigned char q[8];for(unsigned i=0;i<8;i+=2){unsigned v=pm_read(0x40+i);q[i]=v;q[i+1]=v>>8;}clear_rx(0);unsigned len=q[6]|q[7]<<8;pending_address=0;
 if(q[0]==0x80&&q[1]==6&&!q[2]&&!q[4]&&!q[5]&&(q[3]==1||q[3]==2)){const unsigned char*p=q[3]==1?device:config;unsigned n=q[3]==1?sizeof device:sizeof config;send(0,p,len<n?len:n);}
 else if(q[0]==0&&q[1]==5&&q[2]<128&&!q[3]&&!len){pending_address=q[2]|128;send(0,q,0);}
 else if(q[0]==0&&q[1]==9&&q[2]<=1&&!q[3]&&!len){configured=q[2];if(configured){R(U+4)=1;pm_write(8,0x140);pm_write(12,0x100);arm(1);status(1,0x30,0x20);}else R(U+4)=1;send(0,q,0);}
 else if(q[0]==0x80&&q[1]==8&&len==1){q[0]=configured;send(0,q,1);}
 else {status(0,0x3030,0x1010);return;}arm(0);}
void USB_LP_CAN1_RX0_IRQHandler(void){irq_count++;if(R(U+0x44)&0x400){R(U+0x44)=~0x400u;pending_address=configured=0;R(U+0x50)=0;R(U)=0x200;pm_write(0,0x80);pm_write(4,0x40);arm(0);status(0,0x30,0x20);R(U+0x4c)=128;puts("USB RESET");}
 while(R(U+0x44)&0x8000){unsigned ep=R(U+0x44)&15,e=R(U+ep*4);if(e&0x8000){if(ep==0&&(e&0x800))setup();else {unsigned n=pm_read(ep*8+6)&1023;unsigned char data[64];for(unsigned i=0;i<n;i+=2){unsigned v=pm_read((ep?0x100:0x40)+i);data[i]=v;if(i+1<n)data[i+1]=v>>8;}clear_rx(ep);if(ep==1&&configured){send(1,data,n);printf("USB BULK %u\n",n);}else arm(ep);}}
 else if(e&0x80){clear_tx(ep);if(!ep&&pending_address){R(U+0x4c)=pending_address;printf("USB ADDRESS %u\n",pending_address&127);pending_address=0;}if(ep==1)arm(1);}}
}
int main(void){cf_uart_begin(115200);R(0x4002101c)|=1u<<23;R(0x40021010)|=1u<<23;R(0x40021010)&=~(1u<<23);R(U+0x40)=0;cf_delay_us(2);R(U+0x40)=0x8400;R(0xe000e100)=1u<<20;puts("USB DEVICE READY");for(;;)__asm volatile("wfi");}
`;
