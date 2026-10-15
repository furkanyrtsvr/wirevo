// Independently drawn CC0 hardware. DIP-8 pinout per Microchip DS20001203.
// DIP lead pitch 2.54 mm; row separation 7.62 mm, mapped to breadboard pitch.
export const I2C_MODULES={
  eeprom:{name:'24LC256 EEPROM',width:44.8,height:51,asset:'24lc256.svg',pins:[['A0',1,8,10],['A1',2,8,19.6],['A2',3,8,29.2],['GND',4,8,38.8],['SDA',5,36.8,38.8],['SCL',6,36.8,29.2],['WP',7,36.8,19.6],['VCC',8,36.8,10]].map(([id,number,x,y])=>({id,number,x,y})),source:'https://ww1.microchip.com/downloads/en/devicedoc/21203r.pdf'},
  rtc:{name:'DS1307 RTC',width:98,height:84,asset:'ds1307.svg',pins:[['GND',28.8],['VCC',38.4],['SDA',48],['SCL',57.6],['SQW',67.2]].map(([id,x])=>({id,x,y:76.8})),source:'https://www.analog.com/media/en/technical-documentation/data-sheets/DS1307.pdf'}
};
