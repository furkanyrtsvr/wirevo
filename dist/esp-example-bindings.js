import {ESP_BOARDS} from './esp-boards.js';
export const examplePin=(board,pin)=>ESP_BOARDS[board].examplePins?.[pin]??pin;
// Transform only application-owned example templates, never user programs or execution.
export function bindExampleSource(board,source){
 if(!ESP_BOARDS[board].examplePins)return source;
 return source.replace(/\b(pinMode|digitalWrite|digitalRead|cf_gpio_mode|cf_gpio_write|cf_gpio_read|Pin|led)\(\s*(\d+)/g,(_,fn,p)=>fn+'('+examplePin(board,+p))
 .replace(/\b(Wire|SPI)\.begin\(([\d, ]+)\)/g,(_,bus,pins)=>bus+'.begin('+pins.split(',').map(p=>examplePin(board,+p)).join(',')+')')
 .replace(/\b(LED|PIN|ONEWIRE|DQ|CS|SDA|SCL|SCK|MISO|MOSI)\s*=\s*(\d+)/g,(_,name,p)=>name+' = '+examplePin(board,+p));
}
export function bindExampleWires(board,wires){const endpoint=e=>{const mapped=e.replace(/^mcu:GPIO(\d+)$/,(_,p)=>'mcu:GPIO'+examplePin(board,+p));if(!mapped.startsWith('mcu:'))return mapped;const pin=mapped.slice(4),b=ESP_BOARDS[board];if(b.pins&&!b.pins.some(p=>p.id===pin)){const alias=b.pins.find(p=>p.net===pin&&p.connectable!==false);if(alias)return 'mcu:'+alias.id;}return mapped;};return wires.map(w=>({...w,from:endpoint(w.from),to:endpoint(w.to)}));}
