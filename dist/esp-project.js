import {ESP_BOARDS,ESP_EXAMPLES,validateESPImage} from './esp-boards.js';
import {normalizeESPFiles,espSourceKey} from './esp-source.js';
import {validateESPCircuit,createESPBench} from './esp-circuit.js';
import {ESP_CIRCUIT_EXAMPLES} from './esp-circuit-examples.js';
export const ESP_PROJECT_LIMIT=12*1024*1024;
export function encodeESPBinary(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);}
export function parseESPProject(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>ESP_PROJECT_LIMIT)throw Error('Proje 12 MB sınırını aşıyor.');
 let state;try{state=JSON.parse(text);}catch{throw Error('Proje JSON dosyası okunamadı.');}
 if(!state||state.format!=='circuitforge-esp'||![1,2,3].includes(state.version)||!Object.hasOwn(ESP_BOARDS,state.chip)||typeof state.source!=='string')throw Error('Geçersiz ESP projesi.');
 if(state.version===1&&state.files?.length)throw Error('Eski proje biçimi ek kaynak dosyası içeremez.');
 const files=normalizeESPFiles(state.source,state.files||[]).slice(1),sourceKey=espSourceKey(state.chip,state.source,files);
 let image=null,firmware=null;
 if(state.firmware!=null){const f=state.firmware;
  if(typeof f.bin!=='string'||!f.bin.length||f.bin.length%4||f.bin.length>Math.ceil(ESP_BOARDS[state.chip].flash/3)*4||!/^[A-Za-z0-9+/]*={0,2}$/.test(f.bin)||typeof f.bootFromROM!=='boolean'||typeof f.external!=='boolean'||typeof f.source!=='string'||f.source.length>100000)throw Error('Firmware alanı geçersiz.');
  image=Uint8Array.from(atob(f.bin),c=>c.charCodeAt(0));if(encodeESPBinary(image)!==f.bin)throw Error('Firmware base64 kodlaması geçersiz.');
  validateESPImage(image,state.chip,{bootFromROM:f.bootFromROM});
  if(!f.external&&(f.source!==state.source||f.bootFromROM||(state.version>=2&&f.sourceKey!==sourceKey)))throw Error('Firmware kaynak kodla veya çalışma kipine eşleşmiyor.');
  firmware={source:f.source,sourceKey:f.external?'':sourceKey,external:f.external,bootFromROM:f.bootFromROM};
 }
 const circuit=state.version===3?validateESPCircuit(state.circuit,state.chip):createESPBench(state.chip);
 return {chip:state.chip,source:state.source,files,circuit,example:[...ESP_EXAMPLES,...ESP_CIRCUIT_EXAMPLES].some(e=>e.id===state.example)?state.example:'custom',image,firmware};
}
export function stringifyESPProject({chip,source,files=[],circuit,example,image,firmwareSource='',firmwareSourceKey=espSourceKey(chip,source,files),external=false,bootFromROM=false,dirty=false}){
 const current=image&&(!dirty||external);
 const text=JSON.stringify({format:'circuitforge-esp',version:circuit?3:2,chip,source,files:normalizeESPFiles(source,files).slice(1),...(circuit?{circuit:validateESPCircuit(circuit,chip)}:{}),example,firmware:current?{bin:encodeESPBinary(image),source:firmwareSource,sourceKey:firmwareSourceKey,external,bootFromROM}:null},null,2);
 parseESPProject(text);return text;
}
