export const TINYUSB_KEYBOARD_MAIN=`#include "board_pins.h"
#include <cf_hal.h>
#include <tusb.h>
#include <wirevo_usb_dcd.h>
/* Actual TinyUSB stack; the USB controller/host is virtual inside Wirevo. */
volatile unsigned reports,usb_leds,mounts,unmounts,suspends,resumes,protocol_changes;
void tud_mount_cb(void){mounts++;}
void tud_umount_cb(void){unmounts++;}
void tud_suspend_cb(bool wake){(void)wake;suspends++;}
void tud_resume_cb(void){resumes++;}
void tud_hid_set_protocol_cb(uint8_t instance,uint8_t protocol){(void)instance;(void)protocol;protocol_changes++;}
uint16_t tud_hid_get_report_cb(uint8_t instance,uint8_t id,hid_report_type_t type,uint8_t *buffer,uint16_t n){(void)instance;(void)id;if(type==HID_REPORT_TYPE_INPUT&&n>=8){for(unsigned i=0;i<8;i++)buffer[i]=0;return 8;}return 0;}
void tud_hid_set_report_cb(uint8_t instance,uint8_t id,hid_report_type_t type,uint8_t const*buffer,uint16_t n){(void)instance;(void)id;if(type==HID_REPORT_TYPE_OUTPUT&&n==1)usb_leds=buffer[0];}
int main(void){
 cf_gpio_mode(KEY_A,CF_INPUT_PULLUP);cf_gpio_mode(KEY_B,CF_INPUT_PULLUP);
 cf_gpio_mode(KEY_SHIFT,CF_INPUT_PULLUP);cf_gpio_mode(LED_BUILTIN,CF_OUTPUT);
 tusb_init();unsigned previous=255;
 while(1){
  wirevo_usb_poll();tud_task();
  unsigned ready=tud_hid_ready();
  unsigned state=(!cf_gpio_read(KEY_A))|((!cf_gpio_read(KEY_B))<<1)|((!cf_gpio_read(KEY_SHIFT))<<2);
  if(!tud_mounted()||tud_suspended())previous=255;
  if(ready&&state!=previous){
   uint8_t keys[6]={0};unsigned n=0;if(state&1)keys[n++]=HID_KEY_A;if(state&2)keys[n++]=HID_KEY_B;
   if(tud_hid_keyboard_report(0,(state&4)?KEYBOARD_MODIFIER_LEFTSHIFT:0,keys)){previous=state;reports++;}
  }
  cf_gpio_write(LED_BUILTIN,((usb_leds&2)!=0)^BOARD_LED_ACTIVE_LOW);
 }
}
`;
export const TINYUSB_KEYBOARD_DESCRIPTORS=`#include <tusb.h>
static uint8_t const report[]={TUD_HID_REPORT_DESC_KEYBOARD()};
static tusb_desc_device_t const device={.bLength=sizeof(tusb_desc_device_t),.bDescriptorType=TUSB_DESC_DEVICE,.bcdUSB=0x0200,.bMaxPacketSize0=64,.idVendor=0xcafe,.idProduct=0x4013,.bcdDevice=0x0100,.bNumConfigurations=1};
static uint8_t const config[]={TUD_CONFIG_DESCRIPTOR(1,1,0,TUD_CONFIG_DESC_LEN+TUD_HID_DESC_LEN,0,100),TUD_HID_DESCRIPTOR(0,0,HID_ITF_PROTOCOL_KEYBOARD,sizeof(report),0x81,8,10)};
uint8_t const *tud_descriptor_device_cb(void){return (uint8_t const*)&device;}
uint8_t const *tud_descriptor_configuration_cb(uint8_t index){(void)index;return config;}
uint8_t const *tud_hid_descriptor_report_cb(uint8_t instance){(void)instance;return report;}
uint16_t const *tud_descriptor_string_cb(uint8_t index,uint16_t language){(void)index;(void)language;static const uint16_t s[]={0x0304,0x0409};return s;}
`;
