import {TINYUSB_KEYBOARD_MAIN,TINYUSB_KEYBOARD_DESCRIPTORS} from './nrf52-tinyusb-example.js';
import {emptyProject} from './templates.js';
import {NRF52_BOARDS} from './nrf52-boards.js';
export const NRF52_EXAMPLES=[{id:'tinyusb',name:'nRF52840 · TinyUSB C17 klavye',detail:'Gerçek TinyUSB 0.18.0 · sanal USB denetleyicisi'},{id:'keyboard',name:'nRF52840 · USB / BLE klavye',detail:'C17 · 3 tact · sanal USB HID / BLE HIDS'},{id:'blink',name:'nRF52840 · Kart LED’i / UART',detail:'C17 · gerçek ARM / Nordic GPIO'},{id:'buttons',name:'nRF52840 · Harici tact buton',detail:'3.3 V · pull-up · LED'},{id:'timer',name:'nRF52840 · TIMER0 kesmesi',detail:'NVIC / gerçek IRQ8'},{id:'adc',name:'nRF52840 · SAADC / potansiyometre',detail:'EasyDMA · 12 bit · AIN0'},{id:'laboratory',name:'nRF52840 · Sensör laboratuvarı',detail:'TWIM / LCD + SHT31 + EEPROM · SPIM / MCP3008 · ADC / PWM · UART'}];
export const NRF52_SOURCES={
 tinyusb:TINYUSB_KEYBOARD_MAIN,
 keyboard:`#include <cf_hal.h>
#include <wirevo_keyboard.h>
/* Wirevo virtual USB/BLE receiver; no physical USB or radio connection. */
volatile unsigned reports,errors;
int main(void){
 cf_gpio_mode(KEY_A,CF_INPUT_PULLUP); cf_gpio_mode(KEY_B,CF_INPUT_PULLUP);
 cf_gpio_mode(KEY_SHIFT,CF_INPUT_PULLUP); cf_gpio_mode(LED_BUILTIN,CF_OUTPUT);
 cf_usb_keyboard_begin(); cf_ble_keyboard_begin("Wirevo nRF52840");
 unsigned previous=255,last_ready=255;
 while(1){
  unsigned state=(!cf_gpio_read(KEY_A))|((!cf_gpio_read(KEY_B))<<1)|((!cf_gpio_read(KEY_SHIFT))<<2);
  unsigned ready=cf_usb_keyboard_ready()|(cf_ble_keyboard_ready()<<1);
  if(state!=previous||ready!=last_ready){
   uint8_t keys[6]={0};unsigned n=0;
   if(state&1)keys[n++]=CF_HID_KEY_A;
   if(state&2)keys[n++]=CF_HID_KEY_B;
   unsigned modifier=(state&4)?CF_HID_LEFT_SHIFT:0;
   if(ready&1){if(cf_usb_keyboard_report(modifier,keys))errors++;else reports++;}
   if(ready&2){if(cf_ble_keyboard_report(modifier,keys))errors++;else reports++;}
   previous=state;last_ready=ready;
  }
  unsigned caps=(cf_usb_keyboard_leds()|cf_ble_keyboard_leds())&2;
  cf_gpio_write(LED_BUILTIN,(caps!=0)^BOARD_LED_ACTIVE_LOW);
  cf_delay_us(100);
 }
}
`,
 blink:`#include <cf_hal.h>
int main(void) {
    cf_gpio_mode(LED_BUILTIN, CF_OUTPUT);
    cf_uart_begin(115200);
    const char *text = "nRF52840 / C17 OK\\r\\n";
    for(unsigned i=0;text[i];i++) cf_uart_write(text[i]);
    while(1) {
        cf_gpio_write(LED_BUILTIN, !BOARD_LED_ACTIVE_LOW);
        cf_delay_ms(100);
        cf_gpio_write(LED_BUILTIN, BOARD_LED_ACTIVE_LOW);
        cf_delay_ms(100);
    }
}
`,
 buttons:`#include <cf_hal.h>
int main(void) {
    cf_gpio_mode(BOARD_BUTTON, CF_INPUT_PULLUP);
    cf_gpio_mode(LED_BUILTIN, CF_OUTPUT);
    while(1) {
        unsigned pressed = !cf_gpio_read(BOARD_BUTTON);
        cf_gpio_write(LED_BUILTIN, pressed ^ BOARD_LED_ACTIVE_LOW);
    }
}
`,
 timer:`#include <cf_hal.h>
volatile unsigned ticks;
void TIMER0_IRQHandler(void) {
    NRF_TIMER0->EVENTS_COMPARE[0]=0;
    ticks++;
    nrf_gpio_pin_toggle(LED_BUILTIN);
}
int main(void) {
    nrf_gpio_cfg_output(LED_BUILTIN);
    NRF_TIMER0->MODE=0; NRF_TIMER0->BITMODE=3;
    NRF_TIMER0->PRESCALER=4; NRF_TIMER0->CC[0]=100000;
    NRF_TIMER0->SHORTS=1; NRF_TIMER0->INTENSET=1u<<16;
    NVIC_EnableIRQ(TIMER0_IRQn); __enable_irq();
    NRF_TIMER0->TASKS_START=1;
    while(1) { __WFI(); }
}
`,
 adc:`#include <cf_hal.h>
volatile unsigned analog_value;
int main(void) {
    cf_gpio_mode(LED_BUILTIN, CF_OUTPUT);
    while(1) {
        analog_value=cf_adc_read(0);
        cf_gpio_write(LED_BUILTIN, (analog_value>1800)^BOARD_LED_ACTIVE_LOW);
        cf_delay_ms(20);
    }
}
`,
 laboratory:`#include <cf_hal.h>
#include <cf_lcd.h>
volatile unsigned done, failures, adc_value, spi_value, temperature_raw, humidity_raw;
unsigned char sensor[6], saved[2], spi_rx[3];
int main(void) {
    cf_uart_begin(115200);
    cf_gpio_mode(LED_BUILTIN,CF_OUTPUT);
    unsigned char command[]={0x24,0x00};
    if(cf_twim_transfer(0x44,command,2,0,0)) failures++;
    cf_delay_ms(16);
    if(cf_twim_transfer(0x44,0,0,sensor,6)) failures++;
    temperature_raw=(sensor[0]<<8)|sensor[1];
    humidity_raw=(sensor[3]<<8)|sensor[4];
    unsigned char write_data[]={0x00,0x20,0x4e,0x52};
    if(cf_twim_transfer(0x50,write_data,4,0,0)) failures++;
    cf_delay_ms(6);
    unsigned char address[]={0x00,0x20};
    if(cf_twim_transfer(0x50,address,2,saved,2)) failures++;
    if(saved[0]!=0x4e||saved[1]!=0x52) failures++;
    cf_gpio_mode(BOARD_CS,CF_OUTPUT); cf_gpio_write(BOARD_CS,0);
    unsigned char request[]={1,0x80,0};
    cf_spim_transfer(request,3,spi_rx,3);
    cf_gpio_write(BOARD_CS,1);
    spi_value=((spi_rx[1]&3)<<8)|spi_rx[2];
    adc_value=cf_adc_read(0);
    cf_lcd_init(); cf_lcd_print("NRF52840");
    cf_lcd_cursor(0,1); cf_lcd_print("C17 OK");
    cf_pwm_start(LED_BUILTIN,1000,500);
    const char *text=failures?"LAB FAIL\\r\\n":"LAB OK\\r\\n";
    for(unsigned i=0;text[i];i++)cf_uart_write(text[i]);
    done=1;
    while(1) { __WFI(); }
}
`};
export function createNRF52Project({board='nrf52840-supermini',language='c',name='nRF52840 C17',starter='blink'}={}){
 if(!NRF52_BOARDS[board]||language!=='c'||!['empty',...NRF52_EXAMPLES.map(e=>e.id)].includes(starter))throw Error('nRF52840 kartı / C17 örneği geçersiz.');
 const def=NRF52_BOARDS[board],p=emptyProject(),id=n=>`P${n>>>5}.${String(n&31).padStart(2,'0')}`;p.name=name;p.language='c';p.code=NRF52_SOURCES[starter]||'#include <cf_hal.h>\nint main(void){while(1){}}\n';p.components=[{id:'mcu',type:'board',x:100,y:95,rotation:0,params:{model:board}}];p.wires=[];p.settings.probe=def.ledPin;p.settings.tracePins=[id(def.sdaPin),id(def.sclPin),id(def.txPin)];
 const wire=(a,b)=>p.wires.push({id:'nrf-w'+p.wires.length,from:a,to:b,color:a.includes('GND')?'#64748b':a.includes('3V3')?'#ef4444':'#14b8a6',points:[]});const part=(id,type,x,y,params={})=>p.components.push({id,type,x,y,rotation:0,params});
 const xiao=board.startsWith('xiao'),button=xiao?3:22,cs=xiao?28:24;
 p.files=[{name:'board_pins.h',content:`#pragma once\n#define BOARD_BUTTON ${button}\n#define BOARD_CS ${cs}\n`}];p.code='#include "board_pins.h"\n'+p.code;
 if(starter==='keyboard'||starter==='tinyusb'){const keys=xiao?[3,28,29]:[22,24,11];p.files[0].content+=keys.map((n,i)=>'#define '+['KEY_A','KEY_B','KEY_SHIFT'][i]+' '+n+'u\n').join('');for(let i=0;i<3;i++){const key=['keyA','keyB','keyShift'][i];part(key,'tact6',420,100+i*120,{pressed:false});wire('mcu:'+id(keys[i]),key+':1');wire('mcu:GND',key+':2');}}
 if(starter==='tinyusb')p.files.push({name:'usb_descriptors.c',content:TINYUSB_KEYBOARD_DESCRIPTORS});
 if(starter==='buttons'){part('button','tact6',400,150,{pressed:false});wire('mcu:'+id(button),'button:1');wire('mcu:GND','button:2');}
 if(['adc','laboratory'].includes(starter)){part('pot','pot',420,370,{value:50,ohms:10000});for(const[a,b]of[['3V3','VCC'],['GND','GND'],['P0.02','OUT']])wire('mcu:'+a,'pot:'+b);}
 if(starter==='laboratory'){
  part('display','lcd16',920,100,{address:39});part('sht','sht31',420,95,{temperature:24,humidity:55});part('mem','eeprom',650,95,{});part('spi','mcp3008',650,320,{});
  for(const dev of ['sht','mem','display']){for(const[a,b]of[['3V3',dev==='sht'?'VIN':'VCC'],['GND','GND'],[id(def.sdaPin),'SDA'],[id(def.sclPin),'SCL']])wire('mcu:'+a,dev+':'+b);}
  wire('mcu:GND','sht:ADDR');for(const pin of ['A0','A1','A2','WP'])wire('mcu:GND','mem:'+pin);
  for(const[a,b]of[['3V3','VDD'],['3V3','VREF'],['GND','AGND'],['GND','DGND'],[id(def.sckPin),'CLK'],[id(def.mosiPin),'DIN'],[id(def.misoPin),'DOUT'],[id(cs),'CS'],['P0.02','CH0']])wire('mcu:'+a,'spi:'+b);
  for(const n of [def.sdaPin,def.sclPin]){const r='pull'+n;part(r,'resistor',330,110+(n===def.sdaPin?0:75),{ohms:4700});wire('mcu:3V3',r+':1');wire(r+':2','mcu:'+id(n));}
 }
 return p;
}
