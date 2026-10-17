import {STM32_BOARDS} from './stm32-boards.js';
// Device presence is distinct from the implemented simulator model.
export function stm32Capabilities(board){const b=STM32_BOARDS[board];if(!b)throw Error('STM32 kartı geçersiz.');const f4=b.cpu==='cortex-m4f';return [
 ['USART1 / USART2',true,'7/8/9 bit, parity, 0.5/1/1.5/2 stop; F4 OVER8/16'],
 ['SPI1',true,'Master, mode 0–3, 8/16 bit, DMA; F4 alternatif pinler'],
 ['I²C1',true,'7-bit master, 100/400 kHz, ACK/POS, DMA TX/RX'],
 ['ADC1',true,'Regular/injected/DMA ve dahili kaynaklar'],
 ['ADC2',!f4,f4?'Bu çipte yok':'Modellenmedi'],
 ['TIM2 / RTC',true,'PWM/capture/encoder; RTC alarm ve F4 alt-saniye'],
 ['USB FS',true,f4?'OTG device / sanal host':'Device PMA / sanal host'],
 ['CAN',!f4,f4?'Bu çipte yok':'bxCAN dahili loopback'],
 ['SDIO',f4,f4?'Modellenmedi':'Bu çipte yok'],
 ...['DAC','RNG / crypto','Ethernet','FMC / QSPI / DCMI','LTDC / SAI / HRTIM','Dahili opamp / comparator'].map(name=>[name,false,'Bu çipte yok'])
 ];}
