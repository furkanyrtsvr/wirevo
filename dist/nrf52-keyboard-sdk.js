// Wirevo-specific API, not SoftDevice/nRF Connect SDK/TinyUSB compatibility.
export const NRF52_KEYBOARD_HEADER=`#pragma once
#include <stdint.h>
#define CF_HID_LEFT_CTRL 1u
#define CF_HID_LEFT_SHIFT 2u
#define CF_HID_LEFT_ALT 4u
#define CF_HID_LEFT_GUI 8u
#define CF_HID_KEY_A 4u
#define CF_HID_KEY_B 5u
#define CF_HID_KEY_ENTER 40u
#define CF_HID_KEY_SPACE 44u
#define CF_HID_KEY_CAPS_LOCK 57u
static inline volatile uint32_t *cf_kbd_regs(void){return (volatile uint32_t*)0x5fffd000;}
static inline int cf_kbd_command(unsigned command,const void*data,unsigned length){volatile uint32_t*r=cf_kbd_regs();while(r[1]&0x80000000u){}r[2]=(uint32_t)data;r[6]=length;r[8]=command;while(r[1]&0x80000000u){}return (int)r[3];}
static inline int cf_usb_keyboard_begin(void){return cf_kbd_command(1,0,0);}
static inline int cf_ble_keyboard_begin(const char*name){if(!name)return -3;uint8_t copy[32];unsigned n=0;while(n<32&&name[n]){copy[n]=(uint8_t)name[n];n++;}if(!n||name[n])return -3;return cf_kbd_command(2,copy,n);}
static inline int cf_usb_keyboard_ready(void){return !!(cf_kbd_regs()[1]&1);}
static inline int cf_ble_keyboard_ready(void){return !!(cf_kbd_regs()[1]&2);}
static inline unsigned cf_usb_keyboard_leds(void){return cf_kbd_regs()[4];}
static inline unsigned cf_ble_keyboard_leds(void){return cf_kbd_regs()[5];}
static inline int cf_keyboard_report(unsigned ble,unsigned modifier,const uint8_t keys[6]){uint8_t report[8]={(uint8_t)modifier,0,0,0,0,0,0,0};for(unsigned i=0;i<6;i++)report[i+2]=keys?keys[i]:0;return cf_kbd_command(ble?4:3,report,8);}
static inline int cf_usb_keyboard_report(unsigned modifier,const uint8_t keys[6]){return cf_keyboard_report(0,modifier,keys);}
static inline int cf_ble_keyboard_report(unsigned modifier,const uint8_t keys[6]){return cf_keyboard_report(1,modifier,keys);}
static inline int cf_usb_keyboard_release(void){return cf_keyboard_report(0,0,0);}
static inline int cf_ble_keyboard_release(void){return cf_keyboard_report(1,0,0);}
static inline void cf_usb_keyboard_end(void){cf_kbd_command(5,0,0);}
static inline void cf_ble_keyboard_end(void){cf_kbd_command(6,0,0);}
`;
