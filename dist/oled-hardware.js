// Original CC0 module artwork. Published 27.7 x 22.6 mm board dimensions and
// terminal/display coordinates: wokwi-boards SSD1306 definition, commit below.
const px=96/25.4;
export const OLED={name:'OLED SSD1306',width:27.7*px,height:22.6*px,asset:'ssd1306-128x64.svg',
  pins:[['GND',10.1],['VCC',12.6],['SCL',15.1],['SDA',17.7]].map(([id,x])=>({id,x:x*px,y:1.71*px,side:'top'})),
  display:{x:1.46*px,y:5.27*px,width:24.8*px,height:12.4*px},
  source:'https://github.com/wokwi/wokwi-boards/blob/4294fca6dce4c5e3d7393ceda312225ed861c997/boards/ssd1306/board.json',
  docs:'https://docs.wokwi.com/parts/board-ssd1306',license:'CC0-1.0 (original CircuitForge illustration)'};
