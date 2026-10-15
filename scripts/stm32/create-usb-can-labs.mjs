import {readFile,writeFile} from 'node:fs/promises';import {gunzipSync} from 'node:zlib';
import {compileSTM} from '../../src/stm32-compiler.js';import {createSTMProject} from '../../dist/stm32-project.js';import {sourceKey} from '../../dist/source-files.js';import {encodeBytes} from '../../dist/unified-project.js';import {validateProject} from '../../dist/core.js';
const clang=await WebAssembly.compile(gunzipSync(await readFile('dist/esp32/compiler/clang.wasm.gz')));
for(const [starter,title,file]of [['usb-device','STM32 F103 · USB device / sanal host','USB'],['can-loopback','STM32 F103 · CAN loopback / IRQ','CAN']]){
 const p=createSTMProject({name:title,board:'stm32f103c6',starter}),c=await compileSTM(clang,p.code,'stm32f103c6');p.firmware={format:'stm32-bin',payload:encodeBytes(c.image),board:'stm32f103c6',source:p.code,sourceKey:sourceKey(p),imported:false,staticRamBytes:c.staticRamBytes};
 const text=JSON.stringify(validateProject(p),null,2);await writeFile('docs/examples/stm32-'+file.toLowerCase()+'-058.json',text);await writeFile('../CircuitForge-0.58-'+file+'-Lab.json',text);console.log(file,':',c.flashBytes,'Flash /',c.staticRamBytes,'static SRAM');
}
