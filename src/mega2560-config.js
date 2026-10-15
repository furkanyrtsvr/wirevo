import {CPU,avrInstruction,AVRIOPort,AVRTimer,AVRUSART,AVRADC,AVRTWI,AVRSPI,portAConfig,portBConfig,portCConfig,portDConfig,portEConfig,portFConfig,portGConfig,portHConfig,portJConfig,portKConfig,portLConfig,timer0Config,timer1Config,timer2Config,usart0Config,adcConfig,twiConfig,spiConfig} from 'avr8js';
const timer16=(n,base,first,port,a,b,c,clockPort,clockPin)=>({...timer1Config,TCCRA:base,TCCRB:base+1,TCCRC:base+2,TCNT:base+4,ICR:base+6,OCRA:base+8,OCRB:base+10,OCRC:base+12,TIFR:0x35+n,TIMSK:0x6e+n,captureInterrupt:first*2,compAInterrupt:(first+1)*2,compBInterrupt:(first+2)*2,compCInterrupt:(first+3)*2,ovfInterrupt:(first+4)*2,OCFC:8,OCIEC:8,compPortA:port,compPinA:a,compPortB:port,compPinB:b,compPortC:port,compPinC:c,externalClockPort:clockPort,externalClockPin:clockPin});
export const MEGA_TIMERS=[
 {...timer0Config,compAInterrupt:42,compBInterrupt:44,ovfInterrupt:46,compPortA:0x25,compPinA:7,compPortB:0x34,compPinB:5,externalClockPort:0x2b,externalClockPin:7},
 timer16(1,0x80,16,0x25,5,6,7,0x2b,6),
 {...timer2Config,compAInterrupt:26,compBInterrupt:28,ovfInterrupt:30,compPortA:0x25,compPinA:4,compPortB:0x102,compPinB:6},
 timer16(3,0x90,31,0x2e,3,4,5,0x2e,6),
 timer16(4,0xa0,41,0x102,3,4,5,0x102,7),
 timer16(5,0x120,46,0x10b,3,4,5,0x10b,2),
];
const uart=(base,first)=>({...usart0Config,UCSRA:base,UCSRB:base+1,UCSRC:base+2,UBRRL:base+4,UBRRH:base+5,UDR:base+6,rxCompleteInterrupt:first*2,dataRegisterEmptyInterrupt:(first+1)*2,txCompleteInterrupt:(first+2)*2});
export const MEGA_UARTS=[uart(0xc0,25),uart(0xc8,36),uart(0xd0,51),uart(0x130,54)];
export const muxChannels=Object.fromEntries(Array.from({length:16},(_,channel)=>[channel<8?channel:channel+24,{type:0,channel}]));

const interrupt=index=>({EICR:index<4?0x69:0x6a,EIMSK:0x3d,EIFR:0x3c,index,iscOffset:(index%4)*2,interrupt:(index+1)*2});
const pc=(group,mask=255,offset=0)=>({PCIE:group,PCICR:0x68,PCIFR:0x3b,PCMSK:0x6b+group,pinChangeInterrupt:(9+group)*2,mask,offset});
export const MEGA_PORTS=Object.fromEntries(Object.entries({A:portAConfig,B:portBConfig,C:portCConfig,D:portDConfig,E:portEConfig,F:portFConfig,G:portGConfig,H:portHConfig,J:portJConfig,K:portKConfig,L:portLConfig}).map(([key,c])=>[key,{...c,pinChange:key==='B'?pc(0):key==='E'?pc(1,1):key==='J'?pc(1,127,1):key==='K'?pc(2):undefined,externalInterrupts:key==='D'?[0,1,2,3].map(interrupt):key==='E'?[null,null,null,null,...[4,5,6,7].map(interrupt)]:[]} ]));
export const MEGA_ADC={...adcConfig,adcInterrupt:58,numChannels:16,muxInputMask:63,muxChannels};
const digital=[['E',0],['E',1],['E',4],['E',5],['G',5],['E',3],['H',3],['H',4],['H',5],['H',6],['B',4],['B',5],['B',6],['B',7],['J',1],['J',0],['H',1],['H',0],['D',3],['D',2],['D',1],['D',0],...Array.from({length:8},(_,i)=>['A',i]),...Array.from({length:8},(_,i)=>['C',7-i]),['D',7],['G',2],['G',1],['G',0],...Array.from({length:8},(_,i)=>['L',7-i]),['B',3],['B',2],['B',1],['B',0]];
export const MEGA_PINS=Object.fromEntries([...digital.map(([port,index],i)=>['D'+i,{port,index}]),...Array.from({length:16},(_,analog)=>['A'+analog,{port:analog<8?'F':'K',index:analog%8,analog}])]);
