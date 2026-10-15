import {readFile,writeFile} from 'node:fs/promises';
import {ESPRuntime} from '../../dist/esp-runtime.js';
const profile=process.argv[2]||'full-clang';
if(!['sketch','mixed','full-clang','lld'].includes(profile))throw Error('Unknown research profile');
const root=new URL('../../research/esp32/native-c3/',import.meta.url);
await ESPRuntime.initialize(await readFile(new URL('../../dist/esp32/pkg/esp_emu_bg.wasm',import.meta.url)));
const runtime=new ESPRuntime(await readFile(new URL(profile+'-merged.bin',root)),{chip:'esp32c3',bootFromROM:true});
let output='';
try{for(let i=0;i<400;i++){output+=runtime.step(100000);if(output.includes('GPIO HIGH')&&output.includes('GPIO LOW'))break;}
 if(!output.includes('ESP-ROM:')||!output.includes('GPIO HIGH')||!output.includes('GPIO LOW'))throw Error('ROM boot acceptance failed: '+output.slice(-1000));
 await writeFile(new URL(profile+'-boot.log',root),output);console.log(output.slice(-1500));
}finally{runtime.dispose();}
