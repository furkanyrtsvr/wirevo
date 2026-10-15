import {writeFile,mkdir} from 'node:fs/promises';
import {createSTMProject} from '../../dist/stm32-project.js';
import {STM32_BOARDS} from '../../dist/stm32-boards.js';
import {labelWire} from '../../dist/net-label-tools.js';
import {outerBoardPads} from '../../dist/wire-router.js';
import {pinPoint} from '../../dist/geometry.js';
const p=createSTMProject({board:'nucleo-f401re',starter:'empty',name:'STM32 · ADC DMA / EXTI / Watchdog / CRC'}),b=STM32_BOARDS['nucleo-f401re'];
p.components=p.components.filter(c=>c.type==='board');p.components[0].x=250;p.components[0].y=80;
const pin=n=>'mcu:'+b.pins.find(p=>p.net===n&&p.connectable!==false).id;
for(let i=0;i<2;i++){
 const id='pot'+(i+1);p.components.push({id,type:'pot',x:800,y:140+i*200,rotation:0,params:{value:i?75:25}});
 for(const [a,n]of[['VCC','3V3'],['GND','GND'],['OUT',i?'PB0':'PA0']])p.wires.push({id:'w'+p.wires.length,from:pin(n),to:id+':'+a,color:n==='GND'?'#64748b':n==='3V3'?'#ef4444':'#14b8a6',points:[]});
}
outerBoardPads(p);for(const id of p.wires.map(w=>w.id))labelWire(p,id);
// Shared supply labels and spread terminal labels avoid stacked text/wires.
const names=['3V3','3V3','GND','GND','ADC_A','ADC_A','3V3','3V3','GND','GND','ADC_B','ADC_B'];
for(let i=1;i<=12;i++)p.components.find(c=>c.id==='label'+i).params.name=names[i-1];
p.components=p.components.filter(c=>!['label7','label9'].includes(c.id));
p.wires=p.wires.filter(w=>!['labelwire7','labelwire9'].includes(w.id));
for(const [id,x,y,side]of [['label2',980,260,'left'],['label4',640,260,'right'],['label6',800,310,'top'],['label8',980,460,'left'],['label10',640,460,'right'],['label12',800,510,'top']]){
 Object.assign(p.components.find(c=>c.id===id),{x,y});p.components.find(c=>c.id===id).params.side=side;
 const w=p.wires.find(w=>w.to===id+':NET'),a=pinPoint(p,w.from),z=pinPoint(p,w.to);
 w.points=side==='top'?[{x:a.x,y:z.y}]:[{x:a.x,y:z.y}];
}
p.code=String.raw`#include <cf_hal.h>
#include <stdio.h>
volatile unsigned short samples[2];
volatile unsigned button_count;
void EXTI15_10_IRQHandler(void){
 if(cf_exti_pending(PC13)){cf_exti_clear(PC13);button_count++;cf_gpio_write(PA5,button_count&1);}
}
int main(void){
 cf_uart_begin(115200);unsigned flags=cf_reset_flags();cf_reset_flags_clear();
 printf("BOOT: %s\n",flags&(1u<<29)?"IWDG RESET":"POWER / MCU RESET");
 cf_gpio_mode(PA5,CF_OUTPUT);cf_gpio_write(PA5,0);
 cf_exti_begin(PC13,1,1);
 const unsigned channels[2]={PA0,PB0};
 if(cf_adc_dma_begin(channels,2,samples,2,1,1))puts("DMA CONFIG ERROR");
 cf_crc_begin();cf_crc_word(0x12345678);printf("CRC=%u\n",cf_crc_value());
 puts("A=ADC samples, B=button count, R=watchdog reset. Press board B1 to toggle LED.");
 cf_iwdg_begin(0,31);unsigned feeding=1,last=0;
 for(;;){if(feeding)cf_iwdg_refresh();int c=cf_uart_read();
  if(c=='A')printf("ADC DMA: %u / %u\n",samples[0],samples[1]);
  if(c=='B')printf("EXTI B1: %u\n",button_count);
  if(c=='R'){feeding=0;puts("WATCHDOG REFRESH STOPPED");}
  if(last!=button_count){last=button_count;printf("B1 IRQ=%u LED=%u\n",last,last&1);}
  cf_delay_us(200);
 }
}
`;
await mkdir('docs/examples',{recursive:true});
await writeFile('docs/examples/stm32-acceptance-053.json',JSON.stringify(p,null,2),'utf8');
await writeFile('../CircuitForge-0.53-STM32-Lab.json',JSON.stringify(p,null,2),'utf8');
