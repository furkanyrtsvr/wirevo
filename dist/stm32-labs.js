import {emptyProject} from './templates.js';
import {STM32_BOARDS} from './stm32-boards.js';
import {configuredProject,blankPinConfig} from './stm32-pin-config.js';
import {spaceNativeParts,compactExampleSupplies,routeProjectWires} from './wire-router.js';
export const STM_FEATURED_EXAMPLES=[{id:'environment',name:'Çevre istasyonu · SHT31 / ADC / OLED',detail:'Sıcaklık + nem + eşik + alarm + buton · SPI1 ADC + I²C1 SHT31/OLED/EEPROM · alarm kaydı · çok dosyalı C17'},{id:'controller',name:'Bluetooth kontrol · ADC / buton / LED',detail:'Sanal PC komutları · L1 / L0 / A · USART1 / kesmeli RX / SPI1 ADC'}];
export function createSTMLab({name,board='stm32f103c8',starter='environment'}={}){const b=STM32_BOARDS[board],env=starter==='environment';if(!b||!STM_FEATURED_EXAMPLES.some(e=>e.id===starter))throw Error('STM32 laboratuvarı geçersiz.');let p=emptyProject();p.language='c';p.name=name||STM_FEATURED_EXAMPLES.find(e=>e.id===starter).name;p.components=[];p.wires=[];p.settings.probe='PA0';p.settings.tracePins=['PA1','PB6','PB7'];const part=(id,type,x,y,params={})=>p.components.push({id,type,x,y,rotation:0,params});part('mcu','board',160,80,{model:board});const right=160+b.width*1.35+210;part('adc1','mcp3008',right+40,env?330:260);part('pot1','pot',right+270,env?355:285,{value:50,ohms:10000});part('r1','resistor',right+20,env?590:440,{ohms:220});part('led1','led',right+200,env?565:415,{color:'red'});part('btn1','button',right+330,env?565:415,{pressed:false});
 const physical=net=>{const pin=b.pins.find(p=>p.connectable!==false&&(p.net||p.id)===net);if(!pin)throw Error('Kartta pin bulunamadı: '+net);return 'mcu:'+pin.id;},ep=s=>s.startsWith('mcu:')?physical(s.slice(4)):s,wire=(a,c)=>p.wires.push({id:'labw'+p.wires.length,from:ep(a),to:ep(c),color:a.includes('GND')||c.includes('GND')?'#64748b':a.includes('3V3')||c.includes('VDD')||c.includes('VIN')||c.includes('VCC')?'#ef4444':'#14b8a6',points:[]});
 for(const pin of ['VDD','VREF'])wire('mcu:3V3','adc1:'+pin);for(const pin of ['AGND','DGND'])wire('mcu:GND','adc1:'+pin);for(const[a,c]of [['PA5','CLK'],['PA6','DOUT'],['PA7','DIN'],['PA4','CS']])wire('mcu:'+a,'adc1:'+c);wire('pot1:OUT','adc1:CH0');if(env)wire('pot1:OUT','mcu:PB0');wire('mcu:3V3','pot1:VCC');wire('mcu:GND','pot1:GND');wire('mcu:PA0','r1:1');wire('r1:2','led1:A');wire('led1:K','mcu:GND');wire('mcu:PA1','btn1:1');wire('btn1:2','mcu:GND');
 const config=blankPinConfig(),assign=(pin,fn,label='',initial=0)=>config.pins[pin]={function:fn,label,initial};assign('PA0','output','ALARM');assign('PA1','pullup','BUTTON');assign('PA4','output','CS',1);assign('PA5','hw_SPI1_SCK');assign('PA6','hw_SPI1_MISO');assign('PA7','hw_SPI1_MOSI');
 if(env){config.hwI2c1Hz=400000;part('mem1','eeprom',right+450,100);part('sda-pu','resistor',right+460,250,{ohms:4700});part('scl-pu','resistor',right+560,250,{ohms:4700});wire('mcu:3V3','mem1:VCC');for(const pin of ['GND','A0','A1','A2','WP'])wire('mcu:GND','mem1:'+pin);wire('mcu:PB7','mem1:SDA');wire('mcu:PB6','mem1:SCL');for(const [pin,id]of [['PB7','sda-pu'],['PB6','scl-pu']]){wire('mcu:'+pin,id+':1');wire('mcu:3V3',id+':2');}assign('PB0','hw_ADC1_IN8','KNOB');config.pins.PA0={function:'hw_TIM2_CH1',label:'ALARM',initial:0,pwmHz:1000,pwmDuty:0};part('sht1','sht31',right,80,{temperature:25,humidity:50});part('oled1','oled',right+250,80,{address:60});for(const[id,power]of [['sht1','VIN'],['oled1','VCC']]){wire('mcu:3V3',id+':'+power);wire('mcu:GND',id+':GND');wire('mcu:PB7',id+':SDA');wire('mcu:PB6',id+':SCL');}wire('sht1:ADDR','mcu:GND');assign('PB7','hw_I2C1_SDA','SDA');assign('PB6','hw_I2C1_SCL','SCL');p.code=ENV_MAIN;p.files=[{name:'station.h',content:STATION_H},{name:'station.c',content:STATION_C}];}
 else{part('bt1','bluetooth',right+50,80,{name:'STM32-CONTROL',baud:9600});for(const[a,c]of [['3V3','VCC'],['GND','GND'],['PA9','RX'],['PA10','TX'],['PB5','STATE']])wire('mcu:'+a,'bt1:'+c);assign('PA9','hw_USART1_TX','BT_TX');assign('PA10','hw_USART1_RX','BT_RX');assign('PB5','input','BT_STATE');p.settings.tracePins=['PA9','PA10','PB5'];p.code=CTRL_MAIN;p.files=[{name:'bt_console.h',content:BT_H},{name:'bt_console.c',content:BT_C}];}
 p=configuredProject(p,config,board);spaceNativeParts(p,{route:false});compactExampleSupplies(p);return routeProjectWires(p,{recolor:true});}
const STATION_H=String.raw`#pragma once
int station_sht31(int *temperature_x100,unsigned *humidity_x100);
int station_adc(void);
int station_display(unsigned adc,int alarm);
int station_load_record(int *temperature,unsigned *humidity,int *alarm);
int station_save_record(int temperature,unsigned humidity,int alarm);
`;
const STATION_C=String.raw`#include "station.h"
#include "cf_board_config.h"
#include <stdint.h>
static uint8_t crc8(const uint8_t *p){uint8_t c=255;for(int i=0;i<2;i++){c^=p[i];for(int b=0;b<8;b++)c=(c&128)?(c<<1)^0x31:c<<1;}return c;}
int station_sht31(int *t,unsigned *h){uint8_t cmd[]={0x24,0},data[6];if(cf_i2c1_write_dma(0x44,cmd,2)!=2)return -1;cf_delay_ms(20);if(cf_i2c1_read_dma(0x44,data,6)!=6)return -1;if(crc8(data)!=data[2]||crc8(data+3)!=data[5])return -2;unsigned raw=((unsigned)data[0]<<8)|data[1];*t=(int)(raw*17500u/65535u)-4500;raw=((unsigned)data[3]<<8)|data[4];*h=raw*10000u/65535u;return 0;}
/* 24LC256 record fits one 64-byte page. No write on every sample. */
static unsigned char record_check(const unsigned char *p){unsigned char sum=0;for(int i=0;i<7;i++)sum^=p[i];return sum;}
int station_load_record(int *t,unsigned *h,int *alarm){unsigned char addr[]={0,0},d[8];if(cf_i2c1_write_read(0x50,addr,2,d,8)!=8)return -1;if(d[0]!='C'||d[1]!='F'||record_check(d)!=d[7])return -2;*t=(int)(int16_t)(((unsigned)d[2]<<8)|d[3]);*h=((unsigned)d[4]<<8)|d[5];*alarm=d[6];return 0;}
int station_save_record(int t,unsigned h,int alarm){unsigned char d[]={0,0,'C','F',(unsigned)t>>8,t,h>>8,h,alarm,0};d[9]=record_check(d+2);if(cf_i2c1_write(0x50,d,sizeof(d))!=(int)sizeof(d))return -1;int ready=0;for(int i=0;i<12;i++){if(cf_i2c1_probe(0x50)==0){ready=1;break;}cf_delay_ms(1);}if(!ready)return -1;int old_t,old_alarm;unsigned old_h;if(station_load_record(&old_t,&old_h,&old_alarm)||old_t!=t||old_h!=h||old_alarm!=alarm)return -2;return 0;}
int station_adc(void){cf_gpio_write(CF_CS,0);int first=cf_spi1_transfer(1),hi=cf_spi1_transfer(128),lo=cf_spi1_transfer(0);cf_gpio_write(CF_CS,1);return first<0||hi<0||lo<0?-1:((hi&3)<<8)|lo;}
int station_display(unsigned adc,int alarm){uint8_t cmd[]={0,0xaf,0x20,0,0x21,48,79,0x22,3,3},pixels[33];if(cf_i2c1_write_dma(0x3c,cmd,sizeof(cmd))<0)return -1;pixels[0]=0x40;for(int i=0;i<32;i++)pixels[i+1]=i<=(int)(adc/32)?(alarm?0xff:0x3c):0;return cf_i2c1_write_dma(0x3c,pixels,sizeof(pixels))<0?-1:0;}
`;
const ENV_MAIN=String.raw`#include "cf_board_config.h"
#include "station.h"
#include <stdio.h>

/* STM32 Pinler generates cf_board_config.c and runs it before main. */
int main(void) {
    puts("ENV STATION READY");
    int saved_t, saved_alarm, last_alarm = -1, memory = 0;
    unsigned saved_h;
    int loaded = station_load_record(&saved_t, &saved_h, &saved_alarm);
    if (loaded == 0) printf("EEPROM LAST T=%d H=%u ALARM=%d\r\n", saved_t, saved_h, saved_alarm);
    else puts(loaded == -2 ? "EEPROM EMPTY" : "EEPROM ERROR");
    for (;;) {
        int temperature = 0;
        unsigned humidity = 0;
        int adc = station_adc();
        unsigned native = cf_adc_read(CF_KNOB);
        int valid = station_sht31(&temperature, &humidity);
        int pressed = !cf_gpio_read(CF_BUTTON);
        /* Potentiometer sets a 20..40 degree C alarm threshold. */
        unsigned limit = 2000 + native * 2000u / 4095u;
        int alarm = pressed || (valid == 0 && temperature > (int)limit);
        cf_pwm_duty(CF_ALARM, alarm ? 100 : 0);
        int display = adc < 0 ? -1 : station_display((unsigned)adc, alarm);
        if (adc < 0) { puts("ENV SPI ERROR"); cf_delay_ms(30); continue; }
        if (valid)
            printf("ENV SENSOR ERROR=%d ADC=%u ALARM=%d", valid, adc, alarm);
        else
            printf("ENV T=%d H=%u ADC=%u NATIVE=%u LIMIT=%u ALARM=%d OLED=%d",
                   temperature, humidity, adc, native, limit, alarm, display);
        /* Save only at startup or an alarm transition; verify after ACK polling. */
        if (!valid && alarm != last_alarm) {
            memory = station_save_record(temperature, humidity, alarm);
            if (memory == 0) last_alarm = alarm;
        }
        printf(" MEM=%d", memory);
        cf_uart_write(13);
        cf_uart_write(10);
        cf_delay_ms(30);
    }
}
`;
const BT_H=String.raw`#pragma once
void bt_start(void);
void bt_put(unsigned char value);
int bt_get(void);
void bt_text(const char *text);
void bt_number(unsigned value);
void bt_line(void);
`;
const BT_C=String.raw`#include "bt_console.h"
#include "cf_board_config.h"

/* USART1 interrupt fills a bounded 128-byte receive ring. */
static volatile unsigned head, tail;
static unsigned char ring[128];
void USART1_IRQHandler(void) {
    int value = cf_usart1_read();
    if (value < 0) return;
    unsigned next = (head + 1) & 127u;
    if (next != tail) { ring[head] = (unsigned char)value; head = next; }
}
void bt_start(void) {
#ifdef CF_STM32_F4
    *(volatile unsigned *)0x4001100c |= 32u;
#else
    *(volatile unsigned *)0x4001380c |= 32u;
#endif
    *(volatile unsigned *)0xe000e104 = 1u << 5;
}
void bt_put(unsigned char value) { cf_usart1_write(value); }
int bt_get(void) {
    if (head == tail) return -1;
    int value = ring[tail];
    tail = (tail + 1) & 127u;
    return value;
}
void bt_text(const char *text) { while (*text) bt_put(*text++); }
void bt_number(unsigned value) {
    char digits[10]; int n = 0;
    do { digits[n++] = (char)('0' + value % 10); value /= 10; } while (value);
    while (n) bt_put(digits[--n]);
}
void bt_line(void) { bt_put(13); bt_put(10); }
`;
const CTRL_MAIN=String.raw`#include "cf_board_config.h"
#include "bt_console.h"
#include <stdio.h>

static int adc_read(void) {
    cf_gpio_write(CF_CS, 0);
    int first = cf_spi1_transfer(1);
    int high = cf_spi1_transfer(128);
    int low = cf_spi1_transfer(0);
    cf_gpio_write(CF_CS, 1);
    return first < 0 || high < 0 || low < 0 ? -1 : ((high & 3) << 8) | low;
}

/* Stop-and-wait: send L1, L0 or A + LF; wait for a reply before sending more. */
int main(void) {
    bt_start();
    puts("CONTROL STATION READY");
    char line[64];
    int n = 0, linked = 0, requested = 0;
    for (;;) {
        int state = cf_gpio_read(CF_BT_STATE);
        cf_gpio_write(CF_ALARM, requested || !cf_gpio_read(CF_BUTTON));
        if (state && !linked) {
            bt_text("CONTROL READY: L1 L0 A");
            bt_line();
        }
        if (!state) n = 0;
        linked = state;
        if (!state) continue;
        int c = bt_get();
        if (c < 0) continue;
        if (c == 10) {
            line[n] = 0;
            if (n >= 2 && line[0] == 'L' && (line[1] == '0' || line[1] == '1')) {
                requested = line[1] == '1';
                bt_text("LED=");
                bt_number(requested);
                bt_line();
            } else if (n == 1 && line[0] == 'A') {
                int adc = adc_read();
                if (adc < 0) bt_text("SPI ERROR");
                else { bt_text("ADC="); bt_number((unsigned)adc); }
                bt_line();
            } else {
                bt_text("COMMAND: L1 L0 A");
                bt_line();
            }
            n = 0;
        } else if (c != 13 && n < 63) {
            line[n++] = (char)c;
        }
    }
}
`;
