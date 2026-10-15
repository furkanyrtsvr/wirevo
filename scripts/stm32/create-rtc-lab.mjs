import {readFile,writeFile} from 'node:fs/promises';
import {blankPinConfig,configuredProject} from '../../dist/stm32-pin-config.js';
const raw=JSON.parse(await readFile('docs/examples/stm32-acceptance-053.json','utf8')),cfg=blankPinConfig();cfg.rtcSource=1;
const p=configuredProject(raw,cfg,'nucleo-f401re');p.name='STM32 · RTC / backup / ADC DMA / EXTI';
p.code=p.code.replace('#include <stdio.h>','#include <stdio.h>\n#define R(a) (*(volatile unsigned*)(a))');
p.code=p.code.replace('cf_uart_begin(115200);unsigned flags=',String.raw`cf_uart_begin(115200);
 unsigned boots=0;cf_backup_read(0,&boots);
 if(!boots){const unsigned initial[7]={2024,2,28,3,23,59,58};cf_rtc_set_calendar(initial);}
 cf_backup_write(0,boots+1);printf("BACKUP BOOTS=%u\n",boots+1);
 unsigned flags=`);
p.code=p.code.replace('puts("A=ADC samples, B=button count, R=watchdog reset. Press board B1 to toggle LED.");','puts("A=ADC, B=button, R=watchdog, T=RTC, F=RTC test at 1024 Hz. B1 toggles LED.");');
p.code=p.code.replace("if(c=='R'){",String.raw`if(c=='T'){unsigned t[7],bank=0;cf_rtc_calendar(t);cf_backup_read(0,&bank);printf("RTC %u-%u-%u %u:%u:%u BACKUP=%u\n",t[0],t[1],t[2],t[4],t[5],t[6],bank);}
  if(c=='F'){
   R(0x40002824)=0xca;R(0x40002824)=0x53;R(0x4000280c)|=128;
   while(!(R(0x4000280c)&64)){}
   R(0x40002810)=31;R(0x40002810)=31;R(0x4000280c)&=~128u;
   R(0x40002824)=0xff;puts("RTC TEST: 1024 calendar ticks / simulated second");
  }
  if(c=='R'){`);
await writeFile('docs/examples/stm32-rtc-acceptance-054.json',JSON.stringify(p,null,2),'utf8');
await writeFile('../CircuitForge-0.54-STM32-Lab.json',JSON.stringify(p,null,2),'utf8');
