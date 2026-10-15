import {readFile,writeFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {compileSTM} from '../../src/stm32-compiler.js';import {createSTMProject} from '../../dist/stm32-project.js';import {sourceKey} from '../../dist/source-files.js';import {encodeBytes} from '../../dist/unified-project.js';import {validateProject} from '../../dist/core.js';
const clang=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const [board,language,file]of [['nucleo-f401re','c','F401'],['weact-f411ce','cpp','F411']]){
 const p=createSTMProject({name:'STM32 '+file+' · USB OTG FS / sanal host',board,language,starter:'usb-device'}),c=await compileSTM(clang,p.code,board,[],language);p.firmware={format:'stm32-bin',payload:encodeBytes(c.image),board,source:p.code,sourceKey:sourceKey(p),imported:false,staticRamBytes:c.staticRamBytes};
 const text=JSON.stringify(validateProject(p),null,2);await writeFile('docs/examples/stm32-otg-'+file.toLowerCase()+'-059.json',text);await writeFile('../CircuitForge-0.59-'+file+'-USB-Lab.json',text);console.log(file,c.flashBytes,'Flash /',c.staticRamBytes,'static SRAM');
}
