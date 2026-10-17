import {CPP_HEADERS,cppHeap,CPP_RUNTIME} from './stm32-cpp-runtime.js';
import {stmRTCHAL} from './stm32-rtc-hal.js';
import {File,Directory} from '@bjorn3/browser_wasi_shim';
import {runESPTool} from './esp-compiler.js';
import {STM32_BOARDS} from '../dist/stm32-boards.js';
import {packSTMImage} from '../dist/stm32-image.js';
import {normalizeFiles} from '../dist/source-files.js';
import {C_HEADERS} from '../dist/c-hal.js';
export function stmUSART1HAL(board){const b=STM32_BOARDS[board],f4=b.cpu==='cortex-m4f';return [1,2].map(number=>{
 const base=number===2?'0x40004400':f4?'0x40011000':'0x40013800',clock=number===2?b.hz/2:b.hz;
 const setup=f4?`REG(${number===1?'0x40023844':'0x40023840'})|=1u<<${number===1?4:17};unsigned pins[2]={tx,rx};for(unsigned i=0;i<2;i++){unsigned p=pins[i],bank=p/16,n=p%16,a=0x40020000+bank*0x400;REG(0x40023830)|=1u<<bank;REG(a)=(REG(a)&~(3u<<(n*2)))|(2u<<(n*2));REG(a+4)&=~(1u<<n);REG(a+12)=(REG(a+12)&~(3u<<(n*2)))|(1u<<(n*2));unsigned af=a+32+(n>=8?4:0),shift=(n%8)*4;REG(af)=(REG(af)&~(15u<<shift))|(7u<<shift);}`:`REG(${number===1?'0x40021018':'0x4002101c'})|=1u<<${number===1?14:17};REG(0x40021018)|=1u;REG(0x40010004)=(REG(0x40010004)&~${number===1?4:8}u)${number===1?'|(tx==PB6?4u:0)':''};cf_gpio_mode(tx,CF_OUTPUT);cf_gpio_mode(rx,CF_INPUT_PULLUP);unsigned a=0x40010800+(tx/16)*0x400+(tx%16<8?0:4),shift=(tx%8)*4;REG(a)=(REG(a)&~(15u<<shift))|(11u<<shift);`;
 const valid=number===2?'tx==PA2&&rx==PA3':f4?`(tx==PA9||tx==PB6${b.family==='f411'?'||tx==PA15':''})&&(rx==PA10||rx==PB7${b.family==='f411'?'||rx==PB3':''})`:'((tx==PA9&&rx==PA10)||(tx==PB6&&rx==PB7))';return `
int cf_usart${number}_config(unsigned baud,unsigned tx,unsigned rx,unsigned bits,unsigned parity,unsigned stops){if(baud<1200||baud>115200||!(${valid})||!cf_gpio_valid(tx)||!cf_gpio_valid(rx)||bits<7||bits>9||parity>2||stops<1||stops>2||(!parity&&bits==7)||(parity&&bits==9))return -1;REG(${base}+12)=0;${setup}REG(${base}+8)=(${clock}u+baud/2)/baud;REG(${base}+16)=stops==2?8192u:0;REG(${base}+20)=0;REG(${base}+12)=8192u|12u|((bits==9||(bits==8&&parity))?4096u:0)|(parity?1024u:0)|(parity==2?512u:0);return 0;}
int cf_usart${number}_oversampling(unsigned factor){if(factor!=16&&factor!=8)return -1;${f4?'':'if(factor==8)return -1;'}unsigned cr=REG(${base}+12),brr=REG(${base}+8),divisor=cr&32768u?(brr>>4)*8u+(brr&7u):brr;if(!divisor||!(REG(${base})&64u))return -1;REG(${base}+12)=cr&~(8192u|32768u);REG(${base}+8)=factor==8?((divisor/8u)<<4)|(divisor%8u):divisor;REG(${base}+12)=(cr&~32768u)|(factor==8?32768u:0);return 0;}
int cf_usart${number}_begin(unsigned baud,unsigned tx,unsigned rx){return cf_usart${number}_config(baud,tx,rx,8,0,1);}
void cf_usart${number}_write_word(unsigned c){while(!(REG(${base})&128u)){}REG(${base}+4)=c;}
void cf_usart${number}_write(unsigned char c){cf_usart${number}_write_word(c);}
int cf_usart${number}_read_word(void){unsigned sr=REG(${base});return sr&32u?(int)(REG(${base}+4)&511u):-1;}
int cf_usart${number}_read(void){int c=cf_usart${number}_read_word();return c<0?-1:c&255;}
`;
 }).join('');}
export function stmADCHAL(board){
 const f4=STM32_BOARDS[board].cpu==='cortex-m4f',base=f4?'0x40012000':'0x40012400';
 const setup=f4?'unsigned a=0x40020000+(p/16)*0x400;REG(0x40023830)|=1u<<(p/16);REG(a)|=3u<<((p%16)*2);REG(a+12)&=~(3u<<((p%16)*2));REG(0x40023844)|=1u<<8;REG(0x40012304)=1u<<16;':'unsigned a=0x40010800+(p/16)*0x400+(p%16<8?0:4);REG(0x40021018)|=(1u<<9)|(1u<<(p/16+2));REG(a)&=~(15u<<((p%8)*4));REG(0x40021004)=(REG(0x40021004)&~(3u<<14))|(2u<<14);';
 return `
int cf_adc_config(unsigned p){if(!cf_gpio_valid(p)||!((p<8)||(p==PB0)||(p==PB1)||(p>=PC0&&p<=PC5)))return -1;${setup}REG(${base}+4)=0;REG(${base}+8)=${f4?'1u':'1u|(7u<<17)|(1u<<20)'};return 0;}
int cf_adc_begin_sequence(const unsigned *pins,unsigned count,unsigned continuous,unsigned each,unsigned bits,unsigned left){if(!pins||count<1||count>16||continuous>1||each>1||left>1||${f4?'!(bits==12||bits==10||bits==8||bits==6)':'bits!=12||(each&&count>1)'})return -1;for(unsigned i=0;i<count;i++){unsigned p=pins[i];if(!cf_gpio_valid(p)||!((p<8)||(p==PB0)||(p==PB1)||(p>=PC0&&p<=PC5)))return -1;}REG(${base}+8)=0;for(unsigned i=0;i<count;i++)cf_adc_config(pins[i]);REG(${base})=0;REG(${base}+44)=(count-1)<<20;REG(${base}+48)=0;REG(${base}+52)=0;for(unsigned i=0;i<count;i++){unsigned p=pins[i],ch=p<8?p:p<=PB1?p-PB0+8:p-PC0+10,addr=${base}+(i<6?52:i<12?48:44);REG(addr)|=ch<<((i%6)*5);unsigned sample=${base}+(ch<10?16:12),shift=(ch<10?ch:ch-10)*3;REG(sample)=(REG(sample)&~(7u<<shift))|(7u<<shift);}REG(${base}+4)=(count>1?256u:0u)${f4?'|((12u-bits)/2u<<24)':''};REG(${base}+8)=${f4?'1u|(each?1024u:0u)':'1u|(7u<<17)|(1u<<20)'}|(continuous?2u:0u)|(left?2048u:0u);REG(${base}+8)|=1u<<${f4?30:22};return 0;}
int cf_adc_injected_begin(const unsigned *pins,unsigned count){if(!pins||count<1||count>4)return -1;for(unsigned i=0;i<count;i++){unsigned p=pins[i];if(!cf_gpio_valid(p)||!((p<8)||(p==PB0)||(p==PB1)||(p>=PC0&&p<=PC5)))return -1;}REG(${base}+8)=0;for(unsigned i=0;i<count;i++)cf_adc_config(pins[i]);REG(${base}+4)=count>1?256:0;unsigned sequence=(count-1)<<20;for(unsigned i=0;i<count;i++){unsigned p=pins[i],ch=p<8?p:p<=PB1?p-PB0+8:p-PC0+10;sequence|=ch<<((4-count+i)*5);unsigned sample=${base}+(ch<10?16:12),shift=(ch<10?ch:ch-10)*3;REG(sample)|=7u<<shift;REG(${base}+20+i*4)=0;}REG(${base}+56)=sequence;REG(${base})=0;REG(${base}+8)=${f4?'1u|(1u<<22)':'1u|(7u<<12)|(1u<<15)|(1u<<21)'};return 0;}
int cf_adc_injected_ready(void){return !!(REG(${base})&4u);}
int cf_adc_injected_result(unsigned rank,int *value){if(!value||rank<1||rank>4||!cf_adc_injected_ready())return -1;*value=(short)(REG(${base}+60+(rank-1)*4)&65535);return 0;}
void cf_adc_injected_clear(void){REG(${base})=~4u;}
int cf_adc_ready(void){return !!(REG(${base})&2u);}
int cf_adc_result(void){if(${f4?'REG('+base+')&32u':'0'})return -2;if(!cf_adc_ready())return -1;return REG(${base}+76)&65535u;}
void cf_adc_stop(void){REG(${base}+8)&=~1u;}
int cf_adc_read(unsigned p){if(cf_adc_config(p)<0)return -1;unsigned channel=p<8?p:p<=PB1?p-PB0+8:p-PC0+10;REG(${base}+44)=0;REG(${base}+52)=channel;unsigned sample=${base}+(channel<10?16:12),shift=(channel<10?channel:channel-10)*3;REG(sample)=(REG(sample)&~(7u<<shift))|(5u<<shift);REG(${base}+8)|=1u<<${f4?30:22};while(!(REG(${base})&2u)){}return REG(${base}+76)&4095u;}
`;
}
export function stmEXTIHAL(board){const f4=STM32_BOARDS[board].cpu==='cortex-m4f',base=f4?'0x40013c00':'0x40010400',mux=f4?'0x40013808':'0x40010008';return `
int cf_exti_begin(unsigned p,unsigned edge,unsigned pull){if(!cf_gpio_valid(p)||edge>2||pull>2)return -1;unsigned n=p%16,bit=1u<<n;cf_gpio_mode(p,pull==1?CF_INPUT_PULLUP:pull==2?CF_INPUT_PULLDOWN:CF_INPUT);REG(${f4?'0x40023844':'0x40021018'})|=1u<<${f4?14:0};REG(${base})&=~bit;unsigned a=${mux}+(n/4)*4,shift=(n%4)*4;REG(a)=(REG(a)&~(15u<<shift))|((p/16)<<shift);REG(${base}+8)=(REG(${base}+8)&~bit)|(edge!=1?bit:0);REG(${base}+12)=(REG(${base}+12)&~bit)|(edge!=0?bit:0);REG(${base}+20)=bit;REG(${base})|=bit;unsigned irq=n<5?6+n:n<10?23:40;REG(0xe000e100+(irq/32)*4)|=1u<<(irq%32);return 0;}
unsigned cf_exti_pending(unsigned p){return cf_gpio_valid(p)?!!(REG(${base}+20)&(1u<<(p%16))):0;}
void cf_exti_clear(unsigned p){if(cf_gpio_valid(p))REG(${base}+20)=1u<<(p%16);}
void cf_exti_disable(unsigned p){if(cf_gpio_valid(p))REG(${base})&=~(1u<<(p%16));}
`;}
export function stmADCDMAHAL(board){const b=STM32_BOARDS[board],f4=b.cpu==='cortex-m4f',dma=f4?'0x40026410':'0x40020008',base=f4?'0x40012000':'0x40012400';return `
int cf_adc_dma_begin(const unsigned *pins,unsigned count,volatile unsigned short *out,unsigned length,unsigned continuous,unsigned circular){unsigned addr=(unsigned)out;if(!pins||count<1||count>16||length<1||length>65535||continuous>1||circular>1||circular&&!continuous||!continuous&&length!=count||addr&1||addr<0x20000000u||addr>0x20000000u+${b.ram}u-length*2u)return -1;for(unsigned i=0;i<count;i++){unsigned p=pins[i];if(!cf_gpio_valid(p)||!((p<8)||(p==PB0)||(p==PB1)||(p>=PC0&&p<=PC5)))return -1;}if(cf_adc_begin_sequence(pins,count,continuous,0,12,0)<0)return -1;REG(${base}+8)&=~1u;REG(${f4?'0x40023830':'0x40021014'})|=${f4?'1u<<22':'1u'};REG(${dma})=0;REG(${f4?'0x40026408':'0x40020004'})=${f4?'61u':'15u'};REG(${dma}+4)=length;REG(${dma}+8)=${base}+76;REG(${dma}+12)=addr;REG(${dma})=${f4?'1u|1024u|2048u|8192u':'1u|128u|256u|1024u'}|(circular?${f4?'256u':'32u'}:0);REG(${base})=0;REG(${base}+8)|=1u|256u${f4?'|512u':''}|(1u<<${f4?30:22});return 0;}
unsigned cf_adc_dma_remaining(void){return REG(${dma}+4);}
void cf_adc_dma_stop(void){REG(${dma})&=~1u;REG(${base}+8)&=~257u;}
`;}
export function stmWatchdogHAL(board){const f4=STM32_BOARDS[board].cpu==='cortex-m4f',csr=f4?'0x40023874':'0x40021024',en=f4?'0x40023840':'0x4002101c';return `
int cf_iwdg_begin(unsigned prescaler,unsigned reload){if(prescaler>7||reload>4095)return -1;REG(${csr})|=1u;REG(0x40003000)=0x5555;REG(0x40003004)=prescaler;REG(0x40003008)=reload;while(REG(0x4000300c)&3u){}REG(0x40003000)=0xcccc;REG(0x40003000)=0xaaaa;return 0;}
void cf_iwdg_refresh(void){REG(0x40003000)=0xaaaa;}
int cf_wwdg_begin(unsigned prescaler,unsigned window,unsigned counter,unsigned earlyIRQ){if(prescaler>3||window<64||window>127||counter<64||counter>127||earlyIRQ>1)return -1;REG(${en})|=2048u;REG(0x40002c04)=window|(prescaler<<7)|(earlyIRQ?512u:0u);REG(0x40002c08)=0;if(earlyIRQ)REG(0xe000e100)|=1u;REG(0x40002c00)=128u|counter;return 0;}
int cf_wwdg_refresh(unsigned counter){if(counter<64||counter>127)return -1;REG(0x40002c00)=128u|counter;return 0;}
unsigned cf_reset_flags(void){return REG(${csr})&0xfe000000u;}
void cf_reset_flags_clear(void){REG(${csr})|=1u<<24;}
`;}
export function stmCRCHAL(board){const f4=STM32_BOARDS[board].cpu==='cortex-m4f';return `
void cf_crc_begin(void){REG(${f4?'0x40023830':'0x40021014'})|=1u<<${f4?12:6};REG(0x40023008)=1;}
unsigned cf_crc_word(unsigned word){REG(0x40023000)=word;return REG(0x40023000);}
unsigned cf_crc_value(void){return REG(0x40023000);}
`;}
export function stmPWMHAL(board){const b=STM32_BOARDS[board],f4=b.cpu==='cortex-m4f';
 const setup=f4?'REG(0x40023840)|=1u;REG(0x40023830)|=1u;REG(0x40020000)=(REG(0x40020000)&~(3u<<(p*2)))|(2u<<(p*2));REG(0x40020004)&=~(1u<<p);REG(0x40020020)=(REG(0x40020020)&~(15u<<(p*4)))|(1u<<(p*4));':'REG(0x4002101c)|=1u;REG(0x40021018)|=5u;REG(0x40010004)&=~0x300u;REG(0x40010800)=(REG(0x40010800)&~(15u<<(p*4)))|(11u<<(p*4));';
 return `
int cf_pwm_begin(unsigned p,unsigned hz,unsigned duty){if(p>3||!cf_gpio_valid(p)||hz<1||hz>20000||duty>100)return -1;${setup}REG(0x40000000)=0;REG(0x40000008)=0;REG(0x40000020)&=~(1u<<(p*4));unsigned ticks=${b.hz}u/hz,psc=(ticks-1)/65536u,arr=ticks/(psc+1)-1;REG(0x40000000)=128u;REG(0x40000028)=psc;REG(0x4000002c)=arr;unsigned ccm=0x40000018+(p>=2?4:0),shift=(p%2)*8;REG(ccm)=(REG(ccm)&~(255u<<shift))|(104u<<shift);REG(0x40000034+p*4)=(arr+1)*duty/100;REG(0x40000020)|=1u<<(p*4);REG(0x40000014)=1;REG(0x40000010)=0;REG(0x40000000)=129u;return 0;}
int cf_tim2_capture_begin(unsigned p,unsigned edge,unsigned divider,unsigned hz){if(p>3||!cf_gpio_valid(p)||edge>${f4?2:1}u||(divider!=1&&divider!=2&&divider!=4&&divider!=8)||hz<${Math.ceil(b.hz/65536)}u||hz>1000000)return -1;if(REG(0x40000008)&7u)return -1;unsigned psc=${b.hz}u/hz-1;if((REG(0x40000000)&1u)&&(REG(0x40000028)&65535u)!=psc)return -1;${f4?'REG(0x40023840)|=1u;REG(0x40023830)|=1u;REG(0x40020000)=(REG(0x40020000)&~(3u<<(p*2)))|(2u<<(p*2));REG(0x4002000c)=(REG(0x4002000c)&~(3u<<(p*2)))|(2u<<(p*2));REG(0x40020020)=(REG(0x40020020)&~(15u<<(p*4)))|(1u<<(p*4));':'REG(0x4002101c)|=1u;REG(0x40021018)|=1u;REG(0x40010004)&=~0x300u;cf_gpio_mode(p,CF_INPUT_PULLDOWN);'}unsigned shift=p*4;REG(0x40000020)&=~(1u<<shift);if(!(REG(0x40000000)&1u)){REG(0x40000028)=psc;REG(0x4000002c)=${f4?'0xffffffffu':'65535u'};REG(0x40000014)=1;REG(0x40000010)=0;}unsigned ccm=0x40000018+(p>=2?4:0),ic=divider==1?0:divider==2?1:divider==4?2:3;REG(ccm)=(REG(ccm)&~(255u<<((p%2)*8)))|((1u|(ic<<2))<<((p%2)*8));REG(0x40000020)=(REG(0x40000020)&~(15u<<shift))|((1u|(edge==1?2u:edge==2?10u:0u))<<shift);REG(0x40000000)|=1u;return ${b.hz}u/(psc+1);}
int cf_tim2_encoder_begin(unsigned mode,unsigned arr,unsigned invert,unsigned psc){if(mode<1||mode>3||invert>3||psc>65535||arr<1||arr>${f4?'0xffffffffu':'65535u'}||!cf_gpio_valid(PA0)||!cf_gpio_valid(PA1))return -1;${f4?'REG(0x40023840)|=1u;REG(0x40023830)|=1u;':'REG(0x4002101c)|=1u;REG(0x40021018)|=1u;REG(0x40010004)&=~0x300u;'}REG(0x40000000)=0;REG(0x4000000c)=0;REG(0x40000020)=0;REG(0x40000008)=0;REG(0x40000000)=0;for(unsigned p=0;p<2;p++){${f4?'REG(0x40020000)=(REG(0x40020000)&~(3u<<(p*2)))|(2u<<(p*2));REG(0x4002000c)=(REG(0x4002000c)&~(3u<<(p*2)))|(2u<<(p*2));REG(0x40020020)=(REG(0x40020020)&~(15u<<(p*4)))|(1u<<(p*4));':'cf_gpio_mode(p,CF_INPUT_PULLDOWN);'}}REG(0x40000028)=psc;REG(0x4000002c)=arr;REG(0x40000018)=257u;REG(0x4000001c)=0;REG(0x40000020)=17u|((invert&1u)?2u:0u)|((invert&2u)?32u:0u);REG(0x40000014)=1;REG(0x40000010)=0;REG(0x40000008)=mode;REG(0x40000000)=1;return 0;}
unsigned cf_tim2_encoder_count(void){return REG(0x40000024);}
int cf_tim2_capture_read(unsigned p,unsigned *value){if(p>3||!value||!cf_gpio_valid(p))return -1;unsigned sr=REG(0x40000010);if(!(sr&(1u<<(p+1))))return -1;*value=REG(0x40000034+p*4);unsigned over=sr&(1u<<(p+9));if(over)REG(0x40000010)=~(1u<<(p+9));return over?-2:0;}
int cf_pwm_duty(unsigned p,unsigned duty){if(p>3||!cf_gpio_valid(p)||duty>100)return -1;REG(0x40000034+p*4)=(REG(0x4000002c)+1)*duty/100;return 0;}
`;
}
export function stmSPIHAL(board){const b=STM32_BOARDS[board],f4=b.cpu==='cortex-m4f';const setup=f4?`REG(0x40023844)|=1u<<12;REG(0x40023830)|=1u;for(unsigned p=5;p<=7;p++){REG(0x40020000)=(REG(0x40020000)&~(3u<<(p*2)))|(2u<<(p*2));REG(0x40020004)&=~(1u<<p);REG(0x4002000c)=(REG(0x4002000c)&~(3u<<(p*2)))|(p==6?2u<<(p*2):0);REG(0x40020020)=(REG(0x40020020)&~(15u<<(p*4)))|(5u<<(p*4));}`:`REG(0x40021018)|=(1u<<12)|5u;REG(0x40010004)&=~1u;cf_gpio_mode(PA6,CF_INPUT_PULLDOWN);unsigned a=REG(0x40010800);a=(a&~((15u<<20)|(15u<<28)))|(11u<<20)|(11u<<28);REG(0x40010800)=a;`;return `
int cf_spi1_config(unsigned hz,unsigned mode,unsigned bits,unsigned lsb){if(mode>3||(bits!=8&&bits!=16)||lsb>1)return -1;if(hz<${b.hz/256}u||hz>1000000)return -1;REG(0x40013000)=0;${setup}unsigned br=0,clock=${b.hz}u/2;while(br<7&&clock>hz){br++;clock/=2;}REG(0x40013004)=0;REG(0x40013000)=4u|64u|256u|512u|(br<<3)|mode|(bits==16?2048u:0)|(lsb?128u:0);return (int)clock;}
int cf_spi1_nss_hardware(unsigned enable){if(enable>1||!(REG(0x40013000)&4u)||(REG(0x40013008)&128u))return -1;unsigned cr=REG(0x40013000);REG(0x40013000)=cr&~64u;if(enable){${f4?'REG(0x40020000)=(REG(0x40020000)&~(3u<<8))|(2u<<8);REG(0x40020004)&=~(1u<<4);REG(0x40020020)=(REG(0x40020020)&~(15u<<16))|(5u<<16);':'REG(0x40010800)=(REG(0x40010800)&~(15u<<16))|(11u<<16);'}REG(0x40013004)|=4u;REG(0x40013000)=(cr|64u)&~768u;}else{REG(0x40013004)&=~4u;cf_gpio_mode(PA4,CF_OUTPUT);cf_gpio_write(PA4,1);REG(0x40013000)=cr|64u|768u;}return 0;}
int cf_spi1_begin(unsigned hz){return cf_spi1_config(hz,0,8,0);}
int cf_spi1_transfer_word(unsigned value){unsigned start=REG(0xe0001004);while(!(REG(0x40013008)&2)){if((unsigned)(REG(0xe0001004)-start)>${b.hz/1000}u)return -1;}REG(0x4001300c)=value;while(!(REG(0x40013008)&1)){if((unsigned)(REG(0xe0001004)-start)>${b.hz/1000}u)return -1;}unsigned data=REG(0x4001300c),status=REG(0x40013008);while(REG(0x40013008)&128){if((unsigned)(REG(0xe0001004)-start)>${b.hz/1000}u)return -1;}return status&64?-2:(int)(data&((REG(0x40013000)&2048)?65535:255));}
int cf_spi1_transfer(unsigned char value){return cf_spi1_transfer_word(value);}
`;}
export function stmI2CHAL(board){const b=STM32_BOARDS[board],f4=b.cpu==='cortex-m4f';const setup=f4?`REG(0x40023840)|=1u<<21;REG(0x40023830)|=2u;for(unsigned n=6;n<=9;n++)REG(0x40020400)&=~(3u<<(n*2));for(unsigned i=0;i<2;i++){unsigned p=i?scl:sda,n=p%16,a=0x40020400;REG(a)=(REG(a)&~(3u<<(n*2)))|(2u<<(n*2));REG(a+4)|=1u<<n;REG(a+12)&=~(3u<<(n*2));unsigned af=a+32+(n>=8?4:0),shift=(n%8)*4;REG(af)=(REG(af)&~(15u<<shift))|(4u<<shift);}`:`REG(0x4002101c)|=1u<<21;REG(0x40021018)|=9u;REG(0x40010004)=(REG(0x40010004)&~2u)|(scl==PB8?2u:0);for(unsigned i=0;i<2;i++){unsigned p=i?scl:sda,n=p%16,a=0x40010c00+(n<8?0:4),shift=(n%8)*4;REG(a)=(REG(a)&~(15u<<shift))|(15u<<shift);}`;const valid=f4?'(scl==PB6||scl==PB8)&&(sda==PB7||sda==PB9)':'((scl==PB6&&sda==PB7)||(scl==PB8&&sda==PB9))';return `
static unsigned cf_i2c_sda,cf_i2c_scl,cf_i2c_hz;
int cf_i2c1_begin(unsigned hz,unsigned sda,unsigned scl){if(hz<10000||hz>100000||!(${valid})||!cf_gpio_valid(sda)||!cf_gpio_valid(scl))return -1;REG(0x40005400)=0;${setup}REG(0x40005400)=32768;REG(0x40005400)=0;REG(0x40005404)=${b.hz/2000000}u;REG(0x4000541c)=(${b.hz/2}u+2*hz-1)/(2*hz);REG(0x40005420)=${b.hz/2000000+1}u;REG(0x40005400)=1025;cf_i2c_sda=sda;cf_i2c_scl=scl;cf_i2c_hz=hz;return 0;}
static int cf_i2c_wait(unsigned mask){unsigned start=REG(0xe0001004);for(;;){unsigned sr=REG(0x40005414);if(sr&0xff00)return -1;if(sr&mask)return 0;if((unsigned)(REG(0xe0001004)-start)>${b.hz/200}u)return -1;}}
static int cf_i2c_stop_wait(void){unsigned start=REG(0xe0001004);while(REG(0x40005400)&512){if((unsigned)(REG(0xe0001004)-start)>${b.hz/200}u)return -1;}return 0;}
static unsigned cf_i2c_lock(void){unsigned p;__asm volatile("mrs %0,primask":"=r"(p));__asm volatile("cpsid i":::"memory");return p;}
static void cf_i2c_unlock(unsigned p){__asm volatile("msr primask,%0"::"r"(p):"memory");}
int cf_i2c1_recover(void){unsigned hz=cf_i2c_hz,sda=cf_i2c_sda,scl=cf_i2c_scl;if(!hz)return -1;REG(0x40005400)=0;cf_gpio_mode(sda,CF_OUTPUT_OPEN_DRAIN);cf_gpio_mode(scl,CF_OUTPUT_OPEN_DRAIN);cf_gpio_write(sda,1);for(unsigned i=0;i<9;i++){cf_gpio_write(scl,0);cf_delay_us(5);cf_gpio_write(scl,1);cf_delay_us(5);}cf_gpio_write(scl,0);cf_gpio_write(sda,0);cf_delay_us(5);cf_gpio_write(scl,1);cf_delay_us(5);int released=cf_gpio_read(scl);cf_gpio_write(sda,1);cf_delay_us(5);released&=cf_gpio_read(sda);cf_i2c1_begin(hz,sda,scl);return released?0:-1;}
static int cf_i2c_fail(void){REG(0x40005400)|=512;cf_i2c_stop_wait();cf_i2c1_recover();return -1;}
static int cf_i2c_address(unsigned address,int read,unsigned n){if(address>127||n<1||n>1024||!cf_i2c_hz)return -1;REG(0x40005414)=0;REG(0x40005400)=(REG(0x40005400)&~2048u)|1024u;REG(0x40005400)|=256;if(cf_i2c_wait(1))return cf_i2c_fail();REG(0x40005410)=(address<<1)|read;if(cf_i2c_wait(2))return cf_i2c_fail();unsigned lock=cf_i2c_lock();if(read&&n==1)REG(0x40005400)&=~1024u;if(read&&n==2)REG(0x40005400)|=2048;unsigned sr=REG(0x40005414);sr=REG(0x40005418);(void)sr;if(read&&n==1)REG(0x40005400)|=512;if(read&&n==2)REG(0x40005400)&=~1024u;cf_i2c_unlock(lock);return 0;}
static int cf_i2c_send(unsigned address,const unsigned char *data,unsigned n){if(!data||cf_i2c_address(address,0,n))return -1;for(unsigned i=0;i<n;i++){if(cf_i2c_wait(128))return cf_i2c_fail();REG(0x40005410)=data[i];}if(cf_i2c_wait(4))return cf_i2c_fail();return (int)n;}
int cf_i2c1_write(unsigned address,const unsigned char *data,unsigned n){if(cf_i2c_send(address,data,n)<0)return -1;REG(0x40005400)|=512;if(cf_i2c_stop_wait())return cf_i2c_fail();return (int)n;}
int cf_i2c1_probe(unsigned address){if(cf_i2c_address(address,0,1))return -1;REG(0x40005400)|=512;if(cf_i2c_stop_wait())return cf_i2c_fail();return 0;}
int cf_i2c1_read(unsigned address,unsigned char *data,unsigned n){unsigned size=n;if(!data||cf_i2c_address(address,1,n))return -1;if(n==1){if(cf_i2c_wait(64))return cf_i2c_fail();*data=REG(0x40005410);}else if(n==2){if(cf_i2c_wait(4))return cf_i2c_fail();unsigned lock=cf_i2c_lock();REG(0x40005400)|=512;*data++=REG(0x40005410);*data=REG(0x40005410);cf_i2c_unlock(lock);}else{while(n>3){if(cf_i2c_wait(64))return cf_i2c_fail();*data++=REG(0x40005410);n--;}if(cf_i2c_wait(4))return cf_i2c_fail();REG(0x40005400)&=~1024u;*data++=REG(0x40005410);if(cf_i2c_wait(4))return cf_i2c_fail();unsigned lock=cf_i2c_lock();REG(0x40005400)|=512;*data++=REG(0x40005410);*data=REG(0x40005410);cf_i2c_unlock(lock);}if(cf_i2c_stop_wait())return cf_i2c_fail();REG(0x40005400)=(REG(0x40005400)&~2048u)|1024;return (int)size;}
/* A single write-prefix/read transaction: BTF then repeated START, no intervening STOP. */
int cf_i2c1_write_read(unsigned address,const unsigned char *tx,unsigned nt,unsigned char *rx,unsigned nr){if(!tx||!rx||nt<1||nt>1024||nr<1||nr>1024||address>127||!cf_i2c_hz)return -1;if(cf_i2c_send(address,tx,nt)<0)return -1;return cf_i2c1_read(address,rx,nr);}
`;}
const enc=new TextEncoder(),file=s=>new File(enc.encode(s));
export function stmHeader(board){const b=STM32_BOARDS[board];return `#ifdef __cplusplus
extern "C" {
#endif
#pragma once
#define CF_CPU_HZ ${b.hz}u
#include <stdint.h>
${b.cpu==='cortex-m4f'?'#define CF_STM32_F4 1':'#define CF_STM32_F1 1'}
#define CF_INPUT 0
#define CF_OUTPUT 1
#define CF_INPUT_PULLUP 2
#define CF_OUTPUT_OPEN_DRAIN 3
#define CF_INPUT_PULLDOWN 4
${Array.from({length:4},(_,p)=>Array.from({length:16},(_,n)=>'#define P'+String.fromCharCode(65+p)+n+' '+(p*16+n)).join('\n')).join('\n')}
#define LED_BUILTIN ${b.ledPin}
int cf_gpio_valid(unsigned);
void cf_gpio_mode(unsigned,int);void cf_gpio_write(unsigned,int);int cf_gpio_read(unsigned);
void cf_delay_us(unsigned);void cf_delay_ms(unsigned);unsigned cf_millis(void);
int cf_pwm_begin(unsigned,unsigned,unsigned);int cf_pwm_duty(unsigned,unsigned);
void cf_crc_begin(void);unsigned cf_crc_word(unsigned);unsigned cf_crc_value(void);
int cf_iwdg_begin(unsigned,unsigned);void cf_iwdg_refresh(void);int cf_wwdg_begin(unsigned,unsigned,unsigned,unsigned);int cf_wwdg_refresh(unsigned);unsigned cf_reset_flags(void);void cf_reset_flags_clear(void);
int cf_adc_injected_begin(const unsigned*,unsigned);int cf_adc_injected_ready(void);int cf_adc_injected_result(unsigned,int*);void cf_adc_injected_clear(void);
int cf_adc_dma_begin(const unsigned*,unsigned,volatile unsigned short*,unsigned,unsigned,unsigned);unsigned cf_adc_dma_remaining(void);void cf_adc_dma_stop(void);
void SysTick_Handler(void);void ADC1_IRQHandler(void);void ADC1_2_IRQHandler(void);void ADC_IRQHandler(void);void RTC_IRQHandler(void);void RTCAlarm_IRQHandler(void);void RTC_Alarm_IRQHandler(void);void RTC_WKUP_IRQHandler(void);
void USB_HP_CAN1_TX_IRQHandler(void);void USB_LP_CAN1_RX0_IRQHandler(void);void CAN1_RX1_IRQHandler(void);void CAN1_SCE_IRQHandler(void);void USBWakeUp_IRQHandler(void);void OTG_FS_IRQHandler(void);void WWDG_IRQHandler(void);void EXTI0_IRQHandler(void);void EXTI1_IRQHandler(void);void EXTI2_IRQHandler(void);void EXTI3_IRQHandler(void);void EXTI4_IRQHandler(void);void EXTI9_5_IRQHandler(void);void EXTI15_10_IRQHandler(void);void USART1_IRQHandler(void);void USART2_IRQHandler(void);void SPI1_IRQHandler(void);void I2C1_EV_IRQHandler(void);void I2C1_ER_IRQHandler(void);void TIM2_IRQHandler(void);
void DMA1_Channel1_IRQHandler(void);void DMA1_Channel2_IRQHandler(void);void DMA1_Channel3_IRQHandler(void);void DMA1_Channel4_IRQHandler(void);void DMA1_Channel5_IRQHandler(void);void DMA1_Channel6_IRQHandler(void);void DMA1_Channel7_IRQHandler(void);
void DMA1_Stream0_IRQHandler(void);void DMA1_Stream1_IRQHandler(void);void DMA1_Stream2_IRQHandler(void);void DMA1_Stream3_IRQHandler(void);void DMA1_Stream4_IRQHandler(void);void DMA1_Stream5_IRQHandler(void);void DMA1_Stream6_IRQHandler(void);void DMA1_Stream7_IRQHandler(void);void DMA2_Stream0_IRQHandler(void);void DMA2_Stream1_IRQHandler(void);void DMA2_Stream2_IRQHandler(void);void DMA2_Stream3_IRQHandler(void);void DMA2_Stream4_IRQHandler(void);void DMA2_Stream5_IRQHandler(void);void DMA2_Stream6_IRQHandler(void);void DMA2_Stream7_IRQHandler(void);
int cf_rtc_begin(unsigned);int cf_rtc_counter(unsigned*);int cf_rtc_set_counter(unsigned);int cf_rtc_calendar(unsigned*);int cf_rtc_set_calendar(const unsigned*);int cf_backup_read(unsigned,unsigned*);int cf_backup_write(unsigned,unsigned);
int cf_exti_begin(unsigned,unsigned,unsigned);unsigned cf_exti_pending(unsigned);void cf_exti_clear(unsigned);void cf_exti_disable(unsigned);
int cf_tim2_encoder_begin(unsigned,unsigned,unsigned,unsigned);unsigned cf_tim2_encoder_count(void);
int cf_tim2_capture_begin(unsigned,unsigned,unsigned,unsigned);int cf_tim2_capture_read(unsigned,unsigned*);
int cf_i2c1_begin(unsigned,unsigned,unsigned);int cf_i2c1_write(unsigned,const unsigned char*,unsigned);int cf_i2c1_read(unsigned,unsigned char*,unsigned);int cf_i2c1_recover(void);int cf_i2c1_probe(unsigned);int cf_i2c1_write_read(unsigned,const unsigned char*,unsigned,unsigned char*,unsigned);
int cf_spi1_nss_hardware(unsigned);int cf_spi1_begin(unsigned);int cf_spi1_transfer(unsigned char);int cf_spi1_config(unsigned,unsigned,unsigned,unsigned);int cf_spi1_transfer_word(unsigned);
int cf_adc_config(unsigned);int cf_adc_read(unsigned);
int cf_adc_begin_sequence(const unsigned*,unsigned,unsigned,unsigned,unsigned,unsigned);
int cf_adc_ready(void);int cf_adc_result(void);void cf_adc_stop(void);
int cf_usart1_oversampling(unsigned);int cf_usart2_oversampling(unsigned);int cf_usart1_begin(unsigned,unsigned,unsigned);int cf_usart2_begin(unsigned,unsigned,unsigned);int cf_usart1_config(unsigned,unsigned,unsigned,unsigned,unsigned,unsigned);int cf_usart2_config(unsigned,unsigned,unsigned,unsigned,unsigned,unsigned);void cf_usart1_write_word(unsigned);void cf_usart2_write_word(unsigned);int cf_usart1_read_word(void);int cf_usart2_read_word(void);void cf_usart2_write(unsigned char);int cf_usart2_read(void);void cf_usart1_write(unsigned char);int cf_usart1_read(void);
void cf_uart_begin(unsigned);void cf_uart_write(unsigned char);int cf_uart_available(void);int cf_uart_read(void);

#ifdef __cplusplus
}
#endif
`}
export function stmHAL(board){const b=STM32_BOARDS[board],uart=b.terminalNumber===2?0x40004400:b.cpu==='cortex-m4f'?0x40011000:0x40013800;return `#include <cf_hal.h>
#define REG(a) (*(volatile unsigned *)(a))
int cf_gpio_valid(unsigned p){return ${b.gpio.map(p=>'p=='+((p.charCodeAt(1)-65)*16+(+p.slice(2)))).join('||')};}
void cf_gpio_mode(unsigned p,int m){if(!cf_gpio_valid(p))return;unsigned bank=p/16,n=p%16;REG(0x40021018)|=1u<<(bank+2);unsigned a=0x40010800+bank*0x400+(n<8?0:4),shift=(n%8)*4;REG(a)=(REG(a)&~(15u<<shift))|((m==1?2u:m==3?6u:(m==2||m==4)?8u:4u)<<shift);if(m==2||m==4)REG(0x40010810+bank*0x400)=1u<<(n+(m==4?16:0));}
void cf_gpio_write(unsigned p,int v){if(cf_gpio_valid(p))REG(0x40010810+(p/16)*0x400)=1u<<(p%16+(v?0:16));}
int cf_gpio_read(unsigned p){return cf_gpio_valid(p)?(REG(0x40010808+(p/16)*0x400)>>(p%16))&1u:0;}
static unsigned clock_last,clock_ms,clock_rem;static void cf_poll(void){unsigned now=REG(0xE0001004),d=now-clock_last;clock_last=now;clock_ms+=d/72000;clock_rem+=d%72000;if(clock_rem>=72000){clock_ms++;clock_rem-=72000;}}
void cf_delay_us(unsigned n){while(n){unsigned us=n>1000?1000:n,start=REG(0xE0001004);while((unsigned)(REG(0xE0001004)-start)<us*72) __asm volatile("nop");cf_poll();n-=us;}}
void cf_delay_ms(unsigned n){while(n--)cf_delay_us(1000);}unsigned cf_millis(void){cf_poll();return clock_ms;}
void cf_uart_begin(unsigned baud){if(!baud)return;REG(0x40021018)|=${uart===0x40013800?'1u<<14':'0'};REG(0x4002101C)|=${uart===0x40004400?'1u<<17':'0'};REG(${uart+12})=0;REG(${uart+8})=${uart===0x40004400?36000000:72000000}/baud;REG(${uart+12})=(1u<<13)|(1u<<3)|(1u<<2);}
void cf_uart_write(unsigned char c){while(!(REG(${uart})&(1u<<7))){}REG(${uart+4})=c;}
int cf_uart_available(void){return !!(REG(${uart})&(1u<<5));}int cf_uart_read(void){return cf_uart_available()?(int)(REG(${uart+4})&255):-1;}
void *memset(void*p,int v,unsigned n){unsigned char*b=p;while(n--)*b++=v;return p;}
void *memcpy(void*p,const void*s,unsigned n){unsigned char*b=p;const unsigned char*a=s;while(n--)*b++=*a++;return p;}
extern void(*_sinit_array[])(void),(*_einit_array[])(void);void cf_cpp_fini(void) __attribute__((weak));
extern unsigned _sidata,_sdata,_edata,_sbss,_ebss;int main(void);void cf_board_init(void) __attribute__((weak));
void Reset_Handler(void){unsigned*s=&_sidata,*d=&_sdata;while(d<&_edata)*d++=*s++;for(d=&_sbss;d<&_ebss;)*d++=0;REG(0x40021018)|=1;REG(0x40010004)=2u<<24;REG(0x40022000)=0x12;REG(0x40021000)|=1u<<16;while(!(REG(0x40021000)&(1u<<17))){}REG(0x40021004)=(7u<<18)|(1u<<16)|(4u<<8);REG(0x40021000)|=1u<<24;while(!(REG(0x40021000)&(1u<<25))){}REG(0x40021004)|=2;while((REG(0x40021004)&12)!=8){}REG(0xE000EDFC)|=1u<<24;REG(0xE0001000)|=1;for(void(**ctor)(void)=_sinit_array;ctor<_einit_array;ctor++)(*ctor)();if(cf_board_init)cf_board_init();main();if(cf_cpp_fini)cf_cpp_fini();for(;;){} }
void Default_Handler(void){for(;;){} }
void SysTick_Handler(void) __attribute__((weak,alias("Default_Handler")));






${stmUSART1HAL(board)}${stmEXTIHAL(board)}${stmADCHAL(board)}${stmADCDMAHAL(board)}${stmWatchdogHAL(board)}${stmCRCHAL(board)}${stmRTCHAL(STM32_BOARDS[board])}${stmPWMHAL(board)}${stmSPIHAL(board)}${stmI2CHAL(board)}
${stmVectors(board)}
`}
function stmVectors(board){
 const f4=STM32_BOARDS[board].cpu==='cortex-m4f',adc=f4?'ADC':'ADC1_2';
 const map={0:'WWDG',3:f4?'RTC_WKUP':'RTC',41:f4?'RTC_Alarm':'RTCAlarm',6:'EXTI0',7:'EXTI1',8:'EXTI2',9:'EXTI3',10:'EXTI4',18:adc,23:'EXTI9_5',28:'TIM2',31:'I2C1_EV',32:'I2C1_ER',35:'SPI1',37:'USART1',38:'USART2',40:'EXTI15_10'};
 if(f4)map[67]='OTG_FS';else Object.assign(map,{19:'USB_HP_CAN1_TX',20:'USB_LP_CAN1_RX0',21:'CAN1_RX1',22:'CAN1_SCE',42:'USBWakeUp'});
 for(let i=0;i<(f4?8:7);i++)map[f4&&i===7?47:11+i]='DMA1_'+(f4?'Stream'+i:'Channel'+(i+1));
 if(f4)for(const [i,irq]of [56,57,58,59,60,68,69,70].entries())map[irq]='DMA2_Stream'+i;
 const weak=Object.values(map).filter(n=>n!==adc).map(name=>'void '+name+'_IRQHandler(void) __attribute__((weak,alias("Default_Handler")));').join('\n');
 // Canonical CMSIS ADC vectors retain compatibility with existing CF handlers.
 const bridge='void ADC1_IRQHandler(void) __attribute__((weak,alias("Default_Handler")));\nvoid '+adc+'_IRQHandler(void) __attribute__((weak));\nvoid '+adc+'_IRQHandler(void){ADC1_IRQHandler();}';
 return weak+'\n'+bridge+'\n__attribute__((section(".vectors"),used)) const unsigned vectors[98]={'+Array.from({length:98},(_,i)=>i===0?'0x20000000+'+STM32_BOARDS[board].ram:i===1?'(unsigned)Reset_Handler':i===15?'(unsigned)SysTick_Handler':map[i-16]?'(unsigned)'+map[i-16]+'_IRQHandler':'(unsigned)Default_Handler').join(',')+'};';
}
export function stmF4HAL(board){const b=STM32_BOARDS[board],mhz=b.hz/1000000;return stmHAL(board).split('\n').map(line=>{
if(line.startsWith('void cf_gpio_mode'))return 'void cf_gpio_mode(unsigned p,int m){if(!cf_gpio_valid(p))return;unsigned bank=p/16,n=p%16,a=0x40020000+bank*0x400;REG(0x40023830)|=1u<<bank;REG(a)=(REG(a)&~(3u<<(n*2)))|((m==1||m==3?1u:0u)<<(n*2));REG(a+4)=(REG(a+4)&~(1u<<n))|(m==3?1u<<n:0);REG(a+12)=(REG(a+12)&~(3u<<(n*2)))|(m==2?1u<<(n*2):m==4?2u<<(n*2):0);}' ;
if(line.startsWith('void cf_gpio_write'))return 'void cf_gpio_write(unsigned p,int v){if(cf_gpio_valid(p))REG(0x40020018+(p/16)*0x400)=1u<<(p%16+(v?0:16));}';
if(line.startsWith('int cf_gpio_read'))return 'int cf_gpio_read(unsigned p){return cf_gpio_valid(p)?(REG(0x40020010+(p/16)*0x400)>>(p%16))&1u:0;}';
if(line.startsWith('void cf_uart_begin')){const second=b.terminalNumber===2,base=second?0x40004400:0x40011000;return `void cf_uart_begin(unsigned baud){if(!baud)return;REG(${second?'0x40023840':'0x40023844'})|=1u<<${second?17:4};REG(${base+12})=0;REG(${base+8})=${b.hz/(second?2:1)}/baud;REG(${base+12})=(1u<<13)|(1u<<3)|(1u<<2);}`;}
if(line.startsWith('void Reset_Handler'))return `void Reset_Handler(void){unsigned*s=&_sidata,*d=&_sdata;while(d<&_edata)*d++=*s++;for(d=&_sbss;d<&_ebss;)*d++=0;REG(0xE000ED88)|=15u<<20;REG(0x40023840)|=1u<<28;REG(0x40007000)=${b.family==='f411'?0xc000:0x8000};REG(0x40023C00)=${mhz>84?3:2};REG(0x40023800)|=1u<<16;while(!(REG(0x40023800)&(1u<<17))){}REG(0x40023804)=${b.hse/1000000}u|(${mhz*4}u<<6)|(1u<<16)|(1u<<22)|(${mhz===96?8:7}u<<24);REG(0x40023808)=4u<<10;REG(0x40023800)|=1u<<24;while(!(REG(0x40023800)&(1u<<25))){}while(!(REG(0x40007004)&(1u<<14))){}REG(0x40023808)|=2;while((REG(0x40023808)&12)!=8){}REG(0xE000EDFC)|=1u<<24;REG(0xE0001000)|=1;for(void(**ctor)(void)=_sinit_array;ctor<_einit_array;ctor++)(*ctor)();if(cf_board_init)cf_board_init();main();if(cf_cpp_fini)cf_cpp_fini();for(;;){} }`;
return line.replace('us*72','us*'+mhz).replaceAll('72000',String(b.hz/1000));}).join('\n');}
export async function compileSTM(module,source,board,extras=[],language='c'){const b=STM32_BOARDS[board];if(!b)throw Error('STM32 kartı desteklenmiyor.');if(!['c','cpp'].includes(language))throw Error('STM32 derleyici dili desteklenmiyor.');if(extras.some(f=>['cf_runtime.c','cf_heap.c','cf_cpp_runtime.cpp','stm32f1.h'].includes(f.name)))throw Error('STM32 çalışma kaynağı ayrılmıştır.');const sources=normalizeFiles([{name:language==='cpp'?'main.cpp':'main.c',content:source},...extras],{language}),files=new Map(sources.map(f=>[f.name,file(f.content)]));for(const[n,s]of Object.entries(C_HEADERS))files.set(n,file(n==='cf_hal.h'?stmHeader(board):s));files.set('stm32f1.h',file(stmHeader(board)));files.set('cf_runtime.c',file(b.cpu==='cortex-m4f'?stmF4HAL(board):stmHAL(board)));const ld=`ENTRY(Reset_Handler)
MEMORY { FLASH (rx) : ORIGIN = 0x08000000, LENGTH = ${b.flashSize} RAM (rw) : ORIGIN = 0x20000000, LENGTH = ${b.ram} }
SECTIONS { .vectors : { KEEP(*(.vectors)) } > FLASH .text : { *(.text*) *(.rodata*) } > FLASH .init_array : { _sinit_array = .; KEEP(*(SORT_BY_INIT_PRIORITY(.init_array.*))) KEEP(*(.init_array)) _einit_array = .; } > FLASH .ARM.exidx : { *(.ARM.exidx*) } > FLASH .data : { _sdata = .; *(.data*) _edata = .; } > RAM AT> FLASH _sidata = LOADADDR(.data); .bss (NOLOAD) : { _sbss = .; *(.bss*) *(COMMON) _ebss = .; } > RAM ASSERT(_ebss <= ORIGIN(RAM)+LENGTH(RAM)-1024,"STM32 SRAM: 1 KiB stack rezervi gerekli") /DISCARD/ : { *(.comment*) *(.eh_frame*) } }`;
if(language==='cpp'){files.set('main.cpp',file('extern \"C\" int main(void);\n#line 1 \"main.cpp\"\n'+source));for(const[n,s]of Object.entries(CPP_HEADERS))files.set(n,file(s));files.set('cf_heap.c',file(cppHeap(b)));files.set('cf_cpp_runtime.cpp',file(CPP_RUNTIME));}files.set('link.ld',file(ld));const tree=new Map();for(const[path,content]of files){let map=tree;const parts=path.split('/');for(const part of parts.slice(0,-1)){if(!map.has(part))map.set(part,new Map());if(!(map.get(part) instanceof Map))throw Error('Kaynak dosya/klasör yolu çakışıyor.');map=map.get(part);}if(map.get(parts.at(-1)) instanceof Map)throw Error('Kaynak dosya/klasör yolu çakışıyor.');map.set(parts.at(-1),content);}const dirs=map=>new Map([...map].map(([k,v])=>[k,v instanceof Map?new Directory(dirs(v)):v])),entries=dirs(tree);let log='',objects=[];for(const f of [...sources.filter(f=>/\.(c|cpp)$/.test(f.name)),{name:'cf_runtime.c'},...(language==='cpp'?[{name:'cf_heap.c'},{name:'cf_cpp_runtime.cpp'}]:[])]){const o='cf_unit'+objects.length+'.o';log+=await runESPTool(module,entries,['clang','--target=arm-none-eabi','-mcpu='+(b.cpu==='cortex-m4f'?'cortex-m4':'cortex-m3'),'-mthumb',...(b.cpu==='cortex-m4f'?['-mfpu=fpv4-sp-d16','-mfloat-abi=hard']:[]),...(f.name.endsWith('.cpp')?['-std=c++17','-fno-exceptions','-fno-rtti','-fno-threadsafe-statics']:['-std=gnu17']),'-ffreestanding','-nostdinc','-I.','-Os','-fno-builtin','-ffunction-sections','-fdata-sections','-c',f.name,'-o',o]);objects.push(o);}log+=await runESPTool(module,entries,['ld.lld','--threads=1','--gc-sections','-T','link.ld',...objects,'-o','firmware.elf']);const elf=entries.get('firmware.elf').data,v=new DataView(elf.buffer,elf.byteOffset,elf.byteLength),segments=[];let end=0,staticRamBytes=0;
for(let i=0;i<v.getUint16(44,true);i++){const h=v.getUint32(28,true)+i*v.getUint16(42,true);if(v.getUint32(h,true)!==1)continue;const p=v.getUint32(h+12,true),a=v.getUint32(h+8,true),n=v.getUint32(h+16,true),mem=v.getUint32(h+20,true),o=v.getUint32(h+4,true);if(a>=0x20000000)staticRamBytes=Math.max(staticRamBytes,a+mem-0x20000000);if(n){if(p<0x08000000||p+n>0x08000000+b.flashSize)throw Error('STM32 flash segmenti geçersiz.');end=Math.max(end,p+n-0x08000000);segments.push({p,n,o});}}
const bytes=new Uint8Array(end);for(const s of segments)bytes.set(elf.subarray(s.o,s.o+s.n),s.p-0x08000000);return {image:packSTMImage(bytes,board),elf,flashBytes:bytes.length,staticRamBytes,log};}
