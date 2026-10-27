// Wirevo CYW43439 gSPI register/RAM laboratory. No chip firmware or ROM is run.
// Select Pico W / WH / Pico 2 W / Pico 2 W with headers.
// No external wiring: GPIO23 power, GPIO25 CS, GPIO29 CLK, GPIO24 data/IRQ.
// After running, watch before/after=0xFEEDBEAD, stored=0x12345678, chipid=43439, done=1.
#include <pico/stdlib.h>
#include <pico/cyw43_arch.h>
#include <wirevo/net.h>
volatile unsigned before,after,stored,chipid,clockcsr,led_on,legacy_led,smps,vbus,led_off,link_off,done;
unsigned char out[16],in[16];
void send(int write,int fn,unsigned addr,unsigned value,int swapped,int delay){
 unsigned cmd=(write?0x80000000u:0)|0x40000000u|((unsigned)fn<<28)|(addr<<11)|4;
 for(int i=0;i<4;i++){out[i]=(cmd>>(8*i));out[i+4]=(value>>(8*i));}if(swapped)for(int i=0;i<8;i+=2){unsigned char t=out[i];out[i]=out[i+1];out[i+1]=t;}
 gpio_put(25,0);gpio_set_dir(24,1);
 for(int i=0;i<8+delay;i++){
  if(i==4&&!write)gpio_set_dir(24,0);
  unsigned char b=i<4?out[i]:write?out[i]:0;in[i]=0;
  for(int bit=7;bit>=0;bit--){if(write||i<4)gpio_put(24,(b>>bit)&1);gpio_put(29,1);in[i]=(in[i]<<1)|gpio_get(24);gpio_put(29,0);}
 }gpio_put(25,1);
}
unsigned result(int offset,int swapped){unsigned v=0;for(int i=0;i<4;i++)v|=(unsigned)in[offset+(swapped?(i^1):i)]<<(8*i);return v;}
int main(void){gpio_init(25);gpio_put(25,1);gpio_set_dir(25,1);gpio_init(29);gpio_set_dir(29,1);gpio_init(24);gpio_init(23);gpio_put(23,1);gpio_set_dir(23,1);
 send(0,0,20,0,1,0);before=result(4,1);send(1,0,0,0x00000403,1,0);send(0,0,20,0,0,0);after=result(4,0);
 send(1,1,0x8000,0x12345678,0,0);send(0,1,0x8000,0,0,4);stored=result(8,0);
 send(1,1,0x1000a,0x00180000,0,0);send(0,1,0x8000,0,0,4);chipid=result(8,0);
 send(1,1,0x1000e,0x18,0,0);send(0,1,0x1000e,0,0,4);clockcsr=result(8,0)&255;
 cyw43_arch_init();cyw43_arch_gpio_put(0,1);led_on=cyw43_arch_gpio_get(0);cyw43_arch_gpio_put(CYW43_WL_GPIO_SMPS_PIN,1);smps=cyw43_arch_gpio_get(1);vbus=cyw43_arch_gpio_get(CYW43_WL_GPIO_VBUS_PIN);gpio_put(23,0);led_off=cyw43_arch_gpio_get(0);link_off=wirevo_net_link_status();// Earlier saved Wirevo firmware used these private service registers.
 volatile unsigned *legacy=(volatile unsigned *)0x5fffe100u;
 legacy[0]=1;legacy[5]=1;legacy_led=legacy[5];legacy[0]=0;
 done=1;while(1){}
}