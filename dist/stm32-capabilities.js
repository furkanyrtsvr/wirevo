import {STM32_BOARDS} from './stm32-boards.js';
// Device presence is distinct from the implemented simulator model.
export function stm32Capabilities(board){const b=STM32_BOARDS[board];if(!b)throw Error('STM32 kartı geçersiz.');const f4=b.cpu==='cortex-m4f',sdio=f4&&['PC8','PC9','PC10','PC11','PC12','PD2'].every(p=>b.gpio.includes(p));return [
 ['USART',true,'USART1/2 ve mevcut USART3/6; 7/8/9 bit, parity, CTS/RTS, LIN break'],
 ['SPI / I²S',true,'Bağımsız SPI birimleri, master/slave, NSS/MODF/CRC, DMA; F4 I²S CK/WS/SD'],
 ['I²C',true,'Çipte bulunan I²C1/2/3; 7/10-bit master/slave, SMBus/PEC/ALERT, ACK/STOP, arbitration, DMA'],
 ['ADC1',true,'Regular/injected/DMA ve dahili kaynaklar'],
 ['ADC2',!f4,f4?'Bu çipte yok':'Regular/injected, kesikli, watchdog, tetik ve ortak IRQ'],
 ['Timer / RTC',true,'Mevcut TIM1–11 bağımsız sayaç/IRQ; RTC alarm/tamper/calibration'],
 ['USB FS',true,f4?'OTG device/MCU-host, işlevsel boot DFU':'Device PMA double-buffer/ISO; fabrika DFU yok'],
 ['CAN',!f4,f4?'Bu çipte yok':'bxCAN loopback / sanal CANBus peer ağı'],
 ['SDIO',sdio,sdio?'SDHC/SDSC/MMC, tek/çok blok/stream FIFO/DMA':f4?'Bu kart paketinde tam SDIO pin grubu yok':'Bu çipte yok'],
 ...['DAC','RNG / crypto','Ethernet','FMC / QSPI / DCMI','LTDC / SAI / HRTIM','Dahili opamp / comparator'].map(name=>[name,false,'Bu çipte yok'])
 ];}
