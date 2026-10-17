import {STM_FEATURED_EXAMPLES} from './stm32-labs.js';
import {spaceNativeParts} from './wire-router.js';
import {STM32_BOARDS} from './stm32-boards.js';
import {createSTMProject,STM_EXAMPLES} from './stm32-project.js';
import {examplePin,bindExampleSource,bindExampleWires} from './esp-example-bindings.js';
import {PY_SHT31} from './python-examples.js';
import {C_SENSOR_EXAMPLES,cBusFiles} from './c-sensor-examples.js';
import {placementCandidate,attachPlacement} from './mounting.js';
import {pinPoint,localPoint} from './geometry.js';
import {componentDefinition} from './core.js';
import {BOARDS,boardKey} from './board-hardware.js';
import {mainFile} from './source-files.js';
import {emptyProject,makeProject} from './templates.js';
import {ESP_PARTS} from './esp-circuit.js';
import {ESP_EXAMPLES} from './esp-boards.js';
import {ESP_CIRCUIT_EXAMPLES,espExampleCircuit} from './esp-circuit-examples.js';
export const languageNames={arduino:'Arduino C++',c:'C · main.c',cpp:'C++17 · main.cpp',micropython:'MicroPython · main.py'};
export const isESP=p=>BOARDS[boardKey(p)]?.architecture==='esp32';
export const isSTM=p=>BOARDS[boardKey(p)]?.architecture==='stm32';
export const isNative=p=>isESP(p)||isSTM(p);
export const artifact=p=>p.firmware?.payload??p.firmware?.hex;
export const encodeBytes=bytes=>{let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);};
export const decodeBytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
function mountLEDStarter(p){for(const[id,hole,pin]of [['r1','c5','1'],['led1','j11','A']]){const c=p.components.find(c=>c.id===id),def=componentDefinition(c).pinDefs.find(p=>p.id===pin),target=pinPoint(p,'bb1:'+hole),local=localPoint(c,def.x,def.y);c.x=target.x-local.x;c.y=target.y-local.y;attachPlacement(c,placementCandidate(p,c,{radius:.1}));}}
export const circuitPayload=p=>({components:p.components,wires:p.wires,settings:p.settings});
export function unifiedExamples(p){if(isSTM(p))return p.language==='micropython'?STM_FEATURED_EXAMPLES.filter(e=>e.id==='environment'):STM_FEATURED_EXAMPLES;if(!isESP(p))return[];return p.language==='micropython'?[{id:'blink',name:'GPIO · Breadboard LED',detail:'Pin / await'},{id:'sht31',name:'I²C · SHT31',detail:'SoftI2C / CRC-8'}]:p.language==='c'?[{id:'blink',name:'C17 · Breadboard LED',detail:'main.c / cf_hal.h'},...C_SENSOR_EXAMPLES]:[...ESP_EXAMPLES,...ESP_CIRCUIT_EXAMPLES].filter(e=>e.id!=='sensor-relay'||BOARDS[boardKey(p)].pins.some(p=>p.net==='5V'));}
function unifiedExampleProjectRaw(board,language,id){
 if(STM32_BOARDS[board])return createSTMProject({board,language,starter:id});
 if(language!=='arduino')return createUnifiedProject({board,language,starter:id});
 const e=[...ESP_EXAMPLES,...ESP_CIRCUIT_EXAMPLES].find(e=>e.id===id);if(!e)throw Error('Örnek bulunamadı.');
 const p=migrateESPProject({chip:board,source:bindExampleSource(board,e.code),files:(e.files||[]).map(f=>({...f,content:bindExampleSource(board,f.content)})),circuit:espExampleCircuit(id,board)});p.name=e.name;
 p.components.push({id:'bb1',type:'breadboard',x:900,y:350,rotation:0,params:{}});return p;
}
export function supportedPart(p,type){if(isSTM(p)){if(type==='board')return false;if(type.startsWith('board:'))return BOARDS[type.slice(6)]?.architecture==='stm32';return ESP_PARTS.includes(type);}if(type==='board')return !isESP(p);if(type.startsWith('board:'))return (BOARDS[type.slice(6)]?.architecture||'avr')===(BOARDS[boardKey(p)]?.architecture||'avr');return !isESP(p)||ESP_PARTS.includes(type);}
function createUnifiedProjectRaw({name='Yeni proje',board='uno',language='arduino',starter='blink'}={}){
 if(STM32_BOARDS[board])return createSTMProject({name,board,language,starter});
 if(!Object.hasOwn(BOARDS,board)||!Object.hasOwn(languageNames,language)||language==='cpp'||BOARDS[board].architecture!=='esp32'&&language!=='arduino')throw Error('Kart ve dil seçimi desteklenmiyor.');
 if(BOARDS[board].architecture!=='esp32'){const p=emptyProject();p.name=name;p.components=[{id:'mcu',type:'board',x:35,y:65,rotation:0,params:{model:board}},{id:'bb1',type:'breadboard',x:Math.max(500,BOARDS[board].width*1.35+110),y:150,rotation:0,params:{}}];if(starter!=='empty'){p.code=makeProject().code;p.components.push({id:'r1',type:'resistor',x:570,y:350,rotation:0,params:{ohms:220}},{id:'led1',type:'led',x:760,y:330,rotation:0,params:{color:'red'}});p.wires=[['mcu:D13','r1:1'],['r1:2','led1:A'],['led1:K','mcu:GND']].map(([from,to],i)=>({id:'w'+i,from,to,color:'#14b8a6',points:[]}));mountLEDStarter(p);}return p;}
 const p=emptyProject();p.name=name;p.language=language;p.settings.probe='GPIO'+examplePin(board,2);p.settings.tracePins=[3,4,5].map(n=>'GPIO'+examplePin(board,n));
 p.components=[{id:'mcu',type:'board',x:35,y:65,rotation:0,params:{model:board}},{id:'bb1',type:'breadboard',x:Math.max(400,BOARDS[board].width*1.35+110),y:150,rotation:0,params:{}}];p.wires=[];
 if(language==='c'&&C_SENSOR_EXAMPLES.some(e=>e.id===starter)){const e=C_SENSOR_EXAMPLES.find(e=>e.id===starter),c=espExampleCircuit(e.circuit,board);p.components=[...c.components.map(c=>({...c,rotation:0,params:c.type==='board'?{model:board}:c.params})),{id:'bb1',type:'breadboard',x:Math.max(670,BOARDS[board].width*1.35+110),y:120,rotation:0,params:{}}];p.wires=c.wires;p.code=bindExampleSource(board,e.code);p.files=cBusFiles();return p;}
 if(starter==='sht31'&&language!=='c'){const c=espExampleCircuit('sensor-sht31',board);p.components=[...c.components.map(c=>({...c,rotation:0,params:c.type==='board'?{model:board}:c.params})),{id:'bb1',type:'breadboard',x:670,y:120,rotation:0,params:{}}];p.wires=c.wires;p.code=language==='micropython'?PY_SHT31:ESP_CIRCUIT_EXAMPLES.find(e=>e.id==='sensor-sht31').code;p.code=bindExampleSource(board,p.code);return p;}
 if(starter!=='empty'){p.components.push({id:'r1',type:'resistor',x:470,y:350,rotation:0,params:{ohms:220}},{id:'led1',type:'led',x:660,y:330,rotation:0,params:{color:'red'}});p.wires=[['mcu:GPIO2','r1:1'],['r1:2','led1:A'],['led1:K','mcu:GND']].map(([from,to],i)=>({id:'w'+i,from,to,color:'#14b8a6',points:[]}));}
 if(starter!=='empty'){mountLEDStarter(p);}
 p.code=language==='arduino'?ESP_EXAMPLES[0].code:language==='c'?`#include <cf_hal.h>\n#include <stdio.h>\n\nint main(void) {\n    cf_gpio_mode(2, CF_OUTPUT);\n    cf_uart_begin(115200);\n    puts("CircuitForge C17");\n    while (1) {\n        cf_gpio_write(2, 1); puts("C LED ON"); cf_delay_ms(20);\n        cf_gpio_write(2, 0); puts("C LED OFF"); cf_delay_ms(20);\n    }\n    return 0;\n}\n`:`from machine import Pin\nimport js\n\nled = Pin(2, Pin.OUT)\nprint("CircuitForge MicroPython")\nwhile True:\n    led.value(1)\n    print("Python LED ON")\n    await js.cf.sleep(100)\n    led.value(0)\n    print("Python LED OFF")\n    await js.cf.sleep(100)\n`;
 p.code=bindExampleSource(board,p.code);p.wires=bindExampleWires(board,p.wires);return p;
}
export function migrateESPProject(old){const p=createUnifiedProject({board:old.chip,language:'arduino',starter:'empty'});p.name=old.name||'ESP projesi';p.code=old.source;p.files=old.files||[];p.components=old.circuit.components.map(c=>({...c,params:c.type==='board'?{model:old.chip}:c.params}));p.wires=old.circuit.wires;if(old.image)p.firmware={format:'esp-bin',payload:encodeBytes(old.image),board:old.chip,source:p.code,imported:!!old.firmware?.external,bootFromROM:!!old.firmware?.bootFromROM};return p;}

export function unifiedExampleProject(...args){return spaceNativeParts(unifiedExampleProjectRaw(...args));}
export function createUnifiedProject(options){return spaceNativeParts(createUnifiedProjectRaw(options));}

// Workspace-to-worker boundary: send circuit inputs, never editor/layout state.
export function workspaceCircuitPayload(p){const s=p.settings;return {components:p.components,wires:p.wires,settings:{moisture:s.moisture,threshold:s.threshold,pot:s.pot,pressed:s.pressed,probe:'D13',...(isSTM(p)&&s.stm32Pins?{stm32Pins:s.stm32Pins}:{})}};}
