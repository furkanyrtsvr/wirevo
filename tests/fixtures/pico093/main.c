#include <pico/stdlib.h>
#include <pico/multicore.h>
#include <stdio.h>
#include "config.h"
volatile int result=0;
void second(void){result=SDK_VALUE;gpio_put(15,1);while(1)tight_loop_contents();}
int main(void){stdio_init_all();gpio_init(15);gpio_set_dir(15,GPIO_OUT);multicore_launch_core1(second);while(!stdio_usb_connected())sleep_ms(1);while(1){printf("SDK_NATIVE_PASS %d\n",result);sleep_ms(100);}}
